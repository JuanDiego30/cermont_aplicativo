# 🤖 CERMONT AGENTS — COMPLETE REFERENCE GUIDE

Este archivo es tu **guía maestra** para navegar la suite de **22 agentes especializados** de Cermont. Cada agente es un experto en su área y proporciona patrones, límites, y checklists específicos.

## 📋 Tabla de Contenidos

1. [Cómo Usar Estos Agentes](#cómo-usar-estos-agentes)
2. [Backend Agents (11)](#backend-agents)
3. [Frontend Agents (8)](#frontend-agents)
4. [DevOps & Testing Agents (3)](#devops-agents)
5. [Decisión Rápida: ¿Cuál Agente?](#decisión-rápida-cuál-agente)
6. [Reglas GEMINI Transversales](#reglas-gemini-transversales)
7. [Checklist "Listo para Producción"](#checklist-listo-para-producción)

---

## Cómo Usar Estos Agentes

### 📋 Patrón de Uso

1. **Identifica el área** (backend, frontend, devops)
2. **Elige el agente específco** (ej: "backend-formularios")
3. **Consulta el archivo** `.github/agents/[nombre].agent.md`
4. **Sigue patrones** y **checklists** del agente
5. **Valida contra límites** del agente (lo que NO puede hacer)

---

## Backend Agents (11)

### 1️⃣ backend-auth.agent.md
**Cuando:** Autenticación, autorización, roles, permisos, sesiones
**Scope:** `apps/api/src/modules/auth/**`
[Ver archivo](./agents/backend-auth.agent.md)

### 2️⃣ backend-ordenes.agent.md
**Cuando:** Gestión de órdenes, estado, asignación, workflows
**Scope:** `apps/api/src/modules/ordenes/**`
[Ver archivo](./agents/backend-ordenes.agent.md)

### 3️⃣ backend-evidencias.agent.md
**Cuando:** Subida de archivos, almacenamiento, metadata, integridad
**Scope:** `apps/api/src/modules/evidencias/**`
[Ver archivo](./agents/backend-evidencias.agent.md)

### 4️⃣ backend-formularios.agent.md
**Cuando:** Formularios dinámicos, validación, cálculos, dependencias
**Scope:** `apps/api/src/modules/formularios/**`
[Ver archivo](./agents/backend-formularios.agent.md)

### 5️⃣ backend-sync.agent.md
**Cuando:** Sincronización offline, conflictos, consistencia
**Scope:** `apps/api/src/modules/sync/**`
[Ver archivo](./agents/backend-sync.agent.md)

### 6️⃣ backend-reportes-pdf.agent.md
**Cuando:** Generación de PDFs, plantillas, reportes
**Scope:** `apps/api/src/modules/pdf-generation/**`
[Ver archivo](./agents/backend-reportes-pdf.agent.md)

### 7️⃣ backend-logging-observability.agent.md (🌟 NUEVO)
**Cuando:** Centralización de logs, observabilidad, métricas, trazabilidad
**Scope:** `apps/api/src/common/logging/**`
**Stack:** Winston/Bunyan, ELK Stack
[Ver archivo](./agents/backend-logging-observability.agent.md)

### 8️⃣ backend-emails-notifications.agent.md (🌟 NUEVO)
**Cuando:** Envío de emails, notificaciones, webhooks, plantillas, reintentos
**Scope:** `apps/api/src/modules/notifications/**`
**Stack:** Nodemailer, SendGrid, AWS SES, Bull Queue
[Ver archivo](./agents/backend-emails-notifications.agent.md)

### 9️⃣ backend-caching-redis.agent.md (🌟 NUEVO)
**Cuando:** Multi-layer caching, Redis, invalidación inteligente, rate limiting
**Scope:** `apps/api/src/common/caching/**`
**Stack:** Redis, ioredis, @nestjs/cache-manager
[Ver archivo](./agents/backend-caching-redis.agent.md)

### 1️⃣️ backend-api-documentation.agent.md (🌟 NUEVO)
**Cuando:** Documentación automática de APIs, Swagger/OpenAPI, ejemplos
**Scope:** `apps/api/src/`
**Stack:** @nestjs/swagger, OpenAPI 3.0
[Ver archivo](./agents/backend-api-documentation.agent.md)

### 1️⃣⃣ quality-testing.agent.md
**Cuando:** Tests (unit, integration, e2e), cobertura, CI
**Scope:** Tests en `apps/api/**` y `apps/web/**`
[Ver archivo](./agents/quality-testing.agent.md)

### 2️⃣1️⃣ backend-security.agent.md (🔥 NUEVO)
**Cuando:** CORS, Rate Limiting, CSRF, Input Validation
**Scope:** `apps/api/src/main.ts`, `apps/api/src/modules/auth/**`
**Reglas:** 5, 6, 7
[Ver archivo](./agents/21-backend-security.agent.md)

---

## Frontend Agents (8)

### 1️⃣️ frontend.agent.md (Umbrella)
**Cuando:** Decisiones arquitectónicas, nuevos features, patrones transversales
**Scope:** Toda la app `apps/web/`
[Ver archivo](./agents/frontend.agent.md)

### 1️⃣⃣ frontend-api-integration.agent.md
**Cuando:** Nuevos endpoints, error handling, interceptors
**Scope:** `apps/web/src/app/core/services/**`
[Ver archivo](./agents/frontend-api-integration.agent.md)

### 1️⃣⃣ frontend-ui-ux.agent.md
**Cuando:** Componentes nuevos, accesibilidad, responsive
**Scope:** `apps/web/src/app/shared/components/**`
[Ver archivo](./agents/frontend-ui-ux.agent.md)

### 1️⃣⃣ frontend-state-data.agent.md
**Cuando:** Estado compartido, data flow, sincronización
**Scope:** `apps/web/src/app/core/state/**`
[Ver archivo](./agents/frontend-state-data.agent.md)

### 1️⃣⃣ frontend-performance.agent.md
**Cuando:** Bundle grande, UX lenta, memory leaks
**Scope:** Toda la app `apps/web/`
[Ver archivo](./agents/frontend-performance.agent.md)

### 1️⃣⃣ frontend-internationalization.agent.md (🌟 NUEVO)
**Cuando:** Multi-idioma, traducción de UI, formateo de fechas/números, RTL support
**Scope:** `apps/web/src/assets/i18n/`, `apps/web/src/app/core/i18n/`
**Stack:** ngx-translate, Angular i18n
[Ver archivo](./agents/frontend-internationalization.agent.md)

### 1️⃣9️⃣ frontend-auth-critical.agent.md (🔥 NUEVO)
**Cuando:** Login/Logout, CSRF token, Token refresh, 2FA, Memory leaks
**Scope:** `apps/web/src/app/core/{auth,services,interceptors}/**`
**Reglas:** 1, 5, 41
[Ver archivo](./agents/19-frontend-auth-critical.agent.md)

### 2️⃣0️⃣ frontend-shared-components.agent.md (🔥 NUEVO)
**Cuando:** Button, Input, Card, Loader - Componentes reutilizables
**Scope:** `apps/web/src/app/shared/components/**`
**Enfoque:** DRY, Accesibilidad, Dark mode
[Ver archivo](./agents/20-frontend-shared-components.agent.md)

---

## DevOps & Testing Agents (3)

### 1️⃣⃣ devops-ci-cd.agent.md
**Cuando:** Despliegues, Docker, GitHub Actions, monitoring
**Scope:** `.github/workflows/`, `docker/`, infraestructura
[Ver archivo](./agents/devops-ci-cd.agent.md)

### 1️⃣8️⃣ quality-testing.agent.md
**Cuando:** Tests (unit, integration, e2e), cobertura, CI
**Scope:** Tests en `apps/api/**` y `apps/web/**`
[Ver archivo](./agents/18-quality-testing.agent.md)

### 2️⃣2️⃣ integration-tests.agent.md (🔥 NUEVO)
**Cuando:** E2E tests, API integration tests, Mock data, Seeding
**Scope:** `apps/web/e2e/**`, `apps/api/test/**`
**Enfoque:** Coverage >80%, Cypress/Playwright
[Ver archivo](./agents/22-integration-tests.agent.md)

---

## Decisión Rápida: ¿Cuál Agente?

### 🎯 Por Tipo de Tarea

| Tarea | Agentes |
|------|----------|
| Agregar nuevo endpoint API | backend-[feature] → frontend-api-integration |
| Crear nuevo componente | frontend-ui-ux → frontend |
| Optimizar performance | frontend-performance → devops-ci-cd |
| Mejorar tests | quality-testing |
| Desplegar a producción | devops-ci-cd |
| Agregar autenticación | backend-auth → frontend-api-integration |
| Subir archivos | backend-evidencias → frontend-api-integration |
| Sincronizar datos offline | backend-sync → frontend-state-data |
| Generar reportes PDF | backend-reportes-pdf → frontend-api-integration |
| Crear formulario dinámico | backend-formularios → frontend-ui-ux |
| Configurar logging | backend-logging-observability |
| Enviar emails/notificaciones | backend-emails-notifications |
| Implementar caching | backend-caching-redis |
| Documentar API | backend-api-documentation |
| Soporte multi-idioma | frontend-internationalization |

---

## Reglas GEMINI Transversales

**Aplicables a TODOS los agentes:**

1. **G**eneral - DI (Dependency Injection) obligatorio
2. **E**specializado - Centralización (no duplicar código)
3. **M**antible - Type Safety (no `any`)
4. **I**ntegrado - Error Handling + Logging
5. **N**avegable - Caching Inteligente
6. **I**mplementado - Testing (Unit → Integration → E2E)

Además:
- ✅ Funciones pequeñas (single responsibility)
- ✅ Documentación clara (código + comentarios)
- ✅ Performance optimizado (lazy load, cache)
- ✅ Seguridad (validación, secrets en env)
- ✅ Accesibilidad (ARIA, keyboard, focus)
- ✅ Monitoring (health checks, logs, alertas)

---

## Checklist "Listo para Producción"

### ✅ Backend
- [ ] Tests: unit (>80%), integration (>70%)
- [ ] API: validación, error handling, logs
- [ ] BD: migrations, indexes, constraints
- [ ] Secrets: en env vars, nunca en código
- [ ] Health checks: endpoints `/health`
- [ ] Documentación: endpoints, models, flows
- [ ] Logging centralizado (Winston, ELK)
- [ ] Notificaciones/emails configuradas
- [ ] Caching implementado (Redis)
- [ ] API documentada (Swagger)

### ✅ Frontend
- [ ] Componentes: reutilizables, accesibles
- [ ] Estado: centralizado si compartido
- [ ] Performance: Lighthouse >90
- [ ] Tests: unit (>80%), e2e (críticos)
- [ ] A11y: ARIA, keyboard, contrast
- [ ] Responsive: mobile, tablet, desktop
- [ ] Bundle: <500KB gzip
- [ ] Multi-idioma soportado (i18n)

### ✅ DevOps
- [ ] Docker: multi-stage, health checks
- [ ] CI/CD: workflows, tests obligatorios
- [ ] Secrets: seguros, rotados
- [ ] Monitoring: health checks, alertas
- [ ] Backups: automáticos, testeados
- [ ] Logs: centralizados, no sensibles

---

## 📊 Estádísticas del Framework

```
Agentes Especializados:     22 (era 18)
Documentación Total:       ~280 KB
Áreas Backend Cubiertas:    11 agentes
Áreas Frontend Cubiertas:   8 agentes
Áreas DevOps/Testing:       3 agentes

Cobertura:
  ✅ Logging & Observabilidad
  ✅ Emails & Notificaciones
  ✅ Caching & Rate Limiting
  ✅ API Documentation
  ✅ Internationalization (i18n)
  ✅ Auth Critical (Login, CSRF, 2FA)
  ✅ Shared Components
  ✅ Backend Security (CORS, Rate Limit)
  ✅ Integration Tests (E2E, API)
```

---

## 🌟 Lo Nuevo en Esta Versión

### 5 Agentes Añadidos

1. **backend-logging-observability.agent.md**
   - Winston/Bunyan setup global
   - Structured logging JSON
   - Log levels configurables
   - Auditoria y métricas de negocio

2. **backend-emails-notifications.agent.md**
   - EmailService multi-proveedor
   - NotificationsService façade
   - Plantillas EJS reutilizables
   - Reintentos automáticos

3. **backend-caching-redis.agent.md**
   - Multi-layer caching (memory + Redis)
   - CacheService con patrón getOrSet
   - Invalidación por patrón
   - Rate Limiting guard

4. **backend-api-documentation.agent.md**
   - Swagger/OpenAPI 3.0 automático
   - Decoradores @Api* en endpoints
   - DTOs documentadas
   - Error responses catalogadas

5. **frontend-internationalization.agent.md**
   - ngx-translate setup
   - I18nService centralizado
   - Archivos JSON de traducción
   - Soporte para más idiomas (es, en, pt)
   - Formateo por locale (fechas, números)

---

## 📞 Soporte & Escalabilidad

**¿Qué hacer si...**

- ❓ **No encuentras el patrón** → Consulta el agente relevante
- ❓ **Necesitas excepción** → Documenta en `.github/adr/`
- ❓ **El agente no cubre tu caso** → Propone actualización
- ❓ **Conflicto entre agentes** → Consulta umbrella (frontend.agent.md o backend agents)

---

**Última actualización:** 2026-01-02
**Total de agentes:** 22 | **Cobertura:** Backend (11), Frontend (8), DevOps/Testing (3)
**Status:** ✅ **Completo y optimizado para producción**
