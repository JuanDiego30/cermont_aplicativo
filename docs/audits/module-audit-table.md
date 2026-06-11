# Auditoria Fase 0 - matriz de modulos CERMONT

Fecha de revision: 2026-06-03.

Alcance: revision documental y tecnica antes de modificar codigo. Se cruzaron los documentos canonicos (`docs/README.md`, `docs/product/CERMONT_PRODUCT_BLUEPRINT.md`, `docs/domain/CERMONT_BUSINESS_FLOW_MAP.md`, `docs/architecture/CERMONT_ARCHITECTURE_BLUEPRINT.md`, `docs/architecture/FRONTEND_ROUTE_MAP.md`, `docs/architecture/API_ENDPOINT_MATRIX.md`, `docs/agents/AGENT_IMPLEMENTATION_PLAYBOOK.md`, `docs/REGLAS_DESARROLLO_CERMONT.md`), el plan `.sisyphus/plans/cermont-refactorizacion-15-fases.md`, los documentos academicos en `docs/pdf/` y el inventario real de `backend/`, `frontend/` y `packages/`.

## Resumen verificable

| Elemento | Evidencia encontrada |
| --- | --- |
| Workspaces npm | `backend`, `frontend`, `packages/shared-types`, `packages/domain`, `packages/config` |
| Modulos backend | 36 directorios en `backend/src/modules` |
| Modelos Mongoose | 38 archivos de modelo en `backend/src/models` sin contar `index.ts` |
| Schemas Zod compartidos | 70 archivos en `packages/shared-types/src/schemas` sin contar `index.ts` |
| Modulos frontend | 30 directorios en `frontend/src/modules` |
| Pruebas backend | 46 archivos bajo `backend/tests` |
| Pruebas frontend | 63 archivos bajo `frontend/tests` |
| Documento canonico faltante | `docs/plans/CERMONT_REBUILD_ROADMAP.md` no existe; el plan activo disponible es `.sisyphus/plans/cermont-refactorizacion-15-fases.md` |

## Criterio de clasificacion

- **Implementada:** existe cadena verificable de contrato, modelo/servicio/ruta o integracion equivalente, pagina/hook cuando aplica y pruebas asociadas.
- **Parcial:** existe parte importante de la cadena, pero faltan campos de dominio, servicio propio, pruebas, roles reales, reglas de negocio o integracion completa.
- **Mock:** el modulo declara comportamiento simulado o rule-based que no debe presentarse como automatizacion real.
- **Legacy:** modulo historico o paralelo que convive con otro modulo canonico y requiere depuracion antes de declarar alcance.
- **Propuesta:** no hay evidencia suficiente de implementacion funcional.
- **Rota:** hay evidencia de fallo funcional directo. En esta auditoria no se marco ningun modulo como roto sin ejecutar pruebas completas.

## Tabla de auditoria por modulo

