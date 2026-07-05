# Matrices y Soportes de Trazabilidad del Libro CERMONT

Fecha: 2026-05-19

Documento complementario al diagnóstico:
- `docs/audits/CODEX_BOOK_DIAGNOSTIC_2026-05-19.md`

## 1. Matriz de integración de documentación técnica 00-21

Fuente base: `docs/PROMPTS/README.md` y verificación estructural del repositorio.

| Documento | Tema principal | Capítulo donde se integra | Aporte al proyecto | Evidencia técnica | Observación |
|---|---|---|---|---|---|
| 00 | Foundation: auth, RBAC, API, design, observability | 5, 6, 8 | Define la base transversal del sistema | `packages/domain/src/roles.ts`, `backend/src/middlewares/auth.middleware.ts`, `frontend/src/proxy.ts` | Documento fundacional de arquitectura |
| 01 | Dashboard / KPIs | 6, 7 | Soporta visibilidad gerencial y analítica | `frontend/src/app/(dashboard)/dashboard/`, `packages/shared-types/src/schemas/analytics.schema.ts` | Integrado como panel de seguimiento |
| 02 | Solicitudes / Work Requests | 1, 6, 7 | Materializa el paso 1 del flujo | `packages/shared-types/src/schemas/work-request.schema.ts`, `backend/src/routes/work-request.routes.ts` | Implementado |
| 03 | Visitas técnicas / Site Visits | 1, 6, 7 | Materializa el paso 2 del flujo | `packages/shared-types/src/schemas/site-visit.schema.ts`, `backend/src/routes/site-visit.routes.ts` | Implementado |
| 04 | Propuestas / Proposals | 1, 6, 7 | Conecta propuesta y autorización inicial | `packages/shared-types/src/schemas/proposal.schema.ts`, `backend/src/routes/proposal.routes.ts` | Implementado |
| 05 | Órdenes / ServiceCase Detail | 1, 6, 7 | Establece la entidad central del sistema | `packages/shared-types/src/schemas/order.schema.ts`, `backend/src/services/order/order-rules.ts` | Implementado |
| 06 | Planeación / Planning Packet | 1, 6, 7 | Responde a la falla de planeación y kits típicos | `packages/shared-types/src/schemas/planning-packet.schema.ts`, `backend/src/routes/planning-packet.routes.ts`, `frontend/src/app/(dashboard)/planning/page.tsx` | Implementado |
| 07 | Ejecución / Execution Session | 1, 6, 7 | Soporta ejecución guiada y estados de campo | `packages/shared-types/src/schemas/execution-session.schema.ts`, `backend/src/services/execution-session.service.ts` | Implementado |
| 08 | Evidencias / Evidence Management | 1, 6, 7, 8 | Atiende captura y trazabilidad de evidencias | `packages/shared-types/src/schemas/evidence.schema.ts`, `backend/src/services/evidence.service.ts`, `frontend/src/app/(dashboard)/evidences/page.tsx` | Implementado |
| 09 | Informes técnicos / Technical Reports | 1, 6, 7, 8 | Responde al retraso en informes | `packages/shared-types/src/schemas/technical-report.schema.ts`, `backend/src/routes/technical-report.routes.ts` | Implementado |
| 10 | Actas / Delivery Records | 1, 6, 7 | Atiende formalización de cierre técnico | `packages/shared-types/src/schemas/delivery-record.schema.ts`, `frontend/src/app/(dashboard)/delivery-records/` | Implementado |
| 11 | Cierre administrativo / Admin Closure | 1, 6, 7 | Orquesta el cierre documental posterior a ejecución | `backend/src/routes/order-closure.routes.ts`, `backend/src/services/order-closure.service.ts` | Implementado como seguimiento interno |
| 12 | SES / Ariba / Service Entry Sheets | 1, 6, 7 | Soporta seguimiento del paso 11 | `packages/shared-types/src/schemas/service-entry-sheet.schema.ts`, `frontend/src/app/(dashboard)/billing/ses/page.tsx` | Implementado sin integración externa directa |
| 13 | Facturas / Invoices | 1, 6, 7 | Soporta seguimiento del paso 12 | `packages/shared-types/src/schemas/invoice.schema.ts`, `frontend/src/app/(dashboard)/billing/invoices/` | Implementado |
| 14 | Pagos / Payments | 1, 6, 7 | Soporta seguimiento del paso 14 | `packages/shared-types/src/schemas/payment.schema.ts`, `frontend/src/app/(dashboard)/payments/page.tsx` | Implementado |
| 15 | Costos / Cost Engine | 1, 6, 7 | Atiende la falla de costos reales vs propuesta | `packages/shared-types/src/schemas/costControl.schema.ts`, `backend/src/models/CostControl.ts`, `frontend/src/app/(dashboard)/costs/page.tsx` | Implementado |
| 16 | Activos / Assets | 6, 7 | Vincula equipos/activos intervenidos | `packages/shared-types/src/schemas/asset.schema.ts`, `frontend/src/app/(dashboard)/assets/` | Implementado |
| 17 | Mantenimiento / Maintenance | 6, 7 | Soporta catálogos y kits de mantenimiento | `frontend/src/app/(dashboard)/maintenance/`, `backend/src/models/MaintenanceKit.ts` | Implementado |
| 18 | Documentos / Document-Driven Core | 5, 6, 7 | Refuerza enfoque documental del sistema | `backend/src/routes/document.routes.ts`, `frontend/src/app/(dashboard)/documents/page.tsx` | Implementado |
| 19 | Recursos & Kits | 1, 6, 7 | Refuerza planeación y disponibilidad de recursos | `frontend/src/app/(dashboard)/resources/kits/page.tsx`, `backend/src/services/kit.service.ts` | Implementado |
| 20 | Users / RBAC / Administration | 6, 7, 8 | Soporta administración y permisos | `frontend/src/app/(dashboard)/admin/`, `backend/src/routes/user.routes.ts` | Implementado |
| 21 | Cross-Module Stabilization / Release Readiness | 5, 8 | Consolida pruebas, gates y estabilización final | `backend/tests/`, `frontend/tests/`, `tooling/quality/` | Debe usarse como soporte de validación técnica |

