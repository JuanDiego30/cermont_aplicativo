# PLAN: Spec 011 — Implementación Profesional Controlada CERMONT

## TL;DR

> **Quick Summary**: Ejecución profesional del roadmap CERMONT por waves controladas. Partiendo del baseline actual (typecheck ✅, lint ✅, 1091 tests ✅, quality:strict ❌ 1 violación, React Doctor 87/100), se implementa en 9 waves: WIP protection → ADRs → gates rojos → flujo 14 pasos → módulos profesionales → frontend/navegación → privacy/WebAuthn → optimización → tests/cierre.
>
> **Deliverables**: Código real en ~240 archivos modificados/creados a través de 9 waves secuenciales. No deploy. No `any`. No mocks. No código externo copiado.
>
> **Parallel Execution**: NO — waves estrictamente secuenciales. Cada wave tiene sus propias tareas paralelizables internamente.
>
> **Critical Path**: Wave 0 → Wave 1 → Wave 2 → Wave 3 → Wave 4 → Wave 5 → Wave 6 → Wave 7 → Wave 8 → Wave 9

---

## Context

### Baseline actual (2026-06-29 02:33)

| Gate | Resultado | Observación |
|------|-----------|-------------|
| `git branch` | `hotfix/spec-005-post-deploy` | Rama activa |
| `git status --short` | **9 archivos modificados** | Evidence + privacy WIP |
| `git stash list` | **2 stashes** | ① `spec-011-wave0-local-lint-fixes` (3 archivos) ② `backup-before-spec-008-implementation` (247 archivos) |
| `npm run typecheck` | ✅ PASS (7 tasks) | Sin errores |
| `npm run lint` | ✅ PASS (7 tasks) | Sin issues Biome |
| `npm test` | ✅ PASS | Tests backend + frontend |
| `npm run build` | ✅ PASS (83 rutas) | Build exitoso |
| `npm run contracts:check` | ✅ PASS | Snapshot 064 |
| `npm run quality:strict` | ❌ **FAIL** | 1 violación: weak-token-u 593/592 (Evidence.ts) |
| `npx react-doctor@latest` | ⚠️ **87/100** | 12 issues (4 bugs, 2 a11y, 6 maintainability) |
| `npm run verify` | ⚠️ **FAIL** | lint + quality:strict |

### ADRs existentes en `docs/adr/`
- ADR-001: Contract-first domain boundaries ✅
- ADR-001: Use Express backend ✅
- ADR-002: Offline-first IndexedDB + Serwist ✅
- ADR-003: Cermont workflow 14 steps ✅
- ADR-003: State patterns status objects ✅
- ADR-004: Evidence blob outbox ✅
- ADR-004: Modular architecture feature-sliced ✅
- ADR-005: Administrative closure state machine ✅
- ADR-document-ingestion: Contract-first ✅
- ADR-011: ❌ **No existe** (flujo 14 pasos canónico)
- ADR-012: ❌ **No existe** (alineación visual)
- ADR-014: ❌ **No existe** (consent gateway)

### Working tree (9 archivos modificados, WIP actual)
```
M backend/src/models/Evidence.ts
M backend/src/modules/evidence/evidence.routes.ts
M backend/src/modules/evidence/evidence.service.ts
M backend/tests/services/evidence.service.test.ts
M frontend/src/app/(dashboard)/evidences/[id]/page.tsx
M frontend/src/app/(legal)/consent/page.tsx
M frontend/src/app/(legal)/privacy/page.tsx
M packages/shared-types/src/constants/audit-actions.ts
M packages/shared-types/src/schemas/evidence.schema.ts
```

---

## Work Objectives

### Core Objective
Implementar profesionalmente las 9 waves de Spec 011, partiendo de Wave 0 (protección de WIP) hasta Wave 9 (cierre y documentación), sin deploy, sin `any`, sin mocks productivos, sin violar contracts/RBAC/API envelope.

### Concrete Deliverables
1. WIP clasificado y protegido (rama temporal)
2. ADR-011, ADR-012, ADR-014 resueltos documentados
3. quality:strict ✅ PASS + React Doctor ≥90/100
4. Flujo de 14 pasos con definición canónica y UI visual
5. Módulos profesionales implementados (Fleet, Tools, Evidences, Checklists, Costs, Maintenance)
6. Frontend/navegación mejorado (dashboard, sidebar, breadcrumbs, flujo visual)
7. Privacy/Consent gateway + WebAuthn completo
8. Optimizaciones backend/frontend/PWA
9. Tests nuevos (contract, integration, E2E, a11y)

