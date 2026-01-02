# 🎨 CERMONT FRONTEND SHARED COMPONENTS AGENT

**Responsabilidad:** Button, Input, Card, Loader componentes reutilizables
**Patrón:** SIN PREGUNTAS
**Última actualización:** 2026-01-02

---

## 🚀 INVOCACIÓN RÁPIDA

```
Actúa como CERMONT FRONTEND SHARED COMPONENTS AGENT.

EJECUTA SIN PREGUNTAR:
1. ANÁLISIS: apps/web/src/app/shared/components/
   - ¿Existen componentes base?
   - ¿Button component existe?
   - ¿Input component existe?
   - ¿Consistent styling?

2. PLAN: 3-4 pasos

3. IMPLEMENTACIÓN: Si se aprueba

4. VERIFICACIÓN: Componentes en uso en LoginComponent
```

---

## 🔍 QUÉ ANALIZAR (SIN CÓDIGO)

1. **Button Component**
   - ¿Existe apps/web/src/app/shared/components/button/?
   - ¿Soporta variantes (primary, secondary, danger)?
   - ¿Soporta loading state?
   - ¿ARIA accessible?

2. **Input Component**
   - ¿ControlValueAccessor implementado?
   - ¿Muestra errores?
   - ¿Validación visual?

3. **Styling**
   - ¿Usa CSS variables de design system?
   - ¿Dark mode soportado?
   - ¿Responsive (mobile, tablet, desktop)?

4. **Usage**
   - ¿LoginComponent usa <app-button>?
   - ¿LoginComponent usa <app-form-input>?
   - ¿Sin duplicación de código?

---

## ✅ CHECKLIST IMPLEMENTACIÓN

- [ ] Button component creado (primary, secondary, danger)
- [ ] Input component creado (ControlValueAccessor)
- [ ] Card component creado
- [ ] Loader component creado
- [ ] Todos accesibles (ARIA)
- [ ] Responsive design
- [ ] Dark mode support
- [ ] LoginComponent usa shared components
- [ ] 0 duplicación de estilos
- [ ] Lighthouse >90 (Accessibility)

---

## 🧪 VERIFICACIÓN

```bash
cd apps/web && pnpm run build

# Componentes presentes
ls -la src/app/shared/components/

# Esperado:
# button/
# form-input/
# card/
# loader/

# LoginComponent usa componentes
grep -r "<app-button\|<app-form-input" src/app/features/auth/

# Esperado: >3 líneas

# Lighthouse Accessibility
# Chrome DevTools → Lighthouse → Accessibility
# Esperado: >90

# No duplicación de estilos
find src/app/features -name "*.css" -exec grep -l "btn-\|form-\|card" {} \;

# Esperado: 0 líneas (estilos en shared/styles)
```

---

## 📝 FORMATO ENTREGA

A) **ANÁLISIS** | B) **PLAN (3-4 pasos)** | C) **IMPLEMENTACIÓN** | D) **VERIFICACIÓN** | E) **PENDIENTES (máx 5)**
