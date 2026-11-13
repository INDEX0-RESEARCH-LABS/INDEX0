# GROUNDWORK

**Research-First Agent Pipeline for INDEX0**

> Before INDEX0 writes a single line of code, GROUNDWORK goes to the real web,
> finds what actually exists in the market, verifies it, and locks a fully
> sourced plan. Development only starts after the plan is proven — not assumed.

---

## The Problem with Current INDEX0

The existing 4-tier loop (Architect → Developer → Critic → QA) is powerful at
*building correctly*. But the Architect node reasons from the model's training
data — knowledge that has a cutoff date, is geographically biased toward Western
tech, and cannot know what is happening in the market today.

**Result:** INDEX0 builds things that work. GROUNDWORK makes INDEX0 build things
that also sell — because every decision is grounded in what real companies in the
real market are actually doing right now.

---

## What GROUNDWORK Does

GROUNDWORK is a pre-development research pipeline that runs **before** the
existing review loop. It has 6 sequential stages. Each stage:

1. Searches the live web for real, existing sources
2. Extracts structured data from those sources
3. Verifies findings across multiple sources (minimum 2 must agree)
4. Produces a typed, cited output schema
5. Is reviewed by a Critic agent before the next stage begins

Nothing is taken from the model's memory as a primary source. The model's role
is to **interpret and structure** what the web returns — not to recall.

---

## Pipeline Architecture

```
User Prompt
     │
     ▼
┌─────────────────────────────────────────────────────────┐
│                    GROUNDWORK PIPELINE                  │
│                                                         │
│  Stage 1: Market Intelligence                           │
│    └─ Who is in this market? What works? What fails?    │
│                                                         │
│  Stage 2: Architecture Discovery                        │
│    └─ How do real companies in this space build it?     │
│                                                         │
│  Stage 3: Frontend Design System                        │
│    └─ What do real apps in this market look and feel?   │
│                                                         │
│  Stage 4: Backend Architecture                          │
│    └─ What APIs, data models, services do they use?     │
│                                                         │
│  Stage 5: Infrastructure & Payments                     │
│    └─ What infra, payments, support do they run on?     │
│                                                         │
│  Stage 6: Plan Lock                                     │
│    └─ Critic verifies all 5 stages, locks BUILD_PLAN    │
└─────────────────────────────────────────────────────────┘
     │
     ▼
BUILD_PLAN.md  (fully sourced, verified, locked)
     │
     ▼
┌─────────────────────────────────────────────────────────┐
│              EXISTING INDEX0 REVIEW LOOP                │
│   Architect (reads BUILD_PLAN) → Developer → Critic → QA│
└─────────────────────────────────────────────────────────┘
```

---

## Stage Specifications

### Stage 1 — Market Intelligence

**Goal:** Understand the real market the user is entering — not generic assumptions.

**Searches:**
- `"{app type} market {user's country/region} 2024 2025"`
- `"{app type} startups funding raised"`
- `"{app type} app store top apps {region}"`
- `"{app type} user complaints reviews"`
- `"{app type} failed companies why"`

**Extracts:**
- Top 5 real competitors (name, funding, active users if findable)
- Top 3 user pain points from real reviews
- Dominant pricing model in this market
- Market-specific constraints (connectivity, payment methods, language, regulation)
- What competitors are missing (opportunity gaps)

**Verification:** At least 2 independent sources must agree on each key fact.

**Output Schema:**
```json
{
  "market_name": "string",
  "region": "string",
  "competitors": [
    {
      "name": "string",
      "url": "string",
      "funding": "string",
      "key_differentiator": "string",
      "source": "string"
    }
  ],
  "user_pain_points": ["string"],
  "dominant_pricing_model": "string",
  "market_constraints": ["string"],
  "opportunity_gaps": ["string"],
  "sources": ["url"]
}
```

---

### Stage 2 — Architecture Discovery

**Goal:** Find real production architectures that companies in this exact market use —
not textbook patterns, not what the model learned from generic tutorials.

**Searches:**
- `"{competitor name} engineering blog architecture"`
- `"{app type} system design production scale"`
- `"how {competitor} built their {core feature} engineering"`
- `"{app type} backend architecture open source"`
- `"site:github.com {app type} production architecture"`

