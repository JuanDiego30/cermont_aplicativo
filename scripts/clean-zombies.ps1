# ──────────────────────────────────────────────────
# clean-zombies.ps1 — Cermont Process Cleanup Utility
# ──────────────────────────────────────────────────

$ErrorActionPreference = "SilentlyContinue"

Write-Host "Stopping Cermont Node.js processes..." -ForegroundColor Cyan

# Find all node processes that are running from the cermont project directory
$processes = Get-Process node | Where-Object { 
    $_.Path -like "*cermont*" -or $_.CommandLine -like "*turbo*" -or $_.CommandLine -like "*next*"
}

if ($processes) {
    foreach ($p in $processes) {
        Write-Host "Killing PID $($p.Id): $($p.ProcessName)" -ForegroundColor Yellow
        Stop-Process -Id $p.Id -Force
    }
    Write-Host "Cleanup complete." -ForegroundColor Green
} else {
    Write-Host "No zombie Cermont processes found." -ForegroundColor DarkGray
}
