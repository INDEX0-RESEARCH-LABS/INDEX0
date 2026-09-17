# DAY 5 TASK: OpenHands Autonomous Agent Runtime & Workbench

> **Option A Architecture**: Orchestrating off-the-shelf open-source containers with zero scratch-built backend/agent loop code.

---

## 1. Role-Wise Responsibilities

### Stream 1: Senior Tech Lead & System Architect (Dev 1)
- **Responsibilities**:
  - Govern the OpenHands container integration (`ghcr.io/all-hands-ai/openhands:0.18`) in Docker Compose on `index0-net`.
  - Configure sandboxed execution parameters (`SANDBOX_RUNTIME_CONTAINER_IMAGE=docker.all-hands.dev/all-hands-ai/runtime:0.18-nikolaik`).
  - Author standardized multi-provider LLM connection profiles (`infra/openhands/llm-profiles.json`) supporting Anthropic Claude, OpenAI, DeepSeek, and self-hosted Ollama/vLLM.
  - Inject authoritative autonomous agent system guardrails in `workspace/.openhands_instructions`.
  - Author automated OpenHands verification test suite in `tests/openhands/openhands.test.ts`.
  - Supervise Day 5 End-of-Day (EOD) Integration Ceremony and tag release checkpoint `checkpoint/day-05`.
- **Target Files**: `infra/compose/docker-compose.yml`, `infra/openhands/**`, `workspace/.openhands_instructions`, `tests/openhands/**`, `docs/tasks/day-05.md`.

### Stream 2: Platform & Backend Systems Engineer (AI Coding Agent: Antigravity Backend Agent / Dev 2)
- **Responsibilities**:
  - Validate and harden OpenHands container service definition in `infra/compose/docker-compose.yml`, parameterizing sandbox runtime container (`docker.all-hands.dev/all-hands-ai/runtime:0.18-nikolaik`), Docker socket mount (`/var/run/docker.sock`), workspace volume binding (`../../workspace:/opt/workspace_base`), and healthcheck.
  - Verify Caddy reverse-proxy on port 8000 enforces unbuffered streaming (`flush_interval -1`), WebSocket upgrade pass-through, and sanitized forwarding headers (`Host`, `X-Real-IP`, `X-Forwarded-For`, `X-Forwarded-Proto`) to `openhands:3000`.
  - Ensure OpenHands can dynamically spawn disposable local runtime execution containers via the mounted Docker socket with zero external cloud sandbox dependencies.
  - Author automated runtime smoke test suite in `tests/openhands/runtime-smoke.test.ts` validating container definition, Caddy routing, sovereign LLM connection profiles, workspace guardrails, and Option A compliance.
  - Enforce Option A architecture compliance (zero custom Go gateway code, zero scratch-built agent runtime loops).
- **Target Files**: `infra/compose/docker-compose.yml`, `infra/gateway/Caddyfile`, `tests/openhands/runtime-smoke.test.ts`, `docs/tasks/day-05.md`.

### Stream 3: Developer Experience & Client Systems Engineer (AI Coding Agent: Antigravity Client Agent / Dev 3)
- **Responsibilities**:
  - Implement the OpenHands client bridge service (`apps/ide/web/src/services/openhandsClient.ts`) managing multi-provider LLM profile selection (`anthropic-claude`, `openai-gpt4o`, `deepseek-coder`, `local-ollama`, `local-vllm`), gateway health checking, and system prompt formatting with injected guardrails.
  - Implement workspace instructions validator (`openhandsClient.ts`) ensuring adherence to the 6 mandatory platform rules (Contract First, Option A Compliance, Execution Sandboxing, Tests Mandatory, Zero Secrets, Small Commits).
  - Enhance the embedded OpenHands workbench viewer (`apps/ide/web/src/components/OpenHandsViewer.tsx`) with interactive model profile dropdown, live Gateway health status badge, system guardrails modal inspector, and task prompt launcher.
  - Author automated test suite in `apps/ide/web/test/openhands-workbench.test.ts` validating LLM profile schemas, offline local inference endpoints, guardrails validator, prompt formatting, and React component instantiation.
- **Target Files**: `apps/ide/web/src/services/openhandsClient.ts`, `apps/ide/web/src/components/OpenHandsViewer.tsx`, `apps/ide/web/test/openhands-workbench.test.ts`, `docs/tasks/day-05.md`.

---

## 2. Antigravity Agent Prompt Directives

