# PROMPT MAESTRO — SPEC-014: Profesionalización Frontend, Cockpit 14 Pasos, Dashboard OS y Cierre del Ciclo Operativo

**Versión:** 1.0 — 4 de julio de 2026
**Repositorio:** https://github.com/JuanDiego30/cermont_aplicativo.git
**Rama base:** `deploy/vps-clean`
**Rama de trabajo:** `implement/spec-014-frontend-ciclo-completo`

---

## 0. IDENTIDAD DEL AGENTE

Actúa como **Principal Product Architect + Staff Full-Stack Engineer + QA Lead + Security Engineer**, experto en:
- Next.js 16, React 19, TanStack Query, shadcn/ui, Framer Motion, Recharts, Zod 4.x
- Express 5.2.1, Mongoose, MongoDB
- Monorepo con 3 workspaces: `backend/`, `frontend/`, `packages/`
- Contract-First development (Zod → Mongoose → Service → Controller → Route → Frontend hook → UI → Tests)
- FSM / GMAO / ERP operativo / PWA offline-first
- RBAC multi-rol, auditabilidad, idempotencia
- Flujo de 14 pasos de empresa contratista multiservicio

---

## 1. REGLA CERO — ANTI-ALUCINACIÓN Y AUDITORÍA PREVIA

**REGLAS ABSOLUTAS (de REGLAS_DESARROLLO_CERMONT.md — NO VIOLAR):**

1. **No trabajar en `main` ni en `deploy/vps-clean`** — siempre en rama nueva `implement/spec-014-frontend-ciclo-completo`
2. **No eliminar campos existentes de schemas** — solo agregar. Todo campo nuevo: `.optional()` o `.default()` para no romper tests baseline
3. **`FileAsset` es el SSOT** para archivos, evidencias y adjuntos — no crear `MediaAsset` ni esquemas duplicados
4. **Contract-First estricto:** Zod schema → tipo inferido → modelo Mongoose → service → controller → route → frontend api service → query keys → hook TanStack Query → UI → tests
5. **Prohibido `any`, `unknown`, `null`, `undefined`** explícitos nuevos
6. **No hardcodear roles** en frontend — usar JWT claims + RBAC del domain (`packages/domain/src/roles.ts`)
7. **No `try/catch` en controllers de Express 5** — Express 5 propaga errores automáticamente
8. **No `fetch` directo en componentes React** — usar `apiClient` + TanStack Query hooks
9. **Toda página crítica nueva** debe tener: loading / error / empty / offline / forbidden states
10. **Toda acción crítica** (aprobar, cerrar fase, rechazar evidencia, congelar baseline) debe auditarse
11. **No modificar `package.json`** sin justificación explícita y consulta
12. **No eliminar funcionalidad existente** sin reemplazarla, mejorarla o escalarla de forma verificada
13. **Nombres en inglés** para código interno. Español solo en texto visible al usuario
14. **Móvil primero** — todos los componentes deben funcionar en pantalla de 375px con touch targets ≥ 44px

### 1.1 Leer y verificar físicamente ANTES de empezar

```bash
# Schemas existentes de Spec-012/013
cat packages/shared-types/src/schemas/service-case-cockpit.schema.ts
cat packages/shared-types/src/schemas/cost.schema.ts
cat packages/shared-types/src/schemas/dashboard-summary.schema.ts
cat packages/shared-types/src/schemas/execution-session.schema.ts
cat packages/shared-types/src/schemas/evidence.schema.ts
cat packages/shared-types/src/schemas/kit.schema.ts
cat packages/shared-types/src/schemas/invoice.schema.ts

# Backend endpoints existentes
ls backend/src/modules/service-cases/
ls backend/src/modules/dashboard/
ls backend/src/modules/cost/
ls backend/src/modules/planning-packet/
ls backend/src/modules/execution-session/
ls backend/src/modules/evidence/
ls backend/src/modules/technical-report/
ls backend/src/modules/delivery-record/
ls backend/src/modules/invoice/
ls backend/src/modules/notifications/

# Frontend módulos existentes
ls frontend/src/modules/
ls frontend/src/app/
```

### 1.2 Auditoría previa: qué endpoints existen vs qué UI necesita

| Endpoint (Spec-012/013) | ¿Existe? | UI necesaria | Componente a crear |
|---|---|---|---|
| `GET /service-cases/:id/cockpit` | ? | Cockpit 14 pasos | `FourteenStepProgressBar`, `CockpitPage` |
| `GET /planning-packets/:id/readiness` | ? | Readiness gates view | `ReadinessGatesPanel` |
| `POST /execution-sessions/:id/preflight` | ? | Preflight checklist form | `PreflightGatesForm` |
| `GET /costs/:orderId/intelligence` | ? | Cost intelligence view | `CostIntelligencePage` |
| `GET /costs/catalog` | ? | Cost catalog CRUD | `CostCatalogPage` |
| `POST /costs/catalog` | ? | Cost catalog create | `CostCatalogForm` |
| `GET /dashboard/operational-kpis` | ? | Dashboard KPIs | `DashboardKPIWidgets` |
| `GET /dashboard/sla-risk` | ? | SLA risk table | `SLARiskTable` |
| `GET /execution-sessions/:id` | ? | Execution field mode | `FieldExecutionPage` |
| `GET /reports/:serviceCaseId/auto-draft` | ? | Auto-draft report | `AutoDraftReportPage` |

Guardar tabla en: `specs/014-frontend-profesionalizacion/audit-endpoints.md`

**SOLO después de completar la auditoría, proceder con la implementación.**

---

## 2. CONTEXTO DE NEGOCIO (del LTG — Juan Diego Arévalo)

### 2.1 Empresa
CERMONT S.A.S. es una empresa contratista multiservicio (ingeniería eléctrica, telecomunicaciones, civil, refrigeración, montajes industriales) que presta servicios en el **campo petrolero Caño Limón**, administrado por **Sierracol Energy**, Arauca, Colombia.

### 2.2 Las 5 fallas críticas (que Spec-014 debe resolver en la UI)

| Falla | Descripción | Resolución técnica (Spec-012/013) | Resolución UI (Spec-014) |
|---|---|---|---|
| **FALLA 1** | Planeación: herramientas/equipos incompletos | Readiness gates endpoint + KitSafetyRequirements schema | `ReadinessGatesPanel` visual + `PreflightGatesForm` |
| **FALLA 2** | Ejecución: olvido de herramientas/equipos | Preflight checklist schema + endpoint | `StructuredEvidenceCapture` + `FieldNoveltyButton` |
| **FALLA 3** | Informes/actas con retraso | TechnicalReport schema | `AutoDraftReport` + `ReportVersionHistory` |
| **FALLA 4** | Facturación oportuna | Invoice tracking endpoints + SLA risk | `InvoicePipelineVisual` + `AgingDashboard` |
| **FALLA 5** | Costos reales vs estimados | CostIntelligence schema + endpoint | `CostComparisonChart` + `BudgetConsumedGauge` |

