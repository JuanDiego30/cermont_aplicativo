# Zero Weak Tokens — Plan de Eliminación

## TL;DR

> **Objetivo**: Eliminar los 3035 findings de weak tokens (`any`, `null`, `unknown`, `undefined`) del código fuente, dejando el baseline en 0 para los 4 tipos. Sin romper `npm run verify`.
>
> **Distribución actual**: `null` 1530 (50.4%) | `undefined` 783 (25.8%) | `unknown` 638 (21.0%) | `any` 84 (2.8%)
>
> **Archivos afectados**: 544 archivos — pero el 44% de los findings está concentrado en solo 15 archivos.
>
> **Estrategia**: Automatización con ast-grep para patrones predecibles → Corrección manual de archivos densos → Scattered bulk por módulo → Congelar baseline en 0.
>
> **Stack**: Solo TypeScript + ast-grep. Sin nuevas dependencias.

---

## Context

### Herramienta de Detección

El checker en `tooling/quality/check-weak-tokens.ts` usa regex simple: busca las palabras `any`, `null`, `unknown`, `undefined` como tokens independientes (rodeados de no-identificadores). Es case-insensitive.

**Lo que detecta**:
- Tipos: `: any`, `: null`, `: unknown`
- Valores: `return null`, `return undefined`, `= null`, `= undefined`
- Comparaciones: `=== null`, `!== null`, `=== undefined`, `!== undefined`
- Casts: `as any`, `as unknown`
- Variables: `let x: any`, `const y: unknown`
- Strings/comentarios que contengan la palabra exacta

### Reglas del Proyecto (REGLAS_DESARROLLO_CERMONT.md §5)

| Token | Regla | Excepción |
|-------|-------|-----------|
| `any` | Prohibido explícitamente | Ninguna — usar tipos concretos |
| `unknown` | Prohibido sin política de refinamiento seguro | Solo en wrappers tipo-safe aprobados |
| `null` | Prohibido para representar ausencia | Usar status objects en su lugar |
| `undefined` | Prohibido para representar ausencia | Usar status objects en su lugar |

### Patrones de Reemplazo

| Token | Patrón Típico | Reemplazo |
|-------|---------------|-----------|
| `: any` | Tipo any en parámetros/variables | Tipo concreto: `string`, `number`, `Record<string, T>`, genérico `<T>` |
| `as any` | Cast forzado | `as T` con validación previa, o `satisfies` |
| `catch (e: any)` | Catch sin tipo | `catch (e: unknown)` + refinamiento |
| `= null` | Inicialización nula | `status: "pending"`, `value: 0`, option type |
| `=== null` / `!== null` | Null check | `=== undefined` o status check |
| `return null` | Retorno nulo | `return { status: "not_found" }` o `Result<T, E>` |
| `: unknown` | Tipo desconocido | Genérico `<T>` con validación Zod |
| `as unknown` | Cast intermedio | `satisfies` + Zod parse |
| `= undefined` | Inicialización indefinida | Default value explícito |
| `return undefined` | Retorno indefinido | `return { status: "not_found" }` |
| `=== undefined` | Undefined check | Status check o campo opcional tipado |

---

## Work Objectives

### Core Objective
Reducir weak tokens a **0 findings** en los 4 tipos, actualizar baseline y garantizar que nuevos cambios no reintroduzcan tokens.

### Concrete Deliverables
1. Baseline actualizado: weak-token-a:0, weak-token-n:0, weak-token-u:0, weak-token-ud:0
2. 544 archivos modificados con reemplazos tipo-safe
3. `npm run quality:weak-tokens` → 0 findings

### Definition of Done
- [ ] `npm run quality:weak-tokens` reporta 0 findings en los 4 tipos
- [ ] `npm run verify` pasa completo
- [ ] Baseline actualizado a 0
- [ ] Sin `as any`, `@ts-ignore`, `@ts-expect-error` nuevos
- [ ] React Doctor ≥ 93 (no regresión)

### Must Have
- Zero rotura de funcionalidad — los tests deben seguir pasando
- Reemplazos semánticamente correctos, no mecánicos
- Uso de Zod para validación donde antes había `as any` o `as unknown`
- Status objects para donde antes había `return null` o `return undefined`

