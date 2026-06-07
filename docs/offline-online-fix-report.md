# Reporte de corrección offline/online

Este reporte registra el alcance de la corrección del módulo offline/online del
aplicativo CERMONT. La validación productiva se ejecutó sobre
`http://localhost:3010` con un contexto limpio de Playwright después de
`npm run build`.

| Prueba | Resultado | Evidencia | Estado |
|---|---:|---|---|
| Service Worker registrado | Verificado | `registrations: 1`, scope `http://localhost:3010/` | Aprobado |
| Service Worker activo | Verificado | `active: true`, `controller: true` después de recarga | Aprobado |
| Cache Storage con chunks | Verificado | `cermont-static-v5` y `serwist-precache-v2-*` con `/_next/static/chunks` y CSS | Aprobado |
| Fallback offline | Verificado | Ruta `/~offline` responde `200` y recarga offline muestra fallback con estilos | Aprobado |
| API backend no disponible | Verificado | `/api/backend/dashboard/summary` devuelve `503 BACKEND_UNAVAILABLE` | Aprobado |
| React Query sin retry excesivo | Verificado por pruebas | `apiClient` y QueryClient cortan errores offline/backend caído | Aprobado |
| IndexedDB | Verificado | `CermontOfflineDB` visible en navegador | Aprobado |
| Cola offline | Implementado previamente | `offlineOutbox`, `offlineFiles`, `offlineSyncLogs` en Dexie | Pendiente por anexar evidencia con caso de negocio |
| Banner offline | Implementado en layout | `OfflineBanner` integrado a layout principal | Pendiente por captura manual en ruta autenticada |
| Sync al reconectar | Parcial | Barrido por evento `sync-queue:changed` | Pendiente por verificar con backend real y usuario autenticado |
| Evidencia offline con blob | Verificado por pruebas | `useOfflineEvidence` guarda el archivo en `offlineFiles` y la cola conserva solo `fileLocalId` | Aprobado en unit/integration |
| Archivos privados | Verificado por pruebas | Nuevos `FileAssetRef.url` apuntan a `/api/files/:id/content`; `/uploads` no se expone en test/producción | Aprobado |

## Evidencia automatizada

- Service Worker: registrado, activo y controlando la página después de recarga.
- Cache Storage: contiene `/_next/static/chunks`, `/_next/static/css`,
  `/manifest.json`, `/~offline` y `/offline.html`.
- Fallback: al recargar `/login` sin red se muestra el mensaje de modo offline,
  con scripts de Next presentes y sin pantalla en blanco.
- Proxy: con backend no disponible, `/api/backend/dashboard/summary` responde
  `503` con código `BACKEND_UNAVAILABLE`, no `500` genérico.
- IndexedDB: se detecta la base `CermontOfflineDB`.

## Cambios aplicados

- Se reemplazó el rewrite directo `/api/backend/:path*` por un route handler de
  proxy que controla la indisponibilidad del backend.
- Se creó la ruta pública `/~offline` como fallback de navegación.
- Se reforzó `src/app/sw.ts` para cachear assets de `/_next/static/*`, manifest
  y fallbacks offline sin interceptar `/api/*`.
- Se mantuvo `offline.html` como respaldo sin JavaScript.
- Se conectó TanStack Query con detección de errores offline/backend caído para
  evitar retries innecesarios.
- Se integró el banner offline en el layout principal.
- Se eliminó la importación dinámica de `@sentry/nextjs` para no generar warning
  de build cuando la dependencia no está instalada.
- Se migró la evidencia offline nueva para persistir binarios como `Blob` en
  `offlineFiles`, manteniendo `fileBase64` solo como compatibilidad legacy.
- Se agregó entrega autenticada de archivos mediante `/api/files/:id/content` y
  se dejó `/uploads` fuera de test/producción.
- Se reforzó `POST /api/evidences` V1 para rechazar bytes que no correspondan a
  imagen antes de ClamAV y `sharp`.

## Alcance real

El modo offline corregido cubre App Shell, navegación con fallback, datos
previamente cacheados por React Query, borradores y colas locales ya soportadas
por Dexie. No confirma SES, facturas, pagos ni operaciones externas sin respuesta
del backend.
