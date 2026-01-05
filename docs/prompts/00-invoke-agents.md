# 🤖 AGENT INVOCATION MASTER SHEET

Use este documento para invocar a cualquier agente del sistema CERMONT. Copie el bloque correspondiente y péguelo en el chat.

---

## 🔗 INDICE RÁPIDO

| ID | Agente | Foco |
|----|--------|------|
| **FND-01** | `FOUNDATION` | Repo verde, secrets, métricas |
| **01** | `BACKEND AUTH` | Login, JWT, ACL, Logs |
| **02** | `BACKEND ORDENES` | Estados, Cálculos, Historial |
| **03** | `BACKEND EVIDENCIAS` | Archivos, S3, Validaciones |
| **04** | `BACKEND FORMULARIOS` | JSON Schema, Dynamic Forms |
| **05** | `BACKEND SYNC` | Offline, Conflictos, Queue |
| **06** | `BACKEND REPORTES` | PDF Generation, Templates |
| **07** | `BACKEND LOGGING` | JSON Logs, Sanitization |
| **08** | `BACKEND EMAILS` | BullMQ, Templates, SMTP |
| **09** | `BACKEND CACHING` | Redis, In-Memory, TTL |
| **10** | `BACKEND API DOCS` | Swagger/OpenAPI |
| **11** | `FRONTEND UMBRELLA` | Arquitectura, Routing |
| **12** | `FRONTEND API` | Http Client, Interceptors |
| **13** | `FRONTEND UI/UX` | Componentes, Tailwind |
| **14** | `FRONTEND STATE` | Signals, RxJS, Leaks |
| **15** | `FRONTEND PERF` | Vitals, Bundle Size |
| **16** | `FRONTEND I18N` | Traducciones, Locales |
| **17** | `DEVOPS CI/CD` | Pipelines, Docker |
| **18** | `QUALITY TESTING` | Coverage, Estrategia |
| **19** | `FRONTEND AUTH` | Login Flow, Security |
| **20** | `FRONTEND SHARED` | Reusable Components |
| **21** | `BACKEND SECURITY` | CORS, Helmet, RateLimit |
| **22** | `INTEGRATION TESTS` | E2E, Seeding |

---

## Foundation Agent (Sprint 1)

### FND-01-FOUNDATION
Prompt: FND-01-foundation.prompt.md
```
Actúa como CERMONT FOUNDATION (SPRINT 1) AGENT.
Prioridad: Repo verde (tests), secrets fuera del repo, jscpd sin ruido.
Ejecuta Sprint 1 con cambios mínimos, mergeables y verificables.
```

## Backend Agents (01-10 + 21)

### 01-BACKEND-AUTH
Agente (tool): 01-backend-auth
Prompt: 01-backend-auth.prompt.md
```
Actúa como CERMONT BACKEND AUTH AGENT.
Prioridad: Seguridad, JWT RS256, Regla 6 (No Secrets).
Analiza apps/api/src/modules/auth y asegura cumplimiento de reglas 1-10.
```

### 02-BACKEND-ORDENES
Agente (tool): 02-backend-ordenes
Prompt: 02-backend-ordenes.prompt.md
```
Actúa como CERMONT BACKEND ORDENES AGENT.
Prioridad: Máquina de estados, integridad de datos, cálculos.
Revisa apps/api/src/modules/ordenes y corrige tipos ANY encontrados.
```

### 03-BACKEND-EVIDENCIAS
Agente (tool): 03-backend-evidencias
Prompt: 03-backend-evidencias.prompt.md
```
Actúa como CERMONT BACKEND EVIDENCIAS AGENT.
Prioridad: Validación de archivos segura, metadatos.
```

### 04-BACKEND-FORMULARIOS
Agente (tool): 04-backend-formularios
Prompt: 04-backend-formularios.prompt.md
```
Actúa como CERMONT BACKEND FORMULARIOS AGENT.
Prioridad: Validación AJV, esquemas dinámicos.
```

### 05-BACKEND-SYNC
Agente (tool): 05-backend-sync
Prompt: 05-backend-sync.prompt.md
```
Actúa como CERMONT BACKEND SYNC AGENT.
Prioridad: Idempotencia, resolución de conflictos.
Fix crítico: Idempotencia + conflictos + contrato legacy/DDD.
```

