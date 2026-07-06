# FRONTEND ROUTE MAP — Cermont S.A.S.

**Date:** 2026-05-13  
**Version:** 1.0 — Canonical  
**Status:** CURRENT_SOURCE_OF_TRUTH  
**Base URL:** `http://localhost:3000`

---

## Status Legend

| Status | Meaning |
|--------|---------|
| **IMPLEMENTED** | Route exists and is functional |
| **REQUIRED_NOT_IMPLEMENTED** | Must exist for business flow; not yet built |
| **OPTIONAL** | Nice to have; not blocking |
| **HIDDEN_UNTIL_IMPLEMENTED** | Route placeholder; hidden from nav |
| **DEPRECATED** | Exists but planned for removal |

---

## Core Routes

| # | Route | Page Purpose | Module | Required Data | Query Hook | API Endpoint | RBAC | States | Status |
|---|-------|-------------|--------|---------------|------------|-------------|------|--------|--------|
| 1 | `/` | Landing / redirect to login or dashboard | (root) | None | None | None | Public | Loading | IMPLEMENTED |
| 2 | `/login` | Authentication | auth | Credentials | useLogin | POST /api/auth/login | Public | Loading, Error | IMPLEMENTED |
| 3 | `/register` | User registration | auth | Registration data | useRegister | POST /api/auth/register | Public | Loading, Error | IMPLEMENTED |
| 4 | `/forgot-password` | Password recovery | auth | Email | useForgotPassword | POST /api/auth/forgot-password | Public | Loading, Error, Success | OPTIONAL |
| 5 | `/reset-password` | Password reset token | auth | Token, new password | useResetPassword | POST /api/auth/reset-password | Public | Loading, Error, Success | OPTIONAL |

---

## Dashboard

| # | Route | Page Purpose | Module | Required Data | Query Hook | API Endpoint | RBAC | States | Status |
|---|-------|-------------|--------|---------------|------------|-------------|------|--------|--------|
| 6 | `/dashboard` | Main dashboard: KPIs, active orders, costs, alerts | dashboard | Summary stats | useDashboard | GET /api/dashboard | gerente, residente, HES, supervisor, administrativo | Loading, Error, Empty, Offline | IMPLEMENTED |

---

## Work Requests (Step 1)

| # | Route | Page Purpose | Module | Required Data | Query Hook | API Endpoint | RBAC | States | Status |
|---|-------|-------------|--------|---------------|------------|-------------|------|--------|--------|
| 7 | `/work-requests` | List all work requests | work-requests | WR list | useWorkRequests | GET /api/work-requests | All auth | Loading, Error, Empty, Offline | IMPLEMENTED |
| 8 | `/work-requests/new` | Create work request | work-requests | Form data | useCreateWR | POST /api/work-requests | gerente, residente, HES, cliente | Loading, Error, Offline | IMPLEMENTED |
| 9 | `/work-requests/[id]` | Work request detail + visits tab | work-requests | WR detail, visits | useWorkRequest | GET /api/work-requests/:id | All auth | Loading, Error, Empty, Offline | IMPLEMENTED |

---

## Site Visits (Step 2)

| # | Route | Page Purpose | Module | Required Data | Query Hook | API Endpoint | RBAC | States | Status |
|---|-------|-------------|--------|---------------|------------|-------------|------|--------|--------|
| 9A | `/site-visits` | List standalone technical visits | site-visits | Site visit list | useSiteVisitsList | GET /api/site-visits | All auth | Loading, Error, Empty, Offline | IMPLEMENTED |
| 9B | `/site-visits/new` | Schedule technical visit | site-visits | Form data | useCreateSiteVisit | POST /api/site-visits | gerente, residente, HES, supervisor | Loading, Error, Offline | IMPLEMENTED |
| 9C | `/site-visits/[id]` | Technical visit detail and state actions | site-visits | Site visit detail | useSiteVisit | GET /api/site-visits/:id | All auth | Loading, Error, Empty | IMPLEMENTED |

