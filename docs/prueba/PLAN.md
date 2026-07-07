
---

# Plan Maestro V2 — Cermont Document-Driven Contractor Platform

## Objetivo general

Convertir el aplicativo actual en una plataforma donde Cermont pueda:

1. Subir documentos existentes en Excel/PDF.
2. Detectar campos, tablas, checklists, firmas, fotos y secciones.
3. Convertir esos documentos en formularios dinámicos.
4. Permitir editar, agregar, quitar y versionar campos.
5. Diligenciar formularios online/offline desde campo.
6. Generar nuevamente PDF/Excel con formato similar al original.
7. Enlazar esos documentos al flujo real: solicitud → visita → propuesta → PO → planeación → ejecución → informe → acta → SES → factura → pago.
8. Controlar costos reales tipo “carrito”.
9. Gestionar activos, herramientas, certificados y recordatorios.
10. Agregar mapas/rutas después de resolver primero documentación, costos y cierre.

El flujo operativo original ya exige solicitud, visita, propuesta, PO, planeación, ejecución, informe, acta, SES, factura y pago, y los fallos principales están en planeación, ejecución, informes, facturación y costos reales. 

---

# Fase 0 — Baseline, congelamiento y seguridad de rama

## Objetivo

Preparar el repo antes de agregar funcionalidades grandes.

## Tareas

* Crear rama:

```txt
feature/document-driven-platform
```

* Ejecutar baseline:

```txt
npm run typecheck
npm run lint
npm run test
npm run build
npm run contracts:check
npm run ghost:check
```

* Confirmar estructura real:

```txt
backend/
frontend/
packages/
```

* Prohibido crear:

```txt
apps/backend
apps/frontend
```

## Entregables

* `docs/audits/DOCUMENT_PLATFORM_BASELINE_REPORT.md`
* Checklist de riesgos.
* Estado actual de build/lint/test.

## Criterio de salida

Todo debe estar verde antes de iniciar modelo nuevo.

---

# Fase 1 — Inventario documental y clasificación de formatos

## Objetivo

Crear el módulo base para registrar todos los formatos que Cermont ya usa en Excel/PDF.

## Justificación

Los documentos muestran que la empresa usa formatos diferentes para planeación de obra, inspección de líneas de vida, mantenimiento CCTV, inducción HES y registros fotográficos. Por ejemplo, planeación de obra incluye responsable, lugar, fecha, unidad de negocio, alcance, materiales, herramientas, equipos, elementos de seguridad y número de trabajadores. 

## Crear entidades

```txt
DocumentTemplateInventory
DocumentTemplateCategory
DocumentTemplateSourceFile
DocumentTemplateClassification
```

## Campos sugeridos

```ts
templateName
serviceType
businessUnit
sourceType: xlsx | pdf | image | manual
frequencyOfUse
billingCriticality
layoutStability
requiresSignature
requiresPhotos
requiresGps
requiresOffline
status: draft | classified | ready_for_import | archived
```

## Páginas

```txt
/templates
/templates/new
/templates/[id]
/templates/[id]/classification
```

## Backend

```txt
GET /api/document-templates
POST /api/document-templates
GET /api/document-templates/:id
PATCH /api/document-templates/:id/classification
```

## Criterio de salida

La empresa puede registrar sus formatos existentes, clasificarlos y priorizarlos.

---

# Fase 2 — Modelo SSOT de plantillas versionadas

## Objetivo

Crear el núcleo del sistema: la plantilla versionada.

La investigación recomienda que el objeto central deje de ser “formulario hardcodeado” y pase a ser una plantilla versionada con origen, tipo de servicio, versión, esquema de campos, reglas, permisos, layout de exportación y compatibilidad hacia atrás. 

## Crear entidades

```txt
DocumentTemplate
DocumentTemplateVersion
TemplateSection
TemplateField
TemplateTable
TemplateRule
TemplatePermission
TemplateExportLayout
```

## Estados

```txt
draft
review_required
approved
published
deprecated
archived
```

## Tipos de campo

```txt
text
number
currency
date
datetime
boolean
select
multi_select
checkbox
radio
photo
signature
gps
file
table
checklist
calculated
```

## Reglas importantes

* Una plantilla publicada no se edita directamente.
* Cada cambio crea nueva versión.
* Las respuestas antiguas conservan su versión original.
* No se elimina histórico.
* La plantilla es SSOT del formulario.

