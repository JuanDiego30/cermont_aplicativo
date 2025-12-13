# scripts/validate-typescript.ps1
$ErrorActionPreference = 'Stop'

function Invoke-InDir {
    param(
        [Parameter(Mandatory = $true)][string]$Path,
        [Parameter(Mandatory = $true)][scriptblock]$Script
    )
    Push-Location $Path
    try { & $Script }
    finally { Pop-Location }
}

Write-Host "Validando TypeScript..." -ForegroundColor Cyan
Write-Host ""

Write-Host "1) Backend TypeScript:" -ForegroundColor Yellow
Invoke-InDir "apps/api" {
    npx tsc --noEmit
}
Write-Host "OK: Backend sin errores" -ForegroundColor Green
Write-Host ""

Write-Host "2) Frontend TypeScript:" -ForegroundColor Yellow
Invoke-InDir "apps/web" {
    npx tsc --noEmit
}
Write-Host "OK: Frontend sin errores" -ForegroundColor Green
Write-Host ""

Write-Host "OK: VALIDACION COMPLETADA" -ForegroundColor Green