| Modulo | Estado actual | Problema | Riesgo | Accion |
| --- | --- | --- | --- | --- |
| `ai` | Mock | `backend/src/modules/ai/ai.service.ts` se describe como mock o procesamiento simple por reglas. | Presentarlo como IA real o automatizacion avanzada seria indefendible. | Mantener como asistente experimental o marcar fuera de alcance hasta implementar servicio real. |
| `analytics` | Parcial | Hay rutas/controladores/servicios, pero no se verificaron pruebas directas ni metricas medidas. | El libro podria afirmar KPIs o mejoras sin evidencia. | Limitar a visualizacion/consulta de datos; marcar metricas de impacto como pendiente por anexar evidencia. |
| `asset` | Parcial | Modelo y schema existen, pero CCTV queda en `specifications/metadata`, no como contrato verificable de mantenimiento CCTV. No se encontraron pruebas especificas. | Formularios CCTV quedan genericos y dificiles de validar. | Crear contrato especifico o sub-schema CCTV antes de tocar UI. |
| `audit` | Parcial | Modelo/servicio/ruta existen, pero no se comprobo auditoria en todas las mutaciones criticas. | Trazabilidad incompleta ante jurado o auditoria interna. | Mapear eventos obligatorios y agregar pruebas por transicion. |
| `auth` | Implementada | Autenticacion JWT, rutas y pruebas estan presentes. | Requiere conservar reglas de seguridad sin migrar a NextAuth. | Mantener; solo ajustar si los 10 roles reales cambian payloads o permisos. |
| `checklist` | Parcial | Modulo y pruebas existen, pero no representa por si solo los formularios reales versionados. | Confundir checklist simple con motor documental completo. | Integrarlo al motor de formularios dinamicos y formatos reales. |
| `cost` | Parcial | Existe modelo de costos con estimado, real, impuesto y variacion; falta catalogo, baseline congelado por propuesta, desviaciones aprobables y evidencia obligatoria por costo. | Declarar control de costos real completo sin baseline formal. | Completar `CostEstimate`, `ActualCost`, `CostDeviation` y pruebas de comparacion. |
| `dashboard` | Parcial | Servicio y pagina existen; las metricas no deben presentarse como impacto medido. | Afirmaciones de reduccion de tiempos o productividad sin evidencia. | Mantener como panel operativo; separar KPIs descriptivos de indicadores validados. |
| `delivery-record` | Parcial | Rutas existen, pero delegan en `order/administrative-workflow.controller.ts`; no hay controller/service propio en el modulo. | Acoplamiento alto y dificultad para probar reglas especificas del acta. | Extraer servicio/controller propios o documentar explicitamente la integracion centralizada. |
| `documents` | Parcial | Existen ingestion, import, template y document routes; el pipeline document-driven no esta completo como motor de formularios versionados con generacion final. | Sobreprometer ingestion, OCR o plantillas automaticas. | Reforzar templates/submissions y mantener revision humana obligatoria. |
| `evidence` | Parcial | Modelo V1/V2 robusto con fases, categorias, GPS, sync e idempotencia; falta verificar relacion obligatoria con paso y pruebas de verificacion/rechazo completas. | Evidencias sin trazabilidad suficiente por paso. | Hacer obligatorio `workOrderId`/`serviceCaseId`/paso segun tipo y probar upload/verify. |
| `execution-session` | Parcial | Modulo, rutas, servicio, pruebas y frontend existen; falta comprobar bloqueo completo sin planeacion aprobada y formularios dinamicos reales. | Iniciar/cerrar ejecucion sin todos los requisitos documentales. | Reforzar reglas de inicio/cierre y pruebas de bloqueo. |
| `files` | Parcial | Hay subida/serving y pruebas, con deuda declarada de antivirus/ClamAV como TODO. | Riesgo de seguridad en adjuntos si se declara control completo. | Mantener allowlist y magic bytes; documentar ClamAV como pendiente. |
| `inspection` | Parcial | Modelo y schema son genericos (`pulidora`, `arnes`, `electrico`, etc.); no modelan lineas de vida verticales con C/NC, hallazgos y acciones correctivas. | El formato real de lineas de vida no queda representado. | Crear contrato de inspeccion de lineas de vida o template dinamico versionado. |
| `invoice` | Parcial | Rutas existen, pero delegan en `administrative-workflow`; no hay service/controller propio del modulo. | Regla factura-SES queda centralizada y puede ser dificil de mantener/probar por modulo. | Extraer servicio propio o robustecer pruebas de cadena SES -> factura. |
| `kit` | Parcial | Kits existen y son utiles para planeacion; el frontend contiene deuda de tipos (`as any`) en formularios de kits. | Validaciones debiles en UI y riesgo de duplicar contratos. | Corregir typing de formularios despues de reforzar contratos. |
| `maintenance` | Parcial | Modulo existe, pero no es el nucleo del flujo de 14 pasos; usa tipos genericos en servicios. | Desviar el proyecto hacia CMMS generico. | Mantener como soporte, no como eje del trabajo de grado. |
| `notifications` | Parcial | Ruta registrada; pendiente por verificar en repositorio la profundidad de servicio/controlador y pruebas. | Alertas declaradas sin respaldo operativo. | Auditar y probar antes de incluir en alcance implementado. |
| `observability` | Implementada | Hay modulo y health/metrics registrados. | Bajo, si se limita a monitoreo tecnico. | Mantener como soporte tecnico. |
| `order` | Implementada | Modulo amplio con CRUD, estado, cierre, workflow administrativo y multiples pruebas. | Parte del cierre esta concentrada en `order`, lo que puede ocultar responsabilidades de SES/factura/pago. | Conservar como nucleo; separar reglas por modulo cuando se refactorice. |
| `payment` | Parcial | Ruta existe y delega a `administrative-workflow`; hay pruebas, pero no service/controller propio. | Pagos pueden quedar como registro administrativo, no modulo financiero completo. | Reforzar servicio propio, conciliacion y evidencia de soporte. |
| `planning-packet` | Parcial | Existe modelo/contrato/servicio/ruta/frontend; faltan campos explicitos del formato real de planeacion de obra. No se encontraron pruebas especificas. | Planeacion vuelve a ser generica y no resuelve la falla principal. | Prioridad alta: completar modelo y contrato antes de UI. |
| `proposal` | Implementada | Modelo, schema, servicio, rutas, frontend y pruebas existen. | Falta conectar baseline de costos congelado al aprobar propuesta. | Reforzar integracion con costos antes de declarar control economico completo. |
| `purchase-order` | Implementada | Modelo, schema, servicio, rutas, frontend y pruebas existen. | Puede requerir homologacion con PO de cliente y soportes documentales. | Mantener y conectar formalmente a creacion de orden. |
| `report` | Legacy | Existe `report` junto con `technical-report`; `Report.ts`/`WorkReport.ts` pueden representar capa historica. | Duplicidad conceptual entre informe tecnico y reportes legacy. | Depurar responsabilidad: `technical-report` debe ser canonico para paso 8. |
| `resource` | Parcial | Recurso generico existe, pero sin pruebas detectadas y con estructuras genericas. | Materiales/herramientas/equipos pueden quedar demasiado genericos. | Integrar con kits, herramientas, equipos y planeacion mediante contratos especificos. |
| `service-cases` | Parcial | Cockpit/workflow existen; el estado y bloqueadores deben alinearse con los 14 pasos y formatos reales. | Avances de estado pueden no bloquear todos los documentos requeridos. | Reforzar maquina de estados, requisitos y pruebas de transicion. |
| `service-entry-sheet` | Parcial | Rutas/alias `/api/ses` existen, pero delegan en workflow administrativo. | Se puede confundir registro/seguimiento SES con integracion real a Ariba. | Mantener como seguimiento SES; no afirmar automatizacion Ariba. |
| `site-visit` | Implementada | Modelo, schema, servicio, rutas, frontend y prueba existen. | Debe soportar evidencias/mediciones segun visita real. | Revisar campos de visita frente a formatos de campo. |
| `sync` | Parcial | Existe modulo backend y frontend offline relacionado. | Offline completo puede estar parcialmente implementado y requiere prueba E2E real. | Marcar offline como parcial hasta ejecutar pruebas de sync y conflicto. |
| `technical-report` | Parcial | Ruta existe, pero delega en `administrative-workflow`; no hay service/controller propio. | Informe tecnico queda acoplado al workflow de orden. | Extraer modulo canonico o documentar centralizacion y ampliar pruebas. |
| `template-draft` | Parcial | Existe flujo de borradores de plantillas. | No equivale aun a motor completo de formularios dinamicos. | Conectar a `DocumentTemplate` y `TemplateResponse` con versionamiento. |
| `template-response` | Parcial | Existe modelo/schema/servicio/ruta, sin pruebas detectadas. | Respuestas de formularios pueden quedar sin validacion dinamica suficiente. | Probar validacion contra template versionado. |
| `tool` | Parcial | Herramientas existen, pero con documentos/certificaciones/evidenceRequirements genericos. | Kits tipicos pueden no garantizar disponibilidad/certificaciones. | Tipar relaciones y conectar a planeacion. |
| `user` | Parcial | Gestion de usuarios existe, pero el dominio solo tiene 8 roles canonicos actuales. | No representa la jerarquia real de CERMONT: coordinador administrativo, auxiliar contable, auxiliar HES, supervisor electricista, tecnico electricista, oficial de construccion y pasante. | Expandir o mapear roles antes de tocar permisos de UI. |
| `work-requests` | Implementada | Modelo, schema, servicio, ruta, frontend y pruebas existen. | Debe conservarse como paso 1 y no degradarse a solicitud generica sin trazabilidad. | Mantener; reforzar evidencias iniciales si aplica. |