**Extracts:**
- 3–5 real reference architectures with direct URLs
- Core services identified (e.g. dispatch engine, real-time tracking, surge pricing)
- Database choices with reasoning (why Postgres over Mongo, etc.)
- Messaging/queue choices (Kafka, Redis, etc.)
- Real-time tech (WebSockets, SSE, etc.)
- Scaling patterns used

**Verification:** Each architectural decision must have at least one live source URL.
No decision is marked confirmed without a source.

**Output Schema:**
```json
{
  "reference_architectures": [
    {
      "company": "string",
      "url": "string",
      "core_services": ["string"],
      "database": "string",
      "messaging": "string",
      "realtime": "string",
      "key_insight": "string"
    }
  ],
  "recommended_stack": {
    "database": { "choice": "string", "reason": "string", "source": "string" },
    "messaging": { "choice": "string", "reason": "string", "source": "string" },
    "realtime": { "choice": "string", "reason": "string", "source": "string" },
    "hosting": { "choice": "string", "reason": "string", "source": "string" }
  },
  "core_services": ["string"],
  "sources": ["url"]
}
```

---

### Stage 3 — Frontend Design System

**Goal:** Plan the complete frontend — every page, every component, the full design
system — from real apps in this market. Not from the model's aesthetic preferences.

**Searches:**
- `"{top competitor} app screenshots UI design"`
- `"{app type} mobile UI design system"`
- `"{app type} UX patterns best practices {region}"`
- `"site:mobbin.com {app type}"` (real app screenshot library)
- `"{app type} color psychology branding"`
- `"{app type} onboarding flow design"`

**Extracts:**

*Design Tokens (from real apps):*
- Primary/secondary colors with hex values sourced from real brand guidelines
- Typography (font families real apps in this space use)
- Spacing scale
- Border radius, shadow patterns
- Icon style (outlined, filled, mixed)

*Component Inventory:*
- Every reusable component needed (button variants, cards, inputs, maps, modals)
- Each component: purpose, variants, states, sourced from real app

*Page Architecture (every page planned before development):*
- Full page list with purpose
- Each page: layout type, key components, user flow entry/exit
- Navigation structure (bottom tab, drawer, stack)
- Empty states, loading states, error states

*Emotional Design:*
- Brand personality (trust signals, urgency, delight moments)
- Micro-interactions sourced from real apps
- Color-emotion mapping for this specific market and culture

**Output Schema:**
```json
{
  "design_tokens": {
    "colors": { "primary": "string", "secondary": "string", "source": "string" },
    "typography": { "heading": "string", "body": "string", "source": "string" },
    "spacing_scale": ["number"],
    "border_radius": "string"
  },
  "components": [
    {
      "name": "string",
      "purpose": "string",
      "variants": ["string"],
      "states": ["string"],
      "sourced_from": "string"
    }
  ],
  "pages": [
    {
      "name": "string",
      "route": "string",
      "purpose": "string",
      "layout": "string",
      "components": ["string"],
      "entry_from": ["string"],
      "exit_to": ["string"]
    }
  ],
  "navigation_structure": "string",
  "brand_personality": "string",
  "sources": ["url"]
}
```

---

### Stage 4 — Backend Architecture

**Goal:** Plan every API endpoint, every data model, every service — sourced from
real production backend architectures. No endpoint is added from memory alone.

**Searches:**
- `"{app type} REST API design open source"`
- `"{competitor} API documentation"`
- `"{app type} database schema design"`
- `"{core feature} microservice architecture"`
- `"site:github.com {app type} api backend"`

**Extracts:**

*Service Map:*
- Every microservice or module needed
- Each service: responsibility, dependencies, tech choice with source

*API Contracts (every endpoint):*
- Method, path, purpose
- Request/response schema
- Auth requirement
- Rate limiting expectation

*Data Models:*
- Every entity, every field
- Relationships
- Indexing strategy
- Sourced from real schemas where possible

*Multi-tenancy Design:*
- Isolation strategy (schema-per-tenant vs row-level vs database-per-tenant)
- Sourced from real SaaS companies using the same pattern

**Output Schema:**
```json
{
  "services": [
    {
      "name": "string",
      "responsibility": "string",
      "tech": "string",
      "depends_on": ["string"],
      "source": "string"
    }
  ],
  "api_endpoints": [
    {
      "method": "string",
      "path": "string",
      "purpose": "string",
      "auth": "string",
      "request_schema": {},
      "response_schema": {},
      "source": "string"
    }
  ],
  "data_models": [
    {
      "entity": "string",
      "fields": [],
      "indexes": ["string"],
      "source": "string"
    }
  ],
  "multitenancy_strategy": {
    "pattern": "string",
    "reason": "string",
    "source": "string"
  },
  "sources": ["url"]
}
```

