# 🏢 CERMONT - Sistema de Gestión de Órdenes de Trabajo

Sistema empresarial integral para gestión de órdenes de trabajo, evidencias, formularios dinámicos y reportes para servicios de refrigeración industrial.

## 🚀 Inicio Rápido

### Desarrollo Local

```bash
# 1. Clonar repositorio
git clone https://github.com/JuanDiego30/cermont_aplicativo.git
cd cermont_aplicativo

# 2. Backend
cd apps/api
cp .env.example .env  # Configurar variables
npm install --legacy-peer-deps
npx prisma generate
npx prisma migrate dev
npm run dev

# 3. Frontend (nueva terminal)
cd apps/web
npm install --legacy-peer-deps
npm run dev

# 4. Abrir en navegador
# http://localhost:4200
```

### Despliegue en VPS

Ver guía completa: [DEPLOY_VPS.md](./DEPLOY_VPS.md)

```bash
./deploy.sh setup
```

---

## 🏗️ Arquitectura

### Tech Stack

| Capa | Tecnología | Versión |
|------|-----------|----------|
| **Frontend** | Angular | 21+ |
| **Backend** | NestJS | 11+ |
| **BD** | PostgreSQL | 16+ |
| **ORM** | Prisma | 5+ |
| **Estilos** | Tailwind CSS | 4+ |
| **Contenedores** | Docker | 25+ |

### Estructura del Proyecto

```
cermont_aplicativo/
├── apps/
│   ├── api/                 # Backend NestJS
│   │   ├── src/
│   │   │   ├── modules/     # Módulos de negocio
│   │   │   ├── common/      # Utilidades compartidas
│   │   │   └── prisma/      # Cliente Prisma
│   │   └── prisma/          # Schema y migraciones
│   │
│   └── web/                 # Frontend Angular
│       └── src/
│           └── app/
│               ├── core/        # Guards, interceptors
│               ├── shared/      # Componentes reutilizables
│               └── features/    # Módulos de funcionalidades
│
├── nginx/                   # Configuración Nginx
├── docker-compose.yml       # Desarrollo
├── docker-compose.prod.yml  # Producción
└── deploy.sh               # Script de despliegue
```

---

## 📋 Funcionalidades Principales

### 🔐 Autenticación
- Login/Registro con JWT
- Refresh Tokens automático
- Recuperación de contraseña
- Autenticación 2FA (opcional)

### 📝 Gestión de Órdenes (14 Pasos)
1. Solicitud recibida
2. Visita técnica programada
3. Propuesta económica elaborada
4. Propuesta aprobada
5. Planeación iniciada/aprobada
6. Ejecución iniciada/completada
7. Informe generado
8. Acta elaborada/firmada
9. SES aprobada
10. Factura aprobada
11. Pago recibido

### 📄 Formularios Dinámicos
- Creación de checklists personalizados
- Templates reutilizables
- Inspecciones HES (Seguridad en Alturas)
- Formularios de mantenimiento

### 📸 Evidencias
- Subida de fotos/documentos
- Organización por orden
- Thumbnails automáticos

### 📊 Dashboard
- KPIs en tiempo real
- Estadísticas de órdenes
- Alertas automáticas

---

## 🔧 Scripts Disponibles

### Backend (apps/api)
```bash
npm run dev          # Desarrollo con hot-reload
npm run build        # Build de producción
npm run start:prod   # Iniciar producción
npm run test         # Tests unitarios
npm run lint         # Linter
```

### Frontend (apps/web)
```bash
npm run dev          # Desarrollo
npm run build        # Build de producción
npm run test         # Tests
npm run lint         # Linter
```

### Despliegue
```bash
./deploy.sh setup    # Configuración inicial
./deploy.sh start    # Iniciar servicios
./deploy.sh stop     # Detener servicios
./deploy.sh logs     # Ver logs
./deploy.sh backup   # Backup de BD
./deploy.sh update   # Actualizar
```

---

## 🗄️ Base de Datos

### Modelos Principales

- **User**: Usuarios del sistema (admin, supervisor, técnico)
- **Order**: Órdenes de trabajo
- **Planeacion**: Planificación de trabajos
- **Ejecucion**: Ejecución y seguimiento
- **Evidence**: Evidencias (fotos, documentos)
- **ChecklistTemplate**: Templates de checklists
- **FormTemplate**: Formularios dinámicos

### Migraciones

```bash
# Crear migración
npx prisma migrate dev --name nombre_migracion

# Aplicar migraciones
npx prisma migrate deploy

# Ver BD en navegador
npx prisma studio
```

---

## 🚀 Despliegue

### Variables de Entorno Requeridas

```env
# Base de datos
DATABASE_URL=postgresql://user:pass@host:5432/db

# JWT
JWT_SECRET=clave-secreta-minimo-32-caracteres
JWT_REFRESH_SECRET=otra-clave-diferente

# App
NODE_ENV=production
FRONTEND_URL=https://tu-dominio.com
```

### Docker

```bash
# Desarrollo
docker compose up -d

# Producción
docker compose -f docker-compose.prod.yml up -d
```

---

## 📞 API Endpoints

Una vez desplegado, la documentación Swagger está disponible en:

- **Local**: http://localhost:3000/api/docs
- **Producción**: https://tu-dominio.com/api/docs

### Endpoints Principales

| Método | Endpoint | Descripción |
|--------|----------|-------------|
| POST | /api/auth/login | Iniciar sesión |
| POST | /api/auth/register | Registrar usuario |
| GET | /api/ordenes | Listar órdenes |
| POST | /api/ordenes | Crear orden |
| GET | /api/dashboard/stats | Estadísticas |

---

## 🧪 Testing

```bash
# Backend
cd apps/api
npm run test
npm run test:cov    # Con cobertura

# Frontend
cd apps/web
npm run test
```

---

## 📝 Contribuir

1. Fork el repositorio
2. Crea una rama: `git checkout -b feature/nueva-funcionalidad`
3. Commit: `git commit -m "feat: descripción"`
4. Push: `git push origin feature/nueva-funcionalidad`
5. Crea un Pull Request

---

## 📄 Licencia

Propietario © 2024-2026 CERMONT S.A.S

---

## 👥 Equipo

- **Tech Lead**: [@JuanDiego30](https://github.com/JuanDiego30)

---

**Estado:** ✅ Producción-Ready  
**Versión:** 1.0.0  
**Última actualización:** Enero 2026
