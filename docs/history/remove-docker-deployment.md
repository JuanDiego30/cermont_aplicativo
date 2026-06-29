# Plan de Despliegue Directo en VPS — Post-Docker

> **Dependencia:** Ejecutar primero `.kilo/plans/remove-docker.md` (limpieza de archivos Docker, CORS, CI/CD, scripts PM2, nginx.conf actualizado).
> **Propósito:** Provisionar un VPS Ubuntu 24.04 LTS desde cero con instalación directa (sin contenedores).
> **Target:** Node.js 22+ via nvm → PM2 (fork) → MongoDB 7.0 directo → nginx reverse proxy → Certbot SSL.

## Arquitectura Target

```
Internet
  │
  ├── UFW: solo puertos 22 (SSH), 80 (HTTP), 443 (HTTPS)
  │
  └── nginx (host, escucha 80/443)
        ├── HTTP 80 → redirect 301 a HTTPS
        └── HTTPS 443 → reverse proxy
              ├── / → frontend Next.js 127.0.0.1:3000
              ├── /api/health → backend Express 127.0.0.1:4000
              └── /api/* → frontend proxy.ts → backend (a través de Next.js rewrites)

PM2 procesos directos en host:
  ├── cermont-backend  (fork, puerto 4000, dist/server.js)
  └── cermont-frontend (fork, puerto 3000, next start)
```

**Puertos NO expuestos a Internet (bloqueados por UFW):** 27017 (MongoDB), 3000 (frontend), 4000 (backend).

---

## Fase 0 — Prerrequisitos

### 0.1 Ejecutar limpieza Docker del repositorio

Aplicar `.kilo/plans/remove-docker.md` completo y verificar:

```bash
# Debe dar 0 resultados en código fuente
rg -i "docker|docker-compose|dockerfile" --type ts --type tsx --type json --type yaml -g '!node_modules' -g '!.next' -g '!.turbo' -g '!dist'

# Quality gates deben pasar
npm run typecheck
npm run lint
npm run test
npm run build
npm run verify
```

### 0.2 Requisitos del VPS

| Recurso | Mínimo | Recomendado |
|---------|--------|-------------|
| CPU | 2 vCPU | 4 vCPU |
| RAM | 4 GB | 8 GB |
| Disco | 20 GB SSD | 40 GB SSD |
| SO | Ubuntu 24.04 LTS | Ubuntu 24.04 LTS |
| Dominio | app.cermont.com.co | Con DNS apuntando al VPS |
| Acceso | Root + usuario deploy | SSH key-only |

### 0.3 Preparar localmente

```bash
# Generar par de llaves SSH para el VPS
ssh-keygen -t ed25519 -a 100 -f ~/.ssh/cermont_vps -C "deploy@cermont.com"

# Verificar que el repo compila limpio (último build local)
cd /ruta/local/cermont_aplicativo
npm run build
```

---

## Fase 1 — Seguridad SSH

### 1.1 Conectarse como root

```bash
ssh root@<vps-ip>
```

### 1.2 Crear usuario de despliegue

```bash
adduser --gecos "" deploy
usermod -aG sudo deploy
mkdir -p /home/deploy/.ssh
chmod 700 /home/deploy/.ssh
```

### 1.3 Configurar llave pública

```bash
# En local: cat ~/.ssh/cermont_vps.pub
# Copiar el contenido y pegarlo:
echo "<CONTENIDO_DE_LLAVE_PUBLICA>" > /home/deploy/.ssh/authorized_keys
chmod 600 /home/deploy/.ssh/authorized_keys
chown -R deploy:deploy /home/deploy/.ssh
```

### 1.4 Hardening de SSH

