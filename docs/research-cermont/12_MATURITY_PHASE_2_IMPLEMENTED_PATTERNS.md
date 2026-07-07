# Patrones profesionales aplicados en Maturity Phase 2

**Fecha de verificación:** 2026-06-12  
**Alcance:** recordatorios, estados vacíos, dashboard, rendimiento y accesibilidad móvil.

## Referencias primarias

| Referencia | Patrón revisado | Aplicación en Cermont |
|---|---|---|
| [Shelf.nu](https://github.com/Shelf-nu/shelf.nu/releases) | Estados vacíos contextuales y consistentes en listas y widgets | Un único `EmptyState` canónico con 26 consumidores, ilustración por módulo y acciones primarias/secundarias |
| [Carbon Design System](https://github.com/carbon-design-system/carbon) | Notificaciones contextuales, acciones explícitas y semántica accesible | Centro de notificaciones persistente; leer/cerrar una vista no elimina el historial operativo |
| [Recharts](https://github.com/recharts/recharts) | Contenedores responsivos con altura estable | Gráficas lazy-loaded, `ResponsiveContainer`, tarjetas no anidadas y altura definida |

## Decisiones implementadas

1. No se agregó ninguna dependencia ni un segundo sistema de diseño.
2. Los estados vacíos usan tokens Cermont, Lucide y SVG inline reutilizable.
3. El dashboard no muestra porcentajes ni tendencias inventadas:
   - El pipeline se agrega desde `ServiceCase.currentStage`.
   - La distribución por paso usa `ServiceCase.currentStepCode`.
   - El gráfico de costos agrega `Cost.actualAmount`, no el número de evidencias.
4. La actividad reciente consume el contrato real de dashboard.
5. La primera imagen del hero usa `loading="eager"` y `fetchPriority="high"`; las restantes son lazy.
6. Los controles visibles del carrusel y tema miden al menos 44 x 44 px en viewport móvil.

## Verificación

- Viewport móvil: 375 x 812.
- Ancho de documento y viewport: 370 px, sin overflow horizontal.
- Imagen LCP: `loading=eager`, `fetchpriority=high`.
- Controles del hero: 44 x 44 px.
- El dashboard autenticado no pudo verificarse manualmente con los usuarios locales existentes; su comportamiento visual está cubierto por pruebas de componentes y el acceso siguió devolviendo `Invalid email or password`.

