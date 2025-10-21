#!/usr/bin/env bash
set -euo pipefail

# Color codes for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}🚀 Cermont Deployment Script${NC}"
echo -e "${BLUE}================================${NC}"

# Change to project root
SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
PROJECT_ROOT="$( cd "$SCRIPT_DIR/../../" && pwd )"
cd "$PROJECT_ROOT" || exit 1

echo -e "${YELLOW}📍 Working directory: $PROJECT_ROOT${NC}"

# Step 1: Pull latest changes
echo -e "\n${YELLOW}📥 Pulling latest changes from main...${NC}"
git pull origin main || {
  echo -e "${RED}❌ Failed to pull from git${NC}"
  exit 1
}

# Step 2: Install production dependencies
echo -e "\n${YELLOW}📦 Installing production dependencies...${NC}"
npm ci --omit=dev || {
  echo -e "${RED}❌ npm ci failed${NC}"
  exit 1
}

# Step 3: Build frontend
echo -e "\n${YELLOW}🔨 Building frontend...${NC}"
npm run build || {
  echo -e "${RED}❌ Frontend build failed${NC}"
  exit 1
}

# Step 4: Build backend
echo -e "\n${YELLOW}🔨 Building backend...${NC}"
npm run backend:build || {
  echo -e "${RED}❌ Backend build failed${NC}"
  exit 1
}

# Step 5: Restart application
echo -e "\n${YELLOW}🔄 Restarting application...${NC}"
if sudo systemctl is-active --quiet cermont; then
  sudo systemctl restart cermont || {
    echo -e "${RED}❌ Failed to restart cermont service${NC}"
    exit 1
  }
else
  echo -e "${YELLOW}⚠️  cermont service not running, attempting to start...${NC}"
  sudo systemctl start cermont || {
    echo -e "${RED}❌ Failed to start cermont service${NC}"
    exit 1
  }
fi

echo -e "\n${GREEN}✅ Deployment completed successfully!${NC}"
echo -e "${BLUE}Service status:${NC}"
sudo systemctl status cermont --no-pager || true

exit 0
