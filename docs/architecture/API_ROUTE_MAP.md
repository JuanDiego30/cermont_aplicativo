# API Route Map — Cermont S.A.S.

**Generated:** 2026-07-06  
**Source:** `backend/src/modules/*/*.routes.ts` — actual route definitions  
**Purpose:** High-level map of all API routes organized by module  
**Total endpoints (est.):** ~456 route definitions across 56+ modules  
**Base URL:** `http://127.0.0.1:4000/api`

> This document is a **route MAP** (grouped by module). For detailed endpoint-level documentation
> (schemas, RBAC, audit), see `docs/architecture/API_ENDPOINT_MATRIX.md`.

---

## Conventions

- All routes are prefixed with `/api` (via `API_MOUNTS` in `backend/src/index.ts`)
- Route middleware order: `authenticate → authorize(roles?) → validateBody/Query/Params → controller`
- Response envelope: `{ success: boolean, data?: T, error?: { code, message } }`
- Paginated responses include `meta: { total, page, limit, pages }`

---

## Route Summary by Module

| Module | Route File(s) | Key Endpoints | RBAC | Status |
|--------|--------------|---------------|------|--------|
| **auth** | `auth.routes.ts` | `/login`, `/register`, `/refresh`, `/logout`, `/me`, `/change-password`, `/passkeys/*` | Public + Auth | IMPLEMENTED |
| **users** | `user.routes.ts` | `/users` CRUD | gerente, residente | IMPLEMENTED |
| **work-requests** | `work-requests.routes.ts` | `/work-requests` CRUD + visits | All auth | IMPLEMENTED |
| **site-visits** | `site-visits.routes.ts` | `/site-visits` CRUD | All auth | IMPLEMENTED |
| **proposals** | `proposals.routes.ts` | `/proposals` CRUD + send/approve/reject + PO | All auth | IMPLEMENTED |
| **purchase-orders** | `purchase-orders.routes.ts` | `/proposals/:id/po` CRUD | Management | IMPLEMENTED |
| **orders** | `order.routes.ts` | `/orders` CRUD + kanban + assign + advance-step | All auth | IMPLEMENTED |
| **planning-packet** | `planning-packet.routes.ts` | `/planning-packets` CRUD + approve + validate-readiness | Management | IMPLEMENTED |
| **execution** | `execution-sessions.routes.ts` | `/execution-sessions` CRUD + pause/complete/preflight | supervisor+ | IMPLEMENTED |
| **evidence** | `evidence.routes.ts` | `/evidences` CRUD + verify + review | Internal roles | IMPLEMENTED |
| **files** | `files.routes.ts` | `/files` CRUD + upload + content + offline-upload | Internal roles | IMPLEMENTED |
| **reports** | `reports.routes.ts` | `/reports` CRUD + submit/approve + auto-draft | All auth | IMPLEMENTED |
| **delivery-record** | `delivery-record.routes.ts` | `/delivery-records` CRUD + send/sign/reject/cancel/archive | All auth | IMPLEMENTED |
| **service-entry-sheet** | `service-entry-sheet.routes.ts` | `/ses` CRUD + submit/approve/reject + invoice link | All auth | IMPLEMENTED |
| **invoice** | `invoice.routes.ts` | `/invoices` CRUD + from-ses + submit/approve/reject | Internal roles | IMPLEMENTED |
| **payment** | `payment.routes.ts` | `/payments` CRUD + register + reconcile | All auth | IMPLEMENTED |
| **costs** | `costs.routes.ts` | `/costs/dashboard`, `/catalog`, `/orders/:id/costs` | Management | IMPLEMENTED |
| **cost-intelligence** | `cost-intelligence.routes.ts` | `/costs/:orderId/intelligence` | Management | IMPLEMENTED |
| **dashboard** | `dashboard.routes.ts` | `/dashboard`, `/dashboard/operational-kpis`, `/dashboard/sla-risk` | Management | IMPLEMENTED |
| **analytics** | `analytics.routes.ts` | `/analytics/kpis`, `/analytics/reports` | Management | IMPLEMENTED |
| **notifications** | `notifications.routes.ts` | `/notifications` CRUD + unread-count + mark-read | All auth | IMPLEMENTED |
| **service-cases** | `service-case.routes.ts` | `/service-cases` CRUD + cockpit + workflow + advance-step | All auth | IMPLEMENTED |
| **maintenance** | `maintenance.routes.ts` | `/maintenance` CRUD + schedules | All auth | IMPLEMENTED |
| **fleet** | `fleet.routes.ts` | `/fleet` CRUD + profile + photos + expiring-documents | Internal roles | IMPLEMENTED |
| **asset** | `asset.routes.ts` | `/assets` CRUD + profile + status | Internal roles | IMPLEMENTED |
| **resources/kits** | `kit.routes.ts` | `/kits` CRUD | Internal roles | IMPLEMENTED |
| **tools** | `tool.routes.ts` | `/tools` CRUD | Internal roles | IMPLEMENTED |
| **inventory** | `inventory.routes.ts` | `/inventory` CRUD + scan | Internal roles | IMPLEMENTED |
| **checklists** | `checklist.routes.ts` | `/checklists` CRUD | All auth | IMPLEMENTED |
| **audit** | `audit.routes.ts` | `/audit` query logs | gerente+ | IMPLEMENTED |
| **documents** | `document.routes.ts` | `/documents` CRUD + templates + responses + import | Management | IMPLEMENTED |
| **dispatch** | `dispatch.routes.ts` | `/dispatch` CRUD | Management | IMPLEMENTED |
| **sla** | `sla.routes.ts` | `/sla` CRUD | Management | IMPLEMENTED |
| **safety-analysis** | `safety-analysis.routes.ts` | `/safety-analysis` CRUD | HES+ | IMPLEMENTED |
| **offline-sync** | `sync.routes.ts` | `/sync/offline` batch sync | Auth | IMPLEMENTED |
| **observability** | `observability.routes.ts` | `/observability/errors`, `/observability/health` | Internal roles | IMPLEMENTED |
| **media** | *(empty)* | — | — | ⚠️ NOT IMPLEMENTED |
| **kpi** | *(empty)* | — | — | ⚠️ NOT IMPLEMENTED (covered by analytics+dashboard) |

