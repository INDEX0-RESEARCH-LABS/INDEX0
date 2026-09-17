# SELL Architecture — INDEX0 AI

The **SELL** subsystem provides sovereign metering, subscription lifecycle management, payment rails, and customer relationship management.

---

## 1. Metering & Billing Pipeline

```text
┌─────────────────────────────────────────────────────────────┐
│                       EVENT SOURCES                         │
│         (Gateway, Agent Host, Sandbox Manager)              │
└──────────────────────────────┬──────────────────────────────┘
                               │ Usage Events (event_id, tenant_id)
                               ▼
┌─────────────────────────────────────────────────────────────┐
│                         OPENMETER                           │
│                   (Real-time Metering)                      │
│                                                             │
│   • Token counts               • Sandbox runtime (ms)       │
│   • Tool calls                 • Active workspaces          │
└──────────────────────────────┬──────────────────────────────┘
                               │ Aggregated Usage Windows
                               ▼
┌─────────────────────────────────────────────────────────────┐
│                           LAGO                              │
│             (Subscription & Rating Engine)                  │
│                                                             │
│   • Customer synchronization   • Plan tiers & quotas        │
│   • Overage calculations       • Invoice draft generation   │
└──────────────────────────────┬──────────────────────────────┘
                               │ Invoices & Payment Intents
                               ▼
┌─────────────────────────────────────────────────────────────┐
│                          STRIPE                             │
│                      (Payment Rails)                        │
│                                                             │
│   • Customer payment methods   • Credit card charges        │
│   • Webhook notifications      • Tax compliance             │
└─────────────────────────────────────────────────────────────┘
```

---

## 2. Customer Relationship Management: Twenty

INDEX0 AI integrates with **Twenty**, the modern open-source sovereign CRM:
- Synchronizes Organizations and Users into Twenty CRM accounts and contacts.
- Tracks customer lifecycle stage (Lead, Trial, Active, Churned).
- Correlates agent usage with account health to empower developer advocacy and enterprise sales.

---

## 3. Component Specifications

### 3.1 OpenMeter Integration (`services/telemetry`)
- All billable platform events implement `IOpenMeterEvent` from `@index0/contracts`.
- Every event includes:
  - `id`: Globally unique idempotency key (UUIDv4).
  - `type`: Metered dimension (`tokens.total`, `sandbox.duration_ms`, `agent.run_count`).
  - `subject`: Tenant / Organization ID.
  - `timestamp`: RFC3339 UTC timestamp.
  - `data`: Numeric value and metadata dimensions.

### 3.2 Lago Integration (`services/billing`)
- Synchronizes customers when organizations are created or updated.
- Pulls aggregated usage intervals from OpenMeter to calculate billing overages.
- Generates periodic invoice drafts.

### 3.3 Stripe Webhooks (`services/billing`)
- Receives cryptographic webhook events from Stripe (`POST /billing/webhooks/stripe`).
- Verifies signature using `STRIPE_WEBHOOK_SECRET`.
- Handles events:
  - `checkout.session.completed`
  - `invoice.payment_succeeded`
  - `invoice.payment_failed`
  - `customer.subscription.updated`
  - `customer.subscription.deleted`
- Updates subscription and invoice states in PostgreSQL.
