Resumen del proyecto

El flujo ideal arranca con la solicitud del cliente y sigue visitas iniciales, propuesta económica, PO y planificación detallada (cronograma, mano de obra, herramientas/equipos, ASTs, documentación de apoyo) antes de ejecutar la actividad, registrar evidencias y generar informes, actas, SES, factura y pago.
Las fallas actuales están en planeación (falta un listado típico de equipos/herramientas), ejecución (olvidos, herramientas incompletas), informes/registros atrasados y facturación lenta; además no se cuenta con un control de costos reales vs estimados.
La solución propuesta es un aplicativo web que centraliza órdenes de trabajo, incluye módulos de planeación con kits típicos, checklists digitales, evidencias fotográficas, informes automáticos, dashboard de KPIs, trazabilidad de actas/SES/facturas y costeo en tiempo real, con modo online/offline y gestión documental/archivos históricos.
Qué tenemos y qué falta

El backend ya expone endpoints de auth, dashboard, órdenes, kits, evidencias y workplans; las llamadas del frontend ahora apuntan correctamente a /api a través del proxy, así que el login y el dashboard básico generan datos reales.
Lo que falta en el frontend es reflejar los módulos clave del anteproyecto: gestión de kits típicos/recursos mencionados en la planeación, checklists digitales con offline syncing, registro y aprobación de actas/SES/facturas, portal de archivos históricos, costeo en tiempo real y reportes en PDF. También hay que ampliar la capa de administración (roles/RBAC) y la capacidad de descarga/archivado mensual mencionada como necesidad crítica.
Próximos pasos propuestos

Inventariar qué endpoints adicionales del backend ya existen (kits, workplans, evidencias, reports) y qué datos exactos podemos mostrar en cada módulo del frontend para cubrir los objetivos del documento.
Priorizar módulos de frontend que todavía no consumen datos reales (kits, orders list, checklists, reportes, archivos históricos) y esquematizar las pantallas/UX necesarios para los flujos descritos.
Coordinar con vos el diseño visual que estás afinando para integrar esos módulos sin tocar el login, y luego implementar los hooks/API calls faltantes para que el valor del backend se vea reflejado en cada sección.
¿Te parece bien si documento los endpoints disponibles versus los que faltan y luego te propongo una lista concreta de componentes pendientes?

Además, tomaré nota del esquema de roles/RBAC y del flujo completo con cliente, ingeniero residente y demás stakeholders que aparece en la imagen adjunta para asegurarme de que el backend apoya esos niveles de permiso. Vos podés seguir afinando la estética mientras yo voy acomodando la funcionalidad para que los módulos de planeación, ejecución, evidencias, facturación y administración reflejen la propuesta de valor. Mantendré este archivo actualizado con cada avance para que lo tengas siempre como referencia.

## Inventario de endpoints y permisos

Esta API expone rutas agrupadas por módulo y protegidas mediante el middleware `authenticate` y los permisos definidos en `PERMISSIONS`. A continuación se listan las operaciones públicas e internas que ya podemos consumir desde el frontend:

### Autenticación
- `POST /api/auth/login`: genera access/refresh tokens con validación de credenciales.
- `POST /api/auth/logout`: invalida la sesión actual (requiere token válido).
- `POST /api/auth/refresh`: emite un nuevo access token usando un refresh token válido.
- `GET /api/auth/profile`: recupera los datos del usuario autenticado.
- `POST /api/auth/logout-all`: cierra todas las sesiones activas del usuario.

### Órdenes de trabajo
- `POST /api/orders` (`PERMISSIONS.ORDERS_CREATE`): crear una orden nueva con plan inicial y recursos asociados.
- `GET /api/orders` (`PERMISSIONS.ORDERS_VIEW`): listados filtrables y paginados.
- `GET /api/orders/stats` (`PERMISSIONS.DASHBOARD_VIEW_STATS`): métricas clave para el dashboard.
- `GET /api/orders/:id` (`PERMISSIONS.ORDERS_VIEW`): detalles completos de la orden.
- `PATCH /api/orders/:id/state` (`PERMISSIONS.ORDERS_TRANSITION`): transición de estados.
- `PATCH /api/orders/:id/assign` (`PERMISSIONS.ORDERS_ASSIGN`): asignar técnicos y supervisores.
- `PATCH /api/orders/:id/archive` (`PERMISSIONS.ORDERS_ARCHIVE`): mover orden a histórico.
- `PATCH /api/orders/:id` (`PERMISSIONS.ORDERS_UPDATE`): actualizar campos generales.

### Planes de trabajo (Workplans)
- `POST /api/workplans` (`PERMISSIONS.WORKPLANS_CREATE`): crear el plan asociado a una orden.
- `GET /api/workplans/:id` (`PERMISSIONS.WORKPLANS_VIEW`): ver materiales, mano de obra y cronograma.
- `PATCH /api/workplans/:id` (`PERMISSIONS.WORKPLANS_UPDATE`): ajustar presupuestos o tareas.
- `POST /api/workplans/:id/approve` (`PERMISSIONS.WORKPLANS_APPROVE`): firmar y aprobar el plan.
- `POST /api/workplans/:id/reject` (`PERMISSIONS.WORKPLANS_APPROVE`): devolver plan para correcciones.
- (Pendiente) `GET /api/workplans/:id/pdf`: ya existe el controller pero la ruta está comentada; útil para la exportación de cronogramas.

