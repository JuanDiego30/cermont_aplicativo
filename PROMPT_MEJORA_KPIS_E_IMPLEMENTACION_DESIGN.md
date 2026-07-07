# PROMPT: Mejora de KPIs e Implementación de Diseño — CERMONT

> **Audiencia:** Implementación directa  
> **Propósito:** Refactorizar KPIs genéricos (parecidos a IA) en KPIs contextuales del dominio real de CERMONT  
> **Dominios reales:** Líneas de vida, CCTV, anclajes estructurales, trabajo en altura, inspecciones técnicas, seguridad industrial petrolera (HSE), instalaciones/desinstalaciones

---

## 0. Diagnóstico: ¿Por qué los KPIs se ven "hechos con IA"?

El problema no es que los KPIs estén mal. Es que **no están contextualizados al dominio de CERMONT**. Un KPI de "MTTR" (Mean Time To Repair) es correcto para un CMMS genérico, pero CERMONT no repara máquinas — instala y certifica líneas de vida, monta sistemas CCTV, inspecciona anclajes estructurales y gestiona seguridad industrial en campo petrolero.

| KPI Genérico (AI-looking) | → KPI CERMONT Contextual |
|---|---|
| "Órdenes activas" | → "Líneas de vida en proceso de instalación" |
| "Tasa de cierre en tiempo" | → "% de certificaciones emitidas dentro del SLA contractual" |
| "MTTR promedio" | → "Tiempo promedio de corrección de hallazgos críticos en inspección" |
| "Costo real vs estimado global" | → "Desviación de presupuesto en instalación de líneas de vida vs materiales reales" |
| "Recursos en uso" | → "Técnicos certificados para trabajo en altura asignados vs disponibles" |
| "Checklists pendientes críticos" | → "ATS (Análisis de Trabajo Seguro) pendientes antes de inicio de obra" |
| "Ingresos del mes" | → "Valor facturado en certificaciones de líneas de vida vs meta mensual" |

---

## 1. KPIs Refactorizados por Módulo (Domain-Specific)

### 1.1 Dashboard: KPIs de Líneas de Vida y Seguridad Industrial

Reemplazar KPIs genéricos con los siguientes:

