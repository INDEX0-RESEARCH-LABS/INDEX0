#!/usr/bin/env bash
set -euo pipefail

# ==============================================================================
# INDEX0 AI: PRE-COMMIT LICENSE BOUNDARY & COMPLIANCE CHECK
# ==============================================================================
# Ensures AGPL-3.0 copyleft packages are NOT imported or linked inside proprietary
# services, packages, or client apps.
# ==============================================================================

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

ERRORS_FOUND=0

echo -e "${YELLOW}[INDEX0 License Guard] Auditing proprietary dependencies and imports...${NC}"

# List of AGPL-3.0 package names or modules that MUST NOT be linked in backend code
BANNED_AGPL_PACKAGES=(
    "openviking-server"
    "lago-core"
    "coolify-api"
)

# Target directories containing proprietary code
PROPRIETARY_DIRS=("services" "apps" "packages")

# ------------------------------------------------------------------------------
# 1. Check Node.js / TypeScript package.json dependencies
# ------------------------------------------------------------------------------
echo "--> Checking Node.js / pnpm dependencies..."

for dir in "${PROPRIETARY_DIRS[@]}"; do
    if [ -d "$dir" ]; then
        for pkg in "${BANNED_AGPL_PACKAGES[@]}"; do
            if grep -rn --include="package.json" "\"$pkg\"" "$dir/" > /dev/null 2>&1; then
                echo -e "${RED}[ERROR] AGPL-3.0 package '$pkg' found in package.json inside '$dir/'!${NC}"
                ERRORS_FOUND=$((ERRORS_FOUND + 1))
            fi
        done
    fi
done

# ------------------------------------------------------------------------------
# 2. Check Python requirements.txt / pyproject.toml
# ------------------------------------------------------------------------------
echo "--> Checking Python dependencies..."

for dir in "${PROPRIETARY_DIRS[@]}"; do
    if [ -d "$dir" ]; then
        for pkg in "${BANNED_AGPL_PACKAGES[@]}"; do
            if grep -rn --include="requirements.txt" --include="pyproject.toml" "$pkg" "$dir/" > /dev/null 2>&1; then
                echo -e "${RED}[ERROR] AGPL-3.0 Python package '$pkg' found inside '$dir/'!${NC}"
                ERRORS_FOUND=$((ERRORS_FOUND + 1))
            fi
        done
    fi
done

# ------------------------------------------------------------------------------
# 3. Check for direct code import statements
# ------------------------------------------------------------------------------
echo "--> Auditing source code import statements..."

for dir in "${PROPRIETARY_DIRS[@]}"; do
    if [ -d "$dir" ]; then
        for pkg in "${BANNED_AGPL_PACKAGES[@]}"; do
            if grep -rn --include="*.ts" --include="*.js" --include="*.py" --include="*.go" "import .*$pkg" "$dir/" > /dev/null 2>&1; then
                echo -e "${RED}[ERROR] Direct code import of '$pkg' detected in '$dir/'!${NC}"
                echo -e "${YELLOW}Hint: AGPL engines must run in 'infra/compose/' as containers and communicate via HTTP/gRPC API calls.${NC}"
                ERRORS_FOUND=$((ERRORS_FOUND + 1))
            fi
        done
    fi
done

# ------------------------------------------------------------------------------
# 4. Final Verdict
# ------------------------------------------------------------------------------
if [ "$ERRORS_FOUND" -gt 0 ]; then
    echo -e "${RED}x License audit failed with $ERRORS_FOUND boundary violation(s). Commit blocked.${NC}"
    exit 1
else
    echo -e "${GREEN}✓ License audit passed! No AGPL-3.0 copyleft leaks detected in proprietary directories.${NC}"
    exit 0
fi
