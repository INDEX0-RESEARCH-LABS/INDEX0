# DAY 1 TASK: Infrastructure & Database Foundation

## 1. Role-Wise Responsibilities

### Stream 1: Senior Tech Lead & System Architect (Dev 1)
- **Responsibilities**:
  - Formulate and validate initial authoritative contracts in `@index0/contracts/v1` (`project`, `auth`, `billing`).
  - Configure isolated Docker Compose network (`index0-net`) and root infrastructure definitions (`postgres`, `clickhouse`, `temporal`, `zitadel`).
  - Establish automated CI workflow (`.github/workflows/ci.yml`) enforcing type checking, linting, contract tests, and secret scans.
  - Review database schema PRs from Stream 2 and verify migration stability against PostgreSQL 16.
  - Govern the Day 1 End-of-Day (EOD) Integration Ceremony, merge verification, and release checkpoint tagging.
- **Target Files**: `packages/contracts/**`, `infra/compose/**`, `infra/postgres/**`, `.github/workflows/**`.

### Stream 2: Platform & Backend Systems Engineer (AI Coding Agent: Antigravity Backend Agent / Dev 2)
- **Responsibilities**:
  - Implement PostgreSQL 16 domain models in `packages/db/prisma/schema.prisma` matching `@index0/contracts/v1` (User, Organization, Membership, Project, Repository, Workspace, AgentRun, AgentEvent, SandboxExecution, UsageEvent, Customer, Subscription, Invoice).
  - Scaffold `@index0/db` package, create Prisma client generator scripts, and export cached singleton PrismaClient (`packages/db/src/index.ts`).
  - Author ClickHouse analytics DDL scripts in `infra/clickhouse/init.sql` (`audit_events`, `agent_execution_metrics`, `api_requests`) with `MergeTree` engines and monthly partitions.
  - Wire ClickHouse initialization volume mount in `infra/compose/docker-compose.yml`.
  - Author unit and type verification test in `packages/db/test/db.test.ts`.
- **Target Files**: `packages/db/**`, `infra/clickhouse/**`, `infra/compose/docker-compose.yml`.

### Stream 3: Developer Experience & Client Systems Engineer (AI Coding Agent: Antigravity Client Agent / Dev 3)
- **Responsibilities**:
  - Initialize root monorepo developer tooling (`pnpm-workspace.yaml`, `turbo.json`, root `package.json`, `.gitignore`).
  - Establish authoritative root TypeScript configurations (`tsconfig.base.json`, `tsconfig.json`) extended across all workspace packages.
  - Standardize workspace package dependency linking (`workspace:*`) across packages.
  - Author comprehensive system-wide environment template (`.env.example`) covering all 17 subsystems and engines (Gateway, Build, Ship, Sell, Grow).
  - Configure automated Prisma generation postinstall hooks and Turborepo task caching.
- **Target Files**: `package.json`, `pnpm-workspace.yaml`, `turbo.json`, `tsconfig.base.json`, `tsconfig.json`, `.env.example`, `.gitignore`, `packages/db/package.json`.

---

## 2. Antigravity Agent Prompt Directives

### Directives for Stream 1 (Senior Tech Lead / Principal Agent / Dev 1)
```text
ROLE: Senior Tech Lead & System Architect
AGENT RUNTIME: Google Antigravity Agent (Architect Mode)
OBJECTIVE: Formulate authoritative shared contracts (@index0/contracts/v1), configure root Docker Compose backing infrastructure on index0-net, establish CI verification workflows, and govern Day 1 EOD convergence.
CONTRACT: System Blueprint (Sections 1, 2, 5, 7, 11) & docs/contracts/README.md
ALLOWED FILES: packages/contracts/**, infra/compose/**, infra/postgres/**, .github/workflows/**, docs/tasks/day-01.md
DEPENDENCIES: Node.js 20+, pnpm 9+, Docker Compose, TypeScript 5.4+
REQUIREMENTS:
- Establish @index0/contracts package with strict TypeScript settings.
- Implement v1/auth: IUser, IOrganization, IMembership, UserRole, IJwtClaims, ITenantContext.
- Implement v1/project: IProject, IRepository, IWorkspace, WorkspaceStatus, IAgentRunSummary.
- Implement v1/billing: ICustomer, ISubscription, IInvoice, SubscriptionTier, SubscriptionStatus, IOpenMeterEvent.
- Configure infra/compose/docker-compose.yml on isolated network index0-net with postgres (16), clickhouse, temporal, and zitadel.
- Implement .github/workflows/ci.yml running lint, typecheck, contract tests, docker compose validation, and secret scanning.
- Review Stream 2 Prisma models and execute Day 1 EOD Integration Ceremony.
FORBIDDEN CHANGES: Do not bypass strict typing; do not commit secrets or unparameterized credentials.
TESTS:
- `pnpm --filter @index0/contracts build`
- `pnpm --filter @index0/contracts typecheck`
- `docker compose -f infra/compose/docker-compose.yml config`
DEFINITION OF DONE:
- All contracts build cleanly and export from packages/contracts.
- Docker Compose config validates with zero errors.
- CI workflow passes in GitHub Actions / local validation.
- EOD integration checklist passes and tag checkpoint/day-01 is created.
```

