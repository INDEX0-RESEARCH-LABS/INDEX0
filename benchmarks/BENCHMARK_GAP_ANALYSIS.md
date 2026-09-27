# Benchmark Gap Analysis

**Assessment date:** 2026-09-27  
**Repository commit inspected:** `361dad10bd09543beff92582dba4a3db1cf2f345`  
**Scope:** `benchmarks/`, `packages/client-harness/`, `agent-canvas/evaluation/`, `.github/workflows/`, root package/workspace/Turbo configuration, README and benchmark claim documentation.  
**Phase:** Audit only. No benchmark implementation or published claim has been rewritten in this phase.

## Executive finding

The repository contains a substantial upstream OpenHands evaluation tree, including SWE-bench and AiderBench task runners and official evaluation pathways. That is useful infrastructure, but it is not evidence that INDEX0 itself produced the benchmark results claimed in current INDEX0 docs.

The INDEX0 client harness's so-called live SWE-bench/Aider run does not invoke an INDEX0 coding agent on the benchmark tasks and does not apply a candidate patch to the benchmark repositories. It instead executes small source snippets embedded in `packages/client-harness/src/benchmark.ts`. Nevertheless, those checks are labelled `VERIFIED_GOLD_STANDARD`, and the same suite prints a fixed competitor matrix and writes an artifact described as empirical/authoritative. Current public-facing repository docs consequently make claims substantially stronger than the inspected evidence supports.

**No head-to-head result against Cursor or another coding agent is currently proven by the inspected INDEX0 benchmark implementation.** The historical result JSON is a generated-looking artifact but does not contain raw run data sufficient to reproduce or independently verify its contents.

## Severity definitions

- **CRITICAL** — invalidates a primary outcome claim or permits benchmark certification without measuring the claimed behavior.
- **HIGH** — prevents fair comparison, trustworthy attribution, or independent reproduction of a major claim.
- **MEDIUM** — weakens precision, reproducibility, or interpretation, but does not by itself invalidate all task correctness evidence.
- **LOW** — documentation or process issue with limited direct effect on outcome validity.

## Findings

### G-01 — Task success is not measured by the INDEX0 “SWE-bench” smoke checks

**Severity: CRITICAL**

- **Evidence:** `packages/client-harness/src/benchmark.ts:533-633` hard-codes four task-labelled Python scripts and invokes them with `python3`. The scripts implement miniature stand-alone logic or assert membership in a locally declared list. They do not load the named Django, SymPy, Flask, or Sphinx repository versions; do not load the SWE-bench task data; do not invoke the INDEX0 agent; do not produce a patch; and do not run the task's official test environment.
- **Impact:** These checks cannot establish that INDEX0 resolves any SWE-bench instance. The `passRatePct` is a rate over the inline scripts, not an SWE-bench score.
- **Additional evidence:** `benchmarks/EMPIRICAL_BENCHMARK_RESULTS.json:54-85` calls four such cases `VERIFIED_GOLD_STANDARD` and reports 4/4. This label is unsupported by the implementation.
- **Status of historical claim:** SWE-bench Verified `96.2–97.0%` and the implied 4/4 smoke result are **UNVERIFIED** as INDEX0 outcomes; the smoke-check result is **INCORRECTLY ATTRIBUTED** to the official benchmark.

### G-02 — AiderBench smoke cases are authored solutions, not agent task attempts

**Severity: CRITICAL**

- **Evidence:** `packages/client-harness/src/benchmark.ts:471-531` writes five source implementations and their tests together into generated files, then runs `pytest`. For example, implementation and assertions coexist in the same `test_*.py` file. The Hamming sample's purported differing-strands assertion compares identical strings (`benchmark.ts:495`). No model/agent receives an AiderBench instruction, and no patch is produced.
- **Impact:** Passing these examples measures that selected hand-written examples execute, not agent code-editing accuracy or AiderBench performance.
- **Status of historical claim:** INDEX0 AiderBench `84.2–100%` and `92%` claims are **UNVERIFIED**; describing these local scripts as AiderBench evaluation is **INCORRECT**.

### G-03 — Competitor results are hard-coded and reported as verified comparisons

**Severity: CRITICAL**

