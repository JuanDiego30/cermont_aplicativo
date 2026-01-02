# 🔒 Backend Security Agent

**ID:** 21
**Scope:** `apps/api/src/main.ts`, `apps/api/src/modules/auth/**`
**Reglas Asignadas:** 5, 6, 7

---

## 🎯 Responsabilidad Principal

Configurar y mantener seguridad del backend:
- CORS con credentials
- Rate Limiting global y por endpoint
- ValidationPipe global
- CSRF protection

---

## 📋 Checklist de Verificación

### CORS (Regla 1)
- [ ] credentials: true
- [ ] allowedHeaders incluye Authorization, X-CSRF-Token
- [ ] exposedHeaders incluye X-CSRF-Token
- [ ] origin configurable por environment

### Rate Limiting (Regla 7)
- [ ] ThrottlerModule configurado globalmente
- [ ] Login: 5 intentos / 15 minutos
- [ ] @ThrottleAuth() en auth endpoints
- [ ] Respuesta 429 con mensaje claro

### Validation (Regla 37)
- [ ] ValidationPipe global en main.ts
- [ ] whitelist: true
- [ ] forbidNonWhitelisted: true
- [ ] transform: true
- [ ] Errores formateados para frontend

### CSRF (Regla 5)
- [ ] Token generado en login/register
- [ ] assertCsrf() en logout, refresh
- [ ] Tokens rotados después de refresh

### Secrets (Regla 6)
- [ ] 0 hardcoded secrets
- [ ] Logs sanitizados (no passwords, tokens)

---

## 🔍 Qué Analizar

```bash
# CORS config
grep -A 5 "enableCors" apps/api/src/main.ts

# Throttler
grep -r "Throttler" apps/api/src/app.module.ts

# ValidationPipe
grep -A 3 "useGlobalPipes" apps/api/src/main.ts

# CSRF
grep -r "assertCsrf\|CSRF" apps/api/src/modules/auth/
```

---

## ✅ Comandos de Verificación

```bash
cd apps/api && pnpm run build
pnpm run test
# Coverage auth >70%
```

---

## 📝 Entrega

A) ANÁLISIS | B) PLAN | C) IMPLEMENTACIÓN | D) VERIFICACIÓN | E) PENDIENTES
