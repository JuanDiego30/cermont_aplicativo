# Module: Invoices & Invoice Approval

## Business Problem
Facturación desde SES aprobada con referencias Ariba (opcional), envío, aprobación interna y aprobación del cliente mediante portal. Incluye facturación electrónica DIAN (campos CUFE, QR, seller/buyer, estado DIAN). Pasos 12-13 del flujo de 14 pasos.

## Roles
| Role Group | Roles |
|------------|-------|
| `BILLING_ACCESS_ROLES` | gerente, residente, hes, coord_administrativo, auxiliar_contable, administrativo, cliente |
| `ADMIN_PLUS_RESIDENTE` | gerente, residente, administrativo — create, issue, submit, cancel |
| `MANAGEMENT_ROLES` | gerente, residente — approve, reject |
| `CERMONT_ROLES.CLIENTE` | Approve/reject via portal (InvoiceApproval) |

## Use Cases
1. List invoices — filterable by status, workOrderId, clientId, date range, search
2. View invoice detail — DIAN status, seller/buyer, line items, tax breakdown
3. Create invoice from approved SES — auto-populate service lines
4. Create standalone invoice
5. Submit invoice (for internal approval)
6. Approve invoice internally
7. Reject invoice with reason
8. Cancel invoice
9. Request client approval (creates InvoiceApproval)
10. Client approves via portal (InvoiceApproval)
11. Client rejects with structured reason (InvoiceApproval)
12. Correct rejected invoice (InvoiceApproval)
13. View aging dashboard (buckets 0-30, 31-60, 61-90, 90+ days)

## Entities
- **Invoice** — code `INV-{YYYY}-{NNNN}`, workOrderId, SES reference, client, amount, taxAmount, totalAmount, currency (COP/USD/EUR), invoiceLines, taxBreakdown, seller (nit, businessName, address, phone, email), buyer (documentType, documentNumber, businessName, address, email), DIAN fields (cufe, qrCode, dianStatus, dianTrackId, dianDocumentHash), commandHistory
- **InvoiceApproval** — invoiceId, clientId, status (pending/approved/rejected/cancelled), structured rejection reasons

Schemas: `packages/shared-types/src/schemas/invoice.schema.ts`, `invoice-approval.schema.ts`

## States
**Invoice:** `draft` → `issued` → `sent` → `submitted` → `approved` → `accepted` → `paid` | `partially_paid` | `rejected` → `cancelled` | `void`
**DIAN sub-status:** `not_sent` → `submitting` → `accepted` | `rejected` | `failed`
**InvoiceApproval:** `pending` → `approved` | `rejected` → `cancelled`

## Transitions
| From | To | Trigger | Guard |
|------|----|---------|-------|
| draft | submitted | submitInvoice | ADMIN_PLUS_RESIDENTE |
| submitted | approved | approveInvoice | MANAGEMENT_ROLES |
| submitted | rejected | rejectInvoice | MANAGEMENT_ROLES |
| approved | accepted | Client approves InvoiceApproval | — |
| approved | rejected | Client rejects InvoiceApproval | Structured reason |
| approved | paid | markPaid | MANAGEMENT_ROLES |
| approved | partially_paid | Partial payment | Amount < total |
| rejected | draft | correct | ADMIN_PLUS_RESIDENTE |
| draft | cancelled | cancelInvoice | ADMIN_PLUS_RESIDENTE |

## Preconditions (from `closure.rules.ts`)
- SES must be approved before invoice creation (`canCreateInvoice`)
- SES amount must match invoice (`assertInvoiceMatchesServiceEntrySheet`)
- Work order exists and is active
- Client exists with valid tax info

## Blockers
| Code | Condition |
|------|-----------|
| SES_NOT_APPROVED | No approved SES → 409 |
| INVOICE_INTEGRITY_FAIL | SES amount mismatch → 409 |
| DUPLICATE_INVOICE | Invoice already exists for SES → 409 |
| INVALID_DIAN_CONFIG | Missing seller/buyer DIAN fields → 422 |

