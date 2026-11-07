# INDEX0 AI — Master Plan

**Strategic Vision · Product Definition · System Architecture · Execution Roadmap**

Version: 2026-11-07. Supersedes `INDEX0_IMPLEMENTATION_ROADMAP.md`,
`INDEX0_TARGET_ARCHITECTURE.md`, and `INDEX0_GAP_ANALYSIS.md`.
Every claim in this document is either traceable to a file/command in this
repository or explicitly marked as a target that is not yet built.

---

## The doctrine (permanent, non-negotiable)

> **Do not build an agent collection. Build an engineering intelligence system.**

This single rule determines every architecture decision:

- Research and evidence are first-class systems, not prompts
- The project model is the source of truth, not chat history
- Architecture is explicit and traceable before implementation begins
- Agents are replaceable execution workers — the orchestrator controls them
- The agent that writes never scores itself — verification is independent
- Completion requires measurable evidence, not "it looks done"

---

## 1. The problem

Software engineering is fragmented. Building a serious product requires people
to move between research tools, requirement documents, architecture diagrams,
IDEs, Git, testing tools, cloud infrastructure, and documentation — none of
which share a common model of the project.

AI coding tools have improved implementation speed. The deeper problems remain:

| Problem | What goes wrong |
|---|---|
| Insufficient research | Systems designed around assumptions, not verified facts |
| Weak requirements | Important workflows and edge cases missed |
| Architectural fragmentation | Individual components work, the whole system does not |
| Limited codebase understanding | Agents change code without understanding dependencies |
| Context loss | Decisions and history disappear between sessions |
| Unreliable execution | Generated changes fail, break integrations, leave incomplete work |
| Weak verification | Passing a few tests mistaken for production readiness |
| Operational complexity | Deployment, security and maintenance remain manual |

**INDEX0's thesis:** The next step is not better code generation alone. It is the
integration of research, evidence, intelligence, execution and verification into
one coherent engineering system.

---

## 2. The product

INDEX0 AI is an evidence-first autonomous software engineering environment that
can understand, research, design, build, verify, deploy, and continuously
maintain complete software systems.

### The five principles

1. Research before design
2. Evidence before decisions
3. Architecture before implementation
4. Verification throughout execution
5. Measurable proof before completion claims

### The engineering lifecycle

```
1. Vision and intent         — understand the problem, objectives, constraints
2. Deep research             — markets, docs, APIs, standards, open-source patterns
3. Evidence collection       — retrieve, extract, index, evaluate sources
4. Requirements intelligence — functional/non-functional requirements, acceptance criteria
5. System architecture       — frontend, backend, APIs, data, infra, security
6. Design intelligence       — UX patterns, user flows, component specs
7. Engineering planning      — dependency-aware work packages, verification gates
8. Autonomous implementation — agents, tools, terminals, sandboxes, worktrees
9. Continuous verification   — code, contracts, architecture, security, performance
10. Delivery and deployment  — release artifacts, infrastructure, migrations
11. Continuous maintenance   — monitor regressions, investigate incidents, evolve
```

---

## 3. What actually exists today

Honest inventory. Verified 2026-11-07 at commit `4282061`.

### Test suite baseline

| Command | Result |
|---|---|
| `pnpm run typecheck` | 9/9 pass |
| `pnpm run test` | 290 pass / 0 fail |
| `pnpm run build` | 8/8 pass |
| `pytest services/agent-orchestrator/tests` | 30 pass |
| `pytest services/voice-agent/tests` | 3 pass |
| `./demo/run-demo.sh` | `qa_verified`, 3 iterations, 3 tests in Docker container |

### The 10 packages and their real state

