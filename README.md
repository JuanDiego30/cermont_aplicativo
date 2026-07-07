


# Cermont S.A.S. — Sistema de Gestión Operativa

> Plataforma integral para gestión de órdenes de trabajo, mantenimientos,
> inspecciones, propuestas comerciales y control de costos.
> Arquitectura monorepo npm workspaces: `backend/` (Express) + `frontend/` (Next.js) + `packages/shared-types`.

---

## Stack Tecnológico

Las versiones exactas están fijadas en cada `package.json` del workspace.

### Monorepo

| Herramienta | Versión | Rol |
|---|---|---|
| npm | 10.9.4 | Package manager y gestor de workspaces |
| Node.js | ≥ 22.13.1 | Runtime requerido |
| TypeScript | 5.x (strict) | Lenguaje principal en los 3 workspaces |

### Backend (`backend/`)

| Tecnología | Versión | Rol |
|---|---|---|
| Express | 5.2.1 | Framework HTTP (async nativo, sin try/catch en controllers) |
| Mongoose | 9.3.3 | ODM para MongoDB |
| MongoDB | local / Atlas | Base de datos NoSQL |
| jsonwebtoken | 9.0.3 | Tokens JWT |
| bcryptjs | 3.0.3 | Hash de contraseñas |
| Zod | 4.3.6 | Validación de schemas (unificado con frontend) |
| helmet | 8.1.0 | Headers de seguridad HTTP |
| cors | 2.8.6 | Control de orígenes permitidos |
| express-rate-limit | 8.3.1 | Rate limiting diferenciado por ruta |
| multer | 2.1.1 | Upload de archivos (evidencias, fotos) |
| sharp | 0.34.5 | Procesamiento y compresión de imágenes |
| pdf-lib | 1.17.1 | Generación de PDFs (actas e informes) |
| dotenv | 17.3.1 | Variables de entorno |
| cookie-parser | 1.4.7 | Gestión de cookies HttpOnly |
| tsx | 4.21.0 | Ejecución TypeScript en dev |

### Frontend (`frontend/`)

| Tecnología | Versión | Rol |
|---|---|---|
| Next.js | 16.2.1 (App Router + Turbopack) | Framework frontend |
| React | 19.2.4 | UI library |
| TypeScript | 5.9.3 (strict) | Lenguaje |
| Tailwind CSS | 4.2.2 | Estilos utility-first |
| TanStack Query | 5.95.2 | Server state, caché y sincronización |
| Zustand | 5.0.12 | Estado cliente global |
| react-hook-form | 7.72.0 | Gestión de formularios |
| Zod | 4.3.6 | Validación de schemas en cliente |
| @hookform/resolvers | 5.2.2 | Puente react-hook-form ↔ Zod |
| Radix UI | varios | Componentes accesibles sin estilos |
| Framer Motion | 12.38.0 | Animaciones declarativas |
| Recharts | 3.8.1 | Gráficos y dashboards |
| FullCalendar | 6.1.20 | Calendario de planificación |
| react-dnd | 16.0.1 | Drag & Drop (Kanban de órdenes) |
| react-dropzone | 15.0.0 | Zona de carga de archivos |
| react-day-picker | 9.14.0 | Selector de fechas |
| sonner | 2.0.7 | Notificaciones toast |
| lucide-react | 1.7.0 | Iconografía |
| date-fns | 4.1.0 | Utilidades de fechas |
| uuid | 13.0.0 | Generación de IDs únicos |
| embla-carousel-react | 8.6.0 | Carrusel de imágenes |
| clsx + tailwind-merge | 2.1.1 / 3.5.0 | Composición de clases CSS |
| class-variance-authority | 0.7.1 | Variantes de componentes UI |

### Shared Types (`packages/shared-types`)

| Paquete | Versión | Rol |
|---|---|---|
| `@cermont/shared-types` | 1.0.0 | Interfaces TypeScript y schemas Zod compartidos entre apps |

> Importar como: `import type { IOrdenTrabajo } from '@cermont/shared-types'`
> Protocolo workspace: `"@cermont/shared-types": "workspace:*"`

### Testing y Calidad (`frontend/`)

