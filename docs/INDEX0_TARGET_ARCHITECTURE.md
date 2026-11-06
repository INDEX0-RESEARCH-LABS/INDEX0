# INDEX0 TARGET ARCHITECTURE

Date: 2026-11-06. Status: proposed, not yet built. Every element reuses existing
infrastructure unless explicitly marked "new".

## 1. Target lifecycle

```
USER VISION
  -> DEEP RESEARCH
  -> EVIDENCE COLLECTION
  -> PRODUCT REQUIREMENTS
  -> COMPLETE SYSTEM ARCHITECTURE
  -> DESIGN & ENGINEERING BLUEPRINT
  -> INDEPENDENT VERIFICATION
  -> AUTONOMOUS IMPLEMENTATION
  -> CONTINUOUS TESTING
  -> VERIFIED DELIVERY
```

INDEX0 already does the last three steps well (4-tier review loop, sandboxed QA,
hash-chained receipts). The target adds research, evidence, requirements and
architecture *before* implementation, and a verification engine that ties all of
them together.

## 2. Existing components to preserve (do not rewrite)

- `services/agent-orchestrator` — LangGraph review loop (architect/developer/critic/qa), MCTS, TextGrad, reengineering. Extend the Architect node; do not replace.
- `services/sandbox-manager` — Docker/E2B/Firecracker providers + probes. Keep boundaries.
- `services/voice-agent` — LiveKit + Pipecat.
- `packages/client-harness` — CLI/TUI/engine/GNAP/worktree. The engine is the shared review-loop client.
- `packages/contracts` — authoritative TypeScript schemas (`IAgentPlanStep`, `IAgentMessagePayload`, `AgentRunStatus`, ...).
- `packages/db` — Prisma/PostgreSQL. Reuse for all new persistence.
- `packages/mcp-host` — viking:// L0/L1/L2 + MCP discovery.
- `apps/ide/web`, `apps/ide/extension` — surfaces. Both must call the same engine.
- `infra/` — Compose stacks, Temporal, ClickHouse, LiteLLM. Reuse Temporal for durable workflows.

## 3. New subsystems (reuse-first)

### 3.1 Research subsystem (Phase 2)
- Multi-source discovery, recursive crawl, sitemap + robots.txt, browser-based dynamic extraction, HTML/PDF/Markdown/tables, dedup, versioning, authority scoring, scheduling/retries, persistent storage, job status/progress, searchable corpus, provenance.
- Reuse: PostgreSQL (`packages/db`) for storage, Temporal for scheduling, `packages/mcp-host` for MCP exposure, existing HTTP client in the orchestrator.
- New: crawler service module under `services/agent-orchestrator/src/research/` (Python, alongside existing nodes), plus a small TS client in `packages/client-harness`.

### 3.2 Evidence subsystem (Phase 3)
- Source registry, claim extraction, claim-to-passage links, publication/retrieval dates, contradiction detection, confidence, staleness, provenance, evidence-backed reports.
- Reuse: PostgreSQL; contracts for claim/evidence schemas.

### 3.3 Project intelligence (Phase 4)
- Vision → requirements, personas, journeys, functional/non-functional requirements, business rules, market/competitive analysis, acceptance criteria, risk register, versioned spec.
- Reuse: Architect agent extended with a "requirements" mode; evidence subsystem supplies citations.

### 3.4 Architecture/design intelligence (Phase 5)
- Extends the Architect agent (do not replace). Frontend/backend/infra/business-systems blueprints, each linked to requirements + decisions.
- Reuse: existing `architect.py` node + contracts.

### 3.5 Global verification engine (Phase 6)
- Evidence quality, requirement coverage, architecture consistency, contract compatibility, security, performance, reliability, acceptance criteria.
- Traceability chain: `Requirement -> Evidence -> Architecture Decision -> Implementation Task -> Code Change -> Test -> Verified Result`.
- Reuse: sandbox manager for execution, contracts for traceability IDs.

## 4. Database changes proposal (PostgreSQL, additive only)

New tables, all under the existing Prisma schema (`packages/db/prisma/schema.prisma`):

- `research_source` (id, url, domain, authority_score, retrieved_at, content_hash, version, status)
- `research_document` (id, source_id, kind, title, text, metadata jsonb)
- `research_claim` (id, document_id, passage, claim_text, confidence, extracted_at)
- `evidence_registry` (id, claim_id, source_id, passage_ref, published_at, retrieved_at)
- `requirement` (id, project_id, kind, title, body, acceptance_criteria, version, status)
- `architecture_decision` (id, requirement_id, title, rationale, status)
- `traceability_link` (id, requirement_id, evidence_id, decision_id, task_id, code_change_ref, test_ref, verified_result_ref)

No new database engine. No migration that drops existing tables. All additive.

## 5. API and event contract proposal

- REST surface added to `services/agent-orchestrator/src/main.py` (FastAPI), versioned under `/v1/research`, `/v1/evidence`, `/v1/requirements`, `/v1/architecture`, `/v1/verification`.
- SSE stream for research job progress (reuse existing streaming pattern in `apps/ide/web/src/.../stream`).
- Contracts added to `packages/contracts/src/v1/` so CLI, extension and web share types.
- Temporal workflows for long-running research crawls (reuse `infra` Temporal).

## 6. Dependency graph (existing)

```
apps/ide/web  -> packages/contracts, packages/client-harness (engine client), sandbox-manager (via gateway)
apps/ide/extension -> packages/contracts, packages/client-harness
packages/client-harness -> packages/contracts, packages/mcp-host, services/agent-orchestrator (HTTP), services/sandbox-manager (HTTP)
services/agent-orchestrator -> packages/db (via Prisma client? via HTTP), LLM (LiteLLM), services/sandbox-manager
services/sandbox-manager -> docker/e2b/firecracker
packages/mcp-host -> viking:// (local) + MCP servers
infra -> postgres, clickhouse, temporal, litellm, livekit, tabby, code-server, caddy
```

No new edges beyond the research/evidence/requirements/architecture/verification modules hanging off the orchestrator.

## 7. Security and isolation analysis

- Sandbox boundaries preserved: `--network none`, read-only source mount, pids limit, cpu/mem caps (`docker-provider.ts`). Research crawler must NOT run inside the code sandbox; it runs in the orchestrator process with its own allow-list and rate limits.
- Research must respect robots.txt and rate limits; no credential leakage (license/secret scan in CI already guards).
- Evidence claims are data, never instructions (prompt-injection guard already documented for REA tools).
- No new secrets in repo; `.env` remains gitignored.

## 8. What is NOT in the target

- No new monolith rewrite, no microservice proliferation.
- No GPL/AGPL dependencies; proprietary license stays.
- No building of voice/Tabby/MCTS/TextGrad/billing/metering — those remain roadmap (Phase 5 of the investor plan).
