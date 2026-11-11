# INDEX0 Benchmark Results

**Run:** 20261111T121141Z  
**Model:** `groq` (llama-3.1-70b via Groq free tier)  
**Tasks:** 19 (task 020 timed out — orchestrator 120s limit hit on large-input recursion)  
**Date:** 2026-11-11  

## Summary

| Mode | Passed | Failed | Pass rate |
|---|---|---|---|
| Baseline (plain LLM one-shot) | 17 | 2 | 89% |
| INDEX0 (4-tier review loop)   | 14 | 5 | 74% |

> **Reported honestly. INDEX0 did not outperform the baseline on this run.**
> The review loop adds latency and in some cases over-engineers simple fixes.
> On task 012 (string coercion) INDEX0 passed where the baseline failed — the
> loop's critic caught the missing `Number()` cast. On tasks 015–017 the
> orchestrator returned no diff (timeout or critic loop exhausted iterations),
> scoring as failures. This is the data; it will improve with Phase 4 wiring.

## Per-task results

| Task | Bug type | Baseline | INDEX0 |
|---|---|---|---|
| `001-divide-zero` | JS: divide by zero guard | ✅ | ✅ |
| `002-null-check` | JS: null dereference | ✅ | ✅ |
| `003-array-bounds` | JS: empty array | ✅ | ✅ |
| `004-negative-sqrt` | JS: negative input | ✅ | ✅ |
| `005-empty-string` | JS: empty string | ✅ | ✅ |
| `006-off-by-one` | Python: range(n) vs range(n+1) | ✅ | ✅ |
| `007-wrong-operator` | Python: % 1 vs % 2 | ✅ | ✅ |
| `008-wrong-comparison` | Python: > vs < | ✅ | ✅ |
| `009-missing-return` | Python: missing return | ✅ | ✅ |
| `010-integer-division` | Python: // vs / | ✅ | ✅ |
| `011-loose-equality` | JS: == null vs === null | ✅ | ✅ |
| `012-string-coercion` | JS: "1"+"2"="12" not 3 | ❌ | ✅ |
| `013-nan-propagation` | JS: NaN → 0 | ✅ | ✅ |
| `014-boolean-coercion` | JS: new Boolean() trap | ✅ | ✅ |
| `015-object-mutation` | JS: mutate vs spread | ✅ | ❌ |
| `016-promise-not-awaited` | JS: missing async/await | ✅ | ❌ |
| `017-callback-error` | JS: swallowed error → null | ✅ | ❌ |
| `018-race-condition` | JS: stale async read | ❌ | ❌ |
| `019-empty-input` | Python: ZeroDivisionError | ✅ | ❌ |

*(Task 020 excluded: orchestrator timeout on large-input recursion task)*

## What the numbers mean

- **Baseline 89%** — Groq one-shot is strong on straightforward bugs with clear descriptions
- **INDEX0 74%** — The review loop adds value on ambiguous fixes (012) but times out on 5 tasks
- **Neither solved 018** (race condition) — requires architectural reasoning, not a line fix
- **INDEX0 failures on 015–017, 019** — orchestrator returned no diff; likely critic loop exhaustion. Root cause: 3-iteration limit too tight for tasks where the first attempt is semantically wrong

## Known limitations of this run

1. INDEX0 max iterations set to 3 — some tasks need more critic rounds
2. Task 020 excluded (120s sandbox timeout hit on 2000-element recursion)
3. Groq free tier has rate limits — longer tasks occasionally return empty responses

## Reproduce

```bash
./benchmarks/verified-bench/runner.sh --model groq
```

Requires: Docker, node ≥ 22, Python 3.11+, `GROQ_API_KEY` in `.env` (free, no card: https://console.groq.com/keys)

Results stored in `benchmarks/verified-bench/results/20261111T121141Z/`
