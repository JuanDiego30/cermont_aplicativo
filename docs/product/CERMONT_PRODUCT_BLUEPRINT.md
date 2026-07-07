# CERMONT PRODUCT BLUEPRINT

**Date:** 2026-05-13  
**Version:** 1.0 — Canonical  
**Status:** CURRENT_SOURCE_OF_TRUTH  
**Replaces:** Root `README.md` product section, Root `PRODUCT.md`, DOC-01 product overview

---

## 1. Visión del Producto

Cermont es una **plataforma documental y operativa para contratistas multiservicio** que convierte documentos existentes (PDF, Excel, Word, fotos) en plantillas dinámicas versionadas, formularios capturables offline, y entregables automatizados (informes, actas, SES, facturas) — todo sobre un pipeline unificado de 14 pasos que cubre desde la solicitud hasta el pago.

**No es un CMMS. No es un ERP. No es solo para petróleo.** Es una plataforma que absorbe los formatos que la empresa ya usa y los convierte en materia prima del sistema.

---

## 2. Problema Real

Cermont S.A.S. ya opera con documentos. El problema no es "falta de software" — es **fragmentación documental**:

- Formatos físicos en papel y carpetas por técnico
- Hojas de cálculo dispersas sin trazabilidad
- Fotografías en dispositivos personales, transferidas por WhatsApp
- Informes redactados manualmente (3+ horas por orden)
- Facturación bloqueada hasta completar expediente físico (7+ días)
- Sin dashboard de estado, costos o desempeño
- Sin capacidad de comparar costo real vs. propuesta
- Operación en campo sin conectividad

**El software no debe obligar a abandonar esos documentos. Debe convertirlos en materia prima.**

---

## 3. Flujo de 14 Pasos

| Paso | Acción de Negocio | Entidad Principal | Offline |
|------|-------------------|-------------------|---------|
| 1 | Solicitud formal del cliente | WorkRequest | Sí |
| 2 | Visita técnica (si aplica) | SiteVisit | Sí |
| 3 | Propuesta económica | Proposal | Sí |
| 4 | Aprobación con PO | PurchaseOrder | No |
| 5 | Planeación de obra/servicio | PlanningPacket | Sí |
| 6 | Ejecución en campo | ExecutionSession | Sí |
| 7 | Evidencias (fotos, videos, docs) | Evidence | Sí |
| 8 | Informe técnico | TechnicalReport | No |
| 9 | Acta de entrega | DeliveryRecord | No |
| 10 | Firma/recibo del cliente | ClientSignature | No |
| 11 | SES / Ariba | ServiceEntrySheet | No |
| 12 | Factura | Invoice | No |
| 13 | Aprobación de factura | InvoiceApproval | No |
| 14 | Pago | Payment | No |

---

## 4. Usuarios y Roles

| Rol | Descripción | Permisos clave |
|-----|-------------|----------------|
| **gerente** | Acceso total, aprobaciones, reportes ejecutivos | CRUD todo, aprobar propuestas/órdenes, ver dashboard |
| **residente** | Gestión de órdenes, asignación de recursos | CRUD órdenes, planear, supervisar |
| **HES** | Coordinación de seguridad, inspecciones SGSST | CRUD inspecciones, verificar certificaciones |
| **supervisor** | Supervisión de equipos, validación de ejecución | Iniciar/pausar/completar ejecución, verificar evidencias |
| **operador** | Ejecución de tareas en campo | Registrar progreso, subir evidencias, operar offline |
| **tecnico** | Ejecución especializada, reportes técnicos | Registrar progreso, crear borradores de informes |
| **administrativo** | Facturación, cierre administrativo | Crear SES, facturas, registrar pagos |
| **cliente** | Visualización, aprobaciones | Leer sus órdenes, aprobar propuestas/facturas, firmar actas |

---

## 5. Módulos Principales

### 5.1 Pipeline Operativo (14 pasos)
WorkRequest → SiteVisit → Proposal → PurchaseOrder → WorkOrder → PlanningPacket → ExecutionSession → Evidence → TechnicalReport → DeliveryRecord → ClientSignature → ServiceEntrySheet → Invoice → InvoiceApproval → Payment

