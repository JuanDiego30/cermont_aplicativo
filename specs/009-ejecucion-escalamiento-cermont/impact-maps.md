# Spec 009 — Impact maps

## P0 Stabilization

| Campo | Impacto |
|---|---|
| Cambio | Corregir payload JSON, PWA assets, metadata, notificaciones, accesibilidad y React Doctor |
| Schemas afectados | `VehicleDocumentAlertSchema` agrega días restantes calculados por backend |
| Backend afectado | límite JSON y cálculo de alertas vehiculares |
| Frontend afectado | header, alertas de flota, páginas legales, diálogos, progreso de orden, PWA metadata |
| Rutas afectadas | `/api/notifications`, `/robots.txt`, assets de `/icons/*` |
| RBAC afectado | Sin cambios; notificaciones conservan `INTERNAL_ROLES` |
| PWA/offline afectado | Manifest e iconos; sin cambios en outbox o service worker |
| Tests afectados | hardening HTTP, fleet service, header, documentos, PWA, semántica React |
| Rollback | Revertir el lote P0; no hay migración de datos |

## P0 FileAsset SSOT

| Campo | Impacto |
|---|---|
| Cambio | Retirar API/media duplicada, alinear owners con adapters y cerrar acceso cross-entity |
| Schemas afectados | `FileAssetEntityType` y contratos de upload/list según registry real |
| Backend afectado | `files.service`, `files.controller`, `files.routes`, adapters de padres y API media legacy |
| Frontend afectado | consumidores FileAsset; frontend media inalcanzable retirado |
| Rutas afectadas | canónica `/api/files`; `/api/media` debe dejar de ser una API paralela |
| RBAC afectado | `INTERNAL_ROLES` más autorización de dominio/owner en servicio |
| PWA/offline afectado | `/api/files/offline-upload` mantiene idempotencia y blobs en IndexedDB |
| Tests afectados | esquema FileAsset, upload, MIME, RBAC, descarga auditada, owner/cross-entity, SSOT |
| Rollback | Restaurar adapter legacy mientras `/api/files` permanece intacto; no borrar binarios ni metadata |

