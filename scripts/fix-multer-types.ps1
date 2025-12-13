# scripts/fix-multer-types.ps1
# Asegura que se use Express.Multer.File en evidencias (idempotente)
$ErrorActionPreference = 'Stop'

$controller = "apps/api/src/modules/evidencias/evidencias.controller.ts"
$service = "apps/api/src/modules/evidencias/evidencias.service.ts"

function Ensure-ExpressImport($path) {
    $content = Get-Content $path -Raw
    if ($content -notmatch "from 'express'" -and $content -match "Express\.Multer\.File") {
        # Si ya usa Express.Multer.File pero no importa express, añadimos el import al inicio
        $content = "import { Express } from 'express';`r`n" + $content
        Set-Content -Path $path -Value $content -Encoding UTF8
        return $true
    }
    return $false
}

function Replace-AnyFile($path) {
    $content = Get-Content $path -Raw
    $newContent = $content -replace "file:\s*any", "file: Express.Multer.File"
    if ($newContent -ne $content) {
        Set-Content -Path $path -Value $newContent -Encoding UTF8
        return $true
    }
    return $false
}

Write-Host "Corrigiendo tipos de Multer..." -ForegroundColor Cyan
Write-Host ""

foreach ($p in @($controller, $service)) {
    if (Test-Path $p) {
        $changed1 = Replace-AnyFile $p
        $changed2 = Ensure-ExpressImport $p
        if ($changed1 -or $changed2) {
            Write-Host "OK: Actualizado: $p" -ForegroundColor Green
        } else {
            Write-Host "INFO: Sin cambios: $p" -ForegroundColor DarkGray
        }
    } else {
        Write-Host "WARN: No encontrado: $p" -ForegroundColor Yellow
    }
}

Write-Host ""
Write-Host "OK: TIPOS DE MULTER VERIFICADOS" -ForegroundColor Green
