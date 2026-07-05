# Professional Software Benchmark - CERMONT

**Spec:** `003-profesionalizacion-cermont`  
**Fecha:** 2026-06-24  
**Regla:** patrones profesionales sin copia de codigo.

## Referentes revisados

| Familia | Referentes | Patrones utiles para CERMONT |
|---|---|---|
| FSM | Odoo Field Service, OCA Field Service | Ordenes de campo con agenda, tecnico, ubicacion, partes, portal, worksheets y facturacion conectada |
| ERP mantenimiento | ERPNext | Maintenance schedules, visits/logs, serial, responsable, estado, next due date |
| CMMS/GMAO | Atlas CMMS, openMAINT/CMDBuild | Work orders, preventive maintenance, assets, facilities, checklists, mobile, reports, workflows, dashboards |
| ITSM/asset | GLPI, Snipe-IT | Solicitudes/tickets, SLA, catalogo, activos, tags, checkin/checkout, responsables, historial y auditoria |
| Seguridad | OWASP ASVS | Matriz de controles verificables para auth, sesiones, acceso, validacion, archivos, logs y datos |
| Legal Colombia | Ley 1581, RNBD SIC | Consentimiento, finalidad, derechos del titular, politicas, procedimientos, seguridad y verificacion RNBD |
| Derecho de autor | DNDA registro software | Soportes de registro, autores, obra por encargo, cesiones, manuales y descripcion del programa |

## Fuentes

- Odoo Field Service: https://www.odoo.com/documentation/19.0/applications/services/field_service.html
- Odoo Worksheets: https://www.odoo.com/documentation/19.0/applications/services/field_service/worksheets.html
- OCA Field Service: https://github.com/OCA/field-service
- ERPNext Maintenance Schedule: https://docs.frappe.io/erpnext/maintenance-schedule
- ERPNext Asset Maintenance Log: https://docs.frappe.io/erpnext/asset-maintenance-log
- Atlas CMMS: https://atlas-cmms.com/
- openMAINT: https://www.openmaint.org/en/home
- CMDBuild: https://www.cmdbuild.org/en/homepage
- GLPI: https://www.glpi-project.org/en/
- GLPI SLA: https://help.glpi-project.org/tutorials/helpdesk/service_levels
- GLPI Service Catalog: https://help.glpi-project.org/documentation/modules/assistance/service-catalog
- Snipe-IT docs: https://grokability-snipe-it-26.mintlify.app/
- Snipe-IT features: https://snipeitapp.com/product
- Snipe-IT custom fields: https://snipe-it.readme.io/docs/custom-fields
- Snipe-IT asset models: https://snipe-it.readme.io/docs/asset-models
- OWASP ASVS: https://owasp.org/www-project-application-security-verification-standard/
- Ley 1581 de 2012: https://www.funcionpublica.gov.co/eva/gestornormativo/norma.php?i=49981
- RNBD SIC: https://sedeelectronica.sic.gov.co/publicaciones/boletin-juridico/concepto/cuales-personas-estan-obligadas-realizar-el-registro-de-bases-de-datos-personales-en-el-rnbd
- DNDA registro de software: https://www.derechodeautor.gov.co/es/atencion-y-servicios-a-la-ciudadania/registro-de-obras/registro-de-software/registro-de-software

## Decision de producto

CERMONT debe usar estos referentes para subir madurez en trazabilidad, seguridad, privacidad, auditoria y operacion, pero conservar su diferenciador: plataforma documental multiservicio con flujo de 14 pasos, offline-first y cierre administrativo.

No se adopta codigo ni diseno de terceros.
