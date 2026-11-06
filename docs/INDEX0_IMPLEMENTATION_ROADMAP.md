# INDEX0 IMPLEMENTATION ROADMAP

Date: 2026-11-06. One phase at a time. Do not start the next phase until the
acceptance criteria of the current one pass. No new features outside the phases.

## Phase 0 — Repository audit (this document set)

Deliverables: `docs/INDEX0_CURRENT_STATE_AUDIT.md`, `INDEX0_TARGET_ARCHITECTURE.md`,
`INDEX0_GAP_ANALYSIS.md`, `INDEX0_IMPLEMENTATION_ROADMAP.md`,
`INDEX0_TECHNICAL_DECISIONS.md`, `INDEX0_VERIFICATION_MATRIX.md`.

Acceptance: every claim references a file path, function, test, or command output;
no feature is reported as operational without proof. **Done (this commit set).**

## Phase 1 — Stabilization (done 2026-11-06)

- Install/typecheck/tests/demo green. Fixed `packages/client-harness/src/benchmark.ts`
  (Exercism smoke check silently scoring 0/5). Recorded in `PROOF_STATUS.md`.
- Branch `feat/sovereign-agi-stack` confirmed merged.
Acceptance: `pnpm install --frozen-lockfile`, `pnpm typecheck`, `pnpm test`,
`./demo/run-demo.sh` all exit 0. **Done (`b148ba8`).**

## Phase 2 — Benchmark (most important)

Create `benchmarks/verified-bench/`:
- 20-30 small coding tasks (Python + JS) with hidden tests.
- Runner: for each task run (a) one plain LLM call and (b) the INDEX0 review loop
  on the same model, then run hidden tests on each result.
- Output: pass rate both, per-task results, cost, time — JSON + markdown table.
- One command, documented in `benchmarks/REPRODUCIBILITY.md`.
- Report honestly, even if INDEX0 loses.

Acceptance: `benchmarks/verified-bench/run.sh` (or `.py`) reproduces the numbers
from a clean checkout with one free key; `PROOF_STATUS.md` updated with the result.

## Phase 3 — One-command install and demo

- Make a fresh clone work with one documented command sequence.
- Either make the `install.sh` URL real or remove the claim (README currently
  says "unverified").
- Verify on a clean container (node 22, no pre-installed deps).

Acceptance: a clean container runs the documented sequence end to end; README
install instructions match reality.

## Phase 4 — Three surfaces on one engine

- Confirm CLI, VS Code extension and web workbench all call the same review-loop
  engine and show the same evidence report (task, attempts, test output, verdict).
- Smallest fix so "Verify Selection" in the extension and the web task box work
  end to end.

Acceptance: one task run produces the same evidence report on all three surfaces.

## Phase 5 — Scope trim

- Mark voice, TabbyML, MCTS, TextGrad, billing and metering as "roadmap" in
  README and pitch materials. Do not build them.

Acceptance: no doc/deck claims them as working.

## Phase 6 — Proof update

- Update `PROOF_STATUS.md` and pitch deck numbers from Phase 2 results.
- List anything in the deck still unsupported.

Acceptance: every number in the deck traces to a command in the repo.

## Phase 7 (new plan) — Research foundation

Define research contracts, persistence model, crawler architecture (sitemap,
robots, browser extraction, dedup, versioning, authority, scheduling). Reuse
postgres + Temporal. No new DB engine.

Acceptance: contracts in `packages/contracts`, tables in Prisma schema, crawler
module skeleton with tests, one end-to-end crawl against a fixture site.

## Phase 8 (new plan) — Evidence foundation

Source registry, claim extraction, passage links, dates, contradictions,
confidence, staleness, provenance, reports.

Acceptance: evidence report for one real research run, with every claim linked to
a passage.

## Phase 9 (new plan) — Project intelligence

Vision → requirements/personas/journeys/FR-NFR/business rules/market/competitive/
acceptance/risk/versioned spec, backed by research+evidence.

## Phase 10 (new plan) — Architecture intelligence

Extend Architect agent to produce frontend/backend/infra/business blueprints,
each linked to requirements + decisions.

## Phase 11 (new plan) — Global verification

Cross-layer validation + traceability chain; identifies contradictions.

## Phase 12 (new plan) — Autonomous engineering integration

Connect approved blueprints to Developer/Critic/QA/sandbox.

## Phase 13 (new plan) — IDE integration

Research/evidence/architecture/verification in the existing IDE.

Each phase needs: deliverables, acceptance criteria, and a `PROOF_STATUS.md`
update. No phase starts before the previous passes.
