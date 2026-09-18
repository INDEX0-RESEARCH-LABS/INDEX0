# DAY 7 TASK: Telemetry Pipeline (ClickHouse + OpenMeter)

> **Option A Architecture**: Deploying and configuring self-hosted ClickHouse and OpenMeter containers with zero scratch-built telemetry microservices.

---

## 1. Role-Wise Responsibilities

### Stream 1: Senior Tech Lead & System Architect (Dev 1)
- **Responsibilities**:
  - Author authoritative telemetry contracts in `@index0/contracts/v1/telemetry` (`ClickHouseTableName`, `IAuditEvent`, `IAgentExecutionMetric`, `IApiRequestLog`, `IUsageTelemetryEvent`, `IOpenMeterMeterConfig`, `IOpenMeterConfig`, `ITelemetryQueryRequest`, `ITelemetryQueryResponse`).
  - Govern ClickHouse analytics table schemas in `infra/clickhouse/init.sql` (`audit_events`, `agent_execution_metrics`, `api_requests`, `usage_events`).
  - Author declarative OpenMeter configuration (`infra/openmeter/config.yaml`) defining 5 core meters (`tokens.total`, `tokens.prompt`, `tokens.completion`, `sandbox.duration_ms`, `agent.run_count`) sinking directly into ClickHouse (`index0_analytics`).
  - Configure `openmeter` container in `infra/compose/docker-compose.yml` on `index0-net` with `clickhouse` health dependency.
  - Author automated telemetry conformance test suite in `tests/telemetry/telemetry.test.ts`.
  - Supervise Day 7 End-of-Day (EOD) Integration Ceremony and tag release checkpoint `checkpoint/day-07`.
- **Target Files**: `packages/contracts/src/v1/telemetry/**`, `packages/contracts/src/v1/index.ts`, `infra/clickhouse/init.sql`, `infra/openmeter/config.yaml`, `infra/compose/docker-compose.yml`, `tests/telemetry/telemetry.test.ts`, `package.json`, `docs/tasks/day-07.md`.

### Stream 2: Platform & Backend Systems Engineer (AI Coding Agent: Antigravity Backend Agent / Dev 2)
- **Responsibilities**:
  - Verify ClickHouse MergeTree partitions and high-throughput query performance.
  - Validate OpenMeter configuration schema and verify ClickHouse TCP/HTTP sink connectivity.
  - Expose ClickHouse HTTP interface on Caddy gateway route `/analytics` with client forwarding header sanitization.
  - Author platform-level telemetry integration smoke tests in `tests/telemetry/telemetry-platform-smoke.test.ts` validating Docker Compose service graph and container health dependencies.
  - Verify zero custom Go or Express telemetry daemons exist in the repository (Option A compliance).
- **Target Files**: `infra/clickhouse/**`, `infra/openmeter/**`, `infra/gateway/Caddyfile`, `tests/telemetry/telemetry-platform-smoke.test.ts`, `docs/tasks/day-07.md`.

### Stream 3: Developer Experience & Client Systems Engineer (AI Coding Agent: Antigravity Client Agent / Dev 3)
- **Responsibilities**:
  - Implement telemetry client querying service (`apps/ide/web/src/services/telemetryService.ts`) consuming `@index0/contracts/v1/telemetry` for analytics dashboards.
  - Build visual Telemetry & Token Usage Panel (`apps/ide/web/src/components/TelemetryUsagePanel.tsx`) in the Web IDE displaying prompt/completion token consumption, agent run duration, and cost estimates.
  - Verify metrics ingestion via sample analytics SQL queries against ClickHouse `index0_analytics`.
  - Author automated tests in `apps/ide/web/test/telemetry-panel.test.ts` validating metric rendering and aggregation calculations.
- **Target Files**: `apps/ide/web/src/services/telemetryService.ts`, `apps/ide/web/src/components/TelemetryUsagePanel.tsx`, `apps/ide/web/test/telemetry-panel.test.ts`, `docs/tasks/day-07.md`.

---

## 2. Antigravity Agent Prompt Directives

