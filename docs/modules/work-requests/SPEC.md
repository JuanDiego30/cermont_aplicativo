# Módulo: Solicitudes de Trabajo (Work Requests)

## Problema empresarial

Clientes y personal interno necesitan solicitar servicios técnicos con información estructurada (tipo de servicio, sitio, urgencia, evidencias iniciales) que permita clasificar, priorizar y avanzar al flujo de 14 pasos. Cada work request crea un ServiceCase vinculado.

## Roles

- **Create**: Todos los roles autenticados (`ALL_AUTHENTICATED_ROLES`)
- **List/View**: Roles internos (`INTERNAL_ROLES`) — clientes ven solo propios
- **Update**: `FIELD_MANAGEMENT_ROLES` (gerente, residente, hes) + `cliente` (solo propios)
- **Update status / Qualify**: `FIELD_MANAGEMENT_ROLES`
- **Delete (soft)**: Solo `gerente`
- **Create site visit**: `REPORTING_ACCESS_ROLES` (gerente, residente, hes, supervisor)

## Casos de uso

1. Crear work request con datos del cliente, sitio, descripción, urgencia, canal, evidencias adjuntas
2. Sistema auto-genera código tracking (`WR-{YEAR}-{SEQUENCE}`) y ServiceCase vinculado (`SC-{YEAR}-{SEQUENCE}`)
3. SLA tracking se inicia para el ServiceCase con prioridad según urgencia
4. Listar/filtrar work requests con paginación y RBAC (clientes ven solo propios)
5. Ver detalle de work request por ID
6. Actualizar estado (máquina de estados validada)
7. Calificar (qualify) work request — avanza ServiceCase al siguiente paso
8. Agendar visita técnica vinculada
9. Soft-delete (status → `cancelled`) solo por gerente
10. Clientes actualizan sus propios work requests (campos limitados)

## Entidades

- **WorkRequest** (Mongoose `backend/src/models/WorkRequest.ts`): `code` (unique), `status`, `urgency`, `requesterId/Name/Email/Phone`, `clientId/Name`, `serviceSite`, `serviceType`, `sourceChannel`, `shortDescription`, `description`, `requiresSiteVisit`, `visit` (SiteVisitRecord embebido), `assignedTo`, `linkedProposalId/Code`, `linkedOrderId/Code`, `resolution`, `initialEvidences[]`, `tags[]`, `classifications[]`, `customFields`, `archived`, `createdBy`, `updatedBy`
- **ServiceCase** (Mongoose): Creado junto con WorkRequest, vinculado via `artifacts.workRequest.id`
- **Counter** (Mongoose): Secuencia auto-increment para códigos `WR-{YEAR}-{SEQ}` y `SC-{YEAR}-{SEQ}`
- **SiteVisit** (embebido en WorkRequest): `scheduledAt`, `completedAt`, `technicianId`, `technicianName`, `notes`, `evidences[]`, `measurements`, `technicalFindings`, `scopeClarifications`, `estimatedDuration`, `riskNotes`
- **SLATracking**: Creado via `SLAService` por ServiceCase al crear work request

## Estados

```
draft ──→ submitted ──→ qualified ──→ proposal_pending
                  │                       ↑
                  └──→ visit_required ─────┘
all states ──→ cancelled (terminal)
```

Transiciones definidas en `WORK_REQUEST_STATUS_TRANSITIONS` en `work-requests.service.ts`:
| Desde | Hasta | Quién |
|-------|-------|-------|
| `draft` | `submitted` | Sistema (auto al crear con datos) |
| `draft` | `cancelled` | `gerente` |
| `submitted` | `qualified` | `FIELD_MANAGEMENT_ROLES` |
| `submitted` | `visit_required` | `REPORTING_ACCESS_ROLES` (al crear visita) |
| `submitted` | `cancelled` | `gerente` |
| `qualified` | `proposal_pending` | Futuro |
| `qualified` | `cancelled` | `gerente` |
| `visit_required` | `qualified` | `FIELD_MANAGEMENT_ROLES` |
| `visit_required` | `cancelled` | `gerente` |

## Precondiciones

