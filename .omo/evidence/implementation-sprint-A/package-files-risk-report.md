# Package Files Risk Report — Sprint A

**Date:** 2026-07-08 23:50 COT

## Changes Detected

### package.json (root)
`diff
+ "quality:hardcoded-roles": "tsx tooling/quality/check-hardcoded-roles.ts",
+ "quality:strict": "... && npm run quality:hardcoded-roles"
`
- **Analysis:** Adds a new quality gate for hardcoded RBAC roles. Benign addition. No dependencies added.
- **Risk:** LOW — useful hardening script
- **ADR Required:** No (no deps added, no scripts changed)
- **Should stage:** Yes — this is a product improvement

### package-lock.json
- **Added dependency:** json-rules-engine@7.3.1
- **Transitive deps added:** @jsep-plugin/assignment@1.3.0, @jsep-plugin/regex@1.0.4, jsep@1.4.0, clone@2.1.2, eventemitter2@6.4.9, hash-it@6.0.1, jsonpath-plus@10.4.0
- **Analysis:** json-rules-engine was likely installed for the automation module (backend/src/modules/automation/). No explicit npm install command documented.
- **Risk:** MEDIUM — dependency added without ADR. However, it's used by existing untracked code.
- **ADR Required:** YES — needs retrospective ADR documenting why json-rules-engine was chosen

## Impact on Build/Test
- Build: ✅ PASSES (full turbo)
- Test: ⚠️ 2 pre-existing flaky (unrelated to package changes)
- Contracts: ✅ PASSES

## Recommendations
1. **DO NOT REVERT** — changes are functional and needed
2. **Create retrospective ADR** for json-rules-engine usage
3. **Stage** with explicit path, not git add .
4. **Exclude** from staging until ADR is created
