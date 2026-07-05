# 03 — 14 Steps Page & Module Blueprint (Cermont Target Flow)

## Executive Summary

The CERMONT operational platform is structured as a document-driven business lifecycle digitizing the full multi-service contractor workflow across **14 distinct operational and administrative steps**. 

By analyzing professional FSM (Field Service Management) and CMMS (Computerized Maintenance Management System) benchmarks, we have structured each step of the CERMONT flow with:
1. **Business objective and operational value**
2. **Strict data models and schemas** (Zod contracts and Mongoose models)
3. **Frontend components, route mapping, and UI states**
4. **Offline support strategies and security guardrails** (OWASP hardening, RBAC matrix, IDOR protections)
5. **Real codebase gaps and remediation recommendations**

This document establishes the canonical target design for the 14-step workflow, serving as the technical source of truth for downstream implementation.

---

## Sources & References

- **Canonical Repository Documents**:
  - `docs/domain/CERMONT_BUSINESS_FLOW_MAP.md` — 14-step business map, status definitions, and RBAC matrix.
  - `docs/product/CERMONT_PRODUCT_BLUEPRINT.md` — Product vision and operational constraints.
  - `docs/architecture/FRONTEND_ROUTE_MAP.md` — App Router structure and routing rules.
  - `docs/architecture/API_ENDPOINT_MATRIX.md` — REST API endpoint registry and Zod validations.
- **Professional FSM Benchmarks**:
  - **Odoo Field Service**: Job and scheduling lifecycle patterns.
  - **MaintainX / OCA Field Service**: Mobile-first checklist design, execution tracking, and offline data sync.
  - **SAP FSM / ERPNext**: Financial close, invoice approvals, and Service Entry Sheet workflows.

---

## The 14-Step Target Design

### Step 1: Work Request (Solicitud Formal)
- **Objective**: Formally register a customer's corrective or preventive maintenance request before committing engineering resources.
- **Data Model (packages/shared-types/src/schemas/work-request.schema.ts)**:
  ```typescript
  export const WorkRequestSchema = z.object({
    id: z.string().uuid(),
    code: z.string().regex(/^WR-\d{4}-\d{4}$/), // e.g., WR-2026-0001
    title: z.string().min(5).max(100),
    description: z.string().min(10),
    clientId: z.string(),
    siteId: z.string(),
    requestedBy: z.string(),
    priority: z.enum(['LOW', 'MEDIUM', 'HIGH', 'CRITICAL']),
    type: z.enum(['CORRECTIVE', 'PREVENTIVE', 'INSPECTION', 'INSTALLATION']),
    status: z.enum(['DRAFT', 'SUBMITTED', 'ACCEPTED', 'REJECTED']),
    attachments: z.array(z.object({ name: z.string(), url: z.string() })),
    createdAt: z.date(),
    deletedAt: z.date().optional()
  });
  ```
- **Backend Endpoints**:
  - `POST /api/v1/work-requests` — Create request
  - `GET /api/v1/work-requests?status=SUBMITTED&page=1` — List submitted requests
  - `PATCH /api/v1/work-requests/:id/accept` — Accept request and advance status
- **Frontend Views**:
  - `/work-requests` (Dashboard request list)
  - `/work-requests/new` (Creation form utilizing `react-hook-form` + Zod)
  - `/work-requests/[id]` (Request detailed view)
- **Offline Strategy**: Cached draft creation in IndexedDB. Stores a local draft with a generated UUID. Mutation queued in the `outbox` table for sync when network is restored.
- **Security Guardrails**:
  - **IDOR Protection**: The query filters `clientId` against `req.user.clientId` unless `req.user.role === 'GER'`.
  - **Input Sanitization**: HTML escaping on description to prevent XSS.
- **Codebase Gaps**: The model exists but IDOR check is bypassed in multiple backend query controllers, allowing potential cross-tenant visibility.
- **Priority**: High (P0)

---

### Step 2: Site Visit (Visita Técnica)
- **Objective**: Conduct a physical inspect at the client site to gather technical requirements, take measurements, and verify feasibility.
- **Data Model (packages/shared-types/src/schemas/site-visit.schema.ts)**:
  ```typescript
  export const SiteVisitSchema = z.object({
    id: z.string().uuid(),
    workRequestId: z.string(),
    serviceCaseId: z.string().optional(),
    scheduledDate: z.date(),
    technicianId: z.string(),
    location: z.string(),
    observations: z.string(),
    photos: z.array(z.object({ category: z.string(), url: z.string() })),
    checklistCompleted: z.boolean(),
    status: z.enum(['SCHEDULED', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED'])
  });
  ```