---

### Stage 5 — Infrastructure & Payments

**Goal:** Plan the full infrastructure stack and payment architecture from verified
sources — specific to the user's target market, not generic Western defaults.

**Searches (Infrastructure):**
- `"best cloud provider {region} latency benchmark"`
- `"{app type} infrastructure cost optimization"`
- `"CDN performance {region}"`
- `"{app type} DevOps CI CD pipeline production"`

**Searches (Payments):**
- `"best payment gateway {region} developer"`
- `"{payment provider} integration docs"`
- `"{payment provider} fee structure {region}"`
- `"payment split marketplace {region}"`
- `"refund chargeback {region} payment"`

**Searches (Support & Multi-tenancy Operations):**
- `"{app type} customer support system integration"`
- `"multi-tenant onboarding flow SaaS"`
- `"tenant provisioning architecture"`

**Extracts:**
- Hosting region recommendation with latency evidence
- CDN recommendation for target geography
- CI/CD pipeline design sourced from real companies
- Payment provider(s) that actually work in this market (not assumed)
- Payment split logic (platform fee, driver/vendor payout)
- Refund and dispute flow
- Support system recommendation
- Tenant onboarding flow

**Output Schema:**
```json
{
  "infrastructure": {
    "cloud_provider": "string",
    "region": "string",
    "region_reason": "string",
    "cdn": "string",
    "source": "string"
  },
  "cicd": {
    "pipeline": "string",
    "stages": ["string"],
    "source": "string"
  },
  "payments": {
    "primary_provider": "string",
    "fallback_provider": "string",
    "split_logic": "string",
    "refund_flow": "string",
    "source": "string"
  },
  "support": {
    "platform": "string",
    "integration_pattern": "string",
    "source": "string"
  },
  "multitenancy_ops": {
    "onboarding_flow": ["string"],
    "provisioning_strategy": "string",
    "source": "string"
  },
  "sources": ["url"]
}
```

---

### Stage 6 — Plan Lock

**Goal:** A Critic agent reviews all 5 stage outputs for consistency, completeness,
and conflicts. Nothing moves to development until this passes.

**Critic checks:**
- Do the frontend pages match the backend API endpoints? (every page has the APIs it needs)
- Does the infrastructure choice support the architecture choice? (e.g. realtime tech needs right hosting)
- Do the payment providers work in the target region? (cross-check Stage 1 constraints vs Stage 5)
- Is every core feature from Stage 1 (opportunity gaps) addressed in Stage 3/4?
- Are there any endpoints with no corresponding frontend page or vice versa?
- Does the multi-tenancy strategy match across Stage 4 and Stage 5?

**Output:** `BUILD_PLAN.md` — a single locked document containing:
- All 5 stage outputs consolidated
- All source URLs with access dates
- Critic approval signature
- A development task list ordered by dependency

If the Critic rejects, the specific failing stage re-runs research with tighter queries.

---

## How It Integrates with Existing INDEX0

### New: `services/research-agent/`

```
services/research-agent/
├── src/
│   ├── main.py                  # FastAPI service, POST /research/start
│   ├── pipeline.py              # ResearchOrchestrator — runs 6 stages
│   ├── stages/
│   │   ├── market.py            # Stage 1
│   │   ├── architecture.py      # Stage 2
│   │   ├── frontend.py          # Stage 3
│   │   ├── backend.py           # Stage 4
│   │   ├── infrastructure.py    # Stage 5
│   │   └── plan_lock.py         # Stage 6
│   ├── tools/
│   │   ├── searcher.py          # Web search (Exa, Brave, SerpAPI)
│   │   ├── scraper.py           # Page content extraction
│   │   └── verifier.py          # Cross-source fact verification
│   └── schemas/
│       ├── market.py
│       ├── architecture.py
│       ├── frontend.py
│       ├── backend.py
│       └── infrastructure.py
└── tests/
    └── test_pipeline.py
```

### Modified: `services/agent-orchestrator/`

- `architect_node` gains a new code path: if `plan_id` is present in state, it
  reads `BUILD_PLAN.md` instead of reasoning from memory
- `ReviewLoopState` gains: `plan_id`, `build_plan_path`, `groundwork_enabled`

