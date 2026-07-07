# Spec 008 — Auditoría, Investigación y Mejora Continua CERMONT Multiusos (FSM + GMAO + ERP + SaaS)

## TL;DR

> **Resumen**: Auditoría integral de CERMONT S.A.S. tras 7 especificaciones anteriores. Se ejecutaron gates (typecheck/lint/test/build/contracts/quality), se investigó Next.js 16 con Context7, se auditaron arquitectura, frontend/backend, RBAC, FileAsset, PWA/offline y 26+ módulos de negocio. El baseline muestra **1013 tests pasando**, pero **quality:strict falla** con 2861 weak tokens (any/null/unknown/undefined) que exceden el baseline, y React Doctor bajó de 87 a 77/100. Se identificaron 7 P0, 5 P1, 6 P2 y 6 P3 con 12 slices ejecutables priorizados.

> **Deliverables**:
> - `specs/008-auditoria-investigacion-mejora-continua-cermont/baseline.md`
> - `specs/008-auditoria-investigacion-mejora-continua-cermont/context7-research.md`
> - `specs/008-auditoria-investigacion-mejora-continua-cermont/vercel-reference-audit.md`
> - `docs/architecture/FRONTEND_BACKEND_MATRIX.md` (crear)
> - `docs/architecture/DOMAIN_MODULE_MAP.md` (crear)
> - `docs/architecture/PWA_OFFLINE_FLOW_MAP.md` (crear)
> - `docs/product/CERMONT_MULTISERVICE_PRODUCT_AUDIT.md` (crear)
> - `docs/product/CERMONT_INNOVATION_ROADMAP.md` (crear)
> - `specs/008-auditoria-investigacion-mejora-continua-cermont/implementation-roadmap.md`
> - 12 slices ejecutables en `specs/008-auditoria-investigacion-mejora-continua-cermont/slices/`
> - `docs/product/CERMONT_NEXT_DEVELOPMENT_PLAN.md`

> **Estimated Effort**: XL (12 slices, 40+ tasks across 4 waves)
> **Parallel Execution**: YES — 4 waves with max 8 tasks parallel
> **Critical Path**: Baseline gates → Missing maps → P0 slice-01 (stabilization) → P0 slice-02 (FileAsset) → P1 slices → P2 innovation

---

## Context

### Gate Baseline (Phase 0 — ejecutado)

| Gate | Result | Detail |
|------|--------|--------|
| `git status` | ✅ | Branch `refactor/spec-007-memory-innovation`, 4 modified, 200+ untracked |
| `npm run typecheck` | ✅ PASS | 7/7 tasks (5 cached), 56.98s |
| `npm run lint` | ✅ PASS | 7/7 tasks (2.5s), no fixes needed |
| `npm test` | ✅ PASS | 170 files, 1013 tests (231 FE + 624 BE + 158 shared) |
| `npm run build` | ✅ PASS | 5/5 tasks, 89 frontend routes |
| `npm run contracts:check` | ✅ PASS | Snapshot sha256:c2cd5b... confirmed |
| `npm run quality:strict` | ❌ FAIL | 2861 weak tokens: any(67/65), null(1449/1440), unknown(594/592), undefined(751/742) |
| `npm run verify` | ❌ FAIL | Propagated from quality:strict |
| `npx react-doctor@latest` | ⚠️ 77/100 | 21 issues (1 bug, 6 a11y, 9 maintainability) |

### Research Findings

**Next.js 16 (Context7 + web search)**:
- `params` y `searchParams` son Promises en Next.js 16 — deben usar `await` obligatoriamente
- `proxy.ts` es el perímetro de seguridad correcto (no `middleware.ts`)
- `error.tsx` y `not-found.tsx` por segmento son la práctica recomendada
- `generateMetadata()` reemplaza `export const metadata` para casos dinámicos
- OpenTelemetry via `instrumentation.ts` soportado nativamente
- Cache Components (`use cache`, `cacheLife`, `cacheTag`) disponibles desde Next.js 16
- PWA/manifest configurables via `next.config.ts` + Serwist (ya implementado)

**Missing documents**:
- `docs/architecture/PWA_OFFLINE_FLOW_MAP.md` — NO EXISTE
- `docs/architecture/FRONTEND_BACKEND_MATRIX.md` — NO EXISTE
- `docs/architecture/DOMAIN_MODULE_MAP.md` — NO EXISTE
- `LTG_JUAN_DIEGO_AREVALO-3_markdown.md` — NO ENCONTRADO
- `specs/001` a `specs/007` — no encontrados en el directorio `specs/`

### Metis Review Summary

- **Critical gaps found**: quality:strict fails baseline → blocks P0 readiness
- **Architecture maps**: 3 missing (PWA_OFFLINE_FLOW, FRONTEND_BACKEND_MATRIX, DOMAIN_MODULE_MAP)
- **LTG file missing**: referenced in spec but not in repo — cannot validate against it
- **React Doctor**: score dropped from 87→77 — needs investigation
- **RBAC**: well-documented but `administrativo` and `cliente` roles have gaps
- **FileAsset**: canonical engine exists but owner alignment inconsistent
- **PWA/offline**: implemented but undocumented (no flow map)
- **Legal/Privacy**: `not-started` — high risk

---

## Work Objectives

### Core Objective
Ejecutar auditoría completa de CERMONT, investigar mejores prácticas con Context7, y crear un roadmap priorizado P0/P1/P2/P3 con 12 slices ejecutables para evolucionar la plataforma hacia FSM + GMAO + ERP + SaaS.

### Concrete Deliverables
1. **baseline.md** — Gates ejecutados con resultados y métricas
2. **context7-research.md** — Investigación Next.js 16 prácticas recomendadas
3. **vercel-reference-audit.md** — Comparativa Vercel vs VPS CERMONT
4. **FRONTEND_BACKEND_MATRIX.md** — Matriz frontend/backend completa
5. **DOMAIN_MODULE_MAP.md** — Mapa de módulos por dominio de negocio
6. **PWA_OFFLINE_FLOW_MAP.md** — Flujo PWA/offline documentado
7. **CERMONT_MULTISERVICE_PRODUCT_AUDIT.md** — Auditoría de 26 módulos
8. **CERMONT_INNOVATION_ROADMAP.md** — 10 ideas de innovación evaluadas
9. **implementation-roadmap.md** — Roadmap P0/P1/P2/P3 priorizado
10. **12 slices ejecutables** — Plan técnico por slice

### Definition of Done (Spec 008)
- [ ] Gates ejecutados y documentados en baseline.md
- [ ] Context7 research completado con tabla tema/recomendación/aplicación/acción
- [ ] Vercel reference audit creado con 4 categorías (REFERENCE_ONLY, OPTIONAL_PREVIEW_QA, BLOCKED, APPROVED)
- [ ] Mapas de arquitectura: FRONTEND_BACKEND_MATRIX, DOMAIN_MODULE_MAP, PWA_OFFLINE_FLOW_MAP
- [ ] Auditoría de producto multiservicio: 26 módulos evaluados con nivel 0-5
- [ ] Innovation roadmap: 10 ideas con MVP, riesgo, impacto y prioridad
- [ ] Roadmap P0/P1/P2/P3 priorizado con matriz impacto/riesgo/esfuerzo
- [ ] 12 slices ejecutables con IA/QA scenarios
- [ ] Primer sprint recomendado con impact map
- [ ] Documentación viva actualizada

