#!/usr/bin/env bash
# INDEX0 end-to-end demo: one broken repo, one full review cycle, real test evidence.
#
#   ./demo/run-demo.sh              # run a cycle and save the artifacts
#   ./demo/run-demo.sh --no-start   # reuse services already running on 4000/4001/8000
#
# Requires: docker, node >= 22, and a reachable LiteLLM proxy with a real model.
set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
WORKSPACE="${DEMO_WORKSPACE:-$ROOT/demo/workspace}"
PYTHON="${DEMO_PYTHON:-/tmp/i0venv/bin/python}"
START_SERVICES=1
[[ "${1:-}" == "--no-start" ]] && START_SERVICES=0

LITELLM_URL="${LITELLM_URL:-http://localhost:4000}"
SANDBOX_URL="${SANDBOX_URL:-http://localhost:4001}"
ORCHESTRATOR_URL="${ORCHESTRATOR_URL:-http://localhost:8000}"

die() { echo "error: $*" >&2; exit 1; }
wait_for() { # url, label, seconds
  for _ in $(seq 1 "$3"); do
    curl -fsS -m 2 -o /dev/null "$1" 2>/dev/null && return 0
    sleep 1
  done
  die "timed out waiting for $2 at $1"
}

[[ -f "$ROOT/.env" ]] || die "missing $ROOT/.env"
set -a; . "$ROOT/.env"; set +a
: "${LITELLM_MASTER_KEY:?LITELLM_MASTER_KEY must be set in .env}"

command -v docker >/dev/null || die "docker is required"
docker info >/dev/null 2>&1 || die "docker daemon is not running"
command -v node >/dev/null || die "node >= 22 is required"
[[ "$(node -p 'process.versions.node.split(".")[0]')" -ge 22 ]] || die "node >= 22 is required (found $(node -v))"
[[ -x "$PYTHON" ]] || die "python env missing: $PYTHON (create it: uv venv --python 3.12 /tmp/i0venv && uv pip install --python /tmp/i0venv/bin/python -e 'services/agent-orchestrator[dev]')"

PIDS=()
cleanup() { for pid in "${PIDS[@]:-}"; do kill "$pid" 2>/dev/null || true; done; }
trap cleanup EXIT

if [[ "$START_SERVICES" == 1 ]]; then
  for port in 4001 8000; do
    if ss -ltnH "sport = :$port" 2>/dev/null | grep -q .; then
      die "port $port is already in use — stop that process first (or run with --no-start)"
    fi
  done

  echo "==> bringing up postgres + litellm"
  docker start index0-postgres index0-litellm >/dev/null 2>&1 || true
  wait_for "$LITELLM_URL/health/liveliness" "LiteLLM" 90

  echo "==> building sandbox-manager"
  ( cd "$ROOT" && pnpm --filter @index0/sandbox-manager build >/dev/null )

  echo "==> starting sandbox-manager (provider=docker, image=node:22)"
  ( cd "$ROOT/services/sandbox-manager" && \
    SANDBOX_PROVIDER=docker \
    SANDBOX_IMAGE="${SANDBOX_IMAGE:-node:22}" \
    SANDBOX_MANAGER_PORT=4001 \
    exec node dist/index.js ) > /tmp/index0-sandbox.log 2>&1 &
  PIDS+=($!)
  wait_for "$SANDBOX_URL/health" "sandbox-manager" 30

  echo "==> starting agent-orchestrator"
  ( cd "$ROOT/services/agent-orchestrator" && \
    ORCHESTRATOR_SANDBOX_MANAGER_URL="$SANDBOX_URL" \
    ORCHESTRATOR_LITELLM_PROXY_URL="$LITELLM_URL" \
    ORCHESTRATOR_LITELLM_API_KEY="$LITELLM_MASTER_KEY" \
    ORCHESTRATOR_MAX_REVIEW_ITERATIONS=5 \
    exec "$PYTHON" -m uvicorn src.main:app --host 0.0.0.0 --port 8000 ) > /tmp/index0-orchestrator.log 2>&1 &
  PIDS+=($!)
  wait_for "$ORCHESTRATOR_URL/health" "agent-orchestrator" 30
else
  wait_for "$LITELLM_URL/health/liveliness" "LiteLLM" 5
  wait_for "$SANDBOX_URL/health" "sandbox-manager" 5
  wait_for "$ORCHESTRATOR_URL/health" "agent-orchestrator" 5
fi

RUN_DIR="$ROOT/demo/runs/$(date -u +%Y%m%dT%H%M%SZ)"
mkdir -p "$RUN_DIR"

cat > "$RUN_DIR/request.json" <<JSON
{
  "taskId": "demo-divide-zero",
  "userPrompt": "src/math.js exports divide(numerator, denominator), which returns Infinity when the denominator is 0. Make divide throw a RangeError with the message 'division by zero' when the denominator is 0. Keep average() working exactly as it is.",
  "repositoryRoot": "$WORKSPACE",
  "contextFiles": ["src/math.js", "test/math.test.js"],
  "maxIterations": 5
}
JSON

echo "==> running the review cycle (this makes 4-8 model calls; ~20-60s)"
curl -fsS -m 900 -X POST "$ORCHESTRATOR_URL/cycles/start" \
  -H 'Content-Type: application/json' \
  --data-binary "@$RUN_DIR/request.json" \
  -o "$RUN_DIR/cycle.json" \
  -w 'cycle finished in %{time_total}s\n'

"$PYTHON" - "$RUN_DIR/cycle.json" <<'PY' | tee "$RUN_DIR/summary.txt"
import json, sys

d = json.load(open(sys.argv[1]))
q = d.get("qaResults") or {}
v = d.get("criticVerdict") or {}
print(f"status       : {d.get('status')}")
print(f"iterations   : {d.get('iteration')}")
print(f"critic       : {v.get('decision')}")
print(f"qa passed    : {q.get('passed')}")
print(f"tests        : {q.get('tests_passed')} passed / {q.get('tests_failed')} failed in {q.get('duration_ms')} ms")
print(f"sandbox      : {q.get('sandboxMode')} (exit {q.get('exitCode')})")
print(f"files        : {', '.join(q.get('candidateFiles') or [])}")
print("history      :")
for h in d.get("history", []):
    detail = h.get("decision") or h.get("status") or ""
    print(f"  {h.get('role'):<10} {h.get('action'):<16} {detail}")
PY

"$PYTHON" - "$RUN_DIR/cycle.json" "$RUN_DIR/candidate.patch" <<'PY'
import json, sys
d = json.load(open(sys.argv[1]))
open(sys.argv[2], "w").write(d.get("implementationDiff") or "")
PY

echo
echo "artifacts: $RUN_DIR"
if [[ "$(grep -c 'qa passed    : True' "$RUN_DIR/summary.txt" || true)" != "1" ]]; then
  echo "RESULT: FAILED — the candidate did not pass the suite. This is the honest outcome; show it."
  exit 1
fi
echo "RESULT: VERIFIED — the loop produced a fix and the sandbox proved it."
