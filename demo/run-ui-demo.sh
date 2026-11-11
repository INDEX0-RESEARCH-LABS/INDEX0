#!/usr/bin/env bash
# INDEX0 UI Demo — starts the full stack + opens the web workbench in a browser.
#
# Usage:
#   ./demo/run-ui-demo.sh
#   DEMO_MODEL=groq ./demo/run-ui-demo.sh   # use Groq instead of Claude
#
# What it starts:
#   1. LiteLLM gateway (model route)
#   2. Sandbox manager (Docker provider)
#   3. Agent orchestrator (FastAPI, port 8000)
#   4. Vite dev server for the web IDE (port 3000)
#   5. Opens http://localhost:3000 in your browser

set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"

# ── Auto-detect node 22+ ──────────────────────────────────────────────────────
_ensure_node22() {
  local cur; cur="$(node -p 'process.versions.node.split(".")[0]' 2>/dev/null || echo 0)"
  [[ "$cur" -ge 22 ]] && return 0
  local mise_node="$HOME/.local/share/mise/installs/node/26.10.0/bin"
  [[ -d "$mise_node" ]] && { export PATH="$mise_node:$PATH"; return 0; }
  local nvm="${NVM_DIR:-$HOME/.config/nvm}"
  local best; best=$(ls "$nvm/versions/node/" 2>/dev/null | sort -V | awk -F'v' '$2+0>=22{v=$2} END{if(v)print "v"v}')
  [[ -n "$best" ]] && { export PATH="$nvm/versions/node/$best/bin:$PATH"; return 0; }
  return 1
}
_ensure_node22 || true
[[ ":$PATH:" != *":$HOME/.local/share/mise/shims:"* ]] && export PATH="$HOME/.local/share/mise/shims:$PATH"

PYTHON="${DEMO_PYTHON:-$ROOT/.venv-demo/bin/python}"
DEMO_MODEL="${DEMO_MODEL:-auto}"
LITELLM_URL="http://localhost:4002"
SANDBOX_URL="http://localhost:4001"
ORCH_URL="http://localhost:8000"
WEB_PORT=3000
GATEWAY_CONTAINER=index0-litellm-ui-demo

die() { echo "error: $*" >&2; exit 1; }
info() { echo "==> $*"; }

wait_for() {
  for _ in $(seq 1 "$3"); do
    curl -fsS -m 2 -o /dev/null "$1" 2>/dev/null && return 0
    sleep 1
  done
  die "timed out waiting for $2 at $1"
}

# ── Load .env ─────────────────────────────────────────────────────────────────
[[ -f "$ROOT/.env" ]] || die "missing .env — run ./quick-start.sh first"
set -a; . "$ROOT/.env"; set +a
: "${LITELLM_MASTER_KEY:?LITELLM_MASTER_KEY must be set in .env}"

# ── Model selection ────────────────────────────────────────────────────────────
key_for() { case "$1" in groq) echo GROQ_API_KEY;; gemini) echo GEMINI_API_KEY;; openrouter) echo OPENROUTER_API_KEY;; claude|claude-haiku) echo AWS_PROFILE;; esac; }

if [[ "$DEMO_MODEL" == auto ]]; then
  for candidate in claude groq gemini openrouter; do
    kv="$(key_for "$candidate")"; [[ -n "${!kv:-}" ]] && { DEMO_MODEL="$candidate"; break; }
  done
  [[ -n "$DEMO_MODEL" ]] || die "No model key found. Add AWS_PROFILE=index0 or GROQ_API_KEY to .env"
fi

case "$DEMO_MODEL" in
  claude|claude-haiku) KEY_VAR=AWS_PROFILE ;;
  groq)       KEY_VAR=GROQ_API_KEY ;;
  gemini)     KEY_VAR=GEMINI_API_KEY ;;
  openrouter) KEY_VAR=OPENROUTER_API_KEY ;;
  *) die "Unknown model: $DEMO_MODEL" ;;
esac
[[ -n "${!KEY_VAR:-}" ]] || die "$DEMO_MODEL needs $KEY_VAR in .env"

# ── Checks ────────────────────────────────────────────────────────────────────
command -v docker >/dev/null || die "docker required"
docker info >/dev/null 2>&1 || die "docker daemon not running"
[[ -x "$PYTHON" ]] || die "python env missing — run ./demo/run-demo.sh once first to create it"
pnpm -v >/dev/null 2>&1 || die "pnpm not found"

for port in 4001 4002 8000 $WEB_PORT; do
  ss -ltnH "sport = :$port" 2>/dev/null | grep -q . && die "port $port already in use"
done

# ── Cleanup ───────────────────────────────────────────────────────────────────
PIDS=()
cleanup() {
  echo; echo "Shutting down..."
  for pid in "${PIDS[@]:-}"; do kill "$pid" 2>/dev/null || true; done
  docker rm -f "$GATEWAY_CONTAINER" >/dev/null 2>&1 || true
}
trap cleanup EXIT INT TERM