### 2.3 Los 14 pasos operativos (flujo CERMONT)

| Paso | Entidad | Estado en Spec-013 | UI State en Spec-014 |
|---|---|---|---|
| 1 | WorkRequest | Schema exists | Pending (si no hay cambios) |
| 2 | SiteVisit | Schema exists | Pending |
| 3 | Proposal | Schema exists | Pending |
| 4 | PurchaseOrder | Schema exists | Pending |
| 5 | PlanningPacket | Readiness endpoint planned | 🎯 **Implementar** readiness UI |
| 6 | ExecutionSession | Preflight schema added | 🎯 **Implementar** field mode UI |
| 7 | TechnicalReport | Schema exists | 🎯 **Implementar** auto-draft |
| 8 | DeliveryRecord | Schema exists | 🎯 **Implementar** signature UI |
| 9 | ClientAcceptance | Schema exists | 🎯 **Implementar** acceptance view |
| 10 | ServiceEntrySheet | Schema exists | 🎯 **Implementar** SES pipeline |
| 11 | SESApproval | Schema exists | 🎯 **Implementar** approval tracking |
| 12 | InvoiceTracking | Schema exists | 🎯 **Implementar** invoice pipeline |
| 13 | InvoiceApproval | Schema exists | 🎯 **Implementar** approval view |
| 14 | PaymentRecord | Schema exists | 🎯 **Implementar** payment UI |

---

## 3. ANÁLISIS DE BRECHA: Spec-012/013 → Spec-014

### 3.1 Lo que Spec-012/013 YA implementaron (NO repetir)

| Componente | Status |
|---|---|
| Schemas enriquecidos (cost, kit, execution-session, dashboard, evidence) | Implementado en Spec-013 S1 |
| Backend endpoints (cockpit, readiness, cost intelligence, dashboard KPIs) | Implementado en Spec-013 S2 |
| Domain rules (preflight, SLA, cost risk, KPI computation) | Implementado en Spec-013 S1.6 |
| ServiceCaseCockpitSchema (archivo nuevo) | Implementado en Spec-013 S1.5 |

### 3.2 Lo que NO está implementado y Spec-014 DEBE cubrir

| Gap | Severidad | Sprint |
|---|---|---|
| **Frontend Cockpit 14 Pasos** — no existe la página unificada con progress bar, next action, blockers | 🔴 Crítico | S1 |
| **Dashboard OS con datos reales** — KPIs MTTR/MTBF sin conectar a UI | 🔴 Crítico | S2 |
| **Cost Intelligence UI** — catálogo, baseline card, budget gauge sin frontend | 🔴 Crítico | S2 |
| **Field Execution Mode** — preflight gates form, execution timer, evidence capture sin UI | 🔴 Crítico | S3 |
| **Evidence FSM UI** — visual workflow, rejection/replacement flow sin frontend | 🟡 Alto | S3 |
| **Auto-generated Reports** — endpoint + PDF export + digital signatures | 🟡 Alto | S4 |
| **Invoice/SES Pipeline Visual** — seguimiento SES→Factura→Pago con aging | 🟡 Alto | S4 |
| **Notifications Center** — in-app notifications panel | 🟡 Medio | S5 |
| **Portal Cliente básico** — vista limitada para rol "cliente" | 🟡 Medio | S5 |
| **E2E Tests** — Playwright tests para flujo completo de 14 pasos | 🟢 Moderado | S6 |
| **quality:strict + React Doctor** — estabilizar gates | 🟢 Moderado | S6 |

### 3.3 Backend endpoints complementarios que Spec-014 debe crear

| Endpoint | Módulo | Prioridad | Depende de |
|---|---|---|---|
| `POST /execution-sessions/:id/preflight` | execution-sessions | P0 | Schema PreflightChecklist (Spec-013) |
| `POST /planning-packets/:id/approve` | planning-packets | P0 | Readiness endpoint |
| `GET /reports/:serviceCaseId/auto-draft` | reports | P1 | TechnicalReport schema |
| `POST /evidence/:id/review` | evidence | P1 | EvidenceSlotsRequirements |
| `GET /notifications` | notifications | P1 | Notifications module |
| `GET /notifications/unread-count` | notifications | P1 | Notifications module |
| `POST /notifications/:id/read` | notifications | P1 | Notifications module |
| `GET /service-cases/:id/invoice-pipeline` | invoices | P1 | Invoice/Payment schemas |
| `POST /reports/:id/sign` | reports | P2 | Digital signature schema |
| `GET /portal/service-cases` | portal | P2 | Portal cliente |

---

## 4. SPRINT 1 — FRONTEND COCKPIT 14 PASOS

**Rama:** `implement/spec-014-frontend-ciclo-completo`
**Depende de:** Endpoint `GET /service-cases/:id/cockpit` existente (Spec-013 S2.1)
**Objetivo:** Construir la página unificada de seguimiento de los 14 pasos con progress bar, next action, blockers, timeline y tabs de contenido.

### S1.1 — Crear módulo frontend `cockpit/` con estructura feature-sliced

```typescript
// frontend/src/modules/cockpit/
//   api/
//     cockpit.api.ts          → fetchCockpit(serviceCaseId)
//   hooks/
//     useCockpit.ts           → useQuery para GET /service-cases/:id/cockpit
//     useCockpitMutations.ts  → useMutation para acciones del cockpit
//   ui/
//     FourteenStepProgressBar.tsx   → Barra visual paso 1-14 con semáforo
//     CockpitHeaderCard.tsx         → Código, cliente, SLA countdown, risk badge
//     NextActionCard.tsx            → "Quién debe hacer qué ahora" + deep-link
//     BlockersPanelCollapsible.tsx  → Lista de bloqueos con links a resolución
//     CockpitTabs.tsx               → Tabs: Documentos, Evidencias, Costos, Timeline
//     AuditTimeline.tsx             → Timeline de eventos auditados
//     DocumentRequirementsTable.tsx → Estado adjunto/faltante por fase
//   utils/
//     cockpitKeys.ts           → Query keys centralizadas
//   model/
//     cockpit.types.ts         → Tipos locales específicos del cockpit

// frontend/src/app/service-cases/[id]/cockpit/page.tsx  → Página Cockpit
```

### S1.1.1 — `FourteenStepProgressBar.tsx`

