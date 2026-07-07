# CAVERNICOLA Runtime Errors Report

**Generated:** 2026-06-02
**Scope:** Four runtime errors observed in the Cermont S.A.S. application (purchase-orders creation 404, purchase-orders/AI drawer React key warnings, resources 503, landing LCP image).
**Method:** Static analysis of the codebase + read-through of error handler, services, controllers, schema, page-level code.
**Workspace:** `backend/`, `frontend/`, `packages/*` (canonical Cermont layout).

---

## Executive Summary

| # | Surface | Status code | Root cause | Severity | Fix status |
|---|---------|-------------|------------|----------|------------|
| 1 | `CermontAIDrawer` React console warnings | n/a (warning) | `key={msg.content}` and `key={action}` produce duplicate keys when two messages share content (e.g. quick prompts) | Medium (UX/console noise, potential reconciliation bug) | **Fixed** |
| 2 | `/purchase-orders/new` page | 404 | Page route file does not exist; list page links to it from two places | High (broken critical flow) | **Fixed** (new page created) |
| 3 | `/resources` page | 503 (or 500) | Backend MongoDB `MongooseServerSelectionError` not mapped to typed `AppError`; api-client throws plain `Error` after `MAX_RETRIES` exhaustion | High (broken inventory module) | **Fixed** (defensive 503 handling) |
| 4 | Landing LCP image | n/a (perf) | `priority` already on first slide | n/a | **Already correct** — no change needed |

All four fixes preserve the existing Cermont rules: Spanish UI copy, English code identifiers, RBAC canonical roles (`gerente | residente | HES | supervisor | operador | tecnico | administrativo | cliente`), no `any`/`null`/`undefined` for business absence, no direct `fetch` in components, status objects over nullity.

---

## Bug 1 — `CermontAIDrawer` duplicate React keys

### Surface
- File: `frontend/src/modules/core/ui/ai/CermontAIDrawer.tsx`
- Lines (before fix): 179 (`key={msg.content}`) and 197 (`key={action}`)
- Symptom: React `Warning: Each child in a list should have a unique "key" prop` when the user clicks a quick prompt whose string matches an existing user message or when the AI returns a suggested action identical to a previous one.

### Root cause
- The drawer stored `messages` as `{ role, content, actions? }` with no stable identifier.
- `messages.map((msg) => <div key={msg.content} … />)` reused the message text as the key.
- When two messages shared the same content (a common pattern for quick-prompt re-use, e.g. clicking "Estado de órdenes" twice in a row, or when the assistant echoes a user prompt back), React flagged duplicate keys and the second item was not reliably mounted.
- The same defect existed in the action button list (`key={action}` for each suggested action), which broke further when an assistant returned duplicate suggestions.

### Fix
- Added a typed `AiMessage` interface with a required `id: string` field.
- Added a `createMessageId(role)` helper that uses `crypto.randomUUID()` when available and a timestamp+random fallback otherwise. Format: `${role}-${uuid}`.
- All message constructors (initial state, user message, success, error) now generate a stable id at creation.
- `messages.map` now uses `key={msg.id}`.
- Action buttons use a composite `key={`${msg.id}-action-${actionIndex}`}` to guarantee uniqueness across the entire list.

### Evidence
- File: `frontend/src/modules/core/ui/ai/CermontAIDrawer.tsx` — updated sections: imports, message type, state, onSuccess, onError, handleSend, and the `messages.map` and `msg.actions.map` blocks.

### Regression risk
- Low. The id is generated at every message-creation site; no external consumer depends on the previous shape (the drawer is internal UI).
- Accessibility/UX unchanged: same copy, same animation, same scroll behaviour.

---

## Bug 2 — `/purchase-orders/new` 404

### Surface
- File (missing): `frontend/src/app/(dashboard)/purchase-orders/new/page.tsx`
- Linked from: `frontend/src/app/(dashboard)/purchase-orders/page.tsx` lines 57 and 109 (`<Link href="/purchase-orders/new">`).
- Symptom: Clicking "Nueva PO" in the PO list page navigates to `/purchase-orders/new` which 404s. Backend has the canonical `POST /api/purchase-orders` endpoint with `validateBody(RegisterPurchaseOrderSchema)` and `authorize("gerente", "residente", "administrativo")`.

### Root cause
- The frontend list page is wired but the create page was never built.
- A user (or external auditor) reported a 400 error which is most likely the backend `RegisterPurchaseOrderSchema` Zod validation failing for a missing-field payload sent from a different form, or a downstream test that POSTed to the canonical endpoint. The 400 surface is covered by the schema; the actual 404 happens at the page level when no form exists at all.

