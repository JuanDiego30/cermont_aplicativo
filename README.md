# Cermont - Sistema de Gestión de Órdenes de Trabajo

Sistema web para gestión de órdenes de trabajo y cierre administrativo.

## Stack

- **Frontend**: Next.js 14 + React 18 + TailwindCSS
- **Backend**: Node.js + Express.js + Prisma

## Requisitos

- Node.js >= 18
- PostgreSQL (o usar Docker)

## Instalación

```bash
# Instalar dependencias
npm run install:all

# Configurar variables de entorno
cp .env.example .env
# Editar .env con tus valores

# Iniciar base de datos con Docker (opcional)
docker run -d --name cermont-db -e POSTGRES_USER=cermont -e POSTGRES_PASSWORD=cermont123 -e POSTGRES_DB=cermont_db -p 5432:5432 postgres:16-alpine

# Ejecutar migraciones
cd apps/api && npm run migrate

# Iniciar desarrollo
npm run dev
```

## Estructura

```
cermont_aplicativo/
├── apps/
│   ├── api/    # Backend Express + Prisma
│   └── web/    # Frontend Next.js
└── .env.example
```

## Scripts

- `npm run dev` - Inicia API y Web
- `npm run dev:api` - Solo API (puerto 4000)
- `npm run dev:web` - Solo Web (puerto 3000)

## URLs

- Frontend: http://localhost:3000
- API: http://localhost:4000
- Health: http://localhost:4000/health
