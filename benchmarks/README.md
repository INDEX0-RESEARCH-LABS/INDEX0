# INDEX0 AI — Benchmark Suite (Integrity Mode)

> **Integrity-First Benchmarking**: This directory contains a defensible evaluation framework.
> All previous benchmark claims have been **quarantined** pending reproducible evidence.
> See [`CLAIM_AUDIT.md`](./CLAIM_AUDIT.md) for claim dispositions and [`BENCHMARK_INTEGRITY_REPORT.md`](./BENCHMARK_INTEGRITY_REPORT.md) for detailed weakness analysis.

---

## ⚠️ Claim Firewall Active

**No benchmark result may be published without:**
- [ ] Frozen task manifest with SHA256 hash
- [ ] Complete per-run artifacts (transcripts, patches, test logs, evaluations)
- [ ] Official evaluator output (SWE-bench `sweb.eval`, AiderBench official)
- [ ] Anti-cheat detection passing
- [ ] Statistical reporting with 95% confidence intervals
- [ ] Reproduction command

**Previously published claims (96.2% SWE-bench, 92% AiderBench, 42ms cold-start, etc.) are UNVERIFIED and blocked from publication.** See [`CLAIM_AUDIT.md`](./CLAIM_AUDIT.md).

---

## Directory Inventory

| File | Format | Description |
| :--- | :--- | :--- |
| [`CLAIM_AUDIT.md`](./CLAIM_AUDIT.md) | Markdown | Disposition of all previous benchmark claims (VERIFIED/UNVERIFIED/INCORRECT) |
| [`BENCHMARK_INTEGRITY_REPORT.md`](./BENCHMARK_INTEGRITY_REPORT.md) | Markdown | Complete weakness analysis of previous implementation |
| [`FAIRNESS_CONTRACT.md`](./FAIRNESS_CONTRACT.md) | Markdown | Binding contract for comparative benchmarks |
| [`REPRODUCIBILITY.md`](./REPRODUCIBILITY.md) | Markdown | Reproduction guide for official benchmarks |
| [`EMPIRICAL_BENCHMARK_RESULTS.json`](./EMPIRICAL_BENCHMARK_RESULTS.json) | JSON | **QUARANTINED** — Historical artifact, not current evidence |
| [`REAL_MARKET_BENCHMARK_REPORT.md`](./REAL_MARKET_BENCHMARK_REPORT.md) | Markdown | **QUARANTINED** — Unverified audit report |

---

## 1. Benchmark Modes

### Microbenchmarks + Smoke Checks (Default — No Credentials Required)

```bash
# Run local microbenchmarks (Viking, GNAP, Terminal Filter, Contract Validation)
# Plus smoke checks explicitly labeled as smoke checks
index0 benchmark

# JSON output
index0 benchmark --json
```

**What this measures:**
- Viking context compression character-ratio estimates (labeled as estimates)
- GNAP disk consensus throughput (labeled as synthetic microbenchmark)
- Terminal ANSI filter compression (labeled as synthetic input)
- Contract validation serialization loop (labeled as local loop)
- CLI in-process filter timing (labeled as NOT process startup)
- Smoke checks on 4 SWE-bench-like scripts + 5 Exercism exercises (labeled `SMOKE_CHECK_ONLY`)

**What this does NOT measure:**
- Actual agent task success on SWE-bench/AiderBench
- Competitor performance
- End-to-end token savings in agent workflows
- Human intervention rates

### Official Benchmarks (Require Infrastructure)

```bash
# Official SWE-bench via Princeton harness (requires Docker, API keys, network)
index0 benchmark --official-swe-bench --dataset Lite --max-instances 10

# Official AiderBench via OpenHands harness (requires Docker, API keys, network)
index0 benchmark --official-aider --max-instances 20
```

**Prerequisites:** See [`REPRODUCIBILITY.md`](./REPRODUCIBILITY.md)

**If infrastructure unavailable:** Returns `BLOCKED` with specific reasons — never substitutes fake results.

---

## 2. Artifact Structure

Every official run produces:

```
benchmarks/runs/bench-<timestamp>-<random>/
├── metadata.json          # Run config, agent config, environment
├── task.json              # Frozen task manifest with hash
├── environment.json       # Environment snapshot
├── agent_config.json      # Agent model, settings, budgets
├── transcript.jsonl       # Complete event stream
├── tool_calls.jsonl       # Structured tool invocations
├── stdout.log             # Process stdout
├── stderr.log             # Process stderr
├── patch.diff             # Candidate patch
├── tests.log              # Test execution output
├── evaluation.json        # Evaluator result (Level A-F)
├── resource_usage.json    # Tokens, cost, time, compute
├── final_state.json       # Final repo state
├── interventions.jsonl    # Human intervention records (0-4)
├── anti_cheat.json        # Anti-cheat detection result
├── checksums.sha256       # SHA256 of all artifacts
└── benchmark-report.json  # Aggregate report with CI
```

---

## 3. Evaluation Protocol

### Fairness Contract
See [`FAIRNESS_CONTRACT.md`](./FAIRNESS_CONTRACT.md) — binding requirements for:
- Identical inputs for all systems
- Task freeze before execution (no cherry-picking)
- Separation: Runner / Evaluator / Reporter
- Predefined success levels (A-F), never redefined post-hoc
- Anti-cheat enforcement (`INVALID_RUN` on violation)
- Statistical rigor (95% CI, labels: PILOT/PRELIMINARY/VALIDATED/REPLICATED)

### Success Levels (Immutable)

| Level | Criteria |
|-------|----------|
| **A** | Patch applies cleanly |
| **B** | Existing tests pass |
| **C** | Hidden/held-out tests pass |
| **D** | Regression tests pass |
| **E** | Task-specific behavioral requirements pass |
| **F** | No known regression + all requirements satisfied |

---

## 4. Running in CI/CD

```yaml
# Example: GitHub Actions
- name: Run Official SWE-bench Pilot
  env:
    ANTHROPIC_API_KEY: ${{ secrets.ANTHROPIC_API_KEY }}
    ALLHANDS_API_KEY: ${{ secrets.ALLHANDS_API_KEY }}
  run: |
    index0 benchmark --official-swe-bench --dataset Lite --max-instances 10
```

Artifacts uploaded from `benchmarks/runs/` provide complete reproducibility.

---

## 5. Verification

Before trusting any benchmark result:

1. **Check claim firewall:** `cat benchmarks/CLAIM_AUDIT.md`
2. **Verify artifacts:** `cat benchmarks/runs/<run-id>/checksums.sha256`
3. **Check anti-cheat:** `cat benchmarks/runs/<run-id>/anti_cheat.json`
4. **Review statistics:** Look for N, 95% CI, labels (PILOT/VALIDATED/REPLICATED)
5. **Confirm no hard-coded competitors:** Results must come from paired runs

---

## 6. Related Documentation

- [`CLAIM_AUDIT.md`](./CLAIM_AUDIT.md) — All previous claims dispositioned
- [`BENCHMARK_INTEGRITY_REPORT.md`](./BENCHMARK_INTEGRITY_REPORT.md) — Complete weakness analysis
- [`FAIRNESS_CONTRACT.md`](./FAIRNESS_CONTRACT.md) — Comparative benchmark rules
- [`REPRODUCIBILITY.md`](./REPRODUCIBILITY.md) — Step-by-step reproduction
- [`benchmarks/runs/`](../benchmarks/runs/) — Per-run artifacts (generated)
