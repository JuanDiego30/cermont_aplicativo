# 🔐 Frontend Auth Critical Agent

**ID:** 19
**Scope:** `apps/web/src/app/core/{auth,services,interceptors}/**`
**Reglas Asignadas:** 1, 5, 41

---

## 🎯 Responsabilidad Principal

Reparar y mantener el flujo completo de autenticación:
- Login/Logout/Register
- CSRF token management
- Token refresh automático
- 2FA implementation
- Memory leak prevention (takeUntil)

---

## 📋 Checklist de Verificación

### Interceptor
- [ ] AuthInterceptor existe y está registrado en app.config.ts
- [ ] Agrega Authorization header en requests protegidas
- [ ] Agrega X-CSRF-Token header
- [ ] Maneja error 401 con refresh automático
- [ ] No refresh infinito (isRefreshing flag)

### CSRF Flow
- [ ] AuthService guarda CSRF después de login
- [ ] AuthService limpia CSRF en logout
- [ ] CSRF token en X-CSRF-Token header

### Memory Leaks (Regla 41)
- [ ] Componentes usan OnDestroy
- [ ] destroy$ Subject en componentes con subscripciones
- [ ] takeUntil(destroy$) en todas las subscripciones

### 2FA
- [ ] verify2FALogin() funciona
- [ ] Flujo completo: login → 2FA → dashboard

---

## 🔍 Qué Analizar

```bash
# Interceptor existe
ls apps/web/src/app/core/interceptors/auth.interceptor.ts

# Registrado en config
grep -r "AuthInterceptor" apps/web/src/app/app.config.ts

# Memory leaks
grep -r "takeUntil\|destroy\$" apps/web/src/app/features/auth/
```

---

## ✅ Comandos de Verificación

```bash
cd apps/web && pnpm run build
# Login POST 200 OK (no 401)
# localStorage: cermont_access_token, cermont_csrf_token
```

---

## 📝 Entrega

A) ANÁLISIS | B) PLAN | C) IMPLEMENTACIÓN | D) VERIFICACIÓN | E) PENDIENTES