- Barra horizontal con 14 burbujas numeradas
- Colores: completado=verde (`#4CAF50`), en_progreso=amarillo (`#FFC107`), bloqueado=rojo (`#F44336`), pendiente=gris (`#9E9E9E`)
- Conectores entre burbujas que cambian de color según estado
- Paso actual destacado con borde/glow
- Tooltip al hover: label del paso + fecha de completado
- Responsive: horizontal scroll en mobile con snap points
- Props: `steps: StepProgress[]`, `currentStep: number`, `onStepClick?: (step: number) => void`

### S1.1.2 — `CockpitHeaderCard.tsx`

- Tarjeta superior con datos del service case
- Código del servicio (ej: SC-2026-0001)
- Nombre del cliente
- Descripción del trabajo (truncada con tooltip)
- Badge de riesgo: low🟢 / medium🟡 / high🟠 / critical🔴
- SLA countdown: "Vence en X horas" con color según urgencia
- Fecha de generación del cockpit
- Props: `cockpit: ServiceCaseCockpit`

### S1.1.3 — `NextActionCard.tsx`

- Tarjeta visual destacada: "⚠️ Próxima acción requerida"
- Muestra: paso número, descripción, roles asignados
- Badge de urgencia: normal=azul, urgent=naranja, overdue=rojo
- Botón "Ir ahora →" con deep-link
- Si hay fecha límite: countdown
- Props: `action: NextExpectedAction`

### S1.1.4 — `BlockersPanelCollapsible.tsx`

- Panel colapsable (default: expandido si hay blockers)
- Cada blocker: icono según severidad (warning/error), código, mensaje
- Si severity=error, fondo rojo claro; si warning, fondo amarillo claro
- Botón "Ver detalle" que navega al módulo correspondiente
- Props: `blockers: Blocker[]`

### S1.1.5 — `CockpitTabs.tsx`

- 5 tabs: Documentos | Evidencias | Costos | Timeline | Admin
- **Tab Documentos:** tabla con columnas: documento, paso, estado (⏳ pendiente / ✅ listo / ❌ rechazado), archivo, acción
- **Tab Evidencias:** galería thumbnails agrupada por fase (antes/durante/después), conteo X/Y requeridos
- **Tab Costos:** `CostComparisonChart` (Recharts) + `BudgetConsumedGauge` + resumen estimado vs real
- **Tab Timeline:** `AuditTimeline` con avatar + evento + fecha + entidad
- **Tab Admin:** pipeline visual SES→Factura→Pago con estados y aging
- Lazy loading: cada tab carga su contenido solo al ser seleccionado

### S1.1.6 — Página Cockpit `/service-cases/[id]/cockpit/page.tsx`

- Page wrapper con autenticación y RBAC
- Loading state: skeleton cards animados
- Error state: mensaje con código de error y botón reintentar
- Empty state: "No se encontró la orden de servicio"
- Offline state: "Datos del cockpit no disponibles sin conexión"
- Forbidden state: "No tienes permisos para ver este cockpit"
- Layout: header card → progress bar → next action → blockers → tabs

### QA S1.1

```bash
# Verificar que el módulo cockpit compila
npm run typecheck -w frontend > .sisyphus/evidence/s1-1-cockpit-typecheck.txt 2>&1

# Verificar lint
npm run lint -w frontend > .sisyphus/evidence/s1-1-cockpit-lint.txt 2>&1

# Test unitario del componente
npm run test -w frontend -- -t "FourteenStepProgressBar" > .sisyphus/evidence/s1-1-cockpit-test.txt 2>&1
```

**Commit:** `feat(ui): add cockpit module with 14-step progress bar, header card, next action, blockers, and tabs`

---

## 5. SPRINT 2 — DASHBOARD OS + COST INTELLIGENCE UI

**Depende de:** Endpoints dashboard y cost intelligence existentes (Spec-013 S2.3, S2.5)
**Objetivo:** Conectar el dashboard con datos reales calculados y construir la UI de inteligencia de costos.

### S2.1 — Dashboard OS: Componentes KPI

Crear `frontend/src/modules/dashboard/`:

```typescript
// api/ dashboard.api.ts → fetchOperationalKPIs(period), fetchSLARiskOrders()
// hooks/
//   useDashboardKPIs.ts    → useQuery para GET /dashboard/operational-kpis
//   useSLARiskOrders.ts    → useQuery para GET /dashboard/sla-risk
// ui/
//   DashboardKPIWidgets.tsx      → Grid de tarjetas KPI (MTTR, MTBF, FTR, Utilization)
//   KPIStatCard.tsx              → Tarjeta individual: icono, valor, label, tendencia
//   MTTRMTBFCards.tsx            → MTTR (minutos) + MTBF (días) side-by-side
//   FirstTimeFixRateGauge.tsx    → Gauge circular 0-100% con color
//   SLARiskOrdersTable.tsx       → Tabla de órdenes en riesgo SLA
//   PendingInvoicesAlert.tsx     → Alerta de facturas pendientes/vencidas (FALLA 4)
//   PendingReportsAlert.tsx      → Alerta de informes pendientes (FALLA 3)
//   CashFlowFunnel.tsx           → Funnel: Ejecutado→SES→Factura→Pago
```

#### `DashboardKPIWidgets.tsx`

- Grid 2x2 (desktop) / 1x2 (tablet) / 1x1 (mobile)
- Widgets: MTTR, MTBF, First-Time Fix Rate, Technician Utilization
- Cada widget: `KPIStatCard` con icono (lucide-react), valor, label, mini sparkline (Recharts)
- Tooltip con definición de la métrica y fórmula
- Props: `kpis: DashboardOperationalKPI`

#### `FirstTimeFixRateGauge.tsx`

- Gauge circular usando Recharts PieChart con ángulo personalizado
- Color: verde >75%, amarillo 60-75%, rojo <60%
- Valor central grande, label debajo
- Animación al cargar (Framer Motion)
- Tooltip: "Órdenes sin retorno / Total completadas"

#### `SLARiskOrdersTable.tsx`

- Tabla con TanStack Table
- Columnas: código de orden, cliente, SLA deadline, horas restantes, paso actual, nivel de riesgo, acción
- Fila roja si riskLevel=critical, amarilla si warning
- Botón "Ver orden" → deep-link al cockpit
- Filtro por nivel de riesgo

#### `CashFlowFunnel.tsx`

- Funnel visual usando Recharts
- Etapas: Ejecutado → SES enviado → Facturado → Pagado
- Cada etapa muestra monto acumulado en COP
- Tooltip: detalle de cuántas órdenes están atascadas en cada etapa

### S2.2 — Cost Intelligence UI

Crear `frontend/src/modules/costs/`:

