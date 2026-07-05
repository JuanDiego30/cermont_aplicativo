# Auditoría Legacy — Refactor Profesional CERMONT

**Fecha**: 2026-05-22
**Baseline**: docs/audits/baseline-refactor-profesional.md

## Patrón: href="/documents"

| Archivo | Línea | Patrón | Riesgo | Acción |
|---------|-------|--------|-------|--------|
| `frontend/src/app/(dashboard)/documents/ingestion/[id]/page.tsx` | 66 | href="/documents" | Bajo | Navegación interna módulo documents, aceptable |
| `frontend/src/app/(dashboard)/documents/ingestion/[id]/page.tsx` | 78 | href="/documents" | Bajo | Navegación interna módulo documents, aceptable |

**Nota**: Estos son aceptables porque están dentro del módulo documents y no son botones contextuales de otros pasos.

## Patrón: router.push.*documents

| Archivo | Línea | Patrón | Riesgo | Acción |
|---------|-------|--------|-------|--------|
| `frontend/src/modules/documents/ui/DocumentUploader.tsx` | 282 | router.push(`/documents/ingestion/${ingest.draftId}`) | Bajo | Navegación contextual con ID, aceptable |

**Nota**: Aceptable, incluye contexto (draftId).

## Patrón: window.location

| Archivo | Línea | Patrón | Riesgo | Acción |
|---------|-------|--------|-------|--------|
| `frontend/public/offline.html` | 57 | window.location.reload() | Bajo | Página offline estática, aceptable |
| `frontend/src/app/(dashboard)/work-requests/[id]/page.tsx` | 86 | window.location.reload() | P2 | Reemplazar con router.refresh() |
| `frontend/src/app/(dashboard)/execution/page.tsx` | 190 | window.location.assign("/orders") | P2 | Reemplazar con router.push("/orders") |
| `frontend/src/app/(dashboard)/execution/[id]/page.tsx` | 98 | window.location.assign("/execution") | P2 | Reemplazar con router.push("/execution") |

**Acción**: Reemplazar window.location con router.push/router.refresh en 3 componentes.

## Patrón: fetch(

| Archivo | Línea | Patrón | Riesgo | Acción |
|---------|-------|--------|-------|--------|
| `frontend/tests/e2e/fixtures/api-client.fixture.ts` | 104, 153 | fetch | Bajo | Fixture de test E2E, aceptable |
| `frontend/src/modules/reports/queries.ts` | 281 | fetch | P2 | Reemplazar con apiClient |
| `frontend/src/lib/offline/sync-manager.ts` | 135 | fetch | Bajo | Sync manager offline, aceptable |
| `frontend/src/lib/http/api-client.ts` | 135, 222, 308 | fetch | Bajo | Implementación apiClient, aceptable |
| `frontend/public/service-worker.js` | 70, 88, 103, 127 | fetch | Bajo | Service worker PWA, aceptable |
| `frontend/src/app/api/auth/register-client/route.ts` | 22 | fetch | Bajo | Route handler Next.js, aceptable |
| `frontend/src/app/api/auth/login/route.ts` | 56 | fetch | Bajo | Route handler Next.js, aceptable |

**Acción**: Reemplazar fetch en reports/queries.ts con apiClient.

## Patrón: any[]

| Archivo | Línea | Patrón | Riesgo | Acción |
|---------|-------|--------|-------|--------|
| `backend/src/services/tool.service.ts` | 21-23, 35-37, 401, 407 | any[] | P1 | Reemplazar con tipos Zod inferidos |
| `backend/src/services/kit.service.ts` | 18-22, 30-34, 157 | any[] | P1 | Reemplazar con tipos Zod inferidos |
| `backend/src/models/Resource.ts` | 44-46 | any[] | P1 | Reemplazar con tipos Zod inferidos |
| `backend/src/models/Kit.ts` | 111-115 | any[] | P1 | Reemplazar con tipos Zod inferidos |
| `backend/src/controllers/resource.controller.ts` | 38-40 | any[] | P1 | Reemplazar con tipos Zod inferidos |

**Acción**: Crear schemas Zod para ToolDocument, KitDocument, EvidenceRequirement, etc. y usar z.infer<>.

## Patrón: new Map

| Archivo | Línea | Patrón | Riesgo | Acción |
|---------|-------|--------|-------|--------|
| `backend/src/controllers/document-import.controller.ts` | 18 | new Map | P1 | Reemplazar con MongoDB |
| `backend/src/controllers/document-template.controller.ts` | 16 | new Map | P1 | Reemplazar con MongoDB |
| `backend/src/controllers/kit-document.controller.ts` | 15 | new Map | P1 | Reemplazar con MongoDB |
| `backend/src/controllers/resource-document.controller.ts` | 14 | new Map | P1 | Reemplazar con MongoDB |
| `backend/src/common/observability/error-metrics.ts` | 19, 69 | new Map | Bajo | Métricas en memoria, aceptable |

**Acción**: Reemplazar 4 Maps in-memory con MongoDB (DocumentImportJob, DocumentTemplate, KitDocument, ToolDocument ya tienen modelos).

## Resumen de Riesgos

| Severidad | Cantidad | Archivos |
|-----------|----------|----------|
| P1 (Crítico) | 9 | any[] en 5 archivos, new Map en 4 controllers |
| P2 (Alto) | 4 | window.location en 3 componentes, fetch en 1 query |
| Bajo | 15 | Navegación aceptable, fixtures, service worker, api-client |

## Orden de Corrección

1. **P1 - any[]**: Crear schemas Zod y reemplazar tipos en models/services/controllers
2. **P1 - new Map**: Migrar a MongoDB los 4 controllers que usan Maps
3. **P2 - window.location**: Reemplazar con router.push/router.refresh
4. **P2 - fetch**: Reemplazar con apiClient en reports/queries.ts