```bash
cp /etc/ssh/sshd_config /etc/ssh/sshd_config.backup

# Aplicar configuraciones seguras
sed -i 's/^#Port 22/Port 22/' /etc/ssh/sshd_config
sed -i 's/^#PermitRootLogin.*/PermitRootLogin prohibit-password/' /etc/ssh/sshd_config
sed -i 's/^PermitRootLogin.*/PermitRootLogin prohibit-password/' /etc/ssh/sshd_config
sed -i 's/^#PasswordAuthentication.*/PasswordAuthentication no/' /etc/ssh/sshd_config
sed -i 's/^PasswordAuthentication.*/PasswordAuthentication no/' /etc/ssh/sshd_config
sed -i 's/^#PubkeyAuthentication.*/PubkeyAuthentication yes/' /etc/ssh/sshd_config
sed -i 's/^#AuthorizedKeysFile.*/AuthorizedKeysFile .ssh\/authorized_keys/' /etc/ssh/sshd_config
sed -i 's/^#MaxAuthTries.*/MaxAuthTries 3/' /etc/ssh/sshd_config
sed -i 's/^#ClientAliveInterval.*/ClientAliveInterval 300/' /etc/ssh/sshd_config
sed -i 's/^#ClientAliveCountMax.*/ClientAliveCountMax 2/' /etc/ssh/sshd_config

# Revisar que no haya errores
sshd -t

# Reiniciar SSH
systemctl restart sshd
```

### 1.5 Verificar acceso SSH (hacer desde OTRA terminal antes de cerrar sesión)

```bash
# En local: ssh -i ~/.ssh/cermont_vps deploy@<vps-ip>
```

### 1.6 Protección adicional contra fuerza bruta

```bash
apt install -y fail2ban
cp /etc/fail2ban/jail.conf /etc/fail2ban/jail.local
systemctl enable --now fail2ban

# Verificar
fail2ban-client status sshd
```

---

## Fase 2 — Firewall con UFW

### 2.1 Configurar reglas

```bash
ufw default deny incoming
ufw default allow outgoing

# SSH (mantener la sesión activa)
ufw allow ssh
# o explícitamente: ufw allow 22/tcp

# HTTP / HTTPS
ufw allow 80/tcp
ufw allow 443/tcp

# NO abrir: 27017, 3000, 4000
```

### 2.2 Habilitar

```bash
ufw --force enable
ufw status verbose
```

**Salida esperada:**
```
Status: active
Logging: on (low)
Default: deny (incoming), allow (outgoing)
New profiles: skip

To                         Action      From
--                         ------      ----
22/tcp                     ALLOW IN    Anywhere
80/tcp                     ALLOW IN    Anywhere
443/tcp                    ALLOW IN    Anywhere
22/tcp (v6)                ALLOW IN    Anywhere (v6)
80/tcp (v6)                ALLOW IN    Anywhere (v6)
443/tcp (v6)               ALLOW IN    Anywhere (v6)
```

### 2.3 Verificar conectividad

```bash
# Desde local: debería responder
curl -v http://<vps-ip>  # Debería dar timeout o refused (nginx aún no instalado)

# Desde local: SSH debe seguir funcionando
ssh -i ~/.ssh/cermont_vps deploy@<vps-ip> "echo UFW OK"
```

---

## Fase 3 — Node.js via NVM

### 3.1 Instalar NVM como usuario deploy

```bash
# Como usuario deploy (no root)
su - deploy
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.40.1/install.sh | bash

# Cargar NVM en la sesión actual
export NVM_DIR="$HOME/.nvm"
[ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh"

# Verificar
nvm --version  # Debe mostrar 0.40.1 o superior
```

### 3.2 Instalar Node.js versión requerida

```bash
# La versión mínima del proyecto es 22.20.0
nvm install 22
nvm use 22
nvm alias default 22

# Verificar
node --version  # >= 22.20.0
npm --version   # >= 10.9.4
```

### 3.3 Verificar persistencia

```bash
# Cerrar sesión y volver a entrar
exit
ssh -i ~/.ssh/cermont_vps deploy@<vps-ip>
node --version  # Debe mostrar v22.x
```

Si no persiste, agregar al `~/.bashrc`:

```bash
echo 'export NVM_DIR="$HOME/.nvm"' >> ~/.bashrc
echo '[ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh"' >> ~/.bashrc
```

---

## Fase 4 — MongoDB 7.0 Directo

### 4.1 Instalar MongoDB Community 7.0

```bash
# Volver a root para la instalación del sistema
exit  # si estás como deploy

# Importar clave GPG
curl -fsSL https://www.mongodb.org/static/pgp/server-7.0.asc | \
  gpg --dearmor -o /usr/share/keyrings/mongodb-server-7.0.gpg

# Agregar repositorio (Ubuntu 24.04 — usar jammy que es compatible)
echo "deb [ signed-by=/usr/share/keyrings/mongodb-server-7.0.gpg ] http://repo.mongodb.org/apt/ubuntu jammy/mongodb-org/7.0 multiverse" | \
  tee /etc/apt/sources.list.d/mongodb-org-7.0.list

# Instalar
apt update
apt install -y mongodb-org
```

