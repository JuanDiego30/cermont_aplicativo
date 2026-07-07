# DOC-CANON-05 — Flujo Operacional de 14 Pasos y Modelo de Negocio

**Proyecto:** Cermont S.A.S. — Plataforma documental-operativa
**Version:** v2.1 canónica ampliada para ejecución IA/Codex
**Estado:** SOURCE_OF_TRUTH + ANEXO v2.1 operativo
**Compresion:** DOC-07 + DOC-07B + DOC-22 + DOC-23

---

## 1. Vision del Flujo

El flujo operacional de Cermont es un **pipeline de 14 pasos** que transforma una solicitud del cliente en un trabajo ejecutado, documentado, facturado y pagado. Cada paso tiene una entidad principal, reglas de transicion y bloqueadores que impiden avanzar si las condiciones no se cumplen.

La regla central es:

> **Ningun paso administrativo puede avanzar si los artefactos tecnicos previos no estan completos, aprobados y auditados.**

---

## 2. Entidad Orquestadora: ServiceCase

`ServiceCase` es la proyeccion que permite conocer el estado real de cada trabajo. No es una pantalla decorativa — es el nucleo del sistema.

### 2.1 Responsabilidades

```typescript
interface ServiceCase {
  id: string
  workOrderId: string

  // Estado derivado (NO almacenado directamente, calculado)
  stage: ServiceCaseStage       // Etapa actual del pipeline

  // Bloqueadores (calculados en tiempo real)
  blockers: Blocker[]           // Razones por las que no puede avanzar

  // Acciones permitidas
  nextActions: NextAction[]     // Acciones permitidas segun rol y estado

  // Timeline
  timeline: TimelineEvent[]     // Linea de tiempo de artefactos

  // Resumenes
  financialSummary: FinancialSummary
  operationalSummary: OperationalSummary
  documentSummary: DocumentSummary
}

// Las etapas posibles del pipeline
type ServiceCaseStage =
  | "intake"               // Solicitud recibida
  | "qualification"        // En calificacion
  | "proposal"             // Propuesta pendiente
  | "approval"             // Esperando aprobacion/PO
  | "planning"             // En planeacion
  | "ready_to_execute"     // Listo para ejecutar
  | "execution"            // En ejecucion
  | "evidence_collection"  // Recolectando evidencias
  | "technical_closure"    // Cierre tecnico (informe)
  | "delivery"             // Entrega (acta)
  | "ses"                  // SES/Ariba
  | "invoicing"            // Facturacion
  | "payment"              // Pago
  | "closed"               // Cerrado completamente
  | "cancelled"            // Cancelado
```

### 2.2 Calculo de Estado

El `stage` se **deriva** de las entidades hijas, no de flags manuales:

```typescript
function calculateStage(workOrder: WorkOrder): ServiceCaseStage {
  if (workOrder.status === "cancelled") return "cancelled"
  if (workOrder.paymentId) return "closed"
  if (workOrder.invoiceId) return "payment"
  if (workOrder.serviceEntrySheetId) return "invoicing"
  if (workOrder.deliveryRecordId) return "ses"
  if (workOrder.technicalReportId) return "technical_closure"
  if (workOrder.executionSessionId) return "execution"
  if (workOrder.planningPacketId) return "planning"
  if (workOrder.proposalId) return "approval"
  return "intake"
}
```

**Prohibido** usar flags como `reportGenerated`, `invoiceReady`, `canBill`, `isPaid` — estos estados deben calcularse desde entidades reales.

### 2.3 Bloqueadores (Blockers)

```typescript
interface Blocker {
  code: string           // Ej: "MISSING_PLANNING_PACKET"
  message: string        // Ej: "La orden requiere planeacion aprobada"
  severity: "critical" | "warning"
  entityType: string     // Que entidad lo causa
  entityId?: string
  resolutionAction: string  // Accion para resolverlo
}
```

Bloqueadores canonicos:

