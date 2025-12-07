# 🏢 Cermont - Sistema de Gestión de Órdenes

## 📋 Descripción

Cermont es una aplicación web moderna para la gestión integral de órdenes de servicio, planeación, ejecución y seguimiento de proyectos. Construida con tecnologías modernas y mejores prácticas de desarrollo.

### Stack Tecnológico

**Frontend:**
- Next.js 16.0.7 (App Router)
- React 19
- TypeScript
- TailwindCSS 3.4
- Zustand 5.0.2 (State Management)
- @tanstack/react-query 5.62.0 (Server State)
- Zod 3.24 (Validación)

**Backend:**
- Node.js con Express 4.21
- TypeScript
- Prisma 6.19 (ORM)
- PostgreSQL
- JWT (Autenticación)
- Zod (Validación)

---

## 🚀 Quick Start

### Requisitos Previos
- Node.js >= 18.0.0
- npm >= 9.0.0
- PostgreSQL >= 12
- Git

### 1️⃣ Clonar Repositorio

```bash
git clone https://github.com/JuanDiego30/cermont_aplicativo.git
cd cermont_aplicativo
```

### 2️⃣ Instalar Dependencias

```bash
# Backend
cd api
npm install
cd ..

# Frontend
cd web
npm install
cd ..
```

### 3️⃣ Configurar Variables de Entorno

**Backend (api/.env):**
```bash
# Database
DATABASE_URL="postgresql://user:password@localhost:5432/cermont_db"

# JWT
JWT_SECRET="tu_secret_key_aqui"
JWT_REFRESH_SECRET="tu_refresh_secret_aqui"

# API
API_PORT=3001
NODE_ENV=development

# CORS
CORS_ORIGIN="http://localhost:3000"
```

**Frontend (web/.env.local):**
```bash
NEXT_PUBLIC_API_URL=http://localhost:3001/api
```

### 4️⃣ Configurar Base de Datos

```bash
cd api

# Crear base de datos
npx prisma db push

# Opcional: Generar datos de prueba
npx prisma db seed
```

### 5️⃣ Ejecutar en Desarrollo

#### Opción A: Terminales Separadas

**Terminal 1 - Backend:**
```bash
cd api
npm run dev
# Backend iniciará en: http://localhost:3001
# API disponible en: http://localhost:3001/api
```

**Terminal 2 - Frontend:**
```bash
cd web
npm run dev
# Frontend iniciará en: http://localhost:3000
```

#### Opción B: Ejecutar Ambas desde la Raíz

```bash
# Desde la raíz del proyecto
npm run dev

# O individualmente:
npm run dev:api    # Solo backend
npm run dev:web    # Solo frontend
```

---

## 📝 Scripts Disponibles

### Backend (api/)

```bash
npm run dev            # Desarrollo con hot-reload
npm run build          # Compilar a JavaScript
npm run start          # Ejecutar en producción
npm run type-check     # Verificar tipos TypeScript
npm run lint           # Linting con ESLint
npm run test           # Ejecutar tests
npm run prisma:studio  # Abrir Prisma Studio (UI de BD)
npm run prisma:migrate # Crear migrations
```

### Frontend (web/)

```bash
npm run dev            # Desarrollo con hot-reload
npm run build          # Build optimizado
npm run start          # Ejecutar build optimizado
npm run type-check     # Verificar tipos TypeScript
npm run lint           # Linting
npm run format         # Formatear código
```

---

## 🌐 Puertos y URLs

| Servicio | Puerto | URL | Notas |
|----------|--------|-----|-------|
| **Frontend** | 3000 | http://localhost:3000 | Next.js dev server |
| **Backend API** | 3001 | http://localhost:3001 | Express server |
| **API REST** | 3001 | http://localhost:3001/api | Endpoints de datos |
| **Prisma Studio** | 5555 | http://localhost:5555 | Interfaz gráfica de BD |
| **PostgreSQL** | 5432 | localhost:5432 | Base de datos |

---

## 🏗️ Estructura del Proyecto

