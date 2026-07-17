#!/bin/bash
# Cermont DB backup script
# Usage: ./scripts/backup.sh [output-directory]

set -euo pipefail

BACKUP_DIR="${1:-./backups}"
TIMESTAMP=$(date +%Y%m%d_%H%M%S)
BACKUP_PATH="${BACKUP_DIR}/cermont_backup_${TIMESTAMP}"
MONGO_URI="${MONGO_URI:-mongodb://127.0.0.1:27017/cermont}"
APP_VERSION="${APP_VERSION:-1.0.0}"

mkdir -p "${BACKUP_PATH}"

echo "Starting MongoDB backup..."
mongodump --uri="${MONGO_URI}" \
  --out="${BACKUP_PATH}" \
  --quiet

echo "Generating manifest.json..."
MANIFEST="${BACKUP_PATH}/manifest.json"

# Extract DB name from URI
DB_NAME=$(echo "${MONGO_URI}" | sed -n 's|.*/\([^/?]*\).*|\1|p')
DB_NAME="${DB_NAME:-cermont}"

# Build manifest entries per collection
COLLECTIONS_JSON=""
FIRST=true
for COLLECTION_DIR in "${BACKUP_PATH}/${DB_NAME}/"*/; do
  COLLECTION_NAME=$(basename "${COLLECTION_DIR}")
  BSON_FILE="${COLLECTION_DIR}${COLLECTION_NAME}.bson"
  DOC_COUNT=0
  CHECKSUM=""

  if [ -f "${BSON_FILE}" ]; then
    # Count documents via bsondump (fallback to file size-based estimation)
    DOC_COUNT=$(bsondump --quiet "${BSON_FILE}" 2>/dev/null | wc -l || echo "0")
    CHECKSUM=$(sha256sum "${BSON_FILE}" | cut -d' ' -f1)
  fi

  if [ "${FIRST}" = true ]; then
    FIRST=false
  else
    COLLECTIONS_JSON="${COLLECTIONS_JSON},"
  fi

  COLLECTIONS_JSON="${COLLECTIONS_JSON}\n    {"
  COLLECTIONS_JSON="${COLLECTIONS_JSON}\n      \"name\": \"${COLLECTION_NAME}\","
  COLLECTIONS_JSON="${COLLECTIONS_JSON}\n      \"documentCount\": ${DOC_COUNT},"
  COLLECTIONS_JSON="${COLLECTIONS_JSON}\n      \"checksum\": \"sha256:${CHECKSUM}\""
  COLLECTIONS_JSON="${COLLECTIONS_JSON}\n    }"
done

TOTAL_DOCS=$(echo -e "${COLLECTIONS_JSON}" | grep -o '"documentCount": [0-9]*' | grep -o '[0-9]*' | paste -sd+ | bc || echo "0")
ARCHIVE_SIZE=$(du -sb "${BACKUP_PATH}" | cut -f1)

cat > "${MANIFEST}" <<MANIFEST_EOF
{
  "backupId": "${TIMESTAMP}",
  "generatedAt": "$(date -u +%Y-%m-%dT%H:%M:%SZ)",
  "version": "${APP_VERSION}",
  "dbName": "${DB_NAME}",
  "collections": [${COLLECTIONS_JSON}
  ],
  "totalDocuments": ${TOTAL_DOCS},
  "archiveSizeBytes": ${ARCHIVE_SIZE}
}
MANIFEST_EOF

echo "Manifest generated: collections=$(echo -e "${COLLECTIONS_JSON}" | grep -c '"name"'), totalDocs=${TOTAL_DOCS}"

echo "Compressing backup..."
tar -czf "${BACKUP_PATH}.tar.gz" -C "${BACKUP_DIR}" "cermont_backup_${TIMESTAMP}"
rm -rf "${BACKUP_PATH}"

echo "Backup completed: ${BACKUP_PATH}.tar.gz"
echo "Manifest embedded in archive: manifest.json"

# Rotate old backups (keep last 7 days)
find "${BACKUP_DIR}" -name "cermont_backup_*.tar.gz" -mtime +7 -delete
echo "Old backups rotated (kept last 7 days)"
