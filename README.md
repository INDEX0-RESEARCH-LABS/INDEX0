# INDEX0 AI

> Sovereign, multi-agent AI Software Engineering Platform.

INDEX0 AI provides an integrated, self-hosted, and production-grade operating system for autonomous AI software engineering. It spans the complete lifecycle: **BUILD**, **SHIP**, **SELL**, and **GROW**.

---

## High-Level Architecture

```text
                         INDEX0 AI
                             |
                             v
                       API GATEWAY
                       Go + OIDC
                             |
          +------------------+------------------+
          |                  |                  |
          v                  v                  v
        BUILD              SHIP               SELL
          |                  |                  |
      OpenHands          Temporal            Lago
      E2B                 Coolify             OpenMeter
      MCP                 ClickHouse          Stripe
      IDE                                      Twenty
          |
          v
      Agent Runtime
          |
          v
       Sandbox
          |
          v
         E2B
```

Surrounding Platform Capabilities:
```text
GROW: PostHog (Analytics) | Postiz (Social Outreach) | Listmonk (Email Campaigns)
```

---

## Core Pillars

### 1. BUILD
- **INDEX0 IDE**: Sovereign web and desktop IDE experience tailored for agentic pair-programming.
- **OpenHands**: Stateful autonomous software development agent runtime.
- **E2B**: MicroVM sandbox environments with guaranteed cleanup and telemetry.
- **MCP (Model Context Protocol)**: Sandboxed host tools (ripgrep, file inspection, AST search).

### 2. SHIP
- **Temporal**: Durable, distributed workflow orchestration for long-running agent tasks.
- **Coolify**: Sovereign container deployment engine.
- **ClickHouse**: High-throughput analytics and execution audit logs.

### 3. SELL
- **OpenMeter**: Real-time agent usage metering (tokens, sandbox runtime, API calls).
- **Lago**: Subscription, tiered billing, and invoice lifecycle management.
- **Stripe**: Global payment rails and checkout infrastructure.
- **Twenty**: Open-source sovereign CRM integration.

### 4. GROW
- **PostHog**: Product telemetry, funnel analytics, and feature flags.
- **Postiz**: Omnichannel agent release announcements and social automation.
- **Listmonk**: High-deliverability developer newsletter and transactional messaging.

---

## Repository Structure

```text
index0-ai/
├── apps/
│   ├── ide/            # INDEX0 IDE (web interface + VS Code extension)
│   ├── dashboard/      # Web console for organizations, keys, and quotas
│   └── marketing/      # Public platform documentation and portal
├── services/
│   ├── gateway/        # High-performance Go API gateway with Zitadel OIDC
│   ├── agent-host/     # NestJS service orchestrating OpenHands runtime
│   ├── sandbox-manager/# Node.js / Express microservice managing E2B sandboxes
│   ├── telemetry/      # Event ingestion pipeline to ClickHouse and OpenMeter
│   ├── billing/        # Lago and Stripe billing integration service
│   ├── deployment/     # Deployment orchestration with Coolify
│   └── workflows/      # Temporal durable workflows
├── packages/
│   ├── contracts/      # Versioned shared contracts (v1)
│   ├── db/             # Prisma schema and PostgreSQL 16 migrations
│   ├── mcp-host/       # Go stdio MCP host (ripgrep and file utilities)
│   ├── shared/         # Common TypeScript utilities
│   └── config/         # Shared configuration definitions
├── infra/
│   ├── compose/        # Docker Compose configuration for local dev
│   ├── postgres/       # PostgreSQL 16 DDL and extensions
│   ├── clickhouse/     # ClickHouse analytics table schemas
│   ├── temporal/       # Temporal server configuration
│   └── zitadel/        # Zitadel identity provider setup
├── docs/               # System architecture, runbooks, and task board
├── tests/              # Cross-service unit, contract, and e2e suites
└── .github/workflows/  # CI/CD and security audit pipelines
```

---

## Quickstart

### Prerequisites
- Node.js 20+
- pnpm 9+
- Go 1.24+
- Docker & Docker Compose

### 1. Initialize Environment
```bash
cp .env.example .env
pnpm install
```

### 2. Start Core Infrastructure
```bash
docker compose -f infra/compose/docker-compose.yml up -d
```

### 3. Run Checks
```bash
pnpm lint
pnpm typecheck
pnpm test
pnpm build
```

---

## Documentation
- [Architecture Overview](docs/architecture/overview.md)
- [BUILD Blueprint](docs/architecture/build.md)
- [SHIP Blueprint](docs/architecture/ship.md)
- [SELL Blueprint](docs/architecture/sell.md)
- [GROW Blueprint](docs/architecture/grow.md)
- [Contracts Guide](docs/contracts/README.md)
- [Security Model](docs/security/security-model.md)
- [Deployment Guides](docs/deployment/local.md)
- [8-Day Task Board](docs/tasks/day-01.md)
- [Development Rules](docs/DEVELOPMENT_RULES.md)
- [Contributing Guidelines](docs/CONTRIBUTING.md)

---

## License
Proprietary & Sovereign — INDEX0 AI Research Labs.
