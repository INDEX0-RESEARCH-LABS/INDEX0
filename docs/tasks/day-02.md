# DAY 2 TASK: E2B Sandbox Manager

## 1. Role-Wise Responsibilities

### Stream 1: Senior Tech Lead & System Architect (Dev 1)
- **Responsibilities**:
  - Author and govern authoritative contracts in `@index0/contracts/v1/sandbox` (`ISandboxRequest`, `ISandboxExecutionResult`, `SandboxLanguage`, `ISandboxHealthResponse`) and `@index0/contracts/v1/api` (`IApiResponse`, `IProblemDetails`).
  - Establish microVM resource quotas (30,000ms default timeout, 300,000ms max timeout, 1024MB max memory) and safety standards.
  - Review cleanup lifecycle implementation in `services/sandbox-manager` to verify zero leak guarantees in `finally` blocks.
  - Coordinate the Day 2 End-of-Day (EOD) Integration Ceremony and tag release checkpoint `checkpoint/day-02`.
- **Target Files**: `packages/contracts/**`, `docs/tasks/day-02.md`, `services/sandbox-manager/**`.

### Stream 2: Platform & Backend Systems Engineer (AI Coding Agent: Antigravity Backend Agent / Dev 2)
- **Responsibilities**:
  - Build `services/sandbox-manager/` using Express, TypeScript, and the E2B SDK (`@e2b/code-interpreter`).
  - Implement `POST /execute` handling Python, TypeScript, and Bash executions.
  - Enforce the strict execution lifecycle:
    ```text
    create → execute → capture result → telemetry → cleanup
    ```
  - **MANDATORY**: Ensure sandbox cleanup runs unconditionally in a `finally` block to guarantee 0 dangling microVM sessions.
  - Expose `GET /health` endpoint returning `ISandboxHealthResponse`.
  - Author comprehensive test suite verifying health, multi-language execution, quota limits, and lifecycle teardown guarantees.
- **Target Files**: `services/sandbox-manager/**`.

### Stream 3: Developer Experience & Client Systems Engineer (AI Coding Agent: Antigravity Client Agent / Dev 3)
- **Responsibilities**:
  - Author the authoritative contract conformance test suite in `tests/contracts/sandbox.test.ts` validating requests, results, quotas, health checks, and RFC 7807 problem details against `@index0/contracts`.
  - Build the client developer execution harness SDK and CLI runner in `packages/client-harness` (`SandboxClient`, `index0-sandbox` CLI with ANSI output formatting).
  - Scaffold the `apps/ide/web` workspace package with strict TypeScript configuration extending `tsconfig.base.json`.
  - Implement presentation tier visualizers: `ExecutionResult` (exit codes, status badges, diagnostics, duration), `TerminalViewer` (macOS chrome, active environment pills, streaming state, auto-scrolling log view), and `SandboxRunnerDemo`.
  - Author component verification test suite in `apps/ide/web/test/components.test.ts`.
- **Target Files**: `tests/contracts/**`, `packages/client-harness/**`, `apps/ide/web/**`, `package.json`, `tsconfig.json`.

---

## 2. Antigravity Agent Prompt Directives