| Package / Service | What it is | State |
|---|---|---|
| `services/agent-orchestrator` | Python LangGraph 4-tier loop: Architect → Developer → Critic → QA | ✅ Working E2E |
| `services/sandbox-manager` | Docker/E2B/Firecracker sandbox with 5-stage lifecycle | ✅ Docker working |
| `services/voice-agent` | LiveKit + Pipecat voice pipeline | 🟡 Tests pass, no E2E |
| `packages/client-harness` | Terminal CLI + TUI + engine client | ✅ Working |
| `packages/contracts` | TypeScript schemas shared across all packages | ✅ Working |
| `packages/db` | Prisma + PostgreSQL (18 models) | ✅ Schema proven |
| `packages/mcp-host` | `viking://` context compression + MCP discovery | ✅ Working |
| `apps/ide/web` | React + Vite browser IDE (Monaco, agent panel, SSE) | 🟡 94 tests pass; orchestrator not wired |
| `apps/ide/extension` | VS Code extension | 🟡 4 tests pass; orchestrator not wired |
| `apps/ai` | Next.js marketing portal | 🟡 Builds; content needs update |

### Two open integrity defects (must fix before any investor demo)

**Defect 1 — Default sandbox is `mock`, and the mock passes anything.**
`infra/compose/sandbox-manager.yml` and `services/sandbox-manager/src/config.ts`
both fall back to `mock`. `MockSandboxSession.execute()` returns `exitCode: 0`
with fabricated stdout for unrecognised input. Any path without `E2B_API_KEY` or
an explicit `SANDBOX_PROVIDER=docker` has a QA gate that cannot fail. The
recorded demo is unaffected because `demo/run-demo.sh` sets Docker explicitly.

**Defect 2 — `sandboxMode` label is hardcoded.**
`services/agent-orchestrator/src/graph/nodes/qa.py:211` writes `live_microvm`
for any successful sandbox call. The provider name is only in sandbox-manager
telemetry, not in the execute response. The label is an assertion, not a fact.

### Intelligence subsystems — honest gap map

| Vision subsystem | Exists | State |
|---|---|---|
| Engineering Orchestrator (4-tier loop) | `services/agent-orchestrator/` | ✅ Working |
| Execution Environment (sandbox) | `services/sandbox-manager/` | ✅ Working |
| Research Engine | `packages/client-harness/src/search.ts` | 🟡 DuckDuckGo scrape only — no crawl, PDF, scheduling |
| Evidence Engine | nothing | ❌ Entire subsystem missing |
| Project Intelligence | `Project` DB model (stub) | ❌ No requirements, decisions, traceability |
| Architecture Intelligence | `architect.py` (154 lines) | 🟡 Code-level plans only — no blueprints |
| Verification Intelligence | sandbox QA gate | 🟡 Code execution only — no requirement/arch/security checks |
| Repository Intelligence | `.repograph/` (static index) | 🟡 Not a live graph |
| Design Intelligence | nothing | ❌ Missing |
| Traceability chain | nothing | ❌ Missing |
| Shared project state | nothing | ❌ Each surface disconnected |

### What stays roadmap (do NOT build in the 7-day plan)

| Feature | Exists as | Skip because |
|---|---|---|
| Voice pipeline (LiveKit) | `services/voice-agent/` | Needs external infra, latency unverified |
| TabbyML edge autocomplete | `infra/tabby/` config | Config only, no proven path |
| MCTS multiverse search | `services/agent-orchestrator/src/graph/mcts/` | Not wired to loop, no outcome proof |
| TextGrad backprop loop | `services/agent-orchestrator/src/textgrad/` | Same — no E2E proof |
| Lago billing live | `infra/lago/` config | Needs running instance + payment keys |
| OpenMeter metering | `infra/openmeter/` config | Same |
| SWE-bench official eval | `packages/client-harness/src/benchmark-runner.ts` | Needs OpenHands harness |
| Firecracker microVM | `services/sandbox-manager/src/sandbox/firecracker-provider.ts` | Needs host binary + kernel |
| Desktop sandbox | `services/sandbox-manager/src/sandbox/desktop-provider.ts` | Structural scaffold, unreachable |

---

## 4. The intelligence architecture (target)

