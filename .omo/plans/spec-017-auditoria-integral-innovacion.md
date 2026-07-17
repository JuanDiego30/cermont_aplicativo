# SPEC 017 — Auditoría Integral, Investigación y Plan de Innovación CERMONT

## TL;DR

> **Resumen**: Ejecutar una auditoría real del código CERMONT (no documentación), consolidar requisitos de negocio desde 11 documentos fuente, investigar 9+ plataformas FSM/CMMS externas, generar matriz de madurez actualizada y roadmap de innovación P0-P3. Producir 7 entregables en `specs/017-auditoria-integral-innovacion/`.
>
> **NO** modificar código de producción. Solo archivos de análisis.
>
> **Entregables**:
> - `real-state-audit.md` — Auditoría real de código con gates
> - `business-requirements-consolidated.md` — Requisitos de negocio consolidados
> - `external-research-benchmark.md` — Benchmark FSM/CMMS
> - `module-maturity-matrix-v2.md` — Madurez de módulos
> - `innovation-roadmap.md` — Roadmap priorizado
> - `missing-documentation-log.md` — Docs faltantes
> - `executive-summary.md` — Resumen ejecutivo

---

## Context

### Original Request
Auditar, investigar y producir plan de innovación para CERMONT S.A.S. — plataforma document-driven para contratistas multiservicio con flujo de 14 pasos. Determinar brecha entre documentación y código real, comparar contra software profesional FSM/CMMS, y producir roadmap priorizado.

### What We Already Did (Phase 1 — 90% complete)
- ✅ **56 módulos backend** inventariados con estructura verificada
- ✅ **68 archivos de routes**, **456 endpoints** contados
- ✅ **131 page.tsx** (95 rutas únicas en build)
- ✅ **Estructura por módulo**: routes/controller/service/model/tests verificada
- ✅ **Gates ejecutados**: typecheck ✅, lint ✅, build ✅, tests ❌ (2 frontend), quality:strict ✅
- ✅ **Deuda técnica**: 0 `:any`, 17 `console.log`, TODO/FIXME en 40+ archivos
- ✅ **Specs leídos**: spec-008, spec-010, spec-013 (parcial)
- ✅ **Arquitectura leída**: CODEBASE_MAP, FRONTEND_ROUTE_MAP, README
- ✅ **Investigación externa parcial**: Cryotos CMMS, MaintainX, Limble

### What Remains
- ⬜ Leer documentos fuente de negocio: LTG (restante), 01_main10 a 10_*
- ⬜ Leer specs restantes: spec-014, 015, 016
- ⬜ Leer mapas arquitectura: API_ENDPOINT_MATRIX, DOMAIN_MODULE_MAP, RBAC_PERMISSION_MAP, MEDIA_EVIDENCE_FLOW, PWA_OFFLINE_FLOW, KNOWN_ISSUES, TECH_DEBT, API_STATUS, DEV_STATUS
- ⬜ Investigación externa completa (más plataformas, repos GitHub, tendencias)
- ⬜ Generar 7 entregables
- ⬜ Reporte final en chat

---

## Work Objectives

### Core Objective
Producir diagnóstico verificado de brecha código vs documentación + investigación externa + plan de innovación priorizado.

### Concrete Deliverables (7 archivos)
1. `specs/017-auditoria-integral-innovacion/real-state-audit.md`
2. `specs/017-auditoria-integral-innovacion/business-requirements-consolidated.md`
3. `specs/017-auditoria-integral-innovacion/external-research-benchmark.md`
4. `specs/017-auditoria-integral-innovacion/module-maturity-matrix-v2.md`
5. `specs/017-auditoria-integral-innovacion/innovation-roadmap.md`
6. `specs/017-auditoria-integral-innovacion/missing-documentation-log.md`
7. `specs/017-auditoria-integral-innovacion/executive-summary.md`

### Definition of Done
- [ ] Todos los entregables existen con contenido verificado
- [ ] Cada afirmación respaldada por evidencia de código real o fuente web
- [ ] Roadmap P0-P3 priorizado con justificación (brecha + requisito + referencia externa)
- [ ] Reporte final presentado en chat con top hallazgos

### Must Have
- Datos de gates verificados (no inventados)
- Referencias externas reales (no supuestas)
- Brechas documentación-código listadas con severidad
- Roadmap reconciliado contra specs anteriores (sin duplicar)

### Must NOT Have
- Modificaciones a código de producción
- Métricas inventadas
- Tecnologías incompatibles con stack actual (Express 5, Mongoose, Next.js 16, React 19, Zod 4.x)

---

## Verification Strategy

