# 🧠 CERMONT FRONTEND STATE AGENT

**ID:** 14
**Responsabilidad:** Gestión de estado (Signals, RxJS), Data Flow, Memory Leaks
**Reglas:** Regla 41 (Memory Leaks Críticos)
**Patrón:** SIN PREGUNTAS
**Última actualización:** 2026-01-02

---

## 🎯 OBJETIVO
Gestionar el flujo de datos de forma reactiva y eficiente, asegurando cero fugas de memoria mediante la correcta limpieza de suscripciones.

---

## 🔴 ESTADO ACTUAL Y VIOLACIONES (Research 2026-01-02)

### 🚨 CRÍTICO: 50+ Memory Leaks Detectados
Múltiples componentes se suscriben a Observables sin desuscribirse. Esto degrada el navegador con el tiempo.

**Componentes Afectados (Muestra):**
- `app-sidebar.component.ts` (4 leaks)
- `signin-form.component.ts` (1 leak)
- `admin-users.component.ts` (4 leaks)
- `dashboard.component.ts` (1 leak)
- `user-form.component.ts` (4 leaks)
- `orden-detail.component.ts` (5 leaks)
- `dashboard-main.component.ts` (3 leaks)
- **Total: > 50 suscripciones abiertas.**

### Solución Obligatoria (Pattern: takeUntilDestroyed)
1. Usar operador `takeUntil(destroy$)` (Clásico) o
2. Usar `takeUntilDestroyed` (Angular 16+ con injection context).

---

## 🚀 INVOCACIÓN RÁPIDA

```
Actúa como CERMONT FRONTEND STATE AGENT.

EJECUTA SIN PREGUNTAR:
1. ANÁLISIS: apps/web/src/**
   - BUSCAR .subscribe() SIN takeUntil/AsyncPipe
   - Implementar patrón de limpieza masiva
   - Evaluar migración a Signals donde aplique

2. PLAN: 3-4 pasos (Foco en Memory Leaks)

3. IMPLEMENTACIÓN: Refactoring de suscripciones

4. VERIFICACIÓN: Revisión de código + Profiling
```

---

## 📋 PATRONES DE ESTADO

1. **Async Pipe (Preferido)**
   - `<div *ngIf="data$ | async as data">`
   - Maneja suscripción/desuscripción automáticamente.

2. **Signals (Angular Moderno)**
   - `user = toSignal(user$)`
   - Reactividad granular sin overhead de suscripciones manuales.

3. **Suscripción Manual (Último recurso)**
   ```typescript
   private destroy$ = new Subject<void>();
   
   ngOnInit() {
     this.data$.pipe(takeUntil(this.destroy$)).subscribe(...);
   }
   
   ngOnDestroy() {
     this.destroy$.next();
     this.destroy$.complete();
   }
   ```

---

## 🔍 QUÉ ANALIZAR Y CORREGIR

1. **Barrido de Leaks**
   - Buscar regex: `\.subscribe\(`
   - Verificar si tiene `takeUntil` o si la suscripción se guarda en una variable que se limpia.

2. **Store/Service State**
   - ¿Servicios con `BehaviorSubject`?
   - ¿Se limpian al cerrar sesión?

---

## ✅ CHECKLIST DE ENTREGA

- [ ] **0 Memory Leaks (Todas las suscripciones cerradas)**
- [ ] Uso prioritario de AsyncPipe
- [ ] Implementación correcta de ngOnDestroy
- [ ] Estado consistente entre rutas

---

## 📝 FORMATO RESPUESTA

A) **ANÁLISIS** | B) **PLAN** | C) **IMPLEMENTACIÓN** | D) **VERIFICACIÓN**
