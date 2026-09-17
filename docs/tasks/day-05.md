# DAY 5 TASK: OpenHands Agent Host Service

## 1. Role-Wise Responsibilities

### Stream 1: Senior Tech Lead & System Architect
- **Responsibilities**:
  - Review and freeze `@index0/contracts/v1/agent` (`IAgentRun`, `IAgentEvent`, `AgentEventType`).
  - Verify asynchronous execution patterns so long-running agent loops never block synchronous HTTP threads.
  - Review SSE protocol compliance (`text/event-stream`, event IDs, reconnection policies).
  - Supervise Day 5 End-of-Day (EOD) Integration Ceremony.

### Stream 2: Platform & Backend Systems Engineer (AI Coding Agent: Antigravity Backend Agent)
- **Responsibilities**:
  - Implement `services/agent-host/` using NestJS, TypeScript, and RxJS.
  - Build the OpenHands runtime adapter translating agent loop states into standard events.
  - Expose REST and SSE endpoints:
    - `POST /agents/runs`: Create autonomous agent run.
    - `GET /agents/runs/:id`: Retrieve run metadata and state.
    - `POST /agents/runs/:id/cancel`: Signal graceful agent loop cancellation.
    - `GET /agents/runs/:id/events`: Stream real-time Server-Sent Events (SSE).
  - Expose `GET /health` endpoint.
- **Target Files**: `services/agent-host/**`.

### Stream 3: Developer Experience & Client Systems Engineer (AI Coding Agent: Antigravity Client Agent)
- **Responsibilities**:
  - Connect the Web IDE Agent Panel to the Gateway's SSE proxy endpoint.
  - Render agent thinking steps, tool invocations, and live diffs in the IDE.
- **Target Files**: `apps/ide/web/src/components/AgentPanel/**`.

---

## 2. Antigravity Agent Prompt Directives

### Directives for Stream 2 (Platform Agent)
```text
ROLE: Platform & Backend Systems Engineer
AGENT RUNTIME: Google Antigravity Agent
OBJECTIVE: Implement the NestJS Agent Host service and OpenHands runtime adapter.
CONTRACT: @index0/contracts/v1/agent, @index0/contracts/v1/sandbox, @index0/contracts/v1/api
ALLOWED FILES: services/agent-host/**
DEPENDENCIES: @nestjs/core, @nestjs/common, @nestjs/platform-express, rxjs, dotenv, vitest
REQUIREMENTS:
- Implement AgentController with POST /agents/runs, GET /agents/runs/:id, POST /agents/runs/:id/cancel.
- Implement GET /agents/runs/:id/events emitting text/event-stream payloads using RxJS Subject/Observable.
- Implement OpenHands adapter converting execution steps into IAgentEvent:
  agent.started, agent.message, tool.called, tool.result, sandbox.started, sandbox.completed, agent.completed, agent.failed.
- Asynchronous lifecycle: long tasks run in background workers/observables, not blocking HTTP responses.
FORBIDDEN CHANGES: Do not omit event schema attributes; do not use non-standard event types.
TESTS: Unit tests for controller and SSE observable stream.
```

### Directives for Stream 3 (DevEx Agent)
```text
ROLE: Developer Experience & Client Systems Engineer
AGENT RUNTIME: Google Antigravity Agent
OBJECTIVE: Wire the Web IDE Agent Panel to consume live SSE agent events.
CONTRACT: @index0/contracts/v1/agent
ALLOWED FILES: apps/ide/web/src/components/AgentPanel/**
REQUIREMENTS:
- Subscribe to SSE stream via EventSource with Authorization header or ticket parameter.
- Parse incoming IAgentEvent payloads and update reactive state (active step, tool log, execution duration).
- Handle connection drops with automatic backoff reconnection.
TESTS: Component test with mock EventSource emitting sequential agent events.
```

---

## 3. Daily End-of-Day (EOD) Integration Ceremony

### Timeline
- **16:30**: Code Freeze on `feature/day-05-agent-host` and `feature/day-05-ide-streaming`.
- **17:00**: Branch rebase onto `integration/day-05`.
- **17:30**: Full test suite and live agent streaming integration scenario.
- **18:00**: Senior Tech Lead sign-off & checkpoint tagging.

### Automated Verification Script
```bash
# 1. NestJS Agent Host compilation & tests
pnpm --filter @index0/agent-host typecheck
pnpm --filter @index0/agent-host test
pnpm --filter @index0/agent-host build

# 2. Monorepo cross-service verification
pnpm typecheck
pnpm lint
```

### Day 5 Integration Scenario
1. Start Gateway (`services/gateway`) and Agent Host (`services/agent-host`).
2. Trigger new agent run:
   ```bash
   RUN_ID=$(curl -s -X POST http://localhost:8080/v1/agents/runs \
     -H "Content-Type: application/json" \
     -d '{"prompt":"Add logging to main.go","workspaceId":"ws-01"}' | jq -r .data.id)
   ```
3. Connect to SSE stream:
   ```bash
   curl -N http://localhost:8080/v1/agents/runs/$RUN_ID/events
   ```
4. Verify events stream chronologically: `agent.started` → `agent.message` → `agent.completed`.
5. Open Web IDE and confirm events appear in real-time in the Agent Panel.

### Merge Gate Checklist
- [ ] `services/agent-host` builds cleanly.
- [ ] SSE endpoint streams valid formatted `text/event-stream` payloads.
- [ ] Cancel endpoint halts active agent execution.
- [ ] Tag created: `checkpoint/day-05`.
