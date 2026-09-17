# Architecture Overview — INDEX0 AI

INDEX0 AI is engineered as a sovereign, multi-agent AI Software Engineering Platform designed to replace fractured developer toolchains with an integrated, self-hosted operational system.

---

## 1. System Topology

```text
                                  CLIENTS
                      (Web Browser / IDE / Developers)
                                     │
                                     │ HTTPS / WSS / gRPC
                                     ▼
                            ┌──────────────────┐
                            │   API GATEWAY    │
                            │      Caddy       │
                            │ (Zitadel Auth)   │
                            │   (Port 8000)    │
                            └────────┬─────────┘
                                     │
          ┌──────────────────────────┼──────────────────────────┐
          │                          │                          │
          ▼                          ▼                          ▼
     ┌─────────┐                ┌─────────┐                ┌─────────┐
     │  BUILD  │                │  SHIP   │                │  SELL   │
     └────┬────┘                └────┬────┘                └────┬────┘
          │                          │                          │
          ├─ OpenHands Workbench     ├─ Temporal Workflows      ├─ OpenMeter
          ├─ Local Docker Sandbox    ├─ Coolify Deployer        ├─ Lago Billing
          ├─ Standard MCP Tools      ├─ ClickHouse Audit/Logs   ├─ Twenty CRM
          │                          └─ Artifact Registry       │
          │                                                     │
          └──────────────────────────┬──────────────────────────┘
                                     │
                                     ▼
                                ┌─────────┐
                                │  GROW   │
                                └────┬────┘
                                     │
                                     ├─ PostHog Analytics
                                     ├─ Postiz Social Dispatch
                                     └─ Listmonk Newsletters
```

---

## 2. Core Subsystems

### API Gateway (Caddy + Zitadel OIDC)
The API Gateway is the single public entry point for all external traffic on port 8000.
- **Engine**: Caddy 2 declarative reverse-proxy (zero scratch-built Go gateway code).
- **Protocol**: HTTP/1.1, HTTP/2, Server-Sent Events (SSE), WebSockets.
- **Authentication**: Zitadel OpenID Connect discovery endpoints and JWT validation.
- **Routing**:
  - `/` -> OpenHands autonomous agent workbench
  - `/auth/*` -> Zitadel identity server
  - `/temporal/*` -> Temporal workflow UI
  - `/analytics/*` -> ClickHouse analytics HTTP interface
  - `/health` -> Gateway health check

### BUILD Engine
The execution core for autonomous programming:
- **OpenHands Workbench**: Self-hosted autonomous software engineering workbench providing an all-in-one web editor, integrated terminal emulator, and agent execution loop.
- **Local Container Sandboxes**: Automated disposable execution containers managed locally via Docker daemon (`/var/run/docker.sock`) with zero external cloud sandbox dependencies.
- **Model Context Protocol (MCP)**: Off-the-shelf filesystem, ripgrep, and workspace inspection tools.

### SHIP Engine
Orchestration, verification, and deployment:
- **Temporal**: Handles durable execution. Long-running agent jobs that execute across minutes or hours survive server restarts, pod evictions, and transient network failures.
- **Coolify**: Sovereign container deployment engine for running preview environments, staging instances, and production releases.
- **ClickHouse**: Columnar storage engine capturing append-only audit events, token consumption metrics, execution logs, and request latency profiles.

### SELL Engine
Sovereign monetization and customer management:
- **OpenMeter**: Real-time event metering capturing billable units (tokens consumed, sandbox runtime milliseconds, workflow runs).
- **Lago**: Open-source metering and subscription management calculating tiered pricing and invoice generation.
- **Stripe**: Payment rails processing automated credit card charges and merchant webhooks.
- **Twenty**: Modern open-source CRM maintaining relationship intelligence and customer history.

### GROW Engine
Product intelligence and community outreach:
- **PostHog**: Product analytics, cohort tracking, and feature experimentation.
- **Postiz**: Programmatic social release announcements.
- **Listmonk**: Transactional and broadcast developer newsletter delivery.

---

## 3. Data Flow & Communication Lifecycle

```text
User Intent (IDE)
    ↓
Gateway (OIDC Validation & Rate Limit)
    ↓
Agent Host (Create Run & Initialize OpenHands Loop)
    ↓
Temporal Workflow (Orchestrate Lifecycle & State)
    ↓
MCP Host (Search Workspace via ripgrep)
    ↓
Sandbox Manager (Execute in E2B MicroVM)
    ↓
Result & Diff Capture
    ↓
Telemetry Dispatch (ClickHouse Audit + OpenMeter Usage)
    ↓
Lago / Stripe (Invoice Metering)
    ↓
IDE Streaming (SSE Agent Events)
```

---

## 4. Non-Negotiable Architectural Invariants

1. **Contracts are Authoritative**: No service defines ad-hoc schemas. All payloads must reference `@index0/contracts`.
2. **Network Isolation**: PostgreSQL, ClickHouse, Zitadel, and internal services reside on the private `index0-net` bridge network.
3. **Guaranteed Sandbox Cleanup**: All sandbox sessions must be terminated in `finally` blocks to prevent zombie microVMs.
4. **Stable Telemetry Identifiers**: Every event emitted into the telemetry pipeline must carry an immutable idempotency key (`event_id`).
