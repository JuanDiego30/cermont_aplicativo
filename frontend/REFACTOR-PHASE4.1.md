# FASE 4.1: Auditoría de Layout

## Estructura src/layout/:

| Archivo | Descripción |
|---------|-------------|
| AppHeader.tsx | Header principal de la aplicación |
| AppSidebar.tsx | Sidebar de navegación |
| Backdrop.tsx | Overlay para modales/sidebar |
| NotificationDropdown.tsx | Dropdown de notificaciones |
| SidebarWidget.tsx | Widget del sidebar |
| UserDropdown.tsx | Dropdown del usuario |

## layout/index.ts:
❌ **FALTA** - No existe barrel export

## Problemas:
- [x] Falta index.ts para exportar componentes de layout

## Acción requerida:
Crear `src/layout/index.ts`:
```typescript
export { default as AppHeader } from './AppHeader';
export { default as AppSidebar } from './AppSidebar';
export { default as Backdrop } from './Backdrop';
export { NotificationDropdown } from './NotificationDropdown';
export { default as SidebarWidget } from './SidebarWidget';
export { UserDropdown } from './UserDropdown';
```

## Estado: ⚠️ NECESITA index.ts
