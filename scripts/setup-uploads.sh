#!/usr/bin/env bash
# ---------------------------------------------------------------------------
# setup-uploads.sh — Cermont S.A.S.
# Purpose: Create and persist the backend uploads directory across deploys.
#
# The uploads directory (backend/uploads/) is gitignored because it contains
# user-generated content (evidence photos, document attachments). This script
# ensures the directory exists and has correct permissions on the VPS.
#
# Usage (VPS):
#   chmod +x scripts/setup-uploads.sh
#   ./scripts/setup-uploads.sh
#
# This should be run once after the initial git clone, and can be added to
# CI/CD post-deploy hooks or ecosystem.config.cjs `post_setup` commands.
#
# In PM2 ecosystem.config.cjs, you can add:
#   apps: [{
#     name: "cermont-backend",
#     post_setup: "mkdir -p backend/uploads && chmod 750 backend/uploads",
#     ...
#   }]
# ---------------------------------------------------------------------------

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"
UPLOADS_DIR="$PROJECT_ROOT/backend/uploads"

echo "[setup-uploads] Creating uploads directory at: $UPLOADS_DIR"
mkdir -p "$UPLOADS_DIR"

# Secure permissions: owner rwx, group rx, others none
chmod 750 "$UPLOADS_DIR"

# Verify .gitignore already covers backend/uploads/
if grep -q "backend/uploads/" "$PROJECT_ROOT/.gitignore" 2>/dev/null; then
	echo "[setup-uploads] ✓ backend/uploads/ is already in .gitignore"
else
	echo "[setup-uploads] ⚠ backend/uploads/ NOT in .gitignore — add it manually"
fi

echo "[setup-uploads] ✓ Uploads directory ready"
ls -la "$UPLOADS_DIR"