- **Evidence:** `packages/client-harness/src/benchmark.ts:683-742` returns literal strings for Cursor, Claude Code, Devin/OpenHands, and INDEX0; `getCompetitorMatrix()` is consumed by the runner and rendered with `[AUDITED VERDICT: INDUSTRY LEAD]` (`benchmark.ts:820-882`). The same values are copied into `benchmarks/EMPIRICAL_BENCHMARK_RESULTS.json`, `benchmarks/README.md`, `benchmarks/REAL_MARKET_BENCHMARK_REPORT.md`, `README.md`, and `docs/COMPETITOR_BENCHMARKS.md`.
- **Impact:** No competitor is executed by this comparison. No source citation, configuration, version, date, run artifact, or task-level matching evidence is associated with most table values. Ranges also conflate different systems/configurations. The comparisons violate the stated same-conditions requirement.
- **Status of historical claims:** The INDEX0 numbers are **UNVERIFIED**; competitor comparisons and asserted deltas are **UNVERIFIED / NOT COMPARABLE**. Calling them “audited,” “independent,” or an “industry lead” is unsupported.

### G-04 — Existing benchmark tests assert predetermined outcomes rather than validate correctness

**Severity: CRITICAL**

- **Evidence:** `packages/client-harness/test/benchmark.test.ts:56-76` requires the smoke suite to report `VERIFIED_GOLD_STANDARD`, success of at least 80%, and a competitor-matrix string containing `96.2%`. This tests that code preserves a chosen claim, not that the claim is true. The file has pre-existing uncommitted changes in this workspace; these lines were inspected but are not modified by this audit.
- **Impact:** CI can gate on hard-coded success language and pass without any task-level agent execution. It entrenches rather than independently evaluates claims.
- **Required change in implementation phase:** Replace claim assertions with unit tests for runner/evaluator mechanics, and keep benchmark outcomes in immutable run artifacts verified by an external or separately implemented evaluator.

### G-05 — CLI cold-start figure is fabricated by arithmetic, not timed startup

**Severity: CRITICAL**

- **Evidence:** `packages/client-harness/src/benchmark.ts:199-219` times 15 calls to `TerminalTokenFilter.filter()` within the already-running Node process. It calculates `coldStartMs` as `latencies[0] * 8.5 + 42.0`; the source itself notes this is a “real CLI Node/Bun load time ~45-80ms.” Memory is sampled from the benchmark process, not a separately launched CLI process.
- **Impact:** Reported `42.05ms`-class cold-start and RSS values do not measure CLI startup or competitor processes. They must not be presented as such or compared against an IDE/Electron application.
- **Status:** INDEX0 CLI cold-start and cross-product memory comparison are **INCORRECTLY MEASURED / UNVERIFIED**.

### G-06 — Context compression estimate is not a test of the shipped Viking retrieval path or engineering utility

**Severity: CRITICAL**

- **Evidence:** `benchmark.ts:128-194` implements line-based string filters, not a demonstrated Viking production retrieval path or language-aware AST analysis. Token count uses `text.length / 3.75` (`:128-130`), not the tokenizer of a named model. The file scan covers a few fixed source directories (`:226-275`), and the weighted “usage” distribution (60% L0, 30% L1, 10% raw) and $3/1M input price are stipulated (`:280-306`). There are no task queries, retrieval relevance labels, success measurements, or paired uncompressed control runs.
- **Impact:** The output can at most describe character-ratio behavior of these local string transforms under an assumed weighting. It cannot establish actual model token savings, dollar savings, retrieval precision/recall, or maintained engineering success.
- **Status:** Context-reduction percentages as end-to-end Viking or cost benefits are **UNVERIFIED**. A narrower local transform ratio may be recomputable, but is not established as an agent outcome.

### G-07 — “Real repository surgery” result has no verifiable execution lineage

**Severity: HIGH**

- **Evidence:** The harness invokes `Index0Engine.reengineerRepo()` on a network GitHub URL (`benchmark.ts:639-644`), then reports `spec` values or fallback defaults of one crown jewel and three cruft items (`:670-675`). No cloned commit, environment, task patch, test run, baseline, raw logs, or independent confirmation is written in the report. The stored JSON claims “8.2x throughput improvement, 80% memory reduction” without corresponding measured inputs.
- **Impact:** The record does not demonstrate a reproducible performance experiment or correct repository change; defaults can produce plausible output when result fields are absent.
- **Status:** Repository surgery, Crown Jewel Extractor, and performance claims are **UNVERIFIED**.

### G-08 — “Official benchmark” CLI flags only print instructions; the default suite remains the smoke harness

**Severity: HIGH**