### 4.2 Configurar MongoDB

```bash
# Crear archivo de configuración con binding a 127.0.0.1
cat > /etc/mongod.conf << 'EOF'
# MongoDB 7.0 — Producción Cermont
storage:
  dbPath: /var/lib/mongodb
  journal:
    enabled: true
  wiredTiger:
    engineConfig:
      cacheSizeGB: 1

systemLog:
  destination: file
  logAppend: true
  path: /var/log/mongodb/mongod.log
  logRotate: reopen

net:
  port: 27017
  bindIp: 127.0.0.1  # Solo localhost

processManagement:
  timeZoneInfo: /usr/share/zoneinfo
  fork: true
  pidFilePath: /tmp/mongod.pid

security:
  authorization: disabled  # Se habilitará después de crear el usuario admin
EOF
```

### 4.3 Iniciar y crear usuario admin

```bash
systemctl daemon-reload
systemctl enable mongod
systemctl start mongod

# Verificar que está funcionando
mongosh --eval "db.adminCommand('ping')"
# Debe responder: { ok: 1 }
```

### 4.4 Crear usuario administrador

```bash
mongosh << 'EOF'
use admin
db.createUser({
  user: "cermont_admin",
  pwd: "<GENERAR_CON_openssl_rand_hex_32>",
  roles: [
    { role: "userAdminAnyDatabase", db: "admin" },
    { role: "readWriteAnyDatabase", db: "admin" }
  ]
})
EOF
```

### 4.5 Habilitar autenticación

```bash
# Editar /etc/mongod.conf
sed -i 's/^  authorization: disabled/  authorization: enabled/' /etc/mongod.conf

# O mejor: editar manualmente para estar seguros
cat > /etc/mongod.conf << 'MONGOCONF'
# MongoDB 7.0 — Producción Cermont
storage:
  dbPath: /var/lib/mongodb
  journal:
    enabled: true
  wiredTiger:
    engineConfig:
      cacheSizeGB: 1

systemLog:
  destination: file
  logAppend: true
  path: /var/log/mongodb/mongod.log
  logRotate: reopen

net:
  port: 27017
  bindIp: 127.0.0.1

processManagement:
  timeZoneInfo: /usr/share/zoneinfo
  fork: true
  pidFilePath: /tmp/mongod.pid

security:
  authorization: enabled
MONGOCONF

# Reiniciar
systemctl restart mongod
```

### 4.6 Verificar autenticación

```bash
# Conectar autenticado
mongosh -u "cermont_admin" -p "<contraseña>" --authenticationDatabase admin \
  --eval "db.adminCommand('ping')"

# Crear la base de datos cermont y usuario de aplicación
mongosh -u "cermont_admin" -p "<contraseña>" --authenticationDatabase admin << 'EOF'
use cermont
db.createUser({
  user: "cermont_app",
  pwd: "<GENERAR_OTRO_CON_openssl_rand_hex_32>",
  roles: [
    { role: "readWrite", db: "cermont" }
  ]
})
EOF
```

### 4.7 Configurar I/O y límites del sistema

```bash
# Aumentar límites de archivos para MongoDB
cat >> /etc/security/limits.d/mongodb.conf << 'EOF'
mongodb soft nofile 64000
mongodb hard nofile 64000
mongodb soft nproc 64000
mongodb hard nproc 64000
EOF

# Deshabilitar THP (Transparent Huge Pages) para MongoDB
cat >> /etc/systemd/system/disable-thp.service << 'EOF'
[Unit]
Description=Disable Transparent Huge Pages (THP)
DefaultDependencies=no
After=sysinit.target local-fs.target

[Service]
Type=oneshot
ExecStart=/bin/sh -c 'echo never > /sys/kernel/mm/transparent_hugepage/enabled && echo never > /sys/kernel/mm/transparent_hugepage/defrag'

[Install]
WantedBy=basic.target
EOF

systemctl daemon-reload
systemctl enable --now disable-thp
```

### 4.8 Verificar MongoDB en producción

