# Módulo: Ejecución en Campo

## Problema empresarial

Técnicos en campo necesitan iniciar, pausar, reanudar y finalizar actividades registrando materiales, herramientas, equipos, horas laborales, incidentes, observaciones, firmas, checklists, formularios dinámicos y evidencias — con soporte offline completo y sincronización idempotente.

## Roles

- **FIELD_EXECUTION_ACCESS_ROLES** (`gerente`, `residente`, `supervisor`, `supervisor_electricista`, `operador`, `tecnico`, `tecnico_electricista`, `oficial_construccion`): Crear, iniciar, pausar, reanudar, completar; registrar materiales, herramientas, equipos, labor, incidentes, observaciones, firmas, checklists, formularios dinámicos, evidencias
- **Cancel**: Solo `MANAGEMENT_ROLES` (`gerente`, `residente`)
- **List/View**: `INTERNAL_ROLES`

## Casos de uso

1. Crear sesión de ejecución desde planning aprobado (vinculado a `Order` + `PlanningPacket` + `ServiceCase`)
2. Enviar preflight checklist obligatorio antes de iniciar (EPP, AST, PTW, herramientas, vehículo, certificaciones)
3. Iniciar ejecución con GPS check-in
4. Pausar/reanudar ejecución
5. Completar ejecución con GPS check-out
6. Cancelar ejecución (con razón obligatoria, solo management)
7. Registrar uso de materiales, herramientas, equipos
8. Registrar horas laborales por técnico
9. Reportar y resolver incidentes
10. Agregar observaciones
11. Capturar firmas digitales
12. Responder checklists y formularios dinámicos
13. Capturar evidencias (fotos, documentos, video)
14. Sincronizar comandos offline batch (`POST /:id/commands`)

## Entidades

- **ExecutionSession** (Mongoose `backend/src/models/ExecutionSession.ts`): `code` (único), `workOrderId`, `planningPacketId`, `serviceCaseId`, `status`, `assignedCrew[]`, `startedBy`, `completedBy`, `gpsPoints[]`, `checklistResponses[]`, `dynamicFormResponses[]`, `materialsUsed[]`, `toolsUsed[]`, `equipmentUsed[]`, `laborEntries[]`, `incidents[]`, `observations[]`, `signatures[]`, `evidences[]`, `documentImportIds[]`, `fileAssets[]`, `clientMutationIds[]` (idempotencia offline), `offlineSyncStatus`, `lastSyncedAt`, `preflightChecklist`, `blockers[]`, `nextActions[]`

Sub-entidades embebidas:
- **GPSPoint**: `lat`, `lng`, `accuracy`, `capturedAt`
- **ChecklistResponse**: `responseId`, `checklistId`, `itemId`, `label`, `value`, `required`, `evidenceIds[]`
- **DynamicFormResponse**: `responseId`, `templateId`, `templateResponseId`, `fieldKey`, `label`, `value`
- **MaterialUsage**: `usageId`, `materialId`, `name`, `quantityPlanned`, `quantityUsed`, `unit`, `notes`
- **ToolUsage**: `usageId`, `toolId`, `name`, `quantityUsed`, `condition`, `notes`
- **EquipmentUsage**: `usageId`, `equipmentId`, `name`, `startedAt`, `endedAt`, `hoursUsed`, `condition`
- **LaborEntry**: `laborEntryId`, `userId`, `role`, `startedAt`, `endedAt`, `durationMinutes`, `description`
- **Incident**: `incidentId`, `type`, `severity`, `description`, `actionTaken`, `evidenceIds[]`, `resolved`
- **Observation**: `observationId`, `description`
- **Signature**: `signatureId`, `signedBy`, `signedByName`, `role`, `signatureType`, `imageDocumentId`, `signatureUrl`, `confirmed`
- **PreflightChecklist**: `eppComplete`, `astSigned`, `ptwObtained`, `toolsValidated`, `vehicleDocumentsOk`, `certificationsCurrent`, `items[]`

## Estados

```
draft ──→ in_progress ←──→ paused ──→ completed
  │                                        │
  └──→ cancelled (management only) ←───────┘
```

Transiciones: `draft→in_progress` (via preflight + start), `in_progress→paused`, `paused→in_progress`, `in_progress→completed`, `→cancelled` (desde cualquier estado no-terminal, solo MANAGEMENT_ROLES)

## Precondiciones

- PlanningPacket debe estar aprobado
- No debe existir sesión activa para la misma work order (unique partial index: `{workOrderId:1}` donde `status≠cancelled`)
- Técnico debe estar en `assignedCrew`
- Preflight checklist debe completarse antes de iniciar
- Session debe estar dentro de ventana de fechas programada

## Blockers

- Planning no aprobado → no se puede crear/iniciar
- Evidencia obligatoria faltante → no se puede completar
- GPS fuera de geofence → advertencia (no bloqueante)
- Sesión expirada → inicio bloqueado
- Técnico no asignado → no se puede reanudar tras pausa
- Cola de mutaciones offline llena → advertir al usuario

## Offline

- `clientMutationIds[]` para idempotencia
- `offlineSyncStatus`: `synced` | `pending_sync` | `syncing` | `conflict`
- `POST /:id/commands` y `POST /:id/sync` aceptan batch de comandos offline
- Cada comando incluye `clientMutationId` único para deduplicación

