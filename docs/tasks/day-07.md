# DAY 7 TASK: Telemetry Pipeline (ClickHouse + OpenMeter)

## ROLE
Senior Tech Lead & Vibecoder A

## OBJECTIVE
Implement the platform telemetry ingestion pipeline, dispatching high-cardinality audit logs to ClickHouse and billable consumption events to OpenMeter.

## CONTRACT
- `@index0/contracts/v1/telemetry`
- `@index0/contracts/v1/billing`

## ALLOWED FILES
- `services/telemetry/**`
- `infra/clickhouse/**`

## DEPENDENCIES
- Node.js / TypeScript
- `@clickhouse/client`
- `@openmeter/sdk` (or OpenMeter HTTP client)
- Express / Fastify

## REQUIREMENTS
1. Build telemetry ingestion service in `services/telemetry/`.
2. Pipeline A (ClickHouse Audit & Analytics):
   - Ingest and batch write audit logs (`audit_events`), agent execution metrics (`agent_execution_metrics`), and API requests (`api_requests`).
3. Pipeline B (OpenMeter Metering):
   - Normalize and forward billable usage events:
     - Agent token consumption (input tokens, output tokens).
     - MicroVM sandbox execution duration (milliseconds).
     - Workflow executions and API call counts.
4. **Idempotency Guarantee**: Every ingested event must carry a stable, immutable `event_id` to prevent duplicate counting in OpenMeter and ClickHouse.
5. Expose `GET /health` endpoint.

## FORBIDDEN CHANGES
- Do not drop events on transient network blips; implement an in-memory retry queue.
- Do not mutate or omit `event_id` keys.

## TESTS
- Unit tests for OpenMeter payload normalization.
- Ingestion batching and deduplication unit tests.

## DEFINITION OF DONE
- [ ] `services/telemetry` compiles and passes `pnpm --filter @index0/telemetry test`.
- [ ] ClickHouse client writes mock batch records successfully.
- [ ] OpenMeter client formats events matching `IOpenMeterEvent` contract.