---

## Service Cases / Cockpit Pipeline

The cockpit pipeline integrates data from multiple modules into a unified 14-step workflow view:

```
GET /api/service-cases/:id/cockpit          → Full 14-step read model
GET /api/service-cases/:id/workflow         → Canonical workflow view
GET /api/service-cases/:id/invoice-pipeline → SES → Invoice → Payment tracking
POST /api/service-cases/:id/step/advance    → Advance active step
```

---

## Cross-Cutting Endpoints

| Endpoint | Purpose | RBAC |
|----------|---------|------|
| `/health` | Readiness (legacy alias) | Public |
| `/health/live` | Liveness probe | Public |
| `/health/ready` | Readiness (MongoDB check) | Public |
| `/api/health` | API health (alias) | Public |
| `/api/health/live` | API liveness | Public |
| `/api/health/ready` | API readiness | Public |
| `/api/docs` | HTML API docs | Internal |
| `/api/docs/openapi.json` | OpenAPI spec | Internal |

---

## Admin / Privacy Endpoints

| Module | Endpoints |
|--------|----------|
| **privacy** | `/api/privacy/consents` CRUD + `/api/privacy/requests` CRUD |
| **system-config** | `/api/system-config` CRUD |
| **erp-connector** | `/api/erp-connector` CRUD |
| **backup** | `/api/backups` |
| **custom-fields** | `/api/custom-fields` CRUD |

---

## Notes

1. **Delivery-record, ses, invoice, payment** — Routes are in their own module directories.
   Controllers and services are centralized in `order/administrative-workflow.{controller,service}.ts`
   because the administrative pipeline (pasos 8-14) is tightly coupled.

2. **KPI module** — The empty `backend/src/modules/kpi/` directory is a stub.
   Actual KPI logic lives in `analytics/` and `dashboard/` modules.

3. **Media module** — The empty `backend/src/modules/media/` directory is a stub.
   Actual media/file handling lives in `evidence/` and `files/` (FileAsset pipeline).

4. **API_ENDPOINT_MATRIX.md** documents 100 endpoints. The real codebase has ~456 route definitions.
   A full regeneration is pending.
