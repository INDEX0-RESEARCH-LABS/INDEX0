# ==============================================================================
# INDEX0 Sandbox Runtime — Sovereign Execution Sandbox Container
# Image Tag: index0-ai/sandbox-runtime:latest
# ==============================================================================

FROM nikolaik/python-nodejs:python3.12-nodejs22

LABEL org.opencontainers.image.title="INDEX0 Sandbox Runtime"
LABEL org.opencontainers.image.description="Sovereign Docker Execution Sandbox for INDEX0 AI Agents"
LABEL org.opencontainers.image.version="1.0.0"
LABEL image.tag="index0-ai/sandbox-runtime:latest"

ENV DEBIAN_FRONTEND=noninteractive
ENV WORKSPACE_DIR=/workspace/scratch

RUN apt-get update -y && apt-get install -y \
    curl \
    git \
    build-essential \
    ripgrep \
    jq \
    tmux \
    procps \
    sudo \
    && rm -rf /var/lib/apt/lists/*

RUN mkdir -p /workspace/scratch && chmod 777 /workspace/scratch

WORKDIR /workspace/scratch

CMD ["/bin/bash"]
