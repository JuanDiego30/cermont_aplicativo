# Final Command Results — CERMONT v3-v7 Orchestrated Validation

## Verification Commands Executed (2026-07-10)

| Command | Result | Details |
|---|---|---|
| git status --short --branch | ✅ | plan/contract-first-masterplan-v6, ahead 1 |
| git branch --show-current | ✅ | plan/contract-first-masterplan-v6 |
| git rev-parse HEAD | ✅ | 244626c5f05fa353076254c968bfb1c3d6b42112 |
| git diff --stat | ✅ | 245 files modified |
| git diff --check | ⚠️ | 1 CRLF warning |
| node --version | ✅ | v24.12.0 |
| npm --version | ✅ | 11.15.0 |
| npm run verify | ❌ | 2 lint failures |
| npm run verify:shared-types | ❌ | lint: contract-migrations.json format |
| npm run verify:domain | ✅ | typecheck + lint + build |
| npm run verify:config | ✅ | typecheck + lint + build |
| npm run verify:backend | ✅ | 102 files, 687 tests, build |
| npm run verify:frontend | ❌ | lint: ScheduleStep.tsx a11y |
| npm run contracts:check | ❌ | snapshot outdated |
| npm run quality:strict | ✅ | 10/10 subtests |
| npm run quality:weak-tokens | ✅ | 3037 within baseline |
| npm run quality:language | ✅ | 2829 within baseline |
| npm run quality:semantics | ✅ | 0 findings |
| npm run quality:routes | ✅ | 0 findings |
| npm run quality:dtos | ✅ | 44 within baseline |
| npm run quality:zero | ✅ | 0 findings |
| npm run quality:lint-residue | ✅ | 0 findings |
| npm run quality:service-size | ✅ | 0 findings |
| npm run quality:env | ✅ | All checks passed |
| npm run quality:hardcoded-roles | ✅ | 0 violations |
| npm run doctor:verbose | ⚠️ | 84/100 (target 95+) |
| npm run build -w frontend | ✅ | 97 pages, 12.0s |
| npm run test -w backend | ✅ | 102 files, 687 tests |
| npm run test -w frontend | ✅ | 91 files, 473 tests |

## Commands NOT Executed

| Command | Reason |
|---|---|
| npm run test:e2e | Playwright browsers not installed/verified |
| npm run test:coverage | Not configured for this run |
| git checkout/pull/push/merge | Git Safety policy |
| npx playwright test | Playwright browsers not installed |
| Lighthouse | Not available in environment |
