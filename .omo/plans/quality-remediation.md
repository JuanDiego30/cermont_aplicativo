# Plan Maestro de Remediación de Calidad — CERMONT S.A.S.

## TL;DR

> **Resumen**: Plan integral de 7 fases para llevar el aplicativo CERMONT a producción con calidad enterprise. Abarca desde corrección de bugs inmediatos (React Doctor, weak tokens) hasta refactorización contract-first, robustecimiento del flujo operativo de 14 pasos, mejora de módulos críticos, escalabilidad controlada, DevOps y documentación.
>
> **Entregables**:
> - **Fase 1**: 20 issues de React Doctor corregidos + 3 weak tokens + baseline actualizado
> - **Fase 2**: SSOT auditado y refactorizado (contratos Zod, roles, query keys, estados)
> - **Fase 3**: Flujo de 14 pasos con trazabilidad, estados, responsables y validaciones
> - **Fase 4**: Módulos críticos robustecidos (planeación, ejecución offline, evidencias, costos)
> - **Fase 5**: Dashboard KPI, notificaciones, archivado histórico, observabilidad, performance
> - **Fase 6**: Quality gates CI/CD, scripts de verificación, baseline de calidad
> - **Fase 7**: ADRs, documentación de módulos, rutas, roles, despliegue VPS
>
> **Esfuerzo estimado**: Large (varios sprints — priorizar Fase 1-2 como P0)
> **Ejecución en paralelo**: SÍ — múltiples waves por fase
> **Ruta crítica**: Fase 1 → Fase 2 → Fase 3 → Fase 4 → Fase 5 → Fase 6 → Fase 7

---

## Context

### Documentos Obligatorios (Fuente de Verdad)

Este plan se rige por los siguientes documentos, en orden de prioridad:

1. **`docs/REGLAS_DESARROLLO_CERMONT.md`** — 17 secciones de reglas absolutas (SOLID, SSOT, Contract-First, Zero Any, Zero Null, TypeScript estricto, Mobile First, Offline-First, seguridad, auditoría, performance, documentación)
2. **`docs/pdf/07_DESARROLLO_DE_UN_APLICATIVO_WEB_PARA_APOYO_EN_LA_EJECUCION_Y_CIERRE_ADMINISTRATIVO_DE_LOS_TRABA3.md`** — Flujo operativo de 14 pasos (solicitud → pago) y fallas documentadas en planeación, ejecución, actas, facturación y costos
3. **`docs/pdf/09_Observaciones_Anteproyecto_Juan_Diego2.md`** — Módulos requeridos: ejecución offline, dashboard KPIs, administración (kits, RBAC), archivado histórico
4. **`frontend/AGENTS.md`** — Reglas específicas del frontend (Feature-Sliced, TanStack Query, estados requeridos, diseño)

### Estado Actual del Repositorio

