# DAY 6 TASK: Model Context Protocol (MCP) & Off-the-Shelf Tooling

> **Option A Architecture**: Orchestrating off-the-shelf open-source containers and official standard MCP servers with zero scratch-built tool servers.

---

## 1. Role-Wise Responsibilities

### Stream 1: Senior Tech Lead & System Architect (Dev 1)
- **Responsibilities**:
  - Author authoritative MCP contracts in `@index0/contracts/v1/mcp` (`MCPTransport`, `MCPToolCategory`, `IMCPToolDefinition`, `IMCPServerConfig`, `IMCPToolInvocation`, `IMCPToolResult`, `IMCPBoundaryRules`, `IMCPToolRegistry`).
  - Create canonical MCP tool registry (`infra/mcp/tool-registry.json`) registering 6 native OpenHands tools and 2 standard MCP servers with workspace boundary enforcement rules.
  - Govern tool sandboxing and workspace boundary containment — deny path traversal (`../../`, `/etc`, `/var`, `/root`, `/home`) and deny symlink resolution.
  - Update `workspace/.openhands_instructions` with MCP Tool Governance section.
  - Author automated MCP conformance test suite in `tests/mcp/mcp.test.ts` validating tool registry, boundary rules, Option A compliance, and contract exports.
  - Supervise Day 6 End-of-Day (EOD) Integration Ceremony and tag release checkpoint `checkpoint/day-06`.
- **Target Files**: `packages/contracts/src/v1/mcp/**`, `infra/mcp/**`, `workspace/.openhands_instructions`, `tests/mcp/**`, `package.json`, `docs/tasks/day-06.md`.

### Stream 2: Platform & Backend Systems Engineer (AI Coding Agent: Antigravity Backend Agent / Dev 2)
- **Responsibilities**:
  - Validate MCP tool registry (`infra/mcp/tool-registry.json`) conforms to `IMCPToolRegistry` schema from `@index0/contracts/v1/mcp`.
  - Verify OpenHands native tool configuration in Docker Compose — confirm workspace volume mount (`../../workspace:/opt/workspace_base`), Docker socket mount, and runtime container image are correctly parameterized for sandboxed tool execution.
  - Verify `@modelcontextprotocol/server-filesystem` configuration references workspace root (`/opt/workspace_base`) and uses `stdio` transport.
  - Author platform-level MCP integration smoke test suite in `tests/mcp/mcp-platform-smoke.test.ts` validating compose service graph compatibility, workspace mount alignment, and filesystem server confinement.
  - Verify zero custom Go MCP host code exists in the repository (Option A compliance).
- **Target Files**: `infra/compose/docker-compose.yml`, `infra/mcp/**`, `tests/mcp/mcp-platform-smoke.test.ts`, `docs/tasks/day-06.md`.

### Stream 3: Developer Experience & Client Systems Engineer (AI Coding Agent: Antigravity Client Agent / Dev 3)
- **Responsibilities**:
  - Implement MCP tool status service (`apps/ide/web/src/services/mcpToolService.ts`) loading tool registry, categorizing tools by `MCPToolCategory`, and computing availability badges for native vs external tools.
  - Enhance the IDE workbench with an MCP Tools Panel (`apps/ide/web/src/components/MCPToolsPanel.tsx`) displaying registered tools grouped by category, sandbox status indicators, and workspace boundary rule summary.
  - Verify developer workflows: prompt OpenHands to search workspace code, edit files, and run tests via authorized MCP tools.
  - Author automated tests in `apps/ide/web/test/mcp-tools.test.ts` validating tool registry loading, category grouping, and component instantiation.
- **Target Files**: `apps/ide/web/src/services/mcpToolService.ts`, `apps/ide/web/src/components/MCPToolsPanel.tsx`, `apps/ide/web/test/mcp-tools.test.ts`, `docs/tasks/day-06.md`.

---

## 2. Antigravity Agent Prompt Directives

