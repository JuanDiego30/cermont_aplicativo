# CAVERNICOLA Module Implementation Status

**Generated:** 2026-06-02
**Purpose:** Cross-reference the 14-step business flow, the 9 documented modules, and the 8 RBAC roles against what is actually implemented in the codebase. Used to drive remediation priorities.

---

## 14-Step Business Flow Status

| # | Step | Frontend route | Backend module | Status | Notes |
|---|------|----------------|----------------|--------|-------|
| 1 | Work request | `/work-requests` | `work-request` | ⏳ Audit pending | |
| 2 | Site visit | `/site-visits` | `site-visit` | ⏳ Audit pending | |
| 3 | Proposal | `/proposals` | `proposal` | ⏳ Audit pending | |
| 4 | Purchase order | `/purchase-orders`, `/purchase-orders/new`, `/purchase-orders/[id]` | `purchase-order` | ✅ Endpoint OK; page list OK; page detail OK; **page `/new` JUST CREATED** | Frontend create mutation needs follow-up to handle attachments |
| 5 | Planning | `/planning` | `planning` | ⏳ Audit pending | |
| 6 | Execution | `/execution` | `execution` | ⏳ Audit pending | |
| 7 | Evidence | `/evidences` | `evidence` | ⏳ Audit pending | |
| 8 | Technical report | `/reports` | `report` | ⏳ Audit pending | |
| 9 | Delivery record | `/delivery-records` | `delivery-record` | ⏳ Audit pending | |
| 10 | Client signature | `/signatures` | `signature` | ⏳ Audit pending | |
| 11 | SES / Ariba | `/ses` | `service-entry-sheet` | ⏳ Audit pending | |
| 12 | Invoice | `/invoices` | `invoice` | ⏳ Audit pending | |
| 13 | Invoice approval | `/invoices/approvals` | `invoice-approval` | ⏳ Audit pending | |
| 14 | Payment | `/payments` | `payment` | ⏳ Audit pending | |

---

## Frontend Routes — Verified Existing (per Next.js 16 build output 2026-06-02)

- `/` (landing)
- `/login`, `/register`, `/forgot-password`, `/reset-password`, `/unauthorized`
- `/(dashboard)/dashboard`
- `/(dashboard)/orders`, `/(dashboard)/orders/kanban`
- `/(dashboard)/orders/[id]`
- `/(dashboard)/maintenance`
- `/(dashboard)/evidences`
- `/(dashboard)/proposals`, `/(dashboard)/proposals/[id]`, `/(dashboard)/proposals/new`
- `/(dashboard)/costs`
- `/(dashboard)/documents`
- `/(dashboard)/reports`, `/(dashboard)/reports/[id]`, `/(dashboard)/reports/archive`
- `/(dashboard)/resources`, `/(dashboard)/resources/[id]`, `/(dashboard)/resources/kits`, `/(dashboard)/resources/kits/new`
- `/(dashboard)/users` (admin)
- `/(dashboard)/purchase-orders`, `/(dashboard)/purchase-orders/[id]`, `/(dashboard)/purchase-orders/new` (CREATED 2026-06-02)
- `/(dashboard)/planning`, `/(dashboard)/execution`
- `/(dashboard)/service-cases`, `/(dashboard)/service-cases/[id]`
- `/(dashboard)/site-visits`, `/(dashboard)/site-visits/[id]`, `/(dashboard)/site-visits/new`
- `/(dashboard)/work-requests`, `/(dashboard)/work-requests/[id]`, `/(dashboard)/work-requests/new`
- `/(dashboard)/templates`, `/(dashboard)/templates/[id]`
- `/(dashboard)/profile`

---

## Frontend Routes — Still To Audit

- `/(dashboard)/signatures` (Step 10)
- `/(dashboard)/ses` (Step 11)
- `/(dashboard)/invoices`, `/(dashboard)/invoices/approvals` (Steps 12–13)
- `/(dashboard)/delivery-records` (Step 9)
- `/(dashboard)/payments` (Step 14)

These are not yet confirmed by the build output and need a directory glob to verify existence.

---

## Backend Modules — Status

| Module | Path | CRUD endpoints | RBAC | Service layer | Validation | Notes |
|--------|------|----------------|------|---------------|------------|-------|
| `auth` | `backend/src/modules/auth/` | ✅ | ✅ | ✅ | ✅ | JWT + refresh |
| `user` | `backend/src/modules/user/` | ✅ | ✅ | ✅ | ✅ | |
| `work-request` | `backend/src/modules/work-request/` | ⏳ | ⏳ | ⏳ | ⏳ | |
| `site-visit` | `backend/src/modules/site-visit/` | ⏳ | ⏳ | ⏳ | ⏳ | |
| `proposal` | `backend/src/modules/proposal/` | ✅ | ✅ | ✅ | ✅ | |
| `purchase-order` | `backend/src/modules/purchase-order/` | ✅ | ✅ | ✅ | ✅ | `INTERNAL_ROLES` from `@cermont/domain`; canonical Spanish roles `gerente | residente | HES | supervisor | operador | tecnico | administrativo | cliente` |
| `planning` | `backend/src/modules/planning/` | ⏳ | ⏳ | ⏳ | ⏳ | |
| `execution` | `backend/src/modules/execution/` | ⏳ | ⏳ | ⏳ | ⏳ | |
| `evidence` | `backend/src/modules/evidence/` | ⏳ | ⏳ | ⏳ | ⏳ | |
| `report` | `backend/src/modules/report/` | ⏳ | ⏳ | ⏳ | ⏳ | |
| `delivery-record` | `backend/src/modules/delivery-record/` | ⏳ | ⏳ | ⏳ | ⏳ | |
| `service-entry-sheet` | `backend/src/modules/service-entry-sheet/` | ⏳ | ⏳ | ⏳ | ⏳ | |
| `invoice` | `backend/src/modules/invoice/` | ⏳ | ⏳ | ⏳ | ⏳ | |
| `payment` | `backend/src/modules/payment/` | ⏳ | ⏳ | ⏳ | ⏳ | |
| `resource` | `backend/src/modules/resource/` | ✅ | ✅ | ✅ (now with 503 fallback) | ✅ | **FIXED 2026-06-02** — `ServiceUnavailableError` |
| `kit` | `backend/src/modules/kit/` | ✅ | ✅ | ✅ | ✅ | |
| `cost` | `backend/src/modules/cost/` | ⏳ | ⏳ | ⏳ | ⏳ | |