```
BLOQUE A — Líneas de Vida (lifelines)
  [A1] Líneas de vida instaladas este mes / meta mensual
       → Fuente: EvidenceSchemaV2.technicalCategory === "lineas_de_vida" + serviceCase status
       → Target: 12/mes
  [A2] Certificaciones de líneas de vida emitidas vs pendientes
       → Fuente: TechnicalReport con type=lifeline_certification
       → Badge: alerta si >5 pendientes
  [A3] Metros lineales certificados en el período (acumulado)
       → Fuente: cost items con category="lifeline" + measurement data
       → Tendencia: comparación mes anterior
  [A4] Hallazgos críticos en inspección de líneas de vida
       → Fuente: Evidence con category="defect" + technicalCategory="lineas_de_vida"
       → Clasificación: crítico/moderado/leve
  [A5] Pruebas de tensión realizadas / programadas
       → Fuente: Checklist con type="pull_test"
       → Target: 100% programado

BLOQUE B — CCTV y Sistemas de Vigilancia
  [B1] Cámaras instaladas en el período / meta del proyecto
       → Fuente: Evidence con technicalCategory="cctv" + category="installation"
  [B2] Pruebas de funcionamiento exitosas / total
       → Fuente: Checklist con type="cctv_test"
       → Target: >95% éxito primera prueba
  [B3] Puntos ciegos identificados y pendientes de corrección
       → Fuente: Evidence con category="defect" + technicalCategory="cctv"
  [B4] Grabación verificada (días de respaldo operativo)
       → Fuente: Checklist de calidad

BLOQUE C — Anclajes Estructurales
  [C1] Anclajes instalados en el período
       → Fuente: Evidence con technicalCategory="anclajes"
  [C2] Pruebas de tracción: pasadas / falladas
       → Fuente: Evidence con category="test" + technicalCategory="anclajes"
       → Alerta si >2 fallas consecutivas
  [C3] Certificaciones de anclajes vigentes / próximas a vencer
       → Fuente: Document con type="anchor_certification"
  [C4] Carga máxima registrada vs capacidad nominal
       → Fuente: Measurement data en evidencias

BLOQUE D — Seguridad Industrial (HSE / Petróleo)
  [D1] Días sin accidentes registrables (DART)
       → Fuente: Audit log + incident reports
  [D2] Permisos de trabajo en altura (PTA) emitidos hoy/esta semana
       → Fuente: SafetyAnalysis + FieldPermit
  [D3] EPP en campo: % de técnicos con verificación de EPP completa
       → Fuente: Checklist con type="epp"
  [D4] Casi accidentes reportados en el mes
       → Fuente: Evidence con category="incident" + phase="hse"
  [D5] ATS (Análisis de Trabajo Seguro) completado antes de inicio de obra
       → Fuente: SafetyAnalysis vinculado a ExecutionSession
       → Bloqueante: no iniciar ejecución sin ATS OK

BLOQUE E — Flujo Operativo (14 pasos)
  [E1] Casos en cada etapa del pipeline
       → Fuente: ServiceCase status machine
  [E2] Tiempo promedio por etapa (días en work_request, días en planning, etc.)
       → Fuente: Audit log timestamps por paso
       → Alerta si cualquier etapa excede 2x el tiempo promedio histórico
  [E3] Casos bloqueados por etapa y motivo
       → Fuente: WorkflowBlocker
  [E4] Tasa de conversión solicitud → propuesta → orden
       → Fuente: WorkRequest → Proposal → ServiceCase

BLOQUE F — Eficiencia Operativa
  [F1] Sesiones de ejecución completadas dentro del tiempo estimado
       → Fuente: ExecutionSession (startTime, endTime vs estimatedMinutes)
       → Target: >80%
  [F2] Checklists de seguridad completados antes de ejecución
       → Fuente: ChecklistResponse vinculado a ExecutionSession
  [F3] Evidencias con geolocalización / total evidencias
       → Fuente: EvidenceSchemaV2.gpsLocation presente
  [F4] Cola de sincronización offline: items pendientes / total
       → Fuente: OfflineEvidencePayload.syncStatus
  [F5] Tasa de éxito de sincronización offline
       → Fuente: Sync registry
       → Alerta si <95%

BLOQUE G — Costos y Gestión Financiera
  [G1] Desviación de costo real vs estimado por categoría
       → Fuente: CostSummary.variancePercent
       → Categorías: labor/materials/equipment/transport/subcontract
  [G2] Consumo de presupuesto por orden (% gastado)
       → Fuente: CostByCategory (estimated vs actual)
       → Alerta si >80%
  [G3] Rentabilidad por tipo de trabajo (lifeline vs cctv vs anchors)
       → Fuente: CostSummary por technicalCategory
  [G4] Facturas pendientes de pago por antigüedad
       → Fuente: Invoice con aging buckets
  [G5] Ciclo orden → factura (días promedio)
       → Fuente: Audit log desde STEP_01 hasta STEP_11
```

---

## 2. Contratos TypeScript / Zod para KPIs Refactorizados

### 2.1 KPI de Líneas de Vida

```typescript
// packages/shared-types/src/schemas/kpi-lifeline.schema.ts
export const LifelineKpiSchema = z.object({
  period: z.object({
    month: z.number().int().min(1).max(12),
    year: z.number().int(),
  }).strict(),

  // Instalación
  installedMeters: z.number().nonnegative(),          // Metros lineales instalados
  installationTargetMeters: z.number().nonnegative(),  // Meta del período
  installationCompletionPct: z.number().min(0).max(100),

  // Certificación
  certifiedLifelines: z.number().int().nonnegative(),
  pendingCertifications: z.number().int().nonnegative(),
  certificationCycleDays: z.number().nonnegative(),   // Días promedio instalación→certificación

  // Hallazgos
  criticalFindings: z.number().int().nonnegative(),
  moderateFindings: z.number().int().nonnegative(),
  minorFindings: z.number().int().nonnegative(),
  findingsResolvedPct: z.number().min(0).max(100),

  // Pruebas
  pullTestsPassed: z.number().int().nonnegative(),
  pullTestsFailed: z.number().int().nonnegative(),
  pullTestsPassRate: z.number().min(0).max(100),
});

export type LifelineKpi = z.infer<typeof LifelineKpiSchema>;
```

