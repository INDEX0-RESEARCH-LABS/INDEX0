<a name="readme-top"></a>

<div align="center">
  <img src="./frontend/src/assets/branding/logo.svg" alt="INDEX0 AI Logo" width="120">
  <h1 align="center">INDEX0 AI Agent Canvas</h1>
  <p><strong>Sovereign Autonomous Agent Execution Engine & Enterprise Workspace Canvas</strong></p>
</div>

<div align="center">
  <a href="./LICENSE"><img src="https://img.shields.io/badge/License-MIT-orange?style=for-the-badge" alt="MIT License"></a>
  <a href="./CREDITS.md"><img src="https://img.shields.io/badge/Upstream-OpenHands%20Fork-blue?style=for-the-badge" alt="Upstream OpenHands Credits"></a>
  <img src="https://img.shields.io/badge/Version-1.0.0-f54e00?style=for-the-badge" alt="Version 1.0.0">
  <hr>
</div>

Welcome to **INDEX0 AI Agent Canvas**, the enterprise autonomous software engineering agent engine and interactive workspace canvas within the INDEX0 sovereign commercial stack.

INDEX0 AI agents autonomously navigate codebases, modify files, run sandboxed tests, interact with browsers, and synthesize pull requests under rigorous architectural guardrails.

---

## ⚡ Quick Start

### Running via Docker

```bash
docker run -it --rm \
    -e INDEX0_RUNTIME_CONTAINER_IMAGE=index0-ai/sandbox-runtime:latest \
    -e LOG_ALL_EVENTS=true \
    -v /var/run/docker.sock:/var/run/docker.sock \
    -v /workspace/scratch:/workspace/scratch \
    -p 3000:3000 \
    -p 3001:3001 \
    --add-host host.docker.internal:host-gateway \
    --name index0-agent-canvas \
    index0-ai/agent-canvas:latest
```

The INDEX0 AI Agent Canvas UI is accessible at [http://localhost:3000](http://localhost:3000), with the FastAPI backend engine serving routes at [http://localhost:3001](http://localhost:3001).

### Running via Docker Compose

```bash
docker compose up -d
```

### Local Development Setup

#### 1. Backend Engine (`index0-agent`)
```bash
# Install dependencies with Poetry or Pip
poetry install

# Start development API server
poetry run uvicorn index0_agent.server.app:app --host 0.0.0.0 --port 3001 --reload
```

#### 2. Frontend Canvas (`agent-canvas/frontend`)
```bash
cd frontend
pnpm install
pnpm dev
```

---

## 🛡️ Architecture & Guardrails

INDEX0 AI Agent Canvas integrates natively into the INDEX0 Sovereign Architecture:
- **Contract-First**: Conforms to standard OpenAPI and TypeScript contracts.
- **Sovereign Sandboxing**: All bash commands, browser interactions, and code edits execute inside isolated Docker containers mounting `/workspace/scratch`.
- **Telemetry & Billing Integration**: Ready for OpenMeter and Lago event metering.
- **Multi-Provider LLM Router**: Seamlessly switch between Claude 3.5 Sonnet, GPT-4o, DeepSeek-Coder, and local offline Ollama / vLLM inference engines.

---

## 📜 License & Upstream Attribution

Distributed under the **MIT License**. See [`LICENSE`](./LICENSE) for terms.

INDEX0 AI Agent Canvas is forked from [OpenHands](https://github.com/All-Hands-AI/OpenHands) (formerly OpenDevin), licensed under the MIT License. We are deeply grateful to the OpenHands community and maintainers for their foundational contributions to open-source agentic engineering. Detailed contributor and project acknowledgements are preserved in [`CREDITS.md`](./CREDITS.md).
