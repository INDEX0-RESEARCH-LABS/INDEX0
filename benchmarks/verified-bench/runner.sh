#!/usr/bin/env bash
# INDEX0 verified-bench runner
# Runs 20 coding tasks through two modes on the same free model:
#   baseline  — single LLM call (no review loop)
#   index0    — full 4-tier review loop
# Reports pass rates honestly even if INDEX0 does not win.
#
# Usage:
#   ./benchmarks/verified-bench/runner.sh --model groq
#   ./benchmarks/verified-bench/runner.sh --model gemini
#   ./benchmarks/verified-bench/runner.sh --model groq --tasks 001,002,003
#   ./benchmarks/verified-bench/runner.sh --model groq --mode baseline
#   ./benchmarks/verified-bench/runner.sh --model groq --mode index0
#
# Requires: docker, node >= 22, python 3.11+, one free model key in .env

set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
BENCH_DIR="$ROOT/benchmarks/verified-bench"
RESULTS_DIR="$BENCH_DIR/results"
PYTHON="${DEMO_PYTHON:-$ROOT/.venv-demo/bin/python}"

# ── parse args ───────────────────────────────────────────────────────────────
MODEL=""
TASKS_FILTER=""
MODE="both"   # both | baseline | index0

while [[ $# -gt 0 ]]; do
  case "$1" in
    --model)    MODEL="$2"; shift 2 ;;
    --tasks)    TASKS_FILTER="$2"; shift 2 ;;
    --mode)     MODE="$2"; shift 2 ;;
    *) echo "unknown arg: $1" >&2; exit 1 ;;
  esac
done

[[ -n "$MODEL" ]] || { echo "Usage: $0 --model groq|gemini|openrouter" >&2; exit 1; }
[[ "$MODE" =~ ^(both|baseline|index0)$ ]] || { echo "--mode must be both|baseline|index0" >&2; exit 1; }

die() { echo "error: $*" >&2; exit 1; }

# ── environment ──────────────────────────────────────────────────────────────
[[ -f "$ROOT/.env" ]] || die "missing $ROOT/.env"
set -a; . "$ROOT/.env"; set +a
: "${LITELLM_MASTER_KEY:?LITELLM_MASTER_KEY must be set in .env}"

key_for() { case "$1" in groq) echo GROQ_API_KEY;; gemini) echo GEMINI_API_KEY;; openrouter) echo OPENROUTER_API_KEY;; claude|claude-haiku) echo AWS_PROFILE;; esac; }
KEY_VAR="$(key_for "$MODEL")"
[[ -n "${KEY_VAR:-}" && -n "${!KEY_VAR:-}" ]] || die "$MODEL needs $KEY_VAR in .env"

command -v docker >/dev/null || die "docker required"
docker info >/dev/null 2>&1 || die "docker daemon not running"
[[ -x "$PYTHON" ]] || die "python env missing: $PYTHON  (run ./demo/run-demo.sh once to create it)"

# ── port management ──────────────────────────────────────────────────────────
LITELLM_PORT=4003
SANDBOX_PORT=4005
ORCH_PORT=8001
LITELLM_URL="http://localhost:$LITELLM_PORT"
SANDBOX_URL="http://localhost:$SANDBOX_PORT"
ORCH_URL="http://localhost:$ORCH_PORT"
GATEWAY_CONTAINER=index0-litellm-bench

wait_for() {
  for _ in $(seq 1 "$3"); do
    curl -fsS -m 2 -o /dev/null "$1" 2>/dev/null && return 0
    sleep 1
  done
  die "timed out waiting for $2 at $1"
}

PIDS=()
cleanup() {
  for pid in "${PIDS[@]:-}"; do kill "$pid" 2>/dev/null || true; done
  docker rm -f "$GATEWAY_CONTAINER" >/dev/null 2>&1 || true
}
trap cleanup EXIT

# ── start services ───────────────────────────────────────────────────────────
echo "==> starting LiteLLM (model=$MODEL)"
docker rm -f "$GATEWAY_CONTAINER" >/dev/null 2>&1 || true

