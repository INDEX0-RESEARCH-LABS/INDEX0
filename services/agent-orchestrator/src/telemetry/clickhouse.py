"""ClickHouse Telemetry & Audit Streamer for INDEX0 Agent Orchestrator."""
import json
import logging
import uuid
from datetime import datetime, timezone
from typing import Any, Dict, Optional
import httpx

logger = logging.getLogger(__name__)

# Schema columns tenant_id/user_id/workspace_id are UUID and not Nullable, so an
# unknown actor is recorded with the nil UUID rather than an invented identity.
NIL_UUID = "00000000-0000-0000-0000-000000000000"


def _now() -> str:
    return datetime.now(timezone.utc).strftime("%Y-%m-%d %H:%M:%S.%f")[:-3]


def _as_uuid(value: Optional[str]) -> str:
    """Return a valid UUID string, or the nil UUID when unknown/unparseable."""
    if not value:
        return NIL_UUID
    try:
        return str(uuid.UUID(str(value)))
    except (ValueError, AttributeError, TypeError):
        # Deterministic derivation keeps a human-readable id (e.g. "cycle-abc")
        # stable across retries instead of inventing a random tenant.
        return str(uuid.uuid5(uuid.NAMESPACE_URL, str(value)))


class ClickHouseTelemetryClient:
    """Non-blocking telemetry client streaming audit and execution events into ClickHouse.

    Rows are sent as JSONEachRow so no caller-supplied value is ever interpolated
    into SQL. Identity fields are passed through as given: unknown tenants and
    users are recorded as empty strings, never invented.
    """

    def __init__(self, clickhouse_url: Optional[str] = None):
        self.base_url = (clickhouse_url or "http://clickhouse-audit:8123").rstrip("/")
        self.database = "index0_analytics"

    def build_audit_row(
        self,
        action: str,
        resource_id: str,
        metadata: Dict[str, Any],
        resource_type: str = "orchestrator",
        tenant_id: Optional[str] = None,
        user_id: Optional[str] = None,
        ip_address: str = "127.0.0.1",
        user_agent: str = "agent-orchestrator",
    ) -> Dict[str, Any]:
        return {
            "event_id": str(uuid.uuid4()),
            "timestamp": _now(),
            "tenant_id": _as_uuid(tenant_id),
            "user_id": _as_uuid(user_id),
            "action": action,
            "resource_type": resource_type,
            "resource_id": resource_id,
            "ip_address": ip_address,
            "user_agent": user_agent,
            "metadata": json.dumps(metadata),
        }

    def build_metrics_row(
        self,
        run_id: str,
        model: str,
        duration_ms: int,
        prompt_tokens: int = 0,
        completion_tokens: int = 0,
        status: str = "completed",
        step_count: int = 1,
        error_type: str = "none",
        tenant_id: Optional[str] = None,
        workspace_id: Optional[str] = None,
    ) -> Dict[str, Any]:
        return {
            "metric_id": str(uuid.uuid4()),
            "timestamp": _now(),
            "tenant_id": _as_uuid(tenant_id),
            "run_id": _as_uuid(run_id),
            "workspace_id": _as_uuid(workspace_id),
            "model": model,
            "prompt_tokens": prompt_tokens,
            "completion_tokens": completion_tokens,
            "total_tokens": prompt_tokens + completion_tokens,
            "duration_ms": duration_ms,
            "status": status,
            "step_count": step_count,
            "error_type": error_type,
        }

    async def _insert(self, table: str, row: Dict[str, Any]) -> None:
        try:
            async with httpx.AsyncClient(timeout=1.5) as client:
                resp = await client.post(
                    f"{self.base_url}/?database={self.database}",
                    params={"query": f"INSERT INTO {table} FORMAT JSONEachRow"},
                    content=(json.dumps(row) + "\n").encode("utf-8"),
                )
                if resp.status_code != 200:
                    logger.debug(f"ClickHouse {table} insert notice: {resp.text}")
        except Exception as e:
            logger.debug(f"ClickHouse non-blocking {table} logging skipped: {e}")

    async def log_audit_event(
        self,
        action: str,
        resource_id: str,
        metadata: Dict[str, Any],
        resource_type: str = "orchestrator",
        tenant_id: Optional[str] = None,
        user_id: Optional[str] = None,
        ip_address: str = "127.0.0.1",
        user_agent: str = "agent-orchestrator",
    ) -> None:
        """Stream an audit log entry asynchronously into ClickHouse."""
        await self._insert(
            "audit_events",
            self.build_audit_row(
                action=action,
                resource_id=resource_id,
                metadata=metadata,
                resource_type=resource_type,
                tenant_id=tenant_id,
                user_id=user_id,
                ip_address=ip_address,
                user_agent=user_agent,
            ),
        )

    async def log_execution_metrics(
        self,
        run_id: str,
        model: str,
        duration_ms: int,
        prompt_tokens: int = 0,
        completion_tokens: int = 0,
        status: str = "completed",
        step_count: int = 1,
        error_type: str = "none",
        tenant_id: Optional[str] = None,
        workspace_id: Optional[str] = None,
    ) -> None:
        """Stream model execution metrics into ClickHouse."""
        await self._insert(
            "agent_execution_metrics",
            self.build_metrics_row(
                run_id=run_id,
                model=model,
                duration_ms=duration_ms,
                prompt_tokens=prompt_tokens,
                completion_tokens=completion_tokens,
                status=status,
                step_count=step_count,
                error_type=error_type,
                tenant_id=tenant_id,
                workspace_id=workspace_id,
            ),
        )


_clickhouse_instance: Optional[ClickHouseTelemetryClient] = None


def get_clickhouse_client() -> ClickHouseTelemetryClient:
    global _clickhouse_instance
    if _clickhouse_instance is None:
        _clickhouse_instance = ClickHouseTelemetryClient()
    return _clickhouse_instance
