#!/bin/bash
# Cleanup & Reorganization helper
# Run from the frontend/ directory: `bash scripts/cleanup-and-reorganize.sh`

set -euo pipefail

ROOT_DIR="$(cd "$(dirname "$0")/.." && pwd)"
REPORT_FILE="$ROOT_DIR/CLEANUP_REPORT.md"

info() {
  printf "\033[1;34m[INFO]\033[0m %s\n" "$1"
}

warn() {
  printf "\033[1;33m[WARN]\033[0m %s\n" "$1"
}

step() {
  printf "\n\033[1;32m==> %s\033[0m\n" "$1"
}

step "Fase 1 · Limpieza rápida de build/cache"
rm -rf "$ROOT_DIR/.next" \
       "$ROOT_DIR/.turbopack" \
       "$ROOT_DIR/build" \
       "$ROOT_DIR/dist" \
       "$ROOT_DIR/logs" \
       "$ROOT_DIR/.cache" \
       "$ROOT_DIR/node_modules/.cache" 2>/dev/null || true
info "Artefactos eliminados"

step "Fase 2 · Auditoría de componentes"
if command -v node >/dev/null 2>&1; then
  (cd "$ROOT_DIR" && node scripts/analyze-unused.js)
else
  warn "Node no está disponible en PATH, omitiendo análisis"
fi

step "Fase 3 · Validaciones opcionales"
if [ -f "$ROOT_DIR/package.json" ]; then
  (cd "$ROOT_DIR" && npm run build || warn "npm run build falló")
  (cd "$ROOT_DIR" && npm run type-check || warn "npm run type-check falló")
else
  warn "package.json no encontrado; saltando validaciones"
fi

step "Finalizado"
info "Consulta $REPORT_FILE para revisar candidatos a limpieza."
