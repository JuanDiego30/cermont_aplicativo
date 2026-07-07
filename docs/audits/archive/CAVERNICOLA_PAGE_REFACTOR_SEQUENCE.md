# CAVERNICOLA Page Refactor Sequence

**Generated:** 2026-06-03  
**Rule:** Refactor one page at a time. Run page gates after each critical page change.

## Sequence

| Order | Page/group | Primary reason | First check before editing |
|---:|---|---|---|
| 1 | `/purchase-orders/new` | Step 4 was a runtime blocker; page exists but attachments/RBAC UX remain | Confirm `RegisterPurchaseOrderSchema` and backend route still match |
| 2 | `/resources` | Resources/kits unblock planning and execution | Confirm typed 503, category/status/unit fields, empty state |
| 3 | `/resources/kits` and `/resources/kits/new` | Kits solve missing tools/equipment planning issue | Confirm `KitSchema`, `MaintenanceKitSchema`, model route ownership |
| 4 | `/planning`, `/planning/[id]` | Field execution depends on approved planning | Confirm resource/kits integration and approval blockers |
| 5 | `/execution`, `/execution/[id]` | Field work and offline flow | Confirm approved planning precondition and outbox behavior |
| 6 | `/evidences` | Required for reports and delivery | Confirm blob outbox, file asset contract, before/during/after categories |
| 7 | `/reports`, `/reports/[id]` | Technical report generation | Confirm completed execution and evidence preconditions |
| 8 | `/delivery-records`, `/delivery-records/[id]` | Starts administrative close | Confirm report dependency and sign/send/reject actions |
| 9 | `/billing/ses`, `/billing/ses/[id]` | Ariba/SES gate | Confirm delivery record accepted/signed dependency |
| 10 | `/billing/invoices`, `/billing/invoices/[id]` | Billing gate | Confirm approved SES dependency |
| 11 | `/payments`, `/payments/[id]` | Final closure | Confirm approved invoice and document blockers |
| 12 | `/dashboard` | Must summarize real state, no fake KPIs | Confirm dashboard endpoint derives real data |
| 13 | `/work-requests`, `/site-visits`, `/proposals` | Upstream intake/sales polish after closure path | Confirm contract-first and no duplicated DTOs |
| 14 | `/documents`, `/documents/templates` | Dynamic document forms | Confirm template/version/response contracts |
| 15 | `/costs` | Cost control cross-cutting | Confirm cost baseline vs actual rules |

## Per-Page Checklist

1. Read page spec.
2. Read existing graph node or create one.
3. Verify frontend route file exists.
4. Verify hook/API path.
5. Verify backend route.
6. Verify shared schema.
7. Verify Mongoose model.
8. Verify RBAC source from `@cermont/domain`.
9. Verify offline behavior.
10. Add failing test for behavior change.
11. Implement minimum production change.
12. Run targeted test.
13. Update maps.
14. Run page gates: `npm run contracts:check`, `npm run typecheck`, `npm run lint`, `npm run test`.
