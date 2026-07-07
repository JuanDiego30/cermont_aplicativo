# CAVERNICOLA Page Specifications

**Generated:** 2026-06-03  
**Status:** Living specification. Each page must be checked before refactor.  
**Rule:** Do not edit a page until its row has a page -> hook -> endpoint -> schema -> model path.

---

## Critical Page Specs

| Page | Module | Step | Reads | Writes | Endpoint(s) | Schema | Model | Offline | Status |
|---|---|---:|---|---|---|---|---|---|---|
| `/work-requests` | Work Requests | 1 | Work request list | None | `GET /api/work-requests` | `WorkRequestListResponseSchema` | `WorkRequest` | Read cache expected | Implemented, audit pending |
| `/work-requests/new` | Work Requests | 1 | User/session | Work request | `POST /api/work-requests` | `CreateWorkRequestSchema` | `WorkRequest`, `ServiceCase` | Queue allowed for intake only when authenticated | Implemented, audit pending |
| `/site-visits` | Site Visits | 2 | Visit list | None | `GET /api/site-visits` | `ListSiteVisitsQuerySchema` | `SiteVisit` | Read cache expected | Implemented, audit pending |
| `/site-visits/new` | Site Visits | 2 | Work request/service context | Visit | `POST /api/site-visits` | `CreateSiteVisitSchema` | `SiteVisit` | Field capture should degrade gracefully | Implemented, audit pending |
| `/proposals` | Proposals | 3 | Proposal list | None | `GET /api/proposals` | `ListProposalsQuerySchema` | `Proposal` | Read cache useful | Implemented, audit pending |
| `/proposals/new` | Proposals | 3 | Work request/site visit context | Proposal draft | `POST /api/proposals` | `CreateProposalSchema` | `Proposal` | Draft offline support pending | Implemented, local form-schema review needed |
| `/purchase-orders` | Purchase Orders | 4 | PO list | None | `GET /api/purchase-orders` | `ListPurchaseOrdersQuerySchema` | `PurchaseOrder` | Online only | Implemented |
| `/purchase-orders/new` | Purchase Orders | 4 | Approved proposal context | PO authorization | `POST /api/purchase-orders` | `RegisterPurchaseOrderSchema` | `PurchaseOrder` | Online only | Implemented; attachments and frontend RBAC pending |
| `/planning` | Planning Packets | 5 | Planning packet list | None | `GET /api/planning-packets` | `ListPlanningPacketsQuerySchema` | `PlanningPacket` | Read cache expected | Implemented, audit pending |
| `/execution` | Field Execution | 6 | Execution sessions | Execution state actions | `GET /api/execution-sessions`, action endpoints | `ExecutionSessionSchema` | `ExecutionSession` | Required | Implemented, audit pending |
| `/evidences` | Evidence | 7 | Orders, evidence list | Evidence upload/metadata | `GET/POST /api/evidences` | `EvidenceSchema`, file schemas | `Evidence`, `FileAsset` | Required with blob outbox | Implemented, audit pending |
| `/reports` | Technical Reports | 8 | Report list | Report generation/update | `GET/POST /api/reports` | `TechnicalReportSchema`, `ReportSchema` | `TechnicalReport`, `Report` | Server generation only | Implemented, audit pending |
| `/delivery-records` | Delivery Records | 9 | Delivery records | Send/sign/reject/cancel through detail/actions | `GET /api/delivery-records` | `ListDeliveryRecordsQuerySchema` | `DeliveryRecord` | Online only | Implemented; graph node exists |
| `/billing/ses` | Service Entry Sheets | 10-11 | SES list | Create/submit/approve/reject via hooks | `GET/POST /api/service-entry-sheets` | `ServiceEntrySheetSchema` | `ServiceEntrySheet` | Online only | Implemented, audit pending |
| `/billing/invoices` | Invoices | 12-13 | Invoice list | Submit/approve/reject via hooks | `GET/POST /api/invoices` | `InvoiceSchema` | `Invoice` | Online only | Implemented, audit pending |
| `/payments` | Payments | 14 | Payment list | Reconcile/reject via hooks | `GET/POST /api/payments` | `PaymentSchema` | `Payment` | Online only | Implemented, audit pending |
| `/resources` | Resources and Kits | 5-6 support | Resource catalog | None on list page | `GET /api/resources` | `ResourceSchema` | `Resource` | Read cache expected | Implemented; typed 503 pattern present |
| `/resources/kits` | Resources and Kits | 5-6 support | Kit list | Delete/deactivate kit | `GET/DELETE /api/resources/kits` | `KitSchema`, `MaintenanceKitSchema` | `Kit`, `MaintenanceKit` | Read cache expected | Implemented, audit pending |

---

## Required UI States Per Critical Page

Every page above must expose:

- Loading state: skeleton or scoped spinner.
- Error state: typed error message and retry action when safe.
- Empty state: business-specific next action.
- Offline state: network status plus disabled server-only actions.
- Success state: mutation feedback or post-action route/state change.

---

## Known Immediate Page Gaps

| Page | Gap | Priority |
|---|---|---|
| `/purchase-orders/new` | No attachment upload widget bound to `/api/files/upload`; backend supports attachments shape | P1 |
| `/purchase-orders/new` | Frontend relies on backend 403 instead of RBAC pre-gate | P2 |
| `/proposals/new` | Local form schema must be reconciled with shared `CreateProposalSchema` | P1 |
| `/resources/kits/new` | Needs full page spec before further feature work | P1 |
| `/execution` and `/evidences` | Offline behavior must be verified against IndexedDB stores and outbox contracts | P0 for field readiness |
