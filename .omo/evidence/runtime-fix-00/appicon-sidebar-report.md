# AppIcon & Sidebar Report — RUNTIME-FIX-00

## AppIcon

**Ubicación:** `frontend/src/core/ui/AppIcon.tsx`
**Estado:** Mejorado

### Variantes implementadas
| Variante | Token CSS | Uso |
|---|---|---|
| `default` | --text-muted | 90% de iconos neutros |
| `active` | --color-success | Item nav activo (Cermont Green) |
| `brand` | --color-brand | CTA primario (Cermont Blue) |
| `muted` | --text-tertiary | Separadores, pasos secundarios |
| `success` | --color-success | Completado, positivo |
| `warning` | --color-warning | Advertencias no críticas |
| `danger` | --color-danger | Errores bloqueantes |
| `info` | --color-info | Indicadores informativos |

### Reglas aplicadas
- strokeWidth={1.5} fijo
- fill="none"
- currentColor heredado
- Sin colores hardcodeados — solo tokens CSS

## Sidebar

**Ubicación:** `frontend/src/modules/core/ui/layout/Sidebar.tsx`
**Estado:** ✅ Correcto

- Usa `AppIcon` correctamente con variant según estado activo
- `aria-current="page"` presente en link activo
- Sin colores hardcodeados (text-blue-*, bg-blue-*)
- Sin iconos multicolor
- Navegación `siteVisits` apunta a `/site-visits`
