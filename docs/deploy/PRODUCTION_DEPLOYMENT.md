# Despliegue de Produccion y Preproduccion

**Estado:** CANONICO  
**Actualizado:** 2026-06-14
**Destino:** VPS Linux con PM2 + nginx directo + Certbot SSL

Esta es la unica guia operativa para desplegar Cermont. El despliegue
productivo es self-hosted en VPS. Vercel y Netlify no sustituyen esta
arquitectura.

## Arquitectura

```txt
Internet
  -> nginx host (TLS termination, puertos 80/443)
     -> frontend Next.js 127.0.0.1:3000 (PM2 fork)
     -> /api/health -> backend Express 127.0.0.1:4000 (PM2 fork)
  -> MongoDB 7.0 directo en 127.0.0.1:27017
```

Los unicos puertos publicos del VPS deben ser SSH (22), HTTP (80) y HTTPS (443).
MongoDB, frontend y backend se ejecutan localmente y no se publican.

## Requisitos

- Ubuntu 24.04 LTS o superior
- 2 vCPU, 4 GB RAM y 20 GB libres como minimo
- Node.js 22+ via nvm
- MongoDB 7.0
- PM2 global
- nginx + Certbot
- Git
- Dominio con DNS configurado
- Usuario de despliegue `deploy` sin privilegios de root

## 1. Validar la revision

Antes de promover una revision:

```bash
npm ci
npm run typecheck
npm run lint
npm run test
npm run build
npm run verify
npx react-doctor@latest
npm audit --omit=dev
```

No desplegar si falla un gate, existe una vulnerabilidad alta sin aceptar o no
hay una copia de seguridad restaurable.

## 2. Preparar el VPS

### 2.1 SSH hardening

```bash
sudo useradd --create-home --shell /bin/bash deploy
sudo usermod -aG sudo deploy
sudo mkdir -p /home/deploy/.ssh && sudo chmod 700 /home/deploy/.ssh
# Copiar llave publica a /home/deploy/.ssh/authorized_keys
sudo chmod 600 /home/deploy/.ssh/authorized_keys
sudo chown -R deploy:deploy /home/deploy/.ssh

# Hardening SSH
sudo sed -i 's/^PasswordAuthentication.*/PasswordAuthentication no/' /etc/ssh/sshd_config
sudo sed -i 's/^PermitRootLogin.*/PermitRootLogin prohibit-password/' /etc/ssh/sshd_config
sudo systemctl restart sshd
```

### 2.2 UFW firewall

```bash
sudo ufw default deny incoming
sudo ufw default allow outgoing
sudo ufw allow 22/tcp
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp
sudo ufw --force enable
sudo ufw status verbose
```

No abrir `27017`, `3000` ni `4000` a Internet.

### 2.3 Node.js via nvm

```bash
su - deploy
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.40.1/install.sh | bash
source ~/.bashrc
nvm install 22
nvm alias default 22
```

### 2.4 MongoDB 7.0

```bash
# Como root
curl -fsSL https://www.mongodb.org/static/pgp/server-7.0.asc | sudo gpg --dearmor -o /usr/share/keyrings/mongodb-server-7.0.gpg
echo "deb [ signed-by=/usr/share/keyrings/mongodb-server-7.0.gpg ] http://repo.mongodb.org/apt/ubuntu jammy/mongodb-org/7.0 multiverse" | sudo tee /etc/apt/sources.list.d/mongodb-org-7.0.list
sudo apt update && sudo apt install -y mongodb-org

# Configurar bind a 127.0.0.1
sudo sed -i 's/bindIp: .*/bindIp: 127.0.0.1/' /etc/mongod.conf
sudo systemctl enable --now mongod
```

### 2.5 PM2 global

```bash
npm install -g pm2
pm2 --version
```

### 2.6 nginx + Certbot

```bash
sudo apt install -y nginx certbot python3-certbot-nginx
sudo systemctl enable --now nginx
```

## 3. Clonar y configurar

```bash
sudo mkdir -p /opt/cermont
sudo chown deploy:deploy /opt/cermont
su - deploy
cd /opt/cermont
git clone https://github.com/JuanDiego30/cermont_aplicativo.git app
cd app
```

### 3.1 Backend .env

```bash
cp backend/.env.example backend/.env
chmod 600 backend/.env
```

Generar valores:

```bash
openssl rand -hex 32
openssl rand -hex 64
```

Editar `backend/.env` y definir:

```env
PORT=4000
MONGODB_URI=mongodb://127.0.0.1:27017/cermont
JWT_SECRET=<secreto-generado>
REFRESH_TOKEN_SECRET=<secreto-diferente>
FRONTEND_URL=https://<dominio>
NODE_ENV=production
SEED_DEFAULT_PASSWORD=<contraseña-temporal>
```

### 3.2 Frontend .env.local

```bash
cat > frontend/.env.local << 'EOF'
BACKEND_URL=http://127.0.0.1:4000
NEXT_PUBLIC_APP_URL=https://<dominio>
NEXT_PUBLIC_API_URL=https://<dominio>/api
NEXT_PUBLIC_APP_NAME=Cermont
EOF
```

