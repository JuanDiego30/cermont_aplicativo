# PROMPT MAESTRO — SPEC-013: CERMONT Cierre de Brechas Críticas y Escalamiento Profesional
**Versión:** 1.0 — 3 de julio de 2026  
**Repositorio:** https://github.com/JuanDiego30/cermont_aplicativo.git  
**Rama base:** `deploy/vps-clean`  
**Rama de trabajo nueva:** `implement/spec-013-brechas-criticas`

---

## 0. IDENTIDAD DEL AGENTE

Actúa como **Principal Product Architect + Staff Full-Stack Engineer + QA Lead + Security Engineer**, experto en:
- Next.js 16, React 19, TanStack Query, shadcn/ui, Zod 4.x
- Express 5.2.1, NestJS, Mongoose, MongoDB
- Monorepo con 3 workspaces: `backend/`, `frontend/`, `packages/`
- Contract-First development (Zod → Mongoose → Service → Controller → Route → Frontend hook → UI → Tests)
- FSM / GMAO / ERP operativo / PWA offline-first
- RBAC multi-rol, auditabilidad, idempotencia
- Flujo de 14 pasos de empresa contratista multiservicio

---

## 1. REGLA CERO — ANTI-ALUCINACIÓN (OBLIGATORIA, NO NEGOCIABLE)

Antes de escribir una sola línea de código:

**1.1 Leer y verificar físicamente estos archivos:**
```bash
cat packages/shared-types/src/schemas/cost.schema.ts
cat packages/shared-types/src/schemas/dashboard-summary.schema.ts
cat packages/shared-types/src/schemas/execution-session.schema.ts
cat packages/shared-types/src/schemas/kit.schema.ts
cat packages/shared-types/src/schemas/planning-packet.schema.ts
cat packages/shared-types/src/schemas/tool.schema.ts
cat packages/shared-types/src/schemas/evidence.schema.ts
cat packages/shared-types/src/schemas/index.ts
cat packages/domain/src/cost.rules.ts
cat packages/domain/src/planning.rules.ts
cat packages/domain/src/execution.ts
cat packages/domain/src/index.ts
cat backend/src/modules/service-cases/service-cases.controller.ts
cat backend/src/modules/service-cases/service-cases.service.ts
cat backend/src/modules/service-cases/service-cases.routes.ts
cat backend/src/modules/planning-packet/planning-packet.service.ts
cat backend/src/modules/cost/cost.service.ts
cat backend/src/modules/dashboard/dashboard.service.ts
ls backend/src/modules/
ls frontend/src/app/
ls frontend/src/modules/
```

**1.2 Producir tabla de auditoría ANTES de cualquier cambio:**

| Archivo/Endpoint | ¿Existe? | Líneas | Campos/funciones confirmados | Gap vs. Spec-012 |
|---|---|---|---|---|
| cost.schema.ts | ? | ? | ? | ? |
| CostCatalogItemSchema | ? | ? | ? | ? |
| BaselineCostSchema | ? | ? | ? | ? |
| CostIntelligenceSummarySchema | ? | ? | ? | ? |
| DashboardOperationalKPISchema | ? | ? | ? | ? |
| DashboardSLARiskOrderSchema | ? | ? | ? | ? |
| service-case-cockpit.schema.ts | ? | ? | ? | ? |
| KitSafetyRequirementsSchema | ? | ? | ? | ? |
| PreflightChecklistSchema | ? | ? | ? | ? |
| GET /service-cases/:id/cockpit | ? | ? | ? | ? |
| GET /planning-packets/:id/readiness | ? | ? | ? | ? |
| GET /costs/:orderId/intelligence | ? | ? | ? | ? |
| GET /dashboard/operational-kpis | ? | ? | ? | ? |

**1.3 Guardar tabla en:** `specs/013-cierre-brechas-criticas/audit-log.md`

**SOLO después de completar la tabla, proceder con la implementación.**

---

## 2. CONTEXTO DE NEGOCIO (fuente oficial: LTG Juan Diego Arévalo + documento operativo CERMONT SAS)

### 2.1 Empresa
CERMONT S.A.S. es una empresa contratista multiservicio (ingeniería eléctrica, telecomunicaciones, civil, refrigeración, montajes industriales) que presta servicios en el **campo petrolero Caño Limón**, administrado por **Sierracol Energy**, Arauca, Colombia. Opera bajo altos estándares técnicos y usa la plataforma **Ariba** para SES y facturas con su cliente principal.

### 2.2 Tipos de actividad con sus herramientas específicas
El aplicativo debe manejar kits típicos por tipo de actividad, incluyendo:

| Tipo actividad | Herramientas típicas | EPP mínimo | Permisos requeridos |
|---|---|---|---|
| Inspección Líneas de Vida Vertical | Llave torque, calibrador, torquímetro, escalera, cuerda guía | Arnés certificado, casco, gafas, guantes, botas dieléctricas | Trabajo en alturas nivel avanzado |
| Mantenimiento CCTV | Multímetro, comprobador red, alicate ponchador, escalera, etiquetadora | Casco, gafas, guantes, protector auditivo | Permiso trabajo eléctrico frío |
| Instalación eléctrica | Pinzas amperométricas, megóhmetro, taladro, destornilladores, prensaestopas | Guantes dieléctricos, botas dieléctricas, casco, pantalla facial | Permiso trabajo eléctrico, LOTO |
| Mantenimiento preventivo CCTV | Limpiador contactos, soplete aire, paño microfibra, escalera telescópica | Casco, gafas, cinturón seguridad | Permiso trabajo frío |
| Montaje industrial | Equipo soldadura, esmeril, pulidora, tronzadora | Careta soldadura, guantes cuero, botas, peto cuero | Permiso trabajo en caliente |
| Obra civil | Palas, picas, compactador, nivel, plomada | Casco, botas, guantes, chaleco | N/A o permiso excavación |

El formato físico de planeación de obra CERMONT tiene campos obligatorios:
- Responsable | Lugar | Fecha | Unidad de negocio (IT/MNT/SC/GEN/Otros)
- ALCANCE
- MATERIALES (descripción + cantidad)
- HERRAMIENTAS (descripción + cantidad)
- EQUIPOS (descripción + cantidad)
- ELEMENTOS DE SEGURIDAD (descripción + cantidad)
- NÚMERO DE TRABAJADORES: Electricistas | Técnicos telecomunicación | Instrumentistas | Obreros | Ing. Residente | Técnico Electricista | HES

### 2.3 Los 14 pasos operativos (flujo CERMONT — no inventar variaciones)

| Paso | Entidad digital | Descripción |
|---|---|---|
| 1 | WorkRequest | Solicitud formal del cliente (correo/teléfono) |
| 2 | SiteVisit | Visita técnica: mediciones, fotos, aclaración dudas |
| 3 | Proposal | Propuesta económica con alcance, recursos, condiciones |
| 4 | PurchaseOrder | Aprobación con número PO del cliente |
| 5 | PlanningPacket | Planeación: cronograma + mano obra + herramientas/equipos + certificaciones + AST + docs de apoyo |
| 6 | ExecutionSession | Ejecución: permiso trabajo, AST, checklist equipos, registro fotográfico |
| 7 | TechnicalReport | Informe con actividades ejecutadas y evidencias fotográficas |
| 8 | DeliveryRecord | Acta de entrega final — envío al cliente para firma |
| 9 | ClientAcceptance | Recibo de acta firmada del cliente |
| 10 | ServiceEntrySheet | Elaboración SES en plataforma Ariba — envío para aprobación |
| 11 | SESApproval | Recibo de SES aprobada |
| 12 | InvoiceTracking | Elaboración factura — envío por Ariba para aprobación |
| 13 | InvoiceApproval | Recibo de aprobación de factura en Ariba |
| 14 | PaymentRecord | Pago de factura y registro de conciliación |

### 2.4 Las 5 fallas críticas (fuente: documento operativo oficial — texto exacto)

**FALLA 1 — Planeación (Paso 5):**
> "En el momento de ejecutar la actividad no se tienen todas las herramientas y equipos que se necesitan porque el alcance no se ha detallado a fondo y no se tiene un documento que relacione las herramientas y equipos típicos que se requieren para la actividad"

**FALLA 2 — Ejecución (Paso 6):**
> "Al momento de ejecutar la actividad no se tienen las herramientas y equipos completos por olvido de las personas encargadas o por desconocimiento de que se requieren. El aplicativo debe tener un listado típico de herramientas y equipos requeridos para ejecutar las actividades que realiza la empresa."

**FALLA 3 — Informes y actas (Pasos 7-9):**
> "Se presentan fallas en la elaboración de actas e informes finales a tiempo, por la dinámica de las actividades realizadas en ocasiones hay retrasos considerables en la elaboración de informes y actas finales de las actividades."

**FALLA 4 — Facturación oportuna (Pasos 10-14):**
> "Se presentan fallas en la facturación oportuna de las actividades realizadas, en ocasiones hay retrasos considerables en la facturación de las actividades cuando hay múltiples trabajos."

**FALLA 5 — Costos reales (Transversal pasos 3-14):**
> "Se presentan fallas en saber costos reales de la operación en el momento en que se ejecuta una actividad, no existe hoja de cálculo que relacione de forma centralizada los costos de realizar una actividad (incluyendo impuestos) versus lo estimado en la propuesta económica inicial."

---

## 3. GUARDRAILS ABSOLUTOS (de REGLAS_DESARROLLO_CERMONT.md — NO VIOLAR)