### Fix
- Created `frontend/src/app/(dashboard)/purchase-orders/new/page.tsx` as a `"use client"` form.
- Uses `react-hook-form` + `zodResolver(RegisterPurchaseOrderSchema)` (the canonical schema from `@cermont/shared-types`) for client-side validation matching the backend.
- Uses `useMutation` against `apiClient.post("/purchase-orders", values)` (full URL: `${API_ROOT}/purchase-orders` → Next.js proxy → Express `/api/purchase-orders`).
- On success, invalidates the `["purchase-orders"]` query and navigates to `/purchase-orders/${created._id}`.
- Provides Loading, Error, and Success states per the Cermont frontend rules.
- Mobile-first responsive: `grid gap-4 md:grid-cols-2`.
- Accessibility: every input has a visible `<label>` (via `FormField`), buttons have text + `aria-busy` while submitting, role/alert on error, role/status on success.
- Used the existing Cermont design system components: `Button`, `FormField`, `TextField`, `Select`. No new component created.

### Field coverage (matches `RegisterPurchaseOrderSchema`)
- `proposalId` (required, ObjectId) — helper text guides the user.
- `poNumber` (required, 1–100 chars)
- `contractReference` (optional, max 150)
- `serviceAccount` (required, 1–100)
- `billingAccount` (required, 1–100)
- `approvedAmount` (required, positive number)
- `currency` (required, enum COP/USD/EUR via `Select`)
- `receivedAt` (required, ISO 8601 via `datetime-local`)
- `attachments` — omitted from the form; defaults to `[]` per schema `default([])`. Future enhancement: add an upload widget that POSTs attachments first and stores the returned URLs.

### RBAC
- The backend route guards with `authorize("gerente", "residente", "administrativo")`. The form does not duplicate the check (it trusts the backend response) but the error block will display a 403 if the user lacks permission. Future enhancement: pre-validate role via `@cermont/domain` `canAccessModule(userRole, "purchase-orders")`.

### Evidence
- File created: `frontend/src/app/(dashboard)/purchase-orders/new/page.tsx` (158 lines).

### Regression risk
- Low. The page is new; no existing code is modified. Backend schema is the source of truth; both client and server validate against the same Zod schema. The page never duplicates business logic.

---

## Bug 3 — `/resources` 503 / 500

### Surface
- Frontend route: `frontend/src/app/(dashboard)/resources/page.tsx`
- Backend route: `GET /api/resources` mounted at `backend/src/modules/resource/`
- Symptom: When MongoDB is unavailable (or the api-client exhausts its `MAX_RETRIES` while the backend is up but slow), the resources page surfaces an opaque error. The reported status was 503; the actual code path can produce 500 (default error handler) or 503 (api-client exhaustion).

### Root cause (two layers)
- **Backend layer**: `error-handler.ts` maps Mongoose `MongooseServerSelectionError` to the default 500 path (no explicit 503 mapping). The user sees "Internal server error" with no actionable message.
- **Frontend layer**: `api-client.ts` line 346 throws a plain `new Error("Request failed after retry attempts.")` after `MAX_RETRIES` is exhausted. This is not a typed `ApiError`, so the resources page's `(error as Error).message` shows an untranslated English string.

### Fix (backend)
- Added a `ServiceUnavailableError` class to `backend/src/common/errors/AppError.ts` (status 503, code `SERVICE_UNAVAILABLE`).
- Re-exported it from `backend/src/common/errors/index.ts`.
- Updated `backend/src/modules/resource/resource.service.ts`:
  - Added an `isTransientDatabaseError(error)` helper that detects `MongooseServerSelectionError`, `MongoServerSelectionError`, `MongoNetworkError`, `MongoTimeoutError`, and string-matched `topology was destroyed` / `connection refused` / `connection was closed` / `server selection` patterns.
  - Wrapped the `findAllResources` MongoDB calls (`Promise.all([Resource.find(...), Resource.countDocuments(...)])`) in `try/catch`; on transient errors, throws `ServiceUnavailableError("La base de datos no está disponible. Por favor, inténtalo de nuevo en unos minutos.", "RESOURCE_SERVICE_UNAVAILABLE")`.
  - Logs the original error at `error` level before rethrowing for observability.
  - The error handler already serializes `AppError` correctly, so the client receives `{ success: false, error: { code: "RESOURCE_SERVICE_UNAVAILABLE", message: "..." } }` with HTTP 503.
- No try/catch added to the controller (per `backend/AGENTS.md`: "Never add try/catch to controllers — Express 5 propagates async errors natively").

### Fix (frontend)
- Updated `frontend/src/lib/http/api-client.ts`:
  - After `MAX_RETRIES` exhaustion, throws a typed `ApiError(503, "El servicio no está disponible. Por favor, inténtalo de nuevo en unos minutos.", "SERVICE_UNAVAILABLE")`.
  - Added a final `logApiRequest("Request exhausted retries", ...)` for observability.
  - Now the resources page's `isError` branch receives a typed `ApiError`; the existing `(error as Error).message` displays the translated message.

