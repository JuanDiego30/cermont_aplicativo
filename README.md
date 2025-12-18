# Cermont - Sistema de Gestión de Órdenes de Trabajo

Sistema web para gestión de órdenes de trabajo, ejecución, cierre administrativo y sincronización offline.

## Stack Tecnológico

- **Frontend**: Next.js 15 + React 19 + TypeScript + TailwindCSS
- **Backend**: NestJS 10 + TypeScript + Prisma ORM
- **Base de Datos**: PostgreSQL 16
- **Autenticación**: JWT + Refresh Tokens (HttpOnly cookies)
- **Offline**: IndexedDB + Service Worker
- **Documentación API**: Swagger/OpenAPI

## Arquitectura

- **Monorepo** con workspaces separados
- **API REST** con prefijo `/api`
- **State Management**: Zustand
- **Validación**: class-validator + class-transformer
- **File Uploads**: Multer
- **CORS configurado** para cookies de refresh token

## Requisitos Previos

- Node.js >= 18.x
- PostgreSQL 16 (local o Docker)
- npm o pnpm

## Instalación

### 1. Instalar dependencias

```bash
# Desde la raíz del proyecto
npm run install:all
```

### 2. Configurar variables de entorno

```bash
# Copiar archivo de ejemplo
cp .env.example .env
cp apps/api/.env.example apps/api/.env

# ⚠️ IMPORTANTE: Cambiar JWT_SECRET en producción
# El servidor fallará si JWT_SECRET no está configurado
```

Variables principales:
- `DATABASE_URL`: Conexión a PostgreSQL
- `JWT_SECRET`: Clave para firmar tokens (requerido, sin fallback)
- `JWT_EXPIRES_IN`: Duración access token (default: 15m)
- `JWT_REFRESH_EXPIRES_IN`: Duración refresh token (default: 7d)
- `FRONTEND_URL`: URL del frontend para CORS
- `PORT`: Puerto del API (default: 4000)

### 3. Iniciar base de datos (Docker)

```bash
docker run -d \
  --name cermont-db \
  -e POSTGRES_USER=cermont \
  -e POSTGRES_PASSWORD=cermont123 \
  -e POSTGRES_DB=cermont_db \
  -p 5432:5432 \
  postgres:16-alpine
```

### 4. Ejecutar migraciones de Prisma

```bash
cd apps/api
npx prisma migrate dev
npx prisma generate
```

### 5. Iniciar en desarrollo

```bash
# Desde la raíz
npm run dev
```

O ejecutar cada workspace por separado:

```bash
# Terminal 1 - Backend
npm run dev:api

# Terminal 2 - Frontend
npm run dev:web
```

## Estructura del Proyecto

```
cermont_aplicativo/
├── apps/
│   ├── api/                    # Backend NestJS
│   │   ├── prisma/
│   │   │   ├── schema.prisma   # Modelo de datos
│   │   │   └── migrations/     # Migraciones SQL
│   │   └── src/
│   │       ├── modules/        # Módulos por dominio
│   │       │   ├── auth/       # Autenticación + JWT
│   │       │   ├── ordenes/    # Órdenes de trabajo
│   │       │   ├── ejecucion/  # Ejecución + FSM
│   │       │   ├── sync/       # Sincronización offline
│   │       │   └── ...
│   │       └── common/         # Guards, decorators, pipes
│   └── web/                    # Frontend Next.js
│       └── src/
│           ├── app/            # App Router de Next.js
│           ├── components/     # Componentes React
│           ├── lib/            # Utilidades y cliente API
│           │   ├── api-client.ts  # Cliente HTTP unificado
│           │   └── offline-sync.ts # Sistema offline
│           ├── features/       # Módulos por feature
│           ├── stores/         # Estado global (Zustand)
│           └── types/          # TypeScript types
├── .env.example               # Variables globales
└── README.md
```

## Scripts Disponibles

### Global (desde raíz)

- `npm run dev` - Inicia API + Web en paralelo
- `npm run dev:api` - Solo backend (puerto 4000)
- `npm run dev:web` - Solo frontend (puerto 3000)
- `npm run install:all` - Instala todas las dependencias

### Backend (desde apps/api)

- `npm run start:dev` - Desarrollo con hot-reload
- `npm run build` - Build de producción
- `npm run migrate` - Ejecutar migraciones Prisma
- `npm run prisma:generate` - Regenerar cliente Prisma
- `npm run seed` - Poblar base de datos con datos de prueba

### Frontend (desde apps/web)

- `npm run dev` - Servidor desarrollo Next.js
- `npm run build` - Build optimizado producción
- `npm run start` - Servidor producción
- `npm run lint` - Linter

## URLs de Desarrollo

- **Frontend**: http://localhost:3000
- **API**: http://localhost:4000/api
- **Swagger Docs**: http://localhost:4000/docs
- **Health Check**: http://localhost:4000/api/health

## Características Principales

### Autenticación y Seguridad

- JWT con access tokens (15 min) + refresh tokens (7 días)
- Refresh tokens en cookies HttpOnly (seguros contra XSS)
- Guards de autenticación con Passport.js
- CORS configurado con `credentials: true`

### Gestión de Órdenes

- Estados: NUEVA → PLANEACION → APROBADA → EN_EJECUCION → COMPLETADA
- Máquina de estados finita (FSM) para transiciones
- Kits de trabajo con herramientas, equipos, documentos
- Checklists dinámicos

### Modo Offline

- Almacenamiento local con IndexedDB
- Cola de sincronización automática al reconectar
- Detección de cambios en conectividad
- Reintentos con backoff exponencial

### Módulos del Sistema

- **Órdenes**: CRUD + transiciones FSM
- **Planeación**: Asignación de recursos y kits
- **Ejecución**: Seguimiento en tiempo real
- **Evidencias**: Fotos y documentos
- **HES**: Líneas de vida y seguridad
- **Cierre Administrativo**: Validación final
- **Dashboard**: Reportes y estadísticas

## Mejoras Recientes (Diciembre 2024)

✅ Eliminado fallback inseguro de `JWT_SECRET`  
✅ Unificado cliente API del frontend (evita bugs de auth)  
✅ Estandarizado variables de entorno (FRONTEND_URL vs CORS_ORIGIN)  
✅ Corregido manejo de errores (usar excepciones HTTP apropiadas)  
✅ Añadido `credentials: 'include'` en refresh token  
✅ Resueltos errores TypeScript detectados  
✅ Mejorado logging (condicional según NODE_ENV)

## Notas de Producción

1. **JWT_SECRET**: Sin fallback. El servidor fallará si no está configurado.
2. **CORS**: Configurar `FRONTEND_URL` con el dominio real del frontend.
3. **PostgreSQL**: Usar conexión SSL y credenciales seguras.
4. **Logs**: Winston configurado, evitar `console.log` en producción.
5. **Variables**: Validar todas las variables de entorno al inicio.

## Documentación Adicional

- **API**: Ver Swagger en `/docs` cuando el servidor esté corriendo
- **Prisma**: `npx prisma studio` para explorar la base de datos
- **TypeScript**: Proyecto estrictamente tipado