### Must NOT Have
- ❌ No usar `@ts-ignore` o `@ts-expect-error` para evadir tipos
- ❌ No introducir `any` nuevo como "solución temporal"
- ❌ No cambios que rompan la API pública
- ❌ No mock data en producción

---

## Verification Strategy

### Pre-flight
```bash
npm run quality:weak-tokens  # Baseline actual
npm run verify  # Todo verde antes de empezar
```

### Post-flight
```bash
npm run quality:weak-tokens  # Debe reportar 0 findings
npm run verify  # Todo debe seguir verde
```

### QA Policy
Cada fase incluye verificación con `npm run quality:weak-tokens` + `npm run typecheck` en el workspace afectado.

---

## Execution Strategy

```
Wave 1 (Automation — patrones bulk con ast-grep):
├── T1. ast-grep: Reemplazar `catch (e: any)` → `catch (e: unknown)`
├── T2. ast-grep: Reemplazar `as any` tipificable → tipos concretos
├── T3. ast-grep: Reemplazar `return null` en services → status objects
└── T4. ast-grep: Reemplazar `: any` en parámetros → genéricos/tipos

Wave 2 (High-density files — top 15 = 44% de findings):
├── T5. Fix service-cases.service.ts (46 tokens)
├── T6. Fix test files (checklist, evidence, order, document tests = 132 tokens)
├── T7. Fix order-closure.service.ts + logger.ts + api-client.ts (76 tokens)
├── T8. Fix DocumentUploader.tsx + tool.service.ts (44 tokens)
└── T9. Fix planning-packet, report, maintenance services (63 tokens)

Wave 3 (Scattered bulk — backend/src restante):
├── T10. Backend services bulk (~400 tokens restantes)
├── T11. Backend modules bulk (~300 tokens restantes)
└── T12. Backend tests bulk (~200 tokens restantes)

Wave 4 (Scattered bulk — frontend):
├── T13. Frontend src bulk (~300 tokens)
├── T14. Frontend tests bulk (~150 tokens)
└── T15. packages + tooling + scripts (~100 tokens)

Wave FINAL:
├── F1. Full verification: npm run quality:weak-tokens → 0
├── F2. npm run verify completo
└── F3. Baseline congelado en 0
```

---

## TODOs

- [ ] 1. **ast-grep: Catch clauses `any` → `unknown`**

  **What to do**:
  1. Usar ast-grep para encontrar todos los `catch (e: any)` en todos los .ts/.tsx files
  2. Reemplazar `catch (e: any)` → `catch (e: unknown)` manteniendo el body intacto
  3. En los catch blocks, si hay `e.message` o `e.code`, agregar refine: `const err = e instanceof Error ? e : new Error(String(e))`
  4. Verificar con `npm run quality:weak-tokens` que `weak-token-a` baja

  **ast-grep pattern**:
  ```
  catch ($PARAM: any) { $$$ }
  ```
  **Rewrite**:
  ```
  catch ($PARAM: unknown) { $$$ }
  ```

  **Parallelization**: Wave 1 | Blocks: None | Blocked By: None

  **Acceptance Criteria**:
  - [ ] Todos los `catch (e: any)` reemplazados por `catch (e: unknown)`
  - [ ] `weak-token-a` reduction measurable
  - [ ] `npm run typecheck` pasa en backend y frontend

  **QA Scenarios**:
  ```
  Scenario: Catch blocks still work after type change
    Tool: npm run test
    Steps:
      1. npm run test -w backend
      2. npm run test -w frontend
    Expected Result: All tests pass (no regression from catch type change)
    Evidence: .sisyphus/evidence/task-1-catch-tests.txt
  ```

  **Commit**: YES | Message: `refactor: replace catch (e: any) with catch (e: unknown)`

