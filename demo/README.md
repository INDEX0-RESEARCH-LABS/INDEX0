# Demo

One broken repository, one full review cycle, real test evidence.

```
./demo/run-demo.sh                  # picks the first usable route automatically
DEMO_MODEL=gemini ./demo/run-demo.sh
```

Takes ~60s including container start. Requires Docker, Node ≥ 22, one **free**
model key in `.env`, and the Python env described in `pitch/README.md`.
No Azure subscription and no paid API is needed.

| `DEMO_MODEL` | key in `.env` | where to get it |
|---|---|---|
| `auto` (default) | whichever is set | first key found: groq → gemini → openrouter |
| `groq` | `GROQ_API_KEY` | <https://console.groq.com/keys> — free, no card |
| `gemini` | `GEMINI_API_KEY` | <https://aistudio.google.com/apikey> — free, no card |
| `openrouter` | `OPENROUTER_API_KEY` | <https://openrouter.ai/keys> — free models |

Every agent is pinned to the chosen route (`ORCHESTRATOR_*_MODEL`), and the
runner sends one throwaway completion through the gateway before the cycle so a
dead key fails in two seconds with a readable message instead of mid-run.

## What it does

1. Starts a LiteLLM gateway on port 4002 from `infra/litellm/config.yaml`
   (no database needed), builds and starts the sandbox-manager
   (`provider=docker`, image `node:22`), starts the agent-orchestrator.
2. Posts a cycle to `POST /cycles/start` against `demo/workspace`, passing that
   path as the repository to verify.
3. Architect → Developer → Critic (may reject and loop) → QA.
4. QA copies the repository into a container with `--network none`, writes the
   candidate files over the copy, runs `npm test`, and reports the exit code and
   the counts the runner actually printed.
5. Writes `demo/runs/<timestamp>/` with `request.json`, `cycle.json`,
   `candidate.patch` and `summary.txt`.

## The fixture

`demo/workspace` is deliberately buggy: `src/math.js` divides without a zero
guard and `test/math.test.js` asserts a `RangeError`. The suite fails until the
developer fixes it, which is the point — the demo only passes when the code does.

## Recorded runs

- `runs/20261031T002004Z` — the run shown on the deck's demo slide: free Groq
  route, one iteration, 3 tests passed in 1332 ms, exit 0.
- `runs/20261031T001930Z` — the same cycle minutes earlier, 3 passed in 1664 ms.
- `runs/20261029T174629Z` — an earlier run where the critic rejected the first
  patch and the developer revised (2 iterations, 4 passed in 1259 ms).
- `runs/example-3-iterations` — the critic rejected twice. Useful when someone
  asks whether the loop really iterates.

The 2026-10-29 runs used `azure-gpt-4o`. The runner now defaults to a free route,
so no recorded run costs money to reproduce.

## Checks

- `python demo/check_qa_command.py` — posts a good patch and a bad patch straight
  to the sandbox-manager and asserts the gate fails closed on the bad one.
  Run it with `PYTHONPATH=services/agent-orchestrator`.
