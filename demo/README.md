# Demo

One broken repository, one full review cycle, real test evidence.

```
./demo/run-demo.sh
```

Takes ~40s including container start. Requires Docker, Node ≥ 22, a reachable
LiteLLM proxy, and the Python env described in `pitch/README.md`.

## What it does

1. Starts postgres + LiteLLM, builds and starts the sandbox-manager
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

- `runs/20261029T174629Z` — the run shown on the deck's demo slide (2 iterations,
  one critic rejection, 4 tests passed in 1259 ms).
- `runs/example-3-iterations` — a slower run where the critic rejected twice.
  Useful when someone asks whether the loop really iterates.

## Checks

- `python demo/check_qa_command.py` — posts a good patch and a bad patch straight
  to the sandbox-manager and asserts the gate fails closed on the bad one.
  Run it with `PYTHONPATH=services/agent-orchestrator`.
