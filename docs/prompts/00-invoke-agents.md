# 🤖 CERMONT AGENTES - INVOCACIÓN Y 41 REGLAS

**Última actualización:** 2026-01-02
**Estado:** 18 agentes + 41 reglas documentadas
**Patrón:** SIN PREGUNTAS (análisis → plan → implementación → verificación)

---

## 🎯 LOS 18 AGENTES CERMONT

### � BACKEND (10 agentes - Reglas 1-40)

| # | Agente | Reglas | Comando |
|----|--------|--------|---------|
| 01 | Backend Auth | 1-10 | `Actúa como CERMONT BACKEND AUTH AGENT` |
| 02 | Backend Órdenes | 11-20 | `Actúa como CERMONT BACKEND ORDENES AGENT` |
| 03 | Backend Evidencias | 21-30 | `Actúa como CERMONT BACKEND EVIDENCIAS AGENT` |
| 04 | Backend Formularios | 31-40 | `Actúa como CERMONT BACKEND FORMULARIOS AGENT` |
| 05 | Backend Sync | - | `Actúa como CERMONT BACKEND SYNC AGENT` |
| 06 | Backend Reportes PDF | - | `Actúa como CERMONT BACKEND REPORTES PDF AGENT` |
| 07 | Backend Logging | 6 (crítica) | `Actúa como CERMONT BACKEND LOGGING AGENT` |
| 08 | Backend Emails | OSS only | `Actúa como CERMONT BACKEND EMAILS AGENT` |
| 09 | Backend Caching | - | `Actúa como CERMONT BACKEND CACHING AGENT` |
| 10 | Backend API Docs | - | `Actúa como CERMONT BACKEND API DOCS AGENT` |

### 🟩 FRONTEND (6 agentes)

| # | Agente | Nota | Comando |
|----|--------|------|---------|
| 11 | Frontend Umbrella | Coordinador | `Actúa como CERMONT FRONTEND UMBRELLA AGENT` |
| 12 | Frontend API | Regla 41 | `Actúa como CERMONT FRONTEND API AGENT` |
| 13 | Frontend UI/UX | Accesibilidad | `Actúa como CERMONT FRONTEND UI/UX AGENT` |
| 14 | Frontend State | Regla 41 | `Actúa como CERMONT FRONTEND STATE AGENT` |
| 15 | Frontend Performance | Optimización | `Actúa como CERMONT FRONTEND PERFORMANCE AGENT` |
| 16 | Frontend i18n | Multiidioma | `Actúa como CERMONT FRONTEND I18N AGENT` |

### 🟪 CROSS-CUTTING (2 agentes)

| # | Agente | Responsabilidad | Comando |
|----|--------|-----------------|---------|
| 17 | DevOps CI/CD | GitHub Actions, Docker | `Actúa como CERMONT DEVOPS CI/CD AGENT` |
| 18 | Quality Testing | Tests, cobertura | `Actúa como CERMONT QUALITY TESTING AGENT` |

---

## 📌 LAS 41 REGLAS CRÍTICAS

### 🔐 Reglas 1-10: BACKEND AUTH (Agente 01)

**Regla 1:** Usar JWT con RS256 (asymmetric)
**Regla 2:** 2FA obligatorio para admin
**Regla 3:** Audit log TODA interacción auth
**Regla 4:** Invalidar tokens en logout
**Regla 5:** CSRF protection en POST/PUT/DELETE
**Regla 6:** NUNCA loguear secretos (passwords, tokens, API keys)
**Regla 7:** Rate limit: 5 intentos fallidos = 15 min bloqueo
**Regla 8:** Refresh token rotation en cada uso
**Regla 9:** Expiration: access 15min, refresh 7días
**Regla 10:** Hash con bcrypt min 12 rounds

### 📦 Reglas 11-20: BACKEND ÓRDENES (Agente 02)

