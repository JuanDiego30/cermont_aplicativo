# 🚀 GUÍA DE DESPLIEGUE - CERMONT en VPS Contabo

## Requisitos del VPS

- **Sistema Operativo**: Ubuntu 22.04 LTS o Debian 12
- **RAM mínima**: 2GB (recomendado 4GB)
- **Disco**: 20GB mínimo
- **Puerto SSL**: El que te proporciona Contabo

---

## 📋 Pasos de Instalación

### 1. Conectarse al VPS

```bash
ssh root@TU_IP_DEL_VPS
```

### 2. Actualizar el sistema

```bash
apt update && apt upgrade -y
```

### 3. Instalar Docker

```bash
# Instalar Docker
curl -fsSL https://get.docker.com | sh

# Añadir tu usuario al grupo docker (opcional, para no usar sudo)
usermod -aG docker $USER

# Instalar Docker Compose plugin
apt install docker-compose-plugin -y

# Verificar instalación
docker --version
docker compose version
```

### 4. Instalar Git y clonar el repositorio

```bash
apt install git -y

# Clonar el repositorio
git clone https://github.com/TU_USUARIO/cermont_aplicativo.git
cd cermont_aplicativo
```

### 5. Configurar variables de entorno

```bash
# Copiar archivo de ejemplo
cp .env.example .env

# Generar claves secretas
./deploy.sh secrets

# Editar el archivo .env con las claves generadas
nano .env
```

**Ejemplo de .env configurado:**
```env
DB_NAME=cermont
DB_USER=cermont_user
DB_PASSWORD=a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6

JWT_SECRET=abc123def456ghi789jkl012mno345pqr678stu901vwx234yz567
JWT_EXPIRY=24h
JWT_REFRESH_SECRET=zyx987wvu654tsr321qpo098nml765kji432hgf109edc876ba543
JWT_REFRESH_EXPIRY=7d

FRONTEND_URL=http://TU_IP_DEL_VPS
LOG_LEVEL=info
NODE_ENV=production
```

### 6. Ejecutar el despliegue

```bash
./deploy.sh setup
```

Esto hará:
- Construir las imágenes de Docker
- Iniciar PostgreSQL, API y Frontend
- Ejecutar las migraciones de base de datos

### 7. Verificar que todo funcione

```bash
# Ver estado de los servicios
./deploy.sh status

# Ver logs
./deploy.sh logs

# Probar la API
curl http://localhost/api/health
```

---

## 🔒 Configurar SSL (Opcional pero Recomendado)

Si tienes un dominio apuntando a tu VPS:

### 1. Obtener certificado SSL con Let's Encrypt

```bash
# Instalar certbot
apt install certbot -y

# Obtener certificado
docker compose -f docker-compose.prod.yml run certbot certonly \
  --webroot -w /var/www/certbot \
  -d tu-dominio.com
```

### 2. Configurar Nginx con SSL

Editar `nginx/nginx.conf` y descomentar la sección HTTPS, reemplazando `your-domain.com` con tu dominio.

### 3. Reiniciar Nginx

```bash
./deploy.sh restart
```

---

## 📊 Comandos Útiles

| Comando | Descripción |
|---------|-------------|
| `./deploy.sh start` | Iniciar servicios |
| `./deploy.sh stop` | Detener servicios |
| `./deploy.sh restart` | Reiniciar servicios |
| `./deploy.sh status` | Ver estado |
| `./deploy.sh logs` | Ver todos los logs |
| `./deploy.sh logs api` | Ver logs del API |
| `./deploy.sh backup` | Crear backup de BD |
| `./deploy.sh update` | Actualizar aplicación |

---

## 🔧 Mantenimiento

### Backups Automáticos

Crear un cron job para backups diarios:

```bash
crontab -e
```

Agregar:
```
0 2 * * * /ruta/completa/cermont_aplicativo/deploy.sh backup
```

### Actualizar la Aplicación

```bash
cd /ruta/cermont_aplicativo
git pull origin main
./deploy.sh update
```

### Ver Logs en Tiempo Real

```bash
# Todos los servicios
./deploy.sh logs

# Solo el API
./deploy.sh logs api

# Solo la base de datos
./deploy.sh logs postgres
```

---

## 🚨 Solución de Problemas

### El API no responde

```bash
# Ver logs del API
./deploy.sh logs api

# Reiniciar solo el API
docker compose -f docker-compose.prod.yml restart api
```

### Error de conexión a la base de datos

```bash
# Verificar que PostgreSQL esté corriendo
docker compose -f docker-compose.prod.yml ps postgres

# Ver logs de PostgreSQL
./deploy.sh logs postgres
```

### Problemas de memoria

```bash
# Ver uso de recursos
docker stats

# Limpiar recursos no usados
docker system prune -a
```

---

## 📞 Acceso a la Aplicación

Una vez desplegado:

- **Frontend**: `http://TU_IP_VPS` o `https://tu-dominio.com`
- **API Docs (Swagger)**: `http://TU_IP_VPS/api/docs`
- **Health Check**: `http://TU_IP_VPS/api/health`

---

## 🔐 Credenciales por Defecto

Al hacer el primer despliegue, necesitarás crear un usuario administrador.

Ejecuta el seed de la base de datos:

```bash
docker compose -f docker-compose.prod.yml exec api npx prisma db seed
```

Esto creará un usuario admin por defecto (revisa el archivo `prisma/seed.ts` para las credenciales).

---

## 📝 Notas Importantes

1. **Cambia SIEMPRE** las contraseñas y claves secretas en producción
2. **Haz backups** regulares de la base de datos
3. **Mantén Docker actualizado** para parches de seguridad
4. **Monitorea los logs** para detectar problemas temprano

---

© 2024-2026 CERMONT S.A.S - Guía de Despliegue v1.0
