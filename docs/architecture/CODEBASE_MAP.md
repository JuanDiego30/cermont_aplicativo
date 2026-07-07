# CODEBASE MAP — Cermont S.A.S.

> **Generated**: 2026-06-29  
> **Scope**: Backend + Frontend + Packages  
> **Source**: Real filesystem inspection (no speculation)

---

## Backend Modules (`backend/src/modules/`)

| Module | Routes | Controller | Service | Model | Dependencies | Status |
|--------|--------|------------|---------|-------|-------------|--------|
| admin-backup | admin-backup.routes.ts | — | admin-backup.service.ts | — | fs, archiver | verified |
| ai | ai.routes.ts | ai.controller.ts | ai.service.ts | — | LLM provider | verified |
| analytics | analytics.routes.ts | analytics.controller.ts | analytics.service.ts | — | metrics | verified |
| analytics-report | analytics-report.routes.ts | analytics-report.controller.ts | analytics-report.service.ts | — | pdf-lib | verified |
| asset | asset.routes.ts | asset.controller.ts | asset.service.ts | — | files | verified |
| audit | audit.routes.ts | audit.controller.ts | audit.service.ts | AuditLog | mongoose | verified |
| auth | auth.routes.ts | auth.controller.ts | auth.service.ts, webauthn.service.ts | User | jwt, bcrypt, webauthn | verified |
| business-document | business-document.routes.ts | business-document.controller.ts | business-document.service.ts | — | documents | verified |
| checklist | checklist.routes.ts | checklist.controller.ts | checklist.service.ts | Checklist | mongoose | verified |
| client | client.routes.ts | client.controller.ts | client.service.ts | Client | mongoose | verified |
| client-signature | client-signature.routes.ts | client-signature.controller.ts | client-signature.service.ts | ClientSignature | mongoose | verified |
| cost | cost.routes.ts | cost.controller.ts | cost.service.ts | Cost | mongoose | verified |
| custom-fields | custom-field.routes.ts | custom-field.controller.ts | custom-field.service.ts | CustomField | mongoose | verified |
| dashboard | dashboard.routes.ts | dashboard.controller.ts | dashboard.service.ts | — | multiple | verified |
| delivery-record | delivery-record.routes.ts, delivery-record-service-entry-sheet.routes.ts | — | — | DeliveryRecord | mongoose | verified |
| dian | dian.routes.ts | dian.controller.ts | dian.service.ts | DianConfig | mongoose | verified |
| dispatch | dispatch.routes.ts | dispatch.controller.ts | dispatch.service.ts | Dispatch | mongoose | verified |
| documents | document.routes.ts, document-import.routes.ts, document-ingestion.routes.ts, document-template.routes.ts | document.controller.ts, document-import.controller.ts, document-ingestion.controller.ts, document-template.controller.ts | document.service.ts, document-import.service.ts, document-ingestion.service.ts, file.service.ts | Document, DocumentTemplate | mongoose, multer, sharp | verified |
| erp-connector | erp-connector.routes.ts | erp-connector.controller.ts | erp-connector.service.ts | — | ERP adapters | verified |
| evidence | evidence.routes.ts, evidence-collection.routes.ts | evidence.controller.ts, evidence-collection.controller.ts | evidence.service.ts, evidence-collection.service.ts | Evidence, EvidenceCollection | mongoose, multer | verified |
| execution-session | execution-session.routes.ts, execution-technical-report.routes.ts | execution-session.controller.ts | execution-session.service.ts | ExecutionSession | mongoose | verified |
| files | files.routes.ts | files.controller.ts | files.service.ts | FileAsset | mongoose, multer, sharp | verified |
| fleet | fleet.routes.ts | fleet.controller.ts | fleet.service.ts | Vehicle | mongoose | verified |
| form-submissions | form-submission.routes.ts | form-submission.controller.ts | form-submission.service.ts | FormSubmission | mongoose | verified |
| inspection | inspection.routes.ts | inspection.controller.ts | inspection.service.ts | Inspection | mongoose | verified |
| inventory | inventory.routes.ts | inventory.controller.ts | inventory.service.ts | Inventory | mongoose | verified |
| invoice | invoice.routes.ts, invoice-payment.routes.ts | — | — | Invoice, InvoicePayment | mongoose | verified |
| kit | kit.routes.ts | kit.controller.ts | kit.service.ts | Kit | mongoose | verified |
| maintenance | maintenance.routes.ts | maintenance.controller.ts | maintenance.service.ts, maintenance-log.service.ts, maintenance-schedule.service.ts | Maintenance, MaintenanceLog, MaintenanceSchedule | mongoose | verified |
| notifications | notifications.routes.ts | notification.controller.ts | notification.service.ts | — | outbox worker | verified |
| observability | observability.routes.ts | observability.controller.ts | — | — | metrics | verified |
| order | order.routes.ts, order-administrative-workflow.routes.ts, order-closure.routes.ts, order-execution-session.routes.ts | order.controller.ts, order-crud.controller.ts, order-state.controller.ts, order-closure.controller.ts, administrative-workflow.controller.ts | order.service.ts, order-crud.service.ts, order-state.service.ts, order-closure.service.ts, administrative-workflow.service.ts | Order | mongoose, workflow | verified |
| payment | payment.routes.ts | — | — | Payment | mongoose | verified |
| planning-packet | planning-packet.routes.ts | planning-packet.controller.ts | planning-packet.service.ts | PlanningPacket | mongoose | verified |
| portal | portal.routes.ts | portal.controller.ts | portal.service.ts | — | public | verified |
| privacy-requests | privacy-requests.routes.ts | privacy-requests.controller.ts | privacy-requests.service.ts | PrivacyRequest | mongoose | verified |
| proposal | proposal.routes.ts | proposal.controller.ts | proposal.service.ts | Proposal | mongoose | verified |
| purchase-order | purchase-order.routes.ts | purchase-order.controller.ts | purchase-order.service.ts | PurchaseOrder | mongoose | verified |
| report | report.routes.ts | report.controller.ts | report.service.ts | — | pdf-lib | verified |
| resource | resource.routes.ts | resource.controller.ts | resource.service.ts | Resource | mongoose | verified |
| safety-analysis | safety-analysis.routes.ts | safety-analysis.controller.ts | safety-analysis.service.ts | SafetyAnalysis | mongoose | verified |
| service-cases | service-case.routes.ts | service-case.controller.ts | service-case.service.ts | ServiceCase | mongoose | verified |
| service-entry-sheet | service-entry-sheet.routes.ts, service-entry-sheet-invoice.routes.ts | — | — | ServiceEntrySheet | mongoose | verified |
| site-visit | site-visit.routes.ts | site-visit.controller.ts | site-visit.service.ts | SiteVisit | mongoose | verified |
| sla | sla.routes.ts | sla.controller.ts | sla.service.ts | SLA | mongoose | verified |
| sync | sync.routes.ts | sync.controller.ts | sync.service.ts | — | offline queue | verified |
| system-config | system-config.routes.ts | system-config.controller.ts | system-config.service.ts | SystemConfig | mongoose | verified |
| technical-report | technical-report.routes.ts | — | — | TechnicalReport | mongoose | verified |
| template-draft | template-draft.routes.ts | template-draft.controller.ts | template-draft.service.ts | TemplateDraft | mongoose | verified |
| template-response | template-response.routes.ts | template-response.controller.ts | template-response.service.ts | TemplateResponse | mongoose | verified |
| tool | tool.routes.ts | tool.controller.ts | tool.service.ts | Tool | mongoose | verified |
| user | user.routes.ts | user.controller.ts | user.service.ts | User | mongoose | verified |
| work-requests | work-requests.routes.ts | work-requests.controller.ts | work-requests.service.ts | WorkRequest | mongoose | verified |

