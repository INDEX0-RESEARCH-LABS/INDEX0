# INDEX0 — 13-slide deck: text, visuals, speaker notes

Companion to `deck-13.html` / `deck-13.pdf` (rebuild: `./build-deck-13.sh`).
On-slide text below is verbatim. **Bold** = the phrase rendered in bold blue on screen.
Timing: 8 min presenting, 12 min Q&A. Do not read the slides.

---

## 1 · TITLE

**On-slide text**
- Eyebrow: `Pre-seed · November 2026 · INDEX0 Research Labs`
- Wordmark: `INDEX0`
- Tagline: `Verification before merge.`
- Footer left: `The gate that runs your tests before it says yes.`
- Footer right: `github.com/INDEX0-RESEARCH-LABS/INDEX0`

**Visual** — full-bleed generated backdrop: radial navy glow, 44px grid, ghosted mono strings (`status: qa_verified`, `3 passed / 0 failed`, `exit 0`) at 16% opacity. Logo in the bottom footer, not a corner badge.

**Background / layout** — dark, single centred column, 150px wordmark.

**Speaker note** — "Every AI coding tool now claims to check its own work. We built the part that actually runs the test suite, and refuses the patch if it fails. Everything in the next twelve slides is in a public repository you can clone."

---

## 2 · PROBLEM

**On-slide text** — *AI made code cheap. Proving it correct did not.*
Sub: `Every review layer reports on the diff. None of them run it.`

| # | Icon | Text |
|---|---|---|
| 1 | scan brackets | Static scanners **read the diff**, never the runtime. |
| 2 | split arrow | Generation and review are **sold separately**. |
| 3 | eye | Developer says done; **reviewer assumes tests ran**. |

Right panel: real terminal capture — `$ npm test` → `✕ divide rejects a zero denominator` → `1 failed` → `— but the pull request is green`. `INDEX0` bottom-right.

**Background / layout** — light, split 1:0.9, points left, terminal right.

**Speaker note** — "This is not hypothetical: a one-line change to a divide function passes review, passes the linter, and still throws on zero. The reviewer's only defence is reading it again, and reading is what everyone is now outsourcing to a model. The failure mode is that the report on the diff and the behaviour of the diff are two different things."

---

## 3 · SOLUTION

**On-slide text** — *A gate, not another generator.*
Sub: `**INDEX0** is a verification gate for AI-written code.` (2×2 grid)

| # | Icon | Title | Text |
|---|---|---|---|
| 1 | gate | The gate | Every tool reports. **One gate decides** whether the patch ships. |
| 2 | clock | Automated QA | Removes the reviewer's second pass: **1.6 seconds**, not an afternoon. |
| 3 | stack | Modern stack | **LangGraph agents** inside Docker or Firecracker microVMs. |
| 4 | key | Supply side | Any model vendor competes **on your contract**, not ours. |

**Background / layout** — dark, 2×2 grid, 80px gutters.

**Speaker note** — "Four agents — architect, developer, critic, QA — and only the last one can say yes, because only the last one executes. The other three can argue as long as they like; the verdict is a process exit code. That is the whole product, and it is deliberately not another code generator."

---

## 4 · HOW IT WORKS

**On-slide text** — *Three rules, one verdict.*
Sub: `No dashboard to learn. No new CI to buy.`

Left: terminal mockup — `$ index0 verify` → repo `acme/billing`, suite `npm test`, sandbox `firecracker` → `architect plan_proposal`, `developer implementation`, `critic request_changes`, `developer implementation`, `critic approve`, `qa 3 passed / 0 failed` → `VERIFIED exit 0 · 1.6 s · signed`.

Right, three rules:

| # | Icon | Text |
|---|---|---|
| 1 | code brackets | **Any repository** with a test suite can run it. |
| 2 | terminal | **One command** in the terminal. No new CI. |
| 3 | padlock | **Exit code zero**, or the patch does not merge. |

**Background / layout** — light, split with terminal left (reversed).

