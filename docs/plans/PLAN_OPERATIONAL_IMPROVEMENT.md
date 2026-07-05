# PLAN DE MEJORA OPERATIVA — CERMONT S.A.S.

**Consultor:** Sisyphus — Procesos y Operaciones  
**Fecha:** 2026-07-04  
**Versión:** 1.0  
**Estado:** PLAN_EJECUTABLE

---

## Resumen Ejecutivo

Tras analizar los tres problemas operativos reportados en el documento "DESARROLLO DE UN APLICATIVO WEB PARA APOYO EN LA EJECUCIÓN Y CIERRE ADMINISTRATIVO DE LOS TRABAJOS DE CAMPO", se identifican las siguientes causas raíz y se propone un plan de implementación por fases para mitigarlas.

| # | Problema | Impacto | Causa Raíz |
|---|----------|---------|------------|
| 1 | Retrasos en actas e informes finales | 3-7 días adicionales por orden | No hay generación automatizada; redacción manual post-ejecución; datos no estructurados |
| 2 | Retrasos en facturación con múltiples trabajos | 5-15 días por factura | No hay cola de priorización; dependencia de expediente completo; sin consolidación multi-orden |
| 3 | Desconocimiento de costos reales vs propuesta | Desviaciones de 20-40% no detectadas a tiempo | Costos en silos (Excel, recibos, memorias); sin captura en tiempo real; sin dashboard comparativo |

---

## Fase 0 — Diagnóstico y Preparación (Semanas 1-2)

### 0.1 Línea Base Actual

Levantar métricas de estado actual para medir mejora:

| Indicador | Método de Medición | Línea Base Estimada |
|-----------|-------------------|---------------------|
| Días entre fin de ejecución → acta firmada | Auditoría de casos cerrados últimos 6 meses | 7-14 días |
| Días entre acta firmada → factura emitida | Auditoría de casos facturados últimos 6 meses | 10-20 días |
| % de órdenes con desviación >10% costo real vs propuesta | Muestra de 20 órdenes recientes | ~60% |
| % de órdenes sin costos reales registrados | Consulta BD / entrevistas | ~80% |
| Tiempo promedio de redacción de informe técnico | Encuesta a técnicos/supervisores | 3-5 horas |

### 0.2 Validación de Datos Existentes

Confirmar disponibilidad y calidad de datos en el sistema actual:

- **ExecutionSession:** ¿tiene startTime, endTime, estimatedMinutes completos?
- **Evidence:** ¿está categorizada por technicalCategory (lineas_de_vida, cctv, anclajes)?
- **Cost:** ¿qué % de órdenes tiene costos registrados?
- **Proposal:** ¿todas las aprobadas tienen items de costo desglosados?
- **Invoice / SES:** ¿están vinculadas a WorkOrder por ID?

### 0.3 Definición de Roles y Responsabilidades

| Rol en la mejora | Responsable | Responsabilidades |
|---|---|---|
| Champion operativo | Residente / Gerente | Priorizar casos backlog, liberar recursos, desbloquear conflictos |
| Implementador técnico | Desarrollador full-stack | Implementar endpoints, componentes UI, lógica de negocio |
| Validador de campo | Supervisor / Técnico líder | Probar flujos en campo, retroalimentar usabilidad |
| Administrador de datos | Administrativo | Cargar catálogo de costos, verificar integridad de datos históricos |

---

## Fase 1 — Automatización de Actas e Informes (Semanas 3-5)

### 1.1 Problema

> "Se presentan fallas en la elaboración de actas e informes finales a tiempo, por la dinámica de las actividades realizadas en ocasiones hay retrasos considerables en la elaboración de informes y actas finales de las actividades."

### 1.2 Causa Raíz

La redacción de informes y actas se hace **manualmente** después de la ejecución. Los datos ya existen en el sistema (evidencias, checklists, sesiones de ejecución, observaciones), pero nadie los extrae, estructura y formatea. El técnico o supervisor debe:

