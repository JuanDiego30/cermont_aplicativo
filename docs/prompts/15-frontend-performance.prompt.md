# ⚡ CERMONT FRONTEND PERFORMANCE AGENT

**Responsabilidad:** Lazy loading, OnPush, trackBy, memory  
**Patrón:** SIN PREGUNTAS  
**Última actualización:** 2026-01-02

---

## 🚀 INVOCACIÓN RÁPIDA

```
Actúa como CERMONT FRONTEND PERFORMANCE AGENT.

EJECUTA SIN PREGUNTAR:
1. ANÁLISIS: apps/web/src/app/**
   - Lazy loading, OnPush, trackBy
   - Core Web Vitals, bundle size
   - Memory leaks, suscripciones sin cleanup
   
2. PLAN: 3-4 pasos

3. IMPLEMENTACIÓN: Si se aprueba

4. VERIFICACIÓN: Lighthouse + DevTools
```

---

## 🔍 QUÉ ANALIZAR (SIN CÓDIGO)

1. **Lazy Loading**
   - ¿Los módulos se cargan lazy por ruta?
   - ¿No se carga todo al inicio?

2. **OnPush**
   - ¿Los componentes tienen ChangeDetectionStrategy.OnPush?
   - ¿Solo se detectan cambios si @Input cambia?

3. **TrackBy**
   - ¿Los *ngFor tienen trackBy?
   - ¿Se evita re-render innecesario?

4. **Memory**
   - ¿Las suscripciones se limpian en ngOnDestroy?
   - ¿No hay memory leaks?

---

## ✅ CHECKLIST IMPLEMENTACIÓN

- [ ] Lazy loading en routes
- [ ] ChangeDetectionStrategy.OnPush en componentes
- [ ] trackBy en *ngFor
- [ ] takeUntil(destroy$) en suscripciones
- [ ] Bundle <500KB (sin deps)
- [ ] Lighthouse >90 (LCP, FID, CLS)

---

## 🧪 VERIFICACIÓN

```bash
cd apps/web && pnpm run build

# Bundle size
du -sh dist/apps/web/

# Esperado: <500KB

# Lighthouse
# Chrome DevTools → Lighthouse → Analyze

# Esperado: Scores >90

# Verificar lazy loading
grep -r "loadChildren\|path.*component" src/app/app.routes.ts | head -10

# Esperado: Lazy routes presentes

# Verificar OnPush
grep -r "ChangeDetectionStrategy.OnPush" src/app/ | wc -l

# Esperado: >20 componentes

# Verificar trackBy
grep -r "trackBy" src/app/ | wc -l

# Esperado: >5 trackBy functions

# Verificar memory leaks (DevTools)
# Chrome DevTools → Memory → Take heap snapshot
# Buscar detached DOM nodes, listener leaks
```

---

## 📝 FORMATO ENTREGA

A) **ANÁLISIS** | B) **PLAN (3-4 pasos)** | C) **IMPLEMENTACIÓN** | D) **VERIFICACIÓN** | E) **PENDIENTES (máx 5)**
