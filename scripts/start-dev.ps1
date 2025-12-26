# Script de inicio rápido - Desarrollo
# Uso: .\scripts\start-dev.ps1

Write-Host "🚀 Iniciando desarrollo - Cermont Aplicativo" -ForegroundColor Cyan
Write-Host ""

# Verificar que las dependencias estén instaladas
if (-not (Test-Path "node_modules")) {
    Write-Host "⚠️  Instalando dependencias..." -ForegroundColor Yellow
    pnpm install
    Write-Host ""
}

# Verificar que turbo esté instalado
if (-not (Get-Command turbo -ErrorAction SilentlyContinue)) {
    Write-Host "⚠️  Turbo no encontrado. Instalando..." -ForegroundColor Yellow
    pnpm install turbo --save-dev
    Write-Host ""
}

Write-Host "✅ Dependencias verificadas" -ForegroundColor Green
Write-Host ""

# Opciones
Write-Host "Selecciona qué iniciar:" -ForegroundColor Yellow
Write-Host "  1) Backend (API) solamente"
Write-Host "  2) Frontend (Web) solamente"
Write-Host "  3) Ambos (Backend + Frontend)"
Write-Host "  4) Turbo (monorepo completo)"
Write-Host ""

$choice = Read-Host "Opción (1-4)"

switch ($choice) {
    "1" {
        Write-Host ""
        Write-Host "🔧 Iniciando Backend..." -ForegroundColor Cyan
        Set-Location apps/api
        pnpm start:dev
    }
    "2" {
        Write-Host ""
        Write-Host "🌐 Iniciando Frontend..." -ForegroundColor Cyan
        Set-Location apps/web
        pnpm start
    }
    "3" {
        Write-Host ""
        Write-Host "🔧 Iniciando Backend..." -ForegroundColor Cyan
        Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd apps/api; pnpm start:dev"
        Start-Sleep -Seconds 3
        Write-Host "🌐 Iniciando Frontend..." -ForegroundColor Cyan
        Set-Location apps/web
        pnpm start
    }
    "4" {
        Write-Host ""
        Write-Host "🚀 Iniciando con Turbo..." -ForegroundColor Cyan
        pnpm run dev
    }
    default {
        Write-Host "❌ Opción inválida" -ForegroundColor Red
        exit 1
    }
}

