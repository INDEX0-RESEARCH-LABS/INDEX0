# DAY 1 TASK: Infrastructure + Database Foundation

## ROLE
Senior Tech Lead & Vibecoder A

## OBJECTIVE
Establish the persistent backing infrastructure and relational database foundation for INDEX0 AI, including PostgreSQL 16, ClickHouse, Docker Compose network, and Prisma schema definitions.

## CONTRACT
- `@index0/contracts/v1/project`
- `@index0/contracts/v1/auth`
- `@index0/contracts/v1/billing`

## ALLOWED FILES
- `infra/compose/docker-compose.yml`
- `infra/postgres/**`
- `infra/clickhouse/**`
- `packages/db/**`
- `.env.example`

## DEPENDENCIES
- PostgreSQL 16
- ClickHouse Server
- Prisma CLI & Client (`@prisma/client`)
- Docker & Docker Compose

## REQUIREMENTS
1. Define isolated Docker network `index0-net`.
2. Configure PostgreSQL 16 container with health checks and persistent volume.
3. Configure ClickHouse container with HTTP (8123) and native (9000) ports and volume.
4. Create `schema.prisma` with domain models:
   - `User`, `Organization`, `Membership`
   - `Project`, `Repository`, `Workspace`
   - `AgentRun`, `AgentEvent`
   - `SandboxExecution`
   - `UsageEvent`
   - `Customer`, `Subscription`, `Invoice`
5. Generate Prisma client and export singleton from `packages/db/src/index.ts`.
6. Write ClickHouse initialization SQL for `audit_events` and `agent_execution_metrics`.

## FORBIDDEN CHANGES
- Do not expose PostgreSQL or ClickHouse ports publicly without password protection.
- Do not modify contracts to bypass relational constraints.
- Do not add ad-hoc database dependencies (e.g. MongoDB, Redis) without architectural approval.

## TESTS
- `pnpm --filter @index0/db test`: Prisma client instantiation test.
- Docker compose validation test (`docker compose -f infra/compose/docker-compose.yml config`).

## DEFINITION OF DONE
- [ ] `docker compose -f infra/compose/docker-compose.yml config` passes validation.
- [ ] `pnpm --filter @index0/db build` compiles without errors.
- [ ] `schema.prisma` validated via `prisma validate`.
- [ ] Both PostgreSQL and ClickHouse initialization scripts present.
