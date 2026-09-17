# Contributing to INDEX0 AI

Welcome to **INDEX0 AI**, the sovereign, multi-agent AI Software Engineering Platform.

Please read this guide and [DEVELOPMENT_RULES.md](./DEVELOPMENT_RULES.md) before submitting code.

---

## Engineering Philosophy: Contract-First Architecture

INDEX0 AI operates strictly under the contract-first lifecycle:

```text
CONTRACT
   ↓
IMPLEMENTATION
   ↓
VERIFICATION
   ↓
MERGE GATE
```

All data structures, request/response models, and events live in `@index0/contracts` (`packages/contracts/`).

---

## Monorepo Layout

```text
index0-ai/
├── apps/
│   ├── ide/            # INDEX0 IDE (web + extension)
│   ├── dashboard/      # Platform admin console
│   └── marketing/      # Public landing and marketing
├── services/
│   ├── gateway/        # Go API Gateway with Zitadel OIDC
│   ├── agent-host/     # NestJS agent host (OpenHands runtime adapter)
│   ├── sandbox-manager/# Express + E2B microservice
│   ├── telemetry/      # ClickHouse + OpenMeter ingest service
│   ├── billing/        # Lago + Stripe billing integration
│   ├── deployment/     # Coolify / deployment orchestration
│   └── workflows/      # Temporal workflow definitions
├── packages/
│   ├── contracts/      # Authoritative versioned shared contracts (v1)
│   ├── db/             # Prisma schema and PostgreSQL migration
│   ├── mcp-host/       # Go Model Context Protocol server (ripgrep)
│   ├── shared/         # Common TypeScript utilities
│   └── config/         # Shared configuration & Zod schemas
├── infra/
│   ├── compose/        # Docker Compose development stacks
│   ├── postgres/       # PostgreSQL initialization scripts
│   ├── clickhouse/     # ClickHouse analytics DDL
│   ├── temporal/       # Temporal server configuration
│   └── zitadel/        # Zitadel OIDC identity provider configuration
├── tests/              # Unit, contract, integration, and e2e suites
└── docs/               # Architecture, runbooks, and task plans
```

---

## Team Roles & Agentic Ownership

Engineers on INDEX0 AI operate in partnership with autonomous AI coding agents (such as Google Antigravity, Claude Code, and specialized IDE subagents). Agents write implementations strictly against predefined `@index0/contracts` specifications.

| Stream & Role | Primary Focus | AI Agent Tooling | Assigned Packages & Services | Merge Authority |
| :--- | :--- | :--- | :--- | :--- |
| **Stream 1: Senior Tech Lead & System Architect** | Architecture, Contracts, Gateway, Infra, Security, Database Schema, CI/CD, Daily EOD Integration | Antigravity IDE (Architect mode) | All packages, contracts, infrastructure, and gateway | Sovereign merge authority across repository |
| **Stream 2: Platform & Backend Systems Engineer** | Database Implementation, E2B Sandbox Manager, OpenHands Adapter, Billing, Telemetry | Antigravity AI Agent (Backend stream) | `services/sandbox-manager`, `services/agent-host`, `services/billing`, `services/telemetry`, `packages/db` | Submits PRs to daily integration branch |
| **Stream 3: Developer Experience & Client Systems Engineer** | INDEX0 IDE (Web & Extension), Go MCP Host, Developer Tooling, Semantic Search, Dashboard | Antigravity AI Agent (Client stream) | `apps/ide`, `packages/mcp-host`, `apps/dashboard`, `apps/marketing` | Submits PRs to daily integration branch |

---

## Daily Integration Ceremony

To ensure parallel agentic workstreams converge without regressions, the team follows the formal [Daily End-of-Day (EOD) Integration Plan](./tasks/DAILY_INTEGRATION_PLAN.md). Every day concludes with contract verification, cross-service automated testing, and a live smoke test before tagging a daily release checkpoint.

---

## Local Development Workflow

### Prerequisites
- Node.js 20+ (Node 26 supported)
- pnpm 9+
- Go 1.24+
- Docker & Docker Compose
- ripgrep (`rg`)

### Setup
```bash
# 1. Clone repository
git clone <repo-url> index0-ai
cd index0-ai

# 2. Copy environment template
cp .env.example .env

# 3. Install dependencies
pnpm install

# 4. Start local backing infrastructure
docker compose -f infra/compose/docker-compose.yml up -d

# 5. Run database migrations
pnpm --filter @index0/db db:migrate

# 6. Build packages and run tests
pnpm build
pnpm test
```

---

## Pull Request Checklist

Before submitting a PR:
- [ ] Conforms to `@index0/contracts` without ad-hoc modifications.
- [ ] No secrets, keys, or credential tokens are committed.
- [ ] `pnpm lint` passes with 0 errors.
- [ ] `pnpm typecheck` passes cleanly.
- [ ] `pnpm test` passes all unit and contract tests.
- [ ] Any new environment variables are documented in `.env.example`.
- [ ] PR description specifies: Role, Objective, Contract references, and Definition of Done.
