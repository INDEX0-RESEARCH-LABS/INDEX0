# BUILD Architecture — INDEX0 AI

The **BUILD** subsystem encompasses the developer interface, the autonomous agent runtime, safe sandbox execution, and Model Context Protocol (MCP) host tooling.

> **Option A Architecture**: Built using off-the-shelf open-source containers (OpenHands Workbench, local Docker execution sandboxes, Caddy gateway) with zero custom scratch-built microservices.

---

## 1. Components

```text
┌─────────────────────────────────────────────────────────────┐
│                          CLIENTS                            │
│                 (Web Browser / Developers)                  │
└──────────────────────────────┬──────────────────────────────┘
                               │ HTTP / WebSocket (Port 8000)
                               ▼
┌─────────────────────────────────────────────────────────────┐
│                         API GATEWAY                         │
│                  (Caddy Declarative Proxy)                  │
└──────────────────────────────┬──────────────────────────────┘
                               │ Private Network (index0-net)
                               ▼
┌─────────────────────────────────────────────────────────────┐
│                    OPENHANDS WORKBENCH                      │
│             (All-in-One Autonomous Dev Platform)            │
│                                                             │
│   ┌─────────────────────┐       ┌──────────────────────┐    │
│   │ Integrated Monaco   │◄─────►│ Interactive Bash     │    │
│   │ Code Editor & Diff  │       │ Terminal Emulator    │    │
│   └─────────────────────┘       └──────────────────────┘    │
│   ┌─────────────────────┐       ┌──────────────────────┐    │
│   │ Stateful Multi-Agent│◄─────►│ File Explorer &      │    │
│   │ Execution Loop      │       │ Workspace Tree       │    │
│   └──────────┬──────────┘       └──────────────────────┘    │
└──────────────┼──────────────────────────────┬───────────────┘
               │                              │
               ▼                              ▼
┌─────────────────────────────┐┌──────────────────────────────┐
│   LOCAL DOCKER RUNTIME      ││        STANDARD MCP          │
│    (Isolated Container)     ││    (Filesystem & Ripgrep)    │
│                             ││                              │
│   • Disposable Environments ││   • ripgrep workspace search │
│   • CPU / Memory Bounded    ││   • Safe file read & edit    │
│   • Zero Cloud Dependency   ││   • Native bash tooling      │
└─────────────────────────────┘└──────────────────────────────┘
```

---

## 2. Component Specifications

### 2.1 API Gateway (`infra/gateway/Caddyfile`)
Declarative reverse-proxy powered by Caddy on port 8000:
- Routes requests to OpenHands (`/`), Zitadel auth (`/auth`), Temporal (`/temporal`), and ClickHouse (`/analytics`).
- Automatic WebSocket and Server-Sent Events (SSE) pass-through.
- Standard security headers (`X-Frame-Options`, `X-Content-Type-Options`).
- Zero custom Go gateway code.

### 2.2 OpenHands Workbench (`infra/compose/docker-compose.yml`)
The execution core for autonomous programming provided by `ghcr.io/all-hands-ai/openhands`:
- Pre-built autonomous agent framework with planning, execution, and self-correction loops.
- Integrated Web UI with code editor, terminal, file tree, and chat panel.
- Communicates directly with LLMs (Claude, GPT, or local self-hosted Ollama/vLLM models).
- Binds to host directory `./workspace` for persistent code development.

### 2.3 Local Execution Sandboxing
- Sandboxed micro-execution is powered by the local Docker runtime container (`docker.all-hands.dev/all-hands-ai/runtime:0.18-nikolaik`).
- Uses host Docker daemon (`/var/run/docker.sock`) to spawn ephemeral execution environments.
- Self-contained and sovereign: does not require paid external microVM cloud services.

### 2.4 Model Context Protocol (MCP) & Tooling
- Built-in OpenHands tools: ripgrep code search, file inspection, directory listing, and bash execution.
- Extensible via standard MCP servers (e.g. `@modelcontextprotocol/server-filesystem`).
- Confined to the mounted workspace root to prevent path traversal outside workspace boundaries.
