# Fairness Contract for INDEX0 Benchmark

**Version:** 1.0.0  
**Effective Date:** 2026-09-27  
**Status:** ACTIVE — Required for all comparative benchmark runs

---

## Purpose

This contract defines the mandatory conditions for any head-to-head comparison between INDEX0 and competing coding agents. No comparison result may be published unless all conditions are met and documented.

---

## 1. Identical Inputs (Mandatory)

Every system under evaluation MUST receive:

| Input | Specification | Verification |
|-------|---------------|--------------|
| **Repository** | Same Git URL, same starting commit (SHA256 recorded) | `git rev-parse HEAD` in run metadata |
| **Issue/Task** | Same task description text (frozen in manifest) | Task manifest hash |
| **Environment** | Same OS, runtime, network policy, sandbox config | Environment snapshot in metadata.json |
| **Test Suite** | Same test files, same evaluator version | Test suite hash in baseline |
| **Time Budget** | Same wall-clock limit per task | Recorded in agent_config |
| **Tool Budget** | Same max tool calls / commands | Recorded in agent_config |
| **Model/Provider** | Same model ID, provider, version where possible | Recorded in agent_config |
| **Model Settings** | Same temperature, top-p, max tokens where exposed | Recorded in agent_config |
| **Success Criteria** | Same evaluation levels (A-F), same pass thresholds | Frozen in task manifest |

### Unavoidable Differences (Must Be Documented)

If a competitor cannot operate under identical configuration:

1. **Document the exact difference** (e.g., "Cursor only runs in VS Code extension context, not headless CLI")
2. **Record the competitor's actual configuration** (model, version, settings as reported by product)
3. **Qualify results** with `NOT_DIRECTLY_COMPARABLE` flag
4. **Never mix** measured and unverified competitor data in same table

---

## 2. Task Selection (No Cherry-Picking)

### Pre-Execution Freeze (MANDATORY)

Before ANY agent runs:

1. **Freeze task list** — Complete list of task IDs published
2. **Publish manifest** — Task manifest with hash committed to repository
3. **Hash manifest** — SHA256 of manifest recorded in all run metadata
4. **Record repository commits** — Starting commit for each task repo
5. **Record evaluation criteria** — Success levels, primary metric, anti-cheat checks
6. **Record benchmark configuration** — All agent configs, environment specs
7. **Record environment configuration** — OS, runtime, network, sandbox

### During Execution

- **Do not remove failed tasks** — All tasks attempted must be reported
- **Do not replace difficult tasks** — No task substitution after observing failures
- **If task invalid** — Document why, preserve original record, mark `INVALID_TASK`

### Post-Execution

- **Preserve all runs** — Including failed, invalid, and cheat-detected runs
- **Report intervention rate** — Explicitly measure human intervention
- **Report raw metrics** — Not just aggregates

---

## 3. Execution Protocol

### Agent Invocation

Each system must be invoked through a standardized adapter:

```typescript
interface IAgentAdapter {
  // Initialize agent with task, repo, config
  initialize(task: ITask, repo: IRepository, config: IAgentConfig): Promise<void>;
  
  // Run agent autonomously (no human input)
  run(): Promise<IAgentRunResult>;
  
  // Get patch produced
  getPatch(): Promise<string>;
  
  // Get resource usage
  getResourceUsage(): Promise<IResourceUsage>;
  
  // Get intervention log
  getInterventions(): Promise<IInterventionRecord[]>;
}
```

### Resource Monitoring

All runs must capture:
- Token usage (input/output/total per model call)
- Inference cost (using documented pricing snapshot with timestamp)
- Wall-clock time
- Tool calls count and types
- Files modified
- Commands executed
- Tests executed (pass/fail/skip)
- Human interventions (level 0-4)

---

## 4. Evaluation Protocol

### Separation of Concerns (MANDATORY)

Three independent components:

1. **Agent Runner** — Executes agent, produces patch + artifacts
2. **Evaluator** — Applies patch, runs tests, computes metrics (independent implementation)
3. **Reporter** — Generates reports from evaluation artifacts

**No component may certify itself.** Evaluator must be:
- Official benchmark evaluator (SWE-bench `sweb.eval`, AiderBench official), OR
- Independently implemented verification with published source

### Success Levels (Predefined, Immutable)

| Level | Criteria | Weight |
|-------|----------|--------|
| **A** | Patch applies cleanly | Required |
| **B** | Existing tests pass | Required |
| **C** | Hidden/held-out tests pass | Primary |
| **D** | Regression tests pass | Required |
| **E** | Task-specific behavioral requirements pass | Primary |
| **F** | No known regression + all requirements satisfied | Highest |

A task counts as solved at the **highest predefined level** it satisfies.  
**Never redefine success after seeing results.**

### Anti-Cheat Enforcement

Evaluator MUST run anti-cheat checks:
- Test file integrity (hash comparison to baseline)
- Assertion strength analysis
- Evaluator code integrity
- Benchmark infrastructure integrity
- Network access monitoring
- Hardcoded output detection

