# PROOF_STATUS.md

Current proof-of-work status for every claimed capability.
Filled only from direct inspection of this repository. "Not verified" means the code or test was not found during this audit.

> Last updated: 2026-10-23. Review against latest commit before citing externally.

---

| Capability | Status | Evidence (file path or test name) |
|---|---|---|
| **Terminal CLI (`index0` binary)** | Working | `packages/client-harness/package.json` bin entry; source at `packages/client-harness/src/cli.ts`; build script `pnpm --filter @index0/client-harness build` |
| **Interactive TUI (full-screen terminal)** | Working | `packages/client-harness/src/launcher.ts`, `packages/client-harness/src/ui.ts`; tested in `packages/client-harness/test/launcher.test.ts` |
| **GitHub Device Flow login** | Working | `packages/client-harness/src/auth.ts`; tested in `packages/client-harness/test/auth.test.ts` |
| **LLM prompt routing via LiteLLM** | Working | `packages/client-harness/src/engine.ts`; LiteLLM config at `infra/litellm/`; Docker Compose service in `infra/compose/litellm.yml` |
| **4-tier review loop (Architect, Developer, Critic, QA)** | Partial | Python implementation at `services/agent-orchestrator/src/graph/review_loop.py` and `src/graph/nodes/`; REST API wiring at `services/agent-orchestrator/src/main.py`; TypeScript client in `packages/client-harness/src/engine.ts`; end-to-end integration not tested in CI |
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
| **Voice pipeline (LiveKit + Pipecat)** | In progress | `services/voice-agent/` directory exists with Python service; Docker Compose overlay at `infra/compose/livekit.yml`; latency figures are UNVERIFIED |
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
