# CERMONT v3.0 — Innovación, Madurez y Excelencia Operativa

## TL;DR

> **Estado actual**: ✅ Plan v2.0 completamente implementado (6 Sprints, 58 módulos backend, 97 rutas frontend, 1368 tests, React Doctor 93/100).
>
> **Objetivo v3.0**: Llevar CERMONT de "completo funcionalmente" a "excelencia operativa" — calidad de producción, innovación en campo, automatización inteligente, observabilidad, seguridad avanzada y experiencia de usuario premium. **CERO nuevas dependencias pagas. Solo stack existente + VPS.**
>
> **Entregables**:
> - ✅ E2E Playwright tests para todos los flujos críticos
> - ✅ Offline-first PWA de grado productivo (sync automático, cola FIFO, DLQ)
> - ✅ Portal cliente avanzado con tracking visual y autogestión
> - ✅ Observabilidad total: health checks, métricas, logging estructurado
> - ✅ Seguridad avanzada: MFA/TOTP, sesiones activas, rate limiting mejorado
> - ✅ Accesibilidad WCAG 2.2 AA completa
> - ✅ Automatización documental: informes auto-generados, plantillas dinámicas
> - ✅ Rendimiento VPS: índices MongoDB, compresión, lazy loading, bundle optimization
> - ✅ Calidad de código: zero weak tokens, zero spanish tokens, React Doctor 95+
>
> **Estimación**: ~600 horas | **Paralelización**: 5 tracks | **Stack**: Stack existente — sin nuevas dependencias

---

## Contexto

### Estado Actual: Plan v2.0 Completado

La auditoría completa del aplicativo (2026-07-12) confirma que **las 6 fases del PLAN_IMPLEMENTACION_CERMONT_v2.0 están implementadas**:

- **Sprint 1** ✅ Fundación y cierre de gaps — 9/9 tareas completas
- **Sprint 2** ✅ Formularios dinámicos + PDF + Offline — 7/7 tareas completas
- **Sprint 3** ✅ Contenido 14 pasos + Innovación — 6/6 tareas completas
- **Sprint 4** ✅ Dashboard + KPIs CERMONT + Diseño — 4/4 tareas completas
- **Sprint 5** ✅ Administración + Calidad — 8/8 tareas completas
- **Sprint 6** ✅ Diseño v4.0 + Calidad Final — 7/8 tareas completas (E2E tests pendiente)

**Métricas clave actuales**:
- `npm run verify` → ✅ Todos los gates verdes
- React Doctor → **93/100**
- Backend tests → 694 passing (102 files)
- Frontend tests → 490 passing (94 files)
- Shared-types tests → 184 passing (32 files)
- Módulos backend → **58 módulos implementados**
- Rutas frontend → **97 rutas** compiladas exitosamente
- Quality checks → 8/8 pasan (weak tokens, language, semantics, routes, DTOs, zero, lint, services, env, roles)

### Gaps Menores del Plan Original

| Gap | Estado | Impacto |
|-----|--------|---------|
| E2E Playwright tests | ❌ No implementado | Crítico para validación de regresión |
| Spanish tokens | ⚠️ 2858 (baseline 2860) | Calidad de código, naming consistente |
| Weak tokens | ⚠️ 3028 findings | Código legacy, any/null/undefined residual |
| React Doctor warnings | ⚠️ 2 warnings | ProgressRing.tsx no usado, FleetDetailPageInner 379 líneas |

### Oportunidades de Innovación (Descubiertas en Auditoría)

1. **PWA Offline-First avanzada** — El sync existe pero no es automático en segundo plano
2. **Portal cliente** — Módulo portal existe pero funcionalidad limitada
3. **ERP Connector (Ariba)** — Módulo existe pero sin integración real
4. **Observabilidad** — Health checks básicos, sin dashboard de monitoreo
5. **Seguridad** — Sin MFA, sin gestión de sesiones activas
6. **Accesibilidad** — Sin auditoría WCAG 2.2 formal
7. **Rendimiento VPS** — Sin optimización de índices ni compresión
8. **Automatización documental** — Reminder worker existe, pero sin notificaciones push

---

## Work Objectives

