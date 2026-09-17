# DAY 8 TASK: Sovereign Billing & Full Platform Lifecycle Integration

> **Option A Architecture**: Deploying self-hosted Lago rating engine and orchestrating full end-to-end verification across the entire open-source stack.

---

## 1. Role-Wise Responsibilities

### Stream 1: Senior Tech Lead & System Architect
- **Responsibilities**:
  - Govern self-hosted Lago configuration in Docker Compose.
  - Oversee the final platform integration scenario across all 4 pillars: BUILD (OpenHands), SHIP (Temporal), SELL (Lago/OpenMeter), GROW (PostHog/Twenty).
  - Execute the final Day 8 End-of-Day (EOD) Integration Ceremony and tag release checkpoint `checkpoint/day-08`.
- **Target Files**: `infra/compose/docker-compose.yml`, `docs/tasks/day-08.md`.

### Stream 2: Platform & Backend Systems Engineer (AI Coding Agent)
- **Responsibilities**:
  - Connect Lago to PostgreSQL and configure pricing plan tiers and quotas.
  - Wire Lago's native webhook dispatcher to update organization subscription states.
  - Verify all container healthchecks across the stack pass within 30 seconds of launch.
- **Target Files**: `infra/compose/docker-compose.yml`.

### Stream 3: Developer Experience & Client Systems Engineer (AI Coding Agent)
- **Responsibilities**:
  - Execute end-to-end user workflow:
    1. Access Gateway on `http://localhost:8000`.
    2. Authenticate through Zitadel.
    3. Launch autonomous agent prompt in OpenHands workbench.
    4. Verify code edits in `./workspace`.
    5. Verify execution logs captured in ClickHouse.
  - Author complete smoke test runbook.
- **Target Files**: `tests/**`, `README.md`.

---

## 2. Antigravity Agent Prompt Directives

```text
ROLE: Senior Tech Lead & Platform Architect
AGENT RUNTIME: Google Antigravity Agent
OBJECTIVE: Conduct end-to-end validation across the complete off-the-shelf open-source stack.
REQUIREMENTS:
- All services pass Docker Compose validation with zero warnings.
- Zero custom scratch-built microservice boilerplate.
- OpenHands workbench fully functional on port 8000.
TESTS:
- `docker compose -f infra/compose/docker-compose.yml config`
- `pnpm typecheck`
- `pnpm test`
```

---

## 3. Daily End-of-Day (EOD) Integration Ceremony

### Automated Verification Script
```bash
# 1. Validate complete Docker Compose stack
docker compose -f infra/compose/docker-compose.yml config

# 2. Monorepo lint & typecheck
pnpm typecheck
pnpm lint
pnpm test
```

### Final Merge Gate Checklist
- [x] Docker Compose stack validated for all subsystems.
- [x] OpenHands workbench operational with local Docker sandbox.
- [x] Caddy Gateway routing correctly configured.
- [x] Shared TypeScript contracts pass typecheck.
- [ ] Tag created: `checkpoint/day-08`.
