# Deploy Manual — CERMONT S.A.S. en VPS Contabo

**Sigue estos pasos UNO POR UNO desde la terminal del VPS.**

---

## Paso 1: Conectarse al VPS

```bash
ssh root@13.140.161.225
# Ingresa tu contraseña cuando la pida
```

---

## Paso 2: Actualizar el servidor

```bash
apt update && apt upgrade -y
```

---

## Paso 3: Clonar el repositorio

```bash
mkdir -p /opt/cermont
cd /opt/cermont
git clone --branch deploy/vps-clean --depth 1 https://github.com/JuanDiego30/cermont_aplicativo.git app
cd app
```

---

## Paso 4: Generar secrets y crear .env

Ejecuta UNO POR UNO estos comandos:

```bash
# Generar secrets
JWT_SECRET=$(openssl rand -hex 64)
REFRESH_SECRET=$(openssl rand -hex 64)
MONGO_PASS=$(openssl rand -hex 32)

# Crear archivo .env
cat > .env << 'ENVEOF'
# CERMONT S.A.S. — Producción
JWT_SECRET=REEMPLAZAR
REFRESH_TOKEN_SECRET=REEMPLAZAR
MONGO_ROOT_USER=cermont_admin
MONGO_ROOT_PASSWORD=REEMPLAZAR
NODE_ENV=production
PORT=4000
MONGODB_URI=mongodb://cermont_admin:REEMPLAZAR@mongodb:27017/cermont?authSource=admin
FRONTEND_URL=https://cermontsas.shop
BACKEND_URL=http://backend:4000
UPLOAD_DIR=/app/uploads
MAX_FILE_SIZE=52428800
JWT_EXPIRES_IN=15m
REFRESH_TOKEN_EXPIRES_IN=7d
BCRYPT_ROUNDS=12
LOG_LEVEL=info
NEXT_PUBLIC_API_URL=https://cermontsas.shop/api
NEXT_PUBLIC_APP_URL=https://cermontsas.shop
NEXT_PUBLIC_APP_NAME=Cermont S.A.S.
NEXT_TELEMETRY_DISABLED=1
ENVEOF

# Reemplazar los valores generados
sed -i "s/JWT_SECRET=REEMPLAZAR/JWT_SECRET=$JWT_SECRET/" .env
sed -i "s/REFRESH_TOKEN_SECRET=REEMPLAZAR/REFRESH_TOKEN_SECRET=$REFRESH_SECRET/" .env
sed -i "s/MONGO_ROOT_PASSWORD=REEMPLAZAR/MONGO_ROOT_PASSWORD=$MONGO_PASS/" .env  
sed -i "s/mongodb:\/\/cermont_admin:REEMPLAZAR/mongodb:\/\/cermont_admin:$MONGO_PASS/" .env

echo "✅ .env creado con secrets seguros"
```

---

## Paso 5: Construir imágenes Docker

```bash
docker compose build --no-cache
```

Esto toma 5-15 minutos. Debe terminar sin errores.

---

## Paso 6: Iniciar servicios

```bash
docker compose up -d
sleep 10
```

---

## Paso 7: Verificar que funciona

```bash
# Ver contenedores corriendo
docker compose ps

# Verificar backend
curl -s http://localhost:4000/api/health

# Verificar frontend
curl -s -o /dev/null -w "Frontend: %{http_code}\n" http://localhost:3000/
```

Todos deben responder **200 OK**.

---

## Paso 8: Ver logs por si hay errores

```bash
docker compose logs --tail=50 backend
docker compose logs --tail=50 frontend
```

Si ves errores, pausa aquí y revisa.

---

## Paso 9: Configurar DNS en Hostinger

En el panel de Hostinger, agrega un registro A:

| Tipo | Nombre | Valor |
|------|--------|-------|
| A | @ | 13.140.161.225 |
| A | www | 13.140.161.225 |

Espera 5-30 min para propagación.

Verifica:
```bash
dig cermontsas.shop +short
# Debe mostrar: 13.140.161.225
```

---

## Paso 10: Configurar SSL

```bash
apt install -y certbot python3-certbot-nginx
certbot --nginx -d cermontsas.shop -d www.cermontsas.shop --non-interactive --agree-tos --redirect
```

---

## Paso 11: Firewall

```bash
ufw allow OpenSSH
ufw allow 80/tcp
ufw allow 443/tcp
ufw --force enable
ufw status verbose
```

---

## Paso 12: Backup automático

```bash
mkdir -p /opt/cermont/backups

cat > /opt/cermont/backup.sh << 'BACKUPEOF'
#!/bin/bash
BACKUP_DIR="/opt/cermont/backups"
TIMESTAMP=$(date +%Y%m%d_%H%M%S)
cd /opt/cermont/app
docker compose exec -T mongodb mongodump --archive=/tmp/backup.archive --gzip
docker cp $(docker compose ps -q mongodb):/tmp/backup.archive "$BACKUP_DIR/cermont-$TIMESTAMP.archive"
find "$BACKUP_DIR" -name "cermont-*.archive" -mtime +7 -delete
echo "Backup: cermont-$TIMESTAMP.archive"
BACKUPEOF

chmod +x /opt/cermont/backup.sh
(crontab -l 2>/dev/null; echo "0 3 * * * /opt/cermont/backup.sh >> /var/log/cermont-backup.log 2>&1") | crontab -
echo "✅ Backup diario configurado a las 3 AM"
```

---

## Paso 13: Prueba final desde navegador

Abre **https://cermontsas.shop/** y verifica:
1. ✅ Login funciona
2. ✅ Dashboard carga
3. ✅ Navegación funciona

---

## Resumen de comandos útiles

```bash
# Ver logs
docker compose logs -f --tail=50

# Ver estado
docker compose ps
docker compose stats --no-stream

# Reiniciar backend
docker compose restart backend

# Backup manual
bash /opt/cermont/backup.sh

# Detener todo
docker compose down

# Actualizar (después de git pull)
git pull
docker compose build --no-cache
docker compose up -d
```
