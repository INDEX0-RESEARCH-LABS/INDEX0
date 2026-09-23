# ROADMAP & UNIT ECONOMICS — INDEX0 AI

> Financial model, cost-optimization mechanics, and go-to-market launch playbook
> for the INDEX0 Sovereign AGI Platform.

---

## 1. Pricing Architecture

### 1.1 Plan Tiers

| Feature | Free | Pro ($20/mo) | Enterprise (Custom) |
|---------|------|-------------|-------------------|
| Agent Runs | 50/mo | 2,000/mo | Unlimited |
| Sandbox Execution | 500 min/mo | 10,000 min/mo | Unlimited |
| Token Budget | 500K tokens/mo | 20M tokens/mo | Unlimited |
| Voice Sessions | — | 100 hrs/mo | Unlimited |
| Concurrent Workspaces | 1 | 10 | Unlimited |
| Team Members | 1 | 25 | Unlimited |
| SAST Scanning | Basic | Full (Semgrep + Trivy) | Full + Custom Rules |
| Context Compression | L0 only | L0 + L1 + L2 | Full + Custom Indexes |
| Agent Memory (Letta) | 7-day retention | 90-day retention | Unlimited |
| Review Loop Tiers | 2-tier (Dev + QA) | 4-tier (Full cycle) | Custom pipelines |
| Model Selection | Auto-routed | Full model choice | Self-hosted + Cloud |
| Support | Community | Priority Email | Dedicated Slack + SLA |

### 1.2 Overage Pricing

| Dimension | Unit | Overage Rate |
|-----------|------|-------------|
| Agent Runs | per run | $0.01 |
| Sandbox Execution | per minute | $0.005 |
| Tokens (cloud models) | per 1K tokens | $0.002 |
| Tokens (local models) | per 1K tokens | $0.00 |
| Voice Sessions | per hour | $0.10 |

---

## 2. Unit Economics Model

### 2.1 Cost of Goods Sold (COGS) Per Pro Seat

```text
┌──────────────────────────────────────────────────────────────┐
│              COGS BREAKDOWN — PRO TIER ($20/mo)              │
├──────────────────────────────────────────────────────────────┤
│                                                               │
│  CATEGORY                              COST/SEAT/MONTH       │
│  ───────────────────────────────────── ──────────────         │
│  Cloud LLM Tokens (after optimization)      $1.80            │
│  E2B MicroVM Sandbox Compute                $0.90            │
│  PostgreSQL + ClickHouse Storage            $0.35            │
│  LiveKit Media Server (voice sessions)      $0.25            │
│  Letta Memory Server                        $0.15            │
│  LiteLLM Proxy Overhead                     $0.10            │
│  Bandwidth & CDN                            $0.20            │
│  Infrastructure Overhead (monitoring, CI)   $0.35            │
│  Contingency Buffer (10%)                   $0.40            │
│  ───────────────────────────────────── ──────────────         │
│  TOTAL COGS                                 $4.50            │
│                                                               │
│  REVENUE                                   $20.00            │
│  GROSS MARGIN                              $15.50 (77.5%)    │
│                                                               │
└──────────────────────────────────────────────────────────────┘
```

### 2.2 Cost Optimization Levers

