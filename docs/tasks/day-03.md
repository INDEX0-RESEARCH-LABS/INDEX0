# DAY 3 TASK: INDEX0 IDE Foundation

## 1. Role-Wise Responsibilities

### Stream 1: Senior Tech Lead & System Architect (Dev 1)
- **Responsibilities**:
  - Author and govern authoritative contracts in `@index0/contracts/v1/agent` (`AgentEventType`, `IAgentEvent`, `IAgentPlanStep`, `IAgentRun`, `IAgentRunRequest`, `ISSEEventEnvelope`).
  - Enforce Gateway-centric client architecture: IDE clients communicate solely through the API Gateway abstraction (`/api/v1/...`).
  - Formulate client security, Bearer token injection, and CORS policies (origin `http://localhost:5173`).
  - Supervise the Day 3 End-of-Day (EOD) Integration Ceremony and tag release checkpoint `checkpoint/day-03`.
- **Target Files**: `packages/contracts/**`, `docs/tasks/day-03.md`, `services/gateway/**`.

### Stream 2: Platform & Backend Systems Engineer (AI Coding Agent: Antigravity Backend Agent / Dev 2)
- **Responsibilities**:
  - Implement idempotent database seeder in `packages/db/src/seed.ts` populating demo tenant (`Acme Software Labs`), users (`darion`, `alex`, `agent-runner`), project (`index0-core`), workspaces (`active` and `idle`), agent runs, and billing entities.
  - Author realistic mock `IAgentEvent` stream generators in `tests/fixtures/agent-events.fixture.ts` covering all 9 `AgentEventType` variants and simulating real-time SSE stream delivery.
  - Provide workspace directory trees and code content fixtures in `tests/fixtures/workspaces.fixture.ts` to power the Web IDE Explorer and Monaco editor.
  - Author verification test suites in `packages/db/test/seed.test.ts` and `tests/fixtures/fixtures.test.ts`.
- **Target Files**: `packages/db/src/seed.ts`, `packages/db/test/seed.test.ts`, `tests/fixtures/**`, `packages/db/package.json`, `package.json`.

### Stream 3: Developer Experience & Client Systems Engineer (AI Coding Agent: Antigravity Client Agent / Dev 3)
- **Responsibilities**:
  - Build the complete INDEX0 Web IDE (`apps/ide/web/`) using React, Vite, and modular presentation components:
    - **Editor**: Multi-tab code editor with line numbers, syntax view, and side-by-side diff visualizer.
    - **Explorer**: File tree navigator with folder expansion, active tab open, and search filtering.
    - **Terminal**: Streaming terminal emulator with macOS chrome controls and auto-scrolling log viewport.
    - **Agent Panel**: Interactive autonomous agent chat, plan step progress stepper, tool invocation inspection cards, and step approval confirmation controls.
    - **Workbench**: Master IDE layout assembling Explorer, Editor, Terminal, and Agent Panel.
  - Author real-time SSE stream listener and event parser (`apps/ide/web/src/services/agentStream.ts`) handling all 9 `AgentEventType` variants via Gateway client routing.
  - Scaffold the desktop VS Code extension in `apps/ide/extension/` registering `index0.startAgentRun`, `index0.openWorkbench`, and `index0.viewTelemetry`.
  - Author comprehensive automated component and stream parser test suites in `apps/ide/web/test/**` and `apps/ide/extension/test/**`.
- **Target Files**: `apps/ide/web/**`, `apps/ide/extension/**`, `tsconfig.json`.

---

## 2. Antigravity Agent Prompt Directives

### Directives for Stream 1 (Senior Tech Lead / Principal Agent / Dev 1)
```text
ROLE: Senior Tech Lead & System Architect
AGENT RUNTIME: Google Antigravity Agent (Architect Mode)
OBJECTIVE: Formulate authoritative agent contracts (@index0/contracts/v1/agent), enforce Gateway-centric client architecture and CORS policies, and lead the Day 3 EOD Convergence Ceremony.
CONTRACT: System Blueprint (Sections 1, 2.1, 2.2, 5, 7) & docs/contracts/README.md
ALLOWED FILES: packages/contracts/**, docs/tasks/day-03.md, .github/workflows/**
DEPENDENCIES: Node.js 20+, pnpm 12+, TypeScript 5.4+
REQUIREMENTS:
- Author @index0/contracts/v1/agent: AgentEventType (9 variants), IAgentEvent, IAgentPlanStep, IToolCallPayload, IToolResultPayload, ISandboxEventPayload, IAgentRun, IAgentRunRequest, ISSEEventEnvelope.
- Re-export agent module from @index0/contracts v1 and root entrypoints using ESM .js extensions.
- Formulate Gateway reverse-proxy routing and CORS specifications for Web IDE (5173) and Gateway (8080).
- Audit Stream 3 Web IDE and Stream 2 fixtures for strict contract conformance.
- Coordinate Day 3 EOD integration and sign off on checkpoint/day-03.
FORBIDDEN CHANGES: Do not bypass Gateway routing; do not modify existing v1 contracts without backward compatibility; do not bypass strict TypeScript settings.
TESTS:
- `pnpm --filter @index0/contracts build`
- `pnpm --filter @index0/contracts typecheck`
- `pnpm build`
- `pnpm test`
DEFINITION OF DONE:
- @index0/contracts exports complete agent models with declaration files.
- docs/tasks/day-03.md contains full directives and timeline for all three streams.
- Turborepo pipeline builds and passes all tests across all packages.
- Checkpoint tag checkpoint/day-03 created.
```

