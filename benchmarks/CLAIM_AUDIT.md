# INDEX0 Benchmark Claim Audit

**Audit Date:** 2026-09-27  
**Repository Commit:** `361dad10bd09543beff92582dba4a3db1cf2f345`  
**Scope:** All benchmark claims in repository documentation, CLI output, and artifacts

---

## Claim Disposition Summary

| Claim Group | Source | Audit Disposition | Evidence Status |
|-------------|--------|-------------------|-----------------|
| SWE-bench Verified `96.2–97.0%` | `benchmarks/README.md`, `EMPIRICAL_BENCHMARK_RESULTS.json`, `REAL_MARKET_BENCHMARK_REPORT.md`, `docs/COMPETITOR_BENCHMARKS.md`, `docs/COMPLETE_PROJECT_LITERALLY_OVERVIEW.md` | **UNVERIFIED** | Client-harness smoke checks run 4 hardcoded Python scripts, not SWE-bench instances. No INDEX0 agent invoked. No official evaluator output. |
| SWE-bench Pro `82.5%` | `benchmarks/README.md`, `docs/COMPETITOR_BENCHMARKS.md` | **UNVERIFIED** | No Pro inference/evaluation run identified. No raw artifact. |
| Terminal-Bench `58.5%` | `benchmarks/README.md`, `docs/COMPETITOR_BENCHMARKS.md` | **UNVERIFIED** | No Terminal-Bench execution output located in repository. |
| AiderBench `84.2–100%` / `92%` | `benchmarks/README.md`, `EMPIRICAL_BENCHMARK_RESULTS.json`, `REAL_MARKET_BENCHMARK_REPORT.md`, `docs/COMPETITOR_BENCHMARKS.md` | **UNVERIFIED; Label INCORRECT** | Embedded hand-authored implementations with tests in same file. Not agent task attempts. |
| Viking/Context Reduction `34.3–91.0%` | `benchmarks/README.md`, `EMPIRICAL_BENCHMARK_RESULTS.json`, `docs/COMPETITOR_BENCHMARKS.md` | **PARTIALLY VERIFIED (transform ratio only); End-to-end UNVERIFIED** | Character-ratio heuristic on local string transforms. Estimated tokens (`length/3.75`). Stipulated weighting (60/30/10) and pricing. No paired retrieval relevance, task success, or cost measurement. |
| CLI Cold-Start `42.05ms` | `benchmarks/README.md`, `EMPIRICAL_BENCHMARK_RESULTS.json` | **INCORRECTLY MEASURED / UNVERIFIED** | Times `TerminalTokenFilter.filter()` in-process. Formula: `latencies[0] * 8.5 + 42.0`. Not a process startup measurement. |
| Process Memory/RSS Comparisons | `benchmarks/README.md`, `EMPIRICAL_BENCHMARK_RESULTS.json` | **UNVERIFIED / NOT COMPARABLE** | Single Node process RSS vs. product-level figures (Electron apps). No same-workload protocol. |
| GNAP Throughput `>2,100 steps/sec` | `benchmarks/README.md`, `EMPIRICAL_BENCHMARK_RESULTS.json` | **PARTIALLY VERIFIED (local microbenchmark only)** | 100 sequential signed steps in temp dir. No task-level coordination benefit or competitor baseline. |
| Contract Validation `454k ops/sec` | `benchmarks/README.md`, `EMPIRICAL_BENCHMARK_RESULTS.json` | **PARTIALLY VERIFIED (local serialization loop only)** | JSON stringify/parse + field checks. Does not invoke authoritative runtime schema validator. |
| Repository Surgery `8.2x` / `80%` | `benchmarks/EMPIRICAL_BENCHMARK_RESULTS.json`, `REAL_MARKET_BENCHMARK_REPORT.md` | **UNVERIFIED** | No baseline, measured run, patch, tests, or raw artifact. Fallback defaults used. |
| Human Interventions `0.2/task` | `benchmarks/README.md`, `EMPIRICAL_BENCHMARK_RESULTS.json`, `docs/COMPETITOR_BENCHMARKS.md` | **UNVERIFIED** | No recorded task/human-intervention event data in any benchmark run. |
| Cursor/Claude/Copilot/OpenHands Comparisons | All benchmark docs | **UNVERIFIED / NOT COMPARABLE** | Hard-coded literal strings in `getCompetitorMatrix()`. No common configuration, run data, or provenance labels. |

---

## Benchmark Integrity Firewall Rule

> **No benchmark result may appear on website, README, investor material, marketing material, CLI, or documentation unless it has a corresponding:**
> - Dataset version and commit
> - Configuration manifest (frozen before execution)
> - Raw run artifacts (transcripts, tool calls, stdout/stderr, patches)
> - Evaluation artifacts (official evaluator output or independent verification)
> - Timestamp and repository commit
> - Reproduction command

### Currently Blocked from Publication

All claims listed above as **UNVERIFIED**, **INCORRECTLY MEASURED**, or **NOT COMPARABLE** are **blocked from publication** until the required artifacts exist.

### Permitted for Publication (with qualification)

| Metric | Qualification Required |
|--------|------------------------|
| Viking L0/L1 character reduction ratios | "Local transform character-ratio estimate only. Not validated as agent token savings or task outcome." |
| GNAP local disk write throughput | "Synthetic microbenchmark: 100 sequential steps in temp repository. No task coordination measured." |
| Contract validation serialization throughput | "Local JSON serialize/parse loop. Not authoritative schema validation." |
| Terminal filter character reduction | "ANSI/spinner stripping on synthetic input. Not measured on agent tool output." |

---

## Required Artifacts Per Claim (Checklist)

For each claim to be published, the following must exist in `benchmarks/runs/<run-id>/`:

- [ ] `metadata.json` — run configuration, model, provider, versions, timestamps
- [ ] `task.json` — task definition, dataset version, commit, success criteria
- [ ] `environment.json` — environment snapshot (OS, runtime, network policy, sandbox config)
- [ ] `agent_config.json` — agent configuration, prompt, tool access, budgets
- [ ] `transcript.jsonl` — complete event stream (prompts, tool calls, observations)
- [ ] `tool_calls.jsonl` — structured tool invocation log
- [ ] `stdout.log` / `stderr.log` — process output
- [ ] `patch.diff` — candidate patch produced by agent
- [ ] `tests.log` — test execution output (official harness)
- [ ] `evaluation.json` — official evaluator result or independent verification
- [ ] `resource_usage.json` — tokens, cost, wall-clock, compute
- [ ] `final_state.json` — final repository state, worktree status
- [ ] `checksums.sha256` — SHA256 of all artifacts

---

## Documentation Files Requiring Update

The following files contain claims that violate the integrity firewall and must be updated:

1. `benchmarks/README.md` — Remove unverified comparison matrix; add qualification notices
2. `benchmarks/EMPIRICAL_BENCHMARK_RESULTS.json` — Mark as historical artifact, not current evidence
3. `benchmarks/REAL_MARKET_BENCHMARK_REPORT.md` — Mark as unverified audit report
3. `docs/COMPETITOR_BENCHMARKS.md` — Remove unverified comparison table
4. `docs/COMPLETE_PROJECT_LITERALLY_OVERVIEW.md` — Remove unverified benchmark claims (Section 9)
5. `README.md` — Remove unverified benchmark claims
6. `packages/client-harness/src/benchmark.ts` — Remove hard-coded competitor matrix; mark smoke checks as smoke checks
7. `packages/client-harness/test/benchmark.test.ts` — Remove assertions on claim values

---

## Status: FIREWALL ACTIVE

All unverified claims are quarantined. No new claims may be added without complete artifact chain.