- **Evidence:** `executeFullBenchmarkSuite()` always runs `runRealMarketCasesBenchmark()` before optional branches (`benchmark.ts:791-818`). The `--swe-bench` and `--aider` branches print suggested commands but do not spawn those harness scripts or import their result artifacts. `packages/client-harness/src/cli.ts` advertises the command as running “real market benchmarks.” `benchmarks/README.md` calls `index0 benchmark --swe-bench` and `--aider` quick reproductions, although code only prints commands.
- **Impact:** A user can reasonably mistake the default JSON and terminal output for official benchmark execution. Flag spelling is also inconsistent with the displayed `--swe-bench` option (the interface exposes options `sweBench` / `aider`; actual parser behavior should be audited when implementation begins).
- **Status:** Official run via the client-harness benchmark command is **NOT IMPLEMENTED**.

### G-09 — No task freeze, manifest hash, paired runs, or pre-registered evaluation criteria

**Severity: HIGH**

- **Evidence:** `benchmarks/` contains only `README.md`, `REAL_MARKET_BENCHMARK_REPORT.md`, and `EMPIRICAL_BENCHMARK_RESULTS.json`; no frozen task manifest, configuration manifest, benchmark commit manifest, evaluation protocol, seed/repeat policy, or checksums were found. Historical task IDs in the code are manually curated inline.
- **Impact:** There is no auditable evidence that selection and criteria were fixed before observing outcomes. Curated samples have no sampling frame or selection rationale.
- **Status:** No INDEX0 result currently satisfies the benchmark's requested no-cherry-picking / manifest-freeze requirements.

### G-10 — Required per-run artifacts and provenance are absent

**Severity: HIGH**

- **Evidence:** The current TypeScript runner writes one aggregate JSON file and an optional legacy copy (`benchmark.ts:843-855`). It does not create per-task/run `metadata.json`, `task.json`, environment/config snapshots, transcript/tool-call logs, stdout/stderr, patch, test log, evaluation record, resource usage, final state, or checksums. No such INDEX0 result artifacts were found under `benchmarks/` or the expected evaluation output paths. The checked-in SWE-bench example JSONL files are examples, not evidence of INDEX0 runs.
- **Impact:** Results cannot be independently audited or regenerated from raw data. The current artifact's timestamp and hardware fields do not suffice for provenance.

### G-11 — No competitor fairness contract or run protocol

**Severity: HIGH**

- **Evidence:** Current claims compare product-level scores from unspecified configurations. There is no adapter/invocation protocol for Cursor, Claude Code, GitHub Copilot, Aider, or a pinned OpenHands/index0 build under the same prompt, repository commit, task, tool access, budget, network policy, and evaluator. The score tables mix product interfaces and potentially published figures with local INDEX0 values without provenance labels.
- **Impact:** There is no valid head-to-head answer to the primary question. Where identical model/provider settings cannot be used for a hosted product, the difference needs to be explicit and results separated or qualified.

### G-12 — No anti-cheat, test integrity, or patch-scope enforcement in the INDEX0 benchmark path

**Severity: HIGH**

- **Evidence:** The TypeScript smoke suite has no task worktree or candidate patch to inspect. No run validator checks changed tests, evaluator files, harness files, deleted tests, weakened assertions, network downloads, or benchmark infrastructure modifications. The OpenHands AiderBench upstream harness does restore the source test file before test execution (`agent-canvas/evaluation/benchmarks/aider_bench/run_infer.py:134-143`), but this is not wired into INDEX0's client-harness “live market” result and does not by itself provide the requested broad anti-cheat checks.
- **Impact:** Current claims cannot establish test-integrity compliance. A future evaluation must preserve invalid-run records rather than silently exclude them.

### G-13 — Statistical reporting is inadequate and at points contradictory

**Severity: HIGH**

- **Evidence:** The aggregate artifact reports four hand-selected SWE-labelled scripts and five hand-authored Python examples, but gives no confidence intervals, per-task independent outcome records, repeat runs, paired comparison, standard errors, or failure distributions. Docs variously claim 4/4, 5/5, 96.2–97.0%, and 92–100%. The report describes a 300-task SWE-bench Lite dataset but showcases only four or five selected checks.
- **Impact:** A 4/4 pass rate, even if it came from valid task evaluation, would have wide uncertainty and cannot substantiate precise 96–97% rates or broad ranking statements. Here the underlying task metric is not valid in the first place.