## Entregables

* Zod schemas en `packages/shared-types`.
* Modelo Mongoose.
* Endpoints CRUD.
* Tests unitarios de versionado.

---

# Fase 3 — Gestión de archivos documentales

## Objetivo

Permitir subir documentos PDF, Excel e imágenes como fuente de plantilla.

## Crear módulo

```txt
backend/src/document-files
frontend/src/document-files
```

## Endpoints

```txt
POST /api/document-files/upload
GET /api/document-files/:id
GET /api/document-files/:id/download
POST /api/document-files/:id/scan
```

## Reglas

* Validar tipo MIME.
* Validar tamaño.
* No confiar en extensión.
* Guardar hash del archivo.
* Asociar archivo con plantilla.
* Registrar audit event.
* No almacenar secretos.
* No exponer path interno.

## Tipos aceptados iniciales

```txt
.xlsx
.xls
.pdf
.png
.jpg
.jpeg
```

## Criterio de salida

Cermont puede subir el archivo original y conservarlo como fuente auditable.

---

# Fase 4 — Importación Excel-first

## Objetivo

Priorizar Excel como fuente principal cuando exista, porque conserva mejor tablas, celdas y estructura que un PDF exportado.

## Justificación

La investigación recomienda no pelear contra Excel, sino absorberlo. Para documentos nacidos en Excel, la ruta `.xlsx → plantilla dinámica` es más fiel que comenzar por PDF. 

## Crear pipeline

```txt
XlsxWorkbookImport
XlsxSheetMap
XlsxCellRegion
XlsxDetectedTable
XlsxDetectedField
```

## Flujo

```txt
Subir Excel
→ seleccionar hoja
→ detectar regiones
→ detectar tablas
→ detectar labels
→ proponer campos
→ revisión humana
→ guardar TemplateVersion
```

## UI

```txt
/templates/[id]/import/xlsx
/templates/[id]/builder
```

## Funcionalidades

* Vista previa de hojas.
* Detección de celdas combinadas.
* Detección de tablas.
* Detección de columnas repetibles.
* Selección manual de región.
* Mapeo de celda a campo.
* Guardar como plantilla versionada.

## Criterio de salida

Un formato de planeación de obra en Excel puede convertirse en un formulario dinámico editable.

---

# Fase 5 — Importación PDF legacy

## Objetivo

Permitir que PDFs existentes sirvan como punto de partida para crear plantillas.

## Justificación

Los PDFs compartidos son formatos exportados o escaneados con estructura de campos, checklists y fotos. El de CCTV contiene campos como cámara, rutina, lugar, fecha, modelo, serial, radioenlace, alimentación, sistema eléctrico, conexión remota y registro fotográfico. 

## Crear pipeline

```txt
PdfDocumentImport
PdfPageMap
PdfTextBlock
PdfDetectedField
PdfDetectedTable
PdfDetectedCheckbox
PdfDetectedImageRegion
```

## Flujo

```txt
Subir PDF
→ extraer texto/layout
→ detectar labels
→ detectar tablas/checklists
→ detectar zonas de foto/firma
→ revisión humana
→ generar plantilla
```

## Reglas

* PDF no debe aprobar plantilla automáticamente.
* Siempre requiere revisión humana.
* Campos detectados tienen confidence score.
* Si es escaneado, marcar `ocr_required`.
* Si no se puede extraer, permitir creación manual asistida.

## Criterio de salida

Un PDF como inspección de líneas de vida puede producir una plantilla editable con checklist C/NC, hallazgos, acciones correctivas y registro fotográfico. 

---

# Fase 6 — Template Builder / Editor visual de plantillas

## Objetivo

Crear el editor donde el administrador pueda ajustar campos, secciones, tablas y reglas.

## UI principal

```txt
/templates/[id]/builder
/templates/[id]/versions/[versionId]/builder
```

## Componentes

```txt
TemplateBuilderShell
TemplateSectionEditor
TemplateFieldEditor
TemplateTableEditor
TemplateRuleEditor
TemplatePreview
TemplateVersionTimeline
TemplatePublishPanel
```

## Funciones