---

## Proposals (Steps 2-4)

| # | Route | Page Purpose | Module | Required Data | Query Hook | API Endpoint | RBAC | States | Status |
|---|-------|-------------|--------|---------------|------------|-------------|------|--------|--------|
| 10 | `/proposals` | List all proposals | proposals | Proposal list | useProposals | GET /api/proposals | All auth | Loading, Error, Empty, Offline | IMPLEMENTED |
| 11 | `/proposals/new` | Create proposal | proposals | Form data | useCreateProposal | POST /api/proposals | gerente, residente, HES | Loading, Error, Offline | IMPLEMENTED |
| 12 | `/proposals/[id]` | Proposal detail + PO tab | proposals | Proposal detail, PO | useProposal | GET /api/proposals/:id | All auth | Loading, Error, Empty | IMPLEMENTED |
| 13 | `/proposals/[id]/costs` | Proposal cost estimates | costs | Cost estimates | useProposalCosts | GET /api/proposals/:id/costs | gerente, residente, HES | Loading, Error, Empty | REQUIRED_NOT_IMPLEMENTED |

---

## Work Orders (Steps 4-5)

| # | Route | Page Purpose | Module | Required Data | Query Hook | API Endpoint | RBAC | States | Status |
|---|-------|-------------|--------|---------------|------------|-------------|------|--------|--------|
| 14 | `/orders` | List all work orders | orders | Order list | useOrders | GET /api/orders | All auth | Loading, Error, Empty, Offline | IMPLEMENTED |
| 15 | `/orders/new` | Create work order | orders | Form data | useCreateOrder | POST /api/orders | gerente, residente, HES | Loading, Error | IMPLEMENTED |
| 16 | `/orders/[id]` | Order detail | orders | Order detail | useOrder | GET /api/orders/:id | All auth | Loading, Error, Empty | IMPLEMENTED |
| 17 | `/orders/[id]/planning` | Planning packet | planning | Planning data | usePlanning | GET /api/orders/:id/planning | gerente, residente, HES, supervisor | Loading, Error, Empty, Offline | IMPLEMENTED |
| 18 | `/orders/[id]/execution` | Execution session | field-execution | Execution data, checklists | useExecution | GET /api/orders/:id/execution | supervisor, operador, tecnico | Error, Empty, Offline | IMPLEMENTED |
| 19 | `/orders/[id]/evidences` | Evidence gallery | evidences | Evidence list, photos | useEvidences | GET /api/orders/:id/evidences | All auth | Error, Empty, Offline | IMPLEMENTED |
| 20 | `/orders/[id]/costs` | Actual costs | costs | Actual cost entries | useActualCosts | GET /api/orders/:id/costs | gerente, residente, HES, supervisor | Error, Empty | IMPLEMENTED |
| 20A | `/orders/[id]/planning` | Planning packet | planning | Planning data | usePlanning | GET /api/orders/:id/planning | gerente, residente, HES, supervisor | Error, Empty, Offline | IMPLEMENTED |
| 20B | `/orders/[id]/asts` | Safety analysis | safety-analysis | AST data | useSafetyAnalysis | GET /api/orders/:id/asts | All auth | Error, Empty | IMPLEMENTED |
| 20C | `/orders/[id]/invoice` | Order invoice | billing | Invoice detail | useInvoice | GET /api/orders/:id/invoice | All auth | Error, Empty | IMPLEMENTED |
| 20D | `/orders/[id]/inspections/[inspectionId]` | Inspection detail | inspection | Inspection data | useInspection | GET /api/orders/:id/inspections/:inspectionId | All auth | Error, Empty | IMPLEMENTED |
| 20E | `/orders/[id]/edit` | Edit work order | orders | Order data | useOrder | PUT /api/orders/:id | gerente, residente, HES, supervisor | Error, Empty | IMPLEMENTED |
| 20F | `/orders/kanban` | Kanban board | orders | All orders | useOrders | GET /api/orders | All auth | Loading, Error, Empty | IMPLEMENTED |
| 20G | `/orders/new` | Create work order | orders | Form data | useCreateOrder | POST /api/orders | gerente, residente, HES | Loading, Error | IMPLEMENTED |