```bash
# Probar conexión desde localhost
mongosh -u "cermont_app" -p "<contraseña>" cermont \
  --eval "db.runCommand({ connectionStatus: 1 })"

# Verificar que NO escucha en 0.0.0.0
ss -tlnp | grep 27017
# Debe mostrar: 127.0.0.1:27017 (NO 0.0.0.0:27017)
```

---

## Fase 5 — PM2 Process Manager

### 5.1 Instalar PM2 globalmente

```bash
# Como usuario deploy
su - deploy
npm install -g pm2
pm2 --version  # Debe mostrar 5.x
```

### 5.2 Preparar directorio de la aplicación

```bash
# Como deploy
sudo mkdir -p /opt/cermont
sudo chown deploy:deploy /opt/cermont
```

### 5.3 Clonar repositorio

```bash
cd /opt/cermont
git clone <REPO_URL> app
cd app

# Verificar que los scripts PM2 existen en package.json
grep "deploy:pm2" package.json
```

**Salida esperada:**
```
"deploy:pm2:start": "pm2 start ecosystem.config.cjs",
"deploy:pm2:reload": "pm2 reload ecosystem.config.cjs",
"deploy:pm2:stop": "pm2 stop ecosystem.config.cjs",
"deploy:pm2:status": "pm2 status",
"deploy:pm2:logs": "pm2 logs",
"deploy:pm2:save": "pm2 save",
"deploy:pm2:startup": "pm2 startup",
```

### 5.4 Configurar variables de entorno

```bash
cp backend/.env.example backend/.env

# Editar backend/.env con valores reales
# Usar openssl rand -hex 32 para secretos
cat > backend/.env << 'ENVFILE'
# ── REQUERIDAS ──────────────────────────────────────────────────────────────
PORT=4000
MONGODB_URI=mongodb://cermont_app:<CONTRASEÑA_APP>@127.0.0.1:27017/cermont?authSource=cermont&retryWrites=true&w=majority
JWT_SECRET=<openssl_rand_hex_64>
REFRESH_TOKEN_SECRET=<openssl_rand_hex_64_diferente>
FRONTEND_URL=https://<DOMINIO>

# ── OPCIONALES ───────────────────────────────────────────────────────────────
NODE_ENV=production
JWT_EXPIRES_IN=15m
REFRESH_TOKEN_EXPIRES_IN=7d
BCRYPT_ROUNDS=12
LOG_LEVEL=info
UPLOAD_DIR=/opt/cermont/uploads
MAX_FILE_SIZE=52428800
ENVFILE

chmod 600 backend/.env

# Verificar que no hay secretos en el historial
history -c
```

### 5.5 Instalar dependencias y compilar

```bash
# Instalar (usa npm ci para builds reproducibles)
npm ci --include-workspace-root --workspaces

# Compilar todo
npm run build
```

### 5.6 Iniciar con PM2

```bash
# Iniciar ambos procesos
npm run deploy:pm2:start

# Verificar estado
npm run deploy:pm2:status
```

**Salida esperada:**
```
┌─────┬──────────────────┬──────────────┬─────────┬─────────┬──────────┬────────┐
│ id  │ name             │ namespace    │ version │ mode    │ pid      │ uptime │
├─────┼──────────────────┼──────────────┼─────────┼─────────┼──────────┼────────┤
│ 0   │ cermont-backend  │ default      │ 1.0.0   │ fork    │ 12345    │ 10s    │
│ 1   │ cermont-frontend │ default      │ 1.0.0   │ fork    │ 12346    │ 10s    │
└─────┴──────────────────┴──────────────┴─────────┴─────────┴──────────┴────────┘
```

### 5.7 Verificar que los procesos responden

```bash
# Backend (desde el VPS)
curl -s http://127.0.0.1:4000/api/health/ready
# Debe responder: {"success":true,"data":{"status":"ready","mongodb":"connected"}}

# Frontend (desde el VPS)
curl -s -o /dev/null -w "%{http_code}" http://127.0.0.1:3000
# Debe responder: 200
```

### 5.8 Persistir PM2

```bash
# Guardar la lista de procesos
npm run deploy:pm2:save

# Configurar autostart (IMPORTANTE: ejecutar el comando que imprime)
npm run deploy:pm2:startup
# Copiar el comando que imprime (ejemplo):
#   sudo env PATH=$PATH:/usr/bin pm2 startup systemd -u deploy --hp /home/deploy
# Ejecutar ESE comando con sudo
```