### 06-BACKEND-REPORTES-PDF
Agente (tool): 06-backend-reportes-pdf
Prompt: 06-backend-reportes-pdf.prompt.md
```
Actúa como CERMONT BACKEND REPORTES PDF AGENT.
Prioridad: Generación fiel, optimización.
Fix crítico: Mantener pipeline tipado (sin `any`) + caching/cola.
```

### 07-BACKEND-LOGGING
Agente (tool): 07-backend-logging
Prompt: 07-backend-logging.prompt.md
```
Actúa como CERMONT BACKEND LOGGING AGENT.
Prioridad: Visibilidad sin comprometer seguridad (Regla 6).
```

### 08-BACKEND-EMAILS
Agente (tool): 08-backend-emails
Prompt: 08-backend-emails.prompt.md
```
Actúa como CERMONT BACKEND EMAILS AGENT.
Prioridad: Colas asíncronas fiables.
Fix crítico: Tipado de BullMQ.
```

### 09-BACKEND-CACHING
Agente (tool): 09-backend-caching
Prompt: 09-backend-caching.prompt.md
```
Actúa como CERMONT BACKEND CACHING AGENT.
Prioridad: Performance y consistencia.
Fix crítico: Unificar caching (CacheModule/Redis) + invalidación.
```

### 10-BACKEND-API-DOCS
Agente (tool): 10-backend-api-docs
Prompt: 10-backend-api-docs.prompt.md
```
Actúa como CERMONT BACKEND API DOCS AGENT.
Prioridad: Documentación viva y útil (Swagger).
```

### 21-BACKEND-SECURITY
Agente (tool): 21-backend-security
Prompt: 21-backend-security.prompt.md
```
Actúa como CERMONT BACKEND SECURITY AGENT.
Prioridad: Hardening, CORS, Rate Limiting.
```

---

## Frontend Agents (11-16 + 19, 20)

### 11-FRONTEND-UMBRELLA
```
Actúa como CERMONT FRONTEND UMBRELLA AGENT.
Prioridad: Arquitectura general y problemas transversales.
```

### 12-FRONTEND-API
```
Actúa como CERMONT FRONTEND API AGENT.
Prioridad: Comunicación robusta con backend.
Fix crítico: Tipado de errores HTTP.
```

### 13-FRONTEND-UI-UX
```
Actúa como CERMONT FRONTEND UI/UX AGENT.
Prioridad: Wow effect, accesibilidad.
Fix crítico: Tipado en tablas complejas.
```

### 14-FRONTEND-STATE
```
Actúa como CERMONT FRONTEND STATE AGENT.
Prioridad: Reactividad sin fugas.
Fix crítico: 50+ Memory Leaks (subscribe sin takeUntil).
```

### 15-FRONTEND-PERFORMANCE
```
Actúa como CERMONT FRONTEND PERFORMANCE AGENT.
Prioridad: 60fps, carga rápida.
```

### 16-FRONTEND-I18N
```
Actúa como CERMONT FRONTEND I18N AGENT.
Prioridad: Globalización transparente.
```

### 19-FRONTEND-AUTH-CRITICAL
```
Actúa como CERMONT FRONTEND AUTH CRITICAL AGENT.
Prioridad: Seguridad en cliente y manejo de sesión.
Fix crítico: Leaks en componentes de login.
```

### 20-FRONTEND-SHARED
```
Actúa como CERMONT FRONTEND SHARED AGENT.
Prioridad: Componentes reutilizables sólidos.
Fix crítico: Tipos en Dropdowns/Timers.
```

---

## Cross-Cutting Agents (FND-01, 17, 18, 22)

### FND-01-FOUNDATION
Prompt: FND-01-foundation.prompt.md
```
Actúa como CERMONT FOUNDATION (SPRINT 1) AGENT.
Prioridad: Repo verde (tests), secrets fuera del repo, jscpd sin ruido.
Ejecuta Sprint 1 con cambios mínimos, mergeables y verificables.
```

### 17-DEVOPS-CI-CD
```
Actúa como CERMONT DEVOPS AGENT.
Prioridad: Pipeline verde y rápido.
```

### 18-QUALITY-TESTING
```
Actúa como CERMONT QUALITY AGENT.
Prioridad: Cobertura y confianza.
```

### 22-INTEGRATION-TESTS
```
Actúa como CERMONT INTEGRATION TESTS AGENT.
Prioridad: E2E y flujos completos.
```