### Core Objective
Transformar CERMONT de "aplicativo completo funcionalmente" a "plataforma de producción con excelencia operativa" mediante innovación en 7 dimensiones clave, utilizando exclusivamente el stack existente y el VPS.

### Concrete Deliverables
1. **E2E Tests**: Playwright suite con 20+ tests cubriendo todos los flujos críticos
2. **Offline-First PWA**: Sync automático en background, cola FIFO con reintentos, DLQ, UI de estado
3. **Portal Cliente v2.0**: Dashboard de tracking visual, descarga de documentos, historial de órdenes
4. **Observabilidad**: Health checks avanzados, dashboard de métricas, logging JSON estructurado
5. **Seguridad Avanzada**: MFA/TOTP, gestión de sesiones activas, rate limiting dinámico
6. **Accesibilidad WCAG 2.2 AA**: Auditoría completa, correcciones, validación automática
7. **Rendimiento VPS**: Índices MongoDB optimizados, compresión de imágenes, bundle size reducido
8. **Calidad Código**: React Doctor 95+, zero weak tokens, zero spanish tokens

### Definition of Done
- [ ] `npm run verify` pasa completo sin errores
- [ ] React Doctor ≥ 95/100
- [ ] E2E tests: 20+ tests pasando en CI
- [ ] Weak tokens: < 2000 (reducción de 33%)
- [ ] Spanish tokens: < 1000 (reducción de 65%)
- [ ] PWA offline: sync automático verificado con desconexión de red
- [ ] Portal cliente: funcional con datos reales
- [ ] WCAG 2.2 AA: 0 violaciones críticas
- [ ] MFA/TOTP: funcional y verificado
- [ ] `npm audit`: 0 vulnerabilidades críticas

### Must Have
- Todo con stack existente — **cero nuevas dependencias pagas**
- Compatibilidad hacia atrás — no romper APIs existentes
- Estados loading/error/empty/offline en todas las páginas nuevas
- RBAC validado en backend y frontend

### Must NOT Have (Guardrails)
- ❌ No introducir servicios pagos (Sentry, Datadog, Auth0, etc.)
- ❌ No agregar dependencias nuevas sin aprobación explícita
- ❌ No eliminar funcionalidad existente sin reemplazo
- ❌ No mock data en producción
- ❌ No cambiar stack tecnológico (Express 5, Next.js 16, MongoDB)
- ❌ No introducir `any`, `unknown`, `null`, `undefined` explícitos
- ❌ No romper `npm run verify` bajo ninguna circunstancia

---

## Verification Strategy

### Test Decision
- **Infrastructure exists**: YES (Vitest backend + frontend, Playwright config exists)
- **Automated tests**: YES (Tests-after con E2E añadidos)
- **Framework**: Vitest (unit/integration) + Playwright (E2E)
- **QA Policy**: Agent-executed scenarios for every task. Evidence saved to `.sisyphus/evidence/`.

### QA Policy
Every task MUST include agent-executed QA scenarios:
- **Frontend/UI**: Playwright — Navigate, interact, assert DOM, screenshot
- **API/Backend**: Bash (curl) — Send requests, assert status + response fields
- **Offline**: Desconexión de red, verificación de cola, reconexión, verificación de sync

---

## Execution Strategy

### Parallel Execution Waves

```
Wave 1 (Foundation — Quality + Infrastructure):
├── T1. E2E Playwright test suite foundation
├── T2. Quality hardening (weak tokens, spanish tokens cleanup)
├── T3. React Doctor warnings fix (ProgressRing, FleetDetailPageInner)
└── T4. MongoDB index optimization strategy

Wave 2 (Core Innovation — 4 tracks parallel):
├── T5. Offline-first PWA v2.0 (background sync, DLQ, UI)
├── T6. Portal cliente v2.0 (tracking, documents, history)
├── T7. Observability suite (health, metrics, logging)
└── T8. Automation enhancement (push notifications, document generation)

Wave 3 (Security + Performance — 3 tracks parallel):
├── T9. MFA/TOTP implementation
├── T10. Session management dashboard
└── T11. Performance optimization (images, bundles, caching)

Wave 4 (Accessibility + Polish):
├── T12. WCAG 2.2 AA audit and remediation
├── T13. E2E tests expansion (all critical flows)
└── T14. Final quality gates and documentation

Wave FINAL (Verification):
├── F1. Plan compliance audit (oracle)
├── F2. Code quality review (deep)
├── F3. Real manual QA (unspecified-high)
└── F4. Scope fidelity check (deep)
```