1. **No trabajar en `main` ni en `deploy/vps-clean`** — siempre en rama nueva `implement/spec-013-brechas-criticas`
2. **No eliminar campos existentes de schemas** — solo agregar. Todo campo nuevo: `.optional()` o `.default()` para no romper los 1013+ tests baseline
3. **`FileAsset` es el SSOT** para archivos, evidencias y adjuntos — no crear `MediaAsset` ni esquemas duplicados
4. **Contract-First estricto:**
   ```
   Zod schema → tipo inferido → modelo Mongoose → service → controller → route →
   frontend api service → query keys → hook TanStack Query → UI → tests → docs
   ```
5. **Prohibido `any`, `unknown`, `null`, `undefined` explícitos** nuevos
6. **No hardcodear roles** en frontend — usar JWT claims + RBAC del domain (`packages/domain/src/roles.ts`)
7. **No `try/catch` en controllers de Express 5** — Express 5 propaga errores automáticamente
8. **No `fetch` directo en componentes React** — usar `apiClient` + TanStack Query hooks
9. **Toda página crítica nueva** debe tener: loading / error / empty / offline / forbidden states
10. **Toda acción crítica** (aprobar, cerrar fase, rechazar evidencia, congelar baseline) debe auditarse
11. **No modificar `package.json`** sin justificación explícita y consulta
12. **Gates de salida de cada sprint** — no avanzar si falla alguno:
    ```bash
    npm run typecheck && npm run lint && npm test && npm run build && npm run contracts:check
    ```
13. **No declarar "implementado"** sin: schema + endpoint + componente frontend + test + evidencia de curl/Playwright
14. **Nombres en inglés** para código interno. Español solo en texto visible al usuario
15. **Móvil primero** — todos los componentes deben funcionar en pantalla de 375px con touch targets ≥ 44px

---

## 4. SETUP INICIAL

```bash
# Clonar o actualizar
git clone https://github.com/JuanDiego30/cermont_aplicativo.git
cd cermont_aplicativo

# O si ya existe:
git fetch origin
git checkout deploy/vps-clean
git pull origin deploy/vps-clean

# Crear rama de trabajo
git checkout -b implement/spec-013-brechas-criticas

# Verificar baseline antes de tocar nada
npm run typecheck 2>&1 | tee specs/013-cierre-brechas-criticas/baseline-typecheck.txt
npm run lint 2>&1 | tee specs/013-cierre-brechas-criticas/baseline-lint.txt
npm test 2>&1 | tee specs/013-cierre-brechas-criticas/baseline-tests.txt
npm run build 2>&1 | tee specs/013-cierre-brechas-criticas/baseline-build.txt
npm run contracts:check 2>&1 | tee specs/013-cierre-brechas-criticas/baseline-contracts.txt

# Crear estructura de la spec
mkdir -p specs/013-cierre-brechas-criticas/{slices,contracts,.sisyphus/evidence}
```

**Registrar en `specs/013-cierre-brechas-criticas/audit-log.md` el resultado de cada gate.**

---

## 5. SPRINT 1 — SSOT ENRICHMENT (packages solamente, no tocar backend/frontend)

**Rama:** `implement/spec-013-brechas-criticas` (misma rama)  
**Objetivo:** Enriquecer contratos Zod sin romper tests existentes  
**Gate de salida:** `npm run typecheck && npm test && npm run contracts:check` → PASS

### S1.0 — Verificación previa (leer archivos antes de modificar)

```bash
# OBLIGATORIO: leer cada archivo antes de editar
cat packages/shared-types/src/schemas/cost.schema.ts | head -200
cat packages/shared-types/src/schemas/kit.schema.ts | head -200
cat packages/shared-types/src/schemas/execution-session.schema.ts | head -200
cat packages/shared-types/src/schemas/evidence.schema.ts | head -200
cat packages/shared-types/src/schemas/dashboard-summary.schema.ts | head -200
cat packages/shared-types/src/schemas/index.ts
grep -n "export" packages/shared-types/src/schemas/cost.schema.ts
grep -n "CostCatalogItemSchema\|BaselineCostSchema\|CostIntelligence" packages/shared-types/src/schemas/cost.schema.ts
grep -n "KitSafetyRequirements\|isBillable\|unitCostCOP" packages/shared-types/src/schemas/kit.schema.ts
grep -n "PreflightChecklist\|FieldNovelty\|slaDeadline" packages/shared-types/src/schemas/execution-session.schema.ts
grep -n "DashboardOperationalKPI\|DashboardSLARisk" packages/shared-types/src/schemas/dashboard-summary.schema.ts
grep -n "service-case-cockpit" packages/shared-types/src/schemas/index.ts
```

### S1.1 — Enriquecer `packages/shared-types/src/schemas/cost.schema.ts`

**Solo agregar — NUNCA modificar campos existentes.**

Agregar al final del archivo (después de los exports existentes):

```typescript
// ─── S1.1 SPEC-013: Cost Catalog ─────────────────────────────────────────────
export const CostCatalogItemSchema = z.object({
  id: ObjectIdSchema.optional(),
  code: z.string().min(1).max(40),
  name: z.string().min(1).max(200),
  category: CostCategorySchema,         // reutilizar enum existente
  unitCostCOP: z.number().nonnegative(),
  unit: z.string().min(1).max(50),      // "hora", "m2", "unidad", "kg", "viaje", "día"
  isBillable: z.boolean().default(true),
  isActive: z.boolean().default(true),
  description: z.string().max(500).optional(),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
}).strict();
export type CostCatalogItem = z.infer<typeof CostCatalogItemSchema>;

// ─── S1.1 SPEC-013: Baseline Cost (congelado al aprobar propuesta) ────────────
export const BaselineCostSchema = z.object({
  proposalId: ObjectIdSchema,
  proposalCode: z.string().min(1).max(40),
  frozenAt: z.string().datetime(),           // INMUTABLE desde aprobación de propuesta
  totalEstimatedCOP: z.number().nonnegative(),
  totalTaxCOP: z.number().nonnegative().default(0),  // Impuestos explícitos (req. FALLA 5)
  byCategory: z.array(CostByCategorySchema), // reutilizar tipo existente
}).strict();
export type BaselineCost = z.infer<typeof BaselineCostSchema>;

// ─── S1.1 SPEC-013: Cost Intelligence Summary ────────────────────────────────
export const CostIntelligenceSummarySchema = z.object({
  orderId: z.string(),
  orderCode: z.string(),
  baselineCost: BaselineCostSchema.optional(),
  totalEstimated: z.number().nonnegative(),
  totalActual: z.number().nonnegative(),
  totalTaxCOP: z.number().nonnegative().default(0),
  totalMargin: z.number(),
  marginPercent: z.number(),
  budgetConsumedPercent: z.number().nonnegative(),
  isAtRisk: z.boolean(),       // true si budgetConsumedPercent > 80
  isCritical: z.boolean(),     // true si budgetConsumedPercent > 100
  deviationByCategory: z.array(CostByCategorySchema),
  lastUpdatedAt: z.string().datetime(),
}).strict();
export type CostIntelligenceSummary = z.infer<typeof CostIntelligenceSummarySchema>;

// ─── S1.1 Extender CostSummarySchema existente (campos opcionales al final) ──
// IMPORTANTE: Solo agregar si CostSummarySchema NO tiene ya estos campos
// Verificar antes con: grep -n "baselineCost\|marginPercent\|isAtRisk" packages/shared-types/src/schemas/cost.schema.ts
// Si no existen, agregar al CostSummarySchema usando .extend() en un nuevo export:
export const CostSummaryEnrichedSchema = CostSummarySchema.extend({
  baselineCost: BaselineCostSchema.optional(),
  totalMarginCOP: z.number().optional(),
  marginPercent: z.number().optional(),
  budgetConsumedPercent: z.number().min(0).optional(),
  isAtRisk: z.boolean().optional(),
  isCritical: z.boolean().optional(),
});
export type CostSummaryEnriched = z.infer<typeof CostSummaryEnrichedSchema>;
```

**QA S1.1:**
```bash
npm run typecheck -w @cermont/shared-types
npm test -w @cermont/shared-types
# Guardar evidencia:
npm run typecheck -w @cermont/shared-types > .sisyphus/evidence/s1-1-cost-typecheck.txt 2>&1
```

**Commit:** `feat(schemas): enrich cost with catalog, baseline, and intelligence summary`

---

### S1.2 — Enriquecer `packages/shared-types/src/schemas/kit.schema.ts`

**Verificar primero:**
```bash
grep -n "isBillable\|unitCostCOP\|catalogItemId\|KitSafetyRequirements\|returnRequired" packages/shared-types/src/schemas/kit.schema.ts
```

Si no existen, agregar en `KitItemSchema` (`.extend()` si ya está exportado):