| Codigo | Cuando Aparece | Accion Correctiva |
|---|---|---|
| `MISSING_COST_BASELINE` | Propuesta sin desglose de costos | Crear baseline economico |
| `MISSING_PURCHASE_ORDER` | Propuesta aprobada sin PO | Registrar orden de compra del cliente |
| `PURCHASE_ORDER_NOT_VALIDATED` | PO registrada pero no validada | Validar monto, cliente y alcance |
| `MISSING_PLANNING_PACKET` | Orden sin planeacion | Crear paquete de planeacion |
| `PLANNING_NOT_READY` | Planeacion incompleta | Completar crew, herramientas, materiales, HES |
| `MISSING_AST` | Falta Analisis de Seguridad en el Trabajo | Adjuntar AST |
| `MISSING_PTW` | Falta Permiso de Trabajo | Adjuntar permiso de trabajo |
| `EXPIRED_CERTIFICATE` | Herramienta/certificado vencido | Renovar o sustituir recurso |
| `EXECUTION_NOT_STARTED` | Orden lista pero no ejecutada | Iniciar ejecucion |
| `MISSING_EVIDENCE` | Ejecucion sin evidencias minimas | Adjuntar evidencia minima |
| `MISSING_TECHNICAL_REPORT` | Ejecucion terminada sin informe | Generar informe tecnico |
| `TECHNICAL_REPORT_NOT_APPROVED` | Informe pendiente de aprobacion | Revisar y aprobar informe |
| `MISSING_DELIVERY_RECORD` | Informe aprobado sin acta | Generar acta de entrega |
| `DELIVERY_RECORD_NOT_SIGNED` | Acta enviada sin firma | Obtener firma del cliente |
| `SES_NOT_SUBMITTED` | Falta radicar SES | Radicar SES/Ariba |
| `SES_REJECTED` | SES fue rechazada | Corregir y reenviar |
| `INVOICE_NOT_SUBMITTED` | SES aprobada sin factura | Crear factura |
| `INVOICE_REJECTED` | Factura rechazada | Corregir datos y reenviar |
| `PAYMENT_NOT_REGISTERED` | Factura aprobada sin pago | Registrar referencia y fecha |
| `PAYMENT_NOT_RECONCILED` | Pago registrado sin conciliar | Conciliar contra factura |

### 2.4 Next Actions

```typescript
interface NextAction {
  action: string         // Ej: "approve_planning"
  label: string          // Ej: "Aprobar planeacion"
  allowedRoles: string[] // Roles que pueden ejecutarla
  requiredPermission?: string
  href?: string          // Ruta del frontend
}
```

Las `nextActions` se calculan dinamicamente segun el estado actual y el rol del usuario.

---

## 3. Descripcion Detallada de los 14 Pasos

### PASO 1: Solicitud del Cliente (WorkRequest)

**Entidad:** `WorkRequest`
**Estados:** `draft → submitted → qualified → visit_scheduled → visit_completed → converted_to_proposal → cancelled`

#### Acciones:

| Accion | Quien | Como |
|---|---|---|
| Crear solicitud | Cliente, gerente, supervisor | `/work-requests/new` |
| Editar solicitud | Creador (solo si draft) | `/work-requests/[id]/edit` |
| Enviar solicitud | Creador | Cambiar status a `submitted` |
| Calificar solicitud | Gerente, supervisor | Evaluar alcance, determinar si necesita visita |
| Programar visita | Supervisor | Asignar fecha y tecnico |
| Completar visita | Tecnico, supervisor | Registrar hallazgos, fotos |
| Convertir a propuesta | Gerente, supervisor | Crear `Proposal` vinculada |
| Cancelar | Gerente | Cambiar a `cancelled` con razon |

#### Validaciones:
- No puede convertirse a propuesta sin estar al menos en `qualified` o `visit_completed`
- La visita tecnica es opcional segun calificacion
- La cancelacion es irreversible

---

### PASO 2: Visita Tecnica (SiteVisit)

**Entidad:** `SiteVisit` (incrustado en `WorkRequest` o entidad separada)
**Cuando aplica:** Cuando la calificacion determina que se necesita evaluacion in situ

#### Acciones:

| Accion | Quien | Como |
|---|---|---|
| Programar visita | Supervisor | Asignar fecha, tecnico, sitio |
| Ejecutar visita | Tecnico | Ir al sitio, evaluar condiciones |
| Registrar hallazgos | Tecnico | Fotos, observaciones, mediciones |
| Completar visita | Supervisor, tecnico | Cerrar visita con conclusiones |

#### Datos capturados:
- Fotos del sitio
- Condiciones del area de trabajo
- Acceso y restricciones
- Riesgos identificados
- Recomendaciones preliminares

---

### PASO 3: Propuesta Economica (Proposal)

**Entidad:** `Proposal`
**Estados:** `draft → submitted → approved → rejected → expired → converted_to_order`

#### Acciones:

| Accion | Quien | Como |
|---|---|---|
| Crear propuesta | Gerente, supervisor | A partir de WorkRequest calificada |
| Definir alcance | Gerente | Descripcion detallada del trabajo |
| Establecer baseline | Gerente, administrativo | Desglose de costos estimados |
| Enviar propuesta | Gerente | Cambiar a `submitted` |
| Aprobar propuesta | Cliente (externo), gerente | Cambiar a `approved` |
| Rechazar propuesta | Cliente, gerente | Cambiar a `rejected` con razon |

#### Baseline de Costos (obligatorio):

```typescript
interface CostBaselineItem {
  category: "material" | "labor" | "tool" | "equipment" | "transport" | "subcontract" | "administrative" | "contingency"
  item: string
  quantity: number
  unit: string
  unitPrice: number
  subtotal: number
}
```

