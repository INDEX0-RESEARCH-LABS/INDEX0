# Benchmark Reproduction Guide

**Version:** 2.0.0 (Integrity Mode)  
**Benchmark Commit:** Run `git rev-parse HEAD` to verify

---

## Quick Start

### Microbenchmarks + Smoke Checks (No Credentials Required)

```bash
# Run local microbenchmarks and smoke checks
index0 benchmark

# JSON output for CI/CD
index0 benchmark --json
```

**Expected Output:** Microbenchmark results (Viking compression ratios, GNAP throughput, etc.) + smoke checks explicitly labeled `SMOKE_CHECK_ONLY`. No competitor comparisons. Claim firewall active.

---

## Official Benchmarks (Require Infrastructure)

### Prerequisites

| Requirement | Purpose | Installation |
|-------------|---------|--------------|
| **agent-canvas** (OpenHands fork) | Official harness runner | `git submodule update --init` or clone to `agent-canvas/` |
| **Poetry** | Python dependency management | `pipx install poetry` |
| **Docker** | SWE-bench containerized evaluation | `docker --version` |
| **LLM API Credentials** | Model inference for agent | Set `ANTHROPIC_API_KEY` or `OPENAI_API_KEY` or `ALLHANDS_API_KEY` |
| **Network Access** | Dataset download (Hugging Face) | Access to `huggingface.co` |

### SWE-bench Official Evaluation

```bash
# Run official SWE-bench Lite (10 instances for pilot)
index0 benchmark --official-swe-bench \
  --dataset Lite \
  --max-instances 10 \
  --llm-config llm.eval_claude_35_sonnet \
  --runtime docker \
  --workers 2

# Run SWE-bench Verified
index0 benchmark --official-swe-bench \
  --dataset Verified \
  --max-instances 50 \
  --llm-config llm.eval_claude_35_sonnet \
  --runtime docker \
  --workers 4

# Run SWE-bench Pro (multi-file)
index0 benchmark --official-swe-bench \
  --dataset Pro \
  --max-instances 30 \
  --llm-config llm.eval_claude_35_sonnet \
  --runtime docker \
  --workers 4
```

### AiderBench Official Evaluation

```bash
# Run official AiderBench (Exercism Python)
index0 benchmark --official-aider \
  --max-instances 20 \
  --llm-config llm.eval_claude_35_sonnet \
  --workers 2 \
  --unit-tests
```

---

## Reproducing a Specific Run

### 1. Get Run Artifacts

Each run produces a directory: `benchmarks/runs/bench-<timestamp>-<random>/`

```bash
ls benchmarks/runs/
# bench-20260927-abc123/
```

### 2. Verify Artifacts

```bash
# Check all artifacts present
ls benchmarks/runs/bench-<run-id>/
# metadata.json  task.json  environment.json  agent_config.json
# transcript.jsonl  tool_calls.jsonl  stdout.log  stderr.log
# patch.diff  tests.log  evaluation.json  resource_usage.json
# final_state.json  interventions.jsonl  anti_cheat.json
# checksums.sha256  benchmark-report.json  swe_bench_summary.json
```

### 3. Verify Checksums

```bash
cd benchmarks/runs/bench-<run-id>/
cat checksums.sha256 | while read file hash; do
  computed=$(sha256sum "$file" | cut -d' ' -f1)
  if [ "$computed" = "$hash" ]; then
    echo "✓ $file"
  else
    echo "✗ $file MISMATCH"
  fi
done
```

### 4. Reproduce from Manifest

```bash
# The task manifest contains everything needed to reproduce
cat benchmarks/runs/bench-<run-id>/task.json
# {
#   "version": "1.0.0",
#   "createdAt": "2026-09-27T...",
#   "benchmarkCommit": "abc123...",
#   "dataset": { "name": "...", "version": "...", "taskIds": [...] },
#   "evaluationCriteria": { ... },
#   "hash": "sha256:..."
# }

# To reproduce EXACTLY:
git checkout <benchmarkCommit>
# Ensure same environment (Docker, Poetry, API keys)
# Run with same config (see agent_config.json)
```

### 5. Single-Command Reproduction (Planned)

```bash
# Future: single command reproduction
index0 benchmark reproduce \
  --run-id bench-20260927-abc123 \
  --manifest-hash <hash-from-task.json> \
  --dataset-version 1.0.0
```

---

## Artifact Specification

### metadata.json
```json
{
  "runId": "bench-20260927-abc123",
  "taskId": "swe-bench-lite-10",
  "startedAt": "2026-09-27T15:30:00.000Z",
  "completedAt": "2026-09-27T16:45:00.000Z",
  "agentConfig": {
    "model": "claude-3-5-sonnet-20241022",
    "provider": "anthropic",
    "version": "1.0.0",
    "temperature": 0.0,
    "maxTokens": 8192,
    "toolBudget": 100,
    "timeBudgetMs": 1800000
  },
  "environment": {
    "platform": "linux",
    "arch": "x64",
    "cpus": 8,
    "totalMemoryGb": 32.0,
    "networkPolicy": "restricted",
    "sandboxConfig": "firecracker-microvm"
  },
  "repository": {
    "url": "https://github.com/princeton-nlp/SWE-bench_Lite",
    "commit": "abc123..."
  },
  "task": {
    "id": "swe-bench-lite-10",
    "description": "SWE-bench Lite 10-instance pilot",
    "difficulty": "D3",
    "filesEstimated": 50
  },
  "checksums": {
    "manifest": "sha256:...",
    "config": "sha256:..."
  }
}
```

