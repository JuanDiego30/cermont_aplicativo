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

---

##  VIOLACIONES ENCONTRADAS (Research 2026-01-02)

### Memory Leaks (Regla 41) - 50+ suscripciones sin takeUntil

| Componente | Lineas | Problema |
|------------|--------|----------|
| `app-sidebar.component.ts` | 157, 166, 216, 252 | 4 subscribe() sin cleanup |
| `signin-form.component.ts` | 52 | subscribe sin takeUntil |
| `admin-users.component.ts` | 75, 102, 121, 142 | 4 subscribe() sin cleanup |
| `dashboard.component.ts` | 63 | subscribe sin takeUntil |
| `user-form.component.ts` | 59, 68, 137, 148 | 4 subscribe() sin cleanup |
| `orden-detail.component.ts` | 76, 89, 131, 163, 190 | 5 subscribe() sin cleanup |

### Fix Requerido

`typescript
// Agregar a CADA componente:
private destroy$ = new Subject<void>();

ngOnDestroy(): void {
  this.destroy$.next();
  this.destroy$.complete();
}

// Cambiar TODAS las suscripciones a:
.pipe(takeUntil(this.destroy$))
.subscribe({...});
`
