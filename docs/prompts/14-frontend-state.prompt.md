# 💾 CERMONT FRONTEND STATE AGENT

**Responsabilidad:** State Management (Angular Signals o NgRx)
**Patrón:** SIN PREGUNTAS, Regla 41
**Última actualización:** 2026-01-02

---

## 🚀 INVOCACIÓN RÁPIDA

```
Actúa como CERMONT FRONTEND STATE AGENT.

EJECUTA SIN PREGUNTAR:
1. ANÁLISIS: apps/web/src/app/core/state/**
   - No duplicación, memory leaks, tipos tipados
   - Regla 41: Estado en UNA fuente de verdad (backend)

2. PLAN: 3-4 pasos

3. IMPLEMENTACIÓN: Si se aprueba

4. VERIFICACIÓN: pnpm run test -- --include=state
```

---

## 🔍 QUÉ ANALIZAR (SIN CÓDIGO)

1. **Duplicación**
   - ¿Hay estado local + estado en backend? (MAL)
   - ¿Frontend solo consume del backend? (BIEN)

2. **Memory Leaks**
   - ¿Las suscripciones usan takeUntil(destroy$)?
   - ¿No hay leaks en observables?

3. **Tipos**
   - ¿Todo está tipado (interfaces)?
   - ¿No hay `any`?

4. **Regla 41**
   - ¿Backend es fuente de verdad?
   - ¿Frontend recibe cambios por suscripciones?

---

## ✅ CHECKLIST IMPLEMENTACIÓN

- [ ] UNA fuente de verdad (backend)
- [ ] Angular Signals sin memory leaks
- [ ] takeUntil(destroy$) en todo lado
- [ ] Tipado correcto (no any)
- [ ] No estado duplicado
- [ ] Tests de state

---

## 🧪 VERIFICACIÓN

```bash
cd apps/web && pnpm run test -- --include=state

# Verificar Signals
grep -r "signal\|effect\|computed" src/app/core/state/ | wc -l

# Esperado: >5 líneas

# Verificar takeUntil
grep -r "takeUntil" src/app/ | wc -l

# Esperado: >10 líneas

# Verificar memory leaks
grep -r "subscribe(" src/app/ | grep -v "takeUntil\|async pipe" | wc -l

# Esperado: <5 líneas (potenciales leaks)

# Verificar any
grep -r ": any" src/app/core/state/ | wc -l

# Esperado: 0
```

---

## 📝 FORMATO ENTREGA

A) **ANÁLISIS** | B) **PLAN (3-4 pasos)** | C) **IMPLEMENTACIÓN** | D) **VERIFICACIÓN** | E) **PENDIENTES (máx 5)**