### Directives for Stream 2 (Platform Agent / Dev 2)
```text
ROLE: Platform & Backend Systems Engineer
AGENT RUNTIME: Google Antigravity Agent
OBJECTIVE: Implement the PostgreSQL 16 Prisma schema, database client singleton, and ClickHouse analytics DDL for Day 1.
CONTRACT: @index0/contracts/v1/auth, @index0/contracts/v1/project, @index0/contracts/v1/billing
ALLOWED FILES: packages/db/**, infra/clickhouse/**, infra/compose/docker-compose.yml, docs/tasks/day-01.md
DEPENDENCIES: Node.js 20+, pnpm, prisma, @prisma/client, TypeScript 5.4+
REQUIREMENTS:
- Bootstrap @index0/db package with strict TypeScript settings (build, typecheck, test, db:generate).
- Implement 13 domain models in schema.prisma: User, Organization, Membership, Project, Repository, Workspace, AgentRun, AgentEvent, SandboxExecution, UsageEvent, Customer, Subscription, Invoice.
- Ensure PostgreSQL 16 compatibility, foreign keys, cascade rules, and indexes on tenant, workspace, run, and dimension identifiers.
- Export cached singleton PrismaClient instance and Prisma types from packages/db/src/index.ts.
- Write ClickHouse DDL in infra/clickhouse/init.sql for audit_events, agent_execution_metrics, and api_requests with MergeTree engines and toYYYYMM partitioning.
- Mount ClickHouse init.sql in infra/compose/docker-compose.yml into /docker-entrypoint-initdb.d/init.sql.
- Write automated verification test in packages/db/test/db.test.ts.
FORBIDDEN CHANGES: Do not modify @index0/contracts; do not bypass strict TypeScript settings; do not commit unparameterized database credentials.
TESTS:
- `npx prisma validate --schema=packages/db/prisma/schema.prisma`
- `cd packages/db && pnpm test`
- `docker compose -f infra/compose/docker-compose.yml config`
DEFINITION OF DONE:
- Prisma schema validates with zero errors.
- packages/db builds cleanly, exports singleton PrismaClient, and passes test suite.
- ClickHouse DDL script is authored and mounted in Docker Compose.
- Docker Compose config passes validation.
```

### Directives for Stream 3 (DevEx Agent / Dev 3)
```text
ROLE: Developer Experience & Client Systems Engineer
AGENT RUNTIME: Google Antigravity Agent
OBJECTIVE: Initialize root monorepo developer tooling, Turborepo pipeline, shared TypeScript configuration, and comprehensive environment template for Day 1.
CONTRACT: System Blueprint (Sections 1, 2, 5, 7, 11) & docs/contracts/README.md
ALLOWED FILES: package.json, pnpm-workspace.yaml, turbo.json, tsconfig.json, tsconfig.base.json, .env.example, .gitignore, packages/db/package.json, packages/db/tsconfig.json, packages/contracts/tsconfig.json, docs/tasks/day-01.md
DEPENDENCIES: Node.js 20+, pnpm 12+, turbo 2+, TypeScript 5.4+
REQUIREMENTS:
- Configure root pnpm-workspace.yaml for apps/*, services/*, packages/*.
- Define turbo.json pipelines: build, typecheck, lint, test, dev, db:generate, clean with proper topological caching.
- Establish tsconfig.base.json and update package tsconfigs to extend it cleanly.
- Author exhaustive .env.example covering all 17 service and infrastructure components.
- Standardize packages/db/package.json to use workspace:* for @index0/contracts.
- Verify full monorepo pnpm install, turbo build, and turbo typecheck pass cleanly.
FORBIDDEN CHANGES: Do not introduce unauthorized external package managers; do not bypass strict TypeScript; do not modify contracts in packages/contracts/src.
TESTS:
- `pnpm install`
- `pnpm build`
- `pnpm typecheck`
- `pnpm test`
DEFINITION OF DONE:
- Root monorepo builds and typechecks cleanly using Turborepo.
- All packages extend tsconfig.base.json.
- Authoritative .env.example is authored with complete subsystem coverage.
- turbo pipeline executes with zero circular dependencies and optimal caching.
```

---

## 3. Daily End-of-Day (EOD) Integration Ceremony

### Timeline (Intensive Marathon: 10:00 AM – 12:00 AM Midnight)
- **10:00 AM**: Alignment, contract definition & prompt dispatch.
- **10:30 AM**: Sprint Block 1 — Foundation bootstrap & package scaffolding.
- **14:00 PM**: Midday checkpoint & rebase sync.
- **15:00 PM**: Sprint Block 2 — Core schemas, configs & tooling setup.
- **22:30 (10:30 PM)**: Code Freeze on `feature/day-01-platform` and `feature/day-01-devex`.
- **23:00 (11:00 PM)**: Rebase & merge onto `integration/day-01`.
- **23:30 (11:30 PM)**: Execute automated integration verification & stack smoke test.
- **00:00 (12:00 AM Midnight)**: Senior Tech Lead sign-off & checkpoint tagging (`checkpoint/day-01`).

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
- [x] `docker compose -f infra/compose/docker-compose.yml config` passes validation.
- [x] `pnpm --filter @index0/db build` succeeds.
- [x] Prisma schema is valid (`prisma validate`).
- [x] No secrets committed.
- [x] Tag created: `checkpoint/day-01`.

