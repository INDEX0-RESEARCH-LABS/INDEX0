"""Row-building checks for the ClickHouse telemetry client.

The client previously interpolated caller values into an INSERT string, so a
crafted action/resource_id could inject SQL and unknown identities were replaced
with random UUIDs. Rows are now serialized as JSON, which these checks pin.
"""
import json
import uuid

from src.telemetry.clickhouse import NIL_UUID, ClickHouseTelemetryClient

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
    # Schema columns are UUID: unknown actors use the nil UUID, not a random one.
    assert row["tenant_id"] == NIL_UUID and row["user_id"] == NIL_UUID


def test_rows_carry_parseable_uuids_for_uuid_columns():
    first = client.build_metrics_row(run_id="cycle-1790285465353", model="azure-gpt-4o", duration_ms=1)
    second = client.build_metrics_row(run_id="cycle-1790285465353", model="azure-gpt-4o", duration_ms=1)
    for column in ("metric_id", "tenant_id", "run_id", "workspace_id"):
        uuid.UUID(first[column])  # must parse, otherwise ClickHouse rejects the row
    # A human-readable cycle id maps to a stable UUID across retries.
    assert first["run_id"] == second["run_id"] != NIL_UUID


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
    assert uuid.UUID(row["tenant_id"]) and uuid.UUID(row["workspace_id"])