```typescript
// ─── S1.2 SPEC-013: Kit Item campos adicionales (FALLA 1 y 2 del LTG) ───────
// Solo agregar si NO existen ya en KitItemSchema
// Estos campos resuelven las FALLAS 1 y 2: listado típico de herramientas por actividad

// Extender KitItemSchema existente con campos nuevos opcionales:
export const KitItemEnrichedSchema = KitItemSchema.extend({
  isBillable: z.boolean().default(false),       // solo aplica a materials
  unitCostCOP: z.number().nonnegative().optional(), // precio de referencia en COP
  catalogItemId: z.string().optional(),          // vínculo al catálogo global de costos
  returnRequired: z.boolean().default(true),     // aplica a tools/equipment
  maintenanceIntervalDays: z.number().int().positive().optional(), // cuándo requiere calibración
  lastCalibrationDate: z.string().datetime().optional(),
  certificationRequired: z.boolean().default(false),
});
export type KitItemEnriched = z.infer<typeof KitItemEnrichedSchema>;

// ─── S1.2 SPEC-013: Safety Requirements del Kit (EPP, AST, PTW) ─────────────
// Resuelve FALLA 1: verificación de certificaciones y documentación de apoyo (paso 5.4-5.6)
export const KitSafetyRequirementsSchema = z.object({
  eppList: z.array(z.string().min(1).max(100)).default([]),
  // Ejemplos: "casco", "arnés certificado", "gafas de seguridad", "guantes dieléctricos",
  //           "botas dieléctricas", "careta de soldadura", "protector auditivo"
  requiresAST: z.boolean().default(false),        // Análisis de Trabajo Seguro
  requiresPTW: z.boolean().default(false),        // Permiso de Trabajo
  ptwTypes: z.array(z.enum([
    'cold_work', 'hot_work', 'electrical_cold', 'electrical_hot',
    'confined_space', 'heights', 'simplified'
  ])).default([]),
  heightsWorkLevel: z.enum(['none', 'basic', 'intermediate', 'advanced']).default('none'),
  riskAssessmentRequired: z.boolean().default(false),
  minimumTechnicianCertifications: z.array(z.string()).default([]),
  // Ejemplos: "trabajo seguro en alturas nivel avanzado", "LOTO", "soldadura certificada"
  medevacRequired: z.boolean().default(false),    // MEDEVAC para zonas remotas (Caño Limón)
}).strict();
export type KitSafetyRequirements = z.infer<typeof KitSafetyRequirementsSchema>;

// Extender KitTemplateSchema con safetyRequirements (si no existe)
// Verificar primero: grep -n "KitTemplateSchema\|safetyRequirements" packages/shared-types/src/schemas/kit.schema.ts
export const KitTemplateEnrichedSchema = KitTemplateSchema.extend({
  safetyRequirements: KitSafetyRequirementsSchema.optional(),
  activityType: z.enum([
    'electrical_installation', 'cctv_maintenance', 'lifeline_inspection',
    'industrial_mounting', 'civil_work', 'telecom', 'refrigeration', 'general'
  ]).optional(),
  estimatedDurationHours: z.number().positive().optional(),
});
export type KitTemplateEnriched = z.infer<typeof KitTemplateEnrichedSchema>;
```

**QA S1.2:**
```bash
npm run typecheck -w @cermont/shared-types > .sisyphus/evidence/s1-2-kit-typecheck.txt 2>&1
npm test -w @cermont/shared-types > .sisyphus/evidence/s1-2-kit-tests.txt 2>&1
```

**Commit:** `feat(schemas): enrich kit with safety requirements, EPP, PTW and activity types (resolves FALLA 1&2)`

---

### S1.3 — Enriquecer `packages/shared-types/src/schemas/execution-session.schema.ts`

**Verificar primero:**
```bash
grep -n "PreflightChecklist\|FieldNovelty\|slaDeadline\|estimatedMinutes\|preflightnotcompleted" packages/shared-types/src/schemas/execution-session.schema.ts
```

Si no existen, agregar:

```typescript
// ─── S1.3 SPEC-013: Preflight Gate (verificación antes de salir a campo) ─────
// Resuelve FALLA 2: verificación activa antes de la ejecución
export const PreflightGateItemSchema = z.object({
  key: z.string().min(1).max(80),
  label: z.string().min(1).max(200),
  isBlocking: z.boolean().default(true),
  isChecked: z.boolean().default(false),
  checkedAt: z.string().datetime().optional(),
  checkedBy: ObjectIdSchema.optional(),
}).strict();
export type PreflightGateItem = z.infer<typeof PreflightGateItemSchema>;

export const PreflightChecklistSchema = z.object({
  eppComplete: z.boolean().default(false),         // EPP verificado
  astSigned: z.boolean().default(false),            // AST firmado
  ptwObtained: z.boolean().default(false),          // Permiso de trabajo obtenido
  toolsValidated: z.boolean().default(false),       // Herramientas verificadas (FALLA 2)
  vehicleDocumentsOk: z.boolean().default(false),   // Documentos vehículo vigentes
  certificationsCurrent: z.boolean().default(false), // Certificaciones del personal vigentes
  items: z.array(PreflightGateItemSchema).default([]),
  completedAt: z.string().datetime().optional(),
  completedBy: ObjectIdSchema.optional(),
}).strict();
export type PreflightChecklist = z.infer<typeof PreflightChecklistSchema>;

// ─── S1.3 SPEC-013: Field Novelty (novedad encontrada en campo) ───────────────
export const FieldNoveltySchema = z.object({
  noveltyId: z.string().uuid(),
  description: z.string().min(5).max(2000),
  severity: z.enum(['low', 'medium', 'high', 'critical']),
  evidenceIds: z.array(ObjectIdSchema).default([]),
  generatesWorkRequest: z.boolean().default(false),
  workRequestId: ObjectIdSchema.optional(),
  reportedAt: z.string().datetime(),
  reportedBy: ObjectIdSchema,
}).strict();
export type FieldNovelty = z.infer<typeof FieldNoveltySchema>;

// ─── S1.3 En EXECUTION_BLOCKER_VALUES agregar (si no existen): ───────────────
// 'preflight_not_completed', 'sla_deadline_exceeded'

// ─── S1.3 En ExecutionSessionSchema extender con campos opcionales: ───────────
// Usar .extend() si ExecutionSessionSchema ya está definido y exportado
export const ExecutionSessionEnrichedSchema = ExecutionSessionSchema.extend({
  scheduledStartDate: z.string().datetime().optional(),
  slaDeadline: z.string().datetime().optional(),
  estimatedMinutes: z.number().int().positive().optional(),
  elapsedMinutes: z.number().int().nonnegative().optional(),
  preflightChecklist: PreflightChecklistSchema.optional(),
  fieldNovelties: z.array(FieldNoveltySchema).default([]),
});
export type ExecutionSessionEnriched = z.infer<typeof ExecutionSessionEnrichedSchema>;
```

**QA S1.3:**
```bash
npm run typecheck -w @cermont/shared-types > .sisyphus/evidence/s1-3-execution-typecheck.txt 2>&1
npm test -w @cermont/shared-types > .sisyphus/evidence/s1-3-execution-tests.txt 2>&1
```

**Commit:** `feat(schemas): enrich execution-session with preflight gates and field novelties`

---

### S1.4 — Enriquecer `packages/shared-types/src/schemas/dashboard-summary.schema.ts`

**Verificar primero:**
```bash
grep -n "DashboardOperationalKPI\|DashboardSLARisk\|mttrMinutes\|firstTimeFixRate" packages/shared-types/src/schemas/dashboard-summary.schema.ts
```

Si no existen, agregar:

```typescript
// ─── S1.4 SPEC-013: Dashboard Operational KPIs ───────────────────────────────
export const DashboardOperationalKPISchema = z.object({
  mttrMinutes: z.number().nonnegative(),           // Mean Time To Repair en minutos
  mtbfDays: z.number().nonnegative(),              // Mean Time Between Failures en días
  firstTimeFixRate: z.number().min(0).max(100),    // % órdenes resueltas sin retorno
  technicianUtilizationRate: z.number().min(0).max(100),
  averageResponseTimeHours: z.number().nonnegative(),
  onTimeCompletionRate: z.number().min(0).max(100),
  pendingInvoicesCount: z.number().int().nonnegative().default(0), // FALLA 4
  overdueInvoicesCount: z.number().int().nonnegative().default(0),
  pendingReportsCount: z.number().int().nonnegative().default(0),  // FALLA 3
  currency: z.string().default('COP'),
  periodFrom: z.string().datetime(),
  periodTo: z.string().datetime(),
}).strict();
export type DashboardOperationalKPI = z.infer<typeof DashboardOperationalKPISchema>;

// ─── S1.4 SPEC-013: SLA Risk Orders ──────────────────────────────────────────
export const DashboardSLARiskOrderSchema = z.object({
  orderId: z.string(),
  orderCode: z.string(),
  clientName: z.string().optional(),
  slaDeadline: z.string().datetime(),
  hoursRemaining: z.number(),
  currentStep: z.number().int().min(1).max(14),
  currentStepLabel: z.string().optional(),
  riskLevel: z.enum(['warning', 'critical']),
  assignedTechnicianName: z.string().optional(),
  pendingAction: z.string().optional(),  // qué falta para avanzar (FALLA 3 y 4)
}).strict();
export type DashboardSLARiskOrder = z.infer<typeof DashboardSLARiskOrderSchema>;

// Extender DashboardSummarySchema existente:
export const DashboardSummaryEnrichedSchema = DashboardSummarySchema.extend({
  operationalKPIs: DashboardOperationalKPISchema.optional(),
  slaRiskOrders: z.array(DashboardSLARiskOrderSchema).default([]),
});
export type DashboardSummaryEnriched = z.infer<typeof DashboardSummaryEnrichedSchema>;
```

**QA S1.4:**
```bash
npm run typecheck -w @cermont/shared-types > .sisyphus/evidence/s1-4-dashboard-typecheck.txt 2>&1
```

**Commit:** `feat(schemas): enrich dashboard-summary with operational KPIs and SLA risk orders`

