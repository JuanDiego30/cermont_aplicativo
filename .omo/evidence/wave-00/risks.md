# Wave 0 — Risks Detected

## Risk 1: React Doctor Version Mismatch
- **Severity:** Medium
- **Description:** Workspace react-doctor v0.5.1 reports 100/100, but npx react-doctor@latest v0.7.1 reports 67/100 with 9 "Missing key in list" findings.
- **Impact:** npm run verify passes because it uses v0.5.1. The latest version flags true issues.
- **Recommendation:** Evaluate each of the 9 findings in Wave 1. All are the same pattern: `key={...} {...spread}` in JSX.

## Risk 2: doctor.config.json Has Performance Disabled
- **Severity:** Low
- **Description:** `frontend/doctor.config.json` sets `"Performance": "off"` category, which may mask performance-related React Doctor findings.
- **Impact:** React Doctor score may not reflect full code quality picture.
- **Recommendation:** Document and evaluate in Wave 1.

## Risk 3: 29 Modified Files Pending
- **Severity:** Low
- **Description:** Branch `implement/spec-024-post-spec022-continuation` has 29 modified/deleted files not yet committed. This is pre-existing work-in-progress from Spec-024.
- **Impact:** Changes to shared-types, backend, and frontend may affect Wave 1 corrections.
- **Recommendation:** Be aware of the diff when implementing Wave 1 changes.

## Risk 4: Weak Tokens Below Baseline
- **Severity:** Low
- **Description:** weak-token-u: 710/714 (4 below baseline), weak-token-ud: 777/781 (4 below baseline). These are within acceptable threshold but show new weak tokens introduced.
- **Impact:** Trend is negative.
- **Recommendation:** Monitor in Wave 1.

## Risk 5: No Dedicated Portal Schema
- **Severity:** Low
- **Description:** No `portal*.schema.ts` exists in shared-types. Portal schemas are handled via existing schemas (invoice-approval, work-request). This may need attention in Wave 10.
- **Impact:** Track for future portal implementation.

## Risk 6: No `rg` (ripgrep) Available on System
- **Severity:** Informational
- **Description:** The plan relies on `rg` for duplicate searches. Windows system only has `Select-String` available.
- **Impact:** Slight workflow change needed for anti-duplication protocol.
- **Recommendation:** Use `Select-String` or `Get-ChildItem -Recurse | Select-String` as ripgrep alternative.
