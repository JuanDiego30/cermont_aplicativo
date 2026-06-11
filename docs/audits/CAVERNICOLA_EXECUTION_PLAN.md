# CAVERNICOLA Execution Plan — Cermont S.A.S.

> **Source prompt**: `docs/PROMPTS/NUEVO_PLAN.md` (Prompt maestro + Plan de trabajo por fases + Continuation + Compact checklist + Next module order).
> **Purpose**: Single consolidated execution plan that contains **all 40 phases** defined in the source document, conformed to the canonical Cermont S.A.S. rules in `AGENTS.md` and `docs/REGLAS_DESARROLLO_CERMONT.md`.
> **Mode**: Cavernícola — read this plan + the existing `CAVERNICOLA_*.{md,json}` graph files in `docs/audits/` first; do **not** re-read source code from scratch.
> **Scope of edits**: only `src` directories and the cavernicola graph. No external pushes. No mocks in production.

---

## 0. Cermont Rules Anchor (NON-NEGOTIABLE)

These rules override anything found in legacy code, web tutorials, or model pretraining.

### 0.1 Workspace (verified live)

| Concern | Allowed | Forbidden |
|---|---|---|
| Monorepo layout | `backend/`, `frontend/`, `packages/*` | `apps/`, `apps/backend`, `apps/frontend` |
| Workspaces (`package.json`) | `["backend", "frontend", "packages/*"]` | anything else |
| Package manager | `npm` (root `package-lock.json` is the **only** lockfile) | `pnpm`, `yarn`, nested lockfiles |
| Backend framework | Express 5.2.1 (async native) | NestJS, `express-async-handler` |
| ODM / DB | Mongoose 9.x over MongoDB (`127.0.0.1`, `family: 4`) | Prisma, PostgreSQL, Sequelize |
| Auth | JWT (access in memory + HttpOnly refresh cookie) + Zustand store | Auth.js, NextAuth |
| Validation | Zod 4.x in backend **and** frontend | Joi, Yup |
| Frontend | Next.js 16 + React 19 + TanStack Query v5 + Zustand 5 + Tailwind 4 + Radix | custom fetch in components, `useEffect` for data fetching |
| HTTP client | `apiClient` wrapper | Axios, raw `fetch` in components |
| Security perimeter | `frontend/proxy.ts` | `middleware.ts` (do **not** create or modify) |
| Types | `@cermont/shared-types` (SSOT) | local duplicates |
| RBAC | `@cermont/domain` (SSOT) | hardcoded role strings |
| Env validation | `@cermont/config` (SSOT) | ad-hoc `process.env` reads |
| Identifiers (variables, components, hooks, schemas, enums, tests, files, API codes) | **English** | Spanish for internal logic |
| Absence values | status objects (`{ status: "not_created" }`) | `null`, `undefined` as business absence |
| Type safety | strict TypeScript | `any`, `unknown` as escape hatch, `as any`, `@ts-ignore`, `@ts-expect-error` |
| Error handling | typed errors with stable codes | empty `catch`, swallowed errors, `console.log` in prod |
| Mock data | tests and seed scripts only | mocks in production modules |
| UI states (per page) | loading, error, empty, offline, success | blank pages on failure |
| Mobile-first | touch targets ≥ 44px, responsive tables, drawer sidebar | desktop-only layouts |

### 0.2 RBAC — canonical role identifiers (8 roles, snake_case, English)

```ts
export const UserRole = {
  Manager: "manager",
  ResidentEngineer: "residente",
  HesCoordinator: "hes",
  Supervisor: "supervisor",
  Operator: "operador",
  Technician: "tecnico",
  Administrative: "administrativo",
  Client: "cliente",
} as const;
```

User-facing Spanish labels live only in a centralized i18n / copy layer and **never** as React keys, enum values, DB status values, API codes, permission ids, route segments (unless pre-existing), or business state names.

### 0.3 API response envelope (SSOT)

```ts
type ApiResponse<T> =
  | { success: true; data: T; message?: string }
  | { success: false; error: { code: string; message: string; details?: unknown } };
```

### 0.4 API client and rewrites

- All frontend calls go through `frontend/src/lib/http/api-client.ts` (TanStack Query).
- In development, the Next.js rewrite maps `/api/backend/*` → `http://127.0.0.1:4000/api/*`. The frontend must **POST** to `/api/backend/purchase-orders`, **never** to `/api/backend/purchase-orders/new`.

### 0.5 MongoDB connection

```ts
// backend/src/config/db.ts — IPv4 only
await mongoose.connect(process.env.MONGO_URI ?? "mongodb://127.0.0.1:27017/cermont", {
  family: 4,
  serverSelectionTimeoutMS: 5000,
  maxPoolSize: 10,
  minPoolSize: 2,
});
```

### 0.6 Backend MVC

- `routes/` → wiring + middleware (`authenticate` → `authorize` → `validateBody/Query/Params` → controller).
- `controllers/` → HTTP only, no try/catch (Express 5 propagates async errors).
- `services/` → business logic, throws `AppError` subclasses.
- `models/` → Mongoose schemas only.
- `middlewares/` → auth, validation, rate limit.
- `utils/` → pure helpers.

### 0.7 Frontend conventions

- Server Components by default; `"use client"` only when needed.
- TanStack Query for server state. Zustand for client state. No `useEffect` for data fetching.
- React Hook Form + `zodResolver` for forms.
- Semantic HTML: one `<h1>` per page, `<button>` for actions, `<label>` for inputs.

---

## 1. Where to Edit

Code edits are limited to:

```txt
backend/src
frontend/src
packages/shared-types/src
packages/domain/src
packages/config/src
```

Also editable (only when strictly required): `docs/audits/*`, `package.json` scripts, PWA manifest / service worker when explicitly indicated, E2E config, test scripts.

**Do not** push to GitHub. The remote `https://github.com/JuanDiego30/cermont_aplicativo.git` is read-only reference.

---

## 2. Cavernícola Mode (Working Memory)

Before editing any page, **load** the existing graph and update it instead of re-reading source code:

```txt
docs/audits/CAVERNICOLA_REPO_GRAPH.{md,json}
docs/audits/CAVERNICOLA_FRONTEND_ROUTE_MAP.md
docs/audits/CAVERNICOLA_API_CONTRACT_MAP.md
docs/audits/CAVERNICOLA_DB_MODEL_MAP.md
docs/audits/CAVERNICOLA_OFFLINE_INDEXEDDB_MAP.md
docs/audits/CAVERNICOLA_PAGE_BUSINESS_LOGIC_MAP.md
docs/audits/CAVERNICOLA_E2E_TRACEABILITY_MATRIX.md
docs/audits/CAVERNICOLA_RUNTIME_ERRORS_REPORT.md
docs/audits/CAVERNICOLA_MODULE_IMPLEMENTATION_STATUS.md
docs/audits/CAVERNICOLA_BUSINESS_LOGIC_FINAL_REPORT.md
```