### Directives for Stream 1 (Senior Tech Lead / Principal Agent / Dev 1)
```text
ROLE: Senior Tech Lead & System Architect
AGENT RUNTIME: Google Antigravity Agent (Architect Mode)
OBJECTIVE: Govern MCP tool sandboxing, author authoritative MCP contracts (@index0/contracts/v1/mcp), define canonical tool registry, update workspace instructions with MCP governance, author MCP conformance test suite, and coordinate Day 6 EOD convergence.
CONTRACT: System Blueprint (Sections 1, 2.4, 5, 7) & docs/contracts/README.md
ALLOWED FILES: packages/contracts/**, infra/mcp/**, workspace/**, tests/mcp/**, package.json, docs/tasks/day-06.md
DEPENDENCIES: Node.js 20+, pnpm 12+, TypeScript 5.4+, Docker Compose
REQUIREMENTS:
- Author @index0/contracts/v1/mcp: MCPTransport, MCPToolCategory, IMCPToolDefinition, IMCPServerConfig, IMCPToolInvocation, IMCPToolResult, IMCPBoundaryRules, IMCPToolRegistry.
- Author infra/mcp/tool-registry.json registering 6 OpenHands native tools and 2 standard MCP servers with workspace boundary rules.
- Update workspace/.openhands_instructions adding MCP Tool Governance section (workspace confinement, authorized tool list, deny paths, symlink denial).
- Author tests/mcp/mcp.test.ts validating tool registry schema, native tool inventory, boundary enforcement, Option A compliance, and contract exports.
- Expand docs/tasks/day-06.md with full directives for all three streams under Schedule B.
- Coordinate Day 6 EOD integration ceremony and tag checkpoint/day-06.
FORBIDDEN CHANGES: Do not introduce scratch-built custom MCP tool servers; do not bypass workspace boundary confinement; do not modify existing contracts without backward compatibility.
TESTS:
- `pnpm --filter @index0/contracts build`
- `pnpm --filter @index0/contracts typecheck`
- `pnpm test:mcp`
- `docker compose -f infra/compose/docker-compose.yml config`
- `pnpm build && pnpm typecheck && pnpm test`
DEFINITION OF DONE:
- @index0/contracts/v1/mcp exports all MCP types with declaration files.
- infra/mcp/tool-registry.json passes schema validation with 6 native + 2 MCP server entries.
- MCP conformance test suite passes 100% of tests (22/22).
- workspace/.openhands_instructions contains MCP Tool Governance section.
- docs/tasks/day-06.md updated with full directives for all three streams.
- Full monorepo build, typecheck, and test pass cleanly.
- Checkpoint tag checkpoint/day-06 created.
```

### Directives for Stream 2 (Platform Agent / Dev 2)
```text
ROLE: Platform & Backend Systems Engineer (Dev 2)
AGENT RUNTIME: Google Antigravity Agent
OBJECTIVE: Validate MCP tool registry against contracts, verify Docker Compose workspace mount alignment for sandboxed tool execution, and author platform MCP integration smoke tests for Day 6.
CONTRACT: @index0/contracts/v1/mcp, System Blueprint (Section 2.4)
ALLOWED FILES: infra/mcp/**, infra/compose/docker-compose.yml, tests/mcp/**, docs/tasks/day-06.md
DEPENDENCIES: Docker Compose, Node.js 20+, pnpm 12+, TypeScript 5.4+
REQUIREMENTS:
- Validate infra/mcp/tool-registry.json conforms to IMCPToolRegistry schema (version, servers array, nativeTools array, boundaryRules object).
- Verify Docker Compose openhands service mounts workspace to /opt/workspace_base matching tool registry boundaryRules.workspaceRoot.
- Verify @modelcontextprotocol/server-filesystem configuration args include /opt/workspace_base and uses stdio transport.
- Author tests/mcp/mcp-platform-smoke.test.ts verifying compose service alignment, workspace mount consistency, and filesystem server confinement.
- Verify zero custom Go MCP host code exists in packages/ and services/ (Option A compliance).
FORBIDDEN CHANGES: Do not introduce scratch-built custom MCP tool servers; do not modify workspace boundary rules without Senior Tech Lead approval; do not expose internal container ports.
TESTS:
- `docker compose -f infra/compose/docker-compose.yml config`
- `pnpm test:mcp`
- `pnpm build && pnpm typecheck && pnpm test`
DEFINITION OF DONE:
- Docker Compose config validates with all 7 services on index0-net.
- MCP test suites pass 100% of tests.
- Platform smoke tests verify workspace mount consistency across compose and tool registry.
- docs/tasks/day-06.md updated with full Stream 2 responsibilities and checklist items.
```