**Regla 11:** Máquina de estados (DRAFT → PENDING → CONFIRMED → SHIPPED → DELIVERED → CLOSED)
**Regla 12:** Historial de TODOS los cambios en orden_history
**Regla 13:** Validar totales antes de confirmar
**Regla 14:** NO permitir editar orden confirmada
**Regla 15:** Calcular costos en backend (NUNCA en frontend)
**Regla 16:** Webhook a terceros de envío con idempotencia
**Regla 17:** Cancelación solo en DRAFT o PENDING
**Regla 18:** Email de confirmación + recibo de envío
**Regla 19:** Impresión de orden con QR
**Regla 20:** Reportes de órdenes (filtros: rango, estado, usuario)

### 📸 Reglas 21-30: BACKEND EVIDENCIAS (Agente 03)

**Regla 21:** MIME whitelist: jpeg, png, gif, pdf (no exe, zip, etc)
**Regla 22:** Tamaño máx: 50MB por archivo
**Regla 23:** Generar thumbnails (150x150, 300x300)
**Regla 24:** Almacenar en carpeta segregada por orden
**Regla 25:** Permisos: solo propietario o admin leen
**Regla 26:** Metadata: usuario, timestamp, hash SHA256
**Regla 27:** URL de descarga con token temporal (1 hora)
**Regla 28:** Marcar evidencia como validada por inspector
**Regla 29:** Galería de evidencias en orden
**Regla 30:** Eliminar archivo físico al borrar registro

### 📋 Reglas 31-40: BACKEND FORMULARIOS (Agente 04)

**Regla 31:** JSON Schema para validación (no strings)
**Regla 32:** Campos requeridos vs opcionales explícitos
**Regla 33:** Tipos: string, number, boolean, date, select, checkbox
**Regla 34:** Select con options predefinidas (no text libre)
**Regla 35:** Regex para email, phone, URL, etc
**Regla 36:** Mensaje de error personalizado por regla
**Regla 37:** Frontend valida solo UI (backend valida SIEMPRE)
**Regla 38:** Salvar borrador automático cada 30 seg
**Regla 39:** Historial de versiones del formulario
**Regla 40:** Exportar respuestas a CSV/PDF

### 🏗️ Regla 41: ARQUITECTURA CRÍTICA (TODAS)

**REGLA 41: Backend es la FUENTE DE VERDAD**

```
├─ BACKEND (NestJS)
│  ├─ Lógica de negocio (100%)
│  ├─ Validaciones (100%)
│  ├─ Permisos (100%)
│  ├─ Cambios de estado (100%)
│  └─ Cálculos (100%)
│
└─ FRONTEND (Angular)
   ├─ UI (100%)
   ├─ UX (100%)
   ├─ Presentación (100%)
   └─ Consumo de API (100%)

❌ NUNCA en Frontend:
   - Lógica de negocio
   - Validaciones de reglas
   - Cambios de estado
   - Cálculos de precios
   - Decisiones de permisos

✅ SIEMPRE en Backend:
   - Todas las validaciones
   - Todos los permisos
   - Todos los cambios de estado
   - Todos los cálculos
```

---

## 🎯 PATRÓN DE INVOCACIÓN (TODOS LOS AGENTES)

```
Actúa como CERMONT [NOMBRE] AGENT.

EJECUTA SIN PREGUNTAR:

1. ANÁLISIS:
   - apps/api/src/modules/[modulo]/**
   - ¿Qué existe?
   - ¿Qué falta?
   - ¿Qué riesgos?
   - Validar Regla 41

2. PLAN:
   - 3-4 pasos numerados
   - Archivos exactos
   - Cambios específicos

3. IMPLEMENTACIÓN:
   - Código (solo si B se aprueba)
   - Cambios quirúrgicos
   - Sin "mejorar" unrequested

4. VERIFICACIÓN:
   - pnpm run test -- --testPathPattern=[modulo]
   - pnpm run build
   - Checklist completo

5. PENDIENTES:
   - Máx 5 mejoras futuras
```

