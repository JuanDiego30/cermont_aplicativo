# Wave 2 UI remediation evidence

Date: 2026-07-21
Scope: frontend Wave 2 ownership lane only. No Git commands, package changes, backend changes, or unrelated admin/backups/planning changes.

## Applied remediation

- `frontend/src/app/(dashboard)/inventory/page.tsx`
  - `NewItemForm` and `MovementForm` now call `event.preventDefault()` before preserving their existing async mutation calls.
- `frontend/src/app/(dashboard)/resources/page.tsx`
  - Resource deletion failures now produce a structured, visible `role="alert"` message with a safe fallback for non-`Error` failures.
- `frontend/tests/modules/inventory/inventory-page.test.tsx`
  - Focused tests assert semantic form submission is canceled (`fireEvent.submit(...) === false`) while the existing create/movement mutations still execute.
- `frontend/tests/modules/resources/resources-page.test.tsx`
  - Added focused coverage for visible deletion errors and the empty-state kit CTA route.

## Verification

Command:

`npm run test -w frontend -- tests/modules/inventory/inventory-page.test.tsx tests/modules/resources/resources-page.test.tsx tests/modules/templates/templates-page.test.tsx tests/modules/system-config/reminder-settings-form.test.tsx`

Result: PASS — 4 test files, 7 tests.

Command:

`npx biome lint -- 'frontend/src/app/(dashboard)/inventory/page.tsx' 'frontend/src/app/(dashboard)/resources/page.tsx' 'frontend/src/app/(dashboard)/templates/page.tsx' 'frontend/src/app/(dashboard)/assets/page.tsx' 'frontend/src/app/(dashboard)/fleet/page.tsx' 'frontend/src/app/(dashboard)/admin/users/page.tsx' 'frontend/src/modules/customers/ui/CustomerForm.tsx' 'frontend/tests/modules/inventory/inventory-page.test.tsx' 'frontend/tests/modules/resources/resources-page.test.tsx'`

Result: PASS — 9 files checked, no fixes applied.

## Pending gates and risk

- Global lint remains blocked by pre-existing unrelated findings in `frontend/src/app/(dashboard)/admin/backups/page.tsx` and `frontend/src/app/(dashboard)/planning/page.tsx`; neither file was modified.
- Full typecheck/build/manual Playwright QA were intentionally not rerun for this closeout because the user requested stopping long gates. Prior evidence records the unrelated global typecheck blocker and browser QA interruption.
- Remaining risk is limited to runtime integration behavior outside the focused component tests; no new dependency or API surface was introduced.
