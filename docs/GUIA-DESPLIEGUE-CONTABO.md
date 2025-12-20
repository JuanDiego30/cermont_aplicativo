# 🚀 Guía Completa de Despliegue en VPS Contabo

**Fecha**: Enero 2025  
**Servidor**: Contabo VPS  
**Stack**: NestJS + Next.js + PostgreSQL

---

## 📋 TABLA DE CONTENIDOS

1. [Requisitos Previos](#requisitos-previos)
2. [Configuración del VPS](#configuracion-vps)
3. [Instalación en el VPS](#instalacion-vps)
4. [Configuración de Base de Datos](#configuracion-db)
5. [Despliegue de la Aplicación](#despliegue)
6. [Configuración de Nginx](#nginx)
7. [SSL con Let's Encrypt](#ssl)
8. [PM2 para Procesos](#pm2)
9. [Monitoreo y Logs](#monitoreo)
10. [Actualizaciones](#actualizaciones)

---

## ✅ REQUISITOS PREVIOS

### En tu VPS Contabo necesitas:

- ✅ Ubuntu 20.04+ o Debian 11+
- ✅ Acceso SSH con usuario root o sudo
- ✅ Al menos 2GB RAM (4GB recomendado)
- ✅ 20GB+ espacio en disco
- ✅ Puerto 80 y 443 abiertos

### En tu máquina local:

- ✅ Git instalado
- ✅ Node.js 18+ y pnpm (solo para build inicial)
- ✅ Acceso SSH al VPS

---

## 🖥️ CONFIGURACIÓN DEL VPS

### 1. Conectarse al VPS

```bash
ssh root@TU_IP_VPS
# O con usuario específico
ssh usuario@TU_IP_VPS
```

### 2. Actualizar el sistema

```bash
sudo apt update && sudo apt upgrade -y
```

### 3. Instalar dependencias base

```bash
# Node.js 18.x (LTS)
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt install -y nodejs

# pnpm
npm install -g pnpm

# PostgreSQL 16
sudo apt install -y postgresql postgresql-contrib

# Nginx (reverse proxy)
sudo apt install -y nginx

# PM2 (gestor de procesos)
npm install -g pm2

# Git
sudo apt install -y git

# Certbot (SSL)
sudo apt install -y certbot python3-certbot-nginx

# Build tools (necesarios para compilar)
sudo apt install -y build-essential python3
```

### 4. Verificar instalaciones

```bash
node --version   # Debe ser v18.x o superior
pnpm --version   # Debe mostrar versión
psql --version   # Debe ser 14+ o 16
nginx -v         # Debe mostrar versión
pm2 --version    # Debe mostrar versión
```

---

## 🗄️ CONFIGURACIÓN DE BASE DE DATOS

### 1. Configurar PostgreSQL

```bash
# Cambiar a usuario postgres
sudo -u postgres psql

# Crear base de datos y usuario
CREATE DATABASE cermont_db;
CREATE USER cermont_user WITH ENCRYPTED PASSWORD 'TU_PASSWORD_SEGURO_AQUI';
GRANT ALL PRIVILEGES ON DATABASE cermont_db TO cermont_user;
ALTER DATABASE cermont_db OWNER TO cermont_user;

# Salir de psql
\q
```

### 2. Configurar acceso remoto (opcional, solo si necesitas acceso externo)

```bash
# Editar postgresql.conf
sudo nano /etc/postgresql/16/main/postgresql.conf
# Buscar y descomentar: listen_addresses = 'localhost'
# Cambiar a: listen_addresses = '*'

# Editar pg_hba.conf
sudo nano /etc/postgresql/16/main/pg_hba.conf
# Añadir al final:
# host    cermont_db    cermont_user    0.0.0.0/0    md5

# Reiniciar PostgreSQL
sudo systemctl restart postgresql
```

**⚠️ IMPORTANTE**: Solo habilita acceso remoto si realmente lo necesitas y asegúrate de usar firewall.

### 3. Configurar firewall (UFW)

```bash
# Permitir SSH
sudo ufw allow 22/tcp

# Permitir HTTP y HTTPS
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp

# PostgreSQL solo local (ya está por defecto)
# Si necesitas remoto: sudo ufw allow 5432/tcp (NO recomendado)

# Activar firewall
sudo ufw enable
sudo ufw status
```

---

## 📦 INSTALACIÓN EN EL VPS

### 1. Crear usuario para la aplicación (recomendado)

```bash
# Crear usuario
sudo adduser cermont
sudo usermod -aG sudo cermont

# Cambiar a ese usuario
su - cermont
```

### 2. Clonar repositorio

```bash
# En el home del usuario
cd ~
git clone TU_REPOSITORIO_URL cermont-app
cd cermont-app
```

O si ya tienes el código, subirlo con `scp` o `rsync`:

```bash
# Desde tu máquina local
rsync -avz --exclude 'node_modules' --exclude '.next' --exclude '.turbo' \
  ./cermont_aplicativo/ usuario@TU_VPS:~/cermont-app/
```

### 3. Configurar variables de entorno

```bash
cd ~/cermont-app/apps/api

# Crear .env desde el template
cp .env.example .env

# Editar .env
nano .env
```

**Contenido del .env para producción:**

```env
# ============================================
# PRODUCCIÓN - VPS Contabo
# ============================================
NODE_ENV=production
PORT=4000

# Base de Datos
DATABASE_URL="postgresql://cermont_user:TU_PASSWORD@localhost:5432/cermont_db?schema=public"

# JWT (GENERAR UN SECRET SEGURO)
JWT_SECRET="TU_JWT_SECRET_MUY_SEGURO_DE_AL_MENOS_32_CARACTERES"
JWT_EXPIRES_IN="15m"
JWT_REFRESH_EXPIRES_IN="7d"

# Frontend URL (tu dominio)
FRONTEND_URL="https://tu-dominio.com"

# Logging
LOG_LEVEL=error

# Seguridad
TRUST_PROXY=true
```

**Generar JWT_SECRET seguro:**

```bash
openssl rand -base64 48
```

### 4. Configurar frontend

```bash
cd ~/cermont-app/apps/web

# Crear .env.production
nano .env.production
```

**Contenido:**

```env
NEXT_PUBLIC_API_URL=https://api.tu-dominio.com
# O si usas el mismo dominio:
# NEXT_PUBLIC_API_URL=https://tu-dominio.com/api
```

### 5. Instalar dependencias y build

```bash
cd ~/cermont-app

# Instalar dependencias
pnpm install

# Build backend
pnpm run build:api

# Build frontend
pnpm run build:web
```

### 6. Ejecutar migraciones

```bash
cd apps/api

# Generar cliente Prisma
pnpm prisma:generate

# Aplicar migraciones (NO crea nuevas, solo aplica existentes)
pnpm prisma:migrate deploy
```

---

## 🚀 DESPLIEGUE CON PM2

### 1. Configurar PM2

```bash
cd ~/cermont-app

# Crear archivo de configuración PM2
nano ecosystem.config.js
```

**Contenido de ecosystem.config.js:**

```javascript
module.exports = {
  apps: [
    {
      name: 'cermont-api',
      script: './apps/api/dist/main.js',
      cwd: './apps/api',
      instances: 2, // Usar múltiples instancias para mejor performance
      exec_mode: 'cluster',
      env: {
        NODE_ENV: 'production',
        PORT: 4000
      },
      error_file: './logs/api-error.log',
      out_file: './logs/api-out.log',
      log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
      merge_logs: true,
      autorestart: true,
      watch: false,
      max_memory_restart: '1G'
    },
    {
      name: 'cermont-web',
      script: './apps/web/server.js',
      cwd: './apps/web',
      instances: 2,
      exec_mode: 'cluster',
      env: {
        NODE_ENV: 'production',
        PORT: 3000
      },
      error_file: './logs/web-error.log',
      out_file: './logs/web-out.log',
      log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
      merge_logs: true,
      autorestart: true,
      watch: false,
      max_memory_restart: '1G'
    }
  ]
};
```

### 2. Iniciar aplicaciones con PM2

```bash
# Crear directorio de logs
mkdir -p ~/cermont-app/logs

# Iniciar aplicaciones
pm2 start ecosystem.config.js

# Guardar configuración para que se inicie al reiniciar el servidor
pm2 save
pm2 startup
# Seguir las instrucciones que muestra
```

### 3. Comandos útiles de PM2

```bash
# Ver estado
pm2 status

# Ver logs
pm2 logs
pm2 logs cermont-api
pm2 logs cermont-web

# Reiniciar
pm2 restart all
pm2 restart cermont-api

# Detener
pm2 stop all

# Eliminar
pm2 delete all

# Monitoreo en tiempo real
pm2 monit
```

---

## 🌐 CONFIGURACIÓN DE NGINX

### 1. Crear configuración de Nginx

```bash
sudo nano /etc/nginx/sites-available/cermont
```

**Configuración completa:**

```nginx
# Redirigir HTTP a HTTPS
server {
    listen 80;
    listen [::]:80;
    server_name tu-dominio.com www.tu-dominio.com;
    
    # Para Let's Encrypt
    location /.well-known/acme-challenge/ {
        root /var/www/html;
    }
    
    location / {
        return 301 https://$server_name$request_uri;
    }
}

# Backend API
server {
    listen 443 ssl http2;
    listen [::]:443 ssl http2;
    server_name api.tu-dominio.com;  # O usar tu-dominio.com/api
    
    # SSL (se configurará después con Certbot)
    # ssl_certificate /etc/letsencrypt/live/api.tu-dominio.com/fullchain.pem;
    # ssl_certificate_key /etc/letsencrypt/live/api.tu-dominio.com/privkey.pem;
    
    # Logs
    access_log /var/log/nginx/cermont-api-access.log;
    error_log /var/log/nginx/cermont-api-error.log;
    
    # Timeouts para requests largos
    proxy_read_timeout 300s;
    proxy_connect_timeout 75s;
    
    location / {
        proxy_pass http://localhost:4000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
    
    # Para archivos estáticos (uploads)
    location /uploads {
        alias /home/cermont/cermont-app/apps/api/uploads;
        expires 30d;
        add_header Cache-Control "public, immutable";
    }
}

# Frontend Next.js
server {
    listen 443 ssl http2;
    listen [::]:443 ssl http2;
    server_name tu-dominio.com www.tu-dominio.com;
    
    # SSL (se configurará después con Certbot)
    # ssl_certificate /etc/letsencrypt/live/tu-dominio.com/fullchain.pem;
    # ssl_certificate_key /etc/letsencrypt/live/tu-dominio.com/privkey.pem;
    
    # Logs
    access_log /var/log/nginx/cermont-web-access.log;
    error_log /var/log/nginx/cermont-web-error.log;
    
    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
}
```

**Si prefieres usar el mismo dominio para frontend y API:**

```nginx
server {
    listen 443 ssl http2;
    server_name tu-dominio.com www.tu-dominio.com;
    
    # ... SSL config ...
    
    # API
    location /api {
        proxy_pass http://localhost:4000;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
    
    # Frontend
    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

### 2. Activar configuración

```bash
# Crear symlink
sudo ln -s /etc/nginx/sites-available/cermont /etc/nginx/sites-enabled/

# Eliminar default (opcional)
sudo rm /etc/nginx/sites-enabled/default

# Verificar configuración
sudo nginx -t

# Si está bien, reiniciar Nginx
sudo systemctl restart nginx
```

---

## 🔒 SSL CON LET'S ENCRYPT

### 1. Obtener certificados SSL

```bash
# Para el dominio principal
sudo certbot --nginx -d tu-dominio.com -d www.tu-dominio.com

# Para el subdominio API (si usas subdominio separado)
sudo certbot --nginx -d api.tu-dominio.com

# Seguir las instrucciones
```

Certbot modificará automáticamente la configuración de Nginx para incluir SSL.

### 2. Verificar renovación automática

```bash
# Verificar que el timer esté activo
sudo systemctl status certbot.timer

# Probar renovación manualmente
sudo certbot renew --dry-run
```

---

## 📊 MONITOREO Y LOGS

### 1. Ver logs de PM2

```bash
# Todos los logs
pm2 logs

# Solo errores
pm2 logs --err

# Logs de API
pm2 logs cermont-api

# Logs de Web
pm2 logs cermont-web
```

### 2. Ver logs de Nginx

```bash
# Accesos
sudo tail -f /var/log/nginx/cermont-api-access.log
sudo tail -f /var/log/nginx/cermont-web-access.log

# Errores
sudo tail -f /var/log/nginx/cermont-api-error.log
sudo tail -f /var/log/nginx/cermont-web-error.log
```

### 3. Ver logs de la aplicación

```bash
# Logs de Winston (si están configurados)
tail -f ~/cermont-app/apps/api/logs/combined-*.log
tail -f ~/cermont-app/apps/api/logs/error-*.log
```

### 4. Monitoreo de recursos

```bash
# CPU y memoria
htop

# Espacio en disco
df -h

# Uso de PostgreSQL
sudo -u postgres psql -c "SELECT * FROM pg_stat_database WHERE datname='cermont_db';"
```

---

## 🔄 ACTUALIZACIONES

### Script de actualización

```bash
# Crear script de actualización
nano ~/update-app.sh
```

**Contenido:**

```bash
#!/bin/bash
set -e

echo "🔄 Actualizando aplicación..."

cd ~/cermont-app

# Pull de código
git pull origin main

# Instalar dependencias
pnpm install

# Build
pnpm run build:api
pnpm run build:web

# Aplicar migraciones
cd apps/api
pnpm prisma:generate
pnpm prisma:migrate deploy
cd ../..

# Reiniciar con PM2
pm2 restart all

echo "✅ Actualización completada"
```

```bash
# Dar permisos de ejecución
chmod +x ~/update-app.sh

# Ejecutar actualización
~/update-app.sh
```

---

## ✅ CHECKLIST DE DESPLIEGUE

- [ ] VPS configurado con Ubuntu/Debian
- [ ] Node.js 18+ instalado
- [ ] PostgreSQL instalado y configurado
- [ ] Base de datos creada
- [ ] Usuario de base de datos creado
- [ ] Firewall configurado
- [ ] Código clonado/subido al VPS
- [ ] Variables de entorno configuradas (.env)
- [ ] Dependencias instaladas
- [ ] Build ejecutado (backend y frontend)
- [ ] Migraciones aplicadas
- [ ] PM2 configurado y aplicaciones corriendo
- [ ] Nginx configurado
- [ ] SSL configurado con Let's Encrypt
- [ ] Dominios apuntando al VPS (DNS)
- [ ] Aplicación accesible vía HTTPS
- [ ] Logs funcionando
- [ ] Monitoreo configurado

---

## 🆘 SOLUCIÓN DE PROBLEMAS

### La aplicación no inicia

```bash
# Ver logs de PM2
pm2 logs

# Verificar que el puerto esté libre
sudo netstat -tlnp | grep :4000
sudo netstat -tlnp | grep :3000

# Verificar variables de entorno
cd apps/api
cat .env
```

### Errores de conexión a base de datos

```bash
# Verificar que PostgreSQL esté corriendo
sudo systemctl status postgresql

# Probar conexión
psql -h localhost -U cermont_user -d cermont_db

# Verificar DATABASE_URL en .env
```

### Nginx da error 502

```bash
# Verificar que las apps estén corriendo
pm2 status

# Verificar logs de Nginx
sudo tail -f /var/log/nginx/error.log

# Verificar configuración de Nginx
sudo nginx -t
```

### SSL no funciona

```bash
# Verificar certificados
sudo certbot certificates

# Renovar manualmente
sudo certbot renew

# Verificar configuración de Nginx
sudo nginx -t
```

---

## 📝 NOTAS FINALES

1. **Seguridad**:
   - Cambia todos los passwords por defecto
   - Mantén el sistema actualizado: `sudo apt update && sudo apt upgrade`
   - Usa SSH keys en lugar de passwords
   - Limita acceso SSH por IP si es posible

2. **Backups**:
   - Configura backups automáticos de PostgreSQL
   - Haz backup del código regularmente
   - Guarda los archivos .env de forma segura

3. **Performance**:
   - Monitorea el uso de recursos
   - Ajusta instancias de PM2 según tus recursos
   - Considera usar Redis para cache si es necesario

4. **Dominios**:
   - Configura DNS A record apuntando a la IP del VPS
   - Espera propagación DNS (puede tardar hasta 24 horas)

---

**Última actualización**: Enero 2025
