# ============================================
# Script para actualizar .env a PostgreSQL
# ============================================

$envPath = "apps\api\.env"

Write-Host "=== Actualizando .env a PostgreSQL ===" -ForegroundColor Cyan
Write-Host ""

# Verificar si el archivo existe
if (-not (Test-Path $envPath)) {
    Write-Host "ERROR: No se encuentra el archivo $envPath" -ForegroundColor Red
    Write-Host "Crea el archivo primero siguiendo CREAR-ENV-MANUAL.md" -ForegroundColor Yellow
    exit 1
}

Write-Host "Archivo encontrado: $envPath" -ForegroundColor Green

# Contenido actualizado para PostgreSQL
$newContent = @"
# ============================================
# PostgreSQL Database Configuration
# ============================================
DATABASE_URL="postgresql://postgres:admin@localhost:5432/cermont_fsm?connect_timeout=10&sslmode=prefer"

# ============================================
# JWT Configuration
# ============================================
JWT_SECRET="dev-secret-key-change-in-production-12345678901234567890123456789012"
JWT_EXPIRES_IN="7d"
JWT_REFRESH_EXPIRES_IN="30d"

# ============================================
# Server Configuration
# ============================================
PORT=4000
NODE_ENV=development

# ============================================
# CORS & Frontend
# ============================================
FRONTEND_URL="http://localhost:3000"
CORS_ORIGIN="http://localhost:3000"

# ============================================
# Logging
# ============================================
LOG_LEVEL="debug"

# ============================================
# Redis (Opcional - Para caché y rate limiting)
# ============================================
# REDIS_HOST=localhost
# REDIS_PORT=6379
# REDIS_PASSWORD=

# ============================================
# Email (Opcional)
# ============================================
# SMTP_HOST=smtp.gmail.com
# SMTP_PORT=587
# SMTP_USER=tu-email@gmail.com
# SMTP_PASS=tu-contraseña-app
# EMAIL_FROM=noreply@cermont.com
"@

# Hacer backup del archivo anterior
$backupPath = "$envPath.backup.$(Get-Date -Format 'yyyyMMdd-HHmmss')"
Copy-Item $envPath $backupPath -Force
Write-Host "Backup creado: $backupPath" -ForegroundColor Yellow

# Escribir nuevo contenido
$newContent | Out-File -FilePath $envPath -Encoding utf8 -NoNewline

Write-Host ""
Write-Host "✅ Archivo .env actualizado correctamente!" -ForegroundColor Green
Write-Host ""
Write-Host "Cambios realizados:" -ForegroundColor Cyan
Write-Host "  - DATABASE_URL actualizado a PostgreSQL" -ForegroundColor White
Write-Host "  - Base de datos: cermont_fsm" -ForegroundColor White
Write-Host "  - Usuario: postgres" -ForegroundColor White
Write-Host ""
Write-Host "Próximo paso: Ejecutar 'pnpm run dev'" -ForegroundColor Yellow