1. Revisar fotos una por una
2. Redactar descripciones desde cero
3. Armar el documento
4. Enviar a firma

Eso toma 3-7 horas por orden. Con 5+ órdenes simultáneas, el backlog crece exponencialmente.

### 1.3 Solución Propuesta

**Generación automática de informes y actas desde datos estructurados del sistema.**

#### 1.3.1 Backend — Servicio de Generación de Documentos

| Componente | Descripción | Prioridad |
|---|---|---|
| `TechnicalReportGenerator` | Servicio que toma ExecutionSession + Evidence + ChecklistResponse y genera borrador de informe técnico (JSON estructurado) | P0 |
| `DeliveryRecordGenerator` | Servicio que toma TechnicalReport aprobado + datos del cliente y genera borrador de acta de entrega | P0 |
| `report-template.service.ts` | Servicio de plantillas: mapea datos → secciones de informe (PDF/docx) | P0 |
| `PdfGenerationService` | Servicio que convierte JSON estructurado → PDF (usando pdf-lib existente en `backend/src/`) | P0 |

**Flujo de generación automática:**

```
ExecutionSession completada
    ↓
[Trigger automático] → TechnicalReportGenerator
    ↓
1. Recolectar datos de la sesión (fechas, técnicos, duración, ubicación)
2. Recolectar evidencias (fotos con descripciones, categorías)
3. Recolectar checklists de seguridad completados
4. Recolectar novedades de campo
5. Estructurar en JSON: { header, execution, evidences, checklists, novelties, closure }
6. Aplicar plantilla de informe → generar PDF borrador
    ↓
Notificar al supervisor: "Informe de [orden] listo para revisión"
    ↓
Supervisor revisa, ajusta (si necesario), aprueba
    ↓
Acta de entrega se genera automáticamente con datos del informe aprobado
```

#### 1.3.2 Estructura del Informe Técnico Automático

```json
{
  "header": {
    "orderCode": "ORD-2026-0042",
    "clientName": "SierraCol Energy",
    "location": "Caño Limón - Área 52",
    "executionDate": "2026-07-01",
    "supervisor": "Carlos Méndez",
    "technicians": ["Luis Torres", "Andrés Ríos"]
  },
  "executionSummary": {
    "activityType": "Instalación línea de vida horizontal",
    "duration": "4.5 horas",
    "conditions": "Clima seco, 32°C",
    "description": "Se realizó instalación de línea de vida horizontal de 45m..."
  },
  "evidences": [
    {
      "index": 1,
      "type": "photo",
      "thumbnail": "/api/evidence/abc123/thumbnail",
      "description": "Anclaje de inicio instalado en viga principal",
      "category": "installation",
      "timestamp": "2026-07-01T09:30:00"
    }
  ],
  "checklists": [
    {
      "name": "ATS - Trabajo en Altura",
      "status": "completed",
      "completedBy": "Luis Torres",
      "items": [...]
    }
  ],
  "novelties": [
    {
      "description": "Se requirió perforación adicional por refuerzo estructural no previsto",
      "resolution": "Aprobado por residente vía telefónica"
    }
  ],
  "materialsUsed": [
    { "name": "Cable acero 3/8", "quantity": "50m", "reference": "MAT-00123" }
  ],
  "closure": {
    "observations": "Trabajo completado según alcance. Pendiente certificación final.",
    "recommendations": "Programar prueba de tensión en 7 días."
  }
}
```

#### 1.3.3 Endpoints Nuevos

| Método | Endpoint | Propósito | RBAC |
|--------|----------|-----------|------|
| `POST` | `/api/reports/generate/:orderId` | Generar borrador de informe desde datos de ejecución | supervisor, residente, gerente |
| `GET` | `/api/reports/:orderId/draft` | Obtener borrador JSON para revisión | supervisor, residente, gerente |
| `PUT` | `/api/reports/:orderId/draft` | Actualizar borrador (correcciones manuales) | supervisor, residente |
| `POST` | `/api/reports/:orderId/approve` | Aprobar informe y generar acta | residente, gerente |
| `GET` | `/api/reports/:orderId/pdf` | Descargar PDF de informe aprobado | administrativo, residente, gerente |
| `GET` | `/api/delivery-records/:orderId/pdf` | Descargar PDF de acta de entrega | todos los internos |

