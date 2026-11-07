# INDEX0 — Start to Results

One document that takes a reader from the original problem to what actually runs
today, with the command behind every claim. Where no command exists, it says so.

Last verified: 2026-11-07 on `main` at `73a4a0e`, node 26.10.0, pnpm 12.4.2, Docker 29.9.2.

---

## 0. Read this in five minutes

| If you want to know… | Read |
|---|---|
| Why the project exists and what changed since day one | §1–§2 |
| What is actually built, layer by layer | §3 |
| What a command proves right now | §4 |
| What you must **not** repeat as a claim | §5 |
| How to see it working yourself | §6 |
| What happens next | §7 |
| Which document to open for a given question | §8 |

The one-sentence version: **INDEX0 is a self-hosted agent platform whose only
definition of "done" is a candidate patch that a test suite actually ran and
passed inside a sandbox the agent could not edit.**

---

## 1. Where this started

The first commit (`4efda57`, 2026-09-17) is documentation, not code. The premise
it set out was narrow and still the organizing principle:

> A coding agent should not be trusted because it sounds confident. It should be
> trusted because a verification step ran — a real command, in a real sandbox,
> against the repository's own tests — and produced evidence.

Everything else grew from three commitments made in that first week:

1. **The gate must be able to fail.** A verification command that cannot exit
   non-zero is not a gate.
2. **The candidate must not own the judge.** The agent may edit the product code;
   it may not edit the tests that score it.
3. **Evidence over prose.** Any number in a README, deck, or pitch must be
   reproducible by a command in this repository, or be labelled unverified.

Those commitments are also the source of most of the honesty problems in the
history: the gate was broken twice (once trivially passing, once letting a
candidate edit tests), and both times the fix was smaller than the story that had
been told around it.

---

## 2. How it was built

70 commits, 2026-09-17 → 2026-11-06. 34 in September, 24 in October, 12 in
November. The shape of that history:

| Phase | Dates | What happened | Commits |
|---|---|---|---|
| **Inception** | 2026-09-17 | Architecture, runbooks, roadmap, an 8-day build plan | `4efda57`–`8fd10a1` |
| **Build week** | 2026-09-18 | One commit per day, day-01 → day-08: infra + DB + contracts, sandbox manager, web IDE, gateway + auth, OpenHands runtime, MCP registry, telemetry, billing | 8 × `feat(day-0N)` |
| **Hardening** | 2026-09-18 → 10-28 | Compose fixes, Azure/LiteLLM production router, OpenCode harness, MCTS + reverse-engineering, benchmark suite, then a long integrity pass | `33f981f`–`940f3e6`, `b43f947`–`dfeccfc` |
| **Proof** | 2026-10-29 → 11-04 | Real sandbox in the demo, free-model routes, QA gate fixes, claim audit, pitch rebuilds | `4cf206e`–`deb230f` |
| **Phase 0 audit** | 2026-11-06 | Six audit documents: current state, gap analysis, target architecture, technical decisions, verification matrix, roadmap | `12de774` |
| **Phase 1** | 2026-11-06 | Demo fixtures separated from production in the web workbench; production now fails visibly instead of faking replies | `73a4a0e` |

Two things are worth noticing in that timeline.

**The build week is real.** Day-01 through day-08 are eight commits, each
landing a working slice: contracts, sandbox manager, IDE, gateway, agent runtime,
MCP tooling, telemetry, billing. The repository has 622 TypeScript files and 26
documents to show for it.

**The integrity pass is the interesting part.** Between 2026-10-28 and 2026-11-06
the commits are almost all `fix:` — the QA gate always passing (`c8ebc51`),
the candidate editing its own tests (`5b7fff3`), a published LiteLLM key used as
a default (`d6ebf68`), source files imported but never tracked (`57565bd`), an
orchestrator that hung instead of failing closed (`03674ef`). That is the phase
where the project stopped describing itself and started being checkable.

---

## 3. What exists today

Five layers. Paths are real; test counts are from the 2026-11-07 run.

| Layer | What it is | Where | Tested by |
|---|---|---|---|
| **Surfaces** | Terminal CLI + full-screen TUI; browser IDE workbench (Monaco, agent panel, SSE); VS Code extension; Next.js portal | `packages/client-harness/`, `apps/ide/web/`, `apps/ide/extension/`, `apps/ai/` | 37 + 94 + 4 node tests |
| **Engine** | Python LangGraph 4-tier review loop — Architect → Developer → Critic → QA — with sandbox-backed verification | `services/agent-orchestrator/` | 30 pytest |
| **Sandbox** | TypeScript manager with Docker, E2B, Firecracker, and mock providers; 5-stage lifecycle (create → execute → capture → telemetry → teardown) | `services/sandbox-manager/` | 14 node tests |
| **Context + coordination** | `viking://` L0/L1/L2 compression host, MCP discovery, GNAP git-native messaging, worktree isolation | `packages/mcp-host/`, `packages/client-harness/src/{gnap,worktree}.ts` | 8 + 33 node tests |
| **Contracts + infrastructure** | `@index0/contracts` v1 schemas, Prisma/Postgres, Caddy gateway, Zitadel, ClickHouse/OpenMeter, Lago | `packages/contracts/`, `packages/db/`, `infra/` | 10 contract + 5 fixture + 22 gateway + 33 mcp + 34 telemetry + 24 billing conformance tests |