### 5.2 Plataforma Documental
- **DocumentImport:** Carga de PDF, Excel, Word, fotos
- **DocumentTemplate:** Plantillas versionadas con campos, tablas, checklists, firmas
- **DynamicForm:** Formularios dinámicos generados desde plantillas
- **TemplateResponse:** Respuestas capturadas (online/offline)
- **GeneratedDocument:** PDFs, informes, actas generados automáticamente

### 5.3 Motor de Costos
- **CostEstimate:** Presupuesto desde propuesta
- **ActualCost:** Costos reales durante ejecución
- **CostCart:** Carrito de costos (materiales, mano de obra, herramientas, equipos, transporte)
- **CostComparison:** Comparación real vs. propuesta con alertas de desviación

### 5.4 Activos y Mantenimiento
- **Asset:** Equipos, vehículos, herramientas, cámaras
- **Certificate:** Certificaciones de equipos y personal (con vencimientos)
- **MaintenancePlan:** Mantenimiento preventivo, correctivo, predictivo futuro

### 5.5 Dashboard y Analítica
- KPIs de operación, costos, tiempos de ciclo
- Estado de ServiceCases en tiempo real
- Alertas de vencimientos y bloqueos

---

## 6. Diferenciador frente a FSM/CMMS/ERP

| Característica | Cermont | FSM (ServiceMax) | CMMS (Fracttal) | ERP (SAP) |
|---------------|---------|-------------------|-----------------|-----------|
| Documentos existentes → plantillas | ✅ Core | ❌ | ❌ | ❌ |
| Offline-first real (IndexedDB + sync queue) | ✅ | Parcial | Parcial | ❌ |
| Costo real vs. propuesta integrado | ✅ | ❌ | ❌ | Parcial |
| Multi-sector (no solo petróleo) | ✅ | ✅ | ✅ | ✅ |
| SES/Ariba + facturación integrada | ✅ | ❌ | ❌ | ✅ |
| Formularios dinámicos versionados | ✅ | ❌ | ❌ | ❌ |
| VPS self-hosted (no vendor lock-in) | ✅ | ❌ | ❌ | ❌ |
| PWA instalable en campo | ✅ | ✅ | ✅ | ❌ |

---

## 7. Casos de Uso Principales

### UC-1: Cycle Execution
Un cliente solicita un trabajo → visita técnica → propuesta → PO → planeación → ejecución con evidencias → informe → acta → SES → factura → pago.

### UC-2: Document Ingestion
Un administrativo sube un PDF/Excel de planeación → el sistema detecta campos → un supervisor revisa y corrige → se crea una plantilla versionada → disponible para todas las órdenes de ese tipo.

### UC-3: Field Capture Offline
Un técnico en campo sin internet abre el formulario dinámico → captura datos, fotos, firmas, GPS → al recuperar conexión, sincroniza automáticamente.

### UC-4: Cost Control
El gerente compara costo real acumulado vs. propuesta aprobada → detecta desviación en materiales → ajusta antes del cierre.

### UC-5: Administrative Closure
Cierre documental: acta firmada → SES radicada → factura emitida → pago registrado → caso cerrado con audit trail completo.

---

## 8. Criterios de Éxito

- Reducción del tiempo de cierre administrativo
- Eliminación de re-digitación de formatos
- Trazabilidad completa desde solicitud hasta pago
- Operación offline funcional en campo
- Comparación costo real vs. propuesta en tiempo real
- Generación automática de informes y actas
- Cero pérdida de evidencias fotográficas
- Dashboard con estado real de todas las operaciones

---

## 9. Límites del Sistema

- **NO** reemplaza la contabilidad oficial de la empresa
- **NO** es un sistema de nómina
- **NO** hace conciliación bancaria automática
- **NO** reemplaza Ariba — se integra con SES/Ariba como paso del flujo
- **NO** hace mantenimiento predictivo con IA en fase inicial
- **NO** hace OCR mágico sin revisión humana

---

## 10. Qué NO debe implementarse

- ❌ Módulos específicos para un solo sector (ej. solo petróleo)
- ❌ Formularios hardcodeados para cada tipo de servicio
- ❌ Segundo design system
- ❌ Integración con pasarelas de pago (no requerido)
- ❌ Chat/sistema de mensajería interno
- ❌ Módulo de RRHH/nómina
- ❌ CRM de ventas
- ❌ App móvil nativa (la PWA cubre el caso)
- ❌ IA/ML hasta tener histórico suficiente
