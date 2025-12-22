# reset-database-quick.ps1
# Versión rápida usando Prisma Reset (sin confirmación)

Write-Host "🗑️  Limpiando base de datos con Prisma Reset..." -ForegroundColor Yellow
Write-Host "⚠️  ADVERTENCIA: Esto eliminará TODOS los datos sin confirmación" -ForegroundColor Red
Write-Host ""

Set-Location apps/api

Write-Host "📊 Ejecutando: npx prisma migrate reset --force" -ForegroundColor Cyan
& npx prisma migrate reset --force

if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Error ejecutando reset" -ForegroundColor Red
    Set-Location ../..
    exit 1
}

Set-Location ../..

Write-Host ""
Write-Host "✅ ¡Base de datos limpiada y recreada!" -ForegroundColor Green
Write-Host "💡 Puedes ver los datos con: cd apps/api && npx prisma studio" -ForegroundColor Yellow