**If cheating detected:** `status = INVALID_RUN` — Preserve record, do not silently discard.

---

## 5. Reporting Requirements

### Per-Run Artifacts (MANDATORY)

Every run produces:

```
run/
├── metadata.json          # Run config, agent config, environment
├── task.json              # Task definition, success criteria
├── environment.json       # Environment snapshot
├── agent_config.json      # Agent model, settings, budgets
├── transcript.jsonl       # Complete event stream
├── tool_calls.jsonl       # Structured tool invocations
├── stdout.log             # Process stdout
├── stderr.log             # Process stderr
├── patch.diff             # Candidate patch
├── tests.log              # Test execution output
├── evaluation.json        # Evaluator result (level A-F)
├── resource_usage.json    # Tokens, cost, time, compute
├── final_state.json       # Final repo state
├── interventions.jsonl    # Human intervention records
├── anti_cheat.json        # Anti-cheat detection result
└── checksums.sha256       # SHA256 of all artifacts
```

### Aggregate Reporting

For each system × dataset combination:

- **N** — Total valid tasks attempted
- **Success Rate** — Tasks at Level F / N
- **95% CI** — Wilson score interval or Clopper-Pearson
- **Per-Level Breakdown** — Count at each level A-F
- **Intervention Rate** — % tasks with level ≥ 2 intervention
- **Median / P25 / P75 / P95** — Tokens, cost, time per task
- **Failure Distribution** — Categorized failure modes

### Competitor Comparison Table

Only permitted when:
- Same task manifest used for all systems
- Same evaluator used for all systems
- All per-run artifacts exist for all systems
- Differences documented in footnotes

Format:
```
| System | N | Success Rate (95% CI) | Level F | Interventions/Task | Cost/Task | Status |
|--------|---|----------------------|---------|-------------------|-----------|--------|
| INDEX0 | 50 | 72% (58-83%) | 36 | 0.3 | $0.42 | MEASURED |
| Cursor | 50 | 65% (51-78%) | 32 | 2.1 | $1.15 | MEASURED |
| Claude | 50 | 70% (56-81%) | 35 | 1.2 | $0.89 | MEASURED |
```

**Never** include hard-coded, unverified, or "published" competitor numbers.

---

## 6. Statistical Rigor

### Minimum Sample Sizes

| Claim Type | Minimum N | Notes |
|------------|-----------|-------|
| Pilot / Preliminary | 10 | Label: `PILOT` |
| Calibrated | 50 | Label: `VALIDATED` |
| Full Benchmark | 300+ (SWE-bench) | Label: `INDEPENDENTLY_REPLICATED` |

### Confidence Intervals

- **Primary metric**: Wilson score interval (95%)
- **Continuous metrics**: Bootstrap percentile CI (95%, 10000 resamples)
- **Small N (<30)**: Exact Clopper-Pearson

### Labels

Every reported number MUST carry a label:
- `PILOT` — < 30 tasks, exploratory
- `PRELIMINARY` — 30-50 tasks, not independently replicated
- `VALIDATED` — 50+ tasks, same conditions, single run
- `INDEPENDENTLY_REPLICATED` — Multiple independent runs, different environments

---

## 7. Reproducibility

### Required for Publication

```bash
# Single command reproduction
index0 benchmark reproduce \
  --run-id <run-id> \
  --manifest-hash <hash> \
  --dataset-version <version>
```

### Must Provide

- Docker image with pinned dependencies
- Benchmark commit SHA
- Dataset version and source
- Task manifest (frozen)
- Environment manifest
- Complete configuration
- Evaluation scripts (independent from runner)
- Raw results, logs, patches
- Checksums for all artifacts

---

## 8. Claim Firewall

**No result may appear in:**
- Website / landing page
- README / documentation
- Investor materials
- Marketing materials
- CLI output
- Social media / press

**Unless it has:**
- [ ] Dataset version + commit
- [ ] Configuration manifest (frozen pre-execution)
- [ ] Raw run artifacts (complete)
- [ ] Evaluation artifacts (official or independent)
- [ ] Timestamp + repository commit
- [ ] Reproduction command

---

## 9. Violations & Remediation

| Violation | Consequence |
|-----------|-------------|
| Cherry-picking tasks | All results invalidated; re-run with frozen manifest |
| Undocumented configuration difference | Results marked `NOT_COMPARABLE` |
| Missing per-run artifacts | Results marked `UNVERIFIED` |
| Cheating detected (any system) | Run marked `INVALID_RUN`, preserved, investigated |
| Redefining success post-hoc | All results invalidated |
| Publishing without firewall artifacts | Publication blocked; claim retracted |

---

## 10. Signatures

By running a comparative benchmark under the INDEX0 framework, all parties acknowledge:

- This contract is binding for the duration of the benchmark
- Results without complete artifacts are non-claims
- Independent replication is the standard of evidence
- Truth is the benchmark

---

**Contract Hash:** `sha256:$(cat FAIRNESS_CONTRACT.md | sha256sum | cut -d' ' -f1)`