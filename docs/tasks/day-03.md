# DAY 3 TASK: INDEX0 IDE Foundation

## 1. Role-Wise Responsibilities

### Stream 1: Senior Tech Lead & System Architect
- **Responsibilities**:
  - Enforce Gateway-centric client architecture: IDE clients communicate solely through the API Gateway.
  - Review client security, JWT token storage, and CORS policies.
  - Formulate API contracts for workspace initialization and agent event streaming.
  - Supervise the Day 3 End-of-Day (EOD) Integration Ceremony.

### Stream 2: Platform & Backend Systems Engineer (AI Coding Agent: Antigravity Backend Agent)
- **Responsibilities**:
  - Implement workspace and project lifecycle mock endpoints or services.
  - Configure CORS middleware and SSE support in backing service skeletons.
  - Provide database seeders for demo projects and organizations.
- **Target Files**: `packages/db/src/seed.ts`, `services/gateway/middleware/cors.go`.

### Stream 3: Developer Experience & Client Systems Engineer (AI Coding Agent: Antigravity Client Agent)
- **Responsibilities**:
  - Build the INDEX0 Web IDE (`apps/ide/web/`) using React/Vite and Monaco Editor.
  - Implement modular UI components:
    - **Editor**: Multi-tab code editor with syntax highlighting and diff visualizer.
    - **Explorer**: File tree navigator respecting workspace boundaries.
    - **Terminal**: Web terminal component.
    - **Agent Panel**: Interactive chat, plan inspection, and step confirmation.
    - **Agent Events**: Real-time SSE listener parsing `IAgentEvent`.
  - Scaffold VS Code Extension architecture in `apps/ide/extension/`.
- **Target Files**: `apps/ide/**`.

---

## 2. Antigravity Agent Prompt Directives

### Directives for Stream 3 (DevEx Agent)
```text
ROLE: Developer Experience & Client Systems Engineer
AGENT RUNTIME: Google Antigravity Agent
OBJECTIVE: Build the INDEX0 IDE Web presentation tier and extension scaffolding.
CONTRACT: @index0/contracts/v1/api, @index0/contracts/v1/agent, @index0/contracts/v1/project
ALLOWED FILES: apps/ide/**
DEPENDENCIES: react, vite, monaco-editor, lucide-react, rxjs
REQUIREMENTS:
- Implement Editor, Explorer, Terminal, Agent Panel, and Agent Events viewer.
- Connect all network client calls through the Gateway client abstraction (base URL configurable).
- Implement SSE event listener subscribing to /agents/runs/:id/events and mapping to IAgentEvent.
- Provide VS Code extension skeleton in apps/ide/extension/ with commands to trigger agent runs.
FORBIDDEN CHANGES: Do not hardcode internal service ports (e.g. 4001, 4002); use API Gateway routing.
TESTS: Component render tests and event stream parser tests.
```

### Directives for Stream 2 (Platform Agent)
```text
ROLE: Platform & Backend Systems Engineer
AGENT RUNTIME: Google Antigravity Agent
OBJECTIVE: Provide workspace seeding data and test event fixtures for IDE development.
CONTRACT: @index0/contracts/v1/project, @index0/contracts/v1/agent
ALLOWED FILES: packages/db/src/seed.ts, tests/fixtures/**
REQUIREMENTS:
- Generate realistic mock IAgentEvent streams for agent planning, tool calling, and completion.
- Write database seeder populating test organization, user, project, and workspace.
TESTS: Run seed script and verify database population.
```

---

## 3. Daily End-of-Day (EOD) Integration Ceremony

### Timeline (Intensive Marathon: 10:00 AM – 12:00 AM Midnight)
- **10:00 AM**: Alignment, IDE contracts & prompt dispatch.
- **10:30 AM**: Sprint Block 1 — INDEX0 IDE workbench & mock server fixtures.
- **14:00 PM**: Midday checkpoint & rebase sync.
- **15:00 PM**: Sprint Block 2 — Real-time event streams, terminal UI & state machine.
- **22:30 (10:30 PM)**: Code Freeze on `feature/day-03-ide` and `feature/day-03-fixtures`.
- **23:00 (11:00 PM)**: Rebase & merge onto `integration/day-03`.
- **23:30 (11:30 PM)**: Full test suite and live IDE integration scenario.
- **00:00 (12:00 AM Midnight)**: Senior Tech Lead sign-off & checkpoint tagging (`checkpoint/day-03`).

### Automated Verification Script
```bash
# 1. Full typecheck across apps and packages
pnpm typecheck

# 2. Linting
pnpm lint

# 3. Web IDE build
pnpm --filter @index0/ide-web build

# 4. Extension compilation check
pnpm --filter @index0/ide-extension build
```

### Day 3 Integration Scenario
1. Launch Web IDE in development mode (`pnpm --filter @index0/ide-web dev`).
2. Load mock workspace file tree; verify directory navigation works without errors.
3. Simulate incoming SSE agent event stream; verify Agent Panel visualizes plan steps, tool calls, and completion indicators.
4. Verify no direct cross-origin requests bypass the API Gateway abstraction.

### Merge Gate Checklist
- [ ] `apps/ide/web` builds production bundle without errors.
- [ ] `apps/ide/extension` compiles cleanly.
- [ ] SSE event parser correctly handles all `AgentEventType` variants.
- [ ] Tag created: `checkpoint/day-03`.
