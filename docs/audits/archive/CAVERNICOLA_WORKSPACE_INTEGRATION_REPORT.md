# CAVERNICOLA Workspace Integration Report

**Generated:** 2026-06-03  
**Scope:** `frontend/src`, `backend/src`, `packages/shared-types/src`, `packages/domain/src`, `packages/config/src`  
**Basis:** Canonical Cermont docs, `NUEVO_PLAN.md`, phase-1 `rg` diagnostics, and current route/module/schema/model globs.

---

## Executive Status

| Area | Current State | Risk | Next Action |
|---|---|---|---|
| Shared contracts | Broad schema coverage exists for all 14 steps, including PO, planning, execution, evidence, delivery, SES, invoice, payment | Medium: some pages still define local form schemas or read legacy fields | Replace page-local DTOs only when a shared contract already fits the mutation/read model. |
| Backend modules | Modules exist for all core steps plus files, templates, sync, audit, resources, kits, costs | Medium: transient MongoDB failures are not uniformly mapped to typed 503 responses | Apply the shared `isTransientDatabaseError` pattern module by module. |
| Frontend routes | Current App Router glob shows routes for dashboard, work requests, site visits, proposals, purchase orders, planning, execution, evidences, reports, delivery records, billing SES/invoices, payments, resources, costs, documents, users | Medium: route exists does not prove business completeness | Use page specs before refactor and verify hook -> endpoint -> schema -> model path. |
| Offline/PWA | Sync queue, blob outbox, service worker, network chip, and evidence/checklist offline hooks exist | Medium: offline capability is uneven across field pages | Define allowed offline actions per page before adding mutations. |
| RBAC | `packages/domain` contains roles, permissions, and route access helpers | Medium: frontend still has some UX-only paths that rely on backend rejection | Add frontend pre-gates where they improve UX, without replacing backend RBAC. |

---

## Current Verified Inventory

### Frontend route groups

- Core: `/dashboard`, `/service-cases`, `/orders`, `/planning`, `/execution`
- Intake/sales: `/work-requests`, `/site-visits`, `/proposals`, `/purchase-orders`
- Field/documents: `/evidences`, `/reports`, `/delivery-records`, `/documents`, `/documents/templates`
- Administrative close: `/billing/ses`, `/billing/invoices`, `/payments`
- Support/catalog: `/resources`, `/resources/kits`, `/maintenance`, `/assets`, `/costs`
- Admin: `/admin`, `/admin/users`, `/profile`, `/templates`

### Backend module inventory

`auth`, `user`, `work-requests`, `site-visit`, `proposal`, `purchase-order`, `planning-packet`, `execution-session`, `evidence`, `technical-report`, `delivery-record`, `service-entry-sheet`, `invoice`, `payment`, `resource`, `kit`, `files`, `documents`, `cost`, `dashboard`, `audit`, `sync`, `service-cases`.

### Schema/model alignment

Every core entity has a shared schema and a Mongoose model. Known naming differences remain:

| Entity | Shared schema | Mongoose model | Current concern |
|---|---|---|---|
| PurchaseOrder | `purchase-order-authorization.schema.ts` | `PurchaseOrder.ts` | Create page uses shared schema; attachment widget remains pending. |
| Resource/Kit | `resource.schema.ts`, `kit.schema.ts`, `tool.schema.ts` | `Resource.ts`, `Kit.ts`, `Tool.ts` | Resource service now has typed 503 path; other modules need same pattern. |
| DeliveryRecord | `delivery-record.schema.ts` | `DeliveryRecord.ts` | Graph node exists; continue page spec before further refactor. |
| SES/Invoice/Payment | `service-entry-sheet.schema.ts`, `invoice.schema.ts`, `payment.schema.ts` | matching models | Routes/pages exist under billing/payments; full business-rule audit pending. |

---

## Phase-1 Diagnostic Findings

1. `apiClient` is the dominant frontend HTTP path. Direct `fetch` appears in the HTTP wrapper, offline sync manager, Next auth route handlers, and report PDF download code. These are boundary-layer uses, not component data-fetching regressions.
2. Purchase Orders have canonical backend routes under `/api/purchase-orders` and frontend routes under `/purchase-orders`, including `/purchase-orders/new`.
3. Resources and kits have backend routes under `/api/resources`, `/api/resources/kits`, `/api/kits`, and frontend routes under `/resources` and `/resources/kits`.
4. `CermontAIDrawer` now uses `msg.id` and action keys scoped by message id.
5. `TODO`, `legacy`, `placeholder`, and `mock` hits include legitimate placeholders for form UI, test/contract snapshots, backward compatibility notes, and one AI service note. They require targeted review, not bulk deletion.

---

## Integration Rules For Next Refactors

1. Start each page with its page spec and graph node.
2. Do not create a new schema if an existing shared schema covers the payload.
3. Do not add frontend fields that cannot persist through the backend model or a documented pending item.
4. Backend services must map transient MongoDB dependency failures to typed `ServiceUnavailableError` with module-specific codes.
5. Frontend pages must show loading, error, empty, offline, and success states for critical business pages.
6. Offline mutations must use outbox/idempotency; server-only administrative actions remain disabled offline.
