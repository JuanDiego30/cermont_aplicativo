# Domain Module Map — Cermont S.A.S.

This document maps Cermont's business modules to their respective domain definitions, backend code modules, frontend view modules, shared schemas, active states, offline support levels, and audit events.

---

## Domain Mapping Matrix

| Business Module | Domain / 14-Step Flow | Backend Module | Frontend Module | Contract / Schema | Active States | Offline Support | Audit Events |
|---|---|---|---|---|---|---|---|
| **Work Requests** | Step 1: Work Request | `backend/src/modules/work-requests` | `frontend/src/modules/work-requests` | `CreateWorkRequestSchema`, `WorkRequestListQuerySchema` | `submitted`, `assigned`, `visit_scheduled`, `rejected` | Local store creation & read | `work_request_created`, `work_request_assigned` |
| **Site Visits** | Step 2: Site Visit | `backend/src/modules/site-visits` | `frontend/src/modules/site-visits` | `CreateSiteVisitSchema`, `SiteVisitListQuerySchema` | `scheduled`, `in_progress`, `completed` | Full offline inspection & photos | `site_visit_scheduled`, `site_visit_completed` |
| **Proposals** | Step 3: Proposal | `backend/src/modules/proposals` | `frontend/src/modules/proposals` | `CreateProposalSchema`, `ProposalListQuerySchema` | `draft`, `submitted_to_client`, `approved`, `rejected` | Read-only | `proposal_created`, `proposal_approved` |
| **Purchase Orders** | Step 4: PO Approval | `backend/src/modules/purchase-orders` | `frontend/src/modules/purchase-orders` | `CreatePOSchema`, `POListQuerySchema` | `pending_approval`, `approved`, `rejected` | Read-only | `po_submitted`, `po_approved` |
| **Planning Packets** | Step 5: Planning | `backend/src/modules/planning` | `frontend/src/modules/planning` | `CreatePlanningPacketSchema` | `planning_draft`, `planned`, `approved` | Read-only | `planning_packet_created` |
| **Work Orders** | Step 6: Execution | `backend/src/modules/orders` | `frontend/src/modules/orders` | `CreateOrderSchema`, `UpdateOrderSchema` | `pending`, `planned`, `executing`, `evidence_uploaded`, `report_generated`, `signed`, `ses_submitted`, `invoiced`, `paid`, `closed` | Read-only list & detail | `order_created`, `order_status_updated`, `order_closed` |
| **Execution Sessions** | Step 6: Execution | `backend/src/modules/execution` | `frontend/src/modules/execution` | `CreateExecutionSchema` | `not_started`, `active`, `paused`, `completed` | Offline play/pause/stop timeline | `execution_started`, `execution_completed` |
| **Evidences** | Step 7: Evidence | `backend/src/modules/evidence` | `frontend/src/modules/evidences` | `EvidenceListQuerySchema` | `captured`, `uploaded`, `verified`, `rejected` | Offline camera capture & store | `evidence_captured`, `evidence_uploaded`, `evidence_verified` |
| **File Assets** | Cross-cutting Storage | `backend/src/modules/files` | `frontend/src/modules/documents` | `FileAssetSchema` | `active`, `archived` | Cache files offline | `file_uploaded`, `file_deleted` |
| **Fleet (Vehicles)** | Resource Scheduling | `backend/src/modules/fleet` | `frontend/src/modules/fleet` | `VehicleSchema`, `ListVehiclesQuerySchema` | `available`, `assigned`, `maintenance` | Read-only | `vehicle_created`, `vehicle_assigned` |
| **Tools & Assets** | Resource Scheduling | `backend/src/modules/tool` | `frontend/src/modules/tools` | `ResourceSchema`, `ResourceListQuerySchema` | `available`, `in_use`, `calibrating` | Read-only | `tool_created`, `tool_checked_out` |
| **Checklists** | Step 6: Execution | `backend/src/modules/checklists` | `frontend/src/modules/inventory` | `ScanInputSchema` | `pending`, `passed`, `failed` | Offline checklist submission | `checklist_completed` |
| **Costs** | Cross-cutting Financial | `backend/src/modules/costs` | `frontend/src/modules/costs` | `CostCatalogQuerySchema` | `estimated`, `actual`, `reconciled` | Read-only | `cost_recorded` |
| **Reports** | Step 8: Technical Report | `backend/src/modules/reports` | `frontend/src/modules/reports` | `ReportListQuerySchema`, `ReportIdSchema` | `draft`, `submitted`, `approved` | Read-only | `report_generated`, `report_approved` |
| **Delivery Records** | Step 9: Delivery Record | `backend/src/modules/delivery-records` | `frontend/src/modules/delivery-records` | `CreateDeliveryRecordSchema` | `draft`, `delivered`, `signed` | Sign offline | `delivery_record_created` |
| **Client Signature** | Step 10: Client Signature | `backend/src/modules/delivery-records` | `frontend/src/modules/delivery-records` | `SignatureSchema` | `pending`, `signed` | Capture signature offline | `client_signed` |
| **SES (Service Entry)** | Step 11: SES / Ariba | `backend/src/modules/service-entry-sheets` | `frontend/src/modules/billing/ses` | `CreateSESSchema` | `pending`, `submitted`, `approved` | Read-only | `ses_created`, `ses_approved` |
| **Invoices** | Step 12: Invoice | `backend/src/modules/invoices` | `frontend/src/modules/billing/invoices` | `CreateInvoiceSchema` | `draft`, `submitted`, `approved` | Read-only | `invoice_created`, `invoice_approved` |
| **Payments** | Step 14: Payment | `backend/src/modules/payments` | `frontend/src/modules/payments` | `CreatePaymentSchema` | `pending`, `paid` | Read-only | `payment_recorded` |
| **Audit Logs** | Security Perimeter | `backend/src/modules/audit` | `frontend/src/modules/admin/audit` | `AuditQuerySchema` | — | Disabled (online only) | `audit_event_logged` |

---

## Domain Architecture Rules

1. **Strict SRP Boundaries**: Services must contain domain logic only. Do not let Express routes or middleware leaks bypass shared schemas.
2. **Contract First**: Any new domain models or fields must start inside `@cermont/shared-types` before they are implemented in the Express backend or Next.js frontend.
3. **Audit Trails**: Core state changes (`approved`, `rejected`, `signed`, `paid`) must trigger audit logs.