### Must Have
- quality:strict debe quedar verde antes de cualquier cambio P1+
- Todos los mapas de arquitectura deben existir y ser verificables
- RBAC debe usarse consistentemente en frontend y backend
- Contract-First debe ser la regla para nuevos módulos
- No introducir `any`, `null`, `unknown`, `undefined` nuevos

### Must NOT Have (Guardrails)
- No implementar código durante fase de planificación
- No reemplazar VPS por Vercel
- No proponer módulos duplicados
- No prometer innovación sin MVP verificable
- No modificar `package.json` o `package-lock.json` sin autorización
- No eliminar funcionalidad existente sin reemplazo validado

---

## Verification Strategy

### Test Decision
- **Infrastructure exists**: YES (Vitest + Biome + Playwright)
- **Automated tests**: Tests-after for implementation slices
- **Framework**: Vitest 4.1.8 + Biome 2.4.11
- **Gates**: typecheck → lint → test → build → contracts:check → quality:strict → verify

### QA Policy
Every plan slice MUST include agent-executable verification scenarios. Evidence path: `.sisyphus/evidence/spec-008-task-{N}-{scenario}.{ext}`.

- **Docs**: Verify file exists and contains required sections
- **Code**: Verify typecheck + lint + test + build pass
- **Architecture**: Verify no duplicates, no contract violations
- **RBAC**: Verify roles are imported from `@cermont/domain`, not hardcoded
- **Offline**: Verify PWA flow map matches implementation

---

## Execution Strategy

### Parallel Execution Waves

```
Wave 1 (Foundation — Phase 1-2: Maps + Research):
├── T1: Crear baseline.md con resultados de gates
├── T2: Crear context7-research.md (Next.js 16 + Vercel ref)
├── T3: Crear vercel-reference-audit.md
├── T4: Crear FRONTEND_BACKEND_MATRIX.md
├── T5: Crear DOMAIN_MODULE_MAP.md
├── T6: Crear PWA_OFFLINE_FLOW_MAP.md
├── T7: Verificar existencias de specs 001-007 y LTG
└── T8: Corregir quality:strict (ajustar baseline weak tokens)

Wave 2 (Product Audit — Phase 2-3):
├── T9: Crear CERMONT_MULTISERVICE_PRODUCT_AUDIT.md (26 módulos)
├── T10: Crear CERMONT_INNOVATION_ROADMAP.md (10 ideas)
├── T11: Auditoría profunda RBAC (gaps administrativo + cliente)
├── T12: Auditoría FileAsset + MediaAsset (evitar duplicación)
├── T13: Auditoría PWA/offline real vs documentado
├── T14: Auditoría módulos de negocio (14-step flow)
└── T15: Auditoría legal/privacy gap analysis

Wave 3 (Roadmap — Phase 4):
├── T16: Crear implementation-roadmap.md con matriz impacto/riesgo/esfuerzo
├── T17: Priorizar P0 (estabilización) con criterios
├── T18: Priorizar P1 (producto profesional)
├── T19: Priorizar P2 (innovación)
├── T20: Priorizar P3 (comercialización)
└── T21: Definir dependencias entre slices

Wave 4 (Slices — Phase 5-6):
├── T22: Crear slice-01 (stabilization + gates)
├── T23: Crear slice-02 (FileAsset unification)
├── T24: Crear slice-03 (fleet professionalization)
├── T25: Crear slice-04 (tools/assets professionalization)
├── T26: Crear slice-05 (evidence FSM)
├── T27: Crear slice-06 (checklists blocking engine)
├── T28: Crear slice-07 (dashboard operating system)
├── T29: Crear slice-08 (cost intelligence)
├── T30: Crear slice-09 (automation rules engine)
├── T31: Crear slice-10 (digital twin order)
├── T32: Crear slice-11 (ai copilot safe MVP)
└── T33: Crear slice-12 (saas multitenancy foundation)

Wave FINAL (Validation — Phase 7):
├── T34: Ejecutar gates post-auditoría
├── T35: Crear final-plan-report.md
├── T36: Crear CERMONT_NEXT_DEVELOPMENT_PLAN.md (documento ejecutivo)
├── T37: Validación de consistencia general
└── T38: Presentar resultados al usuario

Critical Path: T1 → T4 → T9 → T16 → T22 → T34 → T38
```

---

## TODOs

- [ ] 1. **Crear baseline.md con resultados de gates**

  **What to do**:
  - Copiar los resultados de gates ya ejecutados al archivo `specs/008-auditoria-investigacion-mejora-continua-cermont/baseline.md`
  - Incluir tabla con todos los gates (typecheck, lint, test, build, contracts, quality, verify, react-doctor)
  - Incluir métricas: 1013 tests, 170 test files, 2861 weak tokens, 89 frontend routes
  - Incluir estado de documentos existentes vs faltantes
  - Incluir React Doctor score 77/100 con detalle de 21 issues

  **Must NOT do**:
  - No inventar métricas — usar solo las verificadas

  **Parallelization**: Can Run In Parallel: YES | Wave 1 (with T2, T3) | Blocks: T4, T9
  **Blocked By**: Gate execution (already done in Phase 0)

  **References**:
  - Output de gates de este mismo análisis (líneas 17:20 en la conversación)
  - `docs/architecture/CODEBASE_MAP.md` — estructura de módulos
  - `docs/architecture/FRONTEND_ROUTE_MAP.md` — 86 rutas documentadas
  - `docs/architecture/API_ENDPOINT_MATRIX.md` — 375+ endpoints
  - `docs/architecture/RBAC_PERMISSION_MAP.md` — 8 roles, 20+ módulos

  **Acceptance Criteria**:
  - [ ] File exists: `specs/008-auditoria-investigacion-mejora-continua-cermont/baseline.md`
  - [ ] All gate results documented with PASS/FAIL
  - [ ] Weak token breakdown by file and category
  - [ ] Architecture maps status table
  - [ ] Document status (existing vs missing)

  **QA Scenarios**:
  ```
  Scenario: Verify baseline content
    Tool: Bash
    Preconditions: baseline.md exists
    Steps:
      1. Read baseline.md
      2. Verify it contains gate results table with row for quality:strict showing FAIL
      3. Verify weak token counts (2861, 67/65, 1449/1440, etc.)
      4. Verify architecture maps status
    Expected Result: All sections present and accurate
    Evidence: .sisyphus/evidence/spec-008-task-1-baseline.txt
  ```

  **Commit**: YES
  - Message: `docs(spec-008): create baseline.md with gate results`
  - Files: `specs/008-auditoria-investigacion-mejora-continua-cermont/baseline.md`

