# 🔥 NUEVOS AGENTES Y PROMPTS - CERMONT 2026

Se deben crear estos archivos en `docs/prompts/` luego de completar las 5 fases.

---

## 📄 **19-frontend-auth-critical.prompt.md**

```markdown
# 🔐 CERMONT FRONTEND AUTH CRITICAL AGENT

**Responsabilidad:** Reparar login/logout, CSRF, token refresh, 2FA  
**Patrón:** SIN PREGUNTAS (Regla 1)  
**Última actualización:** 2026-01-02

---

## 🚀 INVOCACIÓN RÁPIDA

\`\`\`
Actúa como CERMONT FRONTEND AUTH CRITICAL AGENT.

EJECUTA SIN PREGUNTAR:
1. ANÁLISIS: apps/web/src/app/core/{auth,services,interceptors}
   - Verificar AuthInterceptor existe
   - Verificar CSRF token flow
   - Verificar memory leaks (takeUntil)
   - Verificar token refresh automático
   
2. PLAN: 3-4 pasos

3. IMPLEMENTACIÓN: Si se aprueba

4. VERIFICACIÓN: Login funciona 200 OK
\`\`\`

---

## 🔍 QUÉ ANALIZAR (SIN CÓDIGO)

1. **AuthInterceptor**
   - ¿Existe apps/web/src/app/core/interceptors/auth.interceptor.ts?
   - ¿Se registra en app.config.ts?
   - ¿Agrega Authorization header?
   - ¿Agrega CSRF header?

2. **CSRF Token Flow**
   - ¿AuthService guarda CSRF después de login?
   - ¿AuthService limpia CSRF en logout?
   - ¿Interceptor incluye X-CSRF-Token header?

3. **Memory Leaks**
   - ¿LoginComponent usa takeUntil(destroy$)?
   - ¿Todos los componentes con subscripciones limpian?
   - ¿No hay console warnings?

4. **Token Refresh**
   - ¿AuthService.refreshToken() funciona?
   - ¿Interceptor reintenta request en 401?
   - ¿No refresh infinito?

---

## ✅ CHECKLIST IMPLEMENTACIÓN

- [ ] AuthInterceptor creado y registrado
- [ ] Login POST 200 OK (no 401)
- [ ] Token guardado en localStorage
- [ ] CSRF token guardado
- [ ] Token enviado en Authorization header
- [ ] CSRF token enviado en X-CSRF-Token header
- [ ] Logout limpia tokens
- [ ] 401 dispara refresh automático
- [ ] No memory leaks
- [ ] 2FA flow funciona

---

## 🧪 VERIFICACIÓN

\`\`\`bash
cd apps/web && npm run build

# Network tab: POST /api/auth/login
# Esperado: 200 OK, response con token, csrfToken, user

# localStorage
# Esperado: cermont_access_token, cermont_csrf_token, cermont_user

# Verificar interceptor
grep -r "AuthInterceptor" src/app/app.config.ts | head -5
# Esperado: HTTP_INTERCEPTORS, useClass: AuthInterceptor

# Verificar memory leaks
grep -r "takeUntil\|destroy\$" src/app/features/ | wc -l
# Esperado: >10 líneas

# Lighthouse
# Esperado: Performance >85
\`\`\`

---

## 📝 FORMATO ENTREGA

A) **ANÁLISIS** | B) **PLAN (3-4 pasos)** | C) **IMPLEMENTACIÓN** | D) **VERIFICACIÓN** | E) **PENDIENTES (máx 5)**
\`\`\`

---

## 📄 **20-frontend-shared-components.prompt.md**

\`\`\`markdown
# 🎨 CERMONT FRONTEND SHARED COMPONENTS AGENT

**Responsabilidad:** Button, Input, Card, Loader componentes reutilizables  
**Patrón:** SIN PREGUNTAS  
**Última actualización:** 2026-01-02

---

## 🚀 INVOCACIÓN RÁPIDA

\`\`\`
Actúa como CERMONT FRONTEND SHARED COMPONENTS AGENT.

EJECUTA SIN PREGUNTAR:
1. ANÁLISIS: apps/web/src/app/shared/components/
   - ¿Existen componentes base?
   - ¿Button component existe?
   - ¿Input component existe?
   - ¿Consistent styling?
   
2. PLAN: 3-4 pasos

3. IMPLEMENTACIÓN: Si se aprueba

4. VERIFICACIÓN: Componentes en uso en LoginComponent
\`\`\`

---

## 🔍 QUÉ ANALIZAR (SIN CÓDIGO)

1. **Button Component**
   - ¿Existe apps/web/src/app/shared/components/button/?
   - ¿Soporta variantes (primary, secondary, danger)?
   - ¿Soporta loading state?
   - ¿ARIA accessible?

2. **Input Component**
   - ¿ControlValueAccessor implementado?
   - ¿Muestra errores?
   - ¿Validación visual?

3. **Styling**
   - ¿Usa CSS variables de design system?
   - ¿Dark mode soportado?
   - ¿Responsive (mobile, tablet, desktop)?

4. **Usage**
   - ¿LoginComponent usa <app-button>?
   - ¿LoginComponent usa <app-form-input>?
   - ¿Sin duplicación de código?

---

## ✅ CHECKLIST IMPLEMENTACIÓN

- [ ] Button component creado (primary, secondary, danger)
- [ ] Input component creado (ControlValueAccessor)
- [ ] Card component creado
- [ ] Loader component creado
- [ ] Todos accesibles (ARIA)
- [ ] Responsive design
- [ ] Dark mode support
- [ ] LoginComponent usa shared components
- [ ] 0 duplicación de estilos
- [ ] Lighthouse >90 (Accessibility)

---

## 🧪 VERIFICACIÓN

\`\`\`bash
cd apps/web && npm run build

# Componentes presentes
ls -la src/app/shared/components/

# Esperado:
# button/
# form-input/
# card/
# loader/

# LoginComponent usa componentes
grep -r "<app-button\|<app-form-input" src/app/features/auth/

# Esperado: >3 líneas

# Lighthouse Accessibility
# Chrome DevTools → Lighthouse → Accessibility
# Esperado: >90

# No duplicación de estilos
find src/app/features -name "*.css" -exec grep -l "btn-\|form-\|card" {} \;

# Esperado: 0 líneas (estilos en shared/styles)
\`\`\`

---

## 📝 FORMATO ENTREGA

A) **ANÁLISIS** | B) **PLAN (3-4 pasos)** | C) **IMPLEMENTACIÓN** | D) **VERIFICACIÓN** | E) **PENDIENTES (máx 5)**
\`\`\`

---

## 📄 **21-backend-security.prompt.md**

\`\`\`markdown
# 🔒 CERMONT BACKEND SECURITY AGENT

**Responsabilidad:** CORS, Rate Limiting, Input Validation, CSRF  
**Patrón:** SIN PREGUNTAS (Regla 5, 6, 7)  
**Última actualización:** 2026-01-02

---

## 🚀 INVOCACIÓN RÁPIDA

\`\`\`
Actúa como CERMONT BACKEND SECURITY AGENT.

EJECUTA SIN PREGUNTAR:
1. ANÁLISIS: apps/api/src/main.ts, auth.controller.ts
   - ¿CORS tiene credentials: true?
   - ¿Throttler global configurado?
   - ¿ValidationPipe global?
   - ¿CSRF protection completa?
   
2. PLAN: 3-4 pasos

3. IMPLEMENTACIÓN: Si se aprueba

4. VERIFICACIÓN: npm run test:security (cobertura >70%)
\`\`\`

---

## 🔍 QUÉ ANALIZAR (SIN CÓDIGO)

1. **CORS**
   - ¿enableCors() tiene credentials: true?
   - ¿allowedHeaders incluye Authorization, X-CSRF-Token?
   - ¿exposedHeaders incluye X-CSRF-Token?

2. **Rate Limiting**
   - ¿Throttler está configurado globalmente?
   - ¿Login tiene @ThrottleAuth()?
   - ¿Límites: 5 intentos / 15 minutos?

3. **Validation**
   - ¿ValidationPipe global en main.ts?
   - ¿forbidNonWhitelisted: true?
   - ¿Errores formateados?

4. **CSRF**
   - ¿assertCsrf() en logout, refresh?
   - ¿Tokens rotados después de refresh?
   - ¿No tokens reutilizables?

---

## ✅ CHECKLIST IMPLEMENTACIÓN

- [ ] CORS credentials: true
- [ ] CORS headers válidos
- [ ] Throttler global (5/15min)
- [ ] ValidationPipe global
- [ ] forbidNonWhitelisted: true
- [ ] CSRF en logout
- [ ] CSRF en refresh
- [ ] Tokens rotados
- [ ] 0 hardcoded secrets
- [ ] Logs sanitizados

---

## 🧪 VERIFICACIÓN

\`\`\`bash
cd apps/api && npm run build

# CORS config
grep -A 5 "enableCors" src/main.ts

# Esperado: credentials: true, allowedHeaders

# Throttler
grep -r "Throttler\|ThrottleAuth" src/

# Esperado: Global + login endpoint

# ValidationPipe
grep -A 3 "useGlobalPipes" src/main.ts

# Esperado: ValidationPipe({...})

# CSRF
grep -r "assertCsrf\|CSRF" src/modules/auth/

# Esperado: En logout, refresh

# Security tests
npm run test:security

# Esperado: >70% cobertura
\`\`\`

---

## 📝 FORMATO ENTREGA

A) **ANÁLISIS** | B) **PLAN (3-4 pasos)** | C) **IMPLEMENTACIÓN** | D) **VERIFICACIÓN** | E) **PENDIENTES (máx 5)**
\`\`\`

---

## 📄 **22-integration-tests.prompt.md**

\`\`\`markdown
# 🧪 CERMONT INTEGRATION TESTS AGENT

**Responsabilidad:** E2E tests, API integration tests, Mock data  
**Patrón:** SIN PREGUNTAS  
**Última actualización:** 2026-01-02

---

## 🚀 INVOCACIÓN RÁPIDA

\`\`\`
Actúa como CERMONT INTEGRATION TESTS AGENT.

EJECUTA SIN PREGUNTAR:
1. ANÁLISIS: apps/web/e2e/, apps/api/test/
   - ¿Existen E2E tests?
   - ¿Login flow probado?
   - ¿API integration tests?
   - ¿Mock data setup?
   
2. PLAN: 3-4 pasos

3. IMPLEMENTACIÓN: Si se aprueba

4. VERIFICACIÓN: npm run test:e2e (100% pass)
\`\`\`

---

## 🔍 QUÉ ANALIZAR (SIN CÓDIGO)

1. **E2E Tests (Cypress)**
   - ¿Existen tests para login?
   - ¿Flujo completo probado?
   - ¿Errores probados?

2. **API Integration**
   - ¿Tests de endpoints?
   - ¿Auth header probado?
   - ¿CSRF validation probado?

3. **Mock Data**
   - ¿Seeds para DB test?
   - ¿Users de prueba?
   - ¿Datos limpios entre tests?

4. **Coverage**
   - ¿>80% backend?
   - ¿>70% frontend?
   - ¿Auth module >85%?

---

## ✅ CHECKLIST IMPLEMENTACIÓN

- [ ] E2E: Login flow (success)
- [ ] E2E: Login error (invalid credentials)
- [ ] E2E: Login + 2FA
- [ ] API: POST /auth/login
- [ ] API: POST /auth/logout
- [ ] API: POST /auth/refresh
- [ ] API: CSRF validation
- [ ] Seeding script funciona
- [ ] Tests pasan (100%)
- [ ] Coverage >80% auth module

---

## 🧪 VERIFICACIÓN

\`\`\`bash
# E2E tests
cd apps/web && npm run e2e

# Esperado: todos los tests en verde

# API integration tests
cd apps/api && npm run test:integration

# Esperado: >90% pass rate

# Coverage
npm run test:cov

# Esperado: >80% overall

# Seed data
npm run db:seed

# Esperado: 5-10 users de prueba creados
\`\`\`

---

## 📝 FORMATO ENTREGA

A) **ANÁLISIS** | B) **PLAN (3-4 pasos)** | C) **IMPLEMENTACIÓN** | D) **VERIFICACIÓN** | E) **PENDIENTES (máx 5)**
\`\`\`

---

## ✨ RESUMEN

| Agente | Archivo | Responsabilidad |
|--------|---------|---|
| **19** | frontend-auth-critical.prompt.md | Login/Logout/CSRF/Refresh |
| **20** | frontend-shared-components.prompt.md | Button, Input, Card, Loader |
| **21** | backend-security.prompt.md | CORS, Rate Limit, Validation, CSRF |
| **22** | integration-tests.prompt.md | E2E, API tests, Mock data |

Estos 4 nuevos agentes + los 18 existentes = **22 AGENTES TOTALES** para todo CERMONT.
```

