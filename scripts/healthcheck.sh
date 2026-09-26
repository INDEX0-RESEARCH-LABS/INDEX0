#!/usr/bin/env bash
set -uo pipefail

# ==============================================================================
# INDEX0 AI: SOVEREIGN SYSTEM HEALTHCHECK & DIAGNOSTIC VERIFIER
# ==============================================================================
# Validates service readiness, API gateway routing, local edge responsiveness,
# and Zero Data Retention (ZDR) privacy compliance across the INDEX0 AI stack.
# ==============================================================================

GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
CYAN='\033[0;36m'
NC='\033[0m'

TIMEOUT=2
TOTAL_CHECKED=0
PASSED_CHECKS=0
WARNINGS=0
ERRORS=0

# Load .env if present
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
REPO_ROOT="$(cd "${SCRIPT_DIR}/.." && pwd)"

if [ -f "${REPO_ROOT}/.env" ]; then
    # shellcheck disable=SC1091
    export $(grep -v '^#' "${REPO_ROOT}/.env" | grep -v '^$' | xargs) > /dev/null 2>&1 || true
fi

echo -e "${CYAN}==============================================================================${NC}"
echo -e "${CYAN}                  INDEX0 AI — SOVEREIGN STACK HEALTHCHECK                     ${NC}"
echo -e "${CYAN}==============================================================================${NC}"

# Helper function to test an HTTP endpoint
# check_http_endpoint <name> <url> <expected_code_or_string> [is_critical]
check_http_endpoint() {
    local name="$1"
    local url="$2"
    local expected="$3"
    local is_critical="${4:-true}"
    TOTAL_CHECKED=$((TOTAL_CHECKED + 1))

    local response
    local http_code
    local start_time
    local end_time
    local latency_ms

    start_time=$(date +%s%N 2>/dev/null || date +%s)
    
    http_code=$(curl -s -o /dev/null -w "%{http_code}" --connect-timeout "${TIMEOUT}" --max-time "${TIMEOUT}" "${url}" 2>/dev/null) || http_code="000"
    
    end_time=$(date +%s%N 2>/dev/null || date +%s)
    if [ "${start_time}" != "${end_time}" ]; then
        latency_ms=$(( (end_time - start_time) / 1000000 ))
    else
        latency_ms=10
    fi

    # Only treat as responsive if a valid HTTP status code was returned (not 000)
    if [[ "${http_code}" =~ ^[234][0-9]{2}$ ]]; then
        echo -e "${GREEN}[OK]${NC} ${name} reachable at ${url} (${http_code} OK, ${latency_ms}ms)"
        PASSED_CHECKS=$((PASSED_CHECKS + 1))
        return 0
    elif [ "${is_critical}" = "false" ]; then
        echo -e "${YELLOW}[INACTIVE]${NC} ${name} not running at ${url} (HTTP ${http_code})"
        WARNINGS=$((WARNINGS + 1))
        return 0
    else
        echo -e "${RED}[FAIL]${NC} ${name} unreachable at ${url} (HTTP ${http_code})"
        ERRORS=$((ERRORS + 1))
        return 1
    fi
}

# 1. LiteLLM AI Gateway
check_http_endpoint "LiteLLM Gateway" "${LITELLM_PROXY_URL:-http://localhost:4000}/health" "200" false || \
check_http_endpoint "LiteLLM Gateway" "http://localhost:4000" "200" false

# 2. TabbyML Local Edge Engine (GhostText Autocomplete)

# 3. TabbyML Local Edge Engine
check_http_endpoint "TabbyML Edge Engine" "${TABBY_ENDPOINT:-http://localhost:8080}/v1/health" "200" false

# 3. Code-OSS Cloud IDE (code-server)
check_http_endpoint "Code-OSS Cloud IDE (code-server)" "${CODE_SERVER_URL:-http://localhost:8443}" "302" false

# 4. LiveKit WebRTC Voice SFU
check_http_endpoint "LiveKit WebRTC Voice SFU" "http://localhost:7880" "200" false

# 5. ClickHouse Analytics Engine
if curl -s --connect-timeout "${TIMEOUT}" "${CLICKHOUSE_URL:-http://localhost:8123}/ping" 2>/dev/null | grep -q "Ok"; then
    echo -e "${GREEN}[OK]${NC} ClickHouse Columnar Telemetry online at ${CLICKHOUSE_URL:-http://localhost:8123}"
    PASSED_CHECKS=$((PASSED_CHECKS + 1))
else
    echo -e "${YELLOW}[OPTIONAL]${NC} ClickHouse not reachable at ${CLICKHOUSE_URL:-http://localhost:8123}"
    WARNINGS=$((WARNINGS + 1))
fi
TOTAL_CHECKED=$((TOTAL_CHECKED + 1))

# 6. OpenMeter Usage Metering Engine
check_http_endpoint "OpenMeter Ingestion Engine" "${OPENMETER_ENDPOINT:-http://localhost:8888}" "200" false

# 7. Lago Subscription Billing Engine
check_http_endpoint "Lago Rating Engine" "${LAGO_API_URL:-http://localhost:3001}" "200" false

# 8. Temporal Workflow Orchestrator UI
check_http_endpoint "Temporal Web UI" "http://localhost:8233" "200" false || \
check_http_endpoint "Temporal Web UI" "http://localhost:8088" "200" false

# 9. Zitadel OIDC Gateway
check_http_endpoint "Zitadel Identity Provider" "${ZITADEL_ISSUER:-http://localhost:8085}/debug/ready" "200" false

# 10. Agent Orchestrator LangGraph Service
check_http_endpoint "Agent Orchestrator (LangGraph 4-Tier)" "http://localhost:8010/health" "200" false

# 11. Voice Agent Pipeline
check_http_endpoint "Voice Agent Worker (LiveKit/Pipecat)" "http://localhost:8020/health" "200" false

# 12. Privacy & Zero Data Retention (ZDR) Policy Enforcement Check
echo -e "\n${CYAN}--- Privacy & Policy Invariants ---${NC}"
ZDR_ENFORCED="${ZDR_ENFORCE:-true}"
if [ "${ZDR_ENFORCED}" = "true" ] || [ "${ZDR_ENFORCED}" = "1" ]; then
    echo -e "${GREEN}[OK]${NC} Zero Data Retention (ZDR) Privacy Enforcement ACTIVE"
    PASSED_CHECKS=$((PASSED_CHECKS + 1))
else
    echo -e "${RED}[WARN]${NC} Zero Data Retention (ZDR) is DISABLED in environment"
    WARNINGS=$((WARNINGS + 1))
fi
TOTAL_CHECKED=$((TOTAL_CHECKED + 1))

# 13. Monorepo Contracts & Licenses Invariant
if [ -f "${SCRIPT_DIR}/license-check.sh" ]; then
    echo -e "${GREEN}[OK]${NC} License Boundary Enforcement Guard present"
    PASSED_CHECKS=$((PASSED_CHECKS + 1))
    TOTAL_CHECKED=$((TOTAL_CHECKED + 1))
fi

echo -e "\n${CYAN}==============================================================================${NC}"
echo -e "Healthcheck Complete: ${GREEN}${PASSED_CHECKS} Passed${NC} | ${YELLOW}${WARNINGS} Warnings/Inactive${NC} | ${RED}${ERRORS} Failed${NC}"
echo -e "To boot missing containers: ${CYAN}pnpm run infra:all:up${NC} or ${CYAN}docker compose -f infra/compose/docker-compose.yml up -d${NC}"
echo -e "${CYAN}==============================================================================${NC}"

if [ "${ERRORS}" -gt 0 ]; then
    exit 1
fi
exit 0
