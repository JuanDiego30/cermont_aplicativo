# Referencias FSM/CMMS para Kits operativos

Fecha de investigacion: 2026-06-10

## Objetivo

Identificar patrones aplicables al modulo Kits de Cermont sin convertir la
plataforma en un CMMS generico ni copiar interfaces de terceros.

## Plataformas revisadas

### Odoo Field Service

Odoo separa el catalogo reusable de productos de la tarea de campo y permite
asociar plantillas de worksheet a las tareas. El usuario selecciona productos
desde un catalogo y ajusta cantidades en la tarea.

Patron aplicable: catalogo reusable + snapshot editable en la planeacion.

Fuentes:

- https://www.odoo.com/documentation/19.0/applications/services/field_service/product_management.html
- https://www.odoo.com/documentation/19.0/applications/services/field_service/worksheets.html

### ERPNext

ERPNext separa la programacion, la visita y el log de ejecucion. Los datos de
una orden pueden originar una visita o un programa, y el log conserva el
resultado historico.

Patron aplicable: separar plantilla, aplicacion y evidencia historica.

Fuentes:

- https://docs.frappe.io/erpnext/maintenance-visit
- https://docs.frappe.io/erpnext/asset-maintenance
- https://docs.frappe.io/erpnext/asset-maintenance-log

### Fracttal

Fracttal clasifica activos en ubicaciones, equipos, herramientas, repuestos,
suministros y activos digitales. Los planes de tareas se administran aparte de
los activos concretos.

Patron aplicable: el kit declara requisitos y referencias; los datos reales de
estado, serial, certificado y disponibilidad pertenecen al activo.

Fuentes:

- https://help.fracttal.com/hc/en-us/articles/25013544567693-How-to-create-an-asset-in-Fracttal-One
- https://help.fracttal.com/hc/en-us/articles/25222727003533-How-to-add-a-maintenance-task-plan

### UpKeep

UpKeep usa plantillas de orden reutilizables con titulo, descripcion,
asignaciones, activos, tareas y partes. Tambien ofrece sets de partes con
cantidades y checklists reutilizables.

Patron aplicable: presets configurables, duplicacion de plantillas y conjuntos
de recursos con cantidades, sin hardcodear sectores en el servicio.

Fuentes:

- https://help.onupkeep.com/en/articles/11833676-how-to-use-work-order-templates
- https://help.onupkeep.com/en/articles/4661729-how-to-create-use-a-set-of-parts
- https://help.onupkeep.com/en/articles/1746937-how-to-create-and-add-checklist-templates

### Fiix

Fiix agrupa tareas reutilizables y controla por separado permisos para tareas,
partes, archivos, activos y usuarios de una orden.

Patron aplicable: RBAC por operacion y composicion de kits con tareas, partes,
archivos y responsables.

Fuentes:

- https://helpdesk.fiixsoftware.com/hc/en-us/articles/40598772915988-Work-orders-permissions
- https://helpdesk.fiixsoftware.com/hc/en-us/articles/46454204165012-Assign-a-maintenance-type-to-a-task-group

### Jobber

Jobber mantiene un catalogo de productos y servicios con valores por defecto y
checklists configurables que se adjuntan a trabajos o evaluaciones.

Patron aplicable: separar catalogo economico, checklist y trabajo concreto,
pero permitir que un kit los referencie.

Fuentes:

- https://help.getjobber.com/hc/en-us/articles/115009735848-Products-Services-List
- https://help.getjobber.com/hc/en-us/articles/115009740048-Checklists

### SAP Field Service / Asset Manager

SAP utiliza templates de formularios y checklists obligatorios asociados a
ordenes, operaciones o equipos. Los adjuntos pueden capturarse localmente y
sincronizarse, y los reportes resumen partes, duracion y checklists ejecutados.

Patron aplicable: documentos requeridos como blockers, captura offline y
snapshot trazable de lo ejecutado.

Fuentes:

- https://help.sap.com/docs/service-asset-manager/sap-service-and-asset-manager-application-product-overview/sap-service-and-asset-manager-features-and-personas-matrix
- https://help.sap.com/docs/SAP_FIELD_SERVICE_MANAGEMENT/field-service-management-output/field-service-management-output.html

## Patrones que aplican ahora

1. Plantilla versionada separada del snapshot aplicado.
2. Un solo catalogo de requisitos con agrupaciones derivadas.
3. Presets configurables y publicables por tipo de servicio.
4. Recursos con cantidad, unidad, criticidad y requisito documental.
5. Documentos/checklists requeridos integrados al readiness.
6. RBAC por operacion: consultar, crear, publicar, aplicar, archivar y anular.
7. Aplicacion idempotente y auditable a planeacion.
8. Archivos protegidos mediante el servicio documental existente.
9. Soporte offline para el snapshot y su estado de sincronizacion.

## Patrones que no aplican todavia

- Inventario avanzado con reservas y movimientos de almacen.
- Mantenimiento predictivo o recomendaciones generadas por IA.
- Programacion automatica de tecnicos y rutas.
- Costeo contable o compras automaticas.
- Jerarquia completa de activos tipo ERP/CMMS.

## Evolucion futura

1. Resolver disponibilidad real contra inventario y activos.
2. Validar certificados y calibraciones de recursos asignados.
3. Recomendar kits con historico de trabajos aprobados.
4. Comparar kit planeado contra recursos consumidos.
5. Incorporar metricas de eficacia, faltantes y desviacion de costos.