- **Backend Endpoints**:
  - `POST /api/v1/site-visits` — Schedule a technical visit.
  - `GET /api/v1/site-visits/:id` — Detail view.
  - `PATCH /api/v1/site-visits/:id/complete` — Log visit completion and submit findings checklist.
- **Frontend Views**:
  - `/site-visits` (Technician visit schedule)
  - `/site-visits/[id]/checklist` (Interactive checklist with photo uploads)
- **Offline Strategy**: Full checklist persistence in IndexedDB. Photo binary files (blobs) are stored in the IndexedDB local store and synced using a background worker (via Serwist/Workbox) upon reconnection.
- **Security Guardrails**:
  - **RBAC Matrix**: Only `RES` (Residente), `GER` (Gerente), or `OPE` (Operador/technician) can edit visits.
  - **GPS Validation**: Captures GPS coordinates of the technician during visit submit to verify physical attendance.
- **Codebase Gaps**: Dynamic checklists are hardcoded in the frontend, preventing the backend from serving customized questions based on visit types.
- **Priority**: Medium (P1)

---

### Step 3: Proposal Economic (Propuesta Económica)
- **Objective**: Draft and submit a detailed economic budget proposal to the client based on the site visit report.
- **Data Model (packages/shared-types/src/schemas/proposal.schema.ts)**:
  ```typescript
  export const ProposalSchema = z.object({
    id: z.string().uuid(),
    code: z.string().regex(/^PROP-\d{4}-\d{4}$/),
    workRequestId: z.string(),
    siteVisitId: z.string().optional(),
    clientId: z.string(),
    items: z.array(z.object({
      description: z.string(),
      quantity: z.number().positive(),
      unitPrice: z.number().nonnegative(),
      total: z.number().nonnegative()
    })),
    subtotal: z.number().nonnegative(),
    tax: z.number().nonnegative(),
    total: z.number().nonnegative(),
    currency: z.literal('COP'),
    validUntil: z.date(),
    terms: z.string(),
    status: z.enum(['DRAFT', 'SENT', 'APPROVED', 'REJECTED', 'EXPIRED']),
    version: z.number().default(1)
  });
  ```
- **Backend Endpoints**:
  - `POST /api/v1/proposals` — Create proposal.
  - `GET /api/v1/proposals/:id/pdf` — Render dynamic PDF proposal via `pdf-lib`.
  - `PATCH /api/v1/proposals/:id/status` — Advance proposal status (client decision).
- **Frontend Views**:
  - `/proposals` (List with versioning and client feedback metrics)
  - `/proposals/new` (Proposal item builder with reactive tax calculations)
- **Offline Strategy**: Read-only cache of sent proposals. Creation of proposals is restricted to online mode due to live price catalog dependencies.
- **Security Guardrails**:
  - **Integrity Check**: Re-evaluates mathematical totals on the backend using Mongoose middleware to avoid client payload price manipulation.
- **Codebase Gaps**: Total sums are calculated exclusively on the client and accepted by the backend as-is without validation, creating a price manipulation vulnerability.
- **Priority**: Medium (P1)

---

### Step 4: Purchase Order Approval (Orden de Compra)
- **Objective**: Secure client purchase order (PO) approval as the binding legal authorization to begin work planning.
- **Data Model (packages/shared-types/src/schemas/purchase-order.schema.ts)**:
  ```typescript
  export const PurchaseOrderSchema = z.object({
    id: z.string().uuid(),
    proposalId: z.string(),
    poNumber: z.string().min(3),
    poDocumentUrl: z.string().url(),
    approvedBy: z.string(),
    approvedDate: z.date(),
    amount: z.number().positive(),
    status: z.enum(['RECEIVED', 'VERIFIED', 'REJECTED'])
  });
  ```
- **Backend Endpoints**:
  - `POST /api/v1/purchase-orders` — Upload PO document and metadata.
  - `GET /api/v1/purchase-orders/:id` — Detail view.
  - `PATCH /api/v1/purchase-orders/:id/verify` — Supervisor verification endpoint.
- **Frontend Views**:
  - `/purchase-orders/upload` (Document upload panel with metadata entry)
