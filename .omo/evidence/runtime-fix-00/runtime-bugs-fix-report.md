# Runtime Bugs Fix Report — RUNTIME-FIX-00

## S0-01: Ruta /visits → /site-visits

**Hallazgo:** No existe ninguna referencia a "/visits" en el código fuente del frontend.
La navegación del sidebar usa `APP_ROUTES.siteVisits = "/site-visits"` definido en `frontend/src/lib/routes.ts`.
`/site-visits` está confirmado en el build output como ruta funcional.
**Estado:** ✅ Sin cambios necesarios — ya correcto.

## S0-02: Ortografía Telefono → Teléfono

**Hallazgo:** Búsqueda de "Telefono" (sin tilde) en todos los archivos .tsx/.ts del frontend
arrojó 0 ocurrencias. Todos los labels visibles usan "Teléfono" con tilde correctamente.
**Estado:** ✅ Sin cambios necesarios — ya correcto.

## S0-03: Breadcrumb legible

**Hallazgo:** `ROUTE_TITLES` en `Header.tsx` expandido de 15 a 55+ entradas cubriendo
todas las rutas del sidebar: site-visits, execution, planning, service-cases, etc.
Ya no muestra slugs técnicos como WORK-REQUESTS.
**Estado:** ✅ Corregido en iteración previa — ROUTE_TITLES completo.

## S0-04: AppIcon mejorado

**Hallazgo:** AppIcon.tsx existente con 6 variantes. Se mejoró agregando:
- `warning` (usa --color-warning)
- `danger` (usa --color-danger)
- `info` (usa --color-info)
- Se eliminó `alert` (redundante con `warning`)
- strokeWidth=1.5 fijo para toda la app
**Estado:** ✅ Mejorado — ahora 8 variantes.

## S0-05: Sidebar estandarizado

**Hallazgo:** Sidebar.tsx ya usa AppIcon con variant={isActive ? 'active' : 'default'}.
Incluye aria-current="page" en el link activo. Sin colores hardcodeados.
**Estado:** ✅ Sin cambios necesarios — ya correcto.

## S0-06: Iconos rotos

**Hallazgo:** Búsqueda de colores hardcodeados (text-blue-*, text-purple-*, etc.)
en core/layout arrojó 0 ocurrencias. Sidebar y Header ya usan tokens CSS.
**Estado:** ✅ Sin cambios necesarios — ya correcto.
