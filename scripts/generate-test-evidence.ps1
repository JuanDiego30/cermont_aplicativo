# CERMONT APLICATIVO — Script de Evidencia de Pruebas (Anexo G)
# =============================================================================
# REFACTOR-06: Genera evidencia de ejecucion de pruebas para el libro de grado.
# Uso: Ejecutar desde la raiz del monorepo en PowerShell
#   .\scripts\generate-test-evidence.ps1
# =============================================================================

$ErrorActionPreference = "Stop"
$OutputFile = "test-evidence.txt"

Write-Host "============================================================" -ForegroundColor Cyan
Write-Host "  CERMONT APLICATIVO — EVIDENCIA DE PRUEBAS" -ForegroundColor Cyan
Write-Host "  Para Anexo G del libro de grado" -ForegroundColor Cyan
Write-Host "============================================================" -ForegroundColor Cyan
Write-Host ""

# ── Metadata del entorno ──────────────────────────────────────
$evidence = @()
$evidence += "============================================================"
$evidence += "CERMONT APLICATIVO — EVIDENCIA DE PRUEBAS AUTOMATIZADAS"
$evidence += "============================================================"
$evidence += "Fecha de ejecucion: $(Get-Date -Format 'yyyy-MM-dd HH:mm:ss')"
$evidence += "Hostname: $env:COMPUTERNAME"
$evidence += "Sistema operativo: $(Get-CimInstance Win32_OperatingSystem | Select-Object -ExpandProperty Caption)"
$evidence += ""

# ── Versiones de herramientas ──────────────────────────────────
$evidence += "--- Versiones de herramientas ---"
$evidence += "Node.js: $(node --version)"
$evidence += "npm: $(npm --version)"
$evidence += ""

# ── Informacion del repositorio ────────────────────────────────
$evidence += "--- Informacion del repositorio ---"
$evidence += "Branch: $(git rev-parse --abbrev-ref HEAD)"
$evidence += "Commit: $(git rev-parse --short HEAD)"
$evidence += "Commit Date: $(git log -1 --format='%ai')"
$evidence += ""

# ── Backend Tests ──────────────────────────────────────────────
Write-Host "[1/2] Ejecutando pruebas del backend..." -ForegroundColor Yellow
$evidence += "============================================================"
$evidence += "SUITE BACKEND — Vitest (Unitarias + Integracion)"
$evidence += "============================================================"

try {
    $backendOutput = npm run test -w backend -- --reporter=verbose 2>&1
    $backendResult = $LASTEXITCODE
    $evidence += $backendOutput
    $evidence += ""
    if ($backendResult -eq 0) {
        Write-Host "  ✅ Backend: TODAS LAS PRUEBAS PASARON" -ForegroundColor Green
    } else {
        Write-Host "  ⚠️ Backend: Algunas pruebas fallaron (exit code: $backendResult)" -ForegroundColor Yellow
    }
} catch {
    $evidence += "ERROR: No se pudo ejecutar npm run test -w backend"
    $evidence += $_.Exception.Message
    Write-Host "  ❌ Backend: Error al ejecutar pruebas" -ForegroundColor Red
}

# ── Frontend Tests ─────────────────────────────────────────────
Write-Host "[2/2] Ejecutando pruebas del frontend..." -ForegroundColor Yellow
$evidence += ""
$evidence += "============================================================"
$evidence += "SUITE FRONTEND — Vitest (Unitarias)"
$evidence += "============================================================"

try {
    $frontendOutput = npm run test -w frontend -- --reporter=verbose 2>&1
    $frontendResult = $LASTEXITCODE
    $evidence += $frontendOutput
    $evidence += ""
    if ($frontendResult -eq 0) {
        Write-Host "  ✅ Frontend: TODAS LAS PRUEBAS PASARON" -ForegroundColor Green
    } else {
        Write-Host "  ⚠️ Frontend: Algunas pruebas fallaron (exit code: $frontendResult)" -ForegroundColor Yellow
    }
} catch {
    $evidence += "ERROR: No se pudo ejecutar npm run test -w frontend"
    $evidence += $_.Exception.Message
    Write-Host "  ❌ Frontend: Error al ejecutar pruebas" -ForegroundColor Red
}

# ── Guardar evidencia ──────────────────────────────────────────
$evidence | Out-File -FilePath $OutputFile -Encoding utf8

Write-Host ""
Write-Host "============================================================" -ForegroundColor Cyan
Write-Host "  ✅ Evidencia guardada en: $OutputFile" -ForegroundColor Green
Write-Host "  📄 Incluir este archivo como Anexo G en el libro de grado." -ForegroundColor Cyan
Write-Host "============================================================" -ForegroundColor Cyan
