# ADR-012: Alineación Visual con DESIGN.md

**Estado:** Aceptado
**Fecha:** 2026-06-29
**Driver:** Especificación Spec-011 — Profesionalización controlada

---

## Contexto

El frontend Cermont utiliza CSS vars (`--color-brand-blue: #2154A6`, `--color-brand-green: #4CAF50`) definidas vía CSS custom properties en la hoja de estilos global. El `DESIGN.md` oficial (en `docs/design/CERMONT_UIUX_GUIDE.md`) define el sistema de diseño SSOT. Existe desviación entre tokens definidos en DESIGN.md, tokens usados en el código, y valores hardcodeados.

### Fuentes

| Fuente | Ruta | Rol |
|--------|------|-----|
| DESIGN.md SSOT | `docs/design/CERMONT_UIUX_GUIDE.md` | Sistema de diseño canónico |
| CSS Variables | `frontend/src/app/globals.css` y archivos `.css` | Implementación de tokens |
| Tailwind Config | `frontend/tailwind.config.ts` o `frontend/tailwind.config.js` | Framework config |
| Componentes | `frontend/src/**/*.tsx` | Consumidores de tokens |
| Componentes comunes | `frontend/src/components/common/*.tsx` | Biblioteca de componentes |

---

## Inventario de Tokens CSS Existentes

Los siguientes tokens están definidos en el código (CSS o Tailwind):

### Palette primaria
| Token | Valor | Uso |
|-------|-------|-----|
| `--color-brand-blue` | `#2154A6` | Primary CTA, active nav |
| `--color-brand-blue-hover` | `#1a4385` | Hover de botones primarios |
| `--color-brand-green` | `#4CAF50` | Focus rings, success |
| `--color-brand-green-hover` | `#388E3C` | Hover de éxito |
| `--color-danger` | `#DC2626` | Errores, crítico |
| `--color-danger-hover` | `#B91C1C` | Hover de error |
| `--color-warning` | `#F59E0B` | Advertencias |
| `--color-warning-hover` | `#D97706` | Hover de advertencia |

### Superficies
| Token | Valor | Uso |
|-------|-------|-----|
| `--surface-primary` | `#FFFFFF` | Fondo principal |
| `--surface-secondary` | `#F8FAFC` | Fondo secundario |
| `--surface-tertiary` | `#F1F5F9` | Fondo terciario |
| `--surface-brand` | `#2154A6` | Superficies de marca |

### Texto
| Token | Valor | Uso |
|-------|-------|-----|
| `--text-primary` | `#0F172A` | Texto principal |
| `--text-secondary` | `#475569` | Texto secundario |
| `--text-tertiary` | `#94A3B8` | Texto terciario/placeholder |
| `--text-muted` | `#64748B` | Texto deshabilitado |
| `--text-on-brand` | `#FFFFFF` | Texto sobre fondo de marca |

### Bordes
| Token | Valor | Uso |
|-------|-------|-----|
| `--border-subtle` | `#E2E8F0` | Borde sutil |
| `--border-default` | `#CBD5E1` | Borde por defecto |
| `--border-strong` | `#94A3B8` | Borde fuerte |

### Sombras
| Token | Valor |
|-------|-------|
| `--shadow-1` | `0 1px 2px rgba(0,0,0,0.05)` |
| `--shadow-2` | `0 1px 3px rgba(0,0,0,0.1), 0 1px 2px rgba(0,0,0,0.06)` |
| `--shadow-3` | `0 4px 6px rgba(0,0,0,0.07), 0 2px 4px rgba(0,0,0,0.06)` |
| `--shadow-brand` | `0 4px 14px rgba(33,84,166,0.3)` |

### Radios
| Token | Valor |
|-------|-------|
| `--radius-sm` | `6px` |
| `--radius-md` | `8px` |
| `--radius-lg` | `12px` |
| `--radius-xl` | `16px` |
| `--radius-full` | `9999px` |

---

## Modos de Uso Detectados

### Modo 1: CSS vars (RECOMENDADO ✅)
```tsx
className="bg-[var(--surface-primary)] text-[var(--text-primary)]"
```
**Dónde:** Archivos recientes en `modules/*/ui/` y componentes refactorizados.

### Modo 2: Tailwind con colores semánticos
```tsx
className="bg-blue-600 text-white"
```
**Riesgo:** No usa los tokens de marca Cermont (#2154A6). `bg-blue-600` es un azul Tailwind diferente.

### Modo 3: Hardcodeado directo ⚠️
```tsx
style={{ backgroundColor: '#2154A6' }}
className="bg-[#2154A6]"
```
**Riesgo:** Dificulta cambio global de tema/marca.

### Modo 4: Colores literales no tokenizados ⚠️
```tsx
className="text-green-600 bg-gray-50 border-gray-200"
```
**Riesgo:** Sin relación con el sistema de diseño.

---

## Decisiones

### Decisión 1: SSOT del sistema de diseño
**`docs/design/CERMONT_UIUX_GUIDE.md`** es la única fuente de verdad para el sistema de diseño visual.

### Decisión 2: Tokens CSS sobre Tailwind directo
**Usar CSS vars (`var(--color-brand-blue)`) como mecanismo preferido.** Tailwind puede consumir estos tokens vía `tailwind.config.ts` con `theme.extend.colors`.

### Decisión 3: Prohibición de valores hardcodeados
**No introducir nuevos colores, radios, sombras, espaciados o tipografías hardcodeadas.** Extraer a token o usar token existente.

### Decisión 4: Componentes comunes sobre estilos ad-hoc
**Usar `components/common/` (Button, Card, Dialog, FormField, Table, Badge) antes que estilos personalizados.** No duplicar estilos de componente.

---

## Priorización para Wave 5

| Prioridad | Categoría | Acción |
|-----------|-----------|--------|
| P0 | Valores hardcodeados en componentes nuevos | Bloquear en code review |
| P1 | Colores Tailwind directos (no tokenizados) | Migrar a CSS vars |
| P2 | Componentes sin usar design tokens | Refactorizar usando `components/common/` |
| P3 | Tokens faltantes en DESIGN.md vs código | Sincronizar documentación |
| P4 | Temas oscuro/accesibilidad | Postergado a Wave 6 |

---

## Afectados

| Componente | Acción | Prioridad |
|------------|--------|-----------|
| `frontend/tailwind.config.ts` | Agregar mapping de tokens CSS si no existe | P1 |
| Componentes en `modules/*/ui/` | Migrar a CSS vars | P2 |
| Componentes comunes | Verificar tokens correctos | P1 |
| `docs/design/CERMONT_UIUX_GUIDE.md` | Actualizar con tokens reales | P3 |

---

## Consecuencias

Positivas:
- Cohesión visual del sistema
- Cambios de marca/modo oscuro posibles con solo modificar CSS vars
- Reducción de código CSS duplicado

Negativas:
- Migración gradual necesaria para código legacy
- Curva de aprendizaje para contributors nuevos
