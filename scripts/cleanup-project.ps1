# 🧹 Script de Limpieza - Elimina archivos innecesarios

Write-Host "================================" -ForegroundColor Cyan
Write-Host "  Limpieza de Proyecto         " -ForegroundColor Cyan
Write-Host "================================" -ForegroundColor Cyan
Write-Host ""

$ErrorActionPreference = "Continue"

# Archivos temporales y de desarrollo que se pueden eliminar
$filesToRemove = @(
    # Archivos de error/log temporales
    "apps/api/error.txt",
    "apps/api/*.log",
    "apps/api/logs/*.log",
    
    # Archivos de build antiguos
    "apps/api/dist",
    "apps/web/.next",
    "apps/web/out",
    
    # Archivos de prueba temporales
    "*.tmp",
    "*.bak",
    "*~",
    
    # Archivos de script temporales (si existen)
    "clean_encoding_full.js",
    "clean_header.js",
    "clean_schema.js",
    "fix_encoding.js",
    "fix_schema_robust.js",
    "sanitize_schema.js",
    
    # Archivos de reporte temporales
    "api_build_errors.txt",
    "build_check.txt",
    "build_final.txt",
    "build_log*.txt",
    "gen_error.txt",
    "prisma_error.txt",
    "web_build_errors.txt"
)

Write-Host "🗑️  Eliminando archivos temporales..." -ForegroundColor Yellow

$removedCount = 0
$failedCount = 0

foreach ($pattern in $filesToRemove) {
    $files = Get-ChildItem -Path . -Filter $pattern -Recurse -ErrorAction SilentlyContinue | Where-Object {
        $_.FullName -notmatch "node_modules" -and
        $_.FullName -notmatch "\.git"
    }
    
    foreach ($file in $files) {
        try {
            Remove-Item $file.FullName -Force -ErrorAction Stop
            Write-Host "  ✅ Eliminado: $($file.Name)" -ForegroundColor Gray
            $removedCount++
        } catch {
            Write-Host "  ⚠️  No se pudo eliminar: $($file.Name)" -ForegroundColor Yellow
            $failedCount++
        }
    }
}

# Limpiar directorios de build
Write-Host ""
Write-Host "🗑️  Limpiando directorios de build..." -ForegroundColor Yellow

$dirsToClean = @(
    "apps/api/dist",
    "apps/web/.next",
    "apps/web/out",
    ".turbo"
)

foreach ($dir in $dirsToClean) {
    if (Test-Path $dir) {
        try {
            Remove-Item $dir -Recurse -Force -ErrorAction Stop
            Write-Host "  ✅ Eliminado: $dir" -ForegroundColor Gray
            $removedCount++
        } catch {
            Write-Host "  ⚠️  No se pudo eliminar: $dir (puede estar en uso)" -ForegroundColor Yellow
        }
    }
}

Write-Host ""
Write-Host "================================" -ForegroundColor Green
Write-Host "  Limpieza completada           " -ForegroundColor Green
Write-Host "================================" -ForegroundColor Green
Write-Host ""
Write-Host "📊 Resultados:" -ForegroundColor Cyan
Write-Host "   - Eliminados: $removedCount archivos/directorios" -ForegroundColor Green
if ($failedCount -gt 0) {
    Write-Host "   - Fallidos: $failedCount" -ForegroundColor Yellow
}
Write-Host ""
Write-Host "💡 Tip: Puedes regenerar builds con:" -ForegroundColor Cyan
Write-Host "   pnpm run build" -ForegroundColor White
Write-Host ""
