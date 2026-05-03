#!/usr/bin/env bash
# ──────────────────────────────────────────────
# Cermont Dev Monitor — lightweight resource watcher
# Shows Node.js process RAM/CPU usage every 5s
# ──────────────────────────────────────────────

INTERVAL="${1:-5}"
WARN_MB="${2:-500}"

echo "╔══════════════════════════════════════════════╗"
echo "║  Cermont Dev Monitor (Ctrl+C to exit)       ║"
echo "║  Refresh: ${INTERVAL}s | Warn RAM: >${WARN_MB}MB          ║"
echo "╚══════════════════════════════════════════════╝"
echo ""

while true; do
  clear 2>/dev/null || true
  echo "=== $(date '+%Y-%m-%d %H:%M:%S') ==="
  echo ""

  # Node processes
  NODE_PIDS=$(pgrep -f "node|next|tsx" 2>/dev/null || true)

  if [ -z "$NODE_PIDS" ]; then
    echo "No Node.js processes running."
  else
    echo "PID    RSS(MB)  CPU%  COMMAND"
    echo "───────────────────────────────────────────"
    echo "$NODE_PIDS" | while read -r pid; do
      if [ -d "/proc/$pid" ] 2>/dev/null; then
        rss_kb=$(awk '/VmRSS/{print $2}' "/proc/$pid/status" 2>/dev/null || echo 0)
        rss_mb=$((rss_kb / 1024))
        cpu=$(ps -p "$pid" -o %cpu --no-headers 2>/dev/null || echo "?")
        cmd=$(ps -p "$pid" -o comm --no-headers 2>/dev/null || echo "?")

        if [ "$rss_mb" -gt "$WARN_MB" ]; then
          echo "$pid  ${rss_mb}MB    ${cpu}%   ⚠ $cmd"
        else
          echo "$pid  ${rss_mb}MB    ${cpu}%   $cmd"
        fi
      fi
    done 2>/dev/null

    # Summary
    total_kb=0
    echo "$NODE_PIDS" | while read -r pid; do
      if [ -d "/proc/$pid" ] 2>/dev/null; then
        rss=$(awk '/VmRSS/{print $2}' "/proc/$pid/status" 2>/dev/null || echo 0)
        total_kb=$((total_kb + rss))
      fi
    done 2>/dev/null
    echo ""
    echo "Total Node RSS: ~$((total_kb / 1024))MB"
  fi

  # Docker containers
  DOCKER_RUNNING=$(docker ps --format "{{.Names}}\t{{.Status}}" 2>/dev/null | head -5 || true)
  if [ -n "$DOCKER_RUNNING" ]; then
    echo ""
    echo "Docker:"
    echo "$DOCKER_RUNNING"
  fi

  sleep "$INTERVAL"
done