## 2. Matriz problema -> requisito -> módulo -> evidencia

| Falla identificada | Paso del flujo | Requisito del sistema | Módulo propuesto/implementado | Evidencia | Objetivo relacionado |
|---|---|---|---|---|---|
| No se tienen todas las herramientas y equipos requeridos en la planeación | 5 | Configurar kits típicos y paquetes de planeación por tipo de servicio | Planeación / Resources & Kits / Planning Packet | `planning-packet.schema.ts`, `planning-packet.routes.ts`, `planning/page.tsx` | 2 y 3 |
| Durante la ejecución pueden faltar herramientas y equipos por olvido o desconocimiento | 5-6 | Diligenciar checklists y consultar recursos desde campo, con soporte offline cuando aplique | Execution Session / Checklists / Offline queue | `execution-session.schema.ts`, `useOfflineChecklist.ts`, `sync.service.ts` | 2 y 3 |
| Existen retrasos en la elaboración de informes y actas | 7-9 | Consolidar evidencias y generar documentos desde datos del sistema | Evidencias / Informes / PDF | `report.service.ts`, `pdf-generator.service.ts`, `reports/page.tsx` | 3 |
| Existen retrasos en facturación cuando hay múltiples trabajos | 10-14 | Hacer seguimiento del estado de SES, factura y pago por orden | Billing / SES / Invoices / Payments | `service-entry-sheet.schema.ts`, `billing/ses/page.tsx`, `payments/page.tsx` | 2 y 3 |
| No existe sistema centralizado para relacionar costos reales con propuesta económica inicial | 3-14 | Relacionar propuesta, costos reales y cierre administrativo | Proposals / Costs | `costControl.schema.ts`, `CostControl.ts`, `costs/page.tsx` | 2 y 3 |

## 3. Matriz objetivo -> capítulo -> evidencia