# ── LiteLLM ───────────────────────────────────────────────────────────────────
info "Starting LiteLLM (model=$DEMO_MODEL)"
docker rm -f "$GATEWAY_CONTAINER" >/dev/null 2>&1 || true

AWS_DOCKER_ENV=()
if [[ "$DEMO_MODEL" == claude* ]]; then
  creds="$(aws --profile "${AWS_PROFILE:-index0}" configure export-credentials --format env-no-export 2>/dev/null || true)"
  [[ -n "$creds" ]] || die "AWS credentials expired. Run: aws login --profile index0"
  while IFS= read -r line; do
    [[ "$line" =~ ^(AWS_[A-Z_]+)=(.*)$ ]] && AWS_DOCKER_ENV+=(-e "${BASH_REMATCH[1]}=${BASH_REMATCH[2]}")
  done <<< "$creds"
  AWS_DOCKER_ENV+=(-e "AWS_DEFAULT_REGION=ap-southeast-2")
fi

docker run -d --rm --name "$GATEWAY_CONTAINER" \
  -p "4002:4000" \
  -e LITELLM_MASTER_KEY="$LITELLM_MASTER_KEY" \
  -e GROQ_API_KEY="${GROQ_API_KEY:-}" \
  -e GEMINI_API_KEY="${GEMINI_API_KEY:-}" \
  -e OPENROUTER_API_KEY="${OPENROUTER_API_KEY:-}" \
  "${AWS_DOCKER_ENV[@]}" \
  -v "$ROOT/infra/litellm/config.yaml:/app/config.yaml:ro" \
  ghcr.io/berriai/litellm:main-latest --config /app/config.yaml >/dev/null
wait_for "$LITELLM_URL/health/liveliness" "LiteLLM" 90

# ── Sandbox manager ───────────────────────────────────────────────────────────
info "Building sandbox-manager"
( cd "$ROOT" && pnpm --filter @index0/sandbox-manager build >/dev/null 2>&1 )

info "Starting sandbox-manager (provider=docker)"
( cd "$ROOT/services/sandbox-manager" && \
  SANDBOX_PROVIDER=docker \
  SANDBOX_IMAGE="node:22" \
  SANDBOX_MANAGER_PORT=4001 \
  exec node dist/index.js ) > /tmp/index0-ui-sandbox.log 2>&1 &
PIDS+=($!)
wait_for "$SANDBOX_URL/health" "sandbox-manager" 30

# ── Orchestrator ──────────────────────────────────────────────────────────────
info "Starting agent-orchestrator"
( cd "$ROOT/services/agent-orchestrator" && \
  ORCHESTRATOR_SANDBOX_MANAGER_URL="$SANDBOX_URL" \
  ORCHESTRATOR_LITELLM_PROXY_URL="$LITELLM_URL" \
  ORCHESTRATOR_LITELLM_API_KEY="$LITELLM_MASTER_KEY" \
  ORCHESTRATOR_ARCHITECT_MODEL="$DEMO_MODEL" \
  ORCHESTRATOR_DEVELOPER_MODEL="$DEMO_MODEL" \
  ORCHESTRATOR_CRITIC_MODEL="$DEMO_MODEL" \
  ORCHESTRATOR_QA_MODEL="$DEMO_MODEL" \
  ORCHESTRATOR_MAX_REVIEW_ITERATIONS=5 \
  exec "$PYTHON" -m uvicorn src.main:app --host 0.0.0.0 --port 8000 ) \
  > /tmp/index0-ui-orch.log 2>&1 &
PIDS+=($!)
wait_for "$ORCH_URL/health" "agent-orchestrator" 30

# ── Web IDE ───────────────────────────────────────────────────────────────────
info "Starting web IDE (Vite dev server on port $WEB_PORT)"
( cd "$ROOT/apps/ide/web" && \
  VITE_ORCHESTRATOR_URL="$ORCH_URL" \
  exec pnpm vite --port $WEB_PORT --host 0.0.0.0 ) \
  > /tmp/index0-ui-web.log 2>&1 &
PIDS+=($!)
wait_for "http://localhost:$WEB_PORT" "web IDE" 30

# ── Open browser ──────────────────────────────────────────────────────────────
URL="http://localhost:$WEB_PORT"
info "Opening $URL"
if command -v xdg-open >/dev/null; then
  xdg-open "$URL" 2>/dev/null &
elif command -v open >/dev/null; then
  open "$URL" &
else
  echo "Open in your browser: $URL"
fi

echo
echo "════════════════════════════════════════════════════════"
echo "  INDEX0 Web Workbench is running"
echo ""
echo "  URL:         $URL"
echo "  Model:       $DEMO_MODEL"
echo "  Orchestrator: $ORCH_URL"
echo "  Workspace:   demo/workspace (broken divide function)"
echo ""
echo "  Try typing in the agent panel:"
echo "  'Fix divide(a,b) to throw RangeError when b is 0'"
echo ""
echo "  Press Ctrl+C to stop all services."
echo "════════════════════════════════════════════════════════"

# Wait until killed
wait "${PIDS[0]}" 2>/dev/null || true
