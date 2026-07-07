# Business Requirements Consolidated — CERMONT S.A.S.

**Fecha:** 2026-07-05
**Spec:** 017 — Auditoría Integral, Investigación y Plan de Innovación
**Propósito:** Consolidar requisitos de negocio desde documentos fuente, mapear contra módulos reales del sistema, e identificar brechas.

---

## 1. Flujo de 14 Pasos — Estado de Digitalización

El flujo documental de 14 pasos define el core business de CERMONT. Cada paso es un hito contractual/administrativo que debe dejar evidencia digital trazable.

| # | Paso | Documento/Formato Fuente | Módulo Backend | Frontend | ¿Digitalizado? | Estado Real |
|---|------|--------------------------|----------------|----------|---------------|-------------|
| 1 | Solicitud de Servicio | Work Request Form | `work-requests` | `/work-requests` | ✅ | Completo |
| 2 | Visita Técnica | Site Visit Report | `site-visits` | `/site-visits` | ✅ | Completo |
| 3 | Propuesta Comercial | Proposal Document | `proposals` | `/proposals` | ✅ | Completo |
| 4 | Orden de Compra / Aprobación | PO Document | `purchase-orders` | `/purchase-orders` | ✅ | Completo |
| 5 | Planeación | Planning Packet | `planning-packet` | `/planning` | ✅ | Completo |
| 6 | Ejecución | Execution Log | `execution` | `/execution` | ✅ | Completo |
| 7 | Evidencia Fotográfica | Evidence Record | `evidence` | `/evidences` | ✅ | Completo |
| 8 | Informe Técnico | Technical Report | `reports` | `/reports` | ⚠️ | Solo routes |
| 9 | Acta de Entrega | Delivery Record | `delivery-record` | `/delivery-records` | ⚠️ | Solo routes |
| 10 | Firma del Cliente | Signature | `delivery-record` | `/delivery-records` | ⚠️ | Solo routes |
| 11 | SES / Ariba | Service Entry Sheet | `service-entry-sheet` | `/billing/ses` | ⚠️ | Solo routes |
| 12 | Facturación | Invoice | `invoice` | `/billing/invoices` | ⚠️ | Solo routes |
| 13 | Aprobación Factura | Invoice Approval | `invoice` | `/billing/invoices` | ⚠️ | Solo routes |
| 14 | Pago | Payment Record | `payment` | `/payments` | ⚠️ | Solo routes |

**Brecha:** Los pasos 8-14 están en estado "solo routes" — tienen definiciones de ruta API pero les falta la lógica de negocio (controllers/services/models) para ser funcionales.

---

## 2. Problemas de Negocio que Resuelve CERMONT

Identificados desde documentos fuente y análisis del flujo documental:

| # | Problema | Pasos Afectados | Severidad | ¿Cubierto por el sistema? |
|---|----------|-----------------|-----------|--------------------------|
| 1 | Formatos manuales (papel, Excel, Word) | 1-14 | CRÍTICO | ✅ Parcial (8-14 aún débiles) |
| 2 | Evidencias fotográficas dispersas (WhatsApp) | 7 | ALTO | ✅ Parcial |
| 3 | Planeación incompleta (EPP, herramientas) | 5 | ALTO | ✅ Implementado |
| 4 | Retraso informes técnicos y actas | 8-9 | ALTO | ⚠️ Débil |
| 5 | Retraso SES/Ariba y facturación | 11-12 | ALTO | ⚠️ Débil |
| 6 | Falta costos reales centralizados | 6, 12 | ALTO | ✅ Parcial |
| 7 | Sin comparación propuesta vs costo real | 3, 12 | ALTO | ⚠️ Débil |
| 8 | Certificaciones equipos y personal no verificadas | 5 | MEDIO | ⚠️ Parcial |
| 9 | Dependencia Excel/Word/PDF/físico | 1-14 | ALTO | ✅ Parcial |
| 10 | Pérdida trazabilidad documental | 1-14 | ALTO | ⚠️ Audit existe |
| 11 | Operación campo con baja conectividad | 6-7 | ALTO | ✅ PWA/Offline existe |
| 12 | Sin seguimiento de pago | 14 | MEDIO | ⚠️ Débil |

---

## 3. Formatos Operativos y su Digitalización

| Formato | Fuente | ¿Digitalizado? | Módulo | Brecha |
|---------|--------|---------------|--------|--------|
| Formato Planeación de Obra | 06_FORMATO_DE_PLANEACION_DE_OBRA3 | Parcial | planning-packet | Formatos de checklist de planeación |
| Formato Inspección Líneas de Vida | 08_Formato_Inspeccion_lineas_de_vida_Vertical3 | No | checklists | Checklist específico HSE |
| Formato Mantenimiento CCTV | 10_Formato_Mantenimiento_CCTV3 | No | maintenance | Checklist mantenimiento CCTV |
| Inducción SGSST | 02_INDUCCION_SGSST3 | No | safety | Formulario inducción |
| Jerarquía de Controles | 03_Jerarquia_de_controles_Cermont2 | No | safety | Matriz jerarquía controles |
| ATG | 04_ATG_JUAN_DIEGO_AREVALO-13 | No | reports | Generación automática ATG |
| Fotos Anclaje/Escalera | 05_FOTOS_ANCLAJE_ESCALERA_A_ESTRUCTURA3 | No | evidence | Categoría específica de evidencia |