La propuesta **debe** tener un baseline de costos antes de ser enviada. Esto es el punto de referencia para comparar costos reales despues.

#### Validaciones:
- No enviar sin baseline completo
- No aprobar sin revisar alcance y condiciones
- La vigencia es configurable (default 30 dias)

---

### PASO 4: Aprobacion con Purchase Order (PurchaseOrder)

**Entidad:** `PurchaseOrder`
**Estados:** `registered → validated → rejected`

#### Acciones:

| Accion | Quien | Como |
|---|---|---|
| Registrar PO | Gerente, administrativo | Numero PO, archivo, fecha, valor |
| Validar PO | Gerente | Verificar monto, cliente, alcance |
| Rechazar PO | Gerente | Si no coincide con propuesta |

#### Datos:
- Numero de PO
- Archivo del PO (PDF)
- Fecha
- Valor
- Cliente
- Service account / Billing account

#### Validaciones:
- La PO debe coincidir con la propuesta aprobada
- El monto debe ser igual o mayor al estimado
- El cliente debe ser el mismo de la propuesta

---

### PASO 5: Planeacion (PlanningPacket)

**Entidad:** `PlanningPacket`
**Estados:** `draft → submitted → approved → reopened`
**Este paso es la COMPUERTA OPERATIVA antes de ejecutar.**

#### Acciones:

| Accion | Quien | Como |
|---|---|---|
| Crear planeacion | Supervisor | A partir de WorkOrder |
| Asignar equipo (crew) | Supervisor | Seleccionar tecnicos y roles |
| Definir materiales | Supervisor | Lista de materiales con cantidades |
| Asignar herramientas | Supervisor | De catalogo de activos |
| Asignar equipos | Supervisor | Vehiculos, equipos especiales |
| Definir elementos de seguridad | HES, supervisor | EPP, elementos de seguridad |
| Adjuntar AST | HES | Analisis de Seguridad en el Trabajo |
| Adjuntar PTW | HES | Permiso de Trabajo |
| Validar readiness | Sistema | Calcular si esta listo para ejecutar |
| Aprobar planeacion | Supervisor, gerente | Si no hay blockers criticos |

#### Calculo de Readiness:

El sistema calcula automaticamente si la planeacion esta lista:

```typescript
function calculateReadiness(packet: PlanningPacket): {
  isReady: boolean
  blockers: string[]
} {
  const blockers: string[] = []

  if (!packet.crew || packet.crew.length === 0) blockers.push("MISSING_CREW")
  if (!packet.materials || packet.materials.length === 0) blockers.push("MISSING_MATERIALS")
  if (!packet.tools || packet.tools.some(t => t.required && !t.available)) blockers.push("MISSING_TOOLS")
  if (!packet.astDocumentId) blockers.push("MISSING_AST")
  if (!packet.ptwDocumentId) blockers.push("MISSING_PTW")

  // Verificar certificados vigentes
  const expiredCerts = packet.tools.filter(t => t.certificateStatus === "expired")
  if (expiredCerts.length > 0) blockers.push("EXPIRED_CERTIFICATE")

  return {
    isReady: blockers.length === 0,
    blockers,
  }
}
```

#### Validaciones:
- No se puede aprobar si hay blockers criticos
- Los certificados de herramientas deben estar vigentes
- El crew debe tener al menos un tecnico
- AST y PTW son obligatorios para trabajo en campo petrolero

---

### PASO 6: Ejecucion (ExecutionSession)

**Entidad:** `ExecutionSession`
**Estados:** `not_started → in_progress → paused → finished`

#### Acciones:

| Accion | Quien | Como |
|---|---|---|
| Iniciar ejecucion | Tecnico, supervisor | Cambiar a `in_progress`, registrar GPS |
| Registrar actividad | Tecnico | Descripcion de lo que se esta haciendo |
| Completar checklist | Tecnico | Lista de verificacion digital |
| Registrar materiales usados | Tecnico | Lo que realmente se consumio |
| Registrar incidentes | Tecnico | Si ocurre algun evento |
| Tomar evidencias | Tecnico | Fotos, videos, firmas, GPS |
| Pausar ejecucion | Tecnico, supervisor | Cambiar a `paused` |
| Reanudar ejecucion | Tecnico, supervisor | Volver a `in_progress` |
| Finalizar ejecucion | Tecnico, supervisor | Cambiar a `finished`, registrar GPS fin |

#### Datos capturados:
- Inicio/fin con timestamps
- GPS de inicio y fin
- Actividades realizadas con tiempos
- Checklists completados
- Materiales realmente usados
- Incidentes y novedades
- Evidencias fotograficas

#### Validaciones:
- No iniciar sin planeacion aprobada
- No finalizar sin evidencias minimas (configurable)
- Las firmas capturadas son inmutables

