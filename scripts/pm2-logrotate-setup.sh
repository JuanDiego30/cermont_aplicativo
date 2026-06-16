#!/usr/bin/env bash
# ---------------------------------------------------------------------------
# pm2-logrotate-setup.sh — Cermont S.A.S.
# Purpose: Configure PM2 log rotation to prevent disk exhaustion on the VPS.
#
# PM2 generates logs for each process (backend + frontend). Without rotation,
# these logs can grow unbounded and fill the disk.
#
# Usage (VPS — run once):
#   chmod +x scripts/pm2-logrotate-setup.sh
#   ./scripts/pm2-logrotate-setup.sh
#
# Prerequisites:
#   - PM2 installed globally: npm install -g pm2
#   - pm2-logrotate installed: pm2 install pm2-logrotate
#
# The configuration is persisted by PM2 and survives process restarts.
# ---------------------------------------------------------------------------

set -euo pipefail

echo "[pm2-logrotate] Installing pm2-logrotate module..."
pm2 install pm2-logrotate

echo "[pm2-logrotate] Configuring log rotation..."

# Maximum size per log file before rotation
pm2 set pm2-logrotate:max_size 10M

# Number of rotated files to keep
pm2 set pm2-logrotate:retain 7

# Compress rotated logs (gzip)
pm2 set pm2-logrotate:compress true

# Rotate interval in minutes (1440 = daily)
pm2 set pm2-logrotate:rotateInterval "0 0 * * *"

# Date format for rotated files
pm2 set pm2-logrotate:dateFormat "YYYY-MM-DD_HH-mm-ss"

echo "[pm2-logrotate] ✓ Configuration applied:"
pm2 conf pm2-logrotate

echo ""
echo "To verify after deployment:"
echo "  pm2 list                           # Both apps should be running"
echo "  pm2 logs cermont-backend --lines 20  # Check backend logs"
echo "  pm2 logs cermont-frontend --lines 20 # Check frontend logs"
echo "  ls -la ~/.pm2/logs/                # Verify log files exist"
echo ""
echo "Note: If pm2-logrotate is already installed, this script updates"
echo "the configuration. Run it once during initial VPS setup."