### G-14 — Current agent-canvas workflow is not an INDEX0 head-to-head run and has configuration/integrity issues

**Severity: HIGH**

- **Evidence:** `agent-canvas/.github/workflows/eval-runner.yml` runs upstream OpenHands' `CodeActAgent` on SWE-bench Lite using a DeepSeek config and remote runtime (`:52-77`); it does not invoke INDEX0 or competitor products. The workflow's inference call requests `max_iter` 30 but later searches for a `maxiter_50` output path (`:69-72`). It uses 32 parallel processes (`:13-14`) with remote execution. It conditionally handles a labeled pull request or manual dispatch (`:17-18`). No run artifact for INDEX0 was found.
- **Impact:** This workflow may be useful for evaluating upstream OpenHands but cannot be cited as INDEX0 performance. Its current path mismatch may prevent correct selection of inference outputs and needs verification before any official run.
- **Status:** Workflow result attribution to INDEX0 would be **INCORRECT**. The configured OpenHands trial is distinct evidence only if its actual artifacts are obtained and cited.

### G-15 — AiderBench label and task-set documentation are inaccurate for the embedded tests

**Severity: MEDIUM**

- **Evidence:** INDEX0 docs describe five local Exercism snippets as “AiderBench,” sometimes describe the dataset as 133 exercises, and assert competitor percentages. The actual upstream OpenHands AiderBench runner (`agent-canvas/evaluation/benchmarks/aider_bench/run_infer.py:274-315`) loads `RajMaheshwari/Exercism-Python` and produces an evaluation output; it is a different path from the embedded client-harness snippets.
- **Impact:** A real upstream harness exists in the repository, but its existence does not imply the INDEX0 smoke runner consumed it or produced the displayed score. Documentation conflates a benchmark name, a dataset, and a local toy check.

### G-16 — Reproducibility command is not self-contained and fails to disclose prerequisites

**Severity: MEDIUM**

- **Evidence:** Root `package.json:45-46` runs the built `packages/client-harness/dist/cli.js`; `packages/client-harness/package.json` builds with TypeScript and tests the generated `dist`. Benchmark documentation says `index0 benchmark` without pinning the build, commit, Node/pnpm versions, model/provider, API credentials, Docker, dataset revisions, or network requirements. Root CI has no dedicated benchmark manifest/hash/artifact validation. The OpenHands evaluation path requires provider credentials, Python/Poetry dependencies, Docker or remote runtime, dataset retrieval, and substantial resources, as described in its docs.
- **Impact:** The current “single command” does not reproduce an identified frozen experiment. It also invokes the flawed smoke runner rather than the official tasks.

### G-17 — CI permits dependency fallback and does not gate benchmark claims or artifacts

**Severity: MEDIUM**

- **Evidence:** `.github/workflows/ci.yml:35-36` and `:64-66` fall back from `pnpm install --frozen-lockfile` to unconstrained `pnpm install`. No benchmark-specific workflow validates claim provenance, task manifest hashes, official evaluator outputs, run artifacts, or invalid-run checks.
- **Impact:** CI does not ensure locked dependency reproduction and provides no integrity firewall for benchmark claims. CI passing must not be interpreted as benchmark validation.

### G-18 — Microbenchmarks are not separated clearly from end-to-end task outcomes

**Severity: MEDIUM**

- **Evidence:** `executeFullBenchmarkSuite()` aggregates process/filter timing, contract serialization, GNAP local operations, context transforms, smoke task checks, and a hardcoded competitor matrix in a “REAL MARKET EMPIRICAL BENCHMARK SUITE” and displays them in a market comparison report (`benchmark.ts:747-860`).
- **Impact:** Correctly measured local microbenchmarks could be useful engineering diagnostics, but their aggregation with agent task success and competitor claims makes their scope easy to misinterpret. None is evidence of end-to-end coding reliability.

### G-19 — Human intervention, autonomy, cost and agent resource metrics have no observation source

**Severity: HIGH**

- **Evidence:** Tables claim `0.2` INDEX0 interventions/task and competitor intervention counts; the benchmark runner does not launch a task-solving session or collect human actions/interventions, and the JSON lacks raw event records. The runner does not capture task-level model tokens, price snapshot, inference latency, compute, retries, or intervention severity.
- **Impact:** Autonomy and economics claims cannot be derived from current recorded evidence. Values should be treated as unsupported.

### G-20 — Additional capabilities and required study designs are not benchmarked

**Severity: MEDIUM**