---

### PASO 7: Evidencias (Evidence)

**Entidad:** `Evidence`
**Tipos:** `before`, `during`, `after`, `issue`, `support`, `signature`, `gps`

#### Acciones:

| Accion | Quien | Como |
|---|---|---|
| Tomar foto | Tecnico | Camara del dispositivo, funciona offline |
| Agregar caption | Tecnico | Descripcion de la evidencia |
| Registrar GPS | Sistema automatico | Coordenadas del dispositivo |
| Capturar firma | Tecnico, cliente, supervisor | Canvas de firma digital |
| Ver evidencias | Supervisor, gerente, cliente | Galeria en la orden |

#### Reglas:
- Las evidencias son **append-only** (no se borran, solo se agregan)
- Fotos: antes/durante/despues del trabajo
- Firmas: inmutables una vez confirmadas
- GPS: automatico si el dispositivo lo permite
- Todo funciona en **modo offline**

---

### PASO 8: Informe Tecnico (TechnicalReport)

**Entidad:** `TechnicalReport`
**Estados:** `draft → generated → submitted → approved → rejected`

#### Acciones:

| Accion | Quien | Como |
|---|---|---|
| Generar informe | Supervisor, sistema | A partir de datos de ejecucion |
| Revisar informe | Supervisor | Verificar contenido y evidencias |
| Aprobar informe | Supervisor, gerente | Cambiar a `approved` |
| Rechazar informe | Supervisor, gerente | Cambiar a `rejected` con correcciones |

#### Contenido generado automaticamente:

El informe se genera a partir de los datos capturados en la ejecucion:

```typescript
interface TechnicalReportContent {
  scopeExecuted: string      // Alcance que se ejecuto
  activities: Activity[]     // Actividades realizadas con tiempos
  materialsUsed: Material[]  // Materiales consumidos
  evidences: Evidence[]      // Evidencias seleccionadas
  observations: string       // Observaciones del tecnico
  findings: Finding[]        // Hallazgos (C/NC)
  recommendations: string    // Recomendaciones
}
```

#### Validaciones:
- No generar sin ejecucion finalizada
- Debe incluir evidencias minimas
- Una vez aprobado, es inmutable

---

### PASO 9: Acta de Entrega (DeliveryRecord)

**Entidad:** `DeliveryRecord`
**Estados:** `draft → sent → signed → rejected`

#### Acciones:

| Accion | Quien | Como |
|---|---|---|
| Generar acta | Supervisor | A partir del informe aprobado |
| Enviar al cliente | Administrativo, supervisor | Cambiar a `sent` |
| Firmar como cliente | Cliente | Firma digital o upload de firmado |
| Firmar como Cermont | Supervisor | Firma digital |
| Rechazar acta | Cliente | Cambiar a `rejected` con motivo |

#### Contenido:
- Resumen del trabajo ejecutado
- Documentos entregados (informe, evidencias)
- Observaciones
- Firma del cliente (receptor)
- Firma de Cermont (ejecutor)
- Fecha y lugar

#### Validaciones:
- No crear sin informe tecnico aprobado
- La firma del cliente es obligatoria para avanzar
- Las firmas son inmutables

---

### PASO 10: Firma/Recibo del Cliente (ClientSignature)

**Entidad:** Incrustado en `DeliveryRecord`
**Este paso es critico porque desbloquea el SES.**

#### Acciones:

| Accion | Quien | Como |
|---|---|---|
| Firmar digitalmente | Cliente | Canvas de firma en el acta |
| Subir acta firmada | Cliente, administrativo | Archivo PDF firmado |
| Confirmar recepcion | Cliente | Aceptar el trabajo |
| Rechazar | Cliente | Indicar motivo del rechazo |

#### Validaciones:
- Si el cliente rechaza, el acta vuelve a `rejected` y se debe corregir
- La firma debe incluir: `signedAt`, `signedBy`, `role`, `ipAddress`
- En offline: se captura y sincroniza despues

---

### PASO 11: SES / Ariba (ServiceEntrySheet)

**Entidad:** `ServiceEntrySheet`
**Estados:** `draft → submitted → approved → rejected`

#### Acciones:

| Accion | Quien | Como |
|---|---|---|
| Crear SES | Administrativo, gerente | Numero SES, plataforma |
| Radicar en Ariba | Administrativo | Enviar a plataforma del cliente |
| Adjuntar soportes | Administrativo | Informe, acta firmada, evidencias |
| Verificar estado | Administrativo | Esperar aprobacion del cliente |
| Aprobar SES | Cliente (via Ariba) | Cambiar a `approved` |
| Rechazar SES | Cliente | Cambiar a `rejected` con motivo |

#### Validaciones:
- No crear sin acta firmada e informe aprobado
- Los soportes deben incluir: informe tecnico, acta firmada, evidencias
- La aprobacion del SES desbloquea la facturacion