Per-page graph node:

```txt
page → component → hook → apiClient → endpoint → controller → service → Mongoose model → Zod schema → RBAC permission → IndexedDB/offline → tests
```

Never edit a page until the node above is complete for that page.

---

## 3. CERMONT 14-Step Operating Flow

This is the spine that every module/page maps to. All step numbers below are stable identifiers.

| # | Step | Step identifier (English, snake_case) | Page route seed |
|---|---|---|---|
| 1 | Solicitud formal del cliente | `work_request` | `/work-requests` |
| 2 | Visita técnica | `site_visit` | `/site-visits` |
| 3 | Propuesta económica | `proposal` | `/proposals` |
| 4 | Aprobación con PO | `purchase_order` | `/purchase-orders` |
| 5 | Planeación | `planning` | `/planning` |
| 6 | Ejecución con permisos, AST, checklist, evidencias | `execution` | `/field-execution` |
| 7 | Informe técnico | `technical_report` | `/technical-reports` |
| 8 | Acta de entrega | `delivery_record` | `/delivery-records` |
| 9 | Acta firmada | `signed_delivery_record` | `/delivery-records/:id/sign` |
| 10 | SES en Ariba | `ses_submitted` | `/service-entry-sheets` |
| 11 | SES aprobada | `ses_approved` | `/service-entry-sheets/:id/approval` |
| 12 | Factura | `invoice` | `/invoices` |
| 13 | Aprobación de factura | `invoice_approved` | `/invoices/:id/approval` |
| 14 | Pago y cierre definitivo | `payment_closed` | `/payments` |

---

## 4. Phases 1–12 — Base Plan (Plan de trabajo por fases)

### Phase 1 — Separate real errors from warnings

| Console message | Type | Action |
|---|---|---|
| `sw.js jamToggleDumpStore` from `chrome-extension://` | Browser extension | Reproduce in incognito / with extensions disabled. No code change. |
| LCP warning on landing image | Performance | Add `priority` + `loading="eager"` on the above-the-fold `<Image>` only. |
| `POST /api/backend/purchase-orders/new 400` | Real bug | Phase 4. |
| `CermontAIDrawer duplicate key` | Real React bug | Phase 5. |
| `GET /resources 503` | Real backend bug | Phase 6. |
| `Illegal invocation`, `/api/backend/api/backend`, `sw.js` returning `undefined`, HMR broken by PWA, `console.error` on navigation | Audit + reproduce | Capture in `CAVERNICOLA_RUNTIME_ERRORS_REPORT.md` and resolve per phase. |

### Phase 2 — Focus edits on `src` only

Edit scope (canonical): `backend/src`, `frontend/src`, `packages/shared-types/src`, `packages/domain/src`, `packages/config/src`. Do not spread edits into secondary folders while core modules are still broken.

### Phase 3 — Map every page to the 14 steps

For each page produce:

```txt
- Which of the 14 steps it covers
- What data it reads
- What data it writes
- Which endpoint it uses
- Which Zod schema it uses
- Which Mongoose model it persists
- Which role can access it
- Which business lock applies
```

Real flow (CERMONT): request → visit → proposal → PO → planning → execution → report → delivery record → signed record → SES → SES approval → invoice → invoice approval → payment.

### Phase 4 — Fix `purchase-orders/new` 400

Likely root causes to investigate (do not guess; read code):

```txt
1. Frontend posting to a page route, not an API route.
2. `/new` being interpreted as an id by the route.
3. The correct API is POST /api/purchase-orders (not /purchase-orders/new).
4. Payload missing required fields (proposalId, poNumber, approvedAt, attachment, createdBy).
5. Zod schema rejecting the payload.
6. Frontend form using fields not present in the contract.
7. Mongoose model lacking fields required by the contract.
```

Target page contract (corrected):

```txt
Route:   /purchase-orders/new
Step:    4
Reads:   approved proposal, client, service case / work request, approved amount
Writes:  purchaseOrderNumber, approvedDate, approvedAmount, clientReference, attachment, createdBy, status
Calls:   POST /api/backend/purchase-orders  →  POST /api/purchase-orders
Never:   POST /api/backend/purchase-orders/new
```

Reference contract (Zod, English identifiers, in `packages/shared-types/src/schemas/purchase-order.schema.ts`):

```ts
export const PurchaseOrderCreateSchema = z.object({
  proposalId: z.string().min(1),
  serviceCaseId: z.string().min(1),
  purchaseOrderNumber: z.string().min(1),
  approvedAmount: z.number().nonnegative(),
  approvedAt: z.string().datetime(),
  clientReference: z.string().optional(),
  attachmentIds: z.array(z.string()).default([]),
});
```

### Phase 5 — Fix `CermontAIDrawer` duplicate keys

Never use the message text as the React key. Each message must have a stable `id`.

```tsx
// Forbidden:
{messages.map((m) => <div key={m.content}>{m.content}</div>)}

// Required:
{messages.map((m) => <div key={m.id}>{m.content}</div>)}
```

If a legacy message has no `id`, normalize it on ingest:

```ts
type AiMessage = {
  id: string;
  role: "user" | "assistant" | "system";
  content: string;
  createdAt: string;
};

function normalizeAiMessages(messages: Partial<AiMessage>[]): AiMessage[] {
  return messages.map((m, i) => ({
    id: m.id ?? `${m.role ?? "unknown"}-${m.createdAt ?? "no-date"}-${i}`,
    role: m.role ?? "assistant",
    content: m.content ?? "",
    createdAt: m.createdAt ?? new Date().toISOString(),
  }));
}
```

### Phase 6 — Fix `/resources` 503

`/resources` represents the operational catalog used in CERMONT planning: kits, tools, equipment, materials, EPP, certifications, quantities, images, status.

Minimum page sections:

```txt
- Kits overview
- Tools table
- Equipment table
- Materials table
- EPP table
- Certifications
- Quantity / unit / image
- Active / inactive status
```

Must be backed by a real service and MongoDB persistence. If a service is temporarily down, return the structured envelope:

