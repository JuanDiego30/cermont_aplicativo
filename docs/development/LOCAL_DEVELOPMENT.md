# Desarrollo Local — Cermont S.A.S.

## Requisitos

- Node.js >= 22.20.0
- npm >= 10.9.4
- MongoDB (local o Docker)
- Git

## Stack

| Capa | Tecnología |
|------|-----------|
| Frontend | Next.js 16 (App Router) |
| Backend | Express 5.2.1 |
| Base de datos | MongoDB + Mongoose |
| Paquetes compartidos | Zod schemas, RBAC, config |

## Inicio rápido (recomendado)

```bash
# 1. Clonar e instalar
git clone <repo>
cd cermont_aplicativo
npm install

# 2. Iniciar MongoDB (usando Docker — recomendado)
docker compose up -d mongodb

# 3. Iniciar desarrollo
npm run dev
```

Esto inicia backend (`localhost:4000`) y frontend (`localhost:3000`) simultáneamente con hot reload.

## Sin Docker (MongoDB local)

Si tienes MongoDB instalado localmente:

```bash
# Asegúrate de que MongoDB esté corriendo
mongod --dbpath /data/db

# Inicia el aplicativo
npm run dev
```

## Variables de entorno

El proyecto tiene archivos `.env` separados por contexto:

| Archivo | Propósito |
|---------|-----------|
| `frontend/.env.local` | Frontend en desarrollo local |
| `backend/.env` | Backend en desarrollo local |
| `.env.example` | Template para desarrollo local (no Docker) |
| `.env.docker.example` | Template para Docker Compose |

### Frontend (`.env.local`)

```
NEXT_PUBLIC_APP_URL=http://localhost:3000
NEXT_PUBLIC_API_URL=http://127.0.0.1:4000
BACKEND_URL=http://127.0.0.1:4000
```

### Backend (`.env`)

```
NODE_ENV=development
PORT=4000
MONGODB_URI=mongodb://127.0.0.1:27017/cermont
JWT_SECRET=...
REFRESH_TOKEN_SECRET=...
FRONTEND_URL=http://localhost:3000
```

## Scripts de desarrollo

```bash
npm run dev              # Backend + Frontend (hot reload)
npm run dev -w backend   # Solo backend
npm run dev -w frontend  # Solo frontend
npm run dev:db           # MongoDB en Docker (docker compose up -d mongodb)
npm run dev:db:stop      # Detener MongoDB en Docker
npm run build            # Build todos los workspaces
npm run test             # Tests todos los workspaces
npm run verify           # Quality gates completos
```

## Producción local (sin Docker)

```bash
npm run build
npm run start
```

El proxy frontend (`/api/backend/*`) usa `BACKEND_URL=http://127.0.0.1:4000` de `frontend/.env.local`.
Si no existe, usa `http://localhost:4000` como fallback.

## Docker (solo para deploy)

Ver: `docs/deploy/DOCKER_COMPOSE.md`

Docker NO es obligatorio para desarrollo. Se usa para:
1. MongoDB durante desarrollo (`docker compose up -d mongodb`)
2. Build y deploy en VPS (`docker compose up -d --build`)

## Estructura del monorepo

```
cermont_aplicativo/
├── backend/          → Express + Mongoose API
│   ├── src/
│   └── .env
├── frontend/         → Next.js 16 App Router
│   ├── src/
│   └── .env.local
├── packages/
│   ├── shared-types/ → Zod schemas, tipos
│   ├── domain/       → RBAC, roles
│   └── config/       → Validación de entorno
├── docker-compose.yml
└── .env.example
```

## Troubleshooting

### Error: `http://backend:4000` no se resuelve

Estás usando configuración de Docker fuera de Docker. Asegúrate de que:

```bash
# frontend/.env.local tenga:
BACKEND_URL=http://127.0.0.1:4000
```

### Error: MongoDB connection refused

Asegúrate de que MongoDB esté corriendo:

```bash
# Con Docker:
docker compose up -d mongodb

# Sin Docker:
mongosh --eval "db.adminCommand('ping')"
```

### Error: Port 4000 already in use

```bash
# Encuentra el proceso:
netstat -ano | findstr :4000
# Detén el proceso o cambia el puerto en backend/.env
```
