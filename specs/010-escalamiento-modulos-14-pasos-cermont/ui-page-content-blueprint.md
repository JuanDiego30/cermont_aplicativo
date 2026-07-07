# Blueprint de contenido por página

## Reglas comunes

- Usar el sistema visual Cermont existente; no duplicar primitivas.
- Cada página crítica incluye loading, error, empty, offline y forbidden cuando aplique.
- Acciones y navegación provienen de constantes de ruta y permisos de `@cermont/domain`.
- El resumen superior responde “qué estado tiene, qué bloquea y qué sigue”; no usa KPIs genéricos decorativos.

| Página | Objetivo / usuario | Secciones y acciones | Datos / componentes | Estados y E2E |
|---|---|---|---|---|
| `/dashboard` | priorizar trabajo; gerencia/operación | next actions, blockers, readiness, cierre, costos | DashboardSummary, Command Center | carga/error/empty/offline; filtro por permiso |
| `/service-cases` | cartera operativa; internos | etapa, riesgo, próxima acción, búsqueda | ServiceCase list/read model | lista vacía, filtro, forbidden |
| `/service-cases/:id` | cockpit 14 pasos; internos | progreso, acción siguiente, bloqueos, documentos, evidencia, costos, timeline | cockpit endpoint y componentes existentes | datos reales, bloqueo, permiso, empty |
| `/work-requests` | gestionar solicitudes; operación/cliente | canal, prioridad, SLA, estado, conversión | WorkRequest queries/table | create/list/offline/ownership |
| `/site-visits` | programar y cerrar visita; campo | agenda, técnico, hallazgos, mediciones, fotos, recomendación | SiteVisit form/detail | offline draft/sync/error |
| `/proposals` | oferta/versiones; comercial | alcance, costos, impuestos, margen, condiciones, aprobación | proposal list/form | draft→sent→approved/rejected |
| `/purchase-orders` | formalizar autorización; administración | PO, archivo, monto, propuesta, validación | purchase order detail/form | mismatch, duplicate, forbidden |
| `/planning-packets` / `/planning` | preparar salida; residente/HES | kits, personal, vehículos, herramientas, EPP, AST, readiness | planning detail + readiness | bloqueo crítico/offline/read-only |
| `/execution-sessions` / `/execution` | operar en campo; técnico/supervisor | iniciar/pausar/finalizar, checklist, evidencia, novedad, sync | execution tracker + offline queue | replay idempotente, red intermitente |
| `/evidences` | capturar/revisar; campo/revisor | fase, metadatos, revisión, rechazo, reemplazo, lock | Evidence + FileAsset gallery | upload offline, reject/replace/lock |
| `/reports` | generar informe; técnico/residente | plantilla, datos heredados, evidencia válida, preview/versiones | report generator | falta evidencia, PDF, aprobación |
| `/delivery-records` | emitir acta; administrativo/cliente | contenido, preview, firma, aceptación, historial | delivery/signature components | unsigned/signed/immutable |
| `/service-entry-sheets` / `/billing/ses` | seguimiento SES; administrativo | número, soporte, envío, aprobación/rechazo | SES pages | gate por acta, duplicate, retry |
| `/invoices` / `/billing/invoices` | seguimiento factura; administrativo | factura, soportes, aging, aprobación | Invoice pages | gate por SES, overdue, reject |
| `/payments` | conciliación y cierre; administración | monto, fecha, comprobante, estado, cierre | Payment pages | partial/failed/completed |
| `/fleet` | readiness vehicular; logística | foto, documentos, vencimientos, asignación, mantenimiento | VehicleCard/detail/FileAsset | expiring/blocked/no-photo |
| `/tools` / `/resources` | disponibilidad herramienta; logística | foto, ficha/manual, certificado/calibración, checkout, checklist | Resource/Tool views | conflicto de modelo, blocked/empty |
| `/assets` | activos generales; logística | inventario, estado, mantenimiento, archivos | asset list/detail | available/maintenance/retired |
| `/checklists` | plantillas/ejecuciones; HES/campo | versión, ítems bloqueantes, foto, comentario, firma | checklist panel/control | fail blocks closure, offline submit |
| `/costs` | control ERP operativo; gerencia/admin | catálogo, estimado/real, consumo, margen, alertas, export | cost portfolio/order views | threshold 80%, overrun, empty |
| `/notifications` | bandeja accionable; autenticados | severidad, origen, acción, leído | notification list/outbox status | delivery failure/retry |
| `/users` / `/admin/users` | usuarios y estado; administradores | identidad, rol, estado, sesiones, privacidad | user table/form | duplicate/forbidden/deactivate |
| `/settings/roles` | gobernar permisos; administradores | matriz role-permission y cambios auditados | debe consumir dominio; ruta exacta por confirmar | negative permission regression |
| `/portal` | autoservicio cliente | propias órdenes/propuestas/informes/facturas | portal ownership queries | cross-client denial, empty |
| `/privacy` / `/profile/privacy` | informar y ejercer derechos | política, consentimientos, consulta/solicitud | privacy request flow | authenticated/public distinction |

## Campos nuevos

Los campos candidatos por página se definen en `data-field-expansion-plan.md`. No deben añadirse a UI antes del contrato y del backend correspondientes.