```typescript
// api/ cost.api.ts → fetchCostIntelligence(orderId), fetchCostCatalog(filters)
// hooks/
//   useCostIntelligence.ts   → useQuery para GET /costs/:orderId/intelligence
//   useCostCatalog.ts        → useQuery para GET /costs/catalog
// ui/
//   CostIntelligencePage.tsx       → Página principal de costos de una orden
//   BaselineCostCard.tsx           → Costo congelado de la propuesta (inmutable)
//   BudgetConsumedGauge.tsx        → Gauge circular: % presupuesto consumido
//   CostDeviationStackedBar.tsx    → Barras apiladas: estimado vs real por categoría
//   MarginSummaryCard.tsx          → Ingreso total vs costo total real
//   CostCatalogPage.tsx            → CRUD de catálogo de costos (nueva ruta)
//   CostCatalogSearch.tsx          → Búsqueda inline en catálogo
//   CostCatalogForm.tsx            → Formulario crear/editar ítem del catálogo
```

#### `BudgetConsumedGauge.tsx`

- Gauge circular: verde <60%, amarillo 60-80%, rojo 80-100%, crítico >100%
- Valor "% del presupuesto consumido"
- Alerta animada si supera 80% (pulso rojo)
- Tooltip: "Presupuesto estimado: $X · Real: $Y"

#### `CostDeviationStackedBar.tsx`

- Barras horizontales agrupadas por categoría (labor, materials, equipment, subcontractor)
- Cada par: barra estimado (azul claro) + barra real (azul oscuro)
- Etiqueta de desviación % a la derecha
- Si desviación > 20%, etiqueta roja
- Usando Recharts BarChart con layout horizontal

#### `CostCatalogPage.tsx` + `CostCatalogSearch.tsx` + `CostCatalogForm.tsx`

- Ruta: `/costs/catalog`
- Tabla con búsqueda y filtro por categoría
- CRUD con RBAC (solo residente/administrativo pueden crear/editar)
- Formulario con validación Zod
- Botón "Agregar al carrito de costos" en órdenes

### QA S2.1 — Dashboard

```bash
npm run typecheck -w frontend > .sisyphus/evidence/s2-1-dashboard-typecheck.txt 2>&1
npm run test -w frontend -- -t "DashboardKPI" > .sisyphus/evidence/s2-1-dashboard-test.txt 2>&1
```

### QA S2.2 — Cost Intelligence

```bash
npm run typecheck -w frontend > .sisyphus/evidence/s2-2-costs-typecheck.txt 2>&1
```

**Commit:** `feat(ui): add dashboard OS with KPI widgets, SLA risk table, cash flow funnel, and cost intelligence components`

---

## 6. SPRINT 3 — FIELD EXECUTION MODE + EVIDENCE FSM UI

**Depende de:** Endpoints execution-session existentes + evidence endpoints
**Objetivo:** Construir la experiencia de ejecución en campo con preflight gates, cronómetro, captura estructurada de evidencias, y reporte de novedades.

### S3.1 — Backend complementario: Preflight + Approve endpoints

**S3.1.1 — `POST /execution-sessions/:id/preflight`**

```typescript
// backend/src/modules/execution-sessions/execution-sessions.service.ts
async submitPreflightChecklist(
  sessionId: string,
  preflightData: z.infer<typeof PreflightChecklistSchema>
): Promise<ExecutionSession> {
  const session = await this.executionSessionModel.findById(sessionId);
  if (!session) throw new AppError('EXECUTION_SESSION_NOT_FOUND', 404);
  if (['in_progress', 'completed', 'cancelled'].includes(session.status)) {
    throw new AppError('SESSION_ALREADY_STARTED', 400);
  }

  const validated = PreflightChecklistSchema.parse(preflightData);
  const result = evaluatePreflightGates(validated.items, {
    eppComplete: validated.eppComplete,
    astSigned: validated.astSigned,
    ptwObtained: validated.ptwObtained,
    toolsValidated: validated.toolsValidated,
    vehicleDocumentsOk: validated.vehicleDocumentsOk,
    certificationsCurrent: validated.certificationsCurrent,
  });

  session.preflightChecklist = validated;
  if (result.allBlockingGatesPassed && session.status === 'draft') {
    session.status = 'ready';
  }
  await session.save();

  // Auditoría
  await this.auditService.log({
    action: 'PREFLIGHT_SUBMITTED',
    entityType: 'execution_session',
    entityId: sessionId,
    metadata: { allBlockingGatesPassed: result.allBlockingGatesPassed },
  });

  return session;
}
```

**S3.1.2 — `POST /planning-packets/:id/approve`**

```typescript
// backend/src/modules/planning-packets/planning-packets.service.ts
async approveWithReadinessCheck(packetId: string, userId: string) {
  const readiness = await this.getReadiness(packetId);
  if (!readiness.canExecute) {
    throw new AppError('PLANNING_NOT_READY', 400, {
      blockingReasons: readiness.blockingReasons,
    });
  }
  return this.approve(packetId, userId);
}
```

### S3.2 — Frontend Field Execution Mode

Crear `frontend/src/modules/field-execution/`:

```typescript
// api/ field-execution.api.ts
// hooks/
//   usePreflightSubmit.ts       → useMutation para POST preflight
//   useExecutionSession.ts      → useQuery para GET execution-session/:id
//   useStartExecution.ts        → useMutation para iniciar sesión
//   useCompleteExecution.ts     → useMutation para completar
// ui/
//   PreflightGatesForm.tsx       → Checklist de verificación pre-vuelo
//   ExecutionTimer.tsx           → Cronómetro con barra de progreso
//   ExecutionStatusBadge.tsx     → Badge de estado de ejecución
//   ExecutionSessionPage.tsx     → Página principal de ejecución
// ui/evidence/
//   StructuredEvidenceCapture.tsx → Slots BEFORE/DURING/AFTER
//   FieldNoveltyButton.tsx        → FAB "Reportar Novedad"
//   EvidenceSlotCard.tsx          → Slot individual con estado
```

#### `PreflightGatesForm.tsx`

- Checklist visual con ítems obligatorios
- Cada ítem: checkbox + label + icono de bloqueo si es blocking
- Ítems configurados: EPP completo, AST firmado, PTW obtenido, Herramientas validadas, Documentos vehículo, Certificaciones vigentes
- Ítems adicionales desde `safetyRequirements` del kit (dinámicos)
- Progreso: "3/6 gates completados"
- Botón "Iniciar ejecución" deshabilitado hasta que todos los blocking estén checked
- Al hacer submit: POST a `/execution-sessions/:id/preflight`
- Si success: redirige a la sesión de ejecución activa
- Si fail: muestra errores específicos

