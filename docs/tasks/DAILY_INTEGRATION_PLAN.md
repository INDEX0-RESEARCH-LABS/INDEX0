# Daily End-of-Day (EOD) Integration Plan & Agentic Operating Model

This document establishes the operational choreography for human leads and AI coding agents (such as Google Antigravity, Claude Code, and specialized IDE subagents) to collaborate concurrently and converge deterministically at the end of each day.

---

## 1. Team & Agentic Collaboration Structure

The team operates in three coordinated work streams. Rather than manual ad-hoc coding, software engineers leverage **Autonomous AI Coding Agents (Antigravity IDE Agents)** running with bounded task scopes and strict contract guardrails.

```text
┌─────────────────────────────────────────────────────────────────────────┐
│              STREAM 1: SENIOR TECH LEAD & PRINCIPAL ARCHITECT           │
│                                                                         │
│   • Contracts Governance (@index0/contracts)                            │
│   • Core Architecture & Gateway (Go)                                    │
│   • Security, CI/CD, & Production Deployments                           │
│   • Daily Merge Gate Authority & EOD Convergence Lead                   │
└────────────────────────────────────┬────────────────────────────────────┘
                                     │ Authoritative Contracts & Guardrails
                 ┌───────────────────┴───────────────────┐
                 │                                       │
                 ▼                                       ▼
┌─────────────────────────────────┐   ┌───────────────────────────────────┐
│   STREAM 2: PLATFORM & BACKEND  │   │  STREAM 3: CLIENT & DEV EXPERIENCE│
│        SYSTEMS ENGINEER         │   │         SYSTEMS ENGINEER          │
│   (Powered by Antigravity Agent)│   │   (Powered by Antigravity Agent)  │
│                                 │   │                                   │
│  • Database Models & Migrations │   │  • INDEX0 IDE (Web & Extension)   │
│  • E2B Sandbox Manager          │   │  • Go MCP Host (ripgrep, stdio)   │
│  • OpenHands Agent Host Runtime │   │  • Developer Tooling & Search     │
│  • Telemetry & Billing Pipelines│   │  • Client Event Streams & Panels  │
└─────────────────────────────────┘   └───────────────────────────────────┘
```

---

## 2. Operating Schedules & Daily Workflow Rhythm

The project operates under two execution schedules:
1. **Intensive Build Marathon (First 3 Days: Days 1, 2 & 3)**: Running from **10:00 AM to 12:00 AM (Midnight)** for accelerated bootstrap, sandbox manager, IDE workbench, and deep cross-service convergence.
2. **Standard Evening Rhythm (Days 4–8)**: Running from **5:30 PM (17:30) to 12:00 AM (00:00 Midnight)** for sustained engineering progress.

---

### Schedule A: Intensive Build Marathon (First 3 Days: Days 1, 2 & 3: 10:00 AM – 12:00 AM Midnight)

```text
10:00 ─── Morning Contract Alignment & Task Board Dispatch
  │       • Senior Tech Lead defines/updates @index0/contracts/v1
  │       • Agent prompt contexts prepared with strict task bounds
  │
10:30 ─── Marathon Sprint Block 1: Core Foundation & Feature Services
  │       • Stream 2: Platform Agent bootstraps database schemas & microservices
  │       • Stream 3: DevEx Agent sets up monorepo tooling, IDE & MCP host
  │       • Continuous unit tests and contract validation
  │
14:00 ─── Midday Checkpoint & Rebase Sync
  │       • Intermediate contract conformance verification
  │       • Local branches rebased against latest updates
  │
15:00 ─── Marathon Sprint Block 2: Deep Feature Implementation
  │       • Full cross-service integration, event streaming & state wiring
  │       • End-to-end component testing
  │
22:30 ─── Code Freeze & Pre-Integration Check (T - 90m)
  │       • Feature branches frozen; zero new feature code accepted
  │       • Verify no contract drift against @index0/contracts
  │
23:00 ─── Convergence & Monorepo Build (T - 60m)
  │       • Merge Stream 2 & Stream 3 branches into daily integration branch
  │       • Execute full monorepo typecheck, lint, and unit test suites
  │
23:30 ─── Live Integration Scenario & Smoke Testing (T - 30m)
  │       • Boot backing infrastructure via Docker Compose
  │       • Run end-to-end integration scenario through API Gateway
  │
00:00 ─── Merge Gate Sign-Off & Checkpoint Tagging (12:00 AM Midnight)
          • Senior Tech Lead sign-off & fast-forward merge into main
          • Immutable milestone tag created (checkpoint/day-XX)
```

---

### Schedule B: Standard Evening Rhythm (Days 4–8: 5:30 PM – 12:00 AM Midnight)