```
USER INTENT / PROJECT VISION
  ↓
PROJECT INTELLIGENCE          — persistent project state, requirements, decisions
  ├── Research Engine         — discovery, crawl, PDF/HTML extraction, dedup
  ├── Evidence Engine         — sources, claims, provenance, confidence, contradictions
  ├── Architecture Intelligence — system design, blueprints, repository graph
  └── Verification Engine     — requirements, arch, code, security, performance

ENGINEERING ORCHESTRATOR      — plans, delegates, schedules, tracks, controls
  ↓
EXECUTION ENVIRONMENT         — agents, CLI, IDE, Git, worktrees, sandboxes, APIs
  ↓
VERIFIED ENGINEERING OUTPUT   — working software + evidence + architecture records
```

### 4.1 Research Engine (Phase 9)
Web search and discovery, recursive crawl, browser-based dynamic extraction,
PDF/DOCX/Markdown parsing, source deduplication, freshness, authority scoring,
scheduling, resumable jobs, searchable corpus, provenance.
Reuse: PostgreSQL, Temporal, `packages/mcp-host`, existing HTTP client.
New code: `services/agent-orchestrator/src/research/` (Python).

### 4.2 Evidence Engine (Phase 10)
Source registry, claim extraction, passage links, publication dates,
contradiction detection, confidence, staleness, provenance, machine-readable
evidence reports.
Reuse: PostgreSQL, contracts.

### 4.3 Project Intelligence (Phase 11)
Persistent project state: vision → requirements, personas, journeys, FR/NFR,
business rules, acceptance criteria, risk register, versioned spec.
Reuse: Architect agent extended with a "requirements" mode; evidence supplies
citations.

### 4.4 Architecture Intelligence (Phase 12)
Extend `architect.py` (do not replace). Frontend/backend/infra/auth/payments
blueprints, each linked to requirements and decisions.

### 4.5 Verification Intelligence (Phase 13)
Evidence quality, requirement coverage, architecture consistency, contract
compatibility, security, performance, reliability, acceptance criteria.
Traceability chain: `Requirement → Evidence → Decision → Task → Code → Test → Result`.

### 4.6 Autonomous engineering agents

| Agent | Responsibility |
|---|---|
| Product Researcher | Market, user and product research |
| Technical Researcher | Documentation, APIs, standards, technical evidence |
| Evidence Analyst | Claims, sources, contradictions, confidence |
| Requirements Architect | Requirements and acceptance criteria |
| System Architect | Complete system architecture and technical decisions |
| UX/UI Architect | User experience, interaction and interface design |
| Repository Analyst | Codebase understanding and dependency mapping |
| Engineering Planner | Dependency-aware task breakdown |
| Developer | Implementation and code changes |
| Reviewer | Independent code and design review |
| QA Engineer | Functional and regression verification |
| Security Engineer | Security assessment and remediation |
| DevOps Engineer | Infrastructure, deployment and operations |
| Maintenance Engineer | Incident investigation and continuous improvement |

Rule: **the agent that implements never scores itself.** Independent verification
and explicit approval gates always exist.

---

## 5. The target system architecture

### Surfaces (one engine, multiple interfaces)

| Surface | Purpose |
|---|---|
| Web IDE | Main project workspace and engineering control center |
| VS Code extension | Engineering assistance inside an existing IDE |
| CLI/TUI | Terminal-native workflows and automation |
| Background agents | Long-running research, implementation and maintenance |
| API/SDK | External developer platform integration |

All surfaces read from and write to the same project model. They are interfaces,
not separate brains.

### Technical layers

| Layer | What it is | Built on |
|---|---|---|
| Experience | Web IDE, extension, CLI, API | Existing React/Vite/TS |
| Identity | Auth, authorization, tenants | Zitadel (existing) |
| Project model | Persistent project state | Prisma/PostgreSQL (extend) |
| Intelligence | Research, evidence, architecture, verification | New modules on orchestrator |
| Orchestration | Agent coordination, durable workflows | LangGraph + Temporal (extend) |
| Execution | Git, terminals, worktrees, sandboxes, tools | Existing (extend) |
| Data | PostgreSQL, ClickHouse, search | Existing (extend) |
| Infrastructure | Deployment, observability, security | Existing Docker Compose |

