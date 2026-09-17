# SELL Architecture — INDEX0 AI

The **SELL** subsystem provides sovereign metering, subscription lifecycle management, and customer relationship management using self-hosted open-source engines.

> **Option A Architecture**: Off-the-shelf open-source deployment (OpenMeter for usage metering, Lago for rating & subscriptions, Twenty for CRM) without building custom billing services from scratch.

---

## 1. Metering & Billing Pipeline

```text
┌─────────────────────────────────────────────────────────────┐
│                       EVENT SOURCES                         │
│             (Gateway, OpenHands, Sandboxes)                 │
└──────────────────────────────┬──────────────────────────────┘
                               │ Usage Events (event_id, tenant_id)
                               ▼
┌─────────────────────────────────────────────────────────────┐
│                         OPENMETER                           │
│              (Self-Hosted Real-time Metering)               │
│                                                             │
│   • Token counts               • Sandbox runtime (ms)       │
│   • Tool calls                 • Active workspaces          │
└──────────────────────────────┬──────────────────────────────┘
                               │ Aggregated Usage Windows
                               ▼
┌─────────────────────────────────────────────────────────────┐
│                           LAGO                              │
│        (Self-Hosted Subscription & Rating Engine)           │
│                                                             │
│   • Customer synchronization   • Plan tiers & quotas        │
│   • Overage calculations       • Invoice draft generation   │
└──────────────────────────────┬──────────────────────────────┘
                               │ Invoicing & Payments
                               ▼
┌─────────────────────────────────────────────────────────────┐
│                     PAYMENT PROCESSORS                      │
│             (Stripe / Crypto / Open Invoicing)              │
│                                                             │
│   • Managed via Lago's native payment integrations          │
│   • Automated invoice delivery and receipt tracking         │
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

### 3.1 OpenMeter
- Self-hosted OpenMeter container deployed via Docker Compose.
- Records token counts and execution metrics with idempotent UUIDv4 keys.
- Directly queried or streamed into ClickHouse.

### 3.2 Lago
- Self-hosted Lago container deployed via Docker Compose.
- Connects directly to OpenMeter to calculate tiered pricing, plan limits, and customer invoices.
- Features its own built-in web management console for plans and billing without custom UI development.
