# Surface shots

Six stills that build one app and follow one defect: **Banchan**, a food-delivery
checkout in `demo/workspace-delivery`. A $5 promo drops a $26.65 cart to $21.65,
and the app still grants free delivery. The suite catches it; the critic does not.

They are **design mockups, not screen captures**. Every price, id and timing comes
from the fixture or from `demo/runs/20261104T090956Z`, every frame is composed by
`shots.tpl.html`, and each one names its provenance in the bottom strip.

Gallery: `../shots.html`. Build source: `shots.tpl.html` + `build-shots.sh`.

| # | File | Frame | The line it makes | Detail comes from |
|---|------|-------|-------------------|-------------------|
| 01 | `01-app.png` | the app | three screens of one app; the total is what is under review | `demo/workspace-delivery/src/checkout.js` |
| 02 | `02-bug.png` | the bug | the fee reads the cart before the promo | `demo/workspace-delivery/test/checkout.test.js` |
| 03 | `03-run.png` | the run | the critic approved it; the suite refused it | `demo/runs/20261104T090956Z/{cycle.json,candidate.patch}` |
| 04 | `04-patch.png` | the patch | two lines the approval missed | `apps/ide/web/src/components/Editor.tsx` |
| 05 | `05-browser.png` | the workbench | plan in English, failure in the open | `apps/ide/web/src/workbench/Workbench.tsx`, `.../AgentPanel.tsx` |
| 06 | `06-receipt.png` | the receipt | what survives is the failure, not a summary of it | `demo/runs/20261104T090956Z/cycle.json` |

Canvas is 1600 × 1000 for all six, so they composite as one row.

## Build

```bash
./build-shots.sh     # shots.html + the six PNGs
```

Needs four latin-subset woff2 files in `/tmp/fonts`: `IBMPlexSans-400`,
`IBMPlexMono-400`, `Manrope-400`, `Fraunces-500`. The template base64-embeds them
because none are installed system-wide; without them the metrics shift and the
phone layouts overflow.

```bash
mkdir -p /tmp/fonts && cd /tmp/fonts
UA="Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 Chrome/120 Safari/537.36"
curl -sS -A "$UA" "https://fonts.googleapis.com/css2?family=Manrope:wght@400&display=swap" -o m.css
# take the latin `src: url(...)` from each css file
```

Manrope and Fraunces are served as variable files, so one weight covers the range.
`shots.html` is the build harness (`?n=1..6`); the gallery lives one level up.

## Two palettes, on purpose

The frame is the product's voice; the phones are the customer's app.

| Frame token | Value | Role |
|-------------|-------|------|
| paper | `#ECECE5` | page |
| sheet | `#F8F8F3` | the one surface per frame |
| ink | `#141619` | primary text, approval, the stamp border on the receipt |
| ink-2 | `#4C5256` | secondary text, code comments |
| ink-3 | `#83898B` | labels, metadata, the unselected version |
| rule | `#CBCDC3` | 1px borders, dotted receipt leaders |
| oxide | `#9E3527` | **something is still wrong** |

| App token | Value | Role |
|-----------|-------|------|
| linen | `#FDFBF6` | phone background |
| cream | `#F4EEE3` | hero, thumbnails, secondary fills |
| a-ink | `#17161A` | app text, filled controls |
| chili | `#D33F1D` | the app's own action colour — pay, route, progress |
| leaf | `#2E6B4F` | "free", positive |
| sesame | `#F2B233` | rating star, garnish |

**Oxide never appears inside a phone.** It belongs to the frame and means one
thing: the defect, `NOT VERIFIED`, `Merge blocked`, `fails today`. Approval is ink,
because "passed" is not a colour, it is an exit code.

**Type.** IBM Plex Sans for frame prose; IBM Plex Mono for anything a machine
emitted — commands, paths, code, ids, counts, the caption strip. Inside the app:
Manrope for UI, Fraunces for the merchant name, dish headline and ETA.

**Grid.** 1600 × 1000, 64/96px margins, headline top-left, one composition below,
caption strip at the bottom: provenance left, the frame's point right.

**Namespacing.** App CSS lives under `.phone` (`.phone .bar`, `.phone .step`,
`.phone .add`). Without it the status bar and the editor chrome fight over `.bar`
and `.step`, and the phone renders with an 18px status bar.

**Forbidden.** Gradients, glows, stock photography, emoji, invented buttons or
keybindings, any number that is not in the fixture, the run directory, or a test.

## Honesty

- The recorded failure is `25.549999999999997 !== 25.55`, quoted verbatim in 03
  and 05. The `0 !== 3.9` in 02 is the *unpatched* fixture failing on the first
  assertion — that is the state before the agent runs, not the run's output.
- 03's QA row and proof pane carry the same numbers as `cycle.json`: 3 passed /
  1 failed, 2530 ms, exit 1, `live_microvm`, critic `approve`, cycle
  `cycle-b4d72d36cc67`.
- 04's 4 passed / 0 failed / 196 ms is the fixed copy at
  `demo/workspace-delivery-fixed`, measured locally — not a number from the run.
- The sandbox lines in 05 and 06 (`--network none`, `-v /src:ro`,
  `--pids-limit=64`) are the arguments built in
  `services/sandbox-manager/src/sandbox/docker-provider.ts`.
- Removed earlier drafts that invented UI: `Merge`, `Review diff`, `Request
  changes` as a button. `Approve`, `Original Version`, `Agent Proposed Changes`,
  `Diff View`, `Execution Plan (n/m)`, `Active Tool Invocations`,
  `Gateway Connected (8000)`, `MCP Tools`, `Telemetry`,
  `INDEX0 Agent & Sandbox Terminal` do exist in the IDE source.
- The second line of the receipt verdict — `Merge blocked.` — is the design's
  sentence, not a string the engine prints. Flagged so nobody quotes it as one.
- If a frame and this file disagree, the frame is wrong. Rebuild, do not edit the
  PNG.