| Herramienta | Versión | Rol |
|---|---|---|
| Vitest | 4.0.18 | Testing unitario e integración |
| @vitest/coverage-v8 | 4.0.18 | Cobertura de código |
| Playwright | 1.58.2 | Tests E2E |
| Biome | 2.4.11 | Linting y formatting |
| Husky | 9.1.7 | Git hooks pre-commit |
| lint-staged | 16.4.0 | Lint solo en archivos staged |

> ❌ **NO se usa**: NestJS, Prisma, PostgreSQL, Auth.js/NextAuth, Redis, Docker Compose,
> Angular, yarn, pnpm, ni ninguna dependencia fuera de las listadas arriba.

---

## ⚠️ Leyes Inquebrantables

> **Para agentes de IA y desarrolladores**: Estas reglas tienen prioridad absoluta
> sobre cualquier patrón encontrado en código legacy, en la web o en conocimiento
> de entrenamiento previo.

### Ley 1 — Stack prohibido (NO cambiar bajo ninguna circunstancia)

```
❌ NestJS        → El backend es Express 5.2.1 puro
❌ Prisma        → La base de datos se accede solo con Mongoose 9.x
❌ PostgreSQL    → La base de datos es MongoDB
❌ Auth.js/NextAuth → La autenticación usa JWT directo con Zustand auth store
❌ pnpm / yarn   → El package manager es npm 10.9.4 exclusivamente
❌ middleware.ts  → El perímetro de seguridad es proxy.ts (ver Ley 3)
❌ Joi           → La validación usa Zod 4.x en backend y frontend
```

### Ley 2 — Mongoose: usar `127.0.0.1`, nunca `localhost`

Node.js 22+ resuelve `localhost` como `::1` (IPv6). MongoDB en Windows
no escucha IPv6 por defecto, lo que causa `ECONNREFUSED`.

```typescript
// ✅ CORRECTO — backend/src/config/db.ts
await mongoose.connect('mongodb://127.0.0.1:27017/cermont', {
  family: 4,                      // Forzar IPv4 explícito
  serverSelectionTimeoutMS: 5000,
  maxPoolSize: 10,
  minPoolSize: 2,
});

// ❌ INCORRECTO — causa ECONNREFUSED en Node 22+
await mongoose.connect('mongodb://localhost:27017/cermont');
```

### Ley 3 — `proxy.ts` es el perímetro de seguridad; `middleware.ts` está prohibido

Toda intercepción perimetral, redirección y RBAC ocurre en
`frontend/proxy.ts`. `middleware.ts` está **prohibido** — no crear
ni modificar ese archivo bajo ninguna circunstancia.

Las siguientes rutas deben estar siempre excluidas de la redirección a login:

```typescript
const PUBLIC_PATHS = [
  '/login', '/register', '/forgot-password', '/reset-password',
  '/_next',        // Assets estáticos Next.js
  '/api/auth',     // Callbacks de next-auth
  '/favicon.ico',
  '/sitemap.xml',
  '/.well-known',  // Chrome DevTools y browser internals
];
```

### Ley 4 — Tipos compartidos van en `@cermont/shared-types`, nunca duplicados

```typescript
// ✅ CORRECTO — importar desde el paquete compartido
import type { IOrdenTrabajo, IUser } from '@cermont/shared-types';

// ❌ INCORRECTO — duplicar interfaces en cada app
// backend/src/models/types.ts con la misma interfaz
// frontend/src/types/orden.ts con la misma interfaz
```

**Regla**: Si una interfaz o tipo es usado por backend Y frontend, vive
únicamente en `packages/shared-types/src/index.ts`.

### Ley 5 — Validación Zod antes de Mongoose en el backend, siempre

```typescript
// ✅ CORRECTO — Zod unificado en backend y frontend
const result = createOrderSchema.safeParse(req.body);
if (!result.success) return res.status(400).json({ success: false, error: result.error.errors[0].message });
await OrdenTrabajo.create(result.data);

// ❌ INCORRECTO
await OrdenTrabajo.create(req.body);
```

### Ley 6 — Validación Zod antes de cualquier mutación en el frontend

```typescript
// ✅ CORRECTO
const parsed = ordenSchema.safeParse(formData);
if (!parsed.success) return { success: false, error: parsed.error.message };
await createOrden(parsed.data);

// ❌ INCORRECTO
await createOrden(formData);
```

### Ley 7 — Contrato uniforme de respuesta en el backend

