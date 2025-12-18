# Cermont Development Cleanup Script
# Uso: .\scripts\cleanup-dev.ps1
# Este script limpia procesos zombie y archivos de bloqueo antes de iniciar el desarrollo.

$ErrorActionPreference = "SilentlyContinue"

Write-Host "🧹 Limpiando entorno de desarrollo..." -ForegroundColor Cyan

# 1. Matar procesos en puertos de desarrollo
$ports = @(3000, 3001, 3002, 3003, 4000)
foreach ($port in $ports) {
    $connections = netstat -aon | Select-String ":$port" | Select-String "LISTENING"
    foreach ($conn in $connections) {
        $parts = $conn -split '\s+'
        $procId = $parts[-1]
        if ($procId -match '^\d+$' -and $procId -ne '0') {
            $process = Get-Process -Id $procId -ErrorAction SilentlyContinue
            if ($process -and $process.Name -eq 'node') {
                Write-Host "  ⚠️  Matando proceso node.exe (PID: $procId) en puerto $port" -ForegroundColor Yellow
                Stop-Process -Id $procId -Force -ErrorAction SilentlyContinue
            }
        }
    }
}

# 2. Eliminar archivos de bloqueo de Next.js
$lockFiles = @(
    "apps/web/.next/dev/lock",
    "apps/web/.next/cache/webpack/client-development/.cache.lock",
    "apps/web/.next/cache/webpack/server-development/.cache.lock"
)

foreach ($lockFile in $lockFiles) {
    if (Test-Path $lockFile) {
        Write-Host "  🗑️  Eliminando: $lockFile" -ForegroundColor Yellow
        Remove-Item $lockFile -Force -ErrorAction SilentlyContinue
    }
}

# 3. Limpiar cache de Turbo (opcional pero recomendado)
if (Test-Path ".turbo") {
    Write-Host "  🗑️  Limpiando cache de Turbo..." -ForegroundColor Yellow
    Remove-Item ".turbo" -Recurse -Force -ErrorAction SilentlyContinue
}

Write-Host "✅ Limpieza completada!" -ForegroundColor Green
Write-Host ""