## 4. Compilar e iniciar

```bash
cd /opt/cermont/app
npm ci --include-workspace-root --workspaces
npm run build
npm run deploy:pm2:start
npm run deploy:pm2:save
```

Configurar autostart de PM2:

```bash
pm2 startup
# Copiar y ejecutar el comando que imprime (ej: sudo env PATH=$PATH:/usr/bin pm2 startup systemd -u deploy --hp /home/deploy)
```

### 4.1 Verificar

```bash
pm2 status
curl --fail --silent --show-error http://127.0.0.1:4000/api/health/ready
curl --fail --silent --show-error --head http://127.0.0.1:3000/
```

## 5. Crear usuarios iniciales

```bash
cd /opt/cermont/app && NODE_ENV=production npx tsx backend/src/scripts/seed.ts
```

La cuenta `gerencia@cermont.co` usa la contraseña fija `Cermont2026!`.
Las demas cuentas usan el valor de `SEED_DEFAULT_PASSWORD`.

Cambiar inmediatamente las credenciales iniciales o crear usuarios nominales
desde administracion.

## 6. Configurar nginx + Certbot SSL

### 6.1 Configurar nginx

Crear `/etc/nginx/sites-available/cermont`:

```nginx
server {
    listen 80;
    server_name <dominio>;
    return 301 https://$host$request_uri;
}

server {
    listen 443 ssl http2;
    server_name <dominio>;

    ssl_certificate /etc/letsencrypt/live/<dominio>/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/<dominio>/privkey.pem;

    client_max_body_size 50M;

    location / {
        proxy_pass http://127.0.0.1:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }

    location /api/health {
        proxy_pass http://127.0.0.1:4000/api/health;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
    }
}
```

```bash
sudo ln -sf /etc/nginx/sites-available/cermont /etc/nginx/sites-enabled/
sudo rm -f /etc/nginx/sites-enabled/default
sudo nginx -t && sudo systemctl reload nginx
```

### 6.2 Certbot SSL

```bash
sudo certbot --nginx -d <dominio> --non-interactive --agree-tos -m admin@<dominio>
sudo certbot renew --dry-run
```

## 7. Firewall (verificacion)

```bash
sudo ufw status verbose
# Debe mostrar: 22, 80, 443 ALLOW IN
```

## 8. Backup

Crear `/opt/cermont/backup.sh` con permisos `700`:

```bash
#!/usr/bin/env bash
set -euo pipefail

BACKUP_DIR=/opt/cermont/backups
TIMESTAMP="$(date -u +%Y%m%dT%H%M%SZ)"

mkdir -p "$BACKUP_DIR"

mongodump --uri="mongodb://127.0.0.1:27017/cermont" --gzip --archive="$BACKUP_DIR/cermont-$TIMESTAMP.archive.gz"
find "$BACKUP_DIR" -type f -name 'cermont-*.archive.gz' -mtime +14 -delete
```

```bash
chmod +x /opt/cermont/backup.sh
(crontab -l 2>/dev/null; echo "0 3 * * * /opt/cermont/backup.sh") | crontab -
```

## 9. Restaurar

```bash
pm2 stop cermont-backend
mongorestore --uri="mongodb://127.0.0.1:27017/cermont" --gzip --archive=/ruta/backup.archive.gz --drop
pm2 restart cermont-backend
```

## 10. Actualizar

```bash
cd /opt/cermont/app
git fetch origin main
git checkout main
git pull --ff-only origin main
npm ci --include-workspace-root --workspaces
npm run build
npm run deploy:pm2:reload
sleep 5
curl --fail --silent --show-error --retry 12 --retry-delay 5 http://127.0.0.1:4000/api/health/ready
```

## 11. Rollback

Registrar la revision estable antes de actualizar:

```bash
git rev-parse HEAD > /opt/cermont/app/.last-known-good
```

Si falla la verificacion:

```bash
cd /opt/cermont/app
git checkout "$(cat .last-known-good)"
npm ci --include-workspace-root --workspaces
npm run build
npm run deploy:pm2:reload
```

## 12. GitHub Actions

Configurar estos secretos por ambiente:

```txt
VPS_HOST
VPS_PORT
VPS_USER
VPS_SSH_KEY
VPS_DOMAIN
```

El workflow de CI ejecuta `npm run verify`. El workflow de deploy actualiza el
VPS via SSH usando `appleboy/ssh-action` con el script de actualizacion.

## Checklist de aceptacion

- Todos los gates locales y de CI pasan
- `pm2 status` muestra ambos procesos online
- Liveness y readiness responden por HTTPS
- Login, RBAC y navegacion por rol fueron probados
- Carga y descarga autenticada de evidencias funciona
- Flujo de planeacion, ejecucion y cierre administrativo fue probado
- Modo offline y sincronizacion fueron probados en navegador real
- Backup externo y restauracion fueron verificados
- Firewall expone solo los puertos aprobados
- No hay secretos, IPs de infraestructura ni credenciales en Git
