# DAY 8 TASK: Billing Engine (Lago + Stripe)

## 1. Role-Wise Responsibilities

### Stream 1: Senior Tech Lead & System Architect
- **Responsibilities**:
  - Review and freeze `@index0/contracts/v1/billing` (`ILagoCustomerSync`, `IStripeWebhookPayload`, `InvoiceStatus`).
  - Formulate cryptographic webhook verification policies for Stripe signatures.
  - Review synchronization logic between OpenMeter usage, Lago rating, and Stripe payment collection.
  - Supervise the final Day 8 End-of-Day (EOD) Integration Ceremony.

### Stream 2: Platform & Backend Systems Engineer (AI Coding Agent: Antigravity Backend Agent)
- **Responsibilities**:
  - Implement `services/billing/` using Express, TypeScript, Stripe SDK, and Lago API client.
  - Implement architecture pipeline:
    ```text
    OpenMeter → Lago → Stripe
    ```
  - Implement Stripe Webhook receiver (`POST /billing/webhooks/stripe`):
    - Cryptographically verify signatures via `STRIPE_WEBHOOK_SECRET`.
    - Handle `checkout.session.completed`, `invoice.payment_succeeded`, `invoice.payment_failed`, `customer.subscription.updated`.
    - Sync state to PostgreSQL tables (`Customer`, `Subscription`, `Invoice`) via `@index0/db`.
  - Expose `GET /health` endpoint.
- **Target Files**: `services/billing/**`.

### Stream 3: Developer Experience & Client Systems Engineer (AI Coding Agent: Antigravity Client Agent)
- **Responsibilities**:
  - Build the subscription management and plan upgrade view in `apps/dashboard/`.
  - Display current billing tier, token quotas, and Stripe Customer Portal redirect button.
- **Target Files**: `apps/dashboard/src/pages/Billing.tsx`, `apps/dashboard/src/components/SubscriptionCard.tsx`.

---

## 2. Antigravity Agent Prompt Directives

### Directives for Stream 2 (Platform Agent)
```text
ROLE: Platform & Backend Systems Engineer
AGENT RUNTIME: Google Antigravity Agent
OBJECTIVE: Implement the Billing service integrating Lago sync and Stripe webhook handling.
CONTRACT: @index0/contracts/v1/billing, @index0/contracts/v1/api
ALLOWED FILES: services/billing/**
DEPENDENCIES: express, stripe, dotenv, zod, @index0/db, vitest
REQUIREMENTS:
- Implement POST /billing/webhooks/stripe with raw body parser and stripe.webhooks.constructEvent verification.
- Handle subscription and invoice events, updating PostgreSQL models via Prisma.
- Implement Lago customer sync utility creating/updating organization accounts in Lago.
- Expose GET /health.
FORBIDDEN CHANGES: Never bypass Stripe webhook signature verification; do not hardcode live API keys.
TESTS: Unit tests with mock Stripe event payloads verifying signature validation and Prisma updates.
```

### Directives for Stream 3 (DevEx Agent)
```text
ROLE: Developer Experience & Client Systems Engineer
AGENT RUNTIME: Google Antigravity Agent
OBJECTIVE: Implement the dashboard billing and subscription management interfaces.
CONTRACT: @index0/contracts/v1/billing
ALLOWED FILES: apps/dashboard/src/pages/Billing.tsx, apps/dashboard/src/components/SubscriptionCard.tsx
REQUIREMENTS:
- Display current subscription plan, token quota progress bar, and overage warnings.
- Provide Upgrade button triggering Stripe Checkout session creation via Gateway.
- Provide Manage Billing button redirecting to Stripe Customer Portal.
TESTS: Component render test and quota percentage calculation test.
```

---

## 3. Daily End-of-Day (EOD) Integration Ceremony

### Timeline
- **16:30**: Code Freeze on `feature/day-08-billing` and `feature/day-08-dashboard-billing`.
- **17:00**: Branch rebase onto `integration/day-08`.
- **17:30**: Full test suite and live billing integration scenario.
- **18:00**: Senior Tech Lead sign-off & checkpoint tagging.

### Automated Verification Script
```bash
# 1. Billing service tests & typecheck
pnpm --filter @index0/billing typecheck
pnpm --filter @index0/billing test
pnpm --filter @index0/billing build

# 2. Monorepo end-to-end typecheck & lint
pnpm typecheck
pnpm lint

# 3. Turborepo full build
pnpm build
```

### Day 8 Integration Scenario
1. Start Billing service (`pnpm --filter @index0/billing dev`).
2. Simulate incoming Stripe webhook with invalid signature; verify service rejects with HTTP 400 Bad Request.
3. Simulate incoming `checkout.session.completed` event signed with test webhook secret; verify service returns HTTP 200 and provisions `Subscription` and `Customer` records in PostgreSQL.
4. Verify Dashboard Billing page updates to reflect active subscription status.

### Merge Gate Checklist
- [ ] Billing service passes signature verification and database sync tests.
- [ ] Lago customer synchronization logic adheres to `@index0/contracts`.
- [ ] Dashboard renders subscription tiers and quota bars accurately.
- [ ] Final milestone tag created: `checkpoint/day-08`.
