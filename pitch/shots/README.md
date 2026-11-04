# Surface shots

Five stills of the three product surfaces, all drawn from one real run: the
divide-by-zero fixture in `demo/workspace`, where `divide(1, 0)` returns
`Infinity` until the guard is added.

They are **design mockups, not screen captures**. Every string comes from source,
every frame is composed by `shots.tpl.html`, and each one names its provenance in
the bottom strip.

Gallery: `../shots.html`. Build source: `shots.tpl.html` + `build-shots.sh`.

| # | File | Frame | The line it makes | Detail comes from |
|---|------|-------|-------------------|-------------------|
| 01 | `01-ask.png` | the ask | a bug report that is already an assertion | `demo/workspace/test/math.test.js`, `packages/client-harness/src/cli.ts` |
| 02 | `02-terminal.png` | the run | three patches, two rejections, then the suite ran | `demo/runs/example-3-iterations/{cycle.json,summary.txt}` |
| 03 | `03-editor.png` | the editor | both versions on screen, a person approves | `apps/ide/web/src/components/Editor.tsx` |
| 04 | `04-browser.png` | the browser | plan in English, tests in a sealed box | `apps/ide/web/src/workbench/Workbench.tsx`, `.../AgentPanel.tsx` |
| 05 | `05-receipt.png` | the receipt | what survives is evidence, not a chat log | `demo/runs/example-3-iterations/cycle.json` |

Canvas is 1600 × 1000 for all five, so they composite as one row.

## Build

```bash
./build-shots.sh     # shots.html + the five PNGs
```

Needs `/tmp/fonts/IBMPlexSans-400.woff2` and `/tmp/fonts/IBMPlexMono-400.woff2`
(latin subsets). The template base64-embeds both because Plex is not installed
system-wide; without them the metrics shift and the code blocks overflow.

```bash
mkdir -p /tmp/fonts && cd /tmp/fonts
UA="Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 Chrome/120 Safari/537.36"
curl -sS -A "$UA" "https://fonts.googleapis.com/css2?family=IBM+Plex+Sans:wght@400&display=swap" -o s.css
curl -sS -A "$UA" "https://fonts.googleapis.com/css2?family=IBM+Plex+Mono:wght@400&display=swap" -o m.css
# take the latin `src: url(...)` from each file
```

`shots.html` is the build harness (`?n=1..5`); the gallery lives one level up.

## Design rules

**The system is a work order, not a dashboard.** Paper stock, a sheet laid on it,
typewriter labels, one rubber stamp. No dark chrome, no neon, no glass.

| Token | Value | Role |
|-------|-------|------|
| paper | `#ECECE5` | page |
| sheet | `#F8F8F3` | the one surface per frame |
| ink | `#141619` | primary text, approval, the stamp border on the receipt |
| ink-2 | `#4C5256` | secondary text, code comments |
| ink-3 | `#83898B` | labels, metadata, the unselected version |
| rule | `#CBCDC3` | 1px borders, dotted receipt leaders |
| oxide | `#9E3527` | **something is still wrong** |

**The accent has one meaning.** Oxide is the bug, the failing assertion,
`request changes`, `fails today`, the VERIFIED stamp. It is never decoration and
never a second brand colour. Approval is ink — a dark button, a dark stamp border
— because "passed" is not a colour, it is an exit code.

**Type.** IBM Plex Sans for prose and headings; IBM Plex Mono for anything a
machine emitted — commands, paths, code, counts, ids, the caption strip. Headline
47px at 1.12, code 17.5–18px at 1.75. One weight per role; no tracked all-caps
labels and no middot-joined meta strings (commas instead).

**Grid.** 1600 × 1000, 74/96px margins, headline top-left, one sheet centred
below, caption strip at the bottom: provenance left, the frame's point right.

**Forbidden.** Gradients, glows, shadows, purple, emoji, stock photography,
invented buttons or keybindings, any number that is not in `demo/runs/` or a test.

## Honesty

- Removed earlier drafts that invented UI: `Merge`, `Review diff`, `Request
  changes` as a button, "The suite passed. Merge is your call." None exist in
  source. `Approve`, `Original Version`, `Agent Proposed Changes`, `Diff View`,
  `Execution Plan (1/3)`, `Active Tool Invocations`, `Gateway Connected (8000)`,
  `MCP Tools`, `Telemetry`, `INDEX0 Agent & Sandbox Terminal` all do.
- The verdict reads `QA verified.` — the receipt state `qa_verified` is real;
  the sentence form is a design decision, flagged here so nobody quotes it as a
  shipped string.
- Numbers on the frames: 3 iterations, 26/47/24 diff lines, 2/3/0 findings,
  3 passed / 0 failed, 1192 ms, exit 0 — all from `demo/runs/example-3-iterations`.
- If a frame and this file disagree, the frame is wrong. Rebuild, do not edit the
  PNG.
