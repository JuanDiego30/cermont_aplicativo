# 📋 Changelog - CERMONT ATG

Todos los cambios notables en este proyecto serán documentados en este archivo.

El formato está basado en [Keep a Changelog](https://keepachangelog.com/es-ES/1.0.0/),
y este proyecto adhiere a [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

---

## [1.2.0] - 2025-11-29

### ✨ Añadido

#### Backend
- **AuthFacade**: Nueva fachada para encapsular dependencias de autenticación
- **catchUtils**: Utilidades para manejo tipado de errores (elimina `any`)
- **apiResponse**: Helper para respuestas API estandarizadas (RFC 7807)
- **Swagger/OpenAPI**: Documentación interactiva en `/api/docs`
- **Tipos de Error**: ValidationError, NotFoundError, AuthError, etc.
- **Barrel Exports**: Exports centralizados en `shared/utils`, `shared/errors`

#### Frontend
- **Skeleton Components**: Sistema completo de loading skeletons
  - `Skeleton`, `SkeletonText`, `SkeletonAvatar`
  - `SkeletonCard`, `SkeletonTable`, `SkeletonList`
  - `SkeletonDashboard`, `SkeletonProfile`, `SkeletonForm`
- **CermontLogo**: Componente unificado del logo con variantes
- **StatusBadge**: Badge de estado con 14 tipos predefinidos
- **StatCard**: Tarjetas de estadísticas con 6 variantes
- **ActionCard**: Tarjetas de acción reutilizables
- **ErrorBoundary**: Manejo de errores React con fallback UI
- **SkipToContent**: Componente de accesibilidad para saltar contenido

### 🔧 Mejorado

#### Backend
- **AuthController**: Reducido de 7 dependencias a 1 (AuthFacade)
- **Controladores**: Refactorizados para usar `catchUtils`
- **Manejo de errores**: Tipado completo, eliminado `any`
- **Imports**: Consolidados usando barrel exports

#### Frontend
- **Accesibilidad**:
  - Button: focus rings, aria-label, aria-busy, loading state
  - Modal: role="dialog", focus trap, aria-labelledby
  - Layout: `<main id="main-content">` semántico
- **Performance**:
  - Next.js config optimizado (compress, images, optimizePackageImports)
  - Lazy loading utilities creadas
- **Tailwind**: Clases canónicas (eliminado `[0.05]` syntax)
- **Logo**: Estilo unificado con frame circular y sombra

### 🗑️ Eliminado
- Componentes de ejemplo del template:
  - `components/ecommerce/` (7 archivos)
  - `components/example/ModalExample/` (5 archivos)
  - Páginas `(others-pages)/` y `(ui-elements)/`
- Console.logs en producción (15+ eliminados)
- Tipos `any` en controladores

### 🐛 Corregido
- WeatherMap.tsx: TypeError al acceder weather.current.temp
- WeatherController: Estructura de datos alineada con frontend
- Import error: cn de @/lib/utils → @/shared/utils/cn
- Tailwind warnings de clases no canónicas

---

## [1.1.0] - 2025-11-28

### ✨ Añadido
- Sistema de autenticación completo (JWT + Refresh Tokens)
- Dashboard con métricas en tiempo real
- Gestión de órdenes de trabajo (CRUD + estados)
- Sistema de kits de materiales
- Planes de trabajo con aprobación
- Evidencias con upload de archivos
- Generación de reportes PDF
- Asistente IA con OpenAI
- Widget de clima con OpenWeather

### 🔧 Mejorado
- Soporte offline con IndexedDB
- PWA habilitado con Service Workers
- Dark mode completo

---

## [1.0.0] - 2025-11-15

### ✨ Añadido
- Estructura inicial del proyecto (monorepo)
- Backend con Express + Prisma
- Frontend con Next.js 15
- Sistema de roles (ADMIN, SUPERVISOR, TECHNICIAN, CLIENT)
- Autenticación básica con JWT

---

## Tipos de Cambios

- ✨ `Añadido` - Nuevas funcionalidades
- 🔧 `Mejorado` - Cambios en funcionalidad existente
- 🗑️ `Eliminado` - Funcionalidad removida
- 🐛 `Corregido` - Corrección de bugs
- 🔒 `Seguridad` - Vulnerabilidades corregidas
- ⚠️ `Deprecado` - Funcionalidad que será removida

---

*Mantenido por el equipo de desarrollo CERMONT ATG*
