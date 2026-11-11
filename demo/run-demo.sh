#!/usr/bin/env bash
# INDEX0 end-to-end demo: one broken repo, one full review cycle, real test evidence.
#
#   ./demo/run-demo.sh              # run a cycle and save the artifacts
#   ./demo/run-demo.sh --no-start   # reuse services already running on 4001/8000 (+ any LiteLLM)
#   DEMO_MODEL=gemini ./demo/run-demo.sh
#
# Requires: docker, node >= 22, and one free model key in .env (no Azure, no spend).
# DEMO_MODEL picks the LiteLLM route: auto (default) | groq | gemini | openrouter.
set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
WORKSPACE="${DEMO_WORKSPACE:-$ROOT/demo/workspace}"
PYTHON="${DEMO_PYTHON:-$ROOT/.venv-demo/bin/python}"
START_SERVICES=1
[[ "${1:-}" == "--no-start" ]] && START_SERVICES=0

DEMO_MODEL="${DEMO_MODEL:-auto}"
# The demo runs its own gateway on 4002 so it never fights a dev container on 4000.
LITELLM_URL="${LITELLM_URL:-http://localhost:4002}"
SANDBOX_URL="${SANDBOX_URL:-http://localhost:4001}"
ORCHESTRATOR_URL="${ORCHESTRATOR_URL:-http://localhost:8000}"
GATEWAY_CONTAINER=index0-litellm-demo

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

# Which free route to use. Each needs one key and no payment method.
# "auto" picks the first route whose key is present, so a typo in DEMO_MODEL
# cannot silently kill the demo.
key_for() {
  case "$1" in
    groq) echo GROQ_API_KEY ;;
    gemini) echo GEMINI_API_KEY ;;
    openrouter) echo OPENROUTER_API_KEY ;;
    claude|claude-haiku) echo AWS_PROFILE ;;
  esac
}

if [[ "$DEMO_MODEL" == auto ]]; then
  DEMO_MODEL=""
  for candidate in claude groq gemini openrouter; do
    kv="$(key_for "$candidate")"
    if [[ -n "${!kv:-}" ]]; then DEMO_MODEL="$candidate"; break; fi
  done
  [[ -n "$DEMO_MODEL" ]] || die "no model route available. Add one key to $ROOT/.env:
  AWS_PROFILE=index0        (uses ~/.aws credentials — Claude Sonnet 4.6 via Bedrock)
  GROQ_API_KEY=...          https://console.groq.com/keys      (free, no card)
  GEMINI_API_KEY=...        https://aistudio.google.com/apikey (free, no card)
  OPENROUTER_API_KEY=...    https://openrouter.ai/keys"
  echo "    using route: $DEMO_MODEL"
fi

case "$DEMO_MODEL" in
  claude)       KEY_VAR=AWS_PROFILE;        KEY_URL="aws login --profile index0" ;;
  claude-haiku) KEY_VAR=AWS_PROFILE;        KEY_URL="aws login --profile index0" ;;
  groq)         KEY_VAR=GROQ_API_KEY;       KEY_URL="https://console.groq.com/keys" ;;
  gemini)       KEY_VAR=GEMINI_API_KEY;     KEY_URL="https://aistudio.google.com/apikey" ;;
  openrouter)   KEY_VAR=OPENROUTER_API_KEY; KEY_URL="https://openrouter.ai/keys" ;;
  *) die "DEMO_MODEL=$DEMO_MODEL is not a route in infra/litellm/config.yaml (claude|claude-haiku|groq|gemini|openrouter|auto)" ;;
esac
[[ -n "${!KEY_VAR:-}" ]] || die "DEMO_MODEL=$DEMO_MODEL needs $KEY_VAR in $ROOT/.env — set it with: $KEY_URL"

# Every agent uses the chosen route; no Azure aliases left in the demo path.
export ORCHESTRATOR_ARCHITECT_MODEL="$DEMO_MODEL"
export ORCHESTRATOR_DEVELOPER_MODEL="$DEMO_MODEL"
export ORCHESTRATOR_CRITIC_MODEL="$DEMO_MODEL"
export ORCHESTRATOR_QA_MODEL="$DEMO_MODEL"

probe_model() { # fail before the cycle, not in the middle of it
  local body code
  body="$(curl -sS -m 45 -o - -w '\n%{http_code}' "$LITELLM_URL/v1/chat/completions" \
    -H "Authorization: Bearer $LITELLM_MASTER_KEY" -H 'Content-Type: application/json' \
    -d "{\"model\":\"$DEMO_MODEL\",\"messages\":[{\"role\":\"user\",\"content\":\"reply with the single word ok\"}],\"max_tokens\":8}")"
  code="$(tail -n1 <<<"$body")"
  if [[ "$code" != "200" ]]; then
    echo "--- gateway response (HTTP $code) ---" >&2
    sed '$d' <<<"$body" | head -c 800 >&2
    echo >&2
    die "route '$DEMO_MODEL' is not answering. Check $KEY_VAR in .env (free key: $KEY_URL)"
  fi
  echo "    model $DEMO_MODEL reachable: $(sed '$d' <<<"$body" | "$PYTHON" -c 'import json,sys; print((json.load(sys.stdin)["choices"][0]["message"].get("content") or "no text (reasoning model)").strip()[:40])')"
}

