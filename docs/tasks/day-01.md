# DAY 1 TASK: Infrastructure & Database Foundation

## 1. Role-Wise Responsibilities

### Stream 1: Senior Tech Lead & System Architect
- **Responsibilities**:
  - Formulate and validate initial contracts in `@index0/contracts/v1` (`project`, `auth`, `billing`).
  - Configure isolated Docker Compose network (`index0-net`) and infrastructure definitions.
  - Review database schema PRs and verify migration stability.
  - Execute the Day 1 End-of-Day (EOD) Integration Ceremony and tag release checkpoint.

### Stream 2: Platform & Backend Systems Engineer (AI Coding Agent: Antigravity Backend Agent)
- **Responsibilities**:
  - Implement PostgreSQL 16 domain models in `packages/db/prisma/schema.prisma`.
  - Create initial migrations and export the Prisma client singleton (`packages/db/src/index.ts`).
  - Author ClickHouse analytics DDL scripts in `infra/clickhouse/init.sql`.
- **Target Files**: `packages/db/**`, `infra/postgres/**`, `infra/clickhouse/**`.

### Stream 3: Developer Experience & Client Systems Engineer (AI Coding Agent: Antigravity Client Agent)
- **Responsibilities**:
  - Initialize the root monorepo developer tooling (`pnpm-workspace.yaml`, `turbo.json`, root `package.json`, `.gitignore`).
  - Establish workspace environment configuration template (`.env.example`).
  - Verify developer setup scripts and seed data harnesses.
- **Target Files**: `package.json`, `pnpm-workspace.yaml`, `turbo.json`, `.env.example`, `.gitignore`.

---

## 2. Antigravity Agent Prompt Directives

### Directives for Stream 2 (Platform Agent)
```text
ROLE: Platform & Backend Systems Engineer
AGENT RUNTIME: Google Antigravity Agent
OBJECTIVE: Implement the Prisma schema and ClickHouse analytics DDL for Day 1.
CONTRACT: @index0/contracts/v1/project, @index0/contracts/v1/auth, @index0/contracts/v1/billing
ALLOWED FILES: packages/db/**, infra/postgres/**, infra/clickhouse/**
REQUIREMENTS:
- Implement models in schema.prisma: User, Organization, Membership, Project, Repository, Workspace, AgentRun, AgentEvent, SandboxExecution, UsageEvent, Customer, Subscription, Invoice.
- Ensure PostgreSQL 16 compatibility, foreign keys, and indexes on tenant and run identifiers.
- Export singleton PrismaClient instance from packages/db/src/index.ts.
- Write ClickHouse DDL for audit_events, agent_execution_metrics, and api_requests.
FORBIDDEN CHANGES: Do not modify contracts; do not bypass strict TypeScript settings.
TESTS: Run `pnpm --filter @index0/db test` and verify Prisma schema validation.
```

### Directives for Stream 3 (DevEx Agent)
```text
ROLE: Developer Experience & Client Systems Engineer
AGENT RUNTIME: Google Antigravity Agent
OBJECTIVE: Initialize monorepo workspace configurations, Turborepo pipeline, and environment template.
CONTRACT: System Blueprint (Section 5, 7, 11)
ALLOWED FILES: package.json, pnpm-workspace.yaml, turbo.json, tsconfig.json, tsconfig.base.json, .env.example, .gitignore
REQUIREMENTS:
- Configure pnpm workspace for apps/*, services/*, packages/*.
- Define turbo.json pipelines: build, test, lint, typecheck, dev.
- Add all blueprint environment variables to .env.example with descriptive placeholders.
FORBIDDEN CHANGES: Do not introduce unauthorized external package managers (use pnpm).
TESTS: Run `pnpm install` and verify turbo graph resolution.
```

---

## 3. Daily End-of-Day (EOD) Integration Ceremony

### Timeline
- **16:30**: Code Freeze on `feature/day-01-platform` and `feature/day-01-devex`.
- **17:00**: Rebase onto `integration/day-01`.
- **17:30**: Execute automated integration verification.
- **18:00**: Senior Tech Lead sign-off & checkpoint tagging.

### Automated Verification Script
```bash
# 1. Monorepo workspace check
pnpm install --frozen-lockfile
pnpm typecheck
pnpm lint

# 2. Prisma validation & compilation
pnpm --filter @index0/db db:generate
pnpm --filter @index0/db build
pnpm --filter @index0/db test

# 3. Docker Compose validation
docker compose -f infra/compose/docker-compose.yml config

# 4. Secret scan
git diff origin/main | grep -iE "(SECRET_KEY|API_KEY|PASSWORD)=(?!YOUR_|placeholder)" && exit 1 || echo "Clean"
```

### Day 1 Integration Scenario
1. Start PostgreSQL & ClickHouse via Docker Compose.
2. Execute Prisma database migration against PostgreSQL 16.
3. Execute ClickHouse DDL table creation script.
4. Verify database health and schema reflection.

### Merge Gate Checklist
- [ ] `docker compose -f infra/compose/docker-compose.yml config` passes validation.
- [ ] `pnpm --filter @index0/db build` succeeds.
- [ ] Prisma schema is valid (`prisma validate`).
- [ ] No secrets committed.
- [ ] Tag created: `checkpoint/day-01`.