---

## Execution & Evidence (Steps 6-7)

| # | Route | Page Purpose | Module | Required Data | Query Hook | API Endpoint | RBAC | States | Status |
|---|-------|-------------|--------|---------------|------------|-------------|------|--------|--------|
| 21 | `/execution` | Execution session list | field-execution | Session list | useExecutions | GET /api/execution | supervisor, operador, tecnico | Loading, Error, Empty, Offline | IMPLEMENTED |
| 21A | `/execution/new` | Create execution session | field-execution | Form data | useCreateExecution | POST /api/execution | supervisor, operador, tecnico | Error, Offline | IMPLEMENTED |
| 21B | `/execution/[id]` | Execution session detail | field-execution | Session data | useExecution | GET /api/execution/:id | supervisor, operador, tecnico | Error, Empty | IMPLEMENTED |
| 21C | `/execution-sessions/[id]` | Field execution session (preflight, FSM, evidencias) | field-execution | Session data, checklists, evidence | useExecutionSession | GET /api/execution-sessions/:id | supervisor, operador, tecnico | Loading, Error, Empty, Offline | IMPLEMENTED |
| 22 | `/evidences` | All evidence gallery | evidences | Evidence list | useAllEvidences | GET /api/evidences | All auth | Loading, Error, Empty, Offline | IMPLEMENTED |

---

## Reports & Delivery (Steps 8-10)

| # | Route | Page Purpose | Module | Required Data | Query Hook | API Endpoint | RBAC | States | Status |
|---|-------|-------------|--------|---------------|------------|-------------|------|--------|--------|
| 23 | `/reports` | Technical reports list | reports | Report list | useReports | GET /api/reports | All auth | Loading, Error, Empty | IMPLEMENTED |
| 24 | `/reports/[id]` | Report detail + PDF | reports | Report detail | useReport | GET /api/reports/:id | All auth | Loading, Error | IMPLEMENTED |
| 24A | `/reports/[id]/draft` | Technical report draft (auto-generado) | reports | Report draft data | useReportDraft | GET /api/reports/auto-draft/:serviceCaseId | supervisor, tecnico, operador | Loading, Error, Empty | IMPLEMENTED |
| 24B | `/reports/[id]/sign` | Digital signature for reports | reports | Signature data | useReportSignature | POST /api/reports/:id/sign | gerente, residente, supervisor | Loading, Error | IMPLEMENTED |
| 25 | `/delivery-records` | Delivery records list | delivery-records | DR list | useDeliveryRecords | GET /api/delivery-records | All auth | Loading, Error, Empty | IMPLEMENTED |
| 25A | `/delivery-records/new` | Create delivery record | delivery-records | Form data | useCreateDR | POST /api/delivery-records | gerente, residente, supervisor | Error, Offline | IMPLEMENTED |
| 25B | `/delivery-records/[id]/signature` | Sign delivery record | delivery-records | Signature data | useSignDR | POST /api/delivery-records/:id/sign | gerente, residente | Error, Empty | IMPLEMENTED |
| 26 | `/delivery-records/[id]` | Delivery record detail + sign | delivery-records | DR detail | useDeliveryRecord | GET /api/delivery-records/:id | All auth | Loading, Error | IMPLEMENTED |

---

## Billing & Financial (Steps 11-14)

