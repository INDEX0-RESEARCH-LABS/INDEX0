# GROUNDWORK

**Research-First Agent Pipeline for INDEX0**

> Before INDEX0 writes a single line of code, GROUNDWORK goes to the real web,
> finds what actually exists in the market, verifies it, and locks a fully
> sourced plan. Development only starts after the plan is proven — not assumed.
>
> Every search query is generated dynamically from the user's prompt.
> Nothing is hardcoded. Nothing comes from model memory as a primary source.

---

## The Problem with Current INDEX0

The existing 4-tier loop (Architect → Developer → Critic → QA) is powerful at
*building correctly*. But the Architect node reasons from the model's training
data — knowledge that has a cutoff date, is geographically biased toward Western
tech, and cannot know what is happening in the market today.

**Result:** INDEX0 builds things that work. GROUNDWORK makes INDEX0 build things
that also sell — because every decision is grounded in what real companies in the
real market are doing right now, sourced live from the web.

---

## Core Rule

> **The model is the assembler and verifier — not the source of truth.**
>
> The model's only allowed roles inside GROUNDWORK:
> 1. Generate dynamic search queries from the user's prompt
> 2. Extract structure from web content that was fetched
> 3. Verify consistency across sources
> 4. Assemble verified facts into typed output schemas
>
> The model is NOT allowed to:
> - Recall a technology choice from memory without a source URL
> - Assume a payment provider, cloud region, or architecture pattern
> - Fill in a gap in research with "I know that..."
> - Mark any fact as confirmed without a live URL

---

## Dynamic Query Engine

Before any stage runs, the pipeline extracts variables from the user's prompt.
These variables are injected into every search query across all 6 stages.

**Variables extracted:**
```
{app_type}        → "ride-hailing app" / "food delivery" / "B2B SaaS" etc.
{app_category}    → "marketplace" / "platform" / "tool" / "consumer app" etc.
{region}          → "Nigeria" / "Southeast Asia" / "Brazil" etc.
{city}            → "Lagos" / "Jakarta" / "São Paulo" etc. (if mentioned)
{target_user}     → "drivers and riders" / "restaurants and customers" etc.
{core_feature}    → primary value proposition extracted from prompt
{industry}        → vertical (transport, food, fintech, health, etc.)
```

No search query ever contains a hardcoded company name, technology name, or
assumption. Every `{variable}` is resolved from what the user actually said.

---

## Pipeline Architecture

```
User Prompt
     │
     ▼
Dynamic Query Engine
(extracts variables from prompt)
     │
     ▼
┌──────────────────────────────────────────────────────────────┐
│                     GROUNDWORK PIPELINE                      │
│                                                              │
│  Stage 1: Deep Market Intelligence (8 layers)                │
│    └─ Who wins here? Who failed? What do users actually say? │
│       Verify Pass 1 → Verify Pass 2                          │
│                                                              │
│  Stage 2: Architecture Discovery                             │
│    └─ How do real companies in this space build it?          │
│       Verify Pass 1 → Verify Pass 2                          │
│                                                              │
│  Stage 3: Frontend Design System + Branding                  │
│    └─ Every page, every component, full emotional design     │
│       all from real apps. Branding like an agency.           │
│       Verify Pass 1 → Verify Pass 2                          │
│                                                              │
│  Stage 4: Backend Architecture                               │
│    └─ Every API, every model, every service — sourced        │
│       Verify Pass 1 → Verify Pass 2                          │
│                                                              │
│  Stage 5: Infrastructure & Payments                          │
│    └─ Region-specific cloud, real payment providers          │
│       Verify Pass 1 → Verify Pass 2                          │
│                                                              │
│  Stage 6: Plan Lock                                          │
│    └─ Critic cross-checks all 5 stages for consistency       │
│       Locks BUILD_PLAN.md — dev starts only after this       │
└──────────────────────────────────────────────────────────────┘
     │
     ▼
BUILD_PLAN.md  (fully sourced, verified, locked)
     │
     ▼
┌──────────────────────────────────────────────────────────────┐
│                EXISTING INDEX0 REVIEW LOOP                   │
│  Architect (reads BUILD_PLAN) → Developer → Critic → QA      │
└──────────────────────────────────────────────────────────────┘
```

---

## Two-Pass Verification (applies to every stage)

Each stage runs verification twice before its output is locked.

