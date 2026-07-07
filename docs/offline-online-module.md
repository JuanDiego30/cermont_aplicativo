# Módulo offline/online

## 1. Componentes implementados

| Componente | Archivo principal | Función |
|---|---|---|
| Service Worker | `frontend/src/app/sw.ts` | App shell, fallback offline y caché segura de recursos no privados |
| Configuración Serwist | `frontend/next.config.ts` y `frontend/src/app/serwist/[path]/route.ts` | Generación de `/serwist/sw.js` desde `frontend/src/app/sw.ts` |
| Base local Dexie | `frontend/src/lib/offline/offline-db.ts` | Tablas locales de borradores, outbox, archivos, logs y caché de consultas |
| Motor de sincronización | `frontend/src/lib/offline/sync-engine.ts` | Lotes tipados, ACK por ítem, reintentos, conflictos y actualización de estado visual |
| Cola de compatibilidad | `frontend/src/lib/offline/sync-queue.ts` | Mantiene la API existente y persiste en la tabla canónica `offlineOutbox` |
| React Query persistence | `frontend/src/lib/pwa/query-persist.ts` | Persistencia de caché de servidor en Dexie |
| Store visual | `frontend/src/store/offline.store.ts` | Estado online/offline, pendientes, errores y conflictos |
| Backend sync | `backend/src/modules/sync/*` | `POST /api/sync/offline` y `GET /api/sync/offline/:batchId` |
| Upload offline | `backend/src/modules/files/*` | `POST /api/files/offline-upload` con idempotencia |

## 2. Separación de responsabilidades

React Query conserva caché de consultas del servidor. Dexie conserva datos locales pendientes, archivos y logs de sincronización. Zustand conserva únicamente estado visual. El Service Worker no cachea datos privados ni reemplaza la lógica de negocio del backend.

`CermontSyncQueueDB` y `localStorage` se consideran orígenes legacy de migración. La fuente de verdad actual es `CermontOfflineDB.offlineOutbox`. Un error de apertura se reporta como recuperación requerida y nunca elimina automáticamente borradores, archivos o mutaciones pendientes.

## 3. Seguridad y privacidad

- No se guardan JWT ni secretos en IndexedDB.
- El access token permanece en memoria mediante el store de autenticación existente.
- El service worker no maneja `/api/*`, rutas de autenticación, WebSocket/HMR, métodos no GET ni respuestas con `Set-Cookie`.
- La sincronización requiere sesión activa.
- La idempotencia usa `idempotencyKey` por operación.

## 4. Flujo de sincronización

1. El usuario crea o modifica información durante una pérdida de conexión.
2. La operación queda en Dexie con estado `pending_sync`.
3. Al volver la red, el motor revisa sesión y conexión.
4. El cliente envía lote a `/api/sync/offline`.
5. El backend valida JWT, RBAC, Zod e idempotencia.
6. El backend responde por ítem: `synced`, `failed` o `conflict`.
7. Dexie actualiza cada ítem según el ACK recibido.
8. La interfaz muestra pendientes, errores o conflictos.

Las mutaciones directas que fallan por una interrupción transitoria se reprograman con backoff. Si el servidor responde `429`, se respeta `Retry-After`. La cola vuelve a ejecutarse cuando vence `nextRetryAt`, incluso si no ocurre un segundo evento de conectividad.

La conectividad y la recuperación de sesión no comparten el presupuesto global de 100 solicitudes por minuto. `/api/health` y `/api/auth/*` quedan fuera de ese bucket; login y recuperación de contraseña conservan un limitador dedicado. Las rutas de ciclo de sesión (`refresh`, `me`, `logout`) no consumen el presupuesto de intentos de login.

## 5. Estado actual

El módulo queda en estado parcial implementado. La base técnica existe, pero cada formulario debe conectarse por vertical slice antes de declararse completamente offline. Los procesos externos como Ariba, aprobación de facturas y pago no son offline reales; solo pueden registrar soportes internos pendientes.