The engine is the product. The other four layers exist to let one claim survive
contact with reality: *the patch ran, the test failed, the agent tried again.*

---

## 4. What is proven today

Everything below was executed on 2026-11-07, not copied from an earlier run.

| Command | Result |
|---|---|
| `pnpm run typecheck` | **9 of 9** tasks pass |
| `pnpm run test` | **290 tests, 290 pass, 0 fail** across 12 node-test suites, exit 0 |
| `pnpm run build` | **8 of 8** tasks, exit 0 |
| `.venv-demo/bin/python -m pytest services/agent-orchestrator/tests` | **30 passed** |
| `.venv-demo/bin/python -m pytest services/voice-agent/tests` | **3 passed** |
| `node packages/client-harness/dist/cli.js --help` | prints the command surface: `run`, `plan`, `search`, `re-engineer`, `prompt`, `review`, `benchmark`, … |

Per-suite breakdown of the 290: ide-web 94, index0 (client-harness) 37,
telemetry 34, mcp 33, billing 24, fixtures 5, contracts 10, gateway 22,
sandbox-manager 14, mcp-host 8, db 5, ide-extension 4.

### The recorded demo run

`demo/runs/20261106T102423Z` is a real cycle, not a fixture. It contains
`request.json`, `candidate.patch`, `cycle.json`, and `summary.txt`. The summary:

```text
model        : groq
status       : qa_verified
iterations   : 3
critic       : approve
qa passed    : True
tests        : 3 passed / 0 failed in 2021 ms
sandbox      : live_microvm (exit 0)
files        : src/math.js
history      :
  architect  plan_proposal
  developer  implementation
  critic     review_verdict   request_changes
  developer  implementation
  critic     review_verdict   request_changes
  developer  implementation
  critic     review_verdict   approve
  qa         test_result      passed
```

Task: `src/math.js` returns `Infinity` when dividing by zero; make `divide()` throw
`RangeError('division by zero')` without breaking `average()`. The critic rejected
two attempts. On the third, QA ran the repository's own tests in a Docker
container and got 3 passed / 0 failed. That is the whole pitch in one artifact.

---

## 5. What is not proven — read this before repeating any number

**21 of 36 capabilities in `PROOF_STATUS.md` are Partial, In progress, or Not
verified. 0 of 3 external benchmarks (SWE-bench, AiderBench, Terminal-Bench) have
been run.** The market and performance numbers in older pitch material are
dispositioned claim-by-claim in `benchmarks/CLAIM_AUDIT.md`.

### Two integrity defects found in this audit (open, not fixed)

These matter more than the test counts, because they attack the one claim the
project is built on.

**1. The default sandbox is `mock`, and the mock passes anything.**
`infra/compose/sandbox-manager.yml` sets `SANDBOX_PROVIDER=${SANDBOX_PROVIDER:-mock}`,
and `resolveProvider()` in `services/sandbox-manager/src/config.ts` also falls back
to `mock`. `MockSandboxSession.execute()` in
`services/sandbox-manager/src/sandbox/mock-provider.ts` returns `exitCode: 0` with
fabricated stdout for input it does not recognise. So any deployment without an
E2B key and without an explicit `SANDBOX_PROVIDER=docker` will have a QA gate that
approves everything.

*Why the recorded demo is still honest:* `demo/run-demo.sh` sets
`SANDBOX_PROVIDER=docker` explicitly, so the run above really executed in a
container. The defect is the default for every other path.

**2. The `sandboxMode` label is hardcoded.**
`services/agent-orchestrator/src/graph/nodes/qa.py:211` writes
`"sandboxMode": "live_microvm"` on any successful sandbox call, whatever provider
actually ran. The provider name exists only in sandbox-manager telemetry, not in
the execute response, so the label cannot be checked downstream. The string
`live_microvm` in the demo summary is therefore an assertion by the orchestrator,
not a measured fact — the measured fact is that `run-demo.sh` requested Docker.

### Smaller defects, recorded so they are not rediscovered