### Directives for Stream 1 (Senior Tech Lead / Principal Agent / Dev 1)
```text
ROLE: Senior Tech Lead & System Architect
AGENT RUNTIME: Google Antigravity Agent (Architect Mode)
OBJECTIVE: Formulate authoritative sandbox contracts (@index0/contracts/v1/sandbox, api), establish microVM resource quotas, review E2B cleanup guarantees, and lead the Day 2 EOD Convergence Ceremony.
CONTRACT: System Blueprint (Sections 2.3, 5, 7) & docs/contracts/README.md
ALLOWED FILES: packages/contracts/**, docs/tasks/day-02.md, .github/workflows/**
DEPENDENCIES: Node.js 20+, pnpm 12+, TypeScript 5.4+
REQUIREMENTS:
- Author @index0/contracts/v1/sandbox: SandboxLanguage, ISandboxRequest, ISandboxExecutionResult, ISandboxQuotas, ISandboxHealthResponse.
- Author @index0/contracts/v1/api: IApiResponse<T>, IProblemDetails (RFC 7807).
- Re-export new modules from @index0/contracts entrypoint.
- Define microVM resource limits: default timeout 30,000ms, max 300,000ms, max 1024MB RAM.
- Audit Stream 2 Sandbox Manager implementation for mandatory `try/catch/finally` teardown.
- Coordinate Day 2 EOD convergence and sign off on checkpoint/day-02.
FORBIDDEN CHANGES: Never omit the `finally` cleanup block; do not bypass strict TypeScript settings.
TESTS:
- `pnpm --filter @index0/contracts build`
- `pnpm --filter @index0/contracts typecheck`
- `pnpm test`
DEFINITION OF DONE:
- All contracts compile cleanly with declaration files.
- docs/tasks/day-02.md contains full directives and timeline for all three streams.
- Full monorepo passes CI quality gates and Day 2 integration scenario succeeds.
- Checkpoint tag checkpoint/day-02 created.
```

### Directives for Stream 2 (Platform Agent / Dev 2)
```text
ROLE: Platform & Backend Systems Engineer (Dev 2)
AGENT RUNTIME: Google Antigravity Agent
OBJECTIVE: Implement the E2B Sandbox Manager service with Express, TypeScript, E2B SDK integration, guaranteed finally cleanup lifecycle, and comprehensive unit tests for Day 2.
CONTRACT: @index0/contracts/v1/sandbox, @index0/contracts/v1/api
ALLOWED FILES: services/sandbox-manager/**, docs/tasks/day-02.md
DEPENDENCIES: Node.js 20+, pnpm 12+, Express 4+, TypeScript 5.4+, zod, dotenv, cors, supertest
REQUIREMENTS:
- Bootstrap services/sandbox-manager with strict TypeScript settings extending tsconfig.base.json.
- Implement ISandboxProvider abstraction with E2BSandboxProvider and MockSandboxProvider.
- Implement ExecutionService enforcing lifecycle: create -> execute -> capture result -> telemetry -> cleanup.
- MANDATORY: try/catch/finally with microVM session termination inside finally.
- Implement POST /execute matching ISandboxRequest, enforcing SANDBOX_QUOTAS, and returning IApiResponse<ISandboxExecutionResult>.
- Implement GET /health returning ISandboxHealthResponse (status: "healthy", activeSandboxes: number, timestamp).
- Implement RFC 7807 problem details error handling for validation failures.
- Author automated tests verifying health, execution across languages, and guaranteed cleanup on failure/timeout.
FORBIDDEN CHANGES: Never omit the finally cleanup block; never execute untrusted code directly on host OS; do not modify contracts in packages/contracts/src.
TESTS:
- `pnpm --filter @index0/sandbox-manager build`
- `pnpm --filter @index0/sandbox-manager typecheck`
- `pnpm --filter @index0/sandbox-manager test`
DEFINITION OF DONE:
- services/sandbox-manager builds and typechecks cleanly under Turborepo.
- Unit tests pass with 100% success verifying guaranteed session teardown in finally.
- POST /execute and GET /health endpoints conform strictly to @index0/contracts.
- Day 2 integration scenario passes and merge gate checklist is satisfied.
```