```typescript
// Toda ruta Express responde exactamente esto:
type ApiResponse<T = unknown> = {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
};
```

### Ley 8 — Un solo archivo de conexión a MongoDB

```typescript
// ✅ CORRECTO — único lugar para la conexión
import connectDB from '@/config/db';  // backend/src/config/db.ts

// ❌ INCORRECTO — no abrir conexiones fuera del archivo canónico
import mongoose from 'mongoose';
mongoose.connect(...);
```

### Ley 9 — npm exclusivo, lockfile único en la raíz

```
✅ package-lock.json en la RAÍZ del monorepo (único lockfile válido)
❌ pnpm-lock.yaml en cualquier parte   → ELIMINAR
❌ yarn.lock en cualquier parte        → ELIMINAR
❌ package-lock.json en backend/ o frontend/ → ELIMINAR (solo el de la raíz)
```

### Ley 10 — Next.js 16: APIs de contexto son asíncronas

```typescript
// ✅ CORRECTO — Next.js 16
const cookieStore = await cookies();
const headersList = await headers();
const { id } = await params;
const { q } = await searchParams;

// ❌ INCORRECTO — rompe en Next.js 16
const cookieStore = cookies();
const { id } = params;
```

### Ley 11 — Arquitectura de módulos por feature en el backend

El backend se organiza en **módulos por dominio de negocio** dentro de `backend/src/modules/`.
Cada módulo contiene su propia triada routes/controllers/services:

```
backend/src/modules/<feature>/
├── <feature>.routes.ts        → Endpoints + middleware binding
├── <feature>.controller.ts    → Capa HTTP delgada (req → service → res)
└── <feature>.service.ts       → Lógica de negocio pura (sin req/res)
```

**Reglas por capa (aplica dentro de cada módulo):**
- `*.routes.ts` — Solo wiring de endpoints y middlewares (authenticate → authorize → validateBody → controller)
- `*.controller.ts` — Solo manejo de Request/Response. Sin lógica de negocio.
- `*.service.ts` — Toda la lógica de negocio. Nunca acepta req, res, o next.
- `*.model.ts` — Schemas Mongoose (solo si el módulo necesita modelo propio)
- `middlewares/` — Auth, validación, rate limit (compartidos entre módulos)

**NO usar:** try/catch en controllers (Express 5 propaga errores nativamente).
**NO llamar** Mongoose desde routes o controllers — ir siempre a través de services.

---

## Roles RBAC (8 roles exactos)

Definidos en `@cermont/domain` y validados en `frontend/proxy.ts`.
Los strings son **case-sensitive**.

| Rol | Descripción |
|---|---|
| `gerente` | Acceso total, aprobaciones y reportes ejecutivos |
| `residente` | Gestión de órdenes, asignación de recursos y supervisión |
| `HES` | Coordinación de seguridad e inspecciones SGSST |
| `supervisor` | Supervisión de equipos y validación de ejecución |
| `operador` | Ejecución de tareas y manejo de equipos en campo |
| `tecnico` | Ejecución especializada y reportes técnicos |
| `administrativo` | Gestión de facturación y cierre administrativo |
| `cliente` | Visualización de órdenes y aprobaciones (solo lectura) |

---

## Arquitectura del Monorepo