### Database additions (additive only — no drops, no new engine)

All under `packages/db/prisma/schema.prisma`:

```
research_source      (id, url, domain, authority_score, retrieved_at, content_hash, version, status)
research_document    (id, source_id, kind, title, text, metadata jsonb)
research_claim       (id, document_id, passage, claim_text, confidence, extracted_at)
evidence_registry    (id, claim_id, source_id, passage_ref, published_at, retrieved_at)
requirement          (id, project_id, kind, title, body, acceptance_criteria, version, status)
architecture_decision(id, requirement_id, title, rationale, status)
traceability_link    (id, requirement_id, evidence_id, decision_id, task_id, code_change_ref, test_ref, verified_result_ref)
```

### API additions (FastAPI, additive only)

New routes under `services/agent-orchestrator/src/main.py`:
`/v1/research`, `/v1/evidence`, `/v1/requirements`, `/v1/architecture`, `/v1/verification`

SSE stream for research job progress. Contracts in `packages/contracts/src/v1/`.

### Architectural rules

1. Modular components over unnecessary microservices
2. Explicit API and event contracts
3. Long-running operations durable and resumable (Temporal)
4. Isolated execution for code changes (sandbox)
5. Project state maintained across sessions
6. Model providers replaceable (LiteLLM stays)
7. Operations observable and auditable (ClickHouse)
8. Tenant and permission boundaries enforced
9. External content treated as untrusted input
10. Reproducible tests and verification evidence required

---

## 6. The 7-day execution plan (investor-ready proof)

### What "done" means at Day 7

- Two integrity defects fixed
- Real benchmark numbers from `benchmarks/verified-bench/` (honest even if INDEX0 loses)
- All three surfaces (CLI, web IDE, extension) call the same engine
- One-command demo a stranger can run
- Every claim in README and deck backed by a command
- Tag `v0.1.0-investor-ready` pushed

---

### Day 1 — Fix the two integrity defects (3h)

**Why first:** everything built on a fake-passing gate is worthless.

| File | Change |
|---|---|
| `infra/compose/sandbox-manager.yml` | `SANDBOX_PROVIDER=${SANDBOX_PROVIDER:-docker}` |
| `services/sandbox-manager/src/config.ts` | `resolveProvider()` defaults to `docker`; logs a loud warning if mock is forced |
| `services/sandbox-manager/src/services/execution.service.ts` | Add `provider: this.provider.name` to the returned result object |
| `services/agent-orchestrator/src/graph/nodes/qa.py:211` | Read `sandbox_res.get("provider", "unknown")` — never hardcode `live_microvm` |

Exit test:
```bash
pnpm run test          # still 290/290
./demo/run-demo.sh
cat demo/runs/<latest>/summary.txt
# sandbox: docker (exit 0)   ← real label, not hardcoded
```
Update `PROOF_STATUS.md`: both defects closed.

---

### Day 2 — Real benchmarks: `benchmarks/verified-bench/` (6h)

20 hand-written coding tasks. Plain LLM vs INDEX0 loop. Same free model. Hidden
tests the agent cannot see or edit. Report honestly even if INDEX0 loses.

**Structure:**
```
benchmarks/verified-bench/
  tasks/
    001-divide-zero/
      task.json          # { id, description, files_to_fix, test_command }
      workspace/src/     # broken code (agent sees this)
      tests/             # hidden (agent cannot see or edit)
    002-null-check/
    ...020-...
  runner.sh              # one command: all 20 tasks, both modes
  RESULTS.md             # auto-generated, honest pass/fail table
  REPRODUCIBILITY.md     # exact model + date + commands
```

**Task categories** (all self-contained, dependency-free):