### New: `packages/research-contracts/`

Shared TypeScript + Python schemas for the 6 stage outputs. Used by both the
research agent and the orchestrator to validate the plan before development.

### New API Flow

```
POST /research/start
  { "userPrompt": "...", "region": "Nigeria" }
  → { "plan_id": "plan-abc123", "status": "running" }

GET /research/{plan_id}/status
  → { "stage": 3, "status": "in_progress", "stages_complete": [...] }

GET /research/{plan_id}/plan
  → BUILD_PLAN.md content + all stage outputs

POST /cycles/start
  { "taskId": "...", "planId": "plan-abc123", "groundworkEnabled": true }
  → existing review loop, Architect reads BUILD_PLAN
```

---

## Implementation Phases

### Phase A — Research Tooling (Week 1)
- Build `searcher.py` — wrap Exa/Brave/SerpAPI, return structured results
- Build `scraper.py` — extract clean text from URLs (no JS rendering needed for most)
- Build `verifier.py` — given N search results on a claim, return consensus + confidence
- Write tests with real web calls (record/replay for CI)

### Phase B — Stage 1 & 2 (Week 1-2)
- Implement Market Intelligence stage
- Implement Architecture Discovery stage
- Both stages use the research tools from Phase A
- Output validated against typed schemas

### Phase C — Stage 3 & 4 (Week 2)
- Implement Frontend Design System stage
- Implement Backend Architecture stage
- These are the most complex — most search queries, most structured output

### Phase D — Stage 5 & 6 (Week 2-3)
- Implement Infrastructure & Payments stage
- Implement Plan Lock (Critic reviews all stages)
- Generate `BUILD_PLAN.md`

### Phase E — Orchestrator Integration (Week 3)
- Modify `architect_node` to read `BUILD_PLAN.md` when `groundwork_enabled`
- Add `plan_id` to `ReviewLoopState`
- Add `POST /research/start` and `GET /research/{plan_id}` endpoints
- End-to-end test: user prompt → BUILD_PLAN → working code

---

## Search Provider Strategy

The research agent needs a web search tool that returns real page content, not
just URLs. Priority order:

1. **Exa** — semantic search, returns full page content, best for engineering blogs
2. **Brave Search API** — good coverage, real-time, free tier available
3. **SerpAPI** — Google results fallback
4. **Direct scraping** — for known high-value domains (GitHub, engineering blogs)

The `searcher.py` tool abstracts the provider so it can be swapped without
changing stage logic.

---

## Verification Rules

A fact is **confirmed** when:
- It appears in 2 or more independent sources, OR
- It comes from a primary source (official docs, company engineering blog, GitHub repo)

A fact is **unconfirmed** when:
- Only one source mentions it and it is not a primary source
- The source is older than 18 months

Unconfirmed facts are flagged in the output but not blocked — the Critic in
Stage 6 decides whether to accept or re-search.

---

## Naming

| Component | Name |
|---|---|
| Feature name | GROUNDWORK |
| Service | `research-agent` |
| Orchestrator class | `ResearchOrchestrator` |
| Plan output | `BUILD_PLAN.md` |
| State flag | `groundwork_enabled` |
| API prefix | `/research/` |
| Stage 1 | Market Intelligence |
| Stage 2 | Architecture Discovery |
| Stage 3 | Frontend Design System |
| Stage 4 | Backend Architecture |
| Stage 5 | Infrastructure & Payments |
| Stage 6 | Plan Lock |

---

## What GROUNDWORK Does Not Do

- It does not write code — that is still the existing review loop
- It does not replace the Architect node — it feeds the Architect node better inputs
- It does not guarantee the sources are correct — it verifies consistency across
  sources, not ground truth
- It is not required — `groundwork_enabled: false` runs the existing loop unchanged

---

## Success Criteria

GROUNDWORK is working when:
- A user can say "build me a food delivery app for Nigeria" and the plan contains
  Paystack (not Stripe), `af-south-1` (not `us-east-1`), and real Nigerian
  competitor analysis — all with source URLs
- Every decision in `BUILD_PLAN.md` has at least one cited URL
- The Critic in Stage 6 catches at least one inconsistency per plan on average
- The resulting development cycle produces fewer Critic rejections because the
  Architect is working from a real plan, not memory

---

*Document created: 2026-11-13*
*Status: Planned — not yet implemented*
*Owner: INDEX0 Core Team*