### 2.2 KPI de Seguridad Industrial (HSE)

```typescript
// packages/shared-types/src/schemas/kpi-hse.schema.ts
export const HseKpiSchema = z.object({
  period: z.object({
    month: z.number().int().min(1).max(12),
    year: z.number().int(),
  }).strict(),

  // Seguridad
  daysWithoutIncident: z.number().int().nonnegative(),
  totalIncidents: z.number().int().nonnegative(),
  nearMisses: z.number().int().nonnegative(),
  firstAidCases: z.number().int().nonnegative(),
  recordableIncidents: z.number().int().nonnegative(),

  // Permisos
  heightWorkPermitsIssued: z.number().int().nonnegative(),
  atsCompleted: z.number().int().nonnegative(),
  atsRequired: z.number().int().nonnegative(),
  atsCompliancePct: z.number().min(0).max(100),

  // EPP
  techniciansWithEppVerification: z.number().int().nonnegative(),
  totalActiveTechnicians: z.number().int().nonnegative(),
  eppCompliancePct: z.number().min(0).max(100),

  // Inspecciones
  safetyInspectionsCompleted: z.number().int().nonnegative(),
  safetyInspectionsScheduled: z.number().int().nonnegative(),
  criticalSafetyFindingsOpen: z.number().int().nonnegative(),
  avgCorrectionDays: z.number().nonnegative(),       // Días promedio para corregir hallazgo crítico
});

export type HseKpi = z.infer<typeof HseKpiSchema>;
```

### 2.3 KPI de Ejecución en Campo

```typescript
// packages/shared-types/src/schemas/kpi-execution.schema.ts
export const ExecutionKpiSchema = z.object({
  period: z.object({
    month: z.number().int().min(1).max(12),
    year: z.number().int(),
  }).strict(),

  // Sesiones
  totalSessions: z.number().int().nonnegative(),
  sessionsWithinTime: z.number().int().nonnegative(),
  sessionsOverTime: z.number().int().nonnegative(),
  timeCompliancePct: z.number().min(0).max(100),
  avgSessionDurationMinutes: z.number().nonnegative(),

  // Checklists
  totalChecklists: z.number().int().nonnegative(),
  checklistsCompletedBeforeStart: z.number().int().nonnegative(),
  checklistCompletionRate: z.number().min(0).max(100),

  // Evidencias
  totalEvidenceCaptured: z.number().int().nonnegative(),
  evidenceWithGps: z.number().int().nonnegative(),
  evidenceGpsRate: z.number().min(0).max(100),
  evidenceWithCoords: z.number().int().nonnegative(),
  evidenceRejected: z.number().int().nonnegative(),
  evidenceRejectionRate: z.number().min(0).max(100),

  // Offline sync
  pendingSyncItems: z.number().int().nonnegative(),
  syncSuccessRate: z.number().min(0).max(100),
  failedSyncItems: z.number().int().nonnegative(),

  // Novedades
  noveltiesReported: z.number().int().nonnegative(),
  noveltiesResolved: z.number().int().nonnegative(),
});

export type ExecutionKpi = z.infer<typeof ExecutionKpiSchema>;
```

### 2.4 KPI de CCTV

```typescript
// packages/shared-types/src/schemas/kpi-cctv.schema.ts
export const CctvKpiSchema = z.object({
  period: z.object({
    month: z.number().int().min(1).max(12),
    year: z.number().int(),
  }).strict(),

  // Instalación
  camerasInstalled: z.number().int().nonnegative(),
  camerasTarget: z.number().int().nonnegative(),
  installationProgressPct: z.number().min(0).max(100),

  // Pruebas
  camerasTested: z.number().int().nonnegative(),
  camerasPassed: z.number().int().nonnegative(),
  testPassRate: z.number().min(0).max(100),

  // Calidad
  blindSpotsIdentified: z.number().int().nonnegative(),
  blindSpotsResolved: z.number().int().nonnegative(),
  recordingDaysVerified: z.number().int().nonnegative(),

  // Mantenimiento
  camerasUnderMaintenance: z.number().int().nonnegative(),
  camerasOperational: z.number().int().nonnegative(),
  systemUptimePct: z.number().min(0).max(100),
});

export type CctvKpi = z.infer<typeof CctvKpiSchema>;
```

