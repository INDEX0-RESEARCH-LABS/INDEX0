# Pitch pack — 2-day readiness

Everything here is built from what the repository can prove today.
Nothing in this pack cites a benchmark score, a customer, or a revenue figure.

| File | What it is |
|---|---|
| `deck-simple.pdf` | **Present this one.** The same 13 slides, rewritten in plain language: one idea per line, a verified source under every number, no jargon. 13 pp. Rebuild with `./build-deck-simple.sh`. |
| `deck-13.pdf` | The version that matches your written 13-slide spec exactly. Same order, denser copy. Rebuild with `./build-deck-13.sh`. |
| `SPEAKER_NOTES.md` | Per-slide on-slide text, icon/visual, layout, speaker note, a one-breath script for `deck-simple`, and the claim → evidence table. Read this before rehearsing. |
| `deck-uber.pdf` | 15-slide fundraising deck in the 2008 Uber layout: one idea per slide, alternating dark/light, and the four slides that actually close a round — why now, business model, team, ask. **Use this one if you get 20 minutes instead of 5.** |
| `deck.html` | Dense 13-slide version. Opens offline in any browser. `←/→` to move, `f` for fullscreen. |
| `INDEX0_deck.pdf` | Print/email copy of the dense deck (13 pp). |
| `ONE_PAGER.pdf` | One-page leave-behind. Print and hand over unprompted. |
| `../demo/run-demo.sh` | The live demo. One command, real model, real sandbox, real test run. |
| `../demo/runs/` | Six recorded runs with request, transcript and diff. |
| `../PROOF_STATUS.md` | 15 of 36 capabilities verifiable; 0 of 3 benchmark scores. Hand this over. |
| `../benchmarks/CLAIM_AUDIT.md` | The audit that deleted the unverifiable claims. Hand this over too. |

---

## The 3-minute demo (say it in this order)

**Before you start:** `cd INDEX0`, then `./demo/run-demo.sh`. It prints a preflight,
starts the stack, and takes 60 seconds cold / ~7 seconds warm. Start it *before* you
open your mouth.

> "This is a repository with three tests and one of them fails. A divide by zero
> returns `Infinity`. That's the shape of most AI code review problems — plausible,
> runs fine, wrong."

While it runs:

> "Four tiers. The Architect turns the request into invariants. The Developer edits
> the real files — we give it file contents, not a diff, because models are bad at
> hunk arithmetic. The Critic reviews adversarially. Then QA, which is the only tier
> that can approve anything: it copies the repo into a container with no network,
> writes the candidate files, and runs the repository's own test suite."

When the output lands:

> "QA ran it for real: 3 passed, 0 failed, exit code 0, in 1.3 seconds. The verdict
> is an exit code, not an opinion. Note it says `iterations: 1` — the critic approved
> this patch on the first pass, which is what you want. It does reject: there's a
> committed run in `demo/runs/` where it rejected twice before QA passed."

If someone asks why the run is fast: it is one small file and a free-tier model,
not a benchmark. Say that instead of inventing a number.

Then the honest turn:

> "Two days ago this loop couldn't reach QA at all, and when it did, it was running
> `npm test` in an empty container. We found that because we audited our own claims
> and deleted the ones we couldn't reproduce. 15 of our 36 claimed capabilities are
> verifiable today, and that file is in the repo."

**If the model is slow or the network is down:** say so out loud and open
`demo/runs/20261029T174629Z/`. The committed transcript is the same evidence.

---

## Hostile Q&A — the twelve questions, answered straight

**1. "What's your traction?"**
Zero revenue, zero users, no design partners signed. We have a working verification
loop, 30 orchestrator tests, and a published audit of our own claims. We're raising
to convert one paid pilot.

**2. "Cursor/Copilot will bundle this."**
They will bundle review. They cannot hand a regulated customer an artifact that the
customer can verify without trusting them, inside the customer's own tenant. That's
the product, not the review.

**3. "Qodo and OpenHands already self-host."**
Correct, and `deck.html` says so on slide 10. They ship review; the merge-blocking evidence
artifact is not their product. Our wedge is sub-500-seat regulated buyers those
vendors don't serve at that seat count.

**4. "What's actually yours?"**
The four-tier loop, the sandbox providers, GNAP commit signing, worktree isolation,
and the orchestrator. The terminal launcher derives from OpenCode (MIT) — disclosed
in the repo, and it will come up in diligence.

**5. "Why did you delete your benchmarks?"**
Because we couldn't reproduce them. 96.2% SWE-bench, 92% AiderBench — gone. What
replaced them is `PROOF_STATUS.md`, which lists what works and what doesn't.