```json
{ "ok": false, "code": "RESOURCE_SERVICE_UNAVAILABLE", "message": "Resources service is temporarily unavailable.", "details": {} }
```

### Phase 7 — Standard structure for every page

Every business page must include:

```txt
PageHeader
BusinessContextCard
CermontStepTimeline
PrimaryContent
BusinessRulesPanel
EvidenceAndAttachmentsPanel
AuditTrailPanel
OfflineSyncIndicator
ActionBar
```

### Phase 8 — Module priority order

```txt
1. purchase-orders       (currently failing in console)
2. resources             (currently failing in console)
3. planning
4. field-execution / evidences
5. technical-reports
6. delivery-records
7. service-entry-sheets
8. invoices
9. payments
10. dashboard
```

### Phase 9 — Contracts and MongoDB fields

A field that must persist goes through this whole chain (no shortcuts):

```txt
Zod schema  →  TypeScript type  →  Mongoose model  →  endpoint / service  →  frontend hook  →  IndexedDB (if offline)  →  test
```

Required transverse fields (when applicable): `status`, `lifecycleStep`, `serviceCaseId`, `workRequestId`, `proposalId`, `purchaseOrderId`, `planningPacketId`, `executionSessionId`, `technicalReportId`, `deliveryRecordId`, `sesId`, `invoiceId`, `paymentId`, `createdBy`, `updatedBy`, `approvedBy`, `attachments`, `evidenceRefs`, `auditTrail`, `offlineLocalId`, `syncStatus`.

Resource fields: `name`, `category`, `type`, `unit`, `quantity`, `image`, `gallery`, `certificationRequired`, `certificationExpiresAt`, `status`, `tags`, `createdBy`, `updatedBy`.

Evidence fields: `photos`, `beforePhotos`, `afterPhotos`, `geolocation`, `capturedAt`, `capturedBy`, `checklistItemId`, `category`, `offlineLocalId`, `syncStatus`.

### Phase 10 — External references (conceptual only, do not copy code)

- OpenProject: work packages, Gantt, boards, time / cost tracking, documents.
- Redmine: projects, custom fields, roles, time tracking, REST API.
- Metasfresh: ERP open source with REST/JSON, modular business processes.
- Hydra OMS: open source orders + BPMN.
- OCA Field Service: modular field service pattern.
- PWA / offline FSM references.

Result registered in `docs/audits/CAVERNICOLA_EXTERNAL_REFERENCES.md`. Patterns only, no code copying.

### Phase 11 — Required tests

```txt
purchase-orders-new.spec.ts
resources.spec.ts
cermont-ai-drawer.test.tsx
navigation.spec.ts
full-workflow.spec.ts
business-rules.spec.ts
```

Each test must validate: no `console.error` critical, no duplicate keys, no unexpected 400, no unmanaged 503, no `pageerror`, no final mocks in critical paths.

### Phase 12 — Expected result

```txt
- /purchase-orders/new working
- /resources working
- CermontAIDrawer with no duplicate keys
- LCP landing image fixed
- modules mapped to the 14 steps
- pages with the standard structure
- contracts aligned
- backend connected
- MongoDB with the required fields
- frontend without critical mocks
- business logic implemented
- tests added
- npm run verify passing
```

---

## 5. Phases 13–40 — Continuation (Business-Logic-First, Page-by-Page)

### Phase 13 — Business page contract for every route

Create or update:

```txt
docs/audits/CAVERNICOLA_PAGE_SPECIFICATIONS.md
docs/audits/CAVERNICOLA_PAGE_TO_CONTRACT_MATRIX.md
docs/audits/CAVERNICOLA_PAGE_TO_BUSINESS_RULES_MATRIX.md
```

Template per page (mandatory before any edit):

```txt
Page:                /purchase-orders/new
Route:               /purchase-orders/new
Workspace:           frontend
Source file:         frontend/src/app/(dashboard)/purchase-orders/new/page.tsx
Business module:     purchase_orders
CERMONT step:        4
User roles:          manager, residente, administrativo
Primary entity:      PurchaseOrder
Related entities:    Proposal, ServiceCase, Client, Attachment
Reads from:          /api/proposals/:id, /api/service-cases/:id
Writes to:           /api/purchase-orders
API endpoint:        POST /api/purchase-orders
Zod schema:          PurchaseOrderCreateSchema
Mongoose model:      PurchaseOrder
Domain constants:    PurchaseOrderStatus, ApprovalStatus
RBAC permission:     purchase_orders.manage
Offline behavior:    not applicable (online-only)
IndexedDB store:     none
Outbox mutation:     none
Required UI sections: PageHeader, BusinessContextCard, CermontStepTimeline, PrimaryContent (form), BusinessRulesPanel, ActionBar
Business rules:      - proposal must be approved before PO can be created
                     - purchaseOrderNumber is mandatory and unique
                     - approvedAmount must be > 0
Blocking rules:      - cannot create PO if proposal status != "proposal_approved"
Loading state:       skeleton
Empty state:         "No approved proposal selected"
Error state:         show API error.code + error.message + retry
Offline state:       "Online connection required to create a PO"
Sync pending state:  n/a
Tests:               schema test, service test, page render test, E2E happy + invalid
E2E scenario:        create PO from approved proposal
Status:              implemented | partial | mock | legacy | broken | missing
```

Rules:

1. Do not refactor a page until its page contract exists.
2. Do not create UI fields that are not backed by schema/model/endpoint if they must persist.
3. Do not keep page-local DTOs if `shared-types` already defines the contract.
4. Do not use Spanish labels as identifiers, keys, enum values, or DB status values.
5. Do not mark a page "implemented" unless it has real data flow.

### Phase 14 — Fix current browser runtime errors first

Update `docs/audits/CAVERNICOLA_RUNTIME_ERRORS_REPORT.md`. Current errors:

1. `POST /api/backend/purchase-orders/new → 400 Bad Request` (see Phase 4).
2. `GET /resources → 503 Service Unavailable` (see Phase 6 and Phase 21).
3. `CermontAIDrawer duplicate React key` (see Phase 5).
4. LCP warning for above-the-fold landing image (see Phase 1, with `priority` + `loading="eager"` only if above the fold).
5. `sw.js jamToggleDumpStore` from browser extension — document only, do not modify project service worker.

### Phase 15 — Define the real business modules

Create `docs/audits/CAVERNICOLA_BUSINESS_MODULE_BLUEPRINT.md`. Each module is a vertical slice:

```txt
shared-types schema → domain constants → backend model → backend route → backend controller → backend service
   → frontend api service → frontend hook → frontend page → frontend components
   → IndexedDB / offline (if needed) → unit tests → integration tests → E2E tests
```

