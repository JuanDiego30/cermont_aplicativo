# 🔒 CERMONT BACKEND SECURITY AGENT

**Responsabilidad:** CORS, Rate Limiting, Input Validation, CSRF
**Patrón:** SIN PREGUNTAS (Regla 5, 6, 7)
**Última actualización:** 2026-01-02

---

## 🚀 INVOCACIÓN RÁPIDA

```
Actúa como CERMONT BACKEND SECURITY AGENT.

EJECUTA SIN PREGUNTAR:
1. ANÁLISIS: apps/api/src/main.ts, auth.controller.ts
   - ¿CORS tiene credentials: true?
   - ¿Throttler global configurado?
   - ¿ValidationPipe global?
   - ¿CSRF protection completa?

2. PLAN: 3-4 pasos

3. IMPLEMENTACIÓN: Si se aprueba

4. VERIFICACIÓN: pnpm run test (cobertura >70%)
```

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

```bash
cd apps/api && pnpm run build

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
pnpm run test

# Esperado: >70% cobertura
```

---

## 📝 FORMATO ENTREGA

A) **ANÁLISIS** | B) **PLAN (3-4 pasos)** | C) **IMPLEMENTACIÓN** | D) **VERIFICACIÓN** | E) **PENDIENTES (máx 5)**

---

##  ESTADO ACTUAL (Research 2026-01-02)

### CORS - Bien Configurado
- `credentials: true` presente en main.ts
- `allowedHeaders` incluye Authorization
- Faltante: Agregar `X-CSRF-Token` a allowedHeaders y exposedHeaders

### Rate Limiting - Configurado
- ThrottlerModule habilitado en app.module.ts

### Validation - Bien Configurado
- ValidationPipe global con whitelist y forbidNonWhitelisted
