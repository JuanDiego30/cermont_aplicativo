# CAVERNICOLA Module Acceptance Criteria

**Generated:** 2026-06-03  
**Rule:** A module is accepted only when contract, backend, frontend, tests, docs, and gates align.

---

## Purchase Orders

Business problem solved: formal client PO approval gates planning/work-order creation.

Required roles: `gerente`, `residente`, `administrativo` for mutation; authenticated users for read when authorized by route policy.

Required pages: `/purchase-orders`, `/purchase-orders/new`, `/purchase-orders/[id]`.

Required endpoints: `GET /api/purchase-orders`, `GET /api/purchase-orders/:id`, `POST /api/purchase-orders`, `POST /api/purchase-orders/:id/validate`, `POST /api/purchase-orders/:id/reject`.

Required schemas/models: `RegisterPurchaseOrderSchema`, `ValidatePurchaseOrderSchema`, `RejectPurchaseOrderSchema`, `ListPurchaseOrdersQuerySchema`, `PurchaseOrder.ts`.

Acceptance criteria:

1. Frontend never posts to `/purchase-orders/new`.
2. Backend rejects PO creation if proposal is not approved.
3. Backend rejects duplicate active PO for the same proposal.
4. List endpoint maps transient MongoDB failures to `PURCHASE_ORDER_SERVICE_UNAVAILABLE`.
5. Create form uses shared schema and shows validation/API errors.
6. Attachment upload is either implemented or explicitly pending.
7. Tests cover invalid proposal, duplicate PO, validation, and transient DB failure.

Known gaps:

- Attachment upload widget is pending.
- Frontend RBAC pre-gate is pending.

---

## Resources and Kits

Business problem solved: avoid missing tools/equipment/materials/EPP during planning and execution.

Required roles: `gerente`, `residente`, `hes`, `supervisor` manage; field roles read.

Required pages: `/resources`, `/resources/[id]`, `/resources/kits`, `/resources/kits/new`.

Required endpoints: `GET/POST/PATCH/DELETE /api/resources`, `GET/POST/PATCH/DELETE /api/resources/kits`, `GET /api/kits/templates`.

Required schemas/models: `ResourceSchema`, `CreateResourceSchema`, `UpdateResourceSchema`, `KitSchema`, `ToolSchema`, `Resource.ts`, `Kit.ts`, `Tool.ts`, `MaintenanceKit.ts`.

Acceptance criteria:

1. User can list tools, equipment, materials, and safety items.
2. Resource list never returns an untyped 500/503 on transient DB failure.
3. User can create/version a kit from resources where the backend route supports it.
4. Planning can select kits/resources.
5. Execution checklist receives planned resource requirements.
6. Images/gallery use `FileAssetRef` contracts when implemented.
7. Read catalog can be cached for offline field use.
8. Tests cover schema, service, list page, and planning integration.

Known gaps:

- Full `/resources/kits/new` spec and tests pending.

---

## Planning

Business problem solved: ensure scope, schedule, labor, tools, equipment, materials, EPP, certifications, AST, and support docs are complete before execution.

Acceptance criteria:

1. Cannot approve planning without labor/resource minimums.
2. Cannot approve if certification-required equipment lacks certification status.
3. Planning generates execution checklist requirements.
4. Page shows blockers, offline/read-cache status, and audit trail.

Known gaps: full page audit pending.

---

## Field Execution and Evidence

Business problem solved: execution in field with checklist, AST, permits, verified resources, evidence, and offline resilience.

Acceptance criteria:

1. No execution without approved planning.
2. Required tools/equipment/checklist/evidence must be completed before finalization.
3. Offline evidence uses blob outbox and idempotency.
4. Before/during/after evidence categories are traceable to reports.

Known gaps: offline E2E coverage pending.

---

## Administrative Close: Reports, Delivery, SES, Invoices, Payments

Business problem solved: reduce delays in reports, actas, SES/Ariba, invoicing, invoice approval, payment, and final closure.

Acceptance criteria:

1. No technical report without completed execution and required evidence.
2. No delivery record without approved technical report.
3. No SES without accepted/signed delivery record.
4. No invoice without approved SES.
5. No payment/final closure without approved invoice and support documents.
6. All mutations have audit trail and typed errors.

Known gaps: module-by-module service audit pending.
