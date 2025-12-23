# Script para resetear base de datos y ejecutar seed
# Uso: .\scripts\reset-and-seed.ps1

Write-Host "`n🔄 RESET Y SEED DE BASE DE DATOS - CERMONT" -ForegroundColor Cyan
Write-Host "==========================================`n" -ForegroundColor Cyan

# Verificar que estamos en el directorio correcto
if (-not (Test-Path "apps/api")) {
    Write-Host "❌ Error: Ejecutar este script desde la raíz del proyecto" -ForegroundColor Red
    exit 1
}

Set-Location apps/api

# Cargar variables de entorno
if (Test-Path ".env") {
    Write-Host "📋 Cargando variables de entorno desde .env..." -ForegroundColor Yellow
    Get-Content .env | ForEach-Object {
        if ($_ -match '^\s*([^#][^=]+)=(.*)$') {
            $name = $matches[1].Trim()
            $value = $matches[2].Trim()
            [Environment]::SetEnvironmentVariable($name, $value, "Process")
        }
    }
} else {
    Write-Host "⚠️  No se encontró archivo .env" -ForegroundColor Yellow
}

$DATABASE_URL = $env:DATABASE_URL
if (-not $DATABASE_URL) {
    Write-Host "❌ Error: DATABASE_URL no está configurada" -ForegroundColor Red
    Write-Host "   Configura DATABASE_URL en el archivo .env" -ForegroundColor Yellow
    Set-Location ../..
    exit 1
}

Write-Host "`n📊 Paso 1: Reseteando base de datos..." -ForegroundColor Yellow
Write-Host "   Esto eliminará TODOS los datos. ¿Continuar? (S/N)" -ForegroundColor Yellow
$confirm = Read-Host
if ($confirm -ne "S" -and $confirm -ne "s" -and $confirm -ne "Y" -and $confirm -ne "y") {
    Write-Host "❌ Operación cancelada" -ForegroundColor Red
    Set-Location ../..
    exit 0
}

# Resetear base de datos
Write-Host "`n🗑️  Eliminando todas las tablas..." -ForegroundColor Yellow
& npx prisma migrate reset --force
if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Error reseteando base de datos" -ForegroundColor Red
    Set-Location ../..
    exit 1
}
Write-Host "✅ Base de datos reseteada" -ForegroundColor Green

# Aplicar migraciones
Write-Host "`n📊 Paso 2: Aplicando migraciones..." -ForegroundColor Yellow
& npx prisma migrate deploy
if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Error aplicando migraciones" -ForegroundColor Red
    Set-Location ../..
    exit 1
}
Write-Host "✅ Migraciones aplicadas" -ForegroundColor Green

# Generar Prisma Client
Write-Host "`n📊 Paso 3: Generando Prisma Client..." -ForegroundColor Yellow
& npx prisma generate
if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Error generando Prisma Client" -ForegroundColor Red
    Set-Location ../..
    exit 1
}
Write-Host "✅ Prisma Client generado" -ForegroundColor Green

# Ejecutar seed
Write-Host "`n📊 Paso 4: Ejecutando seed (creando usuario admin)..." -ForegroundColor Yellow
& npx tsx prisma/seed.ts
if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Error ejecutando seed" -ForegroundColor Red
    Set-Location ../..
    exit 1
}
Write-Host "✅ Seed ejecutado exitosamente" -ForegroundColor Green

Set-Location ../..

Write-Host "`n🎉 ¡Base de datos reseteada y seed ejecutado!" -ForegroundColor Green
Write-Host ""
Write-Host "📋 Credenciales de acceso:" -ForegroundColor Cyan
Write-Host "   Email: root@cermont.com" -ForegroundColor White
Write-Host "   Password: admin123456" -ForegroundColor White
Write-Host ""
Write-Host "✅ Listo para usar!" -ForegroundColor Green

