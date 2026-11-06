# INDEX0 CURRENT STATE AUDIT

Date: 2026-11-06. Commit audited: `b148ba8` (main), post-Phase-1 baseline.
Scope: what actually exists, what is verified, what is partial, what is mocked.
Rule: every claim below is traceable to a file, test, or command output in this repository.

## 1. Repository map (top level)

```
apps/ai                          Next.js 15 portal/marketing/downloads/docs
apps/ide/web                     React + Vite browser IDE workbench (94 tests)
apps/ide/extension               VS Code extension (4 tests)
services/agent-orchestrator      Python LangGraph 4-tier review loop + MCTS + TextGrad + reengineering
services/sandbox-manager         TypeScript Docker/E2B/Firecracker sandbox + probes
services/voice-agent             Python LiveKit + Pipecat WebRTC
packages/client-harness          `index0` CLI/TUI + engine + GNAP + worktree
packages/contracts               @index0/contracts v1 (TypeScript schemas)
packages/db                      Prisma 16 schema + migrations
packages/mcp-host                viking:// L0/L1/L2 context host + MCP discovery
infra/                           Docker Compose stacks (postgres, clickhouse, temporal, litellm, livekit, tabby, code-server, caddy, zitadel)
benchmarks/                      claim audit, empirical results, reproducibility
tests/                           contracts, fixtures, gateway, mcp, telemetry, billing (node --test)
docs/                            architecture, deployment, runbooks, security, tasks
pitch/, demo/                    investor deck + end-to-end demo
```

## 2. Verified capability inventory (command-proven)

| Capability | Status | Evidence |
|---|---|---|
| Monorepo install (`--frozen-lockfile`) | Working | `pnpm install` exit 0, Prisma client generated (`packages/db`) |
| TypeScript typecheck | Working | `pnpm run typecheck` 9/9 tasks |
| Monorepo tests | Working | `pnpm run test` 290 pass / 0 fail, 12 node-test suites |
| Python orchestrator tests | Working | `pytest services/agent-orchestrator/tests` 30 pass |
| Python voice-agent tests | Working | `pytest services/voice-agent/tests` 3 pass |
| Sandbox manager tests | Working | `services/sandbox-manager/test/*.test.ts` (part of the 12 suites) |
| Web IDE tests | Working | `apps/ide/web` 94 pass |
| Client-harness tests | Working | `packages/client-harness/test/*.test.ts` |
| Contract tests | Working | `tests/contracts/*.test.ts` |
| Docker Compose config | Working | `docker compose -f infra/compose/docker-compose.yml config` exit 0 |
| License audit | Working | `scripts/license-check.sh` passes, no AGPL leaks |
| 4-tier review loop (end to end) | Working | `./demo/run-demo.sh` → `qa_verified`, 3 iterations, 3 passed / 0 failed, 2021 ms, `live_microvm`, exit 0. Artifacts `demo/runs/20261106T102423Z` |
| Docker sandbox provider | Working | `services/sandbox-manager/src/sandbox/docker-provider.ts` (`--network none`, `-v /src:ro`, `--pids-limit=64`) |
| E2B sandbox provider | Working | `services/sandbox-manager/src/sandbox/e2b-provider.ts` (requires `E2B_API_KEY`) |
| Anti-cheat baseline/compare | Working | `packages/client-harness/src/anti-cheat.ts`: hashes test/evaluator/infra files, emits `INVALID_RUN` on drift |
| GNAP | Working | `packages/client-harness/src/gnap.ts`, `.gnap/` artifacts |
| Git worktree isolation | Working | `packages/client-harness/src/worktree.ts` |
| Context compression (string transform) | Working | `packages/mcp-host/src/viking/*`, transform ratio measured locally |
| Terminal ANSI filter | Working | `packages/client-harness/src/filter.ts` |
| Web search | Working | `packages/client-harness/src/search.ts` |
| TypeScript contracts | Working | `packages/contracts/`, `tests/contracts/` |
| PostgreSQL schema | Working | `packages/db/prisma/schema.prisma`, `pnpm db:generate` |
| GitHub Device Flow auth | Working | `packages/client-harness/src/auth.ts` |

## 3. Partial / unverified capabilities

| Capability | Status | Evidence / gap |
|---|---|---|
| Firecracker microVM provider | Partial | `services/sandbox-manager/src/sandbox/firecracker-provider.ts` exists; needs Firecracker binary + kernel image on host; not in CI |
| Perf stat probe | Partial | `services/sandbox-manager/src/sandbox/probes/profiler.ts`; needs Linux `perf` + elevated perms |
| ThreadSanitizer probe | Partial | `services/sandbox-manager/src/sandbox/probes/sanitizer.ts`; needs TSan binary |
| Property fuzzer probe | Partial | `services/sandbox-manager/src/sandbox/probes/fuzzer.ts`; not in CI |
| MCTS multiverse search | Partial | `services/agent-orchestrator/src/graph/mcts/engine.py`, `tree.py`; not integrated into the review loop; no benchmark |
| TextGrad feedback loop | Partial | `services/agent-orchestrator/src/textgrad/feedback_engine.py`; not tested end to end |
| Autonomous re-engineering | Partial | `index0 re-engineer` wired in CLI; `services/agent-orchestrator/src/reengineering/*`; smoke test only, no verified production run |
| Voice pipeline (LiveKit + Pipecat) | In progress | `services/voice-agent/`; tests 3/3; latency figures UNVERIFIED |
| Edge autocomplete (TabbyML) | In progress | `infra/tabby/` + compose overlay; latency UNVERIFIED |
| Web IDE (code-server) | In progress | `infra/code-server/`; live URL not confirmed |
| Semgrep / Trivy gates | Partial | Referenced in `scripts/license-check.sh` and compose; not a CI gate |
| ClickHouse telemetry | Partial | Schema + tests; needs running instance |
| OpenMeter metering | Partial | Config + tests; needs running instance |
| Lago billing | Partial | Config + tests; needs running instance |
| SWE-bench / AiderBench / Terminal-Bench | Not verified | Official evals not run (`benchmarks/CLAIM_AUDIT.md`) |
| CLI cold-start <20ms | Not verified | In-process filter timing only |
| Human intervention rate 0.2/task | Not verified | No logged runs with intervention tracking |
| \$0.00 cloud token COGS | Not verified | No cost accounting run |

