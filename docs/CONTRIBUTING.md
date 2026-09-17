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

## Team Roles & Ownership

| Role | Responsibilities | Merge Authority |
| :--- | :--- | :--- |
| **Senior Tech Lead** | Architecture, Contracts, Gateway, Infra, Security, Database Schema, CI/CD | All packages & services |
| **Vibecoder A** | Database Implementation, Sandbox Manager, OpenHands Adapter, Billing Services | `services/sandbox-manager`, `services/agent-host`, `services/billing`, `packages/db` |
| **Vibecoder B** | INDEX0 IDE, MCP Tools, Developer Tooling, Frontend Integration, Semantic Search | `apps/ide`, `packages/mcp-host`, `apps/dashboard` |

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
