"""Row-building checks for the ClickHouse telemetry client.

The client previously interpolated caller values into an INSERT string, so a
crafted action/resource_id could inject SQL and unknown identities were replaced
with random UUIDs. Rows are now serialized as JSON, which these checks pin.
"""
import json

from src.telemetry.clickhouse import ClickHouseTelemetryClient

client = ClickHouseTelemetryClient(clickhouse_url="http://localhost:8123")


def test_audit_row_keeps_payload_inert_and_identity_honest():
    hostile = "x'), ('victim'"
    row = client.build_audit_row(
        action=hostile,
        resource_id="cycle-1",
        metadata={"nested": "y' OR 1=1 --", "n": 3},
    )
    assert row["action"] == hostile  # stored verbatim, never reassembled into SQL
    assert "INSERT" not in json.dumps(row).upper()
    assert json.loads(row["metadata"])["nested"] == "y' OR 1=1 --"
    assert row["tenant_id"] == "" and row["user_id"] == ""  # no invented identity


def test_metrics_row_totals_and_overrides():
    row = client.build_metrics_row(
        run_id="run-1",
        model="azure-gpt-4o",
        duration_ms=12,
        prompt_tokens=7,
        completion_tokens=5,
        tenant_id="tenant-a",
        workspace_id="ws-a",
    )
    assert row["total_tokens"] == 12
    assert row["tenant_id"] == "tenant-a"
    assert row["workspace_id"] == "ws-a"
