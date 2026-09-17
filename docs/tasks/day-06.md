# DAY 6 TASK: Model Context Protocol (MCP) Host & Semantic Search

## 1. Role-Wise Responsibilities

### Stream 1: Senior Tech Lead & System Architect
- **Responsibilities**:
  - Review MCP Host security containment and path traversal protections.
  - Formulate JSON-RPC 2.0 tool definitions matching the official MCP specification.
  - Ensure zero arbitrary command execution on the host machine.
  - Coordinate Day 6 End-of-Day (EOD) Integration Ceremony.

### Stream 2: Platform & Backend Systems Engineer (AI Coding Agent: Antigravity Backend Agent)
- **Responsibilities**:
  - Connect the Agent Host runtime to spawn and invoke MCP tools over stdio.
  - Handle MCP process lifecycle, piping stdin/stdout, and handling crash recovery.
- **Target Files**: `services/agent-host/src/mcp/**`.

### Stream 3: Developer Experience & Client Systems Engineer (AI Coding Agent: Antigravity Client Agent)
- **Responsibilities**:
  - Implement `packages/mcp-host/` in Go 1.24+ over stdio JSON-RPC.
  - Implement tools:
    - `search_text`: Scoped ripgrep (`rg --json`) text search returning structured file matches, line numbers, and snippets.
    - `read_file`: Bounded file reader with line range offsets and max byte limit.
    - `list_directory`: Directory listing respecting depth limits.
    - `search_files`: Glob-based file path search.
  - **Security Sandboxing**: Traversal outside the designated workspace directory (e.g. `../../etc/passwd` or symlink escapes) must be strictly forbidden and return security errors.
- **Target Files**: `packages/mcp-host/**`.

---

## 2. Antigravity Agent Prompt Directives

### Directives for Stream 3 (DevEx Agent)
```text
ROLE: Developer Experience & Client Systems Engineer
AGENT RUNTIME: Google Antigravity Agent
OBJECTIVE: Implement the Go Model Context Protocol (MCP) host with ripgrep and safe file tools.
CONTRACT: Model Context Protocol (MCP) 2024 JSON-RPC specification
ALLOWED FILES: packages/mcp-host/**
DEPENDENCIES: Go 1.24+, ripgrep (`rg`) binary
REQUIREMENTS:
- Stdio JSON-RPC 2.0 server reading stdin and writing stdout.
- Support tools:
  1. search_text: args { query, path?, regex?, caseSensitive? }. Executes `rg --json` and formats matches.
  2. read_file: args { path, startLine?, endLine?, maxBytes? }. Reads file within bounds.
  3. list_directory: args { path, recursive?, maxDepth? }. Lists files and directories.
  4. search_files: args { pattern, path? }. Finds files by glob.
- SECURITY: Canonicalize all paths. If path resolves outside workspace root, return error code -32000 (Forbidden Path).
FORBIDDEN CHANGES: Never execute arbitrary bash strings; never allow path traversal outside workspace.
TESTS: Unit test path traversal defense and ripgrep JSON output parser.
```

### Directives for Stream 2 (Platform Agent)
```text
ROLE: Platform & Backend Systems Engineer
AGENT RUNTIME: Google Antigravity Agent
OBJECTIVE: Integrate MCP stdio client into the Agent Host service.
CONTRACT: @index0/contracts/v1/agent
ALLOWED FILES: services/agent-host/src/mcp/**
REQUIREMENTS:
- Spawn `mcp-host` binary as a child process with configured workspace path.
- Implement JSON-RPC 2.0 client sending `tools/call` requests for `search_text` and `read_file`.
- Map tool call results into `IAgentEvent` with type `tool.result`.
TESTS: Integration test calling mock MCP host from Agent Host.
```

---

## 3. Daily End-of-Day (EOD) Integration Ceremony

### Timeline
- **16:30**: Code Freeze on `feature/day-06-mcp` and `feature/day-06-agent-tools`.
- **17:00**: Branch rebase onto `integration/day-06`.
- **17:30**: Automated tests and live MCP integration scenario.
- **18:00**: Senior Tech Lead sign-off & checkpoint tagging.

### Automated Verification Script
```bash
# 1. MCP Host Go tests
(cd packages/mcp-host && go test -v ./...)

# 2. Security path traversal verification
(cd packages/mcp-host && go test -v ./tools -run TestPathTraversalSecurity)

# 3. MCP Host build
(cd packages/mcp-host && go build -o /dev/null .)

# 4. Agent Host integration test
pnpm --filter @index0/agent-host test
```

### Day 6 Integration Scenario
1. Launch MCP Host via stdin pipe test script.
2. Execute `search_text` for a known symbol across workspace files; verify structured JSON matches return within 100ms.
3. Execute `read_file` with `../../../../etc/passwd`; verify MCP host rejects execution with path traversal security violation.
4. Trigger agent run in Agent Host requesting code search; verify agent invokes `search_text` via MCP and streams `tool.called` and `tool.result` events.

### Merge Gate Checklist
- [ ] Go MCP Host builds and passes all unit tests.
- [ ] Path traversal security tests verify boundary containment.
- [ ] Agent Host communicates seamlessly with MCP Host over stdio.
- [ ] Tag created: `checkpoint/day-06`.
