# Variables de Entorno — CERMONT S.A.S.

> Referencia completa de variables para el despliegue Docker.
> Ver `.env.example` para una copia lista para usar.

---

## Variables requeridas

Las siguientes variables deben definirse en `.env` antes de `docker compose up`.

| Variable | Descripcion | Ejemplo (demo) |
|----------|-------------|----------------|
| `MONGO_ROOT_USER` | Usuario administrador de MongoDB | `cermont_admin` |
| `MONGO_ROOT_PASSWORD` | Contrasena administrador MongoDB (min. 16 chars) | `change_me_strong_password` |
| `JWT_SECRET` | Secreto para firmar tokens JWT (min. 32 chars) | `openssl rand -hex 32` |
| `REFRESH_TOKEN_SECRET` | Secreto para refresh tokens — diferente de JWT_SECRET | `openssl rand -hex 32` |

---

## Variables opcionales

Estas variables tienen valores por defecto definidos en `docker-compose.yml`.

| Variable | Default | Descripcion |
|----------|---------|-------------|
| `NEXT_PUBLIC_API_URL` | `http://localhost/api` | URL del API desde el navegador. En VPS: `http://<IP>/api` |
| `NEXT_PUBLIC_APP_URL` | `http://localhost:3000` | URL publica de la aplicacion |
| `FRONTEND_URL` | `http://localhost:3000` | URL del frontend para CORS del backend |
| `SEED_ON_START` | `true` | Si true, siembra usuarios demo en BD vacia al arrancar |
| `SEED_DEFAULT_PASSWORD` | `Cermont2026!` | Contrasena para los usuarios demo |
| `LOG_LEVEL` | `info` | Nivel de logging (`debug`, `info`, `warn`, `error`) |
| `NGINX_PORT` | `0.0.0.0:80` | Puerto publico de nginx. Windows local: `8081` |
| `MAX_FILE_SIZE` | `52428800` | Tamano maximo de archivos en bytes (50 MB) |

---

## Generacion de secretos seguros

```bash
# JWT_SECRET (minimo 32 caracteres)
openssl rand -hex 32

# REFRESH_TOKEN_SECRET (diferente al anterior)
openssl rand -hex 32

# MONGO_ROOT_PASSWORD
openssl rand -hex 16
```

---

## Conexion MongoDB

La URI de conexion se construye automaticamente en `docker-compose.yml`:

```
mongodb://${MONGO_ROOT_USER}:${MONGO_ROOT_PASSWORD}@mongodb:27017/cermont?authSource=admin
```

No definir `MONGODB_URI` manualmente en `.env` — el docker-compose la ensambla desde las variables individuales.

---

## Configuracion para VPS (produccion)

```env
# .env en produccion
MONGO_ROOT_USER=cermont_prod
MONGO_ROOT_PASSWORD=<password-generada-con-openssl>

JWT_SECRET=<secreto-generado-con-openssl-min-64-chars>
REFRESH_TOKEN_SECRET=<secreto-diferente-generado-con-openssl>

# IP o dominio del servidor
NEXT_PUBLIC_API_URL=http://203.0.113.10/api
NEXT_PUBLIC_APP_URL=http://203.0.113.10

# Desactivar seed en produccion (ya hay usuarios reales)
SEED_ON_START=false
```

---

## Notas de seguridad

- Nunca commitear el archivo `.env` (ya esta en `.gitignore`)
- El archivo `.env.example` contiene solo valores demo — no son secretos reales
- Para entornos multi-servidor, usar un gestor de secretos (HashiCorp Vault, AWS SSM)
- Rotar `JWT_SECRET` invalida todas las sesiones activas (usuarios deben re-autenticarse)