* Agregar campo.
* Quitar campo.
* Cambiar tipo de campo.
* Reordenar secciones.
* Crear tablas repetibles.
* Definir obligatoriedad.
* Definir validaciones.
* Definir roles que pueden llenar/aprobar.
* Definir si requiere foto/firma/GPS.
* Previsualizar formulario.
* Publicar versión.

## Reglas

* No publicar plantilla inválida.
* No romper versiones anteriores.
* No eliminar campos usados en respuestas históricas.
* Deprecar en vez de borrar.

## Criterio de salida

Un administrador puede convertir un documento viejo en un formulario operativo sin tocar código.

---

# Fase 7 — Runtime de formularios dinámicos

## Objetivo

Renderizar formularios desde plantillas publicadas.

## Crear entidades

```txt
TemplateResponse
TemplateResponseSection
TemplateResponseFieldValue
TemplateResponseAttachment
TemplateResponseSignature
TemplateResponseGpsPoint
```

## Integración con pipeline actual

Una respuesta puede estar asociada a:

```txt
WorkRequest
SiteVisit
Proposal
WorkOrder
PlanningPacket
ExecutionSession
TechnicalReport
DeliveryRecord
ServiceEntrySheet
Invoice
Asset
MaintenanceEvent
```

## UI

```txt
/forms/[templateVersionId]/fill
/orders/[id]/forms/[templateId]
/execution-sessions/[id]/forms/[templateId]
```

## Reglas

* El frontend no conoce campos hardcodeados.
* Renderiza desde `TemplateVersion`.
* Valida con schema generado.
* Guarda respuestas parciales.
* Soporta fotos, firmas, GPS y tablas.
* Compatible con offline.

## Criterio de salida

Un técnico puede diligenciar en campo un formato dinámico sin que el programador cree una pantalla nueva.

---

# Fase 8 — Offline-first avanzado para formularios dinámicos

## Objetivo

Hacer que los formularios dinámicos funcionen offline como una PWA real.

## Justificación

La investigación indica que no basta con cachear páginas: se necesita service worker, IndexedDB, cola de sincronización, reintento, resolución de conflictos y UI clara del estado offline. Además, el usuario debe ver qué formularios, fotos o firmas están pendientes, fallaron o requieren reintento. 

## Crear

```txt
OfflineTemplateCache
OfflineTemplateResponseDraft
OfflineCommandOutbox
OfflineAttachmentQueue
OfflineSyncConflict
```

## Reglas

* Cachear plantillas asignadas.
* Cachear catálogos necesarios.
* Guardar borradores en IndexedDB.
* Adjuntos en IndexedDB/File storage local.
* No marcar como sincronizado sin confirmación backend.
* Idempotencia con `clientMutationId`.
* Conflictos visibles para el usuario.
* Firmas confirmadas son inmutables.

## UI

```txt
/offline
/offline/queue
/offline/conflicts
```

## Criterio de salida

El técnico puede abrir una orden, llenar formatos, tomar fotos, firmar y sincronizar después.

---

# Fase 9 — Compositor de entregables PDF/Excel

## Objetivo

Generar informes, actas y formatos finales desde datos estructurados.

## Justificación

Uno de los dolores principales es que crear informes y actas en Excel/PDF es lento, especialmente al insertar imágenes, ordenar campos y enviar soportes; esto retrasa facturación. El flujo original identifica fallas en informes, actas y facturación oportuna. 

## Crear entidades

```txt
GeneratedDocument
DocumentRenderJob
ExportTemplateLayout
ExportPackage
```

## Salidas

```txt
PDF
XLSX
ZIP
JSON
```

## Funcionalidades

* Generar PDF con layout similar al formato original.
* Exportar Excel si el cliente lo exige.
* Insertar fotos automáticamente.
* Insertar firmas.
* Insertar fechas, técnicos, activos, cliente.
* Generar paquete ZIP por orden.
* Asociar entrega con informe/acta/SES.

## UI

```txt
/orders/[id]/deliverables
/templates/[id]/export-layout
/generated-documents/[id]
```

## Criterio de salida

El usuario no debe volver a armar manualmente un informe en Excel copiando fotos y datos.

---

# Fase 10 — Integración con ServiceCase y flujo existente

## Objetivo

Conectar plantillas dinámicas al pipeline que ya existe.

## Reglas

* No reemplazar `ServiceCase`.
* No duplicar `PlanningPacket`.
* No duplicar `ExecutionSession`.
* Las plantillas son artefactos anexos y configurables.
* Los blockers de negocio pueden depender de formularios requeridos.