```text
┌────────────────────────────────────────────────────────────────┐
│             COST-KILL ARCHITECTURE                             │
├────────────────────────────────────────────────────────────────┤
│                                                                │
│  1. LOCAL EDGE OFFLOADING (OpenJarvis Pattern)                 │
│     ──────────────────────────────────────────                 │
│     88.7% of single-turn operations routed locally:            │
│     • Code linting & formatting            → Local             │
│     • File search (ripgrep)                → Local             │
│     • Syntax checking                      → Local             │
│     • Simple code completions (TabbyML)    → Local (vLLM)      │
│     • Dependency resolution                → Local             │
│                                                                │
│     Token cost for these operations: $0.00                     │
│                                                                │
│  2. VIKING CONTEXT COMPRESSION                                 │
│     ──────────────────────────────                             │
│     3-tier progressive loading reduces input tokens:           │
│     • L0 Abstract: 91.0% savings (route/plan tasks)            │
│     • L1 Structural: 65.7% savings (API understanding)         │
│     • L2 Full Code: 0% savings (actual editing)                │
│     • Weighted average across all operations: 73% savings      │
│                                                                │
│  3. LITELLM INTELLIGENT ROUTING                                │
│     ────────────────────────────                               │
│     Route by task complexity:                                  │
│     • Simple (autocomplete, lint): Local vLLM           $0.00  │
│     • Medium (code gen, review): Claude Haiku       $0.0003/1K │
│     • Complex (architecture, debug): Claude Sonnet  $0.003/1K  │
│     • Ultra (novel design, research): GPT-4o        $0.005/1K  │
│                                                                │
│     Blended reduction vs. single-model: 56%                    │
│                                                                │
│  4. COMBINED EFFECT                                            │
│     ───────────────                                            │
│     Baseline (all cloud, full context): $16.50/seat/month      │
│     After edge offloading:              $7.50/seat/month       │
│     After context compression:          $3.20/seat/month       │
│     After intelligent routing:          $1.80/seat/month       │
│                                                                │
│     TOTAL TOKEN COST REDUCTION: 89.1%                          │
│                                                                │
└────────────────────────────────────────────────────────────────┘
```

---

## 3. Revenue Projections

### 3.1 Conservative Growth Model

| Month | Free Users | Pro Users | Enterprise | MRR | ARR |
|-------|-----------|-----------|------------|-----|-----|
| 1 | 500 | 20 | 0 | $400 | $4,800 |
| 3 | 2,000 | 100 | 2 | $4,000 | $48,000 |
| 6 | 5,000 | 400 | 5 | $12,500 | $150,000 |
| 12 | 15,000 | 1,500 | 15 | $52,500 | $630,000 |
| 18 | 30,000 | 4,000 | 40 | $160,000 | $1,920,000 |
| 24 | 50,000 | 10,000 | 100 | $450,000 | $5,400,000 |

**Assumptions**:
- Free → Pro conversion rate: 4-6%
- Pro → Enterprise conversion rate: 1-2%
- Monthly churn rate: 3% (Pro), 1% (Enterprise)
- Enterprise average deal: $2,500/mo

### 3.2 Breakeven Analysis

```text
Fixed Monthly Costs (Infrastructure):
  Cloud hosting (2x servers)         $800
  Domain, DNS, CDN                   $50
  CI/CD (GitHub Actions)             $100
  Monitoring (Grafana Cloud)         $100
  ──────────────────────────────────
  Total Fixed                        $1,050

Breakeven Point:
  $1,050 / ($20 - $4.50) = 68 Pro seats
  
  Expected timeline: Month 2-3
```

---

## 4. Development Roadmap

### 4.1 Phase Timeline

```text
WEEK 1-2: FOUNDATION
══════════════════════════════════════════════════════════════════
  ✓ Architecture documentation (4 docs)
  ✓ Contract extensions (voice, context, coordination, review-loop)
  • Prisma schema extensions
  • Contract build validation

WEEK 3-4: CORE EXECUTION UPGRADE
══════════════════════════════════════════════════════════════════
  • Firecracker sandbox provider
  • E2B Desktop automation provider
  • Sandbox provider selection logic
  • MicroVM boot optimization

WEEK 5-6: INTELLIGENCE LAYER
══════════════════════════════════════════════════════════════════
  • LangGraph 4-tier review loop (Python service)
  • TextGrad feedback engine
  • GNAP protocol implementation
  • Postcard message envelope
  • Agent orchestrator Docker integration

WEEK 7-8: COST OPTIMIZATION
══════════════════════════════════════════════════════════════════
  • Viking (viking://) protocol MCP host
  • L0/L1/L2 context tier generation
  • LiteLLM proxy deployment + model routing
  • Letta memory server integration
  • Cost tracking dashboards

WEEK 9-10: VOICE & SECURITY
══════════════════════════════════════════════════════════════════
  • LiveKit server deployment
  • Voice agent (Pipecat pipeline)
  • WebRTC client integration (IDE)
  • Semgrep SAST MCP server
  • Trivy vulnerability scanning
  • Pre-merge security gate pipeline

WEEK 11-12: POLISH & LAUNCH
══════════════════════════════════════════════════════════════════
  • End-to-end integration testing
  • Performance benchmarking
  • Documentation finalization
  • Marketing site updates
  • Product Hunt / Hacker News launch
```

---