---

### S1.5 — Crear `packages/shared-types/src/schemas/service-case-cockpit.schema.ts` (ARCHIVO NUEVO)

**Verificar primero que NO existe:**
```bash
test -f packages/shared-types/src/schemas/service-case-cockpit.schema.ts && echo "YA EXISTE" || echo "NO EXISTE — proceder a crear"
```

Si no existe, crear el archivo:

```typescript
// packages/shared-types/src/schemas/service-case-cockpit.schema.ts
// SPEC-013: Cockpit unificado de los 14 pasos de CERMONT SAS

import { z } from 'zod';
import { ObjectIdSchema } from './common.schema';
// Importar solo schemas que YA existen y fueron confirmados en la auditoría
// Si CostIntelligenceSummarySchema se creó en S1.1, importar aquí
// Si EvidenceSlotsRequirementsSchema existe, importar aquí
// Si alguno NO existe aún, usar z.unknown().optional() como placeholder temporal

export const StepStatusEnum = z.enum(['pending', 'in_progress', 'completed', 'blocked', 'skipped']);
export type StepStatus = z.infer<typeof StepStatusEnum>;

// Los 14 pasos del flujo CERMONT — mapeo EXACTO del LTG
export const CERMONT_14_STEPS = [
  { step: 1, label: 'Solicitud del cliente', moduleKey: 'work-request', entity: 'WorkRequest' },
  { step: 2, label: 'Visita técnica', moduleKey: 'site-visit', entity: 'SiteVisit' },
  { step: 3, label: 'Propuesta económica', moduleKey: 'proposal', entity: 'Proposal' },
  { step: 4, label: 'Aprobación PO', moduleKey: 'purchase-order', entity: 'PurchaseOrder' },
  { step: 5, label: 'Planeación', moduleKey: 'planning-packet', entity: 'PlanningPacket' },
  { step: 6, label: 'Ejecución en campo', moduleKey: 'execution-session', entity: 'ExecutionSession' },
  { step: 7, label: 'Informe técnico', moduleKey: 'technical-report', entity: 'TechnicalReport' },
  { step: 8, label: 'Acta de entrega', moduleKey: 'delivery-record', entity: 'DeliveryRecord' },
  { step: 9, label: 'Acta firmada', moduleKey: 'client-acceptance', entity: 'ClientAcceptance' },
  { step: 10, label: 'SES Ariba', moduleKey: 'service-entry-sheet', entity: 'ServiceEntrySheet' },
  { step: 11, label: 'SES aprobada', moduleKey: 'ses-approval', entity: 'SESApproval' },
  { step: 12, label: 'Factura', moduleKey: 'invoice-tracking', entity: 'InvoiceTracking' },
  { step: 13, label: 'Factura aprobada', moduleKey: 'invoice-approval', entity: 'InvoiceApproval' },
  { step: 14, label: 'Pago registrado', moduleKey: 'payment-record', entity: 'PaymentRecord' },
] as const;

export const StepProgressSchema = z.object({
  step: z.number().int().min(1).max(14),
  label: z.string().min(1).max(100),
  moduleKey: z.string().min(1).max(80),
  status: StepStatusEnum,
  completedAt: z.string().datetime().optional(),
  completedBy: ObjectIdSchema.optional(),
  blockerReason: z.string().max(500).optional(),
  deepLink: z.string().max(300).optional(),
}).strict();
export type StepProgress = z.infer<typeof StepProgressSchema>;

export const NextExpectedActionSchema = z.object({
  stepNumber: z.number().int().min(1).max(14),
  description: z.string().min(1).max(500),
  assignedRoles: z.array(z.string().min(1).max(50)),
  dueDate: z.string().datetime().optional(),
  deepLink: z.string().max(300),
  urgency: z.enum(['normal', 'urgent', 'overdue']),
}).strict();
export type NextExpectedAction = z.infer<typeof NextExpectedActionSchema>;

export const DocumentRequirementStatusSchema = z.object({
  documentType: z.string().min(1).max(80),
  label: z.string().min(1).max(200),
  step: z.number().int().min(1).max(14),
  status: z.enum(['pending', 'uploaded', 'approved', 'rejected']),
  fileAssetId: ObjectIdSchema.optional(),
  isRequired: z.boolean().default(true),
}).strict();

export const AuditEventSummarySchema = z.object({
  event: z.string().min(1).max(200),
  entityType: z.string().min(1).max(80),
  actorName: z.string().max(200).optional(),
  occurredAt: z.string().datetime(),
}).strict();

export const ServiceCaseCockpitSchema = z.object({
  serviceCaseId: ObjectIdSchema,
  serviceCaseCode: z.string().min(1).max(40),
  clientName: z.string().max(200).optional(),
  workDescription: z.string().max(1000).optional(),
  activityType: z.string().max(80).optional(),       // tipo de actividad (CCTV, eléctrico, civil...)
  stepProgress: z.array(StepProgressSchema),          // array de 14 elementos
  currentStep: z.number().int().min(1).max(14),
  completedSteps: z.number().int().min(0).max(14),
  nextExpectedAction: NextExpectedActionSchema,
  blockers: z.array(z.object({
    code: z.string(),
    message: z.string(),
    severity: z.enum(['warning', 'error']).default('error'),
  })).default([]),
  documentRequirements: z.array(DocumentRequirementStatusSchema).default([]),
  riskLevel: z.enum(['low', 'medium', 'high', 'critical']),
  slaDeadline: z.string().datetime().optional(),
  slaStatus: z.enum(['on_track', 'at_risk', 'overdue']).optional(),
  lastAuditEvents: z.array(AuditEventSummarySchema).default([]),
  generatedAt: z.string().datetime(),
}).strict();
export type ServiceCaseCockpit = z.infer<typeof ServiceCaseCockpitSchema>;
```

**Actualizar `packages/shared-types/src/schemas/index.ts`:**
```typescript
// Agregar al final del index.ts (verificar que no exista ya):
export * from './service-case-cockpit.schema';
```

**QA S1.5:**
```bash
test -f packages/shared-types/src/schemas/service-case-cockpit.schema.ts && echo "ARCHIVO EXISTE" > .sisyphus/evidence/s1-5-file-exists.txt
npm run typecheck -w @cermont/shared-types > .sisyphus/evidence/s1-5-cockpit-typecheck.txt 2>&1
npm test -w @cermont/shared-types > .sisyphus/evidence/s1-5-cockpit-tests.txt 2>&1
```

**Commit:** `feat(schemas): create service-case-cockpit schema with 14-step progress tracker`

---

### S1.6 — Enriquecer `packages/domain/src/` con reglas de negocio Spec-013

**Verificar primero:**
```bash
cat packages/domain/src/cost.rules.ts
cat packages/domain/src/planning.rules.ts
cat packages/domain/src/execution.ts
grep -n "evaluatePreflightGates\|evaluateSLARisk\|evaluateCostRisk\|computeMTTR\|computeMTBF" packages/domain/src/*.ts
```

Crear o enriquecer `packages/domain/src/spec-013-rules.ts`:

```typescript
// packages/domain/src/spec-013-rules.ts
// SPEC-013: Reglas de negocio para brechas críticas del LTG CERMONT SAS
// NO importar schemas Zod directamente — usar interfaces propias para evitar dependencias circulares

export type PreflightGateInput = {
  isBlocking: boolean;
  isChecked: boolean;
  key: string;
};

export type PreflightResult = {
  allBlockingGatesPassed: boolean;
  pendingBlockingGates: string[];
  totalGates: number;
  passedGates: number;
};

export function evaluatePreflightGates(
  items: PreflightGateInput[],
  checks: { eppComplete: boolean; astSigned: boolean; ptwObtained: boolean; toolsValidated: boolean; vehicleDocumentsOk: boolean; certificationsCurrent: boolean }
): PreflightResult {
  const blockingItems = items.filter(g => g.isBlocking);
  const pendingBlocking = blockingItems.filter(g => !g.isChecked).map(g => g.key);
  const structuralChecks = Object.entries(checks)
    .filter(([, v]) => v === false)
    .map(([k]) => k);
  const allPending = [...pendingBlocking, ...structuralChecks];
  return {
    allBlockingGatesPassed: allPending.length === 0,
    pendingBlockingGates: allPending,
    totalGates: blockingItems.length + Object.keys(checks).length,
    passedGates: blockingItems.filter(g => g.isChecked).length + Object.values(checks).filter(Boolean).length,
  };
}

export type SLARiskLevel = 'on_track' | 'at_risk' | 'overdue';

export function evaluateSLARisk(slaDeadline: string, currentStep: number): SLARiskLevel {
  const deadlineDate = new Date(slaDeadline);
  const now = new Date();
  const hoursRemaining = (deadlineDate.getTime() - now.getTime()) / (1000 * 60 * 60);
  if (hoursRemaining < 0) return 'overdue';
  // Si quedan menos de 6h y estamos en los últimos pasos (10-14), es crítico
  if (hoursRemaining < 6 || (hoursRemaining < 24 && currentStep >= 10)) return 'at_risk';
  return 'on_track';
}

export type CostRiskLevel = 'under_budget' | 'on_budget' | 'at_risk' | 'critical';

export function evaluateCostRisk(consumedPercent: number): CostRiskLevel {
  if (consumedPercent >= 100) return 'critical';
  if (consumedPercent >= 80) return 'at_risk';
  if (consumedPercent >= 60) return 'on_budget';
  return 'under_budget';
}

export type CanClosePhase = {
  canClose: boolean;
  blockingPendingCount: number;
  pendingSlotIds: string[];
};

export function evaluateEvidenceCompleteness(
  slots: Array<{ slotId: string; isBlocking: boolean; fulfilledAt?: string }>
): CanClosePhase {
  const blockingPending = slots.filter(s => s.isBlocking && !s.fulfilledAt);
  return {
    canClose: blockingPending.length === 0,
    blockingPendingCount: blockingPending.length,
    pendingSlotIds: blockingPending.map(s => s.slotId),
  };
}

// KPI computation functions
export type SessionForKPI = { startedAt?: string; completedAt?: string };

export function computeMTTR(sessions: SessionForKPI[]): number {
  const completed = sessions.filter(s => s.startedAt && s.completedAt);
  if (completed.length === 0) return 0;
  const totalMinutes = completed.reduce((acc, s) => {
    const diff = new Date(s.completedAt!).getTime() - new Date(s.startedAt!).getTime();
    return acc + diff / (1000 * 60);
  }, 0);
  return Math.round(totalMinutes / completed.length);
}

export type OrderForKPI = { createdAt: string; completedAt?: string; reopenedCount?: number };

export function computeMTBF(orders: OrderForKPI[]): number {
  const completed = orders.filter(o => o.completedAt).sort(
    (a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
  );
  if (completed.length < 2) return 0;
  let totalDays = 0;
  for (let i = 1; i < completed.length; i++) {
    const diff = new Date(completed[i].createdAt).getTime() - new Date(completed[i - 1].completedAt!).getTime();
    totalDays += diff / (1000 * 60 * 60 * 24);
  }
  return Math.round(totalDays / (completed.length - 1));
}

export function computeFirstTimeFixRate(orders: OrderForKPI[]): number {
  const completed = orders.filter(o => o.completedAt);
  if (completed.length === 0) return 0;
  const firstTimeFix = completed.filter(o => !o.reopenedCount || o.reopenedCount === 0);
  return Math.round((firstTimeFix.length / completed.length) * 100);
}
```