---

### PASO 12: Factura (Invoice)

**Entidad:** `Invoice`
**Estados:** `draft → submitted → approved → rejected → paid`

#### Acciones:

| Accion | Quien | Como |
|---|---|---|
| Crear factura | Administrativo | Contra SES aprobada |
| Definir montos | Administrativo | Subtotal, impuestos, total |
| Enviar factura | Administrativo | Cambiar a `submitted` |
| Aprobar factura | Cliente | Cambiar a `approved` |
| Rechazar factura | Cliente | Cambiar a `rejected` con motivo |
| Marcar como pagada | Sistema automatico | Cuando se registra pago |

#### Datos:
- Numero de factura (consecutivo)
- Cliente y billing account
- Montos: subtotal, impuestos (configurables), total
- Fecha de emision y vencimiento
- Soporte: factura PDF, anexos

#### Validaciones:
- **NO facturar sin SES aprobada** (regla de negocio critica)
- Los impuestos deben ser configurables (no hardcodear IVA)
- El monto debe coincidir con la propuesta (variacion debe justificarse)

---

### PASO 13: Aprobacion de Factura (InvoiceApproval)

**Entidad:** Incrustado en `Invoice`
**El cliente aprueba o rechaza la factura.**

#### Acciones:

| Accion | Quien | Como |
|---|---|---|
| Aprobar | Cliente | Via plataforma o comunicacion formal |
| Rechazar | Cliente | Con motivo de rechazo |
| Corregir | Administrativo | Si fue rechazada, corregir y reenviar |

#### Validaciones:
- Solo facturas `submitted` pueden ser aprobadas/rechazadas
- Un rechazo requiere motivo documentado

---

### PASO 14: Pago (Payment)

**Entidad:** `Payment`
**Estados:** `registered → reconciled → disputed → cancelled`

#### Acciones:

| Accion | Quien | Como |
|---|---|---|
| Registrar pago | Administrativo | Referencia bancaria, fecha, monto |
| Adjuntar soporte | Administrativo | Comprobante de pago |
| Conciliar | Administrativo | Verificar que coincida con factura |
| Disputar | Administrativo | Si hay discrepancia |

#### Datos:
- Invoice asociada
- Monto pagado
- Referencia de pago (numero de transferencia)
- Fecha de pago
- Metodo: transferencia, cheque, efectivo
- Archivo soporte (comprobante)

#### Validaciones:
- **NO registrar pago sin factura aprobada**
- La referencia es obligatoria
- El monto debe coincidir con la factura (o ser explicado)
- Conciliacion verifica: invoice + payment = match

---

## 4. Comandos de Dominio

Las transiciones criticas se ejecutan mediante **comandos de dominio**, no cambios de estado arbitrarios:

| Comando | Entidad | Precondiciones | Resultado |
|---|---|---|---|
| `SubmitWorkRequest` | WorkRequest | Tiene cliente, sitio, descripcion | Status: `submitted` |
| `QualifyWorkRequest` | WorkRequest | Status: `submitted` | Status: `qualified` |
| `ConvertWorkRequestToProposal` | Proposal | WorkRequest calificada | Crea Proposal vinculada |
| `SubmitProposal` | Proposal | Tiene baseline, alcance | Status: `submitted` |
| `ApproveProposal` | Proposal | Status: `submitted` | Status: `approved` |
| `RegisterPurchaseOrder` | PurchaseOrder | Proposal aprobada | PO registrada |
| `CreateWorkOrderFromProposal` | WorkOrder | Proposal + PO valida | Orden creada |
| `CreatePlanningPacket` | PlanningPacket | Orden activa | Planeacion creada |
| `ApprovePlanning` | PlanningPacket | Sin blockers criticos | Status: `approved` |
| `StartExecution` | ExecutionSession | Planeacion aprobada | Ejecucion iniciada |
| `AddEvidence` | Evidence | Ejecucion activa | Evidencia anexada |
| `FinishExecution` | ExecutionSession | Evidencias minimas | Ejecucion terminada |
| `GenerateTechnicalReport` | TechnicalReport | Ejecucion terminada | Informe generado |
| `ApproveTechnicalReport` | TechnicalReport | Informe revisado | Status: `approved` |
| `CreateDeliveryRecord` | DeliveryRecord | Informe aprobado | Acta generada |
| `SignDeliveryRecord` | DeliveryRecord | Acta enviada al cliente | Acta firmada |
| `SubmitServiceEntrySheet` | ServiceEntrySheet | Informe + acta firmada | SES radicada |
| `ApproveServiceEntrySheet` | ServiceEntrySheet | SES aceptada | Status: `approved` |
| `SubmitInvoice` | Invoice | SES aprobada | Factura emitida |
| `ApproveInvoice` | Invoice | Factura validada | Status: `approved` |
| `RegisterPayment` | Payment | Factura aprobada | Pago registrado |
| `ReconcilePayment` | Payment | Pago coincide con factura | Status: `reconciled` |

