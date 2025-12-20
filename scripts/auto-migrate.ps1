# 🔄 Script de Migraciones Automáticas
# Ejecuta migraciones de forma segura (local y producción)

param(
    [switch]$Production,
    [switch]$Reset,
    [switch]$Seed
)

Write-Host "================================" -ForegroundColor Cyan
Write-Host "  Migraciones Automáticas      " -ForegroundColor Cyan
Write-Host "================================" -ForegroundColor Cyan
Write-Host ""

$ErrorActionPreference = "Stop"

Set-Location apps/api

# Verificar .env
if ($Production) {
    if (-not (Test-Path ".env.production")) {
        Write-Host "❌ ERROR: No existe .env.production" -ForegroundColor Red
        Write-Host "   Ejecuta primero: .\scripts\setup-production.ps1" -ForegroundColor Yellow
        exit 1
    }
    Copy-Item ".env.production" ".env" -Force
    Write-Host "✅ Usando configuración de producción" -ForegroundColor Green
} else {
    if (-not (Test-Path ".env")) {
        Write-Host "❌ ERROR: No existe .env" -ForegroundColor Red
        Write-Host "   Ejecuta primero: .\scripts\setup-local.ps1" -ForegroundColor Yellow
        exit 1
    }
    Write-Host "✅ Usando configuración local" -ForegroundColor Green
}

# Verificar DATABASE_URL
$envContent = Get-Content .env -Raw
if (-not $envContent -match 'DATABASE_URL="([^"]+)"') {
    Write-Host "❌ ERROR: DATABASE_URL no encontrado en .env" -ForegroundColor Red
    exit 1
}

$dbUrl = $matches[1]
Write-Host "📊 Base de datos: $($dbUrl -replace ':[^:@]+@', ':****@')" -ForegroundColor Cyan

# Verificar conexión
Write-Host ""
Write-Host "🔍 Verificando conexión a la base de datos..." -ForegroundColor Yellow
try {
    $env:DATABASE_URL = $dbUrl
    pnpm prisma db pull --force 2>&1 | Out-Null
    Write-Host "✅ Conexión exitosa" -ForegroundColor Green
} catch {
    Write-Host "⚠️  Advertencia: No se pudo verificar conexión" -ForegroundColor Yellow
    Write-Host "   Continuando de todas formas..." -ForegroundColor Yellow
}

# Generar cliente Prisma primero
Write-Host ""
Write-Host "📦 Generando cliente Prisma..." -ForegroundColor Yellow
try {
    pnpm prisma:generate
    Write-Host "✅ Cliente Prisma generado" -ForegroundColor Green
} catch {
    Write-Host "❌ ERROR: No se pudo generar Prisma" -ForegroundColor Red
    exit 1
}

# Ejecutar migraciones
Write-Host ""
if ($Reset) {
    Write-Host "⚠️  RESET: Esto eliminará TODOS los datos" -ForegroundColor Red
    $confirm = Read-Host "¿Estás seguro? Escribe 'SI' para confirmar"
    if ($confirm -ne "SI") {
        Write-Host "Cancelado" -ForegroundColor Yellow
        exit 0
    }
    Write-Host "🔄 Reseteando base de datos..." -ForegroundColor Yellow
    pnpm prisma:migrate:reset
    Write-Host "✅ Base de datos reseteada" -ForegroundColor Green
} else {
    if ($Production) {
        Write-Host "🚀 Aplicando migraciones en PRODUCCIÓN..." -ForegroundColor Yellow
        Write-Host "   (Usando migrate deploy - NO crea nuevas migraciones)" -ForegroundColor Cyan
        pnpm prisma:migrate deploy
    } else {
        Write-Host "🔄 Aplicando migraciones en desarrollo..." -ForegroundColor Yellow
        Write-Host "   (Si hay cambios pendientes, se creará una nueva migración)" -ForegroundColor Cyan
        pnpm prisma:migrate dev --name auto_migration
    }
    Write-Host "✅ Migraciones aplicadas" -ForegroundColor Green
}

# Seed opcional
if ($Seed) {
    Write-Host ""
    Write-Host "🌱 Poblando base de datos con datos de prueba..." -ForegroundColor Yellow
    try {
        pnpm prisma:seed
        Write-Host "✅ Datos de prueba insertados" -ForegroundColor Green
    } catch {
        Write-Host "⚠️  Advertencia: No se pudo ejecutar seed" -ForegroundColor Yellow
    }
}

Write-Host ""
Write-Host "================================" -ForegroundColor Green
Write-Host "  Migraciones completadas       " -ForegroundColor Green
Write-Host "================================" -ForegroundColor Green
Write-Host ""

Set-Location ../..