```
cermont_aplicativo/
├── package.json                     ← npm workspaces: backend/ + frontend/ + packages/*
├── package-lock.json                ← Lockfile ÚNICO del monorepo
├── .gitignore                       ← Exclusiones globales centralizadas
│
├── backend/                         ← Express 5 + Mongoose (API REST modular)
│   ├── package.json                 ← name: "@cermont/backend"
│   ├── tsconfig.json
│   └── src/
│       ├── index.ts                 ← App composer: security middleware + API_MOUNTS (52 routes)
│       ├── server.ts                ← Bootstrap: validateEnv → connectDB → listen
│       ├── config/                  ← DB connection, env validation
│       ├── modules/                 ← **Feature modules** (cada uno con .routes/.controller/.service)
│       │   ├── auth/                ←   Autenticación JWT
│       │   ├── order/               ←   Órdenes de trabajo + workflow
│       │   ├── proposal/            ←   Propuestas comerciales
│       │   ├── work-requests/       ←   Solicitudes de servicio
│       │   ├── ...                  ←   40+ módulos adicionales
│       │   └── user/                ←   Gestión de usuarios
│       ├── common/                  ← Error hierarchy, middlewares, utils compartidos
│       ├── middlewares/              ← Rate limiting, upload validation
│       ├── tests/                   ← Tests de integración
│       └── services/                ← Servicios compartidos legacy
│
├── frontend/                        ← Next.js 16 App Router + React 19
│   ├── package.json                 ← name: "@cermont/frontend"
│   ├── tsconfig.json
│   ├── next.config.ts               ← Turbopack + rewrites al backend
│   ├── proxy.ts                     ← Perímetro de seguridad y RBAC (NO middleware.ts)
│   └── src/
│       ├── app/                     ← Rutas App Router (~80+ páginas)
│       ├── modules/                 ← Feature modules (hooks, api, ui)
│       ├── components/              ← Componentes Radix UI + Tailwind reutilizables
│       ├── lib/                     ← HTTP client, TanStack Query, offline helpers
│       └── store/                   ← Zustand stores
│
└── packages/
    └── shared-types/                ← Tipos e interfaces compartidas
        ├── package.json             ← name: "@cermont/shared-types"
        └── src/
            └── index.ts             ← Interfaces TypeScript y schemas Zod compartidos
```

---

## Inicio Rápido

### Pre-requisitos

- Node.js 22.13.1 o superior
- npm 10.9.4 o superior (incluido con Node.js 22+)
- MongoDB Community Server corriendo en `127.0.0.1:27017`

### Verificar MongoDB en Windows

```powershell
# Iniciar el servicio MongoDB (PowerShell como Administrador)
net start MongoDB

# Verificar que escucha en el puerto 27017
netstat -ano | findstr :27017
```

### Instalación y arranque

```bash
# 1. Clonar el repositorio
git clone https://github.com/JuanDiego30/cermont_aplicativo.git
cd cermont_aplicativo

# 2. Limpiar lockfiles conflictivos si existen (PowerShell)
Remove-Item -Path "backend\pnpm-lock.yaml" -ErrorAction SilentlyContinue
Remove-Item -Path "frontend\pnpm-lock.yaml" -ErrorAction SilentlyContinue
Remove-Item -Path "yarn.lock" -ErrorAction SilentlyContinue

# 3. Instalar todas las dependencias desde la raíz
npm install

# 4. Configurar variables de entorno
copy backend\.env.example backend\.env
copy frontend\.env.local.example frontend\.env.local
# Editar ambos archivos con tus valores

# 5. Cargar datos iniciales (usuarios, roles)
npm run seed -w backend

# 6. Levantar backend + frontend en paralelo
npm run dev
```

### Variables de entorno requeridas

