# Architecture Overview — INDEX0 AI

INDEX0 AI is engineered as a sovereign, multi-agent AI Software Engineering Platform designed to replace fractured developer toolchains with an integrated, self-hosted operational system.

---

## 1. System Topology

```text
                                  CLIENTS
                      (INDEX0 IDE Web / VS Code Extension / CLI)
                                     │
                                     │ HTTPS / WSS / gRPC
                                     ▼
                            ┌──────────────────┐
                            │   API GATEWAY    │
                            │    Go + OIDC     │
                            │  (Zitadel Auth)  │
                            └────────┬─────────┘
                                     │
          ┌──────────────────────────┼──────────────────────────┐
          │                          │                          │
          ▼                          ▼                          ▼
     ┌─────────┐                ┌─────────┐                ┌─────────┐
     │  BUILD  │                │  SHIP   │                │  SELL   │
     └────┬────┘                └────┬────┘                └────┬────┘
          │                          │                          │
          ├─ OpenHands Agent Host    ├─ Temporal Workflows      ├─ OpenMeter
          ├─ E2B Sandbox Manager     ├─ Coolify Deployer        ├─ Lago Billing
          ├─ Go MCP Host (ripgrep)   ├─ ClickHouse Audit/Logs   ├─ Stripe Rails
          └─ IDE Server              └─ Artifact Registry       └─ Twenty CRM
                                                                        
                                     ▲
                                     │ Telemetry & Events
                                ┌────┴────┐
                                │  GROW   │
                                └────┬────┘
                                     │
                                     ├─ PostHog Analytics
                                     ├─ Postiz Social Dispatch
                                     └─ Listmonk Newsletters
```

---

## 2. Core Subsystems

### API Gateway (Go + Zitadel OIDC)
The API Gateway is the single public entry point for all external traffic. No internal microservice or storage database is exposed directly to the public internet.
- **Protocol**: HTTP/1.1, HTTP/2, Server-Sent Events (SSE), WebSockets.
- **Authentication**: JWT validation against Zitadel OpenID Connect discovery endpoints.
- **Cross-Cutting Concerns**: Request ID generation (`X-Request-ID`), structured JSON logging, distributed tracing headers, rate limiting, and reverse-proxy routing to internal services.

### BUILD Engine
The execution core for autonomous programming:
- **Agent Host (NestJS + RxJS)**: Manages stateful agent loops, translates prompt intents into plan steps, coordinates with OpenHands runtimes, and streams real-time updates via SSE.
- **Sandbox Manager (Node.js + Express + E2B)**: Orchestrates disposable, isolated microVMs with deterministic CPU/memory limits, code interpreter sandboxes, and guaranteed resource reclamation via `try/catch/finally`.
- **MCP Host (Go)**: Implements the Model Context Protocol over stdio/JSON-RPC. Provides scoped, secure file reading, directory listing, and ripgrep text search with path traversal prevention.

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