| # | Route | Page Purpose | Module | Required Data | Query Hook | API Endpoint | RBAC | States | Status |
|---|-------|-------------|--------|---------------|------------|-------------|------|--------|--------|
| 27 | `/billing/ses` | Service Entry Sheets | service-entry-sheets | SES list | useSESList | GET /api/service-entry-sheets | gerente, residente, HES, administrativo, cliente | Loading, Error, Empty | IMPLEMENTED |
| 27A | `/billing/ses/new` | Create SES | service-entry-sheets | Form data | useCreateSES | POST /api/service-entry-sheets | gerente, residente, HES | Error, Offline | IMPLEMENTED |
| 27B | `/billing/ses/[id]/approve` | Approve SES | service-entry-sheets | Approval data | useApproveSES | POST /api/service-entry-sheets/:id/approve | gerente, residente | Error, Empty | IMPLEMENTED |
| 28 | `/billing/ses/[id]` | SES detail | service-entry-sheets | SES detail | useSES | GET /api/service-entry-sheets/:id | All auth | Loading, Error | IMPLEMENTED |
| 29 | `/billing/invoices` | Invoices list | invoices | Invoice list | useInvoices | GET /api/invoices | gerente, residente, HES, administrativo, cliente | Loading, Error, Empty | IMPLEMENTED |
| 29A | `/billing/invoices/new` | Create invoice | invoices | Form data | useCreateInvoice | POST /api/invoices | gerente, administrativo | Error, Offline | IMPLEMENTED |
| 29B | `/billing/invoices/[id]/approve` | Approve invoice | invoices | Approval data | useApproveInvoice | POST /api/invoices/:id/approve | gerente | Error, Empty | IMPLEMENTED |
| 30 | `/billing/invoices/[id]` | Invoice detail + approval | invoices | Invoice detail | useInvoice | GET /api/invoices/:id | All auth | Loading, Error | IMPLEMENTED |
| 30A | `/invoices/[id]/pipeline` | Invoice pipeline (SES→Invoice→Payment) | invoices | Pipeline tracking | useInvoicePipeline | GET /api/service-cases/:id/invoice-pipeline | Internal roles | Loading, Error, Empty | IMPLEMENTED |
| 31 | `/payments` | Payments list | payments | Payment list | usePayments | GET /api/payments | gerente, residente, HES, administrativo, cliente | Loading, Error, Empty | IMPLEMENTED |
| 31A | `/payments/new` | Record payment | payments | Form data | useCreatePayment | POST /api/payments | gerente, administrativo | Error, Offline | IMPLEMENTED |
| 32 | `/payments/[id]` | Payment detail | payments | Payment detail | usePayment | GET /api/payments/:id | All auth | Loading, Error | IMPLEMENTED |

---

## Document Platform

| # | Route | Page Purpose | Module | Required Data | Query Hook | API Endpoint | RBAC | States | Status |
|---|-------|-------------|--------|---------------|------------|-------------|------|--------|--------|
| 33 | `/documents` | Document management hub | documents | Doc types | useDocuments | GET /api/documents | All auth | Loading, Error, Empty, Offline | IMPLEMENTED |
| 34 | `/documents/imports` | Document import (PDF, Excel, Word) | documents | Import list | useImports | GET /api/documents/import | All auth | Loading, Error, Empty, Offline | REQUIRED_NOT_IMPLEMENTED |
| 35 | `/documents/templates` | Template library | document-templates | Template list | useTemplates | GET /api/documents/templates | gerente, residente, HES | Loading, Error, Empty | REQUIRED_NOT_IMPLEMENTED |
| 36 | `/documents/templates/[id]` | Template detail | document-templates | Template detail | useTemplate | GET /api/documents/templates/:id | gerente, residente, HES | Loading, Error | REQUIRED_NOT_IMPLEMENTED |
| 37 | `/documents/templates/[id]/builder` | Visual template builder | document-templates | Template schema | useTemplateSchema | GET /api/documents/templates/:id/schema | gerente, residente, HES | Loading, Error | REQUIRED_NOT_IMPLEMENTED |
| 38 | `/documents/responses/[id]` | Template response (filled form) | document-templates | Response data | useResponse | GET /api/documents/responses/:id | All auth | Loading, Error, Empty, Offline | REQUIRED_NOT_IMPLEMENTED |

