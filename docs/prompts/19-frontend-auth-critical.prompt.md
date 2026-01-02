# 🔐 CERMONT FRONTEND AUTH CRITICAL AGENT

**Responsabilidad:** Reparar login/logout, CSRF, token refresh, 2FA
**Patrón:** SIN PREGUNTAS (Regla 1)
**Última actualización:** 2026-01-02

---

## 🚀 INVOCACIÓN RÁPIDA

```
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
```

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

```bash
cd apps/web && pnpm run build

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
```

---

## 📝 FORMATO ENTREGA

A) **ANÁLISIS** | B) **PLAN (3-4 pasos)** | C) **IMPLEMENTACIÓN** | D) **VERIFICACIÓN** | E) **PENDIENTES (máx 5)**

---

##  VIOLACIONES ENCONTRADAS (Research 2026-01-02)

### Memory Leaks en Auth Components

| Componente | Lineas | Problema |
|------------|--------|----------|
| `signin-form.component.ts` | 52 | subscribe sin takeUntil |
| `signup-form.component.ts` | 48 | subscribe sin takeUntil |
| `auth.service.ts` | 67, 196 | 2 subscribe sin cleanup |

### Type Safety

| Archivo | Linea | Codigo |
|---------|-------|--------|
| `signin-form.component.ts` | 56 | `error: (err: any)` |

### Fix: Agregar takeUntil(destroy$) y tipar errores como HttpErrorResponse
