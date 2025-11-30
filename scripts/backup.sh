#!/bin/bash

# ============================================================================
# CERMONT ATG - DATABASE BACKUP SCRIPT
# ============================================================================
# Este script realiza backups automáticos de la base de datos y uploads
# Configurar en crontab: 0 3 * * * /path/to/backup.sh
# ============================================================================

set -e

# Configuration
BACKUP_DIR="${BACKUP_DIR:-/var/backups/cermont}"
RETENTION_DAYS="${RETENTION_DAYS:-7}"
DATE=$(date +%Y%m%d_%H%M%S)
APP_DIR="${APP_DIR:-/var/www/cermont}"

# Database config (from environment or defaults)
PGHOST="${PGHOST:-localhost}"
PGPORT="${PGPORT:-5432}"
PGUSER="${PGUSER:-cermont_user}"
PGPASSWORD="${PGPASSWORD:-}"
PGDATABASE="${PGDATABASE:-cermont_db}"

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

log_info() {
    echo -e "${GREEN}[$(date '+%Y-%m-%d %H:%M:%S')]${NC} $1"
}

log_warning() {
    echo -e "${YELLOW}[$(date '+%Y-%m-%d %H:%M:%S')]${NC} $1"
}

log_error() {
    echo -e "${RED}[$(date '+%Y-%m-%d %H:%M:%S')]${NC} $1"
}

# Create backup directory
mkdir -p "$BACKUP_DIR"

log_info "=== Iniciando backup de CERMONT ATG ==="

# ========================================
# Database Backup
# ========================================
log_info "Realizando backup de base de datos..."

DB_BACKUP_FILE="$BACKUP_DIR/db_${DATE}.sql.gz"

if PGPASSWORD="$PGPASSWORD" pg_dump \
    -h "$PGHOST" \
    -p "$PGPORT" \
    -U "$PGUSER" \
    -d "$PGDATABASE" \
    --no-owner \
    --no-acl \
    --clean \
    --if-exists | gzip > "$DB_BACKUP_FILE"; then
    
    DB_SIZE=$(du -h "$DB_BACKUP_FILE" | cut -f1)
    log_info "✅ Backup de base de datos completado: $DB_BACKUP_FILE ($DB_SIZE)"
else
    log_error "❌ Error en backup de base de datos"
    exit 1
fi

# ========================================
# Uploads Backup
# ========================================
UPLOADS_DIR="$APP_DIR/uploads"

if [[ -d "$UPLOADS_DIR" ]]; then
    log_info "Realizando backup de uploads..."
    
    UPLOADS_BACKUP_FILE="$BACKUP_DIR/uploads_${DATE}.tar.gz"
    
    if tar -czf "$UPLOADS_BACKUP_FILE" -C "$APP_DIR" uploads 2>/dev/null; then
        UPLOADS_SIZE=$(du -h "$UPLOADS_BACKUP_FILE" | cut -f1)
        log_info "✅ Backup de uploads completado: $UPLOADS_BACKUP_FILE ($UPLOADS_SIZE)"
    else
        log_warning "⚠️ Backup de uploads falló o directorio vacío"
    fi
else
    log_warning "⚠️ Directorio de uploads no existe: $UPLOADS_DIR"
fi

# ========================================
# Config Files Backup
# ========================================
log_info "Realizando backup de configuraciones..."

CONFIG_BACKUP_FILE="$BACKUP_DIR/config_${DATE}.tar.gz"

# Create temp directory for config files
TEMP_CONFIG_DIR=$(mktemp -d)

# Copy config files
cp "$APP_DIR/backend/.env" "$TEMP_CONFIG_DIR/backend.env" 2>/dev/null || true
cp "$APP_DIR/frontend/.env.production" "$TEMP_CONFIG_DIR/frontend.env" 2>/dev/null || true
cp "$APP_DIR/ecosystem.config.js" "$TEMP_CONFIG_DIR/" 2>/dev/null || true

# Create tarball
if tar -czf "$CONFIG_BACKUP_FILE" -C "$TEMP_CONFIG_DIR" . 2>/dev/null; then
    CONFIG_SIZE=$(du -h "$CONFIG_BACKUP_FILE" | cut -f1)
    log_info "✅ Backup de configuración completado: $CONFIG_BACKUP_FILE ($CONFIG_SIZE)"
fi

# Cleanup temp
rm -rf "$TEMP_CONFIG_DIR"

# ========================================
# Cleanup Old Backups
# ========================================
log_info "Limpiando backups antiguos (>$RETENTION_DAYS días)..."

DELETED_COUNT=$(find "$BACKUP_DIR" -type f -mtime +$RETENTION_DAYS -delete -print | wc -l)

if [[ $DELETED_COUNT -gt 0 ]]; then
    log_info "✅ Eliminados $DELETED_COUNT archivos antiguos"
else
    log_info "No hay backups antiguos para eliminar"
fi

# ========================================
# Summary
# ========================================
echo ""
log_info "=== RESUMEN DEL BACKUP ==="
echo ""

TOTAL_SIZE=$(du -sh "$BACKUP_DIR" | cut -f1)
BACKUP_COUNT=$(ls -1 "$BACKUP_DIR" | wc -l)

echo "  📁 Directorio: $BACKUP_DIR"
echo "  📊 Tamaño total: $TOTAL_SIZE"
echo "  📄 Archivos: $BACKUP_COUNT"
echo ""

log_info "=== Backup completado exitosamente ==="

# ========================================
# Optional: Upload to remote storage
# ========================================

# Uncomment and configure for S3 backup
# if command -v aws &> /dev/null; then
#     log_info "Subiendo a S3..."
#     aws s3 sync "$BACKUP_DIR" "s3://your-bucket/cermont-backups/" --delete
#     log_info "✅ Backup subido a S3"
# fi

# Uncomment and configure for Google Cloud Storage
# if command -v gsutil &> /dev/null; then
#     log_info "Subiendo a Google Cloud Storage..."
#     gsutil -m rsync -d "$BACKUP_DIR" "gs://your-bucket/cermont-backups/"
#     log_info "✅ Backup subido a GCS"
# fi

exit 0