- **Offline Strategy**: Read-only view. Uploads are strictly blocked offline to ensure instantaneous backend validation and cloud storage availability.
- **Security Guardrails**:
  - **Workflow Gate**: The system raises an operational blocker if a proposal is marked as `APPROVED` but lacks a verified `PurchaseOrder`. The state machine prevents transitioning to Step 5 (Planning).
- **Codebase Gaps**: The transition logic from proposal to planning is not strictly blocked by PO presence, allowing planners to schedule work without client PO coverage.
- **Priority**: High (P0)

---

### Step 5: Planning Packet (Planeación de Obra)
- **Objective**: Organize technical resources, materials, equipment, certifications, AST (Análisis de Seguridad en el Trabajo), and PTW (Permisos de Trabajo) before fieldwork begins.
- **Data Model (packages/shared-types/src/schemas/planning.schema.ts)**:
  ```typescript
  export const PlanningSchema = z.object({
    id: z.string().uuid(),
    serviceCaseId: z.string(),
    startDate: z.date(),
    endDate: z.date(),
    technicianIds: z.array(z.string()),
    kitIds: z.array(z.string()), // assigned equipment packets
    safetyPermits: z.array(z.object({
      type: z.string(), // e.g., 'ALTURAS', 'CONFINADO'
      documentUrl: z.string().url(),
      validUntil: z.date()
    })),
    readinessStatus: z.enum(['INCOMPLETE', 'READY', 'BLOCKED']),
    readinessGateChecks: z.array(z.object({
      name: z.string(),
      passed: z.boolean(),
      notes: z.string().optional()
    }))
  });
  ```
- **Backend Endpoints**:
  - `POST /api/v1/plannings` — Register plan packet.
  - `GET /api/v1/plannings/readiness-gate/:serviceCaseId` — Retrieve planning gate status.
  - `PATCH /api/v1/plannings/:id` — Update plans.
- **Frontend Views**:
  - `/planning` (Gantt/Calendar schedule panel)
  - `/planning/[id]/readiness-gate` (Visual checklist representing readiness gate status)
- **Offline Strategy**: Planning packets are cached on local IndexedDB for technicians assigned to cases, allowing them to review plans in the field.
- **Security Guardrails**:
  - **Safety Gate**: Technician certifications (e.g., Working at Heights) are cross-referenced with the `startDate` and must be active to authorize deployment.
- **Codebase Gaps**: High risk. The frontend does not show a clear readiness gate, and technicians can check-in for execution without safety permit verification.
- **Priority**: High (P1)

---

### Step 6: Execution Session (Sesión de Ejecución)
- **Objective**: Execute physical work at the site, logging hours, checklists, and incident reports in real time.
- **Data Model (packages/shared-types/src/schemas/execution.schema.ts)**:
  ```typescript
  export const ExecutionSchema = z.object({
    id: z.string().uuid(),
    planningPacketId: z.string(),
    technicianId: z.string(),
    checkInTime: z.date(),
    checkOutTime: z.date().optional(),
    checklistResponse: z.record(z.any()), // dynamically generated forms
    status: z.enum(['ACTIVE', 'PAUSED', 'COMPLETED', 'CANCELLED']),
    incidents: z.array(z.object({
      time: z.date(),
      description: z.string(),
      severity: z.enum(['LOW', 'MEDIUM', 'HIGH'])
    }))
  });
  ```
- **Backend Endpoints**:
  - `POST /api/v1/executions/check-in` — Check-in session.
  - `POST /api/v1/executions/check-out` — Complete work check-out.
  - `PATCH /api/v1/executions/:id/checklist` — Save dynamic checklist responses.
- **Frontend Views**:
  - `/execution/session` (Active cockpit for technicians with Timer, Check-Out buttons, and Checklist inputs)
- **Offline Strategy**: High priority. Complete ExecutionSession state resides in IndexedDB. Mutates draft payload continuously as technician responds to inputs. Checked out logs are queued in the outbox.
- **Security Guardrails**:
  - **Active Session Check**: Backend restricts a single active `ExecutionSession` per technician at any given time.
- **Codebase Gaps**: Execution session does not enforce single active checks, and dynamic checklist submissions lack validation schemas.
- **Priority**: High (P1)

---