### 2.5 KPI de Anclajes Estructurales

```typescript
// packages/shared-types/src/schemas/kpi-anchors.schema.ts
export const AnchorKpiSchema = z.object({
  period: z.object({
    month: z.number().int().min(1).max(12),
    year: z.number().int(),
  }).strict(),

  // Instalación
  anchorsInstalled: z.number().int().nonnegative(),
  anchorsPlanned: z.number().int().nonnegative(),
  installCompletionPct: z.number().min(0).max(100),

  // Pruebas
  pullTestsPerformed: z.number().int().nonnegative(),
  pullTestsPassed: z.number().int().nonnegative(),
  pullTestsFailed: z.number().int().nonnegative(),
  pullTestPassRate: z.number().min(0).max(100),
  consecutiveFailures: z.number().int().nonnegative(),

  // Certificación
  certifiedAnchors: z.number().int().nonnegative(),
  uncertifiedAnchors: z.number().int().nonnegative(),
  certExpiringNext30Days: z.number().int().nonnegative(),
  certExpiredAnchors: z.number().int().nonnegative(),

  // Carga
  maxLoadRecorded: z.number().nonnegative(),
  nominalCapacity: z.number().nonnegative(),
  loadUtilizationPct: z.number().min(0).max(100),
});

export type AnchorKpi = z.infer<typeof AnchorKpiSchema>;
```

### 2.6 KPI de Costos CERMONT

```typescript
// packages/shared-types/src/schemas/kpi-cost.schema.ts
export const CostKpiTechnicalCategorySchema = z.enum([
  "lineas_de_vida",
  "cctv",
  "anclajes",
  "general",
]);

export const CostKpiByServiceTypeSchema = z.object({
  serviceType: CostKpiTechnicalCategorySchema,
  totalEstimated: z.number().nonnegative(),
  totalActual: z.number().nonnegative(),
  variance: z.number(),
  variancePct: z.number(),
  orderCount: z.number().int().nonnegative(),
  avgOrderValue: z.number().nonnegative(),
  profitabilityPct: z.number(),
});
export type CostKpiByServiceType = z.infer<typeof CostKpiByServiceTypeSchema>;

export const CostKpiSchema = z.object({
  period: z.object({
    month: z.number().int().min(1).max(12),
    year: z.number().int(),
  }).strict(),

  // Rentabilidad por tipo de servicio
  byServiceType: z.array(CostKpiByServiceTypeSchema),

  // Desviación global
  globalEstimated: z.number().nonnegative(),
  globalActual: z.number().nonnegative(),
  globalVariance: z.number(),
  globalVariancePct: z.number(),

  // Consumo de presupuesto
  ordersOver80pctBudget: z.number().int().nonnegative(),
  ordersOver100pctBudget: z.number().int().nonnegative(),
  budgetBurnRate: z.number().min(0).max(100),

  // Facturación
  totalInvoiced: z.number().nonnegative(),
  totalCollected: z.number().nonnegative(),
  collectionRate: z.number().min(0).max(100),
  avgPaymentDays: z.number().nonnegative(),
});

export type CostKpi = z.infer<typeof CostKpiSchema>;
```

### 2.7 Dashboard Principal Unificado

```typescript
// packages/shared-types/src/schemas/kpi-dashboard.schema.ts
export const CermontDashboardKpiSchema = z.object({
  generatedAt: z.string().datetime(),
  period: z.object({
    month: z.number().int().min(1).max(12),
    year: z.number().int(),
  }).strict(),

  // Bloques por dominio CERMONT
  lifelines: LifelineKpiSchema.optional(),
  hse: HseKpiSchema.optional(),
  execution: ExecutionKpiSchema.optional(),
  cctv: CctvKpiSchema.optional(),
  anchors: AnchorKpiSchema.optional(),
  costs: CostKpiSchema.optional(),

  // Pipeline operativo 14 pasos
  pipeline: DashboardPipelineSummarySchema,

  // Actividad reciente
  recentActivity: z.array(
    z.object({
      event: z.string(),
      entityType: z.string(),
      entityCode: z.string().optional(),
      occurredAt: z.string().datetime(),
      actorName: z.string().optional(),
      technicalCategory: CostKpiTechnicalCategorySchema.optional(),
    }),
  ),

  // Sistema
  systemHealth: DashboardSystemHealthSchema.optional(),
});

export type CermontDashboardKpi = z.infer<typeof CermontDashboardKpiSchema>;
```

