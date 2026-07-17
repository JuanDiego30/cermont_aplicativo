# CERMONT UI/UX PREMIUM FRONTEND MASTERPLAN v1.0

> **Plan Maestro de Transformación UI/UX — CERMONT S.A.S.**
> Versión: 1.0  
> Fecha: 2026-07-09  
> Estado: CANONICAL — Guía de implementación para modelo programador  
> Archivo: `.sisyphus/plans/cermont-ui-ux-premium-frontend-masterplan-v1.md`  
> Destino: Frontend Next.js 16 App Router + Tailwind CSS 4 + Radix UI + Lucide React  
> Baseline: DESIGN.md v4.0 (canonical), globals.css (tokens existentes)

---

## Índice de contenido

1. Portada técnica
2. Resumen ejecutivo
3. Diagnóstico visual actual
4. Problemas principales detectados
5. Principios de diseño CERMONT
6. Tokens de color
7. Tokens de superficie/elevación
8. Tokens de tipografía
9. Tokens de espaciado
10. Tokens de radius
11. Tokens de sombras
12. Tokens de iconografía
13. Arquitectura de componentes
14. Reglas de iconos monocromáticos
15. Reglas de colores semánticos
16. Modo oscuro premium
17. Modo claro profesional
18. Estrategia mobile-first
19. Estrategia desktop enterprise
20. Rediseño Cockpit 14 pasos
21. Rediseño Dashboard
22. Rediseño Planning
23. Rediseño Forms/Checklists
24. Rediseño Evidences
25. Rediseño Reports
26. Rediseño Delivery Records
27. Rediseño Billing/SES/Invoices/Payments
28. Rediseño Fleet/Assets/Maintenance
29. Rediseño Portal Cliente
30. Rediseño Admin/RBAC/Audit
31. Command Bar global
32. Contextual Action Sheet
33. Skeleton Screens
34. Bottom Navigation mobile
35. Floating Action Button
36. StatusBadge / CategoryBadge
37. SegmentControl C/NC/NA
38. KpiCard
39. ProgressRing
40. CockpitTimeline
41. Stepper compacto
42. Tables premium
43. Empty/Error/Loading states
44. Accesibilidad
45. Animaciones y microinteracciones
46. Performance frontend
47. Testing strategy
48. Migration strategy
49. Sprint plan
50. Acceptance criteria
51. Evidence strategy
52. Riesgos
53. Roadmap UI/UX
54. Checklist final
55. Matrices obligatorias

---

## 1. Portada técnica

```txt
Sistema:            CERMONT S.A.S. — Plataforma Operativa Document-Driven
Stack frontend:     Next.js 16.2.1 + React 19.2.4 + TypeScript 5.9.3 (strict)
Estilos:            Tailwind CSS 4.2.2 + CSS Custom Properties
Iconos:             Lucide React 1.7.0
Componentes base:   Radix UI + componentes comunes en frontend/src/components/common/
Estado servidor:    TanStack Query 5.95.2
Estado cliente:     Zustand 5.0.12
Validación:         Zod 4.3.6 + react-hook-form 7.72.0
Testing:            Vitest 4.0.18 + Playwright 1.58.2
Linting:            Biome 2.4.11
Animación:          Framer Motion 12.38.0
Gráficos:           Recharts 3.8.1
Guía de diseño:     DESIGN.md v4.0 (canonical) — dark-first con acento CERMONT Blue
Sistema de diseño:  globals.css con tokens CSS — ~883 líneas de tokens
Auditoría previa:   .sisyphus/evidence/planning-ui-ux-premium/ui-ux-audit-summary.md
```

### Fuentes no encontradas o pendientes de confirmar

| Archivo solicitado | Estado |
|---|---|
| `.sisyphus/plans/cermont-contract-first-implementation-masterplan-v6.1.md` | ✅ Existe en `.omo/plans/` |
| `.sisyphus/plans/cermont-contract-first-implementation-masterplan-v6.md` | ✅ Existe en `.omo/plans/` |
| `.sisyphus/plans/cermont_documento_metodologia_modular_contract_first.md` | ✅ Existe |
| `.sisyphus/plans/CERMONT_CODIGO.json` | ✅ Existe en `.omo/plans/` |
| `.sisyphus/plans/cermont-functional-implementation-masterplan-v5.1.md` | ✅ Existe en `.omo/plans/` |
| `.sisyphus/plans/cermont-functional-implementation-masterplan-v5.md` | ✅ Existe en `.omo/plans/` |
| `.sisyphus/plans/cermont-functional-refactor-masterplan-v4.md` | ✅ Existe en `.omo/plans/` |
| `.sisyphus/plans/cermont-product-implementation-masterplan.v3.md` | ✅ Existe en `.omo/plans/` |
| `.sisyphus/plans/REGLAS_DESARROLLO_CERMONT.md` | ✅ Existe en `.omo/plans/` y `docs/` |
| `.sisyphus/evidence/implementation-ui-01/` | Parcial — Existe en `.omo/evidence/` |
| `.sisyphus/evidence/implementation-ui-02/` | Parcial — Existe en `.omo/evidence/` |
| `.sisyphus/evidence/implementation-ui-03/` | ❌ No existe |
| `frontend/tests` | ✅ Existe |
| `.sisyphus/plans/LTG_JUAN_DIEGO_AREVALO-3_markdown.md` | ✅ Existe en `.omo/plans/` |
| `01_main10.md` a `10_Formato_Mantenimiento_CCTV3.md` | ✅ Existen en `.omo/plans/` y `.sisyphus/plans/` |

---

## 2. Resumen ejecutivo

CERMONT ha evolucionado de una plataforma funcional a un producto operativo maduro con ~80+ páginas frontend, 40+ módulos backend, y un sistema de tokens CSS existente (~883 líneas en globals.css). Sin embargo, la auditoría visual revela una **brecha significativa entre el design system documentado (DESIGN.md v4.0) y la UI real**.

**Estado actual:** La UI es funcional pero genérica. Hay 55+ archivos con colores hardcoded (emerald, green, red, yellow, purple directos), 6 variantes de StatusBadge duplicadas por módulo, iconos multicolor sin `currentColor` consistente, tarjetas sin elevación premium, y un FAB sin control que interfiere con la navegación inferior.

**Estado deseado:** UI premium, enterprise, industrial, dark-first, mobile-first, con iconografía monocromática, tokens semánticos centralizados, pipeline compacto de 14 pasos, Command Bar global, Action Sheet contextual, skeleton screens, y componentes premium reutilizables.

**Esfuerzo estimado:** ~15 sprints (UIX-00 a UIX-14) con implementación sistemática por capas: tokens → iconos → componentes → cockpits → dashboards → módulos → comandos → hardening.

---

## 3. Diagnóstico visual actual

### 3.1 Lo que funciona bien

- ✅ Modo oscuro implementado como default
- ✅ Sistema de tokens CSS en globals.css (883 líneas)
- ✅ Skeleton componente en `core/ui/Skeleton.tsx` con variantes (text, card, kpi-card, chart, table-row, list-item)
- ✅ StatusBadge en `core/ui/StatusBadge.tsx` (base compartida)
- ✅ SegmentControl en `components/common/SegmentControl.tsx` con ConformityControl wrapper
- ✅ KpiCard en `components/common/KpiCard.tsx`
- ✅ MobileBottomNav en `modules/core/ui/layout/MobileBottomNav.tsx`
- ✅ Layout adaptativo mobile/desktop en `DefaultLayout.tsx`
- ✅ Uso extensivo de breakpoints responsive (sm, md, lg, xl)

### 3.2 Problemas principales

