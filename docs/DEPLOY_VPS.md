# 🚀 GUÍA DE DEPLOY EN VPS - CERMONT ATG

## 📋 Tabla de Contenidos

1. [Requisitos del VPS](#requisitos-del-vps)
2. [Opción A: Deploy Automático (Recomendado)](#opción-a-deploy-automático)
3. [Opción B: Deploy con Docker](#opción-b-deploy-con-docker)
4. [Opción C: Deploy Manual](#opción-c-deploy-manual)
5. [Configuración SSL](#configuración-ssl)
6. [Monitoreo y Logs](#monitoreo-y-logs)
7. [Backups](#backups)
8. [Troubleshooting](#troubleshooting)

---

## 📦 Requisitos del VPS

### Hardware Mínimo
- **CPU:** 2 cores
- **RAM:** 4GB
- **Disco:** 40GB SSD
- **SO:** Ubuntu 22.04 LTS / Debian 12

### Hardware Recomendado (50+ usuarios)
- **CPU:** 4 cores
- **RAM:** 8GB
- **Disco:** 80GB SSD NVMe
- **SO:** Ubuntu 22.04 LTS

### Puertos Requeridos
| Puerto | Servicio | Descripción |
|--------|----------|-------------|
| 22 | SSH | Administración remota |
| 80 | HTTP | Redirección a HTTPS |
| 443 | HTTPS | Tráfico web seguro |
| 5432 | PostgreSQL | Base de datos (solo interno) |

---

## 🎯 Opción A: Deploy Automático (Recomendado)

### Paso 1: Conectar al VPS

```bash
ssh root@tu-ip-del-vps
```

### Paso 2: Descargar y ejecutar script

```bash
# Descargar script
curl -o deploy.sh https://raw.githubusercontent.com/JuanDiego30/cermont_aplicativo/main/scripts/deploy-vps.sh

# Dar permisos
chmod +x deploy.sh

# Ejecutar con parámetros
./deploy.sh \
  --domain tu-dominio.com \
  --db-password "TuPasswordSeguro123!" \
  --email admin@tu-dominio.com
```

### Paso 3: Verificar instalación

```bash
# Ver estado de servicios
pm2 status

# Ver logs
pm2 logs

# Probar API
curl http://localhost:5000/health

# Probar frontend
curl http://localhost:3000
```

### Paso 4: Acceder a la aplicación

```
https://tu-dominio.com
```

---

## 🐳 Opción B: Deploy con Docker

### Paso 1: Instalar Docker

```bash
# Actualizar sistema
apt update && apt upgrade -y

# Instalar Docker
curl -fsSL https://get.docker.com | sh

# Instalar Docker Compose
apt install docker-compose-plugin -y

# Verificar instalación
docker --version
docker compose version
```

### Paso 2: Clonar repositorio

```bash
cd /var/www
git clone https://github.com/JuanDiego30/cermont_aplicativo.git
cd cermont_aplicativo
```

### Paso 3: Configurar variables de entorno

```bash
# Crear archivo .env
cat > .env <<EOF
# Database
DB_USER=cermont_user
DB_PASSWORD=TuPasswordSeguro123!
DB_NAME=cermont_db

# Redis
REDIS_PASSWORD=RedisPassword123!

# JWT (generar con: openssl rand -hex 32)
JWT_SECRET=$(openssl rand -hex 32)
JWT_REFRESH_SECRET=$(openssl rand -hex 32)

# URLs
DOMAIN=tu-dominio.com
CORS_ORIGIN=https://tu-dominio.com
FRONTEND_URL=https://tu-dominio.com
NEXT_PUBLIC_API_URL=https://tu-dominio.com/api
EOF
```

### Paso 4: Iniciar servicios

```bash
# Construir y arrancar
docker compose -f docker-compose.vps.yml up -d --build

# Ver logs
docker compose -f docker-compose.vps.yml logs -f

# Ver estado
docker compose -f docker-compose.vps.yml ps
```

### Paso 5: Ejecutar migraciones

```bash
# Entrar al container backend
docker compose -f docker-compose.vps.yml exec backend sh

# Ejecutar migraciones
npx prisma migrate deploy

# Seed de datos iniciales
npx prisma db seed

# Salir
exit
```

---

## 🔧 Opción C: Deploy Manual

### 1. Actualizar sistema

```bash
apt update && apt upgrade -y
apt install -y curl git wget build-essential
```

### 2. Instalar Node.js 20

```bash
curl -fsSL https://deb.nodesource.com/setup_20.x | bash -
apt install -y nodejs
npm install -g pnpm pm2
```

### 3. Instalar PostgreSQL

```bash
apt install -y postgresql postgresql-contrib

# Crear usuario y base de datos
sudo -u postgres psql <<EOF
CREATE USER cermont_user WITH PASSWORD 'TuPasswordSeguro123!';
CREATE DATABASE cermont_db OWNER cermont_user;
GRANT ALL PRIVILEGES ON DATABASE cermont_db TO cermont_user;
EOF
```

### 4. Instalar Nginx

```bash
apt install -y nginx
systemctl enable nginx
```

### 5. Clonar y configurar aplicación

```bash
# Clonar
cd /var/www
git clone https://github.com/JuanDiego30/cermont_aplicativo.git
cd cermont_aplicativo

# Configurar backend
cat > backend/.env <<EOF
NODE_ENV=production
PORT=5000
DATABASE_URL="postgresql://cermont_user:TuPasswordSeguro123!@localhost:5432/cermont_db"
JWT_SECRET=$(openssl rand -hex 32)
JWT_REFRESH_SECRET=$(openssl rand -hex 32)
CORS_ORIGIN=https://tu-dominio.com
FRONTEND_URL=https://tu-dominio.com
EOF

# Configurar frontend
cat > frontend/.env.production <<EOF
NEXT_PUBLIC_API_URL=https://tu-dominio.com/api
NEXT_PUBLIC_ENV=production
EOF

# Instalar y compilar backend
cd backend
pnpm install
pnpm run build
npx prisma migrate deploy
npx prisma db seed

# Instalar y compilar frontend
cd ../frontend
pnpm install
pnpm run build
```

### 6. Configurar PM2

```bash
cd /var/www/cermont_aplicativo
cp scripts/ecosystem.config.js .

# Iniciar aplicaciones
pm2 start ecosystem.config.js --env production
pm2 save
pm2 startup
```

### 7. Configurar Nginx

```bash
# Copiar configuración
cp nginx/cermont.conf /etc/nginx/sites-available/cermont

# Editar dominio
nano /etc/nginx/sites-available/cermont
# Cambiar 'server_name _;' por 'server_name tu-dominio.com;'

# Habilitar sitio
ln -s /etc/nginx/sites-available/cermont /etc/nginx/sites-enabled/
rm /etc/nginx/sites-enabled/default

# Probar y reiniciar
nginx -t
systemctl reload nginx
```

---

## 🔐 Configuración SSL

### Con Let's Encrypt (Gratis)

```bash
# Instalar Certbot
apt install -y certbot python3-certbot-nginx

# Obtener certificado
certbot --nginx -d tu-dominio.com -d www.tu-dominio.com

# Verificar auto-renovación
certbot renew --dry-run

# El certificado se renovará automáticamente
```

### Certificado Propio

```bash
# Crear directorio para certificados
mkdir -p /etc/nginx/ssl

# Copiar tus certificados
cp tu-certificado.crt /etc/nginx/ssl/fullchain.pem
cp tu-clave-privada.key /etc/nginx/ssl/privkey.pem

# Ajustar permisos
chmod 600 /etc/nginx/ssl/*

# Descomentar configuración SSL en nginx
nano /etc/nginx/sites-available/cermont
# Buscar y descomentar la sección HTTPS

# Reiniciar Nginx
systemctl reload nginx
```

---

## 📊 Monitoreo y Logs

### Ver estado de aplicaciones

```bash
# PM2 status
pm2 status

# Monitoreo en tiempo real
pm2 monit
```

### Ver logs

```bash
# Todos los logs
pm2 logs

# Solo backend
pm2 logs cermont-backend

# Solo frontend
pm2 logs cermont-frontend

# Últimas 100 líneas
pm2 logs --lines 100

# Logs de Nginx
tail -f /var/log/nginx/access.log
tail -f /var/log/nginx/error.log
```

### Métricas del sistema

```bash
# CPU y memoria
htop

# Espacio en disco
df -h

# Conexiones de red
netstat -tulpn
```

### Configurar alertas (opcional)

```bash
# Instalar PM2 Plus para alertas
pm2 plus

# O usar UptimeRobot (gratis)
# https://uptimerobot.com
# Monitorear: https://tu-dominio.com/health
```

---

## 💾 Backups

### Backup automático de base de datos

```bash
# Crear script de backup
cat > /var/www/cermont_aplicativo/scripts/backup.sh <<'EOF'
#!/bin/bash
BACKUP_DIR="/var/backups/cermont"
DATE=$(date +%Y%m%d_%H%M%S)
mkdir -p $BACKUP_DIR

# Backup PostgreSQL
pg_dump -U cermont_user cermont_db | gzip > "$BACKUP_DIR/db_$DATE.sql.gz"

# Backup uploads
tar -czf "$BACKUP_DIR/uploads_$DATE.tar.gz" /var/www/cermont_aplicativo/uploads

# Eliminar backups mayores a 7 días
find $BACKUP_DIR -type f -mtime +7 -delete

echo "Backup completado: $DATE"
EOF

chmod +x /var/www/cermont_aplicativo/scripts/backup.sh
```

### Programar backups diarios

```bash
# Agregar a crontab
crontab -e

# Agregar línea (backup diario a las 3 AM)
0 3 * * * /var/www/cermont_aplicativo/scripts/backup.sh >> /var/log/cermont-backup.log 2>&1
```

### Restaurar backup

```bash
# Restaurar base de datos
gunzip < /var/backups/cermont/db_20251130_030000.sql.gz | psql -U cermont_user cermont_db

# Restaurar uploads
tar -xzf /var/backups/cermont/uploads_20251130_030000.tar.gz -C /
```

---

## 🔧 Troubleshooting

### Error: Puerto 5000/3000 en uso

```bash
# Ver qué proceso usa el puerto
lsof -i :5000
lsof -i :3000

# Matar proceso
kill -9 <PID>

# Reiniciar PM2
pm2 restart all
```

### Error: Conexión a PostgreSQL rechazada

```bash
# Verificar que PostgreSQL esté corriendo
systemctl status postgresql

# Verificar configuración de autenticación
nano /etc/postgresql/15/main/pg_hba.conf
# Asegurar que existe la línea:
# local   all   cermont_user   md5

# Reiniciar PostgreSQL
systemctl restart postgresql
```

### Error: CORS bloqueado

```bash
# Verificar CORS_ORIGIN en backend/.env
cat backend/.env | grep CORS

# Debe coincidir con tu dominio
CORS_ORIGIN=https://tu-dominio.com
```

### Error: SSL certificate not found

```bash
# Verificar certificados
ls -la /etc/nginx/ssl/

# Regenerar con Certbot
certbot --nginx -d tu-dominio.com --force-renewal
```

### Reiniciar todo

```bash
# Reiniciar PM2
pm2 restart all

# Reiniciar Nginx
systemctl restart nginx

# Reiniciar PostgreSQL
systemctl restart postgresql
```

### Ver uso de recursos

```bash
# Memoria usada por Node
pm2 monit

# Top procesos
top -o %MEM

# Espacio en disco
du -sh /var/www/cermont_aplicativo/*
```

---

## 📞 Soporte

### Logs para diagnóstico

```bash
# Generar reporte de diagnóstico
pm2 report > /tmp/pm2-report.txt
cat /var/log/nginx/error.log >> /tmp/nginx-errors.txt

# Comprimir para enviar
tar -czf /tmp/cermont-diagnostics.tar.gz /tmp/pm2-report.txt /tmp/nginx-errors.txt
```

### Comandos útiles

| Comando | Descripción |
|---------|-------------|
| `pm2 status` | Ver estado de apps |
| `pm2 logs` | Ver logs en tiempo real |
| `pm2 restart all` | Reiniciar aplicaciones |
| `pm2 reload all` | Reload sin downtime |
| `nginx -t` | Probar config de Nginx |
| `systemctl reload nginx` | Recargar Nginx |
| `certbot renew` | Renovar certificados SSL |

---

## ✅ Checklist Post-Deploy

- [ ] Aplicación accesible en https://tu-dominio.com
- [ ] Login funciona correctamente
- [ ] API responde en /api/health
- [ ] SSL configurado (candado verde)
- [ ] Backups automáticos configurados
- [ ] Logs rotando correctamente
- [ ] Monitoreo configurado (UptimeRobot o similar)
- [ ] Firewall configurado (ufw)
- [ ] Fail2ban instalado (seguridad SSH)

---

**¿Necesitas ayuda?** Abre un issue en GitHub o contacta al equipo de desarrollo.