---

## 4. Requisitos HSE/SGSST

| Requisito | Documento Fuente | ¿Implementado? | Módulo |
|-----------|------------------|---------------|--------|
| Gestión de Seguridad Industrial | SGSST | Parcial | safety |
| Inspecciones periódicas | SGSST | Parcial | checklists |
| Controles de riesgo | Jerarquía Controles | No | planning-packet |
| Certificaciones personal | SGSST | Parcial | users |
| EPP y herramientas certificadas | SGSST | Parcial | resources/kits |

---

## 5. Mapa de Fuentes Documentales

| Documento | Estado Lectura | Contenido Clave | Utilizado para |
|-----------|---------------|-----------------|----------------|
| docs/README.md | ✅ Leído completo | Índice documentación | Arquitectura general |
| docs/domain/CERMONT_BUSINESS_FLOW_MAP.md | ✅ Leído | Flujo 14 pasos, entidades | Mapeo negocio |
| docs/product/CERMONT_PRODUCT_BLUEPRINT.md | ✅ Leído | Visión producto | Roadmap |
| docs/architecture/CERMONT_ARCHITECTURE_BLUEPRINT.md | ✅ Leído | Arquitectura técnica | Stack, patrones |
| docs/architecture/API_ENDPOINT_MATRIX.md | ✅ Leído (394 líneas) | 100 endpoints documentados | Gap doc vs código |
| docs/architecture/FRONTEND_ROUTE_MAP.md | ✅ Leído | 86 rutas frontend | Mapa rutas |
| docs/architecture/DOMAIN_MODULE_MAP.md | ✅ Leído (38 líneas) | Módulos de dominio | Mapeo business-tech |
| docs/architecture/RBAC_PERMISSION_MAP.md | ✅ Leído (260 líneas) | Matriz permisos 8 roles | Seguridad |
| docs/architecture/MEDIA_EVIDENCE_FLOW_MAP.md | ✅ Leído (255 líneas) | Flujo evidencias | Arquitectura medios |
| docs/architecture/PWA_OFFLINE_FLOW_MAP.md | ✅ Leído (104 líneas) | Arquitectura offline | Offline-first |
| docs/FRONTEND_BACKEND_MATRIX.md | ✅ Leído (335 líneas) | Frontend → Backend trace | Gap integración |
| docs/KNOWN_ISSUES.md | ✅ Leído (124 líneas) | Issues conocidos | Deuda técnica |
| docs/TECHNICAL_DEBT.md | ✅ Leído (45 líneas) | Deuda técnica priorizada | Plan remediación |
| docs/API_STATUS.md | ✅ Leído (59 líneas) | Estado APIs | Monitoreo |
| docs/DEVELOPMENT_STATUS.md | ✅ Leído (82 líneas) | Estado módulos | Mapa de avance |
| docs/pdf/07_DESARROLLO_DE_UN_APLICATIVO_WEB_... | 📖 Lectura parcial | Tesis académica Juan Diego | Contexto negocio |
| LTG_JUAN_DIEGO_AREVALO-3 | ❌ No encontrado | — | — |
| Spec-008, 010 | ✅ Leídos previo | Planes de implementación | Roadmap previo |
| Spec-013 (parcial) | ❌ Lectura incompleta | Plan maestro | Innovación |
| Cryotos CMMS Research | ✅ Investigación previa | Benchmark externo | Comparativa FSM |

**Nota:** El documento `LTG_JUAN_DIEGO_AREVALO-3_markdown.md` no se encontró en la ruta esperada `docs/pdf/`. Se encontró `04_ATG_JUAN_DIEGO_AREVALO-13.md` como documento más cercano.

---

## 6. Brechas Identificadas por Requisito de Negocio

| ID | Requisito | Prioridad | Módulo | Brecha Específica |
|----|-----------|-----------|--------|-------------------|
| BR-01 | Generar informe técnico automático desde evidencia | P0 | technical-report | No existe service/controller |
| BR-02 | Generar acta de entrega con firma digital | P0 | delivery-record | No existe service/controller |
| BR-03 | Gestionar SES y envío a Ariba | P0 | service-entry-sheet | No existe service/controller |
| BR-04 | Emitir factura desde SES aprobada | P0 | invoice | No existe service/controller |
| BR-05 | Registrar y dar seguimiento a pagos | P0 | payment | No existe service/controller |
| BR-06 | Dashboard de KPIs operativos en tiempo real | P0 | kpi | Módulo vacío |
| BR-07 | Gestión de medios (fotos, videos, documentos) | P0 | media | Módulo vacío |
| BR-08 | Monitoreo de salud del sistema | P1 | observability | Sin service dedicado |
| BR-09 | Comparativa propuesta vs costo real | P1 | costs/cost-intelligence | Implementado parcialmente en Spec-016 |
| BR-10 | Offline-first completo para campo | P1 | PWA/offline | Implementado parcialmente |