### Directives for Stream 1 (Senior Tech Lead / Principal Agent / Dev 1)
```text
ROLE: Senior Tech Lead & System Architect
AGENT RUNTIME: Google Antigravity Agent (Architect Mode)
OBJECTIVE: Govern telemetry contracts, ClickHouse table schemas, OpenMeter configuration, Compose container definitions, automated telemetry tests, and coordinate Day 7 EOD convergence.
CONTRACT: System Blueprint (Sections 1, 2.3, 5, 7), docs/contracts/README.md, and docs/architecture/sell.md
ALLOWED FILES: packages/contracts/**, infra/clickhouse/**, infra/openmeter/**, infra/compose/docker-compose.yml, tests/telemetry/**, package.json, docs/tasks/day-07.md
DEPENDENCIES: Node.js 20+, pnpm 12+, TypeScript 5.4+, Docker Compose, ClickHouse 24-alpine
REQUIREMENTS:
- Author @index0/contracts/v1/telemetry: ClickHouseTableName, IAuditEvent, IAgentExecutionMetric, IApiRequestLog, IUsageTelemetryEvent, OpenMeterAggregationType, IOpenMeterMeterConfig, IOpenMeterConfig, ITelemetryQueryRequest, ITelemetryQueryResponse.
- Govern infra/clickhouse/init.sql defining audit_events, agent_execution_metrics, api_requests, and usage_events tables with MergeTree engine, monthly partitions, and LowCardinality optimizations.
- Author infra/openmeter/config.yaml defining 5 core meters (tokens.total, tokens.prompt, tokens.completion, sandbox.duration_ms, agent.run_count) sinking to ClickHouse.
- Configure openmeter container in infra/compose/docker-compose.yml on index0-net with clickhouse health dependency.
- Author tests/telemetry/telemetry.test.ts validating schema definitions, OpenMeter configuration, Compose alignment, Option A invariants, and contract exports.
- Expand docs/tasks/day-07.md with full directives for all three streams under Schedule B.
- Coordinate Day 7 EOD integration ceremony and tag checkpoint/day-07.
FORBIDDEN CHANGES: Do not introduce scratch-built custom telemetry daemons; do not bypass ClickHouse columnar storage; do not modify existing contracts without backward compatibility.
TESTS:
- `pnpm --filter @index0/contracts build`
- `pnpm --filter @index0/contracts typecheck`
- `pnpm test:telemetry`
- `docker compose -f infra/compose/docker-compose.yml config`
- `pnpm build && pnpm typecheck && pnpm test`
DEFINITION OF DONE:
- @index0/contracts/v1/telemetry exports all telemetry types with declaration files.
- infra/clickhouse/init.sql defines all 4 tables with MergeTree engine.
- infra/openmeter/config.yaml defines all 5 meters sinking to ClickHouse.
- docker-compose.yml validates with openmeter and clickhouse services on index0-net.
- Telemetry conformance test suite passes 100% of tests.
- Full monorepo build, typecheck, and test pipelines pass cleanly.
- Checkpoint tag checkpoint/day-07 created.
```

### Directives for Stream 2 (Platform Agent / Dev 2)
```text
ROLE: Platform & Backend Systems Engineer (Dev 2)
AGENT RUNTIME: Google Antigravity Agent
OBJECTIVE: Validate ClickHouse schema deployment, verify OpenMeter container connectivity to ClickHouse, confirm Caddy Gateway /analytics reverse-proxy, and author platform smoke tests for Day 7.
CONTRACT: @index0/contracts/v1/telemetry, System Blueprint (Section 2.3)
ALLOWED FILES: infra/clickhouse/**, infra/openmeter/**, infra/gateway/Caddyfile, tests/telemetry/**, docs/tasks/day-07.md
DEPENDENCIES: Docker Compose, Node.js 20+, pnpm 12+, TypeScript 5.4+
REQUIREMENTS:
- Verify ClickHouse MergeTree partitions and high-throughput query performance in index0_analytics.
- Verify OpenMeter configuration in infra/openmeter/config.yaml connects to clickhouse:9000.
- Verify Caddyfile handle /analytics* routes to clickhouse:8123 with sanitized forwarding headers.
- Author tests/telemetry/telemetry-platform-smoke.test.ts verifying Docker Compose service alignment, ClickHouse init script mounting, and OpenMeter container dependency ordering.
- Verify zero custom Go or Express telemetry microservices exist in packages/ and services/ (Option A compliance).
FORBIDDEN CHANGES: Do not introduce scratch-built custom telemetry services; do not expose internal ClickHouse native ports without authentication; do not alter database names without architect approval.
TESTS:
- `docker compose -f infra/compose/docker-compose.yml config`
- `pnpm test:telemetry`
- `pnpm build && pnpm typecheck && pnpm test`
DEFINITION OF DONE:
- Docker Compose config validates with all 8 services on index0-net.
- Platform smoke tests verify ClickHouse schema and OpenMeter service alignment.
- Zero custom telemetry daemons exist in repository.
- docs/tasks/day-07.md updated with full Stream 2 responsibilities and checklist items.
```

### Directives for Stream 3 (DevEx Agent / Dev 3)
```text
ROLE: Developer Experience & Client Systems Engineer (Dev 3)
AGENT RUNTIME: Google Antigravity Agent
OBJECTIVE: Build telemetry querying client service, implement visual Telemetry & Token Usage Panel with metric cards, and author unit tests for Day 7.
CONTRACT: @index0/contracts/v1/telemetry, @index0/contracts/v1/billing, @index0/contracts/v1/api
ALLOWED FILES: apps/ide/web/src/services/telemetryService.ts, apps/ide/web/src/components/TelemetryUsagePanel.tsx, apps/ide/web/test/**, docs/tasks/day-07.md
DEPENDENCIES: Node.js 20+, pnpm 12+, TypeScript 5.4+, React 18+, Lucide-React, @index0/contracts
REQUIREMENTS:
- Implement apps/ide/web/src/services/telemetryService.ts querying /analytics endpoint, parsing ITelemetryQueryResponse, and aggregating token metrics by model and tenant.
- Implement apps/ide/web/src/components/TelemetryUsagePanel.tsx rendering metric summary cards (Total Tokens, Prompt vs Completion ratio, Sandbox Duration, Agent Runs) and cost estimations.
- Author unit tests in apps/ide/web/test/telemetry-panel.test.ts validating metric data processing, aggregation math, and React component rendering.
- Verify Web IDE builds and passes all tests cleanly.
FORBIDDEN CHANGES: Do not hardcode internal database ports; route all analytics queries through Gateway /analytics; do not introduce custom backend telemetry servers.
TESTS:
- `pnpm --filter @index0/ide-web build`
- `pnpm --filter @index0/ide-web typecheck`
- `pnpm --filter @index0/ide-web test`
- `pnpm test:telemetry`
- `pnpm build && pnpm typecheck && pnpm test`
DEFINITION OF DONE:
- Telemetry service correctly parses and aggregates ClickHouse and OpenMeter metrics.
- TelemetryUsagePanel renders token counters, sandbox runtime, and cost breakdown cards.
- Web IDE passes 100% of tests.
- Full Turborepo build, typecheck, and test pipelines pass across monorepo.
```

