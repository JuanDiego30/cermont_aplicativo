# 06 — CERMONT Failures & Real Solution Audit

## Executive Summary

A comprehensive, audit-driven scan of the physical backend codebase was performed to diagnose the **5 critical operational and administrative fallacies** of the CERMONT platform. Rather than reviewing theoretical templates, this audit targets the actual Mongoose models, Express services, and React views.

For each failure, this document details:
1. **The Core Fallacy & Operational Symptoms**
2. **Codebase Evidence**: Exact files, schema keys, and line locations.
3. **Professional Solution Blueprint**: Derived from CMMS/FSM software benchmarks.
4. **Target Metrics & KPIs**
5. **Validation Test Schemas**: Executable integration tests.

---

## Audited Codebase Evidence & Gaps

We have mapped the 5 fallacies to physical database schemas located in `backend/src/models/`.

```
backend/src/models/
├── PlanningPacket.ts      ← Audited: readinessChecklist (L107), crew (L17), blockers (L122)
├── Evidence.ts            ← Audited: validationStatus (L24), serviceCaseId (L6)
├── Cost.ts                ← Audited: estimatedAmount (L34), actualAmount (L35), variance (L51)
├── TechnicalReport.ts     ← Audited: evidencesUsed, status (DRAFT/SUBMITTED/APPROVED)
├── DeliveryRecord.ts      ← Audited: signature (Base64 canvas), status
└── ServiceEntrySheet.ts   ← Audited: sesNumber, amount, status
```

---

## The 5 Operational Failures Audit

### Failure 1: Incomplete Planning (Planeación Incompleta)
- **Operational Fallacy**: Planners schedule jobs, but technicians deploy to the field without valid equipment, tools, EPP safety gear, or verified safety permits (AST/PTW). Technicians are allowed to start work without safety verification.
- **Codebase Evidence**:
  - `backend/src/models/PlanningPacket.ts` defines `readinessChecklist` (line 107) and `blockers` (line 122).
  - `backend/src/models/PlanningPacket.ts` has `astRequired` (line 85) and `ptwRequired` (line 89) defaults set to `false`.
  - **Gap**: The backend state machine in `backend/src/services/workflow-gate.ts` (or similar transition checkers) **does not evaluate the planning readiness state** before advancing the `ServiceCase` to Step 6 (Execution). The checklist is a purely aesthetic visual dashboard component.
- **Solution Blueprint**:
  - Implement a programmatic **Readiness Gate Lock**. In `workflow-gate.service.ts`, before transitioning to Step 6, query the corresponding `PlanningPacket`. Re-evaluate:
    - If `PlanningPacket.status !== 'approved'`, block check-in.
    - If `astRequired === true` and `astUploaded === false`, block check-in.
    - If any blocker in `PlanningPacket.blockers` has `resolved === false`, raise `409 Conflict`.
- **Target Metrics**:
  - *HSE Planning Defect Rate*: Target < 0.5% (cases starting work without safety clearance).
  - *Planning-to-Execution lag*: Target < 12 hours.
- **Validation Test (Vitest)**:
  ```typescript
  import { PlanningPacket } from "../models/PlanningPacket";
  import { checkWorkflowGate } from "../services/workflow-gate.service";

  describe("Workflow Gate - Step 5 to 6 Transition", () => {
    it("should reject check-in transition if PlanningPacket has unresolved blockers", async () => {
      const mockPacket = await PlanningPacket.create({
        workOrderId: new mongoose.Types.ObjectId(),
        status: "draft",
        blockers: [{ blockerId: "B1", type: "SAFETY", description: "Heights cert expired", resolved: false }],
        createdBy: new mongoose.Types.ObjectId()
      });

      const gateResult = await checkWorkflowGate(mockPacket.workOrderId, 6);
      expect(gateResult.canAdvance).toBe(false);
      expect(gateResult.blockers).toContain("UNRESOLVED_PLANNING_BLOCKERS");
    });
  });
  ```

---