| Tasks | Bug type | Language |
|---|---|---|
| 1–5 | Null / zero / bounds errors | JavaScript |
| 6–10 | Off-by-one, wrong operator | Python |
| 11–15 | Type coercion bugs | TypeScript |
| 16–18 | Async / race conditions | JavaScript |
| 19–20 | Edge cases: empty / large input | Python |

Exit test:
```bash
./benchmarks/verified-bench/runner.sh --model groq
cat benchmarks/verified-bench/RESULTS.md   # real numbers
```
Update `PROOF_STATUS.md` with real benchmark numbers.

---

### Day 3 — One-command quick-start (4h)

A stranger with Docker and one free API key reaches a proven demo in one command.

```bash
./quick-start.sh
```

Script does:
1. Check Docker running
2. Check node ≥ 22 (print fix command if missing)
3. Create `.env` from `.env.example`, prompt for ONE key (Groq — free, no card)
4. Create `.venv-demo` if absent
5. Run `./demo/run-demo.sh`
6. Print: `VERIFIED — qa_verified, N passed / 0 failed`

Exit test: delete `.env` and `.venv-demo`, run `./quick-start.sh` → demo passes.

---

### Day 4 — Three surfaces on one engine (6h)

CLI already calls the orchestrator (`engine.ts` → `POST /cycles/start`). Wire
the other two.

**Web IDE** — `apps/ide/web/src/workbench/Workbench.tsx`:
- Add `VITE_ORCHESTRATOR_URL` env var (default `http://localhost:8000`)
- Replace the `[ERROR] No agent runtime connected` block in `handleSendMessage`
  with a real `fetch` to `/cycles/start` (~20 lines)
- Update terminal lines and agent messages from `cycle.history`

**VS Code Extension** — `apps/ide/extension/src/extension.ts`:
- Add `runCycle(task: string)` → `POST orchestratorUrl/cycles/start`
- Same `IOrchestratorCycleResponse` shape as CLI engine
- Wire to Agent Execution Pane send button (~30 lines)

Exit test:
```bash
# All three with orchestrator + sandbox running:
index0 review "fix divide-by-zero"       # → qa_verified in terminal
# Web IDE: type task → real cycle runs
# Extension: "INDEX0: Run Review" → real cycle runs in output pane
```

---

### Day 5 — Scope trim (2h)

No unproven claim anywhere a user or investor sees.

| Location | Change |
|---|---|
| `README.md` benchmarks section | Replace with Day 2 real numbers + reproduce command |
| `README.md` features | Mark voice/TabbyML/MCTS/TextGrad/Lago/OpenMeter as `[roadmap]` |
| `pitch/deck-13.html`, `deck-uber.html` | Replace every unverified `%` / `x` / `ms` / `$` with Day 2 result or `[roadmap]` |
| `PROOF_STATUS.md` | Change `In progress` to `Roadmap` for voice/TabbyML/code-server |
| `packages/client-harness/src/benchmark-runner.ts` | Replace placeholder task IDs with `// roadmap: requires OpenHands harness` |
| `services/sandbox-manager/src/sandbox/desktop-provider.ts` | Add `// scaffold: not reachable from provider factory` |

Exit test:
```bash
grep -r "96.2\|97.0\|82.5\|8.2x\|<20ms\|0.2 per task\|\$0.00" \
  $(git ls-files "*.md" "*.html") | grep -v "CLAIM_AUDIT\|base64"
# → 0 results
```

---

### Day 6 — Proof and deck update (4h)

Replace every unverified number in the deck with Day 2 results or `[roadmap]`.

Rules:
- Every number gets a footnote: `Source: benchmarks/verified-bench/RESULTS.md`
- No number without a reproduce command
- Positioning, motto and story stay — only unsupported claims change
- Rebuild PDFs: `cd pitch && bash build-deck-13.sh && bash build-deck-uber.sh`

Exit test: open deck PDF → zero numbers without a source footnote.

---

### Day 7 — Full sweep, tag, and demo video (3h)

