#!/usr/bin/env bash
# ==============================================================================
# INDEX0 AI — Universal Single-Command Installer
# Works on: macOS (Intel & Apple Silicon), Linux (all distros), Windows (WSL/Git Bash)
#
# Usage:
#   curl -fsSL https://ai.index0.in/install.sh | bash
# ==============================================================================
set -euo pipefail

# ANSI Styling
BOLD='\033[1m'
WHITE='\033[97m'
GRAY='\033[90m'
GREEN='\033[32m'
RED='\033[31m'
NC='\033[0m'

# Banner
echo -e "${WHITE}${BOLD}"
cat << 'EOF'
   ▄           ▄                         ▄  
   █   █▀▀▄ █▀▀█ █▀▀█ █  █ █▀▀█    █▀▀█  █  
   █   █  █ █  █ █▀▀▀  ▀▀  █/ █    █▀▀█  █  
   ▀▀  ▀  ▀ ▀▀▀▀ ▀▀▀▀ █  █ ▀▀▀▀    ▀  ▀  ▀▀ 
EOF
echo -e "${WHITE}SOVEREIGN TERMINAL COCKPIT & AI HARNESS${NC}"
echo -e "${GRAY}World's First Sovereign Software Engineering Platform${NC}\n"

# 1. Detect OS & Architecture
echo -e "${WHITE}[1/4]${NC} Detecting system architecture..."
OS="$(uname -s)"
ARCH="$(uname -m)"

case "${OS}" in
    Linux*)     PLATFORM="linux";;
    Darwin*)    PLATFORM="darwin";;
    CYGWIN*|MINGW*|MSYS*) PLATFORM="windows";;
    *)          PLATFORM="unknown";;
esac

case "${ARCH}" in
    x86_64|amd64)   TARGET_ARCH="x64";;
    arm64|aarch64)  TARGET_ARCH="arm64";;
    *)              TARGET_ARCH="x64";;
esac

echo -e "  ${WHITE}✓${NC} Detected platform: ${WHITE}${PLATFORM} (${TARGET_ARCH})${NC}"

# 2. Check & Install Prerequisites (Node.js)
echo -e "\n${WHITE}[2/4]${NC} Checking runtime prerequisites..."

check_node() {
    if command -v node >/dev/null 2>&1; then
        NODE_VER=$(node -v | sed 's/v//' | cut -d. -f1)
        if [ "$NODE_VER" -ge 18 ]; then
            return 0
        fi
    fi
    return 1
}

if ! check_node; then
    echo -e "  ${GRAY}!${NC} Node.js 18+ not found. Installing Node.js..."
    if [ "${PLATFORM}" = "darwin" ] && command -v brew >/dev/null 2>&1; then
        brew install node
    elif [ "${PLATFORM}" = "linux" ]; then
        if command -v apt-get >/dev/null 2>&1; then
            echo -e "  ${GRAY}•${NC} Installing via NodeSource..."
            curl -fsSL https://deb.nodesource.com/setup_22.x | sudo -E bash - >/dev/null 2>&1 || true
            sudo apt-get install -y nodejs >/dev/null 2>&1 || true
        elif command -v dnf >/dev/null 2>&1; then
            sudo dnf install -y nodejs >/dev/null 2>&1 || true
        elif command -v apk >/dev/null 2>&1; then
            apk add --no-cache nodejs npm >/dev/null 2>&1 || true
        fi
    fi
fi

if ! check_node; then
    echo -e "${RED}Error: Node.js (v18+) is required to run the INDEX0 CLI.${NC}"
    echo "Please install Node.js from https://nodejs.org or via your system package manager."
    exit 1
fi
echo -e "  ${WHITE}✓${NC} Node.js verified: ${WHITE}$(node -v)${NC}"

# 3. Install INDEX0 CLI Package
echo -e "\n${WHITE}[3/4]${NC} Installing INDEX0 CLI runtime..."
INDEX0_HOME="${HOME}/.index0"
INSTALL_DIR="${HOME}/.local/bin"
mkdir -p "${INDEX0_HOME}/dist" "${INSTALL_DIR}"

REPO_DIR=""
if [ -f "packages/client-harness/package.json" ]; then
    REPO_DIR="$(pwd)"
fi