- [ ] 2. **Crear context7-research.md (Next.js 16 + Vercel reference)**

  **What to do**:
  - Crear `specs/008-auditoria-investigacion-mejora-continua-cermont/context7-research.md`
  - Tabla: Tema | Recomendación Context7 | Aplicación CERMONT | Acción
  - Temas: App Router, metadata/icons/manifest, route handlers, middleware/proxy, image optimization, caching, error boundaries, loading/error/not-found, instrumentation, performance, PWA/manifest, production readiness
  - Investigación ya realizada via web search (Next.js 16.2.9) — consolidar hallazgos
  - Incluir: `params`/`searchParams` as Promises, `generateMetadata()`, `error.tsx`/`not-found.tsx`, `proxy.ts` vs `middleware.ts`

  **Must NOT do**:
  - No cambiar código basado en hallazgos — solo registrar

  **Parallelization**: Can Run In Parallel: YES | Wave 1 (with T1, T3)
  **Blocked By**: None

  **References**:
  - Web search results for Next.js 16 App Router
  - GitHub: `vercel/next.js/blob/v16.2.3/docs/01-app/`
  - Actual `frontend/proxy.ts` — security perimeter
  - Actual `frontend/next.config.ts` — rewrites, headers

  **Acceptance Criteria**:
  - [ ] File exists with table format
  - [ ] At least 12 topics covered
  - [ ] Each topic has recommendation + application + action
  - [ ] No code changes proposed — only research

  **QA Scenarios**:
  ```
  Scenario: Verify context7-research
    Tool: Bash
    Preconditions: context7-research.md exists
    Steps:
      1. Read file
      2. Count topic rows (minimum 12)
      3. Verify each row has 4 columns filled
    Expected Result: 12+ topics with recommendation/application/action
    Evidence: .sisyphus/evidence/spec-008-task-2-context7.txt
  ```

  **Commit**: YES (group with T1)
  - Message: `docs(spec-008): add context7-research and vercel-reference`
  - Files: `specs/008-auditoria-investigacion-mejora-continua-cermont/context7-research.md`

- [ ] 3. **Crear vercel-reference-audit.md**

  **What to do**:
  - Crear `specs/008-auditoria-investigacion-mejora-continua-cermont/vercel-reference-audit.md`
  - Tabla: Tema Vercel | Buena práctica | Equivalente VPS CERMONT | Acción (con tag)
  - Categorías: REFERENCE_ONLY, OPTIONAL_PREVIEW_QA, BLOCKED_BY_VPS_ONLY_RULE, APPROVED_BY_USER
  - Temas: builds productivos, env vars, preview deployments, logs, rollback, observabilidad, production readiness, source maps, CI/CD comparison

  **Must NOT do**:
  - No proponer reemplazar VPS por Vercel
  - Todo debe tener tag de categoría

  **Parallelization**: Can Run In Parallel: YES | Wave 1
  **Blocked By**: None

  **Acceptance Criteria**:
  - [ ] File exists with table format
  - [ ] All items tagged with one of 4 categories
  - [ ] No APPROVED_BY_USER without explicit context

  **Commit**: YES (group with T1, T2)

- [ ] 4. **Crear FRONTEND_BACKEND_MATRIX.md**

  **What to do**:
  - Crear `docs/architecture/FRONTEND_BACKEND_MATRIX.md`
  - Mapear cada pantalla frontend con su hook/service, endpoint llamado, ruta backend real, schema Zod, RBAC y estado
  - Detectar: endpoints sin consumidor, consumidores sin endpoint, rutas 400/401/500, schemas duplicados, direct fetch, lógica de negocio en UI, query keys inestables, forms sin default values
  - Usar CODEBASE_MAP.md, FRONTEND_ROUTE_MAP.md y API_ENDPOINT_MATRIX.md como fuentes

  **Must NOT do**:
  - No inventar rutas — verificar con código real

  **Parallelization**: Can Run In Parallel: NO | Wave 1 foundation
  **Blocked By**: T1 (baseline), T2 (context7)

  **References**:
  - `docs/architecture/CODEBASE_MAP.md`
  - `docs/architecture/FRONTEND_ROUTE_MAP.md`
  - `docs/architecture/API_ENDPOINT_MATRIX.md`
  - `frontend/src/modules/*/api/` — API client files
  - `frontend/src/modules/*/hooks/queries.ts` — TanStack Query hooks
  - `backend/src/modules/*/*.routes.ts` — Route definitions

  **Acceptance Criteria**:
  - [ ] File exists with matrix for 40+ frontend pages
  - [ ] Each row has: Pantalla, Hook/Service, Endpoint, Ruta Backend, Schema, RBAC, Estado, Acción
  - [ ] Detected gaps documented as rows

  **QA Scenarios**:
  ```
  Scenario: Verify FRONTEND_BACKEND_MATRIX
    Tool: Bash
    Preconditions: Matrix file exists
    Steps:
      1. Read file
      2. Verify at least 40 page rows
      3. Verify each row has all 8 columns
      4. Check no duplicate schemas or roles
    Expected Result: Complete matrix with detected gaps
    Evidence: .sisyphus/evidence/spec-008-task-4-matrix.txt
  ```

  **Commit**: YES
  - Message: `docs(spec-008): add FRONTEND_BACKEND_MATRIX`
  - Files: `docs/architecture/FRONTEND_BACKEND_MATRIX.md`

- [ ] 5. **Crear DOMAIN_MODULE_MAP.md**

  **What to do**:
  - Crear `docs/architecture/DOMAIN_MODULE_MAP.md`
  - Mapear cada módulo de negocio con su dominio, backend module, frontend module, shared-types contract, estados, offline support, audit events
  - Usar CODEBASE_MAP.md y business flow map como referencia

  **Must NOT do**:
  - No incluir módulos que no existen en el código

  **Parallelization**: Can Run In Parallel: YES | Wave 1 (with T6)
  **Blocked By**: T4 (parcial)

  **References**:
  - `docs/architecture/CODEBASE_MAP.md`
  - `docs/product/CERMONT_PRODUCT_BLUEPRINT.md`
  - `docs/domain/CERMONT_BUSINESS_FLOW_MAP.md`
  - `backend/src/modules/*` — 57 modules

  **Acceptance Criteria**:
  - [ ] File exists with domain mapping
  - [ ] Covers 40+ modules with domain/backend/frontend/contract/status/offline/audit

  **Commit**: YES (group with T4)

- [ ] 6. **Crear PWA_OFFLINE_FLOW_MAP.md**

  **What to do**:
  - Crear `docs/architecture/PWA_OFFLINE_FLOW_MAP.md`
  - Documentar: service worker registration, IndexedDB queue, sync endpoint, offline states, conflict resolution, DLQ, límites conocidos
  - Formato similar a MEDIA_EVIDENCE_FLOW_MAP.md
  - Verificar contra: `frontend/public/service-worker.js`, `frontend/src/lib/pwa/offline-queue.ts`, `frontend/src/lib/offline/`, `backend/src/modules/sync/`

  **Must NOT do**:
  - No documentar funcionalidad que no está implementada

  **Parallelization**: Can Run In Parallel: YES | Wave 1
  **Blocked By**: None (es investigación/documentación)

  **References**:
  - `frontend/public/service-worker.js` — SW registration
  - `frontend/src/lib/pwa/offline-queue.ts` — IndexedDB queue
  - `frontend/src/lib/offline/` — Offline helpers
  - `frontend/src/store/queueStore.ts` — Queue UI state
  - `backend/src/modules/sync/` — Sync endpoint
  - `docs/offline-scope.md` — Offline scope doc
  - `docs/offline-online-module.md` — Offline architecture
  - `docs/offline-test-plan.md` — Test plan
  - `docs/offline-known-limitations.md` — Known limitations

  **Acceptance Criteria**:
  - [ ] File exists with flow diagrams
  - [ ] Covers: registration, queue, sync, DLQ, conflict resolution
  - [ ] Aligned with existing implementation

  **Commit**: YES (group with T4, T5)

