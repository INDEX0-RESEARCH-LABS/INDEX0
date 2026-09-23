# SYSTEM ARCHITECTURE — INDEX0 AI

> Deep-dive specification into the complete INDEX0 AI platform architecture: the original
> 4 Pillars (BUILD, SHIP, SELL, GROW) and the 6 Sovereign AGI augmentation layers.

---

## 1. End-to-End Request Lifecycle

### 1.1 Full Request Flow: User Prompt → Code Merge

```text
Step 1: INGRESS
────────────────────────────────────────────────────────────────────
    Developer submits prompt via IDE / Voice / CLI
        │
        ▼
    API Gateway (Caddy :8000)
        ├── OIDC JWT validation (Zitadel JWKS)
        ├── Rate limiting (per org tier)
        ├── CORS enforcement
        └── Header injection (X-User-Id, X-Org-Id, X-User-Roles)

Step 2: CONTEXT LOADING (viking:// protocol)
────────────────────────────────────────────────────────────────────
    MCP Host receives context request
        ├── L0 Abstract:  Repository name, top-level summary, key deps
        │                 (~50 tokens, always loaded)
        ├── L1 Structural: Directory tree, module signatures, type exports
        │                  (~500 tokens, loaded on relevance match)
        └── L2 Full Code:  Complete file contents
                           (~5000+ tokens, loaded only when needed)

    Token Savings: 34.3% (L1 sufficient) to 91.0% (L0 sufficient)

Step 3: AGENT ORCHESTRATION (LangGraph 4-Tier Loop)
────────────────────────────────────────────────────────────────────
    Agent Orchestrator receives prompt + context
        │
        ├── ARCHITECT Node:
        │     Analyzes requirements, proposes architecture plan
        │     Outputs: Plan steps, file targets, dependency analysis
        │
        ├── DEVELOPER Node:
        │     Generates code changes based on Architect's plan
        │     Outputs: Code diffs, new files, modified files
        │
        ├── CRITIC Node:
        │     Reviews generated code for correctness, style, security
        │     Runs Semgrep SAST + Trivy vulnerability scan
        │     Outputs: Review verdict (APPROVE / REQUEST_CHANGES / REJECT)
        │
        └── QA Node:
              Executes tests in sandbox, validates behavior
              Outputs: Test results, coverage report, final verdict
              
    If REJECT → Loop back to DEVELOPER with TextGrad feedback
    If APPROVE → Proceed to merge

Step 4: SANDBOX EXECUTION
────────────────────────────────────────────────────────────────────
    Sandbox Manager provisions execution environment
        ├── Provider Selection:
        │     E2B Cloud   → Remote Firecracker MicroVM (default)
        │     Firecracker → Self-hosted local MicroVM (sovereign option)
        │     Docker      → Local container fallback (dev mode)
        │
        ├── Code Execution:
        │     Execute generated code, run tests, capture output
        │     Languages: Python, TypeScript, Bash
        │
        └── Desktop Automation (optional):
              e2b-desktop for visual browser testing
              Screenshot capture and comparison

Step 5: TEMPORAL ORCHESTRATION
────────────────────────────────────────────────────────────────────
    Temporal manages durable workflow state
        ├── AgentExecutionWorkflow: Full agent lifecycle
        ├── SandboxExecutionWorkflow: Sandbox provisioning + teardown
        ├── BillingUsageWorkflow: Usage event aggregation
        └── DeploymentWorkflow: Coolify container deployment

    Features: Retry policies, timeouts, crash recovery via replay logs

Step 6: TELEMETRY & BILLING
────────────────────────────────────────────────────────────────────
    Telemetry Pipeline
        ├── ClickHouse: Append-only audit events, execution metrics
        ├── OpenMeter: Real-time usage metering (tokens, sandbox ms)
        ├── Lago: Subscription rating, invoice generation
        └── Stripe: Payment processing

Step 7: RESPONSE STREAMING
────────────────────────────────────────────────────────────────────
    IDE Client receives real-time updates via SSE/WebSocket
        ├── agent.started → agent.plan → agent.message
        ├── tool.called → tool.result
        ├── sandbox.started → sandbox.completed
        └── agent.completed / agent.failed
```

---

## 2. Pillar I: BUILD

The execution core for autonomous software engineering.

### 2.1 OpenHands Workbench
- **Container**: `ghcr.io/all-hands-ai/openhands:0.18`
- **Capabilities**: Integrated Monaco editor, terminal emulator, file explorer, multi-agent execution loop
- **LLM Backend**: Configurable via `LLM_MODEL` env var (Claude, GPT, local vLLM)
- **Workspace**: Binds to host `./workspace` directory for persistent code development
- **Agent Canvas**: Vendored OpenHands fork at `/agent-canvas/` with INDEX0-specific agent customizations

