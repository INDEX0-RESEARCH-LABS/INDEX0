# INDEX0 AI — Sovereign AGI Operating System

> Zero-lock-in, self-hosted, multi-agent AI software engineering platform with sub-100ms multimodal voice, edge autocomplete, microVM execution isolation, Git-native coordination, and self-evolving review loops.

INDEX0 AI provides an integrated, production-grade operating system for autonomous AI software engineering spanning the complete lifecycle: **BUILD**, **SHIP**, **SELL**, and **GROW**, supercharged with 6 sovereign capability layers.

---

## 🌊 Sovereign AGI Architecture

```text
┌──────────────────────────────────────────────────────────────────────────────────┐
│                      INDEX0 SOVEREIGN AGI ARCHITECTURE                           │
├──────────────────────────────────────────────────────────────────────────────────┤
│ 🎙️ 1. Voice & Multimodal Layer   → LiveKit Agents + Pipecat (Sub-100ms WebRTC)   │
│ ⚡ 2. Edge & GhostText Layer      → TabbyML + vLLM (Sub-20ms Local Autocomplete) │
│ 🔒 3. MicroVM Execution Sandbox   → Firecracker + E2B Cloud (Hardware Virtualized)│
│ 🐙 4. Git-Native Agent Protocol   → GNAP + Postcard (Decentralized Git State)    │
│ 🧠 5. Context Compression & Memory→ OpenViking + Letta MemGPT + LiteLLM Proxy     │
│ 🔄 6. Self-Evolving Review Loop   → LangGraph 4-Tier + TextGrad Backpropagation  │
├──────────────────────────────────────────────────────────────────────────────────┤
│                         FOUNDATIONAL PILLARS                                     │
│  BUILD: OpenHands Workbench | SHIP: Temporal + Coolify                           │
│  SELL:  OpenMeter + Lago    | GROW: Twenty CRM + PostHog                         │
└──────────────────────────────────────────────────────────────────────────────────┘
```

---

## Six Sovereign Capability Layers

### 1. Voice & Multimodal Interaction
- **LiveKit Agents SDK & WebRTC SFU**: Real-time voice room token generation, sub-100ms latency.
- **Pipecat Frame Pipeline**: Modular audio streaming pipeline: VAD → STT (Whisper) → LLM → TTS (ElevenLabs).
- **Service**: `services/voice-agent/` (Python/FastAPI).

### 2. Edge & GhostText Autocomplete
- **Local vLLM / TabbyML**: Ultra-low latency code completions with local edge offloading.
- **Zero-Cloud Fallback**: Completely sovereign offline operation.

### 3. MicroVM Execution Isolation
- **E2B Cloud SDK**: Production code interpretation and browser desktop automation.
- **Self-Hosted Firecracker MicroVMs**: Hardware-level KVM virtualization (<150ms boot time).
- **Service**: `services/sandbox-manager/` (TypeScript/Express).

### 4. Git-Native Agent Protocol (GNAP)
- **Git Commit Storage**: Transparent agent communication stored inside git history (`.gnap/`).
- **Postcard Protocol**: Structured inter-agent message envelopes and cryptographic signatures.
- **Contracts**: `packages/contracts/src/v1/coordination/`.

### 5. Context Compression & Memory
- **OpenViking Protocol (`viking://`)**: 3-tier hierarchical context retrieval (L0 Abstract ~50 tokens, L1 Structural ~500 tokens, L2 Full Code).
- **Letta (MemGPT)**: Persistent Core, Archival, and Recall agent memory blocks.
- **LiteLLM Proxy**: Unified cost-aware model routing and multi-provider fallback chains.
- **Package**: `packages/mcp-host/` (TypeScript MCP host).

### 6. Self-Evolving Multi-Agent Review Loop
- **4-Tier Agent Graph**: Architect → Developer → Critic → QA.
- **TextGrad Feedback Engine**: Textual backpropagation optimizing code diffs from compiler/critic critique.
- **Service**: `services/agent-orchestrator/` (Python/LangGraph/FastAPI).

---

## Repository Structure

```text
index0/
├── apps/
│   ├── ide/                    # INDEX0 Web IDE + VS Code Extension
│   └── ai/                     # Next.js platform landing portal
├── services/
│   ├── agent-orchestrator/     # Python LangGraph 4-Tier Review Loop & TextGrad
│   ├── voice-agent/            # Python LiveKit & Pipecat WebRTC service
│   ├── sandbox-manager/        # Node.js E2B Cloud & Firecracker MicroVM manager
│   ├── gateway/                # Caddy reverse proxy & Zitadel OIDC gateway
│   └── agent-host/             # Autonomous agent execution host
├── packages/
│   ├── contracts/              # Shared schemas (@index0/contracts v1)
│   ├── mcp-host/               # Model Context Protocol host (viking:// 3-tier)
│   ├── db/                     # Prisma schema & PostgreSQL 16 migrations
│   └── client-harness/         # Developer CLI & SDK client harness
├── infra/
│   ├── compose/                # Unified Docker Compose stack
│   │   ├── docker-compose.yml  # Master compose with modular includes
│   │   ├── agent-orchestrator.yml
│   │   ├── litellm.yml
│   │   ├── letta.yml
│   │   ├── livekit.yml
│   │   └── security.yml
│   ├── litellm/                # LiteLLM model routing rules
│   ├── livekit/                # LiveKit WebRTC server config
│   ├── mcp/                    # MCP canonical tool registry
│   ├── postgres/               # PostgreSQL initialization scripts
│   ├── clickhouse/             # Columnar telemetry schema
│   └── zitadel/                # Zitadel OIDC configuration
└── docs/                       # Architecture specifications & blueprints
    ├── ARCHITECT_BEFORE_ACTION.md
    ├── SYSTEM_ARCHITECTURE.md
    ├── OPENSOURCE_STACK.md
    └── ROADMAP_AND_UNIT_ECONOMICS.md
```

---

## Quickstart

### Prerequisites
- Node.js 20+
- pnpm 10+
- Python 3.11+
- Docker & Docker Compose

### 1. Initialize Environment
```bash
cp .env.example .env
pnpm install
```

### 2. Start Sovereign Infrastructure Stack
```bash
docker compose -f infra/compose/docker-compose.yml up -d
```

### 3. Run Quality Gates & Validation
```bash
# Typecheck full monorepo
pnpm typecheck

# Run unit tests across packages
pnpm test

# Run Python service test suites
cd services/agent-orchestrator && python -m pytest tests
cd ../voice-agent && python -m pytest tests
```

---

## Architecture Blueprints
- [Architect Before Action Blueprint](docs/ARCHITECT_BEFORE_ACTION.md)
- [System Architecture (4+6 Pillars)](docs/SYSTEM_ARCHITECTURE.md)
- [Open Source Stack Breakdown](docs/OPENSOURCE_STACK.md)
- [Roadmap & Unit Economics](docs/ROADMAP_AND_UNIT_ECONOMICS.md)
- [Development Rules](docs/DEVELOPMENT_RULES.md)

---

## License
Apache 2.0 / Sovereign Open Source — INDEX0 AI Research Labs.
