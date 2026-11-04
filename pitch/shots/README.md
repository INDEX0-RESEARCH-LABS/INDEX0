# Surface shots

Five stills of the three product surfaces, drawn from the components that ship in
this repository. They are **design mockups, not screen captures**: every string
comes from real source, every screen is composed by `shots.tpl.html`, and each
one names its source in the bottom-right of its caption strip.

Open `../shots.html` for the gallery, or the PNGs directly.

| # | File | Surface | Intent | Detail comes from |
|---|------|---------|--------|-------------------|
| 01 | `01-cli.png` | terminal | three review iterations, two rejections, one exit code | `demo/runs/example-3-iterations/{cycle.json,summary.txt}`, `packages/client-harness/src/ui.ts` |
| 02 | `02-editor.png` | VS Code | ghost text, GNAP diff, agent panel, seven commands | `apps/ide/web/src/components/{Editor,AgentPanel}.tsx`, `apps/ide/extension/package.json` |
| 03 | `03-browser.png` | workbench | plan, tool calls, terminal, signed verdict | `apps/ide/web/src/workbench/Workbench.tsx`, `.../components/ExecutionResult.tsx` |
| 04 | `04-surfaces.png` | all three | three surfaces, one receipt | as above, plus `packages/client-harness` receipt fields |
| 05 | `05-loop.png` | diagram | four agents, one exit code, four sandbox facts | `services/agent-orchestrator`, `demo/runs/example-3-iterations` |

`*-bare.png` (1600×940) drops the 60px caption strip for slides.
`01-cli-deck.png` (1200×724) crops the annotation column so the three deck
thumbnails share one aspect ratio.

## Build

```bash
./build-shots.sh          # rewrites shots.html + 12 PNGs, needs Inter below
```

Requires `/tmp/fonts/inter-400.woff2` (Inter v20 latin variable, 48 KB). The
template embeds it base64 because Inter is not installed on this machine; without
it the layout falls back to Liberation Sans and every metric shifts.

`shots.html` here is the build harness (`?n=1..5`, `?bare=1`). The gallery is
`../shots.html`.

```bash
curl -sS -A "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 Chrome/120 Safari/537.36" \
  "https://fonts.gstatic.com/s/inter/v20/UcC73FwrK3iLTeHuS_nVMrMxCp50SjIa1ZL7.woff2" \
  -o /tmp/fonts/inter-400.woff2
```

## Design rules

**Palette.** Six values, no seventh.

| Token | Value | Role |
|-------|-------|------|
| graphite | `#07080b` | page |
| panel | `#0d1015` | one surface per screen |
| hairline | `#232a33` | borders, 1px, never shadows |
| chalk | `#e9ecf1` | primary text |
| dim | `#8b93a0` | labels, metadata |
| blue | `#8fb0ff` | human decision |
| green | `#4cd18e` | machine proof |
| amber | `#e0a958` | waiting, rejected |

**Semantic colour.** Blue is only ever a human action or a human judgement:
the command typed, `VERIFIED`, `approve`, the merge button. Green is only ever
machine evidence: `3 passed / 0 failed`, `exit 0`, `signed`. Amber is only ever
something withheld or refused: `request_changes`. Never decorate with the
accent colours; if a value is not one of those three meanings it is chalk or dim.

**Type.** Inter for prose, titles and numerals; DejaVu Sans Mono for anything a
machine emitted — commands, file paths, ids, hashes, test counts, source refs.
Captions are 11px uppercase with `0.16em` tracking. No weights above 500 except
titles. No italics for emphasis; the italic slot belongs to quoted repo text.

**Grid.** 1600×1000 canvas, 72px margin, 56px caption strip at the bottom with
the shot id on the left and `surface · source path` on the right. One screen per
shot, one idea per annotation column. Annotations sit in a 300px right margin and
are numbered, never attached with arrows to a moving target.

**Forbidden.** Gradients other than the flat two-stop panel fade, glows, purple,
drop shadows, emoji, stock photography, invented keybindings, invented file
names, any number that is not in `demo/runs/` or a test file.

## Honesty

- No string in these images exists only here. `index0 run "…"` is a real command;
  `request_changes`, `qa_verified`, `live_micromv`, `--network none`, the seven
  `INDEX0:` command titles and the workbench topbar text are all in source.
- No screenshot of a running browser or terminal was taken: these are drawn.
  The deck says so on slide 6 and in `SPEAKER_NOTES.md`.
- The extension has no contributions for keybindings, so no shortcut is printed.