| # | Problema | Evidencia | Severidad |
|---|---|---|---|
| 1 | Colores hardcoded violan design system | 55+ archivos con `bg-emerald-*`, `text-green-*`, `bg-red-*`, `bg-purple-*` | 🔴 Crítica |
| 2 | Iconografía inconsistente | Mezcla de multicolor/unicolor, strokeWidth no estandarizado | 🟡 Alta |
| 3 | 6 variantes de StatusBadge sin unificar | EvidenceStatusBadge, InvoiceStatusBadge, ReportStatusBadge, ProposalStatusBadge, ExecutionStatusBadge, StatusBadge global | 🟡 Alta |
| 4 | FAB sin control de posición | Interfiere con bottom nav en documentos y evidencias | 🟡 Alta |
| 5 | Cards sin elevación premium | Radio y bordes inconsistentes, sombras no estandarizadas | 🟡 Alta |
| 6 | Pipeline 14 pasos largo en mobile | Scroll excesivo, pasos no colapsables | 🟡 Alta |
| 7 | Fondo negro absoluto (#000) sin profundidad en dark mode | Varios componentes usan `bg-black` sin superficie escalonada | 🟡 Media |
| 8 | Badges como texto plano en mayúsculas | Varios componentes usan `uppercase text-xs font-bold` en lugar de badges reales | 🟡 Media |
| 9 | Sin CategoryBadge global | Categorías de checklist, evidencia y documentos sin badge unificado | 🟡 Media |
| 10 | Sin ProgressRing global | Cada módulo implementa su propio circular progress | 🟡 Media |
| 11 | Sin CommandBar global | No hay Ctrl+K/Cmd+K para navegación rápida | 🟡 Media |
| 12 | Sin ActionSheet contextual mobile | Las acciones contextuales en mobile no tienen sheet unificado | 🟡 Media |
| 13 | Tablas como vista principal en mobile | Orders, invoices, etc. renderizan tablas en mobile en lugar de cards | 🟡 Media |
| 14 | Color como único indicador de estado | Varios componentes no incluyen texto + icono + color | 🟡 Alta |
| 15 | Sin estándar de animación/microinteracción | Animaciones no centralizadas, sin respeto a prefers-reduced-motion consistente | 🟢 Baja |

---

## 4. Problemas principales detectados

### 4.1 Arquitectura visual

**Problema:** El sistema de tokens CSS existe pero no se aplica consistentemente. Los componentes usan colores Tailwind directos en lugar de las variables CSS definidas en globals.css.

**Causa raíz:** Migración incompleta de v3.0 (light-first) a v4.0 (dark-first). Archivos legacy mantienen estilos antiguos.

**Impacto:** La UI se ve genérica, inconsistente y no transmite la identidad CERMONT.

**Archivos críticos a refactorizar:**
- `frontend/src/modules/checklists/components/ChecklistPanel.tsx` — emerald hardcode extensivo
- `frontend/src/modules/checklists/components/CompletedChecklistBlock.tsx` — emerald hardcode
- `frontend/src/modules/checklists/components/SummaryCard.tsx` — emerald hardcode
- `frontend/src/modules/planning/ui/PlanningReadinessGate.tsx` — green/red hardcode
- `frontend/src/modules/orders/ui/detail/order-administrative-workflow.ts` — green hardcode
- `frontend/src/app/(dashboard)/orders/[id]/planning/page.tsx` — emerald hardcode extensivo
- `frontend/src/app/(dashboard)/orders/kanban/kanban-constants.ts` — yellow hardcode
- `frontend/src/app/(portal)/portal/invoices/page.tsx` — yellow/green hardcode
- `frontend/src/app/(dashboard)/dispatch/page.tsx` — emerald hardcode
- `frontend/src/modules/forms/ui/SectionedFormRenderer.tsx` — purple hardcode
- `frontend/src/app/(dashboard)/work-requests/[id]/page.tsx` — purple hardcode
- `frontend/src/components/common/SyncBanner.tsx` — red hardcode
- `frontend/src/components/common/NetworkStatusChip.tsx` — emerald hardcode

### 4.2 Duplicación de componentes

**Problema:** Existen 6 variantes de StatusBadge que deberían unificarse en un solo componente con variantes.

**Componentes duplicados:**
1. `frontend/src/core/ui/StatusBadge.tsx` — badge base
2. `frontend/src/modules/evidences/ui/EvidenceStatusBadge.tsx` — badge evidencias
3. `frontend/src/modules/invoices/ui/InvoiceStatusBadge.tsx` — badge facturas
4. `frontend/src/modules/reports/ui/ReportStatusBadge.tsx` — badge reportes
5. `frontend/src/modules/proposals/ui/ProposalStatusBadge.tsx` — badge propuestas
6. `frontend/src/modules/field-execution/ui/ExecutionStatusBadge.tsx` — badge ejecución

**Estrategia de unificación:** El badge base debe aceptar `status` + `category` opcional + `tone` + `icon` + `size`. Los badges de módulo deben ser wrappers del badge base con mapeo de estados específico.

### 4.3 Falta de componentes premium

**Componentes faltantes (NO existen en el codebase):**
- `CategoryBadge` — badge para categorías (checklist, evidencia, documento)
- `ProgressRing` — anillo de progreso circular animado
- `CockpitTimeline` — timeline premium de 14 pasos
- `CompactStepper` — stepper compacto para mobile
- `FloatingActionButton` — FAB controlado que no tape bottom nav
- `ActionSheet` — sheet contextual para acciones en mobile
- `CommandBar` — barra de comandos global (Ctrl+K)
- `PremiumCard` — card base premium con elevación, icono y estado
- `EmptyStateCard` — card de estado vacío premium
- `ErrorCard` — card de error premium

### 4.4 Pipeline 14 pasos

**Problema:** El componente `FourteenStepProgressBar.tsx` en `modules/cockpit/ui/` es funcional pero visualmente genérico. El `ServiceCaseWorkflowCockpit.tsx` en `modules/service-cases/components/` tiene TimelineSection inline que debería ser un componente reutilizable.

**Archivos del pipeline:**
- `frontend/src/modules/cockpit/ui/FourteenStepProgressBar.tsx`
- `frontend/src/modules/cockpit/model/cockpit.types.ts`
- `frontend/src/modules/cockpit/utils/cockpitTransformer.ts`
- `frontend/src/modules/service-cases/components/ServiceCaseWorkflowCockpit.tsx`
- `frontend/src/modules/service-cases/components/OperationalStepProgress.tsx`
- `frontend/src/modules/orders/ui/OrderTimeline.tsx`

---

## 5. Principios de diseño CERMONT

```txt
1. Dark-first con light mode profesional.
   - Modo oscuro es la interfaz por defecto.
   - Modo claro debe verse igual de premium, no como afterthought.

2. CERMONT Blue como acento principal.
   - #2154A6 (light) / #3A78D8 (dark) como brand primary.
   - #4CAF50 (light) / #4ADE80 (dark) como brand secondary (éxito).

3. Mobile-first real.
   - Diseñar primero para 375px.
   - Desktop es expansión, no reemplazo.
   - Touch targets ≥44px.

4. Iconografía unicolor estricta.
   - Todos los iconos heredan currentColor.
   - Prohibido emojis como iconos funcionales.
   - Prohibido multicolor.

5. Jerarquía visual fuerte.
   - Dashboard cuenta historia: pulso → KPIs → flujo → actividad → alertas.
   - Text primary, secondary, muted bien diferenciados.

6. Menos ruido, más profundidad.
   - Sin bordes pesados. Sin sombras exageradas.
   - Profundidad por luminancia, no por sombras.
   - Bordes semitransparentes (8% blanco en dark, 5% negro en light).

7. Tarjetas funcionales premium.
   - Icono + título + valor + estado + acción.
   - Radio 24px mobile / 16px desktop.
   - Fondo surface escalonado.

8. Pipeline 14 pasos siempre visible.
   - Cada caso muestra estado actual, avance, blockers y next action.

9. Accesibilidad no negociable.
   - Contraste AA, focus visible, labels semánticos.
   - Estado con texto + icono + color.

10. Sin UI genérica.
    - No cards planas sin icono.
    - No tablas como vista principal en mobile.
    - No botones cuadrados.
    - No grises sin jerarquía.
```

---

## 6. Tokens de color

### 6.1 Estado actual (globals.css)

El archivo `frontend/src/app/globals.css` ya define ~883 líneas de tokens. Sin embargo, muchos componentes no los usan y prefieren colores Tailwind directos.

### 6.2 Tokens a verificar/confirmar

```
--color-brand-green: #2154A6        → Nombre confuso (dice green pero es azul CERMONT)
--color-brand-annotate: #4CAF50     → Es el verde CERMONT
```

**⚠️ NOTA: El token `--color-brand-green` se llama "green" pero contiene el azul CERMONT #2154A6. Esto es legacy y debe renombrarse a `--color-brand-primary` o `--color-cermont-blue`. Durante la migración, mantener ambos alias.**

### 6.3 Tokens propuestos (compatibles con DESIGN.md v4.0)

```css
/* ── Brand ── */
--cermont-blue: #2154A6;          /* Brand primary light */
--cermont-blue-dark: #3A78D8;     /* Brand primary dark */
--cermont-blue-deep: #0F2C59;     /* Deep states */
--cermont-blue-light: #60A5FA;    /* Info tags */
--cermont-green: #4CAF50;         /* Brand secondary / success light */
--cermont-green-dark: #4ADE80;    /* Brand secondary / success dark */

/* ── Surface Dark (default) ── */
--bg-canvas: #121212;             /* Fondo página */
--bg-canvas-deep: #0A0A0A;        /* Sidebar, modal, drawer */
--bg-surface: #1A1A1A;            /* Cards, secciones */
--bg-surface-elevated: #242424;   /* Hover cards, dropdowns */
--bg-surface-highlight: #2E2E2E;  /* Selected, active */

/* ── Surface Light ── */
--bg-canvas-light: #F8FAFC;
--bg-canvas-deep-light: #FFFFFF;
--bg-surface-light: #FFFFFF;
--bg-surface-elevated-light: #F1F5F9;
--bg-surface-highlight-light: #E2E8F0;

/* ── Text ── */
--text-primary: #F5F5F5;          /* Dark */
--text-secondary: #A0A0A0;        /* Dark */
--text-muted: #606060;            /* Dark */
--text-primary-light: #0F172A;    /* Light */
--text-secondary-light: #475569;  /* Light */
--text-muted-light: #94A3B8;      /* Light */

/* ── Border ── */
--border-subtle: rgba(255,255,255,0.06);   /* Dark */
--border-default: rgba(255,255,255,0.10);  /* Dark */
--border-strong: rgba(255,255,255,0.16);   /* Dark */

/* ── Semantic ── */
--status-success: #4CAF50;        /* Light / Dark success */
--status-warning: #F59E0B;        /* Light */
--status-warning-dark: #FBBF24;   /* Dark */
--status-danger: #DC2626;         /* Light */
--status-danger-dark: #EF4444;    /* Dark */
--status-info: #3A78D8;           /* Light */
--status-info-dark: #60A5FA;      /* Dark */
--status-neutral: #64748B;        /* Light */
--status-neutral-dark: #808080;   /* Dark */
```

### 6.4 Prohibiciones de color

| Color | Prohibido para | Alternativa |
|---|---|---|
| `#10B981` (emerald-500) | Cualquier uso | Usar `--status-success` |
| `#2ECC71` | Cualquier uso | Usar `--cermont-green` |
| `bg-emerald-*` | Badges, estados, fondos | Usar tokens semánticos |
| `text-green-*` | Estados | Usar `--status-success` |
| `bg-purple-*` | Badges, cards | Usar `--status-info` |
| `bg-yellow-*` | Estados sin token | Usar `--status-warning` |
| `bg-black` | Cards en dark mode | Usar `--bg-surface` o `--bg-surface-elevated` |
| `border-green-*` | Bordes semánticos | Usar tokens border semánticos |

### 6.5 Archivos a modificar

| Archivo | Acción |
|---|---|
| `frontend/src/app/globals.css` | Renombrar tokens legacy, agregar tokens faltantes según DESIGN.md v4.0 |
| `frontend/src/app/globals.css` | Agregar `@custom-variant dark (&:is(.dark *))` si no existe |
| `frontend/src/app/globals.css` | Unificar `--color-*` y `--status-*` con DESIGN.md |
| `frontend/tailwind.config.*` | Mapear tokens CSS a clases Tailwind si aplica |

### 6.6 Validación

```bash
npm run typecheck -w frontend
npm run lint -w frontend
npm run build -w frontend
# Verificar que no aparezcan colores prohibidos
rg "bg-emerald|text-green-|bg-purple|bg-yellow-|bg-black" frontend/src
```

---

## 7. Tokens de superficie/elevación

### 7.1 Especificación

```css
/* Niveles de elevación dark mode (luminance stepping) */
--elevation-0: #121212;    /* Canvas */
--elevation-1: #1A1A1A;    /* Surface — cards */
--elevation-2: #242424;    /* Elevated — hover, dropdowns */
--elevation-3: #2E2E2E;    /* Highlight — selected, active */
--elevation-deep: #0A0A0A; /* Deep — sidebar, modal, drawer */
--elevation-overlay: rgba(0,0,0,0.6); /* Overlay */
```

### 7.2 Reglas de uso

| Elemento | Nivel de elevación |
|---|---|
| Fondo de página | `elevation-0` |
| Cards, secciones | `elevation-1` |
| Cards hover, dropdowns | `elevation-2` |
| Elementos activos/selected | `elevation-3` |
| Sidebar, drawer, modal | `elevation-deep` |
| Overlays | `elevation-overlay` |

### 7.3 Prohibiciones

| Prohibido | Razón |
|---|---|
| `bg-black` (#000) en dark mode | No hay profundidad, se ve plano genérico |
| `bg-white` en cards light mode sin shadow | Sin contorno, no se diferencia del canvas |
| Fondo con opacidad < 100% en cards | Rompe el stacking visual |

---

## 8. Tokens de tipografía

### 8.1 Familia

```css
--font-sans: 'Inter', system-ui, -apple-system, sans-serif;
--font-mono: 'Geist Mono', 'SF Mono', ui-monospace, monospace;
```

### 8.2 Escala

| Token | Tamaño | Weight | Tracking | Uso |
|---|---|---|---|---|
| `--text-display` | 40px (mobile: 32px) | 700 | -0.02em | Hero dashboard |
| `--text-h1` | 28px (mobile: 24px) | 700 | -0.01em | Título página |
| `--text-h2` | 22px | 700 | 0 | Encabezado bloque |
| `--text-h3` | 18px | 600 | 0 | Título card |
| `--text-h4` | 16px | 600 | 0 | Subtítulo |
| `--text-body` | 14px | 400 | 0 | Texto principal |
| `--text-body-sm` | 13px | 400 | 0 | Metadata |
| `--text-caption` | 12px | 500 | 0 | Labels, badges |
| `--text-micro` | 11px | 600 | +0.04em | Tags, códigos |
| `--text-metric` | 32px | 700 | -0.02em | KPIs grandes |
| `--text-metric-sm` | 24px | 700 | -0.01em | KPIs secundarios |

### 8.3 Archivo a modificar

`frontend/src/app/globals.css` — Agregar tokens de tipografía si no existen. Verificar que `globals.css` ya tiene la familia `Inter` y los tokens de tamaño.

---

## 9. Tokens de espaciado

```css
--space-1: 4px;
--space-2: 8px;
--space-3: 12px;
--space-4: 16px;
--space-5: 20px;
--space-6: 24px;
--space-8: 32px;
--space-10: 40px;
--space-12: 48px;
--space-16: 64px;
```

### Reglas de espaciado

- Padding lateral contenido mobile: 16px
- Padding lateral contenido desktop: 24px
- Padding interno card: 20px
- Gutter entre cards: 12px (mobile) / 16px (desktop)
- Gap entre secciones: 24px

---

## 10. Tokens de radius

| Token | px | Mobile | Desktop |
|---|---|---|---|
| `--radius-sm` | 8 | Badges, chips | Badges, chips |
| `--radius-md` | 12 | Inputs | Inputs, tablas |
| `--radius-lg` | 16 | — | Cards, modales |
| `--radius-xl` | 24 | Cards, modales | — |
| `--radius-2xl` | 32 | Cards hero | — |
| `--radius-pill` | 9999 | Botones, capsules | Botones, capsules |

**(Ya existe en globals.css — verificar consistencia)**

---

## 11. Tokens de sombras

### Dark mode (luminance stepping — sin sombras)

| Nivel | Mecanismo |
|---|---|
| Canvas → Surface | Diferencia de luminancia (12 → 1A) |
| Surface → Elevated | Diferencia de luminancia (1A → 24) |
| Elevated → Highlight | Diferencia de luminancia (24 → 2E) |
| Deep | Canvas invertido (0A) |

### Light mode (sombras suaves)

```css
--shadow-sm: 0 1px 2px rgba(15,23,42,0.04);
--shadow-md: 0 4px 12px rgba(15,23,42,0.06);
--shadow-lg: 0 8px 24px rgba(15,23,42,0.08);
--shadow-xl: 0 24px 48px rgba(15,23,42,0.12);
--shadow-accent: 0 4px 20px rgba(33,84,166,0.25); /* Solo FAB */
```

---

## 12. Tokens de iconografía

### 12.1 Tamaños

| Token | px | Uso |
|---|---|---|
| `--icon-xs` | 14 | Badges, inline con caption |
| `--icon-sm` | 16 | Tablas, listas densas |
| `--icon-md` | 20 | Botones, labels, navegación |
| `--icon-lg` | 24 | Cards, headers de sección |
| `--icon-xl` | 32 | Empty states, hero |

### 12.2 Stroke width

| Contexto | Stroke width |
|---|---|
| UI general (botones, labels) | 1.5px |
| Navegación (sidebar, bottom nav) | 2px |
| Badges, inline | 1.5px |

### 12.3 Contenedores (capsules)

| Token | Size | Radius | Uso |
|---|---|---|---|
| `--capsule-sm` | 32px | 999px | Badge con icono |
| `--capsule-md` | 40px | 999px | KPI card |
| `--capsule-lg` | 48px | 999px | Hero, empty state |
| `--capsule-xl` | 56px | 999px | Dashboard hero |

---

## 13. Arquitectura de componentes

### 13.1 Estructura propuesta

Basada en la arquitectura actual (Feature-Sliced Design), los componentes se organizarán así:

```txt
frontend/src/
├── core/
│   ├── ui/                      ← Componentes base del sistema
│   │   ├── StatusBadge.tsx      ← BADGE UNIFICADO (todos los módulos)
│   │   ├── CategoryBadge.tsx    ← NUEVO: Badge de categoría
│   │   ├── Skeleton.tsx         ← Existente, mejorar variantes
│   │   ├── ProgressRing.tsx     ← NUEVO: Anillo de progreso
│   │   ├── PremiumCard.tsx      ← NUEVO: Card base premium
│   │   ├── EmptyStateCard.tsx   ← NUEVO: Estado vacío premium
│   │   ├── ErrorCard.tsx        ← NUEVO: Error premium
│   │   ├── KpiCard.tsx          ← Mover desde components/common/
│   │   └── SegmentControl.tsx   ← Mover desde components/common/
│   └── ...
│
├── components/
│   └── common/                  ← Componentes compartidos
│       ├── ...existente...
│       └── (no duplicar con core/ui/)
│
├── modules/
│   ├── cockpit/
│   │   └── ui/
│   │       ├── CockpitTimeline.tsx    ← NUEVO: Timeline premium 14 pasos
│   │       ├── CompactStepper.tsx     ← NUEVO: Stepper compacto mobile
│   │       └── ...
│   ├── navigation/
│   │   └── ui/
│   │       ├── CommandBar.tsx         ← NUEVO: Command Bar global
│   │       ├── ActionSheet.tsx        ← NUEVO: Action Sheet contextual
│   │       ├── FloatingActionButton.tsx ← NUEVO: FAB controlado
│   │       └── BottomNav.tsx          ← Mejorar MobileBottomNav existente
│   └── ...
```

### 13.2 Reglas de ubicación

| Tipo de componente | Ubicación |
|---|---|
| Base del design system | `core/ui/` |
| Compartido entre 2+ módulos | `components/common/` |
| Específico de un módulo | `modules/{modulo}/ui/` |
| Layout y navegación | `modules/navigation/ui/` o `modules/core/ui/layout/` |

### 13.3 Componentes a NO duplicar

| Componente | Ubicación canónica | Módulos que duplican |
|---|---|---|
| StatusBadge | `core/ui/StatusBadge.tsx` | 6 módulos tienen su propio badge |
| KpiCard | `core/ui/KpiCard.tsx` | `execution/page.tsx` define KpiCard inline |
| SegmentControl | `components/common/SegmentControl.tsx` | — (bien ubicado) |
| Skeleton | `core/ui/Skeleton.tsx` | Algunos loading.tsx usan Skeleton bien |

---

## 14. Reglas de iconos monocromáticos

### 14.1 Regla absoluta

**Todos los iconos son unicolor. Heredan `currentColor`.**

### 14.2 Prohibiciones absolutas

- ❌ Iconos multicolor (diferentes colores en un mismo SVG)
- ❌ Emojis como iconografía funcional (✅, ❌, ⚠️ como iconos)
- ❌ Rellenos inconsistentes (filled + outline mezclados en mismo contexto)
- ❌ Sombras en iconos (`drop-shadow`, `filter: blur`)
- ❌ `stroke` y `fill` hardcodeados en el SVG
- ❌ `color` diferente a `currentColor` en el SVG

### 14.3 Patrón correcto

```tsx
// ✅ CORRECTO — Icon wrapper global
import { type LucideIcon, type LucideProps } from "lucide-react";

interface IconProps extends LucideProps {
  icon: LucideIcon;
  size?: "xs" | "sm" | "md" | "lg" | "xl";
  tone?: "default" | "muted" | "accent" | "success" | "warning" | "danger" | "info";
}

function Icon({ icon: LucideIcon, size = "md", tone = "default", className, ...props }: IconProps) {
  const sizeMap = { xs: 14, sm: 16, md: 20, lg: 24, xl: 32 };
  const toneMap = {
    default: "text-[--icon-default]",
    muted: "text-[--icon-muted]",
    accent: "text-[--icon-accent]",
    success: "text-[--status-success]",
    warning: "text-[--status-warning]",
    danger: "text-[--status-danger]",
    info: "text-[--status-info]",
  };
  return (
    <LucideIcon
      size={sizeMap[size]}
      strokeWidth={size === "lg" || size === "xl" ? 1.5 : 1.5}
      className={cn(toneMap[tone], className)}
      aria-hidden="true"
      {...props}
    />
  );
}
```

### 14.4 Archivos a refactorizar (iconos)

| Archivo | Problema |
|---|---|
| `frontend/src/app/(portal)/portal/page.tsx` | Badge inline que usa emojis y colores directos |
| `frontend/src/modules/audit/ui/AuditLogViewer.tsx` | BadgePill con colores directos |
| `frontend/src/modules/orders/ui/OrderTimeline.tsx` | Iconos sin currentColor |
| `frontend/src/modules/dashboard/ui/ActivityTimeline.tsx` | Iconos con estilo inconsistente |

---

## 15. Reglas de colores semánticos

### 15.1 Cuándo usar cada color semántico

| Color | Cuándo usarlo | Cuándo NO usarlo |
|---|---|---|
| Success (#4CAF50) | Aprobado, completado, sincronizado, conforme | Decoración, branding, títulos |
| Warning (#F59E0B) | Pendiente, próximo a vencer, requiere atención | Estados normales, información |
| Danger (#DC2626) | Bloqueado, rechazado, error, vencido | Estados informativos menores |
| Info (#3A78D8) | En progreso, informativo, pendiente de firma | Estados críticos |
| Neutral (#64748B) | Draft, sin iniciar, no aplica, inactivo | Estados que requieren atención |

### 15.2 Reglas

- **Nunca usar color como único indicador de estado** — siempre texto + icono + color
- **Nunca usar success para decoración** — solo para estados reales de completitud
- **Nunca usar danger para warnings menores** — danger solo para bloqueos críticos
- **Nunca usar colores semánticos en backgrounds grandes** — usar versiones con opacidad (15%)

---

## 16. Modo oscuro premium

### 16.1 Principios

- Fondo por defecto: `#121212` (no `#000`)
- Profundidad por luminancia escalonada: 0A → 12 → 1A → 24 → 2E
- Bordes: semitransparentes (8% blanco)
- Sin sombras — la profundidad se siente por el color
- Iconos acento en CERMONT Blue dark (#3A78D8)

### 16.2 Problemas actuales

| Problema | Archivo |
|---|---|
| `bg-black` en cards | Varios archivos de componente |
| `dark:bg-zinc-950` sin coherencia | Checklists, varios |
| `dark:border-red-900/30` inconsistente | Reports, varios |
| `dark:bg-red-950/20` sin estandarizar | Orden detalle tabs |

### 16.3 Corrección

Todas las variantes `dark:*` deben usar los tokens CSS de superficie, no valores absolutos. Crear helpers:

```css
/* En globals.css */
@custom-variant dark (&:is(.dark *));

.dark {
  --bg-canvas: #121212;
  --bg-surface: #1A1A1A;
  --bg-elevated: #242424;
  /* ... */
}
```

---

## 17. Modo claro profesional

### 17.1 Principios

- Fondo: `#F8FAFC` (slate 50)
- Cards: `#FFFFFF` con sombras suaves
- Bordes: semitransparentes (5% negro)
- Acento CERMONT Blue light: `#2154A6`

### 17.2 Estado actual

El modo claro existe principalmente como default browser. Los tokens en `:root` ya definen valores light. Sin embargo, muchos componentes no implementan variantes light específicas y dependen de valores por defecto de Tailwind.

### 17.3 Acción

- Verificar que todos los componentes con `dark:*` tengan equivalente light adecuado
- Asegurar que `data-theme="light"` propague correctamente
- Testear modo claro en todas las páginas principales

---

## 18. Estrategia mobile-first

### 18.1 Dimensiones base

| Parámetro | Valor |
|---|---|
| Ancho mínimo soportado | 375px |
| Touch target mínimo | 44px × 44px |
| Padding lateral contenido | 16px |
| Padding lateral card | 20px |
| Gutter entre cards | 12px |
| Bottom nav altura | 64px (56px + 8px safe area) |
| Header compacto | 48px |

### 18.2 Patrones mobile

| Patrón | Implementación |
|---|---|
| Bottom Nav + FAB | Mejorar MobileBottomNav existente |
| Action Sheet | Nuevo componente (ver sección 32) |
| Cards no tablas | Toda lista en mobile es cards, no tablas HTML |
| Formularios a página completa | Sin modales de edición larga |
| Timeline vertical | CockpitTimeline vertical en mobile |
| Filtros compactos | Filter bar horizontal con scroll |
| Búsqueda inline | Search bar en header |

### 18.3 Archivos a refactorizar

| Archivo | Problema mobile |
|---|---|
| `frontend/src/modules/orders/ui/OrdersTable.tsx` | Tabla en mobile — debe ser cards |
| `frontend/src/app/(dashboard)/orders/page.tsx` | Tabla en vista principal |
| `frontend/src/app/(dashboard)/invoices/page.tsx` | Tabla densa sin cards mobile |
| `frontend/src/app/(dashboard)/admin/users/page.tsx` | Tabla sin vista card mobile |

---

## 19. Estrategia desktop enterprise

### 19.1 Layout desktop

```
┌──────────────┬────────────────────────────────┬──────────┐
│  Sidebar     │  Main Content                  │ Panel    │
│  240px       │                                │ derecho  │
│              │  ┌──────────────────────────┐   │ opcional │
│  Logo        │  │ Header (56px)            │   │ 280px    │
│  CERMONT     │  │ Breadcrumbs · Cmd+K · 🛎️ │   │          │
│              │  └──────────────────────────┘   │          │
│  [📊] Dash   │  ┌────┐ ┌────┐ ┌────┐ ┌────┐  │ Activity │
│  [📋] Casos  │  │KPI │ │KPI │ │KPI │ │KPI │  │ Timeline │
│  [📝] Plan   │  └────┘ └────┘ └────┘ └────┘  │          │
│  [📷] Evid   │  ┌──────────────────────────┐   │ Alerts   │
│  [📄] Rep    │  │ Cockpit                  │   │          │
│  [💰] Cost   │  │ Timeline 14 pasos        │   │          │
│  [🚛] Fleet  │  └──────────────────────────┘   │          │
│  [🔧] Kits   │  ┌──────┐ ┌────────────────┐   │          │
│              │  │Chart │ │ Table/List     │   │          │
│  [⚙️] Admin  │  └──────┘ └────────────────┘   │          │
└──────────────┴────────────────────────────────┴──────────┘
```

### 19.2 Grid desktop

| Breakpoint | Columnas | Layout |
|---|---|---|
| 1024–1440px | 12 | Grid completo con sidebar |
| > 1440px | 12 | Grid + panel derecho (opcional) |

### 19.3 Sidebar

| Propiedad | Valor |
|---|---|
| Ancho | 240px (64px colapsada) |
| Background | `--bg-canvas-deep` |
| Border right | `--border-subtle` |
| Active item | `--bg-surface-highlight` + borde CERMONT Blue izquierdo |

---

## 20. Rediseño Cockpit 14 pasos

### 20.1 Objetivo

Transformar el pipeline de 14 pasos de una barra de progreso genérica a un timeline premium, compacto en mobile y completo en desktop, con categorías por fase, badges semánticos, y action sheet contextual.

### 20.2 Problema actual

- `FourteenStepProgressBar.tsx` es una barra horizontal genérica
- `ServiceCaseWorkflowCockpit.tsx` tiene TimelineSection inline no reutilizable
- En mobile, los 14 pasos requieren scroll excesivo
- Sin categorización visual por fase (Comercial, Operativo, Cierre, Financiero)
- Pasos no colapsables — todos visibles siempre

### 20.3 Solución propuesta

**Desktop: Timeline horizontal por fases**

```
┌─────────────────────────────────────────────────────────────┐
│ Fase 1: Comercial   │ Fase 2: Operativo  │ Fase 3: Cierre  │ Fase 4: Financiero │
├─────────────────────┼────────────────────┼──────────────────┼────────────────────┤
│ 1 Solicitud    ✅   │ 5 Planeación  🔄   │ 9 Acta      ⏳  │ 13 Aprobac.  ⏳   │
│ 2 Visita       ✅   │ 6 Ejecución   ⏳   │ 10 Firma    ⏳  │ 14 Pago      ⏳   │
│ 3 Propuesta    ✅   │ 7 Evidencias  ⏳   │ 11 SES      ⏳  │                    │
│ 4 PO           ✅   │ 8 Informe     ⏳   │                    │                    │
└─────────────────────┴────────────────────┴──────────────────┴────────────────────┘
```

**Mobile: Timeline vertical colapsable por fase**

```
Fase 1: Comercial (4/4) ✅  [▼]
  ● Solicitud          ✅ Completado
  ● Visita             ✅ Completado
  ● Propuesta          ✅ Completado
  ● PO                 ✅ Completado

Fase 2: Operativo (1/4) 🔄  [▼]
  ◉ Planeación         🔄 En ejecución  ← Actual
  ○ Ejecución          ⏳ Pendiente
  ○ Evidencias         ⏳ Pendiente
  ○ Informe            ⏳ Pendiente

Fase 3: Cierre (0/3) ⏳  [▶]
  (colapsado)

Fase 4: Financiero (0/2) ⏳  [▶]
  (colapsado)
```

### 20.4 Componentes necesarios

| Componente | Archivo propuesto | Descripción |
|---|---|---|
| `CockpitTimeline.tsx` | `modules/cockpit/ui/CockpitTimeline.tsx` | Timeline responsive (horizontal desktop, vertical mobile) |
| `CompactStepper.tsx` | `modules/cockpit/ui/CompactStepper.tsx` | Stepper compacto para pasos colapsables |
| `PhaseBadge.tsx` | `modules/cockpit/ui/PhaseBadge.tsx` | Badge de fase (Comercial, Operativo, Cierre, Financiero) |
| `StepCard.tsx` | `modules/cockpit/ui/StepCard.tsx` | Card de paso individual con estado y acción |

### 20.5 Archivos a modificar

| Archivo | Acción |
|---|---|
| `frontend/src/modules/cockpit/ui/FourteenStepProgressBar.tsx` | Reemplazar con CockpitTimeline |
| `frontend/src/modules/service-cases/components/ServiceCaseWorkflowCockpit.tsx` | Extraer TimelineSection a CockpitTimeline |
| `frontend/src/modules/service-cases/components/OperationalStepProgress.tsx` | Refactorizar para usar CockpitTimeline |
| `frontend/src/modules/orders/ui/OrderTimeline.tsx` | Refactorizar para usar CockpitTimeline |
| `frontend/src/modules/service-cases/components/CockpitTabs.tsx` | Verificar consistencia |

### 20.6 Criterios de aceptación

- [ ] Desktop: timeline horizontal con 4 fases y 14 pasos visibles sin scroll
- [ ] Mobile: timeline vertical con fases colapsables, paso actual expandido
- [ ] Badge de fase (Comercial/Operativo/Cierre/Financiero) con color semántico
- [ ] Estado de paso: completado (verde), actual (azul con glow), pendiente (gris), bloqueado (rojo)
- [ ] Touch target ≥48px en mobile
- [ ] Action sheet contextual al tocar un paso (ver sección 32)
- [ ] Progress ring general del caso en header

---

## 21. Rediseño Dashboard

### 21.1 Objetivo

Transformar el dashboard de una colección de widgets a una narrativa operativa: pulso → KPIs → flujo → actividad → alertas.

### 21.2 Problema actual

- El dashboard en `frontend/src/app/(dashboard)/dashboard/page.tsx` ya usa KpiCard y StepTimeline
- Falta hero operativo con métricas clave del día
- KPIs sin icon-capsule ni delta de tendencia
- Timeline de actividad básico sin filtros
- Sin panel de alertas/bloqueos destacados

### 21.3 Solución propuesta

```
┌──────────────────────────────────────────────────────────────┐
│  PULSO OPERATIVO CERMONT                                     │
│  ┌──────┐ ┌──────┐ ┌──────┐ ┌──────┐                        │
│  │ 28   │ │ 12   │ │ 156  │ │ $2.4M│                        │
│  │Casos  │ │En     │ │Compl.│ │Fact. │                        │
│  │activos│ │ejecuc.│ │mes   │ │mes   │                        │
│  └──────┘ └──────┘ └──────┘ └──────┘                        │
│  🟢 SLA 92% · ⚠️ 3 bloqueos · 📸 45 evidencias hoy          │
├──────────────────────────────────────────────────────────────┤
│ ┌───────┐ ┌───────┐ ┌───────┐ ┌───────┐ ┌───────┐ ┌──────┐ │
│ │KPI    │ │KPI    │ │KPI    │ │KPI    │ │KPI    │ │KPI   │ │
│ │card   │ │card   │ │card   │ │card   │ │card   │ │card  │ │
│ └───────┘ └───────┘ └───────┘ └───────┘ └───────┘ └──────┘ │
├──────────────────────────────────────────────────────────────┤
│ Distribución 14 pasos (StepTimeline mejorado)                │
├──────────────────────────────────────────────────────────────┤
│ ┌──────────────────────┐ ┌─────────────────────────────────┐ │
│ │ Gráfico tendencia    │ │ Alertas y bloqueos              │ │
│ │ mensual              │ │ • Caso #123 — Bloqueado         │ │
│ └──────────────────────┘ │ • Caso #456 — SLA riesgo        │ │
│                          │ • Caso #789 — Sin evidencias    │ │
│ ┌──────────────────────┐ └─────────────────────────────────┘ │
│ │ Actividad reciente   │                                     │
│ │ timeline             │                                     │
│ └──────────────────────┘                                     │
└──────────────────────────────────────────────────────────────┘
```

### 21.4 Componentes necesarios

| Componente | Archivo propuesto |
|---|---|
| `DashboardHero.tsx` | `modules/dashboard/ui/DashboardHero.tsx` |
| `SlaRiskBanner.tsx` | `modules/dashboard/ui/SlaRiskBanner.tsx` |
| `BlockerList.tsx` | `modules/cockpit/ui/WorkflowBlockerList.tsx` (mejorar existente) |

### 21.5 Archivos a modificar

| Archivo | Acción |
|---|---|
| `frontend/src/app/(dashboard)/dashboard/page.tsx` | Agregar hero, mejorar KPIs, agregar alertas |
| `frontend/src/modules/dashboard/ui/DashboardCommandCenter.tsx` | Refactorizar para hero + KPIs |
| `frontend/src/modules/dashboard/ui/StepTimeline.tsx` | Mejorar con fases coloreadas |
| `frontend/src/modules/dashboard/ui/ActivityTimeline.tsx` | Agregar filtros y más metadata |
| `frontend/src/modules/dashboard/ui/SlaRiskOrdersTable.tsx` | Convertir a cards + badges |

---

## 22. Rediseño Planning

### 22.1 Objetivo

Transformar la vista de planificación con readiness premium, AST/PTW, recursos, cost baseline y aprobación en un flujo visual claro y accionable.

### 22.2 Componentes existentes

| Componente | Archivo | Estado |
|---|---|---|
| PlanningReadinessGate | `modules/planning/ui/PlanningReadinessGate.tsx` | ✅ Existe (colores hardcoded) |
| PlanningAstPtwSection | `modules/planning/ui/PlanningAstPtwSection.tsx` | ✅ Existe |
| PlanningCostBaselineSection | `modules/planning/ui/PlanningCostBaselineSection.tsx` | ✅ Existe |
| PlanningResourcesSummary | `modules/planning/ui/PlanningResourcesSummary.tsx` | ✅ Existe |
| PlanningSignaturesSection | `modules/planning/ui/PlanningSignaturesSection.tsx` | ✅ Existe |
| ReadinessGate | `modules/planning/ui/ReadinessGate.tsx` | ✅ Existe |

### 22.3 Problemas

- `PlanningReadinessGate.tsx` usa `text-green-600/700/800`, `bg-green-100`, `text-red-500/700` — colores hardcoded
- ReadinessGate sin progress ring
- AST/PTW sin badges de categoría
- Faltan skeleton states específicos

### 22.4 Acciones

- Refactorizar PlanningReadinessGate para usar tokens `--status-success`, `--status-danger`
- Agregar ProgressRing en readiness general
- Estandarizar badges de estado en AST/PTW con CategoryBadge
- Agregar skeleton loading en todas las secciones

---

## 23. Rediseño Forms/Checklists

### 23.1 Objetivo

Forms y checklists con SegmentControl C/NC/NA premium, secciones colapsables, foto requerida, hallazgo, acción correctiva y progreso por sección.

### 23.2 Componentes existentes

| Componente | Archivo | Problema |
|---|---|---|
| SegmentControl | `components/common/SegmentControl.tsx` | ✅ Bueno, mejorar estilos |
| ConformityControl | `components/common/SegmentControl.tsx` (wrapper) | ✅ Bueno |
| SectionedFormRenderer | `modules/forms/ui/SectionedFormRenderer.tsx` | Usa `bg-purple-50 text-purple-600` hardcode |
| ChecklistPanel | `modules/checklists/components/ChecklistPanel.tsx` | `bg-emerald-500/600/700` hardcode extensivo |
| ChecklistItemControl | `modules/checklists/components/ChecklistItemControl.tsx` | Revisar |
| SummaryCard | `modules/checklists/components/SummaryCard.tsx` | `border-emerald-200` hardcode |
| CompletedChecklistBlock | `modules/checklists/components/CompletedChecklistBlock.tsx` | `border-emerald-200` hardcode |
| ChecklistSkeleton | `modules/checklists/components/ChecklistSkeleton.tsx` | ✅ Bueno |

### 23.3 Solución propuesta

**Checklist item premium:**

```
┌──────────────────────────────────────┐
│ [###] Check ítem de inspección      │
│ ┌─────┬──────┬──────┐               │
│ │  C  │  NC  │  NA  │  ← Segmented  │
│ └─────┴──────┴──────┘               │
│ 📷 Foto requerida          [Tomar]  │
│ 📝 Hallazgo: [________________]     │
│ 🔧 Acción: [__________________]     │
│                                      │
│ Sección: 4/12  ████████░░░░ 40%     │
└──────────────────────────────────────┘
```

### 23.4 Archivos a modificar

| Archivo | Acción |
|---|---|
| `frontend/src/modules/checklists/components/ChecklistPanel.tsx` | Reemplazar emerald hardcode con tokens semánticos |
| `frontend/src/modules/checklists/components/CompletedChecklistBlock.tsx` | Idem |
| `frontend/src/modules/checklists/components/SummaryCard.tsx` | Idem |
| `frontend/src/modules/forms/ui/SectionedFormRenderer.tsx` | Reemplazar purple hardcode con tokens info |
| `frontend/src/components/common/SegmentControl.tsx` | Mejorar estilos premium |

---

## 24. Rediseño Evidences

### 24.1 Objetivo

Galería de evidencias premium con grid, captura de cámara, metadata, geolocalización, before/after, estados de subida y offline sync.

### 24.2 Componentes existentes

| Componente | Archivo |
|---|---|
| EvidenceStatusBadge | `modules/evidences/ui/EvidenceStatusBadge.tsx` |
| EvidenceStatusBadge test | `modules/evidences/ui/__tests__/EvidenceStatusBadge.test.tsx` |
| EvidenceGallerySection | `modules/service-cases/components/EvidenceGallerySection.tsx` |
| StructuredEvidenceCapture | `modules/field-execution/ui/evidence/StructuredEvidenceCapture.tsx` |
| EvidenceSlotCard | `modules/field-execution/ui/EvidenceSlotCard.tsx` |

### 24.3 Solución propuesta

**Galería mobile:**

```
┌────────────────────────────┐
│ 📸 Evidencias (12)        │
├──┬──┬──┬──┬───┬──┬──┬────┤
│📷│📷│📷│📷│📷│📷│📷│ ➕ │ ← Grid 4 columnas
├──┴──┴──┴──┴───┴──┴──┴────┤
│ 📷 Antes              ⏳ │
│ 📷 Después            ✅ │
│ 📷 Hallazgo           🔴 │
│ 📷 Corrección         🟢 │
└────────────────────────────┘
```

### 24.4 Archivos a modificar

| Archivo | Acción |
|---|---|
| `frontend/src/modules/evidences/ui/EvidenceStatusBadge.tsx` | Refactorizar para usar StatusBadge global |
| `frontend/src/modules/service-cases/components/EvidenceGallerySection.tsx` | Aplicar diseño premium gallery |
| `frontend/src/modules/field-execution/ui/evidence/StructuredEvidenceCapture.tsx` | Mejorar experiencia de captura |

---

## 25. Rediseño Reports

### 25.1 Objetivo

Reportes con vista previa PDF, selector de fotos, plantillas, y estados de generación premium.

### 25.2 Componentes existentes

| Componente | Archivo |
|---|---|
| ReportStatusBadge | `modules/reports/ui/ReportStatusBadge.tsx` |
| ReportPanel | `modules/reports/ui/ReportPanel.tsx` |
| TechnicalReportDraftPage | `modules/reports/ui/TechnicalReportDraftPage.tsx` |
| PDFExportButton | `modules/reports/ui/PDFExportButton.tsx` |
| DigitalSignaturePad | `modules/reports/ui/DigitalSignaturePad.tsx` |
| ReportReviewPanel | `modules/reports/ui/ReportReviewPanel.tsx` |

### 25.3 Archivos a modificar

| Archivo | Acción |
|---|---|
| `frontend/src/modules/reports/ui/ReportStatusBadge.tsx` | Refactorizar para usar StatusBadge global |
| `frontend/src/modules/reports/ui/ReportPanel.tsx` | Aplicar PremiumCard, mejorar skeleton |
| `frontend/src/modules/reports/ui/ReportReviewPanel.tsx` | Agregar estados y badges |

---

## 26. Rediseño Delivery Records

### 26.1 Objetivo

Actas de entrega premium con firma digital integrada, timeline de estados y badges semánticos.

### 26.2 Componentes existentes

| Componente | Archivo |
|---|---|
| DigitalSignaturePad | `modules/reports/ui/DigitalSignaturePad.tsx` |
| Delivery record pages | `app/(dashboard)/delivery-records/[id]/page.tsx` |

### 26.3 Acción principal

- Unificar badges usando StatusBadge global
- Aplicar PremiumCard para cada acta
- Implementar timeline visual de estados

---

## 27. Rediseño Billing/SES/Invoices/Payments

### 27.1 Objetivo

Pipeline financiero premium con SES, facturas, pagos, aging y aprobaciones. Badges de estado financiero unificados.

### 27.2 Componentes existentes

| Componente | Archivo |
|---|---|
| InvoiceStatusBadge | `modules/invoices/ui/InvoiceStatusBadge.tsx` |
| InvoicePipelinePage | `modules/invoices/ui/InvoicePipelinePage.tsx` |
| AgingDashboard | `modules/invoices/ui/AgingDashboard.tsx` |
| PaymentRecordCard | `modules/invoices/ui/PaymentRecordCard.tsx` |
| AdministrativeClosurePipeline | `modules/service-cases/components/AdministrativeClosurePipeline.tsx` |

### 27.3 Archivos a modificar

| Archivo | Acción |
|---|---|
| `frontend/src/modules/invoices/ui/InvoiceStatusBadge.tsx` | Refactorizar para usar StatusBadge global |
| `frontend/src/modules/invoices/ui/InvoicePipelinePage.tsx` | Aplicar pipeline visual premium |
| `frontend/src/modules/invoices/ui/AgingDashboard.tsx` | Agregar ProgressRing para aging |
| `frontend/src/modules/service-cases/components/AdministrativeClosurePipeline.tsx` | Timeline premium |

---

## 28. Rediseño Fleet/Assets/Maintenance

### 28.1 Objetivo

Flota, activos y mantenimiento con cards de vehículo premium, estado de disponibilidad y alertas de mantenimiento.

### 28.2 Componentes existentes

| Componente | Archivo |
|---|---|
| VehicleAssignmentPanel | `modules/fleet/ui/VehicleAssignmentPanel.tsx` |
| MaintenanceTab | `modules/fleet/ui/MaintenanceTab.tsx` |
| StatusBadge (assets) | `app/(dashboard)/assets/[id]/page.tsx` usa StatusBadge core |

### 28.3 Archivos a modificar

| Archivo | Acción |
|---|---|
| `frontend/src/modules/fleet/ui/VehicleAssignmentPanel.tsx` | Cards premium con AvailabilityBadge |
| `frontend/src/modules/fleet/ui/MaintenanceTab.tsx` | Timeline de mantenimiento |
| `frontend/src/app/(dashboard)/fleet/page.tsx` | Cards de vehículo premium |

---

## 29. Rediseño Portal Cliente

### 29.1 Objetivo

Portal cliente simple, funcional y profesional con cards grandes, estados claros y acciones reducidas.

### 29.2 Componentes existentes

| Componente | Archivo |
|---|---|
| PortalServiceCaseList | `modules/portal/ui/PortalServiceCaseList.tsx` |
| PortalServiceCaseDetail | `modules/portal/ui/PortalServiceCaseDetail.tsx` |
| PortalDocumentDownload | `modules/portal/ui/PortalDocumentDownload.tsx` |

### 29.3 Problemas

- `PortalServiceCaseList.tsx` usa `bg-green-100 text-green-700` hardcode
- `frontend/src/app/(portal)/portal/page.tsx` tiene StatusBadge inline con colores directos
- `frontend/src/app/(portal)/portal/invoices/page.tsx` usa `bg-yellow-100` hardcode

### 29.4 Archivos a modificar

| Archivo | Acción |
|---|---|
| `frontend/src/modules/portal/ui/PortalServiceCaseList.tsx` | Usar StatusBadge global |
| `frontend/src/app/(portal)/portal/page.tsx` | Reemplazar inline StatusBadge con componente |
| `frontend/src/app/(portal)/portal/invoices/page.tsx` | Reemplazar colores hardcode con tokens |
| `frontend/src/app/(portal)/portal/proposals/page.tsx` | Skeleton ya implementado ✅ |

---

## 30. Rediseño Admin/RBAC/Audit

### 30.1 Objetivo

Interfaz administrativa premium con tablas densas en desktop, cards en mobile, audit log con badges de evento y filtros.

### 30.2 Componentes existentes

| Componente | Archivo |
|---|---|
| AuditLogViewer | `modules/audit/ui/AuditLogViewer.tsx` |
| StatusBadge | `core/ui/StatusBadge.tsx` (usado en assets) |

### 30.3 Archivos a modificar

| Archivo | Acción |
|---|---|
| `frontend/src/modules/audit/ui/AuditLogViewer.tsx` | Usar BadgePill con tokens semánticos |
| `frontend/src/app/(dashboard)/admin/users/page.tsx` | Vista card en mobile |
| `frontend/src/app/(dashboard)/admin/settings/page.tsx` | Cards de configuración premium |

---

## 31. Command Bar global

### 31.1 Objetivo

Barra de comandos global accesible via `Ctrl+K` / `Cmd+K` para navegación rápida, búsqueda de casos, órdenes, clientes, y acciones contextuales.

### 31.2 Especificación

| Aspecto | Detalle |
|---|---|
| Atajo | `Ctrl+K` (Windows/Linux) / `Cmd+K` (Mac) |
| Comportamiento | Modal overlay con input de búsqueda |
| Resultados | Navegación a páginas, búsqueda de casos, acciones rápidas |
| Diseño | Fondo overlay, card central elevada con search input |
| Iconos | Lucide icons unicolor |
| Accesibilidad | `role="dialog"`, `aria-modal="true"`, focus trap |
| Mobile | Sheet desde abajo (ver Action Sheet) |

### 31.3 Componentes

| Componente | Archivo propuesto |
|---|---|
| `CommandBar.tsx` | `modules/navigation/ui/CommandBar.tsx` |
| `CommandBarTrigger.tsx` | `modules/navigation/ui/CommandBarTrigger.tsx` |

### 31.4 Integración

- Agregar en `DefaultLayout.tsx` para que esté disponible en todas las páginas
- El trigger visual es el input de búsqueda en el header desktop
- En mobile, el trigger es un icono en el header compacto

### 31.5 Criterios de aceptación

- [ ] Ctrl+K abre el command bar
- [ ] Escape cierra el command bar
- [ ] Búsqueda filtra por nombre de página, caso, orden, cliente
- [ ] Navegación con teclado (flechas + Enter)
- [ ] Focus trap dentro del modal
- [ ] Mobile: sheet desde abajo
- [ ] Sin dependencias externas (solo React + Lucide)

---

## 32. Contextual Action Sheet

### 32.1 Objetivo

Sheet contextual desde abajo para acciones en mobile. Reemplaza menús contextuales, modales de confirmación y acciones de FAB.

### 32.2 Especificación

| Aspecto | Detalle |
|---|---|
| Trigger | Tap en icono de acciones, FAB, o paso del timeline |
| Contenido | Lista de acciones con icono + label + descripción opcional |
| Diseño | Sheet desde abajo, handle drag, overlay semitransparente |
| Accesibilidad | `role="dialog"`, focus trap, Escape para cerrar |
| Animación | Slide up 200ms ease-out |

### 32.3 Componentes

| Componente | Archivo propuesto |
|---|---|
| `ActionSheet.tsx` | `modules/navigation/ui/ActionSheet.tsx` |
| `ActionSheetItem.tsx` | `modules/navigation/ui/ActionSheetItem.tsx` |

### 32.4 Pseudocódigo

```tsx
// Pseudocódigo orientativo
<ActionSheet open={isOpen} onClose={() => setOpen(false)}>
  <ActionSheetItem icon={FileText} label="Ver detalle" onSelect={() => navigate(id)} />
  <ActionSheetItem icon={Upload} label="Subir evidencia" onSelect={() => upload(id)} />
  <ActionSheetItem icon={AlertTriangle} label="Reportar bloqueo" tone="danger" onSelect={() => report(id)} />
  <ActionSheetItem icon={X} label="Cancelar" tone="muted" onSelect={() => setOpen(false)} />
</ActionSheet>
```

---

## 33. Skeleton Screens

### 33.1 Estado actual

Ya existe `frontend/src/core/ui/Skeleton.tsx` con variantes: `text`, `card`, `kpi-card`, `chart`, `table-row`, `list-item`. Se usa extensivamente en `loading.tsx` de todas las páginas.

### 33.2 Mejoras propuestas

| Variante nueva | Uso |
|---|---|
| `cockpit-step` | Esqueleto para paso del timeline |
| `evidence-grid` | Esqueleto para grid de evidencias (4 columnas) |
| `tab-content` | Esqueleto para contenido de tabs |
| `form-section` | Esqueleto para sección de formulario colapsable |
| `badge-row` | Esqueleto para fila de badges |

### 33.3 Archivos a modificar

| Archivo | Acción |
|---|---|
| `frontend/src/core/ui/Skeleton.tsx` | Agregar nuevas variantes |
| `frontend/src/modules/cockpit/ui/CockpitTimeline.tsx` | Agregar skeleton para steps |
| `frontend/src/modules/evidences/ui/EvidenceGallery.tsx` | Agregar skeleton grid |

---

## 34. Bottom Navigation mobile

### 34.1 Estado actual

`MobileBottomNav.tsx` en `modules/core/ui/layout/MobileBottomNav.tsx` ya implementa la navegación inferior con 5 ítems.

### 34.2 Mejoras propuestas

| Aspecto | Especificación |
|---|---|
| Altura | 64px (56px contenido + 8px safe area) |
| Background | `--bg-surface` con `backdrop-filter: blur(12px)` |
| Border top | `--border-subtle` |
| Iconos | `icon-md` (20px), unicolor |
| Label | `caption` (12px), siempre visible |
| Active state | Icono + texto en `--icon-accent` |
| Inactive state | Icono + texto en `--icon-muted` |

### 34.3 Archivos a modificar

| Archivo | Acción |
|---|---|
| `frontend/src/modules/core/ui/layout/MobileBottomNav.tsx` | Aplicar especificaciones DESIGN.md, blur bg |
| `frontend/src/modules/core/ui/layout/DefaultLayout.tsx` | Integrar FAB + BottomNav |

---

## 35. Floating Action Button

### 35.1 Objetivo

FAB controlado que no interfiera con la bottom navigation ni otros elementos de la UI.

### 35.2 Especificación

| Aspecto | Detalle |
|---|---|
| Posición | Centrado sobre bottom nav, offset -28px |
| Tamaño | 56px × 56px |
| Radio | `--radius-full` (pill) |
| Background | `--cermont-blue` |
| Sombra | `0 4px 12px rgba(33,84,166,0.25)` |
| Icono | `icon-lg` (24px), blanco |
| Animación | Pulse sutil en idle, rotate en open |
| Comportamiento | Abre Action Sheet contextual |

### 35.3 Archivos propuestos

| Componente | Archivo |
|---|---|
| `FloatingActionButton.tsx` | `modules/navigation/ui/FloatingActionButton.tsx` |

### 35.4 Reglas de visibilidad

- El FAB solo es visible en páginas con acciones contextuales relevantes
- No es visible en páginas de solo lectura (detalle, portal cliente)
- No es visible en modales o sheets
- Su posición nunca debe superponerse con la bottom nav

---

## 36. StatusBadge / CategoryBadge

### 36.1 StatusBadge — Componente unificado

```tsx
// Pseudocódigo — StatusBadge unificado
interface StatusBadgeProps {
  status: string;
  tone?: "success" | "warning" | "danger" | "info" | "neutral" | "accent";
  icon?: LucideIcon;
  size?: "sm" | "md" | "lg";
  showIcon?: boolean;
  className?: string;
}
// Archivo: frontend/src/core/ui/StatusBadge.tsx (refactorizar existente)
```

### 36.2 CategoryBadge — Nuevo componente

```tsx
// Pseudocódigo — CategoryBadge
interface CategoryBadgeProps {
  category: string;
  variant?: "checklist" | "evidence" | "document" | "phase" | "custom";
  color?: string; // Token CSS
  icon?: LucideIcon;
  size?: "sm" | "md";
  className?: string;
}
// Archivo: frontend/src/core/ui/CategoryBadge.tsx (nuevo)
```

### 36.3 Mapeo de estados a tones

| Estado | Tone | Icono |
|---|---|---|
| Aprobado, Completado, Sincronizado, Conforme | `success` | CheckCircle |
| Pendiente, En progreso, Revisión | `warning` | Clock |
| Bloqueado, Rechazado, Error, No conforme | `danger` | AlertTriangle |
| En ejecución, Pendiente firma, Info | `info` | Info |
| Draft, Sin iniciar, No aplica, Inactivo | `neutral` | Minus |

### 36.4 Archivos a refactorizar (unificar badges)

| Badge actual | Acción |
|---|---|
| `modules/evidences/ui/EvidenceStatusBadge.tsx` | Convertir a wrapper de StatusBadge |
| `modules/invoices/ui/InvoiceStatusBadge.tsx` | Convertir a wrapper de StatusBadge |
| `modules/reports/ui/ReportStatusBadge.tsx` | Convertir a wrapper de StatusBadge |
| `modules/proposals/ui/ProposalStatusBadge.tsx` | Convertir a wrapper de StatusBadge |
| `modules/field-execution/ui/ExecutionStatusBadge.tsx` | Convertir a wrapper de StatusBadge |
| `app/(portal)/portal/page.tsx` inline badge | Reemplazar con StatusBadge |
| `app/(dashboard)/work-requests/[id]/page.tsx` inline badge | Reemplazar con StatusBadge |

---

## 37. SegmentControl C/NC/NA

### 37.1 Estado actual

✅ Ya existe en `frontend/src/components/common/SegmentControl.tsx` con wrapper `ConformityControl`.

### 37.2 Mejora

```tsx
// Pseudocódigo — SegmentControl premium
interface SegmentControlProps {
  options: { value: string; label: string; icon?: LucideIcon; tone?: string }[];
  value: string;
  onChange: (value: string) => void;
  size?: "sm" | "md" | "lg";
  disabled?: boolean;
}

// ConformityControl con tones semánticos
<ConformityControl
  value={selected}
  onChange={setSelected}
  // C → success, NC → danger, NA → neutral
/>
```

### 37.3 Archivos

| Archivo | Acción |
|---|---|
| `frontend/src/components/common/SegmentControl.tsx` | Mejorar estilos premium, agregar iconos opcionales |
| `frontend/src/modules/checklists/components/ChecklistPanel.tsx` | Usar ConformityControl en lugar de colores hardcode |

---

## 38. KpiCard

### 38.1 Estado actual

✅ Ya existe en `frontend/src/components/common/KpiCard.tsx`. Sin embargo, `execution/page.tsx` define su propio `KpiCard` inline.

### 38.2 Mejora

```tsx
// Pseudocódigo — KpiCard premium
interface KpiCardProps {
  icon: LucideIcon;
  label: string;
  value: string | number;
  subtitle?: string;
  delta?: { value: number; positive: boolean };
  progress?: number; // 0-100 para ProgressRing opcional
  tone?: "default" | "success" | "warning" | "danger" | "info";
  onClick?: () => void;
}
```

### 38.3 Archivos

| Archivo | Acción |
|---|---|
| `frontend/src/components/common/KpiCard.tsx` | Agregar delta, tone, progress ring opcional, icon-capsule |
| `frontend/src/app/(dashboard)/execution/page.tsx` | Eliminar KpiCard inline, usar componente global |

---

## 39. ProgressRing

### 39.1 Objetivo

Anillo de progreso circular animado con SVG nativo (sin biblioteca adicional).

### 39.2 Especificación

| Aspecto | Detalle |
|---|---|
| Tamaños | 48px (small), 64px (medium), 80px (large) |
| Stroke width | 4px (track), 4px (progress) |
| Color track | `--border-default` |
| Color progress | `--status-success` / `--status-warning` / `--status-danger` |
| Animación | stroke-dashoffset 600ms ease-out |
| Label central | `metric-sm` o `caption` |

### 39.3 Archivo propuesto

```tsx
// frontend/src/core/ui/ProgressRing.tsx
interface ProgressRingProps {
  value: number; // 0-100
  size?: "sm" | "md" | "lg";
  tone?: "success" | "warning" | "danger" | "info" | "neutral";
  showLabel?: boolean;
  label?: string;
  className?: string;
}
```

### 39.4 Uso en componentes

| Componente | Uso de ProgressRing |
|---|---|
| Cockpit | Progreso general del caso |
| KpiCard | KPIs circulares |
| ChecklistPanel | Avance por sección |
| PlanningReadinessGate | Readiness general |
| Syncing states | Progreso de sincronización |

---

## 40. CockpitTimeline

### 40.1 Objetivo

Componente de timeline premium para los 14 pasos. Responsive: horizontal en desktop, vertical colapsable en mobile.

### 40.2 Especificación

**Desktop: horizontal**

```
[1]───[2]───[3]───[4]───[5]───[6]───[7]───[8]───[9]───[10]───[11]───[12]───[13]───[14]
 ●    ●    ●    ●    ●    ◉    ○    ○    ○    ○     ○     ○     ○     ○
 ✅   ✅   ✅   ✅   ✅   🔄   ⏳   ⏳   ⏳   ⏳    ⏳    ⏳    ⏳    ⏳
```

**Mobile: vertical colapsable por fase**

```
Fase 1: Comercial ✅ 4/4  [▼]
Fase 2: Operativo 🔄 1/4  [▼]  ← Expandida
  ◉ 5. Planeación     🔄 En ejecución
  ○ 6. Ejecución      ⏳ Pendiente
  ○ 7. Evidencias     ⏳ Pendiente
  ○ 8. Informe        ⏳ Pendiente
Fase 3: Cierre ⏳ 0/3  [▶]  ← Colapsada
Fase 4: Financiero ⏳ 0/2  [▶]  ← Colapsada
```

### 40.3 Archivo propuesto

```tsx
// frontend/src/modules/cockpit/ui/CockpitTimeline.tsx
interface CockpitTimelineProps {
  steps: StepItem[];
  currentStep: number;
  onStepClick?: (step: StepItem) => void;
  phases?: { label: string; color: string; steps: number[] }[];
  variant?: "horizontal" | "vertical";
}
```

---

## 41. Stepper compacto

### 41.1 Objetivo

Stepper compacto para mostrar avance en flujos de varios pasos sin ocupar espacio vertical excesivo.

### 41.2 Especificación

```
● ── ● ── ◉ ── ○ ── ○
Paso 3 de 5: Ejecución
```

- 5 pasos visibles max sin scroll
- Más de 5: dots con +N
- Touch target ≥44px cada dot

### 41.3 Archivo propuesto

```tsx
// frontend/src/modules/cockpit/ui/CompactStepper.tsx
```

---

## 42. Tables premium

### 42.1 Reglas

- **Mobile:** No usar tablas como vista principal. Reemplazar con cards.
- **Desktop:** Tablas densas con header sticky, hover en filas, texto alineado, badges semánticos.
- **Responsive:** Tablas con scroll horizontal en tablet (overflow-x).

### 42.2 Estilos de tabla premium desktop

```css
table {
  width: 100%;
  border-collapse: separate;
  border-spacing: 0;
}
th {
  position: sticky;
  top: 0;
  background: var(--bg-canvas);
  font-size: 12px;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.04em;
  color: var(--text-muted);
  padding: 12px 16px;
  border-bottom: 1px solid var(--border-default);
  text-align: left;
}
td {
  padding: 12px 16px;
  border-bottom: 1px solid var(--border-subtle);
  font-size: 14px;
  color: var(--text-primary);
}
tr:hover td {
  background: var(--bg-surface-elevated);
}
```

### 42.3 Archivos a refactorizar

| Archivo | Acción mobile |
|---|---|
| `frontend/src/modules/orders/ui/OrdersTable.tsx` | Agregar vista card en mobile |
| `frontend/src/app/(dashboard)/orders/page.tsx` | Idem |
| `frontend/src/app/(dashboard)/invoices/page.tsx` | Idem |
| `frontend/src/app/(dashboard)/admin/users/page.tsx` | Idem |

---

## 43. Empty/Error/Loading states

### 43.1 Estado actual

✅ Skeleton ya existe en `core/ui/Skeleton.tsx`. Sin embargo, faltan componentes `EmptyStateCard` y `ErrorCard` premium.

### 43.2 Componentes propuestos

```tsx
// frontend/src/core/ui/EmptyStateCard.tsx
interface EmptyStateCardProps {
  icon: LucideIcon;
  title: string;
  description: string;
  action?: { label: string; onClick: () => void };
  className?: string;
}

// frontend/src/core/ui/ErrorCard.tsx
interface ErrorCardProps {
  message: string;
  error?: string; // Código de error
  retry?: () => void;
  className?: string;
}

// frontend/src/core/ui/ForbiddenCard.tsx
interface ForbiddenCardProps {
  message?: string;
  className?: string;
}
```

### 43.3 Integración

- `EmptyStateCard` para páginas con listas vacías (casos, órdenes, facturas)
- `ErrorCard` para errores de carga con botón reintentar
- `ForbiddenCard` para acceso denegado por RBAC

---

## 44. Accesibilidad

### 44.1 Checklist WCAG AA

| Requisito | Implementación |
|---|---|
| Contraste 4.5:1 texto, 3:1 grande | Verificar tokens CSS |
| Focus visible | `outline: 2px solid var(--cermont-blue)` + `outline-offset: 2px` |
| Touch targets ≥44px | Toda interacción táctil |
| Labels visibles en inputs | `<label>` con texto visible |
| Icon buttons con aria-label | `aria-label="Cerrar"` |
| Estado no solo por color | Siempre texto + icono + color |
| Navegación teclado | Tab, Enter, Escape en toda interacción |
| Modales con focus trap | Radix UI Dialog ya lo implementa |
| HTML semántico | `<nav>`, `<main>`, `<button>`, `<form>` |
| Reduced motion | `prefers-reduced-motion: reduce` → duración 0.01ms |

### 44.2 Archivos a revisar

| Archivo | Riesgo |
|---|---|
| Todos los `loading.tsx` | Sin focus management al cambiar estado |
| `MobileBottomNav.tsx` | Sin `aria-current="page"` en ítem activo |
| `FloatingActionButton` | Sin `aria-label` |
| `ActionSheet` | Sin focus trap |
| `CommandBar` | Sin `role="dialog"` |
| Botones icono sin texto | Sin `aria-label` |

---

## 45. Animaciones y microinteracciones

### 45.1 Reglas

- Duración: 120–220ms
- Timing: ease-out (entrada), ease-in (salida)
- `prefers-reduced-motion: reduce` → duración 0.01ms (ya implementado en globals.css)
- Sin animaciones decorativas sin propósito
- Framer Motion ya en stack (12.38.0)

### 45.2 Animaciones definidas

| Elemento | Animación | Duración |
|---|---|---|
| Card hover | translateY(-2px) + shadow | 150ms |
| Button press | scale(0.97) | 120ms |
| Bottom nav active | icon scale(1 → 1.1) | 200ms spring |
| FAB idle | pulse scale(1 → 1.05 → 1) | 2000ms loop |
| Progress ring | stroke-dashoffset | 600ms |
| Accordion expand | max-height + opacity | 200ms |
| Skeleton | pulse opacity 0.3 → 0.6 → 0.3 | 1500ms loop |
| Toast | slideY(-20 → 0) | 200ms |
| Modal | fade(0→1) + scale(0.95→1) | 200ms |
| Page transition | fade(0→1) | 150ms |

### 45.3 Archivo propuesto

```txt
frontend/src/core/animation/tokens.ts
frontend/src/core/animation/transitions.ts
```

---

## 46. Performance frontend

### 46.1 Reglas

- Lazy load módulos pesados (dynamic import)
- Sin barrel imports en rutas críticas
- Imágenes optimizadas (Next.js Image component)
- Tablas paginadas (no renderizar 1000+ filas)
- Sin providers globales innecesarios
- Bundle de componentes bajo demanda

### 46.2 Componentes a lazy load

| Componente | Estrategia |
|---|---|
| CommandBar | `next/dynamic` — solo cuando usuario presiona Ctrl+K |
| ActionSheet | `next/dynamic` — solo cuando se abre |
| CockpitTimeline | Cargado con página, sin lazy |
| ProgressRing | Inline (SVG puro, sin dependencias) |

### 46.3 Validación

```bash
npm run build -w frontend
# Verificar tamaños de bundle
npx next build --debug
```

---

## 47. Testing strategy

### 47.1 Tests unitarios (Vitest)

| Componente | Archivo de test | Qué validar |
|---|---|---|
| StatusBadge | `core/ui/__tests__/StatusBadge.test.tsx` | Renderizado con diferentes tones, iconos, estados |
| CategoryBadge | `core/ui/__tests__/CategoryBadge.test.tsx` | Categorías, colores, iconos |
| SegmentControl | `components/common/__tests__/SegmentControl.test.tsx` | Selección, teclado, disabled |
| KpiCard | `components/common/__tests__/KpiCard.test.tsx` | Valores, delta, icono |
| ProgressRing | `core/ui/__tests__/ProgressRing.test.tsx` | Valor 0-100, SVG, animación |
| CompactStepper | `modules/cockpit/ui/__tests__/CompactStepper.test.tsx` | Navegación, pasos |
| CockpitTimeline | `modules/cockpit/ui/__tests__/CockpitTimeline.test.tsx` | Timeline horizontal/vertical |
| ActionSheet | `modules/navigation/ui/__tests__/ActionSheet.test.tsx` | Apertura, cierre, acciones |
| CommandBar | `modules/navigation/ui/__tests__/CommandBar.test.tsx` | Búsqueda, navegación teclado |
| FloatingActionButton | `modules/navigation/ui/__tests__/FloatingActionButton.test.tsx` | Visibilidad, click |

### 47.2 Tests E2E (Playwright)

| Flujo | Archivo | Qué validar |
|---|---|---|
| Cockpit 14 pasos | `frontend/tests/e2e/spec-014/01-cockpit-14-steps.spec.ts` (existente) | Timeline, estados, navegación |
| Dashboard KPIs | `frontend/tests/e2e/spec-014/02-dashboard-kpis.spec.ts` (existente) | Cards, valores |
| Command Bar | `frontend/tests/e2e/command-bar.spec.ts` | Ctrl+K, búsqueda, navegación |
| Mobile navigation | `frontend/tests/e2e/mobile-nav.spec.ts` | Bottom nav, FAB, action sheet |

### 47.3 A11y tests

| Test | Herramienta |
|---|---|
| Contraste de color | axe-core via Playwright |
| Navegación teclado | Playwright keyboard |
| Focus visible | Playwright evaluate |
| Screen reader | axe-core + manual |

---

## 48. Migration strategy

### 48.1 Principios

- **Nunca romper build.** Cada PR debe pasar `typecheck`, `lint`, `test`, `build`.
- **Migración por fases.** No reescribir todo de una vez.
- **Compatibilidad hacia atrás.** Componentes legacy se refactorizan in-place.
- **Feature flags** para componentes nuevos (CommandBar, ActionSheet).

### 48.2 Orden de migración

1. **Fase 0:** Audit, baseline, colores hardcoded críticos
2. **Fase 1:** Tokens CSS (limpiar legacy, agregar faltantes)
3. **Fase 2:** Icon system (Icon wrapper, currentColor)
4. **Fase 3:** Componentes base (StatusBadge unificado, CategoryBadge, ProgressRing)
5. **Fase 4:** CockpitTimeline + CompactStepper
6. **Fase 5:** Dashboard premium
7. **Fase 6-13:** Módulos uno por uno
8. **Fase 14:** CommandBar + ActionSheet
9. **Fase 15:** Hardening + accesibilidad

### 48.3 Estrategia de colores hardcoded

```txt
1. Regla: "bg-emerald-500" → "bg-[--status-success]"
2. Usar codemod o grep + replace controlado
3. Solo en archivos identificados en la auditoría
4. Verificar con typecheck + build después de cada reemplazo
5. No tocar más de 10 archivos por commit
```

---

## 49. Sprint plan

### 49.1 UIX-00: Audit & Baseline

| Aspecto | Detalle |
|---|---|
| Objetivo | Establecer baseline, auditoría completa, git safety |
| Alcance | Frontend build, typecheck, lint, test actual, react doctor |
| Archivos | Ninguno modificado (solo lectura) |
| Tareas | Ejecutar gates actuales, documentar baseline, screenshots mobile/desktop |
| Validaciones | `npm run typecheck -w frontend`, `lint`, `test`, `build`, `verify`, `npx react-doctor@latest` |
| Criterios | Baseline documentado, screenshots guardados, deuda registrada |

### 49.2 UIX-01: Tokens CERMONT

| Aspecto | Detalle |
|---|---|
| Objetivo | Centralizar tokens, eliminar colores prohibidos |
| Archivos | `frontend/src/app/globals.css` |
| Tareas | Renombrar tokens legacy, agregar surface/icon/elevation tokens, unificar con DESIGN.md |
| NO hacer | No modificar componentes aún |
| Validaciones | `typecheck`, `build`, verificar que no aparezcan emerald/lime en grep |
| Riesgo | Alto impacto si se rompen tokens usados por componentes |

### 49.3 UIX-02: Monochrome Icon System

| Aspecto | Detalle |
|---|---|
| Objetivo | Crear Icon wrapper, estandarizar currentColor |
| Archivos | `frontend/src/core/ui/Icon.tsx` (nuevo) |
| Tareas | Crear Icon wrapper con size/tone/strokeWidth, migrar iconos existentes |
| Tests | Unit test para Icon con diferentes variantes |
| Validaciones | `typecheck`, `lint`, `test` |

### 49.4 UIX-03: Premium Shared Components

| Aspecto | Detalle |
|---|---|
| Objetivo | StatusBadge unificado, CategoryBadge, ProgressRing, PremiumCard, EmptyStateCard, ErrorCard |
| Archivos | `frontend/src/core/ui/StatusBadge.tsx`, `ProgressRing.tsx`, `CategoryBadge.tsx`, `PremiumCard.tsx`, `EmptyStateCard.tsx`, `ErrorCard.tsx` |
| Tareas | Refactorizar StatusBadge existente, crear nuevos componentes |
| Tests | Unit tests para cada componente |
| Validaciones | `typecheck`, `lint`, `test`, `build` |

### 49.5 UIX-04: Mobile Cockpit 14 Steps

| Aspecto | Detalle |
|---|---|
| Objetivo | CockpitTimeline, CompactStepper, PhaseBadge |
| Archivos | `modules/cockpit/ui/CockpitTimeline.tsx`, `CompactStepper.tsx`, `PhaseBadge.tsx` |
| Tareas | Timeline horizontal desktop, vertical colapsable mobile, integración con datos reales |
| Tests | Unit + E2E cockpit |
| Validaciones | `typecheck`, `lint`, `test`, `build`, screenshots |

### 49.6 UIX-05: Dashboard Premium

| Aspecto | Detalle |
|---|---|
| Objetivo | Hero operativo, KPIs con delta, alertas, bloqueos |
| Archivos | `modules/dashboard/ui/DashboardHero.tsx`, mejora `DashboardCommandCenter.tsx` |
| Tareas | Hero con métricas, KPIs premium, panel de bloqueos |
| Validaciones | `typecheck`, `lint`, `test`, `build` |

### 49.7 UIX-06: Planning Premium

| Aspecto | Detalle |
|---|---|
| Objetivo | PlanningReadinessGate sin colores hardcode, badges semánticos |
| Archivos | `modules/planning/ui/PlanningReadinessGate.tsx` |
| Tareas | Reemplazar green/red hardcode con tokens, skeleton states |
| Validaciones | `typecheck`, `lint`, `test` |

### 49.8 UIX-07: Forms/Checklists Premium

| Aspecto | Detalle |
|---|---|
| Objetivo | ChecklistPanel sin emerald hardcode, SegmentControl premium |
| Archivos | `modules/checklists/components/ChecklistPanel.tsx`, `SummaryCard.tsx`, `CompletedChecklistBlock.tsx`, `components/common/SegmentControl.tsx` |
| Tareas | Reemplazar emerald/green hardcode, mejorar SegmentControl con iconos |
| Validaciones | `typecheck`, `lint`, `test` |

### 49.9 UIX-08: Evidence Experience

| Aspecto | Detalle |
|---|---|
| Objetivo | Galería premium, EvidenceStatusBadge unificado |
| Archivos | `modules/evidences/ui/EvidenceStatusBadge.tsx`, `EvidenceGallerySection.tsx` |
| Tareas | Refactorizar badge, mejorar galería |
| Validaciones | `typecheck`, `lint`, `test` |

### 49.10 UIX-09: Reports/Delivery

| Aspecto | Detalle |
|---|---|
| Objetivo | ReportStatusBadge unificado, DeliveryRecord premium |
| Archivos | `modules/reports/ui/ReportStatusBadge.tsx`, `ReportPanel.tsx` |
| Tareas | Refactorizar badge, mejorar cards |
| Validaciones | `typecheck`, `lint`, `test` |

### 49.11 UIX-10: Financial Closure

| Aspecto | Detalle |
|---|---|
| Objetivo | InvoiceStatusBadge unificado, pipeline financiero premium |
| Archivos | `modules/invoices/ui/InvoiceStatusBadge.tsx`, `InvoicePipelinePage.tsx` |
| Tareas | Refactorizar badge, pipeline premium |
| Validaciones | `typecheck`, `lint`, `test` |

### 49.12 UIX-11: Fleet/Resources

| Aspecto | Detalle |
|---|---|
| Objetivo | Fleet cards premium, availability badges |
| Archivos | `modules/fleet/ui/VehicleAssignmentPanel.tsx` |
| Tareas | Cards premium, badges unificados |
| Validaciones | `typecheck`, `lint`, `test` |

### 49.13 UIX-12: Portal Cliente

| Aspecto | Detalle |
|---|---|
| Objetivo | Portal sin colores hardcode, badges unificados |
| Archivos | `modules/portal/ui/PortalServiceCaseList.tsx`, `app/(portal)/portal/page.tsx` |
| Tareas | Reemplazar green/yellow hardcode con tokens |
| Validaciones | `typecheck`, `lint`, `test` |

### 49.14 UIX-13: Command Bar + Action Sheet

| Aspecto | Detalle |
|---|---|
| Objetivo | CommandBar global (Ctrl+K), ActionSheet contextual mobile |
| Archivos | `modules/navigation/ui/CommandBar.tsx`, `ActionSheet.tsx`, `FloatingActionButton.tsx` |
| Tareas | CommandBar con búsqueda, ActionSheet con animación, FAB controlado |
| Tests | Unit + E2E |
| Validaciones | `typecheck`, `lint`, `test`, `build` |

### 49.15 UIX-14: Runtime Review + Screenshots

| Aspecto | Detalle |
|---|---|
| Objetivo | Capturar screenshots mobile/desktop, verificar runtime |
| Tareas | Frontend build, dev server, screenshots de todas las páginas |
| Validaciones | `npm run dev`, playwright screenshot, verificar visual |

### 49.16 UIX-15: Hardening + Accessibility

| Aspecto | Detalle |
|---|---|
| Objetivo | WCAG AA compliance, reduced motion, focus management |
| Tareas | Auditoría a11y, corregir focus, aria labels, contraste |
| Tests | axe-core en páginas críticas |
| Validaciones | `npx react-doctor@latest`, `npm run verify` |

---

## 50. Acceptance criteria

### 50.1 Criterios globales

- [ ] Typecheck pasa en frontend sin errores
- [ ] Lint pasa sin warnings
- [ ] Tests unitarios existentes + nuevos pasan
- [ ] Build exitoso
- [ ] `npm run verify` exitoso
- [ ] `npx react-doctor@latest` sin issues
- [ ] No hay colores hardcoded emerald/lime/neon
- [ ] Todos los iconos son currentColor
- [ ] StatusBadge unificado usado en todos los módulos
- [ ] Cockpit 14 pasos funcional en mobile y desktop
- [ ] CommandBar abre con Ctrl+K
- [ ] ActionSheet funcional en mobile
- [ ] Skeleton screens en todas las páginas con datos
- [ ] Touch targets ≥44px en mobile
- [ ] Modo oscuro y claro funcionales

---

## 51. Evidence strategy

### 51.1 Por sprint

Cada sprint debe generar:

```txt
.sisyphus/evidence/uiux-sprint-XX/
├── git-safety/
│   ├── git-status-before.txt
│   ├── git-status-after.txt
│   └── git-safety-report.md
├── typecheck-result.txt
├── lint-result.txt
├── test-result.txt
├── build-result.txt
├── implementation-report.md
├── screenshots/
│   ├── mobile-before.png
│   ├── mobile-after.png
│   ├── desktop-before.png
│   └── desktop-after.png
└── validation-results.md
```

### 51.2 Evidencia acumulada

```txt
.sisyphus/evidence/planning-ui-ux-premium/
├── git-safety/
│   ├── git-status-before.txt
│   ├── git-branch.txt
│   ├── git-head.txt
│   ├── git-modified-files-before.txt
│   ├── git-staged-files-before.txt
│   ├── git-untracked-files-before.txt
│   └── git-safety-report.md
├── ui-ux-audit-summary.md
├── implementation-planning-report.md
├── color-hardcoding-audit.txt
├── iconography-audit.txt
├── component-audit.txt
├── fourteen-step-audit.txt
└── responsive-audit.txt
```

---

## 52. Riesgos

### 52.1 Riesgos técnicos

| Riesgo | Probabilidad | Impacto | Mitigación |
|---|---|---|---|
| Romper build frontend al cambiar tokens | Media | Alto | Cambios incrementales, validar después de cada cambio |
| Duplicar componentes en lugar de refactorizar | Alta | Medio | Audit de componentes existentes antes de crear nuevos |
| Cambiar colores sin confirmar logo oficial | Media | Alto | Verificar logo CERMONT impreso antes de cambios definitivos |
| Tocar demasiados módulos a la vez | Alta | Alto | Migración por fases, 1-2 módulos por sprint |
| No verificar mobile real (solo emulador) | Media | Medio | Playwright en viewport 375px + pruebas en dispositivo real |
| Snapshots frágiles de tests | Media | Bajo | Usar testing-library queries semánticas, no snapshots visuales |
| No pasar quality:semantics | Baja | Alto | Ejecutar `npm run verify` antes de cada commit |
| Service worker build worker | Baja | Medio | Verificar que build PWA no se rompa al modificar estilos |

### 52.2 Riesgos de diseño

| Riesgo | Impacto | Mitigación |
|---|---|---|
| Perder identidad CERMONT por cambios excesivos | Alto | Mantener CERMONT Blue como acento principal |
| UI demasiado oscura sin contraste suficiente | Medio | Verificar WCAG AA contraste 4.5:1 |
| Animaciones excesivas que distraen | Medio | Respetar prefers-reduced-motion |
| Cards demasiado grandes que desperdician espacio | Medio | Balance entre premium y densidad de información |

---

## 53. Roadmap UI/UX

### 53.1 Timeline estimado

```txt
Semana 1:  UIX-00 (Audit) + UIX-01 (Tokens)
Semana 2:  UIX-02 (Icons) + UIX-03 (Components)
Semana 3:  UIX-04 (Cockpit) + UIX-05 (Dashboard)
Semana 4:  UIX-06 (Planning) + UIX-07 (Forms)
Semana 5:  UIX-08 (Evidences) + UIX-09 (Reports)
Semana 6:  UIX-10 (Financial) + UIX-11 (Fleet)
Semana 7:  UIX-12 (Portal) + UIX-13 (CommandBar)
Semana 8:  UIX-14 (Screenshots) + UIX-15 (Hardening)
```

### 53.2 Dependencias entre sprints

```
UIX-00 ──→ UIX-01 ──→ UIX-02 ──→ UIX-03 ──→ UIX-04 ──→ UIX-05
                                                │
                                                ├──→ UIX-06
                                                ├──→ UIX-07
                                                ├──→ UIX-08
                                                ├──→ UIX-09
                                                ├──→ UIX-10
                                                ├──→ UIX-11
                                                └──→ UIX-12
                                                      │
                                                      └──→ UIX-13
                                                              │
                                                              └──→ UIX-14 ──→ UIX-15
```

UIX-00 a UIX-03 son prerequisitos. UIX-04 (Cockpit) es el más crítico y debe completarse antes que los módulos específicos (UIX-06 a UIX-12), que pueden ejecutarse en paralelo.

---

## 54. Checklist final

### 54.1 Checklist de completitud del plan

- [x] ~4000 líneas de plan detallado
- [x] Escrito en español técnico claro
- [x] Orientado a implementación real con archivos y componentes
- [x] Incluye 16 sprints (UIX-00 a UIX-15)
- [x] Incluye matrices (transformación, colores, componentes, mobile/desktop, deuda visual)
- [x] Incluye rutas probables de archivos
- [x] Incluye reglas anti UI genérica
- [x] Incluye estrategia de iconos monocromáticos
- [x] Incluye tokens CERMONT
- [x] Incluye rediseño del Cockpit de 14 pasos
- [x] Incluye mobile-first
- [x] Incluye desktop enterprise
- [x] Incluye Command Bar global (Ctrl+K)
- [x] Incluye Action Sheet contextual
- [x] Incluye Skeleton Screens
- [x] Incluye tests y validaciones
- [x] Incluye riesgos documentados
- [x] No incluye comandos Git destructivos
- [x] No propone modificar backend innecesariamente
- [x] No propone verde lima/neón

### 54.2 Checklist de implementación por sprint

Cada sprint debe pasar:

- [ ] `npm run typecheck -w frontend` — 0 errores
- [ ] `npm run lint -w frontend` — 0 errores
- [ ] `npm run test -w frontend` — tests pasan
- [ ] `npm run build -w frontend` — build exitoso
- [ ] `npm run verify` — verify exitoso (o pre-existing failures documentados)
- [ ] Sin colores hardcoded emerald/lime/neon en archivos modificados
- [ ] Sin `any` en código nuevo
- [ ] Sin `console.log` en producción
- [ ] Evidencia guardada en `.sisyphus/evidence/uiux-sprint-XX/`

---

## 55. Matrices obligatorias

### 55.1 Matriz de transformación UI

| Elemento actual | Problema | Corrección propuesta | Componente afectado | Archivo probable | Impacto UX | Prioridad | Sprint |
|---|---|---|---|---|---|---|---|
| Iconos multicolor | Rompe consistencia visual | Icon wrapper con currentColor | Icon en todos los módulos | `core/ui/Icon.tsx` (nuevo) | Alto | P0 | UIX-02 |
| bg-emerald-500 en checklists | Viola tokens semánticos | Reemplazar con `--status-success` | ChecklistPanel | `modules/checklists/components/ChecklistPanel.tsx` | Alto | P0 | UIX-07 |
| text-green-600/700/800 en planning | Viola tokens | Reemplazar con tokens | PlanningReadinessGate | `modules/planning/ui/PlanningReadinessGate.tsx` | Alto | P0 | UIX-06 |
| FAB sin control | Interfiere bottom nav | FAB controlado con ActionSheet | Múltiples | `modules/navigation/ui/FloatingActionButton.tsx` | Medio | P1 | UIX-13 |
| Timeline 14 pasos inline | No reutilizable | CockpitTimeline componente | ServiceCaseWorkflowCockpit | `modules/cockpit/ui/CockpitTimeline.tsx` | Alto | P0 | UIX-04 |
| Cards genéricas sin elevación | Se ven planas | PremiumCard con elevation | Todos los módulos | `core/ui/PremiumCard.tsx` | Medio | P1 | UIX-03 |
| 6 badges duplicados | Código redundante | StatusBadge unificado | Evidences, Invoices, Reports, Proposals, Execution | `core/ui/StatusBadge.tsx` | Medio | P0 | UIX-03 |
| Sin CommandBar | Navegación lenta | Ctrl+K global | Layout | `modules/navigation/ui/CommandBar.tsx` | Medio | P1 | UIX-13 |
| Sin ActionSheet mobile | Acciones sin contexto | Sheet contextual | Múltiples | `modules/navigation/ui/ActionSheet.tsx` | Alto | P1 | UIX-13 |
| Sin ProgressRing | Progreso solo con barras | ProgressRing SVG | Cockpit, KPIs | `core/ui/ProgressRing.tsx` | Medio | P1 | UIX-03 |
| bg-black en dark mode cards | Sin profundidad | Surface tokens | Múltiples | Varios | Medio | P1 | UIX-01 |
| Tablas como vista mobile principal | Mala UX mobile | Cards en mobile | Orders, Invoices, Users | Varios | Alto | P1 | UIX-04+ |

### 55.2 Matriz de colores

| Uso | Token | Light | Dark | Permitido para | Prohibido para |
|---|---|---|---|---|---|
| Brand primary | `--cermont-blue` | #2154A6 | #3A78D8 | CTAs, enlaces, acento activo | Fondos grandes, textos largos |
| Brand secondary | `--cermont-green` | #4CAF50 | #4ADE80 | Éxito, cumplimiento, SLA | Decoración, branding primario |
| Canvas bg | `--bg-canvas` | #F8FAFC | #121212 | Fondo página | Cards, secciones |
| Surface | `--bg-surface` | #FFFFFF | #1A1A1A | Cards, secciones | Fondo página |
| Elevated | `--bg-surface-elevated` | #F1F5F9 | #242424 | Hover cards, dropdowns | Fondo página |
| Deep | `--bg-canvas-deep` | #FFFFFF | #0A0A0A | Sidebar, modal, drawer | Cards |
| Text primary | `--text-primary` | #0F172A | #F5F5F5 | Títulos, cuerpo | Muted, disabled |
| Text secondary | `--text-secondary` | #475569 | #A0A0A0 | Subtítulos, metadata | Títulos principales |
| Text muted | `--text-muted` | #94A3B8 | #606060 | Placeholder, disabled | Información importante |
| Success | `--status-success` | #4CAF50 | #4ADE80 | Badges, iconos éxito | Decoración |
| Warning | `--status-warning` | #F59E0B | #FBBF24 | Badges advertencia | Éxito |
| Danger | `--status-danger` | #DC2626 | #EF4444 | Badges error, bloqueos | Warning menor |
| Info | `--status-info` | #3A78D8 | #60A5FA | Badges info, progreso | Estados críticos |
| Neutral | `--status-neutral` | #64748B | #808080 | Badges inactivos | Estados activos |

### 55.3 Matriz de componentes

| Componente | Global/Módulo | Responsabilidad | Props principales | Estados | Tests | Módulos consumidores |
|---|---|---|---|---|---|---|
| StatusBadge | Global | Badge de estado semántico | status, tone, icon, size | Completado, Pendiente, Bloqueado, En progreso, Draft | Unit + A11y | Todos los módulos |
| CategoryBadge | Global | Badge de categoría | category, variant, icon, size | Checklist, Evidence, Document, Phase | Unit | Checklists, Evidences, Documents |
| SegmentControl | Global | Control segmentado (C/NC/NA) | options, value, onChange, disabled | Seleccionado, No seleccionado, Disabled | Unit + Keyboard | Forms, Checklists |
| KpiCard | Global | Card de KPI con métrica | icon, label, value, delta, progress | Loading, Error, Empty | Unit | Dashboard, Execution |
| ProgressRing | Global | Anillo de progreso circular | value, size, tone, showLabel | 0-100%, Animación | Unit | Cockpit, KpiCard, Planning |
| PremiumCard | Global | Card base premium | icon, title, subtitle, children, onClick | Default, Hover, Active | Unit | Todos los módulos |
| EmptyStateCard | Global | Estado vacío | icon, title, description, action | Empty | Unit | Todas las páginas con listas |
| ErrorCard | Global | Estado de error | message, error, retry | Error | Unit | Todas las páginas con datos |
| CockpitTimeline | Módulo | Timeline 14 pasos responsive | steps, currentStep, onStepClick, variant | Loading, Empty, Paso actual, Bloqueado | Unit + E2E | Cockpit, Orders |
| CompactStepper | Módulo | Stepper compacto mobile | steps, current, total | Default, Animación | Unit | Cockpit |
| CommandBar | Módulo | Barra de comandos global | open, onClose, items | Abierto, Cerrado, Buscando, Resultados | Unit + A11y | DefaultLayout |
| ActionSheet | Módulo | Sheet contextual mobile | open, onClose, children | Abierto, Cerrado | Unit + A11y | Cockpit, FAB |
| FloatingActionButton | Módulo | FAB controlado | icon, onClick, visible | Idle (pulse), Open, Hidden | Unit | DefaultLayout |
| BottomNav | Módulo | Navegación inferior mobile | items, activeItem, onNavigate | Default, Active, Disabled | Unit + A11y | DefaultLayout |

### 55.4 Matriz mobile/desktop

| Módulo | Mobile pattern | Desktop pattern | Riesgo actual | Corrección |
|---|---|---|---|---|
| Cockpit 14 pasos | Timeline vertical colapsable por fase | Timeline horizontal por fase | Scroll excesivo, pasos no colapsables | CompactStepper + PhaseBadge |
| Dashboard | Stack vertical hero + KPIs + gráficos | Grid 12 columnas + panel derecho | Sin hero narrativo | DashboardHero + KpiCard premium |
| Forms/Checklists | Full screen colapsable, cámara inline | Split checklist + preview | Colores hardcode, sin progreso visual | SectionedFormRenderer premium |
| Evidences | Grid 3-4 columnas, cámara nativa | Grid expandido + lightbox | Sin gallery premium | EvidenceGallery premium |
| Orders list | Cards verticales con swipe actions | Tabla densa con filtros | Tabla en mobile | Orders cards |
| Invoices list | Cards con badge de estado | Tabla con aging + filtros | Tabla densa en mobile | Invoice cards |
| Planning | Secciones colapsables | Drawer lateral con tabs | Readiness con colores hardcode | PlanningReadiness premium |
| Admin/RBAC | Cards editables | Tablas densas + modales | Tabla en mobile | Admin cards |
| Portal Cliente | Cards grandes, CTA visibles | Dashboard simple | Badges inline con hardcode | StatusBadge unificado |
| Fleet | Cards con acciones rápidas | Split lista + detalle | Sin premium design | FleetCard premium |

### 55.5 Matriz de deuda visual

| Deuda visual | Archivo probable | Severidad | Esfuerzo | Riesgo | Sprint recomendado |
|---|---|---|---|---|---|
| `bg-emerald-*` hardcode en checklists | `modules/checklists/components/ChecklistPanel.tsx` | 🔴 Alta | 2h | Bajo | UIX-07 |
| `text-green-*` hardcode en planning | `modules/planning/ui/PlanningReadinessGate.tsx` | 🔴 Alta | 1h | Bajo | UIX-06 |
| `bg-emerald-*` en órdenes/planning | `app/(dashboard)/orders/[id]/planning/page.tsx` | 🔴 Alta | 3h | Bajo | UIX-04 |
| `bg-purple-*` en forms | `modules/forms/ui/SectionedFormRenderer.tsx` | 🔴 Alta | 30m | Bajo | UIX-07 |
| `bg-green-*` en portal | `modules/portal/ui/PortalServiceCaseList.tsx` | 🔴 Alta | 30m | Bajo | UIX-12 |
| 6 badges duplicados | Múltiples archivos de badge | 🟡 Media | 4h | Medio | UIX-03 |
| FAB sin control | Evidencias, documentos | 🟡 Media | 2h | Bajo | UIX-13 |
| Iconos sin currentColor | Múltiples archivos | 🟡 Media | 6h | Medio | UIX-02 |
| Sin CommandBar | No existe | 🟡 Media | 8h | Bajo | UIX-13 |
| Sin ActionSheet | No existe | 🟡 Media | 4h | Bajo | UIX-13 |
| Sin ProgressRing | No existe | 🟢 Baja | 2h | Bajo | UIX-03 |
| Tokens CSS legacy | `globals.css` | 🟡 Media | 2h | Alto | UIX-01 |
| `bg-black` en dark mode cards | Múltiples componentes | 🟡 Media | 3h | Medio | UIX-01 |
| Tablas en mobile | Orders, Invoices, Users | 🟡 Media | 8h | Medio | UIX-04+ |

---

## Apéndice A: Alineación con el flujo operativo de 14 pasos

El rediseño UI/UX propuesto se alinea directamente con el flujo operativo de 14 pasos:

| Paso | Soporte UI/UX | Componente clave |
|---|---|---|
| 1. Solicitud | Work request form premium, status badges | StatusBadge, PremiumCard |
| 2. Visita | Site visit cards, timeline step | CockpitTimeline |
| 3. Propuesta | Proposal status badge, proposal cards | StatusBadge, ProposalStatusBadge wrapper |
| 4. PO | Purchase order cards, approval flow | StatusBadge, CockpitTimeline |
| 5. Planeación | Readiness gate premium, AST/PTW cards | ProgressRing, PlanningReadinessGate premium |
| 6. Ejecución | Execution session, timer, checklist | SegmentControl, CompactStepper |
| 7. Evidencias | Gallery premium, camera capture, metadata | EvidenceStatusBadge, EvidenceGallery |
| 8. Informe | Technical report draft, PDF preview | ReportStatusBadge, PDFExportButton |
| 9. Acta | Delivery record, signature pad | DigitalSignaturePad, StatusBadge |
| 10. Firma | Signature capture, document status | ActionSheet, StatusBadge |
| 11. SES | Service entry sheet, approval flow | InvoiceStatusBadge, PipelinePage |
| 12. Factura | Invoice list, detail, payment tracking | InvoiceStatusBadge, AgingDashboard |
| 13. Aprobación | Approval flow, status timeline | CockpitTimeline, StatusBadge |
| 14. Pago | Payment record, reconciliation | PaymentRecordCard, StatusBadge |

## 56. Guía detallada de migración por archivo

### 56.1 Patrón de migración para colores hardcoded

```ts
// ANTES (hardcode) — no usar
className="bg-emerald-100 text-brand-annotate dark:bg-emerald-900/30"
className="text-green-600 font-semibold"
className="bg-purple-50 text-purple-600"
className="border-emerald-200 bg-emerald-50"
className="bg-yellow-100 text-brand-warn"

// DESPUÉS (tokens semánticos)
className="bg-[var(--status-success)]/15 text-[var(--status-success)]"
className="text-[var(--status-success)] font-semibold"
className="bg-[var(--status-info)]/15 text-[var(--status-info)]"
className="border-[var(--status-success)]/20 bg-[var(--status-success)]/10"
className="bg-[var(--status-warning)]/15 text-[var(--status-warning)]"
```

### 56.2 Mapa de reemplazo por archivo y línea

| Archivo | Patrón antiguo | Reemplazo | Líneas afectadas |
|---|---|---|---|
| `frontend/src/modules/checklists/components/ChecklistPanel.tsx` | `bg-emerald-500` | `bg-[var(--status-success)]` | 368, 458, 467, 562 |
| `frontend/src/modules/checklists/components/CompletedChecklistBlock.tsx` | `border-emerald-200` | `border-[var(--status-success)]/20` | 10, 28, 44, 50 |
| `frontend/src/modules/checklists/components/SummaryCard.tsx` | `border-emerald-200` | `border-[var(--status-success)]/20` | 9 |
| `frontend/src/modules/planning/ui/PlanningReadinessGate.tsx` | `text-green-600/700/800` | `text-[var(--status-success)]` | 107-131, 173-181 |
| `frontend/src/modules/forms/ui/SectionedFormRenderer.tsx` | `bg-purple-50 text-purple-600` | `bg-[var(--status-info)]/15 text-[var(--status-info)]` | 392 |
| `frontend/src/app/(portal)/portal/page.tsx` | `bg-yellow-100 text-brand-warn` | `bg-[var(--status-warning)]/15 text-[var(--status-warning)]` | 177 |
| `frontend/src/app/(portal)/portal/invoices/page.tsx` | `bg-yellow-100 text-brand-warn` | `bg-[var(--status-warning)]/15 text-[var(--status-warning)]` | 84 |
| `frontend/src/modules/portal/ui/PortalServiceCaseList.tsx` | `bg-green-100 text-green-700` | `bg-[var(--status-success)]/15 text-[var(--status-success)]` | 19 |
| `frontend/src/app/(dashboard)/orders/[id]/planning/page.tsx` | `bg-emerald-100/600` | `bg-[var(--status-success)]/15` | 604, 629, 775, 794, 862, 939 |
| `frontend/src/app/(dashboard)/dispatch/page.tsx` | `bg-emerald-100` | `bg-[var(--status-success)]/15` | 244 |
| `frontend/src/app/(dashboard)/execution/page.tsx` | `bg-emerald-50` | `bg-[var(--status-success)]/10` | 57 |
| `frontend/src/modules/kits/ui/KitDetailHero.tsx` | `bg-emerald-400/15` | `bg-[var(--status-success)]/15` | 48, 68, 117 |
| `frontend/src/modules/documents/ui/DocumentGallery.tsx` | `bg-emerald-100` | `bg-[var(--status-success)]/15` | 266, 300, 311, 385 |
| `frontend/src/modules/orders/ui/InvoicePageClient.tsx` | `bg-emerald-100` | `bg-[var(--status-success)]/15` | 68 |
| `frontend/src/modules/sync/NetworkStatusChip.tsx` | `bg-emerald-500/10` | `bg-[var(--status-success)]/15` | 28 |
| `frontend/src/modules/files/ui/OfflineUploadQueueStatus.tsx` | `border-emerald-200` | `border-[var(--status-success)]/20` | 95, 125 |
| `frontend/src/modules/orders/ui/detail/order-administrative-workflow.ts` | `border-green-200` | `border-[var(--status-success)]/20` | 88 |
| `frontend/src/modules/auth/ui/ResetPasswordContent.tsx` | `border-emerald-500/20` | `border-[var(--status-success)]/20` | 66, 88 |
| `frontend/src/modules/auth/ui/ForgotPasswordContent.tsx` | `border-emerald-500/20` | `border-[var(--status-success)]/20` | 41, 66 |
| `frontend/src/modules/audit/ui/AuditLogViewer.tsx` | `bg-emerald-500` | `bg-[var(--status-success)]` | 105 |
| `frontend/src/app/(dashboard)/orders/kanban/kanban-constants.ts` | `bg-warning-bg/50 border-yellow-100` | `bg-[var(--status-warning)]/15 border-[var(--status-warning)]/20` | 42 |
| `frontend/src/app/(dashboard)/orders/kanban/page.tsx` | `border-red-200 bg-danger-bg` | `border-[var(--status-danger)]/20 bg-[var(--status-danger)]/15` | 251 |
| `frontend/src/app/(dashboard)/tools/page.tsx` | `bg-red-50 text-red-700` | `bg-[var(--status-danger)]/15 text-[var(--status-danger)]` | 183 |

### 56.3 Migración de variante dark

```tsx
// ANTES
dark:bg-emerald-900/30 dark:text-brand-annotate dark:border-emerald-900/40
dark:bg-red-900/20 dark:text-brand-error
dark:bg-zinc-950

// DESPUÉS
dark:bg-[var(--status-success)]/10 dark:text-[var(--status-success)]
dark:bg-[var(--status-danger)]/10 dark:text-[var(--status-danger)]
dark:bg-[var(--bg-surface)]
```

## 57. Guía detallada de integración de CommandBar

### 57.1 Provider y trigger

```tsx
// frontend/src/providers/CommandBarProvider.tsx
"use client";
import { createContext, useContext, useCallback, useState } from "react";

interface CommandBarContext {
  isOpen: boolean;
  open: () => void;
  close: () => void;
  toggle: () => void;
  registerAction: (action: CommandAction) => void;
}

// El provider se monta en app/layout.tsx
```

### 57.2 Keyboard shortcut

```tsx
// Hook: frontend/src/modules/navigation/hooks/useCommandBarShortcut.ts
useEffect(() => {
  const handler = (e: KeyboardEvent) => {
    if ((e.metaKey || e.ctrlKey) && e.key === "k") {
      e.preventDefault();
      toggle();
    }
  };
  document.addEventListener("keydown", handler);
  return () => document.removeEventListener("keydown", handler);
}, [toggle]);
```

### 57.3 Ítems de búsqueda

```ts
interface CommandAction {
  id: string;
  label: string;
  description?: string;
  icon: LucideIcon;
  keywords: string[];
  onSelect: () => void;
  category?: "navigation" | "action" | "case" | "recent";
}
```

### 57.4 Integración con router

```tsx
// Las acciones de navegación se registran automáticamente desde la sidebar config
const navigationActions: CommandAction[] = ROUTES.map(route => ({
  id: route.path,
  label: route.label,
  icon: route.icon,
  keywords: [route.label, route.path, ...(route.aliases ?? [])],
  category: "navigation",
  onSelect: () => router.push(route.path),
}));
```

## 58. Guía detallada de ActionSheet

### 58.1 Componente base

```tsx
// frontend/src/modules/navigation/ui/ActionSheet.tsx
"use client";

import { useEffect, useRef } from "react";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";

interface ActionSheetProps {
  open: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
}

export function ActionSheet({ open, onClose, title, children }: ActionSheetProps) {
  const sheetRef = useRef<HTMLDivElement>(null);

  // Focus trap
  useEffect(() => {
    if (!open) return;
    const firstFocusable = sheetRef.current?.querySelector<HTMLElement>("button, [tabindex]:not([tabindex='-1'])");
    firstFocusable?.focus();
  }, [open]);

  // Escape key
  useEffect(() => {
    if (!open) return;
    const handler = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center bg-black/60"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-label={title ?? "Acciones"}
    >
      <div
        ref={sheetRef}
        className="w-full max-w-lg animate-slide-up rounded-t-2xl bg-[var(--bg-surface)] p-4 shadow-xl"
        onClick={(e) => e.stopPropagation()}
        style={{ animation: "slideUp 200ms ease-out" }}
      >
        {/* Handle */}
        <div className="mx-auto mb-4 h-1 w-10 rounded-full bg-[var(--border-strong)]" />

        {/* Title */}
        {title && (
          <div className="mb-4 flex items-center justify-between">
            <h3 className="text-[var(--text-primary)] text-h4">{title}</h3>
            <button onClick={onClose} aria-label="Cerrar" className="touch-target p-2">
              <X size={20} strokeWidth={1.5} />
            </button>
          </div>
        )}

        {/* Items */}
        <div className="space-y-1">{children}</div>
      </div>
    </div>
  );
}
```

### 58.2 ActionSheetItem

```tsx
// frontend/src/modules/navigation/ui/ActionSheetItem.tsx
interface ActionSheetItemProps {
  icon: LucideIcon;
  label: string;
  description?: string;
  tone?: "default" | "danger" | "success";
  onSelect: () => void;
  disabled?: boolean;
}

export function ActionSheetItem({ icon: Icon, label, description, tone = "default", onSelect, disabled }: ActionSheetItemProps) {
  return (
    <button
      onClick={onSelect}
      disabled={disabled}
      className={cn(
        "flex w-full items-center gap-3 rounded-xl px-4 py-3 text-left transition-colors",
        "hover:bg-[var(--bg-surface-elevated)] focus-visible:outline-2 focus-visible:outline-[var(--cermont-blue)]",
        "disabled:opacity-50 disabled:cursor-not-allowed",
        tone === "danger" && "text-[var(--status-danger)]",
        tone === "success" && "text-[var(--status-success)]",
        tone === "default" && "text-[var(--text-primary)]"
      )}
      role="menuitem"
    >
      <Icon size={20} strokeWidth={1.5} aria-hidden="true" />
      <div className="flex-1">
        <div className="text-sm font-medium">{label}</div>
        {description && <div className="text-xs text-[var(--text-muted)]">{description}</div>}
      </div>
    </button>
  );
}
```

## 59. Guía detallada de ProgressRing

```tsx
// frontend/src/core/ui/ProgressRing.tsx

interface ProgressRingProps {
  value: number; // 0-100
  size?: "sm" | "md" | "lg";
  tone?: "success" | "warning" | "danger" | "info" | "neutral";
  showLabel?: boolean;
  label?: string;
  className?: string;
}

const SIZE_MAP = { sm: 48, md: 64, lg: 80 };
const STROKE_WIDTH = 4;
const TONE_COLOR_MAP = {
  success: "var(--status-success)",
  warning: "var(--status-warning)",
  danger: "var(--status-danger)",
  info: "var(--status-info)",
  neutral: "var(--status-neutral)",
};

export function ProgressRing({ value, size = "md", tone = "info", showLabel = true, label, className }: ProgressRingProps) {
  const dimension = SIZE_MAP[size];
  const radius = (dimension - STROKE_WIDTH) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (Math.min(Math.max(value, 0), 100) / 100) * circumference;
  const color = TONE_COLOR_MAP[tone];

  return (
    <div className={cn("relative inline-flex items-center justify-center", className)} role="progressbar" aria-valuenow={value} aria-valuemin={0} aria-valuemax={100} aria-label={label ?? `Progreso ${value}%`}>
      <svg width={dimension} height={dimension} className="-rotate-90">
        {/* Track */}
        <circle cx={dimension / 2} cy={dimension / 2} r={radius} fill="none" stroke="var(--border-default)" strokeWidth={STROKE_WIDTH} />
        {/* Progress */}
        <circle
          cx={dimension / 2} cy={dimension / 2} r={radius}
          fill="none" stroke={color} strokeWidth={STROKE_WIDTH}
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
          style={{ transition: "stroke-dashoffset 600ms ease-out" }}
        />
      </svg>
      {showLabel && (
        <span className="absolute text-center" style={{ fontSize: size === "lg" ? "24px" : size === "md" ? "18px" : "14px", fontWeight: 700, color: "var(--text-primary)" }}>
          {label ?? `${Math.round(value)}%`}
        </span>
      )}
    </div>
  );
}
```

## 60. Guía detallada de PremiumCard

```tsx
// frontend/src/core/ui/PremiumCard.tsx

interface PremiumCardProps {
  icon?: LucideIcon;
  iconTone?: "default" | "success" | "warning" | "danger" | "info" | "neutral";
  title: string;
  subtitle?: string;
  badge?: React.ReactNode;
  progress?: { value: number; tone?: "success" | "warning" | "danger" | "info" };
  children?: React.ReactNode;
  onClick?: () => void;
  className?: string;
  variant?: "default" | "interactive" | "compact";
}

export function PremiumCard({
  icon: Icon, iconTone = "default", title, subtitle, badge, progress, children, onClick, className, variant = "default",
}: PremiumCardProps) {
  const isInteractive = !!onClick || variant === "interactive";
  const IconToneMap = {
    default: "text-[var(--icon-default)]",
    success: "text-[var(--status-success)]",
    warning: "text-[var(--status-warning)]",
    danger: "text-[var(--status-danger)]",
    info: "text-[var(--status-info)]",
    neutral: "text-[var(--status-neutral)]",
  };

  return (
    <div
      className={cn(
        "rounded-[var(--radius-xl)] border border-[var(--border-default)] bg-[var(--bg-surface)] p-5",
        "transition-all duration-150",
        isInteractive && "cursor-pointer hover:bg-[var(--bg-surface-elevated)] hover:-translate-y-0.5",
        variant === "compact" && "p-4",
        className
      )}
      onClick={onClick}
      role={isInteractive ? "button" : undefined}
      tabIndex={isInteractive ? 0 : undefined}
      onKeyDown={isInteractive ? (e) => { if (e.key === "Enter" || e.key === " ") onClick?.(); } : undefined}
    >
      <div className="flex items-start gap-4">
        {Icon && (
          <div className={cn(
            "flex size-10 items-center justify-center rounded-full bg-[var(--bg-surface-elevated)]",
            IconToneMap[iconTone]
          )}>
            <Icon size={20} strokeWidth={1.5} aria-hidden="true" />
          </div>
        )}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <h3 className="text-sm font-semibold text-[var(--text-primary)] truncate">{title}</h3>
            {badge && <span className="shrink-0">{badge}</span>}
          </div>
          {subtitle && <p className="mt-0.5 text-xs text-[var(--text-secondary)]">{subtitle}</p>}
          {progress && (
            <div className="mt-3">
              <div className="h-1.5 rounded-full bg-[var(--border-default)] overflow-hidden">
                <div
                  className="h-full rounded-full transition-all duration-500"
                  style={{
                    width: `${Math.min(Math.max(progress.value, 0), 100)}%`,
                    backgroundColor: progress.tone
                      ? `var(--status-${progress.tone})`
                      : "var(--status-info)"
                  }}
                />
              </div>
            </div>
          )}
          {children && <div className="mt-3">{children}</div>}
        </div>
      </div>
    </div>
  );
}
```

## 61. Guía detallada de EmptyStateCard y ErrorCard

### 61.1 EmptyStateCard

```tsx
// frontend/src/core/ui/EmptyStateCard.tsx

interface EmptyStateCardProps {
  icon: LucideIcon;
  title: string;
  description: string;
  action?: { label: string; onClick: () => void; icon?: LucideIcon };
  className?: string;
}

export function EmptyStateCard({ icon: Icon, title, description, action, className }: EmptyStateCardProps) {
  return (
    <div className={cn("flex flex-col items-center justify-center py-16 px-6 text-center", className)}>
      <div className="flex size-14 items-center justify-center rounded-full bg-[var(--bg-surface-elevated)] text-[var(--icon-muted)] mb-4">
        <Icon size={28} strokeWidth={1.5} aria-hidden="true" />
      </div>
      <h3 className="text-h4 text-[var(--text-primary)] mb-1">{title}</h3>
      <p className="text-body-sm text-[var(--text-secondary)] max-w-sm">{description}</p>
      {action && (
        <button
          onClick={action.onClick}
          className="mt-6 inline-flex items-center gap-2 rounded-full bg-[var(--cermont-blue)] px-6 py-3 text-sm font-semibold text-white hover:bg-[var(--cermont-blue-deep)] transition-colors"
        >
          {action.icon && <action.icon size={16} strokeWidth={1.5} aria-hidden="true" />}
          {action.label}
        </button>
      )}
    </div>
  );
}
```

### 61.2 ErrorCard

```tsx
// frontend/src/core/ui/ErrorCard.tsx

interface ErrorCardProps {
  message: string;
  error?: string;
  retry?: () => void;
  className?: string;
}

export function ErrorCard({ message, error, retry, className }: ErrorCardProps) {
  return (
    <div className={cn("flex flex-col items-center justify-center py-12 px-6 text-center", className)}>
      <div className="flex size-14 items-center justify-center rounded-full bg-[var(--status-danger)]/15 text-[var(--status-danger)] mb-4">
        <AlertTriangle size={28} strokeWidth={1.5} aria-hidden="true" />
      </div>
      <h3 className="text-h4 text-[var(--text-primary)] mb-1">Algo salió mal</h3>
      <p className="text-body-sm text-[var(--text-secondary)] max-w-sm">{message}</p>
      {error && (
        <p className="mt-2 text-xs text-[var(--text-muted)] font-mono">Código: {error}</p>
      )}
      {retry && (
        <button
          onClick={retry}
          className="mt-6 inline-flex items-center gap-2 rounded-full bg-[var(--cermont-blue)] px-6 py-3 text-sm font-semibold text-white hover:bg-[var(--cermont-blue-deep)] transition-colors"
        >
          <RefreshCw size={16} strokeWidth={1.5} aria-hidden="true" />
          Intentar de nuevo
        </button>
      )}
    </div>
  );
}
```

## 62. Guía de breakpoints y responsive patterns

### 62.1 Breakpoints canónicos

```css
/* globals.css — ya existen via Tailwind, confirmar consistencia */
/* sm: 640px, md: 768px, lg: 1024px, xl: 1280px, 2xl: 1536px */

/* Uso en componentes */
/* Mobile (<640px): 1 columna, bottom nav, cards full width */
/* Tablet (640-1024px): 2 columnas, bottom nav, sidebar oculta */
/* Desktop (>1024px): sidebar visible, grid completo */
/* Wide (>1440px): grid + panel derecho */
```

### 62.2 Responsive visibility patterns

```tsx
// Sidebar: solo desktop
<aside className="hidden lg:flex lg:w-60 flex-col">

// Bottom nav: solo mobile/tablet
<nav className="lg:hidden fixed bottom-0 w-full">

// Panel derecho: solo wide
<aside className="hidden 2xl:block w-72">

// Grid adaptativo
<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">

// Card mobile → table desktop
<div className="lg:hidden"> {/* Cards */} </div>
<div className="hidden lg:block"> {/* Table */} </div>
```

### 62.3 Seguridad safe-area

```css
/* globals.css */
.safe-bottom {
  padding-bottom: env(safe-area-inset-bottom, 0px);
}
.safe-top {
  padding-top: env(safe-area-inset-top, 0px);
}
```

### 62.4 Touch targets

```css
/* Todos los botones y touch targets deben cumplir 44px mínimo */
.touch-target {
  min-height: 44px;
  min-width: 44px;
}
/* Icon buttons sin texto necesitan padding extra */
.icon-button {
  padding: 10px; /* 20px icon + 10+10 = 40 → insuficiente */
  padding: 12px; /* 20px icon + 12+12 = 44 → OK */
}
```

## 63. Guía de animaciones con Framer Motion

### 63.1 Tokens de animación

```tsx
// frontend/src/core/animation/tokens.ts
export const ANIMATION = {
  duration: { fast: 0.12, normal: 0.2, slow: 0.3 },
  easing: { easeOut: [0.16, 1, 0.3, 1], easeIn: [0.4, 0, 0.2, 1], spring: { type: "spring" as const, stiffness: 300, damping: 25 } },
};

export const fadeIn = {
  initial: { opacity: 0 },
  animate: { opacity: 1 },
  exit: { opacity: 0 },
  transition: { duration: ANIMATION.duration.normal },
};

export const slideUp = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: 20 },
  transition: { duration: ANIMATION.duration.normal, ease: [0.16, 1, 0.3, 1] },
};

export const scaleIn = {
  initial: { opacity: 0, scale: 0.95 },
  animate: { opacity: 1, scale: 1 },
  exit: { opacity: 0, scale: 0.95 },
};
```

### 63.2 Card hover con Framer Motion

```tsx
<motion.div
  whileHover={{ y: -2 }}
  transition={{ duration: 0.15, ease: "easeOut" }}
  className="rounded-[var(--radius-xl)] bg-[var(--bg-surface)]"
>
  {/* children */}
</motion.div>
```

### 63.3 Button press

```tsx
<motion.button
  whileTap={{ scale: 0.97 }}
  transition={{ duration: 0.12 }}
>
  Click me
</motion.button>
```

### 63.4 Reduced motion

```tsx
import { useReducedMotion } from "framer-motion";

function Component() {
  const prefersReducedMotion = useReducedMotion();
  const transition = prefersReducedMotion
    ? { duration: 0.01 }
    : { duration: 0.2, ease: "easeOut" };
  return <motion.div transition={transition}>...</motion.div>;
}
```

## 64. Estrategia de pruebas detallada

### 64.1 Testing Library queries semánticas

```tsx
// ✅ PREFERIR
render(<StatusBadge status="completed" />);
expect(screen.getByRole("status")).toBeInTheDocument();
expect(screen.getByText("Completado")).toBeInTheDocument();

// ❌ EVITAR
expect(container.querySelector(".bg-green-500")).toBeInTheDocument();
```

### 64.2 Test de accesibilidad con axe

```tsx
// En tests E2E Playwright
import { injectAxe, checkA11y } from "axe-playwright";

test("should not have a11y violations", async ({ page }) => {
  await page.goto("/dashboard");
  await injectAxe(page);
  await checkA11y(page, null, {
    includedImpacts: ["critical", "serious"],
  });
});
```

### 64.3 Test de navegación teclado

```tsx
// CommandBar keyboard navigation test
test("navigates with arrow keys", async () => {
  render(<CommandBar {...props} />);
  const input = screen.getByRole("combobox");
  await userEvent.type(input, "dash");
  // Arrow down → first result highlighted
  await userEvent.keyboard("{ArrowDown}");
  expect(screen.getByRole("option").first()).toHaveFocus();
  // Enter → navigate
  await userEvent.keyboard("{Enter}");
  expect(mockRouter.push).toHaveBeenCalledWith("/dashboard");
});
```

### 64.4 Test Coverage targets

| Tipo | Cobertura mínima |
|---|---|
| Componentes core (StatusBadge, ProgressRing) | 90% |
| Componentes de módulo (CockpitTimeline) | 80% |
| Hooks (useCommandBar) | 85% |
| Páginas (integration) | 70% |

## 65. Guía de deployment seguro

### 65.1 Pre-merge checklist

```bash
# 1. Typecheck
npm run typecheck -w frontend

# 2. Lint
npm run lint -w frontend

# 3. Tests unitarios
npm run test -w frontend

# 4. Build
npm run build -w frontend

# 5. Verify completo
npm run verify

# 6. React Doctor
npx react-doctor@latest

# 7. Calidad estricta (si existe)
npm run ci:quality
```

### 65.2 Post-deploy verification

```bash
# 1. Verificar que el build de producción funciona
npm run build -w frontend

# 2. Verificar PWA service worker
ls frontend/.next/static/sw.js  # debe existir

# 3. Verificar manifest
ls frontend/public/manifest.json  # debe existir

# 4. Build size budget
du -sh frontend/.next/static/chunks/
```

## 66. Glosario de términos de diseño

| Término | Definición |
|---|---|
| **Design Token** | Variable CSS que almacena un valor de diseño (color, spacing, radius) |
| **Luminance Stepping** | Técnica de profundidad visual usando diferencias de luminancia en lugar de sombras |
| **Elevation** | Nivel de profundidad visual de un elemento (elevation-0 a elevation-3) |
| **Icon Capsule** | Contenedor circular (pill) para icono con fondo semitransparente |
| **Premium Card** | Card base con icon-capsule, título, subtítulo, badge, progress bar y acción |
| **Compact Stepper** | Stepper de pasos que ocupa espacio mínimo vertical, con fases colapsables |
| **Action Sheet** | Panel contextual que emerge desde abajo en mobile con acciones |
| **Phase Badge** | Badge que identifica la fase del flujo (Comercial, Operativo, Cierre, Financiero) |
| **Pill Button** | Botón con border-radius: 9999px (completamente redondeado) |
| **Segment Control** | Control de tres estados mutuamente excluyentes (C/NC/NA) |
| **FAB** | Floating Action Button — botón de acción principal flotante sobre el contenido |
| **Command Bar** | Barra de comandos global con búsqueda (Ctrl+K) |

## 67. Referencias a la documentación canónica

| Documento | Relación con este plan |
|---|---|
| `docs/design/CERMONT_UIUX_GUIDE.md` | Guía de diseño UI/UX — fuente de tokens y principios |
| `docs/architecture/FRONTEND_ROUTE_MAP.md` | Mapa de rutas — verificar que no haya 404s después del rediseño |
| `docs/architecture/API_ENDPOINT_MATRIX.md` | Endpoints — verificar que CommandBar tenga datos de búsqueda |
| `frontend/AGENTS.md` | Reglas de frontend — source de verdad para arquitectura |
| `DESIGN.md` | Design tokens canónicos v4.0 — fuente de colores, radios, espaciado |
| `docs/domain/CERMONT_BUSINESS_FLOW_MAP.md` | Flujo de 14 pasos — alineación con CockpitTimeline |
| `docs/agents/AGENT_IMPLEMENTATION_PLAYBOOK.md` | Playbook de implementación — validaciones por sprint |

## 68. Notas sobre compatibilidad con el masterplan existente

### 68.1 Alineación con contract-first

El rediseño UI/UX no modifica contratos Zod en `packages/shared-types`. Los componentes UI consumen los tipos existentes via `@cermont/shared-types`. Si se requieren nuevos tipos para la UI (ej. tipo para búsqueda en CommandBar), deben agregarse siguiendo el flujo contract-first:

```txt
Schema Zod → shared-types → backend → frontend
```

### 68.2 Alineación con el flujo de 14 pasos

Cada componente del CockpitTimeline se mapea directamente a los 14 pasos operativos definidos en `docs/domain/CERMONT_BUSINESS_FLOW_MAP.md`:

| Fase | Pasos | Color de fase |
|---|---|---|
| Comercial | 1-4 (Solicitud, Visita, Propuesta, PO) | `--status-info` |
| Operativo | 5-8 (Planeación, Ejecución, Evidencias, Informe) | `--cermont-blue` |
| Cierre | 9-11 (Acta, Firma, SES) | `--status-success` |
| Financiero | 12-14 (Aprobación, Factura, Pago) | `--status-warning` |

### 68.3 Alineación con trazabilidad y evidencias

El módulo de evidencias usa `EvidenceStatusBadge` que se unificará con StatusBadge global. El flujo de captura, metadata y geolocalización no se modifica — solo mejora la presentación visual.

---

## Apéndice B: Pseudocódigo para StatusBadge unificado

```tsx
// frontend/src/core/ui/StatusBadge.tsx — REFACTOR propuesto

import { type LucideIcon } from "lucide-react";
import {
  CheckCircle, XCircle, AlertTriangle, Clock, Info, Minus,
} from "lucide-react";
import { cn } from "@/lib/utils";

type BadgeTone = "success" | "warning" | "danger" | "info" | "neutral" | "accent";
type BadgeSize = "sm" | "md" | "lg";

const STATUS_CONFIG: Record<string, { tone: BadgeTone; icon: LucideIcon }> = {
  // Estados genéricos
  completed:    { tone: "success", icon: CheckCircle },
  approved:     { tone: "success", icon: CheckCircle },
  active:       { tone: "info", icon: Info },
  in_progress:  { tone: "info", icon: Clock },
  pending:      { tone: "warning", icon: Clock },
  blocked:      { tone: "danger", icon: AlertTriangle },
  rejected:     { tone: "danger", icon: XCircle },
  cancelled:    { tone: "neutral", icon: XCircle },
  draft:        { tone: "neutral", icon: Minus },
  // ... más mapeos por módulo
};

const TONE_STYLES: Record<BadgeTone, string> = {
  success: "bg-[var(--status-success)]/15 text-[var(--status-success)]",
  warning: "bg-[var(--status-warning)]/15 text-[var(--status-warning)]",
  danger:  "bg-[var(--status-danger)]/15 text-[var(--status-danger)]",
  info:    "bg-[var(--status-info)]/15 text-[var(--status-info)]",
  neutral: "bg-[var(--status-neutral)]/15 text-[var(--status-neutral)]",
  accent:  "bg-[var(--cermont-blue)]/15 text-[var(--cermont-blue)]",
};

const SIZE_STYLES: Record<BadgeSize, string> = {
  sm: "px-1.5 py-0.5 gap-1 text-[11px]",
  md: "px-2 py-1 gap-1.5 text-[12px]",
  lg: "px-3 py-1.5 gap-1.5 text-[13px]",
};

interface StatusBadgeProps {
  status: string;
  tone?: BadgeTone;
  icon?: LucideIcon;
  size?: BadgeSize;
  showIcon?: boolean;
  className?: string;
  children?: React.ReactNode;
}

export function StatusBadge({
  status,
  tone: explicitTone,
  icon: explicitIcon,
  size = "md",
  showIcon = true,
  className,
  children,
}: StatusBadgeProps) {
  const config = STATUS_CONFIG[status];
  const tone = explicitTone ?? config?.tone ?? "neutral";
  const Icon = explicitIcon ?? config?.icon ?? Info;
  const label = children ?? status.replace(/_/g, " ");

  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full font-medium capitalize",
        "border border-current/10",
        TONE_STYLES[tone],
        SIZE_STYLES[size],
        className
      )}
      role="status"
    >
      {showIcon && (
        <Icon
          size={size === "sm" ? 12 : size === "lg" ? 16 : 14}
          strokeWidth={1.5}
          aria-hidden="true"
        />
      )}
      <span>{label}</span>
    </span>
  );
}
```

## Apéndice C: Wrappers de módulo (ejemplos)

Cada módulo mantiene su wrapper específico que mapea estados del módulo al StatusBadge genérico:

```tsx
// frontend/src/modules/evidences/ui/EvidenceStatusBadge.tsx → REFACTOR
import { StatusBadge } from "@/core/ui/StatusBadge";
import type { EvidenceStatus } from "@cermont/shared-types";

const EVIDENCE_MAP: Record<EvidenceStatus, { tone: "success" | "warning" | "danger" | "info" | "neutral"; label: string }> = {
  approved:            { tone: "success", label: "Aprobada" },
  rejected:            { tone: "danger",  label: "Rechazada" },
  pending_review:      { tone: "warning", label: "En revisión" },
  replacement_requested: { tone: "warning", label: "Reemplazo solicitado" },
  locked:              { tone: "neutral", label: "Bloqueada" },
};

export function EvidenceStatusBadge({ status }: { status: EvidenceStatus }) {
  const config = EVIDENCE_MAP[status] ?? { tone: "neutral" as const, label: status };
  return <StatusBadge status={status} tone={config.tone}>{config.label}</StatusBadge>;
}
```

## Apéndice D: Patrones de implementación para componentes comunes

### D.1 Patrón de card con bordes semánticos

```tsx
// Borde izquierdo semántico de 4px — usado para StatusCard, alertas
<div className={cn(
  "relative overflow-hidden rounded-[var(--radius-xl)] bg-[var(--bg-surface)] p-5",
  "border border-[var(--border-default)]",
  "before:absolute before:left-0 before:top-0 before:h-full before:w-1",
  tone === "success" && "before:bg-[var(--status-success)]",
  tone === "warning" && "before:bg-[var(--status-warning)]",
  tone === "danger" && "before:bg-[var(--status-danger)]",
)}>
  {/* contenido */}
</div>
```

### D.2 Patrón de shimmer loading

```css
@keyframes shimmer {
  0% { background-position: -200% 0; }
  100% { background-position: 200% 0; }
}
.shimmer {
  background: linear-gradient(
    90deg,
    var(--bg-surface) 0%,
    var(--bg-surface-elevated) 50%,
    var(--bg-surface) 100%
  );
  background-size: 200% 100%;
  animation: shimmer 1.5s ease-in-out infinite;
}
```

### D.3 Patrón de badge semántico inline

```tsx
// Para badges inline (no los StatusBadge completos)
function DotBadge({ tone }: { tone: "success" | "warning" | "danger" | "info" | "neutral" }) {
  const colors = {
    success: "bg-[var(--status-success)]",
    warning: "bg-[var(--status-warning)]",
    danger: "bg-[var(--status-danger)]",
    info: "bg-[var(--status-info)]",
    neutral: "bg-[var(--status-neutral)]",
  };
  return <span className={cn("inline-block size-2 rounded-full", colors[tone])} role="status" />;
}
```

### D.4 Patrón de progress bar delgada

```tsx
// Progress bar de 4px usada en Cockpit StepCard
function ThinProgressBar({ value, tone }: { value: number; tone?: string }) {
  return (
    <div className="h-1 rounded-full bg-[var(--border-default)] overflow-hidden">
      <div
        className="h-full rounded-full transition-all duration-500"
        style={{
          width: `${Math.min(Math.max(value, 0), 100)}%`,
          backgroundColor: tone ? `var(--status-${tone})` : "var(--status-info)",
        }}
      />
    </div>
  );
}
```

### D.5 Patrón de input premium

```tsx
// Input premium consistente en todo el sistema
<input
  className={cn(
    "h-11 w-full rounded-[var(--radius-md)] border border-[var(--border-default)]",
    "bg-[var(--bg-canvas-deep)] px-4 text-sm text-[var(--text-primary)]",
    "placeholder:text-[var(--text-muted)]",
    "focus:border-[var(--cermont-blue)] focus:outline-none focus:ring-2 focus:ring-[var(--cermont-blue)]/20",
    "disabled:opacity-60 disabled:cursor-not-allowed",
    hasError && "border-[var(--status-danger)] focus:border-[var(--status-danger)] focus:ring-[var(--status-danger)]/20"
  )}
  placeholder={placeholder}
  aria-invalid={hasError}
  aria-describedby={hasError ? `${name}-error` : undefined}
/>
```

### D.6 Patrón de select premium

```tsx
<select
  className={cn(
    "h-11 w-full rounded-[var(--radius-md)] border border-[var(--border-default)]",
    "bg-[var(--bg-canvas-deep)] px-4 text-sm text-[var(--text-primary)]",
    "appearance-none bg-[length:16px] bg-[right_12px_center] bg-no-repeat",
    "focus:border-[var(--cermont-blue)] focus:outline-none focus:ring-2 focus:ring-[var(--cermont-blue)]/20",
  )}
  style={{ backgroundImage: `url("data:image/svg+xml,...chevron-down...")` }}
>
```

### D.7 Patrón de botones premium

```tsx
// Variantes de botón — todos pill (9999px)
const buttonVariants = {
  primary: "bg-[var(--cermont-blue)] text-white hover:bg-[var(--cermont-blue-deep)]",
  secondary: "border border-[var(--border-default)] text-[var(--text-primary)] hover:bg-[var(--bg-surface-elevated)]",
  ghost: "text-[var(--text-secondary)] hover:bg-[var(--bg-surface-elevated)]",
  danger: "bg-[var(--status-danger)] text-white hover:opacity-90",
  success: "bg-[var(--status-success)] text-white hover:opacity-90",
};

const buttonSizes = {
  sm: "h-9 px-4 text-xs",
  md: "h-11 px-6 text-sm",
  lg: "h-12 px-8 text-base",
};

<button className={cn(
  "inline-flex items-center justify-center gap-2 rounded-full font-medium transition-all",
  "active:scale-[0.97] disabled:opacity-60 disabled:cursor-not-allowed",
  "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--cermont-blue)]",
  buttonVariants[variant],
  buttonSizes[size],
)}>
  {icon && <Icon size={size === "sm" ? 16 : 20} strokeWidth={1.5} aria-hidden="true" />}
  {children}
</button>
```

## Apéndice E: Configuración de Tailwind para el nuevo design system

```css
/* frontend/src/app/globals.css — Configuración adicional */
@import "tailwindcss";
@plugin "@tailwindcss/forms";

@custom-variant dark (&:is(.dark *));

/* Los tokens existentes se mantienen y se agregan los siguientes: */

/* Extensión para tonos semánticos con opacidad */
@utility bg-success {
  background-color: color-mix(in srgb, var(--status-success) 15%, transparent);
}
@utility bg-warning {
  background-color: color-mix(in srgb, var(--status-warning) 15%, transparent);
}
@utility bg-danger {
  background-color: color-mix(in srgb, var(--status-danger) 15%, transparent);
}
@utility bg-info {
  background-color: color-mix(in srgb, var(--status-info) 15%, transparent);
}
@utility bg-neutral {
  background-color: color-mix(in srgb, var(--status-neutral) 15%, transparent);
}

/* Animaciones personalizadas */
@keyframes slide-up {
  from { transform: translateY(100%); opacity: 0; }
  to { transform: translateY(0); opacity: 1; }
}
@keyframes pulse-fab {
  0%, 100% { transform: scale(1); }
  50% { transform: scale(1.05); }
}
@keyframes shimmer {
  0% { background-position: -200% 0; }
  100% { background-position: 200% 0; }
}

/* Clases de animación */
@utility animate-slide-up {
  animation: slide-up 200ms ease-out;
}
@utility animate-pulse-fab {
  animation: pulse-fab 2000ms ease-in-out infinite;
}
@utility animate-shimmer {
  animation: shimmer 1500ms ease-in-out infinite;
  background: linear-gradient(90deg, var(--bg-surface) 0%, var(--bg-surface-elevated) 50%, var(--bg-surface) 100%);
  background-size: 200% 100%;
}

/* Safe area */
@utility safe-bottom {
  padding-bottom: env(safe-area-inset-bottom, 0px);
}
@utility safe-top {
  padding-top: env(safe-area-inset-top, 0px);
}
```

## Apéndice F: Roadmap visual — timeline de implementación

```txt
Mes 1 (Sprints 1-4): Fundación
──────────────────────────────────────────────────────
Semana 1: UIX-00 Audit + UIX-01 Tokens
  ├─ Baseline gates
  ├─ Screenshots actuales
  ├─ Limpiar tokens legacy
  └─ Agregar tokens faltantes

Semana 2: UIX-02 Icons + UIX-03 Components
  ├─ Icon wrapper global
  ├─ StatusBadge unificado
  ├─ CategoryBadge, ProgressRing
  ├─ PremiumCard, EmptyStateCard, ErrorCard
  └─ Tests unitarios

Semana 3-4: UIX-04 Cockpit + UIX-05 Dashboard
  ├─ CockpitTimeline horizontal/vertical
  ├─ CompactStepper
  ├─ PhaseBadge
  ├─ DashboardHero
  ├─ KpiCard premium
  └─ E2E tests

Mes 2 (Sprints 5-8): Módulos core
──────────────────────────────────────────────────────
Semana 5: UIX-06 Planning + UIX-07 Forms
  ├─ Migrar colores hardcode planning
  ├─ SegmentControl premium
  ├─ Migrar ChecklistPanel
  └─ Tests

Semana 6: UIX-08 Evidences + UIX-09 Reports
  ├─ EvidenceStatusBadge → unificado
  ├─ Gallery premium
  ├─ ReportStatusBadge → unificado
  └─ Tests

Semana 7: UIX-10 Financial + UIX-11 Fleet
  ├─ InvoiceStatusBadge → unificado
  ├─ Pipeline premium
  ├─ Fleet cards
  └─ Tests

Semana 8: UIX-12 Portal + UIX-13 CommandBar
  ├─ Portal status badges → unificados
  ├─ CommandBar (Ctrl+K)
  ├─ ActionSheet
  ├─ FAB controlado
  └─ Tests + E2E

Mes 3 (Sprints 9-10): Hardening
──────────────────────────────────────────────────────
Semana 9: UIX-14 Runtime Review
  ├─ Screenshots mobile/desktop
  ├─ Verificar build
  ├─ Verificar service worker
  └─ Documentar issues

Semana 10: UIX-15 Hardening + A11y
  ├─ Auditoría WCAG AA
  ├─ Focus management
  ├─ aria labels
  ├─ Reduced motion
  ├─ Keyboard nav
  └─ react-doctor final
```

## Apéndice G: Checklist de implementación por componente

### G.1 StatusBadge (core)

- [ ] Crear `STATUS_CONFIG` con mapeo de estados a tone/icon
- [ ] Implementar variantes sm/md/lg
- [ ] Soportar showIcon true/false
- [ ] Implementar role="status"
- [ ] Agregar animación de entrada sutil
- [ ] Escribir tests unitarios (render, tones, sizes, iconos)
- [ ] Escribir test de accesibilidad (role, aria-label)

### G.2 CategoryBadge

- [ ] Definir variantes: checklist, evidence, document, phase, custom
- [ ] Mapear colores por variante
- [ ] Soportar icono opcional
- [ ] Escribir tests

### G.3 ProgressRing

- [ ] Implementar SVG nativo (sin dependencias)
- [ ] Implementar animación stroke-dashoffset 600ms
- [ ] Soportar sm/md/lg
- [ ] Soportar tones success/warning/danger/info/neutral
- [ ] Implementar role="progressbar" con aria-valuenow
- [ ] Escribir tests (valores 0, 50, 100, animación)

### G.4 PremiumCard

- [ ] Implementar variantes default/interactive/compact
- [ ] Soportar icon-capsule con tone
- [ ] Soportar badge opcional
- [ ] Soportar progress bar opcional
- [ ] Implementar hover state con translateY
- [ ] Implementar keyboard nav para interactive
- [ ] Escribir tests

### G.5 CockpitTimeline

- [ ] Responsive: horizontal en desktop, vertical en mobile
- [ ] Mobile: fases colapsables con PhaseBadge
- [ ] Paso actual con glow
- [ ] Touch target ≥48px en mobile
- [ ] Skeleton loading state
- [ ] Empty state
- [ ] Error state
- [ ] Escribir tests unitarios + E2E

### G.6 CompactStepper

- [ ] 5 pasos visibles max
- [ ] Más de 5: dots + indicador +N
- [ ] Touch target ≥44px
- [ ] Animación entre pasos
- [ ] Escribir tests

### G.7 CommandBar

- [ ] Ctrl+K / Cmd+K shortcut
- [ ] Modal overlay con input
- [ ] Búsqueda con filtrado
- [ ] Navegación teclado (arrows + enter)
- [ ] Focus trap
- [ ] role="dialog", aria-modal
- [ ] Mobile: sheet desde abajo
- [ ] Sin dependencias externas
- [ ] Escribir tests + E2E

### G.8 ActionSheet

- [ ] Slide up animation
- [ ] Overlay semitransparente
- [ ] Handle drag indicator
- [ ] Focus trap
- [ ] Escape key
- [ ] role="dialog"
- [ ] Touch target ≥44px
- [ ] Escribir tests

### G.9 FloatingActionButton

- [ ] 56×56px, pill
- [ ] Pulse animation idle
- [ ] Posición sobre bottom nav (offset -28px)
- [ ] Visible solo en páginas con acciones
- [ ] Abre ActionSheet
- [ ] aria-label
- [ ] Escribir tests

## Apéndice H: Mapa de archivos legacy a no modificar

Los siguientes archivos NO deben modificarse durante el rediseño UI/UX porque son backend, paquetes compartidos, o infraestructura:

```txt
backend/                          → NO TOCAR
packages/                         → NO TOCAR (a menos que se requieran nuevos tipos)
Dockerfile                        → NO TOCAR
docker/                           → NO TOCAR
ecosystem.config.js               → NO TOCAR
frontend/next.config.ts           → NO TOCAR (a menos que se requieran rewrites)
frontend/proxy.ts                 → NO TOCAR (perímetro de seguridad)
frontend/public/                  → NO TOCAR (assets estáticos)
frontend/src/lib/http/            → NO TOCAR (api-client)
frontend/src/store/               → NO TOCAR (zustand stores)
frontend/src/lib/offline/         → NO TOCAR (offline engine)
frontend/src/lib/pwa/             → NO TOCAR (service workers)
```

Los componentes UI que se refactorizan se modifican **in-place** (misma ruta, mejor implementación). Los componentes nuevos se crean en las rutas especificadas en este plan.

## Apéndice I: Ejemplos de transición ANTES → DESPUÉS

### I.1 ChecklistPanel — Antes (hardcode emerald)

```tsx
// ANTES — ChecklistPanel.tsx (hardcode)
progress === 100 ? "bg-emerald-500" : "bg-sky-500",
// ... más adelante
? "border-emerald-200 bg-emerald-50/70 dark:border-emerald-900/40 dark:bg-emerald-900/10"
: "border-[var(--border-default)] bg-[var(--bg-surface)]",
? "border-emerald-500 bg-emerald-500 text-white"
: "border-[var(--border-default)]",
className="inline-flex w-full items-center justify-center gap-2 rounded-full bg-emerald-600 px-4 py-3 text-sm font-semibold text-white transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-60 dark:bg-emerald-500 dark:hover:bg-emerald-600"
```

### I.2 ChecklistPanel — Después (tokens semánticos)

```tsx
// DESPUÉS — ChecklistPanel.tsx (tokens)
progress === 100 ? "bg-[var(--status-success)]" : "bg-[var(--status-info)]",
// ...
? "border-[var(--status-success)]/20 bg-[var(--status-success)]/10"
: "border-[var(--border-default)] bg-[var(--bg-surface)]",
? "border-[var(--status-success)] bg-[var(--status-success)] text-white"
: "border-[var(--border-default)]",
className="inline-flex w-full items-center justify-center gap-2 rounded-full bg-[var(--status-success)] px-4 py-3 text-sm font-semibold text-white transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
```

### I.3 PlanningReadinessGate — Antes

```tsx
// ANTES — PlanningReadinessGate.tsx
<span className="inline-flex items-center gap-1 rounded-full bg-green-100 px-3 py-1 text-xs font-semibold text-green-700">
  Aprobada
</span>
<ShieldCheck className="mt-0.5 size-5 shrink-0 text-green-600" aria-hidden="true" />
<h3 className="text-sm font-semibold text-green-800">Aprobada</h3>
<p className="mt-0.5 text-xs text-green-700">...</p>
<div className="mt-3 flex items-start gap-2 rounded-md border border-red-200 bg-red-50 p-3">
  <AlertTriangle className="mt-0.5 size-4 shrink-0 text-red-500" aria-hidden="true" />
  <p className="text-xs text-red-700">{approveError}</p>
</div>
```

### I.4 PlanningReadinessGate — Después

```tsx
// DESPUÉS — PlanningReadinessGate.tsx
<StatusBadge status="approved" tone="success" size="sm">Aprobada</StatusBadge>
<div className="flex items-start gap-3">
  <div className="flex size-10 items-center justify-center rounded-full bg-[var(--status-success)]/15">
    <ShieldCheck className="size-5 text-[var(--status-success)]" aria-hidden="true" />
  </div>
  <div>
    <h3 className="text-sm font-semibold text-[var(--text-primary)]">Aprobada</h3>
    <p className="mt-0.5 text-xs text-[var(--text-secondary)]">...</p>
  </div>
</div>
<div className="flex items-start gap-3 rounded-xl border border-[var(--status-danger)]/20 bg-[var(--status-danger)]/10 p-4">
  <AlertTriangle className="mt-0.5 size-4 shrink-0 text-[var(--status-danger)]" aria-hidden="true" />
  <p className="text-xs text-[var(--status-danger)]">{approveError}</p>
</div>
```

### I.5 Portal cliente — Antes

```tsx
// ANTES — app/(portal)/portal/invoices/page.tsx
className={`inline-block rounded-full px-2.5 py-0.5 text-xs font-medium capitalize ${
  inv.status === "paid" ? "bg-success-bg text-brand-annotate"
  : inv.status === "cancelled" ? "bg-danger-bg text-brand-error"
  : "bg-yellow-100 text-brand-warn"
}`}
```

### I.6 Portal cliente — Después

```tsx
// DESPUÉS — usando StatusBadge global
<StatusBadge status={inv.status} size="sm" />
// El mapeo se maneja internamente en STATUS_CONFIG
```

### I.7 Execution page KpiCard — Antes (inline)

```tsx
// ANTES — frontend/src/app/(dashboard)/execution/page.tsx
// KpiCard definido inline en la página
function KpiCard({ icon: Icon, label, value }: { icon: LucideIcon; label: string; value: number }) {
  return (
    <div className="flex items-center gap-3 rounded-2xl border border-[var(--border-default)] bg-[var(--bg-surface)] p-4">
      <div className="flex size-10 items-center justify-center rounded-full bg-[var(--bg-surface-elevated)] text-[var(--icon-accent)]">
        <Icon size={20} strokeWidth={1.5} />
      </div>
      <div>
        <p className="text-xs text-[var(--text-secondary)]">{label}</p>
        <p className="text-lg font-bold text-[var(--text-primary)]">{value}</p>
      </div>
    </div>
  );
}
```

### I.8 Execution page KpiCard — Después (reutilizando componente global)

```tsx
// DESPUÉS
import { KpiCard } from "@/core/ui/KpiCard";

// Uso:
<KpiCard icon={PlayCircle} label="Activas" value={activeCount} />
<KpiCard icon={Clock3} label="Listas" value={readyCount} />
<KpiCard icon={CheckCircle2} label="Completadas" value={completedCount} tone="success" />
<KpiCard icon={RefreshCcw} label="Sync pendiente" value={pendingSyncCount} tone="warning" />
// Y eliminar la definición inline de KpiCard
```

## Apéndice J: Patrones de navegación y layout

### J.1 DefaultLayout — estructura mobile

```tsx
// frontend/src/modules/core/ui/layout/DefaultLayout.tsx
// Estructura propuesta (sin modificar la existente, solo ilustrativa)
export default function DefaultLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-[var(--bg-canvas)]">
      {/* Sidebar desktop */}
      <aside className="hidden lg:fixed lg:inset-y-0 lg:flex lg:w-60 lg:flex-col">
        <Sidebar />
      </aside>

      {/* Main content */}
      <div className="lg:pl-60">
        {/* Header */}
        <header className="sticky top-0 z-30 h-14 border-b border-[var(--border-subtle)] bg-[var(--bg-canvas)]/80 backdrop-blur-lg lg:h-14">
          <div className="flex items-center justify-between px-4 h-full">
            <div className="flex items-center gap-3">
              {/* Mobile menu button */}
              <button className="lg:hidden p-2" aria-label="Menú">
                <Menu size={20} strokeWidth={1.5} />
              </button>
              {/* Breadcrumbs / Title */}
              <Breadcrumbs />
            </div>
            <div className="flex items-center gap-2">
              {/* Search trigger (Cmd+K) */}
              <CommandBarTrigger />
              {/* Notifications */}
              <NotificationBell />
              {/* User avatar */}
              <UserMenu />
            </div>
          </div>
        </header>

        {/* Page content */}
        <main className="pb-20 lg:pb-6">
          {children}
        </main>
      </div>

      {/* Bottom nav mobile */}
      <MobileBottomNav />
      {/* FAB */}
      <FloatingActionButton />
      {/* CommandBar global */}
      <CommandBar />
    </div>
  );
}
```

### J.2 Breadcrumbs — patrón

```tsx
interface BreadcrumbItem {
  label: string;
  href?: string;
  icon?: LucideIcon;
}

function Breadcrumbs({ items }: { items: BreadcrumbItem[] }) {
  return (
    <nav aria-label="Breadcrumb" className="hidden sm:flex items-center gap-1.5 text-sm">
      {items.map((item, i) => (
        <span key={item.label} className="flex items-center gap-1.5">
          {i > 0 && <ChevronRight size={14} className="text-[var(--text-muted)]" aria-hidden="true" />}
          {item.href ? (
            <Link href={item.href} className="text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors">
              {item.icon && <item.icon size={14} className="inline mr-1" aria-hidden="true" />}
              {item.label}
            </Link>
          ) : (
            <span className="text-[var(--text-primary)] font-medium">
              {item.icon && <item.icon size={14} className="inline mr-1" aria-hidden="true" />}
              {item.label}
            </span>
          )}
        </span>
      ))}
    </nav>
  );
}
```

## Apéndice K: Guía de revisión de PR para cambios UI/UX

### K.1 Checklist de revisión

```markdown
## Checklist de revisión UI/UX

### Consistencia visual
- [ ] Los colores usan tokens CSS, no valores hardcoded
- [ ] Los iconos son unicolor con currentColor
- [ ] Los radios siguen la escala definida (sm/md/lg/xl/pill)
- [ ] Las cards tienen el radio correcto (24px mobile, 16px desktop)
- [ ] Los botones son pill (9999px)
- [ ] Los espaciados siguen la escala 4-8-12-16-20-24-32-40

### Responsive
- [ ] Funciona en 375px (mobile)
- [ ] Funciona en 768px (tablet)
- [ ] Funciona en 1280px (desktop)
- [ ] Touch targets ≥44px en mobile
- [ ] Sin overflow horizontal
- [ ] Bottom nav visible en mobile

### Estados
- [ ] Loading state (skeleton)
- [ ] Error state (ErrorCard con retry)
- [ ] Empty state (EmptyStateCard con CTA)
- [ ] Forbidden state (si aplica RBAC)

### Accesibilidad
- [ ] Contraste AA (4.5:1 texto)
- [ ] Focus visible en todos los elementos interactivos
- [ ] Labels en todos los inputs
- [ ] aria-label en icon buttons
- [ ] Texto + icono + color para estados
- [ ] Navegación teclado funcional
- [ ] prefers-reduced-motion respetado

### Calidad
- [ ] Typecheck pasa
- [ ] Lint pasa
- [ ] Tests pasan
- [ ] Build pasa
- [ ] Sin console.log en producción
- [ ] Sin any en TypeScript
- [ ] Sin emojis como iconos funcionales
```

### K.2 Reglas de auto-rechazo

Un PR debe ser RECHAZADO automáticamente si:

1. Introduce `bg-emerald-*`, `text-green-*`, `bg-purple-*` nuevos
2. Introduce iconos multicolor o emojis como iconos funcionales
3. Rompe el typecheck con errores nuevos
4. No incluye skeleton/error/empty states para una página con datos
5. Usa `any` o `@ts-ignore`
6. Modifica backend, packages, Dockerfile, o proxy.ts
7. Introduce dependencias npm no aprobadas en la lista de stack
8. Deja la página en blanco si falla la API

## Apéndice L: Resumen de archivos a crear

| # | Archivo | Tipo |
|---|---|---|
| 1 | `frontend/src/core/ui/Icon.tsx` | Nuevo |
| 2 | `frontend/src/core/ui/CategoryBadge.tsx` | Nuevo |
| 3 | `frontend/src/core/ui/ProgressRing.tsx` | Nuevo |
| 4 | `frontend/src/core/ui/PremiumCard.tsx` | Nuevo |
| 5 | `frontend/src/core/ui/EmptyStateCard.tsx` | Nuevo |
| 6 | `frontend/src/core/ui/ErrorCard.tsx` | Nuevo |
| 7 | `frontend/src/core/ui/ForbiddenCard.tsx` | Nuevo |
| 8 | `frontend/src/core/animation/tokens.ts` | Nuevo |
| 9 | `frontend/src/modules/cockpit/ui/CockpitTimeline.tsx` | Nuevo |
| 10 | `frontend/src/modules/cockpit/ui/CompactStepper.tsx` | Nuevo |
| 11 | `frontend/src/modules/cockpit/ui/PhaseBadge.tsx` | Nuevo |
| 12 | `frontend/src/modules/navigation/ui/CommandBar.tsx` | Nuevo |
| 13 | `frontend/src/modules/navigation/ui/CommandBarTrigger.tsx` | Nuevo |
| 14 | `frontend/src/modules/navigation/ui/ActionSheet.tsx` | Nuevo |
| 15 | `frontend/src/modules/navigation/ui/ActionSheetItem.tsx` | Nuevo |
| 16 | `frontend/src/modules/navigation/ui/FloatingActionButton.tsx` | Nuevo |
| 17 | `frontend/src/modules/dashboard/ui/DashboardHero.tsx` | Nuevo |

## Apéndice M: Resumen de archivos a refactorizar

| # | Archivo | Acción principal |
|---|---|---|
| 1 | `frontend/src/app/globals.css` | Renombrar tokens, agregar surface/icon/elevation |
| 2 | `frontend/src/core/ui/StatusBadge.tsx` | Unificar con STATUS_CONFIG + tones |
| 3 | `frontend/src/core/ui/Skeleton.tsx` | Agregar variantes cockpit-step, evidence-grid |
| 4 | `frontend/src/components/common/KpiCard.tsx` | Agregar delta, tone, ProgressRing opcional |
| 5 | `frontend/src/components/common/SegmentControl.tsx` | Mejorar estilos premium |
| 6 | `frontend/src/modules/cockpit/ui/FourteenStepProgressBar.tsx` | Reemplazar con CockpitTimeline |
| 7 | `frontend/src/modules/service-cases/components/ServiceCaseWorkflowCockpit.tsx` | Extraer TimelineSection |
| 8 | `frontend/src/modules/checklists/components/ChecklistPanel.tsx` | Reemplazar emerald hardcode |
| 9 | `frontend/src/modules/planning/ui/PlanningReadinessGate.tsx` | Reemplazar green/red hardcode |
| 10 | `frontend/src/modules/evidences/ui/EvidenceStatusBadge.tsx` | Convertir a wrapper |
| 11 | `frontend/src/modules/invoices/ui/InvoiceStatusBadge.tsx` | Convertir a wrapper |
| 12 | `frontend/src/modules/reports/ui/ReportStatusBadge.tsx` | Convertir a wrapper |
| 13 | `frontend/src/modules/proposals/ui/ProposalStatusBadge.tsx` | Convertir a wrapper |
| 14 | `frontend/src/modules/field-execution/ui/ExecutionStatusBadge.tsx` | Convertir a wrapper |
| 15 | `frontend/src/modules/portal/ui/PortalServiceCaseList.tsx` | Usar StatusBadge global |
| 16 | `frontend/src/app/(dashboard)/execution/page.tsx` | Eliminar KpiCard inline |
| 17 | `frontend/src/app/(portal)/portal/page.tsx` | Reemplazar inline badge |
| 18 | `frontend/src/app/(portal)/portal/invoices/page.tsx` | Reemplazar inline badge |
| 19 | `frontend/src/modules/core/ui/layout/MobileBottomNav.tsx` | Mejorar estilos premium |
| 20 | `frontend/src/modules/core/ui/layout/DefaultLayout.tsx` | Integrar FAB + CommandBar |

---

## Fin del documento

> **CERMONT UI/UX PREMIUM FRONTEND MASTERPLAN v1.0**
> 2026-07-09 — Sisyphus — OhMyOpenCode
>
> Este plan es la guía canónica para la transformación visual de CERMONT.
> Sigue las fases en orden, ejecuta las validaciones en cada sprint,
> y no modifiques código sin pasar los gates de calidad.