### Directives for Stream 1 (Senior Tech Lead / Principal Agent / Dev 1)
```text
ROLE: Senior Tech Lead & System Architect
AGENT RUNTIME: Google Antigravity Agent (Architect Mode)
OBJECTIVE: Govern OpenHands autonomous agent runtime integration, establish multi-provider LLM connection profiles, inject workspace instructions, author verification tests, and coordinate Day 5 EOD convergence.
CONTRACT: System Blueprint (Sections 1, 2.2, 5, 7) & docs/contracts/README.md
ALLOWED FILES: infra/openhands/**, workspace/**, tests/openhands/**, package.json, docs/tasks/day-05.md, infra/compose/docker-compose.yml
DEPENDENCIES: Docker Compose, OpenHands 0.18+, Node.js 20+, pnpm 12+
REQUIREMENTS:
- Govern OpenHands container deployment via Docker Compose with local runtime container (docker.all-hands.dev/all-hands-ai/runtime:0.18-nikolaik).
- Mount Docker socket (/var/run/docker.sock) for self-contained execution without paid cloud sandbox dependencies.
- Author infra/openhands/llm-profiles.json defining provider profiles for Anthropic Claude, OpenAI, Ollama, and vLLM.
- Author workspace/.openhands_instructions specifying contract-first rules and test mandates for autonomous agent runs.
- Author tests/openhands/openhands.test.ts validating compose service definition, Caddyfile unbuffered streaming, and instruction files.
- Coordinate Day 5 EOD integration ceremony and tag checkpoint/day-05.
FORBIDDEN CHANGES: Do not introduce scratch-built agent runtime code; do not bypass Caddy gateway reverse proxy.
TESTS:
- `docker compose -f infra/compose/docker-compose.yml config`
- `pnpm test:openhands`
- `pnpm build && pnpm typecheck && pnpm test`
DEFINITION OF DONE:
- Docker Compose config validates with all 7 services including OpenHands on index0-net.
- OpenHands automated test suite passes 100% of tests.
- docs/tasks/day-05.md updated with full directives for all three streams under Schedule B.
- Checkpoint tag checkpoint/day-05 created.
```

### Directives for Stream 2 (Platform Agent / Dev 2)
```text
ROLE: Platform & Backend Systems Engineer (Dev 2)
AGENT RUNTIME: Google Antigravity Agent
OBJECTIVE: Validate and harden OpenHands container orchestration, configure local Docker execution sandboxing, verify low-latency Caddy streaming, and author runtime smoke tests for Day 5.
CONTRACT: System Blueprint (Sections 1, 2.2, 2.3) & docs/contracts/README.md
ALLOWED FILES: infra/compose/docker-compose.yml, infra/gateway/Caddyfile, tests/openhands/**, docs/tasks/day-05.md
DEPENDENCIES: Docker Compose, OpenHands 0.18+, Node.js 20+, pnpm 12+, TypeScript 5.4+
REQUIREMENTS:
- Harden OpenHands container definition in infra/compose/docker-compose.yml with local runtime container (docker.all-hands.dev/all-hands-ai/runtime:0.18-nikolaik), /var/run/docker.sock mount, host.docker.internal gateway mapping, and healthcheck.
- Verify Caddy reverse-proxy in infra/gateway/Caddyfile forwards root traffic to openhands:3000 with unbuffered streaming (flush_interval -1) and sanitized forwarding headers (Host, X-Real-IP, X-Forwarded-For, X-Forwarded-Proto).
- Verify infra/openhands/llm-profiles.json defines sovereign local inference profiles (local-ollama, local-vllm) and cloud profiles (anthropic-claude, openai-gpt4o, deepseek-coder).
- Author tests/openhands/runtime-smoke.test.ts validating container definition, Caddy routing, LLM profiles, workspace instructions, and Option A compliance.
- Verify zero custom Go gateway code and zero custom scratch-built agent runtime loops exist in the repository (Option A compliance).
FORBIDDEN CHANGES: Do not introduce scratch-built agent runtime loops; do not introduce custom Go gateway code; do not bypass Caddy gateway reverse proxy.
TESTS:
- `docker compose -f infra/compose/docker-compose.yml config`
- `pnpm test:openhands`
- `pnpm test:gateway`
- `pnpm build && pnpm typecheck && pnpm test`
DEFINITION OF DONE:
- Docker Compose config validates with all 7 services on index0-net including openhands with healthcheck.
- Both OpenHands test suites (openhands.test.ts and runtime-smoke.test.ts) pass 100%.
- docs/tasks/day-05.md updated with full Stream 2 responsibilities, directives, and checklist items.
- Full monorepo build, typecheck, and test suite pass with zero errors.
```

