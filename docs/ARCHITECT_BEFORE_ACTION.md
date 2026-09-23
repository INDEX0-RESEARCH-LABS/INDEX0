# ARCHITECT BEFORE ACTION — INDEX0 AI Sovereign AGI Blueprint

> This document is the authoritative high-level system blueprint for INDEX0 AI.
> Engineers and autonomous agents **MUST** read and understand this document before
> modifying any service boundary, infrastructure component, or protocol integration.

---

## 1. Platform Mission

INDEX0 AI is a sovereign, multi-agent AI software engineering platform designed to
replace fragmented developer toolchains with an integrated, self-hosted, zero-lock-in
operational system. It spans the complete lifecycle: **BUILD**, **SHIP**, **SELL**, and
**GROW** — augmented by six next-generation capability layers that elevate the platform
from a build tool into a self-evolving AGI engineering system.

---

## 2. Layered Architecture Overview

```text
┌──────────────────────────────────────────────────────────────────────────────────────┐
│                          INDEX0 SOVEREIGN AGI ARCHITECTURE                           │
├──────────────────────────────────────────────────────────────────────────────────────┤
│                                                                                      │
│  CLIENTS (Web Browser / IDE Extension / CLI / Voice)                                 │
│      │                                                                               │
│      │  HTTPS / WSS / WebRTC / gRPC                                                  │
│      ▼                                                                               │
│  ┌────────────────────────────────────────────────────────────────────────────────┐   │
│  │                         BOUNDARY 1: API GATEWAY                               │   │
│  │                    Caddy Reverse Proxy + Zitadel OIDC                         │   │
│  │                    LiteLLM Model Router (Sidecar)                             │   │
│  │                         Port 8000 (Public)                                    │   │
│  └──────────────────────────────┬─────────────────────────────────────────────────┘   │
│                                 │                                                     │
│                          PRIVATE SOVEREIGN ZONE                                       │
│                         Docker Bridge: index0-net                                     │
│                                 │                                                     │
│  ┌──────────────────────────────┼─────────────────────────────────────────────────┐   │
│  │                              │                                                 │   │
│  │  CORE PILLARS               │  AUGMENTATION LAYERS                            │   │
│  │  ─────────────               │  ─────────────────────                          │   │
│  │                              │                                                 │   │
│  │  ┌─────────┐ ┌─────────┐   │  🎙️ Voice & Multimodal (LiveKit + Pipecat)      │   │
│  │  │  BUILD  │ │  SHIP   │   │  ⚡ Edge GhostText (TabbyML + vLLM)             │   │
│  │  └────┬────┘ └────┬────┘   │  🔒 MicroVM Sandbox (E2B + Firecracker)         │   │
│  │       │           │        │  🌿 Git-Native Protocol (GNAP + Postcard)        │   │
│  │  ┌────┴────┐ ┌────┴────┐   │  📉 Context Compression (Viking + Letta)        │   │
│  │  │  SELL   │ │  GROW   │   │  🧬 Self-Evolving AGI (LangGraph + TextGrad)    │   │
│  │  └─────────┘ └─────────┘   │                                                  │   │
│  │                              │                                                 │   │
│  └──────────────────────────────┴─────────────────────────────────────────────────┘   │
│                                                                                      │
│  ┌────────────────────────────────────────────────────────────────────────────────┐   │
│  │                      BOUNDARY 2: EXECUTION SANDBOX                            │   │
│  │              Firecracker MicroVMs / E2B Cloud / Docker Local                  │   │
│  │                     (Isolated Guest VM Zone)                                  │   │
│  └────────────────────────────────────────────────────────────────────────────────┘   │
│                                                                                      │
│  ┌────────────────────────────────────────────────────────────────────────────────┐   │
│  │                      DATA & PERSISTENCE TIER                                  │   │
│  │   PostgreSQL 16 │ ClickHouse │ Letta Memory │ Viking Context Cache            │   │
│  └────────────────────────────────────────────────────────────────────────────────┘   │
│                                                                                      │
└──────────────────────────────────────────────────────────────────────────────────────┘
```

---

## 3. Component Interaction Map

### 3.1 Request Flow — Agent Execution (Primary Path)