### Must Have
- No introducir `any` en ningún archivo
- No copiar código de repositorios externos
- No romper Zod/shared-types contracts
- No romper API envelope `{ success, data, error }`
- No romper RBAC en rutas
- No usar mocks en producción
- quality:strict debe pasar o tener bloqueo documentado

### Must NOT Have
- No deploy desde Spec 011
- No cambios masivos sin wave controlada
- No avanzar de wave sin gates de la wave anterior en verde

---

## Execution Strategy

### Waves
```
Wave 0: Repo safety, stash y baseline (Día 1)
Wave 1: ADR-011, ADR-012, ADR-014 (Día 1-2)
Wave 2: Gates rojos y calidad P0 (Día 2-3)
Wave 3: Flujo central 14 pasos (Día 3-5)
Wave 4: Módulos profesionales (Día 5-8)
Wave 5: Frontend excellence y navegación (Día 8-10)
Wave 6: Privacy, consent y WebAuthn (Día 10-12)
Wave 7: Optimización backend/frontend/PWA (Día 12-14)
Wave 8: Tests, CI y verificación (Día 14-16)
Wave 9: Cierre y documentación (Día 16-17)
```

---

## TODOs

### Wave 0 — Repo Safety, Stash y Baseline (Día 1)

- [ ] 0.1 **Clasificar WIP y stash histórico**

  **What to do**:
  - Stash guardado: `stash@{0}` (spec-011-wave0-local-lint-fixes) = 3 archivos (fleet-readiness rules, domain index, baseline.json)
  - Stash guardado: `stash@{1}` (backup-before-spec-008-implementation) = 247 archivos
  - Working tree: 9 archivos modificados (evidence + privacy WIP)
  - NO hacer `git stash pop` directamente. Crear rama temporal si es necesario:
    ```
    git stash branch recovery/spec-008-stash stash@{1}
    ```
  - Clasificar cada archivo del working tree por categoría (hotfix/docs/gap)
  - Dejar el working tree limpio o con cambios clasificados

  **Archivos**: Working tree completo (9 archivos) + stash@{0} (3 archivos) + stash@{1} (247 archivos)

  **Acceptance Criteria**:
  - [ ] WIP clasificado en categorías con riesgo asignado
  - [ ] Rama temporal creada si hay stash que preservar
  - [ ] Working tree limpio o cambios clasificados y commiteados

  **QA Scenarios**:
  ```
  Scenario: WIP classification
    Tool: Bash
    Steps:
      1. git status --short → confirma 9 archivos o menos
      2. git stash list → confirma stashes clasificados
    Evidence: .sisyphus/evidence/wave0-wip-report.txt
  ```

  **Commit**: YES (with 0.2) — `chore(wip): protect current evidence+privacy work`

- [ ] 0.2 **Commit temporal del working tree actual**

  **What to do**:
  - Commitear los 9 archivos modificados actuales como WIP controlado
  - Mensaje: `chore(wip): evidence form and privacy pages WIP`
  - NO mezclar con stash
  - Dejar working tree limpio para comenzar Wave 1

  **Archivos**:
  - `backend/src/models/Evidence.ts`
  - `backend/src/modules/evidence/evidence.routes.ts`
  - `backend/src/modules/evidence/evidence.service.ts`
  - `backend/tests/services/evidence.service.test.ts`
  - `frontend/src/app/(dashboard)/evidences/[id]/page.tsx`
  - `frontend/src/app/(legal)/consent/page.tsx`
  - `frontend/src/app/(legal)/privacy/page.tsx`
  - `packages/shared-types/src/constants/audit-actions.ts`
  - `packages/shared-types/src/schemas/evidence.schema.ts`

  **Acceptance Criteria**:
  - [ ] git status → working tree limpio
  - [ ] git log --oneline -3 → commit WIP visible

  **Commit**: YES — `chore(wip): evidence form and privacy pages WIP`

- [ ] 0.3 **Ejecutar baseline completo y registrar quality-gate-report.md**

  **What to do**:
  - Ejecutar: typecheck, lint, test, build, contracts:check, quality:strict, verify, react-doctor
  - Registrar resultados en tabla
  - Identificar el único blocker real: quality:strict (weak-token-u)

  **Acceptance Criteria**:
  - [ ] Baseline registrado con resultados exactos por gate

---

### Wave 1 — Resolver ADRs Bloqueantes (Día 1-2)

