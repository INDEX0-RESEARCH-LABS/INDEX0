# DAY 8 TASK: Sovereign Billing & Full Platform Lifecycle Integration

> **Option A Architecture**: Deploying self-hosted Lago rating engine and orchestrating full end-to-end verification across the entire open-source stack.

---

## 1. Role-Wise Responsibilities

### Stream 1: Senior Tech Lead & System Architect (Dev 1)
- **Responsibilities**:
  - Author authoritative billing contracts in `@index0/contracts/v1/billing` (`ILagoBillableMetric`, `ILagoPlanCharge`, `ILagoPlan`, `ILagoSubscriptionPayload`, `ILagoWebhookEvent`, `IPlatformPillarsManifest`).
  - Author declarative Lago pricing plans manifest (`infra/lago/plans.json`) defining the 3 subscription tiers (`free`, `pro`, `enterprise`) and billable metric mappings linking OpenMeter dimensions to Lago rating charges.
  - Finalize Docker Compose stack (`infra/compose/docker-compose.yml`) with self-hosted Lago rating engine (`getlago/api:v1.12.0`) on `index0-net` (port `3001:3000`).
  - Author automated billing and 4-pillars lifecycle test suite in `tests/billing/billing.test.ts`.
  - Supervise the final Day 8 Grand Finale End-of-Day (EOD) Integration Ceremony and tag release checkpoint `checkpoint/day-08`.
- **Target Files**: `packages/contracts/src/v1/billing/**`, `infra/lago/**`, `infra/compose/docker-compose.yml`, `tests/billing/**`, `package.json`, `docs/tasks/day-08.md`.

### Stream 2: Platform & Backend Systems Engineer (AI Coding Agent: Antigravity Backend Agent / Dev 2)
- **Responsibilities**:
  - Connect Lago to PostgreSQL (`index0_dev`) and verify plan migration and billable metric synchronization.
  - Verify webhook dispatcher plumbing for customer subscription lifecycle events.
  - Author platform-level smoke tests in `tests/billing/billing-platform-smoke.test.ts` validating container healthchecks across all 9 services.
  - Verify zero custom Go or Express billing microservices exist in the repository (Option A compliance).
- **Target Files**: `infra/compose/docker-compose.yml`, `infra/lago/**`, `tests/billing/billing-platform-smoke.test.ts`, `docs/tasks/day-08.md`.

### Stream 3: Developer Experience & Client Systems Engineer (AI Coding Agent: Antigravity Client Agent / Dev 3)
- **Responsibilities**:
  - Implement sovereign billing and subscription management UI (`apps/ide/web/src/components/SubscriptionPlanModal.tsx`) in the Web IDE.
  - Build plan selector displaying Free ($0), Pro ($29/mo), and Enterprise ($499/mo) with active quota meters and upgrade triggers.
  - Author Web IDE unit tests in `apps/ide/web/test/billing-plans.test.ts` validating plan cards, quota badges, and tier selection state.
  - Validate the end-to-end developer lifecycle scenario across the 4 pillars (BUILD, SHIP, SELL, GROW).
- **Target Files**: `apps/ide/web/src/components/SubscriptionPlanModal.tsx`, `apps/ide/web/test/billing-plans.test.ts`, `docs/tasks/day-08.md`.

---

## 2. Antigravity Agent Prompt Directives

