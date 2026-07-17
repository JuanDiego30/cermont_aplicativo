# PROMPT DE EJECUCIÓN v2 — PLAN CERMONT v2.0

> **Instrucción**: Este prompt es para EJECUTAR el plan, no para auditar.
> Lee los documentos de referencia ANTES de empezar.
> Sigue las tareas secuencialmente. Corre `npm run verify` después de CADA tarea.

---

## 1. CONTEXTO — ESTADO ACTUAL

**Última verificación**: 2026-07-12 — `npm run verify` ejecutado

### Gates actuales

| Gate | Resultado | Cambio desde auditoría |
|---|---|---|
| typecheck | ✅ PASS | Sin errores |
| lint | ✅ PASS | Sin errores |
| shared-types tests | ✅ 32 files, 184 tests | +1 |
| backend tests | ✅ 102 files, 694 tests | +6 |
| frontend tests | ✅ 94 files, 490 tests | +3 |
| build | ✅ 97 routes | Compilación limpia |
| contracts:check | ✅ Migration 079 | Snapshot ok |
| quality:weak-tokens | ✅ 3027/3028 | Dentro baseline |
| quality:language | ✅ 2841/2850 Spanish tokens | Dentro baseline |
| quality:semantics | ✅ 0 findings | ✅ |
| quality:zero | ✅ 0 violations | ✅ |
| quality:service-size | ✅ **0 findings** | 🎉 FIXED |
| quality:dtos | ✅ 12/45 | ✅ |
| quality:env | ✅ PASS | ✅ |
| quality:hardcoded-roles | ✅ 0 violations | ✅ |
| **React Doctor** | **87/100** (target 90) | ⚠️ +11pts, faltan 3 |

### Progreso desde auditoría

| Métrica | Antes | Ahora | Cambio |
|---|---|---|---|
| React Doctor | 76/100 | **87/100** | 🎉 +11 |
| Backend tests | 688 | **694** | +6 |
| Frontend tests | 487 | **490** | +3 |
| Shared-types tests | 183 | **184** | +1 |
| service-size warnings | 1 | **0** | 🎉 FIXED |
| Contracts migration | 078 | **079** | +1 |

### Issues React Doctor pendientes (8, hay que resolverlos)

**Bugs — 4 issues (alta prioridad):**
1. `FleetCheckoutPanel.tsx:42` — prop vehicleCurrentKm copiada a useState (stale)
2. `FleetCheckinPanel.tsx:42` — mismo patrón
3. `FleetCheckoutPanel.tsx:41` — 5 useState → useReducer
4. `FleetCheckinPanel.tsx:41` — mismo

**Accesibilidad — 2 issues (media):**
5. `DashboardSkeleton.tsx:14` — role="status" → tag `<output>`
6. `ProgressRing.tsx:55` — mismo

**Mantenibilidad — 2 issues (media):**
7. `ProgressRing.tsx` — dead code (archivo no usado)
8. `FleetDetailPageInner` — 379 líneas, componente gigante

---

## 2. LO QUE NO SE DEBE HACER

- ❌ No instalar Redis, BullMQ, OpenTelemetry, Sentry, CDN
- ❌ No usar Vercel AI SDK, OpenAI, Anthropic (todo eso está BORRADO del plan)
- ❌ No implementar Leaflet, @zxing, Socket.io, @dnd-kit
- ❌ No integrar Ariba, DIAN, SAP
- ❌ No MFA/TOTP
- ❌ No modificar package.json sin permiso
- ❌ No `any`, `null`, `undefined`, `@ts-ignore`, `console.log`
- ❌ No mock data en prod, no fetch directo, no lógica en UI, no roles hardcodeados

---

## 3. SPRINT 1 — Fundación y Cierre de Gaps

### Tarea 1.1: Dashboard de costos (20h)
- [ ] GET /api/costs/dashboard endpoint con agregaciones reales
- [ ] UI de dashboard de costos en /costs
- [ ] KPI cards con datos reales
- [ ] npm run verify pasa

### Tarea 1.2: Costos de propuesta (15h)
- [ ] GET /api/proposals/:id/costs endpoint
- [ ] UI de costos desglosados en propuesta
- [ ] Recalcular en backend antes de aprobar
- [ ] npm run verify pasa

### Tarea 1.3: Módulo de activos (30h)
- [ ] CRUD completo con historial y soft delete
- [ ] UI listado + detalle
- [ ] Tests de integración

