# Variables de Entorno

**Estado:** CANONICO
**Actualizado:** 2026-06-14

Usar `backend/.env.example` como plantilla. El archivo `.env` real debe tener
permisos restringidos y nunca debe versionarse.

## Requeridas por el backend

| Variable | Regla |
|---|---|
| `MONGODB_URI` | URI de conexion a MongoDB. Ej: `mongodb://127.0.0.1:27017/cermont` |
| `JWT_SECRET` | Secreto aleatorio de al menos 32 caracteres |
| `REFRESH_TOKEN_SECRET` | Secreto diferente de `JWT_SECRET`, minimo 32 caracteres |
| `FRONTEND_URL` | Origen HTTPS exacto permitido por CORS |

## Build del frontend

| Variable | Uso |
|---|---|
| `BACKEND_URL` | URL usada por los rewrites de Next.js; en produccion VPS usar `http://127.0.0.1:4000` |
| `NEXT_PUBLIC_APP_URL` | URL publica para metadata y sitemap |
| `NEXT_PUBLIC_API_URL` | URL publica documentada del API |
| `NEXT_PUBLIC_APP_NAME` | Nombre visible del aplicativo |

Las solicitudes de negocio del navegador usan el proxy relativo
`/api/backend/*`; `BACKEND_URL=http://127.0.0.1:4000` se define en `.env.local`.

El proxy TLS del host debe enviar `X-Forwarded-Proto: https`. El backend usa
ese encabezado para marcar el refresh token como `HttpOnly; Secure`; en HTTP
local omite `Secure` para que el navegador pueda enviar la cookie.

## Runtime

| Variable | Default | Uso |
|---|---|---|
| `NODE_ENV` | `production` | Modo de ejecucion |
| `PORT` | `4000` backend, `3000` frontend | Puertos de los procesos PM2 |
| `JWT_EXPIRES_IN` | `15m` | Vida del access token |
| `REFRESH_TOKEN_EXPIRES_IN` | `7d` | Vida del refresh token |
| `BCRYPT_ROUNDS` | `12` | Costo de hash |
| `LOG_LEVEL` | `info` | Nivel de logs |
| `UPLOAD_DIR` | `./uploads` | Directorio de archivos subidos |
| `MAX_FILE_SIZE` | `52428800` | Limite de carga en bytes |

## Seed

`SEED_DEFAULT_PASSWORD` no forma parte del runtime normal. Solo se inyecta al
ejecutar manualmente el seed sobre una base vacia:

```bash
cd /opt/cermont/app && NODE_ENV=production SEED_DEFAULT_PASSWORD=<password> npx tsx backend/src/scripts/seed.ts
```

La variable debe tener al menos 12 caracteres. No existe seed automatico ni
contraseña predeterminada. La cuenta `gerencia@cermont.co` usa la contraseña
fija `Cermont2026!` (definida en el script de seed).

## Generacion

```bash
openssl rand -hex 32
openssl rand -hex 64
```

No reutilizar secretos entre ambientes. Rotar `JWT_SECRET` y
`REFRESH_TOKEN_SECRET` invalida sesiones activas.
