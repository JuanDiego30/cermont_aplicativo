# 🤖 CERMONT AGENTS — COMPLETE REFERENCE GUIDE

Este archivo es tu **guía maestra** para navegar la suite de 13 agentes especializados de Cermont. Cada agente es un experto en su área y proporciona patrones, límites, y checklists específicos.

## 📋 Tabla de Contenidos

1. [Cómo Usar Estos Agentes](#cómo-usar-estos-agentes)
2. [Backend Agents (7)](#backend-agents)
3. [Frontend Agents (5)](#frontend-agents)
4. [DevOps Agents (1)](#devops-agents)
5. [Decisión Rápida: ¿Cuál Agente?](#decisión-rápida-cuál-agente)
6. [Reglas GEMINI Transversales](#reglas-gemini-transversales)
7. [Checklist "Listo para Producción"](#checklist-listo-para-producción)

---

## Cómo Usar Estos Agentes

### 📌 Patrón de Uso

1. **Identifica el área** (backend, frontend, devops)
2. **Elige el agente específico** (ej: "backend-formularios")
3. **Consulta el archivo** `.github/agents/[nombre].agent.md`
4. **Sigue patrones** y **checklists** del agente
5. **Valida contra límites** del agente (lo que NO puede hacer)

### 💡 Ejemplos

**Escenario 1: Agregar nuevo endpoint de órdenes**
```
👤 Dev: "Necesito crear GET /ordenes/{id}/historial"
🤖 Acción:
   1. Consulta: backend-ordenes.agent.md
   2. Consulta: backend-api-integration.agent.md (si es backend)
   3. Consulta: frontend-api-integration.agent.md (para consumirlo)
   4. Sigue patrón de endpoint (DTOs, validación, logs)
   5. Tests (unitarios + integración)
   6. Valida contra checklist
```

**Escenario 2: Refactorizar componente lento**
```
👤 Dev: "El listado de órdenes carga lento"
🤖 Acción:
   1. Consulta: frontend-performance.agent.md
   2. Consulta: frontend-state-data.agent.md
   3. Aplica OnPush change detection
   4. Agrega trackBy en *ngFor
   5. Revisa suscripciones (memory leaks)
   6. Ejecuta Lighthouse, valida >90 Performance
```

**Escenario 3: Desplegar a producción**
```
👤 DevOps: "Necesito desplegar v1.2.0"
🤖 Acción:
   1. Consulta: devops-ci-cd.agent.md
   2. Verifica: tests pasados, build exitoso
   3. Ejecuta: workflow deploy-prod.yml
   4. Valida: health checks, smoke tests
   5. Monitorea: logs, alertas
```

---

## Backend Agents

### 1️⃣ backend-auth.agent.md
**Cuando:** Autenticación, autorización, roles, permisos, sesiones  
**Scope:** `apps/api/src/modules/auth/**`

| Patrón | Descripción |
|--------|-------------|
| Guards | `JwtAuthGuard`, `RolesGuard` |
| Estrategia | JWT + Refresh tokens |
| Roles | Enum basado (ADMIN, TECNICO, CLIENTE) |
| Validación | Permisos en @UseGuards |

**Quick Check:**
- ¿Nuevo endpoint requiere auth? → `@UseGuards(JwtAuthGuard)`
- ¿Validar rol específico? → `@Roles('ADMIN')`
- ¿Cambiar permisos? → Actualiza `enum RoleType`

[📖 Ver archivo completo](./agents/backend-auth.agent.md)

---

### 2️⃣ backend-ordenes.agent.md
**Cuando:** Gestión de órdenes, estado, asignación, workflows  
**Scope:** `apps/api/src/modules/ordenes/**`

| Patrón | Descripción |
|--------|-------------|
| Estados | PENDIENTE → ASIGNADA → EN_PROGRESO → COMPLETADA |
| Transiciones | Validar antes de cambiar estado |
| Asignación | Solo ADMIN puede asignar técnico |
| Historial | Registrar cambios en `OrdenHistorial` |

**Quick Check:**
- Nuevo estado? → Agregar a enum, validar transiciones
- Cambio crítico? → Registra en historial
- Query N+1? → Usa `.include()` correctamente

[📖 Ver archivo completo](./agents/backend-ordenes.agent.md)

---

### 3️⃣ backend-evidencias.agent.md
**Cuando:** Subida de archivos, almacenamiento, metadata, integridad  
**Scope:** `apps/api/src/modules/evidencias/**`

| Patrón | Descripción |
|--------|-------------|
| Subida | Validar tamaño, tipo MIME, virus scan |
| Almacenamiento | S3, CloudStorage o local |
| Metadata | Guardar hash SHA256, usuario, fecha |
| Seguridad | Nunca confiar en extension; validar contenido |

**Quick Check:**
- ¿Nuevo tipo de archivo? → Validar MIME en whitelist
- ¿Verificar integridad? → Usar hash SHA256
- ¿Scan de virus? → Integrar ClamAV o servicio similar

[📖 Ver archivo completo](./agents/backend-evidencias.agent.md)

---

### 4️⃣ backend-formularios.agent.md
**Cuando:** Formularios dinámicos, validación, cálculos, dependencias  
**Scope:** `apps/api/src/modules/formularios/**`

| Patrón | Descripción |
|--------|-------------|
| Validación | Centralizado en `FormularioValidatorService` |
| Campos | Soporta types: text, number, select, date, checkbox |
| Dependencias | Si field A = X, mostrar/ocultar field B |
| Cálculos | Campos auto-llenos (no manualmente) |
| Historial | Auditoría de cambios en respuestas |

**Quick Check:**
- Validación nueva? → No hardcodear en controller
- Campo dependiente? → Usar `condition` object
- Auto-cálculo? → Usar `calculator` function

[📖 Ver archivo completo](./agents/backend-formularios.agent.md)

---

### 5️⃣ backend-sync.agent.md
**Cuando:** Sincronización offline, conflictos, consistencia  
**Scope:** `apps/api/src/modules/sync/**`

| Patrón | Descripción |
|--------|-------------|
| Eventos | SyncEvent registra cada cambio |
| Cola | Colas locales (dispositivo) + servidor |
| Conflictos | Last-Writer-Wins (LWW) por defecto |
| Idempotencia | Duplicados ignorados (mismo evento ID) |

**Quick Check:**
- ¿Nuevo evento a sincronizar? → Agregar a `SyncEventType`
- ¿Manejar conflicto? → Usa `ConflictResolverService`
- ¿Evitar duplicados? → Usa idempotency key

[📖 Ver archivo completo](./agents/backend-sync.agent.md)

---

### 6️⃣ backend-reportes-pdf.agent.md
**Cuando:** Generación de PDFs, plantillas, reportes  
**Scope:** `apps/api/src/modules/pdf-generation/**`

| Patrón | Descripción |
|--------|-------------|
| Plantillas | Handlebars/EJS (reutilizables) |
| Caching | Cache por 24h (key = params) |
| Permisos | Validar acceso antes de generar |
| Performance | Usar colas para batch (no síncrono) |

**Quick Check:**
- Nuevo tipo de PDF? → Crear plantilla reutilizable
- Validar datos? → Antes de renderizar
- Performance crítica? → Usar queue async

[📖 Ver archivo completo](./agents/backend-reportes-pdf.agent.md)

---

### 7️⃣ quality-testing.agent.md
**Cuando:** Tests (unit, integration, e2e), cobertura, CI  
**Scope:** Tests en `apps/api/**` y `apps/web/**`

| Patrón | Descripción |
|--------|-------------|
| Unit | Jest para servicios, utilidades |
| Integration | Test contra BD real (PostgreSQL) |
| E2E | Cypress/Playwright para flujos críticos |
| Cobertura | >80% crítico, >70% general |
| CI | Tests obligatorios en cada PR |

**Quick Check:**
- Nuevo feature? → Tests unitarios + integración
- Cambio crítico? → E2E también
- Coverage bajo? → Identifica líneas sin tests

[📖 Ver archivo completo](./agents/quality-testing.agent.md)

---

## Frontend Agents

### 8️⃣ frontend.agent.md (Umbrella)
**Cuando:** Decisiones arquitectónicas, nuevos features, patrones transversales  
**Scope:** Toda la app `apps/web/`

**Reglas Globales:**
- Smart (container) vs Presentational (dumb) components
- Lazy loading obligatorio para nuevas rutas
- Estado centralizado si es compartido
- API via servicios (no en componentes)
- OnPush change detection por defecto
- ARIA + keyboard navigation obligatorio

**Arquitectura:**
```
core/ → guards, interceptors, services, state
shared/ → componentes reutilizables, directives
features/ → módulos con sus propias rutas
```

[📖 Ver archivo completo](./agents/frontend.agent.md)

---

### 9️⃣ frontend-api-integration.agent.md
**Cuando:** Nuevos endpoints, error handling, interceptors  
**Scope:** `apps/web/src/app/core/services/**`

| Patrón | Descripción |
|--------|-------------|
| ApiService | Base centralizada (GET, POST, PATCH, DELETE) |
| Servicios | Uno por feature (OrdenesService, EvidenciasService) |
| Error Handler | Centralizado (toastr, redirecciones, logs) |
| Caching | TTL configurable, invalidación en cambios |
| Retry | Automático con backoff (no en 4xx) |

**Quick Check:**
- ¿Nuevo endpoint? → Agregar método en servicio
- ¿DTOs sincronizados? → Deben matchear backend
- ¿Error handling? → Usa `ApiErrorHandler`
- ¿Cache? → Si lectura frecuente, cachear

[📖 Ver archivo completo](./agents/frontend-api-integration.agent.md)

---

### 🔟 frontend-ui-ux.agent.md
**Cuando:** Componentes nuevos, accesibilidad, responsive  
**Scope:** `apps/web/src/app/shared/components/**`

| Patrón | Descripción |
|--------|-------------|
| Componentes | Reutilizables, pequeños, single responsibility |
| ARIA | role, aria-label, aria-describedby obligatorio |
| Keyboard | Tab, Enter, Escape siempre funcionar |
| Focus | Visible indicators en todos los elementos |
| Responsive | Mobile-first, breakpoints claros |
| CSS Variables | Nunca hardcodear colores/spacing |

**Quick Check:**
- ¿Componente nuevo? → Va a `shared/components/`
- ¿Duplicado? → Refactoriza el existente
- ¿ARIA correcta? → Revisa template
- ¿Mobile? → Testea en phone

[📖 Ver archivo completo](./agents/frontend-ui-ux.agent.md)

---

### 1️⃣1️⃣ frontend-state-data.agent.md
**Cuando:** Estado compartido, data flow, sincronización  
**Scope:** `apps/web/src/app/core/state/**` (NgRx o Signals)

| Patrón | Descripción |
|--------|-------------|
| NgRx | Actions → Reducer → Selectors → Effects |
| Signals | signal → computed → effect (Angular 16+) |
| Facade | Abstrae store de componentes |
| Cache | TTL + invalidación inteligente |
| Compartir | Si 2+ componentes lo usan → state |

**Quick Check:**
- ¿Estado compartido? → Centralizar en NgRx/Signals
- ¿Selector nuevo? → Optimizar con `createSelector`
- ¿Effect nuevo? → Manejar errores, logging
- ¿Memory leak? → Verificar suscripciones

[📖 Ver archivo completo](./agents/frontend-state-data.agent.md)

---

### 1️⃣2️⃣ frontend-performance.agent.md
**Cuando:** Bundle grande, UX lenta, memory leaks  
**Scope:** Toda la app `apps/web/`

| Patrón | Descripción |
|--------|-------------|
| Lazy Loading | Features en rutas, precarga background |
| OnPush | Change detection Strategy.OnPush |
| TrackBy | En *ngFor, especialmente >10 items |
| Unsubscribe | takeUntil, takeUntilDestroyed, async pipe |
| Tree-Shaking | Imports selectivos, lodash-es |
| Images | loading="lazy", srcset, webp |

**Quick Check:**
- Bundle >500KB gzip? → Lazy load más features
- Memory leak? → Verifica DevTools, unsubscribes
- Lento en mobile? → Usa Lighthouse Performance
- Listas largas? → OnPush + trackBy

[📖 Ver archivo completo](./agents/frontend-performance.agent.md)

---

## DevOps Agents

### 1️⃣3️⃣ devops-ci-cd.agent.md
**Cuando:** Despliegues, Docker, GitHub Actions, monitoring  
**Scope:** `.github/workflows/`, `docker/`, infraestructura

| Patrón | Descripción |
|--------|-------------|
| CI | Tests → Build → Docker push (automático) |
| CD | Deploy a Dev (automático), Staging/Prod (manual) |
| Docker | Multi-stage, health checks, no root user |
| Secrets | Variables de entorno, nunca en código |
| Monitoring | Health checks, logs, alertas |

**Quick Check:**
- Tests pasados? → Build automático
- Docker optimizado? → Multi-stage, pequeño
- Secrets seguros? → En secrets de GitHub
- Health checks? → En todos los containers

[📖 Ver archivo completo](./agents/devops-ci-cd.agent.md)

---

## Decisión Rápida: ¿Cuál Agente?

### 🎯 Por Tipo de Tarea

| Tarea | Agentes |
|------|----------|
| Agregar nuevo endpoint API | backend-[feature].agent.md → frontend-api-integration.agent.md |
| Crear nuevo componente | frontend-ui-ux.agent.md → frontend.agent.md |
| Optimizar performance | frontend-performance.agent.md → devops-ci-cd.agent.md |
| Mejorar tests | quality-testing.agent.md |
| Desplegar a producción | devops-ci-cd.agent.md |
| Agregar autenticación | backend-auth.agent.md → frontend-api-integration.agent.md |
| Subir archivos | backend-evidencias.agent.md → frontend-api-integration.agent.md |
| Sincronizar datos offline | backend-sync.agent.md → frontend-state-data.agent.md |
| Generar reportes PDF | backend-reportes-pdf.agent.md → frontend-api-integration.agent.md |
| Crear formulario dinámico | backend-formularios.agent.md → frontend-ui-ux.agent.md |

---

## Reglas GEMINI Transversales

**Aplicables a TODOS los agentes:**

1. **DI (Dependency Injection)** - Inyectar servicios, no instanciar
2. **Centralización** - No duplicar código; reutilizar
3. **Type Safety** - No `any`; tipado fuerte siempre
4. **Error Handling** - try/catch + Logger en puntos críticos
5. **Logging** - No logs de secrets; level INFO en prod
6. **Caching Inteligente** - TTL + invalidación
7. **Testing** - Unit → Integration → E2E
8. **Funciones Pequeñas** - Single responsibility
9. **Documentación** - Código auto-documental + comentarios para "por qué"
10. **Performance** - Lazy load, cache, optimize queries
11. **Security** - Validar entrada, escape output, secrets en env
12. **Accessibility** - ARIA, keyboard, focus (front)
13. **Monitoring** - Health checks, logs, alertas (devops)

---

## Checklist "Listo para Producción"

### ✅ Backend
- [ ] Tests: unit (>80%), integration (>70%)
- [ ] API: validación, error handling, logs
- [ ] BD: migrations, indexes, constraints
- [ ] Secrets: en env vars, nunca en código
- [ ] Health checks: endpoints `/health`
- [ ] Documentación: endpoints, models, flows

### ✅ Frontend
- [ ] Componentes: reutilizables, accesibles
- [ ] Estado: centralizado si compartido
- [ ] Performance: Lighthouse >90
- [ ] Tests: unit (>80%), e2e (críticos)
- [ ] A11y: ARIA, keyboard, contrast
- [ ] Responsive: mobile, tablet, desktop
- [ ] Bundle: <500KB gzip

### ✅ DevOps
- [ ] Docker: multi-stage, health checks
- [ ] CI/CD: workflows, tests obligatorios
- [ ] Secrets: seguros, rotados
- [ ] Monitoring: health checks, alertas
- [ ] Backups: automáticos, testeados
- [ ] Logs: centralizados, no sensibles

---

## 📞 Soporte & Escalabilidad

**¿Qué hacer si...**

- ❓ **No encuentras el patrón** → Consulta el agente relevant, revisa "Patrón Obligatorio"
- ❓ **Necesitas excepción** → Documenta decisión arquitectónica en `.github/adr/`
- ❓ **El agente no cubre tu caso** → Propón actualización/nuevo agente
- ❓ **Conflicto entre agentes** → Consulta `frontend.agent.md` o `backend.agent.md` (umbrellas)

---

**Última actualización:** 2026-01-02  
**Total de agentes:** 13 | **Cobertura:** Backend, Frontend, DevOps, Testing  
**Status:** ✅ Completo y optimizado para producción
