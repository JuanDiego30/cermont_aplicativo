# Wave 4 independent gate review

## recommendation

**NEEDS_FIX**

## originalIntent

Review only the Wave 4 surfaces named by the user, without Git or product-code edits. Reproduce focused Vitest, directed Biome, and frontend typecheck; confirm that payment monetary output is COP-aware and that Evidences exposes correct loading, empty, and error states. Use Playwright only when the environment permits a safe read-only run.

## desiredOutcome

- Payment dashboard and aging values render as Colombian pesos.
- Evidences renders truthful loading, empty, success, and error feedback for every data dependency involved in the page.
- The scoped TypeScript remains type-safe, lint-clean, covered by behavior-focused tests, and compliant with the repository's no-giant-monolith rule.
- Focused automated checks pass from the current artifacts.

## userOutcomeReview

Payment COP formatting is confirmed. `payments/page.tsx` imports `formatCOP` and uses it for dashboard totals, aging-bucket totals, and aging-table totals/pending amounts. `currency.ts` fixes locale to `es-CO`, currency to `COP`, and zero decimal places. The imported records page also formats COP records as COP and preserves explicit USD/EUR labels allowed by `PaymentCurrencySchema`; no hardcoded USD formatter exists in the reviewed payment page.

Evidences has visible states for no selected order, evidence-list loading, list-query error, and empty gallery/table results. However, the orders dependency is incomplete: `useEvidenceFilters()` reads only `data` and `isLoading` from `useOrders`, discarding `isError`/`error`. If loading the order choices fails, the user sees an empty selector and the normal “Selecciona una orden” state instead of an error. This fails the requested correctness of evidence states/errors.

The direct `remove-ai-slops`/`programming` pass also found both page modules over the 250-pure-LOC ceiling, with `evidences/page.tsx` especially combining filtering, upload, gallery, table, pagination, findings, and query orchestration in one 873-pure-LOC module. This conflicts with the repository's explicit “No giant monolithic components” criterion.

## blockers

1. **violatedCriterion:** `W4-EVIDENCE-STATES-ERRORS` — Evidences must present correct states/errors.
   - **observation:** Order-list failures are discarded; the UI falls through to a normal empty-selection state rather than reporting the failed dependency.
   - **evidencePointer:** `frontend/src/app/(dashboard)/evidences/page.tsx:588` destructures only `data` and `isLoading` from `useOrders`; `frontend/src/app/(dashboard)/evidences/page.tsx:854` then renders the ordinary no-selection state. The evidence-list error branch at lines 873-877 covers only `listEvidences`, not `useOrders`.

2. **violatedCriterion:** `CQ-NO-GIANT-MONOLITHS` — AGENTS.md: “No giant monolithic components”; mandatory `remove-ai-slops` oversized-module check: source files must not exceed 250 pure LOC.
   - **observation:** The two scoped pages exceed the gate ceiling and carry multiple responsibilities in-file.
   - **evidencePointer:** Direct nonblank/non-comment count: `frontend/src/app/(dashboard)/payments/page.tsx` = 339 pure LOC; `frontend/src/app/(dashboard)/evidences/page.tsx` = 873 pure LOC. Evidence page responsibilities are visible across upload (lines 69-334), filters (338-475), empty/table/gallery views (479-571), filter hook (575-602), pagination (636-687), and main orchestration (691-959).

## reproducedEvidence

- Focused Vitest: `npm run test -w frontend -- tests/modules/evidences/evidences-page.test.tsx tests/lib/currency.test.ts`
  - Result: PASS; 2 test files, 4 tests, 0 failures; reproduced duration 37.16s.
- Directed Biome: `npx biome check` over the four scoped production files and two associated tests.
  - Result: PASS; 6 files checked, no fixes applied.
- Frontend typecheck: `npm run typecheck -w frontend`
  - Result: PASS; `tsc --noEmit`, no diagnostics.
- Playwright: NOT RUN. The existing servers were listening and `@playwright/test` was installed, but `frontend/tests/e2e/global-setup.ts` calls `dropDatabase()` for both `cermont_test` and fallback `cermont`, then writes auth-state files. That is not a safe read-only run and conflicts with the user's no-edit instruction. The user subsequently requested immediate gate closure and cancellation of long tests.