#### 1.3.4 Disparadores Automáticos

| Evento | Acción |
|--------|--------|
| ExecutionSession.status → `completed` | Generar borrador de informe automáticamente si hay al menos 1 evidencia |
| Informe aprobado | Generar borrador de acta de entrega automáticamente |
| Acta generada | Notificar a administrativo que SES está listo para crear |

#### 1.3.5 Frontend — Panel de Informes

| Componente | Ruta | Propósito |
|---|---|---|
| `ReportsDashboard` | `/reports` | Lista de informes pendientes/borradores/aprobados |
| `ReportDraftReview` | `/reports/[orderId]/edit` | Revisión y edición del borrador generado automáticamente |
| `ReportPreview` | `/reports/[orderId]/preview` | Vista previa del PDF antes de aprobar |
| `DeliveryRecordsList` | `/delivery-records` | Lista de actas generadas/pendientes/firmadas |

**Requerimientos UI:**
- ✅ Loading state mientras se genera el PDF
- ✅ Error state si faltan datos críticos (evidencias, checklists)
- ✅ Empty state si la orden no tiene datos de ejecución
- ✅ Offline: el borrador se genera en servidor, la revisión requiere conexión

#### 1.3.6 Reglas de Negocio

1. **No se puede generar informe sin al menos 1 evidencia** asociada a la orden
2. **No se puede aprobar informe sin checklist de seguridad completado** (ATS, EPP, etc.)
3. **El informe generado automáticamente es un borrador** — siempre requiere revisión humana
4. **El acta de entrega se genera solo a partir de un informe aprobado**
5. **Si la orden tiene novedades de campo, el informe debe reflejarlas explícitamente**
6. **Los tiempos de generación se auditan** para medir mejora: `reportGenerationMinutes`

---

## Fase 2 — Facturación Oportuna Multi-orden (Semanas 6-8)

### 2.1 Problema

> "Se presentan fallas en la facturación oportuna de las actividades realizadas, en ocasiones hay retrasos considerables en la facturación de las actividades cuando hay múltiples trabajos."

### 2.2 Causa Raíz

Cuando hay 10+ órdenes en ejecución simultánea, el administrativo no tiene:

- Una vista consolidada de qué órdenes están listas para facturar
- Un sistema de priorización (qué facturar hoy, qué puede esperar)
- Automatización de la creación de SES desde datos de acta + informe
- Visibilidad del estado del pipeline: qué falta para cada orden antes de facturar

### 2.3 Solución Propuesta

**Tablero de facturación con cola de priorización inteligente y consolidación multi-orden.**

#### 2.3.1 Backend — Cola de Facturación

| Componente | Descripción | Prioridad |
|---|---|---|
| `BillingQueueService` | Evalúa cada orden y calcula una prioridad de facturación basada en reglas de negocio | P0 |
| `SesAutoGenerationService` | Genera borrador de SES desde datos de acta firmada + costos reales | P0 |
| `InvoiceDraftService` | Genera borrador de factura desde SES aprobado | P0 |
| `BillingConsolidationService` | Permite agrupar múltiples órdenes en una sola factura (cliente, período) | P1 |

**Algoritmo de priorización de facturación:**

```
Para cada orden con acta firmada:
  prioridad = 0
  +30 si el cliente es prioritario (SierraCol, Ecopetrol)
  +25 si la orden tiene >30 días desde acta firmada sin facturar
  +20 si el monto de la orden > $10M COP
  +15 si la orden tiene SES vencido (cliente no ha aprobado en >15 días)
  +10 si es fin de mes (cierre fiscal)
  -10 si el cliente tiene facturas pendientes de pago >60 días
  -20 si la orden tiene costos reales incompletos (>30% categorías sin datos)

  prioridad_final = clamp(prioridad, 0, 100)
```