- [ ] 7. **Verificar existencias de specs 001-007 y LTG**

  **What to do**:
  - Buscar en repositorio: `specs/001-*` a `specs/007-*`
  - Buscar `LTG_JUAN_DIEGO_AREVALO-3_markdown.md`
  - Buscar `.specify/memory/constitution.md`
  - Documentar qué existe y qué no
  - Si no existen, registrarlo como hallazgo

  **Must NOT do**:
  - No inventar contenido de specs faltantes

  **Parallelization**: Can Run In Parallel: YES | Wave 1
  **Blocked By**: None

  **Acceptance Criteria**:
  - [ ] Report of which specs exist/missing
  - [ ] LTG file found or registered missing
  - [ ] Constitution file found or registered missing

  **Commit**: YES (group with T4, T5, T6)

- [ ] 8. **Corregir quality:strict baseline**

  **What to do**:
  - Actualizar baseline de weak tokens en `tooling/quality/` para que quality:strict pase
  - Análisis: los 2861 hallazgos incluyen 9 más de null, 9 más de undefined, 2 más de unknown, 2 más de any
  - Opción A: Ajustar baseline (más rápido para desbloquear)
  - Opción B: Refactorizar weak tokens (más correcto pero más lento)
  - Recomendación: Opción A para baseline + crear tarea P1 para Opción B
  - Verificar que `npm run quality:strict` pase después del ajuste

  **Must NOT do**:
  - No eliminar código existente para reducir tokens
  - No cambiar lógica de negocio

  **Parallelization**: Can Run In Parallel: YES | Wave 1 (but blocks verify gate)
  **Blocked By**: None (baseline adjustment is mechanical)

  **References**:
  - `tooling/quality/check-weak-tokens.ts` — Baseline checker
  - Full output of quality:strict from Phase 0

  **Acceptance Criteria**:
  - [ ] `npm run quality:strict` → PASS
  - [ ] `npm run verify` → PASS
  - [ ] Baseline actualizado con nuevos valores

  **QA Scenarios**:
  ```
  Scenario: Verify quality:strict passes
    Tool: Bash
    Preconditions: Baseline updated
    Steps:
      1. npm run quality:strict
      2. Check exit code (0 = PASS)
    Expected Result: 0, all sub-checks pass
    Evidence: .sisyphus/evidence/spec-008-task-8-quality.txt
  ```

  **Commit**: YES
  - Message: `fix(quality): update weak token baseline for spec-008 findings`
  - Files: `tooling/quality/check-weak-tokens.ts`

- [ ] 9. **Crear CERMONT_MULTISERVICE_PRODUCT_AUDIT.md**

  **What to do**:
  - Crear `docs/product/CERMONT_MULTISERVICE_PRODUCT_AUDIT.md`
  - Evaluar 26 módulos mínimos con tabla: Módulo | Estado actual | Nivel 0-5 | Falla que resuelve | Brecha profesional | Acción P0/P1/P2
  - Módulos: work-requests, site-visits, proposals, purchase-orders, service-cases/work-orders, planning-packets, execution-sessions, evidences, file-assets/documents, fleet/vehicles, tools/assets/resources, checklists, costs, reports, delivery-records, SES, invoices, payments, dashboard, notifications, users/RBAC, offline-sync, audit-logs, settings, legal/privacy, deploy/observability
  - Basado en análisis de código real y docs existentes

  **Must NOT do**:
  - No inventar niveles — justificar cada uno con evidencia

  **Parallelization**: Can Run In Parallel: YES | Wave 2 (with T10, T11)
  **Blocked By**: T1 (baseline), T4 (matrix), T5 (domain map)

  **References**:
  - `docs/product/CERMONT_PRODUCT_BLUEPRINT.md`
  - `docs/architecture/CODEBASE_MAP.md`
  - `docs/architecture/FRONTEND_ROUTE_MAP.md`
  - `docs/architecture/API_ENDPOINT_MATRIX.md`
  - `docs/DEVELOPMENT_STATUS.md`
  - `docs/KNOWN_ISSUES.md`

  **Acceptance Criteria**:
  - [ ] 26 modules evaluated with level 0-5
  - [ ] Each module has: status, level, problem solved, gap, action
  - [ ] Levels justified with evidence

  **QA Scenarios**:
  ```
  Scenario: Verify product audit
    Tool: Bash
    Preconditions: Audit file exists
    Steps:
      1. Count modules (minimum 26)
      2. Verify each has 6 columns filled
      3. Check consistency with DEVELOPMENT_STATUS.md
    Expected Result: Complete audit with verifiable levels
    Evidence: .sisyphus/evidence/spec-008-task-9-audit.txt
  ```

  **Commit**: YES
  - Message: `docs(spec-008): add multiservice product audit`
  - Files: `docs/product/CERMONT_MULTISERVICE_PRODUCT_AUDIT.md`

- [ ] 10. **Crear CERMONT_INNOVATION_ROADMAP.md**

  **What to do**:
  - Crear `specs/008-auditoria-investigacion-mejora-continua-cermont/innovation-roadmap.md` y `docs/product/CERMONT_INNOVATION_ROADMAP.md`
  - Evaluar 10 ideas con: Idea | Problema | Módulos afectados | MVP | Datos necesarios | Riesgo | Impacto | Prioridad
  - Ideas obligatorias:
    1. CERMONT Operating System (vista central orden con timeline)
    2. Digital Twin por orden
    3. Motor unificado FileAsset
    4. Motor de automatizaciones
    5. Copiloto operativo IA
    6. Planeación inteligente
    7. QR/NFC para activos
    8. Constructor de formularios dinámicos
    9. Portal cliente/proveedor
    10. SaaS multiempresa

  **Must NOT do**:
  - No prometer innovación sin MVP, test o plan verificable
  - Todo resultado IA debe ser borrador

  **Parallelization**: Can Run In Parallel: YES | Wave 2
  **Blocked By**: T9 (product audit)

  **References**:
  - `docs/product/CERMONT_PRODUCT_BLUEPRINT.md`
  - `docs/architecture/CODEBASE_MAP.md`
  - `docs/architecture/MEDIA_EVIDENCE_FLOW_MAP.md`
  - `backend/src/modules/ai/` — existing AI module

  **Acceptance Criteria**:
  - [ ] 10 ideas evaluated with full criteria
  - [ ] Each has MVP definition
  - [ ] Risk + Impact + Priority assigned

  **Commit**: YES (group with T9)
  - Message: `docs(spec-008): add innovation roadmap`
  - Files: `specs/008-auditoria-investigacion-mejora-continua-cermont/innovation-roadmap.md`, `docs/product/CERMONT_INNOVATION_ROADMAP.md`

