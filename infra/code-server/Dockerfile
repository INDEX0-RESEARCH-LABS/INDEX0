# INDEX0 Sovereign IDE — code-server Cloud Instance
# Serves the same Code-OSS fork in the browser via code-server.
# Each user gets their own container provisioned on workspace creation.
#
# Build: docker build -t index0-ide-cloud -f infra/code-server/Dockerfile .
# Run:   docker run -p 8443:8443 -v workspace:/workspace index0-ide-cloud

FROM codercom/code-server:4.93.1

# Labels
LABEL org.opencontainers.image.title="INDEX0 Sovereign IDE (Cloud)"
LABEL org.opencontainers.image.description="Telemetry-free Code-OSS IDE served via code-server with INDEX0 extensions pre-installed"
LABEL org.opencontainers.image.vendor="INDEX0 AI Research Labs"

# Install system dependencies for agent runtime
USER root
RUN apt-get update && apt-get install -y --no-install-recommends \
    git \
    curl \
    jq \
    python3 \
    python3-pip \
    && rm -rf /var/lib/apt/lists/*

# Disable all telemetry at code-server level
ENV CS_DISABLE_GETTING_STARTED_OVERRIDE=1
ENV VSCODE_TELEMETRY_DISABLED=1

# Pre-install INDEX0 extension (built from apps/ide/extension)
RUN mkdir -p /home/coder/.local/share/code-server/extensions/index0-extension
COPY apps/ide/extension/package.json /home/coder/.local/share/code-server/extensions/index0-extension/package.json
COPY apps/ide/extension/dist /home/coder/.local/share/code-server/extensions/index0-extension/dist
RUN chown -R coder:coder /home/coder/.local/share/code-server

# Configure code-server defaults
RUN mkdir -p /home/coder/.config/code-server
COPY infra/code-server/config.yaml /home/coder/.config/code-server/config.yaml

# Configure Open VSX as the extension marketplace (replacing MS Marketplace)
ENV EXTENSIONS_GALLERY='{"serviceUrl":"https://open-vsx.org/vscode/gallery","itemUrl":"https://open-vsx.org/vscode/item","controlUrl":"","recommendationsUrl":""}'

# Set sovereign update endpoint (no Microsoft update checks)
ENV VSCODE_UPDATE_URL=https://updates.index0.ai

# Workspace volume mount point
VOLUME /workspace
WORKDIR /workspace

USER coder

# Expose code-server on 8443
EXPOSE 8443

ENTRYPOINT ["code-server", "--bind-addr", "0.0.0.0:8443", "/workspace"]
