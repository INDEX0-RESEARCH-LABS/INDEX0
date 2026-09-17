# DAY 5 TASK: OpenHands Agent Host Service

## ROLE
Vibecoder A

## OBJECTIVE
Implement the Agent Host service using NestJS, TypeScript, and RxJS, providing an adapter for the OpenHands runtime and durable event streaming via Server-Sent Events (SSE).

## CONTRACT
- `@index0/contracts/v1/agent`
- `@index0/contracts/v1/sandbox`
- `@index0/contracts/v1/api`

## ALLOWED FILES
- `services/agent-host/**`

## DEPENDENCIES
- NestJS framework (`@nestjs/core`, `@nestjs/common`, `@nestjs/platform-express`)
- RxJS
- TypeScript

## REQUIREMENTS
1. Expose REST endpoints:
   - `POST /agents/runs`: Initiate new autonomous agent task run.
   - `GET /agents/runs/:id`: Retrieve run metadata and current execution state.
   - `POST /agents/runs/:id/cancel`: Cancel an active agent run.
   - `GET /agents/runs/:id/events`: Stream real-time Server-Sent Events (SSE).
2. Integrate OpenHands adapter:
   - Coordinates with OpenHands runtime API.
   - Normalizes OpenHands events into standard `IAgentEvent` contracts:
     - `agent.started`
     - `agent.message`
     - `tool.called`
     - `tool.result`
     - `sandbox.started`
     - `sandbox.completed`
     - `agent.completed`
     - `agent.failed`
3. Support asynchronous execution so long-running tasks do not block HTTP connections.
4. Expose `GET /health` endpoint.

## FORBIDDEN CHANGES
- Do not hold open synchronous HTTP connections for the full duration of multi-minute agent tasks; use SSE for streaming and Temporal for orchestration.
- Do not bypass `IAgentEvent` schema definitions.

## TESTS
- Unit tests for `AgentController` endpoints.
- Event stream observable transformation tests.

## DEFINITION OF DONE
- [ ] `services/agent-host` builds cleanly with `pnpm --filter @index0/agent-host build`.
- [ ] `pnpm --filter @index0/agent-host test` passes.
- [ ] SSE endpoint emits valid formatted `text/event-stream` payloads.
