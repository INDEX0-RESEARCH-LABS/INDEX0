# INDEX0

INDEX0 is a self-hosted multi-agent software engineering platform with a terminal CLI, sandboxed code execution, context compression, Git-native agent coordination, and a 4-tier automated review loop.

```text
 ▄           ▄                         ▄  
 █   █▀▀▄ █▀▀█ █▀▀█ █  █ █▀▀█    █▀▀█  █  
 █   █  █ █  █ █▀▀▀  ▀▀  █/ █    █▀▀█  █  
▀▀▀  ▀  ▀ ▀▀▀▀ ▀▀▀▀ █  █ ▀▀▀▀    ▀  ▀ ▀▀▀ 
```

---

## Demo

> **[VIDEO DEMO LINK HERE]** — replace this line with a link to your recorded walkthrough.

Run the local microbenchmark (no credentials required) to see the platform in action:

```bash
# After installing (see Quickstart), run the local benchmark suite
index0 benchmark
```

---

## What it does

- **Terminal CLI** (`index0`): interactive TUI for coding tasks, web search, worktree management, and sandboxed agent runs.
- **4-tier review loop**: Architect, Developer, Critic, and QA stages implemented in `services/agent-orchestrator` via LangGraph.
- **Context compression** (`viking://`): hierarchical L0/L1/L2 codebase ingestion; measured transform ratio on local string transforms, not end-to-end task results.
- **Git-native agent coordination** (GNAP): multi-agent consensus recorded in `.gnap/` directory inside Git history.
- **Sandboxed execution**: code runs in E2B cloud sandboxes or Firecracker microVMs (provider selectable via `SANDBOX_PROVIDER` env var).
- **Model routing**: LiteLLM proxy routes requests to OpenAI, Anthropic, or any compatible backend.
- **Web IDE**: `code-server` (Code-OSS in browser) served via Docker Compose.

---

## Architecture

```text
┌────────────────────────────────────────────────────────────────────────────────────────┐
│                           INDEX0 PLATFORM ARCHITECTURE                                 │
├────────────────────────────────────────────────────────────────────────────────────────┤
│ 1. Voice & Multimodal Layer    → LiveKit Agents + Pipecat (WebRTC)   [in progress]    │
│ 2. Edge Autocomplete Layer     → TabbyML + vLLM (local inference)    [in progress]    │
│ 3. MicroVM Sandbox & Probes    → Firecracker + E2B + perf/TSan       [partial]        │
│ 4. Git-Native Agent Protocol   → GNAP + Postcard (Git-native state)  [working]        │
│ 5. Context Compression         → OpenViking (viking://) + LiteLLM    [working]        │
│ 6. Review Loop & MCTS Search   → LangGraph 4-Tier + MCTS + TextGrad  [partial]        │
│ 7. Autonomous Reverse-Engineer → Crown Jewel Extractor               [in progress]    │
├────────────────────────────────────────────────────────────────────────────────────────┤
│                             PLATFORM PILLARS                                           │
│  BUILD: Cloud IDE (code-server) & Agent Canvas (ACI)                                  │
│  SHIP:  Temporal.io Workflows + ClickHouse Telemetry + Semgrep/Trivy Gates            │
│  SELL:  OpenMeter Token Metering + Lago Usage-Based Subscriptions + Razorpay/Stripe   │
│  GROW:  PostHog Analytics + Twenty CRM                                                │
└────────────────────────────────────────────────────────────────────────────────────────┘
```

---

## Quickstart

### Prerequisites
- Node.js 20+
- pnpm 12+
- Python 3.11+
- Docker and Docker Compose

### 1. Install the CLI

```bash
# Linux & macOS (unverified — install.sh at this URL has not been confirmed live)
curl -fsSL https://ai.index0.in/install.sh | bash

# Windows PowerShell (unverified)
irm https://ai.index0.in/install.ps1 | iex
```

Alternatively, build from source (verified):
```bash
pnpm install
pnpm --filter @index0/client-harness build
# binary is now at packages/client-harness/dist/cli.js
node packages/client-harness/dist/cli.js --help
```

### 2. Authenticate

```bash
# GitHub Device Flow login
index0 login
```

### 3. Start the Infrastructure

```bash
# Copy environment template
cp .env.example .env

# Start foundational stack (PostgreSQL, ClickHouse, Caddy, Zitadel, Temporal)
pnpm run infra:up

# Or start all capability layers including LiteLLM, Letta, LiveKit, TabbyML, code-server
pnpm run infra:all:up
```

### 4. Launch the CLI

```bash
# Interactive coding TUI (default)
index0

# Stream a prompt to the configured LLM via LiteLLM
index0 prompt "Explain the GNAP protocol in this repo"

# Run the 4-tier review loop on a task
index0 review "Implement RBAC permissions" --worktree --commit

# Dissect an open-source repository
index0 re-engineer https://github.com/xyflow/xyflow "Extract spatial QuadTree"
```

### Run on a low-spec machine (CLI only, hosted model)

No Docker stack required. Set only the model keys you have:

