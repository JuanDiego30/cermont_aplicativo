# reset-database.ps1
# Script PowerShell para limpiar y recrear base de datos PostgreSQL + Prisma

Write-Host "🗑️  Limpiando base de datos PostgreSQL..." -ForegroundColor Yellow

$DB_HOST = "localhost"
$DB_PORT = "5432"
$DB_USER = "postgres"
$DB_PASSWORD = "admin"
$DB_NAME = "cermont_fsm"

Write-Host "⚠️  ADVERTENCIA: Esto eliminará TODOS los datos de la base de datos" -ForegroundColor Red
Write-Host "Base de datos: $DB_NAME" -ForegroundColor Yellow
$confirmacion = Read-Host "¿Estás seguro? (escribe 'SI' para confirmar)"

if ($confirmacion -ne "SI") {
    Write-Host "❌ Operación cancelada" -ForegroundColor Red
    exit
}

# Configurar password de PostgreSQL
$env:PGPASSWORD = $DB_PASSWORD

Write-Host "`n📊 Paso 1: Eliminando base de datos existente..." -ForegroundColor Yellow
try {
    & psql -h $DB_HOST -p $DB_PORT -U $DB_USER -c "DROP DATABASE IF EXISTS $DB_NAME;" postgres 2>&1 | Out-Null
    Write-Host "✅ Base de datos eliminada" -ForegroundColor Green
} catch {
    Write-Host "⚠️  Base de datos no existe o ya fue eliminada" -ForegroundColor Yellow
}

Write-Host "`n📊 Paso 2: Creando nueva base de datos..." -ForegroundColor Yellow
& psql -h $DB_HOST -p $DB_PORT -U $DB_USER -c "CREATE DATABASE $DB_NAME OWNER $DB_USER;" postgres
Write-Host "✅ Base de datos creada" -ForegroundColor Green

Write-Host "`n📊 Paso 3: Limpiando migraciones anteriores..." -ForegroundColor Yellow
if (Test-Path "apps/api/prisma/migrations") {
    Remove-Item -Path "apps/api/prisma/migrations/*" -Recurse -Force -ErrorAction SilentlyContinue
    Write-Host "✅ Migraciones anteriores eliminadas" -ForegroundColor Green
} else {
    New-Item -ItemType Directory -Path "apps/api/prisma/migrations" -Force | Out-Null
    Write-Host "✅ Carpeta de migraciones creada" -ForegroundColor Green
}

Write-Host "`n📊 Paso 4: Limpiando Prisma Client..." -ForegroundColor Yellow
if (Test-Path "apps/api/node_modules/.prisma") {
    Remove-Item -Path "apps/api/node_modules/.prisma" -Recurse -Force -ErrorAction SilentlyContinue
}
if (Test-Path "node_modules/.prisma") {
    Remove-Item -Path "node_modules/.prisma" -Recurse -Force -ErrorAction SilentlyContinue
}
Write-Host "✅ Archivos Prisma Client eliminados" -ForegroundColor Green

Write-Host "`n📊 Paso 5: Generando Prisma Client..." -ForegroundColor Yellow
Set-Location apps/api
& npx prisma generate
if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Error generando Prisma Client" -ForegroundColor Red
    Set-Location ../..
    exit 1
}
Set-Location ../..
Write-Host "✅ Prisma Client generado" -ForegroundColor Green

Write-Host "`n📊 Paso 6: Creando migración inicial..." -ForegroundColor Yellow
Set-Location apps/api
& npx prisma migrate dev --name init --skip-seed
if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Error creando migración" -ForegroundColor Red
    Set-Location ../..
    exit 1
}
Set-Location ../..
Write-Host "✅ Migración inicial creada y aplicada" -ForegroundColor Green

Write-Host "`n📊 Paso 7: Ejecutando seed (datos iniciales)..." -ForegroundColor Yellow
Set-Location apps/api
$packageJson = Get-Content package.json | ConvertFrom-Json
if ($packageJson.prisma -and $packageJson.prisma.seed) {
    & npx prisma db seed
    if ($LASTEXITCODE -ne 0) {
        Write-Host "⚠️  Error ejecutando seed, continuando..." -ForegroundColor Yellow
    } else {
        Write-Host "✅ Seed ejecutado" -ForegroundColor Green
    }
} else {
    Write-Host "⚠️  No se encontró configuración de seed, omitiendo..." -ForegroundColor Yellow
}
Set-Location ../..

Write-Host "`n🎉 ¡Base de datos limpiada y recreada exitosamente!" -ForegroundColor Green
Write-Host ""
Write-Host "📋 Resumen:" -ForegroundColor Cyan
Write-Host "  - Base de datos: $DB_NAME"
Write-Host "  - Host: ${DB_HOST}:${DB_PORT}"
Write-Host "  - Usuario: $DB_USER"
Write-Host ""
Write-Host "💡 Puedes ver los datos con: cd apps/api && npx prisma studio" -ForegroundColor Yellow

