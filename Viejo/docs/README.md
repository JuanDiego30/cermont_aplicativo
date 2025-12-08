# 🚀 CERMONT - Sistema de Gestión de Órdenes de Trabajo

## Descripción

CERMONT es un sistema empresarial completo para la gestión de órdenes de trabajo, mantenimiento preventivo y correctivo, diseñado para operaciones industriales. Proporciona una plataforma integral para gestionar activos, equipos, personal técnico y el ciclo completo de órdenes de trabajo.

## 🏗️ Arquitectura

```
┌─────────────────────────────────────────────────────────────────┐
│                        LOAD BALANCER                            │
│                    (NGINX / Kubernetes Ingress)                 │
└─────────────────────────────────────────────────────────────────┘
                                 │
          ┌──────────────────────┼──────────────────────┐
          ▼                      ▼                      ▼
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│    Frontend     │    │    Frontend     │    │    Frontend     │
│    (Next.js)    │    │    (Next.js)    │    │    (Next.js)    │
│   Port: 3000    │    │   Port: 3000    │    │   Port: 3000    │
└─────────────────┘    └─────────────────┘    └─────────────────┘
          │                      │                      │
          └──────────────────────┼──────────────────────┘
                                 ▼
┌─────────────────────────────────────────────────────────────────┐
│                        API GATEWAY                              │
│                     (Express.js + Socket.IO)                    │
└─────────────────────────────────────────────────────────────────┘
          │                      │                      │
          ▼                      ▼                      ▼
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│    Backend      │    │    Backend      │    │    Backend      │
│  (Node.js API)  │    │  (Node.js API)  │    │  (Node.js API)  │
│   Port: 4000    │    │   Port: 4000    │    │   Port: 4000    │
└─────────────────┘    └─────────────────┘    └─────────────────┘
          │                      │                      │
          └──────────────────────┼──────────────────────┘
                                 │
          ┌──────────────────────┼──────────────────────┐
          ▼                      ▼                      ▼
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   PostgreSQL    │    │     Redis       │    │  Elasticsearch  │
│    Database     │    │     Cache       │    │     Logging     │
│   Port: 5432    │    │   Port: 6379    │    │   Port: 9200    │
└─────────────────┘    └─────────────────┘    └─────────────────┘
```

## 🛠️ Stack Tecnológico

### Backend
- **Runtime**: Node.js 20 LTS
- **Framework**: Express.js con TypeScript
- **ORM**: Prisma 5.x
- **Base de Datos**: PostgreSQL 15
- **Cache**: Redis 7
- **Autenticación**: JWT + Passport.js
- **Validación**: Zod
- **Documentación API**: Swagger/OpenAPI

### Frontend
- **Framework**: Next.js 14 (App Router)
- **UI Library**: React 18
- **Estilos**: TailwindCSS 3
- **Estado**: Zustand + React Query (TanStack)
- **Formularios**: React Hook Form + Zod
- **Componentes**: Radix UI + shadcn/ui
- **Gráficos**: Recharts

### DevOps
- **Contenedores**: Docker + Docker Compose
- **Orquestación**: Kubernetes (K8s)
- **CI/CD**: GitHub Actions
- **Monitoreo**: Prometheus + Grafana
- **Logging**: ELK Stack (Elasticsearch, Logstash, Kibana)
- **Error Tracking**: Sentry

## 📁 Estructura del Proyecto

```
cermont_aplicativo/
├── backend/
│   ├── src/
│   │   ├── config/          # Configuración (DB, Redis, Auth)
│   │   ├── features/        # Módulos por dominio
│   │   │   ├── auth/        # Autenticación
│   │   │   ├── usuarios/    # Gestión de usuarios
│   │   │   ├── ordenes/     # Órdenes de trabajo
│   │   │   ├── equipos/     # Gestión de equipos
│   │   │   ├── activos/     # Gestión de activos
│   │   │   └── reportes/    # Reportes y analytics
│   │   ├── shared/          # Código compartido
│   │   │   ├── middleware/  # Middlewares
│   │   │   ├── utils/       # Utilidades
│   │   │   └── types/       # Tipos TypeScript
│   │   └── index.ts         # Entry point
│   ├── prisma/
│   │   ├── schema.prisma    # Esquema de DB
│   │   └── migrations/      # Migraciones
│   ├── tests/               # Tests unitarios e integración
│   ├── Dockerfile           # Imagen Docker dev
│   └── Dockerfile.prod      # Imagen Docker producción
│
├── frontend/
│   ├── src/
│   │   ├── app/             # App Router (páginas)
│   │   ├── components/      # Componentes React
│   │   │   ├── ui/          # Componentes base
│   │   │   └── features/    # Componentes de negocio
│   │   ├── hooks/           # Custom hooks
│   │   ├── lib/             # Utilidades
│   │   ├── services/        # API clients
│   │   ├── stores/          # Estado global (Zustand)
│   │   └── types/           # Tipos TypeScript
│   ├── public/              # Assets estáticos
│   └── Dockerfile           # Imagen Docker
│
├── k8s/                     # Manifiestos Kubernetes
│   ├── api/                 # Deployment API
│   ├── web/                 # Deployment Frontend
│   ├── database/            # StatefulSet PostgreSQL
│   └── redis/               # Deployment Redis
│
├── monitoring/              # Configuración monitoreo
│   ├── prometheus.yml
│   ├── alertmanager.yml
│   └── logstash.conf
│
├── .github/
│   └── workflows/           # GitHub Actions
│       └── main.yml         # Pipeline CI/CD
│
├── docker-compose.yml       # Desarrollo local
├── docker-compose.prod.yml  # Producción
└── docker-compose.elk.yml   # Stack de monitoreo
```

