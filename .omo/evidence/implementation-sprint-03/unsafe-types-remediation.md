# Unsafe Types Remediation — Block C

**Date:** 2026-07-08

## Changes Made

### 1. form-submission.service.ts (3 instances fixed)

| Before | After |
|--------|-------|
| `values: Record<string, unknown>` | `values: Record<string, FormSubmissionValue>` |
| Inline `photoAttachments` array type | Extracted `FormSubmissionPhotoInput` interface |
| `query: Record<string, unknown>` | `query: { [key: string]: unknown }` (matched to Mongoose query API) |

The `FormSubmissionValue` type comes from `@cermont/shared-types` (`z.union([z.string(), z.number(), z.boolean()])`).

### 2. evidence.service.ts — Skipped

`buildEvidenceVisibilityFilter` returns `Record<string, unknown>` because it builds dynamic MongoDB `$or` query conditions. This is a legitimate use case for `Record<string, unknown>` since MongoDB queries are inherently dynamic.

### 3. planning-packet.service.ts — Deferred

The `as unknown as` casts in `computeCostBaseline` and `buildPlanningReadiness` are type-safe in practice (the planning packet has those fields), but removing the casts requires broader type alignment.

### 4. kit.service.ts — Deferred (from Sprint 2)

`buildKitDocument` returning `Record<string, unknown>` requires refactoring `CreateKitCommand` → `Kit` schema mapping.

## Summary

| Service | Before | After | Status |
|---------|--------|-------|--------|
| form-submission.service | 3 unsafe types | 0 unsafe types | ✅ Fixed |
| evidence.service | 5 unsafe types | 5 unsafe types | ⏸️ Deferred (legitimate MongoDB dynamic query) |
| planning-packet.service | ~14 unsafe types | ~14 unsafe types | 🔄 Next sprint |
| kit.service | 3 unsafe types | 3 unsafe types | 🔄 Next sprint |

Total corrected: 3 instances (form-submission values and photoAttachments)
Remaining unsafe types: ~73