## Permissions
| Endpoint | Roles |
|----------|-------|
| GET /api/invoices | INTERNAL_ROLES |
| POST /api/invoices/from-service-entry-sheet/:id | ADMIN_PLUS_RESIDENTE |
| GET /api/invoices/:id | INTERNAL_ROLES |
| POST /api/invoices/:id/submit | ADMIN_PLUS_RESIDENTE |
| POST /api/invoices/:id/approve | MANAGEMENT_ROLES |
| POST /api/invoices/:id/reject | MANAGEMENT_ROLES |
| POST /api/invoices/:id/cancel | ADMIN_PLUS_RESIDENTE |
| POST /api/invoice-approvals | ADMIN_PLUS_RESIDENTE |
| PUT /api/invoice-approvals/:id/approve | cliente |
| PUT /api/invoice-approvals/:id/reject | cliente |

## Endpoints
| Method | Path |
|--------|------|
| GET/POST | /api/invoices |
| GET | /api/invoices/:id |
| POST | /api/invoices/from-service-entry-sheet/:id |
| POST | /api/invoices/:id/submit |
| POST | /api/invoices/:id/approve |
| POST | /api/invoices/:id/reject |
| POST | /api/invoices/:id/cancel |
| GET/POST | /api/invoice-approvals |
| GET | /api/invoice-approvals/:id |
| PUT | /api/invoice-approvals/:id/approve |
| PUT | /api/invoice-approvals/:id/reject |
| PUT | /api/invoice-approvals/:id/correct |

Backend: `backend/src/modules/invoice/invoice.{routes,controller,service}.ts`, `invoice-payment.routes.ts`
Backend: `backend/src/modules/invoice-approval/{routes,controller,service}.ts`, `InvoiceApproval.ts`

## Screens
| Route | Purpose |
|-------|---------|
| /billing/invoices/list | Invoice list + filters + status badges |
| /billing/invoices/[id] | Full detail + approval status |
| /billing/invoices/[id]/approve | Client approval portal |
| /billing/invoices/new | Create from SES selector |
| /invoices/[id]/pipeline | Visual pipeline |

Frontend: `frontend/src/modules/invoices/` — ui/ (InvoicePipelinePage, AgingDashboard, InvoiceStatusBadge, PaymentRecordCard), hooks/, api/

## UI States
- **Loading** — skeleton with shimmer
- **Empty** — "No hay facturas" with Create CTA
- **List** — table with code, client, amount, status badge, due date, aging indicator
- **Detail** — summary card + lines + tax + DIAN status + timeline
- **Pipeline** — visual pipeline with current step highlighted
- **Aging** — dashboard with aging buckets
- **Form** — SES selector → auto-fill
- **Offline** — queue mutation for sync

## Audit Events (via `commandHistory`)
`invoice:created`, `invoice:issued`, `invoice:sent`, `invoice:approved`, `invoice:rejected`, `invoice:marked-paid`, `invoice-approval:requested`, `invoice-approval:approved`, `invoice-approval:rejected`, `invoice-approval:corrected`

## Negative Cases
| Case | Expected |
|------|----------|
| Create invoice without approved SES | 409 SES_NOT_APPROVED |
| SES amount mismatch | 409 INVOICE_INTEGRITY_FAIL |
| Mark paid without approval | Blocked by `canRegisterPayment` |
| Duplicate invoice for same SES | 409 |
| Client rejects with invalid reason | Zod validation |
| Void already-paid invoice | 409 conflict |

## E2E Tests
- `backend/tests/services/ses-invoice-payment-workflow.test.ts` — full SES→Invoice→Payment workflow
- `backend/tests/services/payment-business-rules.test.ts` — invoice service mock
- `backend/tests/services/invoice-integrity.service.test.ts` — assertInvoiceMatchesServiceEntrySheet
- `backend/tests/routes/invoice.routes.test.ts` — route tests
- `frontend/tests/e2e/linked-14-step-flow.spec.ts` — A-12 invoice endpoints

## Acceptance Evidence
- Invoice from approved SES auto-populates service lines
- DIAN sub-status tracked independently (not_sent/submitting/accepted/rejected/failed)
- `canCreateInvoice` blocks without approved SES
- `canRegisterPayment` blocks payment without approved invoice
- InvoiceApproval rejection reasons: amount_incorrect, service_not_completed, missing_supporting_documents, duplicate_invoice, contractual_discrepancy, tax_info_incorrect, other