```bash
export PATH="$HOME/.local/share/mise/installs/node/26.10.0/bin:$PATH"
pnpm run typecheck      # 9/9
pnpm run test           # ≥290/290
pnpm run build          # 8/8
.venv-demo/bin/python -m pytest services/agent-orchestrator/tests  # 30/30
.venv-demo/bin/python -m pytest services/voice-agent/tests          # 3/3
./demo/run-demo.sh      # qa_verified
./benchmarks/verified-bench/runner.sh --model groq  # reproduces Day 2

git add -A
git commit -m "feat: investor-ready v0.1.0 — all phases complete"
git tag v0.1.0-investor-ready
git push origin main --tags
```

Record a 2-minute screen capture of `./demo/run-demo.sh` running live — critic
rejecting, developer revising, QA passing. No cuts. Committed to `demo/`.

---

## 7. The 6-month roadmap (after investor-ready week)

Each phase has its own acceptance criteria document before work starts.
No phase begins before the previous one passes. `PROOF_STATUS.md` updated at
the end of every phase.

### Phase 8 — Research foundation (Month 1)

Build web search → recursive crawl → PDF/HTML/DOCX extraction → dedup →
scheduling → persistent storage.

Deliverables:
- Contracts: `packages/contracts/src/v1/research/`
- DB: `research_source`, `research_document` tables in Prisma
- Module: `services/agent-orchestrator/src/research/` with crawler + scheduler
- API: `POST /v1/research/start`, `GET /v1/research/{id}`, SSE progress stream
- Tests: one end-to-end crawl against a fixture site

Reuses: PostgreSQL, Temporal, `packages/mcp-host`, existing HTTP client.

Acceptance: `POST /v1/research/start` with a real URL → job completes → documents
stored → retrievable with provenance.

### Phase 9 — Evidence Engine (Month 2)

Claim extraction from research documents, source-to-claim links, confidence
scoring, contradiction detection, provenance, machine-readable evidence reports.

Deliverables:
- DB: `research_claim`, `evidence_registry` tables
- API: `POST /v1/evidence/extract`, `GET /v1/evidence/{id}`
- Evidence report format in contracts

Acceptance: evidence report for one real research run, every claim linked to a
passage with a source URL and retrieval date.

### Phase 10 — Project intelligence (Month 3)

Persistent project state: vision → requirements, personas, journeys, FR/NFR,
acceptance criteria, risk register, versioned spec — all backed by research and
evidence.

Deliverables:
- DB: `requirement`, `architecture_decision` tables
- Architect agent extended with a "requirements" mode
- All surfaces read from this model instead of reconstructing from chat

Acceptance: create a project, attach a requirement to an evidence claim, retrieve
it from CLI and web IDE.

### Phase 11 — Architecture and design intelligence (Month 4)

Extend `architect.py` to produce complete system blueprints (frontend, backend,
infra, auth, payments), each linked to requirements and decisions. Repository
intelligence graph extended from `.repograph/` to answer dependency questions.

Deliverables:
- Architect agent "blueprint" mode
- Repository graph answering: "what breaks if this API changes?"
- DB: `architecture_decision` fully populated

Acceptance: give the architect a set of requirements → get a complete blueprint
with traceable decisions.

### Phase 12 — Global verification (Month 5)

Cross-layer validation. Requirement coverage checks. Architecture compliance.
Traceability chain: `Requirement → Evidence → Decision → Task → Code → Test → Result`.

Deliverables:
- DB: `traceability_link` table
- Verification reports for requirement coverage and architecture compliance
- Security gate (Semgrep/Trivy wired to CI)

Acceptance: change a requirement → system identifies affected code, tests and
deployment dependencies.

### Phase 13 — Unified IDE and production autonomy (Month 6)

All surfaces on one shared project model. Background agents for long-running
research and maintenance. API/SDK for external integration. End-to-end demo:
describe a product → INDEX0 delivers working, tested, deployed application.

Deliverables:
- Web IDE shows research, evidence, requirements, architecture panels
- Background agent runner for long-running tasks
- Public API with SDK
- End-to-end demo: multi-step product → working app with full evidence trail