```text
Developer (IDE / Voice / CLI)
    │
    ├─── HTTPS POST /api/v1/agents/runs ──────────────┐
    │                                                   │
    ▼                                                   ▼
API Gateway (Caddy)                              Zitadel OIDC
    │  ← JWT Validated ─────────────────────────────────┘
    │
    ├─── Route to Agent Orchestrator ──────────────────────┐
    │                                                       │
    ▼                                                       ▼
Agent Orchestrator (LangGraph)                     LiteLLM Router
    │  4-Tier Loop:                                    │
    │  Architect → Developer → Critic → QA             │  Model Selection
    │                                                   │  (GPT/Claude/Local)
    ├─── viking:// Context Retrieval ──────────────┐    │
    │                                               ▼    ▼
    │                                        MCP Host (Viking)
    │                                        L0 → L1 → L2 Loading
    │
    ├─── Code Execution ──────────────────────────────┐
    │                                                   ▼
    │                                           Sandbox Manager
    │                                           (E2B / Firecracker)
    │
    ├─── SAST Security Scan ──────────────────────────┐
    │                                                   ▼
    │                                           Semgrep + Trivy
    │                                           (Pre-Merge Scan)
    │
    ├─── Temporal Workflow Orchestration ──────────────┐
    │                                                   ▼
    │                                           Temporal Server
    │                                           (Durable Execution)
    │
    ├─── Telemetry Dispatch ──────────────────────────┐
    │                                                   ▼
    │                                           ClickHouse + OpenMeter
    │
    └─── SSE/WebSocket Stream ────────────────────────► IDE Client
```

### 3.2 Request Flow — Voice Interaction

```text
Developer Microphone
    │
    ├─── WebRTC Audio Stream ─────────────────────────┐
    │                                                   ▼
    │                                           LiveKit Server
    │                                           (WebRTC SFU)
    │                                                   │
    │                                                   ▼
    │                                           Voice Agent
    │                                           (Pipecat Pipeline)
    │                                                   │
    │                                           ┌───────┼───────┐
    │                                           │       │       │
    │                                           ▼       ▼       ▼
    │                                         STT    LLM     TTS
    │                                       (Whisper) (Route) (Bark)
    │                                                   │
    │                                                   ▼
    │                                           Agent Orchestrator
    │                                           (Same 4-Tier Loop)
    │
    └─── WebRTC Audio Response ◄──────────────────────── TTS Output
```

---

## 4. Zero-Trust Security Architecture

### 4.1 Trust Boundaries

| Boundary | Technology | Purpose |
|----------|-----------|---------|
| **B1: API Gateway** | Caddy + Zitadel OIDC | JWT validation, rate limiting, CORS, header injection |
| **B2: Sandbox Isolation** | Firecracker MicroVM / E2B | Kernel-level isolation for untrusted code execution |
| **B3: Network Isolation** | Docker `index0-net` bridge | No direct public access to databases or internal services |
| **B4: MCP Path Confinement** | Canonicalization + deny rules | Prevents path traversal outside workspace root |
| **B5: Pre-Merge SAST** | Semgrep + Trivy | Static analysis and vulnerability scanning before Git merge |

### 4.2 Authentication Chain

```text
Client JWT ──► Caddy Gateway ──► Zitadel JWKS Validation
                    │
                    ▼
            Header Injection:
            X-User-Id: <sub claim>
            X-Org-Id: <org claim>
            X-User-Roles: <roles claim>
                    │
                    ▼
            Internal Services (Trust injected headers)
```

### 4.3 Sandbox Security Invariants

1. **Guaranteed Cleanup**: All sandbox sessions wrapped in `try/catch/finally` — `finally` block always calls `session.close()`.
2. **Resource Quotas**: CPU, memory, and execution timeout enforced at the microVM level.
3. **No Host Access**: Sandboxes cannot access the host filesystem, network, or Docker socket.
4. **Ephemeral Lifecycle**: Every sandbox is destroyed after execution; no persistent state leaks between runs.

---

## 5. Microservice Boundaries

### 5.1 Directory → Service Mapping