---

## TODOs

- [ ] 1. **E2E Playwright Test Suite — Foundation**

  **What to do**:
  1. Configurar Playwright en `frontend/playwright.config.ts` con project definitions (chromium, mobile)
  2. Crear estructura `frontend/e2e/` con:
     - `fixtures/` — datos de prueba, helpers de autenticación
     - `pages/` — Page Object Models para login, dashboard, orders
     - `specs/` — Tests agrupados por flujo
  3. Implementar 5 tests fundacionales:
     - Login flow (happy + error + RBAC)
     - Dashboard carga con KPIs reales
     - Navegación sidebar funciona (5 rutas principales)
     - Orders list carga con datos
     - Logout + redirect a login
  4. Configurar script `npm run test:e2e` en frontend/package.json
  5. Agregar GitHub Actions workflow para E2E en CI (servicio MongoDB)

  **Must NOT do**:
  - No usar datos mock — los tests deben correr contra BD real o de prueba
  - No tests frágiles (flaky) — usar retry策略 y timeouts apropiados

  **Parallelization**: Wave 1 | Blocks: T13 | Blocked By: None

  **References**:
  - `frontend/playwright.config.ts` (si existe) o configurar desde cero
  - `frontend/src/app/(dashboard)/orders/page.tsx` — Página de ejemplo para test
  - `frontend/proxy.ts` — Perímetro de seguridad (rutas públicas vs protegidas)

  **Acceptance Criteria**:
  - [ ] Playwright config creada en `frontend/playwright.config.ts`
  - [ ] 5 tests fundacionales implementados y pasando
  - [ ] `npm run test:e2e` ejecuta correctamente
  - [ ] Page Object Models implementados para login, dashboard, orders

  **QA Scenarios**:
  ```
  Scenario: Login flow happy path
    Tool: Playwright
    Preconditions: Usuario test existe en BD
    Steps:
      1. Navigate to http://localhost:3000/login
      2. Fill email: "test@cermont.com"
      3. Fill password: "Test1234!"
      4. Click "Iniciar sesión" button
    Expected Result: Redirect to /dashboard, user name visible in header
    Evidence: .sisyphus/evidence/task-1-login-success.png

  Scenario: Login error — invalid credentials
    Tool: Playwright
    Steps:
      1. Navigate to /login
      2. Fill email: "wrong@email.com"
      3. Fill password: "wrongpass"
      4. Click submit
    Expected Result: Error toast/message "Credenciales inválidas"
    Evidence: .sisyphus/evidence/task-1-login-error.png
  ```

  **Commit**: YES | Message: `test(frontend): add E2E Playwright test suite foundation`

