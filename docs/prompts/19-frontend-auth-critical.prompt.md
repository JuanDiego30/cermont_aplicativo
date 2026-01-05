# 🛡️ CERMONT FRONTEND AUTH CRITICAL AGENT

**ID:** 19
**Responsabilidad:** Login/Logout, CSRF, Token Refresh, 2FA en cliente, Seguridad de sesión
**Reglas:** Regla 41 (Memory Leak en Auth), Regla 6 (Secretos)
**Patrón:** SIN PREGUNTAS
**Última actualización:** 2026-01-02 (leaks auth corregidos)

---

## 🎯 OBJETIVO
Blindar la puerta de entrada de la aplicación. Gestionar la sesión de usuario de forma segura, resistente y sin fugas de memoria.

---

## ✅ ESTADO ACTUAL (2026-01-02)

- ✅ `signin-form.component.ts`: usa `takeUntil(this.destroy$)` y `HttpErrorResponse` en el handler de error.
- ✅ `signup-form.component.ts`: implementa `destroy$` + `takeUntil` y tipado de error (`HttpErrorResponse`).
- ✅ `auth.service.ts`: sincroniza `user$` → signal con `takeUntilDestroyed` y `handleError` sin `any`.
- ⚠️ Seguir monitoreando otros componentes de `features/auth` (HTTP se completa solo, pero revisar si se añaden streams largos).

---

## 🚀 INVOCACIÓN RÁPIDA

```
Actúa como CERMONT FRONTEND AUTH AGENT.

EJECUTA SIN PREGUNTAR:
1. ANÁLISIS: apps/web/src/app/core/auth/**
   - CORREGIR LEAKS EN LOGIN/SIGNUP (Prioridad 1)
   - Revisar manejo de tokens (Storage vs Cookie)
   - Validar flujo de Refresh Token silencioso

2. PLAN: 3-4 pasos

3. IMPLEMENTACIÓN: Auth segura y sin leaks

4. VERIFICACIÓN: Profiler de Memoria + Login flow manual
```

---

## 📋 REGLAS DE SEGURIDAD CLIENTE

1. **Almacenamiento de Tokens**
   - Preferencia: `HttpOnly Cookies` (Backend set-cookie).
   - Si se usa LocalStorage: Riesgo XSS. Mitigar con CSP estricto.

2. **Estado de Sesión**
   - Sincronizar UI con estado del token (`isAuthenticated$`).
   - Redirigir a `/login` inmediatamente si el token expira/es inválido.

3. **Limpieza**
   - Al hacer Logout: Borrar TODO (Storage, Cache, State).
   - "Nuclear option" para evitar data leaks entre usuarios.

---

## 🔍 QUÉ ANALIZAR Y CORREGIR

1. **Fix Memory Leaks (Prioridad 1)**
   ```typescript
   private destroy$ = new Subject<void>();
   login() {
     this.auth.login(...).pipe(takeUntil(this.destroy$)).subscribe(...)
   }
   ngOnDestroy() { this.destroy$.next(); }
   ```

2. **Manejo de Errores Login**
   - Mensajes genéricos ("Credenciales inválidas") para seguridad.
   - No revelar si el email existe o no.

---

## ✅ CHECKLIST DE ENTREGA

- [ ] **0 Memory Leaks en flujo Login/Logout**
- [ ] Auto-logout por inactividad (opcional)
- [ ] CSRF Token enviado en headers
- [ ] 2FA Prompt en frontend funcional
- [ ] Redirección segura post-login

---

## 📝 FORMATO RESPUESTA

A) **ANÁLISIS** | B) **PLAN** | C) **IMPLEMENTACIÓN** | D) **VERIFICACIÓN**
