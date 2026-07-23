# Traceability Matrix — CERMONT S.A.S.

**Generated:** 2026-07-23
**Status:** Baseline established from code audit and gate execution

## Structure

This matrix links: Business Requirement → API Endpoint → Backend Module → Frontend Page → Test File → RBAC Role → Audit Event

## Cross-Cutting

| Requirement | API Endpoint | Backend Module | Frontend Page | Test File | RBAC | Audit Event | Status |
|------------|-------------|----------------|---------------|-----------|------|-------------|--------|
| User login | POST /api/auth/login | auth | /login | auth.controller.test.ts | PUBLIC | USER_LOGIN | 🟡 |
| User logout | POST /api/auth/logout | auth | — | auth.controller.test.ts | authenticated | USER_LOGOUT | 🟡 |
| Token refresh | POST /api/auth/refresh | auth | — | — | PUBLIC | — | 🟡 |
| Forgot password | POST /api/auth/forgot-password | auth | /forgot-password | — | PUBLIC | PASSWORD_RESET_REQUESTED | 🟡 |
| Reset password | POST /api/auth/reset-password | auth | /reset-password | — | PUBLIC | PASSWORD_RESET_COMPLETED | 🟡 |
| Change password | POST /api/auth/change-password | auth | /profile | — | authenticated | PASSWORD_CHANGED | 🟡 |
| User CRUD | GET/POST/PUT /api/users | users | /admin/users | user.service.test.ts | ADMIN_ROLES | USER_CREATED/UPDATED | 🟡 |
| RBAC check | — | @cermont/domain | proxy.ts | rbac-extended.test.ts | — | — | 🟡 |

## Core Business Flow (14-Step)

| Requirement | API Endpoint | Backend Module | Frontend Page | Test File | RBAC | Audit Event | Status |
|------------|-------------|----------------|---------------|-----------|------|-------------|--------|
| Create work request | POST /api/work-requests | work-requests | /work-requests/new | work-request.test.ts | cliente+admin | WORK_REQUEST_CREATED | 🟡 |
| List work requests | GET /api/work-requests | work-requests | /work-requests | work-requests-page.test.tsx | all authenticated | — | 🟡 |
| Schedule site visit | POST /api/site-visits | site-visit | /site-visits/new | site-visits-new-page.test.tsx | FIELD_EXECUTION | SITE_VISIT_CREATED | 🟡 |
| Create proposal | POST /api/proposals | proposal | /proposals/new | proposal-queries.test.tsx | MANAGEMENT | PROPOSAL_CREATED | 🟡 |
| Approve proposal | POST /api/proposals/:id/approve | proposal | /proposals/[id] | proposals.controller.test.ts | gerente | PROPOSAL_APPROVED | 🟡 |
| Attach PO | POST /api/purchase-orders | purchase-order | /purchase-orders/new | purchase-order.service.test.ts | administrativo | PO_RECEIVED | 🟡 |
| Approve planning | POST /api/planning-packets/:id/approve | planning-packet | /planning/[id] | planning-readiness.service.test.ts | HES | PLANNING_APPROVED | 🟡 |
| Start execution | POST /api/execution-sessions | execution-session | /execution/new | execution-session.routes.test.ts | FIELD | EXECUTION_STARTED | 🟡 |
| Complete execution | PATCH /api/execution-sessions/:id/complete | execution-session | /execution/[id] | — | FIELD | EXECUTION_COMPLETED | 🟡 |
| Upload evidence | POST /api/evidences | evidence | /evidences | evidence.service.test.ts | EVIDENCE_ACCESS | EVIDENCE_UPLOADED | 🟡 |
| Generate report | POST /api/technical-reports/:id/generate-pdf | technical-report | /reports/[id] | report.service.test.ts | gerente | REPORT_GENERATED | 🟡 |
| Sign delivery | POST /api/delivery-records/:id/sign | delivery-record | /delivery-records/[id]/signature | delivery-record.routes.test.ts | cliente | DELIVERY_SIGNED | 🟡 |
| Submit SES | POST /api/service-entry-sheets/:id/submit | service-entry-sheet | /billing/ses/[id] | service-entry-sheet.routes.test.ts | BILLING | SES_SUBMITTED | 🟡 |
| Approve SES | POST /api/service-entry-sheets/:id/approve | service-entry-sheet | /billing/ses/[id]/approve | — | gerente | SES_APPROVED | 🟡 |
| Issue invoice | POST /api/invoices | invoice | /billing/invoices/new | invoice.routes.test.ts | BILLING | INVOICE_ISSUED | 🟡 |
| Approve invoice | POST /api/invoices/:id/approve | invoice-approval | /billing/invoices/[id]/approve | invoice-approval.service.test.ts | gerente | INVOICE_APPROVED | 🔵 |
| Register payment | POST /api/payments | payment | /payments/new | payment.routes.test.ts | FINANCE | PAYMENT_REGISTERED | 🟡 |
| Reconcile payment | POST /api/payments/:id/reconcile | payment | /payments/[id] | payment.service.test.ts | FINANCE | PAYMENT_RECONCILED | 🟡 |