---

## 5. Dashboard y KPIs

### 5.1 Indicadores Operativos

| KPI | Descripcion | Fuente |
|---|---|---|
| Solicitudes pendientes | WorkRequest con status `submitted` | WorkRequest.count |
| Ordenes en planeacion | WorkOrder con status `planning` | WorkOrder.count |
| Ordenes bloqueadas | WorkOrder con blockers activos | ServiceCase.blockers |
| Ejecuciones activas | ExecutionSession con status `in_progress` | ExecutionSession.count |
| Informes pendientes | TechnicalReport con status `draft` o `submitted` | TechnicalReport.count |
| Actas pendientes de firma | DeliveryRecord con status `sent` | DeliveryRecord.count |

### 5.2 Indicadores Administrativos

| KPI | Descripcion | Fuente |
|---|---|---|
| SES pendientes | ServiceEntrySheet con status `submitted` | SES.count |
| Facturas pendientes | Invoice con status `submitted` | Invoice.count |
| Pagos pendientes | Invoice con status `approved` sin Payment | Invoice + Payment |
| Aging de cartera | Dias desde factura aprobada hasta pago | Invoice + Payment |

### 5.3 Indicadores Documentales

| KPI | Descripcion | Fuente |
|---|---|---|
| Documentos importados | Total de DocumentImport | DocumentImport.count |
| Plantillas publicadas | DocumentTemplate con version publicada | DocumentTemplate.count |
| Formularios pendientes | TemplateResponse sin completar | TemplateResponse.count |

### 5.4 Indicadores Offline

| KPI | Descripcion | Fuente |
|---|---|---|
| Comandos pendientes | Outbox items sin sincronizar | IndexedDB.outbox |
| Evidencias no sincronizadas | Evidence con syncState `pending` | IndexedDB.evidences |
| Fallos de sincronizacion | Comandos con retry > 3 | IndexedDB.outbox |

### 5.5 Indicadores de Costos

| KPI | Descripcion | Fuente |
|---|---|---|
| Costos reales acumulados | Suma de costos reales por orden | CostCart |
| Variacion vs propuesta | `(actual - estimated) / estimated * 100` | Proposal vs CostCart |
| Ordenes sobrepresupuesto | Ordenes con variacion > umbral | Calculado |
| Costos sin soporte | CostCartItem sin archivo soporte | CostCartItem |

### 5.6 Estructura del Dashboard

```
+-------------------------------------------------------------+
|  DASHBOARD CERMONT                               [SyncStatus]|
+-------------------------------------------------------------+
|                                                             |
|  [Solicitudes: 12]  [En ejecucion: 5]  [Pendientes SES: 3]  |
|  [Facturas: 8]      [Pagos: 4]         [Offline: 2]        |
|                                                             |
+-------------------------------------------------------------+
|  BLOCKERS CRITICOS                                          |
|  - Orden WO-0045: Falta AST                                 |
|  - Orden WO-0042: Certificado de escalera vencido           |
|  - Orden WO-0038: Acta sin firma de cliente                 |
+-------------------------------------------------------------+
|  PROXIMAS ACCIONES           |  AGING DE CARTERA            |
|  - Aprobar planeacion WO-0045|  > 30 dias: $45M (3 fact)   |
|  - Firmar acta WO-0038       |  > 60 dias: $12M (1 fact)    |
|  - Radicar SES WO-0035       |  > 90 dias: $0               |
+-------------------------------------------------------------+
|  ORDENES RECIENTES           |  VARIACION DE COSTOS         |
|  [Tabla con ultimas 10]      |  [Grafico de variacion]      |
+-------------------------------------------------------------+
```

---

## 6. Maquinas de Estado (FSM)

### 6.1 WorkRequest FSM

```
                    +-----------+
                    |   draft   |
                    +----+------+
                         | submit()
                         v
+--------+     +---------+-----------+     +-----------------+
|cancelled|<----+      submitted      +---->+   visit_scheduled  |
+--------+     +----------+----------+     +--------+--------+
   ^                      | qualify()                    |
   |                      v                              | visit()
   |            +---------+---------+                    v
   |            |     qualified     +<----------+ visit_completed |
   |            +---------+---------+           +--------+--------+
   |                      | convert()                    |
   |                      v                              | convert()
   |            +---------+---------+                    |
   +----------->| converted_to_proposal |<-----------------+
                +-------------------+
```

### 6.2 Proposal FSM

