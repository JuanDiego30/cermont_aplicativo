# Contract Audit — Sprint 0

**Date:** 2026-07-08 15:45 COT  
**Generator:** Sisyphus (CERMONT Contract-First Execution)

## Scope

Audit of `packages/shared-types/src/schemas/` focused on:
- Planning
- Kits/Tools/Equipment
- Forms/Checklists
- Evidence
- Costs
- Domain rules

## Schema Maturity Assessment

### M0 — Foundation Schemas (Common)

| Schema | Lines | Status | Notes |
|--------|-------|--------|-------|
| `common.schema.ts` | 35 | ✅ | ObjectId, Pagination, Mongoose/Auditable/SoftDelete documents |
| `domain-blocker.schema.ts` | 98 | ✅ | 38 blocker codes, 3 severity levels, artifact types |
| `file-asset.schema.ts` | 274 | ✅ | Very comprehensive: 18 categories, sync, entity types, upload, presets |

### Planning (M6)

| Schema | Lines | Status | Notes |
|--------|-------|--------|-------|
| `planning-packet.schema.ts` | 389 | ✅ MATURE | 28+ fields: schedule, crew, materials, tools, equipment, safety, workerRequirements, responsibles, certifications, supportDocuments, readiness, blockers, costBaselineSnapshot, approvals |

### Kits / Tools / Equipment (M7)

| Schema | Lines | Status | Notes |
|--------|-------|--------|-------|
| `kit.schema.ts` | 329 | ✅ MATURE | 10 item categories, safety requirements, readiness rules, checklists, documents, usage tracking, enriched items |
| `tool.schema.ts` | (ref in index) | ✅ | Certifications, documents, evidence requirements, calibration |

### Forms / Checklists (M8)

| Schema | Lines | Status | Notes |
|--------|-------|--------|-------|
| `checklist.schema.ts` | ✅ | Exists | |
| `dynamic-form-template.schema.ts` | ✅ | Exists | Sectioned form templates |
| `form-submission.schema.ts` | ✅ | Exists | Submission values, photo attachments |

### Evidence (M11)

| Schema | Lines | Status | Notes |
|--------|-------|--------|-------|
| `evidence.schema.ts` | 381 | ✅ MATURE | V1 + V2 schema, phases, categories (13), workflow FSM, image variants, GPS, offline payload, slots/slot requirements |

### Costs (M15/M18)

| Schema | Lines | Status | Notes |
|--------|-------|--------|-------|
| `cost.schema.ts` | 235 | ✅ MATURE | Categories, budget risk, variance, margin, catalog items, baseline, intelligence summary |
| `cost-cart.schema.ts` | ✅ | Exists | Cart with variance tracking |
| `cost-suggest.schema.ts` | ✅ | Exists | Margin suggestions |
| `cost-traceability.schema.ts` | ✅ | Exists | Traceability with variance |

### Domain Rules

| Rule File | Lines | Status | Notes |
|-----------|-------|--------|-------|
| `planning.rules.ts` | 146 | ✅ | 8 blocker types, severity, isPlanningReady, getMaxBlockerSeverity |
| `kit.rules.ts` | 349 | ✅ VERY MATURE | delete/archive/activate/restore, apply-to-planning, readiness, helpers |
| `cost.rules.ts` | 130 | ✅ | Margin, variance, budget risk (threshold at 80%), gross margin |
| `execution.ts` | Unknown | ✅ | 12 exported functions: blockers, next-actions, create/start/complete/pause/resume/cancel |
| `checklist.rules.ts` | New | ✅ | evaluateChecklistReadiness |
| `closure.rules.ts` | ✅ | canCloseServiceCase, canCreateSES/Invoice/Payment |
| `billing.rules.ts` | ✅ | SES/Invoice/Payment chain |
| `fleet-readiness.rules.ts` | ✅ | Vehicle readiness |
| `spec-015-rules.ts` | ✅ | Preflight gates, SLA risk, evidence completeness, cost risk, FTFR, MTBF, MTTR |

### Shared-types index.ts

Everything properly exported in the barrel file (222 lines).

## Identified Gaps

| Gap | Location | Impact | Priority |
|-----|----------|--------|----------|
| No `canApprovePlanning` domain rule | `planning.rules.ts` | Planning approval gate enforced only in backend, not in domain pure logic | 🟡 Medium |
| No certification expiration validation | `planning.rules.ts` | Readiness check doesn't validate `expiresAt` on RequiredCertification | 🟡 Medium |
| Missing `TaxBreakdown` standalone schema | `shared-types` | Taxes handled inline per schema, not as reusable contract | 🟢 Low |
| Missing `SignatureRef` standalone schema | `shared-types` | Signatures handled inline per schema | 🟢 Low |

## Positive Findings

- No local schema duplication found in frontend or backend
- All schemas use `.strict()` — prevents extra fields
- All schemas have proper defaults
- Evidence V2, Kit V2, Planning Packet are production-quality
- Domain rules are pure functions with no I/O side effects
- Domain index exports every public symbol clearly