```text
17:30 ─── Evening Contract Alignment & Task Board Dispatch (5:30 PM)
  │       • Senior Tech Lead defines/updates @index0/contracts/v1
  │       • Agent prompt contexts prepared with strict task bounds
  │
18:00 ─── Parallel Agentic Implementation (6:00 PM)
  │       • Stream 2: Platform Agent executes backend service scope
  │       • Stream 3: DevEx Agent executes client/MCP tooling scope
  │       • Continuous unit and contract conformance testing
  │
22:30 ─── Code Freeze & Pre-Integration Check (10:30 PM / T - 90m)
  │       • All agent branches stop accepting new features
  │       • Run contract validation and check for forbidden edits
  │
23:00 ─── Daily Convergence & Rebase (11:00 PM / T - 60m)
  │       • Rebase feature branches onto daily integration branch
  │       • Execute cross-service automated test suite
  │
23:30 ─── Live Integration Scenario & Smoke Testing (11:30 PM / T - 30m)
  │       • Boot backing infrastructure via Docker Compose
  │       • Run live end-to-end integration scenario through Gateway
  │
00:00 ─── Merge Gate Sign-Off & Checkpoint Commit (12:00 AM Midnight)
          • Senior Tech Lead verifies zero contract violations
          • Clean staging commit and daily milestone tag created
```

---

## 3. Detailed Step-by-Step EOD Integration Protocol

The convergence protocol executes identically during the final 90 minutes of both schedules (22:30 – 00:00):

### Step 1: Pre-Integration Contract Verification (22:30 / T - 90m)
Before any code is merged, verify that neither Stream 2 nor Stream 3 introduced unauthorized contract alterations:
```bash
# Verify no unstaged or modified files exist in packages/contracts
git diff origin/main -- packages/contracts/

# Run contract typecheck
pnpm --filter @index0/contracts typecheck
```
*If a contract violation is detected:* Stop immediately. Revert the unauthorized alteration and adapt the service implementation to match the authoritative contract.

---

### Step 2: Branch Convergence & Workspace Build (23:00 / T - 60m)
Both agents submit pull requests targeting the daily integration branch `integration/day-XX`:
```bash
# Create and check out daily integration branch
git checkout -b integration/day-XX

# Merge Stream 2 (Platform & Backend)
git merge --no-ff feature/stream-2-platform

# Merge Stream 3 (Client & DevEx)
git merge --no-ff feature/stream-3-devex
```

---

### Step 3: Full Monorepo Automated Verification Suite (23:15 / T - 45m)
Run the automated verification suite across all packages:
```bash
# 1. Deterministic dependency verification
pnpm install --frozen-lockfile

# 2. Strict linter verification
pnpm lint

# 3. TypeScript compilation across all packages and apps
pnpm typecheck

# 4. Monorepo unit and contract tests
pnpm test

# 5. Go Gateway & MCP tests
(cd services/gateway && go test -v ./...)
(cd packages/mcp-host && go test -v ./...)

# 6. Turborepo full build artifact validation
pnpm build
```

---

### Step 4: Live Backing Stack & Smoke Verification (23:30 / T - 30m)
Boot containerized backing services and execute the daily integration smoke test:
```bash
# 1. Validate Docker Compose configuration
docker compose -f infra/compose/docker-compose.yml config

# 2. Start PostgreSQL, ClickHouse, Temporal, Zitadel
docker compose -f infra/compose/docker-compose.yml up -d

# 3. Verify backing services health
curl -f http://localhost:8080/health || true
```

---

### Step 5: Merge Authority Sign-Off & Checkpoint Tagging (00:00 / 12:00 AM Midnight)
The Senior Tech Lead verifies:
1. All automated checks pass cleanly with 0 errors.
2. No credentials, tokens, or private keys are present in Git diff (`git diff origin/main | grep -E "(API_KEY|SECRET|PASSWORD)"`).
3. ClickHouse analytics tables and PostgreSQL migrations are consistent.
4. Fast-forward merge `integration/day-XX` into `main`.
5. Create immutable checkpoint tag:
```bash
git checkout main
git merge --ff-only integration/day-XX
git tag -a checkpoint/day-XX -m "Milestone: Day XX EOD Integration Verified"
git push origin main --tags
```

---

## 4. Conflict Resolution Matrix

| Conflict Type | Resolution Authority | Protocol |
| :--- | :--- | :--- |
| **Contract Schema Conflict** | Senior Tech Lead | Revert service edit; enforce contract in `@index0/contracts`. |
| **Port / Network Collision** | Senior Tech Lead | Follow canonical port allocations documented in `docs/deployment/local.md`. |
| **Dependency Version Mismatch** | Senior Tech Lead | Align to monorepo root catalog via `pnpm-workspace.yaml`. |
| **Type Definition Drift** | Senior Tech Lead | Regenerate types from shared contracts or Prisma schema. |
| **Implementation Logic Bug** | Respective Agent | Rerun agent with focused debugging prompt and failing test case. |