if [ -n "${REPO_DIR}" ]; then
    echo -e "  ${WHITE}✓${NC} Local repository checkout detected at ${GRAY}${REPO_DIR}${NC}"
    CLI_SOURCE="${REPO_DIR}/packages/client-harness/dist/cli.js"
    chmod +x "${CLI_SOURCE}"
    ln -sf "${CLI_SOURCE}" "${INSTALL_DIR}/index0"
else
    # Standalone install: download lightweight bundle from CDN
    CDN_URL="https://ai.index0.in/index0-cli.tar.gz?v=2"
    echo -e "  ${WHITE}✓${NC} Downloading INDEX0 Sovereign bundle from CDN..."
    curl -fsSL "${CDN_URL}" -o /tmp/index0-cli.tar.gz
    tar -xzf /tmp/index0-cli.tar.gz -C "${INDEX0_HOME}"
    rm -f /tmp/index0-cli.tar.gz

    # Create launcher executable
    LAUNCHER="${INSTALL_DIR}/index0"
    cat << EOF > "${LAUNCHER}"
#!/usr/bin/env node
import '${INDEX0_HOME}/dist/cli.js';
EOF
    chmod +x "${LAUNCHER}"

    # Pre-bootstrap engine binary if present
    if command -v index0-engine >/dev/null 2>&1 && [ ! -f "${INDEX0_HOME}/bin/index0-engine" ]; then
        mkdir -p "${INDEX0_HOME}/bin"
        cp "$(command -v index0-engine)" "${INDEX0_HOME}/bin/index0-engine" 2>/dev/null || true
        chmod +x "${INDEX0_HOME}/bin/index0-engine" 2>/dev/null || true
    fi
fi

echo -e "  ${WHITE}✓${NC} Installed executable: ${BOLD}${INSTALL_DIR}/index0${NC}"

# 4. PATH Configuration
echo -e "\n${WHITE}[4/4]${NC} Configuring system PATH..."
if [[ ":$PATH:" != *":${INSTALL_DIR}:"* ]]; then
    SHELL_PROFILE=""
    if [ -n "${ZSH_VERSION:-}" ] || [ -f "${HOME}/.zshrc" ]; then
        SHELL_PROFILE="${HOME}/.zshrc"
    elif [ -f "${HOME}/.bashrc" ]; then
        SHELL_PROFILE="${HOME}/.bashrc"
    elif [ -f "${HOME}/.profile" ]; then
        SHELL_PROFILE="${HOME}/.profile"
    fi

    if [ -n "${SHELL_PROFILE}" ]; then
        if ! grep -q "${INSTALL_DIR}" "${SHELL_PROFILE}" 2>/dev/null; then
            echo "export PATH=\"${INSTALL_DIR}:\$PATH\"" >> "${SHELL_PROFILE}"
            echo -e "  ${WHITE}✓${NC} Added ${INSTALL_DIR} to ${WHITE}${SHELL_PROFILE}${NC}"
        fi
    fi
else
    echo -e "  ${WHITE}✓${NC} ${INSTALL_DIR} is already in PATH."
fi

# Sanity Verification
export PATH="${INSTALL_DIR}:${PATH}"
if "${INSTALL_DIR}/index0" --help >/dev/null 2>&1; then
    echo -e "  ${WHITE}✓${NC} INDEX0 CLI verified and operational!"
fi

echo -e "\n${WHITE}==============================================================================${NC}"
echo -e "${WHITE}${BOLD}             🎉 INDEX0 SOVEREIGN CLI INSTALLED SUCCESSFULLY!                  ${NC}"
echo -e "${WHITE}==============================================================================${NC}"
echo -e "\n${BOLD}Quick Start Guide:${NC}"
echo -e "  ${WHITE}index0 login${NC}                                    # Sign in with GitHub Device Flow"
echo -e "  ${WHITE}index0 prompt \"Refactor claims middleware\"${NC}      # Stream to Sovereign Azure East US"
echo -e "  ${WHITE}index0 review \"Audit token verification\"${NC}       # Run 4-Tier Anti-Slop Matrix"
echo -e "  ${WHITE}index0 models${NC}                                   # View all 7 sovereign cloud models"
echo -e "  ${WHITE}index0 --help${NC}                                   # Full command catalog\n"
echo -e "${GRAY}People Over Tools. Work Verified. Time to Unplug. 🌿${NC}\n"