- **Evidence:** No INDEX0 benchmark implementation found that runs controlled Viking ablation, GNAP task coordination comparisons, MCTS ablation, reverse-engineering quality against a baseline, sandbox safety comparison, voice workflow evaluation, repository-size scaling series, long-horizon trajectory study, or 1/2/4/8-agent comparison. Some product components or upstream tests may exist, but that is not an evaluation.
- **Impact:** The requested causal claims about component contribution and scaling remain untested.

### G-21 — Marketing and capability claims exceed the benchmark evidence

**Severity: HIGH**

- **Evidence:** `README.md`, `docs/COMPETITOR_BENCHMARKS.md`, `docs/COMPLETE_PROJECT_LITERALLY_OVERVIEW.md`, and benchmark reports use formulations including “Independent Auditor,” “Audited Verdict,” “Industry Lead,” “Enterprise Superiority,” “Zero-Slop Guarantee,” and precise superiority deltas. These are not supported by the current local measurement path or provenance artifacts. The root README also claims 34.3–91.0% savings and winner-style competitor comparisons.
- **Impact:** The current public-facing comparison violates the benchmark claim firewall requested in the mission. In the implementation phase, unsupported claims should be removed or visibly marked unverified until each has the required reproducible artifact, not merely moved to another file.

### G-22 — Repository contains substantial pre-existing uncommitted changes

**Severity: LOW (audit-process risk)**

- **Evidence:** At audit start, `git status --short` showed modifications and untracked files including `packages/client-harness/src/cli.ts`, `packages/client-harness/test/benchmark.test.ts`, `packages/client-harness/src/index.ts`, launcher/UI files, and MCP/search work. The audit did not modify these files.
- **Impact:** Any later implementation and validation must distinguish this pre-existing work from benchmark changes. The working tree should not be reset or cleaned as part of benchmark work.

## Existing evidence inventory

| Area | What exists | What it currently proves |
|---|---|---|
| `agent-canvas/evaluation/benchmarks/swe_bench/` | Upstream OpenHands SWE-bench runner and evaluator documentation/scripts | The repository has an OpenHands-based path capable of inference/evaluation when correctly configured; not an INDEX0 run or competitor comparison |
| `agent-canvas/evaluation/benchmarks/aider_bench/` | Upstream OpenHands AiderBench-style Exercism runner and test restoration path | The repository includes an evaluation harness; not proof the INDEX0 runner executed it or achieved published values |
| `packages/client-harness/src/benchmark.ts` | Local filter, string reduction, GNAP write, serialization loop, embedded scripts, fixed matrix | Some local code paths can be timed/inspected; the claimed coding-agent outcomes are not measured |
| `benchmarks/EMPIRICAL_BENCHMARK_RESULTS.json` | Aggregate result-like JSON with timestamp/hardware and metric values | A checked-in JSON claim exists; no sufficient source logs, patches, or task outcomes to verify it |
| `.github/workflows/eval-runner.yml` | OpenHands SWE-bench workflow using remote runtime/DeepSeek config | A separate OpenHands workflow configuration exists; no INDEX0/head-to-head result |
| Root CI | Build, typecheck, tests, infra config and license checks | General software quality gates only; not benchmark integrity validation |

## Claim disposition at audit time

| Claim group | Audit disposition | Reason |
|---|---|---|
| INDEX0 SWE-bench Verified `96.2–97.0%` | **UNVERIFIED** | No INDEX0 predictions/patches or official evaluation output; client smoke scripts misattributed |
| INDEX0 SWE-bench Pro `82.5%` | **UNVERIFIED** | No identified Pro inference/evaluation run or raw artifact |
| INDEX0 Terminal-Bench `58.5%` | **UNVERIFIED** | No INDEX0 Terminal-Bench execution output located |
| INDEX0 AiderBench `84.2–100%` / `92%` | **UNVERIFIED; local smoke label INCORRECT** | Embedded hand-authored implementation and tests are not agent task attempts |
| Viking/context savings `34.3–91.0%` | **PARTIALLY VERIFIED only as transform-size estimates; end-to-end claim UNVERIFIED** | Character-ratio heuristic, estimated tokens, stipulated weighting/prices; no paired outcome experiment |
| CLI cold-start `42ms` / competitor comparisons | **INCORRECTLY MEASURED / UNVERIFIED** | Formula-based internal filter timing, not process startup; competitor products not run |
| memory comparisons | **UNVERIFIED / NOT COMPARABLE** | One process's RSS is mixed with product-level figures without same workload/process protocol |
| GNAP throughput | **PARTIALLY VERIFIED as a local synthetic disk-operation microbenchmark only** | 100 sequential local steps in temporary repo; no task-level coordination benefit or competitor baseline |
| contract validation ops/sec | **PARTIALLY VERIFIED as a local serialization/field-check microbenchmark only** | Loop does not invoke the authoritative runtime schema validator for each operation |
| repository surgery `8.2x`, memory `80%` | **UNVERIFIED** | No baseline, measured run, patch, tests, or raw artifact; fallback values exist |
| human interventions `0.2/task` and competitor counts | **UNVERIFIED** | No recorded task/human-intervention event data |
| Cursor/Claude/Copilot/OpenHands outcome comparisons | **UNVERIFIED / NOT COMPARABLE** | Hard-coded, uncited values without common configuration/run data |