- Usuario autenticado (cualquier rol para crear, roles específicos para transiciones)
- Para calificar: work request debe tener `clientName`, `serviceSite`, `description` poblados
- Para visita: `ScheduleVisitSchema` con `scheduledAt`, `technicianId`, `technicianName`
- Secuencia de contador atómico (`Counter.inc`) para generación de códigos

## Blockers

- `WORK_REQUEST_NOT_FOUND` (404) — ID inválido
- `FORBIDDEN` (403) — Cliente accediendo request de otro cliente
- `FORBIDDEN` (403) — Rol sin permiso para transición
- `INVALID_STATUS_TRANSITION` (400) — Transición no permitida
- `MISSING_REQUIRED_FIELDS` (400) — Calificar sin datos requeridos
- `503 ServiceUnavailable` — Error transitorio de base de datos

## Endpoints

| Método | Ruta | Auth | Descripción |
|--------|------|------|-------------|
| GET | `/api/work-requests` | `INTERNAL_ROLES` | Lista paginada con filtros |
| GET | `/api/work-requests/:id` | `INTERNAL_ROLES` | Detalle por ID |
| POST | `/api/work-requests` | `ALL_AUTHENTICATED_ROLES` | Crear (genera código + ServiceCase + SLA) |
| PATCH | `/api/work-requests/:id` | `FIELD_MANAGEMENT_ROLES` + `cliente` | Actualizar campos |
| PATCH | `/api/work-requests/:id/status` | `FIELD_MANAGEMENT_ROLES` | Transición de estado |
| POST | `/api/work-requests/:id/qualify` | `FIELD_MANAGEMENT_ROLES` | Calificar — avanza ServiceCase |
| DELETE | `/api/work-requests/:id` | `gerente` | Soft delete (status → cancelled) |
| POST | `/api/work-requests/:id/visits` | `REPORTING_ACCESS_ROLES` | Agendar visita técnica |
| GET | `/api/work-requests/:id/visits` | `INTERNAL_ROLES` | Listar visitas del work request |

## Pantallas

- **`/work-requests`** — Tabla con filtros (status, urgencia, búsqueda, fechas), paginación, botón crear
- **`/work-requests/new`** — Formulario: datos cliente, servicio, sitio, evidencias, urgencia, toggle requiere visita
- **`/work-requests/[id]`** — Vista detalle con estado, timeline, ServiceCase vinculado, visitas

## Estados UI

- **loading** — Skeleton para lista y detalle
- **error** — Error card con retry (errores de red o DB transitorios)
- **empty** — Ilustración + "Crear primera solicitud" CTA
- **offline** — Snapshot local IndexedDB con banner "offline snapshot from {time}"
- **forbidden** — Card "Sin permiso" para rol no autorizado
- **success** — Toast en create/update; refetch lista + ServiceCase queries

## Eventos de auditoría

- `WORK_REQUEST_CREATED` — En timeline del ServiceCase
- `WORK_REQUEST_CANCELLED` — Soft delete
- `SITE_VISIT_SCHEDULED` — En timeline del ServiceCase
- Timeline del ServiceCase registra: `work_request_created`, `work_request_qualified`, `site_visit_scheduled`

## Casos negativos

- Crear sin campos requeridos → 400 (Zod middleware)
- Cliente ve request de otro → `403 FORBIDDEN`
- Transición inválida → `400 INVALID_STATUS_TRANSITION`
- Calificar sin `clientName`/`serviceSite`/`description` → `400 MISSING_REQUIRED_FIELDS`
- Non-gerente elimina → `403 FORBIDDEN`
- Non-field-management cambia estado → `403 FORBIDDEN`
- Work request no encontrado → `404 WORK_REQUEST_NOT_FOUND`
- Error DB transitorio en list → `503 ServiceUnavailable`

## Pruebas E2E

- CRUD completo: crear, listar, ver detalle, actualizar, eliminar
- Transiciones de estado válidas e inválidas
- RBAC: cliente ve solo sus propios work requests
- Calificación avanza ServiceCase al paso correcto
- Soft delete preserva registro (status = `cancelled`)
- Visita técnica cambia estado a `visit_required`
