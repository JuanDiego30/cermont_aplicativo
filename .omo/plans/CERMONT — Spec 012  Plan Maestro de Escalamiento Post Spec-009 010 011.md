# CERMONT — Spec 012: Plan Maestro de Escalamiento Post Spec-009/010/011

> **Repositorio:** [github.com/JuanDiego30/cermont_aplicativo](https://github.com/JuanDiego30/cermont_aplicativo)
> **Branch base:** `main` (último merge: Spec-009 Fleet+Evidence+Tools FSM, 30 Jun 2026)
> **Objetivo:** Pasar de nivel 2–3 a nivel 4–5 en los módulos críticos del flujo de 14 pasos, con campos enriquecidos, contenido profesional en cada página y pesos de modelo reales.

***

## 1. Estado Actual Auditado del Repositorio (Julio 2026)

### Lo que Spec-009/010/011 ya implementó

La auditoría de los últimos 20 commits confirma que se implementó lo siguiente en la semana del 29–30 de junio:

| Commit | Qué se implementó |
|--------|-------------------|
| `feat(fleet)` | Check-in/out persistente, VehicleCard con tabs, FleetAlertsBanner, document expiry alerts |
| `feat(evidence)` | FSM workflow `captured→uploaded→pending_review→approved→rejected→locked→archived`, endpoint verify/reject/replace, galería |
| `feat(tools)` | Certifications, calibrations, document tracking backend |
| `feat(schemas)` | Tool/vehicle/checklist schemas con FSM workflow y calibration fields |
| `feat(domain)` | RBAC updates, audit actions, contract snapshots fleet/tools/evidence |
| `fix(backend)` | Request body limit 10MB, FileAsset alignment, cost comparison, ERP connector |
| `spec-011 Wave 1–7` | ADRs 011/012/014, WebAuthn, privacy controller, React Doctor 92/100, quality:strict verde |
| `spec-011 Wave 2` | DashboardSlaWidget, FleetReadinessBadge, CostComparisonChart wired |

### Gaps Confirmados Después de Spec-009/011

Tras la auditoría de los schemas actuales en `packages/shared-types/src/schemas/`:

| Módulo | Gap Real Confirmado | Severidad |
|--------|---------------------|-----------|
| `execution-session.schema.ts` | No tiene `preflightGates` (EPP/AST/PTW como compuerta antes de `start_execution`); `estimatedMinutes` ausente para cronómetro real vs. estimado | 🔴 Crítico |
| `evidence.schema.ts` | `EvidenceWorkflowStatus` existe pero no tiene estado `replacement_requested`; los slots estructurados BEFORE/DURING/AFTER están en `EvidencePhaseSchema` pero no como **slots requeridos por orden** con contador de faltantes | 🔴 Crítico |
| `kit.schema.ts` | Separación tools/materials **YA EXISTE** (`tools`, `materials`, `epp` como arrays separados en `KitTemplateSchema`). Gap real: `materials` no tiene `isBillable` flag ni `unitCostCOP`; `tools` no tiene `catalogItemId` que lo vincule al catálogo global | 🟡 Moderado |
| `dashboard-summary.schema.ts` | Existe `DashboardCostVarianceSchema` y `DashboardAssetMaintenanceSchema`, pero falta: `mttr`, `mtbf`, `slaRiskOrders`, `pendingCertificationsCount`, `firstTimeFixRate`, `technicianUtilizationRate` | 🔴 Crítico |
| `cost.schema.ts` | No tiene `catalogItemId` (catálogo de ítems de costo), `budgetConsumedPercent`, `baselineCostId` (costo congelado de la propuesta), ni `margin` | 🔴 Crítico |
| `ServiceCase Cockpit` | El endpoint `GET /service-cases/:id/cockpit` **no existe** — es el gap más grande del producto | 🔴 Crítico |
| `PlanningPacket Readiness` | `GET /planning-packets/:id/readiness` **no existe**; no hay gate de bloqueo antes de start_execution | 🔴 Crítico |
| `TechnicalReport` / `DeliveryRecord` | Existen schemas (`closureReport.schema.ts`, `delivery-record.schema.ts`) pero no tienen generación automática desde datos de la orden | 🟡 Moderado |
| `InvoiceTracking` / `PaymentRecord` | `invoice.schema.ts` (13KB) existe y es robusto, pero falta: `agingDays`, `agingBucket`, `paymentReminderSentAt`, integración con pipeline visual en UI | 🟡 Moderado |
| Dashboard UI | Componentes wired (`DashboardSlaWidget`, `CostComparisonChart`) pero sin datos reales de MTTR/MTBF calculados desde `ExecutionSession` | 🔴 Crítico |

***

## 2. Software Profesional de Referencia 2026 — Qué Adoptar

### SAP Field Service Management 2605 (último update)

La actualización 2605 de SAP FSM refuerza cuatro temas estratégicos de largo plazo: **AI-driven field service, self-organised technicians, outcome-based service models, y modern extensible foundation**. Los elementos concretos que CERMONT debe adoptar de este release:[^1]

- **Creación directa de actividades desde planning board** con selección automática de técnico y tiempo según posición del cursor — referencia para el `PlanningPacket` con disponibilidad de técnicos
- **Medición en el nivel de actividad**: measurement points directamente en la actividad de campo — referencia para `ExecutionSession.measurements`
- **Mobile effort capture vía voz o texto** (Joule AI assistant) — referencia para AI Copilot MVP
- **Background sync mientras el técnico continúa trabajando** — la arquitectura offline de CERMONT ya lo tiene, pero falta el UX de "sincronizando en segundo plano" visible
- **Redesign de master data screens**: Business Partner, Contacts, Items, Equipment — referencia para las páginas de Herramientas y Flota

### Fracttal One — CMMS Latinoamérica

Fracttal One es el software de mantenimiento más adoptado en Latinoamérica, diseñado específicamente para activos físicos, operación diaria y decisiones basadas en el estado del equipo. Referencia directa para:[^2]

- **5 módulos en ruta de certificación**: carga de activos → gestión de órdenes → preventivo → KPIs → reportes — equivalente exacto al flujo de 14 pasos de CERMONT
- **Árbol de activos** con jerarquía ubicación/sistema/equipo — referencia para estructura de `Fleet` y `Tools`

### MaintainX — Work Order Templates 2026

MaintainX permite crear plantillas de órdenes con campos pre-poblados, campos ocultos, información read-only y clasificación `Preventive / Reactive / Other`. Además marca campos como **required** directamente en la plantilla. Referencia para `KitTemplate` y `ServiceCaseTemplate` en CERMONT.[^3]

### Tractian — Custom Fields CMMS 2026

Tractian lanzó en abril 2026 Custom Fields para Enterprise en los módulos: Requests, Work Orders, Activities, Assets, Locations, Asset Specifications, Inventory Items, Purchase Workflow. Esto confirma que el siguiente nivel de profesionalismo para CERMONT es el soporte de `customFields` dinámicos en los módulos principales.[^4]

### IFS FSM — Top 6 Platforms 2026

IFS FSM fue rankeado entre los top 6 para 2026 por su AI scheduling, mobile execution y technician productivity. Los diferenciadores que CERMONT debe adoptar: **first-time fix rate como KPI central** (referencia SAP FSM: benchmark 75–80% de first-time fix es el estándar de la industria), y **technician utilization rate** como métrica de rentabilidad operativa.[^5][^6]

***

## 3. Plan de Campos por Workspace — Pesos del Modelo

### 3.1 FASE 1 — `packages/shared-types` (SSOT de contratos)

#### 3.1.1 Enriquecer `execution-session.schema.ts`

**Gap confirmado:** No tiene compuerta preflight, no tiene `estimatedMinutes` para cronómetro, no tiene `slaDeadline` heredado de la orden.

```typescript
// NUEVO: PreflightGate — compuerta obligatoria antes de start_execution
export const PreflightGateItemSchema = z.object({
  key: z.string().min(1).max(80),           // "epp_complete", "ast_signed", "ptw_obtained"
  label: z.string().min(1).max(200),
  isBlocking: z.boolean().default(true),    // Si true, bloquea start_execution
  isChecked: z.boolean().default(false),
  checkedAt: z.string().datetime().optional(),
  checkedBy: ObjectIdSchema.optional(),
}).strict();

export const PreflightChecklistSchema = z.object({
  eppComplete: z.boolean().default(false),
  astSigned: z.boolean().default(false),    // Análisis de Trabajo Seguro
  ptwObtained: z.boolean().default(false),  // Permiso de Trabajo
  toolsValidated: z.boolean().default(false),
  vehicleDocumentsOk: z.boolean().default(false),
  items: z.array(PreflightGateItemSchema).default([]),
  completedAt: z.string().datetime().optional(),
  completedBy: ObjectIdSchema.optional(),
}).strict();

// MODIFICAR: ExecutionSessionSchema — agregar estos campos
// scheduledStartDate: z.string().datetime().optional()
// slaDeadline: z.string().datetime().optional()
// estimatedMinutes: z.number().int().positive().optional()
// elapsedMinutes: z.number().int().nonneg().optional()   // calculado en backend
// preflightChecklist: PreflightChecklistSchema.optional()
// fieldNovelties: z.array(FieldNoveltySchema).default([])
// supervisorSignatureRequired: z.boolean().default(false)
// assignedCrewIds: z.array(ObjectIdSchema).default([])  // ya existe como assignedCrew

// NUEVO: FieldNovelty — anomalía encontrada en campo
export const FieldNoveltySchema = z.object({
  noveltyId: z.string().uuid(),
  description: z.string().min(5).max(2000),
  severity: z.enum(["low", "medium", "high", "critical"]),
  evidenceIds: z.array(ObjectIdSchema).default([]),
  generatesWorkRequest: z.boolean().default(false),
  workRequestId: ObjectIdSchema.optional(),
  reportedAt: z.string().datetime(),
  reportedBy: ObjectIdSchema,
}).strict();

// NUEVO: ExecutionSessionBlockerCode — agregar nuevos valores
// "preflight_not_completed"
// "sla_deadline_exceeded"  
// "assigned_crew_empty"
```

#### 3.1.2 Enriquecer `evidence.schema.ts`

**Gap confirmado:** Faltan slots estructurados requeridos por orden, el estado `replacement_requested` no existe, y no hay `qualityScore`.

```typescript
// MODIFICAR: EvidenceWorkflowStatusSchema — agregar "replacement_requested"
// Estados completos: "captured" | "uploaded" | "pending_review" | "approved" 
//                 | "rejected" | "replacement_requested" | "locked" | "archived"

// NUEVO: EvidenceSlotRequirement — slot obligatorio por orden
export const EvidenceSlotSchema = z.object({
  slotId: z.string().min(1).max(80),         // "before_work", "during_work", "after_work"
  phase: EvidencePhaseSchema,                // "before" | "during" | "after"
  label: z.string().min(1).max(200),
  category: EvidenceCategorySchema.optional(),
  isRequired: z.boolean().default(true),
  isBlocking: z.boolean().default(false),    // Si true, bloquea cierre de fase
  evidenceId: ObjectIdSchema.optional(),     // ID si ya fue capturada
  fulfilledAt: z.string().datetime().optional(),
}).strict();

// MODIFICAR: EvidenceSchemaV2 — agregar campos
// qualityScore: z.number().int().min(0).max(100).optional()
// reviewedAt: z.string().datetime().optional()
// reviewedBy: ObjectIdSchema.optional()
// reviewNote: z.string().max(1000).optional()
// replacedBy: ObjectIdSchema.optional()    // ID de la evidencia que la reemplaza
// isRequired: z.boolean().default(false)
// slotId: z.string().max(80).optional()

// NUEVO: EvidenceSlotsRequirements — contrato para "cuántas faltan"
export const EvidenceSlotsRequirementsSchema = z.object({
  serviceCaseId: ObjectIdSchema,
  slots: z.array(EvidenceSlotSchema),
  requiredCount: z.number().int().nonneg(),
  fulfilledCount: z.number().int().nonneg(),
  pendingCount: z.number().int().nonneg(),
  blockingPendingCount: z.number().int().nonneg(),  // cuántos bloquean cierre
  canClosePhase: z.boolean(),
}).strict();
```

#### 3.1.3 Enriquecer `kit.schema.ts`

**Gap confirmado:** `materials` no tiene `isBillable`, `unitCostCOP`; `tools` no tiene `catalogItemId`.

```typescript
// MODIFICAR: KitItemSchema — agregar campos diferenciadores
// isBillable: z.boolean().default(false)        // Solo en materials
// unitCostCOP: z.number().nonneg().optional()   // Precio de referencia COP
// catalogItemId: z.string().optional()          // Vínculo a catálogo global
// returnRequired: z.boolean().default(true)     // Solo en tools/equipment

// NUEVO: KitSafetyRequirementsSchema (simplificado, no 20 campos por herramienta)
export const KitSafetyRequirementsSchema = z.object({
  eppList: z.array(z.string().min(1).max(100)).default([]),  // ["casco", "arnes", "gafas"]
  requiresAST: z.boolean().default(false),
  requiresPTW: z.boolean().default(false),
  riskAssessmentRequired: z.boolean().default(false),
  minimumTechnicianCertifications: z.array(z.string()).default([]),
}).strict();

// MODIFICAR: KitTemplateSchema — agregar safetyRequirements
// safetyRequirements: KitSafetyRequirementsSchema.optional()
```

#### 3.1.4 Enriquecer `dashboard-summary.schema.ts`

**Gap confirmado:** Faltan MTTR, MTBF, SLA risk, first-time fix rate, technician utilization.

```typescript
// NUEVO: DashboardOperationalKPISchema
export const DashboardOperationalKPISchema = z.object({
  // Métricas FSM estándar (benchmark industry: firstTimeFixRate >= 75%)
  mttrMinutes: z.number().nonneg(),           // Mean Time To Repair
  mtbfDays: z.number().nonneg(),              // Mean Time Between Failures
  firstTimeFixRate: z.number().min(0).max(100),  // % órdenes resueltas sin retorno
  technicianUtilizationRate: z.number().min(0).max(100), // % tiempo productivo
  averageResponseTimeHours: z.number().nonneg(),
  onTimeCompletionRate: z.number().min(0).max(100),
  currency: z.string().default("COP"),
  periodFrom: z.string().datetime(),
  periodTo: z.string().datetime(),
}).strict();

// NUEVO: DashboardSLARiskOrderSchema
export const DashboardSLARiskOrderSchema = z.object({
  orderId: z.string(),
  orderCode: z.string(),
  clientName: z.string().optional(),
  slaDeadline: z.string().datetime(),
  hoursRemaining: z.number(),
  currentStep: z.number().int().min(1).max(14),
  riskLevel: z.enum(["warning", "critical"]),
  assignedTechnicianName: z.string().optional(),
}).strict();

// MODIFICAR: DashboardSummarySchema — agregar nuevas secciones
// operationalKPIs: DashboardOperationalKPISchema
// slaRiskOrders: z.array(DashboardSLARiskOrderSchema).default([])
// pendingCertifications: z.array(PendingCertificationAlertSchema).default([])
```

#### 3.1.5 Enriquecer `cost.schema.ts`

**Gap confirmado:** No tiene catálogo, ni baseline congelado de propuesta, ni margin, ni `budgetConsumedPercent`.

```typescript
// NUEVO: CostCatalogItemSchema — catálogo de ítems de costo
export const CostCatalogItemSchema = z.object({
  _id: ObjectIdSchema.optional(),
  code: z.string().min(1).max(40),
  name: z.string().min(1).max(200),
  category: CostCategorySchema,
  unitCostCOP: z.number().nonneg(),
  unit: z.string().min(1).max(50),          // "hora", "m2", "unidad", "kg"
  isBillable: z.boolean().default(true),
  isActive: z.boolean().default(true),
  description: z.string().max(500).optional(),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
}).strict();

// NUEVO: BaselineCostSchema — costo congelado desde propuesta
export const BaselineCostSchema = z.object({
  proposalId: ObjectIdSchema,
  proposalCode: z.string().min(1).max(40),
  frozenAt: z.string().datetime(),          // Inmutable desde aprobación
  totalEstimatedCOP: z.number().nonneg(),
  byCategory: z.array(CostByCategorySchema),
}).strict();

// MODIFICAR: CostSummarySchema — agregar campos de inteligencia
// baselineCost: BaselineCostSchema.optional()
// totalMarginCOP: z.number()
// marginPercent: z.number()
// budgetConsumedPercent: z.number().min(0)
// isAtRisk: z.boolean()          // true si budgetConsumedPercent > 80%
// isCritical: z.boolean()        // true si budgetConsumedPercent > 100%

// NUEVO: CostIntelligenceSummarySchema — para el módulo de costos
export const CostIntelligenceSummarySchema = z.object({
  orderId: z.string(),
  orderCode: z.string(),
  baselineCost: BaselineCostSchema.optional(),
  totalEstimated: z.number().nonneg(),
  totalActual: z.number().nonneg(),
  totalMargin: z.number(),
  marginPercent: z.number(),
  budgetConsumedPercent: z.number().nonneg(),
  isAtRisk: z.boolean(),
  isCritical: z.boolean(),
  deviationByCategory: z.array(CostByCategorySchema),
  lastUpdatedAt: z.string().datetime(),
}).strict();
```

#### 3.1.6 Nuevo: `service-case-cockpit.schema.ts` (archivo nuevo — el gap más grande)

```typescript
// NUEVO ARCHIVO: packages/shared-types/src/schemas/service-case-cockpit.schema.ts
export const StepStatusEnum = z.enum([
  "pending", "in_progress", "completed", "blocked", "skipped"
]);

export const StepProgressSchema = z.object({
  step: z.number().int().min(1).max(14),
  label: z.string().min(1).max(100),
  moduleKey: z.string().min(1).max(80),      // "work_request", "site_visit", etc.
  status: StepStatusEnum,
  completedAt: z.string().datetime().optional(),
  completedBy: ObjectIdSchema.optional(),
  blockerReason: z.string().max(500).optional(),
  deepLink: z.string().max(300).optional(),  // URL directa al paso
}).strict();

export const NextExpectedActionSchema = z.object({
  stepNumber: z.number().int().min(1).max(14),
  description: z.string().min(1).max(500),
  assignedRoles: z.array(z.string().min(1).max(50)),
  dueDate: z.string().datetime().optional(),
  deepLink: z.string().max(300),
  urgency: z.enum(["normal", "urgent", "overdue"]),
}).strict();

export const ServiceCaseCockpitSchema = z.object({
  serviceCaseId: ObjectIdSchema,
  serviceCaseCode: z.string().min(1).max(40),
  clientName: z.string().max(200).optional(),
  workDescription: z.string().max(1000).optional(),
  stepProgress: z.array(StepProgressSchema),       // 14 pasos
  currentStep: z.number().int().min(1).max(14),
  completedSteps: z.number().int().min(0).max(14),
  nextExpectedAction: NextExpectedActionSchema,
  blockers: z.array(ExecutionSessionBlockerSchema), // reutiliza blocker existente
  documentRequirements: z.array(z.object({
    documentType: z.string().min(1).max(100),
    label: z.string().min(1).max(200),
    step: z.number().int().min(1).max(14),
    status: z.enum(["missing", "attached", "approved"]),
    fileAssetId: ObjectIdSchema.optional(),
  }).strict()).default([]),
  evidenceRequirements: EvidenceSlotsRequirementsSchema.optional(),
  costSummary: CostIntelligenceSummarySchema.optional(),
  riskLevel: z.enum(["low", "medium", "high", "critical"]),
  slaDeadline: z.string().datetime().optional(),
  slaStatus: z.enum(["on_track", "at_risk", "overdue"]).optional(),
  lastAuditEvents: z.array(z.object({
    event: z.string().min(1).max(200),
    entityType: z.string().min(1).max(80),
    actorName: z.string().max(200).optional(),
    occurredAt: z.string().datetime(),
  }).strict()).default([]),
  generatedAt: z.string().datetime(),
}).strict();
```

### 3.2 FASE 2 — `packages/domain`

Los cambios en `domain` deben seguir el patrón Contract-First. Nuevas reglas de negocio a agregar:

```typescript
// evaluatePreflightGates(session: ExecutionSession): PreflightResult
// → Retorna si TODOS los gates obligatorios están verificados antes de start_execution

// evaluateSLARisk(slaDeadline: Date, currentStep: number): SLARiskLevel
// → Retorna "on_track" | "at_risk" | "overdue" basado en tiempo restante y paso actual

// evaluateCostRisk(consumed: number, budget: number): CostRisk
// → "under_budget" (<60%) | "on_budget" (60-80%) | "at_risk" (80-100%) | "critical" (>100%)

// evaluateEvidenceCompleteness(slots: EvidenceSlot[]): CanClosePhase
// → Retorna si los slots blocking están todos completos

// computeMTTR(sessions: ExecutionSession[]): number (minutos)
// computeMTBF(orders: ServiceCase[]): number (días)
// computeFirstTimeFixRate(orders: ServiceCase[]): number (%)
// computeTechnicianUtilization(sessions: ExecutionSession[]): number (%)
```

### 3.3 FASE 3 — `backend/`

Nuevos endpoints a implementar en orden de prioridad:

| Prioridad | Endpoint | Módulo | Descripción |
|-----------|----------|--------|-------------|
| P0 | `GET /service-cases/:id/cockpit` | service-cases | Agrega stepProgress, blockers, costs, evidences, nextAction |
| P0 | `GET /planning-packets/:id/readiness` | planning-packets | Gate de disponibilidad: técnicos + vehículos + herramientas |
| P0 | `POST /planning-packets/:id/approve` | planning-packets | Aprobación con readiness check obligatorio |
| P1 | `POST /execution-sessions/:id/preflight` | execution-sessions | Registrar preflight gates (EPP, AST, PTW) |
| P1 | `GET /dashboard/operational-kpis` | dashboard | MTTR, MTBF, first-time fix rate, utilization |
| P1 | `GET /dashboard/sla-risk` | dashboard | Órdenes en riesgo de SLA por rol |
| P1 | `GET /costs/:orderId/intelligence` | costs | Baseline vs. actual, margin, risk level |
| P1 | `POST /costs/catalog` | costs | Crear ítem en catálogo de costos |
| P1 | `GET /costs/catalog` | costs | Listar catálogo de ítems de costo |
| P1 | `POST /evidence/:id/request-replacement` | evidence | Nuevo estado `replacement_requested` |
| P2 | `GET /reports/:serviceCaseId/auto-draft` | reports | Generar borrador de informe desde datos de la orden |
| P2 | `GET /service-cases/:id/invoice-pipeline` | invoices | Pipeline visual: SES→Factura→Pago con aging |

### 3.4 FASE 4 — `frontend/`

#### Páginas con mayor déficit de contenido

**`/dashboard` — Operating System**

Contenido faltante basado en software profesional:[^6][^1]

| Sección | Estado actual | Qué agregar |
|---------|---------------|-------------|
| KPI cards | Existe `DashboardSlaWidget` + `CostComparisonChart` wired | Agregar MTTR/MTBF cards, First-Time Fix Rate badge, Technician Utilization gauge |
| SLA Risk | `DashboardSlaWidget` existe | Conectar a `/dashboard/sla-risk` con datos reales calculados |
| Preflight alerts | No existe | `PendingCertificationsAlert` — herramientas/vehículos con vencimiento < 30 días |
| Next Actions por rol | No existe | `NextActionsByRolePanel` — filtrado por JWT role del usuario activo |
| Gráficos de tendencia | `ordersByMonth` en schema | `TrendLineChart` mensual de órdenes creadas vs. completadas (Recharts) |
| Cash flow funnel | No existe | `CashFlowFunnel` — dinero atascado: ejecutado sin SES, SES sin factura, factura sin pago |

**`/service-cases/:id` — Cockpit 14 Pasos**

Este es el mayor gap visual del producto — actualmente los datos están distribuidos en sub-páginas sin cohesión:

```
Nuevo componente: ServiceCaseCockpitPage
├── FourteenStepProgressBar          ← barra visual paso 1–14 con semáforo
│   ├── StepBubble (completado=verde, en_progreso=amarillo, bloqueado=rojo)
│   └── StepConnector (línea entre pasos)
├── CockpitHeaderCard                ← datos del cliente, código, SLA countdown
├── NextActionCard                   ← "Quién debe hacer qué ahora" + deep-link
├── BlockersPanelCollapsible         ← lista de bloqueos con links a resolución
├── Tabs de contenido:
│   ├── Tab "Documentos"             ← estado adjunto/faltante por fase
│   ├── Tab "Evidencias"             ← EvidenceGalleryByPhase + slots requeridos
│   ├── Tab "Costos"                 ← CostComparisonChart + CostCatalogSearch
│   ├── Tab "Timeline"               ← AuditTimeline con avatar + evento + fecha
│   └── Tab "Resumen Admin"          ← SES/Factura/Pago con pipeline visual
└── QuickActionsFAB                  ← botón flotante con acciones contextuales
```

**`/execution-sessions/:id` — Field Mode**

```
Campo faltante más crítico: PreflightGatesForm
├── ChecklistItem: "¿Tengo todos los EPP?" (isBlocking=true)
├── ChecklistItem: "¿El AST está firmado?" (isBlocking=true si requiresAST)
├── ChecklistItem: "¿El PTW está obtenido?" (isBlocking=true si requiresPTW)
├── ChecklistItem: "¿Las herramientas están validadas?" (isBlocking=true)
└── Botón "Iniciar ejecución" deshabilitado hasta completar todos los blocking items

Campo faltante: ExecutionTimer
├── Cronómetro: tiempo transcurrido vs. tiempo estimado
├── Barra de progreso: elapsedMinutes / estimatedMinutes
└── Alerta si supera 110% del tiempo estimado

Campo faltante: StructuredEvidenceCapture (slots BEFORE/DURING/AFTER)
├── Slot "Foto Antes" (before) — required, blocking
├── Slot "Foto Durante" (during) — required, non-blocking
├── Slot "Foto Después" (after) — required, blocking para cierre
└── Cada slot: cámara + galería + GPS automático + timestamp

Campo faltante: FieldNoveltyButton
├── Botón flotante "Reportar Novedad"
├── Modal: descripción, severidad, foto, ¿genera WorkRequest?
└── Si genera WorkRequest → POST /work-requests con link al parent order
```

**`/costs` — Cost Intelligence**

```
Qué agregar según SAP FSM y Fracttal One:
├── CostCatalogPanel (nueva página /costs/catalog)
│   ├── Lista de ítems con nombre, categoría, precio COP, unidad
│   ├── Búsqueda y filtro por categoría
│   └── CRUD con RBAC (solo residente/administrativo pueden crear)
├── BaselineCostCard
│   ├── Muestra el costo congelado de la propuesta aprobada (inmutable)
│   └── Fecha de congelamiento y número de propuesta vinculada
├── CostDeviationGauge
│   ├── Gauge circular: % presupuesto consumido (verde<60, amarillo<80, rojo>80)
│   └── Alerta automática cuando supera 80%
├── CostByCategory StackedBar
│   ├── Stacked bar: estimado vs. real por categoría (labor/materials/equipment)
│   └── Con exportación Excel vía TanStack Table
└── MarginSummaryCard
    ├── Ingreso total (propuesta) vs. costo total real
    └── Margen bruto en COP y %
```

**`/tools` — Herramientas GMAO**

El problema identificado: el checklist de herramientas es abrumador. La solución es aplicar el patrón Materiales vs. Herramientas ya confirmado en `kit.schema.ts`:

```
Página /tools — Vista simplificada:
├── ToolCard (minimal):
│   ├── Nombre + categoría (del catálogo)
│   ├── Calibration badge: vigente/vencida/próxima a vencer
│   ├── Availability badge: disponible/asignada/en_mantenimiento
│   └── Acciones: check-out, ver historial, adjuntar certificado
│
├── ToolDetailDrawer (en lugar de página separada):
│   ├── Tab "Información" → datos básicos del catálogo (sin repetir especificaciones)
│   ├── Tab "Calibraciones" → lista de CalibrationRecord con adjuntos PDF
│   ├── Tab "Historial de uso" → órdenes donde se usó esta herramienta
│   └── Tab "Documentos" → manual PDF, ficha técnica (vía FileAsset)
│
NO pedir 20 campos por herramienta al crear. Usar catálogo:
→ Usuario selecciona herramienta del catálogo
→ Solo ingresa: cantidad, ¿requiere certificación? (checkbox), fecha calibración
```

**`/fleet` — Vehículos GMAO**

Según commits ya implementados (`feat(fleet)`), ya existe VehicleCard con tabs y FleetAlertsBanner. Lo que falta:

```
Agregar a /fleet/:id:
├── Tab "Check-in/out" → ya implementado, falta historial de asignaciones
├── Tab "Documentos" → semáforo SOAT/tecnomecánica/seguro con fecha vencimiento
│   ├── DocumentExpiryAlert: alerta 30 días antes vía NotificationCenter
│   └── Upload PDF para cada documento
├── VehicleMaintenanceTimeline → historial de mantenimientos realizados
└── VehicleReadinessScore → 0-100% basado en documentos vigentes + mantenimiento al día
```

**`/checklist` / Checklists Blocking Engine**

```
ChecklistTemplate (mejorar con datos de MaintainX y SAP FSM):
├── Item types: boolean (check), text, number, photo, signature
├── isCritical flag → si critical, bloquea avance del paso
├── requiresPhoto → evidencia obligatoria para el ítem
├── requiresComment → comentario obligatorio
├── stage: "preflight" | "execution" | "post_execution" | "closure"
└── ChecklistStageSummary → badge que muestra X/Y completados

Integración con los 14 pasos:
├── Paso 5 (Planeación) → checklist de tipo "preflight"
├── Paso 6 (Ejecución) → checklist de tipo "execution" + "post_execution"
└── Paso 7–9 (Cierre doc) → checklist de tipo "closure"
```

***

## 4. Plan de Implementación por Sprints

### Secuencia correcta: No romper lo que funciona

**Contexto:** React Doctor ya está en 92/100, quality:strict verde, Spec-011 implementado. El baseline es estable. El siguiente paso es enriquecer el modelo de datos (SSOT) antes de construir UI.

### Sprint 1 — SSOT enrichment (2 semanas)

**Rama:** `git checkout -b implement/spec-012-ssot-enrichment`

**Objetivo:** Enriquecer los contratos Zod sin romper tests existentes. Todos los campos nuevos deben ser `optional()` o tener `.default()` para no romper los 1013+ tests.

| Tarea | Archivo | Acción |
|-------|---------|--------|
| S1.1 | `execution-session.schema.ts` | Agregar `PreflightChecklistSchema`, `FieldNoveltySchema`, `slaDeadline`, `estimatedMinutes` |
| S1.2 | `evidence.schema.ts` | Agregar `replacement_requested` al enum, `EvidenceSlotSchema`, `EvidenceSlotsRequirementsSchema` |
| S1.3 | `kit.schema.ts` | Agregar `isBillable`, `unitCostCOP`, `catalogItemId`, `returnRequired`, `KitSafetyRequirementsSchema` |
| S1.4 | `dashboard-summary.schema.ts` | Agregar `DashboardOperationalKPISchema`, `DashboardSLARiskOrderSchema` |
| S1.5 | `cost.schema.ts` | Agregar `CostCatalogItemSchema`, `BaselineCostSchema`, `CostIntelligenceSummarySchema` |
| S1.6 | `service-case-cockpit.schema.ts` | **Archivo nuevo** — `ServiceCaseCockpitSchema` completo |
| S1.7 | `packages/domain` | Agregar funciones `evaluatePreflightGates`, `evaluateSLARisk`, `evaluateCostRisk`, `evaluateEvidenceCompleteness` |

**Gate de salida:** `npm run typecheck` PASS · `npm test` PASS · `npm run contracts:check` PASS

### Sprint 2 — Backend endpoints críticos (2 semanas)

**Rama:** `git checkout -b implement/spec-012-backend-cockpit-readiness`

| Tarea | Endpoint | Descripción |
|-------|----------|-------------|
| S2.1 | `GET /service-cases/:id/cockpit` | Service que agrega datos de 14 módulos, calcula stepProgress, nextAction, blockers |
| S2.2 | `GET /planning-packets/:id/readiness` | Verifica disponibilidad de técnicos, vehículos, herramientas |
| S2.3 | `POST /planning-packets/:id/approve` | Aprobación con readiness check — rechaza si `canExecute = false` |
| S2.4 | `POST /execution-sessions/:id/preflight` | Registra estado de cada gate preflight |
| S2.5 | `GET /costs/:orderId/intelligence` | Baseline vs. actual, margin, budgetConsumedPercent |
| S2.6 | `GET/POST /costs/catalog` | CRUD del catálogo de ítems de costo |
| S2.7 | `GET /dashboard/operational-kpis` | MTTR, MTBF, firstTimeFixRate, technicianUtilization |
| S2.8 | `GET /dashboard/sla-risk` | Lista de órdenes en riesgo de SLA con horasRestantes |

**Gate de salida:** Todos los endpoints con tests unitarios + integration tests. `npm run build` PASS.

### Sprint 3 — Frontend Cockpit 14 Pasos (2 semanas)

**Rama:** `git checkout -b implement/spec-012-cockpit-ui`

| Componente | Página | Prioridad |
|-----------|--------|-----------|
| `FourteenStepProgressBar` | `/service-cases/:id/cockpit` | P0 |
| `NextActionCard` | `/service-cases/:id/cockpit` | P0 |
| `BlockersPanelCollapsible` | `/service-cases/:id/cockpit` | P0 |
| `CockpitTabs` (Docs/Evidencias/Costos/Timeline) | `/service-cases/:id/cockpit` | P0 |
| `PreflightGatesForm` | `/execution-sessions/:id` | P0 |
| `ExecutionTimer` | `/execution-sessions/:id` | P1 |
| `StructuredEvidenceCapture` (slots BEFORE/DURING/AFTER) | `/execution-sessions/:id` | P0 |
| `FieldNoveltyButton` (FAB) | `/execution-sessions/:id` | P1 |

**Gate de salida:** React Doctor ≥ 92/100 mantenido · E2E smoke tests para cockpit · RBAC correcto por rol.

### Sprint 4 — Dashboard Operating System (2 semanas)

**Rama:** `git checkout -b implement/spec-012-dashboard-os`

| Componente | Conectar a | Datos calculados |
|-----------|------------|-----------------|
| `MTTRMTBFCards` | `/dashboard/operational-kpis` | Desde `ExecutionSession` startedAt/completedAt |
| `FirstTimeFixRateGauge` | `/dashboard/operational-kpis` | Órdenes sin retorno / total completadas |
| `SLARiskOrdersTable` | `/dashboard/sla-risk` | Filtrado por rol activo |
| `CashFlowFunnel` | `/dashboard/summary` | Ejecutado→SES→Factura→Pago por monto |
| `NextActionsByRolePanel` | `/dashboard/summary` | Filtrado por JWT `role` |
| `PendingCertificationsAlert` | `/dashboard/summary` → `assetMaintenance` | Vehículos/herramientas < 30 días |

**Gate de salida:** Dashboard muestra datos reales (no mock) para 4 roles distintos. Exportación PDF/Excel funcional.

### Sprint 5 — Cost Intelligence + Catálogo (1 semana)

| Tarea | Descripción |
|-------|-------------|
| S5.1 | Página `/costs/catalog` con CRUD de `CostCatalogItem` |
| S5.2 | `CostCatalogSearch` en el formulario de add-cost (búsqueda inline en catálogo) |
| S5.3 | `BaselineCostCard` en la vista de costos de la orden (costo congelado) |
| S5.4 | `BudgetConsumedGauge` con alerta automática >80% |
| S5.5 | `CostDeviationStackedBar` con Recharts |
| S5.6 | Exportación Excel del resumen de costos con TanStack Table |

### Sprint 6 — Informes Automáticos + Firma Digital (2 semanas)

| Tarea | Descripción |
|-------|-------------|
| S6.1 | `GET /reports/:serviceCaseId/auto-draft` — endpoint de generación automática desde datos de la orden |
| S6.2 | `TechnicalReportDraftPage` — vista previa editable antes de aprobar |
| S6.3 | `DigitalSignaturePad` — canvas de firma con `signature_pad` para técnico y cliente |
| S6.4 | Exportación PDF con `@react-pdf/renderer` (report + acta de entrega) |
| S6.5 | `ReportVersionHistory` — historial con changelog (quién editó qué y cuándo) |

***

## 5. Qué Solicitar en Cada Página — Campos por Paso del Flujo

### Paso 1 — WorkRequest (`/work-requests/new`)

Campos actuales + nuevos campos a agregar:

| Campo | Tipo | ¿Nuevo? | Obligatorio | Regla de negocio |
|-------|------|---------|-------------|-----------------|
| `clientId` | ObjectId (select) | No | Sí | Debe existir en catálogo de clientes |
| `siteId` | ObjectId (select) | Sí | No | Ubicación/obra donde se ejecutará |
| `serviceType` | enum | No | Sí | eléctrico/mecánico/civil/telecomunicaciones |
| `priority` | enum | No | Sí | low/medium/high/critical → afecta SLA |
| `entryChannel` | enum | **Nuevo** | Sí | "client_portal" / "phone" / "email" / "internal" / "preventive" |
| `initialSLAHours` | number | **Nuevo** | No | Horas SLA según prioridad (auto-calculado) |
| `requestedByName` | string | **Nuevo** | No | Nombre del solicitante si viene por teléfono/email |
| `attachments` | FileAsset[] | No | No | Fotos, planos, documentos de referencia |
| `description` | text | No | Sí | Mínimo 20 caracteres |

### Paso 2 — SiteVisit (`/site-visits/:id`)

| Campo | Tipo | ¿Nuevo? | Obligatorio |
|-------|------|---------|-------------|
| `scheduledDate` | datetime | No | Sí |
| `technicianId` | ObjectId | No | Sí |
| `findings` | text | No | Sí si status = "completed" |
| `measurements` | array of {name, value, unit} | **Nuevo** | No | Mediciones tomadas en sitio |
| `photos` | EvidenceSlot[] | **Nuevo** | Sí | Al menos 1 foto del sitio |
| `technicalRecommendation` | text | **Nuevo** | Sí si status = "completed" |
| `requiresProposal` | boolean | **Nuevo** | Sí si status = "completed" |
| `estimatedComplexity` | enum | **Nuevo** | No | low/medium/high → ayuda a estimar costo |

### Paso 3 — Proposal (`/proposals/:id`)

| Campo | Tipo | ¿Nuevo? | Obligatorio |
|-------|------|---------|-------------|
| `scopeDescription` | text | No | Sí |
| `activities` | array of {description, laborHours, laborCostCOP} | No | Sí |
| `materials` | array de CostCatalogItem | **Nuevo** | Sí si hay materiales | Vincular al catálogo |
| `totalEstimatedCOP` | number (calculado) | No | Sí |
| `marginPercent` | number | **Nuevo** | No | % de margen objetivo |
| `validUntilDate` | date | **Nuevo** | Sí | Fecha de vencimiento de la propuesta |
| `version` | number | No | Auto | Incremental por cada revisión |
| `approvedAt` | datetime | No | Auto | Fecha en que el cliente aprueba |
| `frozenCostBaseline` | BaselineCost | **Nuevo** | Auto | Se congela al aprobar — inmutable |

### Paso 4 — PurchaseOrder (`/purchase-orders/:id`)

| Campo | Tipo | ¿Nuevo? | Obligatorio |
|-------|------|---------|-------------|
| `poNumber` | string | No | Sí |
| `poDate` | date | No | Sí |
| `clientName` | string | No | Sí |
| `totalAmountCOP` | number | No | Sí |
| `proposalId` | ObjectId | No | Sí |
| `pdfFileAssetId` | ObjectId (FileAsset) | No | Sí | PDF de la OC adjunto |
| `validationResult` | {isValid, deviation, deviationPercent} | **Nuevo** | Auto | Comparación automática vs. propuesta |
| `maxAllowedDeviationPercent` | number | **Nuevo** | No | Default 5% — alerta si supera |

### Paso 5 — PlanningPacket (`/planning-packets/:id`)

| Campo | Tipo | ¿Nuevo? | Obligatorio |
|-------|------|---------|-------------|
| `scheduledStartDate` | datetime | No | Sí |
| `estimatedDurationHours` | number | No | Sí |
| `assignedCrewIds` | ObjectId[] | No | Sí | Técnicos asignados |
| `supervisorId` | ObjectId | **Nuevo** | Sí | Responsable HES |
| `vehicleIds` | ObjectId[] | No | No | Vehículos asignados |
| `kitId` | ObjectId | No | No | Kit típico aplicado |
| `readinessGates` | PlanningReadiness | **Nuevo** | Auto | Calculado al consultar /readiness |
| `canExecute` | boolean | **Nuevo** | Auto | `false` si algún gate de readiness falla |
| `blockingReasons` | string[] | **Nuevo** | Auto | Lista de razones de bloqueo |
| `siteAccessPermits` | string[] | **Nuevo** | No | Permisos de acceso al sitio |

### Paso 6 — ExecutionSession (`/execution-sessions/:id`)

| Campo | Tipo | ¿Nuevo? | Obligatorio |
|-------|------|---------|-------------|
| `preflightChecklist` | PreflightChecklist | **Nuevo** | Sí antes de start | Gate bloqueante |
| `estimatedMinutes` | number | **Nuevo** | No | Heredado de PlanningPacket |
| `startedAt` | datetime | No | Auto |
| `elapsedMinutes` | number | **Nuevo** | Auto | Calculado en backend |
| Slot "Foto Antes" | EvidenceSlot (phase=before) | **Nuevo** | Sí | Bloqueante para iniciar |
| Slot "Foto Durante" | EvidenceSlot (phase=during) | **Nuevo** | Sí | No bloqueante |
| Slot "Foto Después" | EvidenceSlot (phase=after) | **Nuevo** | Sí | Bloqueante para completar |
| `checklistResponses` | array | No | Sí si hay checklists | Ya existe |
| `materialsUsed` | array | No | Sí | Consumo real vs. planeado |
| `laborEntries` | array | No | Sí | Horas reales por técnico |
| `fieldNovelties` | FieldNovelty[] | **Nuevo** | No | Anomalías encontradas |
| `supervisorSignature` | ExecutionSignature | No | Sí para completar | Ya existe |

### Pasos 7–9 — Reports + DeliveryRecord + ClientAcceptance

| Campo | Tipo | ¿Nuevo? | Módulo |
|-------|------|---------|--------|
| `autoGeneratedDraft` | boolean | **Nuevo** | TechnicalReport | `true` si fue generado desde datos de la orden |
| `sourceDataSnapshot` | json | **Nuevo** | TechnicalReport | Snapshot de datos usados para generar el borrador |
| `templateId` | ObjectId | No | TechnicalReport | Plantilla por tipo de servicio |
| `versions` | array of {versionNumber, editedBy, editedAt, changeLog} | **Nuevo** | TechnicalReport + DeliveryRecord |
| `clientSignature` | ClientSignature | No | DeliveryRecord | Ya existe `client-signature.schema.ts` |
| `signedAt` | datetime | No | DeliveryRecord | Auto al firmar |
| `deliveryMethod` | enum | **Nuevo** | DeliveryRecord | "in_person" / "email" / "portal" |

### Pasos 10–14 — SES → Invoice → Payment

| Campo | Tipo | ¿Nuevo? | Módulo |
|-------|------|---------|--------|
| `generatedFromOrderId` | ObjectId | No | SES | Ya existe |
| `approvedByName` | string | **Nuevo** | SES | Nombre del aprobador del cliente |
| `agingDays` | number | **Nuevo** | Invoice | Calculado = hoy - invoiceDate |
| `agingBucket` | enum | **Nuevo** | Invoice | "current" / "30" / "60" / "90" / "over_90" |
| `reminderSentAt` | datetime | **Nuevo** | Invoice | Última vez que se envió recordatorio |
| `paymentMethod` | enum | **Nuevo** | Payment | "transfer" / "check" / "cash" / "card" |
| `bankReference` | string | **Nuevo** | Payment | Número de referencia bancaria |
| `orderFullyClosed` | boolean | **Nuevo** | ServiceCase | `true` cuando pago registrado = 100% de factura |

***

## 6. Prompt Maestro para Ejecutar en Cursor/Claude Code

Copiar y pegar en el agente de desarrollo:

```
Eres el Arquitecto Principal de CERMONT S.A.S. Debes ejecutar la Spec-012 en fases
atómicas sobre la rama `implement/spec-012-ssot-enrichment`. 

REGLAS: SOLID, DRY, KISS, Contract-First, no any/null/unknown/undefined, no romper
tests existentes (1013+), no eliminar funcionalidad, solo enriquecer, SSOT=FileAsset,
offline-first.

FASE 1 — SSOT enrichment (solo packages/shared-types y packages/domain):

1. En `execution-session.schema.ts`:
   - Agregar `PreflightGateItemSchema` y `PreflightChecklistSchema` como schemas
     independientes con `.strict()`
   - En `EXECUTION_BLOCKER_VALUES` agregar: "preflight_not_completed", "sla_deadline_exceeded"
   - En `ExecutionSessionSchema` agregar (todos opcionales para no romper tests):
     `slaDeadline?: string.datetime`, `estimatedMinutes?: number.int.positive`,
     `elapsedMinutes?: number.int.nonneg`, `preflightChecklist?: PreflightChecklistSchema`,
     `fieldNovelties: z.array(FieldNoveltySchema).default([])`
   - Agregar `FieldNoveltySchema` con campos: noveltyId, description, severity,
     evidenceIds, generatesWorkRequest, workRequestId, reportedAt, reportedBy

2. En `evidence.schema.ts`:
   - Agregar "replacement_requested" a `EvidenceWorkflowStatusSchema`
   - Agregar `EvidenceSlotSchema` y `EvidenceSlotsRequirementsSchema`
   - En `EvidenceSchemaV2` agregar (todos opcionales): qualityScore, reviewedAt,
     reviewedBy, reviewNote, replacedBy, isRequired, slotId

3. En `kit.schema.ts`:
   - En `KitItemSchema` agregar: `isBillable: z.boolean().default(false)`,
     `unitCostCOP: z.number().nonneg().optional()`, `catalogItemId: z.string().optional()`,
     `returnRequired: z.boolean().default(true)`
   - Agregar `KitSafetyRequirementsSchema` como schema independiente
   - En `KitTemplateSchema` agregar `safetyRequirements: KitSafetyRequirementsSchema.optional()`

4. En `dashboard-summary.schema.ts`:
   - Agregar `DashboardOperationalKPISchema` (mttrMinutes, mtbfDays, firstTimeFixRate,
     technicianUtilizationRate, averageResponseTimeHours, onTimeCompletionRate)
   - Agregar `DashboardSLARiskOrderSchema`
   - En `DashboardSummarySchema` agregar (opcionales):
     `operationalKPIs?: DashboardOperationalKPISchema`,
     `slaRiskOrders: z.array(DashboardSLARiskOrderSchema).default([])`

5. En `cost.schema.ts`:
   - Agregar `CostCatalogItemSchema`, `BaselineCostSchema`, `CostIntelligenceSummarySchema`
   - En `CostSummarySchema` agregar (opcionales): baselineCost, totalMarginCOP,
     marginPercent, budgetConsumedPercent, isAtRisk, isCritical

6. Crear `packages/shared-types/src/schemas/service-case-cockpit.schema.ts` (archivo nuevo)
   con: StepStatusEnum, StepProgressSchema, NextExpectedActionSchema,
   ServiceCaseCockpitSchema completo según especificación de la Spec-012

7. En `packages/domain`:
   - Agregar funciones: evaluatePreflightGates, evaluateSLARisk, evaluateCostRisk,
     evaluateEvidenceCompleteness, computeMTTR, computeMTBF, computeFirstTimeFixRate

8. Actualizar `packages/shared-types/src/schemas/index.ts` con todos los exports nuevos

Al terminar cada archivo, ejecutar: npm run typecheck
Al terminar todos, ejecutar: npm test
NO avanzar a FASE 2 sin que FASE 1 tenga typecheck y tests pasando.
```

***

## 7. Guardrails y Lo que NO se Debe Hacer

1. ❌ No crear módulo `MediaAsset` — `FileAsset` es el SSOT
2. ❌ No agregar campos `required` sin `default()` en schemas existentes — rompe 1013+ tests
3. ❌ No introducir `any`, `unknown`, `null`, `undefined` explícitos — viola `quality:strict`
4. ❌ No hardcodear roles en el frontend — usar JWT claims y RBAC del domain
5. ❌ No reemplazar VPS por Vercel sin decisión explícita del equipo
6. ❌ No avanzar a Sprint 3 (UI) sin que el endpoint `/service-cases/:id/cockpit` exista en Sprint 2
7. ❌ No pedir 20 especificaciones por herramienta — usar catálogo + campos mínimos
8. ❌ No agregar nuevas dependencias a `package.json` sin justificación y autorización
9. ❌ No introducir AI Copilot (P2) antes de que el cockpit y los informes automáticos (P1) estén estables
10. ❌ No afirmar que una funcionalidad está implementada sin tests y evidencia en el log

***

## 8. Librerías Adicionales Recomendadas para Esta Fase

| Librería | Uso específico | Instalación |
|---------|----------------|-------------|
| `signature_pad` | Canvas de firma digital en `ExecutionSession` y `DeliveryRecord` | `pnpm add signature_pad` |
| `@react-pdf/renderer` | Generación PDF de informes y actas en frontend | `pnpm add @react-pdf/renderer` |
| `date-fns` | Cálculo de `agingDays`, SLA countdown, MTTR/MTBF | Ya probablemente instalado |
| `recharts` | MTTRChart, TrendLineChart, CostDeviationStackedBar | Verificar si ya instalado |
| `@tanstack/react-table` | Exportación Excel del catálogo de costos y tablas avanzadas | Verificar si ya instalado |
| `html5-qrcode` | QR scanner para herramientas y vehículos (P2) | `pnpm add html5-qrcode` |

***

## 9. Resumen del Siguiente Prompt Maestro (Secuencia Correcta)

```
Sprint 1: SSOT enrichment → solo packages/ (sin tocar backend/frontend)
Sprint 2: Backend endpoints cockpit + readiness + cost intelligence  
Sprint 3: Frontend cockpit 14 pasos + preflight + evidence slots
Sprint 4: Dashboard OS con KPIs reales (MTTR/MTBF/SLA risk)
Sprint 5: Cost catalog + intelligence UI
Sprint 6: Auto-generated reports + digital signatures + PDF export
```

Cada sprint termina con: `typecheck ✅ · lint ✅ · test ✅ · build ✅ · contracts:check ✅`

---

## References

1. [SAP Field Service Management: Smarter Planning, Stronger ...](https://ondevicesolutions.com/sap-field-service-management-2605-update/) - This article breaks down the key themes of the 2605 SAP Field Service Management update and what the...

2. [Fracttal One, the software chosen by maintenance leaders - YouTube](https://www.youtube.com/watch?v=zutuntVEyQ8) - Fracttal One es el software de mantenimiento que ayuda a equipos a ganar control sobre sus activos, ...

3. [Create a Work Order Template - MaintainX Help Center](https://help.getmaintainx.com/create-a-work-order-template) - This article explains how to create a work order template and use it in MaintainX®. A work order tem...

4. [Custom Fields for CMMS Configuration - Tractian](https://tractian.com/en/blog/custom-fields-for-cmms-configuration-release) - With Custom Fields, Admin users can create new fields across key areas of the CMMS: Requests; Work O...

5. [Top 6 Field Service Management Platforms for 2026 - IFS Blog](https://blog.ifs.com/top-6-field-service-management-platforms-for-2026/) - Top 6 Field Service Management platforms for 2026, ranked for AI scheduling, mobile execution, and t...

6. [SAP Field Service Management: What It Does and When You Need It](https://www.spadoom.com/en/blog/unveil-the-power-of-field-service-management-with-sap-transform-your-business-to/) - The FSM market is valued at USD 5.49B, growing at 16% CAGR. Here's what SAP Field Service Management...

