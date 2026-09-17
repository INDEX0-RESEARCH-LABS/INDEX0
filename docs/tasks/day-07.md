# DAY 7 TASK: Telemetry Pipeline (ClickHouse + OpenMeter)

## 1. Role-Wise Responsibilities

### Stream 1: Senior Tech Lead & System Architect
- **Responsibilities**:
  - Authorize and review `@index0/contracts/v1/telemetry` (`ITelemetryEvent`, `IClickHouseAuditRecord`, `IOpenMeterEvent`).
  - Establish stable event identifier requirements (`event_id` UUIDv4) for strict deduplication.
  - Review ClickHouse partition strategy and OpenMeter dimension definitions.
  - Supervise Day 7 End-of-Day (EOD) Integration Ceremony.

### Stream 2: Platform & Backend Systems Engineer (AI Coding Agent: Antigravity Backend Agent)
- **Responsibilities**:
  - Implement `services/telemetry/` using TypeScript, Express, and ClickHouse client.
  - Implement Dual-Pipeline architecture:
    - **ClickHouse Pipeline**: Batched ingestion for audit logs, agent execution metrics, and API requests.
    - **OpenMeter Pipeline**: Real-time emission of metered usage (token counts, sandbox duration in milliseconds, API requests).
  - Enforce idempotency: Duplicate `event_id` payloads must be ignored without double-metering.
  - Expose `GET /health` endpoint.
- **Target Files**: `services/telemetry/**`.

### Stream 3: Developer Experience & Client Systems Engineer (AI Coding Agent: Antigravity Client Agent)
- **Responsibilities**:
  - Connect Gateway and IDE telemetry hooks to emit client performance metrics and user interaction events to the telemetry pipeline.
  - Provide usage visualizer widget in `apps/dashboard/`.
- **Target Files**: `apps/dashboard/src/components/UsageMetrics.tsx`, `services/gateway/telemetry/metrics.go`.

---

## 2. Antigravity Agent Prompt Directives

### Directives for Stream 2 (Platform Agent)
```text
ROLE: Platform & Backend Systems Engineer
AGENT RUNTIME: Google Antigravity Agent
OBJECTIVE: Implement the Telemetry ingestion service with ClickHouse and OpenMeter dispatchers.
CONTRACT: @index0/contracts/v1/telemetry, @index0/contracts/v1/billing
ALLOWED FILES: services/telemetry/**
DEPENDENCIES: express, @clickhouse/client, dotenv, zod, vitest
REQUIREMENTS:
- Implement POST /telemetry/events accepting ITelemetryEvent.
- Implement ClickHouse writer batching events into audit_events and agent_execution_metrics tables.
- Implement OpenMeter adapter formatting billable units (tokens.input, tokens.output, sandbox.duration_ms) into IOpenMeterEvent.
- IDEMPOTENCY: Enforce unique event_id validation. Ingested events must maintain stable IDs across retries.
- Implement GET /health.
FORBIDDEN CHANGES: Never drop events silently; do not mutate event_id keys.
TESTS: Unit tests for OpenMeter payload normalization and ClickHouse batching mock.
```

### Directives for Stream 3 (DevEx Agent)
```text
ROLE: Developer Experience & Client Systems Engineer
AGENT RUNTIME: Google Antigravity Agent
OBJECTIVE: Connect Gateway request metrics and create dashboard usage graphs.
CONTRACT: @index0/contracts/v1/telemetry
ALLOWED FILES: services/gateway/telemetry/**, apps/dashboard/**
REQUIREMENTS:
- In Gateway: Emit API request metrics (latency, status, endpoint, user_id) on request completion.
- In Dashboard: Build UsageMetrics component showing token usage and execution hours.
TESTS: Verify Gateway metric serialization and Dashboard component render.
```

---

## 3. Daily End-of-Day (EOD) Integration Ceremony

### Timeline (Standard Evening Session: 5:30 PM – 12:00 AM Midnight)
- **17:30 (5:30 PM)**: Kickoff, telemetry contracts & prompt dispatch.
- **18:00 (6:00 PM)**: Parallel agentic implementation (ClickHouse telemetry & dashboard metrics).
- **22:30 (10:30 PM)**: Code Freeze on `feature/day-07-telemetry` and `feature/day-07-dashboard-metrics`.
- **23:00 (11:00 PM)**: Rebase & merge onto `integration/day-07`.
- **23:30 (11:30 PM)**: Automated testing and live telemetry integration scenario.
- **00:00 (12:00 AM Midnight)**: Senior Tech Lead sign-off & checkpoint tagging (`checkpoint/day-07`).

### Automated Verification Script
```bash
# 1. Telemetry service tests & typecheck
pnpm --filter @index0/telemetry typecheck
pnpm --filter @index0/telemetry test
pnpm --filter @index0/telemetry build

# 2. Gateway telemetry tests
(cd services/gateway && go test -v ./telemetry/...)

# 3. Monorepo checks
pnpm typecheck
pnpm lint
```

### Day 7 Integration Scenario
1. Start ClickHouse (`docker compose up -d clickhouse`) and Telemetry Service (`pnpm --filter @index0/telemetry dev`).
2. Dispatch synthetic agent execution telemetry event:
   ```bash
   curl -X POST http://localhost:4003/telemetry/events \
     -H "Content-Type: application/json" \
     -d '{"eventId":"550e8400-e29b-41d4-a716-446655440000","type":"agent.execution","subject":"org-01","data":{"tokensTotal":1420,"durationMs":3200}}'
   ```
3. Query ClickHouse to verify row insertion in `agent_execution_metrics`.
4. Re-send identical payload with same `eventId`; verify telemetry service reports duplicate/idempotent success and does not duplicate the record.

### Merge Gate Checklist
- [ ] Telemetry service passes all unit and integration tests.
- [ ] ClickHouse writes succeed with correct table schemas.
- [ ] Idempotency guarantee validated via deduplication test.
- [ ] Tag created: `checkpoint/day-07`.