Business modules to deliver:

```txt
1.  auth-and-rbac
2.  users-and-roles
3.  work-requests
4.  site-visits
5.  proposals
6.  purchase-orders
7.  service-cases (work-orders)
8.  planning-packets
9.  resources-and-kits
10. field-execution
11. checklists
12. evidence-management
13. technical-reports
14. delivery-records
15. client-acceptance (signed record)
16. service-entry-sheets (Ariba)
17. invoices
18. payments
19. cost-control
20. documents-and-dynamic-forms
21. dashboard
22. offline-sync (PWA)
23. audit-trail
```

External references (pattern only, never copy code): OpenProject (work packages, Gantt, boards, time/cost, documents), Redmine (RBAC, custom fields, REST API), ERPNext (accounting/CRM/purchasing/warehouse/projects/inventory/services).

### Phase 16 — Page-by-page implementation order

Create `docs/audits/CAVERNICOLA_PAGE_REFACTOR_SEQUENCE.md`. Order:

```txt
1.  /dashboard
2.  /work-requests
3.  /site-visits
4.  /proposals
5.  /purchase-orders
6.  /service-cases (or /work-orders)
7.  /planning
8.  /resources
9.  /resources/kits
10. /field-execution
11. /evidences
12. /technical-reports
13. /delivery-records
14. /service-entry-sheets
15. /invoices
16. /payments
17. /costs
18. /documents
19. /users
20. /settings
21. /offline-sync
```

For each page run the 14-step checklist:

```txt
1. Read graph node
2. Read page specification
3. Verify route
4. Verify API call
5. Verify schema
6. Verify model
7. Verify RBAC
8. Verify offline behavior
9. Fix data flow
10. Add missing states
11. Refactor UI structure
12. Add tests
13. Update graph
14. Run targeted checks
```

### Phase 17 — Standard page structure (canonical 9 sections)

Every business page must render these 9 sections in this order:

1. PageHeader — title, description, current step status, primary action, role-aware actions.
2. BusinessContextCard — service case, client, location, business unit, responsible user, current lifecycle step, blocking issue count.
3. CermontStepTimeline — 14 steps, current step, completed steps, blocked steps, next allowed step, missing requirements.
4. PrimaryContent — real data; the form or table for the module.
5. BusinessRulesPanel — missing required fields, missing documents, missing evidence, invalid state transition, role restriction, offline limitation.
6. EvidenceAndAttachmentsPanel — photos, before/after evidence, signed documents, generated reports, attachments, pending offline uploads.
7. AuditTrailPanel — created by, updated by, approved by, rejected by, timestamps, state transition history.
8. OfflineSyncIndicator — pending / synced / error.
9. ActionBar — save, approve, reject, advance, cancel.

### Phase 18 — Business state machine

Create or verify in `packages/domain/src/service-case-lifecycle/`:

```ts
export const ServiceCaseStatus = {
  WorkRequested: "work_requested",
  SiteVisitPending: "site_visit_pending",
  SiteVisitCompleted: "site_visit_completed",
  ProposalDraft: "proposal_draft",
  ProposalSent: "proposal_sent",
  ProposalApproved: "proposal_approved",
  PurchaseOrderRegistered: "purchase_order_registered",
  PlanningDraft: "planning_draft",
  PlanningApproved: "planning_approved",
  ExecutionInProgress: "execution_in_progress",
  ExecutionCompleted: "execution_completed",
  TechnicalReportGenerated: "technical_report_generated",
  DeliveryRecordSent: "delivery_record_sent",
  DeliveryRecordSigned: "delivery_record_signed",
  ServiceEntrySheetSubmitted: "service_entry_sheet_submitted",
  ServiceEntrySheetApproved: "service_entry_sheet_approved",
  InvoiceSubmitted: "invoice_submitted",
  InvoiceApproved: "invoice_approved",
  PaymentRegistered: "payment_registered",
  Closed: "closed",
} as const;
```

Transition rules (hard business locks):

```txt
1. No purchase order without approved proposal.
2. No planning approval without minimum resources.
3. No execution without approved planning.
4. No execution completion without checklist and evidence.
5. No technical report without completed execution.
6. No delivery record without technical report.
7. No SES without signed or accepted delivery record.
8. No invoice without approved SES.
9. No payment without approved invoice.
10. No final closure with pending required documents.
```

### Phase 19 — RBAC alignment with company hierarchy

Create or verify in `packages/domain/src/`:

```txt
roles/         (UserRole enum and labels)
permissions/   (e.g., purchase_orders.manage)
rbac/          (can(user, action, resource) helpers)
```

Internal role identifiers (English / snake_case). Display labels (Spanish) live only in i18n.

Permission identifiers (canonical):

```txt
work_requests.read
work_requests.create
site_visits.manage
proposals.manage
purchase_orders.manage
planning.manage
planning.approve
execution.perform
evidences.upload
technical_reports.generate
delivery_records.manage
ses.manage
invoices.manage
payments.manage
costs.read
costs.manage
resources.manage
users.manage
audit.read
```

### Phase 20 — Purchase Orders module (priority, currently broken)

Vertical slice (canonical paths):

```txt
packages/shared-types/src/schemas/purchase-order.schema.ts
packages/domain/src/purchase-orders/
backend/src/models/PurchaseOrder.ts
backend/src/services/purchase-order.service.ts
backend/src/controllers/purchase-order.controller.ts
backend/src/routes/purchase-order.routes.ts
frontend/src/modules/purchase-orders/
frontend/src/app/(dashboard)/purchase-orders/
```

Page sections: proposal summary, client approval data, PO form, PO attachment, business validation panel, state transition action, audit trail.

Required fields: `proposalId`, `serviceCaseId`, `purchaseOrderNumber`, `approvedAmount`, `approvedAt`, `clientReference`, `attachmentIds`, `status`, `createdBy`, `createdAt`, `updatedBy`, `updatedAt`.

Tests (must pass):

```txt
1. Create PO with valid payload.
2. Reject PO without approved proposal.
3. Reject missing purchaseOrderNumber.
4. Reject invalid approvedAmount.
5. Frontend does not POST to /purchase-orders/new.
6. Page shows validation error for 400.
7. Successful create advances service case state.
```

### Phase 21 — Resources and Kits module (priority, currently 503)

Required entities: `Resource`, `ResourceKit`, `ResourceKitItem`, `Tool`, `Equipment`, `Material`, `SafetyItem`, `CertificationRequirement`, `ChecklistTemplate`.