### Kits y recursos típicos
- `GET /api/kits` (`PERMISSIONS.READ_KITS`): inventario con filtros y paginación.
- `GET /api/kits/stats` (`PERMISSIONS.READ_KITS`): insights de uso por categoría.
- `GET /api/kits/category/:category` (`PERMISSIONS.READ_KITS`): kits organizados por familia.
- `GET /api/kits/:id` (`PERMISSIONS.READ_KITS`): contenido detallado.
- `POST /api/kits` (`PERMISSIONS.WRITE_KITS`): crear nuevos kits.
- `PUT /api/kits/:id` (`PERMISSIONS.WRITE_KITS`): actualizar recursos o cantidades.
- `DELETE /api/kits/:id` (`PERMISSIONS.DELETE_KITS`): baja suave de kits obsoletos.
- `POST /api/kits/:id/duplicate` (`PERMISSIONS.WRITE_KITS`): clonar kits recurrentes.

### Evidencias y checklists digitales
- `POST /api/evidences` (`PERMISSIONS.ORDERS_UPDATE`): subir fotos y metadata (activo/offline).
- `POST /api/evidences/:id/approve` (`PERMISSIONS.WORKPLANS_APPROVE`): validar evidencia.
- `POST /api/evidences/:id/reject` (`PERMISSIONS.WORKPLANS_APPROVE`): marcar como incompleta.
- `GET /api/evidences/order/:orderId` (`PERMISSIONS.ORDERS_VIEW`): historial fotográfico por orden.
- `DELETE /api/evidences/:id` (`PERMISSIONS.WORKPLANS_APPROVE`): eliminar registros errados.
- `POST /api/evidences/sync` (`PERMISSIONS.ORDERS_UPDATE`): sincroniza lotes offline enviados desde el campo.

### Reportes / actas / SES / facturación
- `GET /api/reports/activity/:orderId` (`PERMISSIONS.ORDERS_VIEW`): resumen de actividades ejecutadas.
- `POST /api/reports/acta-entrega/:orderId` (`PERMISSIONS.WORKPLANS_APPROVE`): genera acta de entrega en PDF.
- `POST /api/reports/ses/:orderId` (`PERMISSIONS.ORDERS_VIEW`): genera certificado de servicios ejecutados.
- `GET /api/reports/costs/:workPlanId` (`PERMISSIONS.WORKPLANS_VIEW`): informe comparativo costos estimados vs reales.
- `GET /api/reports/dashboard` (`PERMISSIONS.DASHBOARD_VIEW_STATS`): exportación resumida de KPIs.

### Dashboard y métricas
- `GET /api/dashboard/metrics` (`PERMISSIONS.DASHBOARD_VIEW_METRICS`): KPIs principales.
- `GET /api/dashboard/stats` (`PERMISSIONS.DASHBOARD_VIEW_STATS`): estadísticas agregadas.
- `GET /api/dashboard/orders/by-state/:state` (`PERMISSIONS.ORDERS_VIEW`): filtros por estado.
- `GET /api/dashboard/orders/active` (`PERMISSIONS.ORDERS_VIEW`): órdenes en ejecución.
- `GET /api/dashboard/work-plans/pending` (`PERMISSIONS.WORKPLANS_VIEW`): pendientes de aprobación.
- `GET /api/dashboard/my-stats` (`PERMISSIONS.DASHBOARD_VIEW`): indicadores por usuario.
- `GET /api/dashboard/recent-activity` (`PERMISSIONS.DASHBOARD_VIEW`): actividad reciente.
- `POST /api/dashboard/cache/clear` (`PERMISSIONS.DASHBOARD_CLEAR_CACHE`): refrescar métricas en memoria.

### Administración y usuarios
- `GET /api/users` (`PERMISSIONS.USERS_VIEW_ALL`): listado de usuarios con filtros.
- `GET /api/users/:id` (`PERMISSIONS.USERS_VIEW`): perfil detallado.
- `POST /api/users` (`PERMISSIONS.USERS_CREATE`): creación de cuentas.
- `PUT /api/users/:id` (`PERMISSIONS.USERS_UPDATE`): actualización de datos.
- `POST /api/users/:id/change-password` (`PERMISSIONS.USERS_CHANGE_PASSWORD`).
- `POST /api/users/:id/activate` / `deactivate` (`PERMISSIONS.USERS_ACTIVATE`/`USERS_DEACTIVATE`).
- `POST /api/users/:id/lock` / `unlock` (`PERMISSIONS.USERS_LOCK`/`USERS_UNLOCK`).
- `DELETE /api/users/:id` (`PERMISSIONS.USERS_DELETE`): solo accounts Root.

### Operaciones de jobs y mantenimiento
- `GET /api/jobs/status` (`PERMISSIONS.ADMIN_FULL_ACCESS`): estado de los jobs programados.
- `POST /api/jobs/:jobName/run` (`PERMISSIONS.ADMIN_FULL_ACCESS`): disparar manualmente un job (archivar, limpiar tokens, etc.).

Con esta base podemos trazar qué módulos front aún no consumen datos reales (kits, checklists, reportes, archivado, costeo) y sincronizarlos con cada ruta mencionada. La documentación seguirá creciendo conforme se agreguen nuevas rutas o se descubran permisos adicionales.