**Actualizar `packages/domain/src/index.ts`:**
```typescript
export * from './spec-013-rules';
```

**QA S1.6:**
```bash
npm run typecheck -w @cermont/domain > .sisyphus/evidence/s1-6-domain-typecheck.txt 2>&1
npm test -w @cermont/domain > .sisyphus/evidence/s1-6-domain-tests.txt 2>&1
```

**Commit:** `feat(domain): add Spec-013 business rules: preflight, SLA risk, cost risk, KPI computation`

---

### S1 — Gate de salida

```bash
npm run typecheck 2>&1 | tee .sisyphus/evidence/sprint1-full-typecheck.txt
npm run lint 2>&1 | tee .sisyphus/evidence/sprint1-lint.txt
npm test 2>&1 | tee .sisyphus/evidence/sprint1-tests.txt
npm run build 2>&1 | tee .sisyphus/evidence/sprint1-build.txt
npm run contracts:check 2>&1 | tee .sisyphus/evidence/sprint1-contracts.txt
```

**PARAR si algún gate falla. No avanzar a Sprint 2.**

---

## 6. SPRINT 2 — BACKEND ENDPOINTS CRÍTICOS

**Rama:** `implement/spec-013-brechas-criticas`  
**Depende de:** Sprint 1 completo  
**Gate de salida:** 8 endpoints funcionando con curl. `npm run build PASS`.

### S2.1 — Endpoint `GET /api/service-cases/:id/cockpit`

**Verificar primero:**
```bash
grep -rn "getCockpit\|cockpit" backend/src/modules/service-cases/
```

Si no existe, implementar en `backend/src/modules/service-cases/service-cases.service.ts`:

```typescript
// Agregar método getCockpit al servicio existente
async getCockpit(serviceCaseId: string, requestingUserId: string): Promise<ServiceCaseCockpit> {
  // 1. Obtener el ServiceCase con populate de cliente y entidades relacionadas
  const serviceCase = await this.serviceCaseModel
    .findById(serviceCaseId)
    .populate('clientId')
    .lean();
  if (!serviceCase) throw new AppError('SERVICE_CASE_NOT_FOUND', 404);

  // 2. Calcular stepProgress iterando los 14 pasos
  const stepProgress = await this.calculateStepProgress(serviceCase);

  // 3. Identificar currentStep y nextExpectedAction
  const currentStep = this.getCurrentStep(stepProgress);
  const nextExpectedAction = this.getNextExpectedAction(serviceCase, currentStep);

  // 4. Calcular blockers desde reglas de dominio
  const blockers = await this.getServiceCaseBlockers(serviceCase);

  // 5. Obtener documentRequirements por fase
  const documentRequirements = await this.getDocumentRequirements(serviceCase);

  // 6. Calcular costSummary si hay costos
  const costSummary = await this.costService.getIntelligence(serviceCaseId).catch(() => undefined);

  // 7. Calcular riskLevel y slaStatus
  const slaStatus = serviceCase.slaDeadline
    ? evaluateSLARisk(serviceCase.slaDeadline, currentStep)
    : undefined;

  // 8. Obtener últimos audit events
  const lastAuditEvents = await this.auditService.getLastEvents(serviceCaseId, 10);

  return ServiceCaseCockpitSchema.parse({
    serviceCaseId: serviceCaseId,
    serviceCaseCode: serviceCase.code,
    clientName: serviceCase.clientId?.name,
    workDescription: serviceCase.description,
    stepProgress,
    currentStep,
    completedSteps: stepProgress.filter(s => s.status === 'completed').length,
    nextExpectedAction,
    blockers,
    documentRequirements,
    riskLevel: this.calculateRiskLevel(serviceCase, blockers),
    slaDeadline: serviceCase.slaDeadline,
    slaStatus,
    lastAuditEvents,
    generatedAt: new Date().toISOString(),
  });
}
```

**Registrar ruta en `service-cases.routes.ts`:**
```typescript
router.get('/:id/cockpit', authenticate, authorize(['gerencia', 'residente', 'administrativo', 'supervisor']), validateParams(IdParamSchema), serviceCasesController.getCockpit);
```

**QA S2.1:**
```bash
# Iniciar backend
npm run dev -w backend &
sleep 5

# Test con curl
TOKEN=$(curl -s -X POST http://127.0.0.1:4000/api/auth/login -H "Content-Type: application/json" -d '{"email":"test@cermont.com","password":"test"}' | jq -r '.data.accessToken')
SERVICE_CASE_ID="<ID_REAL_DE_PRUEBA>"

curl -s -X GET "http://127.0.0.1:4000/api/service-cases/$SERVICE_CASE_ID/cockpit" \
  -H "Authorization: Bearer $TOKEN" | jq '.data | {currentStep, completedSteps, blockers: (.blockers | length), generatedAt}' \
  > .sisyphus/evidence/s2-1-cockpit.txt

echo "EXIT: $?" >> .sisyphus/evidence/s2-1-cockpit.txt
```

**Commit:** `feat(backend): add GET /service-cases/:id/cockpit with 14-step progress aggregation`

---

### S2.2 — Endpoint `GET /api/planning-packets/:id/readiness`

**Resuelve directamente FALLA 1 y 2 del LTG.**

```typescript
// En planning-packet.service.ts
async getReadiness(planningPacketId: string): Promise<PlanningReadinessResult> {
  const packet = await this.planningPacketModel
    .findById(planningPacketId)
    .populate(['assignedCrewIds', 'vehicleIds', 'kitTemplateId'])
    .lean();
  if (!packet) throw new AppError('PLANNING_PACKET_NOT_FOUND', 404);

  const readinessGates: ReadinessGate[] = [];
  const blockingReasons: string[] = [];

  // GATE 1: técnicos asignados (req. FALLA 1)
  if (!packet.assignedCrewIds || packet.assignedCrewIds.length === 0) {
    blockingReasons.push('No hay técnicos asignados al paquete de planeación');
    readinessGates.push({ key: 'crew_assigned', label: 'Técnicos asignados', passed: false });
  } else {
    readinessGates.push({ key: 'crew_assigned', label: 'Técnicos asignados', passed: true });
  }

  // GATE 2: certificaciones del personal vigentes (req. paso 5.4)
  const crewWithExpiredCerts = await this.checkCrewCertifications(packet.assignedCrewIds);
  if (crewWithExpiredCerts.length > 0) {
    blockingReasons.push(`Certificaciones vencidas: ${crewWithExpiredCerts.join(', ')}`);
    readinessGates.push({ key: 'certifications_current', label: 'Certificaciones vigentes', passed: false });
  } else {
    readinessGates.push({ key: 'certifications_current', label: 'Certificaciones vigentes', passed: true });
  }

  // GATE 3: vehículos con documentos vigentes
  const vehiclesNotReady = await this.checkVehicleDocuments(packet.vehicleIds);
  if (vehiclesNotReady.length > 0) {
    blockingReasons.push(`Vehículos con documentos vencidos: ${vehiclesNotReady.join(', ')}`);
    readinessGates.push({ key: 'vehicles_ok', label: 'Documentos vehículos', passed: false });
  } else {
    readinessGates.push({ key: 'vehicles_ok', label: 'Documentos vehículos', passed: true });
  }

  // GATE 4: kit de herramientas asignado (req. FALLA 1 y 2)
  if (!packet.kitTemplateId) {
    blockingReasons.push('No se ha asignado un kit de herramientas típico al paquete de planeación');
    readinessGates.push({ key: 'kit_assigned', label: 'Kit de herramientas asignado', passed: false });
  } else {
    readinessGates.push({ key: 'kit_assigned', label: 'Kit de herramientas asignado', passed: true });
  }

  // GATE 5: herramientas calibradas (req. paso 5.4)
  if (packet.kitTemplateId) {
    const toolsNeedingCalibration = await this.checkToolCalibrations(packet.kitTemplateId.items);
    if (toolsNeedingCalibration.length > 0) {
      blockingReasons.push(`Herramientas sin calibración vigente: ${toolsNeedingCalibration.join(', ')}`);
      readinessGates.push({ key: 'tools_calibrated', label: 'Herramientas calibradas', passed: false });
    } else {
      readinessGates.push({ key: 'tools_calibrated', label: 'Herramientas calibradas', passed: true });
    }
  }

  // GATE 6: EPP verificado (req. paso 5.3)
  const hasEppChecklist = packet.kitTemplateId?.safetyRequirements?.eppList?.length > 0;
  readinessGates.push({ key: 'epp_listed', label: 'EPP listado en kit', passed: hasEppChecklist });
  if (!hasEppChecklist) {
    blockingReasons.push('El kit no tiene EPP definido. Verificar elementos de seguridad requeridos.');
  }

  // GATE 7: supervisor asignado
  if (!packet.supervisorId) {
    blockingReasons.push('No hay supervisor asignado');
    readinessGates.push({ key: 'supervisor_assigned', label: 'Supervisor asignado', passed: false });
  } else {
    readinessGates.push({ key: 'supervisor_assigned', label: 'Supervisor asignado', passed: true });
  }

  const canExecute = blockingReasons.length === 0;
  return { canExecute, readinessGates, blockingReasons };
}
```