```
              +--------+
              | draft  |
              +---+----+
                  | submit()
                  v
            +-----+------+     +---------+
    +------>+  submitted  +---->+ rejected |
    |       +-----+------+     +---------+
    |             | approve()
    |             v
    |       +-----+------+     +---------+
    +------>+  approved  +---->+ expired  |
    |       +-----+------+     +---------+
    |             | convert()
    |             v
    |       +-----+---------+
    +------>+ converted_to_order |
            +----------------+
```

### 6.3 WorkOrder FSM

```
              +---------+
              | created |
              +----+----+
                   | createPlanning()
                   v
            +------+-------+     +----------+
            |   planning    +---->+ cancelled |
            +------+-------+     +----------+
                   | approvePlanning()
                   v
      +----------->+-----------+
      |            |planning_  |
      |            |approved  |
      |            +----+------+
      |                 | startExecution()
      |                 v
      |           +-----+-----+     +----------+
      |           |in_progress+---->+  paused   |
      |           +-----+-----+     +----------+
      |                 | finishExecution()
      |                 v
      |           +-----+------+
      +---------->+ completed  |
                  +------------+
```

### 6.4 ExecutionSession FSM

```
              +------------+
              | not_started |
              +-----+------+
                    | start()
                    v
            +-------+-------+     +--------+
            |  in_progress   +---->+ paused |
            +-------+-------+     +---+----+
                    | resume()        |
                    | finish()        |
                    v                 |
            +-------+------+          |
            |   finished   |<---------+
            +--------------+
```

### 6.5 Pipeline Administrativo FSM

```
DeliveryRecord.signed
       |
       v
ServiceEntrySheet.submitted
       |
       v
ServiceEntrySheet.approved
       |
       v
Invoice.submitted
       |
       v
Invoice.approved
       |
       v
Payment.registered
       |
       v
Payment.reconciled  -->  ORDEN CERRADA
```

**Reglas criticas del pipeline:**
- No SES sin acta firmada e informe aprobado
- No factura sin SES aprobada
- No pago sin factura aprobada
- Cada transicion se audita

---

## 7. Criterios de Aceptacion Funcional

Una implementacion del flujo se considera correcta cuando:

1. La propuesta se convierte en orden **solo si** esta aprobada y tiene PO valida
2. La orden **no puede ejecutarse** sin planeacion aprobada
3. La ejecucion **no puede finalizar** sin evidencias minimas
4. El informe se genera desde datos de ejecucion, no campos sueltos
5. El acta se genera **solo con informe aprobado**
6. La SES se radica **solo con informe aprobado y acta firmada**
7. La factura se crea **solo con SES aprobada**
8. El pago se registra contra factura valida
9. El dashboard muestra bloqueadores reales
10. Los costos reales se comparan contra propuesta
11. Las paginas visibles no son 404
12. Los endpoints llamados por frontend existen
13. Todo pasa `typecheck`, `lint`, `test`, `build`, `verify`

---

## 8. Fases de Implementacion del Flujo

### Fase 1: Propuesta y PO (Semanas 4-5)
- Contratos Zod para WorkRequest, Proposal, PurchaseOrder
- Endpoints: CRUD + transiciones de estado
- Paginas: solicitudes, propuestas, detalle, aprobacion
- Tests: unitarios + integracion de flujo

### Fase 2: Planeacion como Compuerta (Semanas 6-7)
- PlanningPacket con readiness
- Verificacion de blockers
- AST/PTW adjuntos
- Herramientas, materiales, equipos, certificados
- Paginas: planeacion de orden

### Fase 3: Ejecucion y Evidencias (Semanas 8-9)
- ExecutionSession
- Outbox offline
- Evidencias con fotos, firmas, GPS
- Materiales usados

### Fase 4: Informe y Acta (Semanas 10-11)
- Generacion de TechnicalReport desde ejecucion
- Aprobacion de informes
- Creacion y firma de DeliveryRecord

### Fase 5: SES y Factura (Semanas 12-13)
- Service Entry Sheet
- Invoice contra SES aprobada
- Pipeline validado

### Fase 6: Pago y Conciliacion (Semanas 14-15)
- Payment
- Conciliacion
- Cierre financiero

### Fase 7: Dashboard y Blockers (Semanas 14-15, paralelo)
- ServiceCase projection
- KPIs
- Next actions
- Blockers en tiempo real

### Fase 8: E2E Completo (Semana 16)
- Flujo completo: solicitud → pago
- Tests E2E automatizados
- Validacion de reglas de negocio
---

# ANEXO v2.1 — Cierre de puntos ciegos para agentes IA/Codex

> **Prevalencia normativa:** si alguna sección anterior de este documento contradice este anexo, prevalece el **ANEXO v2.1**.  
> **Propósito:** convertir la documentación canónica en un plano arquitectónico ejecutable, verificable y sin ambigüedades para agentes IA/Codex.  
> **Regla base:** ningún agente puede declarar una función como implementada si no aporta **archivo + endpoint/contrato/componente + prueba + evidencia**.