---

## 🔧 FRASES DETALLADAS POR AGENTE

### BACKEND AGENTS

#### 01 - Auth Module
```
Actúa como el CERMONT BACKEND AUTH AGENT. Lee el prompt en docs/prompts/01-backend-auth.prompt.md y ejecuta el análisis del módulo de autenticación en apps/api/src/modules/auth. Entrega primero el Análisis (A) y luego el Plan (B).
```

#### 02 - Órdenes Module
```
Actúa como el CERMONT BACKEND ORDENES AGENT. Lee el prompt en docs/prompts/02-backend-ordenes.prompt.md y ejecuta el análisis del módulo de órdenes en apps/api/src/modules/ordenes. Verifica la máquina de estados y el historial de cambios.
```

#### 03 - Evidencias Module
```
Actúa como el CERMONT BACKEND EVIDENCIAS AGENT. Lee el prompt en docs/prompts/03-backend-evidencias.prompt.md y analiza el módulo de evidencias en apps/api/src/modules/evidencias. Prioriza validación de MIME types y permisos de descarga.
```

#### 04 - Formularios Module
```
Actúa como el CERMONT BACKEND FORMULARIOS AGENT. Lee el prompt en docs/prompts/04-backend-formularios.prompt.md y analiza el motor de formularios dinámicos. Verifica validaciones, dependencias y cálculos.
```

#### 05 - Sync Module
```
Actúa como el CERMONT BACKEND SYNC AGENT. Lee el prompt en docs/prompts/05-backend-sync.prompt.md y analiza el módulo de sincronización offline/online. Verifica idempotencia y resolución de conflictos.
```

#### 06 - PDF Generation
```
Actúa como el CERMONT BACKEND PDF AGENT. Lee el prompt en docs/prompts/06-backend-reportes-pdf.prompt.md y analiza la generación de PDFs con Puppeteer/PDFKit. Verifica caché y permisos.
```

#### 07 - Logging & Observability
```
Actúa como el CERMONT BACKEND LOGGING AGENT. Lee el prompt en docs/prompts/07-backend-logging.prompt.md y analiza el logging con Pino. Verifica sanitización de datos sensibles y elimina console.log.
```

#### 08 - Emails & Notifications
```
Actúa como el CERMONT BACKEND EMAILS AGENT. Lee el prompt en docs/prompts/08-backend-emails.prompt.md y analiza el módulo de notificaciones con Nodemailer. Verifica reintentos y manejo de errores.
```

#### 09 - Caching (In-Memory)
```
Actúa como el CERMONT BACKEND CACHING AGENT. Lee el prompt en docs/prompts/09-backend-caching.prompt.md y analiza el caching con cache-manager. Verifica TTL e invalidación en mutaciones.
```

#### 10 - API Documentation (Swagger)
```
Actúa como el CERMONT BACKEND API DOCS AGENT. Lee el prompt en docs/prompts/10-backend-api-docs.prompt.md y analiza la documentación Swagger. Verifica decoradores @Api* en controllers y DTOs.
```

### FRONTEND AGENTS

#### 11 - Umbrella (Coordinator)
```
Actúa como el CERMONT FRONTEND UMBRELLA AGENT. Lee el prompt en docs/prompts/11-frontend-umbrella.prompt.md. Clasifica el problema por dominios (API/UI/State/Perf) y recomienda qué sub-agente activar primero.
```

#### 12 - API Integration
```
Actúa como el CERMONT FRONTEND API AGENT. Lee el prompt en docs/prompts/12-frontend-api.prompt.md y analiza la integración Angular↔NestJS. Verifica interceptors, URLs y manejo de errores.
```

#### 13 - UI/UX
```
Actúa como el CERMONT FRONTEND UI/UX AGENT. Lee el prompt en docs/prompts/13-frontend-ui-ux.prompt.md y analiza los componentes en apps/web/src/app/shared. Verifica accesibilidad y responsive.
```

