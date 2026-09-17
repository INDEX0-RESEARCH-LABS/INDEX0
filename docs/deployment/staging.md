# Staging Deployment — INDEX0 AI

The staging environment mirrors production architecture with isolated preview databases and sandboxed external integrations.

---

## 1. Environment Topology

- **Host Platform**: Sovereign Linux VPS / Bare Metal / Kubernetes cluster.
- **Orchestration**: Coolify container manager (`services/deployment`).
- **Domain**: `*.staging.index0.ai`
- **Identity**: Zitadel staging instance with test OIDC applications.
- **Payment Mocking**: Stripe test mode (`sk_test_...`) and test webhooks.
- **Sandbox**: E2B staging environment.

---

## 2. Infrastructure Setup

1. **Deploy Staging Compose Stack**:
   ```bash
   docker compose -f infra/compose/docker-compose.staging.yml up -d
   ```
2. **Configure TLS Certificates**:
   Handled automatically by Coolify or reverse proxy (Traefik / Caddy) via Let's Encrypt ACME.

3. **Apply Database Migrations**:
   Run via automated migration job before traffic routing:
   ```bash
   pnpm --filter @index0/db db:migrate:deploy
   ```

---

## 3. Automated PR Preview Environments

When a pull request with label `deploy:preview` is opened:
1. GitHub Actions triggers `services/deployment` via Coolify webhook.
2. An isolated stack is deployed at `pr-<number>.preview.index0.ai`.
3. E2E tests run against the preview stack.
4. Upon PR closure, resources are deprovisioned automatically.

---

## 4. Verification Checklist

- [ ] Zitadel OIDC issuer matches `https://auth.staging.index0.ai`.
- [ ] Database connection pool limits are tuned for staging load.
- [ ] ClickHouse audit ingestion is active and recording telemetry.
- [ ] Temporal web UI is accessible via private VPN or IP whitelist.
- [ ] Stripe webhooks respond with HTTP 200 to test events.