**Speaker note** — "If your repo has a test command, it can be gated today, with no migration and no YAML. The cycle you see is a real one, including the critic rejecting the first patch and the developer retrying. The signature at the end is what makes it auditable later, by someone who does not trust us."

---

## 5 · KEY DIFFERENTIATORS

**On-slide text** — *Six things that are hard to copy.*
Sub: `Each one came from a mistake we found in our own code.` (3×2)

| # | Icon | Title (blue) | Subtitle |
|---|---|---|---|
| 1 | terminal | Executes code | runs your actual suite |
| 2 | clock | Seven seconds | warm cycle time |
| 3 | shield-check | Test-edit guard | candidate cannot cheat |
| 4 | padlock | Sealed sandbox | no network egress |
| 5 | key | Own keys | your model contract |
| 6 | hash | Signed receipts | hash-chained evidence |

**Background / layout** — light, 3×2, 34px icons.

**Speaker note** — "Each of these exists because it bit us. We found runs that edited the very test that was judging them, so `packages/client-harness/src/anti-cheat.ts` hashes the test, evaluator and harness files before a run and compares them after: a modified, deleted or weakened test marks the run `INVALID_RUN` instead of passing. The sandbox mounts the source read-only, so the tree under review cannot move while it is being reviewed."

---

## 6 · PRODUCT

**On-slide text** — *One cart. One run. One refusal.*
 Sub: `A food-delivery checkout, a $5 promo, and a fee that still read the pre-promo cart.`

`DARK SLIDE`. One still on the left, three named surfaces on the right:

| Surface | Line | Mono detail |
|---|---|---|
| Terminal | The critic approved the diff. QA exited 1. | `3 passed / 1 failed · 2530 ms` |
| Editor | Both versions on screen. You approve. | `Original Version · Agent Proposed Changes` |
| Browser | A plan in English, the failure in the open. | `Execution Plan · INDEX0 Agent & Sandbox Terminal` |

Image: `shots/04-patch.png`, captioned `04 · The patch — Two lines: read the payable subtotal, round the total. 4 passed, 196 ms.`

Line under the row: `Design mockups from the shipped components, not screen captures · all six frames in pitch/shots.html`

**Background / layout** — dark, 1.34 / 1 split, image left, no bullet glyphs. Page note stays: `37 CLI tests · 94 web-workbench tests · 4 extension tests · 15 of 36 capabilities verifiable (PROOF_STATUS.md)`.

**Speaker note** — "This is Banchan, a Korean food-delivery app — the kind of thing a customer would actually order from. Three screens: menu, cart, tracking. The cart module is real code with four tests, and one of them fails: a $5 promo drops the subtotal to $21.65, below the $25 free-delivery minimum, and the app still says free delivery. Three dollars ninety lost on every discounted order, and nobody filed a ticket. The agent fixes the fee — reads the subtotal after the promo — and the critic approves it. QA refuses: `25.549999999999997 !== 25.55`. The fee was right, the cent was not. The second pass adds the rounding, and then the suite goes 4 and 0. In the editor you read both versions before you press Approve; in the browser it is the same run in a tab, plan in English, terminal in the open. Same loop, three entry points. These are design mockups drawn from the components that ship — every price and millisecond is from the fixture or from `demo/runs/20261104T090956Z`; the full set is in `pitch/shots.html`."

**If challenged on honesty** — say it plainly: the surfaces ship, the fixture ships, the run directory ships and replays offline with `./demo/run-demo.sh`. The frames are drawn from their source, not captured. Slide 12 lists what is verified versus claimed.

---

## 7 · USE CASES

**On-slide text** — *Where the gate pays for itself.*
Sub: `Every one of these is a patch that looked right.` (2×2)

| # | Icon | Title | Text |
|---|---|---|---|
| 1 | bug | Security fixes | A fix that **compiles and still ships a CVE**. |
| 2 | code | Large refactors | A 400-file change where **“looks right” is not evidence**. |
| 3 | refresh | Dependency bumps | An upgrade that **breaks unopened call sites**. |
| 4 | eye | AI patches | The output that is **plausible, not correct**. |