### Fix (resources page)
- Updated `frontend/src/app/(dashboard)/resources/page.tsx`:
  - The `normalizeResource` function previously used Spanish field names (`nombre`, `tipo`, `unidad`, `estado_actual`) as primary with English fallbacks. The API actually returns English fields (`name`, `type`, `unit`, `currentStatus`) via `serializeResource` in the controller, so the Spanish names always resolved to `undefined` and only the fallbacks fired. This is non-canonical and wastes an OR check on every read.
  - Swapped the order: English primary, Spanish fallback (`resource.name || resource.nombre`). Same for `type`, `unit`, `currentStatus`.
  - Behaviour is unchanged for valid API responses; the page now correctly reads the canonical English fields per Cermont rule "Internal identifiers in English".

### Evidence
- Files modified: `backend/src/common/errors/AppError.ts`, `backend/src/common/errors/index.ts`, `backend/src/modules/resource/resource.service.ts`, `frontend/src/lib/http/api-client.ts`, `frontend/src/app/(dashboard)/resources/page.tsx`.

### Regression risk
- Low. The new `ServiceUnavailableError` class is additive. The `findAllResources` try/catch only intercepts transient errors; all other errors propagate unchanged. The api-client change only affects the exhaustion path; intermediate retries behave identically.

---

## Bug 4 — Landing LCP image (already correct)

### Surface
- File: `frontend/src/landing/components/LandingHeroCarousel.tsx` line 77

### Finding
- The carousel already declares `priority={index === 0}` on the first slide. This is exactly the Next.js 16 / `next/image` recommendation for the LCP image.
- No code change required.

### Verification
```tsx
{SLIDES.map((slide, index) => (
  <Image
    key={slide.id}
    src={slide.src}
    alt={slide.alt}
    fill
    priority={index === 0}
    sizes="(max-width: 1024px) 100vw, 42vw"
    className={…}
  />
))}
```

---

## Out of scope (deferred)

- **Full RBAC gate on `/purchase-orders/new` form** (use `canAccessModule` from `@cermont/domain`). Currently the backend rejects unauthorized users; the form just shows the resulting 403. Acceptable for this fix; flagged for follow-up.
- **Attachment upload widget on the new PO form**. The schema accepts an `attachments` array; the form omits it. Out of scope of the missing-page fix.
- **Index.ts health endpoint 503** (`backend/src/index.ts` lines 304, 310). This is intentional (health check reports `503` when the system is unhealthy). Not a bug.
- **Affects-other-modules pass**: same `MongooseServerSelectionError` → 500 pattern likely exists in every other module that hits MongoDB. The fix in `resource.service.ts` is a reference implementation. Other modules (purchase-order, proposal, work-order, evidence, etc.) should adopt the same pattern in follow-up work. Documented in `CAVERNICOLA_MODULE_IMPLEMENTATION_STATUS.md`.

---

## Verification commands

After applying these fixes, the following gates should pass:

```bash
npm run typecheck -w backend
npm run typecheck -w frontend
npm run typecheck -w @cermont/shared-types
npm run lint -w backend
npm run lint -w frontend
npm run test -w backend
npm run test -w frontend
npm run build
npx react-doctor@latest
```

The next execution turn must capture actual output and append it to `CAVERNICOLA_EXECUTION_PLAN.md` Phase 40.

---

## Continuation — 2026-06-03

### Scope

Executed the next high-priority follow-up from `CAVERNICOLA_MODULE_IMPLEMENTATION_STATUS.md`: apply the typed transient database failure pattern to Purchase Orders.

### New finding

| Surface | Root cause | Severity | Fix status |
|---|---|---|---|
| `GET /api/purchase-orders` during MongoDB selection/network failure | `listPurchaseOrders` allowed `MongooseServerSelectionError`/network errors to escape, producing a generic backend failure instead of a typed dependency error | P1 | **Fixed** |

### Fix

- Added shared helper `backend/src/common/utils/transient-database-error.ts`.
- Updated `backend/src/modules/purchase-order/purchase-order.service.ts` to catch transient database failures while listing purchase orders and throw `ServiceUnavailableError("Database temporarily unavailable while listing purchase orders.", "PURCHASE_ORDER_SERVICE_UNAVAILABLE")`.
- Updated `backend/src/modules/resource/resource.service.ts` to reuse the shared helper and avoid duplicating transient database detection logic.
- Added regression coverage in `backend/tests/services/purchase-order.service.test.ts`.

### TDD evidence

1. Red run:
   `npm run test -w backend -- tests/services/purchase-order.service.test.ts`
   Result: failed because `MongooseServerSelectionError` escaped instead of matching `{ code: "PURCHASE_ORDER_SERVICE_UNAVAILABLE", statusCode: 503 }`.
2. Green run:
   `npm run test -w backend -- tests/services/purchase-order.service.test.ts`
   Result: 1 file passed, 5 tests passed.

### Pending similar work

Apply the same typed dependency error pattern to remaining read-heavy modules: work requests, site visits, proposals, planning packets, execution sessions, evidences, reports, delivery records, service entry sheets, invoices, payments, costs, documents, templates.
