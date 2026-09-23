# ==============================================================================
# INDEX0 AI Agent Canvas — Production Container Definition
# Image Tag: index0-ai/agent-canvas:latest
# ==============================================================================

ARG INDEX0_BUILD_VERSION=v1.0.0
FROM node:21.7.2-bookworm-slim AS frontend-builder

WORKDIR /app

COPY ./frontend/package.json ./frontend/package-lock.json* ./frontend/pnpm-lock.yaml* ./
RUN npm install -g pnpm@12.4.2
COPY ./frontend ./frontend
RUN cd frontend && pnpm install --frozen-lockfile=false && pnpm build

FROM python:3.12.3-slim AS backend-builder

WORKDIR /app
ENV PYTHONPATH='/app'

ENV POETRY_NO_INTERACTION=1 \
    POETRY_VIRTUALENVS_IN_PROJECT=1 \
    POETRY_VIRTUALENVS_CREATE=1 \
    POETRY_CACHE_DIR=/tmp/poetry_cache

RUN apt-get update -y \
    && apt-get install -y curl make git build-essential \
    && python3 -m pip install poetry==1.8.2 --break-system-packages

COPY ./pyproject.toml ./poetry.lock ./
RUN touch README.md
RUN export POETRY_CACHE_DIR && poetry install --without evaluation,llama-index --no-root && rm -rf $POETRY_CACHE_DIR

FROM python:3.12.3-slim AS index0-agent-canvas

LABEL org.opencontainers.image.title="INDEX0 AI Agent Canvas"
LABEL org.opencontainers.image.description="Sovereign AI Agent Execution Engine & Workspace Canvas"
LABEL org.opencontainers.image.version="1.0.0"
LABEL image.tag="index0-ai/agent-canvas:latest"

WORKDIR /app

ARG INDEX0_BUILD_VERSION
ENV RUN_AS_INDEX0=true
ENV INDEX0_USER_ID=42420
ENV SANDBOX_LOCAL_RUNTIME_URL=http://host.docker.internal
ENV USE_HOST_NETWORK=false
ENV WORKSPACE_BASE=/workspace/scratch
ENV INDEX0_BUILD_VERSION=$INDEX0_BUILD_VERSION
ENV INDEX0_RUNTIME_CONTAINER_IMAGE=index0-ai/sandbox-runtime:latest
ENV SANDBOX_USER_ID=0
ENV FILE_STORE=local
ENV FILE_STORE_PATH=/.index0-state

RUN mkdir -p $FILE_STORE_PATH
RUN mkdir -p $WORKSPACE_BASE

RUN apt-get update -y \
    && apt-get install -y curl ssh sudo

RUN sed -i 's/^UID_MIN.*/UID_MIN 499/' /etc/login.defs
RUN sed -i 's/^UID_MAX.*/UID_MAX 1000000/' /etc/login.defs

RUN groupadd app
RUN useradd -l -m -u $INDEX0_USER_ID -s /bin/bash index0 && \
    usermod -aG app index0 && \
    usermod -aG sudo index0 && \
    echo '%sudo ALL=(ALL) NOPASSWD:ALL' >> /etc/sudoers

RUN chown -R index0:app /app && chmod -R 770 /app
RUN sudo chown -R index0:app $WORKSPACE_BASE && sudo chmod -R 770 $WORKSPACE_BASE
USER index0

ENV VIRTUAL_ENV=/app/.venv \
    PATH="/app/.venv/bin:$PATH" \
    PYTHONPATH='/app'

COPY --chown=index0:app --chmod=770 --from=backend-builder ${VIRTUAL_ENV} ${VIRTUAL_ENV}
RUN playwright install --with-deps chromium

COPY --chown=index0:app --chmod=770 ./index0_agent ./index0_agent
COPY --chown=index0:app --chmod=770 ./openhands ./openhands
COPY --chown=index0:app --chmod=777 ./index0_agent/runtime/plugins ./index0_agent/runtime/plugins
COPY --chown=index0:app --chmod=770 ./index0_agent/agenthub ./index0_agent/agenthub
COPY --chown=index0:app ./pyproject.toml ./pyproject.toml
COPY --chown=index0:app ./poetry.lock ./poetry.lock
COPY --chown=index0:app ./README.md ./README.md
COPY --chown=index0:app ./MANIFEST.in ./MANIFEST.in
COPY --chown=index0:app ./LICENSE ./LICENSE

RUN python index0_agent/core/download.py || true
RUN find /app \! -group app -exec chgrp app {} +

COPY --chown=index0:app --chmod=770 --from=frontend-builder /app/frontend/build ./frontend/build
COPY --chown=index0:app --chmod=770 ./containers/app/entrypoint.sh /app/entrypoint.sh

USER root

WORKDIR /app

EXPOSE 3000
EXPOSE 3001

ENTRYPOINT ["/app/entrypoint.sh"]
CMD ["uvicorn", "index0_agent.server.listen:app", "--host", "0.0.0.0", "--port", "3001"]