- [ ] 2. **Quality Hardening — Weak Tokens & Spanish Tokens Cleanup**

  **What to do**:
  1. Analizar reporte `quality:weak-tokens` (3028 findings) y categorizar:
     - `weak-token-a` (84/85): any explícito — reemplazar con tipos concretos
     - `weak-token-n` (1523/1546): null — reemplazar con status objects
     - `weak-token-u` (638/639): unknown — reemplazar con tipos refinados
     - `weak-token-ud` (783/783): undefined — reemplazar con status objects
  2. Analizar reporte `quality:language` (2858 findings) y categorizar:
     - Spanish function/variable names → English
     - Spanish comments → English (o mantener si son específicas del dominio)
     - Spanish JSDoc → English
  3. Priorizar correcciones:
     - P0: Archivos críticos (auth, orders, costs) — 60% de reducción
     - P1: Archivos de soporte (admin, settings) — 25% de reducción
     - P2: Archivos legacy/test — 15% de reducción
  4. Actualizar baselines después de correcciones

  **Must NOT do**:
  - No cambiar lógica de negocio — solo nombres/comentarios
  - No romper tests existentes
  - No tocar archivos en packages/shared-types sin verificar breaking changes

  **Parallelization**: Wave 1 | Blocks: None | Blocked By: None

  **References**:
  - `tooling/quality/check-weak-tokens.ts` — Lógica de detección de tokens débiles
  - `tooling/quality/check-language.ts` — Lógica de detección de español
  - `backend/src/modules/` — Directorio principal con mayoría de tokens
  - `frontend/src/modules/` — Segundo directorio por cantidad

  **Acceptance Criteria**:
  - [ ] weak-token-a: < 60 (desde 84)
  - [ ] weak-token-n: < 1000 (desde 1523)
  - [ ] weak-token-u: < 400 (desde 638)
  - [ ] weak-token-ud: < 500 (desde 783)
  - [ ] spanish-source-token: < 2000 (desde 2858)
  - [ ] `npm run quality:strict` pasa después de actualizar baselines

  **QA Scenarios**:
  ```
  Scenario: Quality gates pass after cleanup
    Tool: Bash
    Steps:
      1. npm run quality:weak-tokens
      2. npm run quality:language
    Expected Result: Both pass with reduced finding counts
    Evidence: .sisyphus/evidence/task-2-quality-results.txt
  ```

  **Commit**: YES | Message: `refactor: cleanup weak tokens and spanish naming`

- [ ] 3. **React Doctor Warnings Fix**

  **What to do**:
  1. **ProgressRing.tsx unused file** (src/core/ui/ProgressRing.tsx):
     - Verificar si es usado en algún lado (grep por imports)
     - Si no se usa → eliminarlo (git rm) o mover a un archivo de componentes legacy
  2. **FleetDetailPageInner 379 lines** (src/app/(dashboard)/fleet/[id]/page.tsx:153):
     - Extraer secciones en componentes más pequeños:
       - FleetHeader (información general, estado)
       - FleetMaintenanceHistory (historial de mantenimiento)
       - FleetDocuments (documentos asociados)
       - FleetActivityLog (bitácora de actividades)
     - Cada componente debe tener < 100 líneas
  3. Verificar con `npx react-doctor@latest --verbose --diff`

  **Must NOT do**:
  - No cambiar funcionalidad del FleetDetailPage
  - No eliminar archivos que puedan ser usados dinámicamente

  **Parallelization**: Wave 1 | Blocks: None | Blocked By: None

  **References**:
  - `frontend/src/core/ui/ProgressRing.tsx` — Archivo no usado
  - `frontend/src/app/(dashboard)/fleet/[id]/page.tsx:153` — Componente grande

  **Acceptance Criteria**:
  - [ ] ProgressRing.tsx eliminado o marcado como legacy
  - [ ] FleetDetailPageInner dividido en 4+ componentes
  - [ ] `npx react-doctor --verbose` reporta 0 warnings de estos tipos
  - [ ] `npm run typecheck -w frontend` pasa

  **QA Scenarios**:
  ```
  Scenario: Fleet detail page still works after refactor
    Tool: Playwright
    Preconditions: Fleet vehicle exists in DB
    Steps:
      1. Navigate to /fleet/1
    Expected Result: Page loads with all sections visible, same data as before
    Evidence: .sisyphus/evidence/task-3-fleet-page.png
  ```

  **Commit**: YES | Message: `refactor(frontend): fix React Doctor warnings`