## 5. Launch Playbook

### 5.1 Pre-Launch (Week 11)

| Task | Owner | Status |
|------|-------|--------|
| Complete all 6 augmentation layers | Engineering | — |
| Stress test: 100 concurrent agent runs | Engineering | — |
| Security audit: Semgrep + Trivy full scan | Security | — |
| Landing page update with AGI capabilities | Marketing | — |
| Record demo video (5 min) showing voice + agent loop | Marketing | — |
| Write "How We Built a $0 Token-Cost AI IDE" blog post | Content | — |
| Prepare Product Hunt submission | Growth | — |
| Set up Hacker News Show HN draft | Growth | — |
| Configure PostHog funnels for launch tracking | Analytics | — |

### 5.2 Launch Day (24-Hour Playbook)

```text
T-2h:  Final production deployment via Coolify
       Health check all services
       Verify Stripe payment flow end-to-end

T-0:   Product Hunt submission goes live (12:01 AM PST)
       Show HN post published
       X/Twitter announcement thread (via Postiz)
       LinkedIn post for enterprise audience
       Discord community announcement
       Listmonk email blast to waitlist

T+1h:  Monitor PostHog real-time dashboard
       Respond to first Product Hunt comments
       Monitor HN comment thread

T+4h:  First engagement report
       Address any reported issues
       Post follow-up thread with technical details

T+8h:  Second engagement report
       Blog post cross-posted to Dev.to, Hashnode
       Reddit r/programming, r/selfhosted posts

T+12h: Mid-day metrics review
       User feedback synthesis
       Hotfix deployment if needed

T+24h: Day 1 retrospective
       Compile metrics: signups, conversions, PH ranking
       Plan Week 2 based on user feedback
```

### 5.3 Key Metrics to Track

| Metric | Target (Day 1) | Target (Week 1) | Target (Month 1) |
|--------|----------------|-----------------|-------------------|
| Website visitors | 5,000 | 25,000 | 50,000 |
| Signups (Free) | 200 | 1,000 | 2,000 |
| Pro conversions | 10 | 50 | 100 |
| Product Hunt upvotes | 200 | 500 | — |
| HN points | 100 | — | — |
| GitHub stars | 100 | 500 | 1,000 |
| Agent runs executed | 500 | 5,000 | 20,000 |
| Average session length | 15 min | 20 min | 25 min |

---

## 6. Competitive Positioning

### 6.1 Differentiation Matrix

| Feature | INDEX0 | Cursor | Windsurf | Replit Agent | Devin |
|---------|--------|--------|----------|-------------|-------|
| Self-hosted / Sovereign | ✅ | ❌ | ❌ | ❌ | ❌ |
| Zero lock-in (all OSS) | ✅ | ❌ | ❌ | ❌ | ❌ |
| Voice interaction | ✅ | ❌ | ❌ | ❌ | ❌ |
| Multi-agent review loop | ✅ | ❌ | ❌ | ❌ | Partial |
| $0 local autocomplete | ✅ | ❌ | ❌ | ❌ | ❌ |
| Firecracker MicroVM sandbox | ✅ | ❌ | ❌ | ✅ | ✅ |
| Context compression (91%) | ✅ | ❌ | ❌ | ❌ | ❌ |
| Git-native agent coordination | ✅ | ❌ | ❌ | ❌ | ❌ |
| Self-evolving (TextGrad) | ✅ | ❌ | ❌ | ❌ | ❌ |
| Pre-merge SAST | ✅ | ❌ | ❌ | ❌ | ❌ |
| Price | $20/mo | $20/mo | $15/mo | $25/mo | $500/mo |
| Gross margin | 77.5% | ~60% | ~55% | ~50% | ~30% |

### 6.2 Moat Strategy

1. **Data Moat**: TextGrad continuously improves agent quality from real usage failures — each user makes the system smarter for all users.
2. **Cost Moat**: 89.1% token cost reduction via Viking + Edge + LiteLLM makes it structurally cheaper to operate than competitors.
3. **Sovereignty Moat**: Self-hosted option attracts enterprise, government, and regulated industry customers that competitors cannot serve.
4. **Network Moat**: GNAP protocol enables open multi-agent collaboration — agents from any platform can participate, creating ecosystem lock-in at the protocol level rather than the product level.
