# ADR-002: Offline-first con IndexedDB y Serwist

Estado: Aceptado
Fecha: 2026-06-06

## Contexto

Las cuadrillas operan con conectividad variable. Cachear APIs autenticadas o mantener varias colas IndexedDB causa 401, datos obsoletos y `NotFoundError`.

## Decisión

Serwist cachea shell/assets y navegación calentada. Auth, API y uploads son `NetworkOnly`. `CermontOfflineDB` es la única persistencia dinámica; `offlineOutbox` es la única cola. Tokens nunca se guardan en IndexedDB. Migraciones son crecientes y no destructivas.

## Alternativas consideradas

- Service Worker artesanal: descartado por mantenimiento.
- Cachear respuestas API: descartado por seguridad/consistencia.
- `localStorage` como cola principal: descartado por capacidad y transacciones.
- Borrar DB al fallar: descartado por pérdida de datos.

## Consecuencias

Se requiere warmup explícito, idempotencia, versionado, reintentos persistentes y UI de conflictos. `nextRetryAt` debe sobrevivir recargas y `Retry-After` debe respetarse. Una recuperación destructiva exige backup y consentimiento.

## Validación

Pruebas de SW, schema Dexie, upgrade, login con/sin SW, Cache Storage, offline y reconexión.
