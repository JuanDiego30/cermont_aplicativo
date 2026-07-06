#!/bin/bash
# Cermont DB backup script
# Usage: ./scripts/backup.sh [output-directory]

set -euo pipefail

BACKUP_DIR="${1:-./backups}"
TIMESTAMP=$(date +%Y%m%d_%H%M%S)
BACKUP_PATH="${BACKUP_DIR}/cermont_backup_${TIMESTAMP}"

mkdir -p "${BACKUP_PATH}"

echo "Starting MongoDB backup..."
mongodump --uri="${MONGO_URI:-mongodb://127.0.0.1:27017/cermont}" \
  --out="${BACKUP_PATH}" \
  --quiet

echo "Compressing backup..."
tar -czf "${BACKUP_PATH}.tar.gz" -C "${BACKUP_DIR}" "cermont_backup_${TIMESTAMP}"
rm -rf "${BACKUP_PATH}"

echo "Backup completed: ${BACKUP_PATH}.tar.gz"

# Rotate old backups (keep last 7 days)
find "${BACKUP_DIR}" -name "cermont_backup_*.tar.gz" -mtime +7 -delete
echo "Old backups rotated (kept last 7 days)"
