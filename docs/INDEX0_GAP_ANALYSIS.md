# INDEX0 GAP ANALYSIS

Date: 2026-11-06. Compares `INDEX0_CURRENT_STATE_AUDIT.md` (verified) against
`INDEX0_TARGET_ARCHITECTURE.md` (proposed). Gap = target capability minus verified
capability.

## 1. Gap matrix

| Target capability | Current state | Gap |
|---|---|---|
| Research (multi-source, crawl, sitemap/robots, PDF/HTML/tables, dedup, versioning, authority, scheduling, storage, search, provenance) | Not present | Entire subsystem. Reuse postgres + Temporal + mcp-host. |
| Evidence (source registry, claims, passage links, dates, contradictions, confidence, staleness, provenance, reports) | Not present | Entire subsystem. |
| Project intelligence (vision → requirements/personas/journeys/FR-NFR/business rules/market/competitive/acceptance/risk/versioned spec) | Not present | Entire subsystem; depends on research+evidence. |
| Architecture/design intelligence (frontend/backend/infra/business blueprints) | Partial | `architect.py` node exists but only produces code-level plans; no screen inventory, component arch, service boundaries, DB schema, auth, deployment topology, payment/subscription architecture. Extend, don't replace. |
| Global verification engine (evidence quality, requirement coverage, arch consistency, contract compat, security, perf, reliability, acceptance; traceability chain) | Partial | Contract tests + sandbox QA exist; no requirement/architecture/evidence verification; no traceability chain. |
| Traceability chain `Requirement -> Evidence -> Decision -> Task -> Code Change -> Test -> Verified Result` | Not present | New table + IDs in contracts. |
| Web workbench on the real engine | Broken/partial | `Workbench.tsx` uses hardcoded `DEFAULT_FILES`/`DEFAULT_TABS` and `setTimeout`-simulated agent; no orchestrator call. |
| Demo fixtures separated from production workspace | Not done | Defaults are demo data. |
| Node version pinned in install path | Not done | Default node 20 < required 22.18; docs say unverified install.sh URL. |
| Benchmarks with hidden tests + honest numbers | Not done | `benchmarks/verified-bench/` does not exist; only smoke checks. |
| Voice/Tabby/MCTS/TextGrad/billing/metering marked roadmap | Partial | README describes them as working/in-progress; pitch claims need trimming. |

## 2. What is already good enough to reuse (no change)

- 4-tier review loop engine (`services/agent-orchestrator/src/graph/review_loop.py` + nodes).
- Docker sandbox provider with network isolation + read-only mount.
- Anti-cheat baseline/compare.
- Contracts package (authoritative schemas).
- Prisma/PostgreSQL.
- GNAP + worktree isolation.
- MCP host + viking context.
- Temporal infra (declared in compose).
- ClickHouse/OpenMeter/Lago config (infra present).

## 3. Existing vs. proposed component mapping

| Existing component | Proposed role | Action |
|---|---|---|
| `services/agent-orchestrator/src/graph/nodes/architect.py` | Architecture/design intelligence | Extend with requirements + blueprint modes |
| `services/agent-orchestrator/src/graph/review_loop.py` | Autonomous implementation engine | Keep; feed it approved blueprints |
| `services/sandbox-manager` | Continuous testing + verification execution | Keep; no change |
| `packages/contracts` | Traceability IDs + research/evidence/requirement schemas | Extend (additive) |
| `packages/db` (Prisma) | Persistence for research/evidence/requirements/decisions/traceability | Extend schema (additive) |
| `packages/client-harness/src/engine.ts` | Shared review-loop client for CLI/web/extension | Keep; reuse in web workbench |
| `apps/ide/web/src/workbench/Workbench.tsx` | Surface for research/evidence/architecture/verification | Refactor: remove demo defaults, wire to engine |
| `apps/ide/extension` | Surface | Reuse same engine client |
| `packages/mcp-host` | Expose research/evidence as MCP resources | Extend |

## 4. Database changes proposal

See `INDEX0_TARGET_ARCHITECTURE.md` §4. All additive tables in the existing Prisma schema. No new database engine, no drops.

## 5. API and event contract proposal

See `INDEX0_TARGET_ARCHITECTURE.md` §5. New `/v1/research`, `/v1/evidence`, `/v1/requirements`, `/v1/architecture`, `/v1/verification` routes on the existing FastAPI app; SSE progress; contracts in `packages/contracts/src/v1/`.

## 6. Security and isolation analysis

See `INDEX0_TARGET_ARCHITECTURE.md` §7. Research crawler runs in the orchestrator process (not the code sandbox) with allow-lists and rate limits; respects robots.txt; sandbox boundaries unchanged.

## 7. Top gaps in priority order (matches roadmap Phase 0-8)

1. Reproduce CI web test failure on node 22; name the two tests.
2. Separate demo fixtures from production in `Workbench.tsx`.
3. Wire `handleSendMessage` to the real orchestrator.
4. `benchmarks/verified-bench/` (20-30 tasks, hidden tests, plain-LLM vs INDEX0, JSON + md, one command).
5. Pin node version in install docs/script.
6. Confirm CLI + extension + web share one engine + one evidence report.
7. Mark voice/Tabby/MCTS/TextGrad/billing/metering as roadmap in README + pitch.
8. Update `PROOF_STATUS.md` + deck from Phase 2 results.
9. Research subsystem (Phase 2 of new plan).
10. Evidence subsystem (Phase 3).
11. Project intelligence (Phase 4).
12. Architecture intelligence (Phase 5).
13. Global verification (Phase 6).
14. Autonomous engineering integration (Phase 7).
15. IDE integration (Phase 8).
