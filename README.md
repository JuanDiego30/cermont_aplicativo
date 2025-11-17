# ??? CERMONT ATG - Sistema de Gestión de Órdenes de Trabajo

> Sistema integral para empresas de mantenimiento industrial. Control total de proyectos, ejecución en campo y reportes técnicos automáticos.

## ?? Descripción

CERMONT ATG es una plataforma desarrollada en **Node.js + Next.js** que permite gestionar órdenes de trabajo, coordinar equipos de campo, generar reportes y mantener auditoría completa de operaciones.

## ? Características

- ? **Gestión de Órdenes** - Crear, asignar y seguir órdenes de trabajo
- ? **Dashboard Ejecutivo** - KPIs y métricas en tiempo real
- ? **Trabajo Offline** - Funciona sin conexión a internet
- ? **Reportes Automáticos** - Generación de PDF profesionales
- ? **Seguridad** - JWT, RBAC, auditoría completa
- ? **Soporte 24/7** - Equipo técnico disponible

## ??? Stack Tecnológico

### Backend
- **Runtime**: Node.js v20+
- **Framework**: Express.js
- **Database**: SQLite (Prisma ORM)
- **Auth**: JWT + Bcrypt
- **API**: REST + Tipos TypeScript

### Frontend
- **Framework**: Next.js 16 (Turbopack)
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
git clone https://github.com/cermont/cermont-atg.git
cd cermont-atg
```

### 2. Instalación
```bash
npm install
npm run setup  # Compila + seedea BD
```

### 3. Desarrollo
```bash
npm run dev
```

Luego:
- Frontend: http://localhost:3000/login
- Backend API: http://localhost:5000/api
- Credenciales:
  - Email: `admin@cermont.com`
  - Password: `Admin123!`

### 4. Build Producción
```bash
npm run build
npm start
```

## ?? Estructura del Proyecto

```
cermont-atg/
??? backend/              ? API Express
?   ??? src/
?   ?   ??? app.ts
?   ?   ??? server.ts
?   ?   ??? domain/       ? Lógica de negocio
?   ?   ??? infra/        ? BD, HTTP, servicios
?   ?   ??? shared/       ? Utilidades comunes
?   ??? prisma/           ? Migraciones BD
?   ??? package.json
?
??? frontend/             ? App Next.js
?   ??? app/              ? Rutas App Router
?   ??? components/       ? Componentes React
?   ??? lib/              ? Hooks, API client
?   ??? package.json
?
??? scripts/              ? Scripts de utilidad
?   ??? dev.sh           ? Desarrollo
?   ??? prod.sh          ? Producción
?
??? docs/                 ? Documentación
?   ??? DEPLOYMENT.md
?   ??? API.md
?   ??? ARQUITECTURA.md
?
??? package.json          ? Root monorepo
```

## ?? Documentación

- [??? Arquitectura](./docs/ARQUITECTURA.md)
- [?? Deployment a VPS](./docs/DEPLOYMENT.md)
- [?? API Reference](./docs/API.md)
- [?? Desarrollo](./docs/DESARROLLO.md)

## ?? Testing

```bash
# Tests de integración
npm run test

# Watch mode
npm run test:watch

# Coverage
npm run test -- --coverage
```

## ?? Variables de Entorno

### Backend (.env)
```
PORT=5000
NODE_ENV=development
DATABASE_URL="file:./prisma/dev.db"
CORS_ORIGIN=http://localhost:3000
JWT_SECRET=tu_clave_secreta_aqui
```

### Frontend (.env.local)
```
NEXT_PUBLIC_API_URL=http://localhost:5000/api
NEXT_PUBLIC_API_TIMEOUT=30000
```

## ?? Usuarios de Prueba

| Email | Password | Rol |
|-------|----------|-----|
| `root@cermont.com` | `Root123!` | ROOT |
| `admin@cermont.com` | `Admin123!` | ADMIN |
| `coordinador@cermont.com` | `Coord123!` | COORDINADOR |
| `test@cermont.com` | `Test1234!` | OPERARIO |

## ?? Deployment

### VPS (Recomendado)
Ver [DEPLOYMENT.md](./docs/DEPLOYMENT.md)

### Docker
```bash
docker-compose up -d
```

### Vercel + Railway
- Frontend ? Vercel
- Backend ? Railway

## ?? Troubleshooting

### npm run dev falla
```bash
rm -rf node_modules package-lock.json
npm install
npm run dev
```

### CORS error
Verificar `CORS_ORIGIN` en `backend/.env`

### BD bloqueada
```bash
rm backend/prisma/dev.db*
npm run db:seed
```

## ?? Contribuir

1. Fork el repositorio
2. Crea rama: `git checkout -b feature/MiFeature`
3. Commit: `git commit -am 'Add feature'`
4. Push: `git push origin feature/MiFeature`
5. Pull Request

## ?? Soporte

- Email: support@cermont.com
- Teléfono: +57 (XXX) XXX-XXXX
- Horas: Lunes-Viernes 8:00-17:00 (COT)

## ?? Licencia

Todos los derechos reservados © 2024 Cermont SAS

## ?? Agradecimientos

- Team Cermont
- Open Source Community
- Clientes y Partners

---

**Status**: ?? Producción lista
**Última actualización**: 2024-11-17
**Versión**: 1.0.0
