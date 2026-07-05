# Changelog — CERMONT S.A.S.

## 2026-06-24 — Spec 002 Stage 1: Pagination Envelope Standardization

### Breaking Changes
- **Migration 057-pagination-meta-standardization:** Unificado el envelope de paginación en toda la aplicación. Todas las listas paginadas ahora usan `meta: { total, page, limit, totalPages, hasNextPage, hasPreviousPage }` en vez del legacy `pagination: { page, limit, total, totalPages }`.
- Frontend y backend migraron juntos en una sola tanda. No hay mirror dual.

### Backend
- `response.interceptor.ts`: `sendPaginated()` ya emitía `meta` con los 6 campos. ✅
- 7 servicios migrados de `pagination:` a `meta:` con hasNextPage/hasPreviousPage:
  - work-requests, tool, template-response, template-draft, evidence-collection, kit, notifications
- 5 controllers actualizados para acceder a `result.meta` en vez de `result.pagination`
- 2 schemas compartidos actualizados: `WorkRequestListResponseSchema`, `ExecutionSessionListResponseSchema`
- `PaginationMetaSchema` y `paginatedEnvelopeSchema()` ya existían. ✅

### Frontend
- 14+ archivos migrados de `.pagination` a `.meta`
- APIs: audit, customers, fleet, kits, inventory, safety-analysis
- Queries: templates, service-cases, proposals, execution, maintenance, work-requests
- Pages: inventory, customers, fleet, notifications, maintenance
- Tests: audit api test, work-request routes test, work-request service test, client service test

### Tests añadidos (cobertura de contrato para endpoints sin tests previos)
- `backend/tests/controllers/dashboard.controller.test.ts` — fija `{success, data}` sin `meta` (no paginado)
- `backend/tests/controllers/files.controller.test.ts` — fija envelope `meta` del endpoint `query`
- `backend/tests/controllers/notification.controller.test.ts` — fija `{success, data:{notifications, unreadCount}, meta}`
- `backend/tests/controllers/template-response.controller.test.ts` — fija envelope `meta`; incluye test de regresión que documenta el bug conocido de `page`/`limit` no forwarded (ver TD-020 en TECHNICAL_DEBT.md)
- `backend/tests/controllers/service-case.controller.test.ts` — nuevo describe `listServiceCases`
- `frontend/tests/lib/pagination.test.ts` — nuevo describe con `PaginationMetaSchema` (Zod `.strict()`) para bloquear shape drift

### Documentación corregida
- `docs/audits/CONTRACT_COMPLIANCE_AUDIT.md` y `docs/audits/FRONTEND_BACKEND_ENDPOINT_MATRIX.md`: removidas afirmaciones obsoletas sobre paginación de Orders y envelope de Dashboard
- `docs/API_STATUS.md`: conteo de `API_MOUNTS` corregido (52 → 64), removida advertencia obsoleta `pagination` vs `meta`
- `docs/TECHNICAL_DEBT.md`: TD-008 (dashboard envelope) resuelto; TD-019/TD-020 nuevos (asset 0-indexed, bug de template-response) registrados

### Quality Gates
- Typecheck: ✅ (7/7 workspaces)
- Lint: ✅ (7/7 workspaces)
- Tests: ✅ 621/621 backend (93 files), 236/236 frontend (54 files), 157/157 shared-types (25 files) — 1014/1014 total
- Contracts guard: ✅ (hash: sha256:c0efaa9be560bafe6bcdbfc5b2b433528ea1085dbc9ca1b7a9f8b1809dc74dfa)