### 5.9 Instalar pm2-logrotate

```bash
pm2 install pm2-logrotate
pm2 set pm2-logrotate:max_size 10M
pm2 set pm2-logrotate:retain 7
pm2 set pm2-logrotate:compress true
```

---

## Fase 6 — Nginx Reverse Proxy

### 6.1 Instalar nginx

```bash
# Como root
apt install -y nginx
systemctl enable --now nginx

# Verificar
nginx -v
```

### 6.2 Copiar configuración del repositorio

El archivo `deploy/nginx.conf` debe existir (creado por `.kilo/plans/remove-docker.md` — Fase 4.2).

```bash
# Como root
cp /opt/cermont/app/deploy/nginx.conf /etc/nginx/sites-available/cermont
ln -sf /etc/nginx/sites-available/cermont /etc/nginx/sites-enabled/
rm -f /etc/nginx/sites-enabled/default

# Verificar sintaxis
nginx -t
```

### 6.3 Contenido de deploy/nginx.conf

```nginx
events {
    worker_connections 1024;
}

http {
    # Cache de archivos estáticos
    open_file_cache max=1000 inactive=20s;
    open_file_cache_valid 30s;
    open_file_cache_min_uses 2;
    open_file_cache_errors on;

    upstream frontend {
        server 127.0.0.1:3000;
    }

    upstream backend {
        server 127.0.0.1:4000;
    }

    server {
        listen 80;
        server_name <DOMINIO>;

        # Redirección a HTTPS
        location / {
            return 301 https://$host$request_uri;
        }

        # Para Let's Encrypt (Certbot)
        location /.well-known/acme-challenge/ {
            root /var/www/html;
        }
    }

    server {
        listen 443 ssl http2;
        server_name <DOMINIO>;

        # SSL (configurado por Certbot en Fase 7)
        ssl_certificate /etc/letsencrypt/live/<DOMINIO>/fullchain.pem;
        ssl_certificate_key /etc/letsencrypt/live/<DOMINIO>/privkey.pem;
        ssl_protocols TLSv1.2 TLSv1.3;
        ssl_ciphers HIGH:!aNULL:!MD5;

        # Seguridad
        add_header X-Frame-Options "SAMEORIGIN" always;
        add_header X-Content-Type-Options "nosniff" always;
        add_header Referrer-Policy "strict-origin-when-cross-origin" always;

        # Límites
        client_max_body_size 50M;
        proxy_read_timeout 120s;

        # Compresión
        gzip on;
        gzip_types text/plain text/css application/json application/javascript text/xml;
        gzip_min_length 256;

        # Frontend SPA — todo el tráfico pasa por Next.js (incluyendo /api/*)
        # El proxy handler (proxy.ts) redirige /api/backend/* → /api/*
        location / {
            proxy_pass http://frontend;
            proxy_http_version 1.1;
            proxy_set_header Upgrade $http_upgrade;
            proxy_set_header Connection "upgrade";
            proxy_set_header Host $host;
            proxy_set_header X-Real-IP $remote_addr;
            proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
            proxy_set_header X-Forwarded-Proto $scheme;
            proxy_cache_bypass $http_upgrade;
        }

        # Health check directo al backend (sin pasar por frontend)
        location /api/health {
            proxy_pass http://backend/api/health;
            proxy_http_version 1.1;
            proxy_set_header Host $host;
        }
    }
}
```

### 6.4 Recargar nginx

```bash
nginx -t && systemctl reload nginx
```

### 6.5 Verificar que el frontend sirve por HTTP

```bash
# Debe redirigir a HTTPS
curl -s -o /dev/null -w "%{http_code} %{redirect_url}" http://<DOMINIO>
# Debe responder: 301 https://<DOMINIO>/
```

---

## Fase 7 — SSL con Certbot

### 7.1 Instalar Certbot

```bash
# Como root
apt install -y certbot python3-certbot-nginx
```

### 7.2 Obtener certificado

```bash
certbot --nginx -d <DOMINIO> --non-interactive --agree-tos -m admin@<DOMINIO>
```

**Esto:**
- Obtiene certificado Let's Encrypt
- Modifica automáticamente la configuración de nginx (ssl_certificate, ssl_certificate_key)
- Habilita redirect HTTP → HTTPS