## 4. Simulated / demo-only code (must not be cited as operational)

| Location | What it actually is |
|---|---|
| `apps/ide/web/src/workbench/Workbench.tsx` | Phase 1 (2026-11-06): demo fixtures moved to `apps/ide/web/src/workbench/demoFixtures.ts`; `demo` prop gates them; production defaults are now empty; `handleSendMessage` in production appends `[ERROR] No agent runtime connected...` and sets status `failed` instead of fabricating a reply. Orchestrator wiring still pending (Phase 4). `files`/`toolCalls` no longer `const`-seeded in production. |
| `apps/ide/web/src/workbench/Workbench.tsx` (diff) | `diffOriginalContent` is a hardcoded string |
| `apps/ide/web/test/workbench.test.ts` | Only instantiates React elements with props; does not exercise the agent loop |
| `packages/client-harness/src/benchmark.ts` (Exercism smoke) | Hand-authored implementations, not agent output — now labeled `SMOKE CHECK ONLY` |
| `packages/client-harness/src/benchmark.ts` (SWE smoke) | 4 hardcoded Python scripts, not SWE-bench instances — labeled `SMOKE CHECK ONLY` |
| `demo/workspace`, `demo/workspace-delivery` | Deliberate broken fixtures for the demo loop, not product code |

## 5. CI failure diagnosis (run 42205947793)

- Monorepo build + typecheck + tests passed locally on `main` at `b148ba8` (node 26.10.0): 290/290 tests, 9/9 typecheck, compose config valid, license audit clean, python services 30 + 3 pass.
- `apps/ide/web` passes 94/94 locally.
- CI pins node 22 and the web test command is `tsc && node --test test/*.test.ts`. No node 22 install is available in this environment, so the exact CI failure could not be reproduced here; the most likely causes are (a) a node-22 vs node-26 type-stripping difference in the test runner, or (b) timing/`setTimeout`-based assertions in the workbench tests. **This is unverified** — it must be reproduced on node 22 before claiming a fix. The prompt's "70 pass / 2 fail" count also does not match the current 94-test suite, so the failing run likely predates recent commits.
- The two tests that the issue refers to could not be identified from the local run; no test in the current tree fails. This must be recorded as "not reproduced locally", not as "fixed".

## 6. Architecture inconsistencies found

- `DEFAULT_FILES`/`DEFAULT_TABS` in the web workbench are a demo fixture baked into production component defaults — production callers cannot distinguish "no workspace loaded" from "demo workspace loaded".
- `handleSendMessage` simulates an agent (setTimeout + canned reply) instead of calling the orchestrator client (`packages/client-harness` / `services/agent-orchestrator` API). The workbench is therefore not on the same engine as the CLI.
- `services/agent-orchestrator` exposes MCTS and TextGrad modules that are not wired into `review_loop.py` (partial).
- Voice / Tabby / code-server are `in progress` and their latency claims are unverified.
- `benchmarks/REPRODUCIBILITY.md` and `benchmarks/EMPIRICAL_BENCHMARK_RESULTS.json` are modified in the working tree (user-owned, not touched by this audit).

## 7. Reuse vs. new development

Reuse (do not rewrite):
- `services/agent-orchestrator/src/graph/review_loop.py` + nodes (architect/developer/critic/qa) — the engine.
- `services/sandbox-manager` Docker provider — the verified sandbox.
- `packages/contracts` — authoritative schemas; `IAgentPlanStep`, `IAgentMessagePayload`, `AgentRunStatus`.
- `packages/client-harness/src/engine.ts` — LLM routing + review loop client.
- `packages/mcp-host` — viking context + MCP discovery.
- `packages/db` Prisma schema.

Modify:
- Web workbench: separate demo fixtures from production (props already support `initialFiles`/`initialTabs`; defaults must not be the demo).
- Wire workbench `handleSendMessage` to the real orchestrator instead of `setTimeout`.
- Extend `Architect` agent for design/blueprint generation (Phase 5 of the new plan), not replace.

New (only after Phase 0 acceptance):
- Research subsystem, evidence subsystem, project intelligence, verification engine — per the phased plan.

## 8. Exact next engineering tasks (priority order)

1. Reproduce the CI web test failure on node 22 (install node 22 or use the CI container) and name the two tests.
2. Separate demo fixtures from production in `apps/ide/web/src/workbench/Workbench.tsx` (make `initialFiles`/`initialTabs` required-or-empty, move `DEFAULT_*` into a `demo/` module).
3. Wire `handleSendMessage` to the orchestrator (smallest fix: reuse the existing SSE/stream client).
4. Phase 2: `benchmarks/verified-bench/` — 20-30 tasks, hidden tests, plain-LLM vs INDEX0 runner, JSON + markdown, one command.
5. Phase 3: pin node version in install docs / script (default node 20 fails engine check).
6. Phase 4: confirm CLI + extension + web all call the same engine and render the same evidence report.
7. Phase 5: mark voice/Tabby/MCTS/TextGrad/billing/metering as "roadmap" in README + pitch.
8. Phase 6: update `PROOF_STATUS.md` + deck numbers from Phase 2 results.

Nothing in this audit adds features. No code was changed.