| Location | What it does |
|---|---|
| `services/sandbox-manager/src/sandbox/desktop-provider.ts` | Fake provider: placeholder stdout, placeholder screenshot bytes, always exit 0. Not reachable from the provider factory, but it is not labelled as a scaffold in the provider list. |
| `packages/client-harness/src/benchmark-runner.ts:124-129` | Pushes `swe-bench-tasks-placeholder` / `aider-bench-tasks-placeholder` as task IDs, and is blocked when `agent-canvas/` is absent (that fork was removed in `dfeccfc`). |
| `packages/client-harness/src/anti-cheat.ts:386` | `checkNetworkAccess()` always returns `{accessed: false}`; nothing calls it. |
| `docs/INDEX0_VERIFICATION_MATRIX.md` | Carried a stale row claiming the demo/production split was "Not done" after Phase 1 shipped it. Corrected in the same pass as this document. |

Also unverified, and named as unverified in `PROOF_STATUS.md`: CLI cold start
under 20 ms (only in-process filter timing was measured), human intervention rate
per task, and `$0.00` token COGS.

---

## 6. Run the proof yourself

```bash
# node 26 is required; node 20 fails the engines check
export PATH="$HOME/.local/share/mise/installs/node/26.10.0/bin:$PATH"

cd INDEX0
pnpm install
pnpm run typecheck     # expect: 9 of 9 successful
pnpm run test          # expect: 290 pass, 0 fail
pnpm run build         # expect: 8 of 8 successful
```

The demo needs Docker and one free model key in `.env` (Groq or Gemini). No Azure,
no paid API:

```bash
./demo/run-demo.sh
```

Expect a cycle like §4: two critic rejections, a third attempt, QA executing in a
container with a non-zero-capable test command, artifacts written to
`demo/runs/<timestamp>/`. The script sets `SANDBOX_PROVIDER=docker` itself.

Python suites use the demo venv, because the system `pytest` on this machine is a
broken shim:

```bash
.venv-demo/bin/python -m pytest services/agent-orchestrator/tests -q
.venv-demo/bin/python -m pytest services/voice-agent/tests -q
```

---

## 7. Where the project goes next

The six-phase plan from the Phase 0 audit. One phase at a time; each phase may not
add features outside its scope, and `PROOF_STATUS.md` is updated before the phase
is called done.

| Phase | Work | Exit criterion | State |
|---|---|---|---|
| 0 | Repository audit and target architecture | Six docs, every claim traceable to a file or command | **done** (`12de774`) |
| 1 | Separate demo fixtures from production | Production starts empty and fails visibly; demo still works | **done** (`73a4a0e`) |
| 2 | `benchmarks/verified-bench/` | 20–30 tasks with hidden tests; same model, plain LLM vs INDEX0 loop; JSON + markdown; one-command reproducible; honest loss reported | next |
| 3 | One-command install and demo | A stranger gets to the demo with one command | — |
| 4 | Three surfaces on one engine | CLI, web workbench, and extension all drive the orchestrator | — |
| 5 | Scope trim | Voice, TabbyML, MCTS, TextGrad, billing, metering marked **roadmap**, not built | — |
| 6 | Proof and deck update | Every external number backed by a phase-2 result or removed | — |

**Parked on the roadmap, deliberately not built:** voice pipeline, TabbyML edge
autocomplete, MCTS multiverse search, TextGrad loop, Lago billing, OpenMeter
metering. They have code and configuration in the tree; they do not have an
end-to-end proven path.

---

## 8. Document index

| Question | Document |
|---|---|
| What is proven, capability by capability, right now | `PROOF_STATUS.md` |
| What is status / evidence / how to verify | `docs/INDEX0_VERIFICATION_MATRIX.md` |
| What exists, what is partial, what is mocked | `docs/INDEX0_CURRENT_STATE_AUDIT.md` |
| What is missing and in what order to close it | `docs/INDEX0_GAP_ANALYSIS.md`, `docs/INDEX0_IMPLEMENTATION_ROADMAP.md` |
| What the target architecture is and why | `docs/INDEX0_TARGET_ARCHITECTURE.md`, `docs/INDEX0_TECHNICAL_DECISIONS.md` |
| Which benchmark claim is real | `benchmarks/CLAIM_AUDIT.md` |
| How the system fits together technically | `docs/SYSTEM_ARCHITECTURE.md` |
| Pitch positioning, deck, and shots | `pitch/` |
| Deep-dive audits, one topic per file | `audit/` |

`docs/COMPLETE_PROJECT_LITERALLY_OVERVIEW.md` and
`docs/UNIFIED_DEV_TO_PROD_MASTER_PLAN.md` are long-form and partially predate the
integrity pass — read them for intent, not for current status.

---

## 9. The honest summary

INDEX0 started as a claim that verification, not confidence, is what makes an
agent trustworthy. It now has 290 green node tests, 33 green Python tests, a
clean build, and one recorded cycle where a critic rejected two patches before QA
proved the third in a container.

Everything that is not in that sentence is either infrastructure that supports it,
or unverified. The two open defects in §5 both weaken the sentence — a default
sandbox that approves anything, and a label that says `live_microvm` without
measuring it. Neither is hard to fix. Both are worth fixing before anyone outside
the project repeats the sentence as fact.