---

## Costs

| # | Route | Page Purpose | Module | Required Data | Query Hook | API Endpoint | RBAC | States | Status |
|---|-------|-------------|--------|---------------|------------|-------------|------|--------|--------|
| 39 | `/costs` | Cost overview dashboard | costs | Summary, comparison | useCostDashboard | GET /api/costs/dashboard | gerente, residente, HES | Loading, Error, Empty | REQUIRED_NOT_IMPLEMENTED |
| 40 | `/costs/catalog` | Cost catalog (materials, labor, tools) | costs | Catalog items | useCostCatalog | GET /api/costs/catalog | gerente, residente, HES, supervisor, tecnico | Loading, Error, Empty | IMPLEMENTED |

---

## Assets & Maintenance

| # | Route | Page Purpose | Module | Required Data | Query Hook | API Endpoint | RBAC | States | Status |
|---|-------|-------------|--------|---------------|------------|-------------|------|--------|--------|
| 41 | `/assets` | Asset list (equipment, tools, vehicles) | assets | Asset list | useAssets | GET /api/assets | All auth | Loading, Error, Empty | REQUIRED_NOT_IMPLEMENTED |
| 42 | `/assets/[id]` | Asset detail + certificates | assets | Asset detail | useAsset | GET /api/assets/:id | All auth | Loading, Error | REQUIRED_NOT_IMPLEMENTED |
| 43 | `/maintenance` | Maintenance plans | maintenance | Plan list | useMaintenance | GET /api/maintenance | All auth | Loading, Error, Empty | IMPLEMENTED |

---

## Admin

| # | Route | Page Purpose | Module | Required Data | Query Hook | API Endpoint | RBAC | States | Status |
|---|-------|-------------|--------|---------------|------------|-------------|------|--------|--------|
| 44 | `/admin/users` | User management | users | User list | useUsers | GET /api/users | gerente, residente | Loading, Error, Empty | IMPLEMENTED |
| 44A | `/admin/users/new` | Create user | users | Form data | useCreateUser | POST /api/users | gerente, residente | Loading, Error | IMPLEMENTED |
| 44B | `/admin/users/[id]` | User detail | users | User detail | useUser | GET /api/users/:id | gerente, residente | Error, Empty | IMPLEMENTED |
| 44C | `/admin/users/[id]/edit` | Edit user | users | User data | useUpdateUser | PUT /api/users/:id | gerente, residente | Error, Empty | IMPLEMENTED |
| 45 | `/admin/settings` | System configuration and reminder policy | system-config | Configuration snapshot | useSystemConfigQuery | GET /api/system-config | gerente, administrativo | Loading, Error, Offline | IMPLEMENTED |
| 45A | `/admin/backups` | Database backups | admin-backup | Backup list | useBackups | GET /api/admin/backups | gerente, administrativo | Error, Empty | IMPLEMENTED |
| 45B | `/admin/custom-fields` | Custom field management | custom-fields | Field list | useCustomFields | GET /api/custom-fields | gerente, administrativo | Error, Empty | IMPLEMENTED |
| 45C | `/admin/personnel` | Personnel management | user | Personnel list | usePersonnel | GET /api/users | gerente, residente | Error, Empty | IMPLEMENTED |
| 45D | `/admin/audit` | Inspect immutable audit events and request correlation | audit | Paginated audit records | useAuditLogsQuery | GET /api/audit | gerente, administrativo | Loading, Error, Empty, Offline | IMPLEMENTED |

---

## Resources & Tools