# Resolve Bedrock credentials for Claude routes
AWS_DOCKER_ENV=()
if [[ "$MODEL" == claude* ]]; then
  creds="$(aws --profile "${AWS_PROFILE:-index0}" configure export-credentials --format env-no-export 2>/dev/null || true)"
  [[ -n "$creds" ]] || die "Could not resolve AWS credentials. Run: aws login --profile index0"
  while IFS= read -r line; do
    [[ "$line" =~ ^(AWS_[A-Z_]+)=(.*)$ ]] && AWS_DOCKER_ENV+=(-e "${BASH_REMATCH[1]}=${BASH_REMATCH[2]}")
  done <<< "$creds"
  AWS_DOCKER_ENV+=(-e "AWS_DEFAULT_REGION=ap-southeast-2")
fi

docker run -d --rm --name "$GATEWAY_CONTAINER" \
  -p "${LITELLM_PORT}:4000" \
  -e LITELLM_MASTER_KEY="$LITELLM_MASTER_KEY" \
  -e GROQ_API_KEY="${GROQ_API_KEY:-}" \
  -e GEMINI_API_KEY="${GEMINI_API_KEY:-}" \
  -e OPENROUTER_API_KEY="${OPENROUTER_API_KEY:-}" \
  -e AWS_PROFILE="${AWS_PROFILE:-}" \
  "${AWS_DOCKER_ENV[@]}" \
  -v "$ROOT/infra/litellm/config.yaml:/app/config.yaml:ro" \
  ghcr.io/berriai/litellm:main-latest --config /app/config.yaml >/dev/null
wait_for "$LITELLM_URL/health/liveliness" "LiteLLM" 90

echo "==> building and starting sandbox-manager (provider=docker)"
( cd "$ROOT" && pnpm --filter @index0/sandbox-manager build >/dev/null 2>&1 )
( cd "$ROOT/services/sandbox-manager" && \
  SANDBOX_PROVIDER=docker \
  SANDBOX_IMAGE="${SANDBOX_IMAGE:-node:22}" \
  SANDBOX_MANAGER_PORT=$SANDBOX_PORT \
  exec node dist/index.js ) > /tmp/index0-bench-sandbox.log 2>&1 &
PIDS+=($!)
wait_for "$SANDBOX_URL/health" "sandbox-manager" 30

echo "==> starting agent-orchestrator"
( cd "$ROOT/services/agent-orchestrator" && \
  ORCHESTRATOR_SANDBOX_MANAGER_URL="$SANDBOX_URL" \
  ORCHESTRATOR_LITELLM_PROXY_URL="$LITELLM_URL" \
  ORCHESTRATOR_LITELLM_API_KEY="$LITELLM_MASTER_KEY" \
  ORCHESTRATOR_ARCHITECT_MODEL="$MODEL" \
  ORCHESTRATOR_DEVELOPER_MODEL="$MODEL" \
  ORCHESTRATOR_CRITIC_MODEL="$MODEL" \
  ORCHESTRATOR_QA_MODEL="$MODEL" \
  ORCHESTRATOR_MAX_REVIEW_ITERATIONS=5 \
  exec "$PYTHON" -m uvicorn src.main:app --host 0.0.0.0 --port $ORCH_PORT ) \
  > /tmp/index0-bench-orch.log 2>&1 &
PIDS+=($!)
wait_for "$ORCH_URL/health" "agent-orchestrator" 30

