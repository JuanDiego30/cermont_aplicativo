# Cermont ATG Frontend

Sistema de gestión de trabajos para CERMONT SAS

## Estructura del Proyecto

```
apps/frontend/
├── public/
│   ├── logo-cermont.png
│   └── favicon.ico
├── src/
│   ├── app/                         # Next.js App Router
│   │   ├── (auth)/                  # Grupo de autenticación
│   │   │   ├── login/
│   │   │   │   └── page.tsx
│   │   │   └── layout.tsx           # Layout auth (con background)
│   │   ├── (dashboard)/             # Grupo dashboard
│   │   │   ├── dashboard/
│   │   │   │   └── page.tsx
│   │   │   ├── workplans/
│   │   │   │   └── page.tsx
│   │   │   ├── orders/
│   │   │   ├── users/
│   │   │   ├── reports/
│   │   │   ├── cctv/
│   │   │   └── layout.tsx           # Layout dashboard (sin background)
│   │   ├── layout.tsx               # Root layout
│   │   ├── page.tsx                 # Redirect a /login
│   │   ├── globals.css              # Único archivo de estilos globales
│   │   └── not-found.tsx            # Página 404 personalizada
│   │
│   ├── components/                  # Componentes reutilizables
│   │   ├── layout/                  # Componentes de layout
│   │   │   ├── AppShell.tsx
│   │   │   ├── Header.tsx
│   │   │   ├── Sidebar.tsx
│   │   │   └── index.ts             # Barrel export
│   │   ├── shared/                  # Componentes compartidos
│   │   │   ├── AppBackground.tsx    # Background animado
│   │   │   ├── SkeletonCard.tsx
│   │   │   ├── EmptyState.tsx
│   │   │   └── index.ts
│   │   └── ui/                      # shadcn/ui components
│   │       ├── button.tsx
│   │       ├── input.tsx
│   │       ├── label.tsx
│   │       ├── LiquidEther.tsx      # Efecto visual
│   │       └── index.ts
│   │
│   ├── features/                    # Features por dominio
│   │   └── workplans/               # Feature completa
│   │       ├── components/          # Componentes específicos
│   │       ├── hooks/               # Hooks del feature
│   │       ├── schemas/             # Validaciones Zod
│   │       ├── services/            # Servicios API del feature
│   │       └── index.ts             # Barrel export
│   │
│   ├── lib/                         # Utilities y configuración
│   │   ├── api/
│   │   │   └── client.ts            # Cliente Axios configurado
│   │   ├── auth/                    # Autenticación
│   │   │   ├── AuthContext.tsx
│   │   │   ├── useLoginForm.ts
│   │   │   ├── login-schema.ts
│   │   │   └── index.ts
│   │   ├── query/                   # React Query setup
│   │   │   └── react-query.tsx
│   │   └── utils/                   # Utilidades generales
│   │       ├── error-handler.ts     # Parse errores API
│   │       ├── helpers.ts
│   │       └── index.ts
│   │
│   ├── services/                    # Servicios globales
│   │   ├── dashboard.service.ts
│   │   ├── auth.service.ts
│   │   └── index.ts
│   │
│   ├── types/                       # Tipos globales
│   │   ├── api.types.ts
│   │   ├── user.types.ts
│   │   └── index.ts
│   │
│   └── middleware.ts                # Middleware de Next.js
│
├── .env.local                       # Variables de entorno
├── .gitignore
├── next.config.ts
├── package.json
├── tailwind.config.ts
├── tsconfig.json
└── README.md
```

## Convenciones

### Nomenclatura
- **Componentes**: `PascalCase.tsx` (`LoginPage.tsx`)
- **Hooks**: `camelCase.ts` (`useLoginForm.ts`)
- **Utilities**: `kebab-case.ts` (`error-handler.ts`)
- **Types**: `PascalCase.types.ts` (`workplan.types.ts`)
- **Services**: `kebab-case.service.ts` (`dashboard.service.ts`)

### Estructura de Features
Cada feature debe tener:
```
features/[name]/
├── components/      # Componentes específicos
├── hooks/          # Hooks del feature
├── schemas/        # Validaciones Zod
├── services/       # Servicios API
└── index.ts        # Barrel export
```

## Scripts

```bash
# Desarrollo
npm run dev

# Build producción
npm run build

# Servidor producción
npm run start

# Linting
npm run lint

# TypeScript check
npm run typecheck
```

## Tecnologías

- **Framework**: Next.js 14 (App Router)
- **Lenguaje**: TypeScript
- **Styling**: Tailwind CSS
- **UI**: shadcn/ui + Radix UI
- **State**: React Query + Zustand
- **Forms**: React Hook Form + Zod
- **Backend**: Socket.io + REST API

## Desarrollo

1. Instalar dependencias: `npm install`
2. Configurar variables de entorno en `.env.local`
3. Ejecutar desarrollo: `npm run dev`
4. Visitar: `http://localhost:3000`

## Despliegue

```bash
npm run build
npm run start
```