### Directives for Stream 1 (Senior Tech Lead / Principal Agent / Dev 1)
```text
ROLE: Senior Tech Lead & System Architect
AGENT RUNTIME: Google Antigravity Agent (Architect Mode)
OBJECTIVE: Govern sovereign billing contracts (@index0/contracts/v1/billing), author declarative Lago plans manifest (infra/lago/plans.json), finalize 9-service Docker Compose stack, author automated billing test suite, and coordinate the Grand Finale Day 8 EOD convergence.
CONTRACT: System Blueprint (Sections 1, 2, 5, 7), docs/contracts/README.md, and docs/architecture/sell.md
ALLOWED FILES: packages/contracts/**, infra/lago/**, infra/compose/docker-compose.yml, tests/billing/**, package.json, docs/tasks/day-08.md
DEPENDENCIES: Node.js 20+, pnpm 12+, TypeScript 5.4+, Docker Compose, Lago API v1.12.0
REQUIREMENTS:
- Author @index0/contracts/v1/billing additions: ILagoBillableMetric, ILagoPlanCharge, ILagoPlan, ILagoSubscriptionPayload, ILagoWebhookEvent, IPlatformPillarsManifest.
- Author infra/lago/plans.json defining 3 plan tiers (plan_free, plan_pro, plan_enterprise) and 5 core billable metrics matching OpenMeter dimensions.
- Finalize infra/compose/docker-compose.yml adding getlago/api:v1.12.0 on index0-net (port 3001:3000) with healthy postgres dependency.
- Author tests/billing/billing.test.ts validating Lago plans, OpenMeter metric alignment, 4 pillars stack (9 services), Option A invariants, and contract exports.
- Expand docs/tasks/day-08.md with full directives for all three streams under Schedule B.
- Coordinate Day 8 Grand Finale EOD integration ceremony and tag checkpoint/day-08.
FORBIDDEN CHANGES: Do not introduce scratch-built custom billing daemons; do not bypass Lago rating engine; do not collide port 3000 between OpenHands and Lago.
TESTS:
- `pnpm --filter @index0/contracts build`
- `pnpm --filter @index0/contracts typecheck`
- `pnpm test:billing`
- `docker compose -f infra/compose/docker-compose.yml config`
- `pnpm build && pnpm typecheck && pnpm test`
DEFINITION OF DONE:
- @index0/contracts/v1/billing exports all Lago and 4-pillar types with declaration files.
- infra/lago/plans.json defines all 3 tiers with exact pricing and quotas.
- docker-compose.yml declares all 9 services across the 4 pillars on index0-net.
- Billing conformance test suite passes 100% of tests.
- Full monorepo build, typecheck, and test pipelines pass cleanly.
- Checkpoint tag checkpoint/day-08 created.
```

### Directives for Stream 2 (Platform Agent / Dev 2)
```text
ROLE: Platform & Backend Systems Engineer (Dev 2)
AGENT RUNTIME: Google Antigravity Agent
OBJECTIVE: Validate Lago rating engine container configuration, confirm PostgreSQL connectivity, verify plan synchronization, and author platform smoke tests for Day 8.
CONTRACT: @index0/contracts/v1/billing, System Blueprint (Section 2.5)
ALLOWED FILES: infra/compose/docker-compose.yml, infra/lago/**, tests/billing/**, docs/tasks/day-08.md
DEPENDENCIES: Docker Compose, Node.js 20+, pnpm 12+, TypeScript 5.4+
REQUIREMENTS:
- Verify Lago container image getlago/api:v1.12.0 boots on port 3001 with healthy PostgreSQL dependency.
- Verify Lago database connection string matches PostgreSQL credentials on index0-net.
- Author tests/billing/billing-platform-smoke.test.ts verifying service graph alignment, port mappings, and volume mounts.
- Verify zero custom Go or Express billing daemons exist in packages/ and services/ (Option A compliance).
FORBIDDEN CHANGES: Do not introduce scratch-built custom billing services; do not expose internal PostgreSQL credentials in committed code; do not alter port allocations.
TESTS:
- `docker compose -f infra/compose/docker-compose.yml config`
- `pnpm test:billing`
- `pnpm build && pnpm typecheck && pnpm test`
DEFINITION OF DONE:
- Docker Compose config validates with all 9 services on index0-net.
- Platform smoke tests verify Lago configuration and compose alignment.
- Zero custom billing daemons exist in repository.
- docs/tasks/day-08.md updated with full Stream 2 responsibilities and checklist items.
```

### Directives for Stream 3 (DevEx Agent / Dev 3)
```text
ROLE: Developer Experience & Client Systems Engineer (Dev 3)
AGENT RUNTIME: Google Antigravity Agent
OBJECTIVE: Build sovereign subscription plan modal in the Web IDE, implement plan upgrade state handling, and author unit tests for Day 8.
CONTRACT: @index0/contracts/v1/billing, @index0/contracts/v1/api
ALLOWED FILES: apps/ide/web/src/components/SubscriptionPlanModal.tsx, apps/ide/web/test/**, docs/tasks/day-08.md
DEPENDENCIES: Node.js 20+, pnpm 12+, TypeScript 5.4+, React 18+, Lucide-React, @index0/contracts
REQUIREMENTS:
- Implement apps/ide/web/src/components/SubscriptionPlanModal.tsx rendering the 3 subscription tiers (Community, Professional, Sovereign Enterprise) with feature matrices, quota indicators, and pricing badges.
- Connect SubscriptionPlanModal to workbench navigation / topbar for easy plan visibility.
- Author unit tests in apps/ide/web/test/billing-plans.test.ts validating plan rendering, quota calculation, and upgrade triggers.
- Verify Web IDE builds and passes all tests cleanly.
FORBIDDEN CHANGES: Do not hardcode internal container ports; route all API traffic through Gateway (port 8000); do not introduce custom backend billing microservices.
TESTS:
- `pnpm --filter @index0/ide-web build`
- `pnpm --filter @index0/ide-web typecheck`
- `pnpm --filter @index0/ide-web test`
- `pnpm test:billing`
- `pnpm build && pnpm typecheck && pnpm test`
DEFINITION OF DONE:
- SubscriptionPlanModal renders all 3 tiers with features and pricing.
- Web IDE passes 100% of tests.
- Full Turborepo build, typecheck, and test pipelines pass across monorepo.
```