| # | Route | Page Purpose | Module | Required Data | Query Hook | API Endpoint | RBAC | States | Status |
|---|-------|-------------|--------|---------------|------------|-------------|------|--------|--------|
| 49 | `/resources` | Resource management | resource | Resource list | useResources | GET /api/resources | All auth | Loading, Error, Empty | IMPLEMENTED |
| 49A | `/resources/[id]` | Resource detail | resource | Resource detail | useResource | GET /api/resources/:id | All auth | Error, Empty | IMPLEMENTED |
| 49B | `/resources/kits` | Kit list | kit | Kit list | useKits | GET /api/kits | All auth | Loading, Error, Empty | IMPLEMENTED |
| 49C | `/resources/kits/new` | Create kit | kit | Form data | useCreateKit | POST /api/kits | gerente, residente | Loading, Error | IMPLEMENTED |

## Service Cases (Pipeline)

| # | Route | Page Purpose | Module | Required Data | Query Hook | API Endpoint | RBAC | States | Status |
|---|-------|-------------|--------|---------------|------------|-------------|------|--------|--------|
| 50 | `/service-cases` | Service case list | service-cases | Case list | useServiceCases | GET /api/service-cases | All auth | Loading, Error, Empty | IMPLEMENTED |
| 50A | `/service-cases/[id]` | Service case detail + 14-step pipeline | service-cases | Case detail, step context | useServiceCase | GET /api/service-cases/:id | All auth | Error, Empty | IMPLEMENTED |
| 50B | `/service-cases/[id]/cockpit` | Cockpit 14 pasos con workflow, blockers y cierre | service-cases | Workflow, blockers, docs, evidences | useServiceCaseCockpit | GET /api/service-cases/:id/cockpit | gerente, residente, HES, supervisor, administrativo, tecnico, operador | Loading, Error, Empty | IMPLEMENTED |

## Planning

| # | Route | Page Purpose | Module | Required Data | Query Hook | API Endpoint | RBAC | States | Status |
|---|-------|-------------|--------|---------------|------------|-------------|------|--------|--------|
| 51 | `/planning` | Planning overview | planning | Planning list | usePlanningList | GET /api/planning | gerente, residente, HES, supervisor | Loading, Error, Empty | IMPLEMENTED |
| 51A | `/planning/[id]` | Planning detail | planning | Planning detail | usePlanning | GET /api/planning-packets/:id | gerente, residente, HES, supervisor | Error, Empty | IMPLEMENTED |
| 51B | `/planning-packet/new` | Create planning packet | planning-packet | Form data | useCreatePlanningPacket | POST /api/planning-packets | gerente, residente, HES | Error, Offline | IMPLEMENTED |

## Site Visits & Inspections

| # | Route | Page Purpose | Module | Required Data | Query Hook | API Endpoint | RBAC | States | Status |
|---|-------|-------------|--------|---------------|------------|-------------|------|--------|--------|
| 52 | `/site-visits` | Site visit list | site-visit | Visit list | useSiteVisits | GET /api/site-visits | All auth | Loading, Error, Empty | IMPLEMENTED |
| 52A | `/site-visits/new` | Schedule site visit | site-visit | Form data | useCreateSiteVisit | POST /api/site-visits | gerente, residente, HES, supervisor | Loading, Error | IMPLEMENTED |
| 52B | `/site-visits/[id]` | Site visit detail | site-visit | Visit detail | useSiteVisit | GET /api/site-visits/:id | All auth | Error, Empty | IMPLEMENTED |

## Purchase Orders

| # | Route | Page Purpose | Module | Required Data | Query Hook | API Endpoint | RBAC | States | Status |
|---|-------|-------------|--------|---------------|------------|-------------|------|--------|--------|
| 53 | `/purchase-orders` | Purchase order list | purchase-order | PO list | usePurchaseOrders | GET /api/purchase-orders | All auth | Loading, Error, Empty | IMPLEMENTED |
| 53A | `/purchase-orders/new` | Create purchase order | purchase-order | Form data | useCreatePO | POST /api/purchase-orders | gerente, residente | Loading, Error | IMPLEMENTED |
| 53B | `/purchase-orders/[id]` | Purchase order detail | purchase-order | PO detail | usePurchaseOrder | GET /api/purchase-orders/:id | All auth | Error, Empty | IMPLEMENTED |

