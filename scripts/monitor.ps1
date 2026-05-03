# ═══════════════════════════════════════════════════
# Cermont Dev Monitor - PowerShell
# Muestra uso de RAM/CPU de procesos Node.js cada 5s
# ═══════════════════════════════════════════════════

param(
    [int]$Interval = 5,
    [int]$WarnMB = 500
)

$host.UI.RawUI.WindowTitle = "Cermont Dev Monitor"

Write-Host "╔══════════════════════════════════════════════╗" -ForegroundColor Cyan
Write-Host "║  Cermont Dev Monitor (Ctrl+C to exit)       ║" -ForegroundColor Cyan
Write-Host "║  Refresh: ${Interval}s | Warn RAM: >${WarnMB}MB          ║" -ForegroundColor Cyan
Write-Host "╚══════════════════════════════════════════════╝" -ForegroundColor Cyan
Write-Host ""

try {
    while ($true) {
        Clear-Host
        
        $timestamp = Get-Date -Format "yyyy-MM-dd HH:mm:ss"
        Write-Host "=== $timestamp ===" -ForegroundColor Yellow
        Write-Host ""

        # Node processes
        $nodeProcesses = Get-Process | Where-Object { 
            $_.ProcessName -match "node|next|tsx|npm" 
        } | Select-Object Id, @{N="RAM(MB)";E={[math]::Round($_.WorkingSet64/1MB,0)}}, CPU, @{N="Command";E={$_.ProcessName}}

        if ($nodeProcesses) {
            Write-Host "PID    RAM(MB)   CPU(s)   Process" -ForegroundColor Gray
            Write-Host "───────────────────────────────────────────" -ForegroundColor Gray
            
            foreach ($proc in $nodeProcesses) {
                $color = if ($proc["RAM(MB)"] -gt $WarnMB) { "Red" } else { "Green" }
                Write-Host ("{0,-6} {1,-9} {2,-9} {3}" -f $proc.Id, $proc["RAM(MB)"], [math]::Round($proc.CPU,1), $proc.Command) -ForegroundColor $color
            }
            
            $totalRAM = ($nodeProcesses | Measure-Object -Property "RAM(MB)" -Sum).Sum
            Write-Host ""
            Write-Host "Total Node RAM: ~${totalRAM}MB" -ForegroundColor Cyan
        } else {
            Write-Host "No Node.js processes running." -ForegroundColor Yellow
        }

        # Docker containers
        Write-Host ""
        Write-Host "Docker Containers:" -ForegroundColor Cyan
        try {
            $dockerContainers = docker ps --format "{{.Names}} | {{.Status}}" 2>$null
            if ($dockerContainers) {
                $dockerContainers | ForEach-Object { Write-Host "  $_" }
            } else {
                Write-Host "  No containers running" -ForegroundColor Yellow
            }
        } catch {
            Write-Host "  Docker no disponible" -ForegroundColor Red
        }

        Start-Sleep -Seconds $Interval
    }
} catch {
    Write-Host ""
    Write-Host "Monitor detenido." -ForegroundColor Yellow
}