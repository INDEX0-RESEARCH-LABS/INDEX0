# DAY 2 TASK: E2B Sandbox Manager

## 1. Role-Wise Responsibilities

### Stream 1: Senior Tech Lead & System Architect
- **Responsibilities**:
  - Enforce and review `@index0/contracts/v1/sandbox` (`ISandboxRequest`, `ISandboxExecutionResult`).
  - Define memory, CPU, and execution timeout quotas for microVMs.
  - Review cleanup lifecycle implementation and verify zero leak guarantees in `finally` blocks.
  - Coordinate the Day 2 End-of-Day (EOD) Integration Ceremony.

### Stream 2: Platform & Backend Systems Engineer (AI Coding Agent: Antigravity Backend Agent)
- **Responsibilities**:
  - Build `services/sandbox-manager/` using Express, TypeScript, and the E2B SDK.
  - Implement `POST /execute` handling Python, TypeScript, and Bash executions.
  - Enforce the strict execution lifecycle:
    ```text
    create → execute → capture result → telemetry → cleanup
    ```
  - **MANDATORY**: Ensure sandbox cleanup runs unconditionally in a `finally` block.
  - Expose `GET /health` endpoint.
- **Target Files**: `services/sandbox-manager/**`.

### Stream 3: Developer Experience & Client Systems Engineer (AI Coding Agent: Antigravity Client Agent)
- **Responsibilities**:
  - Author a client test harness and mock execution CLI to validate sandbox payloads against `@index0/contracts`.
  - Prepare terminal emulation and execution result visualizer interfaces in `apps/ide/web/`.
- **Target Files**: `apps/ide/web/src/terminal/**`, `tests/contracts/sandbox.test.ts`.

---

## 2. Antigravity Agent Prompt Directives

### Directives for Stream 2 (Platform Agent)
```text
ROLE: Platform & Backend Systems Engineer
AGENT RUNTIME: Google Antigravity Agent
OBJECTIVE: Implement the E2B Sandbox Manager service for safe, isolated code execution.
CONTRACT: @index0/contracts/v1/sandbox, @index0/contracts/v1/api
ALLOWED FILES: services/sandbox-manager/**
DEPENDENCIES: express, @e2b/code-interpreter (or E2B SDK), dotenv, zod, vitest
REQUIREMENTS:
- Expose POST /execute matching ISandboxRequest (id, code, language, timeoutMs, environmentVariables).
- Expose GET /health returning standard health status.
- Implement execution lifecycle: create -> execute -> capture result -> telemetry -> cleanup.
- MANDATORY: try/catch/finally with sandbox termination in `finally`.
- Return ISandboxExecutionResult (stdout, stderr, exitCode, durationMs, error).
FORBIDDEN CHANGES: Never omit the `finally` cleanup block; never execute untrusted code directly on host OS.
TESTS: Implement unit test with mocked E2B client verifying lifecycle transitions and guaranteed cleanup.
```

### Directives for Stream 3 (DevEx Agent)
```text
ROLE: Developer Experience & Client Systems Engineer
AGENT RUNTIME: Google Antigravity Agent
OBJECTIVE: Build contract conformance tests and execution result visualizer for sandbox outputs.
CONTRACT: @index0/contracts/v1/sandbox
ALLOWED FILES: tests/contracts/sandbox.test.ts, apps/ide/web/src/components/ExecutionResult.tsx
REQUIREMENTS:
- Implement contract tests verifying valid and invalid sandbox requests and responses.
- Build ExecutionResult component displaying exit codes, stdout, stderr, and execution duration.
FORBIDDEN CHANGES: Do not connect directly to sandbox-manager port from frontend (route via Gateway abstraction).
TESTS: Run `pnpm test` on contract test suite.
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
- [ ] `services/sandbox-manager` builds cleanly.
- [ ] Guaranteed cleanup verified via unit and live tests.
- [ ] Contract tests pass without deviation from `@index0/contracts`.
- [ ] Tag created: `checkpoint/day-02`.