```text
apps/
├── ide/              → INDEX0 IDE (Vite web app + VS Code extension)
│   ├── web/          → Browser-based workbench (React/TypeScript)
│   └── extension/    → VS Code extension (TabbyML GhostText integration)
├── ai/               → Marketing landing page (Next.js)
└── dashboard/        → [Planned] Organization admin console

services/
├── sandbox-manager/      → Express.js: E2B / Firecracker / Docker sandbox lifecycle
├── agent-orchestrator/   → Python/FastAPI: LangGraph 4-tier review loop + TextGrad
├── voice-agent/          → Python: LiveKit Agents + Pipecat WebRTC pipeline
├── gateway/              → [Planned] Custom Go gateway (currently Caddy-only)
├── agent-host/           → [Planned] NestJS agent runtime bridge
├── telemetry/            → [Planned] ClickHouse + OpenMeter event ingestion
├── billing/              → [Planned] Lago + Stripe billing integration
├── deployment/           → [Planned] Coolify deployment orchestration
└── workflows/            → [Planned] Temporal workflow definitions

packages/
├── contracts/        → Authoritative TypeScript types, interfaces, and schemas
├── db/               → Prisma ORM + PostgreSQL 16 schema + migrations
├── client-harness/   → Developer CLI for sandbox testing
├── mcp-host/         → [Planned] Go/TS MCP host with viking:// protocol
├── shared/           → [Planned] Common TypeScript utilities
└── config/           → [Planned] Shared configuration definitions

infra/
├── compose/          → Docker Compose manifests (base + overlay files)
├── postgres/         → PostgreSQL DDL and init scripts
├── clickhouse/       → ClickHouse analytics table schemas
├── temporal/         → Temporal server configuration
├── zitadel/          → Zitadel identity provider setup
├── gateway/          → Caddy reverse proxy config (Caddyfile)
├── mcp/              → MCP tool registry (tool-registry.json)
├── lago/             → Lago billing config
├── openmeter/        → OpenMeter metering config
└── openhands/        → OpenHands container utilities
```

### 5.2 Inter-Service Communication

| From | To | Protocol | Purpose |
|------|-----|----------|---------|
| IDE Client | API Gateway | HTTPS / WSS / WebRTC | All client traffic |
| API Gateway | Agent Orchestrator | HTTP / gRPC | Agent run creation |
| Agent Orchestrator | Sandbox Manager | HTTP REST | Code execution requests |
| Agent Orchestrator | MCP Host | stdio / HTTP | Context retrieval (viking://) |
| Agent Orchestrator | Temporal | gRPC | Durable workflow orchestration |
| Agent Orchestrator | LiteLLM | HTTP | Model routing |
| Voice Agent | LiveKit Server | WebRTC / gRPC | Real-time audio streaming |
| Voice Agent | Agent Orchestrator | HTTP / gRPC | Voice-to-agent bridging |
| Sandbox Manager | E2B Cloud / Firecracker | SDK / Socket | MicroVM lifecycle |
| Telemetry | ClickHouse | HTTP | Audit event ingestion |
| Telemetry | OpenMeter | HTTP | Usage metering |
| Billing | Lago | HTTP REST | Invoice and subscription management |
| Billing | Stripe | HTTP REST | Payment processing |

---

## 6. Non-Negotiable Architectural Invariants

1. **Contracts Are Authoritative**: No service defines ad-hoc schemas. All payloads reference `@index0/contracts`.
2. **Network Isolation**: PostgreSQL, ClickHouse, Zitadel, and internal services reside on the private `index0-net` bridge.
3. **Guaranteed Sandbox Cleanup**: All sandbox sessions terminated in `finally` blocks to prevent zombie microVMs.
4. **Stable Telemetry Identifiers**: Every telemetry event carries an immutable idempotency key (`event_id`).
5. **Pre-Merge Security Gates**: No code merges without passing Semgrep SAST + Trivy vulnerability scans.
6. **Cost-Kill by Default**: Context requests use viking:// L0/L1 tiers before escalating to L2 full code.
7. **Model Agnostic**: All LLM calls route through LiteLLM — never hardcode a specific provider endpoint.
8. **Durable Orchestration**: Any operation exceeding HTTP request timeout uses Temporal workflows.
9. **Zero Secrets in Git**: All secrets via environment variables; automated scanning on every push.
10. **Agent Review Loop**: All agent-generated code passes through the 4-tier Architect → Developer → Critic → QA cycle.
