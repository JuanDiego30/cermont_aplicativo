# scripts/fix-dependencies.ps1
# Instala dependencias de tipos típicas (idempotente)
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

Write-Host "Instalando/verificando dependencias faltantes..." -ForegroundColor Cyan
Write-Host ""

Write-Host "1) Backend (apps/api): types Express/Multer/Node" -ForegroundColor Yellow
Invoke-InDir "apps/api" {
    npm install --save-dev @types/express@^4.17.21 @types/multer@^1.4.11 @types/node@latest
}
Write-Host "OK: Backend types actualizados" -ForegroundColor Green
Write-Host ""

Write-Host "2) Frontend (apps/web): @types/node" -ForegroundColor Yellow
Invoke-InDir "apps/web" {
    npm install --save-dev @types/node@latest
}
Write-Host "OK: Frontend types actualizados" -ForegroundColor Green
Write-Host ""

Write-Host "OK: DEPENDENCIAS ACTUALIZADAS" -ForegroundColor Green