**6. "Unit economics?"**
Per-seat licence plus support. Inference runs on the customer's own model contract, so
our COGS should look like software. We have no measured margin and won't quote one.

**7. "Whose budget is this?"**
Platform or AppSec, under AI governance. Not the IDE budget — that's already spent.

**8. "Why now?"**
DORA (Jan 2025), the EU Cloud Sovereignty Framework (Oct 2025), India's DPDP Rules
(Nov 2025). Sovereignty became a scored procurement criterion, and AI-assisted teams
are producing 3–4× the code with 10× the security findings.

**9. "Two people against enterprise procurement?"**
That's the real risk. Founder-led, three design partners, services-heavy deals, and
we stay out of SOC 2 scope by deploying into the customer's tenant.

**10. "What's the next milestone?"**
One paid pilot whose replayable artifact survives a real audit. Not a leaderboard
position.

**11. "Does this run on Azure? You said you dropped it."**
The product never depended on one vendor. The demo you just watched ran on a free
model route through our own gateway; the customer brings their own model contract,
including Azure, Bedrock or a local model. What we dropped was our own Azure bill.

**12. "What stops the model from editing the test that judges it?"**
Nothing in most tools; here it is a dropped write. QA applies candidate files to a
throwaway copy and discards any change that lands on a test path, so the suite that
decides the verdict is always the repository's own. Two tests pin that behaviour
(`services/agent-orchestrator/tests/test_cognitive_nodes.py`). We found the hole
because a Gemini run edited a test file mid-demo — it strengthened the assertion,
but we don't grade our own homework on the model's word.

---

## The five things that can kill this (say them before they do)

1. Verification is a feature, not a company — incumbents bundle it.
2. No forcing function until an auditor demands evidence.
3. Two people cannot pass enterprise procurement before runway ends.
4. Credibility debt: the audit found an OTP bypass, injectable telemetry, and a
   review path that could return approvals offline. All fixed and pinned by tests.
5. Own-keys means no telemetry — no usage data, no expansion signal, no ROI proof.

---

## Recording the fallback video (silent, 60 seconds)

The video is insurance, not the pitch. Record it muted; add narration afterwards or
skip narration entirely — a terminal that types itself plus one caption per tier
reads fine.

1. Terminal at ~120% zoom, dark theme, nothing but the prompt on screen.
2. Start a screen recorder (GNOME: `Ctrl+Alt+Shift+R`, or OBS at 1280×720/30).
3. Run `./demo/run-demo.sh` **cold** (so the container start is visible), then
   `./demo/run-demo.sh` again **warm** (7 seconds, no dead air).
4. Stop after `RESULT: VERIFIED`. Keep it under 90 seconds.
5. Store it as `pitch/demo-fallback.mp4` and put it on the USB stick next to the PDF.

Do not script a fake run. If you miss a take, run it again — it costs nothing now
and it is the one artifact an investor will re-watch to check you weren't bluffing.

## Two-day checklist

| When | Must be true |
|---|---|
| **Now** | `./demo/run-demo.sh` passes on your machine, twice in a row. |
| **Now** | `node -v` ≥ 22, Docker running, `.env` has `LITELLM_MASTER_KEY` + one free model key (`GROQ_API_KEY`). No Azure, no card. |
| **+15m** | Put a second free key (`GEMINI_API_KEY`) in `.env` as the fallback route, and test `DEMO_MODEL=gemini ./demo/run-demo.sh`. One dead provider must not kill the pitch. |
| **+2h** | Record the demo once, screen + voice. Video is the fallback for a dead venue Wi-Fi. |
| **+4h** | Print `PROOF_STATUS.md` and `CLAIM_AUDIT.md`. Hand them over unprompted. |
| **+6h** | Rehearse the 3-minute script out loud, timed. Then the ten answers, out loud. |
| **+8h** | Verify every number on every slide against its source line. Delete anything you can't. |
| **+10h** | Offline fallback: deck PDF on a USB stick, demo video on the laptop, hotspot tested. |
| **Morning of** | Run the demo once in the room, on the actual projector, before anyone arrives. |

Do not add features in these 48 hours. The demo is the product.

---

## What the deck deliberately does not claim

- No benchmark score (the three published ones are unverified).
- No customer, logo, pilot or letter of intent.
- No revenue, ARR, pipeline or margin.
- No latency or cost number that wasn't measured on this machine.
- No TAM for "AI code verification" — no credible figure exists.

If an investor asks for one of these, the answer is "we don't have it yet, here's
how we'd get it". That answer is the pitch.
