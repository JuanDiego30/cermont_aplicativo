# Unsafe Types Audit — Sprint 0

**Date:** 2026-07-08 15:45 COT  
**Generator:** Sisyphus (CERMONT Contract-First Execution)

## Findings by Category

### 1. `Record<string, unknown>` in Backend Services (HIGH volume)

Found ~80+ instances across:
- `backend/src/services/` (delivery-record, invoice, document, evidence, kit, etc.)
- `backend/src/models/` (Document, Inspection, MaintenanceKit, Notification, Report, Resource, TemplateDraft, TemplateResponse)
- `backend/src/modules/` (various services)

**Pattern:** Used for dynamic query building and JSON serialization/deserialization.

**Risk:** HIGH - Type erasure hides real contract violations. Any cast from `Record<string, unknown>` to a typed interface bypasses Zod validation at the type level.

### 2. `as unknown as` casts

Found in:
- `backend/src/services/delivery-record.service.ts` (DrDoc pattern)
- `backend/src/services/invoice.service.ts` (InvDoc pattern)
- `backend/src/services/kit.service.ts`
- `backend/src/services/automation.service.ts`

**Pattern:** `JSON.parse(JSON.stringify(doc)) as unknown as DrDoc` — serializes to JSON then casts through `unknown` to bypass TypeScript.

**Risk:** HIGH - Completely bypasses type safety. Common in service layers that handle dynamic Mongoose documents.

### 3. `Record<string, unknown>` in Form models

Found in:
- `models/FormSubmission.ts` line 21: `values: Record<string, unknown>`
- `models/TemplateResponse.ts` line 150: `values?: Record<string, unknown>`

**Risk:** MEDIUM - Form values are dynamic by nature, but there's no Zod validation for form field shapes before they enter `Record<string, unknown>`.

### 4. `Record<string, unknown>` in backend modules

Found in:
- `admin-backup.service.ts`, `analytics-report.service.ts`, `asset.service.ts`, `automation.service.ts`, `business-document.service.ts`, `checklist.service.ts`, `client.service.ts`, `client-signature.service.ts`, `custom-field.service.ts`, `evidence.service.ts`, `fleet.service.ts`, `form-submission.service.ts`, `inspection.service.ts`, `inventory.service.ts`, `kpi.service.ts`

## Recommendations

1. **P0 — Fix delivery-record and invoice services** (most egregious — `DrDoc`/`InvDoc` pattern with `as unknown as`)
2. **P1 — Replace `Record<string, unknown>` with typed contracts** in critical paths (planning, kit, evidence)
3. **P2 — Add Zod validation before `Record<string, unknown>`** in form submission handlers

## Notes

- Many instances are reactive query builders where dynamic MongoDB filters are needed — these are harder to type-safely replace
- The most impactful fixes are in services that return API responses, where `as unknown as` bypasses the contract entirely