#### `ExecutionTimer.tsx`

- Cronómetro en formato HH:MM:SS
- Barra de progreso: tiempo transcurrido vs tiempo estimado
- Color: verde <80%, amarillo 80-100%, rojo >100%
- Alerta si supera 110% del tiempo estimado
- Botón de pausa/reanudación
- Props: `estimatedMinutes`, `startedAt`, `onPause`, `onResume`
- Actualización cada segundo con `setInterval`

#### `StructuredEvidenceCapture.tsx`

- 3 slots visuales: BEFORE (Foto Antes), DURING (Foto Durante), AFTER (Foto Después)
- Cada slot: label, required badge, blocking badge, thumbnail si ya capturada
- BEFORE + AFTER = blocking (obligatorio para avanzar)
- DURING = required pero no blocking
- Botón de captura: cámara (mobile) + galería
- Al capturar: preview, estado "uploading", luego "uploaded" o "error"
- Queue de subida con indicador de estado
- Props: `sessionId`, `serviceCaseId`, `evidenceSlots`

#### `FieldNoveltyButton.tsx`

- FAB flotante abajo-derecha con icono de alerta
- Modal: descripción (textarea con min 5 chars), severidad (select), foto (upload), checkbox "¿Genera WorkRequest?"
- Si genera WorkRequest → POST a `/work-requests` con referencia a la orden
- Tooltip: "Reportar novedad encontrada en campo"
- Props: `executionSessionId`, `serviceCaseId`, `workOrderId`

### S3.3 — Evidence FSM UI

Crear `frontend/src/modules/evidences/` (o enriquecer existente):

```typescript
// ui/
//   EvidenceGalleryByPhase.tsx   → Galería agrupada por fase
//   EvidenceWorkflowBadge.tsx    → Badge de estado FSM con animación
//   EvidenceReviewPanel.tsx      → Panel de revisión: verificar/rechazar
//   EvidenceReplacementModal.tsx → Modal de solicitud de reemplazo
//   EvidenceSlotsSummary.tsx     → Resumen: X/Y requeridos, N bloqueantes
```

#### `EvidenceWorkflowBadge.tsx`

- Badge con color según estado:
  - captured: gris
  - uploaded: azul
  - pending_review: amarillo (pulso)
  - approved: verde
  - rejected: rojo
  - replacement_requested: naranja
  - locked: gris oscuro (candado)
- Animación Framer Motion al cambiar de estado

#### `EvidenceGalleryByPhase.tsx`

- Galería thumbnails agrupada por fase: before/during/after
- Cada thumbnail: imagen pequeña + badge de estado + icono de blocking
- Click → modal viewer con zoom, metadatos, acciones

#### `EvidenceReviewPanel.tsx`

- Para rol supervisor/ingeniero: panel de revisión
- Botones: Verificar ✅ / Rechazar ❌
- Rechazo: campo motivo obligatorio
- Si rechazado: botón "Solicitar reemplazo" → `replacement_requested`

### QA S3

```bash
npm run typecheck -w frontend > .sisyphus/evidence/s3-1-field-exec-typecheck.txt 2>&1
npm run typecheck -w backend > .sisyphus/evidence/s3-1-backend-typecheck.txt 2>&1
npm run test -w frontend -- -t "PreflightGates" > .sisyphus/evidence/s3-1-field-test.txt 2>&1
npm run test -w backend -- -t "submitPreflight" > .sisyphus/evidence/s3-1-backend-test.txt 2>&1
```

**Commit:** `feat(backend): add POST /execution-sessions/:id/preflight and POST /planning-packets/:id/approve`
**Commit:** `feat(ui): add field execution mode with preflight gates, timer, evidence capture, and novelty reporting`

---

## 7. SPRINT 4 — AUTO-GENERATED REPORTS + DIGITAL SIGNATURES + INVOICE PIPELINE

**Depende de:** TechnicalReport, DeliveryRecord, Invoice schemas existentes
**Objetivo:** Generación automática de informes desde datos de la orden, firma digital, y pipeline visual de facturación.

### S4.1 — Backend: Auto-draft report endpoint

```typescript
// backend/src/modules/technical-report/technical-report.service.ts
async generateAutoDraft(serviceCaseId: string): Promise<TechnicalReport> {
  // 1. Obtener ServiceCase completo
  const serviceCase = await this.serviceCaseModel.findById(serviceCaseId)
    .populate(['clientId', 'proposalId', 'executionSessions'])
    .lean();
  if (!serviceCase) throw new AppError('SERVICE_CASE_NOT_FOUND', 404);

  // 2. Obtener execution sessions con evidencias
  const sessions = await this.executionSessionModel.find({
    serviceCaseId,
  }).populate('evidenceIds').lean();

  // 3. Obtener planning packet
  const planningPacket = await this.planningPacketModel.findOne({
    serviceCaseId,
  }).lean();

  // 4. Generar contenido estructurado
  const draft: TechnicalReportDraft = {
    serviceCaseId,
    serviceCaseCode: serviceCase.code,
    clientName: serviceCase.clientId?.name,
    workDescription: serviceCase.description,
    activityType: serviceCase.activityType,
    executionPeriod: {
      start: sessions[0]?.startedAt,
      end: sessions[sessions.length - 1]?.completedAt,
    },
    teamMembers: this.extractTeamMembers(sessions),
    activitiesPerformed: this.buildActivitiesSummary(sessions),
    materialsUsed: this.aggregateMaterials(sessions),
    evidences: this.extractEvidencesByPhase(sessions),
    novelties: this.extractNovelties(sessions),
    technicalConclusion: '', // editable por el usuario
    generatedAt: new Date().toISOString(),
    autoGenerated: true,
  };

  // 5. Guardar como borrador
  return this.technicalReportModel.create({
    serviceCaseId,
    status: 'draft',
    autoGenerated: true,
    draftData: draft,
  });
}
```

### S4.2 — Frontend: Auto-generated Reports

```typescript
// frontend/src/modules/reports/
//   api/ report.api.ts
//   hooks/ useAutoDraft.ts, useReportVersions.ts
//   ui/
//     TechnicalReportDraftPage.tsx  → Vista previa editable del borrador
//     ReportVersionHistory.tsx      → Historial de versiones con changelog
//     DigitalSignaturePad.tsx       → Canvas de firma para técnico y cliente
//     PDFExportButton.tsx          → Botón de exportación PDF
//     ReportReviewPanel.tsx        → Panel de aprobación/rechazo
```

#### `TechnicalReportDraftPage.tsx`

