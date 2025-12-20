# 🔧 Script de Setup LOCAL - CERMONT Aplicativo
# Configura todo para desarrollo local

param(
    [switch]$SkipDocker,
    [switch]$SkipMigrations
)

Write-Host "================================" -ForegroundColor Cyan
Write-Host "  CERMONT - Setup LOCAL        " -ForegroundColor Cyan
Write-Host "================================" -ForegroundColor Cyan
Write-Host ""

$ErrorActionPreference = "Stop"

# ============================================
# 1. Verificar Node.js y pnpm
# ============================================
Write-Host "[1/7] Verificando Node.js y pnpm..." -ForegroundColor Yellow
try {
    $nodeVersion = node --version
    Write-Host "  ✅ Node.js: $nodeVersion" -ForegroundColor Green
    
    # Verificar pnpm
    $pnpmVersion = pnpm --version 2>$null
    if ($LASTEXITCODE -ne 0) {
        Write-Host "  ⚠️  pnpm no encontrado, instalando..." -ForegroundColor Yellow
        npm install -g pnpm
    }
    Write-Host "  ✅ pnpm: $(pnpm --version)" -ForegroundColor Green
} catch {
    Write-Host "  ❌ ERROR: Node.js no está instalado" -ForegroundColor Red
    Write-Host "  Instalar desde: https://nodejs.org" -ForegroundColor Yellow
    exit 1
}

# ============================================
# 2. Instalar dependencias
# ============================================
Write-Host ""
Write-Host "[2/7] Instalando dependencias..." -ForegroundColor Yellow
try {
    pnpm install
    Write-Host "  ✅ Dependencias instaladas" -ForegroundColor Green
} catch {
    Write-Host "  ❌ ERROR: Falló la instalación de dependencias" -ForegroundColor Red
    exit 1
}

# ============================================
# 3. Configurar .env para desarrollo
# ============================================
Write-Host ""
Write-Host "[3/7] Configurando variables de entorno..." -ForegroundColor Yellow

$apiEnvPath = "apps/api/.env"
$webEnvPath = "apps/web/.env.local"

# Generar JWT_SECRET seguro
$jwtSecret = -join ((65..90) + (97..122) + (48..57) | Get-Random -Count 64 | ForEach-Object {[char]$_})

if (-not (Test-Path $apiEnvPath)) {
    $envContent = @"
# ============================================
# CONFIGURACIÓN LOCAL - Desarrollo
# ============================================
NODE_ENV=development
PORT=4000

# Base de Datos Local (Docker)
DATABASE_URL="postgresql://cermont:cermont_dev_2024@localhost:5432/cermont_db?schema=public"

# JWT Authentication
JWT_SECRET="$jwtSecret"
JWT_EXPIRES_IN="15m"
JWT_REFRESH_EXPIRES_IN="7d"

# Frontend URL (para CORS)
FRONTEND_URL="http://localhost:3000"

# Logging
LOG_LEVEL=debug
"@
    $envContent | Out-File -FilePath $apiEnvPath -Encoding UTF8
    Write-Host "  ✅ Archivo .env creado en apps/api/.env" -ForegroundColor Green
} else {
    Write-Host "  ℹ️  Archivo .env ya existe en apps/api/.env" -ForegroundColor Cyan
}

if (-not (Test-Path $webEnvPath)) {
    $webEnvContent = @"
# ============================================
# CONFIGURACIÓN LOCAL - Frontend
# ============================================
NEXT_PUBLIC_API_URL=http://localhost:4000
"@
    $webEnvContent | Out-File -FilePath $webEnvPath -Encoding UTF8
    Write-Host "  ✅ Archivo .env.local creado en apps/web/.env.local" -ForegroundColor Green
} else {
    Write-Host "  ℹ️  Archivo .env.local ya existe en apps/web/.env.local" -ForegroundColor Cyan
}

# ============================================
# 4. Iniciar Docker (PostgreSQL)
# ============================================
if (-not $SkipDocker) {
    Write-Host ""
    Write-Host "[4/7] Iniciando PostgreSQL con Docker..." -ForegroundColor Yellow
    
    # Verificar Docker
    try {
        docker --version | Out-Null
    } catch {
        Write-Host "  ⚠️  Docker no está instalado o no está corriendo" -ForegroundColor Yellow
        Write-Host "  Puedes instalar Docker Desktop desde: https://www.docker.com/products/docker-desktop" -ForegroundColor Yellow
        Write-Host "  O usar una base de datos PostgreSQL local si ya la tienes instalada" -ForegroundColor Yellow
    }
    
    # Intentar iniciar Docker Compose
    try {
        docker compose up -d db
        Write-Host "  ✅ PostgreSQL iniciado en Docker (puerto 5432)" -ForegroundColor Green
        Write-Host "  ⏳ Esperando que PostgreSQL esté listo..." -ForegroundColor Yellow
        Start-Sleep -Seconds 5
    } catch {
        Write-Host "  ⚠️  No se pudo iniciar Docker. Asegúrate de tener Docker corriendo." -ForegroundColor Yellow
        Write-Host "  Puedes iniciarlo manualmente con: docker compose up -d db" -ForegroundColor Yellow
    }
} else {
    Write-Host ""
    Write-Host "[4/7] Omitiendo Docker (usando base de datos externa)" -ForegroundColor Cyan
}

