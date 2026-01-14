# CERMONT Web - Frontend Angular

Aplicación web para gestión de órdenes de trabajo, evidencias, formularios dinámicos y reportes para CERMONT S.A.S.

## Tech Stack

- **Angular 21+**
- **TypeScript**
- **Tailwind CSS v4**
- **RxJS**

## Características

- 🔐 Autenticación con JWT + Refresh Tokens
- 📋 Gestión de Órdenes de Trabajo (14 pasos)
- 📝 Formularios Dinámicos (Checklists personalizables)
- 📸 Gestión de Evidencias
- 📊 Dashboard con KPIs
- 🔒 Inspecciones HES (Seguridad en Alturas)
- 📄 Generación de Reportes PDF

## Desarrollo

```bash
# Instalar dependencias
pnpm install

# Servidor de desarrollo
pnpm run dev

# Build de producción
pnpm run build
```

## Estructura

```
src/app/
├── core/           # Guards, interceptors, services base
├── shared/         # Componentes reutilizables
├── features/       # Módulos de funcionalidades
│   ├── auth/       # Autenticación
│   ├── dashboard/  # Dashboard principal
│   ├── ordenes/    # Gestión de órdenes
│   ├── admin/      # Administración
│   └── perfil/     # Perfil de usuario
└── pages/          # Páginas standalone
```

## Licencia

Propietario © 2024-2026 CERMONT S.A.S