**Pass 1 — Source Verification**
Run immediately after extraction within a stage:
- Every fact has at least one live URL
- URL is reachable and content matches the claim
- Source date is within 18 months (older sources flagged, not blocked)
- If a fact has no URL → flag as UNVERIFIED, trigger re-search

**Pass 2 — Cross-Source Verification**
Run after Pass 1 completes:
- Each key fact is checked against a second independent source
- If 2 sources agree → CONFIRMED
- If only 1 source → SINGLE_SOURCE (flagged, Stage 6 Critic decides)
- If 2 sources contradict → CONFLICTED (both recorded, model does not choose)

A stage does not advance until Pass 2 completes.
CONFLICTED facts are escalated to Stage 6 Critic for resolution.

---

## Stage 1 — Deep Market Intelligence

**Goal:** Build a complete, evidence-based picture of the real market —
who is winning, who failed, what users actually say, how money moves,
what regulations apply, and where the specific opportunity gap is.

**This is the foundation. Every other stage builds on it.**
**A weak Stage 1 means every downstream decision is wrong.**

---

### Layer 1 — Competitor Product Teardown

**What it does:** Finds real competitors operating in `{region}` for `{app_type}`
and scrapes the actual substance of their product — not just their name.

**Dynamic queries:**
```
"{app_type} top apps {region} {year}"
"{app_type} market leaders {region}"
"best {app_type} app {city} download"
"site:apps.apple.com {app_type} {region}"
"site:play.google.com {app_type} {region}"
```