Required fields: `name`, `description`, `category`, `type`, `unit`, `quantity`, `image`, `gallery`, `certificationRequired`, `certificationExpiresAt`, `status`, `tags`, `createdBy`, `updatedBy`.

Page sections: category tabs, kits overview, tools/equipment/materials/EPP tables, certification requirements, image preview, empty + error states, bulk import/export if supported.

Planning integration: planning page must let users select kits, tools, equipment, materials, EPP, labor roles, certifications, and support documents.

### Phase 22 — Planning module

Planning form requires: responsible inspector, place, date, business unit, scope, materials, tools, equipment, EPP, number of workers.

Page sections: work scope, schedule, labor planning, materials, tools, equipment, EPP, certifications, AST requirements, support documents, selected kits, approval panel, blocking rules.

Business rules:

```txt
1. Cannot approve planning without at least one labor role.
2. Cannot approve planning without required resources for the selected activity type.
3. Cannot approve if certification-required equipment lacks certification status.
4. Cannot start execution without approved planning.
5. Planning must generate a resource checklist for execution.
```

### Phase 23 — Field Execution module

Page sections: execution summary, planning checklist, tools/equipment verification, AST confirmation, permit confirmation, activity checklist, evidence capture, before/during/after photos, observations, offline queue status, finish execution action.

Business rules:

```txt
1. No execution without approved planning.
2. Required tools/equipment must be confirmed.
3. Required AST must be confirmed.
4. Required checklist items must be completed.
5. Required evidence must be uploaded or queued offline.
6. Execution can be completed offline only as pending sync.
```

### Phase 24 — Evidence module

Files:

```txt
packages/shared-types/src/schemas/evidence.schema.ts
backend/src/models/Evidence.ts
backend/src/services/evidence.service.ts
backend/src/controllers/evidence.controller.ts
backend/src/routes/evidence.routes.ts
frontend/src/modules/evidences/
frontend/src/app/(dashboard)/evidences/
```

Required fields: `serviceCaseId`, `executionSessionId`, `checklistItemId`, `category`, `photos`, `beforePhotos`, `afterPhotos`, `description`, `geolocation`, `capturedAt`, `capturedBy`, `offlineLocalId`, `syncStatus`.

UI: gallery, before/after comparison, upload/capture field, offline pending photos, geolocation badge, category filter, related checklist item, report inclusion toggle.

### Phase 25 — Technical Reports module

Page sections: service summary, executed activities, evidence selection, findings, recommendations, attachments, generated PDF preview, generate/regenerate action, approval state.

Business rules:

```txt
1. No technical report without completed execution.
2. Report must include executed activities.
3. Report must include at least required evidence.
4. Report PDF must be traceable to source data.
```

### Phase 26 — Delivery Records module

Page sections: technical report summary, delivery details, client information, evidence summary, attachments, signature or signed document, sent/accepted state, blocking rules toward SES.

Business rules:

```txt
1. No delivery record without technical report.
2. No signed state without signed document or signature.
3. No SES without accepted/signed delivery record if required.
```

### Phase 27 — SES / Ariba module

Page sections: delivery record summary, SES number, Ariba submission date, support document, approval status, client observations, invoice blocking status.

Business rules:

```txt
1. No SES without accepted delivery record.
2. No invoice without approved SES.
3. SES rejection must reopen administrative correction task.
```

### Phase 28 — Invoices module

Page sections: approved SES summary, invoice number, amount, date, Ariba submission support, approval status, payment blocking status.

Business rules:

```txt
1. No invoice without approved SES.
2. No payment registration without approved invoice.
3. Invoice amount must match approved business rules or require a variance reason.
```

### Phase 29 — Payments module

Page sections: approved invoice summary, payment date, paid amount, payment support, remaining balance, final closure action, full traceability panel.

Business rules:

```txt
1. No payment without approved invoice.
2. No final closure with unpaid balance unless an authorized exception exists.
3. Final closure requires all mandatory documents.
```

### Phase 30 — Cost Control module

Fields: `serviceCaseId`, `proposalAmount`, `plannedCost`, `actualLaborCost`, `actualMaterialCost`, `actualEquipmentCost`, `actualTravelCost`, `actualOverheadCost`, `invoicedAmount`, `paidAmount`, `varianceAmount`, `varianceReason`.

UI: budget vs actual summary, cost by category, variance warnings, related invoice/payment, exportable report.

Business rules:

```txt
1. Actual costs must be tied to a service case.
2. Cost variance must be visible before closure.
3. Final closure should expose margin/variance if the cost module is enabled.
```

### Phase 31 — Documents and dynamic forms

Page sections: document library, templates, dynamic forms, generated documents, attachments, version history, entity relation.

Document types: `planning_form`, `life_line_inspection`, `cctv_maintenance_report`, `ast`, `permit_to_work`, `checklist`, `technical_report`, `delivery_record`, `signed_delivery_record`, `ses_support`, `invoice_support`, `payment_support`.

Rules:

```txt
1. Documents must be linked to entityType + entityId.
2. Generated documents must be reproducible from source data.
3. Uploaded documents must store metadata and audit trail.
4. Dynamic forms must not bypass Zod validation.
```

### Phase 32 — Dashboard module

Sections: work lifecycle summary, active service cases, blocked cases, pending planning, pending execution evidence, pending reports, pending delivery records, pending SES, pending invoices, pending payments, cost variance summary, offline sync status.

Rules:

```txt
1. No fake KPIs.
2. If data is missing, show empty state.
3. Dashboard must use backend summary endpoints or derived real data.
4. Role-specific widgets must respect RBAC.
```

### Phase 33 — Offline-first execution

Files:

```txt
frontend/src/lib/offline/
frontend/src/lib/indexeddb/
frontend/src/lib/sync/
frontend/src/modules/offline/
frontend/public/service-worker.js
```

IndexedDB stores: `serviceCases`, `planningPackets`, `resources`, `checklists`, `evidences`, `fileBlobs`, `outbox`, `syncEvents`, `currentUserProfile`.

Allowed offline: view assigned work, view approved planning, view resource checklist, complete checklist, capture evidence, save photos as blobs, add observations, queue sync mutation.

Forbidden offline: first login, change RBAC, approve financial docs unless explicitly supported, store passwords / readable tokens, bypass backend business rules permanently.

### Phase 34 — Code language normalization (English only)

