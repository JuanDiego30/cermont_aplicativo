# scripts/generate-report.ps1
# Genera un reporte simple en ./reports

$ErrorActionPreference = 'Stop'

Write-Host "Generando Reporte Detallado..." -ForegroundColor Cyan

New-Item -ItemType Directory -Force -Path "reports" | Out-Null
$timestamp = Get-Date -Format "yyyyMMdd_HHmmss"
$report = Join-Path "reports" "analysis_$timestamp.txt"

function Invoke-InDir {
    param(
        [Parameter(Mandatory = $true)][string]$Path,
        [Parameter(Mandatory = $true)][scriptblock]$Script
    )
    Push-Location $Path
    try { & $Script }
    finally { Pop-Location }
}

$lines = New-Object System.Collections.Generic.List[string]
$lines.Add("ANALISIS DE CERMONT - $timestamp")
$lines.Add("==================================")
$lines.Add("")

# 1. Estructura
$lines.Add("1. ESTRUCTURA:")
$lines.Add("--------------")
$tsCount = (Get-ChildItem -Path "apps" -Recurse -File -Include *.ts,*.tsx -ErrorAction SilentlyContinue | Measure-Object).Count
$lines.Add("$tsCount archivos TypeScript encontrados")
$lines.Add("")

# 2. Módulos backend
$lines.Add("2. MODULOS BACKEND:")
$lines.Add("------------------")
$modulesPath = "apps/api/src/modules"
if (Test-Path $modulesPath) {
    Get-ChildItem -Directory $modulesPath | ForEach-Object { $lines.Add($_.Name) }
} else {
    $lines.Add("No se encontro apps/api/src/modules")
}
$lines.Add("")

# 3. Outdated
$lines.Add("3. DEPENDENCIAS OUTDATED (root):")
$lines.Add("-------------------------------")
try {
    $outdated = (npm outdated --parseable 2>$null)
    if ([string]::IsNullOrWhiteSpace($outdated)) { $lines.Add("Todas actualizadas") } else { $lines.Add($outdated) }
} catch {
    $lines.Add("No se pudo ejecutar npm outdated")
}
$lines.Add("")

# 4. Vulnerabilidades
$lines.Add("4. VULNERABILIDADES (moderate+):")
$lines.Add("-------------------------------")
try {
    $audit = (npm audit --audit-level=moderate 2>$null | Select-String -Pattern "vulnerabilities|dependencies" | ForEach-Object { $_.Line })
    if ($audit) { $audit | ForEach-Object { $lines.Add($_) } } else { $lines.Add("Sin vulnerabilidades reportadas (o audit no disponible)") }
} catch {
    $lines.Add("No se pudo ejecutar npm audit")
}
$lines.Add("")

# 5. Tamaño
$lines.Add("5. TAMANO DEL CODIGO:")
$lines.Add("--------------------")
try {
    $apiSize = (Get-ChildItem -Recurse -File "apps/api/src" -ErrorAction SilentlyContinue | Measure-Object -Property Length -Sum).Sum
    $webSize = (Get-ChildItem -Recurse -File "apps/web/src" -ErrorAction SilentlyContinue | Measure-Object -Property Length -Sum).Sum
    $lines.Add("apps/api/src: $apiSize bytes")
    $lines.Add("apps/web/src: $webSize bytes")
} catch {
    $lines.Add("No se pudo calcular tamaño")
}

$lines | Out-File -FilePath $report -Encoding UTF8
Write-Host "OK: Reporte guardado en: $report" -ForegroundColor Green
