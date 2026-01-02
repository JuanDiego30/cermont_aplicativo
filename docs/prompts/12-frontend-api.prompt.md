# 🔗 CERMONT FRONTEND API AGENT

**Responsabilidad:** Integración Angular ↔ NestJS (Regla 41)
**Patrón:** SIN PREGUNTAS
**Última actualización:** 2026-01-02

---

## 🚀 INVOCACIÓN RÁPIDA

```
Actúa como CERMONT FRONTEND API AGENT.

EJECUTA SIN PREGUNTAR:
1. ANÁLISIS: apps/web/src/app/core/services/**
   - Interceptors de auth, URLs correctas, error handling
   - Regla 41: Backend es fuente de verdad

2. PLAN: 3-4 pasos

3. IMPLEMENTACIÓN: Si se aprueba

4. VERIFICACIÓN: pnpm run test -- --include=api
```

---

## 🔍 QUÉ ANALIZAR (SIN CÓDIGO)

1. **Interceptor de Auth**
   - ¿Existe HttpInterceptor para agregar Authorization?
   - ¿Adjunta Bearer token correctamente?
   - ¿Maneja 401 (logout si token expirado)?

2. **URLs Base**
   - ¿La API base es `http://localhost:3000/api` en dev?
   - ¿Está en environment (no hardcodeada)?

3. **Error Handling**
   - ¿Errores de API se muestran legiblemente?
   - ¿Errores 5xx vs 4xx tratados distinto?

4. **Regla 41 (CRÍTICA)**
   - ¿Frontend SOLO consume API?
   - ¿NO hay lógica de negocio en frontend?
   - ¿Los cambios de estado se envían al backend?

---

## ✅ CHECKLIST IMPLEMENTACIÓN

- [ ] HttpInterceptor para Authorization
- [ ] API base en environment
- [ ] Error handling 4xx vs 5xx
- [ ] 401 redirige a login
- [ ] Regla 41: SIN lógica de negocio
- [ ] Tests de integración

---

## 🧪 VERIFICACIÓN

```bash
cd apps/web && pnpm run test -- --include=api

# Verificar interceptor
grep -r "HttpInterceptor\|Authorization\|Bearer" src/

# Esperado: Interceptor presente

# Verificar URLs
grep -r "environment\|API_BASE" src/

# Esperado: URLs en environment

# Verificar Regla 41
grep -r "this\.calculate\|this\.validate" src/app/ | grep -v "service\|api" | grep -v ".spec.ts"

# Esperado: 0 lógica en componentes (solo en servicios que consumen API)
```

---

## 📝 FORMATO ENTREGA

A) **ANÁLISIS** | B) **PLAN (3-4 pasos)** | C) **IMPLEMENTACIÓN** | D) **VERIFICACIÓN** | E) **PENDIENTES (máx 5)**

---

##  VIOLACIONES ENCONTRADAS (Research 2026-01-02)

### Type Safety - `: any` en Services

| Archivo | Linea | Codigo |
|---------|-------|--------|
| `api.service.ts` | 33 | `delay: (error: any) =>` |
| `api.service.ts` | 129 | `private handleError(error: any)` |
| `auth.service.ts` | 306 | `private handleError(error: any)` |

### Fix: Usar `HttpErrorResponse` de Angular en lugar de any