**QA S2.2:**
```bash
curl -s -X GET "http://127.0.0.1:4000/api/planning-packets/$PACKET_ID/readiness" \
  -H "Authorization: Bearer $TOKEN" | jq '{canExecute, blockingReasonsCount: (.blockingReasons | length)}' \
  > .sisyphus/evidence/s2-2-readiness.txt
```

**Commit:** `feat(backend): add GET /planning-packets/:id/readiness with tool and cert validation (resolves FALLA 1&2)`

---

### S2.3 — Endpoint `GET /api/costs/:orderId/intelligence`

**Resuelve directamente FALLA 5 del LTG.**

```typescript
// En cost.service.ts
async getIntelligence(orderId: string): Promise<CostIntelligenceSummary> {
  // 1. Obtener CostSummary actual
  const costSummary = await this.costModel.findOne({ orderId }).lean();

  // 2. Obtener baseline congelado desde la propuesta aprobada
  const serviceCase = await this.serviceCaseModel.findById(orderId).populate('proposalId').lean();
  let baselineCost: BaselineCost | undefined;
  if (serviceCase?.proposalId?.status === 'approved') {
    baselineCost = {
      proposalId: serviceCase.proposalId._id.toString(),
      proposalCode: serviceCase.proposalId.code,
      frozenAt: serviceCase.proposalId.approvedAt,
      totalEstimatedCOP: serviceCase.proposalId.totalAmount,
      totalTaxCOP: serviceCase.proposalId.totalTax ?? 0,
      byCategory: serviceCase.proposalId.costByCategory ?? [],
    };
  }

  const totalEstimated = baselineCost?.totalEstimatedCOP ?? costSummary?.estimatedTotal ?? 0;
  const totalActual = costSummary?.actualTotal ?? 0;
  const totalTax = costSummary?.totalTaxCOP ?? 0;
  const totalMargin = totalEstimated - totalActual;
  const marginPercent = totalEstimated > 0 ? (totalMargin / totalEstimated) * 100 : 0;
  const budgetConsumedPercent = totalEstimated > 0 ? (totalActual / totalEstimated) * 100 : 0;

  return CostIntelligenceSummarySchema.parse({
    orderId,
    orderCode: serviceCase?.code ?? orderId,
    baselineCost,
    totalEstimated,
    totalActual,
    totalTaxCOP: totalTax,
    totalMargin,
    marginPercent: Math.round(marginPercent * 100) / 100,
    budgetConsumedPercent: Math.round(budgetConsumedPercent * 100) / 100,
    isAtRisk: budgetConsumedPercent > 80,
    isCritical: budgetConsumedPercent >= 100,
    deviationByCategory: costSummary?.byCategory ?? [],
    lastUpdatedAt: costSummary?.updatedAt?.toISOString() ?? new Date().toISOString(),
  });
}
```

**QA S2.3:**
```bash
curl -s -X GET "http://127.0.0.1:4000/api/costs/$ORDER_ID/intelligence" \
  -H "Authorization: Bearer $TOKEN" | jq '{totalEstimated, totalActual, marginPercent, isAtRisk, isCritical}' \
  > .sisyphus/evidence/s2-3-intelligence.txt
```

**Commit:** `feat(backend): add GET /costs/:orderId/intelligence with baseline vs actual comparison (resolves FALLA 5)`

---

### S2.4 — CRUD `GET/POST /api/costs/catalog`

```bash
# Verificar si existe el módulo:
ls backend/src/modules/ | grep -i catalog
ls backend/src/modules/cost/
```

Crear `backend/src/modules/cost-catalog/`:
- `cost-catalog.model.ts` — Mongoose model para `CostCatalogItem`
- `cost-catalog.service.ts` — create, list (filtros: category, search, isActive), update, deactivate
- `cost-catalog.controller.ts` — controller delgado (solo wiring)
- `cost-catalog.routes.ts` — `GET /costs/catalog`, `POST /costs/catalog`

RBAC: solo `residente`, `administrativo`, `gerencia` pueden crear/editar.

**QA S2.4:**
```bash
curl -s -X POST "http://127.0.0.1:4000/api/costs/catalog" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"code":"MOD-CCTV-001","name":"Mantenimiento cámara CCTV","category":"labor","unitCostCOP":85000,"unit":"hora","isBillable":true}' \
  | jq '{success, code: .data.code}' > .sisyphus/evidence/s2-4-catalog-create.txt

curl -s "http://127.0.0.1:4000/api/costs/catalog?category=labor" \
  -H "Authorization: Bearer $TOKEN" | jq '.data | length' >> .sisyphus/evidence/s2-4-catalog-list.txt
```

**Commit:** `feat(backend): add GET/POST /costs/catalog for reusable cost catalog CRUD`

---

### S2.5 — Endpoints `GET /api/dashboard/operational-kpis` y `GET /api/dashboard/sla-risk`

```typescript
// En dashboard.service.ts — agregar:
async getOperationalKPIs(periodFrom: string, periodTo: string): Promise<DashboardOperationalKPI> {
  const [sessions, orders] = await Promise.all([
    this.executionSessionModel.find({
      completedAt: { $gte: new Date(periodFrom), $lte: new Date(periodTo) },
      status: 'completed',
    }).lean(),
    this.serviceCaseModel.find({
      completedAt: { $gte: new Date(periodFrom), $lte: new Date(periodTo) },
    }).lean(),
  ]);

  // Usar funciones de packages/domain
  const mttrMinutes = computeMTTR(sessions);
  const mtbfDays = computeMTBF(orders);
  const firstTimeFixRate = computeFirstTimeFixRate(orders);

  // Contar facturas y reportes pendientes (FALLA 3 y 4)
  const [pendingInvoices, overdueInvoices, pendingReports] = await Promise.all([
    this.invoiceModel.countDocuments({ status: 'pending' }),
    this.invoiceModel.countDocuments({ status: { $in: ['sent', 'approved'] }, dueDate: { $lt: new Date() } }),
    this.technicalReportModel.countDocuments({ status: 'draft' }),
  ]);

  return DashboardOperationalKPISchema.parse({
    mttrMinutes, mtbfDays, firstTimeFixRate,
    technicianUtilizationRate: 0, // calcular en iteración futura
    averageResponseTimeHours: 0,
    onTimeCompletionRate: 0,
    pendingInvoicesCount: pendingInvoices,
    overdueInvoicesCount: overdueInvoices,
    pendingReportsCount: pendingReports,
    currency: 'COP',
    periodFrom, periodTo,
  });
}

async getSLARiskOrders(userId: string, userRole: string): Promise<DashboardSLARiskOrder[]> {
  const activeCases = await this.serviceCaseModel.find({
    status: { $nin: ['completed', 'cancelled', 'paid'] },
    slaDeadline: { $exists: true },
  }).lean();

  return activeCases
    .map(sc => {
      const hoursRemaining = (new Date(sc.slaDeadline).getTime() - Date.now()) / (1000 * 60 * 60);
      const riskLevel = hoursRemaining < 6 ? 'critical' : hoursRemaining < 24 ? 'warning' : null;
      if (!riskLevel) return null;
      return DashboardSLARiskOrderSchema.parse({
        orderId: sc._id.toString(), orderCode: sc.code,
        slaDeadline: sc.slaDeadline, hoursRemaining: Math.round(hoursRemaining),
        currentStep: sc.currentStep ?? 1, riskLevel,
      });
    })
    .filter(Boolean) as DashboardSLARiskOrder[];
}
```