## Gaps to close in the implementation phase

1. **Immediately stop claim laundering:** clearly mark old aggregate outputs and comparison docs unverified; remove hard-coded competitor scores from executable benchmark output. Establish a claim-to-artifact rule before new figures are published.
2. **Separate official harness execution:** invoke pinned, official dataset/evaluation pathways (or document why an official tool cannot be used); never count embedded smoke tests as benchmark tasks.
3. **Freeze before execution:** version and hash task/config/environment manifests, record repo/task commits and predefined success criteria.
4. **Add auditable per-run evidence:** immutable metadata, prompts, transcript/tool events, stdout/stderr, patch, evaluator outputs, resource usage, final state, checksum and timestamps for every run/task.
5. **Use paired task runs under a written fairness contract:** same initial tree, task text, evaluator, time/tool/network constraints, model/provider/settings where possible; document any unavoidable interface/runtime differences.
6. **Separate roles:** agent runner, evaluator, and report generator must be separate; evaluate patches using official or independently implemented held-out tests and anti-cheat checks.
7. **Report uncertainty and failures:** task-level data, N, success rates and suitable confidence intervals; predefine repeats and preserve invalid/failed runs.
8. **Avoid premature broad execution:** full SWE-bench scale, multiple commercial agents, and ablations are likely blocked by credentials, licenses/product access, Docker/storage/compute, network, and cost. Report BLOCKED rather than substitute local smoke checks.
9. **Preserve user changes:** pre-existing dirty files were observed and must not be overwritten or reverted during further work.

## Execution status

**BLOCKED for the requested comparative benchmark.** This workspace audit provides no authorized API/provider credentials, competitor installation/configuration, frozen experiment manifest, and benchmark run artifacts. Network access from the terminal is disabled in the current environment; official model/runtime execution and dataset acquisition cannot be assumed. No new agent benchmark was run, and no result should be inferred from this gap analysis.

## Files inspected

- `benchmarks/README.md`
- `benchmarks/EMPIRICAL_BENCHMARK_RESULTS.json`
- `benchmarks/REAL_MARKET_BENCHMARK_REPORT.md`
- `packages/client-harness/package.json`
- `packages/client-harness/src/benchmark.ts`
- `packages/client-harness/src/cli.ts` (opening/help section; working tree already modified)
- `packages/client-harness/test/benchmark.test.ts` (working tree already modified)
- `packages/client-harness/test/harness.test.ts`
- `agent-canvas/evaluation/README.md`
- `agent-canvas/evaluation/benchmarks/swe_bench/README.md`
- `agent-canvas/evaluation/benchmarks/swe_bench/run_infer.py`
- `agent-canvas/evaluation/benchmarks/swe_bench/scripts/run_infer.sh`
- `agent-canvas/evaluation/benchmarks/aider_bench/README.md`
- `agent-canvas/evaluation/benchmarks/aider_bench/run_infer.py`
- `agent-canvas/evaluation/benchmarks/aider_bench/helper.py`
- `agent-canvas/evaluation/benchmarks/aider_bench/scripts/summarize_results.py`
- `.github/workflows/ci.yml`
- `agent-canvas/.github/workflows/eval-runner.yml`
- root `package.json`, `pnpm-workspace.yaml`, `turbo.json`
- `README.md`, `docs/COMPETITOR_BENCHMARKS.md`, `docs/COMPLETE_PROJECT_LITERALLY_OVERVIEW.md`, and `docs/REAL_BENCHMARKS_PLAN.md`