### Tarea 1.4: Inventario + QR (30h)
- [ ] Página de listado de inventario
- [ ] Página de escaneo QR
- [ ] Tests básicos

### Tarea 1.5: APIs REQUIRED_NOT_IMPLEMENTED (30h)
- [ ] Revisar FRONTEND_ROUTE_MAP vs endpoints reales
- [ ] Completar endpoints faltantes

### Tarea 1.6: Portal de históricos (20h)
- [ ] UI de descarga en admin/backups
- [ ] ZIP export con archiver

### Tarea 1.7: Fleet + Dispatch (25h)
- [ ] Mejorar UI con datos reales
- [ ] Contenido en cards

### Tarea 1.8: CI/CD (15h)
- [ ] Verificar GitHub Actions
- [ ] Verificar pre-commit hook

### Tarea 1.9: Migración pruebas (15h)
- [ ] Verificar tests duplicados o faltantes

---

## 4. SPRINT 2 — Formularios Dinámicos + PDF + Campos

### Tarea 2.1: Formularios dinámicos ajustables ⭐ (50h)
**Archivos**: SectionedFormRenderer.tsx, DynamicFormTemplate, admin/custom-fields
- [ ] Completar DynamicFormTemplateSchema en shared-types
- [ ] Completar SectionedFormRenderer (renderiza campos desde template)
- [ ] UI admin para crear/editar templates
- [ ] Agregar, quitar, reordenar campos
- [ ] Persistencia en MongoDB
- [ ] npm run verify

### Tarea 2.2: PDF printing de formularios ⭐ (40h)
**Archivos**: pdf.service.ts (nuevo), SectionedFormRenderer, PlanningWizard, DeliveryRecords
- [ ] Crear backend/src/modules/pdf/pdf.service.ts
- [ ] POST /api/pdf/generate
- [ ] PDF con: logo CERMONT, título, fecha, campos/valores, firma
- [ ] Botón "📄 Exportar PDF" en formularios dinámicos
- [ ] Botón en Planning Wizard
- [ ] Botón en Delivery Records
- [ ] npm run verify

### Tarea 2.3: Campos faltantes PlanningWizard (35h)
**Referencia**: LTG §1.3.1 (formato real de planeación de obra)
- [ ] Responsable: nombre, cargo, fecha, lugar, unidad de negocio
- [ ] Materiales: lista con cantidad, unidad, observaciones
- [ ] **Herramientas**: herramienta, cantidad, verificada, obs
- [ ] **Equipos**: equipo, serial, calibración vigente, certificado
- [ ] **EPP colectivo**: arnés, eslinga, línea de vida, casco
- [ ] **EPP individual**: casco, guantes, botas, gafas, respirador
- [ ] Personal: nombre, certificación, vigencia
- [ ] AST: número, fecha, aprobado por
- [ ] Documentos: procedimiento, instructivo, check list
- [ ] npm run verify

### Tarea 2.4: Dashboard KPIs (30h)
- [ ] KPIs con datos reales, sin mock
- [ ] Sin WebSocket (usar refetchInterval de TanStack Query)
- [ ] Estados loading/error/empty

### Tarea 2.5: Kit builder (15h)
- [ ] Asociar kits a technicalCategory
- [ ] Precargar kit según tipo de servicio

### Tarea 2.6: Certificaciones (10h)
- [ ] Alertas de vencimiento antes de asignar

### Tarea 2.7: Offline execution (25h)
- [ ] FIFO queue en IndexedDB
- [ ] clientMutationId
- [ ] UI de sync status

---

## 5. SPRINT 3 — Contenido 14 Pasos

### Tarea 3.1: Pasos 1-4 (30h)
- [ ] WorkRequest con technicalCategory
- [ ] SiteVisit con fotos + GPS
- [ ] Proposal con items desglosados
- [ ] PO validado contra proposal

### Tarea 3.2: Paso 5 planeación (40h)
- [ ] Todos los campos del formato real
- [ ] Kits precargados por technicalCategory

### Tarea 3.3: Paso 6 ejecución (35h)
- [ ] Preflight checklist obligatorio
- [ ] Timer con alerta
- [ ] Categorías evidencia: Antes/Durante/Después/Hallazgo
- [ ] Al completar → borrador informe técnico