```bash
# backend/.env
NODE_ENV=development
PORT=4000
MONGO_URI=mongodb://127.0.0.1:27017/cermont
JWT_SECRET=<generar con: openssl rand -base64 32>
FRONTEND_URL=http://localhost:3000
UPLOAD_DIR=./uploads
MAX_FILE_SIZE=10485760

# frontend/.env.local
NEXT_PUBLIC_API_URL=http://127.0.0.1:4000
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

---

## Scripts del Monorepo (raíz)

| Comando | Descripción |
|---|---|
| `npm run dev` | Backend + Frontend en paralelo (Turborepo) |
| `npm run build` | Build secuencial: shared-types → backend → frontend |
| `npm run typecheck` | TypeScript strict en todos los workspaces |
| `npm run lint` | Biome en todos los workspaces |
| `npm run test` | Vitest en backend y frontend |
| `npm run verify` | `typecheck` + `build` (pipeline completo) |
| `npm run ci:quality` | lint + typecheck (sin build) |
| `npm run clean` | Limpiar todos los artefactos de build |

## Scripts del Frontend (`frontend/`)

| Comando | Descripción |
|---|---|
| `npm run dev -w frontend` | Next.js dev con Turbopack |
| `npm run build -w frontend` | Build de producción |
| `npm run test -w frontend` | Vitest (unitarios) |
| `npm run test:ci -w frontend` | Vitest + cobertura V8 |
| `npm run test:e2e -w frontend` | Playwright E2E |
| `npm run lint -w frontend` | Biome |
| `npm run typecheck -w frontend` | TypeScript `--noEmit` |

## Scripts del Backend (`backend/`)

| Comando | Descripción |
|---|---|
| `npm run dev -w backend` | tsx watch (hot reload) |
| `npm run build -w backend` | Compilar TypeScript → `dist/` |
| `npm run start -w backend` | Ejecutar `dist/server.js` en producción |
| `npm run typecheck -w backend` | TypeScript `--noEmit` |
| `npm run test -w backend` | Vitest (unitarios) |

---

## Módulos de Negocio

| Módulo | Ruta frontend | Descripción |
|---|---|---|
| `orders` | `/orders`, `/orders/kanban` | CRUD órdenes de trabajo + Kanban + estados |
| `maintenance` | `/maintenance` | Mantenimientos preventivos, correctivos y programados |
| `evidences` | `/evidences` | Captura de evidencias fotográficas con trazabilidad |
| `proposals` | `/proposals` | Generación y seguimiento de propuestas comerciales |
| `costs` | `/costs/[trabajoId]` | Control de ejecución + comparativo presupuesto vs real |
| `documents` | `/documents` | Gestión de documentos adjuntos |
| `reports` | `/reports` | PDFs, informes técnicos y actas de entrega |
| `resources` | `/resources/kits` | Kits típicos de herramientas por tipo de actividad |
| `users` | `/admin/users` | Gestión de usuarios y perfiles (admin) |
| `auth` | `/login`, `/register` | Autenticación, autorización y sesiones |
| `dashboard` | `/dashboard` | KPIs, métricas y estado general de operaciones |

---

## Seguridad

- JWT emitidos por el backend (Express + jsonwebtoken) con refresh tokens
- Cookies HttpOnly + Secure + SameSite=Strict para refresh tokens
- RBAC con 8 roles validado en `proxy.ts`
- Rate limiting diferenciado: 20 req/15min en `/api/auth`, 100 req/min global
- Validación Zod 4.x en todas las rutas POST/PUT del backend (middleware)
- Validación Zod en todos los formularios del frontend (react-hook-form + zodResolver)
- Headers de seguridad via helmet 8.1.0 (CSP + HSTS + X-Frame-Options)
- CORS restringido al origen del frontend
- Sanitización NoSQL via express-mongo-sanitize
- Archivos procesados con sharp (imágenes) y validados antes de persistir

---

## PWA y Trabajo en Campo Offline

Soporte offline orientado a registro de actividades en campo sin conectividad.

**Capacidades:**
- Encolado offline de evidencias, estados de orden y costos en campo
- Sincronización automática al recuperar conectividad
- Banner visual para modo offline y estado de sincronización
- Página de fallback para navegación sin conexión

**Límites actuales:**
- Lectura offline no garantizada en todas las pantallas
- `/api/*` no se sirve desde caché (evita datos obsoletos o sensibles)
- Acciones con fallos repetidos quedan marcadas para revisión manual
- Instalación como PWA no está pulida aún

---

## Estado Documental

| Documento | Contenido |
|---|---|
| `docs/audits/00-master-audit.md` | Auditoría maestra del proyecto |
| `docs/audits/01-structure-audit.md` | Estructura de archivos y workspaces |
| `docs/audits/02-auth-runtime-audit.md` | Auth y runtime |
| `docs/audits/03-domain-gap-analysis.md` | Gaps por dominio de negocio |
| `docs/audits/04-pwa-offline-audit.md` | PWA y offline |
| `docs/audits/05-vps-deploy-audit.md` | VPS y despliegue |
| `docs/implementation/MASTER_REMEDIATION_PLAN.md` | Plan de remediación priorizado |
| `docs/implementation/BATCH_EXECUTION_BACKLOG.md` | Backlog P0/P1/P2 |
| `docs/implementation/TESTING_STRATEGY.md` | Estrategia de testing |

---

## Licencia

Propietario — Cermont S.A.S. © 2026

## Autoría y Derechos

BORRADOR TÉCNICO — requiere revisión jurídica antes de uso.

Desarrollo académico y técnico: Juan Diego Arévalo Pidiache.

Universidad de Pamplona.

Proyecto desarrollado para CERMONT S.A.S. en modalidad de trabajo de grado/práctica empresarial.

La titularidad patrimonial, permisos de uso, distribución y explotación deben revisarse según acuerdos con CERMONT S.A.S., Universidad de Pamplona y documentación contractual aplicable.