### 2.2 Sandbox Execution Engine
- **Primary**: E2B Cloud MicroVMs via `@e2b/code-interpreter` SDK
- **Sovereign Alternative**: Self-hosted Firecracker MicroVMs via local socket API
- **Development Fallback**: Local Docker containers via host Docker daemon
- **Desktop Mode**: `@e2b/desktop` SDK for visual browser automation and frontend testing
- **Quotas**: Configurable per `SANDBOX_QUOTAS` contract (timeout, memory, CPU)

### 2.3 Model Context Protocol (MCP) Host
- **Tool Registry**: Canonical tool definitions at `infra/mcp/tool-registry.json`
- **Native Tools**: `openhands_file_search`, `openhands_file_read`, `openhands_file_edit`, `openhands_directory_list`, `openhands_bash_execute`, `openhands_browser`
- **Standard MCP Servers**: `@modelcontextprotocol/server-filesystem`, `@modelcontextprotocol/server-brave-search`
- **Viking Protocol**: `viking://` 3-tier context retrieval (L0/L1/L2 progressive loading)
- **Security**: Workspace-confined, symlink-deny, path traversal protection

### 2.4 LiteLLM Model Router
- **Purpose**: Unified model routing gateway supporting 100+ LLM providers
- **Cost Optimization**: Routes simple tasks to smaller/cheaper models, complex reasoning to top-tier models
- **Fallback Chains**: Primary → Fallback → Local model cascade
- **Observability**: Token counting, latency tracking, cost attribution per org

---

## 3. Pillar II: SHIP

Orchestration, verification, and deployment.

### 3.1 Temporal Workflows (`services/workflows` + `infra/temporal`)
- **Engine**: Temporal Server v1.24.2 with PostgreSQL persistence
- **UI**: Temporal UI v2.27.0 on port 8233
- **Core Workflows**:
  - `AgentExecutionWorkflow`: Full agent lifecycle (workspace → sandbox → tools → results → telemetry)
  - `SandboxExecutionWorkflow`: Sandbox provisioning, execution, and guaranteed teardown
  - `BillingUsageWorkflow`: Usage aggregation and Lago invoice triggering
  - `DeploymentWorkflow`: Coolify container build and deployment pipeline
- **Replay Logs**: Automatic crash recovery via Temporal's event sourcing (augmented with Flyte checkpoints for long-running batch operations)

### 3.2 Coolify Deployment Orchestration (`services/deployment`)
- Sovereign container deployment via Coolify REST API
- Preview environment provisioning for agent-generated PRs
- Zero-downtime rollouts with health check gates

### 3.3 ClickHouse Analytics (`infra/clickhouse` + `services/telemetry`)
- **Engine**: ClickHouse 24 Alpine
- **Tables**: `audit_events`, `agent_execution_metrics`, `api_requests`, `sandbox_metrics`
- **Access**: Internal-only via `index0-net` bridge; never exposed publicly

---

## 4. Pillar III: SELL

Sovereign monetization and customer management.

### 4.1 Usage Metering (OpenMeter)
- **Container**: `ghcr.io/openmeterio/openmeter:latest`
- **Meters**: Token consumption, sandbox runtime (ms), tool call count, active workspaces
- **Integration**: Receives usage events from telemetry pipeline; feeds into Lago for rating

### 4.2 Subscription Management (Lago)
- **Container**: `getlago/api:v1.12.0`
- **Features**: Customer sync, plan tiers (Free / Pro / Enterprise), overage calculations, invoice generation
- **Pricing Model**: $20/mo base with usage-based overages; $4.50 estimated COGS per seat

### 4.3 Payment Processing (Stripe)
- Managed via Lago's native Stripe integration
- Automated invoice delivery, receipt tracking, webhook processing

### 4.4 Customer Relationship Management (Twenty CRM)
- Open-source sovereign CRM for customer lifecycle tracking
- Sync organizations and users; correlate usage with account health

---

## 5. Pillar IV: GROW

Product intelligence and community outreach.

### 5.1 PostHog — Product Analytics
- User session tracking, feature discovery funnels, agent completion rate cohorts
- Feature flags for canary rollouts of new agent models and MCP tools
- Self-hosted session replay for debugging and error triage

### 5.2 Postiz — Social Outreach
- Omnichannel dispatch: GitHub Discussions, X/Twitter, LinkedIn, Discord
- Automated changelog compilation from PR merge notes

### 5.3 Listmonk — Developer Communications
- Transactional emails: welcome series, quota warnings, invoice alerts
- Weekly developer digest: platform improvements, model benchmarks, OSS contributions

---

## 6. Augmentation Layer I: Voice & Multimodal (LiveKit + Pipecat)

### 6.1 Architecture