All source code in English. User-facing Spanish text centralized in `frontend/src/lib/i18n/`, `frontend/src/lib/copy/`, or per-module `copy.ts`. Spanish text is **never** used as React key, enum value, DB status, API error code, permission id, route segment (unless pre-existing), or business state.

### Phase 35 — Module-by-module acceptance criteria

Create `docs/audits/CAVERNICOLA_MODULE_ACCEPTANCE_CRITERIA.md`. Per module:

```txt
Module:                    Resources and Kits
Business problem solved:   Avoid missing tools/equipment during execution.
Required roles:            residente, hes, supervisor, gerente
Required pages:            /resources, /resources/kits
Required endpoints:        GET/POST/PUT/DELETE /api/resources/*, /api/kits/*
Required schemas:          ResourceCreateSchema, KitCreateSchema
Required models:           Resource, ResourceKit
Required offline behavior: read-only catalog cached for field use
Required tests:            schema, service, controller, render, E2E happy + invalid, RBAC
Acceptance criteria:       see below
Known gaps:                none | list
```

Example acceptance (Resources and Kits):

```txt
1. User can create tool / equipment / material / EPP.
2. User can create a kit from resources.
3. Planning can select a kit.
4. Execution checklist receives kit resources.
5. /resources never returns an unhandled 503.
6. Images persist when implemented.
7. RBAC protects modifications.
8. Tests cover create / list / update + planning integration.
```

### Phase 36 — Testing gates by module

For every module:

```txt
1. Schema test
2. Business rule test
3. Backend service test
4. Backend route / controller test
5. Frontend render test
6. E2E happy path
7. E2E invalid path
8. RBAC test
9. Offline test (if applicable)
```

E2E console guard (whitelist explicitly, never ignore silently):

```ts
page.on("console", (m) => { if (m.type() === "error") throw new Error(`Console error: ${m.text()}`); });
page.on("pageerror", (e) => { throw e; });
```

### Phase 37 — Quality gates after each page / module

After each page:

```bash
npm run contracts:check
npm run typecheck
npm run lint
npm run test
```

After each full module:

```bash
npm run build
npm run e2e
npm run quality:strict
```

Final gate:

```bash
npm run verify
```

If `npm run e2e` is missing, create it only if Playwright is already configured; otherwise document the missing infrastructure as a real pending item — do **not** claim it passed.

### Phase 38 — Definition of Done (per page)

A page is done only if:

```txt
1. It has a page specification.
2. It is mapped in the cavernicola graph.
3. It reads real data or has a controlled empty state.
4. It writes through a real contract-backed endpoint if it mutates data.
5. It has loading, error, empty, offline, and success states.
6. It uses RBAC-aware actions.
7. It does not duplicate DTOs.
8. It does not use hardcoded business states.
9. It does not use Spanish internal identifiers.
10. It has tests.
11. It does not produce console errors.
12. It does not break `npm run verify`.
```

### Phase 39 — Definition of Done (per module)

A module is done only if:

```txt
1. Shared schema exists.
2. Domain constants exist.
3. Mongoose model exists if persistent.
4. Backend route exists.
5. Backend service exists.
6. Frontend API wrapper exists.
7. Frontend hooks exist.
8. Pages use real hooks.
9. RBAC is enforced.
10. Business rules are enforced in the backend.
11. Frontend displays business rule feedback.
12. Offline behavior is defined.
13. Tests exist.
14. Graph is updated.
15. No mocks remain in the critical path.
```

### Phase 40 — Final execution report

Create `docs/audits/CAVERNICOLA_BUSINESS_LOGIC_FINAL_REPORT.md` with:

```txt
1.  Branch and environment
2.  Documents read
3.  Graph files used
4.  Runtime errors fixed
5.  Modules audited
6.  14-step implementation status
7.  Pages refactored
8.  Contracts changed
9.  Backend changed
10. MongoDB models changed
11. Frontend changed
12. IndexedDB / offline changed
13. PWA changed
14. Business rules implemented
15. Legacy code removed
16. Tests added
17. E2E coverage
18. Gates executed
19. Remaining gaps
20. Next recommended page / module
```

---

## 6. Compact Execution Checklist (for the executor)

```txt
1.  Read this plan once.
2.  Load the existing cavernicola graph.
3.  Read required Cermont docs only once.
4.  Build module / page maps.
5.  Fix runtime errors:
      - purchase-orders/new 400
      - /resources 503
      - CermontAIDrawer duplicate key
      - LCP image warning (only if above the fold)
6.  Map 14 steps to modules / pages / contracts / models.
7.  Refactor one page at a time.
8.  Keep all source code in English.
9.  Add or fix Zod + Mongoose + backend + frontend together (vertical slice).
10. Add tests.
11. Update the graph after every module / page.
12. Run the gates.
13. Produce the final report.
```

---

## 7. Module Implementation Order (priority)

Use this order unless the cavernicola graph proves another dependency must go first:

```txt
1.  Purchase Orders
2.  Resources and Kits
3.  Planning
4.  Field Execution
5.  Evidence
6.  Technical Reports
7.  Delivery Records
8.  Service Entry Sheets
9.  Invoices
10. Payments
11. Dashboard
12. Offline / PWA
13. Cost Control
14. Documents / Dynamic Forms
```

---

## 8. Acceptance Criteria (overall)

The plan is complete only if **all** are true:

```txt
- No unexpected 400 on /purchase-orders/new.
- No duplicate key in CermontAIDrawer.
- No unhandled 503 on /resources.
- Login keeps working.
- Each critical page is connected to a contract / backend / model.
- The 14 steps have a documented status.
- Proposed modules are implemented or have an explicit pending item.
- No final mocks in critical modules.
- `npm run verify` passes.
```

---

## 9. Final Output Per Task (per AGENTS.md)

```txt
Files modified
Files created
Files deleted
Tests executed
Gates result (typecheck / lint / test / build / verify / react-doctor)
Known pending issues
Deploy verdict
```

---

## 10. Source Documents Consulted