**QA S2.5:**
```bash
curl -s "http://127.0.0.1:4000/api/dashboard/operational-kpis?periodFrom=2026-01-01T00:00:00Z&periodTo=2026-07-03T23:59:59Z" \
  -H "Authorization: Bearer $TOKEN" | jq '{mttrMinutes, firstTimeFixRate, pendingInvoicesCount}' \
  > .sisyphus/evidence/s2-5-kpis.txt

curl -s "http://127.0.0.1:4000/api/dashboard/sla-risk" \
  -H "Authorization: Bearer $TOKEN" | jq 'length' >> .sisyphus/evidence/s2-5-sla-risk.txt
```

**Commit:** `feat(backend): add dashboard operational-kpis and sla-risk endpoints (resolves FALLA 3&4 visibility)`

---

### S2 — Gate de salida Sprint 2

```bash
npm run typecheck && npm run lint && npm test && npm run build && npm run contracts:check
# Guardar:
npm run build > .sisyphus/evidence/sprint2-build.txt 2>&1
npm test > .sisyphus/evidence/sprint2-tests.txt 2>&1
```

---

## 7. SPRINT 3 — FRONTEND COCKPIT Y KIT READINESS

**Rama:** `implement/spec-013-brechas-criticas`  
**Depende de:** Sprint 2 endpoints funcionando  
**Gate de salida:** 6 componentes con loading/error/empty states. `npm run build PASS`.

### S3.1 — Página `/service-cases/[id]/cockpit`

```typescript
// frontend/src/app/(protected)/service-cases/[id]/cockpit/page.tsx
// 1. Hook useCockpit(id) que llama GET /api/service-cases/:id/cockpit
// 2. FourteenStepProgressBar — barra visual con 14 pasos, colores por status
// 3. NextActionCard — tarjeta prominente con la siguiente acción requerida
// 4. BlockersPanelCollapsible — lista colapsable de bloqueantes
// 5. DocumentRequirementsPanel — qué documentos faltan por paso
// 6. CostSummaryInlineCard — costos real vs estimado con gauge

// REGLAS:
// - Loading: skeleton de 14 pasos
// - Error: mensaje de error con retry
// - Empty: no debería ocurrir si el ID es válido
// - Offline: mostrar última versión cacheada (TanStack Query staleTime)
// - Forbidden: redirigir si el rol no tiene acceso
// - NO lógica de negocio en el componente — todo viene del endpoint
// - Responsive: funcionar en 375px (técnicos usan móvil en campo)
```

**Componentes a crear:**

```
frontend/src/modules/service-cases/ui/
  FourteenStepProgressBar.tsx     — pasos 1-14 con colores (completed=verde, in_progress=azul, blocked=rojo, pending=gris)
  NextActionCard.tsx               — tarjeta prominente next action con urgency indicator
  BlockersPanelCollapsible.tsx    — panel acordeón de bloqueantes
  DocumentRequirementsPanel.tsx   — tabla de documentos requeridos por fase
  CostSummaryInlineCard.tsx       — mini card con estimated/actual/margin/gauge
  AuditTimelineCompact.tsx        — timeline horizontal de últimos eventos

frontend/src/modules/service-cases/hooks/
  useCockpit.ts                   — TanStack Query hook para GET /service-cases/:id/cockpit

frontend/src/modules/service-cases/api/
  cockpit.api.ts                  — función de fetching tipada con Zod parse
```

### S3.2 — Página `/planning-packets/[id]/readiness`

**Este componente resuelve FALLA 1 y 2 visualmente para el técnico antes de salir a campo.**

```typescript
// PlanningReadinessPage — muestra el resultado de /api/planning-packets/:id/readiness
// Componentes:
//   ReadinessGatesList — lista de gates con íconos de check/x
//   KitItemsChecklistDisplay — lista de herramientas del kit con estado
//   SafetyRequirementsDisplay — EPP requerido, permisos, certificaciones
//   ReadinessApproveButton — botón que llama POST /api/planning-packets/:id/approve
//                            DESHABILITADO si canExecute === false
//   BlockingReasonsAlert — alerta roja con lista de razones si !canExecute

// CRÍTICO: El botón "Aprobar planeación" debe estar deshabilitado con tooltip
// explicando el primer blocking reason si readiness.canExecute === false
// Esto es la solución directa a FALLA 1 y FALLA 2 del LTG.
```

### S3.3 — Página `/costs/[orderId]/intelligence`

**Resuelve FALLA 5 visualmente para gerencia y administrativo.**

```typescript
// CostIntelligencePage
// Componentes:
//   BaselineCostCard — monto congelado desde propuesta aprobada (con fecha de congelamiento)
//   BudgetConsumedGauge — gauge visual 0-100% con colores (verde <60, amarillo 60-80, rojo >80)
//   CostDeviationTable — tabla desviación por categoría (estimado vs real)
//   MarginCalculatorCard — margen bruto y % de margen
//   TaxBreakdownCard — impuestos explícitos (requisito FALLA 5)
//   ExportToExcelButton — exportar resumen a Excel para contabilidad externa

// La página debe actualizarse en tiempo real con staleTime corto (30s)
// y mostrar timestamp de "última actualización"
```

### S3.4 — Dashboard con KPIs operacionales

```typescript
// En la página /dashboard, agregar sección "Indicadores operativos":
//   MTTRCard — Mean Time To Repair en minutos
//   MTBFCard — Mean Time Between Failures en días  
//   FirstTimeFixRateGauge — % primera solución
//   PendingAlertsList — facturas pendientes, reportes sin enviar, actas sin firma
//     (resuelve visibilidad de FALLA 3 y FALLA 4)
//   SLARiskOrdersTable — tabla de órdenes en riesgo de SLA
```

**QA S3:**
```bash
# Verificar que los archivos existen
test -f frontend/src/modules/service-cases/ui/FourteenStepProgressBar.tsx && echo "OK"
test -f frontend/src/modules/service-cases/hooks/useCockpit.ts && echo "OK"
test -f frontend/src/modules/service-cases/api/cockpit.api.ts && echo "OK"

# Build
npm run build -w frontend > .sisyphus/evidence/sprint3-frontend-build.txt 2>&1

# Playwright E2E
npx playwright test --grep "cockpit|readiness|cost-intelligence" > .sisyphus/evidence/sprint3-e2e.txt 2>&1
```

**Commit:** `feat(frontend): add cockpit 14-step page, readiness checker, cost intelligence UI`

---

## 8. SPRINT 4 — INFORMES AUTOMÁTICOS Y CIERRE (FALLA 3)

**Resuelve directamente FALLA 3: generación automática de informe técnico desde datos ya cargados.**

### S4.1 — Endpoint `POST /api/technical-reports/:id/auto-draft`

```typescript
// Este endpoint toma los datos existentes de la orden (ejecución, evidencias, checklist)
// y genera automáticamente el borrador del informe técnico
// Resuelve FALLA 3: "retrasos considerables en la elaboración de informes"

// Input: ninguno (usa los datos ya cargados de la orden)
// Output: TechnicalReportDraft con:
//   - activitiesExecuted: extraídas de ExecutionSession.fieldActivities
//   - evidencesSummary: lista de evidencias capturadas con sus fases
//   - checklistSummary: resumen de checklists completados
//   - materialsUsed: del kit ejecutado
//   - observations: de FieldNovelties
//   - status: 'draft' (el residente debe revisar antes de enviar)
```

### S4.2 — Página `/technical-reports/[id]/edit`

```typescript
// TechnicalReportDraftPage — editor del borrador autogenerado
// Secciones:
//   AutoGeneratedBanner — aviso de que fue generado automáticamente, requiere revisión
//   ActivitiesEditor — lista editable de actividades ejecutadas
//   EvidencesGallery — galería de evidencias vinculadas (antes/durante/después)
//   ChecklistSummaryView — resumen de ítems de checklist completados
//   ObservationsEditor — novvedades de campo
//   SendForSignatureButton — enviar al cliente para firma (llama DeliveryRecord)
//   PDFPreviewButton — previsualizar el PDF antes de enviar
//   DigitalSignaturePad — firma digital del supervisor (signature_pad o similar, verificar dependencias)
```

### S4.3 — Dashboard de alertas de cierre pendiente

```typescript
// En dashboard (refuerza FALLA 3 y FALLA 4):
// PendingClosureWidget — lista de órdenes en paso 7-14 con más de 3 días sin avanzar
// OverdueInvoicesAlert — facturas enviadas sin aprobación > 30 días
// UnsentReportsAlert — órdenes en paso 6 (ejecutadas) pero sin informe > 2 días
```

**QA S4:**
```bash
npm run typecheck && npm test && npm run build
# Verificar endpoint auto-draft:
curl -s -X POST "http://127.0.0.1:4000/api/technical-reports/$REPORT_ID/auto-draft" \
  -H "Authorization: Bearer $TOKEN" | jq '{success, status: .data.status}' \
  > .sisyphus/evidence/s4-1-auto-draft.txt
```

**Commit:** `feat(backend+frontend): add auto-draft report generation and digital signature (resolves FALLA 3)`

---

## 9. SPRINT 5 — NOTIFICACIONES Y RECORDATORIOS ACTIVOS (FALLA 1, 2, 4)

### S5.1 — Notificaciones de kit incompleto (FALLA 2)