## Ejemplos

```txt
PlanningPacket requiere FORMATO PLANEACIÓN DE OBRA aprobado.
ExecutionSession requiere checklist de herramientas diligenciado.
TechnicalReport requiere formulario de informe técnico generado.
DeliveryRecord requiere acta firmada.
SES requiere acta firmada + informe aprobado.
```

## Crear

```txt
ServiceCaseTemplateRequirement
StageDocumentRequirement
RequiredTemplateRule
```

## Criterio de salida

Cada etapa del proceso puede exigir documentos dinámicos antes de avanzar.

---

# Fase 11 — Motor de costos reales tipo carrito/BOM

## Objetivo

Crear un módulo que calcule costos reales contra propuesta inicial.

## Justificación

El problema original dice que no existe una hoja centralizada para comparar costos reales, impuestos y valores frente a lo estimado en la propuesta. 

## Crear entidades

```txt
CostCatalogItem
CostCart
CostCartLine
CostBaselineSnapshot
ActualCostEntry
CostDeviation
TaxRule
```

## Funciones

* Agregar material.
* Agregar mano de obra.
* Agregar equipo.
* Agregar transporte.
* Agregar impuesto.
* Calcular subtotal.
* Calcular IVA/retenciones si aplica.
* Comparar contra propuesta.
* Mostrar desviación.

## UI

```txt
/orders/[id]/cost-cart
/costs/catalog
/costs/budget-vs-actual
```

## Reglas

* No mostrar 0 si no hay dato.
* Estados:

```txt
pending_data
complete
over_budget
under_budget
```

## Criterio de salida

La empresa puede saber cuánto cuesta realmente una actividad mientras se ejecuta, no días después.

---

# Fase 12 — Activos, herramientas, equipos y certificados

## Objetivo

Crear registro general de activos, herramientas, equipos, certificados y documentos asociados.

## Justificación

Cermont maneja materiales, equipos, herramientas, cámaras, líneas de vida, personal técnico y certificados. La inducción HES muestra que no es solo una empresa petrolera, sino de construcción, electricidad, refrigeración, montajes, mantenimiento y telecomunicaciones. 

## Crear entidades

```txt
Asset
Tool
Equipment
Certificate
CertificateVersion
AssetDocument
AssetInspection
AssetMaintenanceHistory
```

## Funciones

* Hoja de vida de activo.
* Certificados de equipo/persona.
* Fecha de vencimiento.
* Documentos asociados.
* Fotos.
* Historial de mantenimiento.
* Estado operativo.
* Bloqueo si certificado está vencido.

## UI

```txt
/assets
/assets/[id]
/tools
/equipment
/certificates
/certificates/expiring
```

## Criterio de salida

La planeación puede verificar automáticamente si herramientas, equipos o personal cumplen antes de ejecutar.

---

# Fase 13 — Mantenimiento preventivo y recordatorios

## Objetivo

Agregar recordatorios de mantenimiento sin saltar todavía a IA predictiva.

## Justificación

La investigación recomienda primero mantenimiento preventivo y condition-based simple; el predictivo real debe esperar a tener historial, sensores o datos suficientes. 

## Crear entidades

```txt
MaintenancePlan
MaintenanceRule
MaintenanceReminder
MaintenanceEvent
MaintenanceCounter
```

## Tipos de regla

```txt
by_date
by_hours
by_kilometers
by_usage_count
by_certificate_expiry
manual_condition
```

## Ejemplos

* Cambio de aceite de grúa.
* Revisión de vehículo.
* Vencimiento de certificado.
* Inspección periódica de línea de vida.
* Mantenimiento preventivo CCTV.
* Revisión de herramienta crítica.

## UI

```txt
/maintenance
/maintenance/plans
/maintenance/reminders
/assets/[id]/maintenance
```

## Criterio de salida

El sistema avisa antes de que un activo, certificado o equipo cause bloqueo operativo.

---

# Fase 14 — Geolocalización, mapas y rutas con MapCN

## Objetivo

Agregar mapa operativo, pero después de plantillas, costos y cierre.

## Justificación

La investigación indica que `mapcn` sirve como capa UI sobre MapLibre, mientras OSRM resuelve cálculo de rutas. El mapa aporta valor para geolocalizar activos, cámaras, torres, frentes de trabajo, evidencias, check-in/check-out GPS y rutas del técnico, pero no debe ir antes de solucionar documentación y costos. 

