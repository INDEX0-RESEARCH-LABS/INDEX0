# Production Deployment & Hardening — INDEX0 AI

This document establishes production deployment rules, operational invariants, and security hardening for INDEX0 AI.

---

## 1. Production Architecture Principles

```text
                     INTERNET
                        │
                  Cloudflare / Edge
                 (DDoS, WAF, SSL)
                        │
                        ▼
                 REVERSE PROXY / CADDY
                 (SSL Termination, Port 443)
                        │
                        ▼
               INDEX0 API GATEWAY (Go)
                        │
        ┌───────────────┼───────────────┐
        │ index0-net    │               │
        ▼               ▼               ▼
   Agent Host    Sandbox Manager    Temporal
   (NestJS)      (E2B MicroVM)      (Cluster)
        │               │               │
        └───────────────┼───────────────┘
                        ▼
            PostgreSQL 16 HA + ClickHouse
                 (Private Networks)
```

---

## 2. Hardening Requirements

### 2.1 Network Exposure Rules
- **ONLY** ports 80 and 443 of the reverse proxy / API Gateway may be reachable from the internet.
- PostgreSQL (5432), ClickHouse (8123/9000), Temporal (7233), Zitadel internal endpoints, and microservices MUST NOT bind to `0.0.0.0`.
- All inter-service communication occurs over the isolated Docker network or private VPC subnet.

### 2.2 Secret & Credential Management
- Never bake secrets into container images.
- Inject secrets exclusively at runtime via secure secret managers (e.g. Doppler, Vault, or Coolify encrypted environment variables).
- Rotate `STRIPE_WEBHOOK_SECRET`, `ZITADEL_CLIENT_SECRET`, and `DATABASE_URL` credentials periodically.

### 2.3 Resource Limits & Dead-Man Switches
- Set strict memory and CPU limits on every container in production compose / Kubernetes manifests:
  ```yaml
  deploy:
    resources:
      limits:
        cpus: '2.0'
        memory: 2048M
  ```
- Sandbox execution timeout must default to a maximum of 120,000 ms (2 minutes) unless explicitly overridden with enterprise authorization.
- Enforce dead-man switches on long-running Temporal workflows to cancel orphaned agent loops automatically.

---

## 3. Zero-Downtime Rollout Sequence

1. **Pre-deployment Verification**:
   Verify all CI checks, security scans, and database migrations pass in staging.
2. **Schema Migration**:
   Run non-breaking schema expansions (`db:migrate:deploy`). Breaking columns must follow the Expand/Contract pattern.
3. **Rolling Update**:
   Deploy new service containers alongside existing instances; cut over traffic upon successful `/health` response.
4. **Post-Deployment Audit**:
   Verify ClickHouse audit logs and OpenMeter metering streams are recording events without errors.
