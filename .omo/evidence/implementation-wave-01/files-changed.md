# Files Changed — Implementation Wave 01

## New Files
1. `.sisyphus/evidence/implementation-wave-01/audit-before.md`
2. `.sisyphus/evidence/implementation-wave-01/changes-ledger.md`
3. `frontend/src/app/(dashboard)/planning-packet/new/PlanningPacketSignatures.tsx`
4. `frontend/src/app/(dashboard)/evidences/report/page.tsx`
5. `frontend/tests/modules/kits/kit-form.test.tsx`
6. `frontend/tests/modules/planning/planning-signatures.test.tsx`
7. `frontend/tests/modules/evidences/evidence-category.test.ts`

## Modified Files
8. `frontend/src/modules/kits/ui/KitForm.tsx` — Removed unsafe casts, added shared-types enums, adapter
9. `frontend/src/modules/kits/ui/KitWizardForm.tsx` — Removed unsafe casts, added shared-types enums, adapter, fixed cancel link
10. `frontend/src/modules/resources/ui/ResourceForm.tsx` — Removed unsafe casts, added schema.parse()
11. `frontend/src/app/(dashboard)/admin/erp-connectors/page.tsx` — Dead route fix, create dialog
12. `frontend/src/modules/erp-connector/queries.ts` — Added useCreateErpConnector mutation
13. `frontend/src/modules/notifications/hooks/useUnreadCount.ts` — Added auth check for polling
14. `frontend/src/modules/notifications/hooks/useNotifications.ts` — Added auth check for polling
15. `frontend/src/app/(dashboard)/planning-packet/new/page.tsx` — Added signatures, fixed casts

## Pre-existing spec-024 Changes (54 files touched)
- Backend: fleet controller/routes, notifications, service-cases
- Frontend: cockpit, dashboard, fleet, landing page, service-cases, tests
- Packages: shared-types, tooling/quality