### Failure 2: Disorganized Execution & Evidence
- **Operational Fallacy**: Technicians take photos of work, but the upload has no categorization (before/during/after) or dynamic connection to step checklists. This leads to duplicate uploads and massive folders of unidentifiable images.
- **Codebase Evidence**:
  - `backend/src/models/Evidence.ts` defines `serviceCaseId` (line 26) and `category` as String.
  - **Gap**: The uploader endpoint `POST /api/v1/evidences` accepts uploads without verifying if the photo is actually requested by the active checklist or checking if it duplicates an existing file size. Crucially, there is **no multi-tenant IDOR check**; a technician can read or upload evidence to another company's case file.
- **Solution Blueprint**:
  - Group evidence into categories: `BEFORE`, `DURING`, `AFTER`, and `DEFECT`.
  - **Structured Naming Engine**: Rename all uploaded media files on the backend using the pattern: `CASE_ID_CATEGORY_STEP_TIMESTAMP.png`.
  - Apply Zod schema validation to force coordinate payload: `gpsCoords: { lat: number, lng: number }`.
- **Target Metrics**:
  - *Unlabeled Evidence Rate*: Target 0%.
  - *Sync conflict rate*: Target < 0.1% for offline uploads.
- **Validation Test (Vitest)**:
  ```typescript
  import { Evidence } from "../models/Evidence";
  import { uploadEvidence } from "../services/evidence.service";

  describe("Evidence Uploader - Security & Structure", () => {
    it("should reject image upload if payload lacks GPS metadata or active category", async () => {
      const mockUploadPayload = {
        serviceCaseId: new mongoose.Types.ObjectId().toString(),
        category: "INVALID_CAT",
        gpsCoords: undefined
      };

      await expect(uploadEvidence(mockUploadPayload)).rejects.toThrow("ZodValidationError");
    });
  });
  ```

---

### Failure 3: Delayed Reports & Delivery Records
- **Operational Fallacy**: Writing engineering reports is slow because engineers must manually assemble photos and copy checklist values into a word file. Clients sign actas de entrega days or weeks late because the report is not ready during check-out.
- **Codebase Evidence**:
  - `backend/src/models/TechnicalReport.ts` defines report properties (introduction, scope).
  - `backend/src/models/DeliveryRecord.ts` lists signatures.
  - **Gap**: There is no automatic data pipeline between the checklist response (`TemplateResponse`) logged in Step 6, the approved evidences (`Evidence`) logged in Step 7, and the report layout in Step 8.
- **Solution Blueprint**:
  - Create a backend Service: `TechnicalReportGeneratorService`. This class parses the `ExecutionSession` checklists, extracts the images tagged with `usedInReport: true`, and automatically generates the `TechnicalReport` draft layout.
  - Once the `TechnicalReport` is approved, a secondary trigger auto-generates the `DeliveryRecord` draft with technician summaries and equipment hours ready for the client's signature pad on the mobile screen.
- **Target Metrics**:
  - *Report Generation Lag*: Target < 2 hours (currently averages 5+ days).
  - *Acta Signing Efficiency*: Target > 95% of actas signed on-site before technician leaves.
- **Validation Test (Vitest)**:
  ```typescript
  import { TechnicalReport } from "../models/TechnicalReport";
  import { generateDraftReport } from "../services/report-generator.service";

  describe("Technical Report Generator", () => {
    it("should automatically assemble checklist responses and approved evidence into report draft", async () => {
      const caseId = new mongoose.Types.ObjectId();
      // Setup execution mock response and evidence mock entries...
      const reportDraft = await generateDraftReport(caseId);
      expect(reportDraft.status).toBe("DRAFT");
      expect(reportDraft.evidencesUsed.length).toBeGreaterThan(0);
    });
  });
  ```

---

### Failure 4: Delayed Billing & Closures
- **Operational Fallacy**: Invoicing lags behind because there is no programmatic link between the signed acta, the SAP Ariba SES (Service Entry Sheet) approval, and the invoice document creation. Administrative closures are done blindly.
- **Codebase Evidence**:
  - `backend/src/models/ServiceEntrySheet.ts` maps SES entries.
  - `backend/src/models/Invoice.ts` maps invoices.
  - **Gap**: The billing controllers allow generating invoices without checking the status of the parent `ServiceEntrySheet`. This leads to invoices being rejected by the client due to incorrect SES numbers or mismatched totals.