---

## 3. Mapa de Fuente de Datos → KPI

Cada KPI debe tener una fuente de datos verificable, no ser un número "calculado mágicamente":

| KPI | Fuente de Datos Primaria | Query/Métrica |
|-----|------------------------|---------------|
| Metros lineales instalados | CostItem con category=lifeline + quantity | SUM(quantity) WHERE category=lifeline AND phase=installation |
| Certificaciones pendientes | TechnicalReport sin fecha de firma WHERE type=lifeline_certification | COUNT(*) WHERE status!=completed |
| Hallazgos críticos | Evidence con category=defect + severity=critical | COUNT(*) WHERE category=defect |
| Pruebas de tracción pasadas | ChecklistResponse con type=pull_test + result=pass | COUNT(*) WHERE result=pass |
| Días sin accidentes | Incident log - fecha del último incidente | DATEDIFF(now, last_incident_date) |
| Permisos de trabajo en altura | SafetyAnalysis con type=height_work | COUNT(*) WHERE date=today |
| Sesiones dentro de tiempo | ExecutionSession WHERE duration <= estimatedMinutes | COUNT(*) / total_sessions |
| Evidencias con GPS | EvidenceSchemaV2 WHERE gpsLocation IS NOT NULL | COUNT(*) / total_evidence |
| Desviación de costo real vs estimado | CostSummary.variancePct | AVG(variancePct) por categoría |
| Rentabilidad por tipo de servicio | CostSummary agrupado por technicalCategory | (totalActual - totalEstimated) / totalEstimated |

---

## 4. Checklist de Implementación de Diseño (DESIGN.md)

Cada KPI card en frontend debe implementar:

### 4.1 Anatomía de KPI Card (DESIGN.md §11-12)

```
┌──────────────────────────────────┐
│ [icono 40px circular]  [chip]    │ ← icono semántico + badge opcional
│ Label KPI                        │ ← "Líneas de vida instaladas"
│ 1,247  m                         │ ← valor grande (con unidad)
│ ▲ +12% vs mes anterior           │ ← delta / tendencia
│ Meta: 1,500 m  ████████░░ 83%    │ ← barra de progreso contra meta
└──────────────────────────────────┘
```

### 4.2 Mapa de Colores por Dominio

| Dominio CERMONT | Color KPI Card | Icono |
|----------------|---------------|-------|
| Líneas de vida | Azul CERMONT (`#2154A6`) | `life-buoy` o `anchor` |
| CCTV / Vigilancia | Azul claro (`#3A78D8`) | `camera` |
| Anclajes | Navy (`#0F2C59`) | `lock` o `hard-hat` |
| Seguridad HSE | Rojo éxito-verde según estado (`#4CAF50` / `#EF4444`) | `shield` o `alert-triangle` |
| Ejecución en campo | Verde (`#4CAF50`) | `zap` o `play-circle` |
| Costos y finanzas | Ámbar / Navy según balance | `dollar-sign` o `trending-up` |
| Offline / Sync | Gris → Verde al sincronizar | `wifi` o `cloud` |
| Pipeline 14 pasos | Variable por etapa | `layers` |

### 4.3 Estados Visuales por KPI

Cada KPI debe mostrar, además del valor:
- **Tendencia:** ▲ mejora / ▼ empeora / — sin cambio + porcentaje vs período anterior
- **Meta:** barra de progreso si aplica (instalación vs objetivo del mes)
- **Alerta:** si el valor cruza un umbral configurable (ej: hallazgos críticos > 3)
- **Empty state:** "Sin datos para este período" con icono suave

### 4.4 Implementación de Componentes (DESIGN.md §18)

Componentes requeridos para KPIs:

| Componente | Props | Responsive |
|-----------|-------|-----------|
| `KpiCard` | `icon, label, value, unit?, delta?, progress?, alert?` | 1 col móvil, 3-4 col desktop |
| `KpiGrid` | `items: KpiCard[], columns?: number, domain?: DomainType` | Grid responsive 12-col |
| `KpiTrend` | `direction: up/down/flat, pct: number, label?: string` | Inline compacto |
| `KpiProgress` | `current: number, target: number, unit?: string` | Barra con label |
| `KpiAlert` | `severity: warning/danger/info, message: string, action?: CTA` | Badge o banner |
| `DomainSection` | `domain: lifeline/cctv/anchor/hse, kpis: KpiCard[], chart?: ChartProps` | Sección con header |

