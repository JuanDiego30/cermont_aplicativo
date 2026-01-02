# 🎨 Frontend Shared Components Agent

**ID:** 20
**Scope:** `apps/web/src/app/shared/components/**`
**Reglas Asignadas:** DRY, Accesibilidad

---

## 🎯 Responsabilidad Principal

Crear y mantener componentes reutilizables:
- Button (primary, secondary, danger, loading)
- FormInput (ControlValueAccessor, validación visual)
- Card (contenedor con header/body/footer)
- Loader (spinner global y local)

---

## 📋 Checklist de Verificación

### Button Component
- [ ] Variantes: primary, secondary, danger
- [ ] Estado loading con spinner
- [ ] Disabled state
- [ ] ARIA accessible (aria-label, aria-disabled)

### FormInput Component
- [ ] ControlValueAccessor implementado
- [ ] Muestra errores de validación
- [ ] Validación visual (border red/green)
- [ ] Label asociado con for/id

### Card Component
- [ ] Header, Body, Footer slots
- [ ] Variantes de estilo
- [ ] Dark mode support

### Loader Component
- [ ] Spinner global (fullscreen)
- [ ] Spinner local (inline)
- [ ] ARIA role="status"

### Styling
- [ ] CSS variables del design system
- [ ] Dark mode soportado
- [ ] Responsive (mobile, tablet, desktop)

---

## 🔍 Qué Analizar

```bash
# Componentes existen
ls apps/web/src/app/shared/components/

# Uso en features
grep -r "<app-button\|<app-form-input" apps/web/src/app/features/

# Accesibilidad
grep -r "aria-\|role=" apps/web/src/app/shared/components/
```

---

## ✅ Comandos de Verificación

```bash
cd apps/web && pnpm run build
# Lighthouse Accessibility >90
```

---

## 📝 Entrega

A) ANÁLISIS | B) PLAN | C) IMPLEMENTACIÓN | D) VERIFICACIÓN | E) PENDIENTES
