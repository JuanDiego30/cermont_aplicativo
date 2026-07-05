# Prompt maestro — Mejorar KPIs e implementar el nuevo DESIGN.md en CERMONT

Actúa como un **Staff Product Designer + Senior Frontend Engineer + UX Engineer** especialista en dashboards SaaS, sistemas B2B, diseño de producto, design systems, Tailwind, React/Next.js, accesibilidad, visualización de KPIs y plataformas operativas.

Voy a trabajar sobre el aplicativo web de **CERMONT S.A.S.** y necesito que rediseñes e implementes el dashboard y las pantallas relacionadas usando como fuente de verdad el archivo `DESIGN.md` del proyecto.

## 1. CONTEXTO

La app es una plataforma operativa para la gestión de:

- órdenes de trabajo,
- mantenimientos,
- recursos,
- planeación,
- evidencias,
- ejecución de campo,
- informes,
- actas,
- SES,
- facturación,
- pagos,
- trazabilidad del flujo operativo de 14 pasos.

Tengo una referencia visual externa con una estética muy limpia, elegante y moderna: fondo blanco predominante, tarjetas con bordes suaves, iconos circulares, botones redondeados, jerarquía tipográfica clara y uso disciplinado del color.

También tengo un PDF con el dashboard actual. El contenido funcional base está bien encaminado, pero la interfaz está **aburrida, plana, poco jerárquica y con muy poco impacto visual**. Los KPIs no se sienten ejecutivos ni útiles, y el dashboard no cuenta una historia clara.

## 2. OBJETIVO PRINCIPAL

**Rediseñar e implementar el dashboard y el sistema visual usando estrictamente `DESIGN.md`, mejorando sobre todo los KPIs, la jerarquía visual, el flujo de 14 pasos y la experiencia general de UI/UX.**

No quiero una página promocional. Quiero un **dashboard operativo profesional**, inspirado en la limpieza visual de la referencia pero adaptado al dominio real de CERMONT.

## 3. INSTRUCCIONES OBLIGATORIAS

1. Lee primero el archivo `DESIGN.md` y úsalo como fuente de verdad.
2. No inventes una identidad visual nueva fuera de `DESIGN.md`.
3. Respeta el modo **light/dark**.
4. Usa como base fondos blancos o negros y aplica los colores CERMONT solo como acento en iconos, botones, bordes, badges, active states y microdetalles.
5. No hardcodees colores si ya pueden salir de tokens del tema.
6. No conviertas el dashboard en una landing page; adáptalo al contexto de producto B2B operativo.
7. Conserva la información funcional existente, pero reorganízala con mejor narrativa visual.
8. Si faltan componentes base, créalos de forma reutilizable.
9. No hagas un rediseño superficial: mejora estructura, componentes, jerarquía, empty states, charts, listas y KPIs.
10. Todo debe verse limpio, serio, premium y listo para producción.

## 4. PROBLEMAS ACTUALES A CORREGIR

Debes detectar y corregir al menos estos problemas:

- KPIs visualmente aburridos.
- Falta de jerarquía entre bloques.
- Cards demasiado planas y sin intención.
- Dashboard sin bloque hero/resumen ejecutivo.
- Flujo de 14 pasos poco atractivo visualmente.
- Gráficos sin suficiente presencia o contexto visual.
- Estados vacíos sin diseño convincente.
- Listas y tablas con poca UX.
- Falta de consistencia en iconos, spacing y títulos.
- Falta de narrativa de negocio: el dashboard no comunica estado general → detalle → acción.

## 5. QUÉ DEBE IMPLEMENTARSE

### A. Dashboard shell
Rediseña la página del dashboard con esta estructura general:

1. Header / breadcrumb / título.
2. Toolbar de filtros globales.
3. Hero de bienvenida / resumen ejecutivo.
4. Grid de KPIs principales.
5. Flujo operativo de 14 pasos.
6. Cadena documental / estado del pipeline.
7. Gráficos principales.
8. Órdenes recientes.
9. Actividad reciente.
10. Alertas / bloqueos / pendientes.
11. Empty states bien diseñados cuando no existan datos.

### B. Hero operativo
Crea un componente tipo `DashboardHero` que muestre:

- saludo,
- rol del usuario,
- resumen ejecutivo corto,
- 2 a 4 métricas destacadas,
- CTA o acción rápida.

Debe sentirse premium y dar contexto inmediato.

### C. KPI cards
Crea un componente `KpiCard` reutilizable con esta anatomía:

- icono en contenedor circular suave,
- label,
- valor grande,
- subtítulo,
- delta/tendencia opcional,
- badge o indicador opcional.

Los KPIs prioritarios son:

- Órdenes activas.
- Mantenimientos abiertos.
- Completados del mes.
- Ingresos/presupuesto del mes.
- Casos en ejecución.
- Bloqueados.
- Listos para facturar.
- Recursos en uso.

