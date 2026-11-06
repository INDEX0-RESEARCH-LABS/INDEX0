# INDEX0 VERIFICATION MATRIX

Date: 2026-11-06. Every capability: status, evidence, how to verify, last verified.

Legend: **Working** = command-proven. **Partial** = code exists, integration
unproven. **In progress** = scaffolded. **Not verified** = claim only.

| Capability | Status | Evidence | How to verify | Last verified |
|---|---|---|---|---|
| Monorepo install | Working | `pnpm install --frozen-lockfile` | same | 2026-11-06 |
| Typecheck | Working | `pnpm run typecheck` | same | 2026-11-06 (9/9) |
| Monorepo tests | Working | `pnpm run test` | same | 2026-11-06 (290/290) |
| Python orchestrator tests | Working | `pytest services/agent-orchestrator/tests` | same | 2026-11-06 (30/30) |
| Python voice-agent tests | Working | `pytest services/voice-agent/tests` | same | 2026-11-06 (3/3) |
| Docker Compose config | Working | `docker compose -f infra/compose/docker-compose.yml config` | same | 2026-11-06 |
| License audit | Working | `scripts/license-check.sh` | same | 2026-11-06 |
| 4-tier review loop (E2E) | Working | `./demo/run-demo.sh` | same | 2026-11-06 (`qa_verified`, 3/0, 2021 ms) |
| Docker sandbox provider | Working | `services/sandbox-manager/src/sandbox/docker-provider.ts` | `services/sandbox-manager/test/*.test.ts` | 2026-11-06 |
| E2B sandbox provider | Working | `services/sandbox-manager/src/sandbox/e2b-provider.ts` | requires `E2B_API_KEY` | code only |
| Firecracker provider | Partial | `firecracker-provider.ts` | host binary required | not in CI |
| Perf/TSan/fuzzer probes | Partial | `services/sandbox-manager/src/sandbox/probes/*` | host tools required | not in CI |
| Anti-cheat baseline/compare | Working | `packages/client-harness/src/anti-cheat.ts` | `packages/client-harness/test/anti-cheat.test.ts` | 2026-11-06 |
| GNAP | Working | `packages/client-harness/src/gnap.ts` | `packages/client-harness/test/gnap.test.ts` | 2026-11-06 |
| Git worktree isolation | Working | `packages/client-harness/src/worktree.ts` | `packages/client-harness/test/worktree.test.ts` | 2026-11-06 |
| Context compression (transform) | Working | `packages/mcp-host/src/viking/*` | `packages/client-harness/test/benchmark.test.ts` | 2026-11-06 |
| Context compression (E2E token savings) | Not verified | none | paired agent outcome measurement | n/a |
| Terminal ANSI filter | Working | `packages/client-harness/src/filter.ts` | `packages/client-harness/test/filter.test.ts` | 2026-11-06 |
| Web search | Working | `packages/client-harness/src/search.ts` | `packages/client-harness/test/search.test.ts` | 2026-11-06 |
| TS contracts | Working | `packages/contracts/` | `tests/contracts/*.test.ts` | 2026-11-06 |
| PostgreSQL schema | Working | `packages/db/prisma/schema.prisma` | `pnpm db:generate` | 2026-11-06 |
| GitHub Device Flow auth | Working | `packages/client-harness/src/auth.ts` | `packages/client-harness/test/auth.test.ts` | 2026-11-06 |
| Terminal CLI binary | Working | `packages/client-harness/package.json` bin | `node packages/client-harness/dist/cli.js --help` | 2026-11-06 |
| Interactive TUI | Working | `packages/client-harness/src/launcher.ts`, `ui.ts` | `packages/client-harness/test/launcher.test.ts` | 2026-11-06 |
| LLM routing via LiteLLM | Working | `packages/client-harness/src/engine.ts` | `./demo/run-demo.sh` | 2026-11-06 |
| MCTS multiverse search | Partial | `services/agent-orchestrator/src/graph/mcts/*` | not wired into review loop | n/a |
| TextGrad feedback loop | Partial | `services/agent-orchestrator/src/textgrad/*` | not tested E2E | n/a |
| Autonomous re-engineering | Partial | `services/agent-orchestrator/src/reengineering/*` | smoke test only | n/a |
| Voice pipeline | In progress | `services/voice-agent/` | `pytest services/voice-agent/tests` (3/3) | 2026-11-06 |
| Edge autocomplete (TabbyML) | In progress | `infra/tabby/` | config only | n/a |
| Web IDE (code-server) | In progress | `infra/code-server/` | live URL unconfirmed | n/a |
| Semgrep/Trivy gates | Partial | `scripts/license-check.sh` | not a CI gate | n/a |
| ClickHouse telemetry | Partial | `infra/clickhouse/` | needs instance | n/a |
| OpenMeter metering | Partial | `infra/openmeter/` | needs instance | n/a |
| Lago billing | Partial | `infra/lago/` | needs instance | n/a |
| SWE-bench score | Not verified | none | official eval not run | n/a |
| AiderBench score | Not verified | none | official eval not run | n/a |
| Terminal-Bench score | Not verified | none | official eval not run | n/a |
| CLI cold-start <20ms | Not verified | in-process filter timing only | process startup measurement | n/a |
| Human intervention rate 0.2/task | Not verified | no logged runs | intervention tracking | n/a |
| \$0.00 cloud token COGS | Not verified | no cost accounting | cost accounting run | n/a |
| Web workbench on real engine | Partial/broken | `apps/ide/web/src/workbench/Workbench.tsx` | uses `setTimeout` simulation; not on engine | n/a |
| Demo fixtures vs production | Not done | `DEFAULT_FILES`/`DEFAULT_TABS` baked into defaults | refactor | n/a |
| Research subsystem | Not present | none | Phase 7 | n/a |
| Evidence subsystem | Not present | none | Phase 8 | n/a |
| Project intelligence | Not present | none | Phase 9 | n/a |
| Architecture intelligence | Partial | `architect.py` | extend | n/a |
| Global verification engine | Partial | contract tests + sandbox QA | Phase 11 | n/a |
| Traceability chain | Not present | none | Phase 11 | n/a |

## Traceability chain (target)

`Requirement -> Evidence -> Architecture Decision -> Implementation Task -> Code Change -> Test -> Verified Result`

Each link must be an ID in `packages/contracts` and a row in `traceability_link`
(see `INDEX0_TARGET_ARCHITECTURE.md` §4). Not yet implemented.
