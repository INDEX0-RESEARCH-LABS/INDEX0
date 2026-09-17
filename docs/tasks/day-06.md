# DAY 6 TASK: Model Context Protocol (MCP) & Off-the-Shelf Tooling

> **Option A Architecture**: Orchestrating off-the-shelf open-source containers and official standard MCP servers with zero scratch-built tool servers.

---

## 1. Role-Wise Responsibilities

### Stream 1: Senior Tech Lead & System Architect
- **Responsibilities**:
  - Govern tool sandboxing and workspace boundary containment.
  - Configure standard off-the-shelf MCP servers (e.g. official `@modelcontextprotocol/server-filesystem`) and OpenHands' native workspace tooling.
  - Supervise Day 6 End-of-Day (EOD) Integration Ceremony.
- **Target Files**: `infra/compose/docker-compose.yml`, `docs/tasks/day-06.md`.

### Stream 2: Platform & Backend Systems Engineer (AI Coding Agent)
- **Responsibilities**:
  - Configure OpenHands native tool configuration (file search, ripgrep, AST tools, git operations).
  - Verify workspace isolation inside the OpenHands runtime container (`/opt/workspace_base`).
- **Target Files**: `infra/compose/docker-compose.yml`.

### Stream 3: Developer Experience & Client Systems Engineer (AI Coding Agent)
- **Responsibilities**:
  - Verify developer workflows: prompt OpenHands to search workspace code, edit files, and run tests.
  - Author integration tests verifying file changes are persisted to `./workspace` on the host.
- **Target Files**: `workspace/.gitkeep`, `tests/contracts/**`.

---

## 2. Antigravity Agent Prompt Directives

```text
ROLE: Platform & Backend Systems Engineer
AGENT RUNTIME: Google Antigravity Agent
OBJECTIVE: Configure standard MCP and native tools inside OpenHands runtime without writing custom tool hosts from scratch.
REQUIREMENTS:
- OpenHands utilizes built-in file search (ripgrep), bash execution, and code editing tools.
- External MCP tools connect via standard MCP stdio / SSE adapters.
- All executions stay confined to the mounted workspace volume.
TESTS: Run Docker Compose config validation.
```

---

## 3. Daily End-of-Day (EOD) Integration Ceremony

### Automated Verification Script
```bash
# 1. Validate Docker Compose configuration
docker compose -f infra/compose/docker-compose.yml config

# 2. Monorepo TypeScript check
pnpm typecheck
pnpm test
```

### Merge Gate Checklist
- [x] OpenHands workspace tool configuration verified.
- [x] Docker Compose config validation passes cleanly.
- [ ] Tag created: `checkpoint/day-06`.