### D. Flujo de 14 pasos
Rediseña el bloque del flujo CERMONT para que se vea fuerte visualmente.

Debe tener:

- encabezado claro,
- tabs por etapa: Comercial / Operativo / Cierre / Financiero,
- cards por paso,
- contador por paso,
- descripción corta,
- badge o color semántico por etapa.

En móvil, usa carrusel o layout apilado usable.

### E. Cadena documental
Crea un bloque que muestre visualmente el avance documental:

- solicitud,
- visita,
- propuesta,
- aprobación,
- orden,
- planeación,
- ejecución,
- informe,
- acta,
- SES,
- factura,
- pago.

Debe ser más visual que una simple lista. Puede ser stepper, timeline o mini pipeline.

### F. Chart cards
Crea `ChartCard` reutilizable con:

- título,
- subtítulo,
- área de gráfico,
- leyenda,
- empty state elegante si no hay datos.

Usar para:

- tendencia mensual de órdenes creadas vs completadas,
- órdenes por estado,
- distribución de casos por etapa,
- recursos en uso o similar.

### G. Órdenes recientes / actividad reciente / alertas
Rediseña estas secciones con mejor UX:

- `RecentOrdersTable`
- `RecentActivityFeed`
- `AlertSummaryCard`
- `EmptyStateCard`

La actividad reciente debe sentirse como feed o timeline, no como texto plano.

## 6. DESIGN SYSTEM Y COMPONENTES

Implementa o mejora componentes reutilizables alineados a `DESIGN.md`:

- `SectionHeader`
- `StatusBadge`
- `MetricDelta`
- `FilterToolbar`
- `KpiCard`
- `KpiGrid`
- `DashboardHero`
- `FlowStepCard`
- `FlowStageTabs`
- `DocumentChainCard`
- `ChartCard`
- `EmptyStateCard`
- `RecentOrdersTable`
- `RecentActivityFeed`
- `AlertSummaryCard`

## 7. REGLAS VISUALES OBLIGATORIAS

1. Fondo base blanco en light y negro profundo en dark.
2. Tarjetas blancas o dark card con borde sutil.
3. Botón primario azul CERMONT.
4. Verde solo para éxito, sincronización o aprobación.
5. Iconos dentro de contenedores circulares suaves.
6. Radios consistentes: 12px–16px.
7. Sombras muy suaves.
8. Tipografía Inter.
9. Números KPI con gran protagonismo.
10. Uso mínimo y controlado de color.
11. Nada de saturación visual.
12. Nada de estilos inline innecesarios.

## 8. UX OBLIGATORIA

Debes garantizar:

- jerarquía visual fuerte,
- lectura rápida de KPIs,
- empty states elegantes,
- responsive real,
- accesibilidad,
- foco visible,
- no depender solo del color,
- skeletons o estados de loading,
- filtros claros,
- componentes reutilizables.

## 9. QUÉ QUIERO EN TU RESPUESTA

Quiero que trabajes por fases:

### Fase 1 — Auditoría visual
Analiza la pantalla actual y enumera:
- problemas de UI,
- problemas de UX,
- problemas de jerarquía,
- problemas de diseño de KPIs,
- oportunidades de mejora.

### Fase 2 — Propuesta de rediseño
Explica:
- nueva estructura del dashboard,
- componentes a crear o refactorizar,
- cómo cambia la jerarquía visual,
- cómo se implementa `DESIGN.md`.

### Fase 3 — Implementación
Entrega:
- archivos a modificar,
- componentes nuevos,
- estilos/tokens necesarios,
- código actualizado.

### Fase 4 — Validación
Verifica:
- light/dark,
- responsive,
- consistencia visual,
- accesibilidad,
- coherencia con `DESIGN.md`.

## 10. CRITERIOS DE ACEPTACIÓN

La tarea no se considera terminada si no se cumple todo lo siguiente:

1. El dashboard se ve claramente más premium y moderno.
2. Los KPIs ya no se ven aburridos.
3. El hero operativo existe y aporta contexto.
4. El flujo de 14 pasos se ve mejor y es más usable.
5. Los gráficos tienen mejor presencia.
6. Los estados vacíos se ven bien diseñados.
7. Se usan componentes reutilizables.
8. Se respeta `DESIGN.md`.
9. Light/Dark funciona correctamente.
10. El sistema visual se ve consistente en toda la pantalla.

## 11. IMPORTANTE

No me des una solución genérica.  
No me des solo ideas.  
No me des solo una opinión estética.  
Quiero una mejora concreta, implementable y alineada con el producto real.

Tu misión es que la app CERMONT deje de verse “correcta pero aburrida” y pase a verse como una **plataforma operativa profesional, clara, limpia y seria**, inspirada en la referencia visual pero completamente adaptada al dominio del sistema.

