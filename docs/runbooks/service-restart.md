# Service Restart & Recovery Runbook — INDEX0 AI

This runbook documents safe restart procedures for all services and stateful backing components in the INDEX0 AI topology.

---

## 1. Restart Sequence Dependency Order

Stateful storage must be healthy before orchestrators or microservices are started:

```text
1. Network & Volumes (index0-net)
       ↓
2. Backing Datastores (PostgreSQL, ClickHouse)
       ↓
3. Identity & Orchestration (Zitadel, Temporal)
       ↓
4. Internal Microservices (Sandbox Manager, Agent Host, Telemetry, Billing)
       ↓
5. Public API Gateway (Go Gateway)
       ↓
6. Presentation Tier (INDEX0 IDE, Dashboard)
```

---

## 2. Safe Restart Commands

### Full Infrastructure Restart
```bash
# 1. Stop all containers gracefully
docker compose -f infra/compose/docker-compose.yml down

# 2. Start core datastores first
docker compose -f infra/compose/docker-compose.yml up -d postgres clickhouse

# 3. Wait for PostgreSQL & ClickHouse healthchecks
until docker exec index0-postgres pg_isready -U index0_user; do sleep 2; done

# 4. Start identity and workflow engines
docker compose -f infra/compose/docker-compose.yml up -d temporal zitadel

# 5. Start application microservices
docker compose -f infra/compose/docker-compose.yml up -d
```

---

## 3. Individual Component Restart

### Restarting the API Gateway
The Go Gateway is stateless and can be restarted with minimal disruption:
```bash
docker compose -f infra/compose/docker-compose.yml restart gateway
curl -f http://localhost:8080/health
```

### Restarting the Sandbox Manager
Before restarting, verify whether active executions are running:
```bash
# Check running containers / active executions
docker compose -f infra/compose/docker-compose.yml restart sandbox-manager
curl -f http://localhost:4001/health
```

### Restarting Temporal Server
If Temporal workers become unresponsive:
```bash
docker compose -f infra/compose/docker-compose.yml restart temporal
# Check Temporal Web UI on http://localhost:8233
```

---

## 4. Disaster Recovery / Volume Verification

To verify volume integrity:
```bash
# Verify PostgreSQL persistent volume
docker volume inspect compose_postgres_data

# Verify ClickHouse analytics volume
docker volume inspect compose_clickhouse_data
```