## Hallazgos transversales

| Codigo | Hallazgo | Evidencia | Accion requerida | Prioridad |
| --- | --- | --- | --- | --- |
| F0-01 | El roadmap canonico citado en `docs/README.md` no existe en la ruta indicada. | `Test-Path docs/plans/CERMONT_REBUILD_ROADMAP.md` devuelve falso. | Actualizar indice o crear roadmap canonico. | Alta |
| F0-02 | Roles reales de la empresa no coinciden con los 8 roles actuales de `@cermont/domain`. | `packages/domain/src/roles.ts`. | Definir 10 roles o mapeo formal sin hardcodear. | Alta |
| F0-03 | Planeacion no representa el formato real de obra. | `backend/src/models/PlanningPacket.ts`, `planning-packet.schema.ts`, PDF de planeacion. | Completar modelo y contrato antes de frontend. | Alta |
| F0-04 | Cierre administrativo existe, pero tecnico/informe/acta/SES/factura/pago estan concentrados en `administrative-workflow`. | Rutas de `technical-report`, `delivery-record`, `service-entry-sheet`, `invoice`, `payment`. | Separar servicios o justificar integracion centralizada. | Media |
| F0-05 | Hay deuda de tipos estrictos. | Busqueda `rg` encontro `unknown` y `as any` en varios puntos, incluyendo formularios de kits/recursos. | Corregir por vertical slice cuando se refuercen contratos. | Alta |
| F0-06 | Existe modulo AI mock/rule-based. | `backend/src/modules/ai/ai.service.ts`. | No incluir como resultado implementado principal. | Media |
| F0-07 | Documentacion academica historica contiene afirmaciones de validacion con usuarios y metricas no verificadas. | `docs/pdf/ATG JUAN DIEGO AREVALO-1.md`. | Marcar como pendiente por anexar evidencia o retirar afirmaciones. | Alta |
| F0-08 | Documentacion historica menciona Laravel/MySQL/PostgreSQL, contradictorio con Express/MongoDB actual. | `docs/pdf/ATG JUAN DIEGO AREVALO-1.md`. | Actualizar libro y docs a stack real. | Alta |

## Candado antes de implementar

No se debe iniciar frontend ni refactor funcional hasta resolver la cadena por modulo:

`DB -> Model -> Shared Contract -> Backend Service -> Controller -> Route -> API Client -> Hook -> Page -> Test`.

Los modulos marcados como parciales no deben describirse como implementados completos en el libro ni en la sustentacion.
