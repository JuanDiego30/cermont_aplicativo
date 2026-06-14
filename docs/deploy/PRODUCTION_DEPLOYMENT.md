# Despliegue de Produccion y Preproduccion

**Estado:** CANONICO  
**Actualizado:** 2026-06-13  
**Destino:** VPS Linux con Docker Compose y HTTPS  

Esta es la unica guia operativa para desplegar Cermont. El despliegue
productivo es self-hosted en VPS. Vercel y Netlify no sustituyen esta
arquitectura.

## Arquitectura

```txt
Internet
  -> reverse proxy TLS del host
  -> nginx del stack en 127.0.0.1:8081
  -> frontend Next.js :3000
  -> backend Express :4000
  -> MongoDB :27017, solo red interna
```

Los unicos puertos publicos del VPS deben ser SSH, HTTP y HTTPS. MongoDB,
frontend y backend no se publican directamente.

## Requisitos

- Ubuntu LTS o distribucion Linux equivalente
- 2 vCPU, 4 GB RAM y 20 GB libres como minimo
- Docker Engine con `docker compose`
- Git
- Dominio con DNS configurado
- Usuario de despliegue sin privilegios de root
- Acceso a almacenamiento externo para copias de seguridad

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
docker compose --env-file .env.docker.example config --quiet
```

No desplegar si falla un gate, existe una vulnerabilidad alta sin aceptar o no
hay una copia de seguridad restaurable.

## 2. Preparar el VPS

```bash
sudo apt update
sudo apt install -y git ca-certificates curl docker.io docker-compose-plugin nginx
sudo systemctl enable --now docker nginx
sudo useradd --create-home --shell /bin/bash cermont
sudo usermod -aG docker cermont
sudo mkdir -p /opt/cermont
sudo chown cermont:cermont /opt/cermont
```

Cerrar la sesion y volver a entrar para aplicar el grupo `docker`.

## 3. Clonar y configurar

```bash
git clone https://github.com/JuanDiego30/cermont_aplicativo.git /opt/cermont/app
cd /opt/cermont/app
cp .env.docker.example .env
chmod 600 .env
```

Generar valores distintos:

```bash
openssl rand -hex 32
openssl rand -hex 64
openssl rand -hex 64
```

Editar `.env` y definir como minimo:

```env
MONGO_ROOT_USER=<usuario-interno>
MONGO_ROOT_PASSWORD=<secreto-generado>
JWT_SECRET=<secreto-generado>
REFRESH_TOKEN_SECRET=<secreto-diferente>
FRONTEND_URL=https://<dominio>
NEXT_PUBLIC_APP_URL=https://<dominio>
NEXT_PUBLIC_API_URL=https://<dominio>/api
NGINX_PORT=127.0.0.1:8081
LOG_LEVEL=info
```

`NEXT_PUBLIC_*` se fija durante `docker compose build`. Un cambio de dominio
requiere reconstruir la imagen frontend.

## 4. Construir e iniciar

```bash
cd /opt/cermont/app
docker compose config --quiet
docker compose up -d --build --remove-orphans
docker compose ps
```

Verificar desde el VPS:

```bash
curl --fail --silent --show-error http://127.0.0.1:8081/api/health/live
curl --fail --silent --show-error http://127.0.0.1:8081/api/health/ready
curl --fail --silent --show-error --head http://127.0.0.1:8081/
```

## 5. Crear usuarios iniciales

El seed nunca se ejecuta automaticamente y no tiene contraseña predeterminada.
Solo debe usarse en una base vacia y controlada.

```bash
read -rsp "Password inicial: " SEED_DEFAULT_PASSWORD
export SEED_DEFAULT_PASSWORD
docker compose exec -e SEED_DEFAULT_PASSWORD backend \
  node backend/dist/scripts/seed.js
unset SEED_DEFAULT_PASSWORD
```

Cambiar inmediatamente las credenciales iniciales o crear usuarios nominales
desde administracion.

## 6. Configurar HTTPS

El nginx del host termina TLS y reenvia al nginx interno:

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
        proxy_pass http://127.0.0.1:8081;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto https;
    }
}
```

Validar y recargar:

```bash
sudo nginx -t
sudo systemctl reload nginx
curl --fail --silent --show-error https://<dominio>/api/health/ready
```

## 7. Firewall

```bash
sudo ufw allow OpenSSH
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp
sudo ufw --force enable
sudo ufw status verbose
```

No abrir `27017`, `3000`, `4000` ni `8081` a Internet.

## 8. Backup

Crear `/opt/cermont/backup.sh` con permisos `700`:

```bash
#!/usr/bin/env bash
set -euo pipefail

APP_DIR=/opt/cermont/app
BACKUP_DIR=/opt/cermont/backups
TIMESTAMP="$(date -u +%Y%m%dT%H%M%SZ)"

mkdir -p "$BACKUP_DIR"
cd "$APP_DIR"

docker compose exec -T mongodb sh -lc \
  'mongodump --username "$MONGO_INITDB_ROOT_USERNAME" \
  --password "$MONGO_INITDB_ROOT_PASSWORD" \
  --authenticationDatabase admin --archive --gzip' \
  > "$BACKUP_DIR/cermont-$TIMESTAMP.archive.gz"

find "$BACKUP_DIR" -type f -name 'cermont-*.archive.gz' -mtime +14 -delete
```

Programar una copia diaria y replicarla fuera del VPS. Verificar
periodicamente una restauracion en preproduccion.

## 9. Restaurar

```bash
cd /opt/cermont/app
cat /ruta/backup.archive.gz | docker compose exec -T mongodb sh -lc \
  'mongorestore --username "$MONGO_INITDB_ROOT_USERNAME" \
  --password "$MONGO_INITDB_ROOT_PASSWORD" \
  --authenticationDatabase admin --archive --gzip --drop'
```

Detener escritura de usuarios durante una restauracion.

## 10. Actualizar

```bash
cd /opt/cermont/app
git fetch origin main
git checkout main
git pull --ff-only origin main
docker compose config --quiet
docker compose up -d --build --remove-orphans
curl --fail --silent --show-error --retry 12 --retry-delay 5 \
  https://<dominio>/api/health/ready
```

## 11. Rollback

Registrar la revision estable antes de actualizar:

```bash
git rev-parse HEAD > .last-known-good
```

Si falla la verificacion:

```bash
git checkout "$(cat .last-known-good)"
docker compose up -d --build --remove-orphans
curl --fail --silent --show-error https://<dominio>/api/health/ready
```

No ejecutar `docker compose down -v` en produccion.

## 12. GitHub Actions

Configurar estos secretos por ambiente:

```txt
VPS_HOST
VPS_PORT
VPS_USER
VPS_SSH_KEY
VPS_DOMAIN
```

El workflow de CI ejecuta `npm run verify` y valida Compose. Los workflows de
produccion y staging actualizan el VPS con Docker Compose y comprueban
readiness.

## Checklist de aceptacion

- Todos los gates locales y de CI pasan
- `docker compose ps` muestra servicios sanos
- Liveness y readiness responden por HTTPS
- Login, RBAC y navegacion por rol fueron probados
- Carga y descarga autenticada de evidencias funciona
- Flujo de planeacion, ejecucion y cierre administrativo fue probado
- Modo offline y sincronizacion fueron probados en navegador real
- Backup externo y restauracion fueron verificados
- Firewall expone solo los puertos aprobados
- No hay secretos, IPs de infraestructura ni credenciales en Git
