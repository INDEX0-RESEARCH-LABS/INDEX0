# Local Development Deployment — INDEX0 AI

This guide details running the complete INDEX0 AI stack locally on a development machine.

---

## 1. Prerequisites

Verify installed tools:
```bash
node -v          # >= 20.0.0
pnpm -v          # >= 9.0.0
go version       # >= 1.24.0
docker -v        # >= 24.0.0
docker compose version # >= 2.20.0
rg --version     # ripgrep installed
```

---

## 2. Environment Setup

Copy `.env.example` to `.env`:
```bash
cp .env.example .env
```

Ensure standard local ports do not conflict:
- **API Gateway**: `8080`
- **PostgreSQL**: `5432`
- **ClickHouse HTTP**: `8123`
- **Temporal Web UI**: `8233`
- **Zitadel**: `8085`
- **Sandbox Manager**: `4001`
- **Agent Host**: `4002`

---

## 3. Starting Supporting Infrastructure

Launch PostgreSQL, ClickHouse, Temporal, and Zitadel:
```bash
docker compose -f infra/compose/docker-compose.yml up -d
```

Verify container health:
```bash
docker compose -f infra/compose/docker-compose.yml ps
```

---

## 4. Initializing Database Schema

Generate Prisma client and run initial migrations:
```bash
pnpm --filter @index0/db db:generate
pnpm --filter @index0/db db:migrate:dev
```

Initialize ClickHouse analytics tables:
```bash
docker exec -i index0-clickhouse clickhouse-client --multiquery < infra/clickhouse/init.sql
```

---

## 5. Running Monorepo Services

Run services using Turborepo:
```bash
# Build contracts and shared packages
pnpm build

# Run all services in development mode
pnpm dev
```

Or run individual services:
```bash
# Run Go API Gateway
cd services/gateway && go run main.go

# Run Sandbox Manager
pnpm --filter @index0/sandbox-manager dev

# Run Agent Host
pnpm --filter @index0/agent-host dev
```

---

## 6. Verifying Service Health

Verify all health endpoints return HTTP 200:
```bash
curl -i http://localhost:8080/health     # Gateway
curl -i http://localhost:4001/health     # Sandbox Manager
curl -i http://localhost:4002/health     # Agent Host
```