### Step 7: Evidence Manager (Gestión de Evidencias)
- **Objective**: Collect digital evidence (photos, documents) categorized as before/during/after, ensuring secure metadata capture.
- **Data Model (packages/shared-types/src/schemas/evidence.schema.ts)**:
  ```typescript
  export const EvidenceSchema = z.object({
    id: z.string().uuid(),
    serviceCaseId: z.string(),
    category: z.enum(['BEFORE', 'DURING', 'AFTER', 'DEFECT', 'COMPLETION']),
    component: z.string().optional(),
    step: z.number().int().positive(),
    fileUrl: z.string().url(),
    fileName: z.string(),
    caption: z.string().max(200).optional(),
    gpsCoords: z.object({
      lat: z.number(),
      lng: z.number()
    }).optional(),
    takenAt: z.date(),
    takenBy: z.string(),
    validationStatus: z.enum(['PENDING', 'APPROVED', 'REJECTED']),
    usedInReport: z.boolean().default(false)
  });
  ```
- **Backend Endpoints**:
  - `POST /api/v1/evidences` — Upload evidence file with metadata.
  - `DELETE /api/v1/evidences/:id` — Safely delete evidence (prevented if `usedInReport` is true).
  - `PATCH /api/v1/evidences/:id/validate` — Validate evidence category.
- **Frontend Views**:
  - `/evidences` (Media gallery organized by category with drag-and-drop uploads)
- **Offline Strategy**: High priority. Evidence is captured offline. Camera images are converted to binary Blobs, saved to IndexedDB local DB, and registered with pending outbox mutations. Renaming logic is applied before sync.
- **Security Guardrails**:
  - **OWASP Upload Hardening**: Re-validates files on upload using MIME type verification and Magic Bytes detection.
  - **Deletion Protection**: If `usedInReport === true`, deletion is blocked by the Mongoose pre-remove hook.
- **Codebase Gaps**: Critical. No Magic Bytes checks exist in the backend upload endpoint, and there is no deletion protection for evidence already embedded in technical reports.
- **Priority**: High (P0)

---

### Step 8: Technical Report (Informe Técnico)
- **Objective**: Assemble a comprehensive engineering report consolidating site execution checklists, diagrams, and approved photo evidence for the client.
- **Data Model (packages/shared-types/src/schemas/technical-report.schema.ts)**:
  ```typescript
  export const TechnicalReportSchema = z.object({
    id: z.string().uuid(),
    serviceCaseId: z.string(),
    code: z.string().regex(/^TR-\d{4}-\d{4}$/),
    introduction: z.string().min(20),
    scopeExecuted: z.string().min(20),
    evidencesUsed: z.array(z.string()), // Evidence IDs
    conclusions: z.string().min(10),
    status: z.enum(['DRAFT', 'SUBMITTED', 'APPROVED', 'REJECTED'])
  });
  ```
- **Backend Endpoints**:
  - `POST /api/v1/technical-reports` — Create draft report.
  - `GET /api/v1/technical-reports/:id/render` — Export PDF report.
  - `PATCH /api/v1/technical-reports/:id/approve` — Approve report (blocks future changes).
- **Frontend Views**:
  - `/technical-reports/[id]/edit` (Report builder where users can select checked-out evidence cards to embed)
- **Offline Strategy**: Read-only view in offline mode. Creation and editing are restricted to online mode due to PDF assembly processing and layout constraints.
- **Security Guardrails**:
  - **Immutable State**: Once a report is marked as `APPROVED`, Mongoose pre-save middlewares prevent any document edits.
- **Codebase Gaps**: Gaps in the PDF generation engine cause visual layout breaks when rendering tables with multi-line text.
- **Priority**: Medium (P1)

---

### Step 9: Delivery Record (Acta de Entrega)
- **Objective**: Generate a legal delivery record outlining completed works, hours, and technicians, to be presented to the customer.
- **Data Model (packages/shared-types/src/schemas/delivery-record.schema.ts)**:
  ```typescript
  export const DeliveryRecordSchema = z.object({
    id: z.string().uuid(),
    serviceCaseId: z.string(),
    code: z.string().regex(/^ACTA-\d{4}-\d{4}$/),
    reportId: z.string(),
    technicianSummary: z.array(z.object({
      name: z.string(),
      role: z.string(),
      hoursLogged: z.number().positive()
    })),
    clientApprovedItems: z.array(z.string()),
    status: z.enum(['PENDING_SIGNATURE', 'SIGNED', 'REJECTED'])
  });
  ```
- **Backend Endpoints**:
  - `POST /api/v1/delivery-records` — Generate delivery record draft.
  - `GET /api/v1/delivery-records/:id` — Detail view.