### Directives for Stream 3 (DevEx Agent / Dev 3)
```text
ROLE: Developer Experience & Client Systems Engineer (Dev 3)
AGENT RUNTIME: Google Antigravity Agent
OBJECTIVE: Build OpenHands client service, multi-provider profile selection, workspace guardrails injection, and enhanced embedded workbench UX for Day 5.
CONTRACT: System Blueprint (Section 2.1, 2.2) & docs/contracts/README.md
ALLOWED FILES: apps/ide/web/src/services/openhandsClient.ts, apps/ide/web/src/components/OpenHandsViewer.tsx, apps/ide/web/test/**, docs/tasks/day-05.md
DEPENDENCIES: Node.js 20+, pnpm 12+, TypeScript 5.4+, React 18+, Lucide-React
REQUIREMENTS:
- Implement apps/ide/web/src/services/openhandsClient.ts with ILLMProfile, ILLMProfilesConfig (5 models), Gateway health probing, workspace guardrails validator, and prompt injection builder.
- Enhance apps/ide/web/src/components/OpenHandsViewer.tsx with active LLM model dropdown, sovereign local inference badges, live Gateway connectivity badge, system guardrails inspector modal, and prompt launcher drawer.
- Author unit tests in apps/ide/web/test/openhands-workbench.test.ts validating profile configuration, local inference endpoints, guardrails validator, prompt formatting, and React element instantiation.
- Verify Web IDE builds and passes all 32 tests cleanly.
FORBIDDEN CHANGES: Do not hardcode internal container ports; route all traffic through Gateway (port 8000); do not introduce scratch-built agent loops.
TESTS:
- `pnpm --filter @index0/ide-web build`
- `pnpm --filter @index0/ide-web typecheck`
- `pnpm --filter @index0/ide-web test`
- `pnpm test:openhands`
- `pnpm build && pnpm typecheck && pnpm test`
DEFINITION OF DONE:
- Web IDE passes 100% of tests (32/32 tests).
- OpenHands client service correctly handles all 5 LLM connection profiles and guardrail rules.
- OpenHandsViewer renders with model profile selector and guardrails modal.
- Full Turborepo build, typecheck, and test pipelines pass across monorepo.
```

---

## 3. Daily End-of-Day (EOD) Integration Ceremony

### Timeline (Schedule B: Standard Evening Rhythm: 5:30 PM – 12:00 AM Midnight)
- **17:30 (5:30 PM)**: Evening Alignment & OpenHands Architecture Review.
- **18:00 (6:00 PM)**: Parallel Agentic Implementation (Stream 1: LLM profiles & tests, Stream 2: Runtime verification, Stream 3: Workbench UX).
- **22:30 (10:30 PM)**: Code Freeze & Pre-Integration Check (T - 90m).
- **23:00 (11:00 PM)**: Daily Convergence & Rebase onto `integration/day-05` (T - 60m).
- **23:30 (11:30 PM)**: Live OpenHands Integration Scenario & Smoke Testing (T - 30m).
- **00:00 (12:00 AM Midnight)**: Merge Gate Sign-Off & Checkpoint Tagging (`checkpoint/day-05`).

### Automated Verification Script
```bash
# 1. Validate Docker Compose configuration
docker compose -f infra/compose/docker-compose.yml config

# 2. Run OpenHands conformance test suite
pnpm test:openhands

# 3. Monorepo build, typecheck, and test suite
pnpm build
pnpm typecheck
pnpm test
```

### Day 5 Integration Scenario
1. Start stack with Docker Compose (`docker compose -f infra/compose/docker-compose.yml up -d`).
2. Access `http://localhost:8000` via Caddy reverse-proxy.
3. OpenHands UI loads with full editor, terminal, and agent chat.
4. Execute a prompt in OpenHands; observe runtime container execution within `./workspace`.
5. Verify `workspace/.openhands_instructions` informs agent behavior without external cloud dependencies.

### Merge Gate Checklist
- [x] OpenHands container configured in `docker-compose.yml` with healthcheck and parameterization.
- [x] Workspace volume mount and Docker socket access verified for local execution.
- [x] Caddy reverse proxy routes port 8000 to OpenHands with WebSocket and unbuffered SSE support.
- [x] Multi-provider LLM connection profiles authored (`infra/openhands/llm-profiles.json`).
- [x] Autonomous agent system instructions authored (`workspace/.openhands_instructions`).
- [x] OpenHands client service & multi-provider profile bridge implemented (`apps/ide/web/src/services/openhandsClient.ts`).
- [x] OpenHands embedded workbench viewer enhanced with model selector and guardrails inspector (`apps/ide/web/src/components/OpenHandsViewer.tsx`).
- [x] OpenHands automated test suite passes (`tests/openhands/openhands.test.ts`).
- [x] OpenHands runtime smoke test suite passes (`tests/openhands/runtime-smoke.test.ts`).
- [x] Option A architecture invariants verified (zero custom Go gateway or scratch agent loop code).
- [x] Tag created: `checkpoint/day-05`.