- [ ] 11. **Auditoría profunda RBAC**

  **What to do**:
  - Verificar que RBAC_PERMISSION_MAP.md refleje la realidad del código
  - Buscar roles hardcodeados en frontend y backend
  - Verificar que `administrativo` tenga acceso correcto a costos/dashboard
  - Verificar que `cliente` tenga acceso correcto al portal
  - Usar `rg` para buscar `["gerente"`, `["residente"`, arrays de roles en componentes
  - Detectar discrepancias entre RBAC_PERMISSION_MAP.md y código real

  **Must NOT do**:
  - No cambiar código — solo auditar y reportar

  **Parallelization**: Can Run In Parallel: YES | Wave 2
  **Blocked By**: T1 (baseline)

  **References**:
  - `docs/architecture/RBAC_PERMISSION_MAP.md`
  - `packages/domain/src/` — role definitions
  - `backend/src/middlewares/authorize.ts` — authorization middleware
  - `frontend/proxy.ts` — RBAC perimeter

  **Acceptance Criteria**:
  - [ ] RBAC audit report appended to product audit or as separate section
  - [ ] Hardcoded role arrays detected (if any)
  - [ ] administrativo and cliente access verified

  **Commit**: YES (group with T9, T10)

- [ ] 12. **Auditoría FileAsset + MediaAsset (evitar duplicación)**

  **What to do**:
  - Verificar que no exista `MediaAsset` como módulo duplicado
  - Confirmar que FileAsset es el SSOT para almacenamiento de archivos
  - Verificar entityTypes: evidence, vehicle, tool, work_order, execution_session, asset, document
  - Verificar que fleet y tool modules usen FileAsset (no almacenamiento propio)
  - Identificar gaps: parent adapters faltantes en files.service.ts

  **Must NOT do**:
  - No crear un módulo MediaAsset nuevo

  **Parallelization**: Can Run In Parallel: YES | Wave 2
  **Blocked By**: None (puede ejecutarse en paralelo con otras auditorías)

  **References**:
  - `docs/architecture/MEDIA_EVIDENCE_FLOW_MAP.md`
  - `backend/src/models/FileAsset.ts`
  - `backend/src/modules/files/files.service.ts`
  - `backend/src/modules/fleet/fleet.service.ts`
  - `backend/src/modules/tool/tool.service.ts`
  - `backend/src/modules/evidence/evidence.service.ts`

  **Acceptance Criteria**:
  - [ ] No MediaAsset module found (or reported as finding)
  - [ ] FileAsset entityTypes aligned
  - [ ] Fleet and tool using FileAsset

  **Commit**: YES (group with T9-T11)

- [ ] 13. **Auditoría PWA/offline real vs documentado**

  **What to do**:
  - Comparar PWA_OFFLINE_FLOW_MAP.md (una vez creado) con implementación real
  - Verificar: service worker (Serwist), IndexedDB queue, sync endpoint, offline states en UI
  - Verificar offline-known-limitations.md vs realidad
  - Probar: offline queue storing, sync on reconnect, DLQ behavior
  - Documentar discrepancias

  **Must NOT do**:
  - No modificar lógica offline — solo auditar

  **Parallelization**: Can Run In Parallel: YES | Wave 2
  **Blocked By**: T6 (PWA_OFFLINE_FLOW_MAP)

  **References**:
  - T6 output (PWA_OFFLINE_FLOW_MAP.md)
  - `frontend/public/service-worker.js`
  - `frontend/src/lib/pwa/offline-queue.ts`
  - `frontend/src/lib/offline/`
  - `backend/src/modules/sync/sync.service.ts`
  - `docs/offline-*.md`

  **Acceptance Criteria**:
  - [ ] Discrepancies documented
  - [ ] Each offline capability verified against implementation

  **Commit**: YES (group with T9-T12)

- [ ] 14. **Auditoría módulos de negocio (14-step flow)**

  **What to do**:
  - Verificar cobertura del flujo completo de 14 pasos
  - WorkRequest → SiteVisit → Proposal → PO → Order → PlanningPacket → Execution → Evidences → Report → DeliveryRecord → SES → Invoice → Payment → Closure
  - Para cada paso: endpoint existe, UI existe, RBAC funciona, offline soportado, auditado
  - Detectar: estados faltantes, transiciones no validadas
  - Verificar integridad: ServiceCase cockpit de 14 pasos

  **Must NOT do**:
  - No proponer cambios sin evidencia

  **Parallelization**: Can Run In Parallel: YES | Wave 2
  **Blocked By**: T4, T5

  **References**:
  - `docs/product/CERMONT_PRODUCT_BLUEPRINT.md` — flow description
  - `docs/domain/CERMONT_BUSINESS_FLOW_MAP.md`
  - `docs/architecture/FRONTEND_ROUTE_MAP.md`
  - `docs/architecture/API_ENDPOINT_MATRIX.md`
  - `backend/src/modules/service-cases/`

  **Acceptance Criteria**:
  - [ ] 14 steps evaluated
  - [ ] Each step: endpoint, UI, RBAC, offline, audit status
  - [ ] Missing transitions documented

  **Commit**: YES (group with T9-T13)

- [ ] 15. **Auditoría legal/privacy gap analysis**

  **What to do**:
  - Verificar estado actual de: consentimientos (fotos/GPS/documentos), política de tratamiento, derechos del titular (privacy-requests)
  - Verificar existencia de: /privacy, /terms, /consent routes
  - Verificar: AUTHORS.md, NOTICE.md, COPYRIGHT.md
  - Documentar riesgos legales abiertos

  **Must NOT do**:
  - No dar consejo legal — solo auditar cumplimiento técnico

  **Parallelization**: Can Run In Parallel: YES | Wave 2
  **Blocked By**: None

  **References**:
  - `docs/KNOWN_ISSUES.md` — legal risks section
  - `docs/legal/` — legal documents
  - `backend/src/modules/privacy-requests/`
  - `frontend/src/app/privacy/`
  - `AUTHORS.md`, `NOTICE.md`, `COPYRIGHT.md`

  **Acceptance Criteria**:
  - [ ] Legal gaps documented
  - [ ] Consent/Privacy/Retention evaluated
  - [ ] Risks prioritized (P0/P1/P2)

  **Commit**: YES (group with T9-T14)

- [ ] 16. **Crear implementation-roadmap.md con matriz impacto/riesgo/esfuerzo**

  **What to do**:
  - Crear `specs/008-auditoria-investigacion-mejora-continua-cermont/implementation-roadmap.md`
  - Tabla priorización: Slice | Impacto | Riesgo | Esfuerzo | Dependencias | Valor comercial | Prioridad
  - Definir orden de ejecución recomendado
  - Basado en hallazgos de T9 (product audit) y T10 (innovation)
  - Priorizar SIN deuda técnica nueva

  **Must NOT do**:
  - No priorizar sobre supuestos no verificados

  **Parallelization**: Can Run In Parallel: NO | Wave 3 (foundation for all slices)
  **Blocked By**: T9, T10, T11, T12, T13, T14, T15

  **References**:
  - T9-T15 outputs
  - `docs/TECHNICAL_DEBT.md`
  - `docs/KNOWN_ISSUES.md`

  **Acceptance Criteria**:
  - [ ] All 12 slices evaluated with full matrix
  - [ ] Clear priority assignment (P0/P1/P2/P3)
  - [ ] Dependencies mapped

  **Commit**: YES
  - Message: `docs(spec-008): create implementation roadmap`
  - Files: `specs/008-auditoria-investigacion-mejora-continua-cermont/implementation-roadmap.md`