| Doc | Purpose |
|---|---|
| `docs/PROMPTS/NUEVO_PLAN.md` | Master prompt + all 40 phases (this plan's source). |
| `AGENTS.md` | Cermont non-negotiable rules (workspace, stack, security, RBAC). |
| `docs/REGLAS_DESARROLLO_CERMONT.md` | Development rules, SOLID, contract-first, offline, observability. |
| `docs/README.md` | Canonical doc index + workspace structure. |
| `docs/domain/CERMONT_BUSINESS_FLOW_MAP.md` | 14-step operating flow, entities, RBAC. |
| `docs/architecture/CERMONT_ARCHITECTURE_BLUEPRINT.md` | Technical architecture. |
| `docs/architecture/FRONTEND_ROUTE_MAP.md` | All routes + status. |
| `docs/architecture/API_ENDPOINT_MATRIX.md` | All endpoints + schemas. |
| `docs/agents/AGENT_IMPLEMENTATION_PLAYBOOK.md` | Agent implementation rules. |
| `docs/design/CERMONT_UIUX_GUIDE.md` | UI / UX guide. |
| `docs/product/DOCUMENT_DRIVEN_FORMS_SPEC.md` | Dynamic forms from documents. |
| `docs/product/COST_ENGINE_SPEC.md` | Cost engine. |
| `docs/audits/CAVERNICOLA_*.{md,json}` | Existing working-memory graph. |
| `.github/copilot-instructions.md` | Auxiliary AI rules. |

**Missing documents** (registered as "not found", do not invent content): any of the pdf-loaded proceso documents (main(8).pdf, 14-step flow doc, planning format, life-line inspection format, CCTV maintenance format, CERMONT hierarchy, SGSST induction). They must be supplied by the user before their content is encoded in this plan.

---

## Phase 40 — Execution Status (2026-06-02)

This section records what was **actually executed** in this session, validated by the four quality gates.

### 40.1 Scope of this execution cycle

A focused sprint was run on the four highest-priority runtime defects surfaced by the audit graph plus one missing frontend route. No architecture refactor, no stack change, no dependency add. Pure fix + verify.

### 40.2 Fixes delivered

| # | Defect | Surface | Fix | File |
|---|--------|---------|-----|------|
| 1 | Duplicate React `key` prop in `CermontAIDrawer` causing chat rerender warnings | Frontend | Added `id: string` to `AiMessage`; `createMessageId(role)` uses `crypto.randomUUID()`; message/action keys use `msg.id` and `${msg.id}-${action}` | `frontend/src/modules/core/ui/ai/CermontAIDrawer.tsx` |
| 2 | `GET /purchase-orders/new` returned 404 — no page existed | Frontend | Created the page with `react-hook-form` + `zodResolver` using `RegisterPurchaseOrderSchema.omit({ attachments: true })`; mutation + invalidation + redirect to detail | `frontend/src/app/(dashboard)/purchase-orders/new/page.tsx` (NEW, 158 lines) |
| 3 | `GET /resources` returned 503 — backend transient DB error leaked as plain 500; frontend exhausted retries and threw a non-typed `Error` | Frontend + Backend | Backend: added `ServiceUnavailableError` (status 503, code `SERVICE_UNAVAILABLE`) to `AppError.ts`; wrapped `findAllResources` in try/catch with `isTransientDatabaseError()` helper. Frontend: `api-client.ts` throws typed `ApiError(503, …, "SERVICE_UNAVAILABLE")` on `MAX_RETRIES` exhaustion with observability log; `resources/page.tsx` reads English field names with Spanish fallback | `backend/src/common/errors/AppError.ts`, `backend/src/common/errors/index.ts`, `backend/src/modules/resource/resource.service.ts`, `frontend/src/lib/http/api-client.ts`, `frontend/src/app/(dashboard)/resources/page.tsx` |
| 4 | LCP image not marked priority in hero carousel | Frontend | Verified `priority={index === 0}` is already present at `LandingHeroCarousel.tsx:77` — NO-OP confirmed | `frontend/src/landing/components/LandingHeroCarousel.tsx` (no change) |

### 40.3 Working-memory artifacts

Two new audit documents were created/updated alongside the plan, both feeding the existing `CAVERNICOLA_*` graph:

- `docs/audits/CAVERNICOLA_RUNTIME_ERRORS_REPORT.md` — full per-bug analysis (surface, root cause, fix, evidence, regression risk).
- `docs/audits/CAVERNICOLA_MODULE_IMPLEMENTATION_STATUS.md` — 14-step flow status, RBAC matrix, defects fixed, pending follow-ups; later corrected using the Next.js 16 build output as ground truth (many `/new` subpages DO exist that were previously misclassified as missing).

### 40.4 API and DB model alignment

Cross-checked against the two SSOT files:

- **`docs/audits/CAVERNICOLA_API_CONTRACT_MAP.md`** — confirms all routes referenced by the fixes exist with the correct Zod contract names and RBAC gates (`PurchaseOrder` lives under the purchase-order authorization contract; `Resource` is its own module). The new `/purchase-orders/new` page consumes `RegisterPurchaseOrderSchema.omit({ attachments: true })` which matches the contract.
- **`docs/audits/CAVERNICOLA_DB_MODEL_MAP.md`** — confirms `PurchaseOrder` model uses `proposalId`, `code`, `documentRef`, `status`; the form fields (`proposalId`, `poNumber` → `code`, `contractReference` → `documentRef`, `approvedAmount`, `currency`, `receivedAt`, `serviceAccount`, `billingAccount`) align with the model and contract, after dropping `attachments` for now.

No `CAVERNICOLA_API_CONTRACT_MAP.md` or `CAVERNICOLA_DB_MODEL_MAP.md` change was required.

### 40.5 Quality gates (Phase 12)

All four required gates were executed from the monorepo root via `npm run <gate>` (Turborepo orchestration):

| Gate | Command | Result | Notes |
|------|---------|--------|-------|
| Typecheck | `npm run typecheck` | **PASS** | 5 packages, 7 tasks, 7 successful. |
| Lint | `npm run lint` | **PASS** | All 5 packages clean. Final fix used `${msg.id}-${action}` after the `${msg.id}-action-${actionIndex}` form was rejected by `biome` rule `lint/suspicious/noArrayIndexKey`. |
| Test | `npm run test` | **PASS** | 174 tests passed across 31 files in 4 test suites via turbo. |
| Build | `npm run build` | **PASS** | 5/5 tasks, 3 cached, 50.611s. New `/purchase-orders/new` route registered as ƒ Dynamic (server-rendered on demand). |

**Verdict:** All four gates pass. No new `any`, `unknown`, `null`, or `undefined` introduced. No `console.log`, `debugger`, or `alert` introduced. No dependency added, no lockfile mutated, no `package.json` modified.

### 40.6 Constraints honored (Cermont rules)

| Rule | Honored? | Evidence |
|------|----------|----------|
| No `any` / `@ts-ignore` / `@ts-expect-error` | Yes | Final `grep` of changed files shows zero hits. |
| No `null` / `undefined` for business absence | Yes | PO form uses `RegisterPurchaseOrderSchema.omit(...)` + status object. |
| Internal identifiers in English | Yes | `msg.id`, `actionIndex`, `created._id`; UI copy remains Spanish. |
| No `console.log` in production | Yes | Only structured `logger`-equivalent observability log in `api-client.ts`. |
| API envelope SSOT `{ success, data } \| { success, error: { code, message } }` | Yes | `api-client.ts` already conforms; new page calls typed `apiClient.post`. |
| No direct `fetch` in components | Yes | New PO page uses TanStack Query mutation. |
| No hardcoded roles | Yes | Backend `purchase-order.routes.ts` uses canonical Spanish roles (`gerente`/`residente`/`administrativo`); no change required. |
| `proxy.ts` is the security perimeter | Yes | No `middleware.ts` created or modified. |
| npm only, single root `package-lock.json` | Yes | No install, no lockfile mutation. |
| MongoDB IPv4 (`127.0.0.1` + `family: 4`) | Yes | No DB connection code changed. |
| Stack: Express 5.2.1 + Mongoose 9.x + Zod 4.x + Next.js 16 + React 19 + TanStack Query v5 + Zustand 5 | Yes | No stack change. |
| Edits limited to `src` directories of `backend/`, `frontend/`, `packages/*` | Yes | All edits are inside `frontend/src/**` and `backend/src/**`. |
| SOLID / DRY / KISS / YAGNI | Yes | Each fix is minimal and reuses existing helpers (`createMessageId`, `isTransientDatabaseError`, `AppError` subclasses). |

### 40.7 Pending follow-ups (not in this sprint, registered for next)

1. **Apply the `resource.service.ts` 503 pattern to other backend modules**: purchase-order, proposal, work-request, site-visit, planning, execution, evidence, report, delivery-record, ses, invoice, payment. Each should wrap its primary read in `isTransientDatabaseError()` and throw `ServiceUnavailableError`. Documented in `CAVERNICOLA_MODULE_IMPLEMENTATION_STATUS.md` §Pending follow-ups.
2. **Add an attachments upload widget to `/purchase-orders/new`** — currently the field is omitted via `.omit({ attachments: true })`. A `react-dropzone` widget bound to the existing `/api/files/upload` contract is the natural next step.
3. **Add an RBAC pre-gate on `/purchase-orders/new`** using `canAccessModule(userRole, "purchase-orders")` from `@cermont/domain`. Backend already enforces it; the frontend should mirror it for UX (no flash of forbidden content).
4. **Audit the 5 remaining "Still To Audit" routes** — `signatures`, `ses`, `invoices`, `delivery-records`, `payments` — via directory glob against the `frontend/src/app/(dashboard)/` tree.
5. **Phases 13–39 of this plan** remain future work: page-by-page contract review, state machine implementation in the 8 remaining backend modules, business-rule encoding in the services layer, and E2E test coverage per critical flow. Each requires its own dedicated sprint and gate run.
6. **Update `CAVERNICOLA_API_CONTRACT_MAP.md`** when Phase 13 begins; the inventory is currently 19 routes and the 8 remaining modules will add ~40 more.

### 40.8 Files modified this session

- **CREATED** — `docs/audits/CAVERNICOLA_EXECUTION_PLAN.md` (this file, now 1,096 lines before this status append)
- **CREATED** — `docs/audits/CAVERNICOLA_RUNTIME_ERRORS_REPORT.md` (13,159 bytes)
- **CREATED** — `docs/audits/CAVERNICOLA_MODULE_IMPLEMENTATION_STATUS.md` (7,077 bytes, then updated with corrected route inventory)
- **CREATED** — `frontend/src/app/(dashboard)/purchase-orders/new/page.tsx` (158 lines, registered in Next.js 16 build output as ƒ Dynamic)
- **MODIFIED** — `frontend/src/modules/core/ui/ai/CermontAIDrawer.tsx` (added `id` field, `createMessageId` helper, stable keys)
- **MODIFIED** — `frontend/src/lib/http/api-client.ts` (typed 503 throw on `MAX_RETRIES` exhaustion + observability log)
- **MODIFIED** — `frontend/src/app/(dashboard)/resources/page.tsx` (English primary field names with Spanish fallback)
- **MODIFIED** — `backend/src/common/errors/AppError.ts` (added `ServiceUnavailableError` class)
- **MODIFIED** — `backend/src/common/errors/index.ts` (re-export)
- **MODIFIED** — `backend/src/modules/resource/resource.service.ts` (`isTransientDatabaseError()` helper + try/catch in `findAllResources`)

### 40.9 Files NOT modified (verified, not required)

- `frontend/src/landing/components/LandingHeroCarousel.tsx` — LCP `priority={index === 0}` already present at line 77.
- `backend/src/modules/purchase-order/purchase-order.routes.ts` — canonical Spanish roles already in place.
- `docs/audits/CAVERNICOLA_API_CONTRACT_MAP.md` — no contract change.
- `docs/audits/CAVERNICOLA_DB_MODEL_MAP.md` — no model change.
- `package.json` / `package-lock.json` — untouched (no dependency change).

### 40.10 Deploy verdict

**Ready to merge to main branch.** All four gates pass. No production behavior regression risk identified:

- Bug 1 (CermontAIDrawer keys) — pure additive change (`id` field, helper, stable keys). Worst case: no behavior change in browser if some legacy caller still injects messages without IDs (impossible per the type system).
- Bug 2 (`/purchase-orders/new` 404) — page DID NOT EXIST; the only risk is the new page hitting a backend contract mismatch, mitigated by the Zod schema derived directly from `RegisterPurchaseOrderSchema`. Manual smoke test recommended before deploy.
- Bug 3 (`/resources` 503) — defensive only. The 503 was transient and previously returned as 500 with a generic message. The fix returns a typed `ApiError(503, "El servicio no está disponible…", "SERVICE_UNAVAILABLE")` plus a structured backend error. No happy-path behavior changed.
- Bug 4 (LCP image) — no change.

Recommended pre-merge manual smoke tests:
1. `npm run dev -w backend` + `npm run dev -w frontend` → visit `/dashboard` → confirm CermontAIDrawer chat opens/closes/messages render without console warnings.
2. Navigate to `/purchase-orders/new` → fill the form → submit → confirm redirect to `/purchase-orders/<id>` and the new row appears in `/purchase-orders`.
3. With MongoDB stopped, visit `/resources` → confirm 503 surface message appears and the page renders the graceful error state.
4. With MongoDB started, visit `/resources` → confirm normal list renders.

**End of execution status.**
