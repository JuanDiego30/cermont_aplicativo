# Plan de Mejoras Backend - Cermont API

> Basado en análisis de `samchon/backend` (NestJS+Prisma+TDD) y `fastapi/full-stack-fastapi-template` (Docker+CI/CD+Operación)

---

## 📋 Estado Actual (Auditoría)

| Aspecto | Estado | Notas |
|---------|--------|-------|
| **Framework** | ✅ NestJS 11 + Prisma 7 | Stack moderno |
| **Auth** | ✅ JWT + Refresh tokens | Bien implementado |
| **Swagger/OpenAPI** | ✅ Configurado en `/docs` | Base para SDK |
| **Validación** | ✅ ValidationPipe global | class-validator |
| **Filtro errores** | ⚠️ Básico | Falta mapeo Prisma |
| **Tests** | ⚠️ Solo 3 specs | Necesita e2e |
| **Docker** | ❌ No existe | Prioridad alta |
| **CI/CD** | ❌ No existe | Prioridad alta |
| **Health checks** | ⚠️ Básico | Falta DB check |

---

## 🎯 Fases de Implementación

### FASE 1: Operación Básica (Docker + Scripts)
**Objetivo**: Poder correr el stack completo con un comando

| # | Tarea | Archivos | Prioridad |
|---|-------|----------|-----------|
| 1.1 | Docker Compose desarrollo | `docker-compose.yml`, `docker-compose.override.yml` | 🔴 Alta |
| 1.2 | Dockerfile backend | `apps/api/Dockerfile` | 🔴 Alta |
| 1.3 | Script prestart (wait-for-db + migrate) | `apps/api/scripts/prestart.sh` | 🔴 Alta |
| 1.4 | Variables de entorno estandarizadas | `.env.example` mejorado | 🔴 Alta |
| 1.5 | Health check con DB | `health.controller.ts` mejorado | 🟡 Media |

### FASE 2: Robustez del Backend
**Objetivo**: Manejo de errores consistente y utilidades comunes

| # | Tarea | Archivos | Prioridad |
|---|-------|----------|-----------|
| 2.1 | Mapeo errores Prisma → HTTP | `common/filters/prisma-exception.filter.ts` | 🔴 Alta |
| 2.2 | Utilidad paginación genérica | `common/utils/pagination.util.ts` | 🟡 Media |
| 2.3 | DTOs de respuesta estándar | `common/dto/api-response.dto.ts` | 🟡 Media |
| 2.4 | Endpoint `/system` info | `system.controller.ts` | 🟢 Baja |

### FASE 3: SDK Cliente (Frontend)
**Objetivo**: Generar cliente TypeScript tipado desde OpenAPI

| # | Tarea | Archivos | Prioridad |
|---|-------|----------|-----------|
| 3.1 | Exportar OpenAPI JSON | Script `npm run openapi:export` | 🔴 Alta |
| 3.2 | Generar cliente con openapi-typescript | `apps/web/src/lib/api-client/` | 🔴 Alta |
| 3.3 | Hooks React Query tipados | Integración con TanStack Query | 🟡 Media |

### FASE 4: Testing
**Objetivo**: Tests e2e automatizados con reset de DB

| # | Tarea | Archivos | Prioridad |
|---|-------|----------|-----------|
| 4.1 | Configuración Jest e2e | `test/jest-e2e.json` | 🔴 Alta |
| 4.2 | Setup/teardown con DB test | `test/setup.ts` | 🔴 Alta |
| 4.3 | Tests auth (login/register) | `test/auth.e2e-spec.ts` | 🔴 Alta |
| 4.4 | Tests CRUD órdenes | `test/ordenes.e2e-spec.ts` | 🟡 Media |
| 4.5 | Script reset + seed test | `npm run test:e2e` | 🔴 Alta |

### FASE 5: CI/CD
**Objetivo**: Pipeline automático en GitHub Actions

| # | Tarea | Archivos | Prioridad |
|---|-------|----------|-----------|
| 5.1 | Workflow lint + typecheck | `.github/workflows/ci.yml` | 🔴 Alta |
| 5.2 | Workflow tests | Integrado en ci.yml | 🔴 Alta |
| 5.3 | Workflow build Docker | `.github/workflows/build.yml` | 🟡 Media |
| 5.4 | Deploy a VPS (opcional) | `.github/workflows/deploy.yml` | 🟢 Baja |

### FASE 6: Despliegue VPS (Contabo)
**Objetivo**: Configuración para servidor único

| # | Tarea | Archivos | Prioridad |
|---|-------|----------|-----------|
| 6.1 | Docker Compose producción | `docker-compose.prod.yml` | 🟡 Media |
| 6.2 | Traefik como proxy | `traefik/` config | 🟡 Media |
| 6.3 | Certificados HTTPS | Let's Encrypt auto | 🟡 Media |
| 6.4 | Script deploy.sh | `scripts/deploy.sh` | 🟡 Media |

---

## 📁 Estructura Final Propuesta

