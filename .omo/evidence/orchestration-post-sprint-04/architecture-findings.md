# Architecture Findings — Post-Sprint 4 Audit

**Date:** 2026-07-08

---

## Unsafe Types (backend/src/)
**Record<string, unknown> / s unknown as / s never:** 194 matches in 58 files
- **Alto:** administrative-workflow.service.ts (16), technical-report.service.ts (11), invoice.service.ts (10), service-entry-sheet.service.ts (10)
- **Bloqueante:** sanitize.middleware.ts (6 casts), optimistic-concurrency plugin (3)
- **Falso positivo:** contractSnapshot.ts (test utility)

## Local Zod Schemas (frontend/src)
3 files with z.object outside shared-types (SSOT violation — alto):
- **Alto:** frontend/src/modules/kits/ui/KitWizardForm.tsx
- **Alto:** frontend/src/modules/kits/ui/KitForm.tsx
- **Alto:** frontend/src/modules/fleet/ui/NewVehicleDrawer.tsx

## Backend Middleware Chain (routes)
All 70+ .routes.ts files follow pattern: authenticate → authorize → validateBody/Query/Params → controller
- **Falso positivo:** Pattern is correct and consistently applied

## Frontend Fetch Patterns
No direct etch() in components — all use TanStack Query + apiClient
- **Bajo:** Some test files use mock fetch patterns (expected)

## TODO/FIXME
3 real findings in source (not tests/docs):
- backend/src/modules/documents/file.service.ts (2)
- backend/src/modules/services/messaging/sms.gateway.ts (1)
- **Bajo:** Mostly documentation TODOs

## Classification Summary
| Severity | Count | Examples |
|----------|-------|---------|
| Bloqueante | 0 | — |
| Alto | 6 | unsafe types in critical services, 3 local zod schemas |
| Medio | 10+ | quality:weak-tokens baseline drift, language baseline drift |
| Bajo | 3 | TODO/FIXME in non-critical files |
| Falso positivo | ~50 | Mongoose schemas needing unknown, legitimate test mocks |