# ============================================
# 5. Generar cliente Prisma
# ============================================
Write-Host ""
Write-Host "[5/7] Generando cliente Prisma..." -ForegroundColor Yellow
try {
    Set-Location apps/api
    pnpm prisma:generate
    Set-Location ../..
    Write-Host "  ✅ Cliente Prisma generado" -ForegroundColor Green
} catch {
    Write-Host "  ⚠️  Advertencia: No se pudo generar Prisma (puede que la BD no esté disponible aún)" -ForegroundColor Yellow
    Set-Location ../..
}

# ============================================
# 6. Ejecutar migraciones
# ============================================
if (-not $SkipMigrations) {
    Write-Host ""
    Write-Host "[6/7] Ejecutando migraciones de base de datos..." -ForegroundColor Yellow
    Write-Host "  ⚠️  Asegúrate de que PostgreSQL esté corriendo" -ForegroundColor Yellow
    
    try {
        Set-Location apps/api
        pnpm prisma:migrate deploy
        Set-Location ../..
        Write-Host "  ✅ Migraciones aplicadas" -ForegroundColor Green
    } catch {
        Write-Host "  ⚠️  No se pudieron aplicar migraciones automáticamente" -ForegroundColor Yellow
        Write-Host "  Puedes ejecutarlas manualmente con:" -ForegroundColor Yellow
        Write-Host "    cd apps/api && pnpm prisma:migrate deploy" -ForegroundColor Cyan
        Set-Location ../..
    }
} else {
    Write-Host ""
    Write-Host "[6/7] Omitiendo migraciones" -ForegroundColor Cyan
}

# ============================================
# 7. Verificación final
# ============================================
Write-Host ""
Write-Host "[7/7] Verificando configuración..." -ForegroundColor Yellow

$issues = @()

# Verificar .env
if (-not (Test-Path $apiEnvPath)) {
    $issues += "❌ Falta apps/api/.env"
}

# Verificar DATABASE_URL en .env
if (Test-Path $apiEnvPath) {
    $envContent = Get-Content $apiEnvPath -Raw
    if (-not $envContent -match "DATABASE_URL=") {
        $issues += "❌ DATABASE_URL no configurado en apps/api/.env"
    }
    if (-not $envContent -match "JWT_SECRET=") {
        $issues += "❌ JWT_SECRET no configurado en apps/api/.env"
    }
}

if ($issues.Count -eq 0) {
    Write-Host "  ✅ Configuración correcta" -ForegroundColor Green
} else {
    Write-Host "  ⚠️  Problemas encontrados:" -ForegroundColor Yellow
    foreach ($issue in $issues) {
        Write-Host "     $issue" -ForegroundColor Yellow
    }
}

# ============================================
# RESUMEN
# ============================================
Write-Host ""
Write-Host "================================" -ForegroundColor Green
Write-Host "  Setup LOCAL completado        " -ForegroundColor Green
Write-Host "================================" -ForegroundColor Green
Write-Host ""
Write-Host "📝 Próximos pasos:" -ForegroundColor Cyan
Write-Host ""
Write-Host "1. Asegúrate de que PostgreSQL esté corriendo:" -ForegroundColor White
Write-Host "   docker compose up -d db" -ForegroundColor Cyan
Write-Host ""
Write-Host "2. Si es la primera vez, ejecuta migraciones:" -ForegroundColor White
Write-Host "   cd apps/api && pnpm prisma:migrate deploy" -ForegroundColor Cyan
Write-Host ""
Write-Host "3. (Opcional) Poblar base de datos con datos de prueba:" -ForegroundColor White
Write-Host "   cd apps/api && pnpm prisma:seed" -ForegroundColor Cyan
Write-Host ""
Write-Host "4. Iniciar aplicación en desarrollo:" -ForegroundColor White
Write-Host "   pnpm run dev" -ForegroundColor Cyan
Write-Host "   O por separado:" -ForegroundColor White
Write-Host "   - Backend:  pnpm run dev:api  (puerto 4000)" -ForegroundColor Cyan
Write-Host "   - Frontend: pnpm run dev:web  (puerto 3000)" -ForegroundColor Cyan
Write-Host ""
Write-Host "🌐 URLs:" -ForegroundColor Cyan
Write-Host "   - Frontend:  http://localhost:3000" -ForegroundColor Yellow
Write-Host "   - Backend:   http://localhost:4000/api" -ForegroundColor Yellow
Write-Host "   - Swagger:   http://localhost:4000/docs" -ForegroundColor Yellow
Write-Host "   - Health:    http://localhost:4000/api/health" -ForegroundColor Yellow
Write-Host ""