```text
┌─────────────────────────────────────────────────────────────┐
│                     VOICE INTERACTION PIPELINE               │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  Developer Microphone                                        │
│       │                                                      │
│       ├── WebRTC Audio ──► LiveKit Server (SFU)              │
│       │                        │                             │
│       │                        ▼                             │
│       │                   Voice Agent Service                │
│       │                   (Pipecat Pipeline)                 │
│       │                        │                             │
│       │               ┌───────┼───────┐                     │
│       │               ▼       ▼       ▼                     │
│       │             STT     LLM     TTS                     │
│       │           (Whisper)(Route) (Bark/ElevenLabs)         │
│       │                       │                              │
│       │                       ▼                              │
│       │              Agent Orchestrator                      │
│       │              (LangGraph Loop)                        │
│       │                       │                              │
│       └── WebRTC Audio ◄──── TTS Response                   │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

### 6.2 Key Capabilities
- **Sub-100ms Latency**: WebRTC streaming via LiveKit SFU eliminates HTTP round-trip overhead
- **Semantic Turn Detection**: Natural interruption handling without breaking conversation context
- **Hands-Free Coding**: Dictate requirements, ask questions, approve changes via voice
- **Screen Share**: Real-time visual context sharing for debugging and pair programming

---

## 7. Augmentation Layer II: Edge GhostText (TabbyML + vLLM)

### 7.1 Architecture

```text
┌─────────────────────────────────────────────────────────────┐
│                    GHOSTTEXT AUTOCOMPLETE                     │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  VS Code Extension (apps/ide/extension)                      │
│       │                                                      │
│       ├── Inline Completion Request ──► TabbyML Client       │
│       │                                     │                │
│       │                                     ▼                │
│       │                              Local vLLM Server       │
│       │                              (On-Device GPU/CPU)     │
│       │                                     │                │
│       │                                     ▼                │
│       │                              Code Completion         │
│       │                              (Sub-20ms Latency)      │
│       │                                     │                │
│       └── Inline Suggestion Display ◄───────┘               │
│                                                              │
│  Cost: $0 (fully on-device, no cloud API calls)              │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

---

## 8. Augmentation Layer III: MicroVM Sandbox (E2B + Firecracker)

### 8.1 Provider Hierarchy

| Provider | Boot Time | Isolation | Cost | Use Case |
|----------|-----------|-----------|------|----------|
| **E2B Cloud** | ~200ms | Firecracker MicroVM (cloud) | Pay-per-use | Default production |
| **Firecracker Local** | ~125ms | Firecracker MicroVM (self-hosted) | Infrastructure only | Sovereign / air-gapped |
| **Docker Local** | ~500ms | Container (cgroups) | Free | Local development |

### 8.2 Desktop Automation
- `e2b-desktop` SDK enables agents to control full desktop environments
- Browser navigation, clicking, typing, screenshotting for visual testing
- Isolated from host; ephemeral lifecycle same as code sandboxes

---

## 9. Augmentation Layer IV: Git-Native Protocol (GNAP + Postcard)

### 9.1 Protocol Design

```text
┌─────────────────────────────────────────────────────────────┐
│              GIT-NATIVE AGENT PROTOCOL (GNAP)                │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  Agent A (Architect)                                         │
│       │                                                      │
│       ├── git commit -m "gnap: plan proposal"                │
│       │   .gnap/messages/001-architect-plan.json             │
│       │                                                      │
│  Agent B (Developer)                                         │
│       │                                                      │
│       ├── git pull → reads .gnap/messages/                   │
│       ├── implements code changes                            │
│       ├── git commit -m "gnap: implementation"               │
│       │   .gnap/messages/002-developer-impl.json             │
│       │                                                      │
│  Agent C (Critic)                                            │
│       │                                                      │
│       ├── git pull → reads implementation                    │
│       ├── runs review + SAST scan                            │
│       └── git commit -m "gnap: review verdict"               │
│           .gnap/messages/003-critic-review.json              │
│                                                              │
│  ZERO DATABASE: All coordination via Git commits             │
│  ZERO SERVER: Any agent with `git push` access can join      │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

### 9.2 Postcard Protocol
- Lightweight JSON envelope schema for inter-agent messages
- Fields: `from`, `to`, `type`, `payload`, `timestamp`, `parent_id`
- Stored in `.gnap/messages/` directory within the repository
- Git history provides full audit trail of all agent communication

---

## 10. Augmentation Layer V: Context Compression (Viking + Letta + LiteLLM)

### 10.1 Viking Protocol (`viking://`)

