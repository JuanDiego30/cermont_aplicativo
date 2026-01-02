# 🚀 FRASES PARA INVOCAR AGENTES CERMONT

Copia y pega estas frases en Copilot/Claude/Gemini para activar cada agente.

---

## 🔧 BACKEND AGENTS

### 01 - Auth Module
```
Actúa como el CERMONT BACKEND AUTH AGENT. Lee el prompt en docs/prompts/01-backend-auth.prompt.md y ejecuta el análisis del módulo de autenticación en apps/api/src/modules/auth. Entrega primero el Análisis (A) y luego el Plan (B).
```

### 02 - Órdenes Module
```
Actúa como el CERMONT BACKEND ORDENES AGENT. Lee el prompt en docs/prompts/02-backend-ordenes.prompt.md y ejecuta el análisis del módulo de órdenes en apps/api/src/modules/ordenes. Verifica la máquina de estados y el historial de cambios.
```

### 03 - Evidencias Module
```
Actúa como el CERMONT BACKEND EVIDENCIAS AGENT. Lee el prompt en docs/prompts/03-backend-evidencias.prompt.md y analiza el módulo de evidencias en apps/api/src/modules/evidencias. Prioriza validación de MIME types y permisos de descarga.
```

### 04 - Formularios Module
```
Actúa como el CERMONT BACKEND FORMULARIOS AGENT. Lee el prompt en docs/prompts/04-backend-formularios.prompt.md y analiza el motor de formularios dinámicos. Verifica validaciones, dependencias y cálculos.
```

### 05 - Sync Module
```
Actúa como el CERMONT BACKEND SYNC AGENT. Lee el prompt en docs/prompts/05-backend-sync.prompt.md y analiza el módulo de sincronización offline/online. Verifica idempotencia y resolución de conflictos.
```

### 06 - PDF Generation
```
Actúa como el CERMONT BACKEND PDF AGENT. Lee el prompt en docs/prompts/06-backend-reportes-pdf.prompt.md y analiza la generación de PDFs con Puppeteer/PDFKit. Verifica caché y permisos.
```

### 07 - Logging & Observability
```
Actúa como el CERMONT BACKEND LOGGING AGENT. Lee el prompt en docs/prompts/07-backend-logging.prompt.md y analiza el logging con Pino. Verifica sanitización de datos sensibles y elimina console.log.
```

### 08 - Emails & Notifications
```
Actúa como el CERMONT BACKEND EMAILS AGENT. Lee el prompt en docs/prompts/08-backend-emails.prompt.md y analiza el módulo de notificaciones con Nodemailer. Verifica reintentos y manejo de errores.
```

### 09 - Caching (In-Memory)
```
Actúa como el CERMONT BACKEND CACHING AGENT. Lee el prompt en docs/prompts/09-backend-caching.prompt.md y analiza el caching con cache-manager. Verifica TTL e invalidación en mutaciones.
```

### 10 - API Documentation (Swagger)
```
Actúa como el CERMONT BACKEND API DOCS AGENT. Lee el prompt en docs/prompts/10-backend-api-docs.prompt.md y analiza la documentación Swagger. Verifica decoradores @Api* en controllers y DTOs.
```

---

## 🎨 FRONTEND AGENTS

### 11 - Umbrella (Coordinator)
```
Actúa como el CERMONT FRONTEND UMBRELLA AGENT. Lee el prompt en docs/prompts/11-frontend-umbrella.prompt.md. Clasifica el problema por dominios (API/UI/State/Perf) y recomienda qué sub-agente activar primero.
```

### 12 - API Integration
```
Actúa como el CERMONT FRONTEND API AGENT. Lee el prompt en docs/prompts/12-frontend-api.prompt.md y analiza la integración Angular↔NestJS. Verifica interceptors, URLs y manejo de errores.
```

### 13 - UI/UX
```
Actúa como el CERMONT FRONTEND UI/UX AGENT. Lee el prompt en docs/prompts/13-frontend-ui-ux.prompt.md y analiza los componentes en apps/web/src/app/shared. Verifica accesibilidad y responsive.
```

### 14 - State & Data Management
```
Actúa como el CERMONT FRONTEND STATE AGENT. Lee el prompt en docs/prompts/14-frontend-state.prompt.md y analiza el manejo de estado con Angular Signals. Verifica duplicación y memory leaks.
```

### 15 - Performance
```
Actúa como el CERMONT FRONTEND PERFORMANCE AGENT. Lee el prompt en docs/prompts/15-frontend-performance.prompt.md y analiza lazy loading, OnPush y trackBy. Verifica bundle size y subs colgadas.
```

### 16 - Internationalization (i18n)
```
Actúa como el CERMONT FRONTEND I18N AGENT. Lee el prompt en docs/prompts/16-frontend-i18n.prompt.md y analiza la internacionalización. Verifica hardcode de textos y archivos JSON de traducción.
```

---

## ⚙️ CROSS-CUTTING AGENTS

### 17 - DevOps CI/CD
```
Actúa como el CERMONT DEVOPS CI/CD AGENT. Lee el prompt en docs/prompts/17-devops-ci-cd.prompt.md y analiza los workflows de GitHub Actions y Dockerfiles. Verifica que CI pase antes de deploy.
```

### 18 - Quality & Testing
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

## 🔥 USO RÁPIDO

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
