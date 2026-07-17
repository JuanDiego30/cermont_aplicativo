# Fleet Page — Audit Before (Sprint 1)

## Accessibility Issues Detected

### 1. FLEET contraste insuficiente
- **Archivo:** frontend/src/modules/core/ui/layout/Header.tsx:131
- **Problema:** Texto del módulo title usa `text-[10px] font-bold text-brand` (azul CERMONT #2154A6).
- **Contraste:** ~4.33:1 sobre fondo blanco. WCAG AA requiere 4.5:1 para texto normal.
- **Tamaño:** 10px — por debajo del mínimo recomendado de 12px.
- **Impacto:** Usuarios con baja visión no pueden leer el breadcrumb de navegación.

### 2. li#header-notifications sin ul/ol padre
- **Archivo:** frontend/src/modules/core/ui/layout/HeaderNotifications.tsx:54
- **Problema:** `<li className="relative" id="header-notifications">` está dentro de un `<div>` en el Header, no dentro de un `<ul>`.
- **Impacto:** Violación de accesibilidad WCAG — los elementos `<li>` deben estar dentro de `<ul>`, `<ol>` o `<menu>`.
- **Warnings:** Lectores de pantalla pueden ignorar o malinterpretar la estructura.

### 3. aria-label del botón de usuario no incluye texto visible
- **Archivo:** frontend/src/modules/core/ui/layout/HeaderUserMenu.tsx:95
- **Problema:** `aria-label="Menú de usuario de {user.name}"` pero el texto visible en el botón son las iniciales (ej. "GG").
- **Impacto:** Usuarios de lectores de pantalla no escuchan el texto visible primero, lo que rompe la consistencia esperada.

## Estado del servidor /fleet
- Backend: Full fleet module with CRUD, document tracking, photos, assignments
- Frontend: Complete page with loading, error, empty states, filters, pagination, document alerts
- Page title was missing from ROUTE_TITLES (showed "Cermont" instead of "Parque Automotor")
