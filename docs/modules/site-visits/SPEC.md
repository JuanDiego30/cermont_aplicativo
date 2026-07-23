# Module: Site Visits

## Business Problem
Digitalizar la visita técnica como levantamiento de información en campo (mediciones, hallazgos, fotos, riesgos) que alimenta la propuesta técnica-económica y la planeación. Paso 2 del flujo de 14 pasos.

## Roles
| Role Group | Access |
|------------|--------|
| `SITE_VISIT_MANAGEMENT_ROLES` | gerente, residente, supervisor, supervisor_electricista — CRUD |
| `SITE_VISIT_EXECUTION_ROLES` | gerente, residente, supervisor, supervisor_electricista, tecnico, tecnico_electricista — start/complete |
| `SITE_VISIT_CANCEL_ROLES` | gerente, residente — cancel |
| `INTERNAL_ROLES` | All non-cliente — list/detail read |

## Use Cases
1. List site visits — paginated, filterable by workRequestId, clientId, status
2. View site visit — detail by ID
3. Create site visit — schedule linked to WorkRequest + ServiceCase + Client
4. Update site visit — reschedule before execution
5. Start visit — transition scheduled → in_progress (idempotent via clientMutationId)
6. Complete visit — submit measurements, findings, photos, risks, recommendations
7. Cancel visit — provide reason from scheduled or in_progress

## Entities
- **SiteVisit** — code `SV-{year}-{sequence}`, references WorkRequest, ServiceCase, Client, User (responsible)
- **SiteVisitMeasurement** — { label, value, unit? }
- **SiteVisitFinding** — { description, severity (low/medium/high/critical), category (safety/access/measurement/resource/documentation/other) }
- **SiteVisitPhoto** — { url, caption?, takenAt? }
- **SiteVisitCommandHistory** — { clientMutationId, command, recordedAt } for offline idempotency

## States
`scheduled` → `in_progress` → `completed` | `cancelled`

## Transitions
| From | To | Action | Guard |
|------|----|--------|-------|
| scheduled | in_progress | start | status === "scheduled" |
| in_progress | completed | complete | status === "in_progress" |
| scheduled, in_progress | cancelled | cancel | status !== "completed" && status !== "cancelled" |

## Preconditions
- WorkRequest, ServiceCase, Client, responsible User must exist
- No existing visit may be in progress for same workRequestId (implicit)

## Blockers
- Cannot start a visit already in_progress or completed
- Cannot complete a visit not in_progress
- Cannot cancel a completed visit

## Permissions
| Endpoint | Auth | Roles |
|----------|------|-------|
| GET | authenticate | INTERNAL_ROLES |
| POST | authenticate | SITE_VISIT_MANAGEMENT_ROLES |
| PATCH /:id | authenticate | SITE_VISIT_MANAGEMENT_ROLES |
| POST /:id/start | authenticate | SITE_VISIT_EXECUTION_ROLES |
| POST /:id/complete | authenticate | SITE_VISIT_EXECUTION_ROLES |
| POST /:id/cancel | authenticate | SITE_VISIT_CANCEL_ROLES |

## Contracts
`packages/shared-types/src/schemas/site-visit.schema.ts` — CreateSiteVisitRecordSchema, CompleteSiteVisitRecordSchema, CancelSiteVisitRecordSchema, ListSiteVisitRecordsQuerySchema

## Endpoints
| Method | Path |
|--------|------|
| GET | /api/site-visits |
| GET | /api/site-visits/:id |
| POST | /api/site-visits |
| PATCH | /api/site-visits/:id |
| POST | /api/site-visits/:id/start |
| POST | /api/site-visits/:id/complete |
| POST | /api/site-visits/:id/cancel |

Backend: `backend/src/modules/site-visit/site-visit.{routes,controller,service}.ts`

## Screens
| Route | Page |
|-------|------|
| /site-visits | List page |
| /site-visits/new | New visit form |
| /site-visits/[id] | Detail page |

Frontend: `frontend/src/modules/site-visits/queries.ts`

## UI States
- **Loading** — skeleton cards
- **Error** — error card with retry (ApiError in queries.ts)
- **Empty** — "No hay visitas técnicas registradas" with create CTA
- **Offline** — IndexedDB snapshot fallback in `fetchSiteVisitList`, offline source badge
- **Forbidden** — "No tienes permiso" card

## Audit Events
Mutations tracked via `commandHistory` subdocument (clientMutationId, command, recordedAt). No explicit `createAuditLog` calls.

## Negative Cases
| Case | Error | Code |
|------|-------|------|
| Visit not found | 404 | SITE_VISIT_NOT_FOUND |
| Invalid status transition | 400 | SITE_VISIT_INVALID_STATUS |
| DB unavailable | 503 | Transient DB error |

## E2E Tests
- `frontend/tests/e2e/pages/site-visits-pages.spec.ts` — list, create, detail flow
- `frontend/tests/modules/site-visits/site-visits-page.test.tsx` — list page unit
- `frontend/tests/modules/site-visits/site-visits-new-page.test.tsx` — create page unit

## Acceptance Evidence
- Code auto-generated: `SV-{year}-{sequence}` via Counter
- Every mutation key registered in `OFFLINE_MUTATION_KEYS` for offline queue
- List query falls back to IndexedDB snapshot on network failure