- [ ] 2. **ast-grep: Bulk replace `as any` casts**

  **What to do**:
  1. Encontrar todos los `as any` con ast-grep
  2. Clasificar en 3 categorías:
     - **Test files**: `as any` en mocks/stubs → reemplazar con `as unknown as T` (mínimo cambio, tipo-safe)
     - **API responses**: `response as any` → reemplazar con Zod parse + `z.infer`
     - **Legacy wrappers**: `as any` en wrappers → usar `satisfies` o genéricos
  3. Para test files (mayoría de casos): `x as any` → `x as unknown as T` es seguro porque tests no se ejecutan en producción
  4. Para código de producción: cada caso necesita revisión manual semántica

  **ast-grep pattern**:
  ```
  $$$ as any
  ```

  **Parallelization**: Wave 1 | Blocks: T7 | Blocked By: None

  **Acceptance Criteria**:
  - [ ] 80%+ de `as any` reemplazados
  - [ ] `weak-token-a` < 20 (desde 84)
  - [ ] Tests pasan

  **QA Scenarios**:
  ```
  Scenario: Test suite passes after as any replacements
    Tool: npm run test
    Steps:
      1. npm run test -w backend
      2. npm run test -w frontend
    Expected Result: All 694 backend + 490 frontend tests pass
    Evidence: .sisyphus/evidence/task-2-test-results.txt
  ```

  **Commit**: YES | Message: `refactor: replace as any casts with type-safe alternatives`

- [ ] 3. **ast-grep: Bulk replace `return null` in services**

  **What to do**:
  1. Encontrar todos los `return null` en archivos de backend/src/ y frontend/src/
  2. Saltar archivos de test (tienen muchos falsos positivos)
  3. Para cada caso:
     - Si es un service que retorna `Promise<T | null>` → cambiar a `Promise<Result<T>>` con status objects
     - Si es un utility/helper puro → evaluar si realmente necesita null o puede retornar default
     - Si es getter de BD (`findById`) → retornar status "not_found"
  4. Patrón común: `return null` en service methods → usar object literal con `{ status: "not_found", ... }`

  Common pattern:
  ```typescript
  // ANTES
  async findById(id: string): Promise<Order | null> {
    const order = await OrderModel.findById(id);
    if (!order) return null;
    return order;
  }

  // DESPUÉS
  async findById(id: string): Promise<Order | { status: "not_found" }> {
    const order = await OrderModel.findById(id);
    if (!order) return { status: "not_found" };
    return order;
  }
  ```

  **Parallelization**: Wave 1 | Blocks: T5, T6 | Blocked By: None

  **Acceptance Criteria**:
  - [ ] 50%+ de `return null` en src/ reemplazados con status objects
  - [ ] `weak-token-n` < 1000 (desde 1530)
  - [ ] `npm run typecheck` pasa

  **Commit**: YES | Message: `refactor: replace return null with status objects in services`

- [ ] 4. **ast-grep: Bulk replace `: any` type annotations**

  **What to do**:
  1. Encontrar todos los `: any` como tipo en parámetros de función y variables
  2. Los más comunes:
     - `params: any` → `params: Record<string, unknown>` o tipo específico
     - `req: any` → `req: Request` (Express type)
     - `res: any` → `res: Response`
     - `data: any` → `data: unknown` + validación Zod
     - `err: any` → `err: unknown`
  3. Usar tipos de Express importados donde aplique
  4. Usar genéricos `<T>` para funciones que realmente aceptan cualquier tipo

  **ast-grep pattern**:
  ```
  function $NAME($$$: any, $$$) { $$$ }
  ```

  **Parallelization**: Wave 1 | Blocks: None | Blocked By: None

  **Acceptance Criteria**:
  - [ ] `weak-token-a` < 10 (desde 84)
  - [ ] `npm run typecheck` pasa en backend y frontend

  **Commit**: YES | Message: `refactor: replace :any type annotations with concrete types`