### 7.3 Verificar certificado

```bash
# Desde local
curl -vI https://<DOMINIO>
# Debe mostrar SSL handshake exitoso, certificado válido

# Desde VPS
certbot certificates
```

**Salida esperada:**
```
Found the following certs:
  Certificate Name: <DOMINIO>
    Domains: <DOMINIO>
    Expiry Date: <FECHA> (valid: 89 days)
    Certificate Path: /etc/letsencrypt/live/<DOMINIO>/fullchain.pem
    Private Key Path: /etc/letsencrypt/live/<DOMINIO>/privkey.pem
```

### 7.4 Configurar renovación automática

```bash
# Verificar que el timer de systemd existe
systemctl list-timers | grep certbot

# Probar renovación
certbot renew --dry-run
```

### 7.5 Verificar SSL completo

```bash
# Desde local
curl -s -o /dev/null -w "%{http_code}" https://<DOMINIO>/api/health/ready
# Debe responder: 200

# Desde el VPS (la redirección debe funcionar)
curl -s -o /dev/null -w "%{http_code}" https://<DOMINIO>/
# Debe responder: 200
```

---

## Fase 8 — Verificación Completa del Stack

### 8.1 Probar cada capa

```bash
echo "=== 1. SSH ==="
ssh -i ~/.ssh/cermont_vps deploy@<DOMINIO> "echo OK - SSH"

echo "=== 2. UFW ==="
ssh deploy@<DOMINIO> "sudo ufw status verbose | head -10"

echo "=== 3. Node.js ==="
ssh deploy@<DOMINIO> "node --version && npm --version"

echo "=== 4. MongoDB ==="
ssh deploy@<DOMINIO> "mongosh --eval 'db.version()' --quiet"

echo "=== 5. PM2 ==="
ssh deploy@<DOMINIO> "pm2 status"

echo "=== 6. Frontend ==="
curl -s -o /dev/null -w "Frontend: %{http_code}\n" https://<DOMINIO>/

echo "=== 7. API Health ==="
curl -s https://<DOMINIO>/api/health/ready | python3 -m json.tool

echo "=== 8. SSL ==="
curl -svI https://<DOMINIO>/ 2>&1 | grep "SSL connection"
```

### 8.2 Verificar que no hay servicios expuestos

```bash
# Escanear puertos del VPS (desde local)
nmap -p- <VPS-IP>
# Solo 22, 80, 443 deben estar abiertos
```

### 8.3 Verificar integridad del frontend

```bash
# Probar login page
curl -s https://<DOMINIO>/login | head -20
# Debe contener HTML renderizado de Next.js (no "Not Found")

# Probar ruta protegida (debe redirigir a login)
curl -s -o /dev/null -w "%{http_code}" https://<DOMINIO>/dashboard
# Debe responder 200 (Next.js renderiza pero redirige client-side) o 307
```

---

## Fase 9 — Backup y Restauración

### 9.1 Crear script de backup

**Archivo:** `/opt/cermont/backup.sh`

```bash
#!/usr/bin/env bash
# CERMONT Backup — Post-Docker (PM2 + MongoDB directo)
set -euo pipefail

APP_DIR=/opt/cermont/app
BACKUP_DIR=/opt/cermont/backups
TIMESTAMP="$(date -u +%Y%m%dT%H%M%SZ)"
RETENTION_DAYS=14

mkdir -p "$BACKUP_DIR"
mkdir -p "$BACKUP_DIR"/uploads

cd "$APP_DIR"

# 1. Backup de MongoDB
echo "[$(date -u)] Backing up MongoDB..."
mongodump \
  --uri="$MONGODB_URI" \
  --archive="$BACKUP_DIR/cermont-$TIMESTAMP.archive.gz" \
  --gzip

# 2. Backup de uploads
echo "[$(date -u)] Backing up uploads..."
tar czf "$BACKUP_DIR/uploads-$TIMESTAMP.tar.gz" -C "$(dirname "$UPLOAD_DIR")" "$(basename "$UPLOAD_DIR")"

# 3. Limpiar backups antiguos
find "$BACKUP_DIR" -type f -name 'cermont-*.archive.gz' -mtime +$RETENTION_DAYS -delete
find "$BACKUP_DIR" -type f -name 'uploads-*.tar.gz' -mtime +$RETENTION_DAYS -delete

# 4. Backup de .env (no contiene secretos raw, pero es útil)
cp "$APP_DIR/backend/.env" "$BACKUP_DIR/env-$TIMESTAMP.txt"

echo "[$(date -u)] Backup complete: $TIMESTAMP"
```

