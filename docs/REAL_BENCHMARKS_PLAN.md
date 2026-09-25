# Real Benchmarks Master Execution Plan — INDEX0 AI

> **Mission**: Conduct empirical, reproducible, and verifiable benchmark evaluations of INDEX0 AI against gold-standard software engineering benchmarks (SWE-bench, AiderBench, empirical latency, and token efficiency audits).

---

## 1. Benchmarking Scope

| Benchmark | Dataset | Target Tasks | Metric Measured | Primary Testbed |
| :--- | :--- | :--- | :--- | :--- |
| **SWE-bench Lite** | `princeton-nlp/SWE-bench_Lite` | 10 (Pilot) → 50 (Calibrated) → 300 (Full) | % Resolved (Pass/Fail) against hidden tests | Official Princeton Docker (`sweb.eval.*`) |
| **AiderBench** | Exercism Python & Polyglot | 133 Coding Exercises | Single-turn editing precision, unit test pass | Local Git repo & pytest |
| **Local Autocomplete Latency** | Keystroke Trace Simulation | 500 Completion Calls | Time-to-First-Token (TTFT), p50, p95, p99 (ms) | Local TabbyML (`http://localhost:8080`) vs Cloud |
| **Viking Context Compression** | Real Repositories (INDEX0, Django) | Full AST Token Ingestion | Input token count, byte ratio, cloud API spend | `viking://` L0/L1/L2 vs Naive Whole-File Dump |

---

## 2. Execution Options & Resource Estimates

| Tier | Task Count | Estimated Time | Estimated API Cost | Recommendation |
| :--- | :--- | :--- | :--- | :--- |
| **Tier 1: Pilot Run** | 10 SWE-bench Tasks | 45–60 mins | $10 – $20 | **(Immediate Start)**: Validates full pipeline with zero synthetic assumptions |
| **Tier 2: Latency & Viking Audit** | 500 calls + AST Index | 15 mins | **$0.00** | **(Immediate Start)**: Pure local empirical profiling |
| **Tier 3: Aider Coding Suite** | 133 Exercises | 1.5–2 hours | $15 – $30 | High-velocity code editing evaluation |
| **Tier 4: Calibrated 50-Task** | 50 SWE-bench Tasks | 3.5–5 hours | $60 – $120 | Rigorous confidence interval sample |
| **Tier 5: Full 300-Task Suite** | 300 SWE-bench Lite | 18–24 hours | $350 – $550 | Official Princeton SWE-bench leaderboard submission |

---

## 3. Immediate Setup Instructions

### Step 1: Configure `agent-canvas/config.toml`
Create `agent-canvas/config.toml` with the desired evaluation model:

```toml
[core]
workspace_base = "./workspace"

[llm]
model = "anthropic/claude-3-5-sonnet-20241022"
api_key = "ENV_VAR:ANTHROPIC_API_KEY"
temperature = 0.0

[llm.eval_claude_35_sonnet]
model = "anthropic/claude-3-5-sonnet-20241022"
api_key = "ENV_VAR:ANTHROPIC_API_KEY"
temperature = 0.0
```

### Step 2: Launch Benchmark Inference
Run inference with the desired limit (e.g. 10 instances):
```bash
cd agent-canvas
poetry run ./evaluation/benchmarks/swe_bench/scripts/run_infer.sh \
  llm.eval_claude_35_sonnet HEAD CodeActAgent 10 30 2 princeton-nlp/SWE-bench_Lite test
```

### Step 3: Run Official Docker Evaluation
Evaluate generated patches in `evaluation/evaluation_outputs`:
```bash
cd agent-canvas
./evaluation/benchmarks/swe_bench/scripts/eval_infer.sh \
  evaluation/evaluation_outputs/outputs/swe_bench/CodeActAgent/[RUN_ID]/output.jsonl
```