### Tarea 3.4: Pasos 7-10 (30h)
- [ ] Galería con grid + lightbox
- [ ] Metadatos: GPS, timestamp, técnico, categoría
- [ ] Informe precargado
- [ ] Acta con PDF + firma

### Tarea 3.5: Pasos 11-14 (35h)
- [ ] SES precargado desde delivery record
- [ ] Invoice desde SES
- [ ] Payment con aging
- [ ] Conciliación visual

### Tarea 3.6: Innovaciones (30h)
- [ ] Recordatorios: reminder-worker mejorado
- [ ] PDF autogenerado al completar ejecución
- [ ] Detección hallazgos por keywords
- [ ] Alertas vencimiento certificaciones
- [ ] Conciliación visual
- [ ] Archivado automático mensual (node-cron)
- [ ] Portal descarga ZIP
- [ ] Formularios precargados por technicalCategory

---

## 6. SPRINT 4 — KPIs CERMONT

**Leer**: `PROMPT_MEJORA_KPIS_E_IMPLEMENTACION_DESIGN.md` COMPLETO

### Tarea 4.1: Schemas Zod (40h)
Crear en `packages/shared-types/src/schemas/`:
- [ ] kpi-lifeline.schema.ts — metros, certificaciones, hallazgos, pruebas
- [ ] kpi-hse.schema.ts — días sin accidentes, PTA, ATS, EPP
- [ ] kpi-execution.schema.ts — sesiones, checklists, GPS, sync
- [ ] kpi-cctv.schema.ts — cámaras, pruebas, puntos ciegos
- [ ] kpi-anchors.schema.ts — anclajes, pruebas tracción, certificaciones
- [ ] kpi-cost.schema.ts — rentabilidad, desviación, facturación
- [ ] kpi-dashboard.schema.ts — dashboard unificado
- [ ] Exportar desde index.ts
- [ ] Tests

### Tarea 4.2: Endpoints (50h)
- [ ] GET /api/kpi/lifelines?month=&year=
- [ ] GET /api/kpi/hse?month=&year=
- [ ] GET /api/kpi/execution?month=&year=
- [ ] GET /api/kpi/cctv?month=&year=
- [ ] GET /api/kpi/anchors?month=&year=
- [ ] GET /api/kpi/costs?month=&year=
- [ ] GET /api/kpi/dashboard?month=&year=

**Regla**: Agregaciones sobre datos EXISTENTES (Evidence, Checklist, CostSummary)

### Tarea 4.3: Componentes UI (60h)
- [ ] KpiCard — icon-capsule 40px + label + metric + delta + progress
- [ ] KpiGrid — responsive (1 col móvil, 3-4 desktop)
- [ ] KpiTrend — ▲ mejora / ▼ empeora
- [ ] KpiProgress — barra vs target
- [ ] KpiAlert — warning/danger/info

**Colores**: Azul #2154A6 (lifeline), Azul claro #3A78D8 (CCTV), Navy #0F2C59 (anchors), Verde #4CAF50 (HSE+execution), Ámbar (costs)

### Tarea 4.4: Secciones dashboard (50h)
- [ ] LifelineKpiSection
- [ ] HseKpiSection
- [ ] CctvKpiSection
- [ ] AnchorKpiSection
- [ ] ExecutionKpiSection
- [ ] CostKpiSection
- [ ] Tabs o scroll entre secciones

**KPIs a eliminar**: "Órdenes activas", "Tasa de cierre", "MTTR", "Recursos en uso", "Ingresos del mes"

---

## 7. SPRINT 5 — Admin + React Doctor

### Tarea 5.1: Formularios dinámicos admin (40h)
- [ ] Completar DynamicFormTemplate + SectionedFormRenderer
- [ ] Admin builder UI
- [ ] Validación Zod
- [ ] Preview en vivo

### Tarea 5.2: PDF export (30h)
- [ ] Botón en formularios dinámicos
- [ ] En checklists
- [ ] En actas e informes

### Tarea 5.3: Backups + archivado (35h)
- [ ] Archivado mensual con node-cron
- [ ] Portal descarga ZIP

### Tarea 5.4: Auditoría (20h)
- [ ] Filtros avanzados
- [ ] Exportación
- [ ] Correlación requestId

### Tarea 5.5: Personnel (20h)
- [ ] Dashboard personal
- [ ] Alertas certificaciones

