# Guía de Despliegue — CERMONT S.A.S. en VPS Contabo

**Fecha:** 2026-06-09
**VPS:** Contabo Cloud VPS 10 SSD
**IP:** 13.140.161.225
**Dominio:** cermontsas.shop (Hostinger)
**Usuario:** root
**Stack:** Docker Compose (4 servicios)

---

## 1. Acceso SSH al VPS

```bash
ssh root@13.140.161.225
```

> ⚠️ Si no recuerdas la contraseña, restablécela en:
> https://my.contabo.com → VPS → Reset Password

---

## 2. Preparación Inicial del Servidor

```bash
# Actualizar sistema
apt update && apt upgrade -y

# Verificar Docker
docker --version
docker compose version

# Verificar puertos abiertos
ss -tulpn

# Configurar firewall (SOLO después de tener Nginx funcionando)
ufw allow OpenSSH
ufw allow 80/tcp
ufw allow 443/tcp
ufw enable
ufw status verbose
```

---

## 3. Clonar Repositorio

```bash
# Crear directorio
mkdir -p /opt/cermont
cd /opt/cermont

# Clonar
git clone https://github.com/JuanDiego30/cermont_aplicativo.git app
cd app

# Cambiar a rama de deploy
git checkout deploy/vps-clean
git pull origin deploy/vps-clean
```

---

## 4. Configurar Variables de Entorno

```bash
# Copiar .env.production como .env
cp .env.production .env

# GENERAR SECRETS REALES (IMPORTANTE: hacer esto AHORA)
# Abrir el archivo .env con nano
nano .env
```

Generar secrets:
```bash
openssl rand -hex 64   # Para JWT_SECRET
openssl rand -hex 64   # Para REFRESH_TOKEN_SECRET (DIFERENTE)
openssl rand -hex 32   # Para MONGO_ROOT_PASSWORD
```

Reemplazar estos valores en `.env`:
- `JWT_SECRET` → valor de `openssl rand -hex 64`
- `REFRESH_TOKEN_SECRET` → valor del segundo `openssl rand -hex 64`
- `MONGO_ROOT_PASSWORD` → valor de `openssl rand -hex 32`

---

## 5. Levantar Stack con Docker

```bash
# Build y deploy
docker compose build --no-cache
docker compose up -d

# Verificar estado
docker compose ps
docker compose logs --tail=50 frontend
docker compose logs --tail=50 backend
docker compose logs --tail=50 mongodb
docker compose logs --tail=50 nginx
```

---

## 6. Verificar que los Servicios Responden

```bash
# Frontend
curl -I http://localhost:3000/

# Backend
curl -s http://localhost:4000/api/health

# Via Nginx
curl -I http://localhost:8081/
curl -s http://localhost:8081/api/health
```

---

## 7. Configurar Dominio DNS (Hostinger)

En el panel de Hostinger, agregar un registro A:

| Tipo | Nombre | Valor | TTL |
|------|--------|-------|-----|
| A | @ | 13.140.161.225 | 3600 |
| A | www | 13.140.161.225 | 3600 |

Esperar 5-30 minutos para propagación DNS.

Verificar:
```bash
dig cermontsas.shop +short
# Debe devolver: 13.140.161.225
```

---

## 8. Exponer Puertos para el Dominio

```bash
# Detener stack
docker compose down

# Iniciar con override de producción (expone puerto 80)
docker compose -f docker-compose.yml -f docker/docker-compose.prod.yml up -d

# Verificar que el puerto 80 está abierto
ss -tulpn | grep :80
```

---

## 9. Configurar SSL con Certbot

```bash
# Instalar certbot
apt install -y certbot python3-certbot-nginx

# Obtener certificado SSL
certbot --nginx -d cermontsas.shop -d www.cermontsas.shop

# Verificar renovación automática
certbot renew --dry-run

# Verificar SSL
curl -I https://cermontsas.shop/
```

---

## 10. Configurar Firewall Definitivo

```bash
# Una vez que SSL funciona:
ufw allow OpenSSH
ufw allow 80/tcp
ufw allow 443/tcp
ufw deny 3000
ufw deny 4000
ufw deny 8081
ufw deny 27017
ufw enable
ufw status verbose
```

---

## 11. Configurar Backups Automáticos

```bash
# Crear directorio de backups
mkdir -p /opt/cermont/backups

# Crear script de backup
cat > /opt/cermont/backup.sh << 'EOF'
#!/bin/bash
BACKUP_DIR="/opt/cermont/backups"
TIMESTAMP=$(date +%Y%m%d_%H%M%S)
cd /opt/cermont/app
docker compose exec -T mongodb mongodump --archive=/tmp/backup.archive --gzip
docker cp $(docker compose ps -q mongodb):/tmp/backup.archive "$BACKUP_DIR/cermont-$TIMESTAMP.archive"
find "$BACKUP_DIR" -name "cermont-*.archive" -mtime +7 -delete
echo "Backup completado: cermont-$TIMESTAMP.archive"
EOF

chmod +x /opt/cermont/backup.sh

# Agregar a crontab (diario a las 3am)
echo "0 3 * * * /opt/cermont/backup.sh >> /var/log/cermont-backup.log 2>&1" | crontab -
```

---

## 12. Verificación Final

```bash
# 1. Frontend responde
curl -I https://cermontsas.shop/

# 2. Login funciona
curl -s https://cermontsas.shop/login | grep -o "Cermont"

# 3. API Health responde
curl -s https://cermontsas.shop/api/health

# 4. Assets estáticos
curl -I https://cermontsas.shop/manifest.json
curl -I https://cermontsas.shop/favicon.ico

# 5. Docker estable
docker compose ps

# 6. Sin errores en logs
docker compose logs --tail=20 frontend | grep -i error || echo "Sin errores"
docker compose logs --tail=20 backend | grep -i error || echo "Sin errores"
```

---

## 13. Comandos de Operación Diaria

```bash
# Ver estado
docker compose ps
docker compose stats --no-stream

# Ver logs
docker compose logs -f --tail=100
docker compose logs -f --tail=50 backend

# Reiniciar un servicio
docker compose restart backend

# Actualizar (después de git pull)
docker compose build --no-cache
docker compose up -d

# Backup manual
bash /opt/cermont/backup.sh

# Detener todo
docker compose down

# Detener y limpiar volúmenes (CUIDADO: borra datos)
docker compose down -v
```

---

## 14. Rollback

```bash
# Si algo sale mal después de una actualización:
cd /opt/cermont/app
git log --oneline -5    # Ver commits recientes
git checkout <commit_hash_anterior>  # Volver a versión anterior
docker compose build --no-cache
docker compose up -d
```

---

## Checklist de Verificación

- [ ] SSH funciona
- [ ] Repositorio clonado
- [ ] Secrets generados (openssl)
- [ ] `.env` configurado
- [ ] Docker compose build exitoso
- [ ] Docker compose up sin errores
- [ ] Frontend responde en puerto 3000
- [ ] Backend health responde en 4000
- [ ] Nginx responde en puerto 80
- [ ] Dominio apunta a la IP
- [ ] HTTPS funciona (certbot)
- [ ] Firewall activo (solo 22, 80, 443)
- [ ] Backup automático configurado
- [ ] Sin errores en logs
- [ ] Login funciona en navegador
- [ ] Dashboard carga
- [ ] Módulos críticos funcionan