**Scrapes for each competitor found:**
- Pricing page (exact tiers, exact prices, commission rates)
- Feature list from their website and app store description
- App store screenshots (what they show first = what they think matters)
- Recent job postings (what they're building next)
- Recent changelog / release notes (what problems they're actively fixing)
- App store rating + review count + last update date

**Extracts:**
```json
{
  "competitors": [
    {
      "name": "string",
      "website": "string",
      "app_store_url": "string",
      "pricing_model": "string",
      "exact_pricing": "string",
      "top_features": ["string"],
      "recent_hires": ["string"],
      "actively_fixing": ["string"],
      "rating": "number",
      "review_count": "number",
      "last_updated": "string",
      "sources": ["url"]
    }
  ]
}
```

---

### Layer 2 — Real User Voice

**What it does:** Scrapes actual user words — not summaries. The exact
language real users use about this product category in this region.
This feeds copywriting, onboarding flow, and feature priority.

**Dynamic queries:**
```
"{app_type} {region} reviews complaints"
"site:reddit.com {app_type} {region}"
"{competitor_name} review {region}"
"{app_type} {city} twitter complaints"
"{app_type} {region} trustpilot OR g2 OR capterra"
"why I stopped using {app_type} {region}"
```

**Scrapes:**
- 1-star and 5-star app store reviews (both extremes are signal)
- Reddit threads about this product category in this region
- Twitter/X complaint threads
- Forum posts, Facebook groups if findable

**Extracts:**
```json
{
  "top_complaints": [
    {
      "complaint": "string (verbatim user language)",
      "frequency": "number of times seen",
      "source": "url"
    }
  ],
  "top_praises": [
    {
      "praise": "string (verbatim user language)",
      "frequency": "number",
      "source": "url"
    }
  ],
  "exact_user_phrases": ["string"],
  "unmet_needs": ["string"],
  "sources": ["url"]
}
```

---

### Layer 3 — Business Model Intelligence

**What it does:** Finds how money actually flows in this market —
real revenue figures, real unit economics, real commission structures.
Not assumed. Only what is publicly findable.

**Dynamic queries:**
```
"{app_type} {region} revenue business model"
"{competitor_name} revenue funding valuation"
"{app_type} commission rate {region}"
"{app_type} unit economics {region}"
"{competitor_name} annual report OR investor deck"
"how does {competitor_name} make money"
```

**Extracts:**
```json
{
  "revenue_models": [
    {
      "company": "string",
      "model": "string",
      "exact_rates": "string",
      "reported_revenue": "string",
      "source": "url"
    }
  ],
  "unit_economics": {
    "average_transaction_value": "string",
    "platform_take_rate": "string",
    "provider_payout_rate": "string",
    "source": "url"
  },
  "monetization_opportunities": ["string"],
  "sources": ["url"]
}
```

---

### Layer 4 — Market Dynamics

**What it does:** Finds what is happening in this market RIGHT NOW —
funding, acquisitions, exits, pivots. The model's training cannot know this.

**Dynamic queries:**
```
"{app_type} {region} funding raised 2024 2025"
"site:crunchbase.com {app_type} {region}"
"{app_type} {region} acquired merger"
"{app_type} {region} shutdown closed"
"{app_type} {region} market size growth"
"investors backing {app_type} {region}"
```

**Extracts:**
```json
{
  "recent_funding": [
    {
      "company": "string",
      "amount": "string",
      "round": "string",
      "date": "string",
      "investors": ["string"],
      "source": "url"
    }
  ],
  "recent_exits": [
    {
      "company": "string",
      "type": "acquisition | shutdown | pivot",
      "details": "string",
      "source": "url"
    }
  ],
  "market_size": "string",
  "growth_rate": "string",
  "active_investors": ["string"],
  "sources": ["url"]
}
```

---

### Layer 5 — Regulatory & Compliance Landscape

**What it does:** Finds what laws, licenses, and regulations govern
this product in `{region}`. Missed regulation = product gets shut down.

**Dynamic queries:**
```
"{app_type} regulation law {region}"
"{app_type} license required {region}"
"{industry} compliance {region} {year}"
"data privacy law {region} {industry}"
"{app_type} banned OR restricted {region}"
"{region} {industry} regulatory authority"
```

**Extracts:**
```json
{
  "governing_body": "string",
  "required_licenses": ["string"],
  "data_residency_requirements": "string",
  "payment_regulations": "string",
  "recent_regulatory_changes": ["string"],
  "compliance_risks": ["string"],
  "sources": ["url"]
}
```

---

### Layer 6 — Distribution & User Acquisition

**What it does:** Finds how successful companies in this market actually
acquire users in `{region}`. Channels that work in one geography fail in another.

**Dynamic queries:**
```
"how {competitor_name} acquired users {region}"
"{app_type} growth strategy {region}"
"{app_type} marketing channel {region}"
"user acquisition {app_type} {region} case study"
"{region} mobile app marketing strategy"
```

**Extracts:**
```json
{
  "acquisition_channels": [
    {
      "channel": "string",
      "effectiveness": "high | medium | low",
      "evidence": "string",
      "source": "url"
    }
  ],
  "referral_structures": ["string"],
  "regional_channel_preferences": "string",
  "estimated_cac": "string",
  "sources": ["url"]
}
```

---

### Layer 7 — Failure Analysis

**What it does:** Finds companies that tried to build `{app_type}` in `{region}`
and failed — and extracts exactly why. These are the decisions to avoid.

**Dynamic queries:**
```
"{app_type} {region} failed shutdown why"
"{competitor_name} problems OR issues OR failed"
"{app_type} startup graveyard {region}"
"why {app_type} failed {region} post-mortem"
"lessons learned {app_type} {region} founder"
```

**Extracts:**
```json
{
  "failures": [
    {
      "company": "string",
      "year": "string",
      "primary_failure_reason": "string",
      "secondary_reasons": ["string"],
      "lesson": "string",
      "source": "url"
    }
  ],
  "failure_patterns": ["string"],
  "decisions_to_avoid": ["string"],
  "sources": ["url"]
}
```

---

### Layer 8 — Opportunity Gap Mapping

**What it does:** Cross-references all 7 layers to find the specific,
evidence-backed gaps where this product can win. Not brainstorming —
intersection of real user pain (Layer 2), competitor weakness (Layer 1),
market gap (Layer 4), and failure patterns (Layer 7).

**No external search.** This layer is pure synthesis of Layers 1–7.
The model assembles — it does not invent.

**Logic:**
```
For each unmet_need in Layer 2:
  → Is it present in any competitor's actively_fixing list? (Layer 1)
  → Did any failed company fail because of this exact problem? (Layer 7)
  → Is any investor currently funding solutions to this? (Layer 4)
  → If yes to 2+ → HIGH CONFIDENCE opportunity
  → If yes to 1 → MEDIUM CONFIDENCE opportunity
  → If yes to 0 → LOW CONFIDENCE (may be niche or solved elsewhere)
```

**Extracts:**
```json
{
  "opportunity_gaps": [
    {
      "gap": "string",
      "confidence": "HIGH | MEDIUM | LOW",
      "evidence_from_layers": ["string"],
      "recommended_feature": "string"
    }
  ],
  "winning_positioning": "string",
  "differentiation_strategy": "string"
}
```

---

### Stage 1 Output Schema (consolidated)

```json
{
  "app_type": "string",
  "region": "string",
  "city": "string",
  "research_timestamp": "ISO8601",
  "layer_1_competitors": { ... },
  "layer_2_user_voice": { ... },
  "layer_3_business_model": { ... },
  "layer_4_market_dynamics": { ... },
  "layer_5_regulation": { ... },
  "layer_6_distribution": { ... },
  "layer_7_failures": { ... },
  "layer_8_opportunities": { ... },
  "total_sources": "number",
  "confirmed_facts": "number",
  "single_source_facts": "number",
  "conflicted_facts": "number",
  "verification_pass_1": "PASS | FAIL",
  "verification_pass_2": "PASS | FAIL"
}
```

---

## Stage 2 — Architecture Discovery

**Goal:** Find real production architectures that companies in `{app_type}`
in `{region}` actually use — not textbook patterns, not model memory.

**All queries are dynamic — `{app_type}`, `{region}`, `{competitor_name}`
are injected from Stage 1 output and user prompt variables.**

**Dynamic queries:**
```
"{competitor_name} engineering blog architecture"
"{app_type} system design production scale"
"how {competitor_name} built {core_feature} engineering"
"{app_type} backend architecture open source site:github.com"
"{app_type} microservices architecture case study"
"{core_feature} at scale engineering {year}"
"{industry} real-time architecture production"
"site:medium.com OR site:engineering.{competitor}.com {app_type} architecture"
```

**Verification:** Two-pass. Each architectural decision needs a live source URL.
No decision marked confirmed without a URL.

**Extracts:**
- 3–5 real reference architectures with direct URLs
- Core services identified with sources
- Database choices with sourced reasoning
- Messaging/queue choices with sourced reasoning
- Real-time tech choice with sourced reasoning
- Scaling patterns used in production

**Output Schema:**
```json
{
  "reference_architectures": [
    {
      "company": "string",
      "url": "string",
      "core_services": ["string"],
      "database": { "choice": "string", "source": "string" },
      "messaging": { "choice": "string", "source": "string" },
      "realtime": { "choice": "string", "source": "string" },
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
  "verification_pass_1": "PASS | FAIL",
  "verification_pass_2": "PASS | FAIL",
  "sources": ["url"]
}
```

---

## Stage 3 — Frontend Design System + Branding

**Goal:** Plan the complete frontend — every page, every component, every
design token, and the full emotional/brand design system — from real apps
in this exact market. Engineered like a branding agency, not generated by AI.

**This stage has two sub-stages:**
- **3A — Branding & Emotional Design** (runs first)
- **3B — Full Frontend Architecture** (uses 3A output)

---

### Stage 3A — Branding & Emotional Design

**What it does:** Researches the psychological and emotional layer of design
for `{app_type}` in `{region}`. Not "pick nice colors" — engineered brand
strategy from real market data.

**Dynamic queries:**
```
"{app_type} {region} brand design psychology"
"color psychology {region} {industry} trust"
"top {app_type} apps {region} UI screenshots"
"site:mobbin.com {app_type}"
"{competitor_name} brand guidelines"
"emotional design {app_type} onboarding"
"{region} consumer psychology mobile app"
"micro-interactions {app_type} delight"
"trust signals {industry} app {region}"
"{app_type} brand personality successful"
```

**Scrapes:**
- Real app screenshots from Mobbin, app stores, competitor sites
- Brand guidelines if publicly available
- UX research articles specific to `{region}` culture and psychology
- Marketing psychology studies for `{industry}` in `{region}`

**Extracts:**

*Color Strategy (sourced, not assumed):*
- What colors dominant apps in this space use and why
- Color psychology specific to `{region}` culture (colors mean different
  things in different markets — always source this)
- Recommended palette with hex values, each with a source

*Typography Strategy (sourced):*
- What font styles successful `{app_type}` apps in `{region}` use
- Readability considerations for `{region}` (language, script, screen size)

*Emotional Map (per screen):*
- What emotion should each key screen trigger
- What design decisions produce that emotion
- Sourced from real UX research or competitor behavior

*Brand Personality:*
- What adjectives describe the brand (sourced from successful competitors
  in this exact market — not invented)
- Trust signals that work in `{region}` for `{industry}`
- Urgency patterns (how real apps create urgency without feeling pushy)
- Delight moments (micro-interactions sourced from real high-performing apps)

**Output Schema:**
```json
{
  "color_palette": {
    "primary": { "hex": "string", "emotion": "string", "source": "string" },
    "secondary": { "hex": "string", "emotion": "string", "source": "string" },
    "accent": { "hex": "string", "emotion": "string", "source": "string" },
    "background": { "hex": "string", "source": "string" },
    "error": { "hex": "string", "source": "string" },
    "success": { "hex": "string", "source": "string" },
    "rationale": "string",
    "source": "url"
  },
  "typography": {
    "heading_font": { "name": "string", "reason": "string", "source": "string" },
    "body_font": { "name": "string", "reason": "string", "source": "string" },
    "scale": ["string"]
  },
  "emotional_map": [
    {
      "screen": "string",
      "target_emotion": "string",
      "design_decisions": ["string"],
      "source": "url"
    }
  ],
  "brand_personality": {
    "adjectives": ["string"],
    "trust_signals": ["string"],
    "urgency_patterns": ["string"],
    "delight_moments": ["string"],
    "sources": ["url"]
  },
  "regional_design_considerations": "string",
  "sources": ["url"]
}
```

---

### Stage 3B — Full Frontend Architecture

**What it does:** Plans every single page and component before development
starts. The entire frontend is locked as one complete architecture —
not some pages first and others later.

**Dynamic queries:**
```
"{competitor_name} app UI flow screenshots"
"{app_type} mobile UX patterns {region}"
"{app_type} onboarding flow design"
"{app_type} navigation structure mobile"
"site:mobbin.com {app_type} flow"
"{app_type} design system components"
"{core_feature} UI pattern mobile"
```

**Extracts:**

*Full Page Inventory (every page, locked before dev):*
Every page is planned with: name, route, purpose, layout type,
components used, entry points, exit points, empty state, loading
state, error state. No page is left for later.

*Component Inventory (every component):*
Every reusable component with: name, purpose, variants, all states,
which page(s) use it, sourced from a real app where possible.

*Navigation Structure:*
Full navigation map — how every page connects to every other page.
Sourced from real app navigation patterns in `{app_type}`.

**Output Schema:**
```json
{
  "design_tokens": {
    "spacing_scale": ["number"],
    "border_radius": { "small": "string", "medium": "string", "large": "string" },
    "shadow_levels": ["string"],
    "icon_style": "string",
    "source": "url"
  },
  "components": [
    {
      "name": "string",
      "purpose": "string",
      "variants": ["string"],
      "states": ["string"],
      "used_on_pages": ["string"],
      "sourced_from": "url"
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
      "exit_to": ["string"],
      "empty_state": "string",
      "loading_state": "string",
      "error_state": "string",
      "apis_needed": ["string"]
    }
  ],
  "navigation_structure": {
    "type": "string",
    "primary_tabs": ["string"],
    "source": "url"
  },
  "total_pages": "number",
  "total_components": "number",
  "verification_pass_1": "PASS | FAIL",
  "verification_pass_2": "PASS | FAIL",
  "sources": ["url"]
}
```

---

## Stage 4 — Backend Architecture

**Goal:** Plan every API endpoint, every data model, every service —
sourced from real production backends. No endpoint added from memory alone.

**Dynamic queries:**
```
"{app_type} REST API design open source site:github.com"
"{competitor_name} API documentation developer"
"{app_type} database schema design production"
"{core_feature} microservice architecture"
"{app_type} backend open source {year}"
"{industry} API design best practices {year}"
"multi-tenant {app_type} architecture"
"{app_type} data model entity relationship"
```

**Verification:** Every endpoint must reference a real API pattern
from a sourced system. No endpoint invented from model memory alone.

**Extracts:**

*Service Map:*
Every service with: responsibility, tech choice, dependencies, source.

*Full API Contract (every endpoint):*
Every endpoint planned before dev: method, path, purpose, auth,
request schema, response schema, rate limit, source reference.

*Data Models:*
Every entity with: all fields, types, relationships, indexes, source.

*Multi-tenancy Strategy:*
Isolation pattern sourced from real SaaS companies in `{industry}`.

**Output Schema:**
```json
{
  "services": [
    {
      "name": "string",
      "responsibility": "string",
      "tech": "string",
      "depends_on": ["string"],
      "source": "url"
    }
  ],
  "api_endpoints": [
    {
      "method": "GET | POST | PUT | PATCH | DELETE",
      "path": "string",
      "service": "string",
      "purpose": "string",
      "auth": "string",
      "rate_limit": "string",
      "request_schema": {},
      "response_schema": {},
      "source": "url"
    }
  ],
  "data_models": [
    {
      "entity": "string",
      "fields": [
        { "name": "string", "type": "string", "required": "boolean" }
      ],
      "indexes": ["string"],
      "relationships": ["string"],
      "source": "url"
    }
  ],
  "multitenancy_strategy": {
    "pattern": "string",
    "reason": "string",
    "source": "url"
  },
  "total_endpoints": "number",
  "total_entities": "number",
  "verification_pass_1": "PASS | FAIL",
  "verification_pass_2": "PASS | FAIL",
  "sources": ["url"]
}
```

---

## Stage 5 — Infrastructure & Payments

**Goal:** Plan the full infrastructure stack and payment architecture —
specific to `{region}`, sourced from real providers and real deployments.
Not Western defaults. Not model assumptions.

**Dynamic queries (Infrastructure):**
```
"cloud provider latency benchmark {region} {year}"
"best CDN {region} performance"
"{app_type} infrastructure {region} deployment"
"data residency law {region} cloud"
"{app_type} DevOps CI CD pipeline {year}"
"server location {region} lowest latency"
```

**Dynamic queries (Payments):**
```
"payment gateway {region} developer"
"best payment API {region} {year}"
"{payment_provider} integration {region}"
"marketplace payment split {region}"
"instant payout {region} API"
"refund chargeback {region} {industry}"
"cash payment integration {region}"
```

**Dynamic queries (Support & Operations):**
```
"{app_type} customer support platform {region}"
"multi-tenant onboarding SaaS {industry}"
"tenant provisioning architecture {year}"
"support channel preference {region} mobile"
```

**Verification:** Payment provider must be verified as actually operational
in `{region}` with live docs URL. Cloud region must have latency evidence.

**Output Schema:**
```json
{
  "infrastructure": {
    "cloud_provider": "string",
    "region": "string",
    "region_latency_ms": "number",
    "region_reason": "string",
    "cdn": "string",
    "cdn_source": "url",
    "data_residency_compliant": "boolean",
    "data_residency_source": "url",
    "source": "url"
  },
  "cicd": {
    "pipeline": "string",
    "stages": ["string"],
    "source": "url"
  },
  "payments": {
    "primary_provider": "string",
    "primary_provider_source": "url",
    "fallback_provider": "string",
    "supports_cash": "boolean",
    "split_logic": "string",
    "instant_payout": "boolean",
    "refund_flow": "string",
    "explicitly_not": ["string"],
    "source": "url"
  },
  "support": {
    "platform": "string",
    "primary_channel": "string",
    "channel_reason": "string",
    "source": "url"
  },
  "multitenancy_ops": {
    "onboarding_flow": ["string"],
    "provisioning_strategy": "string",
    "source": "url"
  },
  "verification_pass_1": "PASS | FAIL",
  "verification_pass_2": "PASS | FAIL",
  "sources": ["url"]
}
```

---

## Stage 6 — Plan Lock

**Goal:** A Critic agent cross-checks all 5 stage outputs for consistency,
completeness, and conflicts. Nothing moves to development until this passes.

**No web search in Stage 6.** This is pure cross-stage verification.

**Critic checks:**

*Frontend ↔ Backend alignment:*
- Every page in Stage 3B has all the APIs it needs in Stage 4
- Every API in Stage 4 has at least one page in Stage 3B that uses it
- No orphaned endpoints, no pages with missing APIs

*Infrastructure ↔ Architecture alignment:*
- The real-time tech choice in Stage 2 is supported by the cloud/infra in Stage 5
- The database choice in Stage 2 matches the data models in Stage 4
- The CDN in Stage 5 is compatible with the frontend framework

*Payments ↔ Region alignment:*
- The payment providers in Stage 5 are verified for `{region}` from Stage 1 Layer 5
- If Stage 1 Layer 5 found cash payment dominance → Stage 5 must have cash support
- Payment split logic in Stage 5 covers all money flows in Stage 4 endpoints

*Opportunity ↔ Features alignment:*
- Every HIGH CONFIDENCE opportunity from Stage 1 Layer 8 is addressed in
  Stage 3B (a page exists) and Stage 4 (an endpoint exists)
- If a gap exists → flag as MISSING_FEATURE, block lock until addressed

*Regulation ↔ Architecture alignment:*
- Data residency requirement from Stage 1 Layer 5 matches cloud region in Stage 5
- Required licenses from Stage 1 Layer 5 have corresponding flows in Stage 3/4
- Any CBN / regulatory API requirement has a corresponding endpoint in Stage 4

*Source completeness:*
- Every confirmed fact has a live URL
- CONFLICTED facts from any stage have both sides documented
- Source dates checked — anything older than 18 months flagged

**Lock output:**
```json
{
  "lock_status": "APPROVED | REJECTED",
  "checks_passed": ["string"],
  "checks_failed": ["string"],
  "missing_features": ["string"],
  "conflicted_facts": ["string"],
  "critic_signature": "string",
  "timestamp": "ISO8601"
}
```

**If REJECTED:** The specific failing stage re-runs with tighter queries.
Plan Lock re-runs after the stage completes. Max 2 re-runs per stage.

**If APPROVED:** `BUILD_PLAN.md` is generated and locked.

---

## BUILD_PLAN.md Structure

The final locked document passed to the Architect node:

```
BUILD_PLAN.md
├── Executive Summary (from Stage 1 Layer 8)
├── Market Intelligence (Stage 1 — all 8 layers, all sources)
├── Reference Architectures (Stage 2 — with URLs)
├── Brand & Emotional Design (Stage 3A — with sources)
├── Full Frontend Architecture (Stage 3B — every page, every component)
├── Backend Architecture (Stage 4 — every endpoint, every model)
├── Infrastructure & Payments (Stage 5 — region-specific, sourced)
├── Plan Lock Certificate (Stage 6 — critic approval, timestamp)
├── Source Index (all URLs with access dates)
└── Development Task List (ordered by dependency)
```

---

## How It Integrates with Existing INDEX0

### New: `services/research-agent/`

```
services/research-agent/
├── src/
│   ├── main.py                    # FastAPI service, POST /research/start
│   ├── pipeline.py                # ResearchOrchestrator — runs 6 stages
│   ├── query_engine.py            # Dynamic query generator from user prompt
│   ├── stages/
│   │   ├── market.py              # Stage 1 (8 layers)
│   │   ├── architecture.py        # Stage 2
│   │   ├── frontend_branding.py   # Stage 3A
│   │   ├── frontend_arch.py       # Stage 3B
│   │   ├── backend.py             # Stage 4
│   │   ├── infrastructure.py      # Stage 5
│   │   └── plan_lock.py           # Stage 6
│   ├── tools/
│   │   ├── searcher.py            # Web search (Exa → Brave → SerpAPI)
│   │   ├── scraper.py             # Full page content extraction
│   │   └── verifier.py            # Two-pass cross-source verification
│   └── schemas/
│       ├── market.py              # Typed Stage 1 output
│       ├── architecture.py        # Typed Stage 2 output
│       ├── frontend.py            # Typed Stage 3 output
│       ├── backend.py             # Typed Stage 4 output
│       └── infrastructure.py      # Typed Stage 5 output
└── tests/
    └── test_pipeline.py
```

### Modified: `services/agent-orchestrator/`
- `architect_node` reads `BUILD_PLAN.md` when `groundwork_enabled: true`
- `ReviewLoopState` gains: `plan_id`, `build_plan_path`, `groundwork_enabled`

### New: `packages/research-contracts/`
Shared TypeScript + Python schemas for all 6 stage outputs.

### New API Flow

```
POST /research/start
  { "userPrompt": "build me a ride-hailing app for Lagos" }
  → { "plan_id": "plan-abc123", "status": "running", "stage": 1 }

GET /research/{plan_id}/status
  → { "stage": 3, "layer": 2, "status": "in_progress", "sources_found": 47 }

GET /research/{plan_id}/plan
  → { "build_plan": "...", "stages": {...}, "total_sources": 94 }

POST /cycles/start
  { "taskId": "...", "planId": "plan-abc123", "groundworkEnabled": true }
  → existing review loop, Architect reads BUILD_PLAN.md not memory
```

---

## Implementation Phases

### Phase A — Dynamic Query Engine + Research Tooling (Week 1)
- `query_engine.py` — extracts variables from any user prompt, generates
  dynamic queries for all 6 stages. Zero hardcoded terms.
- `searcher.py` — Exa → Brave → SerpAPI fallback chain
- `scraper.py` — full page content extraction (not just snippets)
- `verifier.py` — two-pass verification logic
- Tests with real web calls (record/replay for CI)

### Phase B — Stage 1: Deep Market Intelligence (Week 1-2)
- All 8 layers implemented
- Each layer has dynamic queries, extraction, and two-pass verification
- Output validated against typed schema
- This is the most important stage — spend the most time here

### Phase C — Stage 2: Architecture Discovery (Week 2)
- Dynamic queries sourced from Stage 1 competitor output
- Two-pass verification
- Output feeds Stage 4

### Phase D — Stage 3: Frontend (Week 2)
- 3A: Branding & Emotional Design — psychology-sourced, agency-quality
- 3B: Full Frontend Architecture — every page locked before dev
- Entire frontend architecture completed in one pass, not incrementally

### Phase E — Stage 4: Backend Architecture (Week 2-3)
- Every endpoint sourced from real production systems
- Complete API contract before dev starts

### Phase F — Stage 5 & 6 (Week 3)
- Infrastructure & Payments — region-specific, payment verified in region
- Plan Lock — full cross-stage Critic verification
- `BUILD_PLAN.md` generation

### Phase G — Orchestrator Integration (Week 3)
- Architect node reads `BUILD_PLAN.md`
- End-to-end: user prompt → BUILD_PLAN → working code

---

## Search Provider Strategy

```
Priority 1: Exa
  → Semantic search, returns full page content
  → Best for: engineering blogs, technical docs, case studies

Priority 2: Brave Search API
  → Real-time web index, good regional coverage
  → Best for: news, market data, recent events

Priority 3: SerpAPI
  → Google results, broad coverage
  → Best for: app store pages, general web

Priority 4: Direct scraping
  → For known high-value domains:
    GitHub, Crunchbase, App Store, Play Store,
    Mobbin, engineering.{company}.com
```

The `searcher.py` tool abstracts the provider. Stage logic never references
a specific provider — it only calls `search(query, intent)` and gets content.

---

## Verification Rules

**CONFIRMED:** Appears in 2+ independent sources, OR comes from a primary
source (official docs, company engineering blog, GitHub repo with 100+ stars).

**SINGLE_SOURCE:** Only 1 source, not a primary source. Flagged but not blocked.
Stage 6 Critic decides whether to accept or re-search.

**CONFLICTED:** 2+ sources contradict each other. Both recorded verbatim.
Model does not choose between them. Escalated to Stage 6 Critic.

**UNVERIFIED:** No source URL found. Cannot be used in BUILD_PLAN.
Re-search triggered automatically. If re-search fails → decision removed.

**STALE:** Source older than 18 months. Flagged. Stage 6 Critic decides.

---

## Naming

| Component | Name |
|---|---|
| Feature name | GROUNDWORK |
| Service | `research-agent` |
| Orchestrator class | `ResearchOrchestrator` |
| Query generator | `DynamicQueryEngine` |
| Plan output | `BUILD_PLAN.md` |
| State flag | `groundwork_enabled` |
| API prefix | `/research/` |
| Stage 1 | Deep Market Intelligence (8 layers) |
| Stage 2 | Architecture Discovery |
| Stage 3A | Branding & Emotional Design |
| Stage 3B | Frontend Architecture |
| Stage 4 | Backend Architecture |
| Stage 5 | Infrastructure & Payments |
| Stage 6 | Plan Lock |

---

## What GROUNDWORK Does Not Do

- Does not write code — that is the existing review loop
- Does not replace the Architect node — feeds it real inputs
- Does not guarantee sources are correct — verifies consistency, not truth
- Does not work without web access — requires live search capability
- Is not required — `groundwork_enabled: false` runs existing loop unchanged

---

## Success Criteria

GROUNDWORK is working when:
- Any user prompt produces a `BUILD_PLAN.md` where every decision has a URL
- Payment provider is correct for the target region (not a Western default)
- Cloud region is chosen based on latency evidence, not assumption
- Regulatory requirements for the target market are captured
- The Critic in Stage 6 catches at least one cross-stage inconsistency per plan
- Zero architectural decisions come from model memory without a source URL

---

*Document created: 2026-11-13*
*Last updated: 2026-11-13 — Full rewrite: 8-layer market research,
 dynamic query engine, two-pass verification, branding sub-stage*
*Status: Planned — not yet implemented*
*Owner: INDEX0 Core Team*