#### 14 - State & Data Management
```
Actúa como el CERMONT FRONTEND STATE AGENT. Lee el prompt en docs/prompts/14-frontend-state.prompt.md y analiza el manejo de estado con Angular Signals. Verifica duplicación y memory leaks.
```

#### 15 - Performance
```
Actúa como el CERMONT FRONTEND PERFORMANCE AGENT. Lee el prompt en docs/prompts/15-frontend-performance.prompt.md y analiza lazy loading, OnPush y trackBy. Verifica bundle size y subs colgadas.
```

#### 16 - Internationalization (i18n)
```
Actúa como el CERMONT FRONTEND I18N AGENT. Lee el prompt en docs/prompts/16-frontend-i18n.prompt.md y analiza la internacionalización. Verifica hardcode de textos y archivos JSON de traducción.
```

### CROSS-CUTTING AGENTS

#### 17 - DevOps CI/CD
```
Actúa como el CERMONT DEVOPS CI/CD AGENT. Lee el prompt en docs/prompts/17-devops-ci-cd.prompt.md y analiza los workflows de GitHub Actions y Dockerfiles. Verifica que CI pase antes de deploy.
```

#### 18 - Quality & Testing
```
Actúa como el CERMONT QUALITY TESTING AGENT. Lee el prompt en docs/prompts/18-quality-testing.prompt.md y analiza la cobertura de tests. Propón tests para módulos críticos (auth, ordenes).
```

---

## 📋 FRASES COMPUESTAS (Múltiples Agentes)

### Backend Completo
```
Ejecuta en secuencia los agentes CERMONT BACKEND: Auth (01), Ordenes (02), Evidencias (03), Formularios (04), Sync (05), PDF (06), Logging (07), Emails (08), Caching (09), API Docs (10). Para cada uno, entrega Análisis (A) y Plan (B) antes de continuar al siguiente.
```

### Frontend Completo
```
Ejecuta en secuencia los agentes CERMONT FRONTEND: Umbrella (11), API Integration (12), UI/UX (13), State (14), Performance (15), i18n (16). Para cada uno, entrega Análisis (A) y Plan (B).
```

### Revisión de Calidad Total
```
Ejecuta el CERMONT QUALITY TESTING AGENT (18) seguido del CERMONT DEVOPS CI/CD AGENT (17). Primero analiza gaps de testing, luego verifica que el pipeline de CI funcione correctamente.
```

### Problema Específico (Template)
```
[Describe el problema aquí]. Actúa como el CERMONT FRONTEND UMBRELLA AGENT, clasifica este problema por dominio, y recomienda qué sub-agente(s) activar con el orden de ejecución.
```

---

## 📊 CHECKLIST ANTES DE pnpm run dev

```bash
# Verificación obligatoria (2026-01-02)

[ ] Todas las reglas 1-40 en backend
[ ] Regla 41 (Frontend ≠ Backend) en toda la app
[ ] Logging: 0 secretos expuestos
[ ] Auth: JWT + 2FA + audit log
[ ] Órdenes: Máquina de estados correcta
[ ] Evidencias: MIME whitelist + thumbnails
[ ] Formularios: JSON Schema validation
[ ] Tests backend: >70% cobertura
[ ] Tests frontend: >70% cobertura
[ ] Swagger /api/docs funciona
[ ] Docker builds sin errores
[ ] CI/CD pipeline en verde
[ ] Git tree limpio (sin arch. no tracked)
```

---

## 🔥 USO RÁPIDO (COPY-PASTE)