### Test Decision
- **Infrastructure exists**: NO test infrastructure needed (analysis-only)
- **Automated tests**: None (document generation only)
- **Agent-Executed QA**: Each task verifies file exists, content has required sections, evidence matches

### QA Policy
Every task: verify file exists + contains required sections + data is backed by real evidence.

---

## Execution Strategy

### Parallel Waves
```
Wave 1 (Fase 1-2: Lectura de fuentes):
├── T1: Leer documentos fuente de negocio (LTG, 01-10)
├── T2: Leer specs históricos restantes (014, 015, 016)
├── T3: Leer mapas de arquitectura restantes
└── T4: Ejecutar react-doctor

Wave 2 (Fase 3: Investigación externa + Fase 4-5):
├── T5: Investigar software FSM/CMMS restante (websearch)
├── T6: Investigar repos GitHub de referencia (websearch)
├── T7: Investigar tendencias innovación 2026
└── T8: Sintetizar hallazgos

Wave 3 (Generación de entregables):
├── T9: Escribir real-state-audit.md
├── T10: Escribir business-requirements-consolidated.md
├── T11: Escribir external-research-benchmark.md
├── T12: Escribir module-maturity-matrix-v2.md
├── T13: Escribir innovation-roadmap.md
├── T14: Escribir missing-documentation-log.md
└── T15: Escribir executive-summary.md

Wave FINAL:
├── T16: Reporte final en chat
└── T17: Presentar resultados
```

---

## TODOs

- [ ] 1. **Leer documentos fuente de negocio**

  **What to do**:
  - Leer LTG_JUAN_DIEGO_AREVALO-3_markdown.md (restante, ~4800 líneas — leer secciones clave)
  - Leer 01_main10.md, 02_INDUCCION_SGSST3.md, 03_Jerarquia_de_controles_Cermont2.md
  - Leer 04_ATG_JUAN_DIEGO_AREVALO-13.md, 05_FOTOS_ANCLAJE_ESCALERA_A_ESTRUCTURA3.md
  - Leer 06_FORMATO_DE_PLANEACION_DE_OBRA3.md, 07_DESARROLLO_DE_UN_APLICATIVO_WEB_...
  - Leer 08_Formato_Inspeccion_lineas_de_vida_Vertical3.md, 09_Observaciones_Anteproyecto_Juan_Diego2.md, 10_Formato_Mantenimiento_CCTV3.md
  - Extraer: flujo 14 pasos, 5 fallas críticas, formatos operativos, requisitos HSE/SGSST

  **Parallelization**: YES — Wave 1, Blocks: T10
  **Blocked By**: None

- [ ] 2. **Leer specs históricos restantes**

  **What to do**:
  - Leer spec-013-plan-maestro.md (restante, ~1400 líneas)
  - Leer spec-014-frontend-profesionalizacion-cierre-ciclo.md
  - Leer spec-014-completion.md
  - Leer spec-015-auditoria-cierre-brechas.md
  - Leer spec-016-audit-integral-plan-continuidad.md
  - Leer spec-016-implementacion-directa.md, spec-016-updated-implementation-plan.md, spec-016-ejecucion-final.md
  - Extraer: qué se implementó, qué gaps persisten, qué no repetir

  **Parallelization**: YES — Wave 1, Blocks: T13
  **Blocked By**: None

- [ ] 3. **Leer mapas de arquitectura restantes**

  **What to do**:
  - Leer docs/architecture/API_ENDPOINT_MATRIX.md
  - Leer docs/architecture/DOMAIN_MODULE_MAP.md
  - Leer docs/architecture/RBAC_PERMISSION_MAP.md
  - Leer docs/architecture/MEDIA_EVIDENCE_FLOW_MAP.md
  - Leer docs/architecture/PWA_OFFLINE_FLOW_MAP.md
  - Leer docs/KNOWN_ISSUES.md, docs/TECHNICAL_DEBT.md, docs/API_STATUS.md, docs/DEVELOPMENT_STATUS.md
  - Comparar contra inventario real de Fase 1

  **Parallelization**: YES — Wave 1, Blocks: T9, T12, T14
  **Blocked By**: None

- [ ] 4. **Ejecutar react-doctor**

  **What to do**: `npx react-doctor@latest` y registrar resultado

  **Parallelization**: YES — Wave 1
  **Blocked By**: None

- [ ] 5. **Investigar software FSM/CMMS restante**

  **What to do**: Websearch_exa para:
  - Salesforce Field Service, ServiceNow FSM
  - IBM Maximo / ServiceMax
  - Fiix, eMaint, Maintenance Connection
  - UpKeep, Quickbase

  **Parallelization**: YES — Wave 2
  **Blocked By**: None

