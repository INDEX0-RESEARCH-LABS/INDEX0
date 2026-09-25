#!/usr/bin/env bash
set -euo pipefail

ENV_FILE=".env.production"
if [ -f "$ENV_FILE" ]; then
    echo "Warning: $ENV_FILE already exists! Backing up to ${ENV_FILE}.bak"
    cp "$ENV_FILE" "${ENV_FILE}.bak"
fi

echo "Generating cryptographically secure production keys for INDEX0..."

POSTGRES_PWD=$(openssl rand -base64 24 | tr -dc 'a-zA-Z0-9' | head -c 24)
CLICKHOUSE_PWD=$(openssl rand -base64 24 | tr -dc 'a-zA-Z0-9' | head -c 24)
ZITADEL_MASTERKEY=$(openssl rand -base64 32 | tr -dc 'a-zA-Z0-9' | head -c 32)
LAGO_SECRET_KEY=$(openssl rand -hex 64)
LITELLM_KEY="sk-index0-prod-$(openssl rand -hex 16)"
LIVEKIT_SECRET=$(openssl rand -hex 24)

# Generate 2048-bit RSA Private Key for Lago (base64 encoded single-line)
RSA_KEY_TEMP=$(mktemp)
openssl genrsa 2048 2>/dev/null > "$RSA_KEY_TEMP"
LAGO_RSA_B64=$(base64 -w 0 < "$RSA_KEY_TEMP")
rm -f "$RSA_KEY_TEMP"

cat << EOF > "$ENV_FILE"
# ==============================================================================
# INDEX0 AI — Production Environment Variables
# ==============================================================================
NODE_ENV=production
LOG_LEVEL=info

# 1. Primary Database (PostgreSQL 16)
DATABASE_URL="postgresql://index0:${POSTGRES_PWD}@postgres:5432/index0_prod?schema=public"
POSTGRES_USER=index0
POSTGRES_PASSWORD=${POSTGRES_PWD}
POSTGRES_DB=index0_prod
POSTGRES_PORT=5432

# 2. Columnar Telemetry (ClickHouse)
CLICKHOUSE_URL="http://clickhouse:8123"
CLICKHOUSE_USER=default
CLICKHOUSE_PASSWORD=${CLICKHOUSE_PWD}
CLICKHOUSE_DB=index0_analytics

# 3. Identity (Zitadel OIDC)
ZITADEL_MASTERKEY=${ZITADEL_MASTERKEY}
ZITADEL_EXTERNALSECURE=true
ZITADEL_EXTERNALPORT=443

# 4. Lago Rating & Billing
LAGO_SECRET_KEY_BASE=${LAGO_SECRET_KEY}
LAGO_RSA_PRIVATE_KEY=${LAGO_RSA_B64}

# 5. LiteLLM Proxy & Router
LITELLM_MASTER_KEY=${LITELLM_KEY}

# 6. LiveKit WebRTC Voice
LIVEKIT_API_KEY=index0-voice-key
LIVEKIT_API_SECRET=${LIVEKIT_SECRET}

# 7. Model Providers (Azure OpenAI)
AZURE_OPENAI_RESOURCE_NAME=your-azure-openai-resource
AZURE_OPENAI_API_KEY=your-azure-openai-key
EOF

echo "✓ Created $ENV_FILE with secure production secrets."
