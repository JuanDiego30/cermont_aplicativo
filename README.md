# ?? CERMONT ATG - Sistema de Gestión de Órdenes de Trabajo

> Sistema integral para empresas de mantenimiento industrial. Control total de proyectos, ejecución en campo y reportes técnicos automáticos.

## ?? Descripción

CERMONT ATG es una plataforma desarrollada en **Node.js + Next.js** que permite gestionar órdenes de trabajo, coordinar equipos de campo, generar reportes y mantener auditoría completa de operaciones.

## ? Características

- ?? **Gestión de Órdenes** - Crear, asignar y seguir órdenes de trabajo
- ?? **Dashboard Ejecutivo** - KPIs y métricas en tiempo real
- ?? **Trabajo Offline** - Funciona sin conexión a internet
- ?? **Reportes Automáticos** - Generación de PDF profesionales
- ?? **Seguridad** - JWT, RBAC, auditoría completa
- ?? **Soporte 24/7** - Equipo técnico disponible

## ??? Stack Tecnológico

### Backend
- **Runtime**: Node.js v20+
- **Framework**: Express.js
- **Database**: SQLite (Prisma ORM)
- **Auth**: JWT + Bcrypt
- **API**: REST + Tipos TypeScript

### Frontend
- **Framework**: Next.js 15
- **UI**: React 19 + TailwindCSS
- **State**: TanStack Query + Context API
- **Offline**: Service Workers + IndexedDB

## ?? Quick Start

### Requisitos
- Node.js v20+
- npm v10+
- Git

### 1. Clonar Repositorio
```bash
git clone https://github.com/JuanDiego30/cermont_aplicativo.git
cd cermont_aplicativo
```

### 2. Instalación (Monorepo)
```bash
# Instala backend + frontend + todas las dependencias
npm install

# Setup de BD (opcional - se hace automáticamente con npm run dev)
npm run db:seed
```

### 3. Desarrollo
```bash
# Corre backend (puerto 5000) + frontend (puerto 3000)
npm run dev
```

Luego accede a:
- **App**: http://localhost:3000
- **API**: http://localhost:5000/api
- **Credenciales**: 
  - Email: `admin@cermont.com`
  - Password: `Admin123!`

### 4. Build Producción
```bash
npm run build
npm run start
```

## ?? Estructura del Proyecto

```
cermont-aplicativo/
??? backend/              # API Express + Prisma
?   ??? src/
?   ?   ??? app.ts
?   ?   ??? server.ts
?   ?   ??? domain/       # Lógica de negocio
?   ?   ??? infra/        # BD, HTTP, servicios
?   ?   ??? shared/       # Utilidades comunes
?   ??? prisma/           # Schema y migraciones
?   ??? package.json
?
??? frontend/             # App Next.js
?   ??? app/              # Rutas (App Router)
?   ??? components/       # Componentes React
?   ??? lib/              # Hooks, API client
?   ??? package.json
?
??? scripts/              # Scripts de utilidad
??? docs/                 # Documentación adicional
??? package.json          # Root monorepo (workspaces)
```

## ?? Documentación

### Para Comenzar
- **[START_HERE.md](START_HERE.md)** - Punto de entrada (5 min)
- **[GUIA_RAPIDA_INICIO.md](GUIA_RAPIDA_INICIO.md)** - Guía rápida (5 min)
- **[VERIFICACION_WORKSPACE.md](VERIFICACION_WORKSPACE.md)** - Verificar que todo funciona (10 min)

### Para Entender
- **[WORKSPACE_PROFESIONAL_SETUP.md](WORKSPACE_PROFESIONAL_SETUP.md)** - Setup del workspace
- **[MONOREPO_PROFESIONAL_GUIA.md](MONOREPO_PROFESIONAL_GUIA.md)** - Por qué se estructura así
- **[DOCUMENTACION_INDICE_COMPLETO.md](DOCUMENTACION_INDICE_COMPLETO.md)** - Índice completo

### Para Problemas
- **[CLEAN_INSTALL.md](CLEAN_INSTALL.md)** - Limpiar y reinstalar
- **[SOLUCION_CONNECTION_REFUSED.md](SOLUCION_CONNECTION_REFUSED.md)** - Errores de conexión
- **[SOLUCION_FINAL_LOGIN.md](SOLUCION_FINAL_LOGIN.md)** - Problemas de login

### Para Deploy
- **[GUIA_DEPLOYMENT_VPS.md](GUIA_DEPLOYMENT_VPS.md)** - Deploy en VPS

