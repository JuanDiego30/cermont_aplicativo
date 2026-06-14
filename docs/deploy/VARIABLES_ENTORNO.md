# Variables de Entorno

**Estado:** CANONICO
**Actualizado:** 2026-06-13

Usar `.env.docker.example` como plantilla para Docker Compose. El archivo
`.env` real debe tener permisos restringidos y nunca debe versionarse.

## Requeridas por Compose

| Variable | Regla |
|---|---|
| `MONGO_ROOT_USER` | Usuario interno, sin valor publico predeterminado |
| `MONGO_ROOT_PASSWORD` | Secreto aleatorio de al menos 16 caracteres |
| `JWT_SECRET` | Secreto aleatorio de al menos 32 caracteres |
| `REFRESH_TOKEN_SECRET` | Secreto diferente de `JWT_SECRET`, minimo 32 caracteres |
| `FRONTEND_URL` | Origen HTTPS exacto permitido por CORS |

Compose falla durante `docker compose config` si falta uno de estos valores.

## Build del frontend

| Variable | Uso |
|---|---|
| `NEXT_PUBLIC_APP_URL` | URL publica para metadata y sitemap |
| `NEXT_PUBLIC_API_URL` | URL publica documentada del API |
| `NEXT_PUBLIC_APP_NAME` | Nombre visible del aplicativo |

Next.js incorpora `NEXT_PUBLIC_*` durante el build. Cambiar estos valores exige
reconstruir la imagen frontend.

Las solicitudes de negocio del navegador usan el proxy relativo
`/api/backend/*`; `BACKEND_URL=http://backend:4000` se inyecta internamente y
no se expone al cliente.

## Runtime

| Variable | Default | Uso |
|---|---|---|
| `NODE_ENV` | `production` en contenedores | Modo de ejecucion |
| `PORT` | `4000` backend, `3000` frontend | Puertos internos |
| `JWT_EXPIRES_IN` | `15m` | Vida del access token |
| `REFRESH_TOKEN_EXPIRES_IN` | `7d` | Vida del refresh token |
| `BCRYPT_ROUNDS` | `12` | Costo de hash |
| `LOG_LEVEL` | `info` | Nivel de logs |
| `UPLOAD_DIR` | `/app/uploads` | Volumen persistente |
| `MAX_FILE_SIZE` | `52428800` | Limite de carga en bytes |
| `CLAMAV_ENABLED` | `false` | Escaneo antimalware |
| `NGINX_PORT` | `0.0.0.0:80` | Binding del nginx del stack |

En produccion con TLS en el host, usar:

```env
NGINX_PORT=127.0.0.1:8081
```

## Seed

`SEED_DEFAULT_PASSWORD` no forma parte del runtime normal. Solo se inyecta al
ejecutar manualmente el seed sobre una base vacia:

```bash
docker compose exec -e SEED_DEFAULT_PASSWORD backend \
  node backend/dist/scripts/seed.js
```

La variable debe tener al menos 16 caracteres. No existe seed automatico ni
contraseña predeterminada.

## Generacion

```bash
openssl rand -hex 32
openssl rand -hex 64
```

No reutilizar secretos entre ambientes. Rotar `JWT_SECRET` y
`REFRESH_TOKEN_SECRET` invalida sesiones activas.

## Validacion

```bash
docker compose config --quiet
docker compose --env-file .env.docker.example config --quiet
```

La segunda orden valida la estructura con valores de ejemplo; no convierte esos
valores en credenciales aptas para produccion.
