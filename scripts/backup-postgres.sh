#!/usr/bin/env bash
set -euo pipefail

# ==============================================================================
# INDEX0 AI — Automated PostgreSQL Database Backup Script
# ==============================================================================
BACKUP_DIR="${BACKUP_DIR:-/opt/index0/backups/postgres}"
TIMESTAMP=$(date +"%Y%m%d_%H%M%S")
mkdir -p "$BACKUP_DIR"

echo "=== [$(date)] Starting PostgreSQL Backup ==="
docker exec index0-postgres pg_dumpall -U "${POSTGRES_USER:-index0}" > "${BACKUP_DIR}/dump_${TIMESTAMP}.sql"

# Compress backup
gzip -f "${BACKUP_DIR}/dump_${TIMESTAMP}.sql"

# Keep only the last 7 days of local backups
find "$BACKUP_DIR" -type f -name "*.sql.gz" -mtime +7 -delete

echo "✓ Backup successfully completed: ${BACKUP_DIR}/dump_${TIMESTAMP}.sql.gz"