---

## ? Comandos Principales

### Desarrollo
```bash
npm run dev              # Corre backend + frontend
npm run dev:backend     # Solo backend en :5000
npm run dev:frontend    # Solo frontend en :3000
```

### Build
```bash
npm run build           # Compila ambos
npm run build:backend   # Solo backend
npm run build:frontend  # Solo frontend
```

### Producción
```bash
npm run start           # Inicia backend + frontend
npm run start:backend   # Solo backend
npm run start:frontend  # Solo frontend
```

### Base de Datos
```bash
npm run db:seed        # Carga datos de prueba
npm run db:reset       # Resetea la BD
npm run db:studio      # Abre Prisma Studio
```

### Testing
```bash
npm run test           # Corre tests
npm run test:watch     # Tests en watch mode
npm run test:coverage  # Coverage
```

### Calidad
```bash
npm run lint           # Verificar linting
npm run lint:fix       # Arreglar linting
npm run type-check     # Verificar tipos
npm run format         # Formatear código
```

### Limpieza
```bash
npm run clean          # Limpia dist y node_modules
./reset-workspace.ps1  # Script completo (PowerShell)
```

## ?? Variables de Entorno

### Backend (`backend/.env`)
```env
NODE_ENV=development
PORT=5000
DATABASE_URL="file:./prisma/dev.db"
CORS_ORIGIN=http://localhost:3000
JWT_SECRET=tu_clave_secreta_aqui
```

### Frontend (`frontend/.env.development`)
```env
NEXT_PUBLIC_API_URL=http://localhost:5000/api
NEXT_PUBLIC_APP_NAME=CERMONT ATG
```

## ?? Usuarios de Prueba

| Email | Password | Rol |
|-------|----------|-----|
| `root@cermont.com` | `Root123!` | ROOT |
| `admin@cermont.com` | `Admin123!` | ADMIN |
| `coordinador@cermont.com` | `Coord123!` | COORDINADOR |
| `operario@cermont.com` | `Oper123!` | OPERARIO |

## ?? Testing

```bash
# Tests de integración
npm run test

# Watch mode
npm run test:watch

# Coverage completo
npm run test:coverage
```

## ?? Monorepo con npm workspaces

Este proyecto usa **npm workspaces** para gestionar backend y frontend como un único monorepo profesional:

```
npm install              # Instala todas las dependencias (una sola vez)
node_modules/            # Contiene TODAS las librerías (no duplicadas)
??? backend ? ../node_modules  # symlink
??? frontend ? ../node_modules # symlink
```

**Ventajas:**
- ? Sin duplicación de paquetes
- ? Instalación más rápida
- ? Scripts centralizados
- ? Mismo stack en todo el proyecto
- ? Fácil escalable a más workspaces

[Más información aquí](MONOREPO_PROFESIONAL_GUIA.md)

## ?? Docker

```bash
# Desarrollo
docker-compose up -d

# Build con todos los optimizaciones
docker build -t cermont-app .
```

## ? Troubleshooting

### "npm run dev" falla
```bash
npm install
npm run prisma:generate
npm run jwks:generate
npm run dev
```

### Error de CORS
Verificar que `backend/.env` tiene:
```
CORS_ORIGIN=http://localhost:3000
```

### Base de datos bloqueada
```bash
rm backend/prisma/dev.db*
npm run db:seed
npm run dev
```

### node_modules corrupto
```bash
./reset-workspace.ps1  # En Windows
# O manualmente:
rm -rf node_modules package-lock.json
npm cache clean --force
npm install
```

**Ver más en [DOCUMENTACION_INDICE_COMPLETO.md](DOCUMENTACION_INDICE_COMPLETO.md)**

## ?? Contribuir

1. Fork el repositorio
2. Crea rama: `git checkout -b feature/MiFeature`
3. Commit: `git commit -am 'Add feature'`
4. Push: `git push origin feature/MiFeature`
5. Pull Request

## ?? Soporte

- Email: support@cermont.com
- Docs: [Documentación Completa](DOCUMENTACION_INDICE_COMPLETO.md)
- Issues: https://github.com/JuanDiego30/cermont_aplicativo/issues

## ?? Licencia

Todos los derechos reservados © 2024 Cermont SAS

## ?? Agradecimientos

- Team Cermont
- Comunidad Open Source
- Clientes y Partners

---

**Status**: ? Producción lista  
**Versión**: 1.0.0  
**Última actualización**: 2024-11-17

**[Comienza aquí ?](START_HERE.md)**