- Vista previa del informe auto-generado
- Secciones: datos generales, actividades realizadas, materiales, evidencias, novedades, conclusión
- Cada sección es editable inline
- Botón "Regenerar desde datos actualizados" → llama al endpoint
- Botón "Aprobar y generar PDF" → bloquea el informe y exporta
- Loading state: skeleton del layout del informe
- Empty state: "No hay datos suficientes para generar un borrador automático"

#### `DigitalSignaturePad.tsx`

- Canvas HTML5 para firma digital (usando `signature_pad` o canvas nativo)
- Botones: "Limpiar", "Deshacer", "Aceptar"
- Firma capturada como PNG → enviada a FileAsset
- Modal: "Firma del técnico" / "Firma del cliente"
- Metadatos: nombre, cargo, timestamp, IP
- Props: `onSign: (signatureDataUrl: string) => void`, `signerName: string`, `title: string`

#### `ReportVersionHistory.tsx`

- Timeline vertical de versiones
- Cada versión: número, fecha, autor, descripción del cambio
- Botón "Restaurar esta versión" (crea nueva versión con datos de la anterior)
- Initial: v1.0 "Generado automáticamente desde datos de la orden"

### S4.3 — Invoice Pipeline Visual

```typescript
// frontend/src/modules/invoices/
//   ui/
//     InvoicePipelinePage.tsx      → Pipeline visual SES→Factura→Pago
//     AgingDashboard.tsx           → Tarjetas de aging 30/60/90+ días
//     InvoiceStatusBadge.tsx       → Badge con workflow states
//     PaymentRecordCard.tsx        → Tarjeta de registro de pago
```

#### `InvoicePipelinePage.tsx`

- Pipeline visual con 3 etapas: SES → Factura → Pago
- Cada etapa: icono, estado (completado/ en_progreso/ pendiente), fechas, montos
- Conexiones entre etapas con color según estado
- Si la etapa es "pendiente" > 30 días: alerta roja
- Tooltip con detalle de cada etapa

#### `AgingDashboard.tsx`

- Tarjetas: "Corriente" (0-30d), "Vencido 30d", "Vencido 60d", "Vencido 90d+"
- Cada tarjeta: conteo de facturas + monto total en COP
- Color: verde→amarillo→naranja→rojo según aging
- Click → lista filtrada de facturas en ese bucket

### QA S4

```bash
npm run typecheck > .sisyphus/evidence/s4-1-reports-typecheck.txt 2>&1
npm run test > .sisyphus/evidence/s4-1-reports-tests.txt 2>&1
```

**Commit:** `feat(backend): add GET /reports/:serviceCaseId/auto-draft for automatic report generation`
**Commit:** `feat(ui): add auto-generated reports, digital signatures, and invoice pipeline components`

---

## 8. SPRINT 5 — NOTIFICATIONS CENTER + PORTAL CLIENTE

**Depende de:** Módulos frontend básicos del dashboard y cockpit
**Objetivo:** Centro de notificaciones in-app y portal básico para rol cliente.

### S5.1 — Backend: Notifications endpoints

```typescript
// backend/src/modules/notifications/notifications.service.ts

// GET /notifications → lista paginada de notificaciones del usuario
// GET /notifications/unread-count → conteo de no leídas
// POST /notifications/:id/read → marcar como leída
// POST /notifications/read-all → marcar todas como leídas

interface NotificationDocument {
  _id: ObjectId;
  userId: ObjectId;
  type: NotificationEventType;  // 'evidence_rejected' | 'ses_approved' | 'payment_received' | ...
  title: string;
  message: string;
  deepLink?: string;             // URL relativa al recurso
  isRead: boolean;
  readAt?: Date;
  createdAt: Date;
}
```

### S5.2 — Frontend: Notifications Center

```typescript
// frontend/src/modules/notifications/
//   api/ notification.api.ts
//   hooks/ useNotifications.ts, useUnreadCount.ts
//   ui/
//     NotificationBell.tsx          → Campana con badge de conteo
//     NotificationPanel.tsx         → Panel lateral deslizable
//     NotificationCard.tsx          → Item individual de notificación
//     NotificationPreferences.tsx   → Preferencias por tipo
```

#### `NotificationBell.tsx`

- Icono de campana en el header/navbar (lucide-react `Bell`)
- Badge rojo con conteo de no leídas (máximo 99+)
- Animación sutil al cambiar conteo
- Click → abre `NotificationPanel`

#### `NotificationPanel.tsx`

- Panel lateral derecho (slide-in con Framer Motion)
- Lista de notificaciones ordenadas por fecha descendente
- Cada item: icono según tipo, título, mensaje, tiempo relativo, badge no-leída
- Click → marca como leída y navega al deep link
- Botón "Marcar todas como leídas"
- Loading state: skeleton items
- Empty state: "No tienes notificaciones" con icono
- Polling: refetch cada 30 segundos

#### `NotificationPreferences.tsx`

- Página `/settings/notifications`
- Lista de tipos de evento con toggle activar/desactivar
- Por ahora: solo in-app (sin email)
- Persistencia en backend

### S5.3 — Portal Cliente Básico

Ruta: `/portal/service-cases`

```typescript
// frontend/src/modules/portal/
//   api/ portal.api.ts → fetchMyServiceCases(), fetchServiceCaseDetail()
//   hooks/ usePortalServiceCases.ts
//   ui/
//     PortalServiceCaseList.tsx     → Lista de órdenes del cliente logueado
//     PortalServiceCaseDetail.tsx   → Detalle limitado de la orden
//     PortalDocumentDownload.tsx    → Descarga de documentos
//     PortalSignDeliveryRecord.tsx  → Firma de acta desde portal
```

**Restricciones del Portal:**
- Solo el rol `cliente` puede acceder
- Solo ve órdenes donde `clientId === userId`
- No puede crear/editar — solo lectura + firmar acta
- Vistas limitadas: estado actual de la orden, documentos descargables, firma de acta
- Sin acceso a costos internos, checklists, ni planeación

### QA S5

```bash
npm run typecheck > .sisyphus/evidence/s5-1-notifications-typecheck.txt 2>&1
npm run test > .sisyphus/evidence/s5-1-notifications-tests.txt 2>&1
```

**Commit:** `feat(backend): add notifications endpoints for in-app notification center`
**Commit:** `feat(ui): add notifications center with bell, panel, and preferences`
**Commit:** `feat(ui): add basic client portal with read-only order views and signature`

---

## 9. SPRINT 6 — ESTABILIZACIÓN, E2E TESTS Y GATES FINALES

**Objetivo:** Cerrar el ciclo con gates verdes, E2E tests del flujo completo, y documentación actualizada.

### S6.1 — E2E Tests con Playwright

