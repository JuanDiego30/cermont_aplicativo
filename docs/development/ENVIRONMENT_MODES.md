# Modos de Entorno — Cermont S.A.S.

## Tres modos de ejecución

El sistema soporta tres modos de ejecución con configuraciones separadas:

| Modo | Comando | BACKEND_URL | Puerto frontend | Puerto backend |
|------|---------|------------|----------------|----------------|
| **Desarrollo local** | `npm run dev` | `http://127.0.0.1:4000` | 3000 | 4000 |
| **Producción local** | `npm run build && npm run start` | `http://127.0.0.1:4000` o fallback `localhost:4000` | 3000 | 4000 |
| **Docker / VPS** | `docker compose up -d --build` | `http://backend:4000` (inyectado) | 3000 (interno) o 80 (nginx) | 4000 (interno) |

## Cómo se resuelve `BACKEND_URL`

### Flujo de resolución

```
1. ¿Existe process.env.BACKEND_URL?
   ├── Sí → Usar ese valor
   └── No → Usar fallback: http://localhost:4000
```

Esto aplica tanto en `next.config.ts` (rewrites de `/uploads/*`) como en el proxy
`/api/backend/*` (route handler de Next.js).

### Desarrollo local

`frontend/.env.local` define `BACKEND_URL=http://127.0.0.1:4000`.
Next.js carga este archivo automáticamente durante `npm run dev` y `npm run start`.

### Docker Compose

`docker-compose.yml` inyecta `BACKEND_URL=http://backend:4000` en el servicio `frontend`.
El hostname `backend` resuelve al contenedor backend dentro de la red Docker `cermont_net`.

### ¿Por qué no usar `NODE_ENV` para decidir?

El código anterior usaba:

```ts
isProduction() ? "http://backend:4000" : "http://localhost:4000"
```

Esto es incorrecto porque `npm run start` ejecuta Next.js en modo producción
(`NODE_ENV=production`) pero fuera de Docker. El hostname `backend` no existe
fuera de la red Docker.

**Regla:** `NODE_ENV` indica el modo de compilación/optimización, NO el entorno
de red. `BACKEND_URL` es la única variable que debe definir la ubicación del backend.

## Archivos de entorno

| Archivo | Cargado por | Contexto |
|---------|------------|----------|
| `frontend/.env.local` | Next.js automático | Desarrollo local frontend |
| `frontend/.env.example` | — | Template para local |
| `backend/.env` | Backend con dotenv | Desarrollo local backend |
| `backend/.env.example` | — | Template para backend |
| `.env` | Docker Compose automático | Variables para Docker |
| `.env.example` | — | Template para Docker (no para local) |
| `.env.docker.example` | — | Template completo para Docker |

## Reglas de configuración

1. **Nunca** hardcodear `http://backend:4000` en código fuente.
2. **Siempre** leer `BACKEND_URL` de variables de entorno.
3. Docker Compose inyecta `BACKEND_URL` explícitamente.
4. El fallback por defecto es `http://localhost:4000`.
5. `npm run start` local funciona sin `.env.local` (usa fallback).
6. `npm run verify` incluye `quality:env` que valida estas reglas.