## Endpoints

| Método | Ruta | Auth | Descripción |
|--------|------|------|-------------|
| GET | `/api/execution-sessions` | `INTERNAL_ROLES` | Listar sesiones (filtradas, paginadas) |
| POST | `/api/execution-sessions` | `FIELD_EXECUTION_ACCESS_ROLES` | Crear sesión |
| GET | `/api/execution-sessions/:id` | `INTERNAL_ROLES` | Detalle completo con sub-entities |
| POST | `/api/execution-sessions/:id/preflight` | `FIELD_EXECUTION_ACCESS_ROLES` | Enviar preflight checklist |
| POST | `/api/execution-sessions/:id/start` | `FIELD_EXECUTION_ACCESS_ROLES` | Iniciar con GPS |
| POST | `/api/execution-sessions/:id/pause` | `FIELD_EXECUTION_ACCESS_ROLES` | Pausar |
| POST | `/api/execution-sessions/:id/resume` | `FIELD_EXECUTION_ACCESS_ROLES` | Reanudar |
| POST | `/api/execution-sessions/:id/complete` | `FIELD_EXECUTION_ACCESS_ROLES` | Completar con GPS |
| POST | `/api/execution-sessions/:id/cancel` | `MANAGEMENT_ROLES` | Cancelar (solo management) |
| POST | `/api/execution-sessions/:id/evidences` | `FIELD_EXECUTION_ACCESS_ROLES` | Agregar evidencia |
| POST | `/api/execution-sessions/:id/materials` | `FIELD_EXECUTION_ACCESS_ROLES` | Registrar material |
| POST | `/api/execution-sessions/:id/tools` | `FIELD_EXECUTION_ACCESS_ROLES` | Registrar herramienta |
| POST | `/api/execution-sessions/:id/equipment` | `FIELD_EXECUTION_ACCESS_ROLES` | Registrar equipo |
| POST | `/api/execution-sessions/:id/labor` | `FIELD_EXECUTION_ACCESS_ROLES` | Registrar horas laborales |
| POST | `/api/execution-sessions/:id/incidents` | `FIELD_EXECUTION_ACCESS_ROLES` | Reportar incidente |
| POST | `/api/execution-sessions/:id/incidents/:incidentId/resolve` | `FIELD_EXECUTION_ACCESS_ROLES` | Resolver incidente |
| POST | `/api/execution-sessions/:id/observations` | `FIELD_EXECUTION_ACCESS_ROLES` | Agregar observación |
| POST | `/api/execution-sessions/:id/signatures` | `FIELD_EXECUTION_ACCESS_ROLES` | Capturar firma |
| POST | `/api/execution-sessions/:id/checklist` | `FIELD_EXECUTION_ACCESS_ROLES` | Responder checklist |
| POST | `/api/execution-sessions/:id/dynamic-form` | `FIELD_EXECUTION_ACCESS_ROLES` | Responder formulario dinámico |
| POST | `/api/execution-sessions/:id/commands` | `FIELD_EXECUTION_ACCESS_ROLES` | Sincronizar batch offline |
| POST | `/api/execution-sessions/:id/sync` | `FIELD_EXECUTION_ACCESS_ROLES` | Sincronizar batch offline |

## Pantallas

- **`/execution`** — Lista de sesiones con filtros, búsqueda, acciones bulk
- **`/execution/[id]`** — Detalle con timeline, galería evidencias, tabs labor/materiales/equipos
- **`/execution/new`** — Crear sesión desde planning aprobado
- **`/orders/[id]/execution`** — Vista mobile-optimized: paso a paso, botones de captura

## Estados UI

- **loading** — Skeleton cards para lista y detalle
- **empty** — Ilustración + "No hay sesiones de ejecución" + botón "Iniciar nueva"
- **error** — Error banner + retry
- **offline** — Banner amarillo "Estás offline", deshabilita acciones dependientes de sync
- **sync pending** — Badge en card de sesión, cuenta de mutaciones pendientes, botón "Sync now"
- **blocked** — Tooltip en acción deshabilitada explica precondición no cumplida
- **success** — Toast + redirect

## Eventos de auditoría

- `execution.session.created`, `.started`, `.paused`, `.resumed`, `.completed`, `.cancelled`
- `execution.step.submitted` — payload de paso, conteo de evidencias
- `execution.sync.completed` — mutaciones sincronizadas

## Casos negativos

- Iniciar sin planning aprobado → 403
- Completar sin evidencias obligatorias → 422
- Dos técnicos inician misma sesión → 409 Conflict
- Sesión expirada → 403
- Cancelar sin razón → 422
- Network failure durante sync → rollback parcial seguro
- GPS no disponible al check-in → permitir, marcar para revisión

## Pruebas E2E

- Full happy path: crear → preflight → start → capturar pasos → complete
- Start con planning no aprobado → blocked
- Pausa → resume → complete cycle
- Cancel en progreso con razón
- Submit step offline → sync cuando online
- Registrar labor, materiales, equipos por paso
- GPS check-in/check-out
- Sesión duplicada prevenida (partial unique index)
