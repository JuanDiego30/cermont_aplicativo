# Unsafe Types Remediation — Block C

**Date:** 2026-07-08

## Target Selection

From the Sprint 0 unsafe-types audit (~80 `Record<string, unknown>` + ~15 `as unknown as`), the top 5 priority services were:
1. `delivery-record.service.ts` (10 instances)
2. `invoice.service.ts` (12 instances)
3. `evidence.service.ts` (5 instances)
4. `kit.service.ts` (3 instances)
5. `planning-packet.service.ts` (14 instances)

## Changes Made

### 1. delivery-record.service.ts (Priority 1 — HIGH)
**Before:** `type DrDoc = Record<string, unknown>` → 6 functions returning `DrDoc` with `as unknown as`
**After:** `type DrDoc = DeliveryRecord` (from `@cermont/shared-types`)
**Impact:** All 6 return types now properly typed from shared contract. 10 unsafe type references replaced.

### 2. invoice.service.ts (Priority 2 — HIGH)
**Before:** `type InvDoc = Record<string, unknown>` → 8 functions returning `InvDoc` with `as unknown as`
**After:** `type InvDoc = Invoice` (from `@cermont/shared-types`)
**Impact:** All 8 return types now properly typed from shared contract. 12 unsafe type references replaced.

### 3. kit.service.ts (Priority 4 — ATTEMPTED)
**Attempted:** Changed `buildKitDocument` return type from `Record<string, unknown>` to `Partial<IKitDocument>`
**Result:** Exposed 7 cascading type incompatibilities in field types (string literal unions, optional fields). Reverted to `Record<string, unknown>` to avoid breaking changes.
**Note:** Requires broader refactoring of CreateKitCommand → Kit schema mapping.

### 4-5: evidence.service.ts / planning-packet.service.ts
Deferred to next sprint due to complexity of type-safe replacements.

## Summary

| Service | Before | After | Status |
|---------|--------|-------|--------|
| delivery-record | `Record<string, unknown>` (10 uses) | `DeliveryRecord` | ✅ Fixed |
| invoice | `Record<string, unknown>` (12 uses) | `Invoice` | ✅ Fixed |
| kit | `Record<string, unknown>` (3 uses) | Reverted | ⚠️ Deferred |
| evidence | `Record<string, unknown>` (5 uses) | — | 🔄 Next sprint |
| planning-packet | `Record<string, unknown>` + `unknown` (14 uses) | — | 🔄 Next sprint |

Total unsafe types remaining: ~76
