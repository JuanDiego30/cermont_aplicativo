# README – Deployment Guide

**Version:** 1.0.0  
**Date:** October 20, 2025  
**Status:** Stable

---

## Table of Contents

1. [VPS Setup](#vps-setup)
2. [Database Configuration](#database-configuration)
3. [Environment Variables](#environment-variables)
4. [systemd Service](#systemd-service)
5. [Nginx Reverse Proxy](#nginx-reverse-proxy)
6. [Deployment Steps](#deployment-steps)
7. [Troubleshooting](#troubleshooting)

---

## VPS Setup

### Prerequisites

- Linux server (Ubuntu 20.04+ or CentOS 8+)
- Node.js 20+
- PostgreSQL 14+
- Nginx 1.18+
- Git

### Initial Server Configuration

```bash
# Update system
sudo apt update && sudo apt upgrade -y

# Install Node.js 20
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt install -y nodejs

# Install PostgreSQL
sudo apt install -y postgresql postgresql-contrib

# Install Nginx
sudo apt install -y nginx

# Install PM2 globally
sudo npm install -g pm2
```

---

## Database Configuration

### Create Cermont Database

```bash
# Connect to PostgreSQL
sudo -u postgres psql

# Inside psql:
CREATE DATABASE cermont_db;
CREATE USER cermont_user WITH ENCRYPTED PASSWORD 'your_secure_password';
GRANT ALL PRIVILEGES ON DATABASE cermont_db TO cermont_user;

# Exit psql
\q
```

### Load Database Schema

```bash
# Download or copy your schema file
psql -U cermont_user -d cermont_db < database/schema.sql
```

---

## Environment Variables

Create `/var/www/cermont/.env`:

```env
# Core
NODE_ENV=production
PORT=4000

# Database
DATABASE_URL=postgresql://cermont_user:your_secure_password@localhost:5432/cermont_db

# JWT & Security
JWT_SECRET=your_very_long_random_secret_key_here_minimum_32_chars

# Frontend & CORS
FRONTEND_ORIGIN=https://your-domain.com,https://www.your-domain.com

# Storage
STORAGE_DIR=/var/www/cermont/storage

# Logging
LOG_LEVEL=info
```

**Security:**
- Restrict file permissions: `chmod 600 /var/www/cermont/.env`
- Use strong, random `JWT_SECRET` (min 32 chars)
- Never commit `.env` to Git

---

## systemd Service

Create `/etc/systemd/system/cermont.service`:

```ini
[Unit]
Description=Cermont ATG Application
After=network.target postgresql.service

[Service]
Type=simple
User=www-data
WorkingDirectory=/var/www/cermont
Environment="PATH=/usr/local/bin:/usr/bin:/bin"
Environment="NODE_ENV=production"
EnvironmentFile=/var/www/cermont/.env
ExecStart=/usr/bin/npm run start
Restart=always
RestartSec=5s
StandardOutput=journal
StandardError=journal

[Install]
WantedBy=multi-user.target
```

Enable and start the service:

```bash
sudo systemctl daemon-reload
sudo systemctl enable cermont
sudo systemctl start cermont
sudo systemctl status cermont
```

---

## Nginx Reverse Proxy

Create `/etc/nginx/sites-available/cermont`:

```nginx
upstream cermont_api {
    server localhost:4000;
}

upstream cermont_frontend {
    server localhost:3000;
}

server {
    listen 80;
    server_name your-domain.com www.your-domain.com;
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name your-domain.com www.your-domain.com;

    ssl_certificate /etc/letsencrypt/live/your-domain.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/your-domain.com/privkey.pem;

    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers HIGH:!aNULL:!MD5;
    ssl_prefer_server_ciphers on;

    client_max_body_size 10M;

    # API
    location /v1/ {
        proxy_pass http://cermont_api;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }

    # Frontend
    location / {
        proxy_pass http://cermont_frontend;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

Enable the site:

```bash
sudo ln -s /etc/nginx/sites-available/cermont /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx
```

### Setup SSL with Certbot

```bash
sudo apt install -y certbot python3-certbot-nginx
sudo certbot certonly --nginx -d your-domain.com -d www.your-domain.com
```

---

## Deployment Steps

### GitHub Actions Setup (Automated Deployment)

**📖 Complete Guide:** See [GITHUB_SECRETS_SETUP.md](./GITHUB_SECRETS_SETUP.md) for detailed instructions.

**Quick Setup:**

1. **Configure GitHub Secrets** (required for automated deployment):
   - Go to: `Settings -> Secrets and variables -> Actions`
   - Add three secrets:
     - `VPS_HOST` - Your VPS IP or domain
     - `VPS_USER` - SSH username
     - `VPS_KEY` - Complete private SSH key

2. **Setup SSH Access on VPS:**
   ```bash
   # On your VPS:
   mkdir -p ~/.ssh
   chmod 700 ~/.ssh
   echo "your-public-key-here" >> ~/.ssh/authorized_keys
   chmod 600 ~/.ssh/authorized_keys
   ```

3. **Verify Connection:**
   ```bash
   # From your local machine:
   ssh -i ~/.ssh/your-key user@vps-host
   ```

**Once configured**, pushing to `main` branch automatically:
1. Builds frontend & backend
2. Runs tests
3. Validates deployment secrets
4. Connects via SSH
5. Pulls latest code
6. Installs dependencies
7. Restarts service

### Manual Deployment

```bash
cd /var/www/cermont

# Pull latest changes
git pull origin main

# Install production dependencies
npm ci --omit=dev

# Build frontend
npm run build

# Build backend
npm run backend:build

# Restart service
sudo systemctl restart cermont
```

Or use the convenience script:

```bash
bash ops/scripts/deploy.sh
```

---

## Troubleshooting

### Check Service Status

```bash
sudo systemctl status cermont
sudo journalctl -u cermont -n 50 -f
```

### View Logs

```bash
# With PM2
pm2 logs cermont

# Via journalctl
sudo journalctl -u cermont -n 100
```

### Restart Service

```bash
sudo systemctl restart cermont
```

### Check Database Connection

```bash
psql -U cermont_user -d cermont_db -c "SELECT 1;"
```

### Common Issues

**Port already in use:**
```bash
lsof -i :4000
kill -9 <PID>
```

**Permission denied on .env:**
```bash
sudo chmod 600 /var/www/cermont/.env
sudo chown www-data:www-data /var/www/cermont/.env
```

**Out of memory:**
```bash
# Check PM2 memory
pm2 monit

# Restart service
sudo systemctl restart cermont
```

---

## Next Steps

- Monitor with tools like **UptimeRobot** or **BetterStack**
- Setup log aggregation with **Datadog**, **New Relic**, or **Sentry**
- Configure backups for PostgreSQL
- Review monitoring guide in `README_MONITORING.md`
