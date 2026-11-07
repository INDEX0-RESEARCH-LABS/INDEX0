# PROOF_STATUS.md

Current proof-of-work status for every claimed capability.
Filled only from direct inspection of this repository. "Not verified" means the code or test was not found during this audit.

> Last updated: 2026-11-07. Review against latest commit before citing externally.
> 15 of 36 capabilities are verifiable today; 0 of 3 published benchmarks.

## Re-verification, 2026-11-07

Executed on `main` at `73a4a0e` (node 26.10.0, pnpm 12.4.2):

| Command | Result |
|---|---|
| `pnpm run typecheck` | 9 of 9 tasks pass |
| `pnpm run test` | 290 tests, 290 pass, 0 fail across 12 node-test suites, exit 0 |
| `pnpm run build` | 8 of 8 tasks, exit 0 |
| `.venv-demo/bin/python -m pytest services/agent-orchestrator/tests` | 30 passed |
| `.venv-demo/bin/python -m pytest services/voice-agent/tests` | 3 passed |
| `node packages/client-harness/dist/cli.js --help` | command surface printed |
| `demo/runs/20261106T102423Z` | `qa_verified`, 3 iterations, 3 passed / 0 failed in 2021 ms, exit 0 |

Nothing regressed against 2026-11-06. Two integrity defects were found in the same
pass and are recorded below; they do not change any row in the table, but they
weaken two rows that are currently marked Working.

## Known integrity defects (open, 2026-11-07)

1. **Default sandbox is `mock`, and the mock passes anything.** `infra/compose/sandbox-manager.yml` defaults `SANDBOX_PROVIDER` to `mock`; `resolveProvider()` in `services/sandbox-manager/src/config.ts` also falls back to `mock`; `MockSandboxSession.execute()` returns `exitCode: 0` with fabricated stdout for unrecognised input. Any deployment without `E2B_API_KEY` and without an explicit `SANDBOX_PROVIDER=docker` has a QA gate that approves everything. The recorded demo is unaffected because `demo/run-demo.sh` sets `SANDBOX_PROVIDER=docker` explicitly.
2. **`sandboxMode` is hardcoded.** `services/agent-orchestrator/src/graph/nodes/qa.py:211` writes `"sandboxMode": "live_microvm"` for any successful sandbox call, regardless of the provider that ran. The provider name exists only in sandbox-manager telemetry, not in the execute response, so the label cannot be verified downstream.

Reproduce both by reading the four files named above; no runtime setup required.

## Baseline run, 2026-11-06

Executed on `main` at `deb230f` (node 26.10.0, pnpm 12.4.2, Docker 29.9.2):

| Command | Result |
|---|---|
| `pnpm install --frozen-lockfile` | exit 0, Prisma client generated |
| `pnpm run typecheck` | 9 of 9 typecheck tasks pass |
| `pnpm run test` | 290 tests, 290 pass, 0 fail across 12 node-test suites, exit 0 |
| `./demo/run-demo.sh` | `qa_verified`: 3 iterations, critic rejected twice then approved, `3 passed / 0 failed` in 2021 ms, sandbox `live_microvm`, exit 0. Artifacts: `demo/runs/20261106T102423Z` |

`pnpm run test` was red before this run, in one place: `packages/client-harness/test/benchmark.test.ts` asserted that all 5 Exercism smoke exercises execute, and got 0. Cause: the smoke check shelled out to `pytest`, then fell back to `unittest discover`, which cannot collect module-level `test_*` functions — so a missing or broken pytest scored 0/5 silently. Replaced with a stdlib `python3` collector that runs each `test_*` function and exits non-zero when it collects none (`packages/client-harness/src/benchmark.ts`). Now 5/5, and the measurement note says "no test framework".

Branch `feat/sovereign-agi-stack` is fully merged into `main` (0 commits ahead, last commit 2026-09-27).

---