#### 2.3.2 Flujo de Facturación Semi-automatizado

```
Actas firmadas pendientes de facturar
    ↓
BillingQueueService calcula prioridad para cada orden
    ↓
Tablero muestra órdenes ordenadas por prioridad
    ↓
Administrativo selecciona órdenes a facturar (multi-select)
    ↓
SesAutoGenerationService:
  1. Toma acta firmada + costos reales de la orden
  2. Genera borrador SES con items, cantidades, valores
  3. Administrativo revisa y ajusta
    ↓
SES enviado a cliente
    ↓
[SES aprobado] → InvoiceDraftService genera borrador de factura automáticamente
    ↓
Administrativo revisa factura y envía
```

#### 2.3.3 Endpoints Nuevos

| Método | Endpoint | Propósito | RBAC |
|--------|----------|-----------|------|
| `GET` | `/api/billing/queue` | Obtener cola de facturación priorizada | administrativo, gerente |
| `POST` | `/api/billing/process-batch` | Procesar lote de órdenes seleccionadas para SES/facturación | administrativo |
| `GET` | `/api/billing/order/:orderId/readiness` | Obtener checklist de completitud para facturar una orden | administrativo |
| `POST` | `/api/ses/auto-generate/:orderId` | Generar borrador de SES automáticamente | administrativo |
| `POST` | `/api/invoices/auto-generate/:sesId` | Generar borrador de factura desde SES aprobado | administrativo |
| `GET` | `/api/billing/summary` | Resumen de facturación del período: emitido, pendiente, vencido | administrativo, gerente |

#### 2.3.4 Frontend — Tablero de Facturación

| Componente | Ruta | Propósito |
|---|---|---|
| `BillingDashboard` | `/billing` | Tablero principal con cola priorizada |
| `BillingQueue` | `/billing/queue` | Lista de órdenes listas para facturar con prioridad |
| `BillingReadinessChecklist` | `/billing/order/[id]/readiness` | Checklist de todo lo que falta para facturar |
| `BillingBatchProcessor` | `/billing/batch` | Procesamiento por lote (multi-select + generar SES/facturas) |
| `BillingSummaryCards` | `/billing` | KPIs de facturación del período |

**KPI de facturación (tablero):**

| KPI | Fórmula | Alerta |
|-----|---------|--------|
| Órdenes listas para facturar | COUNT donde acta_firmada SIN ses_creado | >5 es alerta |
| Días promedio: acta → factura | AVG(DATEDIFF(factura_emitida, acta_firmada)) | >15 días es crítico |
| Monto pendiente por facturar | SUM(valor_orden) donde sin_factura | Mostrar total COP |
| Facturas vencidas no pagadas | COUNT donde factura_enviada >30d sin pago | >3 es alerta |
| Ciclo completo: ejecución → pago | AVG(DATEDIFF(pago, ejecución_completada)) | Target <60 días |

#### 2.3.5 Reglas de Negocio

1. **No se puede generar SES sin acta firmada por el cliente**
2. **No se puede generar factura sin SES aprobado**
3. **La priorización es una sugerencia** — el administrativo tiene control total sobre qué procesar
4. **Los costos reales deben estar ≥80% completos** para generar SES (o el sistema alerta)
5. **Las órdenes de un mismo cliente pueden agruparse** en una sola factura
6. **La facturación consolidada requiere que todas las órdenes del lote tengan acta firmada**

---

## Fase 3 — Costos Reales en Tiempo Real (Semanas 9-12)

### 3.1 Problema

> "Se presentan fallas en saber costos reales de la operación en el momento en que se ejecuta una actividad, no existe hoja de cálculo que relacione de forma centralizada los costos de realizar una actividad (incluyendo impuestos) versus lo estimado en la propuesta económica inicial."

### 3.2 Causa Raíz

