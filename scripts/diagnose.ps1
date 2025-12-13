# scripts/diagnose.ps1
# Diagnóstico rápido del repositorio (Windows/PowerShell)

Write-Host "INICIANDO DIAGNOSTICO DE CERMONT..." -ForegroundColor Cyan
Write-Host ""

function Invoke-InDir {
    param(
        [Parameter(Mandatory = $true)][string]$Path,
        [Parameter(Mandatory = $true)][scriptblock]$Script
    )
    Push-Location $Path
    try { & $Script }
    finally { Pop-Location }
}

# 1) Info repo
Write-Host "1) Informacion del Repositorio:" -ForegroundColor Yellow
Write-Host "================================" -ForegroundColor Yellow
if (Test-Path .git) {
    Write-Host "OK: Git repository encontrado" -ForegroundColor Green
    try {
        $branch = (git branch --show-current) 2>$null
        $commits = (git rev-list --count HEAD) 2>$null
        Write-Host "Rama actual: $branch"
        Write-Host "Commits: $commits"
    } catch {
        Write-Host "WARN: No se pudo consultar git (git instalado?)" -ForegroundColor Yellow
    }
} else {
    Write-Host "ERROR: No es un repositorio git" -ForegroundColor Red
}
Write-Host ""

# 2) Node / npm
Write-Host "2) Entorno Node.js:" -ForegroundColor Yellow
Write-Host "===================" -ForegroundColor Yellow
try {
    Write-Host ("Node: " + (node --version))
    Write-Host ("npm:  " + (npm --version))
} catch {
    Write-Host "ERROR: Node/npm no disponibles en PATH" -ForegroundColor Red
}
Write-Host ""

# 3) Estructura
Write-Host "3) Estructura de Carpetas:" -ForegroundColor Yellow
Write-Host "=========================" -ForegroundColor Yellow
Write-Host "Root files:"
Get-ChildItem -File | Select-Object -ExpandProperty Name | ForEach-Object { "  $_" }
Write-Host ""
Write-Host "Subdirectorios:"
Get-ChildItem -Directory | Select-Object -ExpandProperty Name | ForEach-Object { "  $_/" }
Write-Host ""

# 4) Dependencias
Write-Host "4) Dependencias (top-level):" -ForegroundColor Yellow
Write-Host "============================" -ForegroundColor Yellow
Write-Host "Root package.json:"
try { npm list --depth=0 | Select-Object -First 25 } catch { Write-Host "WARN: npm list fallo" -ForegroundColor Yellow }
Write-Host ""

Write-Host "Backend (apps/api):"
Invoke-InDir "apps/api" {
    try { npm list --depth=0 | Select-Object -First 20 } catch { Write-Host "WARN: npm list fallo" -ForegroundColor Yellow }
}
Write-Host ""

Write-Host "Frontend (apps/web):"
Invoke-InDir "apps/web" {
    try { npm list --depth=0 | Select-Object -First 20 } catch { Write-Host "WARN: npm list fallo" -ForegroundColor Yellow }
}
Write-Host ""

# 5) TypeScript
Write-Host "5) Validacion TypeScript (primeras lineas):" -ForegroundColor Yellow
Write-Host "==================================================" -ForegroundColor Yellow
Write-Host "Backend:"
Invoke-InDir "apps/api" {
    try { npx tsc --noEmit 2>&1 | Select-Object -First 15 } catch { Write-Host "WARN: tsc fallo" -ForegroundColor Yellow }
}
Write-Host ""
Write-Host "Frontend:"
Invoke-InDir "apps/web" {
    try { npx tsc --noEmit 2>&1 | Select-Object -First 15 } catch { Write-Host "WARN: tsc fallo" -ForegroundColor Yellow }
}
Write-Host ""

Write-Host "OK: DIAGNOSTICO COMPLETADO" -ForegroundColor Green