- [ ] 1.1 **Crear ADR-011 — Flujo canónico de 14 pasos**

  **What to do**:
  - Comparar 3 fuentes: `docs/domain/CERMONT_BUSINESS_FLOW_MAP.md`, LTG (tesis, docs/pdf/01_main10.md §1.2), state machine actual (`packages/domain/src/workflow/service-case-state-machine.ts`)
  - Crear `docs/adr/ADR-011-canonical-14-step-flow.md`
  - Tabla de comparación: código, fuente A, fuente B, código actual, conflicto, decisión
  - Decisión recomendada: LTG + Business Flow Map = canónico. State machine debe adaptarse.
  - NO migrar datos persistidos sin plan

  **Archivos**:
  - CREATE `docs/adr/ADR-011-canonical-14-step-flow.md`
  - UPDATE `packages/domain/src/workflow/service-case-state-machine.ts` (si hay conflicto)

  **Acceptance Criteria**:
  - [ ] ADR-011 creado con comparación de fuentes
  - [ ] Transiciones validadas contra las 3 fuentes
  - [ ] Characterization tests escritos antes de cambiar lógica

- [ ] 1.2 **Crear ADR-012 — Alineación visual con DESIGN.md**

  **What to do**:
  - Leer `DESIGN.md` si existe
  - Detectar: tokens inexistentes en código vs DESIGN.md, colores hardcodeados, componentes locales duplicados, overlays inaccesibles (DialogTitle)
  - Crear `docs/adr/ADR-012-visual-alignment.md`
  - SSOT visual = DESIGN.md

  **Archivos**:
  - CREATE `docs/adr/ADR-012-visual-alignment.md`

  **Acceptance Criteria**:
  - [ ] ADR-012 creado con inventario de discrepancias visuales

- [ ] 1.3 **Crear ADR-014 — Consent Gateway**

  **What to do**:
  - Revisar backend privacy/consents existentes
  - Revisar frontend dashboard layout
  - Definir: rutas bloqueadas, rutas excluidas (login, logout, privacy-policy, privacy-notice, terms, support)
  - Definir versión de política (policyVersion)
  - No bloquea logout
  - Crear `docs/adr/ADR-014-consent-gateway.md`

  **Archivos**:
  - CREATE `docs/adr/ADR-014-consent-gateway.md`

  **Acceptance Criteria**:
  - [ ] ADR-014 creado con diseño de ConsentGate

- [ ] 1.4 **Crear characterization tests del flujo actual**

  **What to do**:
  - Antes de modificar state machine, escribir tests que capturen comportamiento actual
  - Test: cada transición válida funciona
  - Test: cada transición inválida es bloqueada
  - Test: RBAC por transición
  - Test: service case snapshot devuelve step correcto

  **Archivos**:
  - CREATE/UPDATE `backend/tests/services/service-case-state-machine.test.ts`
  - CREATE/UPDATE `backend/tests/services/cermont-workflow-gate.service.test.ts`

  **Acceptance Criteria**:
  - [ ] npm test → PASS (tests nuevos)
  - [ ] characterization tests capturan comportamiento actual

  **Commit**: YES (with 1.5)

- [ ] 1.5 **Alinear state machine con flujo canónico**

  **What to do**:
  - Basado en ADR-011, modificar `service-case-state-machine.ts` si hay conflictos
  - Asegurar 14 pasos exactos con códigos estables
  - No migrar datos persistidos
  - Compatibilidad hacia atrás: aceptar `currentStepKey` legacy

  **Archivos**:
  - UPDATE `packages/domain/src/workflow/service-case-state-machine.ts`
  - UPDATE `packages/domain/src/workflow/operational-steps.ts`

  **Acceptance Criteria**:
  - [ ] typecheck PASS
  - [ ] Test PASS (characterization + nuevos)
  - [ ] quality:strict PASS

  **Commit**: YES — `feat(workflow): canonical 14-step flow state machine`

- [ ] 1.6 **Crear visual-alignment-report.md**

  **What to do**:
  - Documentar hallazgos visuales: tokens, colores, componentes duplicados
  - Priorizar correcciones para Wave 5 (frontend)

  **Commit**: YES (with 1.5)

- [ ] 1.7 **Crear consent-gateway-report.md**

  **What to do**:
  - Documentar diseño de ConsentGate
  - Mapa de rutas: bloqueadas (+3), excluidas (6)

  **Commit**: YES (with 1.3)

- [ ] 1.8 **Ejecutar baseline post-ADRs**

  **What to do**:
  - `npm run typecheck && npm run lint && npm test && npm run contracts:check && npm run quality:strict`
  - Confirmar que ADRs no rompieron nada