Acceptance: founder describes a product → INDEX0 delivers a working, testable
application with a traceability report from vision to verified result.

---

## 8. Autonomy and control model

| Action | Control required |
|---|---|
| Research public documentation | Autonomous |
| Analyse a repository (read-only) | Autonomous |
| Generate requirements and architecture | Autonomous proposal, human approval |
| Create isolated worktree changes | Permitted within configured scope |
| Run tests and static analysis | Autonomous |
| Modify protected branches | Approval required |
| Access production secrets | Explicit permission |
| Deploy to production | Approval and policy gates |
| Destructive database operations | Explicit approval |
| Modify billing or cloud resources | Permission and cost controls |

Additional safeguards: prompt injection protection, secrets isolation, sandbox
resource limits, network access controls, audit logs, rollback and recovery,
supply-chain security, data retention policies, human override at any point.

---

## 9. What makes INDEX0 defensible

The moat is not a particular model or chat interface. Those can be replicated.
The potential long-term differentiation:

1. **Evidence infrastructure** — engineering decisions traceable to sources
2. **Project intelligence** — persistent, structured understanding of the project
3. **Repository intelligence** — live graph of dependencies, architecture, implementation
4. **Engineering orchestration** — reliable execution across agents, tools, environments
5. **Verification infrastructure** — proof that requirements, code and systems work
6. **Lifecycle integration** — one continuous system from idea to production
7. **Accumulated knowledge** — project-specific decisions, failures, corrections, patterns

A competitor can copy a chat interface. Reproducing a mature, interconnected
engineering intelligence and verification system is a much harder problem.

This is a potential moat, not an established one. INDEX0 must demonstrate
measurable improvements over existing workflows before claiming defensibility.

---

## 10. How success is measured

| Metric | What it measures |
|---|---|
| Research coverage | Requirements supported by research evidence |
| Evidence traceability | Claims with verifiable sources |
| Requirement coverage | Requirements implemented and verified |
| Architecture compliance | Changes consistent with approved decisions |
| Task completion reliability | Tasks completed without manual repair |
| First-pass verification | Changes passing independent verification initially |
| Regression rate | Existing functionality broken by new changes |
| Recovery rate | Failed tasks recovered successfully |
| End-to-end delivery | Complete working systems against acceptance criteria |
| Engineering efficiency | Time and human effort saved without sacrificing quality |

The most important benchmark: real-world engineering tasks on unfamiliar
repositories. `benchmarks/verified-bench/` is the start of this. Official
SWE-bench, AiderBench and Terminal-Bench evaluations come after the core
lifecycle is proven.

---

## 11. The ultimate vision

A founder describes a software product. INDEX0:

1. Researches the problem and validates the opportunity
2. Understands the domain and identifies real constraints
3. Produces evidence-backed requirements
4. Designs the complete software architecture
5. Builds the interface and backend
6. Coordinates specialized engineering agents
7. Executes code in isolated environments
8. Tests and independently verifies the system
9. Deploys with controlled permissions
10. Maintains and improves the software over time

All within one connected engineering environment, with full traceability from
the original idea to the running production system.

**Not just generating code. Engineering complete, working software systems.**

---

## 12. The one rule for everything built from here

> Never update a `PROOF_STATUS.md` row to **Working** unless a command in this
> repository produces the evidence.

If a day runs over, mark the capability **Partial** and move on. A partial that
says it is partial is better than a Working that is not.

---

*This document is the master product vision and execution plan. The six
Phase 0 audit documents (`INDEX0_CURRENT_STATE_AUDIT.md`,
`INDEX0_VERIFICATION_MATRIX.md`, `PROOF_STATUS.md`,
`INDEX0_GAP_ANALYSIS.md`, `INDEX0_TARGET_ARCHITECTURE.md`,
`INDEX0_TECHNICAL_DECISIONS.md`) remain as the technical baseline. Every
feature, architecture decision, and investor claim must be consistent with both —
and the repository's actual proof always takes precedence over the vision.*
