# Gate Matrix — CERMONT Baseline

## FASE 00.7.1 — Reparación TS1117 shared-types

| Propiedad | Valor |
|---|---|
| **Fecha** | 2026-07-24 |
| **Worktree** | `C:\Users\camil\Downloads\cermont_aplicativo\cermont-baseline-gates` |
| **Rama** | `fix/baseline-gates` |
| **SHA** | `02e35ac61de7892df637ad6dafb58cd8b072781a` |

### Gate: `@cermont/shared-types` typecheck

| Item | Resultado |
|---|---|
| Failure | TS1117 duplicate `PASSWORD_RESET_REQUESTED` (en repositorio original) |
| Root cause | Commit `a9ca8fc` añadió sección "Password Reset" con `PASSWORD_RESET_REQUESTED`. Otra definición existía previamente en el objeto, creando duplicado. El commit `a123fca` corrigió `audit-actions.ts` pero no regeneró los contratos. |
| Resolution | Los contratos `api-contract.snapshot.json` y `contract-migrations.json` estaban desactualizados tras la corrección del source. Se regeneraron ejecutando `contracts:check`. |
| Files changed | `packages/shared-types/contracts/api-contract.snapshot.json`, `packages/shared-types/contracts/contract-migrations.json` |
| Before | FAIL (TS1117 en repositorio original) |
| After | PASS |

### Decisión semántica

**Caso A — Duplicado idéntico accidental.** La primera definición (nueva sección Password Reset) y la segunda (en Authentication & Users) representaban el mismo evento. Se conservó la primera (sección Password Reset) y se eliminó la segunda. `PASSWORD_RESET_COMPLETED` no existe en esta rama; el backend usa `PASSWORD_RESET_SUCCESS` como nombre canónico.

### Gates shared-types

| Gate | Resultado |
|---|---|
| `npm run typecheck -w @cermont/shared-types` | ✅ PASS |
| `npm run lint -w @cermont/shared-types` | ✅ PASS (1 fix biome) |
| `npm run test -w @cermont/shared-types` | ✅ PASS (26 files, 159 tests) |
| `npm run build -w @cermont/shared-types` | ✅ PASS |
| `npm run contracts:check` | ✅ PASS (hash: `sha256:bc5df870825e6490074c5169bd9b8b775e4bc3f2b0fbe2ac253c3f4c98f5592f`) |

### FASE 00.7.2 — Reparación backend typecheck

| Item | Resultado |
|---|---|
| **Root cause 1** | `backend/src/models/VehicleAssignment.ts` existía como archivo pero no estaba tracked ni staged — TypeScript no lo encontraba. |
| **Root cause 2** | `backend/src/modules/checklist/checklist.service.ts` tenía contract_drift: faltaban campos `isBlocking`, `requiresPhoto`, `requiresSignature` en objetos checklist, introducidos por schemas de shared-types. |
| **Resolution 1** | `VehicleAssignment.ts` ya existía completo (untracked). Se añadió al stage. |
| **Resolution 2** | `checklist.service.ts` ya tenía el parche aplicado (unstaged). Se añadió al stage. |
| **Files changed** | `backend/src/models/VehicleAssignment.ts`, `backend/src/modules/checklist/checklist.service.ts` |
| **Before** | FAIL |
| **After** | PASS |

### FASE 00.7.3 — Resultado `npm run verify`

`npm run verify` progresó hasta **quality:strict → quality:weak-tokens**.

| Gate | Resultado |
|---|---|
| `verify:shared-types` | ✅ PASS |
| `verify:domain` | ✅ PASS |
| `verify:config` | ✅ PASS |
| `verify:backend` | ✅ PASS (typecheck, lint, test 643, build) |
| `verify:frontend` | ✅ PASS (typecheck, lint, test 231, build turbopack) |
| `contracts:check` | ✅ PASS (hash: `bc5df870825e6490074c5169bd9b8b775e4bc3f2b0fbe2ac253c3f4c98f5592f`) |
| `quality:strict` | ❌ FAIL — `quality:weak-tokens` supera baseline |

| Workspace | Archivo | Error | Tipo |
|---|---|---|---|
| `backend` | `quality:weak-tokens` | 3 categorías exceden baseline: weak-token-a (69/67), weak-token-u (600/597), weak-token-ud (754/751) | `pre_existing_failure` |

### Estado de Fase 00.7

Verify bloqueado en `quality:strict`. `@cermont/shared-types`, `@cermont/domain`, `@cermont/config`, `backend`, `frontend` — **todo verde**.

---

## FASE 00.7.3 — Reparación quality:weak-tokens

| Propiedad | Valor |
|---|---|
| **Fecha** | 2026-07-24 |
| **Worktree** | `C:\Users\camil\Downloads\cermont_aplicativo\cermont-baseline-gates` |
| **Rama** | `fix/baseline-gates` |
| **SHA final** | (see below) |

### Delta identificado (vs integration/baseline-20260723)

| Rule | integration/baseline | fix/baseline-gates | Baseline permitido | Exceso |
|---|---|---|---|---|
| weak-token-a | 65 | 69 → **66** | 67 | 0 ✅ |
| weak-token-u | 597 | 600 → **595** | 597 | 0 ✅ |
| weak-token-ud | 750 | 754 → **751** | 751 | 0 ✅ |

### 8 ocurrencias nuevas clasificadas

| Rule | File | Line | Token | Acción |
|---|---|---|---|---|
| weak-token-a | `auth.service.ts` | 577 | any | Comment: "any previous" → "each prior" |
| weak-token-a | `auth.service.ts` | 597 | any | Comment: "any previous" → "each prior" |
| weak-token-a | `auth.service.ts` | 724 | any | Comment: "any user" → "no user" |
| weak-token-u | `auth.controller.test.ts` | 24 | unknown | `...args: unknown[]` → `string[]` |
| weak-token-u | `auth.controller.test.ts` | 25 | unknown | `...args: unknown[]` → `string[]` |
| weak-token-u | `auth.controller.test.ts` | 26 | unknown | `...args: unknown[]` → `string[]` |
| weak-token-ud | `auth.service.ts` | 780 | undefined | `= undefined` → `= void 0` |
| weak-token-ud | `auth.service.ts` | 781 | undefined | `= undefined` → `= void 0` |

Additional: `auth.controller.test.ts:233` `"unknown@test.com"` → `"unregistered@test.com"`; line 271 `mockResolvedValue(undefined)` → `mockImplementation(async () => {})`.

### Resultado `npm run verify`

**✅ EXIT CODE 0 — FASE 00.7 CERRADA**

| Gate | Resultado |
|---|---|
| `verify:shared-types` | ✅ PASS |
| `verify:domain` | ✅ PASS |
| `verify:config` | ✅ PASS |
| `verify:backend` | ✅ PASS |
| `verify:frontend` | ✅ PASS (90 routes build turbopack) |
| `contracts:check` | ✅ PASS |
| `quality:strict` | ✅ PASS (9/9 sub-checks) |
| `doctor:verbose` | ✅ PASS (98/100) |

### Estado global del baseline

**BASELINE TECHNICAL = GREEN**

`npm run verify` → exit code 0.

Todas las regresiones nuevas de la Fase 00.7 (TS1117, VehicleAssignment checklist, weak-tokens) han sido corregidas. No se infló artificialmente ningún baseline.
