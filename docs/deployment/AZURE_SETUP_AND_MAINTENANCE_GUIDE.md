# INDEX0 AI — Azure Cloud Setup & Maintenance Guide

> **Authoritative Operations Manual**: Complete architecture blueprint, deployment topologies, day-to-day administrative runbooks, disaster recovery procedures, and Azure credit monitoring for the INDEX0 AI platform running on Microsoft Azure.

---

## 1. System & Cloud Architecture Overview

### 1.1 Infrastructure Summary

| Property | Value | Notes |
|---|---|---|
| **Host Virtual Machine** | `ai-beast-vm` | Azure Region: `eastus` (Resource Group: `UbuntuMobileGUI-RG`) |
| **VM Sizing & SKU** | `Standard_E8as_v7` | AMD EPYC, **8 vCPUs, 64 GB RAM**, NVMe controller |
| **Host Operating System** | Ubuntu 22.04 LTS (Jammy) | Gen2, Linux kernel 6.8.0-1065-azure |
| **Host Storage** | 160 GB Premium SSD | `P15` tier (1,100 IOPS, 125 MB/s throughput) |
| **Public IP Address** | `20.106.136.209` | Azure Static Standard Public IP |
| **Primary Domain** | `https://ai.index0.in` | Cloudflare Proxy + Caddy Reverse Proxy |
| **WebRTC Voice Domain** | `voice.index0.in` | Direct DNS Only (Cloudflare bypass for UDP) |
| **Azure OpenAI Account** | `oai-index0-prod-eastus` | **100% consuming Azure Credits** |

---

### 1.2 End-to-End Traffic Flow

```text
                                [ CLIENT TRAFFIC ]
                                        │
                         (HTTPS:443 / DNS: ai.index0.in)
                                        ▼
                           [ CLOUDFLARE EDGE (WAF) ]
                                        │
                            (Port 443 with TLS)
                                        ▼
                     AZURE HOST: ai-beast-vm (20.106.136.209)
   ┌────────────────────────────────────────────────────────────────────────┐
   │ Caddy Reverse Proxy Gateway (Port 80 & 443)                           │
   │  ├── /                ──▶ Next.js 15 Platform UI (PM2 :3005)           │
   │  ├── /canvas*         ──▶ OpenHands Autonomous Workbench (:3000)       │
   │  ├── /ide*            ──▶ Static Web IDE Client (:5173)                │
   │  ├── /auth*, /ui*     ──▶ Zitadel Sovereign OIDC Identity (:8085)     │
   │  ├── /temporal*       ──▶ Temporal Workflow Orchestration UI (:8233)   │
   │  ├── /v1*             ──▶ LiteLLM OpenAI-Compatible Router (:4000)     │
   │  ├── /orchestrator*   ──▶ LangGraph 4-Tier Agent Orchestrator (:8010)  │
   │  └── /analytics*      ──▶ ClickHouse Columnar Telemetry (:8123)        │
   └───────────────────────────────────┬────────────────────────────────────┘
                                       │
                  (Private Bridge Network: index0-net)
                                       ▼
   ┌────────────────────────────────────────────────────────────────────────┐
   │ Persistent State & Workflow Core                                       │
   │  • PostgreSQL 16 (:5432)  • ClickHouse 24 (:8123, :9000)               │
   │  • Temporal Server (:7233) • Lago Rating Engine (:3001)                │
   │  • Letta Memory (:8283)   • OpenMeter Engine (:8888)                   │
   │  • LiveKit WebRTC (:7880, UDP 50000:60000)                             │
   └───────────────────────────────────┬────────────────────────────────────┘
                                       │
                     (Consumes Azure Credits via HTTPS)
                                       ▼
                  AZURE OPENAI SERVICE (oai-index0-prod-eastus)
                  ├── azure-gpt-4o      (Reasoning & Code Generation)
                  ├── azure-gpt-4o-mini (QA, Critic, Fast completions)
                  └── azure-embedding-small (OpenViking Context RAG)
```

---

## 2. Service Catalog & Port Allocation

All services run under automated process supervisors (`pm2` and `systemd`):