### Tarea 5.6: Settings (15h)
- [ ] Configuración categorizada
- [ ] Validación Zod

### Tarea 5.7: SLA (20h)
- [ ] Monitoreo visual
- [ ] Dashboard SLA (sin predicción IA)

### Tarea 5.8: React Doctor 76→90 (20h) ⚠️
- [ ] Fix 1: FleetCheckoutPanel.tsx:42 — useState(vehicleCurrentKm) → computed
- [ ] Fix 2: FleetCheckinPanel.tsx:42 — mismo
- [ ] Fix 3: FleetCheckoutPanel.tsx:41 — 5 useState → useReducer
- [ ] Fix 4: FleetCheckinPanel.tsx:41 — mismo
- [ ] Fix 5: DashboardSkeleton.tsx:14 — role="status" → <output>
- [ ] Fix 6: ProgressRing.tsx:55 — role="status" → <output>
- [ ] Fix 7: ProgressRing.tsx — eliminar dead code
- [ ] Fix 8: FleetDetailPageInner — dividir 379 líneas
- [ ] Verificar: npx react-doctor@latest --verbose ≥ 90

---

## 8. SPRINT 6 — Diseño v4.0 + Calidad

**Leer**: `DESIGN.md` COMPLETO

### Tarea 6.1: Design tokens (30h)
- [ ] globals.css con --bg-canvas, --bg-surface, --text-primary, etc.
- [ ] Dark mode default
- [ ] Toggle light/dark

### Tarea 6.2: Bottom nav + sidebar (30h)
- [ ] Mobile: bottom nav 5 ítems + FAB
- [ ] Desktop: sidebar 240px
- [ ] Iconos unicolor, label visible

### Tarea 6.3: Cards responsive (20h)
- [ ] Radio 24px mobile, 16px desktop
- [ ] Touch targets ≥ 44px

### Tarea 6.4: Iconografía unicolor (15h)
- [ ] Reemplazar emojis por Lucide React
- [ ] currentColor correcto

### Tarea 6.5: Estados UI (25h)
- [ ] Loading (skeleton)
- [ ] Error (retry button)
- [ ] Empty (icon + CTA)
- [ ] Offline (banner)
- [ ] Forbidden (card)

### Tarea 6.6: E2E tests (30h)
- [ ] Login → dashboard
- [ ] Orden → planeación → ejecución
- [ ] Evidencias → informe → acta
- [ ] SES → invoice → payment

### Tarea 6.7: Migración español→inglés (25h)
- [ ] Variables y funciones a inglés
- [ ] NO traducir UI strings ni rutas API
- [ ] spanish-source-token < 2000

### Tarea 6.8: Documentación (25h)
- [ ] Route map actualizado
- [ ] API matrix actualizada

---

## 9. REGLAS

### Antes de cada tarea
1. Leer la sección del plan
2. Leer docs de referencia
3. Identificar archivos (git diff --stat)

### Después de cada tarea
1. `npm run typecheck && npm run lint && npm run test -w backend && npm run test -w frontend`
2. Si falla → corregir
3. Cada ~3 tareas: `npm run verify` completo
4. Commit semántico

### Formato commit
```
tipo(alcance): descripción

Tipos: feat, fix, refactor, test, docs, chore, perf, a11y, style
```

### Documentos
| Documento | Ruta |
|---|---|
| Plan | `.sisyphus/plans/PLAN_IMPLEMENTACION_CERMONT_v2.0.md` |
| KPIs CERMONT | `PROMPT_MEJORA_KPIS_E_IMPLEMENTACION_DESIGN.md` |
| DESIGN.md | `DESIGN.md` |
| Reglas | `.sisyphus/plans/REGLAS_DESARROLLO_CERMONT.md` |
| Tesis LTG | `.sisyphus/plans/LTG_JUAN_DIEGO_AREVALO-3_markdown.md` |
| Observaciones | `.sisyphus/plans/09_Observaciones_Anteproyecto_Juan_Diego2.md` |

### Verificación final
```bash
npm run verify                           # Todo pasa
npx react-doctor@latest --verbose         # Score ≥ 90
npm run test                              # ≥ 1400 tests
npm run build -w frontend                 # 97+ rutas
npm run quality:strict                    # 10/10 gates, 0 warnings
```

---

**INICIAR**: Sprint 1 → Tarea 1.1