| Necesidad | Frase Corta |
|-----------|-------------|
| Login no funciona | `Actúa como CERMONT AUTH AGENT, analiza el 401 en login` |
| Orden no cambia estado | `Actúa como CERMONT ORDENES AGENT, verifica la máquina de estados` |
| Upload falla | `Actúa como CERMONT EVIDENCIAS AGENT, verifica validación MIME` |
| Formulario no valida | `Actúa como CERMONT FORMULARIOS AGENT, analiza validaciones` |
| Sync duplica datos | `Actúa como CERMONT SYNC AGENT, verifica idempotencia` |
| PDF tarda mucho | `Actúa como CERMONT PDF AGENT, verifica caché` |
| Logs exponen secretos | `Actúa como CERMONT LOGGING AGENT, verifica sanitización` |
| Email no llega | `Actúa como CERMONT EMAILS AGENT, verifica SMTP config` |
| Cache no invalida | `Actúa como CERMONT CACHING AGENT, verifica invalidación` |
| Swagger incompleto | `Actúa como CERMONT API DOCS AGENT, añade decoradores` |
| Error 401 en frontend | `Actúa como CERMONT FRONTEND API AGENT, verifica interceptor` |
| UI inconsistente | `Actúa como CERMONT UI/UX AGENT, estandariza componentes` |
| Estado duplicado | `Actúa como CERMONT STATE AGENT, centraliza en signals` |
| Página lenta | `Actúa como CERMONT PERFORMANCE AGENT, verifica lazy loading` |
| Textos hardcoded | `Actúa como CERMONT I18N AGENT, extrae a JSON` |
| CI falla | `Actúa como CERMONT DEVOPS AGENT, verifica workflow` |
| Tests faltantes | `Actúa como CERMONT TESTING AGENT, propón tests críticos` |

---

## ⚡ ATAJOS DETALLADOS

### Login no funciona (401)
```
Actúa como CERMONT BACKEND AUTH AGENT.
EJECUTA SIN PREGUNTAR:
1. ANÁLISIS de apps/api/src/modules/auth/**
2. PLAN para arreglar login 401
3. IMPLEMENTACIÓN
4. VERIFICACIÓN: pnpm run test -- --testPathPattern=auth
```

### Orden no cancela
```
Actúa como CERMONT BACKEND ÓRDENES AGENT.
EJECUTA SIN PREGUNTAR:
1. ANÁLISIS de apps/api/src/modules/ordenes/**
2. PLAN para arreglar cancelación
3. IMPLEMENTACIÓN
4. VERIFICACIÓN: pnpm run test -- --testPathPattern=ordenes
```

### Frontend lento
```
Actúa como CERMONT FRONTEND PERFORMANCE AGENT.
EJECUTA SIN PREGUNTAR:
1. ANÁLISIS de apps/web/src/app/**
2. PLAN para optimizar (lazy loading, OnPush, trackBy)
3. IMPLEMENTACIÓN
4. VERIFICACIÓN: Lighthouse >90
```

---

## 🚀 CÓMO EMPEZAR

**Opción 1: Un módulo completo**
```
"Actúa como CERMONT BACKEND AUTH AGENT.
EJECUTA SIN PREGUNTAR:
1. ANÁLISIS
2. PLAN para mejorar auth
3. IMPLEMENTACIÓN
4. VERIFICACIÓN"
```

**Opción 2: Un problema específico**
```
"Actúa como CERMONT BACKEND ÓRDENES AGENT.
EJECUTA SIN PREGUNTAR:
1. ANÁLISIS
2. PLAN para arreglar cancelación de órdenes
3. IMPLEMENTACIÓN
4. VERIFICACIÓN"
```

**Opción 3: Coordinación frontend**
```
"Actúa como CERMONT FRONTEND UMBRELLA AGENT.
Clasifica este problema: [problema]
Recomienda qué sub-agente ejecutar"
```

---

## 📝 NOTAS FINALES

- **OSS ONLY**: Nodemailer, Puppeteer, @nestjs/* - NO SendGrid, SES, Firebase
- **Regla 41 ES CRÍTICA**: Frontend NUNCA toca lógica
- **CERO PREGUNTAS**: Agentes analizan y proponen, no preguntan
- **Verificación real**: Todos los comandos son ejecutables
- **Documentación viva**: Actualizar si cambian las reglas
