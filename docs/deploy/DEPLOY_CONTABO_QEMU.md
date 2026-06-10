# Despliegue CERMONT en Contabo — Guía QEMU/VNC

## Requisitos

- Servidor Contabo con Ubuntu 22.04+ (acceso por consola QEMU/VNC — sin SSH necesario)
- Al menos 2 vCPU / 4 GB RAM / 20 GB disco
- Puerto 80 abierto en el firewall del proveedor

---

## 1. Actualizar el sistema

```bash
apt update && apt upgrade -y
```

## 2. Instalar Docker

```bash
apt install -y git curl ca-certificates docker.io docker-compose-plugin
systemctl enable --now docker
docker --version
docker compose version
```

## 3. Clonar el repositorio

```bash
git clone https://github.com/JuanDiego30/cermont_aplicativo.git
cd cermont_aplicativo
```

## 4. Configurar variables de entorno

```bash
cp .env.example .env
```

Para producción, generar secretos seguros (opcional en demo):

```bash
# JWT_SECRET
openssl rand -hex 32
# REFRESH_TOKEN_SECRET  (diferente al anterior)
openssl rand -hex 32
# MONGO_ROOT_PASSWORD
openssl rand -hex 16
```

Editar `.env` con los valores generados:

```bash
nano .env
```

## 5. Construir y levantar los servicios

```bash
docker compose up -d --build
```

El primer build tarda 5–10 minutos. Los servicios arrancan en este orden:
`mongodb` → `backend` → `frontend` → `nginx`

## 6. Verificar que todos los servicios están activos

```bash
docker compose ps
```

Todos los servicios deben mostrar `Up` en la columna STATUS.

```bash
docker compose logs --tail=50 backend
docker compose logs --tail=50 frontend
```

## 7. Probar el acceso

```bash
# Frontend via nginx
curl -I http://localhost/

# Backend health check via nginx
curl -s http://localhost/api/health

# Manifest PWA
curl -I http://localhost/manifest.json
```

## 8. Sembrar usuarios iniciales

```bash
docker compose exec backend npm run seed
```

Usuarios creados (contraseña: `Cermont2026!`):

| Email | Rol |
|-------|-----|
| gerencia@cermont.co | Gerencia General |
| gerente@cermont.com | Gerente |
| residente@cermont.com | Residente |
| hes@cermont.com | HES |
| supervisor@cermont.com | Supervisor |
| operador@cermont.com | Operador |
| tecnico@cermont.com | Técnico |
| administrativo@cermont.com | Administrativo |
| cliente@cermont.com | Cliente |

## 9. Acceder desde el navegador

```
http://IP_DEL_SERVIDOR
```

Reemplazar `IP_DEL_SERVIDOR` por la IP pública del VPS (visible en el panel de Contabo).

---

## Comandos útiles

```bash
# Logs en vivo
docker compose logs -f

# Logs de un servicio específico
docker compose logs -f backend

# Reiniciar todos los servicios
docker compose restart

# Reiniciar solo el backend
docker compose restart backend

# Detener todo (sin borrar datos)
docker compose down

# Detener y borrar volúmenes (CUIDADO: borra la base de datos)
docker compose down -v

# Actualizar la aplicación (re-build)
git pull
docker compose up -d --build
```

---

## Solución de problemas

### El puerto 80 está en uso

```bash
# Ver qué usa el puerto 80
ss -tlnp | grep :80

# Si es apache/nginx del sistema
systemctl stop apache2 nginx 2>/dev/null || true
docker compose up -d
```

### MongoDB no arranca

```bash
docker compose logs mongodb
# Verificar permisos del volumen
docker volume ls
```

### El frontend no carga

```bash
# Verificar que Next.js está corriendo
docker compose exec frontend curl -f http://localhost:3000 || echo "Frontend no responde"

# Verificar nginx
docker compose exec nginx nginx -t
```

### Smoke test completo

```bash
node scripts/smoke-assets.mjs
```

---

## Seguridad para producción

1. Cambiar TODOS los valores en `.env` (JWT_SECRET, REFRESH_TOKEN_SECRET, MONGO_ROOT_PASSWORD)
2. Configurar firewall (`ufw allow 80/tcp && ufw allow 22/tcp && ufw enable`)
3. Considerar HTTPS con Let's Encrypt + certbot
4. Desactivar seed automático: `SEED_ON_START=false` en `.env`
