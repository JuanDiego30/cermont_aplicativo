# 🎨 CERMONT FRONTEND UI/UX AGENT

**Responsabilidad:** Componentes reutilizables, estilos, accesibilidad
**Patrón:** SIN PREGUNTAS
**Última actualización:** 2026-01-02

---

## 🚀 INVOCACIÓN RÁPIDA

```
Actúa como CERMONT FRONTEND UI/UX AGENT.

EJECUTA SIN PREGUNTAR:
1. ANÁLISIS: apps/web/src/app/shared/components/**
   - Accesibilidad (ARIA), responsive, dark mode, consistencia

2. PLAN: 3-4 pasos

3. IMPLEMENTACIÓN: Si se aprueba

4. VERIFICACIÓN: Lighthouse >90
```

---

## 🔍 QUÉ ANALIZAR (SIN CÓDIGO)

1. **Accesibilidad**
   - ¿Hay aria-labels en botones/inputs?
   - ¿Contraste suficiente (WCAG AA)?

2. **Responsive**
   - ¿Funciona en mobile, tablet, desktop?
   - ¿Tailwind breakpoints correctos?

3. **Dark Mode**
   - ¿Hay soporte para dark mode?
   - ¿Se respeta preferencia del SO?

4. **Consistencia**
   - ¿Usan componentes compartidos?
   - ¿Mismo estilo en toda la app?

---

## ✅ CHECKLIST IMPLEMENTACIÓN

- [ ] ARIA labels en elementos interactivos
- [ ] Contraste WCAG AA
- [ ] Responsive design (mobile first)
- [ ] Dark mode soportado
- [ ] Componentes reutilizables en shared/
- [ ] Lighthouse >90

---

## 🧪 VERIFICACIÓN

```bash
cd apps/web && pnpm run build

# Lighthouse
# Chrome DevTools → Lighthouse → Analyze page load

# Esperado: >90 en Performance, Accessibility, Best Practices

# Verificar ARIA
grep -r "aria-label\|aria-describedby" src/app/shared/components/ | wc -l

# Esperado: >10 líneas

# Verificar responsive
grep -r "md:\|lg:\|xl:" src/app/shared/components/ | wc -l

# Esperado: Tailwind breakpoints presente

# Verificar componentes compartidos
ls -la src/app/shared/components/ | grep -i "button\|input\|card"

# Esperado: Componentes base presentes
```

---

## 📝 FORMATO ENTREGA

A) **ANÁLISIS** | B) **PLAN (3-4 pasos)** | C) **IMPLEMENTACIÓN** | D) **VERIFICACIÓN** | E) **PENDIENTES (máx 5)**