**Total**: 57 backend modules  
**API Prefixes**: 50+ distinct prefixes under `/api/*`  
**Entry Point**: `backend/src/index.ts` (API_MOUNTS registry)  
**Bootstrap**: `backend/src/server.ts` (connectDB → workers → listen)

---

## Backend Common (`backend/src/common/`)

| Directory | Purpose |
|-----------|---------|
| docs/ | OpenAPI docs generation (buildDocsHtml, buildOpenApiDocument) |
| errors/ | AppError hierarchy, error codes, global errorHandler |
| guards/ | Permission guards |
| interceptors/ | Request/response interceptors |
| middlewares/ | authenticate, authorize, validateBody/Query/Params, rate-limiter, upload, request-id |
| observability/ | Metrics, logging |
| security/ | Security utilities |
| storage/ | File storage abstraction |
| types/ | Shared TypeScript types |
| utils/ | Logger, helpers |
| fsm/ | Finite State Machine utilities |

---

## Frontend Modules (`frontend/src/modules/`)

| Module | API | Hooks | UI Components | Route |
|--------|-----|-------|---------------|-------|
| analytics-report | api/ | queries.ts | — | /analytics-report |
| audit | api/ | queries.ts | — | /audit |
| auth | api/ | queries.ts | LoginForm, RegisterForm | /login, /register |
| billing | api/ | queries.ts | — | /billing |
| business-documents | api/ | queries.ts | — | /business-documents |
| checklists | api/ | queries.ts | — | /checklists |
| consents | api/ | queries.ts | ConsentGate | /consent |
| core | — | — | Layout, Sidebar, Header | — |
| costs | api/ | queries.ts | CostTracker | /costs/[trabajoId] |
| custom-fields | api/ | queries.ts | — | /custom-fields |
| customers | api/ | queries.ts | — | /customers |
| dashboard | api/ | queries.ts | DashboardHero, KPICards | /dashboard |
| dispatch | api/ | queries.ts | — | /dispatch |
| documents | api/ | queries.ts | DocumentUploader, DocumentList | /documents |
| erp-connector | api/ | queries.ts | — | /erp-connector |
| evidences | api/ | queries.ts | EvidenceUploader, EvidenceGallery | /evidences |
| execution | api/ | queries.ts | ExecutionTracker | /execution |
| files | api/ | queries.ts | FileUploader, FileList | /files |
| fleet | api/ | queries.ts | VehicleList, VehicleDetail | /fleet |
| forms | api/ | queries.ts | FormRenderer | /forms |
| inventory | api/ | queries.ts | — | /inventory |
| kits | api/ | queries.ts | KitList | /resources/kits |
| maintenance | api/ | queries.ts | MaintenanceCalendar, ScheduleList | /maintenance |
| notifications | api/ | queries.ts | NotificationBell | — |
| offline | — | — | OfflineBanner, SyncStatus | — |
| orders | api/ | queries.ts | OrderKanban, OrderDetail, OrderForm | /orders, /orders/kanban |
| planning | api/ | queries.ts | PlanningCalendar | /planning |
| portal | api/ | queries.ts | — | /portal |
| privacy-requests | api/ | queries.ts | — | /privacy-requests |
| proposals | api/ | queries.ts | ProposalForm, ProposalList | /proposals |
| purchase-orders | api/ | queries.ts | — | /purchase-orders |
| reports | api/ | queries.ts | ReportGenerator | /reports |
| resources | api/ | queries.ts | ResourceList | /resources |
| safety-analysis | api/ | queries.ts | — | /safety-analysis |
| service-cases | api/ | queries.ts | ServiceCaseDetail | /service-cases |
| signatures | api/ | queries.ts | SignaturePad | /signatures |
| site-visits | api/ | queries.ts | SiteVisitForm | /site-visits |
| sla | api/ | queries.ts | — | /sla |
| system-config | api/ | queries.ts | — | /system-config |
| templates | api/ | queries.ts | TemplateEditor | /templates |
| users | api/ | queries.ts | UserTable, UserForm | /admin/users |
| work-requests | api/ | queries.ts | WorkRequestForm | /work-requests |
| workflow | api/ | queries.ts | WorkflowVisualizer | /workflow |

