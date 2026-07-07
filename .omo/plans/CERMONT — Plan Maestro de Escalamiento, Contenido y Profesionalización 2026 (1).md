# CERMONT — Plan Maestro de Escalamiento, Contenido y Profesionalización 2026

> **Audiencia:** Juan Diego Arévalo — Desarrollador Full-Stack & Lead del aplicativo CERMONT  
> **Repositorio:** [JuanDiego30/cermont_aplicativo](https://github.com/JuanDiego30/cermont_aplicativo)  
> **Fecha:** Junio 2026

***

## 1. Estado Actual del Repositorio (Diagnóstico Verificado)

El repositorio [cermont_aplicativo](https://github.com/JuanDiego30/cermont_aplicativo) tiene una arquitectura monorepo sólida con tres workspaces principales: `backend/`, `frontend/` y `packages/`. El workspace `packages/` contiene tres sub-paquetes verificados: `packages/domain`, `packages/shared-types` y `packages/config`.

El `packages/domain/src/` expone reglas de negocio puras compartidas entre capas: `billing.rules.ts`, `closure.rules.ts`, `cost.rules.ts`, `execution.ts`, `fleet-readiness.rules.ts`, `kit.rules.ts`, `operational-steps.ts`, `permissions.ts`, `planning.rules.ts`, `rbac.ts`, `roles.ts` y un subdirectorio `workflow/`. Esto confirma que el dominio ya está bien estructurado y separado.

El `backend/src/modules/` confirma **48+ módulos activos** verificados directamente:

| Grupo | Módulos presentes |
|-------|-------------------|
| **Core FSM** | `service-cases`, `work-requests`, `execution-session`, `planning-packet`, `site-visit` |
| **Operativo** | `evidence`, `checklist`, `inspection`, `safety-analysis`, `dispatch` |
| **Administrativo** | `delivery-record`, `technical-report`, `invoice`, `payment`, `service-entry-sheet`, `proposal`, `purchase-order` |
| **Activos** | `fleet`, `tool`, `asset`, `inventory`, `resource`, `maintenance`, `kit` |
| **Documentación** | `documents`, `business-document`, `files`, `template-draft`, `template-response`, `report` |
| **Plataforma** | `auth`, `user`, `client`, `audit`, `notifications`, `dashboard`, `analytics`, `analytics-report` |
| **Avanzado** | `ai`, `dian`, `erp-connector`, `portal`, `sla`, `sync`, `observability`, `system-config`, `custom-fields`, `form-submissions` |

Esta estructura confirma que CERMONT ya tiene los módulos de backend creados, pero **la brecha está en la completitud del contenido, campos de datos, UX de cada página y cohesión visual**.

***

## 2. Software Profesional de Referencia (Benchmarks 2026)

Para escalar CERMONT al nivel del mercado profesional, el análisis de las mejores plataformas FSM/CMMS de 2026 revela el estándar competitivo al que debe aspirar:

| Plataforma | Fortaleza principal | Referencia directa para CERMONT | Precio base |
|------------|---------------------|----------------------------------|-------------|
| **MaintainX** | Mejor app móvil, work orders, comunicación en tiempo real, offline | Módulo ejecución campo, checklists, evidencias[^1] | $20/usuario/mes |
| **Limble CMMS** | Dashboards custom, gestión ciclo de vida activos, MTTR/MTBF | Dashboard KPIs, gestión flota/herramientas[^1] | Custom pricing |
| **Tractian** | IA predictiva + hardware sensores integrados | AI Copilot, predicción fallas activos[^1] | $60/usuario/mes |
| **ServiceTitan** | Portal cliente, firma digital, facturación, scheduling | Portal cliente, invoicing, actas[^2][^3] | Enterprise |
| **Facilio** | CMMS enterprise, compliance, work orders portfolio | Módulo mantenimiento preventivo, SLA[^4][^5] | Enterprise |
| **Opsima** | IA agentic sobre sistemas existentes, status tiempo real | Motor de automatizaciones, AI sobre operaciones[^6] | Enterprise |
| **IBM Maximo** | EAM enterprise, ciclo de vida activos, trazabilidad financiera | Costos ERP, historial activos, multisite | Enterprise |

### ¿Qué tienen estos sistemas que CERMONT no tiene aún?

Según el análisis de las mejores plataformas FSM en 2026, los sistemas líderes incluyen sistemáticamente:[^1][^7]

- **Scheduling con vista de disponibilidad drag-and-drop** por técnico y día
- **KPI dashboards accionables**: MTTR, MTBF, First-Time Fix Rate, PM Compliance, Utilization Rate, Revenue per Technician[^7]
- **App móvil offline-first real**: foto/video desde campo, firma digital on-site, acceso a historial de activos sin red[^8][^9]
- **Motor de automatizaciones configurable** SI-ENTONCES por el usuario final
- **Portal cliente** con historial de órdenes, estimados, facturas y auto-scheduling[^2][^10]
- **Workflow de evidencias con estados formales** (capturada → verificada → rechazada)
- **Checklists bloqueantes**: un checklist crítico sin completar impide avanzar la fase
- **Certificaciones de activos con vencimiento automático** y reglas de bloqueo de asignación[^11]
- **AI-assisted work orders**: descripción automática, sugerencias de partes, anomalías[^12]

***

## 3. Qué Debe Tener Cada Página: Contenido Mínimo Profesional

Esta es la guía definitiva de **qué campos, secciones, UX y lógica** debe tener cada módulo del aplicativo, comparado directamente con el estándar del mercado.

### 3.1 Dashboard Principal (`/dashboard`)

**Estado actual:** Módulo `backend/src/modules/dashboard` existe pero sin KPIs operativos calculados automáticamente.

**Contenido mínimo profesional requerido (P1):**

```
SECCIÓN 1 — KPI Cards accionables (por rol)
  - Órdenes abiertas (con link a lista filtrada)
  - Tasa de cierre en tiempo (% órdenes cerradas dentro del SLA)
  - Costo real vs. estimado global (% desviación)
  - Checklists pendientes críticos
  - MTTR promedio (tiempo medio de resolución por tipo de trabajo)
  - Utilización de técnicos (horas billables / horas disponibles)

SECCIÓN 2 — Gráficos interactivos
  - Barras: Órdenes por estado (creada, en ejecución, cerrada, bloqueada)
  - Línea: Tendencia de órdenes y costos por mes (últimos 6 meses)
  - Pie: Distribución de costos por categoría (materiales, MOD, subcontratistas)
  - Barras apiladas: % completion por fase del flujo de 14 pasos

SECCIÓN 3 — Panel "Próxima Acción" (por rol)
  - Gerente: órdenes sin aprobación de propuesta, pagos vencidos
  - Residente: planeaciones sin recursos asignados, kits incompletos
  - Técnico: sesiones asignadas para hoy, checklists pendientes
  - Administrativo: facturas sin enviar, SES sin radicar

SECCIÓN 4 — Alertas accionables con botón de resolución
  - SOAT vencido en vehículo [X]  → [Asignar certificación]
  - Herramienta sin calibración [Y] → [Agendar calibración]
  - Factura vencida hace 30 días [Z] → [Ver factura]
  - Evidencia rechazada en orden [W] → [Reemplazar evidencia]

SECCIÓN 5 — Timeline de actividad reciente (últimas 24h)
  - Eventos: nueva orden, evidencia subida, SES aprobada, pago recibido
```

**Campos nuevos en `packages/domain/src/` necesarios:**
```typescript
// Nuevo: analytics-kpi.types.ts en packages/shared-types/src/
export interface DashboardKPISnapshot {
  openOrders: number;
  closureRateOnTime: number;          // % órdenes cerradas dentro de SLA
  costDeviation: number;              // % real vs. estimado global
  criticalChecklistsPending: number;
  mttr: number;                       // horas promedio
  technicianUtilizationRate: number;  // 0-1
  period: 'today' | 'week' | 'month';
  roleContext: CermontRole;           // dashboard cambia por rol
}
```

**Stack UI recomendado:** `shadcn/ui` para KPI cards, `Recharts` o `tremor` para gráficos, `TanStack Table v8` para tablas con filtros.[^13][^14]

***

### 3.2 Órdenes de Servicio — ServiceCase Cockpit (`/service-cases/:id`)

**Estado actual:** El módulo `service-cases` en backend existe y tiene proyección de estado, pero la UI no tiene vista unificada de los 14 pasos.

**Contenido profesional requerido (P1):**

```
SECCIÓN HEADER — Identidad de la orden
  - Código único (SC-2026-001)
  - Estado actual con badge color semáforo
  - Progreso visual: barra de 14 pasos con estado por paso
  - Paso actual destacado: "Paso 6 — Ejecución en campo"
  - Próxima acción esperada: "El técnico debe completar checklist de seguridad"
  - Botones contextuales por rol (RBAC): [Aprobar propuesta], [Asignar técnico], [Ver evidencias]

SECCIÓN TIMELINE — Historial de eventos
  - Lista cronológica: quién hizo qué, cuándo, con qué evidencia
  - Items: creación, cambio de estado, evidencia subida, rechazo, aprobación

SECCIÓN DOCUMENTOS POR FASE
  - Propuesta → Orden de compra → Acta de entrega → SES → Factura
  - Estado de cada documento: ⏳ pendiente / ✅ listo / ❌ rechazado
  - Acceso directo a cada documento

SECCIÓN COSTOS INLINE
  - Presupuesto propuesto vs. costo real ejecutado
  - Barra de progreso de consumo de presupuesto (alerta si >80%)
  - Desglose: materiales / mano de obra / subcontratistas / herramientas

SECCIÓN EVIDENCIAS
  - Conteo: "3 de 6 evidencias requeridas para esta fase"
  - Galería thumbnail por categoría (antes/durante/después)
  - Estados: captured / uploaded / verified / rejected

SECCIÓN CHECKLISTS
  - Lista de checklists asociados con % completion
  - Indicador: ítems críticos sin completar bloquean "Cerrar fase"
```

**Campos nuevos en `packages/shared-types`:**
```typescript
// Enriquecimiento del ServiceCase existente
export interface ServiceCaseCockpit {
  serviceCaseId: string;
  stepProgress: StepProgressItem[];   // 14 pasos con estado
  nextExpectedAction: {
    description: string;
    responsibleRole: CermontRole;
    dueDate?: Date;
    isBlocked: boolean;
    blockReason?: string;
  };
  costSummary: {
    proposed: number;
    real: number;
    deviation: number;                // porcentaje
    alertThreshold: 0.80;
    isOverBudget: boolean;
  };
  evidenceRequirements: {
    phase: OperationalStep;
    required: number;
    uploaded: number;
    verified: number;
    rejected: number;
  }[];
}
```

***

### 3.3 Planeación (`/planning-packets/:id`)

**Estado actual:** Módulo `planning-packet` existe con `kit.rules.ts` en dominio.

**Contenido profesional requerido:**

```
SECCIÓN RECURSOS HUMANOS
  - Lista de técnicos disponibles por día con badges de disponibilidad
  - Certificaciones vencidas o próximas a vencer (alerta inline)
  - Asignación con drag-and-drop o selector

SECCIÓN VEHÍCULOS
  - Catálogo con estado: disponible / asignado / en mantenimiento
  - Badge: SOAT vigente ✅ / SOAT vencido ❌ → bloqueo automático
  - Historial de uso reciente

SECCIÓN HERRAMIENTAS Y EQUIPOS
  - Disponibilidad en tiempo real
  - Calibración vigente ✅ / Calibración vencida ❌ → alerta
  - Asignación formal con registro de checkout

SECCIÓN CHECKLIST DE ALISTAMIENTO (bloqueante)
  - ¿Tiene EPP completo? (verificado)
  - ¿Permisos de trabajo gestionados?
  - ¿ATS (Análisis de Trabajo Seguro) elaborado?
  - ¿Documentos técnicos impresos/descargados para offline?
  - Botón "Confirmar planeación" solo habilitado si todos los bloqueantes están OK

SECCIÓN REGLAS DE BLOQUEO
  - No planear sin propuesta aprobada
  - No asignar técnico sin certificación vigente
  - No asignar vehículo con SOAT vencido
```

**Campos nuevos en `packages/domain/src/planning.rules.ts`:**
```typescript
// Agregar a las reglas existentes:
export interface PlanningReadinessGates {
  hasApprovedProposal: boolean;
  allAssignedTechsHaveValidCerts: boolean;
  allVehiclesHaveValidSOAT: boolean;
  allToolsHaveValidCalibration: boolean;
  safetyChecklistComplete: boolean;
  // canExecute es true solo si TODOS son true
  canExecute: boolean;
  blockingReasons: string[];
}
```

***

### 3.4 Ejecución en Campo (`/execution-sessions/:id`)

**Estado actual:** Módulo `execution-session` existe, PWA con Serwist implementado.

**Contenido profesional requerido (P1):**

```
SECCIÓN CRONÓMETRO DE SESIÓN
  - Inicio/fin de sesión con timestamp
  - Tiempo transcurrido vs. tiempo estimado
  - Botón de pausa y reanudación

SECCIÓN CHECKLISTS EN CAMPO (offline-first)
  - Carga de checklists de la orden (desde IndexedDB si sin conexión)
  - Ítem por ítem con tipo: checkbox / número / foto requerida / firma
  - Ítems críticos con indicador de bloqueo
  - Auto-guardado local cada 30 segundos

SECCIÓN CAPTURA DE EVIDENCIAS
  - Categorías: Antes del trabajo / Durante / Después / Hallazgo
  - Compresión automática de imagen antes de subir (fix PayloadTooLargeError)
  - Cola de subida con indicador de estado: 📶 pendiente / ✅ subida / ❌ error
  - Metadatos automáticos: timestamp, geolocalización, usuario

SECCIÓN NOVEDAD / ANOMALÍA
  - Botón: "Reportar novedad"
  - Formulario: descripción, tipo de novedad, foto
  - Crea automáticamente un WorkRequest derivado con status 'novedad'

SECCIÓN FIRMA DIGITAL
  - Canvas de firma del supervisor o cliente
  - Registro: nombre, cargo, timestamp, IP del dispositivo
  - Exporta firma como imagen vinculada a la sesión
```

**Campos nuevos en `packages/domain/src/execution.ts`:**
```typescript
// Enriquecer la entidad de ejecución existente:
export interface ExecutionSessionEnriched {
  sessionId: string;
  startTime: Date;
  endTime?: Date;
  elapsedMinutes: number;
  estimatedMinutes: number;
  offlineQueueSize: number;
  evidenceQueue: {
    localId: string;
    category: 'before' | 'during' | 'after' | 'finding';
    status: 'pending_upload' | 'uploading' | 'uploaded' | 'error';
    compressedSizeKB: number;
  }[];
  novelties: {
    description: string;
    type: string;
    derivedWorkRequestId?: string;
  }[];
  supervisorSignature?: {
    dataUrl: string;
    signerName: string;
    signerRole: string;
    timestamp: Date;
  };
}
```

***

### 3.5 Evidencias FSM (`/evidences`)

**Estado actual:** Módulo `evidence` existe en backend. No hay workflow formal de estados.

**Workflow de estados FSM a implementar (P1):**

```
captured → uploaded → under_review → verified
                                   ↘ rejected → replacement_requested → captured (ciclo)
```

**Contenido profesional requerido:**

```
VISTA GALERÍA POR ORDEN
  - Evidencias agrupadas por fase del flujo de 14 pasos
  - Filtros: por estado / por categoría / por técnico / por fecha
  - Vista grid y vista lista

ESTADO VISUAL POR EVIDENCIA
  - Badge: capturada / subida / en revisión / verificada / rechazada
  - Si rechazada: motivo del rechazo + botón "Solicitar reemplazo"
  - Historial de versiones (evidencia original → reemplazo)

REQUISITOS POR FASE
  - Indicador: "2 de 4 evidencias requeridas para Fase 6"
  - Lista de evidencias pendientes con descripción de qué se necesita

VIEWER DE IMAGEN
  - Zoom, rotación
  - Metadatos: quién subió, cuándo, coordenadas GPS si disponibles
  - Botones: Verificar ✅ / Rechazar ❌ (con campo motivo obligatorio)
```

**Campos nuevos en `packages/shared-types`:**
```typescript
export type EvidenceStatus = 
  | 'captured'
  | 'uploaded'  
  | 'under_review'
  | 'verified'
  | 'rejected'
  | 'replacement_requested';

export interface EvidenceEnriched {
  id: string;
  serviceCaseId: string;
  phase: OperationalStep;
  category: 'before' | 'during' | 'after' | 'finding' | 'safety';
  status: EvidenceStatus;
  fileAssetId: string;              // SSOT: FileAsset, NO MediaAsset separado
  rejectionReason?: string;
  rejectedBy?: string;
  rejectedAt?: Date;
  replacesEvidenceId?: string;      // historial de versiones
  verifiedBy?: string;
  verifiedAt?: Date;
  metadata: {
    capturedBy: string;
    capturedAt: Date;
    coordinates?: { lat: number; lng: number };
    deviceInfo?: string;
    originalSizeKB: number;
    compressedSizeKB: number;
  };
}
```

***

### 3.6 Flota (`/fleet`)

**Estado actual:** Módulo `fleet` existe con `fleet-readiness.rules.ts` en dominio.

**Contenido profesional requerido (P1) — Inspiración: Limble CMMS + Cryotos:**[^1]

```
FICHA TÉCNICA DEL VEHÍCULO
  - Placa, marca, modelo, año, tipo de vehículo
  - Kilometraje actual (actualizable)
  - Estado: disponible / asignado / en mantenimiento / baja de servicio
  - Foto principal + galería de fotos

CERTIFICACIONES CON VENCIMIENTO (nuevo — crítico)
  - SOAT: número, aseguradora, fecha vencimiento, días restantes
  - Tecnomecánica: número, fecha vencimiento
  - Seguro todo riesgo: número, aseguradora, fecha vencimiento
  - Permiso de circulación: fecha vencimiento
  - Alerta automática: 30/15/7 días antes de cada vencimiento
  - Bloqueo: no asignable si SOAT o tecnomecánica están vencidos

CHECK-IN / CHECK-OUT PERSISTENTE (nuevo)
  - Quién tiene el vehículo, desde cuándo
  - Motivo de asignación (orden de trabajo vinculada)
  - Kilometraje al salir / al regresar
  - Estado de entrega: OK / novedad

HISTORIAL DE ASIGNACIONES
  - Todas las órdenes en las que participó el vehículo
  - Kilómetros recorridos por período
  - Técnico que lo condujo

FOTOS PRE/POST MISIÓN
  - Fotos del vehículo antes de cada salida
  - Fotos al regresar (detectar daños)
  - Vinculadas a FileAsset (SSOT)
```

**Campos nuevos en `backend/src/modules/fleet/` y schema Prisma:**
```typescript
// Nuevo modelo en prisma/schema.prisma:
model FleetVehicle {
  id                String   @id @default(auto()) @map("_id") @db.ObjectId
  plate             String   @unique
  brand             String
  model             String
  year              Int
  vehicleType       VehicleType
  currentOdometer   Float
  status            VehicleStatus         // available | assigned | maintenance | retired
  
  // Certificaciones (NUEVO)
  soatNumber        String?
  soatInsurer       String?
  soatExpiry        DateTime?
  techInspectionExpiry DateTime?
  insuranceExpiry   DateTime?
  circulationPermitExpiry DateTime?
  
  // Relaciones
  checkouts         FleetCheckout[]
  certificationAlerts CertificationAlert[]
  photos            FileAsset[]
  
  createdAt         DateTime @default(now())
  updatedAt         DateTime @updatedAt
}

model FleetCheckout {
  id              String    @id @default(auto()) @map("_id") @db.ObjectId
  vehicleId       String    @db.ObjectId
  serviceCaseId   String?   @db.ObjectId
  checkedOutBy    String    @db.ObjectId    // userId
  checkedOutAt    DateTime
  odometerOut     Float
  checkedInAt     DateTime?
  odometerIn      Float?
  returnStatus    ReturnStatus?             // ok | with_issues
  notes           String?
  vehicle         FleetVehicle @relation(fields: [vehicleId], references: [id])
}
```

***

### 3.7 Herramientas y Recursos (`/tools`)

**Estado actual:** Módulo `tool` existe en backend.

**Contenido profesional requerido (P1):**

```
FICHA DE HERRAMIENTA / EQUIPO
  - Nombre, código interno, tipo, marca, modelo, número de serie
  - Estado: disponible / asignada / en calibración / dada de baja
  - Foto principal

CALIBRACIONES FORMALES (nuevo — crítico para CERMONT)
  - Fecha última calibración
  - Certificado adjunto (vía FileAsset)
  - Entidad certificadora
  - Fecha próxima calibración
  - Alerta automática: 30/15/7 días antes de vencer
  - Bloqueo: no asignable si calibración vencida

CHECKOUT / CHECKIN DE HERRAMIENTA
  - Quién la tiene, desde cuándo, para qué orden
  - Registro de entrega con foto del estado

HISTORIAL DE USO
  - Órdenes en que fue utilizada
  - Horas de uso acumuladas
  - Historial de calibraciones

QR POR HERRAMIENTA (P2)
  - Código QR generado automáticamente
  - Escanear → ver estado, checkout, historial, crear work request
```

**Campos nuevos en schema:**
```typescript
model Tool {
  id                  String   @id @default(auto()) @map("_id") @db.ObjectId
  name                String
  internalCode        String   @unique
  toolType            ToolType
  brand               String?
  model               String?
  serialNumber        String?
  status              ToolStatus           // available | checked_out | calibrating | retired
  qrCode              String?              // base64 o URL del QR (P2)
  
  // Calibración (NUEVO)
  lastCalibrationDate  DateTime?
  calibrationCertId    String?  @db.ObjectId  // FileAsset
  calibratingEntity    String?
  nextCalibrationDate  DateTime?
  calibrationAlertDays Int      @default(30)
  
  checkouts           ToolCheckout[]
  calibrationHistory  ToolCalibration[]
  photos              FileAsset[]
}
```

***

### 3.8 Costos e Inteligencia Financiera (`/costs`)

**Estado actual:** Módulo `cost` y `cost.rules.ts` existen. Sin catálogo ni comparación visual.

**Contenido profesional requerido (P1) — Inspiración: Limble CMMS + ServiceTitan:**[^15]

```
CATÁLOGO DE ÍTEMS DE COSTO (nuevo)
  - Materiales: nombre, unidad, precio de referencia, proveedor
  - Mano de obra: rol, tarifa por hora
  - Subcontratistas: empresa, tarifa
  - Alquiler de equipos: tipo, tarifa por día
  - Búsqueda y filtro en el catálogo

COST CART ENRIQUECIDO (mejorar existente)
  - Agregar ítem desde catálogo (no texto libre)
  - Cantidad + unidad + precio unitario = subtotal automático
  - Categoría del ítem (materiales / MOD / subcontratistas / equipos)
  - Impuestos (IVA 19%) calculados automáticamente
  - Total con y sin IVA

COMPARACIÓN REAL vs. ESTIMADO
  - Gráfico de barras: por categoría (estimado vs. real lado a lado)
  - % de desviación por categoría
  - Alerta visual si cualquier categoría supera 80% del presupuesto

DASHBOARD DE COSTOS GLOBAL
  - Rentabilidad por período
  - Top 5 órdenes con mayor desviación de costo
  - Costo promedio por tipo de trabajo

EXPORTACIÓN
  - Excel con detalle de costos por orden
  - PDF de resumen de costos para contabilidad
```

**Campos nuevos en `backend/src/modules/cost/` y schema:**
```typescript
model CostCatalogItem {
  id          String       @id @default(auto()) @map("_id") @db.ObjectId
  name        String
  unit        String                    // unidad, hora, día, global
  unitPrice   Float
  category    CostCategory              // material | labor | subcontractor | equipment
  supplier    String?
  isActive    Boolean  @default(true)
  createdAt   DateTime @default(now())
}

// Enriquecer CostItem existente:
model CostItem {
  id              String    @id @default(auto()) @map("_id") @db.ObjectId
  serviceCaseId   String    @db.ObjectId
  catalogItemId   String?   @db.ObjectId    // link al catálogo (opcional)
  description     String
  quantity        Float
  unitPrice       Float
  category        CostCategory
  vatRate         Float     @default(0.19)   // IVA Colombia
  totalWithVat    Float                      // calculado
  isEstimated     Boolean   @default(false)  // true=propuesta, false=real
  phase           OperationalStep?
  addedBy         String    @db.ObjectId
  createdAt       DateTime  @default(now())
}
```

***

### 3.9 Informes y Actas (`/technical-reports`, `/delivery-records`)

**Estado actual:** Módulos `technical-report` y `delivery-record` existen.

**Contenido profesional requerido (P1):**

```
GENERACIÓN AUTOMÁTICA DE INFORME
  - Datos pre-poblados desde la orden: cliente, fechas, técnico, trabajo realizado
  - Checklists completados incluidos automáticamente
  - Evidencias fotográficas insertadas en posición (antes/durante/después)
  - Resumen de costos desde el módulo de costos
  - Solo revisión y firma final por parte del ingeniero residente

HISTORIAL DE VERSIONES
  - v1.0 generado automáticamente, v1.1 primera revisión, etc.
  - Quién editó qué y cuándo
  - Restaurar versión anterior

VISTA PREVIA ANTES DE ENVIAR
  - Preview del PDF en modal antes de generar definitivo
  - Botón "Corregir" o "Aprobar y generar PDF"

ACTA DE ENTREGA CON FIRMA ELECTRÓNICA
  - Canvas de firma del cliente (o link por email para firma remota — P2)
  - Registro de firma: nombre, cargo, fecha, método (on-site / email)
  - PDF firmado generado y almacenado vía FileAsset
```

***

### 3.10 Facturación y Pagos (`/invoices`, `/payments`)

**Estado actual:** Módulos `invoice` y `payment` existen. Módulo `dian` también creado.

**Contenido profesional requerido (P1):**

```
ESTADOS DE FACTURA (workflow formal)
  draft → sent → approved → paid → overdue → cancelled

PANEL DE SEGUIMIENTO
  - Lista de facturas con estado, fecha de envío, fecha de vencimiento
  - Días vencidos destacados con badge rojo
  - Alerta automática: 30/15/7 días antes de vencer

REGISTRO DE PAGO
  - Fecha de pago, valor recibido, método de pago
  - Número de transacción / referencia bancaria
  - Soporte de pago adjunto (FileAsset)
  - Conciliación: pagado parcial / pagado total / pendiente diferencia

INTEGRACIÓN DIAN (preparación)
  - Módulo `dian` ya existe — conectar con generación de factura
  - Campos requeridos: NIT emisor, NIT receptor, CUFE, QR DIAN
  - Solo activar cuando la empresa tenga habilitación DIAN
```

**Campos nuevos:**
```typescript
export type InvoiceStatus = 
  | 'draft' | 'sent' | 'approved' | 'paid' | 'overdue' | 'cancelled';

// Enriquecer modelo Invoice existente:
model InvoiceEnriched {
  // campos actuales...
  status          InvoiceStatus @default('draft')
  sentAt          DateTime?
  dueDate         DateTime?
  approvedAt      DateTime?
  
  // DIAN (preparación)
  dianCufe        String?
  dianQrCode      String?
  electronicEnabled Boolean @default(false)
  
  payments        PaymentRecord[]
}
```

***

### 3.11 Usuarios y RBAC (`/users`, `/settings/roles`)

**Estado actual:** Módulo `user` y `rbac.ts` + `roles.ts` en domain existen. El módulo `portal` también existe.

**Contenido profesional requerido:**

```
TABLA DE PERMISOS POR MÓDULO (nueva — visual)
  - Filas: módulos del sistema
  - Columnas: los 8 roles RBAC
  - Celda: ✅ completo / 🔒 lectura / ❌ sin acceso
  - Editable por administrador (si el sistema lo permite)

INVITACIÓN POR EMAIL
  - Formulario: email, nombre, rol preseleccionado
  - Envío de link de activación con JWT temporal
  - Status de invitación: pendiente / aceptada / expirada

PORTAL CLIENTE (completar módulo `portal` existente)
  - Vista limitada: solo las órdenes del cliente logueado
  - Ver estado actual de cada orden (paso en el flujo de 14 pasos)
  - Descargar propuestas, actas, facturas
  - Firmar acta desde el portal (firma electrónica web)
  - Historial de pagos propios

AUDITORÍA DE ACCESOS
  - Quién accedió a qué módulo y cuándo
  - Intentos fallidos de login
  - Cambios de rol realizados
```

***

### 3.12 Notificaciones (`/notifications`)

**Estado actual:** Módulo `notifications` existe en backend.

**Contenido profesional requerido (P1):**

```
CENTRO DE NOTIFICACIONES IN-APP
  - Campana con badge de conteo no leídas
  - Panel lateral con lista: icono de tipo / mensaje / tiempo relativo
  - Acciones: marcar leída, ir al recurso, marcar todas como leídas

EVENTOS QUE GENERAN NOTIFICACIÓN
  - Nueva orden asignada al usuario
  - Evidencia rechazada en su orden
  - SES aprobada (a administrador)
  - Pago recibido (a gerente + administrativo)
  - Checklist crítico bloqueado
  - SOAT vencido en vehículo asignado
  - Calibración vencida en herramienta asignada
  - Factura a punto de vencer (30/15/7 días)

PREFERENCIAS POR USUARIO
  - Qué tipos de notificaciones recibir
  - Canal: in-app / email / (WhatsApp futuro — P3)

NOTIFICACIONES DE VENCIMIENTO (jobs programados)
  - Cron job diario: revisa vencimientos próximos de SOAT, calibraciones, facturas
  - Módulo `jobs/` en backend ya existe → agregar aquí
```

***

### 3.13 Configuración y Ajustes (`/settings`)

**Estado actual:** Módulo `system-config` existe.

**Contenido profesional requerido:**

```
DATOS DE LA EMPRESA
  - Logo, nombre comercial, NIT, dirección, teléfono, email
  - Zona horaria (default: America/Bogota)
  - Moneda (default: COP)

UMBRALES Y ALERTAS GLOBALES
  - Días de anticipación para alerta de vencimientos
  - % de presupuesto para activar alerta de costo (default: 80%)
  - Política de retención de evidencias (meses)

GESTIÓN DE PLANTILLAS
  - Plantillas de informe técnico por tipo de trabajo
  - Plantillas de acta de entrega
  - Plantillas de email de notificación

FEATURE FLAGS (preparación multitenancy)
  - Activar/desactivar módulos por empresa (preparación P3)
  - Registro de flags en `system-config` → base para SaaS multitenancy

LEGAL
  - Enlace a Política de Privacidad (Ley 1581 de 2012)
  - Enlace a Términos y Condiciones
  - Log de consentimientos de usuarios
```

***

## 4. Campos Nuevos por Workspace: Resumen Técnico

### 4.1 Workspace `packages/` — Contratos compartidos nuevos

| Archivo nuevo | Contenido | Consumido por |
|--------------|-----------|---------------|
| `packages/shared-types/src/dashboard-kpi.types.ts` | `DashboardKPISnapshot`, `RoleBasedAlerts` | frontend + backend/dashboard |
| `packages/shared-types/src/evidence-fsm.types.ts` | `EvidenceStatus`, `EvidenceEnriched`, `EvidenceRequirement` | frontend + backend/evidence |
| `packages/shared-types/src/fleet-extended.types.ts` | `FleetCertification`, `FleetCheckout`, `ReturnStatus` | frontend + backend/fleet |
| `packages/shared-types/src/tool-calibration.types.ts` | `ToolCalibration`, `CalibrationAlert` | frontend + backend/tool |
| `packages/shared-types/src/cost-catalog.types.ts` | `CostCatalogItem`, `CostCategory`, `CostSummary` | frontend + backend/cost |
| `packages/shared-types/src/invoice-extended.types.ts` | `InvoiceStatus`, `PaymentRecord`, `DianFields` | frontend + backend/invoice |
| `packages/domain/src/notification-events.ts` | `NotificationEventType`, `NotificationPayload` | backend/notifications |
| `packages/domain/src/certification-rules.ts` | `isCertificationExpired()`, `getDaysUntilExpiry()` | backend/fleet + backend/tool |
| `packages/domain/src/cockpit.projection.ts` | `ServiceCaseCockpit` projection logic | backend/service-cases |

### 4.2 Workspace `backend/` — Módulos a crear o enriquecer

| Módulo | Tipo de cambio | Prioridad |
|--------|---------------|-----------|
| `backend/src/modules/dashboard` | Agregar endpoints: KPI snapshot, gráficas, alertas accionables | P1 |
| `backend/src/modules/fleet` | Agregar: certificaciones SOAT/TM/seguro, checkout/checkin, alertas | P1 |
| `backend/src/modules/tool` | Agregar: calibraciones formales, checkout/checkin, alertas | P1 |
| `backend/src/modules/evidence` | Implementar FSM de estados, rechazo con motivo, reemplazo | P1 |
| `backend/src/modules/cost` | Agregar: catálogo de ítems, VAT calc, exportación Excel | P1 |
| `backend/src/modules/notifications` | Implementar eventos, centro in-app, preferencias usuario | P1 |
| `backend/src/modules/portal` | Completar: vista cliente, firma web, historial órdenes | P1/P2 |
| `backend/src/jobs/` | Agregar cron jobs: vencimientos SOAT, calibraciones, facturas | P1 |
| `backend/src/modules/ai` | Implementar AI Copilot MVP: resumen orden, detección faltantes | P2 |
| `backend/src/modules/automation` | Nuevo: motor SI-ENTONCES, audit de reglas disparadas | P2 |

### 4.3 Workspace `frontend/` — Páginas a crear o enriquecer

| Página/Ruta | Cambio | Prioridad |
|------------|--------|-----------|
| `/dashboard` | Rediseño total: KPI cards + gráficos + alertas + timeline | P1 |
| `/service-cases/[id]` | Cockpit visual 14 pasos + timeline + costos inline | P1 |
| `/planning-packets/[id]` | Vista disponibilidad recursos, checklist alistamiento | P1 |
| `/execution-sessions/[id]` | Cronómetro + evidencias con queue + firma digital | P1 |
| `/evidences` | Galería + FSM states + viewer con verificar/rechazar | P1 |
| `/fleet/[id]` | Ficha completa + certificaciones + checkout | P1 |
| `/tools/[id]` | Ficha + calibraciones + checkout | P1 |
| `/costs` | Catálogo + cost cart + comparación real/estimado | P1 |
| `/notifications` | Centro notificaciones + preferencias | P1 |
| `/settings/roles` | Tabla visual de permisos por módulo | P1 |
| `/portal` | Vista cliente externo completa | P1/P2 |
| `/privacy` + `/terms` | Cumplimiento Ley 1581 | P0/Legal |
| `/automations` | Motor SI-ENTONCES configurable | P2 |
| `/ai-copilot` | Resumen, detección faltantes, borrador informe | P2 |

***

## 5. Software Moderno Recomendado por Categoría

### 5.1 UI Components y Dashboard

| Herramienta | Uso en CERMONT | Por qué elegirla |
|-------------|---------------|-----------------|
| **shadcn/ui** | KPI cards, modales, sidebar, formularios | Compatible Next.js App Router, accesible, Tailwind-native[^16][^17] |
| **Recharts** | Gráficos KPI en dashboard | Ligero, SSR-compatible, composable en React |
| **Tremor** | Dashboard analytics pre-built | KPI cards y gráficos financieros listos para usar |
| **TanStack Table v8** | Tablas con filtros, sort, export | Headless, type-safe, maneja datos grandes sin rerenders |
| **Framer Motion** | Micro-animaciones en FSM states | Transiciones de estado de evidencia, progress bars animados[^18] |
| **React Signature Canvas** | Firma digital en campo y portal | Captura firma → PNG → FileAsset |

### 5.2 Backend y Servicios

| Herramienta | Uso en CERMONT | Por qué elegirla |
|-------------|---------------|-----------------|
| **node-cron** / **@nestjs/schedule** | Cron jobs de vencimientos | Alertas automáticas diarias de SOAT, calibraciones, facturas |
| **Sharp** | Compresión de imágenes | Fix definitivo para PayloadTooLargeError antes de subir a storage |
| **qrcode** (npm) | Generación QR por activo | QR de herramientas y vehículos para escaneo en campo (P2) |
| **react-pdf / pdf-lib** | PDF de informes y actas | Ya instalado — completar integración con datos estructurados |
| **OpenTelemetry** | Observabilidad en producción | Módulo `observability` ya existe en backend → instrumentar |
| **@nestjs/event-emitter** | Motor de automatizaciones | Eventos internos → acciones configuradas por el usuario |

### 5.3 Herramientas de Desarrollo y Calidad

| Herramienta | Uso | Beneficio |
|-------------|-----|-----------|
| **Storybook** | Documentar componentes UI | Biblioteca de componentes reutilizables con preview |
| **Playwright** | E2E tests flujo críticos | Ya instalado → smoke tests P0 |
| **DbSchema** | Visualizar/documentar MongoDB schema | Facilita documentación del schema Prisma[^19] |
| **Biome** | Linter + formatter unificado | Ya configurado (`biome.json` verificado en repo) |

### 5.4 Plataformas de Referencia Open Source

| Proyecto | Relevancia para CERMONT | Stack |
|----------|------------------------|-------|
| **FieldPro** (GitHub) | PWA offline, stack similar | React + Node |
| **OCA Field Service** (Odoo) | Patrón de descomposición modular FSM | Python |
| **Atlas CMMS** | Autoalojado, assets + work orders | Node.js |
| **Unstructured.io** | Extracción documental IA (PDF → datos) | Python — útil para P2 |

***

## 6. Roadmap de Escalamiento: P0 → P3

### P0 — Estabilización (Sprint 1 — Condición de entrada)

> Sin P0 resuelto, **no se puede escalar**. Es el quality gate bloqueante.

| Tarea | Acción técnica | Criterio de salida |
|-------|---------------|-------------------|
| `quality:strict` → PASS | Actualizar baseline en `tooling/quality/`, eliminar 2861 weak tokens | `npm run verify` → PASS |
| React Doctor 77 → 87 | Fix 1 bug + 6 issues a11y + top 9 mantenibilidad | Score ≥ 87/100 |
| PayloadTooLargeError | Integrar `sharp` para comprimir imágenes antes de upload + nginx config | Sin errores 413 en producción |
| Mapas de arquitectura | Crear `FRONTEND_BACKEND_MATRIX.md`, `DOMAIN_MODULE_MAP.md`, `PWA_OFFLINE_FLOW_MAP.md` | 3 archivos en `/docs` |
| Legal gap | Crear rutas `/privacy`, `/terms`, consent básico, `AUTHORS.md` | Ley 1581 básica implementada |

### P1 — Profesionalización (Sprints 2-6)

> Objetivo: que CERMONT sea comparable con MaintainX y Limble en funciones core.[^1]

**Slice 01 — FileAsset SSOT** (Sprint 2): Alinear todos los entityTypes, eliminar posible `MediaAsset` duplicado, centralizar toda subida de archivos en un único pipeline.[^8]

**Slice 02 — Flota profesional** (Sprint 2): Check-in/out persistente, certificaciones con vencimiento, cron job de alertas, reglas de bloqueo de asignación, fotos vía FileAsset.

**Slice 03 — Herramientas profesional** (Sprint 2): Calibraciones formales, certificados adjuntos, disponibilidad tiempo real, historial de uso, alertas de vencimiento.

**Slice 04 — Evidencias FSM** (Sprint 3): Implementar `captured → uploaded → under_review → verified/rejected`, rechazo con motivo, historial de reemplazos, galería por orden.

**Slice 05 — Checklists bloqueantes** (Sprint 3): Ítems críticos que impiden avanzar fase sin completarse, firma requerida como ítem, versionado de checklists.

**Slice 06 — Dashboard accionable** (Sprint 4): KPI cards con `shadcn/ui`, gráficos con Recharts, panel por rol, alertas con botón de resolución, timeline de actividad. Inspirado en Limble CMMS.[^15]

**Slice 07 — Cockpit de 14 pasos** (Sprint 4): Vista unificada ServiceCase con progress bar, next action, costos inline, documentos por fase, timeline de eventos.

**Slice 08 — Costo intelligence** (Sprint 5): Catálogo de ítems, IVA automático, comparación real/estimado, alerta >80%, exportación Excel.

**Slice 09 — Notificaciones completas** (Sprint 5): Centro in-app, eventos por tipo, cron jobs de vencimientos, preferencias por usuario.

**Slice 10 — Portal cliente** (Sprint 6): Completar módulo `portal` con vista de órdenes, documentos, firma de acta, historial de pagos. Inspirado en ServiceTitan Customer Portal.[^3][^2]

### P2 — Innovación (Sprints 7-10)

> Objetivo: superar a MaintainX y Limble con capacidades diferenciadoras.

**Slice 11 — Motor de automatizaciones SI-ENTONCES** (Sprint 7): Reglas configurables por usuario (evento + condición + acción), auditoría de reglas disparadas. Inspirado en Opsima y Salesforce Field Service.[^6]

**Slice 12 — AI Copilot MVP** (Sprint 8): Resumen de orden, detección de faltantes, borrador de informe técnico. Todo resultado IA es borrador editable. Log de auditoría por llamada. Módulo `ai` ya existe en backend.[^20]

**Slice 13 — QR/NFC para activos** (Sprint 9): Escanear herramienta o vehículo → ver estado, checkout, historial. Librería `qrcode` + `html5-qrcode` en frontend.

**Slice 14 — Planeación inteligente** (Sprint 10): Vista drag-and-drop de disponibilidad de técnicos, optimización sugerida de rutas.

### P3 — SaaS Comercial (Sprints 11+)

**Slice 15 — Multitenancy foundation**: Modelo `Tenant`, aislamiento de datos por empresa, branding por empresa, feature flags por plan. Transformar CERMONT en plataforma multi-empresa para Colombia y Latam.[^21]

**Slice 16 — Billing SaaS**: Planes de uso, medición de consumo, facturación automática (Stripe o similar).

**Referencia real en Colombia:** Grupo EPM implementó FSM SaaS de OverIT para 3.000 técnicos en Colombia, Centroamérica, Chile y México en 2026, señalando que el mercado latinoamericano de FSM está madurando aceleradamente.[^21]

***

## 7. Gaps Críticos vs. Mercado FSM 2026

Comparado con MaintainX (mejor en movilidad), Limble (mejor en assets), y ServiceTitan (mejor en portal cliente), CERMONT **actualmente no tiene**:[^2][^1]

| Gap | Impacto | Referencia de mercado |
|-----|---------|----------------------|
| Vista unificada cockpit de 14 pasos | Alto — confusión de estado de orden | ServiceTitan job detail |
| Dashboard KPI con MTTR/MTBF calculados | Alto — sin visibilidad operativa | Limble Custom Dashboard[^15] |
| Workflow formal de evidencias (FSM states) | Alto — sin trazabilidad de calidad | MaintainX photo workflow[^8] |
| Checklists bloqueantes reales | Alto — ejecución sin validación | MaintainX checklist logic |
| Certificaciones vencidas bloqueando asignación | Alto — riesgo operativo y legal | Cryotos asset lifecycle[^11] |
| Portal cliente funcional | Medio — sin autoservicio al cliente | ServiceTitan Customer Portal[^2] |
| Motor de reglas SI-ENTONCES | Medio — todo manual | Opsima + Salesforce FSM[^6] |
| Cumplimiento legal Ley 1581 | Crítico/Legal — `/privacy` y `/terms` ausentes | Regulación colombiana |

### Fortalezas a proteger y potenciar

| Fortaleza | Por qué protegerla |
|-----------|-------------------|
| **Contract-First con Zod** | Diferenciador técnico real vs. FSM open source sin types[^22] |
| **PWA/offline con Serwist** | Pocos competidores tienen offline tan bien arquitecturado para campo remoto |
| **RBAC de 8 roles** | Base sólida — solo completar gaps en `administrativo` y `cliente` |
| **1013 tests + CI gates** | Protege el escalamiento — no romper en cada sprint |
| **Módulo DIAN** | Ventaja competitiva única vs. FSM internacionales en Colombia |
| **Flujo de 14 pasos** | Diferenciador conceptual vs. FSM genéricos del mercado |

***

## 8. Guardrails del Escalamiento

Reglas a respetar en cada sprint para proteger la arquitectura:

- ❌ **No escalar P1+ sin pasar `quality:strict`** — el quality gate es condición de entrada
- ❌ **No crear `MediaAsset` separado** — `FileAsset` es el SSOT para todos los archivos
- ❌ **No introducir nuevos `any`, `null`, `unknown`, `undefined`** — refactorizar los existentes
- ❌ **No escalar antes de resolver React Doctor a11y** — accesibilidad afecta usuarios de campo
- ❌ **No prometer métricas operativas sin piloto real** — indicadores solo con evidencia verificable
- ❌ **No modificar `package.json` sin autorización** — gestión centralizada de dependencias
- ❌ **No reemplazar VPS por Vercel sin decisión explícita** — impacto en costo y configuración
- ✅ **Siempre usar `packages/domain/src/` para reglas de negocio puras** — nunca en controllers
- ✅ **Cada nuevo campo en schema → actualizar `packages/shared-types/` antes que el controller**
- ✅ **Todo resultado de IA es borrador editable** — nunca auto-guardar sin revisión humana[^20]

***

## 9. Primer Sprint Recomendado

**Sprint 1 = P0 Stabilization (1-2 semanas):**

```bash
# Objetivo: npm run verify → PASS, React Doctor ≥ 87, PayloadTooLargeError resuelto

Tareas:
1. tooling/quality/ → actualizar baseline weak tokens → quality:strict PASS
2. Frontend: fix react-doctor (1 bug + 6 a11y + 3 maintainability)
3. Backend: instalar sharp, agregar compresión pre-upload en backend/src/modules/files/
4. Nginx: configurar client_max_body_size 50m en VPS
5. docs/: crear FRONTEND_BACKEND_MATRIX.md + DOMAIN_MODULE_MAP.md + PWA_OFFLINE_FLOW_MAP.md
6. Frontend: crear /privacy y /terms con contenido básico Ley 1581
7. Playwright: smoke tests para login + create-service-case + evidence-upload
```

**Sprint 2 = Slices 01+02+03 (FileAsset + Flota + Herramientas):**
Trabajar en paralelo: un agente en FileAsset SSOT, otro en schema de flota y herramientas. Validar con tests unitarios de reglas de negocio en `packages/domain/`.

**Sprint 3 = Slices 04+05 (Evidencias FSM + Checklists bloqueantes):**
Implementar la FSM de evidencias end-to-end: backend → shared-types → frontend con estados visuales y animaciones Framer Motion.

**Sprint 4 = Slices 06+07 (Dashboard + Cockpit):**
Los cambios más visibles del sistema. Priorizar el dashboard por rol y el cockpit unificado de la orden.

***

## 10. Visión de CERMONT como Producto Diferenciado

CERMONT tiene los ingredientes únicos para convertirse en el FSM+GMAO+ERP de referencia para **empresas de servicios de campo en Colombia y Latinoamérica**: flujo de 14 pasos documentado académicamente, arquitectura Contract-First con Zod, PWA/offline real para zonas remotas de Arauca, RBAC multi-rol maduro, y módulo DIAN nativo que ninguna plataforma FSM internacional contempla.

El mercado latinoamericano de FSM está en plena maduración: Grupo EPM implementó FSM SaaS para 3.000 técnicos en Colombia y la región en 2026, evidenciando la demanda creciente. El diferenciador de CERMONT no son las funciones individuales (que MaintainX o Limble también tienen) sino la **integración cohesiva de todo el ciclo** desde la solicitud hasta el cobro, adaptada al contexto operativo colombiano (SES/Ariba, facturación DIAN, Ley 1581, operación en campo energético).[^23][^21]

Al ejecutar P0 primero (estabilizar deuda técnica), luego P1 (profesionalizar cada módulo al estándar del mercado), P2 (innovar con copiloto IA y motor de automatizaciones), y finalmente P3 (multitenancy SaaS), CERMONT puede posicionarse como alternativa real y culturalmente adaptada a las soluciones internacionales que no contemplan las particularidades del mercado de servicios de campo colombiano.[^21][^1]

---

## References

1. [Best CMMS Software for 2026: An Independent Comparison - Reliable](https://reliamag.com/guides/best-cmms-software-2026/) - 7 Best CMMS Platforms for 2026, Ranked by Use Case · 1. MaintainX — Best for Mobile-First Teams · 2....

2. [The New Customer Portal end user experience - ServiceTitan](https://help.servicetitan.com/docs/the-new-customer-portal-end-user-experience) - This includes paying invoices, accepting estimates, and getting information on upcoming appointments...

3. [Set up and customize the New Customer Portal - ServiceTitan](https://help.servicetitan.com/docs/set-up-and-customize-the-new-customer-portal) - This includes paying invoices, accepting estimates, self-scheduling, and getting information on upco...

4. [CMMS Software Built For Your Enterprise-Grade FM Ops Team](https://facilio.com/product/cmms-software/) - AI-powered CMMS software that unifies maintenance management operations. Automate workflows, ensure ...

5. [Facilio 2026 Pricing, Features, Reviews & Alternatives - GetApp](https://www.getapp.com/operations-management-software/a/facilio/) - Facilio's Connected CMMS empowers property owners/operators to streamline their end-to-end portfolio...

6. [Opsima — Enterprise AI for Industrial Ops](https://opsima.com) - Industrial operations platform for field-first teams. Build AI agents, apps, and workflows in plain ...

7. [11 Best Field Service Management System Features | FIELDBOSS](https://www.fieldboss.com/blog/best-field-service-management-software-features/) - Unlock success with the top field service management system features. Choose the right solution with...

8. [Building Maintenance Software Buyer's Guide [2026] - MaintainX](https://www.getmaintainx.com/blog/building-maintenance-software-buyers-guide) - Give technicians a fast, mobile-first, and accessible app (even offline) to find asset history, comp...

9. [MaintainX Mobile vs. Web](https://help.getmaintainx.com/mobile-vs-web-overview) - Offline mode lets you use the MaintainX application when your device isn't connected to the internet...

10. [Customer Portal overview - ServiceTitan](https://help.servicetitan.com/roofing/docs/customer-portal-overview) - The Customer Portal is a web portal where your customers can view their outstanding invoices, servic...

11. [Top Maintenance KPIs to Track in 2026: MTBF, OEE](https://www.cryotos.com/blog/maintenance-kpis-the-most-important-metrics-to-track-in-2026) - The Most Important Maintenance KPIs to Track in 2026 · Mean Time Between Failures (MTBF) · Mean Time...

12. [MaintainX Review 2026: Is It Right for Your Team? - Facilio](https://facilio.com/blog/maintainx-cmms-review/) - As of 2026, the headline features include AI-assisted work order descriptions, parts suggestions dra...

13. [Shadcn Statistics Component](https://shadcnstudio.com/blocks/dashboard-and-application/statistics-component) - Boost your UI with stylish, responsive Shadcn statistics blocks & KPI cards for dynamic dashboards, ...

14. [18+ Shadcn Statistics Component](https://shadcnspace.com/blocks/dashboard-ui/statistics-component) - A compact statistics section with KPI cards highlighting earnings, expenses, weekly sales, and order...

15. [Top 10 CMMS Reporting Dashboards & KPI Platforms (2026)](https://eworkorders.com/top-10-cmms-reporting-kpi-dashboards-that-maintenance-managers-actually-use/) - ... Limble CMMS, Mid-sized operations wanting instant visibility into MTTR and MTBF metrics. Modern,...

16. [How to Build an Admin Dashboard with shadcn/ui and Next.js](https://adminlte.io/blog/build-admin-dashboard-shadcn-nextjs/) - This guide walks you through the key decisions, architecture patterns, and tools for building an adm...

17. [Best shadcn Dashboard Templates 2026 - thefrontkit](https://thefrontkit.com/blogs/best-shadcn-dashboard-templates-2026) - We tested 10 shadcn dashboard templates (free and paid) on component count, accessibility, dark mode...

18. [7 SaaS UX Design Best Practices for 2026 - Mouseflow](https://mouseflow.com/blog/saas-ux-design-best-practices/) - 1. Research and Testing · 2. Principle of Familiarity · 3. Progressive Disclosure · 4. Personalizati...

19. [MongoDB Schema Design Best Practices for 2026](https://dbschema.com/blog/mongodb/mongodb-schema-design-2026/) - In this guide, you'll learn how to design efficient MongoDB schemas in 2026, avoid common mistakes, ...

20. [Agentic AI in 2026: Designing Enterprise-Grade AI Agents ... - Fracto](https://www.fracto.ie/blog-posts/agentic-ai-enterprise-workflows-orchestration-2026) - Continuous monitoring of spend, anomalies and variances. · Autonomous workflows for purchase requisi...

21. [Grupo EPM moderniza operaciones de 3.000 técnicos en LATAM ...](https://enertic.org/grupo-epm-moderniza-operaciones-de-3-000-tecnicos-en-latam-con-el-field-service-saas-de-overit/) - 2026 Grupo EPM moderniza operaciones de 3.000. Field Service SaaS de OverIT operaciones en Colombia,...

22. [Pipes | NestJS - A progressive Node.js framework](https://docs.nestjs.com/pipes) - The Zod library allows you to create schemas in a straightforward way, with a readable API. Let's bu...

23. [Grupo EPM moderniza operaciones de 3.000 técnicos en LATAM ...](https://www.prnewswire.com/news-releases/grupo-epm-moderniza-operaciones-de-3-000-tecnicos-en-latam-con-el-field-service-saas-de-overit-302719117.html) - Grupo EPM elige la plataforma SaaS de Field Service Management de OverIT para modernizar las operaci...