---

## 5. Plan de Implementación Inmediata

### Fase 0: Schemas (ahora)

```
packages/shared-types/src/schemas/
├── kpi-lifeline.schema.ts     ← Líneas de vida
├── kpi-hse.schema.ts          ← Seguridad industrial
├── kpi-execution.schema.ts    ← Ejecución campo
├── kpi-cctv.schema.ts         ← CCTV
├── kpi-anchors.schema.ts      ← Anclajes
├── kpi-cost.schema.ts         ← Costos por tipo de servicio
└── kpi-dashboard.schema.ts    ← Dashboard unificado
```

### Fase 1: Backend Endpoints

```
GET /api/kpi/lifelines?month=6&year=2026    → LifelineKpi
GET /api/kpi/hse?month=6&year=2026           → HseKpi
GET /api/kpi/execution?month=6&year=2026     → ExecutionKpi
GET /api/kpi/cctv?month=6&year=2026          → CctvKpi
GET /api/kpi/anchors?month=6&year=2026       → AnchorKpi
GET /api/kpi/costs?month=6&year=2026         → CostKpi
GET /api/kpi/dashboard?month=6&year=2026     → CermontDashboardKpi (unificado)
```

### Fase 2: Frontend Components

```
frontend/src/modules/dashboard/
├── components/
│   ├── kpi/
│   │   ├── KpiCard.tsx              ← Card KPI atómica (DESIGN.md §12)
│   │   ├── KpiGrid.tsx              ← Grid de KPIs responsive
│   │   ├── KpiTrend.tsx             ← Indicador de tendencia
│   │   ├── KpiProgress.tsx          ← Barra de progreso vs meta
│   │   └── KpiAlert.tsx             ← Alerta accionable
│   ├── sections/
│   │   ├── LifelineKpiSection.tsx   ← Bloque líneas de vida
│   │   ├── HseKpiSection.tsx        ← Bloque seguridad industrial
│   │   ├── ExecutionKpiSection.tsx  ← Bloque ejecución campo
│   │   ├── CctvKpiSection.tsx       ← Bloque CCTV
│   │   ├── AnchorKpiSection.tsx     ← Bloque anclajes
│   │   └── CostKpiSection.tsx       ← Bloque costos y finanzas
│   └── dashboard/
│       ├── DashboardHero.tsx        ← Hero operativo (DESIGN.md §11.1.B)
│       ├── DashboardPipeline.tsx    ← Flujo 14 pasos (DESIGN.md §11.1.D)
│       ├── DashboardActivity.tsx    ← Actividad reciente (DESIGN.md §11.1.G)
│       └── DashboardCharts.tsx      ← Gráficos (DESIGN.md §11.1.F)
├── api/
│   └── kpi-queries.ts              ← TanStack Query hooks
└── types/
    └── kpi-types.ts                ← Re-export de shared-types
```

---

## 6. Anti-patrones a Evitar (de los KPIs genéricos originales)

Los siguientes KPIs NO deben aparecer en el dashboard refactorizado:

| ❌ No usar | Por qué es genérico | ✅ Reemplazar con |
|-----------|---------------------|-------------------|
| "Órdenes activas" | No distingue tipo de trabajo | "Líneas de vida en instalación activa" |
| "Tasa de cierre" | Sin contexto de servicio | "% certificaciones emitidas vs programadas" |
| "MTTR promedio" | CERMONT no es taller de reparaciones | "Días promedio corrección hallazgos críticos" |
| "Recursos en uso" | Sin especificar qué recursos | "Técnicos certificados ALTURA asignados vs disponibles" |
| "Ingresos del mes" | Genérico financiero | "Valor facturado en certificaciones líneas de vida" |
| "Órdenes completadas" | Genérico operativo | "Sesiones de instalación CCTV completadas en el mes" |
| "Checklists pendientes" | Sin contexto de seguridad | "ATS pendientes de elaboración antes de ejecución" |
| "Cumplimiento SLA" | Genérico, sin métrica específica | "% certificaciones emitidas dentro de 5 días hábiles" |

