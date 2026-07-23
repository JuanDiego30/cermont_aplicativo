# Wave 1 blocker remediation evidence

Date: 2026-07-21
Scope: BUG-VISIT-01, BUG-PROP-01, BUG-PO-01

## Targeted verification

Biome invocation:

```text
npx.cmd --no-install biome check --write --max-diagnostics=100 "src/app/(dashboard)/site-visits/new/page.tsx" "src/app/(dashboard)/proposals/new/page.tsx" "src/modules/proposals/api/proposals.service.ts" "src/app/(dashboard)/purchase-orders/new/page.tsx" "src/app/(dashboard)/purchase-orders/new/PurchaseOrderFormFields.tsx" "tests/modules/site-visits/site-visits-new-page.test.tsx" "tests/modules/proposals/proposal-new-page.test.tsx" "tests/modules/proposals/proposals-service.test.ts" "tests/modules/purchase-orders/purchase-order-new-page.test.tsx"
```

Binary observable: exit 0; `Checked 9 files ... No fixes applied.`

Vitest invocation:

```text
npm.cmd run test -w frontend -- tests/modules/site-visits/site-visits-new-page.test.tsx tests/modules/proposals/proposal-new-page.test.tsx tests/modules/proposals/proposals-service.test.ts tests/modules/purchase-orders/purchase-order-new-page.test.tsx
```

Binary observable: exit 0; `Test Files 4 passed (4)` and `Tests 10 passed (10)`.

## Success criteria mapped to scenarios

| Criterion | Scenario | Observable |
|---|---|---|
| BUG-VISIT-01 | `prefills an editable local visit date` | Date input is non-empty, then accepts `2026-07-22T09:30`. |
| Site visit submit | `submits the visit and redirects to its created id` | Router receives `/site-visits/507f1f77bcf86cd799439099`; mutation called once. |
| BUG-PROP-01 | proposal page envelope regression + service resolver tests | Router receives a real ObjectId path; malformed IDs return `status: "invalid"`; no `/undefined`. |
| BUG-PO-01 | `renders the empty proposal state and does not request an empty proposal id` | Empty-state option renders; only approved-list GET occurs; POST is not called and no empty detail URL is requested. |

## Cleanup and pending verification

- No Git commands executed.
- No package manifests changed.
- No unrelated files intentionally touched.
- Full frontend typecheck, workspace lint, build, verify, React Doctor, and live Playwright QA were not run in this closure.
- Deploy verdict: NO-GO until those broader gates and manual QA are completed.