- [ ] 5. **Fix service-cases.service.ts (46 tokens — archivo #1)**

  **What to do**:
  1. Leer `backend/src/modules/service-cases/service-case.service.ts`
  2. Identificar los 46 tokens:
     - `null` returns → status objects
     - `any` types → tipos concretos
     - `undefined` → defaults explícitos
     - `unknown` → genéricos con Zod
  3. Priorizar: `return null` (más común en services) y `: any` en params

  **Parallelization**: Wave 2 | Blocks: None | Blocked By: T1, T2, T3

  **References**:
  - `backend/src/modules/service-cases/service-case.service.ts`

  **Acceptance Criteria**:
  - [ ] service-cases.service.ts: 0 weak tokens
  - [ ] Tests de service-cases pasan
  - [ ] `npm run quality:weak-tokens` refleja la reducción

  **QA Scenarios**:
  ```
  Scenario: Service cases tests pass after refactor
    Tool: npm run test
    Steps:
      1. npm run test -w backend -- --run src/modules/service-cases/
    Expected Result: All tests pass
    Evidence: .sisyphus/evidence/task-5-service-cases.txt
  ```

  **Commit**: YES | Message: `refactor(service-cases): eliminate weak tokens`

- [ ] 6. **Fix test files (checklist, evidence, order, document tests = 132 tokens)**

  **What to do**:
  1. Checklist service test (45 tokens):
     - `null` en expectativas → usar matchers específicos
     - `as any` en mocks → `as unknown as T`
  2. Evidence service test (34 tokens):
     - Mismos patrones
  3. Order service test + document service test (53 tokens):
     - Idem
  4. En tests: `as any` es aceptable pero reemplazar con `as unknown as InterfaceType`
  5. `null` en assertions: cambiar a `toBeNull()` o `toEqual({ status: "not_found" })`

  **Files**:
  - `backend/tests/services/checklist.service.test.ts`
  - `backend/tests/services/evidence.service.test.ts`
  - `backend/tests/services/order.service.test.ts`
  - `backend/tests/services/document.service.test.ts`

  **Parallelization**: Wave 2 | Blocks: None | Blocked By: T1, T2

  **Acceptance Criteria**:
  - [ ] 4 test files con 0 weak tokens
  - [ ] `npm run test -w backend` pasa (694 tests)

  **Commit**: YES | Message: `refactor(tests): eliminate weak tokens in service tests`

- [ ] 7. **Fix order-closure.service.ts + logger.ts + api-client.ts (76 tokens)**

  **What to do**:
  1. `order-closure.service.ts` (27 tokens):
     - `null` checks → status checks
     - `return null` → status objects
     - `: any` → tipos concretos
  2. `logger.ts` (25 tokens):
     - `any` en params de logging → `unknown`
     - Mantener compatibilidad con cualquier tipo de datos
  3. `api-client.ts` (24 tokens):
     - `ResponseType<any>` → `ResponseType<unknown>` + Zod infer
     - `as any` en wrappers HTTP → tipado correcto
     - `undefined` checks → default params

  **Files**:
  - `backend/src/modules/order/order-closure.service.ts`
  - `frontend/src/lib/monitoring/logger.ts`
  - `frontend/src/lib/http/api-client.ts`

  **Parallelization**: Wave 2 | Blocks: None | Blocked By: T2, T4

  **Acceptance Criteria**:
  - [ ] 3 files con 0 weak tokens
  - [ ] Frontend tests pasan (api-client)
  - [ ] Backend tests pasan (order-closure)

  **Commit**: YES | Message: `refactor: eliminate weak tokens in core services`

- [ ] 8. **Fix DocumentUploader.tsx + tool.service.ts (44 tokens)**

  **What to do**:
  1. `DocumentUploader.tsx` (23 tokens):
     - `any` en event handlers → tipos React específicos
     - `null` initial state → status objects
     - `undefined` checks → default values
  2. `tool.service.ts` (21 tokens):
     - `return null` → status objects
     - `: any` → tipos concretos

  **Files**:
  - `frontend/src/modules/documents/ui/DocumentUploader.tsx`
  - `backend/src/modules/tool/tool.service.ts`

  **Parallelization**: Wave 2 | Blocks: None | Blocked By: T1, T2, T3

  **Acceptance Criteria**:
  - [ ] 2 files con 0 weak tokens
  - [ ] Frontend + backend typecheck pasan

  **Commit**: YES | Message: `refactor: eliminate weak tokens in DocumentUploader and tool service`

- [ ] 9. **Fix planning-packet, report, maintenance services (63 tokens)**

  **What to do**:
  1. Cada service file con 21 tokens cada uno
  2. Patrones comunes:
     - `return null` → status objects
     - `Promise<T | null>` → `Promise<T | { status: "not_found" }>`
     - `: any` en params de métodos → tipos concretos

  **Files**:
  - `backend/src/modules/planning-packet/planning-packet.service.ts`
  - `backend/src/modules/report/report.service.ts`
  - `backend/src/modules/maintenance/maintenance.service.ts`

  **Parallelization**: Wave 2 | Blocks: None | Blocked By: T1, T2, T3

  **Acceptance Criteria**:
  - [ ] 3 files con 0 weak tokens
  - [ ] Backend tests pasan

  **Commit**: YES | Message: `refactor: eliminate weak tokens in planning/report/maintenance services`

- [ ] 10. **Backend services bulk (~400 tokens)**

  **What to do**:
  1. Todos los archivos en `backend/src/modules/*/` QUE NO sean los top 15
  2. Patrón: `return null` → status objects
  3. Patrón: `: any` → tipos concretos
  4. Patrón: `= undefined` → default values
  5. Dividir en sub-lotes por módulo (5-10 archivos por lote)
  6. Cada lote verificado con `npm run typecheck -w backend`

  **Parallelization**: Wave 3 | Blocks: None | Blocked By: T1-T9

  **Acceptance Criteria**:
  - [ ] Todos los archivos de backend/src/modules/ con < 5 weak tokens cada uno
  - [ ] `weak-token-n` < 300 (desde 1530)
  - [ ] Backend typecheck pasa

  **Commit**: YES | Message: `refactor(backend): bulk eliminate weak tokens in modules`

- [ ] 11. **Frontend src bulk (~300 tokens)**

  **What to do**:
  1. Todos los archivos en `frontend/src/` QUE NO sean los top
  2. Patrón: `any` en React event handlers → tipos sintéticos de React
  3. Patrón: `null` en useState → initial state objects
  4. Patrón: `undefined` checks → default params
  5. Dividir por módulo: documents, files, checklists, users, etc.

  **Parallelization**: Wave 4 | Blocks: None | Blocked By: T1-T9

  **Acceptance Criteria**:
  - [ ] frontend/src/ con < 50 weak tokens total
  - [ ] `npm run typecheck -w frontend` pasa
  - [ ] `npm run test -w frontend` pasa

  **Commit**: YES | Message: `refactor(frontend): bulk eliminate weak tokens`

- [ ] 12. **Frontend tests + packages + tooling (~250 tokens)**

  **What to do**:
  1. `frontend/tests/` (~150 tokens): reemplazar `as any` en mocks, `null` en assertions
  2. `packages/shared-types/src/` y `packages/shared-types/tests/`: pocos tokens, fáciles
  3. `tooling/` y `scripts/`: pocos tokens
  4. `backend/tests/` restantes (~200 tokens no cubiertos en T6)

  **Parallelization**: Wave 4 | Blocks: None | Blocked By: T1-T11

  **Acceptance Criteria**:
  - [ ] Todos los archivos con < 3 weak tokens
  - [ ] `npm run test` completo pasa

  **Commit**: YES | Message: `refactor: eliminate weak tokens in tests and packages`

---

## Final Verification Wave

- [ ] F1. **Full weak token verification**
  ```bash
  npm run quality:weak-tokens
  ```
  Expected: 0 findings across all 4 types

- [ ] F2. **Full verify suite**
  ```bash
  npm run verify
  ```
  Expected: All gates green

- [ ] F3. **Baseline freeze**
  Actualizar `tooling/quality/baseline.json`:
  ```json
  {
    "weak-token-a": 0,
    "weak-token-n": 0,
    "weak-token-u": 0,
    "weak-token-ud": 0
  }
  ```

---

## Success Criteria

### Verification Commands
```bash
npm run quality:weak-tokens   # → 0 findings (4/4 types at baseline)
npm run verify                 # → All gates green
npm run typecheck -w backend   # → No errors
npm run typecheck -w frontend  # → No errors
npm run test -w backend        # → 694 tests pass
npm run test -w frontend       # → 490 tests pass
```

### Final Checklist
- [ ] weak-token-a: 0/0 (antes 84/85)
- [ ] weak-token-n: 0/0 (antes 1530/1546)
- [ ] weak-token-u: 0/0 (antes 638/639)
- [ ] weak-token-ud: 0/0 (antes 783/783)
- [ ] `npm run verify` pasa completo
- [ ] React Doctor ≥ 93/100
- [ ] 0 `@ts-ignore` / `@ts-expect-error` nuevos
- [ ] Baseline actualizado a 0
