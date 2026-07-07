**Estado del Arte:**

Gestión Operativa y Documental

La gestión de procesos operativos y documentales para empresas de servicios técnicos, como CERMONT S.A.S., se apoya en un ecosistema de soluciones tecnológicas consolidadas. Estas plataformas buscan digitalizar y optimizar el ciclo de vida completo de un servicio.

El mercado actual se divide principalmente en tres categorías de software:

1. Software de Gestión de Servicios de Campo (FSM - Field Service Management): Soluciones especializadas para equipos móviles.
1. Sistemas de Gestión de Mantenimiento (GMAO/CMMS): Enfocados en la gestión de activos y mantenimiento.
1. Sistemas de Planificación de Recursos Empresariales (ERP): Soluciones integrales pero más complejas y costosas.

Ejemplos Comerciales

- **ServiceMax:** Plataforma FSM líder, muy robusta pero orientada a grandes corporaciones.
- **Jobber:** Solución popular para PYMES, fácil de usar, pero puede carecer de profundidad para flujos complejos.
- **SAP Field Service Management:** Potente pero rígido y costoso de adaptar.
- **Fracttal:** Software GMAO/FSM popular en Latinoamérica, centrado en mantenimiento.

Valor Diferencial del Aplicativo Propuesto:

El principal diferenciador es la integración precisa entre la operación en campo, el cierre administrativo y la gestión de datos a largo plazo. El aplicativo no solo optimiza el flujo diario, sino que también garantiza el rendimiento y la accesibilidad de la información histórica sin comprometer la velocidad del sistema.

**Acotaciones:**

Funcionalidades y Módulos

El aplicativo debe incluir como mínimo los siguientes módulos: Módulo 1: Ejecución en Campo con Modo Online/Offline

- Modo de Uso Híbrido (Online/Offline): La aplicación móvil funcionará de forma nativa en el dispositivo, permitiendo al técnico registrar toda la información del servicio (checklists, fotos, firmas) sin necesidad de una conexión a internet.
- Sincronización Automática: El aplicativo detectará automáticamente la disponibilidad de una conexión a internet y sincronizará en segundo plano toda la información recolectada con el servidor central, sin requerir intervención del usuario.

Módulo 2: Dashboard Informativo con Métricas

- Visualización: Un centro de control para supervisión que muestre el estado de cada orden de trabajo.
- Métricas de Gestión (KPIs): Presentará indicadores clave (tiempo promedio de ciclo, tasa de cumplimiento) que se actualizan a medida que la información de campo se sincroniza, permitiendo identificar cuellos de botella de forma proactiva.

Módulo 3: Administración

- Kits Típicos y Checklists Dinámicos: El administrador podrá pre-configurar plantillas (materiales, documentos, listas de verificación) para estandarizar la calidad y agilizar la planificación.
- Gestión de Usuarios y Roles (RBAC): El administrador tendrá control total para crear usuarios y asignar roles (Técnico, Supervisor, Administrativo) con permisos específicos, garantizando la seguridad y el acceso adecuado a la información.

Módulo 4: Mantenimiento y Respaldo de Datos (Nuevo)

Esta es una funcionalidad crítica para asegurar el rendimiento a largo plazo del VPS y cumplir con los requisitos de auditoría y consulta histórica.

- Archivado Automático Mensual: Para evitar la saturación de la base de datos principal, el sistema ejecutará un proceso automático al final de cada mes. Este proceso identificará todas las órdenes de trabajo completadas y facturadas con más de 30 días de antigüedad y las moverá desde la base de datos "operativa" a una base de datos "histórica".
- Optimización del Rendimiento del VPS: Esta separación asegura que la base de datos que soporta la operación diaria se mantenga ligera y rápida, garantizando que el aplicativo siempre sea ágil para los usuarios.
- Portal de Descarga de Históricos: El administrador tendrá acceso a una sección donde podrá consultar y descargar paquetes de datos históricos. Podrá seleccionar el mes y el año deseado y exportar toda la información de ese período (órdenes, informes, evidencias) en formatos estándar como CSV o un archivo comprimido (.zip) con los PDFs, facilitando auditorías, análisis de tendencias o requerimientos legales.