**Background / layout** — dark, 2×2.

**Speaker note** — "These four are where review debt compounds fastest: a security fix that compiles, a refactor too big to read, a dependency bump that breaks a call site nobody opened, and any model-written patch. In all four the code looks correct, which is exactly why a reader is the wrong instrument."

---

## 8 · USER BENEFITS

**On-slide text** — *What the buyer stops paying for.*
Sub: `Three comparisons, measured on the same repository.`

| The status quo | With the gate |
|---|---|
| A second human re-read: minutes per patch | **1.6 seconds**, measured on a real suite. |
| Cloud review tools: your code leaves | **Zero egress**: tests run with no network. |
| Review notes: expire with the thread | **Six receipts** that replay offline. |

**Background / layout** — light, two-column comparison table, rules between rows.

**Speaker note** — "The left column is what you pay today in reviewer hours, in code leaving your network, and in review threads that vanish. The 1.6 seconds is not a benchmark — it is the three-test suite in `demo/workspace`, and the run is committed so you can check it. I would rather show you a small honest number than a large one you cannot audit."

---

## 9 · TECHNOLOGY

**On-slide text** — *Boring on purpose.*
Sub: `Nothing here needs a research breakthrough to work.` (3 columns)

| # | Icon | Title | Text |
|---|---|---|---|
| 1 | stack | Delivery layer | **LangGraph** orchestrates four agents; Docker or Firecracker executes each cycle. |
| 2 | hash | Data and payment | **LiteLLM** routes inference; GNAP signs every cycle into the Git history. |
| 3 | shield-check | IP status | **No patent filed.** The guard and the published audit are the moat. |

**Background / layout** — light, 3-column, mono footer listing the paths.

**Speaker note** — "There is no proprietary model and no patent application — saying otherwise would be a lie you would catch in diligence. What is hard to copy is the guard logic and the audit trail, both of which are public. The model layer is swappable by design, so a customer's procurement decision on vendors never blocks the sale."

---

## 10 · MARKET SIZE

**On-slide text** — *The budget is real. Here is the math.*
Sub: `Two anchors published, four years interpolated at the same rate.`

Chart, 6 points, 2025–2030, USD billions: 1.22 (2025), 1.40, 1.61, 1.85, 2.13, 2.44 (2030). Legend: filled dot = *Published 2025 and 2030*; hollow dot = *Same 14.9% CAGR applied*.

Math block: `2,500` regulated organisations × `500` developers each × `$360` per developer, per year → **$450M we can sell into**. Sub: `That is 37% of the $1.22B category — the regulated half. We quote the smaller number.`

Footnote: `Mordor Intelligence, Secure Code Review Platforms Market: USD 1.22B (2025) to USD 2.44B (2030), 14.88% CAGR · four years interpolated`.

**Background / layout** — dark, split 1.1:0.9, area chart left, math right.

**Speaker note** — "Only two numbers on this chart are published, both by the same house: 1.22 billion in 2025 and 2.44 billion in 2030, which is 14.9 percent a year. The four in between are that rate applied forward, drawn hollow so you can discount them. The bottom-up is my own: 2,500 regulated organisations, 500 developers each, 30 dollars a seat per month — 450 million. That is 37 percent of the published category, so the number I am asking you to believe is the smaller one."

---

## 11 · LOOKING FORWARD

**On-slide text** — *Three outcomes, all arithmetically possible.*
Sub: `Every figure below is accounts × $180k, against the $450M we can sell into.`

| # | Icon | Case | Text | Revenue |
|---|---|---|---|---|
| 1 | trophy | Best case | The default gate. **1,500 accounts**, 60% of the segment. | **$270M ARR** (blue) |
| 2 | target | Realistic | 5% of 2,500 organisations. **120 accounts**. | $21M ARR |
| 3 | lifebuoy | Worst case | A 10-person service in one sector. **15 accounts**. | $2.7M ARR |