```
cermont_aplicativo/
├── .github/
│   └── workflows/
│       ├── ci.yml              # Lint, typecheck, test
│       └── build.yml           # Build Docker images
├── docker-compose.yml          # Desarrollo local
├── docker-compose.override.yml # Overrides dev (volumes, ports)
├── docker-compose.prod.yml     # Producción
├── .env.example                # Variables documentadas
├── traefik/                    # Proxy + HTTPS (prod)
│   └── traefik.yml
├── apps/
│   ├── api/
│   │   ├── Dockerfile
│   │   ├── scripts/
│   │   │   ├── prestart.sh     # Wait DB + migrate + seed
│   │   │   └── test.sh
│   │   ├── src/
│   │   │   ├── common/
│   │   │   │   ├── filters/
│   │   │   │   │   ├── http-exception.filter.ts
│   │   │   │   │   └── prisma-exception.filter.ts  # NUEVO
│   │   │   │   ├── utils/
│   │   │   │   │   └── pagination.util.ts          # NUEVO
│   │   │   │   └── dto/
│   │   │   │       └── api-response.dto.ts         # NUEVO
│   │   │   └── ...
│   │   └── test/
│   │       ├── jest-e2e.json
│   │       ├── setup.ts
│   │       └── auth.e2e-spec.ts
│   └── web/
│       └── src/
│           └── lib/
│               └── api-client/   # SDK generado
│                   ├── index.ts
│                   └── types.ts
└── scripts/
    ├── generate-sdk.ps1
    └── deploy.sh
```

---

## 🚀 Comandos Objetivo

```bash
# Desarrollo local
docker compose up -d          # Levanta todo (DB, API, Web)
docker compose logs -f api    # Ver logs

# Testing
npm run test:e2e              # Corre tests e2e con DB de prueba

# SDK
npm run sdk:generate          # Regenera cliente desde OpenAPI

# Producción
./scripts/deploy.sh           # Deploy a VPS
```

---

## ⏱️ Estimación de Tiempo

| Fase | Tiempo estimado |
|------|-----------------|
| Fase 1: Docker + Scripts | 2-3 horas |
| Fase 2: Robustez Backend | 2 horas |
| Fase 3: SDK Cliente | 1-2 horas |
| Fase 4: Testing | 3-4 horas |
| Fase 5: CI/CD | 2 horas |
| Fase 6: Deploy VPS | 2-3 horas |
| **Total** | **12-16 horas** |

---

## 📌 Próximos Pasos Inmediatos

1. ✅ Crear este documento de plan
2. ✅ Implementar Docker Compose básico
3. ✅ Crear Dockerfile para API
4. ✅ Configurar script prestart
5. ✅ Mejorar health check con DB
6. ✅ Filtro de errores Prisma
7. ✅ Utilidad de paginación
8. ✅ Tests e2e configurados
9. ✅ CI/CD con GitHub Actions
10. ✅ Docker Compose producción con Traefik
11. ✅ Script de deploy para VPS

---

## 🎉 Implementación Completada

### Archivos Creados/Modificados

| Archivo | Propósito |
|---------|-----------|
| `docker-compose.yml` | Stack desarrollo local |
| `docker-compose.override.yml` | Overrides para dev (hot reload) |
| `docker-compose.prod.yml` | Stack producción con Traefik |
| `apps/api/Dockerfile` | Imagen Docker del backend |
| `apps/web/Dockerfile` | Imagen Docker del frontend |
| `apps/api/scripts/prestart.sh` | Wait-for-db + migrate + start |
| `apps/api/scripts/export-openapi.ts` | Exportar OpenAPI JSON |
| `apps/api/src/common/filters/prisma-exception.filter.ts` | Mapeo errores Prisma→HTTP |
| `apps/api/src/common/utils/pagination.util.ts` | Paginación genérica |
| `apps/api/src/common/dto/api-response.dto.ts` | DTOs respuesta estándar |
| `apps/api/src/health.controller.ts` | Health check con DB |
| `apps/api/test/jest-e2e.json` | Config tests e2e |
| `apps/api/test/setup.ts` | Setup global tests |
| `apps/api/test/auth.e2e-spec.ts` | Tests auth completos |
| `.github/workflows/ci.yml` | Pipeline CI completo |
| `.env.example` | Variables documentadas |
| `.env.production.example` | Variables producción |
| `scripts/deploy.sh` | Deploy automatizado VPS |
| `scripts/generate-sdk.ps1` | Generador SDK cliente |

### Comandos Disponibles

```bash
# === DESARROLLO ===
docker compose up -d              # Levantar stack completo
docker compose logs -f api        # Ver logs API
docker compose down               # Detener todo

# === TESTING ===
cd apps/api
npm run test                      # Tests unitarios
npm run test:e2e                  # Tests e2e
npm run typecheck                 # Verificar tipos

# === SDK ===
cd apps/web
npm run sdk:generate              # Generar cliente tipado

# === PRODUCCIÓN ===
# 1. Copiar .env.production.example a .env.production
# 2. Configurar variables (DOMAIN, JWT_SECRET, etc)
# 3. Ejecutar deploy
DEPLOY_HOST=tu-servidor.com ./scripts/deploy.sh
```