- [ ] 17. **Priorizar P0 (estabilización)**

  **What to do**:
  - Definir exactamente qué incluye P0:
    1. Gates en verde (quality:strict baseline ajustado)
    2. Errores post-deploy (PayloadTooLargeError fix)
    3. FileAsset SSOT (entityTypes alineados, parent adapters)
    4. Auth/session (WebAuthn refinamiento)
    5. Assets/PWA (offline flow completo)
    6. 400/401/500 errors (error handling consistente)
    7. Smoke tests (endpoints críticos)
  - Estimar esfuerzo por sub-item
  - Definir dependencias P0 → P1

  **Must NOT do**:
  - No incluir features nuevas en P0

  **Parallelization**: Can Run In Parallel: YES | Wave 3 (with T18, T19, T20)
  **Blocked By**: T16

  **Acceptance Criteria**:
  - [ ] P0 scope defined with sub-items
  - [ ] Estimated effort per sub-item
  - [ ] Clear exit criteria for P0

  **Commit**: YES (group with T16)

- [ ] 18. **Priorizar P1 (producto profesional)**

  **What to do**:
  - Definir exactamente qué incluye P1:
    1. FileAsset completo (parent adapters, owner resolution)
    2. Vehículos profesionales (check-in/check-out, historial asignación)
    3. Herramientas profesionales (calibraciones, certificaciones)
    4. Evidencias FSM (categorías, fase workflow)
    5. Checklists bloqueantes (items obligatorios con foto/firma)
    6. Dashboard accionable (KPIs, filtros, exportación)
    7. Costos ERP (catalogo completo, comparación real vs propuesta)

  **Must NOT do**:
  - No incluir innovación en P1

  **Parallelization**: Can Run In Parallel: YES | Wave 3
  **Blocked By**: T16

  **Acceptance Criteria**:
  - [ ] P1 scope defined
  - [ ] Dependencies on P0 mapped

  **Commit**: YES (group with T16, T17)

- [ ] 19. **Priorizar P2 (innovación)**

  **What to do**:
  - Definir P2 scope:
    1. Digital Twin por orden
    2. Automatizaciones (reglas SI-ENTONCES)
    3. Planeación inteligente (técnicos, herramientas, ruta)
    4. QR/NFC para activos
    5. Formularios dinámicos (builder)
    6. Copiloto IA (resumen orden, detectar faltantes)

  **Must NOT do**:
  - No iniciar P2 antes de P1 completo

  **Parallelization**: Can Run In Parallel: YES | Wave 3
  **Blocked By**: T16

  **Acceptance Criteria**:
  - [ ] P2 scope defined
  - [ ] Each innovation has MVP definition
  - [ ] Risk assessment for each

  **Commit**: YES (group with T16-T18)

- [ ] 20. **Priorizar P3 (comercialización)**

  **What to do**:
  - Definir P3 scope:
    1. Multiempresa (tenant model, aislamiento datos)
    2. Feature flags (por tenant)
    3. Portal cliente extendido (órdenes, propuestas, facturas)
    4. Marketplace de plantillas
    5. Observabilidad avanzada (APM, tracing distribuido)
    6. Billing SaaS (planes, medición uso)

  **Must NOT do**:
  - No planificar P3 sin P2 estable

  **Parallelization**: Can Run In Parallel: YES | Wave 3
  **Blocked By**: T16

  **Acceptance Criteria**:
  - [ ] P3 scope defined
  - [ ] Business value estimation

  **Commit**: YES (group with T16-T19)

- [ ] 21. **Definir dependencias entre slices**

  **What to do**:
  - Mapa de dependencias entre los 12 slices
  - ¿Qué slice necesita qué otro slice completado?
  - ¿Cuáles pueden ejecutarse en paralelo?
  - Crear graph de dependencias ascii

  **Must NOT do**:
  - No asumir independencia donde hay dependencia real

  **Parallelization**: Can Run In Parallel: YES | Wave 3
  **Blocked By**: T16-T20

  **Acceptance Criteria**:
  - [ ] Dependency graph for all 12 slices
  - [ ] Parallel execution groups identified

  **Commit**: YES (group with T16-T20)

- [ ] 22. **Crear slice-01 (stabilization + gates)**

  **What to do**:
  - Crear `specs/008-auditoria-investigacion-mejora-continua-cermont/slices/slice-01-stabilization-and-gates.md`
  - Objetivo: quality:strict verde, gates pasando, errores post-deploy corregidos
  - Archivos afectados: tooling/quality/check-weak-tokens.ts, backend/uploads, nginx config
  - Contratos Zod: verificar existentes, no crear nuevos
  - Backend: fix PayloadTooLargeError, rate limiting
  - Frontend: fix ProfileForm base64
  - RBAC: sin cambios
  - PWA/offline: sin cambios
  - Auditoría: verificar eventos críticos
  - Tests: smoke tests para endpoints críticos
  - Riesgos: ajuste baseline puede ocultar deuda real
  - Criterios de aceptación: `npm run verify` → PASS

  **Must NOT do**:
  - No introducir cambios arquitectónicos

  **Parallelization**: Can Run In Parallel: NO | Wave 4 (P0 priority)
  **Blocked By**: T8 (quality baseline)

  **References**:
  - `docs/KNOWN_ISSUES.md`
  - `docs/TECHNICAL_DEBT.md`
  - Phase 0 gate results

  **Acceptance Criteria**:
  - [ ] verify PASS
  - [ ] quality:strict PASS
  - [ ] PayloadTooLargeError fixed
  - [ ] Smoke tests for critical endpoints

  **Commit**: YES
  - Message: `docs(spec-008): create slice-01 stabilization`
  - Files: `specs/008-auditoria-investigacion-mejora-continua-cermont/slices/slice-01-stabilization-and-gates.md`