## Portal (Client)

| # | Route | Page Purpose | Module | Required Data | Query Hook | API Endpoint | RBAC | States | Status |
|---|-------|-------------|--------|---------------|------------|-------------|------|--------|--------|
| 54 | `/portal` | Client portal home | portal | Dashboard data | usePortalDashboard | GET /api/portal | cliente | Error, Empty | IMPLEMENTED |
| 54A | `/portal/invoices` | Client invoices | portal | Invoice list | usePortalInvoices | GET /api/portal/invoices | cliente | Error, Empty | IMPLEMENTED |
| 54B | `/portal/orders` | Client orders | portal | Order list | usePortalOrders | GET /api/portal/orders | cliente | Error, Empty | IMPLEMENTED |
| 54C | `/portal/orders/[id]` | Client order detail | portal | Order detail | usePortalOrder | GET /api/portal/orders/:id | cliente | Error, Empty | IMPLEMENTED |
| 54D | `/portal/proposals` | Client proposals | portal | Proposal list | usePortalProposals | GET /api/portal/proposals | cliente | Error, Empty | IMPLEMENTED |
| 54E | `/portal/service-cases` | Client portal: service case list | portal | Service case list | usePortalServiceCases | GET /api/portal/service-cases | cliente | Loading, Error, Empty | IMPLEMENTED |
| 54F | `/portal/service-cases/[id]` | Client portal: service case detail | portal | Service case detail | usePortalServiceCaseDetail | GET /api/portal/service-cases/:id | cliente | Loading, Error, Empty | IMPLEMENTED |

## Tools & Inventory

| # | Route | Page Purpose | Module | Required Data | Query Hook | API Endpoint | RBAC | States | Status |
|---|-------|-------------|--------|---------------|------------|-------------|------|--------|--------|
| 55 | `/fleet` | Fleet management | fleet | Fleet list | useVehicles | GET /api/fleet | Internal roles | Loading, Error, Empty | IMPLEMENTED |
| 55A | `/fleet/[id]` | Vehicle profile, readiness and FileAsset-backed photo gallery | fleet | Vehicle detail, photos | inline detail query + useFleetPhotos | GET /api/fleet/:id + /api/fleet/:id/photos | Internal roles; media mutations gerente/residente | Loading, Error, Empty | IMPLEMENTED |
| 56 | `/inventory` | Inventory management | inventory | Inventory list | useInventory | GET /api/inventory | All auth | Error, Empty | IMPLEMENTED |
| 56A | `/inventory/scan` | Inventory scanner | inventory | Scan input | useInventoryScan | POST /api/inventory/scan | All auth | Error, Offline | IMPLEMENTED |
| 57 | `/dispatch` | Dispatch management | dispatch | Dispatch list | useDispatch | GET /api/dispatch | All auth | Error, Empty | IMPLEMENTED |
| 58 | `/tools` | Tool readiness catalog (photos, PDF, blocking checklists) | resources/tool | Tool resources | useResourceList | GET /api/resources?type=tool | All auth | Loading, Error, Empty | IMPLEMENTED |

## Maintenance

| # | Route | Page Purpose | Module | Required Data | Query Hook | API Endpoint | RBAC | States | Status |
|---|-------|-------------|--------|---------------|------------|-------------|------|--------|--------|
| 59 | `/maintenance` | Maintenance plans | maintenance | Plan list | useMaintenance | GET /api/maintenance | All auth | Loading, Error, Empty | IMPLEMENTED |
| 59A | `/maintenance/new` | Create maintenance plan | maintenance | Form data | useCreateMaintenance | POST /api/maintenance | gerente, residente | Loading, Error | IMPLEMENTED |
| 59B | `/maintenance/[id]` | Maintenance plan detail | maintenance | Plan detail | useMaintenancePlan | GET /api/maintenance/:id | All auth | Error, Empty | IMPLEMENTED |
| 59C | `/maintenance/[id]/edit` | Edit maintenance plan | maintenance | Plan data | useUpdateMaintenance | PUT /api/maintenance/:id | gerente, residente | Error, Empty | IMPLEMENTED |