## Crear entidades

```txt
GeoPoint
GeoFence
RoutePlan
TechnicianCheckIn
TechnicianTrack
EvidenceLocation
AssetLocation
```

## Funciones

* Ubicar activos.
* Ubicar evidencias.
* Check-in/check-out técnico.
* Ruta estimada.
* Ruta real.
* Distancia/tiempo.
* Visualizar frentes de trabajo.

## UI

```txt
/map
/orders/[id]/map
/assets/map
/routes
```

## Criterio de salida

El mapa se usa como soporte operativo y evidencia, no como módulo decorativo.

---

# Fase 15 — Comunicación, correo y paquetes de entrega

## Objetivo

Reducir el envío manual por correo.

## Crear entidades

```txt
DeliveryPackage
EmailDeliveryRecord
ClientDeliveryStatus
DocumentRecipient
```

## Funciones

* Generar paquete de cierre.
* Adjuntar informe, acta, fotos y soportes.
* Registrar envío.
* Registrar destinatarios.
* Registrar respuesta o aprobación.
* Dejar trazabilidad.

## UI

```txt
/orders/[id]/delivery-package
/delivery-packages
```

## Criterio de salida

Cermont puede demostrar qué se envió, cuándo, a quién y con qué soporte.

---

# Fase 16 — Integración administrativa con factura/SES/Siigo/Ariba

## Objetivo

Preparar el sistema para integraciones administrativas sin prometer automatización total si no existe API disponible.

## Justificación

El documento de tesis menciona que el sistema no debe ser software certificado de facturación DIAN, sino generar información estructurada que puede alimentar software contable como Siigo. 

## Funciones

* Exportar JSON de factura.
* Exportar datos para Siigo.
* Registrar número SES.
* Registrar número factura.
* Asociar documentos de soporte.
* Registrar pago.

## Criterio de salida

El cierre administrativo no depende de buscar datos manualmente en informes, Excel y correos.

---

# Fase 17 — Dashboard gerencial multiservicio

## Objetivo

Actualizar dashboard con plantillas, costos, mantenimiento y documentos.

## Widgets

```txt
Formatos pendientes
Formatos sin sincronizar
Informes generados
Actas pendientes
SES pendientes
Facturas pendientes
Costos reales vs estimados
Certificados por vencer
Mantenimientos próximos
Activos bloqueados
Órdenes por sector/tipo de servicio
```

## Criterio de salida

El dashboard refleja operación real y no solo estados de órdenes.

---

# Fase 18 — E2E y seed real para plataforma documental

## Objetivo

Validar con Playwright el flujo completo incluyendo plantillas dinámicas.

## Flujos E2E

1. Crear plantilla desde Excel.
2. Crear plantilla desde PDF.
3. Publicar plantilla.
4. Asociar plantilla a tipo de servicio.
5. Crear solicitud.
6. Convertir a orden.
7. Planeación exige plantilla.
8. Ejecución llena plantilla offline.
9. Sincroniza.
10. Genera informe PDF.
11. Genera acta.
12. Crea SES.
13. Crea factura.
14. Registra pago.
15. Dashboard refleja cierre.

## Criterio de salida

La plataforma demuestra que puede reemplazar el trabajo manual de Excel/PDF sin obligar a la empresa a dejar sus formatos.

---

# Fase 19 — Seguridad, auditoría y cumplimiento

## Objetivo

Endurecer el sistema antes de producción.

## Revisar

* RBAC por plantilla.
* Permisos por campo.
* Auditoría de cambios.
* Versionado de documentos.
* Firma inmutable.
* Archivos privados.
* Rate limit de uploads.
* Escaneo de MIME.
* Tamaño máximo.
* Backup de documentos.
* Logs sin datos sensibles.
* Qodana.
* OWASP.

## Criterio de salida

Los documentos operativos y administrativos quedan protegidos y auditables.

---

# Fase 20 — Hardening PWA y producción VPS

## Objetivo

Preparar despliegue robusto.

## Tareas

* Cache strategies.
* IndexedDB migrations.
* Sync queue monitoring.
* Retry policy.
* Health checks.
* Backups.
* Docker.
* Nginx.
* HTTPS.
* Logs.
* Observabilidad.
* Restore test.
* Seed production-safe.
* Manual de usuario.