```text
viking://repo/path/to/module

    ┌─────────────────────────────────────────────────┐
    │  L0 ABSTRACT (~50 tokens)                       │
    │  ─────────────────────────                      │
    │  Module name, one-line summary, key exports     │
    │  Dependencies, language, framework              │
    │                                                  │
    │  → Always loaded. Sufficient for 91% of          │
    │    routing and planning decisions.               │
    ├─────────────────────────────────────────────────┤
    │  L1 STRUCTURAL OVERVIEW (~500 tokens)           │
    │  ────────────────────────────────               │
    │  Directory tree, function signatures,            │
    │  type definitions, interface contracts           │
    │  Import graph, module boundaries                 │
    │                                                  │
    │  → Loaded on relevance match. Sufficient for     │
    │    65.7% of implementation tasks.                │
    ├─────────────────────────────────────────────────┤
    │  L2 FULL CODE (~5000+ tokens)                   │
    │  ─────────────────────────                      │
    │  Complete source file contents                   │
    │  Inline comments, docstrings, test fixtures      │
    │                                                  │
    │  → Loaded only when L0+L1 are insufficient.      │
    │    Required for <9% of operations.               │
    └─────────────────────────────────────────────────┘
```

### 10.2 Letta (MemGPT) — Persistent Agent Memory
- Long-term memory blocks persisted across sessions
- Working memory, archival memory, and recall memory tiers
- Agents remember project context, user preferences, and past decisions

### 10.3 LiteLLM — Unified Model Gateway
- Routes requests to optimal model based on task complexity and cost
- Supports 100+ providers: OpenAI, Anthropic, local vLLM, Ollama, etc.
- Fallback chains, load balancing, and cost tracking per organization
- Target: 56% cost reduction via intelligent routing

---

## 11. Augmentation Layer VI: Self-Evolving AGI (LangGraph + TextGrad + SAST)

### 11.1 4-Tier Review Loop

```text
                    ┌──────────────┐
                    │  USER PROMPT │
                    └──────┬───────┘
                           │
                           ▼
                    ┌──────────────┐
            ┌──────│  ARCHITECT   │──────┐
            │      └──────────────┘      │
            │       Plan & Design        │
            │                            │
            ▼                            │
     ┌──────────────┐                    │
     │  DEVELOPER   │◄───── TextGrad ────┤
     └──────┬───────┘    Feedback Loop   │
            │                            │
            │  Code Generation           │
            ▼                            │
     ┌──────────────┐                    │
     │   CRITIC     │                    │
     └──────┬───────┘                    │
            │                            │
            ├── Semgrep SAST Scan        │
            ├── Trivy Vuln Scan          │
            ├── Style & Logic Review     │
            │                            │
            ▼                            │
     ┌──────────────┐                    │
     │     QA       │                    │
     └──────┬───────┘                    │
            │                            │
            ├── Execute Tests in Sandbox │
            ├── Coverage Validation      │
            │                            │
            ├── APPROVE ──► Merge        │
            └── REJECT  ──► Loop Back ───┘
```

### 11.2 TextGrad — Textual Backpropagation
- Failed test traces are converted into structured textual feedback
- Feedback recursively updates agent prompts (no model re-training required)
- Overnight batch processing for prompt optimization across historical failures
- Convergence metric: reduction in REJECT rate per iteration

### 11.3 Pre-Merge Security Gates (Semgrep + Trivy)
- **Semgrep**: Static application security testing (SAST) for code patterns
  - Custom rule packs for Python, TypeScript, Go
  - SQL injection, XSS, path traversal, hardcoded secrets detection
- **Trivy**: Container and dependency vulnerability scanning
  - CVE database checks against all imported packages
  - License compliance verification
- **Gate Policy**: PRs with HIGH/CRITICAL findings are automatically blocked

---

## 12. Data Architecture

### 12.1 Primary Store — PostgreSQL 16

| Domain | Key Tables | Purpose |
|--------|-----------|---------|
| Identity | `users`, `organizations`, `memberships` | Authentication and RBAC |
| Projects | `projects`, `repositories`, `workspaces` | Code workspace management |
| Agents | `agent_runs`, `agent_events`, `sandbox_executions` | Agent lifecycle and audit |
| Billing | `customers`, `subscriptions`, `invoices`, `usage_events` | Monetization |
| Voice | `voice_sessions` [NEW] | Voice interaction history |
| Review | `review_cycles` [NEW] | 4-tier review loop state |
| Context | `context_cache` [NEW] | Viking L0/L1 cache |
| Memory | `agent_memory_blocks` [NEW] | Letta persistent memory |

### 12.2 Analytics Store — ClickHouse

| Table | Purpose |
|-------|---------|
| `audit_events` | Security and administrative action log |
| `agent_execution_metrics` | Token consumption, step counts, durations |
| `api_requests` | Gateway request logs and latency |
| `sandbox_metrics` | Sandbox boot times, execution durations |
| `cost_attribution` [NEW] | Per-org model cost tracking via LiteLLM |

### 12.3 Memory Store — Letta (MemGPT)
- Backed by PostgreSQL (shared instance or dedicated)
- Working memory: active conversation context
- Archival memory: long-term project knowledge
- Recall memory: searchable conversation history