- [ ] 6. **Investigar repos GitHub de referencia**

  **What to do**: Websearch_exa para:
  - CMMS/EAM open source
  - Scheduling/dispatch drag-and-drop React
  - Digital signature capture
  - QR/NFC scanning PWA
  - Dashboards Recharts/Tremor/TanStack Table
  - PWA offline-first Serwist/Workbox
  - Rule engines TypeScript

  **Parallelization**: YES — Wave 2
  **Blocked By**: None

- [ ] 7. **Investigar tendencias innovación FSM/GMAO 2026**

  **What to do**: Websearch_exa para:
  - IA agentic work orders por voz/foto
  - Motores automatización SI-ENTONCES
  - Gemelo digital operativo
  - Optimización rutas/scheduling
  - Analítica predictiva mantenimiento
  - Multi-tenancy SaaS

  **Parallelization**: YES — Wave 2
  **Blocked By**: None

- [ ] 8. **Sintetizar hallazgos de investigación**

  **Parallelization**: YES — Wave 2
  **Blocked By**: T5, T6, T7

- [ ] 9. **Escribir real-state-audit.md**

  **What to do**: Usar datos de Fase 1 ya recolectados:
  - Tabla 56 módulos con estado verificado
  - Tabla rutas frontend vs documentadas
  - Discrepancias documentación vs código
  - Resultado 6 gates con evidencia
  - Deuda técnica cuantificada
  - Hallazgos críticos

  **Parallelization**: YES — Wave 3
  **Blocked By**: T3 (validación de mapas)

- [ ] 10. **Escribir business-requirements-consolidated.md**

  **What to do**: A partir de documentos fuente leídos en T1:
  - Flujo 14 pasos consolidado
  - 5 fallas críticas del negocio
  - Formatos operativos y su digitalización
  - Brechas HSE/SGSST
  - Tabla Formato/Proceso/Digitalizado/Módulo/Brecha

  **Parallelization**: YES — Wave 3
  **Blocked By**: T1

- [ ] 11. **Escribir external-research-benchmark.md**

  **What to do**: Consolidar investigación externa:
  - Tabla comparativa: Plataforma/Repo | Fortaleza clave | Patrón aplicable | Módulo beneficiado | Esfuerzo | Fuente
  - Mínimo 9 plataformas FSM/CMMS
  - Mínimo 7 repos GitHub
  - Tendencias innovación 2026

  **Parallelization**: YES — Wave 3
  **Blocked By**: T8

- [ ] 12. **Escribir module-maturity-matrix-v2.md**

  **What to do**: Para cada módulo (usar inventario real):
  - Nivel actual 0-5 con evidencia
  - Nivel objetivo con referencia externa
  - Brecha y prioridad

  **Parallelization**: YES — Wave 3
  **Blocked By**: T2, T3

- [ ] 13. **Escribir innovation-roadmap.md**

  **What to do**: Iniciativas P0-P3 justificadas por:
  - Brecha real (Fase 1)
  - Requisito de negocio (Fase 2)
  - Referencia externa (Fase 3)
  - Madurez actual vs objetivo (Fase 4)
  - No repetir roadmaps de Spec-010/012/013/016

  **Parallelization**: YES — Wave 3
  **Blocked By**: T9, T10, T11, T12

- [ ] 14. **Escribir missing-documentation-log.md**

  **What to do**: Listar toda documentación faltante detectada

  **Parallelization**: YES — Wave 3
  **Blocked By**: T3

- [ ] 15. **Escribir executive-summary.md**

  **What to do**: Resumen ejecutivo de 2-3 páginas con top hallazgos

  **Parallelization**: YES — Wave 3
  **Blocked By**: T13

- [ ] 16. **Reporte final en chat**

  **What to do**: Presentar en chat:
  1. Resumen ejecutivo (5-8 líneas)
  2. Top 5 discrepancias doc vs código
  3. Top 5 hallazgos investigación externa
  4. Top 10 iniciativas priorizadas
  5. Deuda técnica cuantificada
  6. Docs faltantes
  7. Recomendación próximo spec

  **Parallelization**: NO — Final
  **Blocked By**: T15

---

## Final Verification

- [ ] Verificar que 7 archivos existen en `specs/017-auditoria-integral-innovacion/`
- [ ] Verificar que cada archivo tiene secciones requeridas
- [ ] Verificar que datos están respaldados por evidencia
- [ ] Presentar reporte final en chat

---

## Commit Strategy

- **1 commit por entregable**: `docs(spec-017): add {deliverable-name}.md`

---

## Success Criteria

- 7 archivos de entregable creados en `specs/017-auditoria-integral-innovacion/`
- Reporte final presentado en chat
- Plan listo para ser convertido en spec de implementación