---

### Wave 2 — Gates Rojos y Calidad P0 (Día 2-3)

- [ ] 2.1 **Corregir violación quality:strict (weak-token-u en Evidence.ts)**

  **What to do**:
  - Archivo: `backend/src/models/Evidence.ts:215` — reemplazar `unknown` con tipo concreto
  - Revisar si hay más violaciones nuevas además de las 30 anteriores
  - Actualizar baseline: `tooling/quality/baseline.json`

  **Archivos**:
  - UPDATE `backend/src/models/Evidence.ts`
  - UPDATE `tooling/quality/baseline.json`

  **Acceptance Criteria**:
  - [ ] `npm run quality:strict` → PASS

  **Commit**: YES (with 2.2)

- [ ] 2.2 **Mejorar React Doctor de 87 a 90+**

  **What to do**:
  - Revisar 12 issues: 4 bugs, 2 a11y, 6 maintainability
  - Corregir bugs prioritarios
  - Documentar issues que no se puedan resolver ahora

  **Acceptance Criteria**:
  - [ ] `npx react-doctor@latest` → ≥90/100
  - [ ] O: lista de issues documentados con razón

- [ ] 2.3 **Diagnosticar build/Turbo (si no termina)**

  **What to do**:
  - `npm run build -- --force` para descartar cache corrupto
  - Identificar qué paso del build no termina
  - Si build pasa, documentar y seguir

  **Acceptance Criteria**:
  - [ ] Build termina en <5 min

- [ ] 2.4 **Corregir verify**

  **What to do**:
  - `npm run verify` → identificar qué falla
  - Corregir: lint o quality:strict

  **Acceptance Criteria**:
  - [ ] `npm run verify` → PASS

  **Commit**: YES — `fix(quality): resolve weak-token-u violations and improve React Doctor score`

---

### Wave 3 — Flujo Central 14 Pasos (Día 3-5)

- [ ] 3.1 **Alinear workflow gate service con state machine canónica**
- [ ] 3.2 **Implementar requisitos por paso (step-requirements.ts)**
- [ ] 3.3 **Implementar documentos requeridos por paso**
- [ ] 3.4 **Implementar evidencias requeridas por paso**
- [ ] 3.5 **Implementar checklists requeridos por paso**
- [ ] 3.6 **Implementar RBAC por transición**
- [ ] 3.7 **Implementar timeline de orden**
- [ ] 3.8 **Implementar UI visual del flujo de 14 pasos**
- [ ] 3.9 **Implementar notificación por bloqueo de paso**

---

### Wave 4 — Módulos Profesionales (Día 5-8)

- [ ] 4.1 **Fleet gallery + camera + readiness score**
- [ ] 4.2 **Fleet documents + expiry alerts**
- [ ] 4.3 **Tools/Assets photos + documents**
- [ ] 4.4 **Tools checkin/checkout**
- [ ] 4.5 **Evidences FSM gallery + camera + PDF**
- [ ] 4.6 **Evidence approval + download audit**
- [ ] 4.7 **Checklists blocking items + required photo**
- [ ] 4.8 **Costs estimated vs actual comparison**
- [ ] 4.9 **Maintenance schedules + logs + SLA**

---

### Wave 5 — Frontend Excellence y Navegación (Día 8-10)

- [ ] 5.1 **Dashboard action cards**
- [ ] 5.2 **Flujo visual de 14 pasos en navegación**
- [ ] 5.3 **Sidebar y navegación móvil coherentes**
- [ ] 5.4 **Breadcrumbs y deep links**
- [ ] 5.5 **Conectar botones sin acción**
- [ ] 5.6 **Alinear UI con DESIGN.md**

---

### Wave 6 — Privacy, Consent y WebAuthn (Día 10-12)

- [ ] 6.1 **Implementar ConsentGate en dashboard layout**
- [ ] 6.2 **Implementar privacy requests frontend**
- [ ] 6.3 **Completar WebAuthn login con passkey**
- [ ] 6.4 **Implementar Passkey Manager en perfil**
- [ ] 6.5 **Agregar enlaces legales en perfil/navegación**

---

### Wave 7 — Optimización (Día 12-14)

- [ ] 7.1 **Agregar índices compuestos en modelos Mongoose**
- [ ] 7.2 **Estandarizar paginación con límite máximo**
- [ ] 7.3 **Agregar lean() en queries de solo lectura**
- [ ] 7.4 **Optimizar TanStack Query enabled/invalidation**
- [ ] 7.5 **Agregar lazy loading + code splitting en frontend**
- [ ] 7.6 **Mejorar PWA cache strategy + offline fallback**