No existe una herramienta centralizada que capture los costos en el momento de la ejecución. Los costos se registran en:
- Facturas de proveedores (llegan 30-60 días después)
- Recibos sueltos que se pierden
- Memoria de los técnicos
- Hojas de cálculo offline que no se consolidan

Para cuando la información llega al administrativo, ya es demasiado tarde para corregir desviaciones.

### 3.3 Solución Propuesta

**Motor de costos en el punto de ejecución + catálogo de costos + comparación en tiempo real.**

**NOTA:** El sistema ya cuenta con infraestructura base implementada:
- ✅ `CostCatalogItem` — modelo y servicio CRUD
- ✅ `Cost` — modelo y servicio con estimatedAmount / actualAmount / taxAmount
- ✅ `CostSummary` — agregación por orden con variaciones y alertas de presupuesto
- ✅ `CostBudgetAlertService` — notificaciones de umbral de presupuesto
- ✅ `/api/costs/catalog` — endpoint para listar items del catálogo
- ✅ `/api/costs/order/:orderId/summary` — endpoint de resumen por orden
- ✅ `/api/costs/dashboard` — endpoint de dashboard global

**Lo que falta implementar:**

#### 3.3.1 Componentes a Implementar

| Componente | Estado Actual | Acción Requerida | Prioridad |
|---|---|---|---|
| Catálogo de costos con precios unitarios por actividad típica | ✅ CRUD básico | P0 → Poblar con datos reales | P0 |
| CostCart (carrito de costos para campo) | ❌ No implementado | Crear service + controller + routes + UI offline | P0 |
| Captura de costos desde ejecución (materiales, horas, herramientas) | ❌ No implementado | Vincular ExecutionSession → Cost | P0 |
| Asistente de costos con IA (prompt para proponer costos) | ❌ No implementado | Ver Fase 4 — Prompt diseñado en documento adjunto | P0 |
| Dashboard de comparación propuesta vs real en tiempo real | ❌ No implementado | UI con gráficos, tabla de categorías, alertas | P0 |
| Alertas de desviación por categoría (>10%, >20%, >30%) | ⚠️ BudgetAlert existe | Extender para alertas por categoría individual | P1 |
| Carga masiva de catálogo desde Excel | ❌ No implementado | Endpoint POST /api/costs/catalog/import | P1 |
| Historial de costos por tipo de actividad (línea base histórica) | ❌ No implementado | Agregación por technicalCategory + período | P1 |

#### 3.3.2 CostCart — Carrito de Costos para Campo

El CostCart permite al técnico/supervisor capturar costos **durante la ejecución** desde el celular, incluso offline.

```
┌─────────────────────────────────────┐
│  Carrito de Costos - ORD-0042      │
│  Instalación Línea de Vida         │
├─────────────────────────────────────┤
│  Materiales                  +     │
│  ├ Cable acero 3/8   50m  $450K   │
│  ├ Anclajes           4un  $320K   │
│  ├ Conectores        12un  $96K    │
│  └ Abrazaderas        8un  $40K    │
│                                      │
│  Mano de obra                +     │
│  ├ Técnico altura    4h   $160K    │
│  ├ Supervisor         1h   $40K     │
│                                      │
│  Herramientas                 +     │
│  ├ Taladro percutor   1d   $60K     │
│  └ Llave dinamométrica 1d  $40K     │
│                                      │
│  Transporte                    +     │
│  ├ Combustible                $80K  │
│  └ Peajes                     $15K  │
│                                      │
│  Total actual:           $1,301K    │
│  Presupuesto:            $1,500K    │
│  Desviación:             -$199K ✅  │
│                                      │
│  [📸 Adjuntar soporte] [💾 Guardar] │
│  [📤 Sincronizar cuando online]     │
└─────────────────────────────────────┘
```

**Endpoints:**

