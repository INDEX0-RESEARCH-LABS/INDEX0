# Incident Response Runbook — INDEX0 AI

This runbook guides on-call engineers and lead maintainers during critical incidents affecting the INDEX0 AI platform.

---

## 1. Severity Definitions

| Severity | Definition | Target Response | Target Resolution |
| :--- | :--- | :--- | :--- |
| **SEV-1** | Full platform outage, data corruption, active security breach, or sandbox escape. | < 15 minutes | < 2 hours |
| **SEV-2** | Degraded agent execution, billing/metering failures, or Gateway intermittent errors. | < 30 minutes | < 6 hours |
| **SEV-3** | Non-critical service degradation (e.g. marketing site, delayed reporting). | < 2 hours | < 24 hours |

---

## 2. Emergency Escalation & Roles

1. **Incident Commander (IC)**: Senior Tech Lead. Directs the response, authorizes rollbacks, and coordinates communication.
2. **Operations Lead**: Vibecoder A. Investigates infrastructure, database connections, container status, and logs.
3. **Application Lead**: Vibecoder B. Investigates code regressions, contract violations, and client errors.

---

## 3. Incident Triage Steps

### Step 1: Establish Containment
- If security breach or unauthorized code execution is suspected:
  ```bash
  # Immediately isolate the sandbox manager
  docker stop index0-sandbox-manager
  # Revoke Zitadel client secrets and invalidate active JWT sessions
  ```

### Step 2: Check System Health
Inspect health status across all endpoints:
```bash
# Gateway
curl -sS http://localhost:8080/health | jq .
# Sandbox Manager
curl -sS http://localhost:4001/health | jq .
# Agent Host
curl -sS http://localhost:4002/health | jq .
```

### Step 3: Inspect Logs
```bash
# Tail logs with structured formatting
docker compose -f infra/compose/docker-compose.yml logs -f --tail=100 gateway
docker compose -f infra/compose/docker-compose.yml logs -f --tail=100 agent-host
docker compose -f infra/compose/docker-compose.yml logs -f --tail=100 sandbox-manager
```

### Step 4: Check Database Health & Connections
```bash
docker exec -it index0-postgres pg_isready -U index0_user
docker exec -it index0-postgres psql -U index0_user -d index0_db -c "SELECT count(*), state FROM pg_stat_activity GROUP BY state;"
```

---

## 4. Remediation & Rollback

- **Rollback Service**:
  Revert to previous container image tag in deployment configuration.
- **Dangling Sandboxes Cleanup**:
  If E2B microVMs fail to terminate cleanly:
  Execute emergency cleanup script:
  ```bash
  pnpm --filter @index0/sandbox-manager cleanup:dangling
  ```
- **Post-Incident Review**:
  Publish a Blameless Post-Mortem in `docs/runbooks/post-mortems/` within 48 hours of resolution.
