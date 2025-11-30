# Cermont ATG - Frontend

Sistema de Gestión de Órdenes de Trabajo y Mantenimiento para Cermont S.A.S.

## Descripción

Cermont ATG es una aplicación web moderna construida con **Next.js 15** y **Tailwind CSS** para la gestión integral de órdenes de trabajo, kits de materiales, checklists y reportes de mantenimiento.

## Tecnologías

- **Next.js 15.5** - Framework React con App Router
- **React 19** - Biblioteca de UI
- **TypeScript** - Tipado estático
- **Tailwind CSS 4** - Framework de estilos
- **TanStack React Query** - Gestión de estado del servidor
- **React Hook Form** - Manejo de formularios
- **Zod** - Validación de esquemas

## Características

### Módulos Principales
- 📋 **Dashboard** - Métricas y KPIs en tiempo real
- 🔧 **Órdenes de Trabajo** - CRUD completo con estados y prioridades
- 📦 **Kits de Materiales** - Gestión de materiales y herramientas
- ✅ **Checklists** - Listas de verificación personalizables
- 📊 **Reportes** - Generación y exportación de informes
- 👥 **Usuarios** - Gestión de usuarios y roles
- 💰 **Facturación** - Control de costos y facturación

### Funcionalidades
- 🔐 Autenticación JWT con refresh tokens
- 🌙 Modo oscuro/claro
- 📱 Diseño responsive
- 🔄 Sincronización offline (PWA)
- 📤 Exportación a CSV/PDF

## Instalación

```bash
# Clonar el repositorio
git clone https://github.com/JuanDiego30/cermont_aplicativo.git

# Navegar al directorio frontend
cd cermont_aplicativo/frontend

# Instalar dependencias
npm install

# Iniciar en desarrollo
npm run dev
```

## Variables de Entorno

Crear un archivo `.env.local` con:

```env
NEXT_PUBLIC_API_URL=http://localhost:5000/api
```

## Scripts Disponibles

```bash
npm run dev      # Servidor de desarrollo
npm run build    # Build de producción
npm run start    # Servidor de producción
npm run lint     # Verificar código
```

## Estructura del Proyecto

```
src/
├── app/              # Páginas (App Router)
├── components/       # Componentes UI reutilizables
├── core/             # API client, providers, config
├── features/         # Módulos por funcionalidad
├── layout/           # Componentes de layout
├── lib/              # Utilidades y helpers
└── shared/           # Constantes, hooks, utils compartidos
```

## Usuarios de Prueba

| Email | Contraseña | Rol |
|-------|------------|-----|
| root@cermont.com | Root123! | ROOT |

## Licencia

Copyright © 2025 Cermont S.A.S. - Todos los derechos reservados.