| Capability | Status | Evidence (file path or test name) |
|---|---|---|
| **Terminal CLI (`index0` binary)** | Working | `packages/client-harness/package.json` bin entry; source at `packages/client-harness/src/cli.ts`; build script `pnpm --filter @index0/client-harness build` |
| **Interactive TUI (full-screen terminal)** | Working | `packages/client-harness/src/launcher.ts`, `packages/client-harness/src/ui.ts`; tested in `packages/client-harness/test/launcher.test.ts` |
| **GitHub Device Flow login** | Working | `packages/client-harness/src/auth.ts`; tested in `packages/client-harness/test/auth.test.ts` |
| **LLM prompt routing via LiteLLM** | Working | `packages/client-harness/src/engine.ts`; LiteLLM config at `infra/litellm/`; Docker Compose service in `infra/compose/litellm.yml` |
| **4-tier review loop (Architect, Developer, Critic, QA)** | Working | Live end-to-end run on 2026-11-06 through LiteLLM on the free `groq` route: the critic rejected two patches, the developer revised, and the QA tier executed the candidate in a network-isolated `node:22` container against the repository's own tests (3 passed / 0 failed, 2021 ms, exit 0, `live_microvm`). Evidence: `demo/runs/20261106T102423Z`. Earlier run 2026-10-29 used `azure-gpt-4o`, 4 passed / 0 failed: `demo/runs/`. `pytest services/agent-orchestrator/tests` passes 28/28 and runs in CI job `python-services`. Reproduce with `./demo/run-demo.sh`. |
| **Git-native agent coordination (GNAP)** | Working | `packages/client-harness/src/gnap.ts`; writes to `.gnap/` directory; tested in `packages/client-harness/test/gnap.test.ts` |
| **Git worktree isolation** | Working | `packages/client-harness/src/worktree.ts`; tested in `packages/client-harness/test/worktree.test.ts` |
| **Context compression (viking://) - string transform** | Working | `packages/mcp-host/src/`; transform ratio measured and labeled as local string estimate in benchmark output; tested in `packages/client-harness/test/benchmark.test.ts` |
| **Context compression - end-to-end agent token savings** | Not verified | No paired agent outcome measurement exists. See `benchmarks/CLAIM_AUDIT.md` |
| **Terminal ANSI token filter** | Working | `packages/client-harness/src/filter.ts`; tested in `packages/client-harness/test/filter.test.ts` |
| **Web search integration** | Working | `packages/client-harness/src/search.ts`; tested in `packages/client-harness/test/search.test.ts` |
| **TypeScript schema contracts** | Working | `packages/contracts/`; tested in `tests/contracts/` |
| **PostgreSQL schema and migrations** | Working | `packages/db/`; Prisma schema present; `pnpm db:generate` and `pnpm db:push` scripts defined |
| **Docker Compose infrastructure stack** | Working | `infra/compose/docker-compose.yml` and overlay files; `pnpm run infra:up` and `pnpm run infra:all:up` verified in `package.json` |
| **E2B sandbox provider** | Working | `services/sandbox-manager/src/sandbox/e2b-provider.ts`; requires `E2B_API_KEY` |
| **Firecracker microVM sandbox provider** | Partial | `services/sandbox-manager/src/sandbox/firecracker-provider.ts` exists; requires Firecracker binary and kernel image installed on host; not tested in CI |
| **Docker sandbox provider** | Working | `services/sandbox-manager/src/sandbox/docker-provider.ts` |
| **Perf stat probe (Linux hardware counters)** | Partial | `services/sandbox-manager/src/sandbox/probes/profiler.ts` exists; requires Linux `perf` tool and elevated permissions; not tested in CI |
| **ThreadSanitizer probe** | Partial | `services/sandbox-manager/src/sandbox/probes/sanitizer.ts` exists; requires TSan-compiled binary; not tested in CI |
| **Property fuzzer probe** | Partial | `services/sandbox-manager/src/sandbox/probes/fuzzer.ts` exists; not tested in CI |
| **MCTS multiverse search engine** | Partial | `services/agent-orchestrator/src/graph/mcts/engine.py` and `tree.py` exist; integration with review loop not demonstrated; no benchmark result |
| **TextGrad backpropagation loop** | Partial | `services/agent-orchestrator/src/textgrad/` directory exists; integration not tested end-to-end |
| **Autonomous re-engineering (`index0 re-engineer`)** | Partial | CLI command wired in `packages/client-harness/src/cli.ts`; `services/agent-orchestrator/src/reengineering/` exists; smoke test in `packages/client-harness/test/reengineer.test.ts`; no production run verified |
| **Voice pipeline (LiveKit + Pipecat)** | In progress | `services/voice-agent/` directory exists with Python service; `pytest services/voice-agent/tests` passes 3/3 and now runs in CI (`.github/workflows/ci.yml` job `python-services`); Docker Compose overlay at `infra/compose/livekit.yml`; latency figures are UNVERIFIED |
| **Edge autocomplete (TabbyML)** | In progress | `infra/tabby/` config exists; Docker Compose overlay at `infra/compose/tabby.yml`; latency figures are UNVERIFIED |
| **Web IDE (code-server)** | In progress | `infra/code-server/` Dockerfile and config exist; Docker Compose overlay at `infra/compose/code-server.yml`; live URL not confirmed |
| **Semgrep / Trivy security gates** | Partial | Referenced in `scripts/license-check.sh` and Docker Compose; not run as CI gate in this repo |
| **ClickHouse telemetry** | Partial | Schema at `infra/clickhouse/`; Docker Compose service defined; tested in `tests/telemetry/`; requires running ClickHouse instance |
| **OpenMeter metering** | Partial | Config at `infra/openmeter/`; tested in `tests/billing/`; requires running OpenMeter instance |
| **Lago subscription billing** | Partial | Config at `infra/lago/`; tested in `tests/billing/`; requires running Lago instance |
| **SWE-bench evaluation score** | Not verified | Official evaluation not run. See `benchmarks/CLAIM_AUDIT.md` |
| **AiderBench evaluation score** | Not verified | Official evaluation not run. See `benchmarks/CLAIM_AUDIT.md` |
| **Terminal-Bench evaluation score** | Not verified | Official evaluation not run. See `benchmarks/CLAIM_AUDIT.md` |
| **CLI cold-start latency (<20ms)** | Not verified | In-process filter timing measured, not process startup. See `benchmarks/CLAIM_AUDIT.md` |
| **Human intervention rate (0.2 per task)** | Not verified | No logged task runs with human intervention tracking. See `benchmarks/CLAIM_AUDIT.md` |
| **\$0.00 cloud token COGS** | Not verified | Depends on local model being fully operational; no cost accounting run. See `benchmarks/CLAIM_AUDIT.md` |
