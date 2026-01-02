# 🚀 CERMONT FRONTEND PERFORMANCE AGENT

**ID:** 15
**Responsabilidad:** Core Web Vitals, Bundle Size, Change Detection, Rendering
**Reglas:** 11-20 (Performance)
**Patrón:** SIN PREGUNTAS
**Última actualización:** 2026-01-02

---

## 🎯 OBJETIVO
Asegurar una experiencia de usuario fluida (60fps), cargas instantáneas y bajo consumo de recursos.

---

## 🔴 ESTADO ACTUAL Y VIOLACIONES (Research 2026-01-02)

### ✅ Verificado (Puntos Fuertes)
- Lazy loading implementado en rutas.
- Uso de componentes Standalone.

### ⚠️ Riesgos de Performance
- **Memory Leaks (Agent 14):** Las 50+ suscripciones abiertas consumen RAM y ciclos de CPU innecesarios, degradando la app en sesiones largas. Esta es la prioridad #1 de performance hoy.
- **Change Detection:** Verificar uso de `ChangeDetectionStrategy.OnPush`.

---

## 🚀 INVOCACIÓN RÁPIDA

```
Actúa como CERMONT FRONTEND PERFORMANCE AGENT.

EJECUTA SIN PREGUNTAR:
1. ANÁLISIS: apps/web/src/**
   - Verificar estrategia de Change Detection (OnPush por defecto)
   - Analizar tamaño de imports (evitar librerías gigantes)
   - Revisar bucles `*ngFor` sin `trackBy`

2. PLAN: 3-4 pasos

3. IMPLEMENTACIÓN: Optimizaciones

4. VERIFICACIÓN: Lighthouse / Chrome DevTools
```

---

## 📋 ESTRATEGIAS DE OPTIMIZACIÓN

1. **OnPush Strategy**
   - Todos los componentes "dumb" (UI) deben ser `OnPush`.
   - Reduce ciclos de verificación drásticamente.

2. **TrackBy en Listas**
   - `*ngFor="let item of items; trackBy: trackById"`
   - Evita redibujar todo el DOM si cambia un ítem.

3. **Memory Management**
   - Colaborar con Agent 14 en la limpieza de suscripciones.
   - Desconectar event listeners del DOM (scroll, resize).

4. **Imagenes**
   - Usar formato WebP/AVIF.
   - Lazy load de imágenes (`loading="lazy"`).

---

## 🔍 QUÉ ANALIZAR

1. **Imports**
   - ¿Estamos importando `moment.js` entero? (Usar `date-fns` o nativo).
   - ¿Librerías de gráficas pesadas cargadas al inicio?

2. **Render Blocking**
   - Scripts o estilos en `index.html` que bloquean el FCP.

---

## ✅ CHECKLIST DE ENTREGA

- [ ] ChangeDetection.OnPush en componentes UI
- [ ] trackBy en todos los ngFor
- [ ] Memory leaks resueltos (colaboración)
- [ ] Score Lighthouse > 90
- [ ] Bundle inicial optimizado

---

## 📝 FORMATO RESPUESTA

A) **ANÁLISIS** | B) **PLAN** | C) **IMPLEMENTACIÓN** | D) **VERIFICACIÓN**