| Método | Endpoint | Propósito | RBAC |
|--------|----------|-----------|------|
| `GET` | `/api/cost-cart/order/:orderId` | Obtener carrito de costos activo para una orden | supervisor, operador |
| `POST` | `/api/cost-cart/order/:orderId/items` | Agregar item al carrito | supervisor, operador |
| `PUT` | `/api/cost-cart/items/:itemId` | Actualizar item del carrito | supervisor, operador |
| `DELETE` | `/api/cost-cart/items/:itemId` | Eliminar item del carrito | supervisor, operador |
| `POST` | `/api/cost-cart/order/:orderId/submit` | Enviar carrito (convierte items en ActualCost) | supervisor |
| `POST` | `/api/cost-cart/order/:orderId/sync` | Forzar sincronización offline → servidor | supervisor, operador |

**Comportamiento offline:**
- El carrito se almacena en IndexedDB del frontend
- Cuando se recupera la conexión, se sincroniza automáticamente
- Cada item tiene `clientMutationId` para evitar duplicados
- Las fotos de soporte se encolan y suben cuando hay conexión

#### 3.3.3 Frontend — Dashboard de Costos

| Componente | Ruta | Propósito |
|---|---|---|
| `CostDashboard` | `/costs` | Dashboard global de costos con KPIs, gráficos y alertas |
| `OrderCostDetail` | `/costs/order/[id]` | Comparación detallada propuesta vs real por orden |
| `CostCatalogs` | `/costs/catalog` | Gestión del catálogo de costos (CRUD) |
| `CostCartPage` | `/execution/[orderId]/costs` | Carrito de costos para captura en campo |
| `CostComparisonChart` | — | Gráfico de barras comparativo por categoría (componente) |

**KPI de costos (dashboard):**

| KPI | Fórmula | Alerta |
|-----|---------|--------|
| Desviación global del período | SUMA(actual - estimado) / SUMA(estimado) | >10% warning, >20% crítica |
| Órdenes sobre presupuesto | COUNT donde actual > estimado | Mostrar listado |
| Categoría con mayor desviación | MAX(variancePct por categoría) | Destacar en rojo |
| Costos capturados en campo | COUNT(CostCart items) del período | Indicador de adopción |
| Rentabilidad promedio | AVG(grossMarginPercent) por orden | Target >15% |
| Costos sin soporte | COUNT donde actual > 0 Y sin evidence | Alerta para completar |

#### 3.3.4 Reglas de Negocio

1. **El catálogo de costos es la fuente de verdad para precios unitarios** — toda captura debe referenciarlo cuando sea posible
2. **Cada costo real debe tener un soporte** (foto de factura, recibo, nota de entrega)
3. **El carrito de costos es transaccional** — al enviarse, los items se convierten en ActualCost y quedan inmutables
4. **La línea base es la propuesta aprobada** — los costos estimados congelados no cambian
5. **Las desviaciones se calculan en tiempo real** — cada nuevo item actualiza el comparativo
6. **Los impuestos se calculan por item** según la tasa configurable del catálogo
7. **No se puede cerrar una orden** si los costos reales están incompletos (>20% de categorías sin datos)
8. **El asistente de costos IA** (ver Fase 4) es una ayuda, no un reemplazo de la captura real

---

## Fase 4 — Asistente de Costos IA para Casos Estancados (Semanas 10-11)

### 4.1 Problema

Los service cases se estancan porque el usuario responsable no tiene asistencia para proponer costos precisos al cliente. Sin una propuesta económica sólida, el flujo no avanza del paso 1 (solicitud) al paso 2 (visita) o al paso 3 (propuesta + PO).

### 4.2 Solución

**Asistente de costos integrado en la UI de propuestas que guía al usuario en la construcción de costos precisos basados en datos históricos, catálogo de costos y reglas de negocio.**

#### 4.2.1 Implementación Técnica

| Componente | Descripción | Prioridad |
|---|---|---|
| `CostProposalAssistant` | Componente frontend que guía al usuario paso a paso en la creación de costos | P0 |
| `CostSuggestionService` | Servicio backend que calcula costos sugeridos basados en datos históricos y catálogo | P0 |
| `/api/costs/suggest` | Endpoint que recibe datos de actividad y devuelve desglose de costos sugerido | P0 |
| `CostTemplateService` | Servicio que gestiona plantillas de costos por tipo de actividad típica | P1 |