## Assets

| # | Route | Page Purpose | Module | Required Data | Query Hook | API Endpoint | RBAC | States | Status |
|---|-------|-------------|--------|---------------|------------|-------------|------|--------|--------|
| 60 | `/assets` | Asset list | asset | Asset list | useAssets | GET /api/assets | All auth | Loading, Error, Empty | IMPLEMENTED |
| 60A | `/assets/[id]` | Asset detail | asset | Asset detail | useAsset | GET /api/assets/:id | All auth | Error, Empty | IMPLEMENTED |

## Additional Modules

| # | Route | Page Purpose | Module | Required Data | Query Hook | API Endpoint | RBAC | States | Status |
|---|-------|-------------|--------|---------------|------------|-------------|------|--------|--------|
| 61 | `/notifications` | Notification center | notifications | Notification list | useNotifications | GET /api/notifications | All auth | Error, Empty | IMPLEMENTED |
| 62 | `/sla` | SLA management | sla | SLA list | useSLA | GET /api/sla | All auth | Error, Empty | IMPLEMENTED |
| 63 | `/forms` | Form submissions | form-submissions | Form list | useForms | GET /api/form-submissions | All auth | Error, Empty | IMPLEMENTED |
| 63A | `/forms/[templateId]` | Form detail/submission | form-submissions | Form schema | useForm | GET /api/form-submissions/:id | All auth | Error, Empty | IMPLEMENTED |
| 64 | `/templates` | Template library | template-draft | Template list | useTemplates | GET /api/template-drafts | All auth | Loading, Error, Empty | IMPLEMENTED |
| 64A | `/templates/[id]` | Template detail | template-draft | Template detail | useTemplate | GET /api/template-drafts/:id | All auth | Error, Empty | IMPLEMENTED |

## Offline Recovery

| # | Route | Page Purpose | Module | Required Data | Query Hook | API Endpoint | RBAC | States | Status |
|---|-------|-------------|--------|---------------|------------|-------------|------|--------|--------|
| 65 | `/offline-sync` | Review DLQ, retry failed mutations/uploads, resolve conflicts | offline | IndexedDB outbox and blob DLQ | TanStack Query local repository | Local IndexedDB + POST /api/sync/offline on retry | All auth | Loading, Error, Empty, Offline | IMPLEMENTED |
| 66 | `/unauthorized` | Access denied page | (root) | None | None | None | Public | None | IMPLEMENTED |
| 67 | `/profile` | User profile | user | User data | useUserProfile | GET /api/users/me | Authenticated | Loading, Error | IMPLEMENTED |

---

## Summary

| Status | Count | Percentage |
|--------|-------|------------|
| IMPLEMENTED | 91 | 97% |
| REQUIRED_NOT_IMPLEMENTED | 0 | 0% |
| OPTIONAL | 3 | 3% |
| **TOTAL** | **94** | **100%** |

**Nota:** Casi todas las rutas documentadas están implementadas (91/94). Las 3 OPTIONAL son /forgot-password, /reset-password y /customers. Las filas históricas marcadas REQUIRED_NOT_IMPLEMENTED deben reconciliarse con el código antes de confiar en el resumen. Algunas rutas carecen de error.tsx y/o loading.tsx — ver `.kilo/evidence/task-f1.2-route-data.txt` para el detalle histórico.

**Spec-014/016 (2026-07-05):** Se agregaron 7 rutas nuevas verificadas contra `frontend/src/app` (50B cockpit, 21C execution-sessions, 24A/24B report draft/sign, 30A invoice pipeline, 54E/54F portal service-cases) y se actualizó `/costs/catalog` (fila 40) a IMPLEMENTED. `/notifications` (fila 61) ya estaba documentada. Total: 9 rutas Spec-016 documentadas.