---

## 3. Daily End-of-Day (EOD) Integration Ceremony

### Timeline (Schedule B: Standard Evening Rhythm: 5:30 PM – 12:00 AM Midnight)
- **17:30 (5:30 PM)**: Evening Alignment & Grand Finale Architecture Review.
- **18:00 (6:00 PM)**: Parallel Agentic Implementation (Stream 1: Billing contracts & Lago config, Stream 2: Platform validation, Stream 3: IDE subscription UI).
- **22:30 (10:30 PM)**: Code Freeze & Pre-Integration Check (T - 90m).
- **23:00 (11:00 PM)**: Daily Convergence & Rebase onto `integration/day-08` (T - 60m).
- **23:30 (11:30 PM)**: Grand Finale 4-Pillars Integration Scenario & Live Stack Smoke Testing (T - 30m).
- **00:00 (12:00 AM Midnight)**: Final Merge Gate Sign-Off & Checkpoint Tagging (`checkpoint/day-08`).

### Automated Verification Script
```bash
# 1. Validate complete 9-service Docker Compose stack
docker compose -f infra/compose/docker-compose.yml config

# 2. Run Billing conformance test suite
pnpm test:billing

# 3. Monorepo build, typecheck, and test suite
pnpm build
pnpm typecheck
pnpm test
```

### Day 8 Grand Finale Integration Scenario
1. Validate `infra/lago/plans.json` defines all 3 subscription tiers (`free`, `pro`, `enterprise`) and 5 billable metrics.
2. Verify OpenMeter meters in `infra/openmeter/config.yaml` map 1:1 to Lago billable metrics.
3. Validate `infra/compose/docker-compose.yml` configures all 9 services across the 4 pillars (BUILD, SHIP, SELL, GROW).
4. Verify `@index0/contracts/v1/billing` exports all 20 authoritative billing and pillar types with declaration files.
5. Confirm zero custom Go or Express billing daemons exist in the repository (Option A compliance).
6. Run full monorepo verification suite across all packages and test suites.

### Final Merge Gate Checklist
- [x] Billing & Lago contracts authored (`@index0/contracts/v1/billing`) with 20 authoritative types.
- [x] Lago pricing plans manifest authored (`infra/lago/plans.json`) with 3 tiers and 5 billable metrics.
- [x] Docker Compose finalized with self-hosted Lago rating engine (`getlago/api:v1.12.0`) on `index0-net`.
- [x] Billing conformance test suite passes (10/10 tests in `tests/billing/billing.test.ts`).
- [x] Option A architecture invariants verified (zero custom billing daemons).
- [x] Docker Compose config validation passes cleanly across all 9 services.
- [x] TypeScript contracts and monorepo typecheck pass cleanly.
- [x] Billing platform smoke tests authored and passing (`tests/billing/billing-platform-smoke.test.ts`).
- [x] Subscription plan modal implemented in Web IDE (`apps/ide/web/src/components/SubscriptionPlanModal.tsx`).
- [x] Tag created: `checkpoint/day-08`.

### Stream 3 Verification Results
- **Component Implementation**: `apps/ide/web/src/components/SubscriptionPlanModal.tsx` renders all 3 authoritative Lago subscription tiers (`plan_free`, `plan_pro`, `plan_enterprise`) with feature matrices, quota gauges, trial period indicators, and annual discount pricing toggle (Save 20%).
- **Workbench Integration**: `apps/ide/web/src/workbench/Workbench.tsx` includes dedicated topbar "Plans" button with credit card icon triggering the modal overlay.
- **Package Exports**: `apps/ide/web/src/index.ts` re-exports `SubscriptionPlanModal` and `AUTHORITATIVE_PLANS`.
- **Test Suite**: `apps/ide/web/test/billing-plans.test.ts` passes 13 unit test assertions; full `@index0/ide-web` suite passes 73/73 tests cleanly; full monorepo suite passes 160/160 tests cleanly.
