# ⚡ Quick Start - Setup completo para desarrollo local
# Este script hace TODO automáticamente

param(
    [switch]$SkipDocker,
    [switch]$Clean
)

Write-Host "================================" -ForegroundColor Cyan
Write-Host "  CERMONT - Quick Start        " -ForegroundColor Cyan
Write-Host "================================" -ForegroundColor Cyan
Write-Host ""

# Limpiar si se solicita
if ($Clean) {
    Write-Host "🧹 Limpiando proyecto..." -ForegroundColor Yellow
    & "$PSScriptRoot\cleanup-project.ps1"
    Write-Host ""
}

# Ejecutar setup local
Write-Host "⚙️  Configurando entorno local..." -ForegroundColor Yellow
& "$PSScriptRoot\setup-local.ps1" -SkipDocker:$SkipDocker

Write-Host ""
Write-Host "✅ Quick Start completado!" -ForegroundColor Green
Write-Host ""
Write-Host "🚀 Para iniciar la aplicación:" -ForegroundColor Cyan
Write-Host "   pnpm run dev" -ForegroundColor White
Write-Host ""