- **Rama**: `implement/spec-024-post-spec022-continuation`
- **Estado**: Working tree limpio (sin cambios sin commit)
- **Commits recientes**: Spec-024 (tests, dashboard, evidence, planning readiness, automation rules)
- **Baseline calidad**: `tooling/quality/baseline.json` con 12 reglas monitoreadas
- **Monorepo**: npm workspaces (backend/ + frontend/ + packages/*)
- **Quality gates**: `npm run verify` ejecuta lint, typecheck, test, build, contracts:check, quality:strict, doctor:verbose

### Problemas Detectados (Línea Base)

| Herramienta | Findings | Gravedad |
|-------------|----------|----------|
| React Doctor | 20 issues (72/100) | Bugs + Maintainability |
| Weak tokens | 3 nuevos sobre baseline | Quality gate failure |
| Verify | quality:strict falla | Bloqueante para CI/CD |

---

## Work Objectives

### Objetivo Principal
Implementar un plan de mejoramiento de calidad real para dejar el aplicativo **más estable, mantenible, escalable, seguro, auditable, preparado para operación en campo y alineado con el flujo operativo de CERMONT de 14 pasos**.

### Definición de Done (Global)
- [ ] `npx react-doctor@latest --verbose --scope changed` → 0 issues en archivos modificados
- [ ] `npm run quality:weak-tokens` → exit 0 (todas within baseline)
- [ ] `npm run quality:zero` → exit 0
- [ ] `npm run typecheck -w frontend` → exit 0
- [ ] `npm run lint -w frontend` → exit 0
- [ ] `npm run build -w frontend` → exit 0
- [ ] `npm run typecheck -w backend` → exit 0
- [ ] `npm run lint -w backend` → exit 0
- [ ] `npm run test` → exit 0
- [ ] No se eliminó funcionalidad existente sin reemplazo
- [ ] No se introdujo `any`, `unknown`, `null` ni `undefined`
- [ ] No hay roles hardcodeados
- [ ] No hay rutas hardcodeadas
- [ ] No hay lógica de negocio compleja en UI
- [ ] No hay fetch directo en componentes
- [ ] RBAC validado en todas las rutas
- [ ] Estados loading/error/empty/offline cubiertos en páginas críticas
- [ ] Evidencias y documentos mantienen trazabilidad
- [ ] Flujo de 14 pasos respetado con validaciones de transición
- [ ] Documentación actualizada

### Must Have (Fase 1 — P0)
- Corregir 9 jsx-key bugs
- Agregar `sizes` a next/image fill
- Mover `colorMap` a module scope
- Quitar export no usado de `toDocStatus`
- Eliminar 7 archivos no usados confirmados (NO eliminar EvidenceGallery.tsx)
- Corregir 3 weak tokens que exceden baseline
- No aumentar baseline salvo justificación

### Must NOT Have (Global)
- NO eliminar EvidenceGallery.tsx (falso positivo)
- NO cambiar lógica de negocio sin justificarlo y probarlo
- NO introducir `any`, `unknown`, `null`, `undefined`
- NO duplicar schemas, roles, rutas, estados
- NO poner lógica de negocio en UI
- NO usar fetch directo en componentes
- NO hardcodear roles/rutas si existe fuente central
- NO introducir console.log/debugger/alert/código mock
- NO romper Docker, scripts VPS, flujo de despliegue
- NO reemplazar despliegue VPS por Vercel/Netlify
- NO hacer refactors masivos sin pruebas/checklist
- NO modificar `package.json` o `package-lock.json` sin aprobación

---

## Verification Strategy

### Test Decision
- **Infrastructure exists**: YES (Vitest en frontend + backend, Playwright E2E)
- **Automated tests**: Tests-after (verificación post-fix por fase)
- **Framework**: Vitest 4.x (frontend + backend), Playwright 1.58 (E2E)
- **Quality gates**: Biome lint, TypeScript strict, react-doctor, weak-tokens, zero-rules

### QA Policy
Cada tarea incluye verificación con comandos específicos.
Evidencia guardada en `.sisyphus/evidence/`.

**Gates obligatorios después de CADA fase:**
```bash
npm run typecheck -w frontend
npm run lint -w frontend
npm run build -w frontend
npm run typecheck -w backend
npm run lint -w backend
```

**Gates de calidad después de Fase 1:**
```bash
npx react-doctor@latest --verbose --scope changed
npm run quality:weak-tokens
```

---

## Execution Strategy

### Estructura General

```
FASE 0 — Preparación y Auditoría (Diagnóstico inicial)
├── T0.1: Revisar estado del repositorio
├── T0.2: Leer documentos obligatorios
├── T0.3: Crear matriz de cumplimiento CERMONT
└── T0.4: Identificar errores bloqueantes y deuda técnica

FASE 1 — Remediación Técnica Bloqueante (P0 — React Doctor + Weak Tokens)
├── T1.1: Fix 9 jsx-key props (spread después de key)
├── T1.2: Fix next/image fill missing sizes
├── T1.3: Fix colorMap static value en StatusRow
├── T1.4: Fix unused export toDocStatus
├── T1.5: Delete 7 confirmed unused files
├── T1.6: Fix 3 weak token findings
└── T1.7: Update quality baseline.json

FASE 2 — Refactorización Contract-First y SSOT
├── T2.1: Auditar contratos Zod vs modelos Mongoose vs tipos frontend
├── T2.2: Centralizar roles RBAC en @cermont/domain
├── T2.3: Centralizar query keys en frontend
├── T2.4: Centralizar estados del flujo de 14 pasos
├── T2.5: Refactorizar duplicación de esquemas de formularios
└── T2.6: Validar rutas frontend contra FRONTEND_ROUTE_MAP.md

FASE 3 — Refactorización Funcional del Flujo CERMONT (14 pasos)
├── T3.1: Mapear estado actual de cada paso (implementado vs pendiente)
├── T3.2: Implementar/escalar trazabilidad por paso (estado, responsable, fecha, evidencia)
├── T3.3: Implementar/escalar validaciones de transición entre pasos
├── T3.4: Implementar/escalar historial de auditoría por paso
├── T3.5: Implementar estados faltantes (loading, error, empty, offline)
└── T3.6: Implementar/escalar bloqueos por documentación obligatoria

FASE 4 — Mejora de Módulos Críticos
├── T4.1: Planeación (kits típicos, herramientas, AST, checklist previo)
├── T4.2: Ejecución en campo (offline-first, captura evidencias, sync)
├── T4.3: Evidencias (galería robusta, carga múltiple, metadatos, trazabilidad)
├── T4.4: Informes y actas (generación documental, validación pre-cierre)
├── T4.5: SES, factura y pago (seguimiento, fechas, aprobación, bloqueo)
└── T4.6: Costos (estimado vs real, materiales, mano de obra, desviaciones)

FASE 5 — Escalamiento e Innovación Controlada
├── T5.1: Dashboard KPI (órdenes por estado, tiempos, cuellos de botella)
├── T5.2: Notificaciones (cambio estado, evidencia pendiente, SES, factura)
├── T5.3: Formularios dinámicos (plantillas, checklists, versionado)
├── T5.4: Archivado histórico (mover a histórico, exportar, mantener auditoría)
├── T5.5: Observabilidad (requestId, logs seguros, errores tipados)
└── T5.6: Performance (lazy loading, paginación, imágenes optimizadas)

FASE 6 — DevOps, CI/CD y Despliegue
├── T6.1: Verificar quality gates en GitHub Actions
├── T6.2: Scripts de verificación pre-commit
├── T6.3: Validar Docker y scripts VPS
└── T6.4: Configurar baseline de calidad como gate obligatorio

FASE 7 — Documentación
├── T7.1: ADRs para decisiones arquitectónicas clave
├── T7.2: Actualizar README, rutas, roles, variables de entorno
├── T7.3: Documentar flujo offline/sync
├── T7.4: Documentar módulos críticos
└── T7.5: Documentar despliegue VPS

VERIFICACIÓN FINAL — Consolidado de gates
├── V1: React Doctor en archivos modificados
├── V2: quality:weak-tokens + quality:zero
├── V3: typecheck + lint + build (frontend + backend)
├── V4: tests
├── V5: Checklist de reglas CERMONT
└── V6: Resumen ejecutivo + próximos pasos
```

### Priorización

| Prioridad | Fase | Esfuerzo | Impacto | Riesgo |
|-----------|------|----------|---------|--------|
| **P0** | Fase 1 (Remediación técnica) | 3-4h | Alto | Bajo |
| **P0** | Fase 2 (Contract-First SSOT) | 6-8h | Alto | Medio |
| **P1** | Fase 3 (Flujo 14 pasos) | 12-16h | Muy Alto | Alto |
| **P1** | Fase 4 (Módulos críticos) | 16-20h | Muy Alto | Alto |
| **P2** | Fase 5 (Escalamiento) | 16-20h | Alto | Medio |
| **P2** | Fase 6 (DevOps) | 4-6h | Medio | Bajo |
| **P2** | Fase 7 (Documentación) | 6-8h | Medio | Bajo |

---

## TODOs — FASE 1: Remediación Técnica Bloqueante

> **OBJETIVO**: Corregir los 20 issues de React Doctor + 3 weak tokens que bloquean quality:strict.
> **ESFUERZO**: 3-4 horas | **RIESGO**: Bajo | **PARALELIZACIÓN**: Alta

- [ ] 1.1. Fix 9 jsx-key prop issues (spread overwrites key)

  **What to do**: En 9 archivos, mover el prop `key` DESPUÉS del spread `{...item}` para evitar que el spread sobrescriba la key de React.

  **Archivos a modificar**:

  1. `frontend/src/app/(dashboard)/admin/custom-fields/page.tsx:100`
     ```tsx
     // ANTES:
     <CustomFieldEditor
       key={editing === "new" ? "new" : editing._id}
       entityType={entityType}
       {...(editing !== "new" ? { initial: editing } : {})}
     />
     // DESPUÉS:
     <CustomFieldEditor
       entityType={entityType}
       {...(editing !== "new" ? { initial: editing } : {})}
       key={editing === "new" ? "new" : editing._id}
     />
     ```

  2. `frontend/src/landing/components/AboutSection.tsx:60`
     ```tsx
     // ANTES: <PrincipleCard key={point.title} {...point} />
     // DESPUÉS: <PrincipleCard {...point} key={point.title} />
     ```

  3. `frontend/src/landing/components/HeroSection.tsx:131`
     ```tsx
     // ANTES: <MetricCard key={metric.label} {...metric} />
     // DESPUÉS: <MetricCard {...metric} key={metric.label} />
     ```

  4. `frontend/src/landing/components/MethodSection.tsx:30`
     ```tsx
     // ANTES: <WorkflowCard key={step.step} {...step} />
     // DESPUÉS: <WorkflowCard {...step} key={step.step} />
     ```

  5. `frontend/src/landing/components/ResourcesSection.tsx:29`
     ```tsx
     // ANTES: <ResourceCard key={resource.title} {...resource} />
     // DESPUÉS: <ResourceCard {...resource} key={resource.title} />
     ```

  6. `frontend/src/landing/components/ResourcesSection.tsx:35`
     ```tsx
     // ANTES: <CertificationCard key={certification.title} {...certification} />
     // DESPUÉS: <CertificationCard {...certification} key={certification.title} />
     ```

  7. `frontend/src/landing/components/ServicesSection.tsx:22`
     ```tsx
     // ANTES: <ServiceCard key={service.title} {...service} />
     // DESPUÉS: <ServiceCard {...service} key={service.title} />
     ```

  8. `frontend/src/landing/components/TrustSection.tsx:25`
     ```tsx
     // ANTES: <PrincipleCard key={point.title} {...point} />
     // DESPUÉS: <PrincipleCard {...point} key={point.title} />
     ```

  9. `frontend/src/modules/service-cases/components/CostComparisonPanel.tsx:260`
     ```tsx
     // ANTES: <CategoryRow key={cat.label} {...cat} />
     // DESPUÉS: <CategoryRow {...cat} key={cat.label} />
     ```

  **Must NOT do**:
  - No cambiar el valor de `key` — solo moverlo después del spread
  - No cambiar indentación o formato no relacionado

  **Parallelization**: YES — Wave 1 (9 archivos independientes)

  **Acceptance Criteria**:
  - [ ] npx react-doctor@latest --verbose --scope changed → 0 jsx-key findings
  - [ ] npm run typecheck -w frontend → exit 0

  **Evidence**: `.sisyphus/evidence/task-1-1-jsx-key.txt`

- [ ] 1.2. Fix next/image fill missing sizes attribute

  **What to do**: En `frontend/src/app/(dashboard)/service-cases/[id]/cockpit/page.tsx:145`, agregar `sizes` al `<Image fill>`.

  El grid usa `grid-cols-2 sm:grid-cols-3 md:grid-cols-4` con gap-3.

  ```tsx
  // ANTES:
  <Image src={ev.url} alt={ev.caption ?? "Evidencia"} fill className="object-cover transition group-hover:scale-105" />
  // DESPUÉS:
  <Image src={ev.url} alt={ev.caption ?? "Evidencia"} fill sizes="(max-width: 640px) 50vw, (max-width: 768px) 33vw, 25vw" className="object-cover transition group-hover:scale-105" />
  ```

  **Must NOT do**: No cambiar layout, className, src o alt

  **Parallelization**: YES — Wave 1

  **Acceptance Criteria**:
  - [ ] npx react-doctor@latest --verbose --scope changed → 0 image-sizes findings
  - [ ] npm run typecheck -w frontend → exit 0

  **Evidence**: `.sisyphus/evidence/task-1-2-image-sizes.txt`

- [ ] 1.3. Fix colorMap static value rebuilt every render

  **What to do**: En `frontend/src/app/(dashboard)/service-cases/[id]/cockpit/page.tsx:285`, mover `colorMap` fuera del componente `StatusRow`.

  ```tsx
  // ANTES (dentro del componente):
  const colorMap: Record<string, string> = { pending: "...", approved: "...", ... };
  // DESPUÉS (module scope):
  const STATUS_COLOR_MAP: Record<string, string> = { pending: "...", approved: "...", ... };
  ```

  **Must NOT do**: No cambiar lógica de negocio ni valores del map

  **Parallelization**: YES — Wave 1

  **Acceptance Criteria**:
  - [ ] npx react-doctor@latest --verbose --scope changed → 0 prefer-module-scope-static-value findings
  - [ ] npm run typecheck -w frontend → exit 0

  **Evidence**: `.sisyphus/evidence/task-1-3-static-value.txt`

- [ ] 1.4. Fix unused export toDocStatus

  **What to do**: En `frontend/src/modules/cockpit/model/cockpit.types.ts:55`, quitar `export` de `toDocStatus`.

  ```tsx
  // ANTES: export function toDocStatus(fileUrl?: string): CockpitDocument["status"] {
  // DESPUÉS: function toDocStatus(fileUrl?: string): CockpitDocument["status"] {
  ```

  **Must NOT do**: No eliminar la función, no cambiar implementación

  **Parallelization**: YES — Wave 1

  **Acceptance Criteria**:
  - [ ] npx react-doctor@latest --verbose --scope changed → 0 unused-export findings
  - [ ] npm run typecheck -w frontend → exit 0

  **Evidence**: `.sisyphus/evidence/task-1-4-unused-export.txt`

- [ ] 1.5. Delete 7 confirmed unused files

  **What to do**: Eliminar con `git rm` los siguientes archivos NO importados por ningún otro módulo:

  1. `frontend/src/modules/cockpit/ui/AuditTimeline.tsx`
  2. `frontend/src/modules/dashboard/hooks/useDashboardKpis.ts`
  3. `frontend/src/modules/dashboard/ui/KpiWidgetGrid.tsx`
  4. `frontend/src/modules/evidences/ui/EvidenceReplacementDialog.tsx`
  5. `frontend/src/modules/service-cases/ui/CockpitPanel.tsx`
  6. `frontend/src/modules/service-cases/ui/FourteenStepProgress.tsx`
  7. `frontend/src/modules/service-cases/ui/NextActionsPanel.tsx`

  **NO eliminar**: `EvidenceGallery.tsx` — importado por ServiceCaseWorkflowCockpit.tsx y EvidenceGallerySection.tsx.

  **Parallelization**: YES — Wave 1 (puede ejecutarse en paralelo con 1.1-1.4)

  **Acceptance Criteria**:
  - [ ] npx react-doctor@latest --verbose → 0 unused-file findings for these 7
  - [ ] git status → 7 deleted files
  - [ ] npm run typecheck -w frontend → exit 0

  **Evidence**: `.sisyphus/evidence/task-1-5-deleted-files.txt`

- [ ] 1.6. Fix 3 weak token findings exceeding baseline

  **What to do**: Corregir los 3 nuevos findings que exceden el baseline.

  **F1**: `backend/src/index.ts:134` — `null` en callback CORS
  ```tsx
  callback(null, true) → callback(undefined, true)
  ```
  **F2**: `backend/src/index.ts:403` — comentario con "unknown errors"
  ```tsx
  → "unhandled errors"
  ```
  **F3**: `backend/src/middlewares/audit-log.middleware.ts:78` — string literal `"unknown"`
  ```tsx
  → "not_provided"
  ```

  **Must NOT do**: No cambiar comportamiento funcional, no refactorizar type assertions existentes (ya en baseline)

  **Parallelization**: YES — Wave 2 (después de Wave 1)

  **Acceptance Criteria**:
  - [ ] npm run quality:weak-tokens → exit 0 (todas within baseline)
  - [ ] npm run typecheck -w backend → exit 0
  - [ ] npm run lint -w backend → exit 0

  **Evidence**: `.sisyphus/evidence/task-1-6-weak-tokens.txt`

- [ ] 1.7. Update quality baseline.json (if needed)

  **What to do**: Después de corregir los 3 findings, ejecutar `npm run quality:weak-tokens`. Si aún hay reglas que exceden el baseline, actualizar `tooling/quality/baseline.json` con los valores actuales.

  **Valores esperados post-fix**:
  | Regla | Antes | Después |
  |-------|-------|---------|
  | weak-token-a | 73 | 73 |
  | weak-token-n | 1519 | 1519 |
  | weak-token-u | 714 | 714 |
  | weak-token-ud | 781 | 781 |

  **Must NOT do**: No aumentar baseline indiscriminadamente — solo si findings no pueden corregirse

  **Parallelization**: NO — después de 1.6

  **Acceptance Criteria**:
  - [ ] npm run quality:weak-tokens → exit 0
  - [ ] Todos los counts muestran "within baseline"

  **Evidence**: `.sisyphus/evidence/task-1-7-baseline.txt`

  **Commit**: YES — `fix(quality): resolve react-doctor issues and weak token baseline`
  `(tasks 1.1-1.7)`

---

## TODOs — FASE 2: Refactorización Contract-First y SSOT

> **OBJETIVO**: Auditar y centralizar todas las fuentes de verdad (contratos Zod, roles, query keys, estados, rutas) siguiendo el principio SSOT y Contract-First.
> **ESFUERZO**: 6-8 horas | **RIESGO**: Medio | **PARALELIZACIÓN**: Media

- [ ] 2.1. Auditar contratos Zod vs modelos Mongoose vs tipos frontend

  **What to do**:
  - Revisar `packages/shared-types/src/schemas/` vs modelos Mongoose en `backend/src/models/`
  - Verificar que los schemas Zod sean la fuente de verdad y los modelos Mongoose estén alineados
  - Verificar que los tipos frontend usen `z.infer` de los schemas compartidos, no tipos manuales
  - Identificar duplicación de esquemas de formularios Zod entre frontend y shared-types
  - Reportar discrepancias encontradas como issues para corrección

  **Regla CERMONT**: Contract-First (Schema Zod → Tipo inferido → Modelo Mongoose → Servicio → Controller → Ruta → API service → Query keys → Hook → UI → Tests)

  **Files to examine**:
  - `packages/shared-types/src/schemas/` — todos los archivos
  - `backend/src/models/` — todos los modelos Mongoose
  - `frontend/src/modules/*/api/` — tipados de API
  - `frontend/src/modules/*/model/` — tipos locales

  **Deliverable**: Matriz de cumplimiento contract-first con discrepancias documentadas

  **Parallelization**: YES — Wave 1 de Fase 2 (puede correr en paralelo con 2.2, 2.3)

  **Acceptance Criteria**:
  - [ ] Matriz generada con todos los módulos revisados
  - [ ] Issues documentados para cada discrepancia encontrada

- [ ] 2.2. Centralizar roles RBAC en @cermont/domain

  **What to do**:
  - Revisar `packages/domain/src/` para confirmar que contiene los 8 roles exactos
  - Buscar en frontend y backend arrays hardcodeados de roles (grep: `"gerente"`, `"residente"`, etc.)
  - Reemplazar arrays hardcodeados con imports desde `@cermont/domain`
  - Verificar que `proxy.ts` usa `@cermont/domain` para RBAC

  **Regla CERMONT**: RBAC as Single Source of Truth, PoLP, Defense in Depth

  **Parallelization**: YES — Wave 1 de Fase 2

  **Acceptance Criteria**:
  - [ ] 0 arrays de roles hardcodeados en frontend
  - [ ] 0 arrays de roles hardcodeados en backend
  - [ ] npm run typecheck -w frontend → exit 0
  - [ ] npm run typecheck -w backend → exit 0

- [ ] 2.3. Centralizar query keys en frontend

  **What to do**:
  - Revisar que cada módulo tenga un archivo de query keys (ej. `orderKeys`, `evidenceKeys`, `userKeys`)
  - Buscar query keys inline o duplicadas
  - Centralizar donde falte siguiendo el patrón establecido

  **Patrón correcto**:
  ```ts
  export const orderKeys = {
    all: ["orders"] as const,
    list: (filters: OrderFilters) => ["orders", "list", filters] as const,
    detail: (id: string) => ["orders", id] as const,
  };
  ```

  **Parallelization**: YES — Wave 1 de Fase 2

  **Acceptance Criteria**:
  - [ ] Todos los módulos tienen query keys centralizadas
  - [ ] 0 query keys inline o duplicadas

- [ ] 2.4. Centralizar estados del flujo de 14 pasos

  **What to do**:
  - Verificar que los estados del flujo de 14 pasos estén definidos en un solo lugar (`@cermont/shared-types` o `@cermont/domain`)
  - Buscar enums/constantes de estado duplicadas en frontend y backend
  - Centralizar donde falte

  **Parallelization**: YES — Wave 1 de Fase 2

  **Acceptance Criteria**:
  - [ ] Estados del flujo de 14 pasos centralizados
  - [ ] 0 duplicación de constantes de estado

- [ ] 2.5. Refactorizar duplicación de esquemas de formularios

  **What to do**:
  - Revisar schemas Zod en frontend que dupliquen schemas de `packages/shared-types`
  - Reemplazar con imports desde shared-types donde sea posible
  - Para schemas específicos de UI, asegurar que extienden o usan los schemas base

  **Parallelization**: YES — Wave 2 de Fase 2 (después de 2.1)

  **Acceptance Criteria**:
  - [ ] Reducción de schemas Zod duplicados
  - [ ] npm run typecheck -w frontend → exit 0
  - [ ] npm run contracts:check → exit 0

- [ ] 2.6. Validar rutas frontend contra FRONTEND_ROUTE_MAP.md

  **What to do**:
  - Comparar rutas en `docs/architecture/FRONTEND_ROUTE_MAP.md` con archivos reales en `frontend/src/app/`
  - Identificar rutas faltantes, huérfanas o mal mapeadas
  - Reportar discrepancias

  **Parallelization**: YES — Wave 2 de Fase 2

  **Acceptance Criteria**:
  - [ ] Todas las rutas documentadas existen
  - [ ] No hay rutas huérfanas sin documentar

---

## TODOs — FASE 3: Refactorización Funcional del Flujo CERMONT (14 pasos)

> **OBJETIVO**: Mapear, auditar y robustecer el flujo operativo de 14 pasos con trazabilidad completa.
> **ESFUERZO**: 12-16 horas | **RIESGO**: Alto | **PARALELIZACIÓN**: Media

- [ ] 3.1. Mapear estado actual de cada paso del flujo de 14 pasos

  **What to do**: Crear una matriz que documente para cada paso:

  1. Solicitud formal del cliente
  2. Visita técnica
  3. Propuesta económica
  4. Aprobación con PO
  5. Planeación de actividad
  6. Ejecución en campo
  7. Informe técnico
  8. Acta de entrega
  9. Acta firmada
  10. SES / Ariba
  11. SES aprobada
  12. Factura
  13. Aprobación de factura
  14. Pago y cierre definitivo

  Para cada paso documentar:
  - Estado actual de implementación (implementado, parcial, no implementado)
  - Archivos relacionados (frontend + backend)
  - Estados disponibles (pending/active/completed/blocked)
  - Responsable asignado (rol)
  - Evidencia requerida
  - Documento asociado
  - Validación de permisos
  - Bloqueos existentes

  **Parallelization**: YES — Wave 1 de Fase 3

  **Deliverable**: Matriz `docs/implementation/14-STEP-AUDIT-MATRIX.md`

- [ ] 3.2. Implementar trazabilidad por paso (estado, responsable, fecha, evidencia)

  **What to do**: Para cada paso del flujo, asegurar que el modelo de datos incluya:
  - `status`: estado actual
  - `assignedRole`: rol responsable
  - `completedAt`: fecha de completitud
  - `evidenceIds[]`: evidencias asociadas
  - `documentIds[]`: documentos asociados

  Extensiones necesarias en schemas Zod, modelos Mongoose y tipos frontend.

  **Parallelization**: YES — Wave 2 de Fase 3 (después de 3.1)

  **Acceptance Criteria**:
  - [ ] Modelo de datos extendido con trazabilidad por paso
  - [ ] npm run contracts:check → exit 0

- [ ] 3.3. Implementar validaciones de transición entre pasos

  **What to do**: Cada transición entre pasos debe validar:
  - El paso anterior está completo
  - La documentación requerida existe
  - El usuario tiene el rol adecuado
  - Las evidencias necesarias están presentes

  Implementar como reglas de dominio en `@cermont/domain` o servicios específicos.

  **Parallelization**: YES — Wave 2 de Fase 3

  **Acceptance Criteria**:
  - [ ] Las transiciones inválidas son bloqueadas con error tipado
  - [ ] Códigos de error estables (PLANNING_NOT_APPROVED, EVIDENCE_REQUIRED, etc.)

- [ ] 3.4. Implementar/escalar historial de auditoría por paso

  **What to do**: Asegurar que cada acción crítica en el flujo genere un evento de auditoría:
  - Creación, aprobación, rechazo, completitud de cada paso
  - Almacenar: actor, acción, entidad, timestamp, requestId, metadata
  - Auditoría debe ser forense: inmutable, sin TTL, indexada

  **Regla CERMONT**: Auditability by Default, 23 eventos mínimos listados en REGLAS_DESARROLLO

  **Parallelization**: YES — Wave 3 de Fase 3

  **Acceptance Criteria**:
  - [ ] Eventos de auditoría para cada paso del flujo
  - [ ] npm run test -w backend → exit 0

- [ ] 3.5. Implementar estados faltantes (loading, error, empty, offline, forbidden)

  **What to do**: Para cada página del flujo de 14 pasos que cargue datos, verificar que tenga:
  - Loading state (skeleton/spinner)
  - Error state (mensaje + retry)
  - Empty state (ilustración + descripción + CTA)
  - Offline state (banner + estado de sync) — para páginas de campo
  - Forbidden state (tarjeta "sin permiso") — para páginas RBAC

  **Parallelization**: SÍ — Wave 3 de Fase 3

  **Acceptance Criteria**:
  - [ ] Cada página crítica tiene los 5 estados
  - [ ] npx react-doctor@latest --verbose → sin regresiones

- [ ] 3.6. Implementar bloqueos por documentación obligatoria

  **What to do**: No permitir avanzar al siguiente paso si:
  - Evidencias del paso actual faltan
  - Documentos obligatorios no han sido subidos
  - El responsable no ha firmado o aceptado
  - Costos no han sido registrados

  Implementar como reglas de negocio en servicio backend, con mensajes de error claros.

  **Parallelization**: YES — Wave 3 de Fase 3

  **Acceptance Criteria**:
  - [ ] Bloqueos funcionales implementados por paso
  - [ ] Mensajes de error con códigos estables
  - [ ] npm run test -w backend → exit 0

---

## TODOs — FASE 4: Mejora de Módulos Críticos

> **OBJETIVO**: Robustecer los módulos que responden a fallas reales detectadas en planeación, ejecución, evidencias, informes, costos y cierre administrativo.
> **ESFUERZO**: 16-20 horas | **RIESGO**: Alto | **PARALELIZACIÓN**: Alta

- [ ] 4.1. Planeación (kits típicos, herramientas, AST, checklist previo)

  **What to do**:
  - Verificar que el módulo de planeación incluya selección de kits típicos por tipo de actividad
  - Implementar/escalar: herramientas, equipos, mano de obra, certificaciones, AST, checklist previo
  - Validar que la planeación esté completa antes de permitir iniciar ejecución

  **Contexto**: El PDF de observaciones menciona "fallas en la planeación: no se tienen herramientas y equipos porque el alcance no se ha detallado a fondo y no se tiene un documento que relacione las herramientas y equipos típicos"

  **Parallelization**: YES — Wave 1 de Fase 4

  **Acceptance Criteria**:
  - [ ] Kits típicos seleccionables por tipo de actividad
  - [ ] Checklist previo completado antes de ejecución
  - [ ] npm run typecheck -w backend → exit 0

- [ ] 4.2. Ejecución en campo (offline-first, captura evidencias, sync)

  **What to do**:
  - Verificar funcionamiento del modo offline (IndexedDB, service worker, sync queue)
  - Asegurar captura de evidencias funcione sin conexión
  - Verificar sync automático al recuperar conectividad
  - Implementar estados visuales de sync (pendiente, sincronizando, error, completado)

  **Regla CERMONT**: Offline-First / Graceful Degradation

  **Parallelization**: YES — Wave 1 de Fase 4

  **Acceptance Criteria**:
  - [ ] Captura de evidencias funciona offline
  - [ ] Sync automático al recuperar conectividad
  - [ ] Indicador visual de estado de sync

- [ ] 4.3. Evidencias (galería robusta, carga múltiple, metadatos, trazabilidad)

  **What to do**:
  - NO eliminar EvidenceGallery.tsx (confirmado como falso positivo)
  - Mejorar galería con carga múltiple, vista previa, metadatos (fecha, usuario, ubicación)
  - Relacionar evidencias con orden, paso y componente específico
  - Implementar reemplazo controlado de evidencias rechazadas

  **Parallelization**: YES — Wave 2 de Fase 4 (después de 4.2)

  **Acceptance Criteria**:
  - [ ] Galería con carga múltiple y metadatos
  - [ ] Reemplazo de evidencias rechazadas funcional
  - [ ] npm run test -w frontend → exit 0

- [ ] 4.4. Informes y actas (generación documental, validación pre-cierre)

  **What to do**:
  - Verificar generación de PDFs (informes técnicos, actas de entrega)
  - Implementar validación: no permitir generar informe si faltan evidencias
  - Asociar documentos al paso correspondiente del flujo

  **Contexto**: El PDF menciona "fallas en la elaboración de actas e informes finales a tiempo"

  **Parallelization**: YES — Wave 2 de Fase 4

  **Acceptance Criteria**:
  - [ ] Generación de informes validada
  - [ ] Documentos asociados al paso correcto

- [ ] 4.5. SES, factura y pago (seguimiento, fechas, aprobación, bloqueo)

  **What to do**:
  - Verificar flujo SES → Factura → Pago con fechas y soportes
  - Implementar bloqueo de cierre definitivo hasta pago registrado
  - Validar que factura coincida con SES aprobada (referencias, valores, ítems)

  **Contexto**: El PDF menciona "fallas en la facturación oportuna... retrasos considerables cuando hay múltiples trabajos"

  **Parallelization**: YES — Wave 2 de Fase 4

  **Acceptance Criteria**:
  - [ ] Factura bloqueada hasta SES aprobada
  - [ ] Cierre bloqueado hasta pago registrado
  - [ ] npm run test -w backend → exit 0

- [ ] 4.6. Costos (estimado vs real, materiales, mano de obra, desviaciones)

  **What to do**:
  - Verificar módulo de costos: costo estimado (propuesta) vs costo real (ejecución)
  - Implementar desglose por materiales, mano de obra, impuestos
  - Calcular desviaciones e indicadores por orden

  **Contexto**: El PDF menciona "fallas en saber costos reales de la operación... no existe hoja de cálculo que relacione costos de realizar una actividad versus lo estimado"

  **Parallelization**: YES — Wave 3 de Fase 4

  **Acceptance Criteria**:
  - [ ] Costo estimado vs real implementado
  - [ ] Desviaciones calculadas por orden
  - [ ] npm run test -w backend → exit 0

---

## TODOs — FASE 5: Escalamiento e Innovación Controlada

> **OBJETIVO**: Implementar mejoras de escalabilidad e innovación solo si pasan por contratos, pruebas y documentación.
> **ESFUERZO**: 16-20 horas | **RIESGO**: Medio | **PARALELIZACIÓN**: Alta

- [ ] 5.1. Dashboard KPI (órdenes por estado, tiempos, cuellos de botella)

  **What to do**:
  - Implementar/escalar dashboard con KPIs:
    - Órdenes por estado
    - Tiempo promedio por etapa del flujo
    - Cuellos de botella (pasos con mayor retraso)
    - Cumplimiento documental (% de órdenes con documentos completos)
    - Facturación pendiente (valor total)
    - Costos reales vs estimados
    - Alertas de retraso (órdenes fuera de SLA)

  **Nota**: `KpiWidgetGrid.tsx` y `useDashboardKpis.ts` fueron eliminados en Fase 1. Si se necesitan, recrearlos desde cero con contract-first.

  **Parallelization**: YES — Wave 1 de Fase 5

  **Acceptance Criteria**:
  - [ ] Dashboard con KPIs funcionales
  - [ ] Datos en tiempo real desde backend
  - [ ] npm run test -w frontend → exit 0

- [ ] 5.2. Notificaciones (cambio estado, evidencia pendiente, SES, factura, pago)

  **What to do**:
  - Implementar sistema de notificaciones para:
    - Nueva orden asignada
    - Cambio de estado del flujo
    - Evidencia pendiente de revisión
    - SES pendiente de aprobación
    - Factura pendiente
    - Pago registrado

  **Parallelization**: YES — Wave 1 de Fase 5

  **Acceptance Criteria**:
  - [ ] Notificaciones generadas en backend
  - [ ] Visualizadas en frontend

- [ ] 5.3. Formularios dinámicos (plantillas, checklists, versionado)

  **What to do**:
  - Implementar plantillas configurables para checklists por tipo de servicio
  - Validaciones con Zod
  - Versionado de formularios (no romper formularios existentes)

  **Parallelization**: YES — Wave 2 de Fase 5

  **Acceptance Criteria**:
  - [ ] Formularios dinámicos funcionales
  - [ ] Versionado implementado
  - [ ] npm run contracts:check → exit 0

- [ ] 5.4. Archivado histórico (mover a histórico, exportar, mantener auditoría)

  **What to do**:
  - Implementar archivado automático mensual (órdenes completadas + facturadas > 30 días)
  - Mover a base de datos histórica (separada de operativa)
  - Exportar CSV, PDF o ZIP
  - Mantener auditoría de archivado

  **Contexto**: Observaciones del anteproyecto mencionan archivado como requisito crítico para rendimiento del VPS

  **Parallelization**: YES — Wave 2 de Fase 5

  **Acceptance Criteria**:
  - [ ] Archivado automático funcional
  - [ ] Exportación de históricos
  - [ ] npm run test -w backend → exit 0

- [ ] 5.5. Observabilidad (requestId, logs seguros, errores tipados)

  **What to do**:
  - Verificar requestId en todas las respuestas del backend
  - Logs estructurados JSON sin secretos
  - Errores tipados con códigos estables
  - Health checks separados (live / ready)
  - Redacción de datos sensibles en logs

  **Regla CERMONT**: Observability by Design

  **Parallelization**: YES — Wave 2 de Fase 5

  **Acceptance Criteria**:
  - [ ] requestId en todas las respuestas
  - [ ] Logs sin secretos
  - [ ] Health checks funcionales

- [ ] 5.6. Performance (lazy loading, paginación, imágenes optimizadas)

  **What to do**:
  - Lazy loading en módulos pesados
  - Tablas paginadas o virtualizadas
  - Imágenes optimizadas (sizes, WebP, lazy loading nativo)
  - Evitar renders innecesarios
  - No guardar server state en Zustand
  - No providers globales innecesarios

  **Parallelization**: YES — Wave 3 de Fase 5

  **Acceptance Criteria**:
  - [ ] Lazy loading implementado en módulos pesados
  - [ ] Tablas paginadas
  - [ ] npx react-doctor@latest --verbose → sin regresiones

---

## TODOs — FASE 6: DevOps, CI/CD y Despliegue

> **OBJETIVO**: Configurar quality gates en CI/CD y validar que el pipeline de despliegue VPS no se rompe.
> **ESFUERZO**: 4-6 horas | **RIESGO**: Bajo | **PARALELIZACIÓN**: Alta

- [ ] 6.1. Verificar quality gates en GitHub Actions

  **What to do**:
  - Revisar workflows existentes en `.github/workflows/`
  - Verificar que ejecuten: npm ci → typecheck → lint → build → test → quality:weak-tokens → quality:zero
  - Si no existen, crear workflow básico de CI

- [ ] 6.2. Scripts de verificación pre-commit

  **What to do**: Verificar que Husky + lint-staged ejecuten los gates antes de cada commit.

- [ ] 6.3. Validar Docker y scripts VPS

  **What to do**: Verificar que Dockerfile y scripts de despliegue VPS no estén rotos. No modificarlos sin validación.

  **Regla CERMONT**: VPS Only Deployment, no romper Docker o scripts de VPS

- [ ] 6.4. Configurar baseline de calidad como gate obligatorio

  **What to do**: Asegurar que `npm run quality:strict` sea parte del pipeline de CI y falle si el baseline se excede sin justificación.

---

## TODOs — FASE 7: Documentación

> **OBJETIVO**: Actualizar documentación como código, crear ADRs para decisiones arquitectónicas clave.
> **ESFUERZO**: 6-8 horas | **RIESGO**: Bajo | **PARALELIZACIÓN**: Alta

- [ ] 7.1. Crear ADRs para decisiones arquitectónicas clave

  **What to do**: Crear archivos en `docs/adr/`:

  ```txt
  docs/adr/ADR-001-quality-remediation.md
  docs/adr/ADR-002-contract-first-service-case-flow.md
  docs/adr/ADR-003-offline-evidence-sync.md
  docs/adr/ADR-004-vps-first-deployment.md
  ```

- [ ] 7.2. Actualizar README, rutas, roles, variables de entorno

  **What to do**: Si cambios en Fases 1-5 modificaron estructura, rutas o roles, actualizar:
  - `docs/architecture/FRONTEND_ROUTE_MAP.md`
  - `docs/architecture/API_ENDPOINT_MATRIX.md`
  - `README.md` (si cambian scripts de instalación)
  - Documentación de variables de entorno

- [ ] 7.3. Documentar flujo offline/sync

  **What to do**: Documentar el flujo offline-first: IndexedDB, service worker, sync queue, resolución de conflictos, DLQ.

- [ ] 7.4. Documentar módulos críticos

  **What to do**: Para cada módulo mejorado en Fase 4, documentar: propósito, entidades, states, endpoints, permisos.

- [ ] 7.5. Documentar despliegue VPS

  **What to do**: Verificar y actualizar documentación de despliegue VPS: requisitos, variables de entorno, Docker, scripts, health checks.

---

## Final Verification Wave (Consolidado)

> **OBJETIVO**: Ejecutar todos los gates de calidad y presentar resultados consolidados.
> **NOTA**: Ejecutar DESPUÉS de completar cada fase, NO solo al final.

- [ ] V1. **React Doctor en archivos modificados**

  ```bash
  npx react-doctor@latest --verbose --scope changed
  ```
  **Expected**: 0 bugs, 0 warnings en archivos modificados por la fase

- [ ] V2. **Quality gates (weak-tokens + zero)**

  ```bash
  npm run quality:weak-tokens
  npm run quality:zero
  ```
  **Expected**: exit 0, todas las reglas "within baseline"

- [ ] V3. **Typecheck + Lint + Build (frontend + backend)**

  ```bash
  npm run typecheck -w frontend
  npm run lint -w frontend
  npm run build -w frontend
  npm run typecheck -w backend
  npm run lint -w backend
  ```
  **Expected**: exit 0

- [ ] V4. **Tests**

  ```bash
  npm run test
  ```
  **Expected**: exit 0 (sin regresiones)

- [ ] V5. **Checklist de reglas CERMONT**

  ```
  ☐ No se eliminó funcionalidad existente
  ☐ No se duplicaron schemas
  ☐ No se duplicaron roles
  ☐ No se duplicaron rutas
  ☐ No se introdujo any
  ☐ No se introdujo unknown
  ☐ No se introdujo null
  ☐ No se introdujo undefined
  ☐ No hay console.log en producción
  ☐ No hay errores de typecheck
  ☐ No hay errores de lint
  ☐ Build exitoso
  ☐ Tests relevantes ejecutados
  ☐ Estados loading/error/empty/offline cubiertos
  ☐ RBAC validado
  ☐ Documentación actualizada
  ☐ Sin issues nuevos de Qodana
  ```

- [ ] V6. **Resumen ejecutivo + próximos pasos**

  **Output**: Archivo `.sisyphus/evidence/completion-report.md` con:
  1. Resumen ejecutivo de cambios por fase
  2. Archivos modificados/creados/eliminados
  3. Problemas encontrados durante la ejecución
  4. Decisiones técnicas tomadas
  5. Riesgos pendientes
  6. Comandos ejecutados y resultados
  7. Evidencias de validación
  8. Próximos pasos recomendados
  9. Confirmación de cumplimiento de reglas CERMONT

---

## Commit Strategy

| Commits | Mensaje | Alcance |
|---------|---------|---------|
| **1** | `fix(quality): resolve react-doctor issues and weak token baseline` | Fase 1 (tasks 1.1-1.7) |
| **2** | `refactor(ssot): centralize contracts, roles, query keys, states` | Fase 2 (tasks 2.1-2.6) |
| **3** | `feat(flow): implement 14-step operational flow with traceability` | Fase 3 (tasks 3.1-3.6) |
| **4** | `feat(modules): improve planning, execution, evidence, costs` | Fase 4 (tasks 4.1-4.6) |
| **5** | `feat(dashboard): KPI, notifications, archiving, observability, perf` | Fase 5 (tasks 5.1-5.6) |
| **6** | `ci(quality): configure quality gates and deployment validation` | Fase 6 (tasks 6.1-6.4) |
| **7** | `docs: ADRs, module docs, flow documentation` | Fase 7 (tasks 7.1-7.5) |

---

## Success Criteria

### Verification Commands
```bash
npx react-doctor@latest --verbose --scope changed  # 0 issues in changed files
npm run quality:weak-tokens                          # exit 0, all within baseline
npm run quality:zero                                 # exit 0
npm run typecheck -w frontend                        # exit 0
npm run lint -w frontend                             # exit 0
npm run build -w frontend                            # exit 0
npm run typecheck -w backend                         # exit 0
npm run lint -w backend                              # exit 0
npm run test                                         # exit 0
```

### Final Checklist
- [ ] Fase 1: React Doctor clean + weak tokens within baseline
- [ ] Fase 2: SSOT auditado (contratos, roles, query keys, estados)
- [ ] Fase 3: Flujo 14 pasos con trazabilidad y validaciones
- [ ] Fase 4: Módulos críticos robustecidos
- [ ] Fase 5: Dashboard KPI, notificaciones, archivado, performance
- [ ] Fase 6: Quality gates CI/CD configurados
- [ ] Fase 7: Documentación actualizada + ADRs
- [ ] Todas las reglas CERMONT cumplidas (checklist V5)
- [ ] Reporte final generado en `.sisyphus/evidence/completion-report.md`