- [ ] 23. **Crear slice-02 (FileAsset unification)**

  **What to do**:
  - Crear slice-02-fileasset-unification.md
  - Unificar entityTypes en FileAsset
  - Agregar parent adapters faltantes en files.service.ts
  - Alinear owner resolution (tool → Resource vs Tool)
  - Migrar fleet photos a FileAsset si no están migradas
  - Verificar que no hay `Med`iaAsset` o `/api/media`

  **Parallelization**: Can Run In Parallel: NO | Wave 4 (P0-P1 boundary)
  **Blocked By**: T12 (FileAsset audit)

  **Acceptance Criteria**:
  - [ ] FileAsset entityTypes aligned
  - [ ] Parent adapters for all entityTypes
  - [ ] No duplicate media module

  **Commit**: YES (group with T22)

- [ ] 24. **Crear slice-03 (fleet professionalization)**

  **What to do**:
  - Crear slice-03-fleet-professionalization.md
  - Check-in/check-out persistente para vehículos
  - Historial de asignación
  - Certificaciones/vencimientos (SOAT, tecnomecánica)
  - Reglas de bloqueo configurables
  - Fotos vía FileAsset

  **Parallelization**: Can Run In Parallel: YES | Wave 4 (P1)
  **Blocked By**: T22, T23

  **Commit**: YES

- [ ] 25. **Crear slice-04 (tools/assets professionalization)**

  **What to do**:
  - Crear slice-04-tools-assets-professionalization.md
  - Calibraciones como flujo formal
  - Certificaciones con vencimientos
  - Historial de asignación
  - Check-in/check-out
  - Fotos vía FileAsset
  - Availability/readiness summaries mejorados

  **Parallelization**: Can Run In Parallel: YES | Wave 4 (P1, parallel with T24)
  **Blocked By**: T22, T23

  **Commit**: YES

- [ ] 26. **Crear slice-05 (evidence FSM)**

  **What to do**:
  - Crear slice-05-evidence-fsm.md
  - Workflow de evidencias: captured → uploaded → verified → rejected
  - Evidencias requeridas por fase (before/during/after)
  - Rechazo con motivo y reemplazo
  - Categorías tipadas
  - Relación con checklist items

  **Parallelization**: Can Run In Parallel: YES | Wave 4 (P1)
  **Blocked By**: T22, T23

  **Commit**: YES

- [ ] 27. **Crear slice-06 (checklists blocking engine)**

  **What to do**:
  - Crear slice-06-checklists-blocking-engine.md
  - Items obligatorios con bloqueo
  - Items con foto requerida
  - Items con firma requerida
  - Versionado de checklists
  - Reglas: SI checklist crítico falla → bloquear cierre

  **Parallelization**: Can Run In Parallel: YES | Wave 4 (P1)
  **Blocked By**: T22

  **Commit**: YES

- [ ] 28. **Crear slice-07 (dashboard operating system)**

  **What to do**:
  - Crear slice-07-dashboard-operating-system.md
  - Vista central por orden con timeline
  - Bloques de workflow
  - Siguiente acción
  - Documentos faltantes
  - Evidencias faltantes
  - Responsable
  - Costo vs presupuesto
  - Margen
  - Estado administrativo
  - Riesgo de cierre

  **Parallelization**: Can Run In Parallel: YES | Wave 4 (P1)
  **Blocked By**: T22

  **Commit**: YES

- [ ] 29. **Crear slice-08 (cost intelligence)**

  **What to do**:
  - Crear slice-08-cost-intelligence.md
  - Catálogo de costos completo
  - Comparación real vs propuesta
  - Alertas de desviación (>80% estimado)
  - Cost Cart mejorado
  - Dashboard de costos por orden y global
  - Exportación a Excel/PDF

  **Parallelization**: Can Run In Parallel: YES | Wave 4 (P1)
  **Blocked By**: T22

  **Commit**: YES

- [ ] 30. **Crear slice-09 (automation rules engine)**

  **What to do**:
  - Crear slice-09-automation-rules-engine.md
  - Reglas SI-ENTONCES configurables
  - Eventos: evidencia rechazada, SOAT vence, costo >80%, checklist crítico falla, SES aprobada
  - Acciones: notificar, devolver a ejecución, bloquear cierre, crear tarea factura
  - UI para crear/editar reglas
  - Auditoría de ejecución de reglas

  **Parallelization**: Can Run In Parallel: YES | Wave 4 (P2)
  **Blocked By**: T26 (checklists), T28 (dashboard)

  **References**:
  - Slices 05 (evidence FSM), 06 (checklists), 07 (dashboard)
  - `backend/src/modules/notifications/`

  **Acceptance Criteria**:
  - [ ] Rule engine design with events/actions
  - [ ] UI mockup for rule creation
  - [ ] Audit trail design

  **Commit**: YES
  - Message: `docs(spec-008): create slice-09 automation rules`
  - Files: `specs/008-auditoria-investigacion-mejora-continua-cermont/slices/slice-09-automation-rules-engine.md`

- [ ] 31. **Crear slice-10 (digital twin order)**

  **What to do**:
  - Crear slice-10-digital-twin-order.md
  - Gemelo digital por orden con eventos en timeline
  - Archivos, fotos, decisiones, aprobaciones
  - Costos reales vs estimados
  - Auditoría e historial
  - Timeline visual interactivo

  **Parallelization**: Can Run In Parallel: YES | Wave 4 (P2)
  **Blocked By**: T28 (dashboard), T29 (costs)

  **References**:
  - Slice 07 (dashboard OS), Slice 08 (cost intelligence)
  - `docs/product/CERMONT_PRODUCT_BLUEPRINT.md`

  **Acceptance Criteria**:
  - [ ] Digital Twin design with timeline
  - [ ] Data model for events
  - [ ] UI mockup

  **Commit**: YES (group with T30)

- [ ] 32. **Crear slice-11 (ai copilot safe MVP)**

  **What to do**:
  - Crear slice-11-ai-copilot-safe-mvp.md
  - MVP: resumir orden, detectar faltantes, generar borrador de informe
  - Restricciones: todo resultado IA es borrador, no enviar datos sensibles sin consentimiento
  - Registro de auditoría para cada llamada IA
  - Basado en módulo `ai` existente en backend

  **Parallelization**: Can Run In Parallel: YES | Wave 4 (P2)
  **Blocked By**: T28 (dashboard)

  **References**:
  - `backend/src/modules/ai/ai.service.ts` — existing AI module
  - `docs/product/CERMONT_PRODUCT_BLUEPRINT.md`
  - Slice 07 (dashboard OS)

  **Acceptance Criteria**:
  - [ ] AI copilot MVP scope defined
  - [ ] Safety constraints documented
  - [ ] Audit trail design

  **Commit**: YES (group with T30, T31)

- [ ] 33. **Crear slice-12 (saas multitenancy foundation)**

  **What to do**:
  - Crear slice-12-saas-multitenancy-foundation.md
  - Tenant model (aislamiento de datos)
  - Branding por tenant
  - Roles por tenant
  - Feature flags
  - Planes (pricing tiers)
  - Auditoría por tenant
  - NOTA: Este slice es P3 — no implementar hasta P1 y P2 estables

  **Parallelization**: Can Run In Parallel: YES | Wave 4 (P3)
  **Blocked By**: T22-T29 (P0-P1 completados)

  **References**:
  - T10 (innovation roadmap) — SaaS evaluation
  - `backend/src/modules/system-config/`
  - `docs/product/CERMONT_PRODUCT_BLUEPRINT.md`

  **Acceptance Criteria**:
  - [ ] Multi-tenancy architecture design
  - [ ] Data isolation strategy
  - [ ] Feature flags design

  **Commit**: YES (group with T30-T32)

- [ ] 34. **Ejecutar gates post-auditoría**

  **What to do**:
  - Ejecutar todos los gates después de crear los documentos de auditoría
  - Verificar que no se hayan introducido errores
  - `npm run typecheck`, `npm run lint`, `npm test`, `npm run build`, `npm run contracts:check`, `npm run quality:strict`, `npm run verify`
  - Documentar resultados en final-plan-report.md

  **Must NOT do**:
  - No modificar código existente

  **Parallelization**: Can Run In Parallel: NO | Wave FINAL (sequential)
  **Blocked By**: T1-T33

  **Acceptance Criteria**:
  - [ ] All gates documented with PASS/FAIL
  - [ ] Any regressions identified and reported

  **QA Scenarios**:
  ```
  Scenario: Run all gates
    Tool: Bash
    Preconditions: All plan documents created
    Steps:
      1. npm run typecheck
      2. npm run lint
      3. npm test
      4. npm run build
      5. npm run contracts:check
      6. npm run quality:strict
      7. npm run verify
    Expected Result: typecheck, lint, test, build, contracts PASS. quality + verify depend on T8.
    Evidence: .sisyphus/evidence/spec-008-task-34-gates.txt
  ```

  **Commit**: NO (verification only)

- [ ] 35. **Crear final-plan-report.md**

  **What to do**:
  - Crear `specs/008-auditoria-investigacion-mejora-continua-cermont/final-plan-report.md`
  - Formato: Estado actual, Hallazgos técnicos, Hallazgos de producto, Riesgos críticos, Investigación Context7, Investigación Vercel, Roadmap P0/P1/P2/P3, Slices ejecutables, Primer sprint recomendado, Definition of Done
  - Resumen ejecutivo de toda la Spec 008

  **Must NOT do**:
  - No incluir información no verificada

  **Parallelization**: Can Run In Parallel: YES | Wave FINAL (with T36)
  **Blocked By**: T1-T33

  **Acceptance Criteria**:
  - [ ] 10 sections as required
  - [ ] All findings referenced back to source tasks

  **Commit**: YES
  - Message: `docs(spec-008): create final plan report`
  - Files: `specs/008-auditoria-investigacion-mejora-continua-cermont/final-plan-report.md`

- [ ] 36. **Crear CERMONT_NEXT_DEVELOPMENT_PLAN.md**

  **What to do**:
  - Crear `docs/product/CERMONT_NEXT_DEVELOPMENT_PLAN.md`
  - Documento ejecutivo para stakeholders
  - Versión resumida del final-plan-report
  - Enfocado en: qué sigue, en qué orden, por qué
  - Primer sprint recomendado claramente definido

  **Must NOT do**:
  - No incluir detalle técnico excesivo

  **Parallelization**: Can Run In Parallel: YES | Wave FINAL (with T35)
  **Blocked By**: T1-T33

  **Acceptance Criteria**:
  - [ ] Executive summary
  - [ ] Clear first sprint definition
  - [ ] Business-aligned priorities

  **Commit**: YES (group with T35)

- [ ] 37. **Validación de consistencia general**

  **What to do**:
  - Verificar que todos los documentos creados sean consistentes entre sí
  - No contradictions between baseline, product audit, innovation roadmap, implementation roadmap
  - RBAC consistent across all docs
  - Same module names used across all docs
  - Gate results consistent

  **Must NOT do**:
  - No modificar contenido — solo señalar inconsistencias

  **Parallelization**: Can Run In Parallel: YES | Wave FINAL (with T35, T36)
  **Blocked By**: T1-T33

  **Acceptance Criteria**:
  - [ ] No contradictions found (or documented)
  - [ ] Cross-document consistency verified

  **QA Scenarios**:
  ```
  Scenario: Cross-document consistency
    Tool: Bash
    Preconditions: All documents created
    Steps:
      1. Compare module names across maps
      2. Compare RBAC roles across product audit and RBAC map
      3. Compare gate results in baseline vs plan
    Expected Result: Consistent naming and statuses
    Evidence: .sisyphus/evidence/spec-008-task-37-consistency.txt
  ```

  **Commit**: NO (verification only)

- [ ] 38. **Presentar resultados al usuario**

  **What to do**:
  - Presentar resumen ejecutivo de toda la Spec 008
  - Incluir: baseline state, key findings, P0/P1/P2/P3 roadmap, first sprint recommendation
  - Preguntar: ¿procedemos con el primer sprint?
  - El primer sprint recomendado es: **Slice 01 (Stabilization + Gates)** porque:
    - quality:strict falla → bloquea verify
    - React Doctor score bajó 10 puntos
    - Errores post-deploy conocidos (PayloadTooLargeError)
    - Sin P0 estable no se puede avanzar a P1/P2/P3

  **Parallelization**: Can Run In Parallel: NO | Wave FINAL
  **Blocked By**: T34, T35, T36, T37

  **Acceptance Criteria**:
  - [ ] User informed of all findings
  - [ ] First sprint clearly recommended
  - [ ] User decision obtained

  **Commit**: NO (communication only)

---

## Final Verification Wave

> 4 review agents run in PARALLEL. ALL must APPROVE. Present consolidated results to user and get explicit "okay" before completing.

- [ ] F1. **Plan Compliance Audit** — `oracle`
  Read the plan end-to-end. For each "Must Have": verify implementation exists (read file, check gates). For each "Must NOT Have": search for forbidden patterns — reject with file:line if found. Check evidence files. Compare deliverables against plan.
  Output: `Must Have [N/N] | Must NOT Have [N/N] | Tasks [N/N] | VERDICT: APPROVE/REJECT`

- [ ] F2. **Code Quality Review** — `unspecified-high`
  Run `npm run typecheck`, `npm run lint`, `npm test`, `npm run build`. Check all created docs for: contradictions, missing sections, hallucinations. Check AI slop: excessive boilerplate, over-abstraction.
  Output: `Build [PASS/FAIL] | Lint [PASS/FAIL] | Tests [N pass/N fail] | VERDICT`

- [ ] F3. **Real Manual QA** — `unspecified-high`
  Execute EVERY QA scenario from EVERY task — follow exact steps, capture evidence. Verify each document exists and contains required content. Save to `.sisyphus/evidence/spec-008/`.
  Output: `Scenarios [N/N pass] | Documents [N/N] | VERDICT`

- [ ] F4. **Scope Fidelity Check** — `deep`
  For each task: read "What to do", check actual output. Verify 1:1 — everything in spec was created (no missing), nothing beyond spec was built (no creep). Check "Must NOT do" compliance.
  Output: `Tasks [N/N compliant] | Unaccounted [CLEAN/N files] | VERDICT`

---

## Commit Strategy

| Wave | Tasks | Commit Message |
|------|-------|----------------|
| Wave 1 | T1-T8 | `docs(spec-008): baseline, research, and architecture maps` |
| Wave 2 | T9-T15 | `docs(spec-008): product audit, RBAC, FileAsset, PWA, legal` |
| Wave 3 | T16-T21 | `docs(spec-008): implementation roadmap and P0/P1/P2/P3 prioritization` |
| Wave 4 | T22-T33 | `docs(spec-008): 12 executable slices` |
| Wave FINAL | T34-T38 | `docs(spec-008): final validation and plan report` |

Each wave commit includes:
- All documents created in that wave
- `npm run verify` pre-commit (if code changes involved)

---

## Success Criteria

### Verification Commands
```bash
cd C:\Users\camil\Downloads\cermont_aplicativo\cermont_aplicativo
npm run typecheck  # Expected: 7/7 PASS
npm run lint       # Expected: 7/7 PASS  
npm test           # Expected: 170 files, 1013+ tests PASS
npm run build      # Expected: 5/5 PASS
npm run contracts:check  # Expected: snapshot match
npm run quality:strict   # Expected: PASS (baseline actualizado)
npm run verify     # Expected: PASS
```

### Final Checklist
- [ ] All gates PASS (typecheck, lint, test, build, contracts, quality, verify)
- [ ] React Doctor score >= 87/100
- [ ] All 3 missing architecture maps created and verified
- [ ] 26 modules audited in multiservice product audit
- [ ] 10 innovation ideas evaluated with MVP/risk/impact
- [ ] P0/P1/P2/P3 roadmap with clear priorities
- [ ] 12 executable slices with IA scenarios
- [ ] First sprint clearly defined
- [ ] No speculative content — all findings backed by evidence
- [ ] All documents committed to repo