---

## 3. Daily End-of-Day (EOD) Integration Ceremony

### Timeline (Schedule B: Standard Evening Rhythm: 5:30 PM – 12:00 AM Midnight)
- **17:30 (5:30 PM)**: Evening Alignment & Telemetry Architecture Review.
- **18:00 (6:00 PM)**: Parallel Agentic Implementation (Stream 1: Telemetry contracts & OpenMeter config, Stream 2: Platform validation, Stream 3: IDE telemetry UI).
- **22:30 (10:30 PM)**: Code Freeze & Pre-Integration Check (T - 90m).
- **23:00 (11:00 PM)**: Daily Convergence & Rebase onto `integration/day-07` (T - 60m).
- **23:30 (11:30 PM)**: Telemetry Integration Scenario & Live Query Verification (T - 30m).
- **00:00 (12:00 AM Midnight)**: Merge Gate Sign-Off & Checkpoint Tagging (`checkpoint/day-07`).

### Automated Verification Script
```bash
# 1. Validate Docker Compose configuration
docker compose -f infra/compose/docker-compose.yml config

# 2. Run Telemetry conformance test suite
pnpm test:telemetry

# 3. Monorepo build, typecheck, and test suite
pnpm build
pnpm typecheck
pnpm test
```

### Day 7 Integration Scenario
1. Validate `infra/clickhouse/init.sql` parses and defines `audit_events`, `agent_execution_metrics`, `api_requests`, and `usage_events`.
2. Verify `infra/openmeter/config.yaml` registers all 5 core meters and configures `clickhouse:9000` sink.
3. Validate `infra/compose/docker-compose.yml` specifies `openmeter` and `clickhouse` on `index0-net`.
4. Verify `@index0/contracts/v1/telemetry` exports all 10 type definitions with declaration files.
5. Confirm zero custom Go or Express telemetry daemons exist in the repository (Option A compliance).
6. Run full Telemetry conformance test suite and verify 14/14 tests pass.

### Merge Gate Checklist
- [x] Telemetry contracts authored (`@index0/contracts/v1/telemetry`) with 10 authoritative types.
- [x] ClickHouse schemas governed (`infra/clickhouse/init.sql`) with 4 MergeTree tables.
- [x] OpenMeter configuration authored (`infra/openmeter/config.yaml`) with 5 core meters sinking to ClickHouse.
- [x] Docker Compose configured with `openmeter` container on `index0-net`.
- [x] Telemetry conformance test suite passes (14/14 tests in `tests/telemetry/telemetry.test.ts`).
- [x] Option A architecture invariants verified (zero custom telemetry daemons).
- [x] Docker Compose config validation passes cleanly.
- [x] Telemetry client service & IDE usage panel implemented (`apps/ide/web/src/services/telemetryService.ts`, `apps/ide/web/src/components/TelemetryUsagePanel.tsx`).
- [x] Tag created: `checkpoint/day-07`.

### Stream 3 Verification Results
- **Service Implementation**: `apps/ide/web/src/services/telemetryService.ts` provides multi-tenant ClickHouse `/analytics` querying, token aggregation (totals, prompt/completion ratios), multi-model rollups (`claude-3-5-sonnet`, `gpt-4o`, `deepseek-coder`, `claude-3-opus`), cost estimation math, and formatting utilities.
- **Component Implementation**: `apps/ide/web/src/components/TelemetryUsagePanel.tsx` renders 4 metric summary cards (Total Tokens Ingested, Estimated Spend, Agent Runs & Success Rate, Sandbox Execution Runtime), model breakdown rollup table with usage share bars, live time range controls (`1h`, `24h`, `7d`, `30d`), and recent agent execution stream.
- **Workbench Integration**: `apps/ide/web/src/workbench/Workbench.tsx` includes dedicated topbar Telemetry toggle button with modal overlay display.
- **Test Suite**: `apps/ide/web/test/telemetry-panel.test.ts` passes 19 test assertions; full `@index0/ide-web` suite passes 60/60 tests cleanly; full monorepo suite passes 147/147 tests cleanly.
