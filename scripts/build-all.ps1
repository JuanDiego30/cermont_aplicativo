# scripts/build-all.ps1
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

Write-Host "Compilando proyecto completo..." -ForegroundColor Cyan
Write-Host ""

Write-Host "1) Backend:" -ForegroundColor Yellow
Invoke-InDir "apps/api" { npm run build }
Write-Host "OK: Backend compilado" -ForegroundColor Green
Write-Host ""

Write-Host "2) Frontend:" -ForegroundColor Yellow
Invoke-InDir "apps/web" { npm run build }
Write-Host "OK: Frontend compilado" -ForegroundColor Green
Write-Host ""

Write-Host "OK: BUILD COMPLETADO" -ForegroundColor Green
