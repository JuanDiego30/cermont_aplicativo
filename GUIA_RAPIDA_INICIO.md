# ?? GUÍA RÁPIDA - CÓMO INICIAR EL PROYECTO

## 1?? Prerequisitos

```
? Node.js >= 20.0.0
? npm >= 10.0.0
? Git
```

Verificar versiones:
```bash
node --version
npm --version
```

## 2?? Primera Vez (Setup Inicial)

```bash
# Clonar o descargar el repositorio
cd aplicativo_cermont_prueba/cermont_aplicativo

# Instalar todas las dependencias (root + workspaces)
npm install

# Generar Prisma Client y JWKS
npm run postinstall
```

**Tiempo estimado**: 3-5 minutos

## 3?? Iniciar Desarrollo

### Opción A: Ambos servicios (Recomendado)
```bash
npm run dev
```

Output esperado:
```
[BACKEND] ?? Servidor backend ejecutándose en http://localhost:5000
[FRONTEND] ? Ready in 2.4s
[FRONTEND] Local:   http://localhost:3000
```

### Opción B: Solo Backend
```bash
npm run dev:backend
```

### Opción C: Solo Frontend  
```bash
npm run dev:frontend
```

## 4?? Verificar que Todo Funciona

### Backend
```
GET http://localhost:5000/api/health
```
Respuesta esperada:
```json
{
  "status": "ok",
  "environment": "development"
}
```

### Frontend
```
Abrir http://localhost:3000 en el navegador
```

### Login
- **Email**: `admin@cermont.com`
- **Password**: `Test@1234`

## 5?? Estructura de Carpetas

```
cermont_aplicativo/
??? backend/              # Servidor Express + TypeScript
?   ??? src/
?   ?   ??? app/         # Casos de uso (Use Cases)
?   ?   ??? domain/      # Entidades y interfaces
?   ?   ??? infra/       # Controllers, Routes, DB
?   ?   ??? shared/      # Middlewares y utilidades
?   ??? prisma/          # Schema de BD
?   ??? package.json
?
??? frontend/            # App Next.js
?   ??? app/             # Rutas (App Router)
?   ??? components/      # Componentes React
?   ??? lib/             # Lógica (hooks, API, tipos)
?   ??? package.json
?
??? package.json         # Root (workspaces)
```

## 6?? Scripts Disponibles

```bash
# Development
npm run dev              # Frontend + Backend simultáneamente
npm run dev:backend     # Solo backend
npm run dev:frontend    # Solo frontend

# Building
npm run build            # Build ambos
npm run build:backend   # Build backend
npm run build:frontend  # Build frontend

# Production
npm run start            # Start backend + frontend (prod)
npm run start:backend   # Start solo backend
npm run start:frontend  # Start solo frontend

# Database
npm run db:seed         # Seedear datos iniciales
npm run db:reset        # Resetear base de datos

# Testing & Quality
npm run test            # Ejecutar tests
npm run lint            # Verificar linting
npm run type-check      # Verificar tipos TypeScript
```

## 7?? Endpoints Principales

### Autenticación
```
POST   /api/auth/login
POST   /api/auth/refresh
POST   /api/auth/logout
GET    /api/auth/profile
```

### Órdenes
```
GET    /api/orders                    # Listar
GET    /api/orders/:id               # Obtener una
POST   /api/orders                   # Crear
PUT    /api/orders/:id               # Actualizar
DELETE /api/orders/:id               # Eliminar
POST   /api/orders/:id/transition    # Cambiar estado
```

### Dashboard
```
GET    /api/dashboard/metrics        # KPIs y estadísticas
```

### Kits
```
GET    /api/kits                     # Listar
POST   /api/kits                     # Crear
```

### Checklists
```
GET    /api/checklists               # Listar plantillas
POST   /api/checklists               # Crear plantilla
```

## 8?? Variables de Entorno

### Backend (.env)
```
NODE_ENV=development
PORT=5000
DB_URL=file:./prisma/dev.db
JWT_PRIVATE_KEY=./config/jwks-private.json
JWT_PUBLIC_KEY=./config/jwks-public.json
```

### Frontend (.env.local)
```
NEXT_PUBLIC_API_URL=http://localhost:5000/api
```

## 9?? Solución de Problemas

### "Port 3000 is already in use"
```bash
# Windows
netstat -ano | findstr :3000
taskkill /PID <PID> /F

# Mac/Linux
lsof -i :3000
kill -9 <PID>
```

### "Cannot find module 'date-fns'"
```bash
npm install -w frontend
```

### "Prisma Client not found"
```bash
npm run postinstall
```

### "Build error: Invalid count value"
```bash
rm -rf frontend/.next
npm run build:frontend
```

### Database locked
```bash
npm run db:reset
```

## ?? Desarrollo Diario

```bash
# 1. Asegurar que todo está actualizado
npm install

# 2. Iniciar services
npm run dev

# 3. Hacer cambios en backend/frontend (hot reload automático)

# 4. Probar en browser
# Backend: http://localhost:5000/api/health
# Frontend: http://localhost:3000

# 5. Commitar cambios
git add .
git commit -m "feat: descripción"
git push origin main

# 6. Detener con Ctrl+C
```

## 1??1?? Testing

```bash
# Tests backend
npm run test

# Tests con watch mode
npm run test:watch

# Type checking
npm run type-check

# Linting
npm run lint

# Formato automático
npm run format
```

## 1??2?? Build & Deploy

```bash
# Build producción
npm run build

# Verificar build local
npm run start

# Deploy (ver guía_deployment_vps.md)
```

---

**? Tip**: Mantén ambas terminales abiertas (una para backend, otra para frontend) para ver los logs en tiempo real.

**?? Soporte**: Si algo no funciona, revisa los logs en la terminal antes de hacer commit.