---

### Wave 8 — Tests, CI y Verificación (Día 14-16)

- [ ] 8.1 **Crear contract tests para nuevos schemas**
- [ ] 8.2 **Crear backend integration tests para módulos nuevos**
- [ ] 8.3 **Crear frontend component tests**
- [ ] 8.4 **Crear Playwright E2E (flujo 14 pasos, fleet, tools, evidences)**
- [ ] 8.5 **Agregar accessibility checks**
- [ ] 8.6 **Ejecutar full verification pipeline**

---

### Wave 9 — Cierre y Documentación (Día 16-17)

- [ ] 9.1 **Actualizar docs/DEVELOPMENT_STATUS.md**
- [ ] 9.2 **Actualizar docs/API_STATUS.md**
- [ ] 9.3 **Actualizar docs/TECHNICAL_DEBT.md**
- [ ] 9.4 **Actualizar docs/KNOWN_ISSUES.md**
- [ ] 9.5 **Actualizar docs/CHANGELOG.md**
- [ ] 9.6 **Crear reporte final con veredicto (READY_FOR_DEPLOY / READY_WITH_WARNINGS / BLOCKED)**

---

## Final Verification Wave

> 4 revisiones paralelas. Todas deben aprobar. Presentar resultados al usuario y esperar "okay" explícito antes de cerrar.

- [ ] F1. **Plan Compliance Audit** — Verificar que cada "Must Have" esté implementado, cada "Must NOT Have" esté ausente.
- [ ] F2. **Code Quality Review** — `tsc --noEmit` + lint + test + build + contracts:check + quality:strict + react-doctor
- [ ] F3. **Real Manual QA** — Ejecutar escenarios de cada wave, evidencia en `.sisyphus/evidence/`
- [ ] F4. **Scope Fidelity Check** — Cada tarea implementada según spec; nada fuera de scope

---

## Commit Strategy

- **Wave 0**: `chore(wip): protect current work on temp branch`
- **Wave 1**: `docs(adr): add ADR-011, ADR-012, ADR-014`
- **Wave 2**: `fix(quality): resolve weak-token-u violations + React Doctor issues`
- **Wave 3**: `feat(workflow): canonical 14-step flow state machine + UI`
- **Wave 4**: `feat(modules): fleet gallery, tools photos, evidences, checklists, costs, maintenance`
- **Wave 5**: `feat(frontend): dashboard actions, flow navigation, sidebar, breadcrumbs`
- **Wave 6**: `feat(privacy): consent gate, privacy requests, WebAuthn completion`
- **Wave 7**: `perf(optimization): indexes, queries, PWA cache, TanStack Query`
- **Wave 8**: `test: add integration, E2E, accessibility tests`
- **Wave 9**: `docs: update status docs and final report`

---

## Success Criteria

### Verification Commands (final)
```bash
npm run typecheck        # → PASS
npm run lint             # → PASS
npm test                 # → PASS (1091+ nuevos)
npm run build            # → PASS
npm run contracts:check  # → PASS
npm run quality:strict   # → PASS
npm run verify           # → PASS
npx react-doctor@latest  # → ≥90/100
```

### Final Checklist
- [ ] WIP protegido y clasificado
- [ ] ADR-011, ADR-012, ADR-014 resueltos
- [ ] quality:strict PASS
- [ ] React Doctor ≥90/100
- [ ] Flujo 14 pasos canónico implementado
- [ ] Workflow gate service alineado
- [ ] Fleet gallery + camera + readiness funcional
- [ ] Tools/Assets photos + documents funcional
- [ ] Evidences FSM gallery + PDF + download audit funcional
- [ ] Checklists blocking items + required photo funcional
- [ ] Costs estimated vs actual UI funcional
- [ ] Maintenance schedules + logs funcional
- [ ] Dashboard action cards funcional
- [ ] Sidebar + navegación móvil coherente
- [ ] Consent gate funcional en dashboard layout
- [ ] Privacy requests frontend funcional
- [ ] WebAuthn login + profile funcional
- [ ] MongoDB indexes agregados
- [ ] TanStack Query enabled + invalidation optimizado
- [ ] PWA cache + offline fallback
- [ ] E2E tests nuevos agregados
- [ ] Documentación viva actualizada
- [ ] No `any`, no mocks, no código externo
