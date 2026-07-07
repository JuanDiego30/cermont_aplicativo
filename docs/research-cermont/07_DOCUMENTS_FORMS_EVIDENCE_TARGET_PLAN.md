# 07 — Documents, Forms, & Evidence Target Plan

## Executive Summary

To support the highly rigorous contractor operations of CERMONT S.A.S., the application requires a state-of-the-art data management core. Rather than storing flat files, the system implements a programmatic, interconnected network of **three foundational engines**:
1. **Document Library (Sistema de Control de Archivos)**
2. **Dynamic Forms Engine (TemplateDraft & versioned checklists)**
3. **Structured Evidence Vault (Structured Media Gallery)**

This document provides the definitive target specifications, Mongoose and Zod schemas, information architectures, and validation routines covering exactly **23 core functional requirements** mapping directly to the 14-step business flow.

---

## Sources & References

- **Canonical Repository Files**:
  - `backend/src/models/Document.ts` — Existing document model.
  - `backend/src/models/Evidence.ts` — Existing evidence model.
  - `backend/src/models/TemplateDraft.ts` — Existing template draft model.
  - `packages/shared-types/src/schemas/` — General Zod contracts folder.
- **Dynamic Data Benchmarks**:
  - **Form.io / JSON Forms**: JSON schema definitions for nested field components.
  - **Open Data Kit (ODK) Collect**: Offline structural forms, repeatable tables, and GPS capturing.

---

## Part 1: Document Library (Requirements 1-8)

The document library acts as the official custodian of all generated records (Proposals, POs, Technical Reports, Delivery Records, SES, and Invoices).

### 1. Unified Document Metadata & Fields
The schema must track structural relationships and prevent orphan states. The target Mongoose schema maps directly to `backend/src/models/Document.ts`:
```typescript
interface IDocumentRecord extends Document {
  serviceCaseId: Types.ObjectId;
  step: number; // 1 to 14
  type: 'PROPOSAL' | 'REPORT' | 'DELIVERY_RECORD' | 'INVOICE' | 'SES' | 'PO' | 'OTHER';
  title: string;
  fileUrl: string;
  fileName: string;
  version: number;
  status: 'DRAFT' | 'REVIEW' | 'APPROVED' | 'ARCHIVED';
  usedIn: {
    reportId?: Types.ObjectId;
    deliveryRecordId?: Types.ObjectId;
    sesId?: Types.ObjectId;
    invoiceId?: Types.ObjectId;
    paymentId?: Types.ObjectId;
  };
  isProtected: boolean;
  createdBy: Types.ObjectId;
  deletedAt?: Date;
}
```

### 2. DocumentPicker UI
A highly responsive component `DocumentPicker` designed using the **Beveren FSM layout**:
- Left panel handles quick filtering: by Category, Case ID, Operational Step, Date Range, and Status.
- Right panel renders the files in a list. When clicked, it displays an overlay drawer containing details and an in-browser PDF preview.

### 3. Contextual Upload Panel
When a user accesses a specific step in the Case Cockpit (e.g., Step 4: Purchase Order), the upload widget dynamically configures its payload:
- Auto-injects `serviceCaseId`, `step: 4`, and `type: 'PO'`.
- Enforces specific file requirements (e.g., PDF format only, max 10MB).

### 4. Select Existing / File Reutilization
To prevent redundant uploads (such as uploading the same site plan multiple times), the `DocumentPicker` allows supervisors to browse previously uploaded documents inside the case and link them to a new step, creating a new virtual reference in the database instead of duplicating the physical file.

### 5. Advanced Search & Filtering
The backend supports querying documents via:
`GET /api/v1/documents?serviceCaseId=X&step=4&type=PO&status=APPROVED&search=Plan`

### 6. Interactive Document Preview
The frontend provides zero-download, interactive document previews:
- **PDFs**: Rendered inline using `react-pdf` or browser native sandboxed frames.
- **Images**: Renders in a responsive lightbox with zoom, rotation, and EXIF metadata view.

### 7. Core Protection against Deletion
If any value in `usedIn` is present, `isProtected` evaluates to `true`.
- **Backend Guard**: A Mongoose pre-delete middleware rejects hard deletes:
  ```typescript
  DocumentSchema.pre("remove", function (next) {
    if (this.isProtected) {
      return next(new AppError("Document is referenced in an active report and cannot be deleted", 400));
    }
    next();
  });
  ```
- **Frontend Guard**: The UI disables the delete button, replacing it with a lock icon and a tooltip explaining: *"This file is locked because it is used in Technical Report TR-2026-042."*

### 8. Archive & Retention Policy
- Implement **Soft Delete**: Setting delete flags `deletedAt` without physical file destruction for 90 days.
- **Archiving**: Transitioning status to `'ARCHIVED'` hides files from default views. Files older than 2 years are pushed to deep cloud storage (cold tier) automatically via crons.

---

## Part 2: Dynamic Forms Engine (Requirements 9-15)

Field work is extremely variable. CERMONT supervisors must be able to design checklist forms dynamically without modifying source code.

