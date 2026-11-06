# INDEX0 TECHNICAL DECISIONS

Date: 2026-11-06. Records decisions made during the Phase 0 audit and the
investor-readiness plan. Each decision has a rationale and a consequence.

## TD-1: Reuse, do not rewrite
Rationale: the review-loop engine, sandbox, contracts, db, GNAP and worktree
isolation are verified and tested. Rewriting risks losing working proof.
Consequence: new capabilities (research, evidence, requirements, architecture,
verification) are added as modules hanging off the existing orchestrator, not as
new services.

## TD-2: PostgreSQL only; no new database engine
Rationale: `packages/db` already uses Prisma + PostgreSQL; ops burden of a second
store is not justified. Research/evidence/requirements/decisions/traceability
live as additive tables.
Consequence: schema migrations are additive only (no drops).

## TD-3: Temporal for durable long-running workflows
Rationale: Temporal is already in `infra/compose/`. Research crawls and
verification runs are long-running and need retries/durability.
Consequence: no new workflow engine; no in-process schedulers for crawls.

## TD-4: Extend the Architect agent; do not replace
Rationale: `services/agent-orchestrator/src/graph/nodes/architect.py` exists and
is wired into the loop. Replacing it breaks the verified 4-tier loop.
Consequence: architecture intelligence is a new mode of the same node.

## TD-5: Sandbox boundaries are non-negotiable
Rationale: `docker-provider.ts` enforces `--network none`, read-only source mount,
pids limit, cpu/mem caps. Research crawlers run in the orchestrator process with
their own allow-lists, never inside the code sandbox.
Consequence: no relaxation of sandbox flags; crawlers get separate rate limits.

## TD-6: Claims must be provable by a command
Rationale: `PROOF_STATUS.md` and `benchmarks/CLAIM_AUDIT.md` exist precisely
because unverified claims damage credibility. `README`/deck/pitch must only state
what a command in this repo proves.
Consequence: Phase 6 updates numbers from Phase 2 results; unsupported claims
are listed, not silently removed.

## TD-7: No GPL/AGPL dependencies; proprietary license stays
Rationale: `scripts/license-check.sh` enforces the boundary; license audit passes.
Consequence: any new dependency (e.g. a crawler library) must pass the audit.

## TD-8: Node >=22.18 required; document it
Rationale: package tests use Node's built-in type stripping; Node 20 fails with
`ERR_UNKNOWN_FILE_EXTENSION`. Default shell node is 20.
Consequence: Phase 3 pins the node version in install docs/script.

## TD-9: Demo fixtures separated from production
Rationale: `Workbench.tsx` bakes `DEFAULT_FILES`/`DEFAULT_TABS` (a `src/` + `math.ts`
demo) into production component defaults, and simulates the agent with `setTimeout`.
This conflates demo with product and makes the workbench untestable as a product.
Consequence: move defaults into a `demo/` module; `initialFiles`/`initialTabs` become
required-or-empty; wire `handleSendMessage` to the real orchestrator client.

## TD-10: Free model routes only for demos/benchmarks
Rationale: `./demo/run-demo.sh` auto-picks groq/gemini/openrouter from `.env`;
no Azure, no payment method required.
Consequence: benchmarks in Phase 2 use the same free routes; cost is reported as
measured.

## TD-11: Anti-cheat is baseline-and-compare, not write-dropping
Rationale: `packages/client-harness/src/anti-cheat.ts` hashes test/evaluator/infra
files and emits `INVALID_RUN` on drift. The earlier claim that "the QA node drops
candidate writes to test paths and restores the file" is not implemented.
Consequence: pitch/README wording corrected to "test files hashed, then compared".

## TD-12: Honest proof over green dashboards
Rationale: one failing test (Exercism smoke check) was fixed by making it actually
execute, not by weakening it. Unreproducible CI failures (apps/ide/web 70/2) are
recorded as "not reproduced locally", not as "fixed".
Consequence: `PROOF_STATUS.md` distinguishes verified vs. not-verified; no test
is modified to pass.
