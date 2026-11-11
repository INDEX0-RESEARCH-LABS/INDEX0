# Benchmark Reproducibility

## One-command run

```bash
./benchmarks/verified-bench/runner.sh --model groq
```

Requires: Docker, node ≥ 22, Python 3.11+, one free key in `.env`
(`GROQ_API_KEY` from https://console.groq.com/keys — free, no card).

## What it does

1. Starts LiteLLM gateway (Docker container, free model route)
2. Starts sandbox-manager (`SANDBOX_PROVIDER=docker`)
3. Starts agent-orchestrator
4. Runs 20 tasks × 2 modes (baseline + INDEX0 loop) on the same model
5. Writes `results/<run-id>/summary.json` and `RESULTS.md`

## Modes

| Mode | Description |
|---|---|
| `baseline` | One plain LLM call with the broken file — no review loop |
| `index0` | Full 4-tier loop: Architect → Developer → Critic → QA in Docker sandbox |
| `both` (default) | Both, same model, same tasks |

## Options

```bash
# specific model
./runner.sh --model gemini

# subset of tasks
./runner.sh --model groq --tasks 001,002,003

# one mode only
./runner.sh --model groq --mode baseline
./runner.sh --model groq --mode index0
```

## Task structure

Each of the 20 tasks:
- `task.json` — description, file to fix, test command
- `workspace/src/` — broken source file (agent sees this)
- `workspace/test/` — visible tests (not hidden)
- `tests/` — **hidden tests** (agent never sees or edits these)

The hidden tests are the ground truth. A task passes only if the hidden tests pass.

## Honesty policy

Results are reported as-is. If the baseline beats INDEX0 on a task, that is recorded.
No cherry-picking. The `RESULTS.md` file is auto-generated from `summary.json`.

## Tasks

| # | Bug | Language |
|---|---|---|
| 001–005 | Null/zero/bounds/negative/empty errors | JavaScript |
| 006–010 | Off-by-one, operator, comparison, return, division | Python |
| 011–015 | Type coercion: loose eq, string+number, NaN, Boolean, mutation | JavaScript |
| 016–018 | Async: promise not awaited, error swallowed, race condition | JavaScript |
| 019–020 | Edge cases: empty input, large input recursion | Python |