```typescript
// Usar el módulo notifications existente (verificar que existe en backend/src/modules/notifications)
// Evento disparador: PlanningPacket aprobado con fecha de ejecución programada
// Acción: 24h antes, enviar notificación in-app a técnicos asignados con:
//   - Lista de herramientas del kit
//   - EPP requerido
//   - Permisos a obtener
//   - Link directo a /planning-packets/:id/readiness

// Implementar en planning-packet.service.ts al aprobar un planning packet:
// await this.notificationService.scheduleKitReminderNotification({
//   planningPacketId: packet._id.toString(),
//   recipientIds: packet.assignedCrewIds,
//   scheduledFor: new Date(packet.scheduledStartDate.getTime() - 24 * 60 * 60 * 1000),
//   kitSummary: { tools: kit.items.map(i => i.name), eppList: kit.safetyRequirements.eppList },
// });
```

### S5.2 — Alertas de facturación pendiente (FALLA 4)

```typescript
// Evento disparador: ClientAcceptance aprobado (paso 9 completado)
// Acción: notificación in-app a administrativo/gerencia:
//   "La orden [CÓDIGO] tiene acta firmada. Pasos pendientes: SES → Factura → Pago"
//   con link directo al módulo de cierre administrativo

// Evento disparador: SESApproval recibida (paso 11)
// Acción: notificación urgente para crear factura:
//   "SES aprobada para orden [CÓDIGO]. Crear y enviar factura para evitar retrasos."

// Evento disparador: Orden en paso 12+ con más de 5 días sin avanzar
// Acción: alerta de escalamiento a gerencia
```

**QA S5:**
```bash
npm run typecheck && npm test
# Verificar que notifications module existe:
ls backend/src/modules/ | grep notification
```

**Commit:** `feat(notifications): add kit reminder and invoice alert notifications (resolves FALLA 2&4)`

---

## 10. DEFINICIÓN DE DONE — SPEC-013 COMPLETO

Para declarar Spec-013 completado, CADA uno de estos puntos debe tener evidencia verificable:

### Gates técnicos (no negociables)
```bash
npm run typecheck  # PASS (0 errores)
npm run lint       # PASS (0 warnings nuevos)
npm test           # PASS (≥ 1013 tests — no regresión)
npm run build      # PASS (5/5 builds)
npm run contracts:check  # PASS
```

### Evidencia por falla del LTG

| Falla | Evidencia requerida |
|---|---|
| FALLA 1 (planeación) | curl a `GET /planning-packets/:id/readiness` retorna `canExecute: false` cuando kit no está asignado |
| FALLA 2 (herramientas) | Captura/test mostrando botón "Aprobar planeación" deshabilitado cuando `canExecute: false` |
| FALLA 2 (recordatorio) | Log de notificación in-app enviada 24h antes de ejecución con lista de herramientas |
| FALLA 3 (informes) | curl a `POST /technical-reports/:id/auto-draft` retorna borrador con actividades y evidencias |
| FALLA 4 (facturación) | Dashboard mostrando `pendingInvoicesCount` > 0 con alertas activas |
| FALLA 5 (costos) | curl a `GET /costs/:orderId/intelligence` retorna `baselineCost`, `totalActual`, `isAtRisk`, `totalTaxCOP` |

### Documento final
Crear `specs/013-cierre-brechas-criticas/final-report.md` con:
- Tabla de auditoría inicial (Sprint 0) vs. estado final
- Cada falla del LTG con: estado RESUELTO / PARCIAL / NO RESUELTO + evidencia
- Tests baseline antes (1013) vs. después (≥ 1013)
- Lista de archivos creados/modificados con descripción de cambio

---

## 11. PROHIBICIONES ABSOLUTAS EN ESTE SPEC

- ❌ Declarar "FALLA 5 resuelta" sin curl real mostrando `baselineCost.frozenAt` y `totalTaxCOP`
- ❌ Declarar "FALLA 1/2 resuelta" sin UI mostrando botón deshabilitado cuando faltan herramientas
- ❌ Crear `MediaAsset` — solo `FileAsset`
- ❌ Importar schemas Zod directamente en `packages/domain` — usar interfaces locales
- ❌ Hardcodear roles como strings en componentes React
- ❌ Usar `try/catch` en controllers de Express 5
- ❌ Hacer `fetch()` directo en componentes React
- ❌ Reportar "gates verdes" sin mostrar el output real del comando
- ❌ Asumir que un schema o endpoint existe sin haberlo leído en esta sesión (Regla Cero)
- ❌ Modificar `package.json` sin justificación explícita
- ❌ Avanzar al siguiente sprint si el gate de salida del anterior falla

---

## 12. ÁRBOL DE ARCHIVOS ESPERADO AL FINALIZAR SPEC-013

```
packages/
  shared-types/src/schemas/
    cost.schema.ts                    ← ENRIQUECIDO: CostCatalogItem, BaselineCost, CostIntelligenceSummary
    kit.schema.ts                     ← ENRIQUECIDO: KitSafetyRequirements, activityType, isBillable
    execution-session.schema.ts       ← ENRIQUECIDO: PreflightChecklist, FieldNovelty, slaDeadline
    dashboard-summary.schema.ts       ← ENRIQUECIDO: DashboardOperationalKPI, DashboardSLARiskOrder
    service-case-cockpit.schema.ts    ← NUEVO: cockpit unificado de 14 pasos
    index.ts                          ← ACTUALIZADO: con nuevos exports
  domain/src/
    spec-013-rules.ts                 ← NUEVO: evaluatePreflightGates, evaluateSLARisk, computeMTTR...
    index.ts                          ← ACTUALIZADO

backend/src/modules/
  service-cases/
    service-cases.service.ts          ← ENRIQUECIDO: método getCockpit()
    service-cases.controller.ts       ← ENRIQUECIDO: endpoint getCockpit
    service-cases.routes.ts           ← ENRIQUECIDO: GET /:id/cockpit
  planning-packet/
    planning-packet.service.ts        ← ENRIQUECIDO: getReadiness(), approveWithReadinessCheck()
    planning-packet.routes.ts         ← ENRIQUECIDO: GET /:id/readiness, POST /:id/approve
  cost/
    cost.service.ts                   ← ENRIQUECIDO: getIntelligence()
    cost.routes.ts                    ← ENRIQUECIDO: GET /:orderId/intelligence
  cost-catalog/                       ← NUEVO módulo
    cost-catalog.model.ts
    cost-catalog.service.ts
    cost-catalog.controller.ts
    cost-catalog.routes.ts
  dashboard/
    dashboard.service.ts              ← ENRIQUECIDO: getOperationalKPIs(), getSLARiskOrders()
    dashboard.routes.ts               ← ENRIQUECIDO: GET /operational-kpis, GET /sla-risk
  technical-report/
    technical-report.service.ts       ← ENRIQUECIDO: autoDraft()
    technical-report.routes.ts        ← ENRIQUECIDO: POST /:id/auto-draft

frontend/src/modules/
  service-cases/
    ui/FourteenStepProgressBar.tsx    ← NUEVO
    ui/NextActionCard.tsx             ← NUEVO
    ui/BlockersPanelCollapsible.tsx   ← NUEVO
    ui/DocumentRequirementsPanel.tsx  ← NUEVO
    ui/CostSummaryInlineCard.tsx      ← NUEVO
    hooks/useCockpit.ts               ← NUEVO
    api/cockpit.api.ts                ← NUEVO
  planning-packet/
    ui/ReadinessGatesList.tsx         ← NUEVO
    ui/KitItemsChecklistDisplay.tsx   ← NUEVO
    ui/SafetyRequirementsDisplay.tsx  ← NUEVO
    hooks/usePlanningReadiness.ts     ← NUEVO
  cost/
    ui/BaselineCostCard.tsx           ← NUEVO
    ui/BudgetConsumedGauge.tsx        ← NUEVO
    ui/CostDeviationTable.tsx         ← NUEVO
    hooks/useCostIntelligence.ts      ← NUEVO
  technical-report/
    ui/TechnicalReportDraftPage.tsx   ← NUEVO o ENRIQUECIDO

frontend/src/app/(protected)/
  service-cases/[id]/cockpit/page.tsx ← NUEVA página
  planning-packets/[id]/readiness/page.tsx ← NUEVA página
  costs/[orderId]/intelligence/page.tsx    ← NUEVA página
  technical-reports/[id]/edit/page.tsx     ← NUEVA o ENRIQUECIDA

specs/013-cierre-brechas-criticas/
  audit-log.md                        ← tabla de auditoría Sprint 0
  baseline-*.txt                      ← outputs de gates antes de cambios
  slices/
    slice-01-ssot-enrichment.md
    slice-02-backend-endpoints.md
    slice-03-frontend-cockpit.md
    slice-04-reports-closure.md
    slice-05-notifications.md
  .sisyphus/evidence/
    s1-1-cost-typecheck.txt
    s1-2-kit-typecheck.txt
    ... (una por tarea)
    sprint1-full-typecheck.txt
    sprint2-build.txt
    sprint3-frontend-build.txt
    s2-1-cockpit.txt
    s2-2-readiness.txt
    s2-3-intelligence.txt
    s2-4-catalog-create.txt
    s2-5-kpis.txt
    s4-1-auto-draft.txt
  final-report.md                     ← estado final vs. auditoría inicial
```

---

*Spec-013 CERMONT — Generado el 3 de julio de 2026*  
*Fuentes: LTG Juan Diego Arévalo (file:431/440), Documento Operativo CERMONT SAS (file:433), Formato Planeación de Obra (file:430), Formato Inspección Líneas de Vida (file:434), Formato Mantenimiento CCTV (file:435), Reglas de Desarrollo CERMONT (file:432), Spec-012 Implementación Maestra (file:428)*
