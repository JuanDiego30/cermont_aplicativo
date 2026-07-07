# CAVERNICOLA Page To Contract Matrix

**Generated:** 2026-06-03  
**Purpose:** Map user-facing routes to contract-backed API surfaces.

| Route | Frontend entry | Hook/API layer | Backend route | Shared contract | Persistence |
|---|---|---|---|---|---|
| `/work-requests` | `frontend/src/app/(dashboard)/work-requests/page.tsx` | `frontend/src/modules/work-requests/queries.ts` | `backend/src/modules/work-requests/*` | `work-request.schema.ts` | `WorkRequest.ts`, `ServiceCase.ts` |
| `/work-requests/new` | `frontend/src/app/(dashboard)/work-requests/new/page.tsx` | `frontend/src/modules/work-requests/queries.ts` | `POST /api/work-requests` | `CreateWorkRequestSchema` | `WorkRequest.ts` |
| `/site-visits` | `frontend/src/app/(dashboard)/site-visits/page.tsx` | `frontend/src/modules/site-visits/queries.ts` | `backend/src/modules/site-visit/*` | `site-visit.schema.ts` | `SiteVisit.ts` |
| `/proposals` | `frontend/src/app/(dashboard)/proposals/page.tsx` | `frontend/src/modules/proposals/queries.ts` | `backend/src/modules/proposal/*` | `proposal.schema.ts` | `Proposal.ts` |
| `/purchase-orders` | `frontend/src/app/(dashboard)/purchase-orders/page.tsx` | `frontend/src/modules/purchase-orders/queries.ts` | `backend/src/modules/purchase-order/*` | `purchase-order-authorization.schema.ts` | `PurchaseOrder.ts` |
| `/purchase-orders/new` | `frontend/src/app/(dashboard)/purchase-orders/new/page.tsx` | `apiClient.post("/purchase-orders")` | `POST /api/purchase-orders` | `RegisterPurchaseOrderSchema` | `PurchaseOrder.ts` |
| `/planning` | `frontend/src/app/(dashboard)/planning/page.tsx` | `frontend/src/modules/planning/queries.ts` | `backend/src/modules/planning-packet/*` | `planning-packet.schema.ts` | `PlanningPacket.ts` |
| `/execution` | `frontend/src/app/(dashboard)/execution/page.tsx` | `frontend/src/modules/execution/queries.ts` | `backend/src/modules/execution-session/*` | `execution-session.schema.ts` | `ExecutionSession.ts` |
| `/evidences` | `frontend/src/app/(dashboard)/evidences/page.tsx` | `frontend/src/modules/evidences/queries.ts` | `backend/src/modules/evidence/*`, `backend/src/modules/files/*` | `evidence.schema.ts`, `file-asset.schema.ts` | `Evidence.ts`, `FileAsset.ts` |
| `/reports` | `frontend/src/app/(dashboard)/reports/page.tsx` | `frontend/src/modules/reports/queries.ts` | `backend/src/modules/report/*`, `backend/src/modules/technical-report/*` | `report.schema.ts`, `technical-report.schema.ts` | `Report.ts`, `TechnicalReport.ts` |
| `/delivery-records` | `frontend/src/app/(dashboard)/delivery-records/page.tsx` | `frontend/src/modules/billing/queries.ts` | `backend/src/modules/delivery-record/*` | `delivery-record.schema.ts` | `DeliveryRecord.ts` |
| `/billing/ses` | `frontend/src/app/(dashboard)/billing/ses/page.tsx` | `frontend/src/modules/billing/queries.ts` | `backend/src/modules/service-entry-sheet/*` | `service-entry-sheet.schema.ts` | `ServiceEntrySheet.ts` |
| `/billing/invoices` | `frontend/src/app/(dashboard)/billing/invoices/page.tsx` | `frontend/src/modules/billing/queries.ts` | `backend/src/modules/invoice/*` | `invoice.schema.ts` | `Invoice.ts` |
| `/payments` | `frontend/src/app/(dashboard)/payments/page.tsx` | `frontend/src/modules/billing/queries.ts` | `backend/src/modules/payment/*` | `payment.schema.ts` | `Payment.ts` |
| `/resources` | `frontend/src/app/(dashboard)/resources/page.tsx` | page-level query using `apiClient` | `backend/src/modules/resource/*` | `resource.schema.ts` | `Resource.ts` |
| `/resources/kits` | `frontend/src/app/(dashboard)/resources/kits/page.tsx` | page-level query using `apiClient` | `backend/src/modules/resource/*`, `backend/src/modules/kit/*` | `kit.schema.ts`, `maintenanceKit.schema.ts` | `Kit.ts`, `MaintenanceKit.ts` |

---

## Notes

- This matrix is a start point, not proof of completeness.
- Route existence was verified by `rg --files "frontend/src/app/(dashboard)"`.
- Backend module existence was verified by `Get-ChildItem backend/src/modules -Directory`.
- Each page still needs targeted source review before refactor.