### 9. JSON Form Schema Specification
The layout of custom forms is declared as a JSON schema. The Zod contract validates template inputs:
```typescript
export const FormFieldSchema = z.discriminatedUnion('type', [
  z.object({
    id: z.string(),
    label: z.string(),
    required: z.boolean(),
    type: z.literal('TEXT'),
    maxLength: z.number().optional()
  }),
  z.object({
    id: z.string(),
    label: z.string(),
    required: z.boolean(),
    type: z.literal('NUMBER'),
    min: z.number().optional(),
    max: z.number().optional()
  }),
  z.object({
    id: z.string(),
    label: z.string(),
    required: z.boolean(),
    type: z.literal('SELECT'),
    options: z.array(z.string()).min(1)
  }),
  z.object({
    id: z.string(),
    label: z.string(),
    required: z.boolean(),
    type: z.literal('GPS')
  }),
  z.object({
    id: z.string(),
    label: z.string(),
    required: z.boolean(),
    type: z.literal('SIGNATURE')
  }),
  z.object({
    id: z.string(),
    label: z.string(),
    required: z.boolean(),
    type: z.literal('REPEAT_GROUP'),
    fields: z.array(z.lazy(() => FormFieldSchema))
  })
]);
```

### 10. Generate Form from Document
When a standard PDF format is uploaded (such as a standard HSE check), supervisors can configure form questions mapping directly to the PDF fields, allowing automatic PDF generation from checklist responses.

### 11. "Other/Custom" Template Fallback
If a job does not fit pre-defined templates, technicians can select "Other/Custom" which renders a generic, robust text/photo checklist ensuring field activity is still logged.

### 12. Strict Validation & Rules
The form engine enforces:
- Mandatory checkmarks.
- Range constraints on numeric inputs (e.g., verifying pressure is between 10 and 150 PSI).
- Conditional branching: Field B displays only if Field A is checked.

### 13. Form Tables
Technicians can log item lists inside a tabular format (e.g., registering parts used with columns: Part Name, Quantity, Unit).

### 14. Repeatable Groups
Enables technicians to dynamically duplicate a set of questions (e.g., logging multiple inspection points under "Repeat inspection checklist per valve").

### 15. Standardized Checklist Templates
Pre-configured, immutable checklist template drafts are built and versioned for:
- **Planning (Step 5)**: Pre-deployment EPP audit and vehicle inspections.
- **Execution (Step 6)**: Activity timers, valving checklists, and pressure logging.
- **Safety / HSE**: AST (Análisis de Seguridad en el Trabajo) checkmarks.

---

## Part 3: Structured Evidence Vault (Requirements 16-23)

Evidences are not just images; they are binding legal records of field execution.

### 16. Evidence Block (Before/During/After)
Supervisors configure specific evidence requirements (e.g., "Must upload 3 BEFORE photos, 2 DURING photos, and 3 AFTER photos"). The UI renders explicit drop-zones for each category.

### 17. Digital Signature Canvas
Captured natively on mobile screens:
- Interactive HTML5 canvas captures touch stroke paths.
- Serialized to PNG Base64 data URLs on check-out.
- Binds metadata: Signer Name, ID Card, timestamp, and IP.

### 18. Mandatory GPS Geolocation
Every photo or signature captured must trigger mobile GPS telemetry. Coordinates are saved inside `gpsCoords` in the DB:
- GPS validation rejects photo submissions if coordinates deviate > 200m from the designated site visit geofence.

### 19. Categorized Gallery UI
Renders a grid organized dynamically by Category tabs (BEFORE / DURING / AFTER). Displays validation status badges: `'PENDING'`, `'APPROVED'`, or `'REJECTED'`.

### 20. Auto-Rename Photographic Files
To avoid unidentifiable names like `IMG_0412.jpeg`, the backend upload controller renames files before cloud storage:
- Pattern: `CASECODE_STEP_CATEGORY_TIMESTAMP_UUID.png`
- *Example*: `SC-2026-0042_STEP7_BEFORE_1716843600_e4d2.png`

### 21. Supervisor Validation Gate
Before a technician can compile a technical report, a supervisor must review the uploaded images inside the gallery, marking them as `'APPROVED'` or `'REJECTED'`. Rejected photos require a typed justification.

### 22. Case Step Association
Every evidence document maps directly to an active case ID and the operational step ID where the media capture occurred.

### 23. Cross-Document Pipeline Integration
Approved photo and signature assets are dynamically parsed by rendering services to assemble Technical Reports, Delivery Records (Actas), SES captures, and invoice sheets automatically.

---

## Technical Audit & Current Codebase Gaps

| # | System Area | Codebase Gap | Remediation Plan |
|---|-------------|--------------|------------------|
| 1 | Document | Lack of `isProtected` checks in delete controllers. | Implement pre-delete Mongoose middlewares. |
| 2 | Zod Schema | No discriminatedUnion in packages. | Declare `FormFieldSchema` inside shared-types. |
| 3 | Upload | No magic bytes checks in file uploads. | Incorporate `file-type` magic bytes checks in uploader. |
| 4 | Telemetry | GPS metadata is omitted in canvas signature. | Capture geolocation in signature wrapper payload. |

---

## Verification & Testing Plan

### Automated Schema Tests (Vitest)
- Verify that Zod validates nested `REPEAT_GROUP` fields:
```bash
npm run test -w shared-types -- --grep "FormFieldSchema"
```
- Verify Mongoose deletion blocks on protected documents:
```bash
npm run test -w backend -- --grep "Document deletion protection"
```

### Manual Quality Assurance
1. **Magic Bytes Validation**:
   - Create a dummy file containing malicious HTML and rename it to `photo.png`.
   - Attempt to upload it through the contextual panel.
   - Verify that the uploader returns `400 Bad Request` with an invalid file signature error.
2. **Canvas Signature**:
   - Draw a signature on `/delivery-records/[id]/sign` while in offline mode inside Chrome DevTools.
   - Click submit and verify that the Base64 payload is correctly buffered inside the IndexedDB store.