### Directives for Stream 3 (DevEx Agent / Dev 3)
```text
ROLE: Developer Experience & Client Systems Engineer
AGENT RUNTIME: Google Antigravity Agent
OBJECTIVE: Build contract conformance test suite, client execution harness CLI, and Web IDE execution result visualizer and terminal viewer for Day 2.
CONTRACT: @index0/contracts/v1/sandbox, @index0/contracts/v1/api
ALLOWED FILES: tests/contracts/**, packages/client-harness/**, apps/ide/web/**, package.json, tsconfig.json, docs/tasks/day-02.md
DEPENDENCIES: Node.js 20+, pnpm 12+, TypeScript 5.4+, React, Vite, Lucide-React
REQUIREMENTS:
- Implement tests/contracts/sandbox.test.ts testing request/response schemas, quotas, and RFC 7807 problem details.
- Build packages/client-harness providing SandboxClient SDK and CLI with ANSI result formatting.
- Scaffold apps/ide/web workspace package extending tsconfig.base.json.
- Implement ExecutionResult.tsx visualizer displaying exit codes, duration, stdout, stderr, and status badges.
- Implement TerminalViewer.tsx terminal component with chrome window controls and auto-scrolling log view.
- Author automated tests verifying component export integrity, element creation, and contract alignment.
FORBIDDEN CHANGES: Do not connect directly to raw internal microservice ports from frontend (route via Gateway abstraction); do not modify contracts in packages/contracts/src.
TESTS:
- `pnpm test:contracts`
- `pnpm --filter @index0/client-harness test`
- `pnpm --filter @index0/ide-web build`
- `pnpm --filter @index0/ide-web typecheck`
- `pnpm --filter @index0/ide-web test`
DEFINITION OF DONE:
- All contract tests pass without deviation from @index0/contracts.
- Client harness CLI executes and formats sandbox results cleanly.
- Web IDE visualizer and terminal components compile and pass verification tests.
- Full Turborepo pipeline across all workspace packages succeeds with 0 errors.
```

---

## 3. Daily End-of-Day (EOD) Integration Ceremony

### Timeline (Intensive Marathon: 10:00 AM – 12:00 AM Midnight)
- **10:00 AM**: Alignment, sandbox contracts & prompt dispatch.
- **10:30 AM**: Sprint Block 1 — Sandbox manager & client harness setup.
- **14:00 PM**: Midday checkpoint & rebase sync.
- **15:00 PM**: Sprint Block 2 — E2B execution, telemetry hooks & timeout handling.
- **22:30 (10:30 PM)**: Code Freeze on `feature/day-02-sandbox` and `feature/day-02-client-harness`.
- **23:00 (11:00 PM)**: Rebase & merge onto `integration/day-02`.
- **23:30 (11:30 PM)**: Automated testing & live sandbox integration scenario.
- **00:00 (12:00 AM Midnight)**: Senior Tech Lead sign-off & checkpoint tagging (`checkpoint/day-02`).

### Automated Verification Script
```bash
# 1. Monorepo lint and typecheck
pnpm lint
pnpm typecheck

# 2. Sandbox Manager unit tests
pnpm --filter @index0/sandbox-manager test

# 3. Contract conformance tests
pnpm test -- tests/contracts/sandbox.test.ts

# 4. Service build
pnpm --filter @index0/sandbox-manager build
```

### Day 2 Integration Scenario
1. Start Sandbox Manager service (`pnpm --filter @index0/sandbox-manager dev`).
2. Verify `GET /health` returns HTTP 200.
3. Send test execution payload:
   ```bash
   curl -X POST http://localhost:4001/execute \
     -H "Content-Type: application/json" \
     -d '{"id":"test-001","code":"print(2+2)","language":"python","timeoutMs":10000}'
   ```
4. Verify response contains `stdout: "4\n"` and exit code 0.
5. Trigger simulated execution timeout; verify cleanup hook fires and leaves 0 dangling microVM sessions.

### Merge Gate Checklist
- [x] `services/sandbox-manager` builds cleanly.
- [x] Guaranteed cleanup verified via unit and live tests.
- [x] Contract tests pass without deviation from `@index0/contracts` (`tests/contracts/sandbox.test.ts`).
- [x] Client harness CLI and Web IDE visualizer components built and verified.
- [x] Tag created: `checkpoint/day-02`.