### 9.2 Configurar cron diario

```bash
chmod +x /opt/cermont/backup.sh
chown deploy:deploy /opt/cermont/backup.sh

# Agregar a crontab del usuario deploy
(crontab -l 2>/dev/null; echo "0 3 * * * /opt/cermont/backup.sh >> /opt/cermont/backups/backup.log 2>&1") | crontab -
```

### 9.3 Script de restauración

**Archivo:** `/opt/cermont/restore.sh`

```bash
#!/usr/bin/env bash
# CERMONT Restore — Post-Docker
set -euo pipefail

BACKUP_FILE="${1:-}"
if [ -z "$BACKUP_FILE" ]; then
  echo "Uso: $0 /ruta/del/backup/cermont-20260401T030000Z.archive.gz"
  exit 1
fi

echo "⚠️  DETENIENDO APLICACIÓN..."
pm2 stop cermont-backend
pm2 stop cermont-frontend

echo "🔄 RESTAURANDO MONGODB..."
mongorestore \
  --uri="$MONGODB_URI" \
  --archive="$BACKUP_FILE" \
  --gzip \
  --drop

echo "🚀 REINICIANDO APLICACIÓN..."
pm2 restart cermont-backend
pm2 restart cermont-frontend

echo "✅ Restauración completada de: $BACKUP_FILE"
```

---

## Fase 10 — Actualización y Rollback

### 10.1 Procedimiento de actualización

```bash
#!/usr/bin/env bash
# Actualización Cermont — VPS directo
set -euo pipefail

cd /opt/cermont/app

# Registrar commit actual como punto de rollback
git rev-parse HEAD > .last-known-good

# Pull de nuevos cambios
git pull origin main

# Reinstalar dependencias
npm ci --include-workspace-root --workspaces

# Recompilar
npm run build

# Recargar PM2
npm run deploy:pm2:reload

# Verificar
sleep 5
curl -sf http://127.0.0.1:4000/api/health/ready || {
  echo "❌ Health check failed. Initiating rollback..."
  /opt/cermont/rollback.sh
}
```

### 10.2 Procedimiento de rollback

**Archivo:** `/opt/cermont/rollback.sh`

```bash
#!/usr/bin/env bash
# Rollback Cermont — VPS directo
set -euo pipefail

cd /opt/cermont/app

if [ ! -f .last-known-good ]; then
  echo "No hay punto de rollback registrado"
  exit 1
fi

TARGET=$(cat .last-known-good)
echo "🔄 Revirtiendo a: $TARGET"

git checkout "$TARGET"
npm ci --include-workspace-root --workspaces
npm run build
npm run deploy:pm2:reload

echo "✅ Rollback completado a: $TARGET"
```

### 10.3 Script principal de deploy (CI/CD)

**Archivo:** `/opt/cermont/app/scripts/deploy-vps.sh`

```bash
#!/usr/bin/env bash
# CERMONT VPS Deploy — PM2 + nginx + Certbot
# Uso: bash scripts/deploy-vps.sh [production|staging]
set -euo pipefail

ENV="${1:-production}"
APP_DIR="/opt/cermont/app"
DOMAIN="${DOMAIN:-app.example.com}"

echo "=== CERMONT Deploy ($ENV) ==="

# 1. Pull latest
cd "$APP_DIR"
git fetch origin main
git checkout main
git pull --ff-only origin main

# 2. Dependencies
npm ci --include-workspace-root --workspaces

# 3. Build
npm run build

# 4. PM2 reload
npm run deploy:pm2:reload

# 5. Verify
sleep 5
curl -sf http://127.0.0.1:4000/api/health/ready || {
  echo "❌ Deploy failed"
  exit 1
}

echo "=== Deploy complete ($ENV) ==="
```

---

## Fase 11 — CI/CD Integration

### 11.1 Actualizar GitHub Actions

**Archivo:** `.github/workflows/deploy.yml`

