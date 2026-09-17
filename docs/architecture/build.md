# BUILD Architecture — INDEX0 AI

The **BUILD** subsystem encompasses the developer interface, the autonomous agent runtime, safe sandbox execution, and Model Context Protocol (MCP) host tooling.

---

## 1. Components

```text
┌─────────────────────────────────────────────────────────────┐
│                          INDEX0 IDE                         │
│             (Web Browser / VS Code Extension)               │
└──────────────────────────────┬──────────────────────────────┘
                               │ HTTPS / SSE
                               ▼
┌─────────────────────────────────────────────────────────────┐
│                         API GATEWAY                         │
└──────────────────────────────┬──────────────────────────────┘
                               │ Private Network
                               ▼
┌─────────────────────────────────────────────────────────────┐
│                      AGENT HOST SERVICE                     │
│                  (NestJS + RxJS + OpenHands)                │
│                                                             │
│   ┌─────────────────────┐       ┌──────────────────────┐    │
│   │  OpenHands Adapter  │◄─────►│ SSE Event Streamer   │    │
│   └──────────┬──────────┘       └──────────────────────┘    │
└──────────────┼──────────────────────────────┬───────────────┘
               │                              │
               ▼                              ▼
┌─────────────────────────────┐┌──────────────────────────────┐
│       SANDBOX MANAGER       ││           MCP HOST           │
│   (Express + E2B MicroVM)   ││   (Go stdio / JSON-RPC)      │
│                             ││                              │
│   • MicroVM Provisioning    ││   • ripgrep search           │
│   • Execution Bounding      ││   • Safe file read           │
│   • Guaranteed Teardown     ││   • Directory tree walk      │
└─────────────────────────────┘└──────────────────────────────┘
```

---

## 2. Component Specifications

### 2.1 INDEX0 IDE (`apps/ide`)
The sovereign IDE provides two presentation tiers:
1. **Web IDE (`apps/ide/web`)**: Browser-based IDE powered by Monaco editor, custom file explorer, interactive terminal emulator, and unified agent orchestration panel.
2. **IDE Extension (`apps/ide/extension`)**: VS Code extension enabling developers to connect their existing local editor to the INDEX0 AI sovereign infrastructure.

**Mandatory Rule**: The IDE communicates exclusively through the API Gateway. Direct cross-talk to `agent-host`, `sandbox-manager`, or databases is prohibited.

### 2.2 Agent Host (`services/agent-host`)
The Agent Host coordinates the autonomous agent lifecycle using NestJS and RxJS:
- Translates high-level user tasks into planning and execution loops.
- Integrates with the **OpenHands** autonomous agent framework.
- Emits real-time progress events using Server-Sent Events (`GET /agents/runs/:id/events`).
- Supported event types:
  - `agent.started`
  - `agent.message`
  - `tool.called`
  - `tool.result`
  - `sandbox.started`
  - `sandbox.completed`
  - `agent.completed`
  - `agent.failed`

### 2.3 Sandbox Manager (`services/sandbox-manager`)
The Sandbox Manager wraps the **E2B** software execution engine:
- Exposes `POST /execute` accepting `ISandboxRequest`:
  ```typescript
  export interface ISandboxRequest {
    id: string;
    code: string;
    language: "python" | "typescript" | "bash";
    timeoutMs: number;
  }
  ```
- **Guaranteed Lifecycle**:
  ```text
  create → execute → capture result → emit telemetry → cleanup
  ```
- **Cleanup Guarantee**: Code execution is always wrapped in `try/catch/finally`. MicroVM termination and resource deallocation must execute in the `finally` block to prevent orphaned or dangling virtual machines.

### 2.4 MCP Host (`packages/mcp-host`)
The MCP Host is implemented in Go and communicates over standard input/output (`stdio`) using JSON-RPC according to the Model Context Protocol specification:
- **`search_text`**: High-performance semantic code search driven by `ripgrep` (`rg --json`), filtering by path, glob, and regex.
- **`read_file`**: Reads bounded portions of files with line offset and size limits.
- **`list_directory`**: Enumerates files and subdirectories with depth constraints.
- **`search_files`**: Finds files matching glob patterns.
- **Security Sandboxing**: Traversal outside the configured workspace directory (e.g., `../../etc/passwd`) is strictly rejected with a security violation error.
