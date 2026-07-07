# Baseline Verification Gates — Spec 008

This document establishes the baseline measurements for the verification gates of Cermont S.A.S. before executing the next waves of continuous improvement.

## Summary

| Gate | Status | Details |
|------|--------|---------|
| `git status` | Clean / WIP | Active branch: `refactor/spec-007-memory-innovation`. Uncommitted edits on 3 files. |
| `npm run typecheck` | ✅ PASS | 7/7 workspaces typechecked successfully. |
| `npm run lint` | ✅ PASS | Biome 2.4.12 check passed. |
| `npm test` | ✅ PASS | 1013 tests passed (158 shared, 231 frontend, 624 backend). |
| `npm run build` | ✅ PASS | Production build completed with 89 frontend routes. |
| `npm run contracts:check` | ✅ PASS | Schema contracts match baseline snapshot hashes. |
| `npm run quality:strict` | ✅ PASS | All quality baseline metrics match or exceed target thresholds. |
| `npx react-doctor` | ⚠️ 77/100 | 22 issues found (1 bug error, 6 bug warnings, 6 accessibility, 9 maintainability). |
| `npm run verify` | ✅ PASS | Fully passing verified baseline state. |

---

## Detailed Findings

### 1. React Doctor (Score: 77/100)
React Doctor identified 22 issues:
- **Bugs (1 error, 6 warnings)**:
  - Hydration mismatch warning in `FleetAlertsBanner.tsx` due to `Date.now()` in JSX.
  - Page missing metadata for search previews in `consent/page.tsx` and `privacy/page.tsx`.
  - Event logic handled in an effect in `NewVehicleDrawer.tsx`.
  - State initialized from a mount effect in `FleetAlertsBanner.tsx`.
  - Many related useState calls in `MaintenanceSchedulesPage.tsx`.
- **Accessibility (6 warnings)**:
  - Control missing accessible label in `MediaUploader.tsx`.
  - Role used instead of HTML tag (`role="dialog"` instead of `<dialog>`) in `ConsentGate.tsx`, `NewVehicleDrawer.tsx`, and `OrderTimeline.tsx`.
  - Custom modal instead of native dialog in `ConsentGate.tsx` and `NewVehicleDrawer.tsx`.
- **Maintainability (9 warnings)**:
  - Unused files detected: `media/api/media.ts`, `media/queries.ts`, `media/ui/MediaCard.tsx`, `media/ui/MediaGallery.tsx`, `media/ui/MediaUploader.tsx`, `privacy-requests/*` hooks and UI.

### 2. Weak Tokens Baseline (`tooling/quality/baseline.json`)
The current weak tokens match the baseline exactly:
- `weak-token-a`: 65 / 67
- `weak-token-u`: 597 / 597
- `weak-token-n`: 1449 / 1449
- `weak-token-ud`: 751 / 751

---

## Missing & Existing Documents

| Document | Path | Status |
|----------|------|--------|
| Frontend Route Map | `docs/architecture/FRONTEND_ROUTE_MAP.md` | Existing (Needs revision) |
| API Endpoint Matrix | `docs/architecture/API_ENDPOINT_MATRIX.md` | Existing (Needs revision) |
| Frontend-Backend Matrix | `docs/architecture/FRONTEND_BACKEND_MATRIX.md` | Existing (Verified) |
| Domain Module Map | `docs/architecture/DOMAIN_MODULE_MAP.md` | Missing (To be created) |
| PWA Offline Flow Map | `docs/architecture/PWA_OFFLINE_FLOW_MAP.md` | Missing (To be created) |
| LTG Specification | `LTG_JUAN_DIEGO_AREVALO-3_markdown.md` | Missing from repository |
