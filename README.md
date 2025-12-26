# 🔧 Cermont - Sistema de Gestión de Mantenimiento

Sistema completo de gestión de órdenes de trabajo y mantenimiento con autenticación JWT, gestión de usuarios, roles y permisos (RBAC).

## 📋 Características

### Módulo de Autenticación ✅
- Login/Register con JWT
- Refresh tokens con rotación automática
- Rate limiting y protección contra brute force
- Bloqueo automático por intentos fallidos
- Validación de fuerza de contraseña (OWASP)
- Auditoría completa de accesos

### Módulo de Administración ✅
- CRUD completo de usuarios
- Gestión de roles y permisos
- Paginación y filtros avanzados
- Activar/desactivar usuarios
- Reseteo de contraseñas
- Revocación de tokens
- Estadísticas y logs de auditoría

### Módulo de Órdenes
- CRUD de órdenes de trabajo
- Asignación de técnicos
- Estados y workflows
- Reportes y estadísticas

## 🛠️ Stack Tecnológico

### Backend
- **NestJS** - Framework Node.js
- **Prisma** - ORM
- **PostgreSQL** - Base de datos
- **JWT** - Autenticación
- **Bcrypt** - Hash de contraseñas
- **Swagger** - Documentación API

### Frontend
- **Angular 19** - Framework
- **Tailwind CSS** - Estilos
- **Signals** - Estado reactivo
- **Standalone Components** - Arquitectura modular

## 🚀 Instalación

### Prerrequisitos
- Node.js 20+
- PostgreSQL 14+
- pnpm (recomendado) o npm

### Configuración

1. **Clonar repositorio**
```bash
git clone https://github.com/tu-usuario/cermont.git
cd cermont
```

2. **Instalar dependencias**
```bash
pnpm install
```

3. **Configurar variables de entorno**
```bash
# Backend
cp apps/api/.env.example apps/api/.env
```

4. **Configurar base de datos**
```bash
# Ejecutar migraciones
cd apps/api
npx prisma migrate dev

# Seed de datos iniciales
npx tsx prisma/seeds/seed.ts
```

5. **Iniciar servidores**
```bash
# Backend (http://localhost:3000)
cd apps/api && pnpm run dev

# Frontend (http://localhost:4200)
cd apps/web && pnpm run dev
```

## 👥 Usuarios de Prueba

Después del seed, tendrás estos usuarios disponibles:

| Email | Contraseña | Rol |
|-------|-----------|-----|
| admin@cermont.com | Admin@2025! | admin |
| supervisor@cermont.com | Supervisor@2025! | supervisor |
| tecnico1@cermont.com | Tecnico@2025! | tecnico |
| tecnico2@cermont.com | Tecnico@2025! | tecnico |

## 📚 Documentación

- **API Docs (Swagger):** http://localhost:3000/api/docs

## 🧪 Testing

```bash
# Unit tests
pnpm test

# E2E tests
pnpm test:e2e
```

## 📦 Estructura del Proyecto

```
cermont/
├── apps/
│   ├── api/                 # Backend NestJS
│   │   └── src/
│   │       ├── modules/
│   │       │   ├── auth/    # ✅ Autenticación
│   │       │   ├── admin/   # ✅ Administración
│   │       │   └── ordenes/ # Órdenes de trabajo
│   │       └── main.ts
│   └── web/                 # Frontend Angular
│       └── src/
│           ├── app/
│           │   ├── features/
│           │   │   ├── auth/  # Login/Register
│           │   │   ├── admin/ # Gestión usuarios
│           │   │   └── ordenes/
│           │   └── core/
│           └── styles/
└── prisma/
    ├── schema/
    └── migrations/
```

## 🔐 Seguridad

- Hash bcrypt con 12 rounds
- JWT con expiración configurable
- Refresh tokens con rotación
- Rate limiting en endpoints críticos
- Bloqueo automático de cuentas
- Validación exhaustiva de datos
- Auditoría completa de acciones

## 📝 Licencia

MIT

## 👨‍💻 Autor

Desarrollado con ❤️ para Cermont
