#!/usr/bin/env bash
# INDEX0 quick-start — from zero to a proven demo in one command.
#
# Usage:
#   ./quick-start.sh                  # auto-picks model from credentials found
#   DEMO_MODEL=claude ./quick-start.sh  # Claude Sonnet 4.6 via AWS Bedrock
#   DEMO_MODEL=groq   ./quick-start.sh  # Groq free tier
#   DEMO_MODEL=gemini ./quick-start.sh  # Google AI Studio free tier
#
# What this does:
#   1. Checks Docker and node >= 22
#   2. Detects or prompts for one model credential
#   3. Creates .env if absent
#   4. Creates Python venv if absent
#   5. Runs ./demo/run-demo.sh
#   6. Prints the result and artifact path

set -euo pipefail
ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$ROOT"

# ── colours ──────────────────────────────────────────────────────────────────
RED='\033[0;31m'; GREEN='\033[0;32m'; YELLOW='\033[1;33m'
BOLD='\033[1m'; RESET='\033[0m'

info()  { echo -e "${BOLD}==> $*${RESET}"; }
ok()    { echo -e "${GREEN}✔  $*${RESET}"; }
warn()  { echo -e "${YELLOW}⚠  $*${RESET}"; }
die()   { echo -e "${RED}✖  $*${RESET}" >&2; exit 1; }

echo
echo -e "${BOLD}INDEX0 — Quick Start${RESET}"
echo -e "People Over Tools. Work Verified. Time to Unplug."
echo

# ── 1. Docker ────────────────────────────────────────────────────────────────
info "Checking Docker"
command -v docker >/dev/null || die "Docker is not installed. Install from https://docs.docker.com/get-docker/"
docker info >/dev/null 2>&1   || die "Docker daemon is not running. Start Docker Desktop or: sudo systemctl start docker"
ok "Docker is running ($(docker info --format '{{.ServerVersion}}' 2>/dev/null))"

# ── 2. Node >= 22 ────────────────────────────────────────────────────────────
info "Checking Node.js"
# Try mise-managed node 26 first
MISE_NODE="$HOME/.local/share/mise/installs/node/26.10.0/bin/node"
if [[ -x "$MISE_NODE" ]]; then
  export PATH="$(dirname "$MISE_NODE"):$PATH"
fi

if ! command -v node >/dev/null; then
  die "Node.js is not installed. Install node >= 22 from https://nodejs.org or via mise: mise install node@26"
fi

NODE_MAJOR="$(node -p 'process.versions.node.split(".")[0]')"
if [[ "$NODE_MAJOR" -lt 22 ]]; then
  die "Node.js $NODE_MAJOR found but >= 22 required. Install via mise: mise install node@26 && mise use node@26"
fi
ok "Node.js $(node -v)"

# ── 3. pnpm ───────────────────────────────────────────────────────────────────
info "Checking pnpm"
if ! command -v pnpm >/dev/null; then
  die "pnpm not found. Install: npm install -g pnpm@12"
fi
ok "pnpm $(pnpm -v)"

# ── 4. .env ───────────────────────────────────────────────────────────────────
info "Checking .env"
if [[ ! -f "$ROOT/.env" ]]; then
  warn ".env not found — creating from .env.example"
  cp "$ROOT/.env.example" "$ROOT/.env"
  # Set a random LITELLM_MASTER_KEY if not set
  RANDOM_KEY="sk-index0-$(openssl rand -hex 12 2>/dev/null || head -c 12 /dev/urandom | xxd -p)"
  sed -i "s|^LITELLM_MASTER_KEY=.*|LITELLM_MASTER_KEY=$RANDOM_KEY|" "$ROOT/.env"
  ok "Created .env with generated LITELLM_MASTER_KEY"
fi

# Load .env
set -a; . "$ROOT/.env"; set +a

# Ensure LITELLM_MASTER_KEY is set
if [[ -z "${LITELLM_MASTER_KEY:-}" ]]; then
  RANDOM_KEY="sk-index0-$(openssl rand -hex 12 2>/dev/null || echo "demo-key-$$")"
  echo "LITELLM_MASTER_KEY=$RANDOM_KEY" >> "$ROOT/.env"
  export LITELLM_MASTER_KEY="$RANDOM_KEY"
  ok "Generated LITELLM_MASTER_KEY"
fi

# ── 5. Model selection ────────────────────────────────────────────────────────
info "Detecting model credentials"

DEMO_MODEL="${DEMO_MODEL:-}"