## 🚀 Inicio Rápido

### Prerrequisitos

- Node.js 20+
- Docker y Docker Compose
- Git

### Instalación Local

```bash
# Clonar repositorio
git clone https://github.com/cermont/cermont-app.git
cd cermont-app

# Iniciar servicios con Docker Compose
docker-compose up -d

# Instalar dependencias backend
cd backend
npm install
npx prisma generate
npx prisma migrate dev

# Instalar dependencias frontend
cd ../frontend
npm install

# Iniciar en modo desarrollo
# Terminal 1 - Backend
cd backend && npm run dev

# Terminal 2 - Frontend
cd frontend && npm run dev
```

### Variables de Entorno

#### Backend (.env)
```env
# Database
DATABASE_URL="postgresql://cermont:cermont@localhost:5432/cermont?schema=public"

# Redis
REDIS_URL="redis://localhost:6379"

# JWT
JWT_SECRET="your-super-secret-key-change-in-production"
JWT_EXPIRES_IN="7d"

# Server
PORT=4000
NODE_ENV=development

# Sentry (opcional)
SENTRY_DSN="https://xxx@sentry.io/xxx"

# Push Notifications (opcional)
VAPID_PUBLIC_KEY="xxx"
VAPID_PRIVATE_KEY="xxx"
```

#### Frontend (.env.local)
```env
NEXT_PUBLIC_API_URL=http://localhost:4000
NEXT_PUBLIC_WS_URL=ws://localhost:4000
NEXT_PUBLIC_APP_NAME=CERMONT
```

## 📚 Documentación API

La documentación completa de la API está disponible en:

- **Desarrollo**: http://localhost:4000/api-docs
- **Producción**: https://api.cermont.com/api-docs

### Endpoints Principales

| Método | Endpoint | Descripción |
|--------|----------|-------------|
| POST | `/api/v1/auth/login` | Iniciar sesión |
| POST | `/api/v1/auth/register` | Registrar usuario |
| GET | `/api/v1/ordenes` | Listar órdenes |
| POST | `/api/v1/ordenes` | Crear orden |
| GET | `/api/v1/ordenes/:id` | Obtener orden |
| PATCH | `/api/v1/ordenes/:id` | Actualizar orden |
| GET | `/api/v1/equipos` | Listar equipos |
| GET | `/api/v1/activos` | Listar activos |
| GET | `/api/v1/reportes/dashboard` | Dashboard KPIs |

## 🐳 Docker

### Desarrollo
```bash
# Iniciar todos los servicios
docker-compose up -d

# Ver logs
docker-compose logs -f

# Detener servicios
docker-compose down
```

### Producción
```bash
# Construir imágenes
docker-compose -f docker-compose.prod.yml build

# Iniciar en producción
docker-compose -f docker-compose.prod.yml up -d
```

### Stack de Monitoreo
```bash
# Iniciar ELK + Prometheus + Grafana
docker-compose -f docker-compose.elk.yml up -d

# Acceso:
# - Kibana: http://localhost:5601
# - Grafana: http://localhost:3002
# - Prometheus: http://localhost:9090
```

## ☸️ Kubernetes

### Despliegue en Kubernetes
```bash
# Aplicar todos los manifiestos
kubectl apply -k k8s/

# Verificar estado
kubectl get pods -n cermont
kubectl get services -n cermont

# Ver logs
kubectl logs -f deployment/api -n cermont
```

### Escalar pods
```bash
# Escalar manualmente
kubectl scale deployment/api --replicas=5 -n cermont

# El HPA escala automáticamente basado en:
# - CPU > 70%
# - Memory > 80%
# - RPS > 1000
```

## 🧪 Testing

```bash
# Backend - Tests unitarios
cd backend
npm run test

# Backend - Tests con coverage
npm run test:coverage

# Backend - Tests e2e
npm run test:e2e

# Frontend - Tests
cd frontend
npm run test
```

## 📊 Monitoreo

### Métricas Disponibles
- `http_requests_total` - Total de requests HTTP
- `http_request_duration_seconds` - Duración de requests
- `db_connection_pool_used` - Conexiones DB activas
- `db_query_duration_seconds` - Duración de queries

### Alertas Configuradas
- API Down (> 1 min)
- High Error Rate (> 5%)
- Slow Response (> 2s promedio)
- Database Pool Exhausted (> 90%)
- Disk Space Low (> 85%)

## 🔐 Seguridad

- Autenticación JWT con refresh tokens
- Rate limiting por IP y usuario
- CORS configurado por ambiente
- Helmet.js para headers de seguridad
- Validación de entrada con Zod
- Sanitización de queries SQL (Prisma)
- Secrets en Kubernetes Secrets

## 🤝 Contribución

Ver [CONTRIBUTING.md](./CONTRIBUTING.md) para guías de contribución.

## 📄 Licencia

Este proyecto es software propietario de CERMONT. Todos los derechos reservados.

## 📞 Soporte

- **Email**: soporte@cermont.com
- **Documentación**: https://docs.cermont.com
- **Issues**: https://github.com/cermont/cermont-app/issues