| Service | Container / Process | Internal Port | Host / Public Port | Purpose |
|---|---|---|---|---|
| **Platform Web App** | `pm2 (index0-web)` | `3005` | Reverse proxied to `/` | Next.js 15 landing, dashboard, and marketing |
| **Gateway Proxy** | `index0-gateway` | `80`, `443`, `8000` | `80`, `443`, `8000` | Caddy reverse proxy, TLS termination, routing |
| **OpenHands** | `index0-openhands` | `3000` | Reverse proxied to `/canvas` | Monaco editor, terminal, autonomous dev loop |
| **Model Router** | `index0-litellm` | `4000` | Reverse proxied to `/v1` | Proxies agent calls to Azure OpenAI |
| **Agent Orchestrator**| `index0-agent-orchestrator` | `8000` | `8010` (proxy `/orchestrator`) | LangGraph 4-tier loop (Architect, Dev, Critic, QA)|
| **Voice Agent** | `index0-voice-agent` | `8020` | `8020` | LiveKit + Pipecat multimodal voice pipeline |
| **LiveKit SFU** | `index0-livekit` | `7880`, `7881`, `7882` | `7880`, `7881`, UDP `50000-60000` | WebRTC audio/video streaming |
| **Identity / OIDC** | `index0-zitadel` | `8085` | Reverse proxied to `/ui`, `/auth`| Multi-tenant login, session tokens, org tiers |
| **Temporal Engine** | `index0-temporal` | `7233` | `7233` (internal) | Durable execution, replay logs, crash recovery |
| **Temporal UI** | `index0-temporal-ui`| `8088`, `8233` | Reverse proxied to `/temporal` | Visual workflow inspector |
| **Primary Relational**| `index0-postgres` | `5432` | `5432` (internal) | Storage for Zitadel, Temporal, Lago, Letta |
| **Columnar Telemetry**| `index0-clickhouse` | `8123`, `9000` | Reverse proxied to `/analytics` | Append-only audit logs & usage events |
| **Billing Engine** | `index0-lago` | `3000` | `3001` (internal) | Subscription rating and invoice generation |
| **Usage Metering** | `index0-openmeter` | `8888` | `8888` (internal) | Real-time event metering |

---

## 3. Connecting to the Server

SSH access is preconfigured with the administrator key:

```bash
# Connect from your local development workstation
ssh azureuser@20.106.136.209

# Platform files are located at:
cd /opt/index0
```

---

## 4. Routine Operations & Maintenance Runbook

### 4.1 Checking System Health
The platform includes an automated diagnostic tool that tests every service and privacy invariant:

```bash
cd /opt/index0
bash scripts/healthcheck.sh
```

To view live container status and CPU/RAM utilization:
```bash
# List all running containers
docker ps --format 'table {{.Names}}\t{{.Status}}\t{{.Ports}}'

# Real-time resource monitor
docker stats --no-stream
```

To check the Next.js web tier:
```bash
pm2 status
pm2 logs index0-web --lines 50
```

---

### 4.2 Deploying Code Updates (Zero-Downtime Rolling Update)

When updating the platform from the repository:

#### Step 1: Sync or Pull Code
```bash
# On your local machine (rsync latest code):
rsync -avz --exclude='node_modules' --exclude='.git' --exclude='.turbo' \
  /home/darion-dev/Dev/Incubator/INDEX0/ azureuser@20.106.136.209:/opt/index0/
```

#### Step 2: Rebuild & Reload the Web Application
```bash
ssh azureuser@20.106.136.209
cd /opt/index0

# Recompile Next.js bundle
pnpm --filter @index0/ai build

# Zero-downtime reload via PM2
pm2 reload index0-web
```

#### Step 3: Rebuild or Restart Microservices (if modified)
```bash
cd /opt/index0
docker compose \
  -f infra/compose/docker-compose.yml \
  -f infra/compose/litellm.yml \
  -f infra/compose/letta.yml \
  -f infra/compose/livekit.yml \
  -f infra/compose/agent-orchestrator.yml \
  up -d --build --remove-orphans
```

---

### 4.3 Starting, Stopping, and Restarting Services

#### Full Stack Restart
```bash
# Restart all Docker services
sudo systemctl restart index0.service

# Restart web application
pm2 restart index0-web
```

#### Restarting an Individual Service
```bash
cd /opt/index0
COMPOSE="docker compose -f infra/compose/docker-compose.yml -f infra/compose/litellm.yml -f infra/compose/letta.yml -f infra/compose/livekit.yml -f infra/compose/agent-orchestrator.yml"

# Examples:
$COMPOSE restart gateway
$COMPOSE restart litellm
$COMPOSE restart openhands
$COMPOSE restart agent-orchestrator
```

---

### 4.4 Inspecting Logs

```bash
# Gateway / Reverse Proxy Logs
docker logs -f index0-gateway

# AI Model Routing & Token Logs (LiteLLM)
docker logs -f index0-litellm

# Agent Orchestrator Logs
docker logs -f index0-agent-orchestrator

# OpenHands Autonomous Dev Logs
docker logs -f index0-openhands

# Next.js Web Application Logs
pm2 logs index0-web

# Zitadel Identity Provider Logs
docker logs -f index0-zitadel
```

---

## 5. Database Maintenance & Backup Procedures

### 5.1 Automated PostgreSQL Backup
Create a scheduled nightly backup script `/opt/index0/scripts/backup-postgres.sh`:

```bash
#!/usr/bin/env bash
set -euo pipefail

BACKUP_DIR="/opt/index0/backups/postgres"
TIMESTAMP=$(date +"%Y%m%d_%H%M%S")
mkdir -p "$BACKUP_DIR"

echo "Backing up PostgreSQL databases..."
docker exec index0-postgres pg_dumpall -U index0 > "${BACKUP_DIR}/dump_${TIMESTAMP}.sql"

# Compress backup
gzip "${BACKUP_DIR}/dump_${TIMESTAMP}.sql"

# Keep only the last 7 days of local backups
find "$BACKUP_DIR" -type f -name "*.sql.gz" -mtime +7 -delete

echo "Backup completed: ${BACKUP_DIR}/dump_${TIMESTAMP}.sql.gz"
```

