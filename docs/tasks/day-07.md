# DAY 7 TASK: Telemetry Pipeline (ClickHouse + OpenMeter)

> **Option A Architecture**: Deploying and configuring self-hosted ClickHouse and OpenMeter containers with zero scratch-built telemetry microservices.

---

## 1. Role-Wise Responsibilities

### Stream 1: Senior Tech Lead & System Architect
- **Responsibilities**:
  - Govern ClickHouse analytics table schemas in `infra/clickhouse/init.sql` (`audit_events`, `agent_execution_metrics`, `api_requests`).
  - Configure OpenMeter container parameters in Docker Compose for real-time metering.
  - Coordinate Day 7 End-of-Day (EOD) Integration Ceremony.
- **Target Files**: `infra/clickhouse/init.sql`, `infra/compose/docker-compose.yml`, `docs/tasks/day-07.md`.

### Stream 2: Platform & Backend Systems Engineer (AI Coding Agent)
- **Responsibilities**:
  - Verify ClickHouse MergeTree partitions and high-throughput query performance.
  - Connect OpenMeter usage metrics (tokens, execution time) with ClickHouse sink.
  - Expose ClickHouse HTTP interface on Caddy gateway route `/analytics`.
- **Target Files**: `infra/clickhouse/**`, `infra/gateway/Caddyfile`.

### Stream 3: Developer Experience & Client Systems Engineer (AI Coding Agent)
- **Responsibilities**:
  - Verify metrics ingestion and query performance via sample analytics SQL queries.
  - Author ClickHouse query smoke test.
- **Target Files**: `packages/contracts/test/**`.

---

## 2. Antigravity Agent Prompt Directives

```text
ROLE: Platform & Backend Systems Engineer
AGENT RUNTIME: Google Antigravity Agent
OBJECTIVE: Configure ClickHouse and OpenMeter off-the-shelf telemetry pipeline with zero custom Express service boilerplate.
REQUIREMENTS:
- ClickHouse runs via Docker Compose with init.sql schema mounting.
- OpenMeter meters billable units (tokens, runtime ms) idempotently.
- Caddy Gateway routes /analytics to ClickHouse.
TESTS: Run Docker Compose config validation.
```

---

## 3. Daily End-of-Day (EOD) Integration Ceremony

### Automated Verification Script
```bash
# 1. Validate Docker Compose configuration
docker compose -f infra/compose/docker-compose.yml config

# 2. Monorepo TypeScript check
pnpm typecheck
pnpm test
```

### Merge Gate Checklist
- [x] ClickHouse schemas verified in `infra/clickhouse/init.sql`.
- [x] Docker Compose config validation passes cleanly.
- [ ] Tag created: `checkpoint/day-07`.