# Auto-detect: check credentials in priority order
if [[ -z "$DEMO_MODEL" ]]; then
  # Claude via AWS Bedrock (best quality)
  if [[ -n "${AWS_PROFILE:-}" ]] && aws --profile "${AWS_PROFILE}" sts get-caller-identity >/dev/null 2>&1; then
    DEMO_MODEL="claude"
    ok "Found AWS credentials (profile: $AWS_PROFILE) → will use Claude Sonnet 4.6 via Bedrock"
  elif aws --profile "index0" sts get-caller-identity >/dev/null 2>&1; then
    DEMO_MODEL="claude"
    export AWS_PROFILE="index0"
    echo "AWS_PROFILE=index0" >> "$ROOT/.env" 2>/dev/null || true
    ok "Found AWS profile 'index0' → will use Claude Sonnet 4.6 via Bedrock"
  elif [[ -n "${GROQ_API_KEY:-}" ]]; then
    DEMO_MODEL="groq"
    ok "Found GROQ_API_KEY → will use Groq free tier"
  elif [[ -n "${GEMINI_API_KEY:-}" ]]; then
    DEMO_MODEL="gemini"
    ok "Found GEMINI_API_KEY → will use Google AI Studio free tier"
  elif [[ -n "${OPENROUTER_API_KEY:-}" ]]; then
    DEMO_MODEL="openrouter"
    ok "Found OPENROUTER_API_KEY → will use OpenRouter free tier"
  fi
fi

# If still no model, prompt
if [[ -z "$DEMO_MODEL" ]]; then
  echo
  echo -e "${BOLD}No model credentials found. Choose one:${RESET}"
  echo "  1) Claude Sonnet 4.6 via AWS Bedrock  (requires: aws login --profile index0)"
  echo "  2) Groq free tier                      (requires: GROQ_API_KEY from https://console.groq.com/keys)"
  echo "  3) Google Gemini free tier             (requires: GEMINI_API_KEY from https://aistudio.google.com/apikey)"
  echo
  read -rp "Choice [1/2/3]: " CHOICE
  case "$CHOICE" in
    1)
      echo "Run: aws login --profile index0"
      echo "Then re-run: ./quick-start.sh"
      exit 0
      ;;
    2)
      read -rp "Paste your GROQ_API_KEY: " GROQ_KEY
      [[ -n "$GROQ_KEY" ]] || die "No key provided"
      echo "GROQ_API_KEY=$GROQ_KEY" >> "$ROOT/.env"
      export GROQ_API_KEY="$GROQ_KEY"
      DEMO_MODEL="groq"
      ok "Saved GROQ_API_KEY to .env"
      ;;
    3)
      read -rp "Paste your GEMINI_API_KEY: " GEMINI_KEY
      [[ -n "$GEMINI_KEY" ]] || die "No key provided"
      echo "GEMINI_API_KEY=$GEMINI_KEY" >> "$ROOT/.env"
      export GEMINI_API_KEY="$GEMINI_KEY"
      DEMO_MODEL="gemini"
      ok "Saved GEMINI_API_KEY to .env"
      ;;
    *)
      die "Invalid choice"
      ;;
  esac
fi

export DEMO_MODEL

# ── 6. Install dependencies ───────────────────────────────────────────────────
info "Installing Node dependencies"
pnpm install --frozen-lockfile 2>&1 | tail -3
ok "Dependencies installed"

# ── 7. Python venv ───────────────────────────────────────────────────────────
PYTHON="$ROOT/.venv-demo/bin/python"
if [[ ! -x "$PYTHON" ]]; then
  info "Creating Python venv (first run only, ~30s)"
  if command -v uv >/dev/null; then
    uv venv --python 3.12 "$ROOT/.venv-demo" >/dev/null
    uv pip install --python "$PYTHON" -e "$ROOT/services/agent-orchestrator[dev]" >/dev/null
  elif command -v python3 >/dev/null; then
    python3 -m venv "$ROOT/.venv-demo"
    "$PYTHON" -m pip install -q -e "$ROOT/services/agent-orchestrator[dev]"
  else
    die "Python 3 not found. Install python3 >= 3.11"
  fi
  ok "Python venv ready"
else
  ok "Python venv exists ($("$PYTHON" --version))"
fi

# ── 8. Run the demo ───────────────────────────────────────────────────────────
echo
info "Running the demo (model=$DEMO_MODEL)"
echo -e "  ${BOLD}What to expect:${RESET}"
echo "  - A broken JS file that returns Infinity for divide(1,0)"
echo "  - The 4-tier agent loop: Architect → Developer → Critic → QA"
echo "  - Critic may reject early patches and ask for revisions"
echo "  - QA executes tests in a Docker container — cannot fake a pass"
echo "  - Total time: ~20-60 seconds"
echo

DEMO_PYTHON="$PYTHON" ./demo/run-demo.sh

echo
echo -e "${GREEN}${BOLD}Done.${RESET}"
echo -e "Open ${BOLD}docs/INDEX0_START_TO_RESULTS.md${RESET} for the full project narrative."
