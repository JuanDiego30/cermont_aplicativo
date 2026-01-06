# UI Kit - Cermont Aplicativo

## Estructura

```
apps/web/src/app/shared/
├── components/                 # 263 archivos - UI Kit TailAdmin
│   ├── ui/                     # Componentes base (alert, avatar, badge, button, modal, table)
│   ├── cards/                  # Cards variantes
│   ├── charts/                 # Wrappers de gráficos
│   ├── forms/                  # Inputs, selects, checkboxes
│   ├── tables/                 # Tablas con estilos
│   ├── header/                 # Header components
│   └── ...                     # 24 más categorías
├── layout/                     # Layouts productivos
│   ├── app-layout/             # Layout principal con sidebar
│   ├── app-sidebar/            # Navegación lateral
│   ├── app-header/             # Header con usuario
│   └── auth-page-layout/       # Layout para auth pages
├── pages/                      # Páginas compartidas
│   └── not-found/              # 404 page
└── services/                   # Servicios compartidos
    └── toast.service.ts        # Notificaciones
```

## Reglas de Uso

### ✅ Dónde va cada cosa

| Tipo | Ubicación |
|------|-----------|
| Componente UI (button, card, input) | `shared/components/ui/` |
| Layout (sidebar, header) | `shared/layout/` |
| Lógica de negocio (ordenService) | `features/*/services/` |
| API clients | `core/api/*.api.ts` |
| Modelos/DTOs | `core/models/*.model.ts` |

### ❌ Lo que NO debe ir en shared

- Lógica de negocio específica
- Llamadas directas a API (usar servicios de `core/api`)
- Estado global (usar signals en features o stores)

## Mobile Responsive

Los layouts usan clases Tailwind responsive:
- `md:` → Desktop
- `sm:` → Tablet  
- Default → Mobile

Ejemplo:
```html
<div class="w-full md:w-1/2 lg:w-1/3">...</div>
```

## Conexión Backend

Todos los componentes de features están conectados al backend:

| Feature | Servicios |
|---------|-----------|
| `perfil/` | AuthService, UserService |
| `ordenes/` | OrdenesService → OrdenesApi |
| `admin/` | UsersApi, RolesApi |
| `auth/` | AuthService |