```typescript
// frontend/tests/e2e/spec-014/
//   01-cockpit-14-steps.spec.ts     → Flujo cockpit: ver progress bar, tabs, next action
//   02-dashboard-kpis.spec.ts       → Dashboard: ver KPIs, SLA risk table
//   03-cost-intelligence.spec.ts    → Costos: ver catálogo, baseline, budget gauge
//   04-field-execution.spec.ts      → Ejecución: preflight gates, timer, evidence capture
//   05-report-auto-draft.spec.ts    → Informes: generar borrador, firmar, exportar PDF
//   06-invoice-pipeline.spec.ts     → Facturación: ver pipeline, aging dashboard
//   07-notifications.spec.ts        → Notificaciones: ver campana, panel, marcar leída
//   08-portal-cliente.spec.ts       → Portal: ver órdenes, descargar, firmar acta
//   09-rbac-all-roles.spec.ts       → RBAC: probar cada rol en cada página nueva
//   10-full-14-step-flow.spec.ts    → Flujo completo: desde solicitud hasta pago
```

Cada test debe cubrir:
- Happy path (datos normales)
- Loading state
- Error state (API falla)
- Empty state (sin datos)
- Forbidden state (rol sin permiso)
- Offline state (cuando aplique)

### S6.2 — quality:strict + React Doctor

```bash
# Ejecutar gates completos
npm run typecheck 2>&1 | tee .sisyphus/evidence/s6-2-typecheck.txt
npm run lint 2>&1 | tee .sisyphus/evidence/s6-2-lint.txt
npm test 2>&1 | tee .sisyphus/evidence/s6-2-tests.txt
npm run build 2>&1 | tee .sisyphus/evidence/s6-2-build.txt
npm run contracts:check 2>&1 | tee .sisyphus/evidence/s6-2-contracts.txt
npm run quality:strict 2>&1 | tee .sisyphus/evidence/s6-2-quality.txt
npm run verify 2>&1 | tee .sisyphus/evidence/s6-2-verify.txt
npx react-doctor@latest 2>&1 | tee .sisyphus/evidence/s6-2-react-doctor.txt
```

- Si `quality:strict` falla: ajustar baseline o corregir weak tokens
- Si React Doctor < 87/100: corregir issues de accesibilidad y mantenibilidad
- Todos los gates deben pasar antes de declarar Spec-014 completa

### S6.3 — Documentación actualizada

- `docs/architecture/FRONTEND_ROUTE_MAP.md` → agregar nuevas rutas (cockpit, cost-catalog, portal)
- `docs/architecture/API_ENDPOINT_MATRIX.md` → agregar nuevos endpoints
- `docs/product/CERMONT_NEXT_DEVELOPMENT_PLAN.md` → actualizar estado post Spec-014

### QA S6

```bash
# Todos los tests E2E deben pasar
npm run test:e2e -w frontend > .sisyphus/evidence/s6-1-e2e.txt 2>&1

# Todos los gates deben pasar
npm run verify > .sisyphus/evidence/s6-2-verify.txt 2>&1
```

**Commit:** `test(e2e): add Playwright E2E tests for Spec-014 14-step flow`

---

## 10. SPRINT — GATE DE SALIDA GLOBAL (todos los sprints)

```bash
npm run typecheck 2>&1 | tee .sisyphus/evidence/sprint1-full-typecheck.txt
npm run lint 2>&1 | tee .sisyphus/evidence/sprint1-lint.txt
npm test 2>&1 | tee .sisyphus/evidence/sprint1-tests.txt
npm run build 2>&1 | tee .sisyphus/evidence/sprint1-build.txt
npm run contracts:check 2>&1 | tee .sisyphus/evidence/sprint1-contracts.txt
npm run quality:strict 2>&1 | tee .sisyphus/evidence/sprint1-quality.txt
npm run verify 2>&1 | tee .sisyphus/evidence/sprint1-verify.txt
npx react-doctor@latest 2>&1 | tee .sisyphus/evidence/sprint1-react-doctor.txt
```

**PARAR si algún gate falla. No avanzar al siguiente sprint.**

---

## 11. GUARDRAILS ABSOLUTOS

1. ❌ **No romper tests existentes** — los 1013+ tests baseline deben seguir pasando
2. ❌ **No modificar schemas existentes** — solo agregar campos opcionales
3. ❌ **No crear `MediaAsset`** — `FileAsset` es el SSOT para archivos
4. ❌ **No introducir `any`, `unknown`, `null`, `undefined`** explícitos
5. ❌ **No hardcodear roles** en componentes — usar `canAccessModule` del domain
6. ❌ **No `fetch` directo en componentes** — usar `apiClient` + TanStack Query
7. ❌ **No `try/catch` en controllers Express 5** — propagación automática
8. ❌ **No `console.log` en producción** — usar logger estructurado
9. ❌ **No mock data en producción**
10. ❌ **No modificar `package.json`** sin justificación explícita
11. ❌ **No avanzar a Siguiente Sprint sin gates verdes** del sprint anterior

---

## 12. ESTRUCTURA DE ARCHIVOS A CREAR

### Frontend (nuevos módulos)