### evaluation.json (Per-Task)
```json
{
  "timestamp": "2026-09-27T16:00:00.000Z",
  "taskId": "django__django-15202",
  "successLevel": "F",
  "criteria": {
    "patchApplies": true,
    "existingTestsPass": true,
    "hiddenTestsPass": true,
    "regressionTestsPass": true,
    "behavioralRequirementsPass": true,
    "noKnownRegression": true
  },
  "antiCheat": {
    "testsModified": false,
    "testsDeleted": false,
    "assertionsWeakened": false,
    "evaluatorModified": false,
    "benchmarkModified": false,
    "networkAccess": false,
    "hardcodedOutputs": false
  },
  "score": 1.0,
  "notes": []
}
```

### benchmark-report.json (Aggregate)
```json
{
  "runId": "bench-20260927-abc123",
  "timestamp": "2026-09-27T15:30:00.000Z",
  "benchmarkCommit": "abc123...",
  "config": { ... },
  "taskManifest": { ... },
  "sweBench": {
    "feasible": true,
    "result": { "success": true, "outputDir": "...", "outputFile": "..." },
    "summary": {
      "dataset": "princeton-nlp/SWE-bench_Lite",
      "totalInstances": 10,
      "resolvedInstances": 7,
      "passRate": 0.7,
      "ci95": [0.35, 0.93],
      "perInstance": [...]
    },
    "antiCheat": { "clean": true, "violations": [], "riskLevel": "NONE" }
  },
  "integrity": {
    "claimFirewallActive": true,
    "taskManifestFrozen": true,
    "taskManifestHash": "sha256:...",
    "perRunArtifactsGenerated": true,
    "antiCheatEnabled": true,
    "evaluatorIndependent": true
  }
}
```

---

## Configuration Files

### agent-canvas/config.toml (Required for Official Runs)

```toml
[core]
workspace_base = "./workspace"

[llm.eval_claude_35_sonnet]
model = "anthropic/claude-3-5-sonnet-20241022"
api_key = "ENV_VAR:ANTHROPIC_API_KEY"
temperature = 0.0

[llm.eval_gpt4o]
model = "openai/gpt-4o-2024-08-06"
api_key = "ENV_VAR:OPENAI_API_KEY"
temperature = 0.0
```

### Environment Variables

```bash
# Required for remote runtime
export ALLHANDS_API_KEY="your-allhands-api-key"
export SANDBOX_REMOTE_RUNTIME_API_URL="https://runtime.eval.all-hands.dev"

# Or for local Docker
export ANTHROPIC_API_KEY="your-anthropic-key"
# or
export OPENAI_API_KEY="your-openai-key"

# Docker image prefix (optional)
export EVAL_DOCKER_IMAGE_PREFIX="docker.io/xingyaoww/"
```

---

## Troubleshooting

### "BLOCKED: Infrastructure not available"

**Cause:** Missing prerequisites for official runs.

**Check:**
```bash
# Verify agent-canvas
ls agent-canvas/evaluation/benchmarks/swe_bench/scripts/run_infer.sh

# Verify Poetry
poetry --version

# Verify Docker
docker --version

# Verify API keys
echo $ANTHROPIC_API_KEY
echo $ALLHANDS_API_KEY

# Verify network
curl -I https://huggingface.co
```

### "No output directory found after inference"

**Cause:** OpenHands inference failed or output path changed.

**Check:**
```bash
ls agent-canvas/evaluation/evaluation_outputs/outputs/
# Should contain dataset/agent/llm_config_maxiter_N_N_.../
```

### Anti-cheat violations detected

**Cause:** Test/evaluator files modified during run.

**Check:**
```bash
cat benchmarks/runs/bench-<run-id>/anti_cheat.json
# Shows violations with file paths and evidence
```

---

## CI/CD Integration

### GitHub Actions Example

```yaml
name: Official Benchmarks

on:
  workflow_dispatch:
    inputs:
      benchmark:
        type: choice
        options: [swe-bench-lite, swe-bench-verified, aider-bench]

jobs:
  benchmark:
    runs-on: ubuntu-latest
    timeout-minutes: 360
    env:
      ANTHROPIC_API_KEY: ${{ secrets.ANTHROPIC_API_KEY }}
      ALLHANDS_API_KEY: ${{ secrets.ALLHANDS_API_KEY }}
    steps:
      - uses: actions/checkout@v4
      
      - name: Setup
        run: |
          git submodule update --init
          pipx install poetry
          
      - name: Run Benchmark
        run: |
          if [ "${{ github.event.inputs.benchmark }}" = "swe-bench-lite" ]; then
            index0 benchmark --official-swe-bench --dataset Lite --max-instances 10 --llm-config llm.eval_claude_35_sonnet
          elif [ "${{ github.event.inputs.benchmark }}" = "aider-bench" ]; then
            index0 benchmark --official-aider --max-instances 20 --llm-config llm.eval_claude_35_sonnet
          fi
          
      - name: Upload Artifacts
        uses: actions/upload-artifact@v4
        with:
          name: benchmark-results
          path: benchmarks/runs/
```

---

## Verification Checklist

Before publishing any benchmark result, verify:

- [ ] Task manifest frozen with hash BEFORE execution
- [ ] All per-run artifacts present and checksums valid
- [ ] Official evaluator used (not smoke checks)
- [ ] Anti-cheat detection ran and passed (`clean: true`)
- [ ] Statistical reporting includes: N, success rate, 95% CI
- [ ] Result labeled: `PILOT` / `PRELIMINARY` / `VALIDATED` / `INDEPENDENTLY_REPLICATED`
- [ ] No hard-coded competitor data
- [ ] Claim firewall check passes

---

## Support

For reproduction issues:
1. Check `benchmarks/BENCHMARK_INTEGRITY_REPORT.md` for known limitations
2. Verify all prerequisites in this guide
3. Run `index0 benchmark --json` to verify microbenchmarks work
4. Check artifact checksums in run directory