**Background / layout** — light, 3-column scenarios, revenue as the largest type on the slide.

**Speaker note** — "Take the worst case seriously: fifteen accounts at 180 thousand is 2.7 million a year — a real business, not a rounding error. The realistic case is 5 percent of the 2,500 organisations, and the best case is becoming the default gate rather than a product teams buy. There is no revenue today; these are outcomes of the pricing, not a forecast."

---

## 12 · GO-TO-MARKET PLAN

**On-slide text** — *Two channels, one loop.*
Sub: `We do not buy developer attention. We give away the proof.`

| # | Icon | Channel | Text |
|---|---|---|---|
| 1 | users | Design partners | Platform and AppSec leads at 200–5,000-developer firms. **Founder-led**, three at a time. |
| 2 | share | Shareable receipts | Every verified cycle produces a signed artifact. **The artifact is the ad.** |

**Background / layout** — dark, two wide columns, 40px icons.

**Speaker note** — "Acquisition is three design partners at a time, run by me, because the objection is always the same and I need to hear it. Growth is the artifact: it names the repo, the suite, the exit code and the hash, and it gets pasted into tickets and post-mortems where other engineers read it. A receipt travels further than a landing page because it is evidence, not marketing."

---

## 13 · TRACTION

**On-slide text** — *Four months, four checkpoints.*
Sub: `Everything below is in the repository, with the commit that produced it.`

Timeline (chronological):
1. `Oct 2026` — **License audit** passes; proprietary tree clean.
2. `Oct 2026` — **Four-tier loop** ships, 30/30 tests green.
3. `31 Oct 2026` — **Six verified runs**, three on a free route.
4. `Nov 2026` — **Pricing set**; demo and proof pack shipped.

Footer: `Raising $750K · 18 months · three paid pilots · PROOF_STATUS.md lists 15 of 36 capabilities as verifiable`

**Background / layout** — light, horizontal timeline, 4 milestones, dots on a single rule.

**Speaker note** — "Four months from a license audit to six committed end-to-end runs, three of them on a free inference route so the cost of a demo is zero. The last item is the honest one: 15 of 36 claimed capabilities are verifiable, the other 21 are not, and that gap is what the 750 thousand buys — 18 months and three paid pilots to close it."

---

## Claim → evidence

| Claim on slide | Source in repo / citation |
|---|---|
| Test suite passes in 1.6 s | `demo/runs/20261031T041126Z` — `3 passed / 0 failed in 1664 ms` |
| Warm cycle ≈ 7 s | same run, cycle wall clock |
| 30/30 orchestrator tests | `services/agent-orchestrator` test run; 14/14 sandbox-manager |
| Test-edit guard | `services/agent-orchestrator/src/graph/nodes/qa.py`, commit `5b7fff3` |
| Sealed sandbox, no egress | `--network none`, read-only source mount in `services/sandbox-manager/src/services/execution.service.ts` |
| Six verified runs | `demo/runs/` — six committed, three on the Groq free route |
| 15 of 36 capabilities | `PROOF_STATUS.md` (0 of 3 benchmarks verified) |
| Market anchors 1.22 → 2.44 | Mordor Intelligence, Secure Code Review Platforms Market (page updated Sep 2026); 14.88% CAGR published |
| $300M serviceable | 2,500 × 500 × $240, bottom-up; = 3% of the $9.8B 2026 category (deck-simple, one-pager) |
| $120k ACV | $20/dev/month × 500 developers (matches `docs/ROADMAP_AND_UNIT_ECONOMICS.md`) |
| Three surfaces | CLI 37 tests, web workbench 94 tests, VS Code extension 4 tests — run them yourself |
| Market $9.8B → $26.0B | Grand View Research, AI Code Tools Market, 27.1% CAGR, updated Jun 2026 |

---

## deck-simple — the 13 slides you actually say out loud