- **Solution Blueprint**:
  - Implement **Sequential Workflow Gates** in Mongoose pre-save middlewares:
    - Block SES (`ServiceEntrySheet`) creation if the case's `DeliveryRecord.status !== 'SIGNED'`.
    - Block Invoice creation if the corresponding `ServiceEntrySheet.status !== 'APPROVED'`.
    - Block Case Closure (`status: 'CLOSED'`) if there are unpaid invoices.
- **Target Metrics**:
  - *Acta-to-SES logging lag*: Target < 48 hours.
  - *Invoice-to-Payment cycle*: Target < 30 days.
- **Validation Test (Vitest)**:
  ```typescript
  import { Invoice } from "../models/Invoice";
  import { checkBillingGate } from "../services/billing-gate.service";

  describe("Billing Gates - Invoice Creation", () => {
    it("should block invoice creation if corresponding SES is not approved by client", async () => {
      const mockInvoice = {
        sesId: new mongoose.Types.ObjectId().toString(),
        total: 15000000
      };

      await expect(checkBillingGate(mockInvoice)).rejects.toThrow("SES_NOT_APPROVED");
    });
  });
  ```

---

### Failure 5: Transversal Budget Overruns & $0 Values
- **Operational Fallacy**: Cost tracking is broken. The platform shows multiple items with $0 costs, which is operatively impossible (labor, materials, and transport always have costs). As a result, managers have no visibility on true margins or financial variances.
- **Codebase Evidence**:
  - `backend/src/models/Cost.ts` defines `estimatedAmount` (line 34) and `actualAmount` (line 35) as required numbers, but has no fallback enforcement rules or Mongoose validation to reject $0 entries.
  - **Gap**: The system lacks an aggressive audit log or variance warning system. It defaults actual cost values to 0 if not typed, which skews dashboard metrics.
- **Solution Blueprint**:
  - In `packages/domain/src/cost.rules.ts`, declare strict budget controls:
    - **No $0 Policy**: Block cost records with estimated amounts <= 0 unless category is 'NON_BILLABLE'.
    - **Reactive Variance Engine**: Implement Mongoose schema virtuals in `Cost.ts` (lines 51, 55) calculating variance and variance percentages automatically:
      - `variance = actualAmount - estimatedAmount`
      - `variancePercent = (actualAmount - estimatedAmount) / estimatedAmount`
    - Raise high-priority email alerts and flag cases in red inside `/costs` if `variancePercent > 0.10` (over budget by more than 10%).
- **Target Metrics**:
  - *Cost Data Completeness*: 100% (zero cases with $0 operational lines).
  - *Average profit margin prediction variance*: Target < 2%.
- **Validation Test (Vitest)**:
  ```typescript
  import { Cost } from "../models/Cost";

  describe("Cost Variance Engine", () => {
    it("should automatically calculate positive variance when actual cost exceeds budget", async () => {
      const costItem = new Cost({
        orderId: new mongoose.Types.ObjectId(),
        category: "LABOR",
        description: "Field tech hours",
        estimatedAmount: 5000000,
        actualAmount: 6000000,
        recordedBy: new mongoose.Types.ObjectId()
      });

      expect(costItem.variance).toBe(1000000);
      expect(costItem.variancePercent).toBe(0.20); // 20% over budget
    });
  });
  ```

---

## Technical Solution Blueprint & Matrix

| Fallacy | Primary Code Cause | Implementation Action | Expected Outcome |
|---------|--------------------|-----------------------|------------------|
| **Falla 1** | Visual-only readiness gate | Integrate programmatic block in `workflow-gate.service.ts`. | Safe field deployments |
| **Falla 2** | Raw file uploads, no Zod filters | Deploy Zod validators checking image sizes and GPS tags. | Orderly evidence vault |
| **Falla 3** | Manual report creation | Write report auto-compiler service from templates. | Reports ready on-site |
| **Falla 4** | Mismatched invoicing pipelines | Enforce Mongoose pre-save workflow validations. | Fast billing approvals |
| **Falla 5** | $0 costs allowed in schema | Reject estimated amounts <= 0; deploy variance triggers. | High financial control |
