# INDEX0 AI — Development Rules

These rules govern all engineering work on the INDEX0 AI codebase. They apply equally to human software engineers and autonomous AI coding agents.

---

## The 15 Core Principles

### 1. Contract First
All interfaces, data structures, event payloads, and API signatures must be defined in `@index0/contracts` before any service or frontend implementation begins. Implementation must strictly conform to the contract.

### 2. Small PRs
Pull requests must be small, focused, and reviewable in under 15 minutes. Avoid sweeping cross-cutting changes in a single PR.

### 3. One Responsibility Per PR
Each PR must solve one specific problem or introduce one cohesive capability. Never bundle unrelated refactors, styling changes, or dependencies.

### 4. No Undocumented Architecture Changes
The system architecture defined in the Master Technical Blueprint is authoritative. Do not replace technologies, alter service boundaries, or change routing without written Senior Tech Lead approval.

### 5. No Secrets in Git
Never commit secrets, API keys, tokens, or credentials to Git. All secrets must use environment variables loaded via `.env` (referencing `.env.example`). Automated secret scanning runs on every push.

### 6. Tests Are Mandatory
Every feature, bug fix, and contract definition must be accompanied by tests:
- Contracts: Type tests and schema validation tests
- Services: Unit tests and contract conformance tests
- Integrations: Mocked boundary and end-to-end scenario tests

### 7. CI Must Pass
No pull request may be merged if the continuous integration pipeline is failing or degraded. Bypassing CI checks is strictly forbidden.

### 8. Senior Tech Lead Owns Merge Authority
The Senior Tech Lead has sole merge authority on:
- `@index0/contracts`
- Infrastructure definitions (`infra/`)
- API Gateway (`services/gateway/`)
- Database schemas (`packages/db/prisma/`)
- CI/CD workflows (`.github/workflows/`)

### 9. AI Coding Agent Verification Protocol
All code written by autonomous AI coding agents (such as Google Antigravity, Claude Code, or IDE agents) must undergo automated type checking, contract verification, and Senior Tech Lead review before merging. Prompt guardrails and file scopes must be strictly defined.

### 10. Daily End-of-Day Integration Mandate
At the conclusion of each working day, all active agent workstreams must converge through the formal Daily End-of-Day Integration Protocol (`docs/tasks/DAILY_INTEGRATION_PLAN.md`). No unverified feature branches may linger unintegrated into the daily release checkpoint.

### 11. Production Configuration Must Be Documented
Every new configuration variable, environment toggle, or infrastructure dependency must be documented in `.env.example` and the respective deployment guide.

### 12. Internal Services Remain Private
Internal backend services (Agent Host, Sandbox Manager, Telemetry, Billing, Temporal, ClickHouse, PostgreSQL) must never be exposed directly to the public internet. All client traffic must traverse the API Gateway.

### 13. Every Important Execution Produces Telemetry
All agent runs, sandbox executions, tool invocations, billable operations, and API errors must generate immutable telemetry events with stable, unique event IDs.

### 14. Long-Running Workflows Use Durable Orchestration
Any operation that can exceed a standard HTTP request timeout (agent execution, sandbox lifecycle, environment deployment) must be orchestrated via Temporal workflows.

### 15. Public APIs Are Versioned & Backward-Compatible
All public endpoints exposed through the Gateway must follow explicit semantic versioning (e.g., `/v1/...`). Breaking changes require a new version path and formal deprecation schedules.

---

## Contract Violation Protocol

If an implementation cannot be completed without modifying an established contract:

```text
STOP.
DO NOT MODIFY THE CONTRACT CASUALLY.
REPORT: "CONTRACT VIOLATION"
REQUEST ARCHITECTURAL APPROVAL FROM THE SENIOR TECH LEAD.
```

---

## AI Agent Guardrail Template

Every task assigned to an AI coding agent (e.g. Antigravity Agent) must explicitly follow this specification format:

```text
ROLE: [Senior Tech Lead | Platform & Backend Systems Engineer (AI Agent) | Developer Experience & Client Systems Engineer (AI Agent)]
AGENT RUNTIME: [Google Antigravity / Claude Code / Subagent]
OBJECTIVE: [Exact task to accomplish]
CONTRACT: [Target contracts in @index0/contracts]
ALLOWED FILES: [Explicit list or glob of editable files]
DEPENDENCIES: [Approved packages only]
REQUIREMENTS: [Acceptance criteria]
FORBIDDEN CHANGES: [Architecture rewrites, contract edits, CI bypasses]
TESTS: [Required automated tests to write and pass]
DAILY EOD INTEGRATION: [Verification step for the daily integration scenario]
DEFINITION OF DONE: [Measurable completion state]
```