```bash
# 1. Copy env template
cp .env.example .env

# 2. Edit .env and set your API key (do NOT commit real keys)
#    The relevant variables from .env.example are:
#      OPENAI_API_KEY=your_openai_api_key_placeholder
#      ANTHROPIC_API_KEY=your_anthropic_api_key_placeholder
#      LLM_MODEL=anthropic/claude-3-5-sonnet-20241022  (or openai/gpt-4o)
#      LLM_API_KEY=your_llm_api_key_placeholder

# 3. Build the CLI from source
pnpm install
pnpm --filter @index0/client-harness build

# 4. Run the CLI directly (no full Docker stack needed for basic prompts)
node packages/client-harness/dist/cli.js prompt "Hello from INDEX0"

# 5. Run the local microbenchmark (no credentials required)
node packages/client-harness/dist/cli.js benchmark
```

---

## Local Development and Quality Gates

### 1. Initialize Monorepo
```bash
cp .env.example .env
pnpm install
```

### 2. Start Infrastructure
```bash
# Start master stack + all capability layers:
pnpm run infra:all:up

# Or foundational stack only:
pnpm run infra:up
```

### 3. Run Quality Gates and Automated Tests

```bash
# 1. Run diagnostic system healthcheck
./scripts/healthcheck.sh

# 2. Audit open-source license compliance
bash scripts/license-check.sh

# 3. Typecheck full monorepo
pnpm typecheck

# 4. Run monorepo test suites
pnpm test

# 5. Run Python service test suites
cd services/agent-orchestrator && pytest tests/
cd ../voice-agent && pytest tests/

# 6. Run client harness tests
cd packages/client-harness && pnpm test
```

---

## Benchmarks

Official SWE-bench, Terminal-Bench, and AiderBench evaluation runs are **in progress**. No results have been published yet.

The only measured value published at this time is the context compression transform ratio: **34.3% to 91.0% measured transform ratio on local string transforms, not end-to-end task results**.

For the full claim disposition and what would be required before any result is published, see:
- [`benchmarks/CLAIM_AUDIT.md`](benchmarks/CLAIM_AUDIT.md)
- [`benchmarks/REPRODUCIBILITY.md`](benchmarks/REPRODUCIBILITY.md)

---

## Repository Structure

```text
INDEX0/
├── apps/
│   ├── ai/                     # Next.js 15 Platform Portal, Marketing, Downloads & Docs
│   └── ide/
│       ├── web/                # Browser IDE Workbench (Monaco, Tabby, Voice, SSE)
│       └── extension/          # Desktop VS Code extension
├── services/
│   ├── agent-orchestrator/     # LangGraph 4-Tier Review, MCTS, Reverse-Engineering
│   │   ├── src/graph/mcts/     # Monte Carlo Tree Search engine
│   │   ├── src/reengineering/  # Crown Jewel Extractor & Code Modernizer
│   │   └── src/llm/            # LiteLLM Client with JSON Schema Extraction
│   ├── sandbox-manager/        # Firecracker MicroVMs, E2B Cloud & Empirical Probes
│   │   └── src/sandbox/probes/ # ThreadSanitizer, Linux perf stat & Fuzzer analyzers
│   └── voice-agent/            # Python LiveKit & Pipecat WebRTC Voice Service
├── packages/
│   ├── client-harness/         # Standalone `index0` Developer CLI & TUI engine
│   ├── contracts/              # Authoritative TypeScript schemas (@index0/contracts v1)
│   ├── mcp-host/               # Model Context Protocol host (viking:// 3-tier)
│   └── db/                     # PostgreSQL 16 schema, migrations, and Prisma client
├── infra/
│   ├── code-server/            # Containerized Code-OSS Web Dockerfile & config
│   ├── compose/                # Unified Docker Compose stacks
│   ├── gateway/                # Caddy API reverse proxy
│   ├── litellm/                # LiteLLM routing rules & budget caps
│   ├── livekit/                # LiveKit WebRTC server configuration
│   ├── tabby/                  # TabbyML configuration for edge code autocomplete
│   ├── zitadel/                # Zitadel sovereign identity configuration
│   ├── clickhouse/             # Columnar telemetry schema
│   ├── openmeter/              # OpenMeter event metering config
│   └── lago/                   # Lago subscription plan catalog
├── scripts/
│   ├── healthcheck.sh          # 10-point stack readiness diagnostic
│   ├── license-check.sh        # License boundary enforcement guard
│   └── empirical-benchmark.ts  # Quantitative benchmark runner
├── benchmarks/                 # Benchmark framework, claim audit, reproducibility guide
└── docs/                       # Documentation & blueprints
    ├── SYSTEM_ARCHITECTURE.md
    ├── OPENSOURCE_STACK.md
    └── deployment/AZURE_SETUP_AND_MAINTENANCE_GUIDE.md
```

---

## Documentation
- **[System Architecture Blueprint](docs/SYSTEM_ARCHITECTURE.md)**
- **[Azure Production Setup & Maintenance Guide](docs/deployment/AZURE_SETUP_AND_MAINTENANCE_GUIDE.md)**
- **[Development Rules](docs/DEVELOPMENT_RULES.md)**
- **[Benchmark Claim Audit](benchmarks/CLAIM_AUDIT.md)**
- **[Proof of Status](PROOF_STATUS.md)**

---

## License & Proprietary Rights
**Proprietary & Confidential Commercial License — All Rights Reserved 2026 INDEX0 RESEARCH LABS.**  
This software, source code, cognitive architectures, and algorithms are proprietary to INDEX0 RESEARCH LABS. Unauthorized copying, reproduction, distribution, reverse engineering, model distillation/scraping, or commercial hosting is strictly prohibited. See [`LICENSE`](LICENSE) for complete legal terms.