**Total**: 42 frontend modules  
**Pattern**: Each module follows `api/`, `hooks/queries.ts`, `ui/` structure  
**State**: TanStack Query (server) + Zustand (client global)

---

## Packages

| Package | Path | Purpose | Key Exports |
|---------|------|---------|-------------|
| @cermont/shared-types | packages/shared-types/src/ | Zod schemas + TypeScript types (SSOT) | schemas/*, index.ts |
| @cermont/domain | packages/domain/src/ | RBAC roles, permissions, helpers | roles, permissions, route guards |
| @cermont/config | packages/config/src/ | Shared env validation | env validators |

**Legacy**: `packages/shared-types/src/zod/` — deprecated, avoid for new code  
**Modern**: `packages/shared-types/src/schemas/` — preferred location

---

## Key Entry Points

| Component | File | Purpose |
|-----------|------|---------|
| Backend App | `backend/src/index.ts` | Express app, middleware, API_MOUNTS |
| Backend Server | `backend/src/server.ts` | Bootstrap: connectDB → workers → listen |
| Frontend Layout | `frontend/src/app/layout.tsx` | Root layout, providers |
| Frontend Proxy | `frontend/proxy.ts` | Security perimeter, RBAC |
| Shared Types | `packages/shared-types/src/index.ts` | Contract SSOT |
| Domain Roles | `packages/domain/src/` | RBAC SSOT |

---

## Module Dependencies (High-Level)

```
auth → user, audit
order → proposal, planning-packet, execution-session, evidence, cost
evidence → files, order
fleet → files, maintenance
tool → files, maintenance
documents → files, business-document
invoice → service-entry-sheet, payment
service-entry-sheet → order, execution-session
maintenance → fleet, tool, checklist
report → order, evidence, service-entry-sheet
```

---

## File Count Summary

| Layer | Files | Notes |
|-------|-------|-------|
| Backend modules | 57 | Each with routes/controller/service |
| Backend common | 11 | Middlewares, errors, utils |
| Frontend modules | 42 | Each with api/hooks/ui |
| Packages | 3 | shared-types, domain, config |
| **Total** | **113** | **Core application code** |

---

## Verified Exceptions (T13 Audit)

| Area | Map correction | Source receipt |
|---|---|---|
| Fleet media | Resolved: fleet photo consumers now use FileAsset-backed domain adapters | `frontend/src/modules/fleet/api/fleet-api.ts`; `backend/src/modules/fleet/fleet.routes.ts` |
| File owners | Partially resolved for `vehicle`; other advertised owners still lack backend parent adapters | `packages/shared-types/src/schemas/file-asset.schema.ts`; `backend/src/modules/files/files.service.ts` |
| Tool ownership | FileAsset maps `tool` to `Resource`, while a separate `Tool` model/API also exists | `backend/src/modules/files/files.service.ts`; `backend/src/models/Tool.ts` |
| Route documentation | Canonical route/API docs contain stale status summaries and are not a generated inventory | `FRONTEND_ROUTE_MAP.md`; `API_ENDPOINT_MATRIX.md` |

`verified` in the inventory means that the physical module files were found. It does not certify endpoint completeness, consumer compatibility, authorization scope, or runtime behavior; those require the receipts above and targeted tests.