## removeAiSlopsAndProgrammingPass

- Oversized modules: blocking finding described above.
- Obvious comments: numerous section-divider comments in `evidences/page.tsx` and `evidence-helpers.ts`; NOTE only because they do not independently violate the requested user-visible outcome.
- Over-defensive/swallowed errors: upload errors are narrowed and shown by toast; list-query errors are shown. The order-query error is dropped and is blocking under the explicit evidence-state criterion.
- Dead/unsupported variant: `minor` is displayed and counted, but `getEvidenceFindingSeverity()` can only produce `critical`, `moderate`, or `not_finding`; NOTE because no supplied criterion defines which evidence type must map to “Leves”.
- Type safety: typecheck passed. Scoped code contains no `any`, `as any`, `as unknown`, `@ts-ignore`, or `@ts-expect-error`. `evidence-helpers.ts` uses a narrower `Evidence & { photoLabel?: string }` assertion and the page uses `(error as Error)`; maintenance NOTE, not an independent blocker.
- Test overfit/slop:
  - No excessive, deletion-only, removal-verification, or tautological test volume found.
  - `evidences-page.test.tsx` partly mirrors implementation by asserting the exact React Query key/config.
  - `currency.test.ts` proves formatter output but does not prove `payments/page.tsx` remains wired to it.
  - No focused test exercises evidence loading, empty, list-error, order-error, or upload-error states. This creates false confidence and leaves the observed order-error defect undetected; the functional defect above is the blocker.

## reportCoverageReview

No dedicated code-review report was present in `.omo/evidence/wave4-scalability-20260721/`. `verification-summary.md` records commands and outcomes but does not include `remove-ai-slops`, `programming`, overfit-test classes, or direct error-state review. This gate therefore performed those passes directly. Missing report coverage is not an additional blocker because direct inspection established the result.

## checkedArtifactPaths

- `frontend/src/app/(dashboard)/payments/page.tsx`
- `frontend/src/app/(dashboard)/evidences/page.tsx`
- `frontend/src/app/(dashboard)/evidences/evidence-helpers.ts`
- `frontend/src/lib/format/currency.ts`
- `frontend/tests/modules/evidences/evidences-page.test.tsx`
- `frontend/tests/lib/currency.test.ts`
- `frontend/tests/e2e/evidence-flow.spec.ts`
- `frontend/tests/e2e/payments.spec.ts`
- `frontend/tests/e2e/pages/payments-delivery-pages.spec.ts`
- `frontend/playwright.config.ts`
- `frontend/tests/e2e/global-setup.ts`
- `frontend/tests/e2e/global-teardown.ts`
- `frontend/src/modules/billing/ui/WorkflowRecordsPage.tsx` (payment rendering dependency only)
- `frontend/src/modules/billing/ui/workflow-record-rows.ts` (payment rendering dependency only)
- `packages/shared-types/src/schemas/payment.schema.ts` (currency contract only)
- `.omo/evidence/wave4-scalability-20260721/verification-summary.md`
- `.omo/evidence/wave4-scalability-20260721/frontend-focused-tests-final.log`
- `.omo/evidence/wave4-scalability-20260721/frontend-typecheck-final.log`
- `.omo/evidence/wave4-scalability-20260721/frontend-biome-small-final.log`
- `.omo/evidence/wave4-scalability-20260721/frontend-page-lint.log`
- `.omo/evidence/wave4-scalability-20260721/evidences-page-test.log`

## exactEvidenceGaps

- No supplied diff artifact; Git use was explicitly prohibited, so review was performed against current scoped artifacts only.
- No dedicated code-review report with skill-perspective/overfit coverage.
- No manual QA matrix or notepad path supplied.
- No safe browser QA result: the configured Playwright global setup is destructive and writes repository auth fixtures.
- No focused payment-page test that would fail if COP wiring were removed.
- No focused evidence-state tests for order-query error, list loading/error, filtered empty state, or upload errors.