```yaml
name: Deploy

on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - name: Quality gates
        run: |
          npm ci
          npm run typecheck
          npm run lint
          npm run test
          npm run build
          npm run verify

      - name: Deploy to VPS
        uses: appleboy/ssh-action@v1
        with:
          host: ${{ secrets.VPS_HOST }}
          port: ${{ secrets.VPS_PORT }}
          username: ${{ secrets.VPS_USER }}
          key: ${{ secrets.VPS_SSH_KEY }}
          script: |
            cd /opt/cermont/app
            git pull origin main
            npm ci --include-workspace-root --workspaces
            npm run build
            npm run deploy:pm2:reload
            sleep 5
            curl -sf http://127.0.0.1:4000/api/health/ready || exit 1
```

### 11.2 Secretos requeridos en GitHub

| Secreto | Descripción |
|---------|-------------|
| `VPS_HOST` | IP del VPS |
| `VPS_PORT` | Puerto SSH (22) |
| `VPS_USER` | deploy |
| `VPS_SSH_KEY` | Llave privada SSH (cermont_vps) |
| `VPS_DOMAIN` | Dominio del sitio |

---

## Fase 12 — Monitoreo y Mantenimiento

### 12.1 Logs de PM2

```bash
# Tiempo real
pm2 logs

# Aplicación específica
pm2 logs cermont-backend
pm2 logs cermont-frontend

# Últimas N líneas
pm2 logs --lines 100

# Dashboard
pm2 monit
```

### 12.2 Logs del sistema

```bash
# Nginx
sudo tail -f /var/log/nginx/access.log
sudo tail -f /var/log/nginx/error.log

# MongoDB
sudo tail -f /var/log/mongodb/mongod.log

# Aplicación
tail -f /opt/cermont/app/logs/backend-out.log
tail -f /opt/cermont/app/logs/backend-error.log
```

### 12.3 Health checks automáticos

Configurar monitoreo externo (UptimeRobot, Better Uptime, etc.):
```txt
https://<DOMINIO>/api/health/live  → cada 5 minutos
https://<DOMINIO>/api/health/ready → cada 5 minutos
```

### 12.4 Rotación de logs

```bash
# pm2-logrotate ya configurado en Fase 5.9
# Verificar estado:
pm2 show pm2-logrotate
```

### 12.5 Renovación de Certbot

```bash
# Verificar timer
sudo systemctl list-timers | grep certbot

# Forzar renovación si es necesario
sudo certbot renew --force-renewal
sudo nginx -t && sudo systemctl reload nginx
```

---

## Resumen de Cambios (en el VPS)

| Componente | Antes (Docker) | Después (Directo) |
|------------|----------------|--------------------|
| **Node.js** | Dentro de contenedor | v22+ via nvm en host |
| **MongoDB** | mongo:7.0 container | mongod 7.0 directo, 127.0.0.1 |
| **Backend** | Contenedor Express:4000 | PM2 fork, puerto 4000 |
| **Frontend** | Contenedor Next.js:3000 | PM2 fork, puerto 3000 |
| **Nginx** | nginx:1.27-alpine container en :8081 | nginx host en 80/443 |
| **SSL** | Host nginx → Docker nginx | Certbot → nginx host directo |
| **Firewall** | UFW (ya existente) | UFW + fail2ban reforzado |
| **Backup** | mongodump via docker exec | mongodump directo |
| **Logs** | Docker logs | PM2 logs + nginx logs |

## Checklist de Validación Final

- [ ] SSH key-only, root deshabilitado, fail2ban activo
- [ ] UFW solo permite 22, 80, 443
- [ ] Node.js 22 via nvm (persistente al reinicio)
- [ ] MongoDB 7.0 instalado, autenticado, solo 127.0.0.1
- [ ] PM2 con ambos procesos online y autostart configurado
- [ ] nginx sirve frontend en HTTPS
- [ ] `curl https://<DOMINIO>/api/health/ready` → 200 OK
- [ ] Certificado SSL válido con renovación automática
- [ ] Backup diario configurado y probado
- [ ] Script de rollback funcional
- [ ] CI/CD deploy automático desde GitHub
- [ ] nmap desde exterior muestra solo 22, 80, 443
- [ ] `npm run typecheck`, `lint`, `test`, `build`, `verify` pasan en CI