Make it executable and add to crontab (`crontab -e`):
```cron
0 2 * * * /opt/index0/scripts/backup-postgres.sh >> /var/log/pg_backup.log 2>&1
```

---

### 5.2 ClickHouse Telemetry Table Backup
ClickHouse partitions telemetry by month (`toYYYYMM(timestamp)`). To back up active tables:

```bash
# Freeze partition snapshots
docker exec index0-clickhouse clickhouse-client --query \
  "ALTER TABLE index0_analytics.audit_events FREEZE WITH NAME 'backup_$(date +%Y%m%d)';"
```

---

### 5.3 Disaster Recovery: Restoring PostgreSQL
To restore from a backup file:

```bash
gunzip -c /opt/index0/backups/postgres/dump_YYYYMMDD_HHMMSS.sql.gz | \
  docker exec -i index0-postgres psql -U index0 -d index0_prod
```

---

## 6. Disk Space & Housekeeping

Because OpenHands and agent loops execute code inside disposable container runtimes, Docker images and dangling build layers must be pruned periodically:

```bash
# Add a weekly cron job to clean dangling images and stopped containers
sudo docker system prune -af --volumes --filter "until=168h"
```

To verify available disk space on the 160 GB NVMe drive:
```bash
df -h /
```

---

## 7. Azure Credit & Budget Monitoring

### 7.1 Setting Budget Alerts in Azure Portal
1. Navigate to **Azure Portal** -> **Cost Management + Billing** -> **Budgets**.
2. Click **+ Add Budget**.
3. Scope: `Azure subscription 1`.
4. Set Budget Amount: Match your allocated credit tier (e.g. `$5,000` or `$25,000`).
5. Configure Alert Thresholds:
   - **50% of credit burn** -> Send email notification.
   - **75% of credit burn** -> Send warning notification.
   - **90% of credit burn** -> Send critical alert.

### 7.2 Monitoring Token Burn in Azure OpenAI
1. Go to [Azure OpenAI Studio](https://oai.azure.com/).
2. Under **Deployments**, inspect:
   - `azure-gpt-4o` (Capacity limit: 50k TPM)
   - `azure-gpt-4o-mini` (Capacity limit: 50k TPM)
3. Check the **Metrics** tab to view daily prompt and completion tokens consumed.

---

## 8. Incident Response & Troubleshooting Playbook

### Problem 1: Cloudflare Error 525 (SSL Handshake Failed)
* **Cause**: Cloudflare cannot establish an encrypted handshake with Caddy on port 443.
* **Resolution**:
  1. Verify Caddy container is running: `docker ps | grep index0-gateway`.
  2. Verify Caddy is listening on port 443: `sudo ss -tlpn | grep 443`.
  3. Ensure [infra/gateway/Caddyfile](file:///home/darion-dev/Dev/Incubator/INDEX0/infra/gateway/Caddyfile) defines `tls internal` for `ai.index0.in`.
  4. In Cloudflare Dashboard -> **SSL/TLS**, verify encryption mode is set to **"Full"** (not "Full (strict)" unless an official Cloudflare Origin CA certificate is mounted).

---

### Problem 2: Next.js 502 Bad Gateway
* **Cause**: Caddy is running, but the Next.js process on host port 3005 is stopped or blocked by the firewall.
* **Resolution**:
  1. Check PM2 status: `pm2 status`. If errored, check `pm2 logs index0-web`.
  2. Restart Next.js: `pm2 restart index0-web`.
  3. Verify host firewall allows Docker bridge:
     ```bash
     sudo ufw allow from 172.16.0.0/12 to any port 3005 proto tcp
     ```

---

### Problem 3: LiteLLM 401 Unauthorized or Model Failures
* **Cause**: Azure OpenAI key rotated or environment variable missing.
* **Resolution**:
  1. Check Azure OpenAI deployment:
     ```bash
     az cognitiveservices account deployment list -g UbuntuMobileGUI-RG -n oai-index0-prod-eastus -o table
     ```
  2. Verify `/opt/index0/.env` contains valid `AZURE_OPENAI_API_KEY` and `AZURE_OPENAI_RESOURCE_NAME`.
  3. Restart LiteLLM:
     ```bash
     cd /opt/index0 && docker compose -f infra/compose/litellm.yml restart litellm
     ```

---

### Problem 4: Server Reboot Recovery Verification
If Azure restarts the VM during a host maintenance cycle:
1. Systemd automatically boots `index0.service` (all 13 Docker containers).
2. Systemd automatically boots `pm2-azureuser.service` (Next.js web application).
3. Cloudflare automatically resumes traffic with zero human intervention required.
