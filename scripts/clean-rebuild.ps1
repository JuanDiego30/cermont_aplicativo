# ============================================================================
# Clean & Rebuild Script for Monorepo - PowerShell
# ============================================================================

Write-Host "======================================" -ForegroundColor Cyan
Write-Host "  Cermont Monorepo Clean & Rebuild" -ForegroundColor Cyan
Write-Host "======================================" -ForegroundColor Cyan
Write-Host ""

# 1. Stop all running processes
Write-Host "[1/5] Stopping Node.js processes..." -ForegroundColor Yellow
Get-Process node,next,tsx -ErrorAction SilentlyContinue | Stop-Process -Force -ErrorAction SilentlyContinue

# 2. Clean all build artifacts
Write-Host "[2/5] Cleaning build artifacts..." -ForegroundColor Yellow

$cleanCommands = @(
    "packages\shared-types",
    "packages\domain", 
    "packages\config",
    "apps\backend",
    "apps\frontend"
)

foreach ($dir in $cleanCommands) {
    $fullPath = Join-Path $PSScriptRoot $dir
    if (Test-Path (Join-Path $fullPath "dist")) {
        Remove-Item -Recurse -Force (Join-Path $fullPath "dist")
        Write-Host "  Removed dist in $dir" -ForegroundColor Gray
    }
    if (Test-Path (Join-Path $fullPath "tsconfig.tsbuildinfo")) {
        Remove-Item -Force (Join-Path $fullPath "tsconfig.tsbuildinfo")
    }
}

# Clean frontend .next
if (Test-Path "apps\frontend\.next") {
    Remove-Item -Recurse -Force "apps\frontend\.next"
    Write-Host "  Removed .next in apps\frontend" -ForegroundColor Gray
}

# Clean turbo cache
if (Test-Path ".turbo") {
    Remove-Item -Recurse -Force ".turbo"
    Write-Host "  Removed .turbo cache" -ForegroundColor Gray
}

# Clean root level caches
$rootCaches = @("node_modules\.cache", ".npm")
foreach ($cache in $rootCaches) {
    if (Test-Path $cache) {
        Remove-Item -Recurse -Force $cache -ErrorAction SilentlyContinue
        Write-Host "  Removed $cache" -ForegroundColor Gray
    }
}

# 3. Clean node_modules from all packages (but keep root)
Write-Host "[3/5] Cleaning node_modules..." -ForegroundColor Yellow

Get-ChildItem -Path . -Directory | Where-Object { 
    $_.Name -ne "node_modules" -and 
    $_.Name -ne ".git" -and
    $_.Name -ne ".turbo" 
} | ForEach-Object {
    $nmPath = Join-Path $_.FullName "node_modules"
    if (Test-Path $nmPath) {
        Remove-Item -Recurse -Force $nmPath
        Write-Host "  Removed node_modules in $($_.Name)" -ForegroundColor Gray
    }
}

# 4. Remove package-lock.json to ensure fresh install
Write-Host "[4/5] Removing package-lock.json..." -ForegroundColor Yellow
if (Test-Path "package-lock.json") {
    Remove-Item -Force "package-lock.json"
    Write-Host "  Removed package-lock.json" -ForegroundColor Gray
}

Write-Host ""
Write-Host "======================================" -ForegroundColor Green
Write-Host "  Clean complete! Now run:" -ForegroundColor Green
Write-Host "  npm install" -ForegroundColor Cyan
Write-Host "  npm run build" -ForegroundColor Cyan
Write-Host "======================================" -ForegroundColor Green