# ── collect tasks ────────────────────────────────────────────────────────────
ALL_TASKS=()
for d in "$BENCH_DIR/tasks"/*/; do
  tid="$(basename "$d")"
  if [[ -n "$TASKS_FILTER" ]]; then
    IFS=',' read -ra FILTER <<< "$TASKS_FILTER"
    matched=0
    for f in "${FILTER[@]}"; do
      [[ "$tid" == *"$f"* ]] && matched=1
    done
    [[ $matched -eq 1 ]] || continue
  fi
  ALL_TASKS+=("$tid")
done

echo "==> running ${#ALL_TASKS[@]} tasks in mode=$MODE with model=$MODEL"
mkdir -p "$RESULTS_DIR"
RUN_ID="$(date -u +%Y%m%dT%H%M%SZ)"
RUN_DIR="$RESULTS_DIR/$RUN_ID"
mkdir -p "$RUN_DIR"

# ── runner helpers ───────────────────────────────────────────────────────────

# Run one plain LLM call and return the patched file content
baseline_run() {
  local task_dir="$1" task_id="$2" src_file="$3" description="$4"
  local broken
  broken="$(cat "$task_dir/workspace/$src_file")"

  local prompt="Fix this code so all tests pass. Return ONLY the complete fixed file, no explanation, no markdown fences.

Task: $description

File ($src_file):
$broken"

  curl -sS -m 60 -X POST "$LITELLM_URL/v1/chat/completions" \
    -H "Authorization: Bearer $LITELLM_MASTER_KEY" \
    -H "Content-Type: application/json" \
    -d "$(python3 -c "import json,sys; print(json.dumps({'model':'$MODEL','messages':[{'role':'user','content':sys.argv[1]}],'max_tokens':512,'temperature':0}))" "$prompt")" \
    2>/dev/null | python3 -c "
import json,sys
d=json.load(sys.stdin)
content=d['choices'][0]['message'].get('content','')
# strip markdown fences if present
lines=content.strip().splitlines()
if lines and lines[0].startswith('\`\`\`'): lines=lines[1:]
if lines and lines[-1].startswith('\`\`\`'): lines=lines[:-1]
print('\n'.join(lines))
"
}

# Run hidden tests against a workspace, return pass/fail count
run_hidden_tests() {
  local task_dir="$1" task_json="$2"
  local cmd
  cmd="$(python3 -c "import json; print(json.load(open('$task_json'))['test_command'])")"
  if [[ "$cmd" == "python"* ]]; then
    "$PYTHON" -m pytest "$task_dir/tests/" -q --tb=no 2>&1
  else
    node --test "$task_dir/tests/"*.test.js 2>&1
  fi
}

# ── main loop ────────────────────────────────────────────────────────────────
declare -A BASELINE_PASS BASELINE_FAIL INDEX0_PASS INDEX0_FAIL

for task_id in "${ALL_TASKS[@]}"; do
  task_dir="$BENCH_DIR/tasks/$task_id"
  task_json="$task_dir/task.json"
  description="$(python3 -c "import json; print(json.load(open('$task_json'))['description'])")"
  src_file="$(python3 -c "import json; print(json.load(open('$task_json'))['file_to_fix'])")"
  lang="${src_file##*.}"

  echo
  echo "── $task_id ──────────────────────────────────────────────"

  task_run_dir="$RUN_DIR/$task_id"
  mkdir -p "$task_run_dir"

  # ── BASELINE ──────────────────────────────────────────────────────────────
  if [[ "$MODE" == "both" || "$MODE" == "baseline" ]]; then
    echo -n "  baseline  ... "
    # copy workspace to isolated temp
    baseline_ws="/tmp/bench-baseline-$task_id"
    rm -rf "$baseline_ws"
    cp -r "$task_dir/workspace" "$baseline_ws"

    fixed="$(baseline_run "$task_dir" "$task_id" "$src_file" "$description" 2>/dev/null || echo "")"
    if [[ -n "$fixed" ]]; then
      echo "$fixed" > "$baseline_ws/$src_file"
      # patch task_dir workspace for test run, then restore
      cp "$task_dir/workspace/$src_file" "/tmp/bench-orig-$task_id.$lang"
      cp "$baseline_ws/$src_file" "$task_dir/workspace/$src_file"
      result="$(run_hidden_tests "$task_dir" "$task_json" || echo "0 failed")"
      cp "/tmp/bench-orig-$task_id.$lang" "$task_dir/workspace/$src_file"
    else
      result="0 failed (no response)"
    fi

    echo "$fixed" > "$task_run_dir/baseline_fix.$lang"
    echo "$result" > "$task_run_dir/baseline_result.txt"

    if echo "$result" | grep -qP "ℹ pass [1-9]|\d+ passed" && ! echo "$result" | grep -qP "ℹ fail [1-9]|\d+ failed in"; then
      BASELINE_PASS[$task_id]=1; echo "PASS  ($result)" | head -c 80
    else
      BASELINE_FAIL[$task_id]=1; echo "FAIL  ($result)" | head -c 80
    fi
  fi

  # ── INDEX0 loop ───────────────────────────────────────────────────────────
  if [[ "$MODE" == "both" || "$MODE" == "index0" ]]; then
    echo -n "  index0    ... "
    # copy workspace to isolated location for the cycle
    index0_ws="/tmp/bench-index0-$task_id"
    rm -rf "$index0_ws"
    cp -r "$task_dir/workspace" "$index0_ws"

    cycle_response="$task_run_dir/index0_cycle.json"
    http_code=$(curl -sS -m 300 -o "$cycle_response" -w "%{http_code}" \
      -X POST "$ORCH_URL/cycles/start" \
      -H "Content-Type: application/json" \
      -d "$(python3 -c "
import json,sys
print(json.dumps({
  'taskId': '$task_id',
  'userPrompt': sys.argv[1],
  'repositoryRoot': '$index0_ws',
  'contextFiles': ['$src_file'],
  'maxIterations': 3
}))
" "$description")" 2>/dev/null || echo "000")

    if [[ "$http_code" == "200" ]]; then
      diff="$(python3 -c "import json; d=json.load(open('$cycle_response')); print(d.get('implementationDiff',''))" 2>/dev/null || echo "")"
      if [[ -n "$diff" ]]; then
        # apply diff to workspace
        echo "$diff" > "/tmp/bench-patch-$task_id.patch"
        cp "$task_dir/workspace/$src_file" "/tmp/bench-orig2-$task_id.$lang"
        (cd "$index0_ws" && patch -p1 < "/tmp/bench-patch-$task_id.patch" 2>/dev/null) || true
        cp "$index0_ws/$src_file" "$task_dir/workspace/$src_file"
        result="$(run_hidden_tests "$task_dir" "$task_json" 2>/dev/null || echo "0 failed")"
        cp "/tmp/bench-orig2-$task_id.$lang" "$task_dir/workspace/$src_file"
      else
        result="0 failed (no diff produced)"
      fi
    else
      result="0 failed (orchestrator error $http_code)"
    fi

    echo "$result" > "$task_run_dir/index0_result.txt"

    if echo "$result" | grep -qP "ℹ pass [1-9]|\d+ passed" && ! echo "$result" | grep -qP "ℹ fail [1-9]|\d+ failed in"; then
      INDEX0_PASS[$task_id]=1; echo "PASS  ($result)" | head -c 80
    else
      INDEX0_FAIL[$task_id]=1; echo "FAIL  ($result)" | head -c 80
    fi
  fi
done

# ── results summary ──────────────────────────────────────────────────────────
echo
echo "════════════════════════════════════════"
echo "  RESULTS  model=$MODEL  tasks=${#ALL_TASKS[@]}"
echo "════════════════════════════════════════"

bp=${#BASELINE_PASS[@]}; bf=${#BASELINE_FAIL[@]}
ip=${#INDEX0_PASS[@]};   ifail=${#INDEX0_FAIL[@]}
total_b=$((bp+bf)); total_i=$((ip+ifail))

if [[ "$MODE" == "both" || "$MODE" == "baseline" ]]; then
  echo "  Baseline (plain LLM):  $bp/$total_b passed"
fi
if [[ "$MODE" == "both" || "$MODE" == "index0" ]]; then
  echo "  INDEX0 (review loop):  $ip/$total_i passed"
fi
echo

# ── write JSON ───────────────────────────────────────────────────────────────
python3 - <<PY
import json, os, datetime

tasks = []
for tid in sorted(os.listdir("$RUN_DIR")):
    td = os.path.join("$RUN_DIR", tid)
    if not os.path.isdir(td): continue
    row = {"task_id": tid}
    br = os.path.join(td, "baseline_result.txt")
    ir = os.path.join(td, "index0_result.txt")
    if os.path.exists(br):
        t = open(br).read()
        row["baseline_pass"] = bool(__import__("re").search(r"passed|# pass [1-9]", t))
    if os.path.exists(ir):
        t = open(ir).read()
        row["index0_pass"] = bool(__import__("re").search(r"passed|# pass [1-9]", t))
    tasks.append(row)

bp = sum(1 for t in tasks if t.get("baseline_pass"))
ip = sum(1 for t in tasks if t.get("index0_pass"))
n = len(tasks)

out = {
    "run_id": "$RUN_ID",
    "date": datetime.datetime.utcnow().isoformat() + "Z",
    "model": "$MODEL",
    "mode": "$MODE",
    "tasks_total": n,
    "baseline_pass": bp,
    "baseline_fail": n - bp,
    "index0_pass": ip,
    "index0_fail": n - ip,
    "tasks": tasks
}
with open("$RUN_DIR/summary.json", "w") as f:
    json.dump(out, f, indent=2)
print(json.dumps(out, indent=2))
PY

# ── write RESULTS.md ─────────────────────────────────────────────────────────
python3 - <<'PYMD'
import json, os, datetime

run_dir = os.environ.get("RUN_DIR_VAR", "")
summary_path = os.path.join(run_dir, "summary.json") if run_dir else ""

# find latest summary
bench_results = "/home/darion-dev/Dev/Incubator/INDEX0/benchmarks/verified-bench/results"
runs = sorted([d for d in os.listdir(bench_results) if os.path.isdir(os.path.join(bench_results,d))])
if not runs:
    exit(0)
latest = runs[-1]
s = json.load(open(os.path.join(bench_results, latest, "summary.json")))

lines = [
    "# INDEX0 Benchmark Results",
    "",
    f"**Run:** {s['run_id']}  ",
    f"**Model:** `{s['model']}`  ",
    f"**Tasks:** {s['tasks_total']}  ",
    "",
    "## Summary",
    "",
    "| Mode | Passed | Failed | Pass rate |",
    "|---|---|---|---|",
]
n = s["tasks_total"]
if s.get("baseline_pass") is not None:
    bp = s["baseline_pass"]; bf = s["baseline_fail"]
    pct = round(bp/n*100) if n else 0
    lines.append(f"| Baseline (plain LLM one-shot) | {bp} | {bf} | {pct}% |")
if s.get("index0_pass") is not None:
    ip = s["index0_pass"]; ifail = s["index0_fail"]
    pct = round(ip/n*100) if n else 0
    lines.append(f"| INDEX0 (4-tier review loop)   | {ip} | {ifail} | {pct}% |")

lines += [
    "",
    "## Per-task results",
    "",
    "| Task | Baseline | INDEX0 |",
    "|---|---|---|",
]
for t in s["tasks"]:
    b = "✅" if t.get("baseline_pass") else ("❌" if "baseline_pass" in t else "—")
    i = "✅" if t.get("index0_pass") else ("❌" if "index0_pass" in t else "—")
    lines.append(f"| `{t['task_id']}` | {b} | {i} |")

lines += [
    "",
    "## Reproduce",
    "",
    "```bash",
    f"./benchmarks/verified-bench/runner.sh --model {s['model']}",
    "```",
    "",
    f"Results stored in `benchmarks/verified-bench/results/{latest}/`",
    "",
    "> Reported honestly. INDEX0 does not always win.",
]

out_path = "/home/darion-dev/Dev/Incubator/INDEX0/benchmarks/verified-bench/RESULTS.md"
with open(out_path, "w") as f:
    f.write("\n".join(lines) + "\n")
print(f"wrote {out_path}")
PYMD

echo
echo "run artifacts: $RUN_DIR"
echo "RESULTS.md: $BENCH_DIR/RESULTS.md"