- **Frontend Views**:
  - `/delivery-records/[id]` (Record visual details showing summary checklist)
- **Offline Strategy**: The DeliveryRecord document metadata is cached locally, allowing supervisor presentation to client field representatives when cellular signal is absent.
- **Security Guardrails**:
  - **Referential Check**: Restricts delivery record generation to cases with an `APPROVED` TechnicalReport.
- **Codebase Gaps**: Delivery records can be generated for unapproved or draft reports in the current codebase, bypassing workflow hierarchy.
- **Priority**: Medium (P1)

---

### Step 10: Client Signature (Firma del Cliente)
- **Objective**: Capture digital hand-drawn signatures from the client's representative, binding the delivery record with legal acceptance.
- **Data Model (packages/shared-types/src/schemas/client-signature.schema.ts)**:
  ```typescript
  export const ClientSignatureSchema = z.object({
    deliveryRecordId: z.string(),
    signatureDataUrl: z.string().regex(/^data:image\/png;base64,/), // Base64 signature image
    signerName: z.string().min(3),
    signerId: z.string().min(5),
    signedAt: z.date(),
    gpsLocation: z.object({
      lat: z.number(),
      lng: z.number()
    }).optional()
  });
  ```
- **Backend Endpoints**:
  - `POST /api/v1/delivery-records/:id/sign` — Capture digital signature and close delivery record.
- **Frontend Views**:
  - `/delivery-records/[id]/sign` (HTML5 canvas signature pad component)
- **Offline Strategy**: Canvas drawing paths are captured locally and saved as a Base64 string in IndexedDB, queued in the outbox.
- **Security Guardrails**:
  - **Non-Repudiation**: The GPS location and exact UTC timestamp are bundled inside the encrypted signature metadata.
- **Codebase Gaps**: GPS locations are not captured or sent to the backend on mobile signing events, reducing legal compliance.
- **Priority**: High (P1)

---

### Step 11: Service Entry Sheet / Ariba (SES / Registro SAP)
- **Objective**: Log the service entry sheet (SES) number from the client's SAP Ariba portal to confirm billing clearance.
- **Data Model (packages/shared-types/src/schemas/service-entry-sheet.schema.ts)**:
  ```typescript
  export const ServiceEntrySheetSchema = z.object({
    id: z.string().uuid(),
    serviceCaseId: z.string(),
    sesNumber: z.string().min(5),
    submittedDate: z.date(),
    approvedDate: z.date().optional(),
    amount: z.number().positive(),
    status: z.enum(['PENDING', 'SUBMITTED', 'APPROVED', 'REJECTED']),
    evidenceScreenshots: z.array(z.string().url())
  });
  ```
- **Backend Endpoints**:
  - `POST /api/v1/service-entry-sheets` — Log SES details and attach Ariba screenshot evidence.
  - `PATCH /api/v1/service-entry-sheets/:id/status` — Approve or reject SES.
- **Frontend Views**:
  - `/ses` (Billing dashboard filtering cases awaiting SES registration)
- **Offline Strategy**: Read-only tracking dashboard. Uploads of SES are disabled offline.
- **Security Guardrails**:
  - **SES Gate**: Enforces a verified `DeliveryRecord` signature before accepting SES registration.
- **Codebase Gaps**: No verification is done on the backend to match the SES amount with the approved proposal value, allowing data mismatches.
- **Priority**: Medium (P1)

---

### Step 12: Invoicing (Facturación)
- **Objective**: Generate and submit the commercial invoice referencing the approved SES number.
- **Data Model (packages/shared-types/src/schemas/invoice.schema.ts)**:
  ```typescript
  export const InvoiceSchema = z.object({
    id: z.string().uuid(),
    invoiceNumber: z.string().regex(/^FACT-\d{4}-\d{4}$/),
    sesId: z.string(),
    items: z.array(z.object({
      description: z.string(),
      amount: z.number().positive()
    })),
    subtotal: z.number().positive(),
    tax: z.number().nonnegative(),
    total: z.number().positive(),
    status: z.enum(['DRAFT', 'SENT', 'APPROVED', 'PAID', 'CANCELLED']),
    issuedDate: z.date(),
    dueDate: z.date()
  });
  ```
- **Backend Endpoints**:
  - `POST /api/v1/invoices` — Create invoice based on SES.
  - `PATCH /api/v1/invoices/:id/send` — Mark invoice as sent to the client.