## Criterio de salida

La app puede operar en campo, sincronizar y recuperarse de fallos.

---

# Orden recomendado de implementación

No recomiendo comenzar por mapas ni mantenimiento predictivo. El orden correcto es:

```txt
1. Inventario documental
2. Plantillas versionadas
3. Upload de documentos
4. Excel-first import
5. PDF import
6. Template Builder
7. Dynamic Form Runtime
8. Offline Dynamic Forms
9. PDF/Excel Export Composer
10. Integración con ServiceCase
11. Cost Cart
12. Assets/Tools/Certificates
13. Maintenance Reminders
14. Maps/Routes
15. Email Delivery Packages
16. Admin integrations
17. Dashboard
18. E2E
19. Security
20. VPS/PWA Hardening
```

---

# Primer prompt recomendado para empezar

Esta sería la primera instrucción para Windsurf/Codex cuando quieras iniciar la implementación:

```txt
Actúa como Arquitecto de Software Senior y Product Engineer para Cermont S.A.S.

Vamos a iniciar el Plan Maestro V2 — Document-Driven Contractor Platform.

No refactorices todo el sistema.
No cambies el stack.
No crees apps/backend ni apps/frontend.
No elimines lo ya implementado.
No rompas ServiceCase, PlanningPacket, ExecutionSession, TechnicalReport, DeliveryRecord, SES, Invoice ni Payment.

Estructura real:
- backend/
- frontend/
- packages/

Stack real:
- Backend: Express 5, Mongoose, MongoDB, Zod, TypeScript.
- Frontend: Next.js 16, React 19, TanStack Query v5, Zustand, Tailwind.
- Shared contracts: packages/shared-types.
- Testing: Vitest + Playwright.
- Calidad: Biome, Qodana, strict TypeScript.
- Deploy: VPS.

Procede solo con:

FASE 1 — Inventario documental y clasificación de formatos.

Objetivo:
Crear la base para registrar formatos Excel/PDF usados por Cermont y clasificarlos por tipo de servicio, criticidad, frecuencia y reutilización.

Contexto:
La investigación mostró que Cermont usa diferentes formatos para planeación de obra, inspección de líneas de vida, mantenimiento CCTV, inducción HES y registros fotográficos. El producto debe evolucionar hacia plantillas documentales versionadas, no formularios hardcodeados.

Crear:
- DocumentTemplateInventory
- DocumentTemplateCategory
- DocumentTemplateSourceFile
- DocumentTemplateClassification

Backend:
- Crear módulo backend/src/document-templates
- Crear schemas Zod en packages/shared-types
- Crear modelo Mongoose
- Crear endpoints:
  GET /api/document-templates
  POST /api/document-templates
  GET /api/document-templates/:id
  PATCH /api/document-templates/:id/classification

Frontend:
- Crear módulo frontend/src/document-templates
- Crear páginas:
  /templates
  /templates/new
  /templates/[id]
  /templates/[id]/classification

Reglas:
- No subir archivo todavía en esta fase.
- No OCR todavía.
- No Excel parser todavía.
- No PDF parser todavía.
- Solo inventario y clasificación.
- No mocks.
- No direct fetch.
- Usar apiClient.
- Usar TanStack Query v5.
- Query keys estables.
- Loading/error/empty states obligatorios.
- RBAC mínimo: gerente, residente y administrativo pueden administrar plantillas; técnico solo lectura si aplica.
- Audit event para create/update/classify.
- Tests backend y frontend.
- Actualizar contratos.
- Crear docs/audits/DOCUMENT_TEMPLATE_INVENTORY_PHASE1_REPORT.md
- Crear docs/adr/ADR-document-template-inventory.md

Validar:
npm run typecheck
npm run lint
npm run test
npm run build
npm run contracts:check
npm run ghost:check

No declares completado si falla algún comando.
```

---

Este plan ajusta lo que ya se hizo: no reemplaza el pipeline `ServiceCase`; lo convierte en el eje donde se cuelgan plantillas, documentos, costos, activos, mantenimiento y mapas. El cambio más importante es conceptual: **el documento deja de ser un archivo muerto de Excel/PDF y pasa a ser una plantilla viva, versionada, auditable y reutilizable**.