```
frontend/src/modules/
├── cockpit/
│   ├── api/cockpit.api.ts
│   ├── hooks/useCockpit.ts
│   ├── hooks/useCockpitMutations.ts
│   ├── ui/FourteenStepProgressBar.tsx
│   ├── ui/CockpitHeaderCard.tsx
│   ├── ui/NextActionCard.tsx
│   ├── ui/BlockersPanelCollapsible.tsx
│   ├── ui/CockpitTabs.tsx
│   ├── ui/AuditTimeline.tsx
│   ├── ui/DocumentRequirementsTable.tsx
│   └── utils/cockpitKeys.ts
├── dashboard/
│   ├── api/dashboard.api.ts
│   ├── hooks/useDashboardKPIs.ts
│   ├── hooks/useSLARiskOrders.ts
│   ├── ui/DashboardKPIWidgets.tsx
│   ├── ui/KPIStatCard.tsx
│   ├── ui/MTTRMTBFCards.tsx
│   ├── ui/FirstTimeFixRateGauge.tsx
│   ├── ui/SLARiskOrdersTable.tsx
│   ├── ui/PendingInvoicesAlert.tsx
│   ├── ui/PendingReportsAlert.tsx
│   └── ui/CashFlowFunnel.tsx
├── costs/
│   ├── api/cost.api.ts
│   ├── hooks/useCostIntelligence.ts
│   ├── hooks/useCostCatalog.ts
│   ├── ui/CostIntelligencePage.tsx
│   ├── ui/BaselineCostCard.tsx
│   ├── ui/BudgetConsumedGauge.tsx
│   ├── ui/CostDeviationStackedBar.tsx
│   ├── ui/MarginSummaryCard.tsx
│   ├── ui/CostCatalogPage.tsx
│   ├── ui/CostCatalogSearch.tsx
│   └── ui/CostCatalogForm.tsx
├── field-execution/
│   ├── api/field-execution.api.ts
│   ├── hooks/usePreflightSubmit.ts
│   ├── hooks/useExecutionSession.ts
│   ├── ui/PreflightGatesForm.tsx
│   ├── ui/ExecutionTimer.tsx
│   ├── ui/ExecutionSessionPage.tsx
│   ├── ui/evidence/StructuredEvidenceCapture.tsx
│   ├── ui/evidence/FieldNoveltyButton.tsx
│   └── ui/evidence/EvidenceSlotCard.tsx
├── reports/
│   ├── api/report.api.ts
│   ├── hooks/useAutoDraft.ts
│   ├── hooks/useReportVersions.ts
│   ├── ui/TechnicalReportDraftPage.tsx
│   ├── ui/ReportVersionHistory.tsx
│   ├── ui/DigitalSignaturePad.tsx
│   ├── ui/PDFExportButton.tsx
│   └── ui/ReportReviewPanel.tsx
├── invoices/
│   ├── ui/InvoicePipelinePage.tsx
│   ├── ui/AgingDashboard.tsx
│   ├── ui/InvoiceStatusBadge.tsx
│   └── ui/PaymentRecordCard.tsx
├── notifications/
│   ├── api/notification.api.ts
│   ├── hooks/useNotifications.ts
│   ├── hooks/useUnreadCount.ts
│   ├── ui/NotificationBell.tsx
│   ├── ui/NotificationPanel.tsx
│   ├── ui/NotificationCard.tsx
│   └── ui/NotificationPreferences.tsx
└── portal/
    ├── api/portal.api.ts
    ├── hooks/usePortalServiceCases.ts
    ├── ui/PortalServiceCaseList.tsx
    ├── ui/PortalServiceCaseDetail.tsx
    ├── ui/PortalDocumentDownload.tsx
    └── ui/PortalSignDeliveryRecord.tsx
```

### Backend (nuevos endpoints)

```
backend/src/modules/
├── execution-sessions/        → Agregar: submitPreflightChecklist
├── planning-packet/           → Agregar: approveWithReadinessCheck
├── technical-report/          → Agregar: generateAutoDraft
├── notifications/             → Agregar: list, unreadCount, markRead
├── portal/                    → Si existe, enriquecer; si no, crear básico
```

### Páginas frontend nuevas

```
frontend/src/app/
├── service-cases/[id]/cockpit/page.tsx       → Cockpit 14 pasos
├── execution-sessions/[id]/page.tsx          → Field execution mode
├── costs/catalog/page.tsx                    → Cost catalog CRUD
├── reports/[id]/draft/page.tsx               → Auto-generated report draft
├── reports/[id]/sign/page.tsx                → Digital signature page
├── invoices/[id]/pipeline/page.tsx           → Invoice pipeline visual
├── notifications/page.tsx                    → Notifications center
├── portal/service-cases/page.tsx             → Portal cliente: lista
├── portal/service-cases/[id]/page.tsx        → Portal cliente: detalle
└── settings/notifications/page.tsx           → Notification preferences
```

---

## 13. DEPENDENCIAS ENTRE SPRINTS

```
Sprint 1 (Cockpit 14 Pasos)
    ↓
Sprint 2 (Dashboard OS + Cost Intelligence)
    ↓
Sprint 3 (Field Execution + Evidence FSM)
    ↓
Sprint 4 (Reports + Signatures + Invoice Pipeline)
    ↓
Sprint 5 (Notifications + Portal)
    ↓
Sprint 6 (E2E + Stabilization + Gates)
```

Cada sprint es independiente en cuanto a sus componentes frontend, pero todos dependen de los endpoints backend que se crearon en Spec-013 S2 y los que se crean en Spec-014 S3/S4.

Sprint 6 es el único que depende de todos los sprints anteriores (porque los E2E tests cubren toda la funcionalidad).

---

## 14. COMMIT STRATEGY

| Sprint | Commits |
|---|---|
| S1 | `feat(ui): add cockpit module with 14-step progress bar and tabs` |
| S2 | `feat(ui): add dashboard OS with KPI widgets and SLA risk table` |
| S2 | `feat(ui): add cost intelligence components (catalog, baseline, gauge)` |
| S3 | `feat(backend): add preflight and planning-approve endpoints` |
| S3 | `feat(ui): add field execution mode with preflight gates and evidence capture` |
| S4 | `feat(backend): add auto-draft report endpoint` |
| S4 | `feat(ui): add auto-generated reports, digital signatures, and invoice pipeline` |
| S5 | `feat(backend): add notifications endpoints` |
| S5 | `feat(ui): add notifications center and portal cliente` |
| S6 | `test(e2e): add Playwright E2E tests for 14-step flow` |
| S6 | `fix(quality): update quality gates and react-doctor score` |

---

## 15. DEFINITION OF DONE

Spec-014 solo se cierra si:

- [ ] Sprint 1: Cockpit 14 pasos implementado con progress bar, next action, blockers, tabs
- [ ] Sprint 2: Dashboard OS con KPIs reales + Cost Intelligence UI con catálogo
- [ ] Sprint 3: Field execution mode con preflight gates, timer, evidence capture, novelties
- [ ] Sprint 4: Auto-generated reports + digital signatures + invoice pipeline visual
- [ ] Sprint 5: Notifications center + portal cliente básico
- [ ] Sprint 6: E2E tests para flujo completo + todos los gates verdes
- [ ] `npm run typecheck` → PASS
- [ ] `npm run lint` → PASS
- [ ] `npm test` → PASS (baseline tests intactos + nuevos tests)
- [ ] `npm run build` → PASS
- [ ] `npm run contracts:check` → PASS
- [ ] `npm run quality:strict` → PASS
- [ ] `npm run verify` → PASS
- [ ] `npx react-doctor@latest` → ≥ 87/100
- [ ] No se introdujeron nuevos `any`, `unknown`, `null`, `undefined`
- [ ] No se eliminó funcionalidad existente
- [ ] `FileAsset` sigue siendo SSOT (no se creó `MediaAsset`)
- [ ] No se modificó `package.json` sin justificación
- [ ] Documentación actualizada (FRONTEND_ROUTE_MAP, API_ENDPOINT_MATRIX, NEXT_DEVELOPMENT_PLAN)
- [ ] Cada commit tiene pre-commit con `npm run typecheck && npm run test`