---

## RBAC — Canonical Roles (verified)

```
gerente | residente | HES | supervisor | operador | tecnico | administrativo | cliente
```

- SSOT: `packages/domain/` (exposes `INTERNAL_ROLES` and helpers `canAccessModule`, `canAccessRoute`).
- Backend routes use `authorize(...INTERNAL_ROLES)` for read endpoints and explicit role tuples for write endpoints.
- Frontend `proxy.ts` is the security perimeter; never use `middleware.ts`.
- **Do not hardcode role strings**; always import from `@cermont/domain`.

---

## Known Defects — Fixed This Session (2026-06-02)

1. **`CermontAIDrawer` duplicate React keys** — stable `id: string` added.
2. **`/purchase-orders/new` 404** — page created with form, mutation, and full state handling.
3. **`/resources` 503 / 500** — backend `ServiceUnavailableError` + api-client typed exhaustion.
4. **Landing LCP** — already correct (`priority={index === 0}`).

Full details: `docs/audits/CAVERNICOLA_RUNTIME_ERRORS_REPORT.md`.

---

## Pending Defects (high-level)

- All non-resource backend modules still throw 500 on `MongooseServerSelectionError` instead of 503. Apply the `resource.service.ts` pattern to:
  - `purchase-order` (highest priority — used by Step 4)
  - `proposal` (Step 3 → Step 4 gate)
  - `work-request`, `site-visit`, `planning`, `execution`, `evidence`, `report`, `delivery-record`, `ses`, `invoice`, `payment`
- `frontend/src/lib/http/api-client.ts` `handleNetworkError` still throws the original error on the last retry before the typed exhaustion is added. Acceptable but can be tightened.
- All non-purchase-orders frontend pages that link to a `/new` subpage need the same audit. Quick scan:
  - `/work-requests` → has `/new`? `/(dashboard)/work-requests/new/page.tsx` exists? ⏳
  - `/proposals` → `/new`? ⏳
  - `/resources` → `/new`? ⏳
  - `/evidences` → `/new`? ⏳

---

## Gates to Run After Fixes

```bash
npm run typecheck
npm run lint
npm run test
npm run build
npm run verify
npx react-doctor@latest
```

Capture output and append to `CAVERNICOLA_EXECUTION_PLAN.md` Phase 40.

---

## Continuation Status — 2026-06-03

### Verified route/module inventory

Current route glob confirms these previously "Still To Audit" surfaces now have route files:

- `/delivery-records` and `/delivery-records/[id]`
- `/billing/ses` and `/billing/ses/[id]`
- `/billing/invoices` and `/billing/invoices/[id]`
- `/payments` and `/payments/[id]`

No standalone `/(dashboard)/signatures` route was found. Signature behavior is represented through delivery record detail/actions.

### New docs created

- `docs/audits/CAVERNICOLA_EXTERNAL_REFERENCES.md`
- `docs/audits/CAVERNICOLA_WORKSPACE_INTEGRATION_REPORT.md`
- `docs/audits/CAVERNICOLA_PAGE_SPECIFICATIONS.md`
- `docs/audits/CAVERNICOLA_PAGE_TO_CONTRACT_MATRIX.md`
- `docs/audits/CAVERNICOLA_PAGE_TO_BUSINESS_RULES_MATRIX.md`
- `docs/audits/CAVERNICOLA_BUSINESS_MODULE_BLUEPRINT.md`
- `docs/audits/CAVERNICOLA_PAGE_REFACTOR_SEQUENCE.md`
- `docs/audits/CAVERNICOLA_MODULE_ACCEPTANCE_CRITERIA.md`

### New code fix

| Module | Previous status | New status |
|---|---|---|
| `purchase-order` | CRUD/RBAC/validation implemented; transient DB failure pattern pending | List endpoint now maps transient MongoDB failures to `PURCHASE_ORDER_SERVICE_UNAVAILABLE` with HTTP 503 |
| `resource` | Typed 503 pattern implemented locally | Uses shared `isTransientDatabaseError` helper |

### Remaining high-priority defects

1. Apply typed transient DB failure handling to all remaining read-heavy modules.
2. Add `/purchase-orders/new` attachment upload widget backed by `/api/files/upload`.
3. Add frontend RBAC pre-gate for `/purchase-orders/new`.
4. Audit `/resources/kits/new` as the next Resources/Kits page.
5. Run full gates and React Doctor after this continuation sprint.