#### 4.2.2 El Prompt Especializado

El prompt diseñado para el asistente de IA se encuentra en el documento adjunto:
**`docs/prompts/ASSISTANT_COST_PROPOSAL_PROMPT.md`**

---

## Fase 5 — Integración y Consolidación (Semanas 12-14)

### 5.1 Integración Vertical

Cada fase debe integrarse verticalmente con el flujo de 14 pasos:

```
Fase 1 (Informes) → Steps 7-9:  informe técnico → acta → firma
Fase 2 (Facturación) → Steps 10-14: SES → factura → aprobación → pago
Fase 3 (Costos) → Steps 3-7: propuesta → planeación → ejecución → evidencias
Fase 4 (Asistente) → Steps 1-3: solicitud → visita → propuesta
```

### 5.2 Tablero Unificado

Crear un dashboard operativo que consolide las tres dimensiones:

```
┌─────────────────────────────────────────────────────┐
│  PANEL DE OPERACIONES — CERMONT                      │
├─────────────────────────────────────────────────────┤
│ 📋 Pipeline 14 pasos: [●●●●○○○○○○○○○○] 5/14       │
│   ● Solicitud  ● Visita  ● Propuesta  ● PO  ● Plan │
│   ○ Ejecución  ○ Informe ○ Acta ○ Firma ○ SES       │
│   ○ Factura    ○ Apr.Fac  ○ Pago                    │
│                                                      │
│ ┌─────────────┐ ┌─────────────┐ ┌─────────────┐    │
│ │ 📄 Informes │ │ 💰 Facturas │ │ 📊 Costos   │    │
│ │ 3 pendientes│ │ 5 listas    │ │ 12% desv.   │    │
│ │ 2 borradores│ │ 2 vencidas  │ │ 8 órdenes OK│    │
│ └─────────────┘ └─────────────┘ └─────────────┘    │
│                                                      │
│ ⚠️ Alertas activas: 3                                │
│  • ORD-0042: Desviación costos >20% (materiales)    │
│  • ORD-0038: Informe pendiente desde hace 10 días   │
│  • ORD-0045: Acta firmada sin SES (5 días)          │
└─────────────────────────────────────────────────────┘
```

### 5.3 Pruebas de Integración

| Escenario | Flujo | Verificación |
|-----------|-------|-------------|
| Informe completo | Ejecución → Evidence → Checklist → Generar informe → Revisar → Aprobar → PDF | PDF generado con datos correctos |
| Facturación multi-orden | 3 órdenes con acta → Seleccionar lote → Generar SES → Aprobar → Factura | Factura consolida 3 órdenes correctamente |
| Costo en campo con offline | Crear carrito sin conexión → Agregar 5 items → Sincronizar → Ver en dashboard | Items aparecen en CostSummary después de sync |
| Asistente de costos | Ingresar datos de actividad → Recibir sugerencia → Ajustar → Guardar propuesta | Propuesta se guarda con costos correctos |

---

## Fase 6 — Medición y Mejora Continua (Semana 15+)

### 6.1 KPIs de Éxito

| KPI | Línea Base | Target 30 días | Target 90 días |
|-----|-----------|----------------|----------------|
| Días: ejecución → acta firmada | 7-14 días | <7 días | <3 días |
| Días: acta → factura emitida | 10-20 días | <10 días | <5 días |
| % órdenes con costos reales registrados | ~20% | >60% | >90% |
| Desviación promedio costo real vs propuesta | ~25% | <15% | <10% |
| Tiempo de redacción informe técnico | 3-5 horas | <1 hora | <15 minutos |
| % casos estancados por falta de propuesta | ~40% | <20% | <10% |

### 6.2 Ciclo de Retroalimentación

```
Medir (dashboard) → Analizar (reunión semanal) → Priorizar (backlog) → Implementar (sprint) → Medir (siguiente semana)
```