```
cermont_aplicativo/
├── api/                          # Backend (Node.js + Express)
│   ├── src/
│   │   ├── modules/              # Features (auth, ordenes, usuarios)
│   │   │   ├── auth/
│   │   │   ├── ordenes/
│   │   │   └── usuarios/
│   │   ├── shared/               # Código compartido
│   │   │   ├── middleware/
│   │   │   ├── errors/
│   │   │   ├── utils/
│   │   │   └── types/
│   │   ├── config/               # Configuración
│   │   ├── app.ts                # Express app
│   │   └── server.ts             # Entry point
│   ├── prisma/
│   │   └── schema.prisma         # Modelo de datos
│   ├── package.json
│   ├── tsconfig.json
│   └── .env
│
├── web/                          # Frontend (Next.js + React)
│   ├── src/
│   │   ├── app/                  # App Router
│   │   │   ├── (auth)/           # Rutas de autenticación
│   │   │   ├── dashboard/        # Rutas del dashboard
│   │   │   └── layout.tsx
│   │   ├── components/           # Componentes reutilizables
│   │   │   ├── ui/               # Primitivos (button, input, etc)
│   │   │   ├── layout/           # Layout components
│   │   │   └── icons/            # Icon system
│   │   ├── features/             # Features (auth, ordenes, dashboard)
│   │   │   ├── auth/
│   │   │   ├── ordenes/
│   │   │   └── dashboard/
│   │   ├── lib/                  # Utilidades
│   │   │   ├── api-client.ts
│   │   │   ├── query-client.ts
│   │   │   └── utils.ts
│   │   ├── hooks/                # Custom hooks compartidos
│   │   ├── stores/               # Zustand stores (estado global)
│   │   ├── types/                # Tipos TypeScript
│   │   └── services/             # Servicios API
│   ├── package.json
│   ├── tsconfig.json
│   ├── tailwind.config.js
│   ├── next.config.js
│   └── .env.local
│
├── infra/                        # Infraestructura
│   └── docker-compose.yml        # Configuración Docker (opcional)
│
├── docs/                         # Documentación
│   └── API.md                    # Documentación de API
│
└── README.md                     # Este archivo
```

---

## 🔐 Autenticación

### Flujo de Login

1. Usuario ingresa credenciales (email + contraseña)
2. Backend valida y genera JWT
3. Frontend almacena token en localStorage
4. Token se envía en header `Authorization: Bearer <token>` en cada request

### Tipos de Usuarios

- **Admin:** Acceso total al sistema
- **Supervisor:** Gestión de órdenes y usuarios
- **Técnico:** Ejecución de órdenes asignadas
- **Administrativo:** Visualización de reportes

---

## 📊 Módulos Principales

### 1. Módulo de Autenticación (`features/auth`)
- Login / Registro
- Recuperación de contraseña
- Gestión de sesiones
- Tokens JWT con refresh

### 2. Módulo de Órdenes (`features/ordenes`)
- CRUD de órdenes
- Filtros y búsqueda
- Cambio de estado
- Asignación de técnicos
- Items y costos

### 3. Módulo de Usuarios (`features/usuarios`)
- Gestión de usuarios
- Roles y permisos
- Perfil de usuario

### 4. Dashboard
- Métricas y estadísticas
- Órdenes recientes
- Gráficos de desempeño
- Reportes

---

## 🧪 Testing

```bash
# Backend
cd api
npm run test              # Unit tests
npm run test:watch       # Watch mode

# Frontend
cd web
npm run test              # Jest tests
npm run test:watch       # Watch mode
```

---

## 📦 Build para Producción

### Backend

```bash
cd api
npm run build
npm start
```

### Frontend

```bash
cd web
npm run build
npm start
```

---

## 🐳 Docker (Opcional)

```bash
# Construir imágenes
docker-compose build

# Levantar servicios
docker-compose up

# Detener servicios
docker-compose down
```

---

## 🔧 Troubleshooting

### Puerto 3000 / 3001 ya está en uso

```bash
# Windows - Encontrar proceso en puerto
netstat -ano | findstr :<PUERTO>
taskkill /PID <PID> /F

# macOS/Linux
lsof -ti:<PUERTO> | xargs kill -9
```

### Base de datos no se conecta

1. Verificar que PostgreSQL está corriendo
2. Verificar DATABASE_URL en `.env`
3. Recrear la BD: `npx prisma db push`

### Errores de TypeScript

```bash
# Frontend
cd web
npm run type-check

# Backend
cd api
npm run type-check
```

---

## 📚 Documentación Adicional

- [API Reference](./docs/API.md)
- [Estructura de Tipos](./docs/TYPES.md)
- [Guía de Contribución](./docs/CONTRIBUTING.md)
- [Archivos de Configuración](./docs/CONFIG.md)

---

## 👥 Autores

**Juan Diego López**
- GitHub: [@JuanDiego30](https://github.com/JuanDiego30)

---

## 📄 Licencia

Este proyecto está bajo la Licencia MIT.

---

## 🤝 Contribuir

Las contribuciones son bienvenidas. Por favor:

1. Fork el proyecto
2. Crea una rama feature (`git checkout -b feature/AmazingFeature`)
3. Commit cambios (`git commit -m 'Add AmazingFeature'`)
4. Push a la rama (`git push origin feature/AmazingFeature`)
5. Abre un Pull Request

---

## 📞 Soporte

Para reportar issues o solicitar features, abre un issue en el repositorio.

---

## ⚡ Últimas Actualizaciones

- ✅ Refactorización completa del código (Diciembre 2025)
- ✅ Implementación del patrón Repository
- ✅ Migración a React Query para estado del servidor
- ✅ Estructura feature-based
- ✅ TypeScript con tipos completos
- ✅ Zustand para estado global
- ✅ Sistema de autenticación JWT mejorado