This is the deck that matches the product. `deck-13`, `deck-uber` and `INDEX0_deck` were written when we described only the review loop; they say "a gate, not a generator", which is wrong. Rebuild or retire them.
Rebuild this one with `./build-deck-simple.sh`.

| # | Slide | What you say (one breath) | Point at |
|---|---|---|---|
| 1 | INDEX0 AI — Own your AI engineer. | "We are a self-hosted AI software engineering platform: three surfaces, one rule." | the motto in the footer |
| 2 | AI writes the code now. Nobody checks it. | "Ninety percent use AI, forty-five percent of its code ships a flaw, and eighty-nine percent of a PR's life is waiting for a human." | the three big numbers |
| 3 | One platform. Three surfaces. One rule. | "Terminal, editor, browser — and nothing merges until the tests run." | the fourth tile |
| 4 | Four agents. One verdict. | "Architect plans, developer patches, critic rejects, QA runs the suite. Exit zero or it does not merge." | the terminal block |
| 5 | Six things a copycat cannot fake. | "Each of these came from a bug we shipped and then closed." | self-hosted tile |
| 6 | What you can run today. | "CLI, editor, browser — all in the repo at HEAD, 135 tests." | the three captures |
| 7 | Where it pays for itself. | "Four patches that all looked correct, and none of them were." | AI patches tile |
| 8 | Their assistant suggests. Yours decides. | "They suggest inside their cloud and stop at the diff. We run your suite in yours." | the four comparison rows |
| 9 | Boring on purpose. | "Docker or Firecracker, any model, no patent — the public audit is the moat." | no patent tile |
| 10 | The budget is real. Here is the math. | "Nine point eight to twenty-six billion is the category. My slice is 300 million, at our own 20-dollar seat price." | the $300M |
| 11 | Three endings. All possible. | "Fifteen accounts is 1.8 million a year. There is no revenue today." | worst case |
| 12 | Two ways in. | "Three design partners at a time, and every run leaves a receipt that travels." | the receipt line |
| 13 | Four months. Four proofs. | "Three surfaces, the loop, six runs, a price. Fifteen of thirty-six claims verifiable; the gap is what the round buys." | the last milestone |

Two rules for this deck: never read a bullet aloud, and never say a number without the line under it.

### The three clauses of the motto, and where they live

| Motto clause | What it means | Slide that proves it |
|---|---|---|
| **People Over Tools** | a human asks, reviews, approves; the agents do the typing | 3, 4, 8 |
| **Work Verified** | the verdict is an exit code, not an opinion | 2, 4, 5, 6 |
| **Time to Unplug** | self-hosted, your model key, your cloud or your laptop | 5, 8, 9 |

If someone asks "what do you actually sell", the answer is slide 3, not slide 4. The loop is the guarantee inside the platform.

## Before you present

1. **Confirm `$750K / 18 months / 3 pilots`** — it is the only number in the pack I could not derive from the repo.
2. **Confirm the legal name.** The code and copyright headers say **INDEX0 AI Inc.**; `deck-13` and the older decks still say "INDEX0 Research Labs".
3. Rebuild if the HTML changes: `cd pitch && ./build-deck-simple.sh`.
4. Present from `deck-simple.pdf` full-screen, or the HTML (arrow keys, `f` for fullscreen).

Four decks exist:

| File | Slides | Use |
|---|---|---|
| `deck-simple.pdf` | 13 | **Current and correct. Present this.** Platform positioning, one idea per line, a source under every number. |
| `deck-13.pdf` | 13 | Matches your written slide spec, but still says "a gate, not a generator" and quotes the old $450M. **Do not hand out until rebuilt.** |
| `deck-uber.pdf` | 15 | Same stale positioning. Adds why-now, business model, team, ask. **Do not hand out until rebuilt.** |
| `INDEX0_deck.pdf` | 13 | Dense diligence version, same stale positioning. **Do not hand out until rebuilt.** |

`ONE_PAGER.pdf` is the leave-behind for every meeting.