### Directives for Stream 2 (Platform Agent / Dev 2)
```text
ROLE: Platform & Backend Systems Engineer (Dev 2)
AGENT RUNTIME: Google Antigravity Agent
OBJECTIVE: Implement database seeder in packages/db/src/seed.ts, realistic mock IAgentEvent stream generators, and workspace file tree fixtures in tests/fixtures/** for Day 3.
CONTRACT: @index0/contracts/v1/project, @index0/contracts/v1/agent, @index0/contracts/v1/auth, @index0/contracts/v1/billing
ALLOWED FILES: packages/db/**, tests/fixtures/**, docs/tasks/day-03.md, package.json
DEPENDENCIES: Node.js 20+, pnpm 12+, TypeScript 5.4+, Prisma, @index0/contracts
REQUIREMENTS:
- Implement idempotent database seeder in packages/db/src/seed.ts populating demo organization, users (admin, member, agent), project, workspaces, agent runs, agent events, and billing entities.
- Author tests/fixtures/agent-events.fixture.ts generating realistic IAgentEvent sequences covering all 9 AgentEventType variants and simulating async SSE streaming.
- Author tests/fixtures/workspaces.fixture.ts generating file tree nodes and code contents for IDE Explorer and Editor testing.
- Author unit tests in packages/db/test/seed.test.ts and tests/fixtures/fixtures.test.ts verifying contract conformance and generator outputs.
- Wire db:seed npm script into packages/db/package.json and root package.json.
FORBIDDEN CHANGES: Do not bypass @index0/contracts; do not perform non-idempotent seed operations that fail on duplicate runs.
TESTS:
- `pnpm --filter @index0/db test`
- `node --test tests/fixtures/**/*.test.ts`
- `pnpm test`
DEFINITION OF DONE:
- Database seed script executes cleanly and idempotently.
- Fixture test suite validates all 9 AgentEventType variants and file tree fixtures.
- Full Turborepo build, typecheck, and test pipelines pass across monorepo.
```

### Directives for Stream 3 (DevEx Agent / Dev 3)
```text
ROLE: Developer Experience & Client Systems Engineer
AGENT RUNTIME: Google Antigravity Agent
OBJECTIVE: Build the complete INDEX0 Web IDE workbench, real-time SSE agent stream listener, and VS Code extension scaffolding for Day 3.
CONTRACT: @index0/contracts/v1/api, @index0/contracts/v1/agent, @index0/contracts/v1/project
ALLOWED FILES: apps/ide/**, tsconfig.json, docs/tasks/day-03.md
DEPENDENCIES: Node.js 20+, pnpm 12+, TypeScript 5.4+, React 18+, Vite, Lucide-React
REQUIREMENTS:
- Implement apps/ide/web with Explorer, Multi-Tab Editor with diff view, Terminal, and Agent Panel.
- Implement AgentPanel with plan step tracker (pending, in_progress, completed, failed), tool inspection cards, and user step approval confirmation buttons.
- Implement agentStream.ts supporting all 9 AgentEventType variants via Gateway client abstraction (/api/v1/...).
- Scaffold apps/ide/extension with index0.startAgentRun, index0.openWorkbench, index0.viewTelemetry commands.
- Author automated tests verifying component renders, event stream transformations, and extension registration.
FORBIDDEN CHANGES: Do not hardcode internal service ports (4001, 4002); use API Gateway routing (/api/v1/...); do not bypass strict TypeScript.
TESTS:
- `pnpm --filter @index0/ide-web build`
- `pnpm --filter @index0/ide-web typecheck`
- `pnpm --filter @index0/ide-web test`
- `pnpm --filter @index0/ide-extension build`
- `pnpm --filter @index0/ide-extension typecheck`
- `pnpm --filter @index0/ide-extension test`
DEFINITION OF DONE:
- Web IDE builds production bundle cleanly and all components render with 0 errors.
- All 9 AgentEventType variants parse cleanly in agentStream.ts.
- VS Code extension compiles and registers commands.
- Full Turborepo pipeline passes across all 6 workspace packages.
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
- [x] Database seeder (`packages/db/src/seed.ts`) and `db:seed` scripts verified.
- [x] Mock agent event stream and workspace fixtures (`tests/fixtures/**`) verified across all 9 `AgentEventType` variants.
- [x] `apps/ide/web` builds production bundle without errors.
- [x] `apps/ide/extension` compiles cleanly.
- [x] SSE event parser correctly handles all `AgentEventType` variants.
- [x] Tag created: `checkpoint/day-03`.