| Objetivo | Cómo se abordó | Capítulo donde se evidencia | Documento 00-21 relacionado | Evidencia | Estado de cumplimiento |
|---|---|---|---|---|---|
| Analizar el flujo actual e identificar fallas críticas | Revisión del flujo de 14 pasos, documentos internos y fallas documentadas | 1, 5, 7 | 02-06, 11, 15 | Documento de proceso de CERMONT, formatos internos, tablas del libro | Cumplido |
| Diseñar la arquitectura funcional del sistema | Definición de módulos, roles, base de datos y contratos compartidos | 5, 6 | 00, 05-06, 18-21 | Diagramas, `shared-types`, `roles.ts`, estructura del monorepo | Cumplido |
| Implementar módulos principales | Construcción de backend, frontend y contratos para planeación, ejecución, evidencias e informes | 6, 7 | 06-15, 18-20 | Código fuente, rutas, servicios, pantallas y pruebas | Cumplido con alcances parciales |
| Validar la efectividad del aplicativo | Pruebas técnicas y diseño de escenarios de validación | 8 | 21 | Tests automatizados, matrices de validación, recomendaciones de piloto | Parcial: validación operativa pendiente |

## 4. Funcionalidades implementadas

- Autenticación JWT y autorización RBAC.
- Solicitudes, visitas técnicas, propuestas y órdenes.
- Planeación con `PlanningPacket` y kits.
- Ejecución de sesiones de campo.
- Gestión de evidencias con metadatos.
- Generación de informes y PDF.
- Delivery records.
- Seguimiento de SES, facturas y pagos.
- Módulo de costos.
- Dashboard y analítica operativa.
- Recursos, activos, mantenimiento y documentos.

## 5. Funcionalidades parcialmente implementadas

- Operación offline general.
  - Existe cola local y reintento diferido.
  - La sincronización offline completa de evidencias binarias no está soportada en backend.
- Validación operativa con usuarios reales.
  - Existen matrices y escenarios.
  - No se evidenciaron actas UAT ni piloto cuantitativo cerrado.

## 6. Funcionalidades propuestas o trabajo futuro

- Extracción documental / OCR para formularios dinámicos.
- Integración directa con SAP Ariba.
- Emisión de facturación electrónica DIAN desde la plataforma.
- Firma digital criptográfica con PKI.
- Integración más profunda con SIIGO u otros sistemas externos.

## 7. Datos eliminados o degradados por falta de evidencia

- ROI, payback, ahorros y proyecciones financieras internas.
- Porcentajes de mejora antes/después.
- Validación cualitativa “aprobada” por usuarios sin acta.
- Afirmación de sincronización offline total de evidencias.
- Afirmación de implementación basada en Serwist 9.x.
- Cobertura total del flujo como “completamente validada” en producción.

## 8. Citas pendientes y estado bibliográfico

- Citas faltantes en el texto respecto de claves usadas: no se detectaron claves citadas inexistentes en la auditoría inicial.
- Pendiente de depuración bibliográfica:
  - `Libro/Bibliografia/referencias.bib` contiene más entradas que citas efectivas en el texto.
  - Se recomienda limpiar entradas no citadas antes de la entrega final al jurado.

## 9. Checklist de veracidad y antiplagio

- [x] El problema se centra en CERMONT S.A.S. y su flujo real de 14 pasos.
- [x] Se diferencian diagnóstico, implementación, parcialidad y trabajo futuro.
- [x] No se dejaron métricas cuantitativas sin soporte como resultados cerrados.
- [x] El ATG se usa como documento rector, no como plantilla administrativa del cuerpo del libro.
- [x] La documentación 00-21 se integra como bitácora técnica, no como copia literal.
- [x] El estado del módulo offline fue corregido conforme al código real.
- [x] Se incorporaron tablas de trazabilidad en el libro y en este soporte.
- [ ] Depuración final de bibliografía no citada.
- [ ] Verificación visual exhaustiva página por página de márgenes en todas las tablas y figuras.