command -v docker >/dev/null || die "docker is required"
docker info >/dev/null 2>&1 || die "docker daemon is not running"
command -v node >/dev/null || die "node >= 22 is required"
[[ "$(node -p 'process.versions.node.split(".")[0]')" -ge 22 ]] || die "node >= 22 is required (found $(node -v))"
if [[ ! -x "$PYTHON" ]] && [[ -z "${DEMO_PYTHON:-}" ]] && command -v uv >/dev/null; then
  echo "==> creating python env at $ROOT/.venv-demo (first run only)"
  uv venv --python 3.12 "$ROOT/.venv-demo" >/dev/null
  uv pip install --python "$PYTHON" -e "$ROOT/services/agent-orchestrator[dev]" >/dev/null
fi
[[ -x "$PYTHON" ]] || die "python env missing: $PYTHON (create it: uv venv --python 3.12 $ROOT/.venv-demo && uv pip install --python $PYTHON -e '$ROOT/services/agent-orchestrator[dev]')"

PIDS=()
cleanup() {
  for pid in "${PIDS[@]:-}"; do kill "$pid" 2>/dev/null || true; done
  [[ "$START_SERVICES" == 1 ]] && docker rm -f "$GATEWAY_CONTAINER" >/dev/null 2>&1 || true
}
trap cleanup EXIT

if [[ "$START_SERVICES" == 1 ]]; then
  for port in 4001 8000 "$(sed -E 's#.*:([0-9]+)$#\1#' <<<"$LITELLM_URL")"; do
    if ss -ltnH "sport = :$port" 2>/dev/null | grep -q .; then
      die "port $port is already in use — stop that process first (or run with --no-start)"
    fi
  done

  echo "==> starting LiteLLM gateway (route=$DEMO_MODEL, no database needed)"
  docker rm -f "$GATEWAY_CONTAINER" >/dev/null 2>&1 || true

  # For Bedrock routes, resolve credentials from the AWS profile and pass them
  # as env vars into the LiteLLM container (containers can't read ~/.aws directly).
  AWS_DOCKER_ENV=()
  if [[ "$DEMO_MODEL" == claude* ]]; then
    creds="$(aws --profile "${AWS_PROFILE:-index0}" configure export-credentials --format env-no-export 2>/dev/null || true)"
    if [[ -n "$creds" ]]; then
      while IFS= read -r line; do
        [[ "$line" =~ ^(AWS_[A-Z_]+)=(.*)$ ]] && AWS_DOCKER_ENV+=(-e "${BASH_REMATCH[1]}=${BASH_REMATCH[2]}")
      done <<< "$creds"
      AWS_DOCKER_ENV+=(-e "AWS_DEFAULT_REGION=ap-southeast-2")
    else
      die "Could not resolve AWS credentials for profile ${AWS_PROFILE:-index0}. Run: aws login --profile index0"
    fi
  fi

  docker run -d --rm --name "$GATEWAY_CONTAINER" \
    -p "$(sed -E 's#.*:([0-9]+)$#\1#' <<<"$LITELLM_URL"):4000" \
    -e LITELLM_MASTER_KEY="$LITELLM_MASTER_KEY" \
    -e GROQ_API_KEY="${GROQ_API_KEY:-}" \
    -e GEMINI_API_KEY="${GEMINI_API_KEY:-}" \
    -e OPENROUTER_API_KEY="${OPENROUTER_API_KEY:-}" \
    -e AWS_PROFILE="${AWS_PROFILE:-}" \
    "${AWS_DOCKER_ENV[@]}" \
    -v "$ROOT/infra/litellm/config.yaml:/app/config.yaml:ro" \
    ghcr.io/berriai/litellm:main-latest --config /app/config.yaml >/dev/null
  wait_for "$LITELLM_URL/health/liveliness" "LiteLLM" 90
  echo -n "    probing the model route... "
  probe_model

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
  echo -n "    probing the model route... "
  probe_model
fi

RUN_DIR="$ROOT/demo/runs/$(date -u +%Y%m%dT%H%M%SZ)"
mkdir -p "$RUN_DIR"

# The default fixture is the divide-by-zero repo. Point the demo at another
# dependency-free workspace with DEMO_WORKSPACE, DEMO_TASK_ID, DEMO_PROMPT and
# DEMO_CONTEXT_FILES (comma separated).
DEMO_ROOT="$WORKSPACE" "$PYTHON" "$ROOT/demo/request-template.py" > "$RUN_DIR/request.json"

echo "==> running the review cycle (this makes 4-8 model calls; ~20-60s)"
curl -fsS -m 900 -X POST "$ORCHESTRATOR_URL/cycles/start" \
  -H 'Content-Type: application/json' \
  --data-binary "@$RUN_DIR/request.json" \
  -o "$RUN_DIR/cycle.json" \
  -w 'cycle finished in %{time_total}s\n'

"$PYTHON" - "$RUN_DIR/cycle.json" "$DEMO_MODEL" <<'PY' | tee "$RUN_DIR/summary.txt"
import json, sys

d = json.load(open(sys.argv[1]))
q = d.get("qaResults") or {}
v = d.get("criticVerdict") or {}
print(f"model        : {sys.argv[2]}")
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
