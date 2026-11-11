# Demo Video Recording Script

**Length:** 2 minutes. No cuts. Record from a terminal with a large font.

## Setup (do before hitting record)

```bash
cd INDEX0
export AWS_PROFILE=index0
export DEMO_MODEL=claude

# Verify AWS session is active
aws --profile index0 sts get-caller-identity | grep Account

# Make sure the demo workspace is in the broken state
cat demo/workspace/src/math.js   # should show: return numerator / denominator;

# Font: 18pt+, dark terminal, 1280×800 or wider
```

## Script (say out loud while it runs)

**[0:00 — start recording, run the command]**
```bash
./demo/run-demo.sh
```

**[0:05 — while LiteLLM starts]**
> "This is a repository with a broken divide function — it returns Infinity when
> the denominator is zero instead of throwing. That's the shape of most AI code
> review problems: plausible output, wrong behaviour."

**[0:15 — while sandbox and orchestrator start]**
> "Four agents. The Architect reads the task and plans invariants. The Developer
> edits real files — full contents, not a diff. The Critic reviews adversarially.
> QA is the only one that can approve: it copies the repo into a Docker container
> with no network, writes the candidate, and runs the repository's own tests."

**[0:40 — cycle running]**
> "It's making three to eight model calls right now. Claude Sonnet 4.6 via AWS
> Bedrock. No paid external API beyond our own account."

**[1:00 — results print]**

Point at each line as it appears:

> "`model: claude` — Claude Sonnet 4.6, inference profile, ap-southeast-2."
>
> "`status: qa_verified` — the QA tier ran and approved. That's the only way
> this word appears."
>
> "`sandbox: docker (exit 0)` — real provider, real exit code. Not hardcoded."
>
> "`tests: 3 passed / 0 failed` — the repository's own test suite. We can't
> edit those tests; they're locked."

**[1:30 — show the artifact]**
```bash
cat demo/runs/$(ls -t demo/runs/ | head -1)/summary.txt
cat demo/runs/$(ls -t demo/runs/ | head -1)/candidate.patch
```
> "The patch and the transcript are committed. Anyone can replay this offline."

**[1:50 — close]**
> "One command. Real model. Real sandbox. Real test run. That's INDEX0."

```bash
# End recording here
```

## After recording

```bash
# Commit the recording if saved to repo
git add demo/demo-video-script.md
git commit -m "docs(demo): add video recording script"
```

Upload to: `demo/recordings/` (gitignored for size) or link from README.
