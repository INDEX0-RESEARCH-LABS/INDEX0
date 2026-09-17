# Shared Contracts Guide — `@index0/contracts`

The `@index0/contracts` package (`packages/contracts`) is the authoritative source of truth for all types, schemas, interfaces, and event models across INDEX0 AI.

---

## 1. Versioning Strategy

Contracts are versioned under `v1`:

```text
packages/contracts/
├── package.json
├── tsconfig.json
├── src/
│   └── index.ts        # Primary package entry point
└── v1/
    ├── agent/          # Agent runs, execution requests, and event streams
    ├── sandbox/        # Sandbox requests, execution results, language specs
    ├── telemetry/      # Metering, analytics, and ClickHouse audit schemas
    ├── billing/        # Lago, Stripe, and OpenMeter sync payloads
    ├── api/            # Gateway request/response envelopes, RFC 7807 errors
    ├── auth/           # OIDC claims, JWT payloads, and RBAC roles
    └── project/        # Projects, repositories, and workspace models
```

---

## 2. Inviolable Rules

1. **No Ad-Hoc Modification**: Services and clients must import from `@index0/contracts`. No developer or AI coding agent may change a contract to make implementation easier without Senior Tech Lead approval.
2. **Backward Compatibility**: New fields added to existing interfaces must be optional (`?`). Breaking modifications require deprecation notices and migration paths.
3. **Type Safety**: All contracts must compile under strict TypeScript (`strict: true`, `noImplicitAny: true`).

---

## 3. Key Interface Samples

### Sandbox Execution Contract (`v1/sandbox`)
```typescript
export type SandboxLanguage = "python" | "typescript" | "bash";

export interface ISandboxRequest {
  id: string;
  code: string;
  language: SandboxLanguage;
  timeoutMs: number;
  environmentVariables?: Record<string, string>;
}

export interface ISandboxExecutionResult {
  id: string;
  exitCode: number;
  stdout: string;
  stderr: string;
  durationMs: number;
  error?: string;
}
```

### Agent Run & Event Contract (`v1/agent`)
```typescript
export type AgentEventType =
  | "agent.started"
  | "agent.message"
  | "tool.called"
  | "tool.result"
  | "sandbox.started"
  | "sandbox.completed"
  | "agent.completed"
  | "agent.failed";

export interface IAgentEvent {
  id: string;
  runId: string;
  type: AgentEventType;
  payload: Record<string, unknown>;
  timestamp: string;
}
```

### Gateway Standard API Response (`v1/api`)
```typescript
export interface IApiResponse<T> {
  success: boolean;
  data?: T;
  error?: IProblemDetails;
  requestId: string;
  timestamp: string;
}

export interface IProblemDetails {
  type: string;
  title: string;
  status: number;
  detail: string;
  instance?: string;
}
```