---

## 7. Regla de Validación: ¿Este KPI es CERMONT?

Antes de agregar un KPI al dashboard, hacer estas preguntas:

1. **¿Nombra un activo CERMONT?** (línea de vida, cámara CCTV, anclaje, permiso de trabajo, ATS)
2. **¿Se puede medir desde datos existentes?** (Evidence, CostItem, ChecklistResponse, AuditLog)
3. **¿Tiene un target o meta clara?** (no es solo "mostrar un número")
4. **¿Un gerente de CERMONT tomaría una decisión con él?**
5. **¿Está relacionado con al menos uno de los 14 pasos del flujo operativo?**

Si la respuesta a cualquiera es NO → el KPI es genérico y no debe estar en el dashboard.

---

## 8. Ejemplo: Antes vs Después del Dashboard

### Antes (KPIs genéricos — AI-looking)

```
┌──────────────┐ ┌──────────────┐ ┌──────────────┐ ┌──────────────┐
│ 📋 Órdenes  │ │ ✅ Tasa de  │ │ ⏱️ MTTR     │ │ 💰 Costo    │
│ activas     │ │ cierre      │ │ promedio     │ │ real vs est  │
│     47      │ │     78%     │ │    4.2h      │ │   +12.5%    │
└──────────────┘ └──────────────┘ └──────────────┘ └──────────────┘
```

### Después (KPIs contextuales CERMONT)

```
┌──────────────────┐ ┌──────────────────┐ ┌──────────────────┐ ┌──────────────────┐
│ ⚓ Líneas de    │ │ 🛡️ Hallazgos   │ │ 📷 Cámaras     │ │ 🔒 Anclajes    │
│ vida instaladas │ │ críticos abiertos│ │ instaladas/mes  │ │ certificados    │
│   1,247 / 1,500 │ │       3          │ │    42 / 50      │ │    156 / 180    │
│ ████████░░ 83%  │ │ ⚠️ +1 vs mes ant│ │ ▲ 84%           │ │ ████████░ 87%  │
│ ▲ +8%           │ │                  │ │                 │ │                 │
└──────────────────┘ └──────────────────┘ └──────────────────┘ └──────────────────┘
┌──────────────────┐ ┌──────────────────┐ ┌──────────────────┐ ┌──────────────────┐
│ 👷 Días sin    │ │ 📋 ATS         │ │ 💰 Rentabilidad │ │ 📶 Sync        │
│ accidentes      │ │ pendientes      │ │ líneas de vida  │ │ offline OK      │
│      127        │ │       2         │ │      +18.3%     │ │     98.2%       │
│ ✅ Récord del año│ │ ⛔ Bloqueante   │ │ vs -2.1% CCTV  │ │ 3 pendientes   │
└──────────────────┘ └──────────────────┘ └──────────────────┘ └──────────────────┘
```

---

## 9. Resumen de Cambios por Archivo

| Archivo | Acción | Prioridad |
|---------|--------|-----------|
| `packages/shared-types/src/schemas/kpi-lifeline.schema.ts` | CREAR | P0 |
| `packages/shared-types/src/schemas/kpi-hse.schema.ts` | CREAR | P0 |
| `packages/shared-types/src/schemas/kpi-execution.schema.ts` | CREAR | P0 |
| `packages/shared-types/src/schemas/kpi-cctv.schema.ts` | CREAR | P0 |
| `packages/shared-types/src/schemas/kpi-anchors.schema.ts` | CREAR | P0 |
| `packages/shared-types/src/schemas/kpi-cost.schema.ts` | CREAR | P0 |
| `packages/shared-types/src/schemas/kpi-dashboard.schema.ts` | CREAR | P0 |
| `packages/shared-types/src/schemas/index.ts` | ACTUALIZAR (exports) | P0 |
| `backend/src/modules/dashboard/` | CREAR service/controller/routes | P0 |
| `backend/src/modules/evidence/evidence.service.ts` | AGREGAR query de hallazgos | P1 |
| `frontend/src/modules/dashboard/` | CREAR componentes y secciones | P1 |
| `frontend/src/modules/dashboard/api/kpi-queries.ts` | CREAR hooks TanStack Query | P1 |