## Operational Support

| Requirement | API | Module | Page | Test | Status |
|------------|-----|--------|------|------|--------|
| Cost dashboard | GET /api/costs | cost | /costs | CostDashboardPage.test.tsx | 🟡 |
| KPI dashboard | GET /api/dashboard | dashboard | /dashboard | dashboard.service.test.ts | 🟡 |
| Fleet management | GET/POST /api/fleet | fleet | /fleet | fleet.service.test.ts | 🟡 |
| Vehicle profile | GET /api/fleet/:id/profile | fleet | /fleet/[id] | — | 🟡 |
| Inventory CRUD | GET/POST /api/inventory | inventory | /inventory | inventory.service.test.ts | 🟡 |
| Maintenance plans | GET/POST /api/maintenance | maintenance | /maintenance | maintenance.service.test.ts | 🟡 |
| Asset management | GET/POST /api/assets | asset | /assets | — | 🟡 |
| Checklists | GET/POST /api/checklists | checklist | /checklists | checklist.service.test.ts | 🟡 |
| Safety analysis (AST) | GET/POST /api/safety-analysis | safety-analysis | /safety-analysis | safety-analysis.service.test.ts | 🟡 |
| Dispatch | GET/POST /api/dispatch | dispatch | /dispatch | dispatch.service.test.ts | 🟡 |
| SLA rules | GET/POST /api/sla | sla | /sla | sla.service.test.ts | 🟡 |
| Notifications | GET /api/notifications | notifications | /notifications | notification.service.test.ts | 🟡 |

## Compliance & Infrastructure

| Requirement | API | Module | Page | Test | Status |
|------------|-----|--------|------|------|--------|
| Audit log query | GET /api/audit | audit | /admin/audit | audit.service.test.ts | 🟡 |
| Offline sync | POST /api/sync | sync | /offline-sync | sync.service.test.ts | 🟡 |
| System config | GET/PUT /api/system-config | system-config | /admin/settings | system-config.service.test.ts | 🟡 |
| ERP connector | POST /api/erp-connectors | erp-connector | /erp-connector | — | 🔵 |
| DIAN invoicing | POST /api/dian | dian | — | dian.service.test.ts | 🔵 |
| AI assistant | POST /api/ai | ai | — | — | 🔵 |
| Admin backups | GET/POST /api/admin/backups | admin-backup | /admin/backups | — | ❌ |
| Privacy requests | POST /api/privacy-requests | privacy-requests | /profile/privacy | — | 🔵 |
| Client portal | GET /api/portal | portal | /portal | portal-pages.spec.ts | 🟡 |

## Legend

| Status | Meaning |
|--------|---------|
| 🟡 | Implemented — all layers present |
| 🔵 | Partial — missing test, UI, or integration |
| ❌ | Broken — reference exists but implementation missing |
| ⚪ | Missing — no code exists |