## 1. Matriz ejecutable del flujo de 14 pasos

| Paso | Entidad | Ruta frontend | Endpoint principal | Documento | Evidencia | Formulario | Bloqueador típico | Acción siguiente |
|---:|---|---|---|---|---|---|---|---|
| 1 | WorkRequest | `/work-requests` | `POST /api/work-requests` | solicitud/correo | opcional | solicitud | solicitud incompleta | calificar |
| 2 | SiteVisit | `/site-visits` | `POST /api/site-visits` | visita | fotos/mediciones | visita técnica | visita requerida pendiente | propuesta |
| 3 | Proposal | `/proposals` | `POST /api/proposals` | propuesta | soporte alcance | costos/alcance | costos incompletos | aprobación/PO |
| 4 | PurchaseOrder | `/purchase-orders` | `POST /api/purchase-orders` | PO | soporte cliente | validación PO | PO faltante | planeación |
| 5 | PlanningPacket | `/planning` | `POST /api/planning/:id/approve` | AST, PTW, procedimientos | checklist readiness | planeación obra | MISSING_AST/PTW | ejecución |
| 6 | ExecutionSession | `/execution` | `POST /api/execution/:id/start` | permiso/checklist | campo | ejecución | planificación no aprobada | evidencias |
| 7 | Evidence | `/evidences` | `POST /api/evidences/batch` | soportes | before/during/after | evidencia | MISSING_EVIDENCE | informe |
| 8 | TechnicalReport | `/reports` | `POST /api/reports/from-execution` | informe PDF | fotos anexas | informe | ejecución no cerrada | acta |
| 9 | DeliveryRecord | `/delivery-records` | `POST /api/delivery-records` | acta | soporte entrega | acta | informe no aprobado | firma cliente |
| 10 | ClientSignature | `/delivery-records` | `POST /api/delivery-records/:id/sign` | acta firmada | firma | firma | acta sin firma | SES |
| 11 | ServiceEntrySheet | `/billing/ses` | `POST /api/billing/ses` | SES/Ariba | soporte radicación | SES | acta no firmada | factura |
| 12 | Invoice | `/billing/invoices` | `POST /api/billing/invoices` | factura | soporte factura | factura | SES no aprobada | aprobación factura |
| 13 | InvoiceApproval | `/billing/invoices` | `POST /api/billing/invoices/:id/approve` | aprobación cliente | soporte Ariba | aprobación | factura emitida sin aprobar | pago |
| 14 | Payment | `/payments` | `POST /api/payments` | comprobante | soporte pago | pago | factura no aprobada | cierre definitivo |

## 2. Regla de no páginas huérfanas

Todo artefacto debe pertenecer a un `ServiceCase`.

Incorrecto:

```text
Crear factura desde /billing/invoices/new sin SES aprobada.
```

Correcto:

```text
/service-cases/:id → paso 11 SES aprobada → acción Crear factura.
```

## 3. Cockpit como eje

`/service-cases/[id]` debe mostrar:

- timeline 14 pasos;
- estado actual;
- bloqueadores;
- documentos faltantes;
- evidencias faltantes;
- formularios pendientes;
- costos;
- next actions;
- historial;
- acciones permitidas según rol.

## 4. Sidebar secuencial

El sidebar debe reflejar el flujo:

```text
Principal
- Dashboard
- Casos de servicio
- Cockpit operativo

Operación
1. Solicitudes
2. Visitas técnicas
3. Propuestas
4. PO / Aprobaciones
5. Planeación
6. Ejecución
7. Evidencias
8. Informes
9. Actas
10. Firma cliente

Cierre administrativo
11. SES / Ariba
12. Facturas
13. Aprobación factura
14. Pagos / Cierre
- Costos

Configuración
- Documentos
- Plantillas
- Kits / herramientas
- Usuarios / roles
```

## 5. Bloqueadores obligatorios

El sistema debe bloquear, no solo advertir:

| Regla | Bloqueo |
|---|---|
| No ejecución sin planeación aprobada | `PLANNING_NOT_READY` |
| No ejecución sin AST si aplica | `MISSING_AST` |
| No ejecución sin PTW si aplica | `MISSING_PTW` |
| No cierre técnico sin evidencia | `MISSING_EVIDENCE` |
| No informe sin ejecución cerrada | `EXECUTION_NOT_COMPLETED` |
| No acta sin informe aprobado | `TECHNICAL_REPORT_NOT_APPROVED` |
| No SES sin acta firmada | `DELIVERY_RECORD_NOT_SIGNED` |
| No factura sin SES aprobada | `SES_NOT_APPROVED` |
| No pago sin factura aprobada | `INVOICE_NOT_APPROVED` |
| No cierre si hay saldo pendiente | `PAYMENT_NOT_RECONCILED` |