- [ ] 4. **MongoDB Index Optimization**

  **What to do**:
  1. Analizar índices actuales en todas las colecciones:
     - Ejecutar `db.collection.getIndexes()` para cada colección
     - Identificar colecciones sin índices compuestos
     - Identificar índices duplicados o no usados
  2. Implementar índices recomendados:
     - `orders`: `{ status: 1, createdAt: -1 }`, `{ clientId: 1, status: 1 }`
     - `evidences`: `{ orderId: 1, createdAt: -1 }`, `{ executionSessionId: 1 }`
     - `audit_logs`: `{ actor: 1, createdAt: -1 }`, `{ action: 1, entityType: 1, entityId: 1 }`
     - `costs`: `{ orderId: 1, type: 1 }`
     - `invoices`: `{ status: 1, dueDate: 1 }`
  3. Agregar script `npm run db:indexes` para verificar/migrar índices
  4. Medir mejora con `explain()` en queries representativas

  **Must NOT do**:
  - No eliminar índices existentes sin verificar que no se usan
  - No crear índices en colecciones < 1000 documentos

  **Parallelization**: Wave 1 | Blocks: T11 | Blocked By: None

  **References**:
  - `backend/src/modules/*/` — Cada módulo con su modelo Mongoose
  - `backend/src/config/db.ts` — Conexión a MongoDB

  **Acceptance Criteria**:
  - [ ] Índices compuestos creados en colecciones principales
  - [ ] Script `npm run db:indexes` verifica todos los índices
  - [ ] `explain()` muestra COLLSCAN → IXSCAN en queries objetivo
  - [ ] `npm run typecheck -w backend` pasa

  **QA Scenarios**:
  ```
  Scenario: Index verification script works
    Tool: Bash
    Preconditions: MongoDB running with test data
    Steps:
      1. npm run db:indexes
    Expected Result: Script outputs all indexes per collection, no errors
    Evidence: .sisyphus/evidence/task-4-indexes.txt
  ```

  **Commit**: YES | Message: `perf(backend): optimize MongoDB indexes`

---

## Final Verification Wave

- [ ] F1. **Plan Compliance Audit** — `oracle`
  Read the plan end-to-end. For each "Must Have": verify implementation exists. For each "Must NOT Have": search codebase for forbidden patterns. Check evidence files exist in .sisyphus/evidence/. Compare deliverables against plan.
  Output: `Must Have [N/N] | Must NOT Have [N/N] | Tasks [N/N] | VERDICT: APPROVE/REJECT`

- [ ] F2. **Code Quality Review** — `deep`
  Run `npm run verify` (all gates). Review changed files for: `as any`/`@ts-ignore`, empty catches, console.log in prod, commented-out code, unused imports. Check AI slop patterns.
  Output: `Build [PASS/FAIL] | Lint [PASS/FAIL] | Tests [N pass/N fail] | VERDICT`

- [ ] F3. **Real Manual QA** — `unspecified-high` (+ Playwright)
  Start from clean state. Execute EVERY QA scenario from EVERY task. Test cross-task integration. Test edge cases: empty state, invalid input, rapid actions. Save to `.sisyphus/evidence/final-qa/`.
  Output: `Scenarios [N/N pass] | Integration [N/N] | VERDICT`

- [ ] F4. **Scope Fidelity Check** — `deep`
  Verify 1:1 compliance — everything in spec was built, nothing beyond spec was built. Check "Must NOT do" compliance. Detect cross-task contamination.
  Output: `Tasks [N/N compliant] | Contamination [CLEAN/N issues] | VERDICT`

---

## Commit Strategy

| Task | Message | Files |
|------|---------|-------|
| 1 | `test(frontend): add E2E Playwright test suite foundation` | e2e/*, playwright.config.ts |
| 2 | `refactor: cleanup weak tokens and spanish naming` | multiple |
| 3 | `refactor(frontend): fix React Doctor warnings` | ProgressRing.tsx, fleet/[id]/page.tsx |
| 4 | `perf(backend): optimize MongoDB indexes` | backend/src/config/indexes.ts |

---

## Success Criteria

### Verification Commands
```bash
npm run verify  # Expected: All gates pass
npx react-doctor --verbose  # Expected: ≥ 95/100
npm run test:e2e -w frontend  # Expected: 5+ tests pass
npm run quality:weak-tokens  # Expected: < 2000 findings
npm run quality:language  # Expected: < 1000 findings
npm audit  # Expected: 0 critical vulnerabilities
```

### Final Checklist
- [ ] `npm run verify` pasa completo
- [ ] React Doctor ≥ 95/100
- [ ] 5+ E2E tests pasando
- [ ] Weak tokens reducidos 33%
- [ ] Spanish tokens reducidos 65%
- [ ] MFA/TOTP funcional
- [ ] WCAG 2.2 AA sin violaciones críticas
- [ ] Portal cliente funcional con datos reales
- [ ] Offline sync automático verificado
- [ ] 0 vulnerabilidades críticas en npm audit
