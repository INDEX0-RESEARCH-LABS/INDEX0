# DAY 5 TASK: OpenHands Autonomous Agent Runtime & Workbench

> **Option A Architecture**: Orchestrating off-the-shelf open-source containers with zero scratch-built backend/agent loop code.

---

## 1. Role-Wise Responsibilities

### Stream 1: Senior Tech Lead & System Architect
- **Responsibilities**:
  - Govern the OpenHands container integration (`ghcr.io/all-hands-ai/openhands:0.18`) in Docker Compose.
  - Configure sandboxed execution parameters (`SANDBOX_RUNTIME_CONTAINER_IMAGE`).
  - Author LLM provider connection profiles (Anthropic Claude, OpenAI, or local self-hosted Ollama/vLLM).
  - Supervise Day 5 End-of-Day (EOD) Integration Ceremony.
- **Target Files**: `infra/compose/docker-compose.yml`, `.env.example`, `docs/tasks/day-05.md`.

### Stream 2: Platform & Backend Systems Engineer (AI Coding Agent)
- **Responsibilities**:
  - Validate OpenHands workspace volume binding (`./workspace:/opt/workspace_base`).
  - Wire Docker socket access (`/var/run/docker.sock`) so OpenHands can spin up disposable execution containers locally with zero cloud sandbox dependencies.
  - Verify Caddy reverse proxy on port 8000 properly routes WebSocket and HTTP traffic to OpenHands on port 3000.
- **Target Files**: `infra/compose/docker-compose.yml`, `infra/gateway/Caddyfile`.

### Stream 3: Developer Experience & Client Systems Engineer (AI Coding Agent)
- **Responsibilities**:
  - Verify the OpenHands web workbench experience (integrated Monaco editor, bash terminal, browser preview, and multi-agent chat).
  - Test custom prompt instructions and system rules injection via `.openhands_instructions` or workspace configs.
- **Target Files**: `workspace/.gitkeep`, `README.md`.

---

## 2. Antigravity Agent Prompt Directives

### Directives for Stream 1 & 2 (Platform & Lead)
```text
ROLE: Platform & Backend Systems Engineer
AGENT RUNTIME: Google Antigravity Agent
OBJECTIVE: Validate and optimize OpenHands off-the-shelf container deployment and Docker runtime execution.
DEPENDENCIES: Docker Compose, OpenHands 0.18+
REQUIREMENTS:
- OpenHands runs via Docker Compose with local runtime container (docker.all-hands.dev/all-hands-ai/runtime:0.18-nikolaik).
- Docker socket mounted to allow self-contained sandbox execution without external paid microVM cloud services.
- Host workspace mounted to ./workspace.
- Caddy reverse-proxy delivers OpenHands UI on port 8000.
TESTS:
- `docker compose -f infra/compose/docker-compose.yml config`
```

---

## 3. Daily End-of-Day (EOD) Integration Ceremony

### Automated Verification Script
```bash
# 1. Validate Docker Compose configuration
docker compose -f infra/compose/docker-compose.yml config

# 2. Monorepo check
pnpm typecheck
pnpm test
```

### Day 5 Integration Scenario
1. Start stack with Docker Compose.
2. Access `http://localhost:8000` via Caddy reverse-proxy.
3. OpenHands UI loads with full editor, terminal, and agent chat.
4. Execute a prompt in OpenHands; observe runtime container execution within `./workspace`.

### Merge Gate Checklist
- [x] OpenHands container configured in `docker-compose.yml`.
- [x] Workspace volume mount verified.
- [x] Caddy reverse proxy routes port 8000 to OpenHands with WebSocket support.
- [ ] Tag created: `checkpoint/day-05`.