### Directives for Stream 3 (DevEx Agent / Dev 3)
```text
ROLE: Developer Experience & Client Systems Engineer (Dev 3)
AGENT RUNTIME: Google Antigravity Agent
OBJECTIVE: Build MCP tool status service for IDE, implement visual MCP Tools Panel with category grouping and sandbox indicators, and verify developer workflows through authorized tools for Day 6.
CONTRACT: @index0/contracts/v1/mcp, @index0/contracts/v1/api
ALLOWED FILES: apps/ide/web/src/services/mcpToolService.ts, apps/ide/web/src/components/MCPToolsPanel.tsx, apps/ide/web/test/**, docs/tasks/day-06.md
DEPENDENCIES: Node.js 20+, pnpm 12+, TypeScript 5.4+, React 18+, Lucide-React, @index0/contracts
REQUIREMENTS:
- Implement apps/ide/web/src/services/mcpToolService.ts loading tool registry, parsing IMCPToolRegistry, categorizing tools by MCPToolCategory, and computing availability badges (native/external, sandboxed/unrestricted).
- Implement apps/ide/web/src/components/MCPToolsPanel.tsx rendering tools grouped by category (filesystem, search, execution, inspection) with sandbox status indicators, transport badges, and workspace boundary rule summary card.
- Author unit tests in apps/ide/web/test/mcp-tools.test.ts validating tool registry loading, category grouping (4 categories), tool count (8 total), and React component instantiation.
- Verify Web IDE builds and passes all tests cleanly.
FORBIDDEN CHANGES: Do not hardcode internal container ports; route all traffic through Gateway (port 8000); do not introduce scratch-built MCP tool servers.
TESTS:
- `pnpm --filter @index0/ide-web build`
- `pnpm --filter @index0/ide-web typecheck`
- `pnpm --filter @index0/ide-web test`
- `pnpm test:mcp`
- `pnpm build && pnpm typecheck && pnpm test`
DEFINITION OF DONE:
- MCP tool service correctly loads and categorizes all 8 registered tools across 4 categories.
- MCPToolsPanel renders with category grouping and sandbox indicators.
- Web IDE passes 100% of tests.
- Full Turborepo build, typecheck, and test pipelines pass across monorepo.
```

---

## 3. Daily End-of-Day (EOD) Integration Ceremony

### Timeline (Schedule B: Standard Evening Rhythm: 5:30 PM – 12:00 AM Midnight)
- **17:30 (5:30 PM)**: Evening Alignment & MCP Architecture Review.
- **18:00 (6:00 PM)**: Parallel Agentic Implementation (Stream 1: MCP contracts & registry, Stream 2: Platform validation, Stream 3: IDE tool panel).
- **22:30 (10:30 PM)**: Code Freeze & Pre-Integration Check (T - 90m).
- **23:00 (11:00 PM)**: Daily Convergence & Rebase onto `integration/day-06` (T - 60m).
- **23:30 (11:30 PM)**: MCP Integration Scenario & Smoke Testing (T - 30m).
- **00:00 (12:00 AM Midnight)**: Merge Gate Sign-Off & Checkpoint Tagging (`checkpoint/day-06`).

### Automated Verification Script
```bash
# 1. Validate Docker Compose configuration
docker compose -f infra/compose/docker-compose.yml config

# 2. Run MCP conformance test suite
pnpm test:mcp

# 3. Monorepo build, typecheck, and test suite
pnpm build
pnpm typecheck
pnpm test
```

### Day 6 Integration Scenario
1. Validate `infra/mcp/tool-registry.json` parses as valid JSON with 6 native tools, 2 MCP servers, and workspace boundary rules.
2. Verify `@index0/contracts/v1/mcp` exports all 8 type definitions with declaration files.
3. Confirm workspace instructions (`workspace/.openhands_instructions`) contain MCP Tool Governance section.
4. Verify boundary deny rules block path traversal outside `/opt/workspace_base`.
5. Confirm zero custom Go MCP host code exists in `packages/` and `services/` (Option A compliance).
6. Run full MCP conformance test suite and verify 22/22 tests pass.

### Merge Gate Checklist
- [x] MCP contracts authored (`@index0/contracts/v1/mcp`) with 8 type exports.
- [x] MCP tool registry authored (`infra/mcp/tool-registry.json`) with 6 native tools + 2 MCP servers.
- [x] Workspace boundary rules configured (deny `../../`, `/etc`, `/var`, `/root`, `/home`; symlink resolution: `deny`).
- [x] Workspace instructions updated with MCP Tool Governance section (`workspace/.openhands_instructions`).
- [x] MCP conformance test suite passes (22/22 tests in `tests/mcp/mcp.test.ts`).
- [x] Option A architecture invariants verified (zero custom Go MCP host code).
- [x] Docker Compose config validation passes cleanly.
- [x] TypeScript contracts and monorepo typecheck pass cleanly.
- [x] MCP platform smoke tests authored and passing (`tests/mcp/mcp-platform-smoke.test.ts`).
- [x] MCP tool service & IDE panel implemented (`apps/ide/web/src/services/mcpToolService.ts`, `apps/ide/web/src/components/MCPToolsPanel.tsx`).
- [x] Tag created: `checkpoint/day-06`.