### 6.3 Reuniones de Seguimiento

| Reunión | Frecuencia | Asistentes | Agenda |
|---------|-----------|------------|--------|
| Comité operativo | Semanal | Residente, Administrativo, Supervisor líder | Revisar KPIs, desbloquear órdenes estancadas |
| Revisión técnica | Quincenal | Desarrollador, Residente | Validar nuevas funcionalidades, ajustar prioridades |
| Cierre de fase | Al final de cada fase | Todos los stakeholders | Demostrar resultados, aprobar siguiente fase |

---

## Resumen de Carga de Trabajo

| Fase | Semanas | Días-hombre Backend | Días-hombre Frontend | Días-hombre Procesos | Total Estimado |
|------|---------|--------------------|---------------------|---------------------|----------------|
| 0 — Diagnóstico | 2 | 2 | 0 | 5 | 7 |
| 1 — Informes | 3 | 8 | 6 | 2 | 16 |
| 2 — Facturación | 3 | 6 | 8 | 2 | 16 |
| 3 — Costos | 4 | 10 | 10 | 3 | 23 |
| 4 — Asistente IA | 2 | 5 | 4 | 3 | 12 |
| 5 — Integración | 3 | 4 | 6 | 2 | 12 |
| 6 — Medición | 1+ | 1 | 1 | 3 | 5 |
| **Total** | **18** | **36** | **35** | **20** | **91** |

### Dependencias

```
Fase 0 ─────────────────────────────────────────────────
  ↓
Fase 1 ──────┐
              ├── Fase 5 ── Fase 6
Fase 2 ──────┘       ↑
              │       │
Fase 3 ──────────────┘
  ↓
Fase 4 ──────────────┘
```

- **Fase 1 y 3 pueden correr en paralelo** (no comparten recursos críticos)
- **Fase 2 depende de Fase 1** (necesita actas firmadas para facturar)
- **Fase 4 depende de Fase 3** (necesita catálogo de costos y datos históricos)
- **Fase 5 depende de Fases 1, 2, 3** (integra todo)
- **Fase 6 es continua** (medición y mejora)

---

## Riesgos y Mitigaciones

| Riesgo | Probabilidad | Impacto | Mitigación |
|--------|-------------|---------|------------|
| Resistencia al cambio de técnicos en campo | Alta | Medio | Capacitación presencial, período de convivencia con sistema actual |
| Datos históricos incompletos para línea base | Media | Alto | Usar estimaciones de entrevistas con supervisores como línea base |
| Costos de catálogo desactualizados | Alta | Medio | Carga inicial con precios de mercado, actualización semestral |
| Informes generados requieren mucha edición manual | Media | Medio | Iterar sobre plantillas con retroalimentación de supervisores |
| Offline no captura todos los costos | Media | Alto | Diseñar CostCart para funcionar con mínima entrada de datos |
| Cliente no firma acta digitalmente | Alta | Medio | Mantener flujo híbrido: PDF → imprimir → firmar → escanear → subir |

---

## Documentos Relacionados

- [COST_ENGINE_SPEC.md](../product/COST_ENGINE_SPEC.md) — Especificación técnica del motor de costos
- [ASSISTANT_COST_PROPOSAL_PROMPT.md](../prompts/ASSISTANT_COST_PROPOSAL_PROMPT.md) — Prompt para asistente de costos IA
- [CERMONT_BUSINESS_FLOW_MAP.md](../domain/CERMONT_BUSINESS_FLOW_MAP.md) — Mapa de flujo de 14 pasos
- [FRONTEND_ROUTE_MAP.md](../architecture/FRONTEND_ROUTE_MAP.md) — Mapa de rutas frontend
- [API_ENDPOINT_MATRIX.md](../architecture/API_ENDPOINT_MATRIX.md) — Matriz de endpoints API
- [AGENT_IMPLEMENTATION_PLAYBOOK.md](../agents/AGENT_IMPLEMENTATION_PLAYBOOK.md) — Reglas de implementación para agentes IA