- **Frontend Views**:
  - `/invoices` (List and detail tracking views with countdown to due dates)
- **Offline Strategy**: Read-only view.
- **Security Guardrails**:
  - **Amount Guard**: Backend restricts invoice amount totals to match approved SES totals.
- **Codebase Gaps**: Mismatch between proposal subtotal and invoice subtotal is possible because no programmatic correlation checks are executed.
- **Priority**: High (P1)

---

### Step 13: Invoice Approval (Aprobación de Factura)
- **Objective**: Track client commercial approval of the invoice, setting up payment timeline metrics.
- **Data Model (packages/shared-types/src/schemas/invoice-approval.schema.ts)**:
  ```typescript
  export const InvoiceApprovalSchema = z.object({
    invoiceId: z.string(),
    approvedBy: z.string(),
    approvedDate: z.date(),
    paymentDueDate: z.date(),
    observations: z.string().optional()
  });
  ```
- **Backend Endpoints**:
  - `POST /api/v1/invoices/:id/approve` — Commercial invoice approval registration.
- **Frontend Views**:
  - `/invoices/[id]/approve` (Approval registration panel with date adjustments)
- **Offline Strategy**: Read-only.
- **Security Guardrails**:
  - **Immutable State**: Transitioning invoice status to `APPROVED` locks down the billing object.
- **Codebase Gaps**: Approval events are registered as raw text in comments instead of updating a structured state machine.
- **Priority**: Medium (P1)

---

### Step 14: Payment & Close (Pago y Cierre Definitivo)
- **Objective**: Reconcile payment transaction, close the case file, and generate marginal profit records.
- **Data Model (packages/shared-types/src/schemas/payment.schema.ts)**:
  ```typescript
  export const PaymentSchema = z.object({
    id: z.string().uuid(),
    invoiceId: z.string(),
    serviceCaseId: z.string(),
    amount: z.number().positive(),
    method: z.enum(['TRANSFER', 'CHECK', 'OTHER']),
    reference: z.string(),
    paidAt: z.date(),
    evidenceUrl: z.string().url().optional(),
    status: z.enum(['PENDING', 'CONFIRMED', 'RECONCILED'])
  });
  ```
- **Backend Endpoints**:
  - `POST /api/v1/payments` — Register payment receipt.
  - `POST /api/v1/service-cases/:id/close` — Final closure check and archiving.
- **Frontend Views**:
  - `/dashboard/payments` (Financial reconciliation cockpit)
- **Offline Strategy**: Read-only.
- **Security Guardrails**:
  - **Closure Rules**: ServiceCase state transition to `CLOSED` triggers a job to clean active cache items and locks all child sub-documents from changes.
- **Codebase Gaps**: Case closure does not lock sub-documents, allowing retroactive edits to planning and evidence on closed cases.
- **Priority**: High (P1)

---

## Technical Gap Analysis & Recommendations

| Step | Current State Gap | Core Recommendation | Impact of Fix |
|------|-------------------|---------------------|---------------|
| 1 | Lack of multi-tenant IDOR validation checks. | Inject tenant middleware on route controllers. | High security |
| 4 | Purchase order verify is skipped for planning. | Apply strict state machine gates on backend services. | Prevents unbilled work |
| 5 | Readiness gate is an optional visual hint. | Restrict execution check-ins if readiness is `BLOCKED`. | Physical Safety |
| 7 | Upload endpoint allows direct shell/HTML upload. | Implement Magic Bytes validation and image transcoding. | OWASP Compliance |
| 10 | Signature is sent without location metadata. | Capture mobile device GPS and bundle in payload. | Non-repudiation |
| 14 | Closed cases can be retroactively edited. | Apply pre-save Mongoose locks for closed parent cases. | Audit Compliance |

---

## Verification & Testing Plan

### Automated Tests
1. **Contract Validation (packages/shared-types)**:
   - Run Vitest schema validation to check type mapping.
   ```bash
   npm run test -w shared-types
   ```
2. **State Machine Transitions (backend)**:
   - Perform integration tests validating sequential blocks (e.g., verify that Step 6 is unreachable if Step 4 is missing).
   ```bash
   npm run test -w backend -- --grep "State Machine"
   ```

### Manual Verification
- Deploy to test staging environment and verify:
  - Client representatives are restricted from reading other client's Proposals.
  - File uploader blocks `text/html` files masked as `.png`.
  - Signature pad functions correctly when disconnected from cellular network in device emulator.
