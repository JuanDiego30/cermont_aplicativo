# PROMPT: Implementación Completa del Diseño CERMONT — Refactor, Innovación y Debugging

> **Basado en auditoría:** `.playwright-mcp/audit/AUDIT_COMPLETO_6000L.md` (91 hallazgos, 38 críticos)
> **Stack objetivo:** Next.js 16 + React 19 + Tailwind 4 + Radix UI + Lucide + Framer Motion
> **Modo:** SOLO código. Auditoría ya completada. Este prompt es para IMPLEMENTAR.
> **Total fases:** 9 fases atómicas, ~40 tareas, ejecución en paralelo máximo

---

## 📋 INSTRUCCIONES OBLIGATORIAS

1. **Source of truth:** `DESIGN.md` (root del proyecto) — NO inventar valores ni desviarse
2. **No hardcodear:** Usar variables CSS existentes (`--color-brand-green`, `--radius-xl`, etc.)
3. **Cambios atómicos:** Cada tarea modifica 1-3 archivos como máximo
4. **Light-first:** El modo claro es la presentación principal (DESIGN.md §2.1)
5. **Colores CERMONT:** Solo como acento en bordes, iconos, botones, badges — nunca como fondo de card
6. **Consistencia:** KPIs idénticos anatómicamente, botones pill, headers con icono circular
7. **Estados obligatorios:** Toda página debe tener loading/error/empty states
8. **Sin regresión:** No eliminar funcionalidad existente. No romper typecheck/lint/build
9. **Sin Any:** Prohibido `any`, `unknown`, `null`, `undefined` para ausencia
10. **Sin console.log** en producción

---

## 📂 ARCHIVOS CLAVE A MODIFICAR

```
# Design System Core
frontend/src/app/globals.css                          # Tokens, radius, shadows, buttons, cards
frontend/src/app/layout.tsx                           # RootLayout con ThemeProvider
frontend/src/app/providers.tsx                        # ThemeProvider
frontend/src/lib/theme/theme-init-script.ts           # Script de init de tema (light default)
frontend/src/lib/theme/ThemeProvider.tsx               # NUEVO - ThemeProvider con toggle

# Componentes Base
frontend/src/components/ui/Button.tsx                 # Variantes primary/secondary/ghost/danger
frontend/src/components/ui/Card.tsx                   # Variantes base/soft/highlight/empty
frontend/src/components/ui/PageHeader.tsx              # NUEVO - Header con icono circular + title + description
frontend/src/components/ui/Badge.tsx                   # Badge semántico
frontend/src/core/ui/EmptyState.tsx                    # Empty states contextuales
frontend/src/core/ui/EmptyStateIllustration.tsx        # Ilustraciones contextuales
frontend/src/components/common/QuickUploadPanel.tsx    # FAB contextual

# Sidebar & Navigation
frontend/src/modules/core/ui/layout/Sidebar.tsx       # Iconos con color semántico
frontend/src/modules/core/ui/layout/Header.tsx         # Breadcrumb sin duplicación
frontend/src/modules/core/ui/layout/DefaultLayout.tsx   # Layout shell
frontend/src/modules/core/navigation.tsx               # Config de navegación

# Dashboard (refactor mayor)
frontend/src/app/(dashboard)/dashboard/page.tsx        # Dashboard page refactor
frontend/src/modules/dashboard/ui/KPICard.tsx          # Progress bar + radius fix + alert
frontend/src/modules/dashboard/ui/DashboardHero.tsx    # Hero unificado 60/40
frontend/src/modules/dashboard/ui/StepTimeline.tsx     # 14 pasos con 4 estados
frontend/src/modules/dashboard/ui/DashboardFilters.tsx # DateRangePicker
frontend/src/modules/dashboard/model/dashboard-helpers.ts # KPIs contextuales

# Pages (titles, breadcrumbs, icons, copy)
frontend/src/app/(dashboard)/service-cases/page.tsx
frontend/src/app/(dashboard)/work-requests/page.tsx
frontend/src/app/(dashboard)/site-visits/page.tsx
frontend/src/app/(dashboard)/proposals/page.tsx
frontend/src/app/(dashboard)/purchase-orders/page.tsx
frontend/src/app/(dashboard)/orders/page.tsx
frontend/src/app/(dashboard)/planning/page.tsx
frontend/src/app/(dashboard)/execution/page.tsx
frontend/src/app/(dashboard)/evidences/page.tsx
frontend/src/app/(dashboard)/reports/page.tsx
frontend/src/app/(dashboard)/billing/page.tsx
frontend/src/app/(dashboard)/billing/ses/page.tsx
frontend/src/app/(dashboard)/billing/invoices/page.tsx
frontend/src/app/(dashboard)/payments/page.tsx
frontend/src/app/(dashboard)/costs/page.tsx
frontend/src/app/(dashboard)/documents/page.tsx
frontend/src/app/(dashboard)/inventory/page.tsx
frontend/src/app/(dashboard)/sla/page.tsx
frontend/src/app/(dashboard)/admin/users/page.tsx
frontend/src/app/(dashboard)/admin/custom-fields/page.tsx
frontend/src/app/(dashboard)/admin/personnel/page.tsx
frontend/src/app/(dashboard)/admin/backups/page.tsx
frontend/src/app/(dashboard)/admin/audit/page.tsx
frontend/src/app/(dashboard)/admin/erp-connectors/page.tsx
frontend/src/app/(dashboard)/dispatch/page.tsx
frontend/src/app/(dashboard)/maintenance/page.tsx
frontend/src/app/(dashboard)/admin/settings/page.tsx
frontend/src/app/(dashboard)/reports/analytics/page.tsx
```

---

# FASE 0: DESIGN SYSTEM TOKENS — CORRECCIÓN BASE

## Tarea 0.1: Corregir border-radius en globals.css

**Problema (CRIT-GLOBAL-RAD-01):** Todos los valores de border-radius están desplazados -1 nivel vs DESIGN.md.

**Archivo:** `frontend/src/app/globals.css`

**Cambios:**
```css
/* ANTES (incorrecto) */
--radius-xs: 4px;
--radius-sm: 6px;
--radius-md: 8px;
--radius-lg: 12px;
--radius-xl: 16px;

/* DESPUÉS (alineado con DESIGN.md) */
--radius-xs: 6px;
--radius-sm: 8px;
--radius-md: 12px;
--radius-lg: 16px;
--radius-xl: 24px;
```

**Verificación:** `npm run typecheck && npm run build`

## Tarea 0.2: Corregir tokens de color de texto (light mode)

**Problema (CRIT-GLOBAL-TKN-01, varios):** `--text-primary` usa `#1A1A1A` en vez de `#0F172A`, `--text-soft` usa `#2E2E2E` en vez de `#475569`.

**Archivo:** `frontend/src/app/globals.css` (sección :root)

**Cambios:**
```css
/* ANTES */
--color-ink: #1a1a1a;         /* text-primary */
--color-charcoal: #2e2e2e;     /* text-soft */
--color-steel: #808080;         /* text-muted */

/* DESPUÉS — alineado con DESIGN.md */
--color-ink: #0F172A;           /* text-primary — slate-900 */
--color-charcoal: #475569;      /* text-soft — slate-600 */
--color-steel: #64748B;         /* text-muted — slate-500 */
```

## Tarea 0.3: Corregir tokens semánticos (warning, danger)

**Problema:** `--warning` usa `#D97706` en vez de `#F59E0B`, `--danger` usa `#DC2626` en vez de `#EF4444`.

**Archivo:** `frontend/src/app/globals.css`

**Cambios:**
```css
/* ANTES */
--color-brand-warn: #d97706;    /* warning */
--color-brand-error: #dc2626;   /* danger */

/* DESPUÉS — alineado con DESIGN.md */
--color-brand-warn: #F59E0B;    /* amber-500 */
--color-brand-error: #EF4444;   /* red-500 */
```

## Tarea 0.4: Renombrar `--color-brand-green` → `--color-brand-blue`

**Problema (CRIT-GLOBAL-TKN-01):** `--color-brand-green` contiene el color AZUL `#2154A6` (Cermont Blue), causando confusión en todo el código.

**Archivo:** `frontend/src/app/globals.css`

**Cambios:**
```css
/* ANTES (engañoso) */
--color-brand-green: #2154a6;  /* ¡Esto es AZUL! */

/* DESPUÉS */
--color-brand-blue: #2154A6;   /* Cermont Blue */
--color-brand-blue-deep: #0f2c59;

/* Actualizar alias */
--color-cermont-blue: var(--color-brand-blue);
--color-brand: var(--color-brand-blue);
```

> **⚠️ ATENCIÓN:** Este rename tiene alto impacto. Tras cambiarlo, buscar y reemplazar en TODOS los archivos:
> - `bg-brand-green` → `bg-brand-blue`
> - `text-brand-green` → `text-brand-blue`
> - `border-brand-green` → `border-brand-blue`
> - `ring-brand-green` → `ring-brand-blue`

```bash
# Búsqueda y reemplazo en todos los archivos .tsx, .css, .ts
ast-grep --pattern 'brand-green' --rewrite 'brand-blue' --lang tsx
ast-grep --pattern 'brand-green' --rewrite 'brand-blue' --lang css
```

## Tarea 0.5: Agregar escala tipográfica completa como variables CSS

**Problema (DS-GLOBAL-TYPO-01):** La escala tipográfica de DESIGN.md no está traducida a variables CSS.

**Archivo:** `frontend/src/app/globals.css` (sección :root)

**Cambios — Agregar:**
```css
/* Escala tipográfica DESIGN.md §6 */
--text-display-xl: 52px;
--text-display-lg: 40px;
--text-h1: 32px;
--text-h2: 24px;
--text-h3: 20px;
--text-h4: 18px;
--text-body-lg: 16px;
--text-body-md: 14px;
--text-body-sm: 13px;
--text-caption: 12px;
--text-micro: 11px;
```

## Tarea 0.6: Agregar shadow-brand faltante

**Problema (DS-GLOBAL-SHD-01):** `--shadow-brand` de DESIGN.md no tiene equivalente directo.

**Archivo:** `frontend/src/app/globals.css`

**Cambios — Agregar:**
```css
--shadow-brand: 0 10px 30px rgba(33, 84, 166, 0.10);
```

## Tarea 0.7: Corregir variable --warning en dark mode

**Problema:** Dark mode usa `--color-brand-warn: #fbbf24` y `--color-brand-error: #ef4444` — estos están correctos.

**Archivo:** `frontend/src/app/globals.css` (sección .dark)

**Verificación:** No hay cambio necesario. Confirmar que dark mode mantiene `#fbbf24` y `#ef4444`. ✅

---

# FASE 1: THEME SYSTEM — LIGHT MODE COMO DEFAULT

## Tarea 1.1: Crear ThemeProvider

**Problema (CRIT-GLOBAL-MODE-01):** Sistema corre en dark mode como único modo. No hay light mode.

**Archivos:**
- `frontend/src/lib/theme/ThemeProvider.tsx` (NUEVO)
- `frontend/src/app/providers.tsx` (MODIFICAR)
- `frontend/src/lib/theme/theme-init-script.ts` (MODIFICAR)

**ThemeProvider.tsx:**
```tsx
"use client";

import { createContext, useCallback, useContext, useEffect, useState, type ReactNode } from "react";

type Theme = "light" | "dark";

interface ThemeContextValue {
  theme: Theme;
  toggleTheme: () => void;
  setTheme: (theme: Theme) => void;
}

const ThemeContext = createContext<ThemeContextValue | null>(null);

const STORAGE_KEY = "cermont-theme";

function getInitialTheme(): Theme {
  if (typeof window === "undefined") return "light";
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored === "light" || stored === "dark") return stored;
  } catch {}
  // DESIGN.md §2.1: "Light-first con soporte dark real"
  return "light";
}

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setThemeState] = useState<Theme>(getInitialTheme);

  const applyTheme = useCallback((t: Theme) => {
    document.documentElement.classList.toggle("dark", t === "dark");
    document.documentElement.style.colorScheme = t;
    try {
      localStorage.setItem(STORAGE_KEY, t);
    } catch {}
  }, []);

  const toggleTheme = useCallback(() => {
    setThemeState((prev) => {
      const next = prev === "light" ? "dark" : "light";
      applyTheme(next);
      return next;
    });
  }, [applyTheme]);

  const setTheme = useCallback((t: Theme) => {
    setThemeState(t);
    applyTheme(t);
  }, [applyTheme]);

  useEffect(() => {
    applyTheme(theme);
  }, [theme, applyTheme]);

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme, setTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error("useTheme must be used within ThemeProvider");
  return ctx;
}
```

**theme-init-script.ts (modificar):**
```typescript
export const THEME_INIT_SCRIPT = `(() => {
  var storedTheme = null;
  try {
    storedTheme = localStorage.getItem("cermont-theme");
  } catch (error) {}
  // DESIGN.md §2.1: Light-first. Default = light si no hay preferencia almacenada.
  document.documentElement.classList.toggle(
    "dark",
    storedTheme === "dark",
  );
})();`;
```

**providers.tsx (agregar ThemeProvider al wrapper):**
```tsx
import { ThemeProvider } from "@/lib/theme/ThemeProvider";

// Envolver children con <ThemeProvider> antes de otros providers
```

## Tarea 1.2: Agregar botón de toggle tema funcional en Header

**Problema (IMP-GLOBAL-MODE-02):** El botón de "Cambiar tema" existe pero no activa nada.

**Archivo:** `frontend/src/modules/core/ui/layout/Header.tsx`

**Cambios:**
- Importar `useTheme` de `@/lib/theme/ThemeProvider`
- En el botón de tema, conectar `toggleTheme`
- Usar icono `Sun`/`Moon` según tema actual
- Agregar `aria-label="Cambiar a modo {claro/oscuro}"`

```tsx
const { theme, toggleTheme } = useTheme();
// ...
<button
  type="button"
  onClick={toggleTheme}
  aria-label={`Cambiar a modo ${theme === 'light' ? 'oscuro' : 'claro'}`}
>
  {theme === 'light' ? <Moon className="size-4" /> : <Sun className="size-4" />}
</button>
```

---

# FASE 2: COMPONENTES BASE — BUTTON, CARD, PAGEHEADER

## Tarea 2.1: Crear variantes de botones faltantes

**Problema (CRIT-GLOBAL-BTN-01):** Solo existe `.btn-primary`. Faltan `.btn-secondary`, `.btn-ghost`, `.btn-danger`.

**Archivo:** `frontend/src/app/globals.css` (sección @layer components)

**Cambios — Agregar:**
```css
.btn-secondary {
  @apply flex items-center justify-center gap-2 rounded-full border border-hairline bg-transparent px-5 py-2.5 text-sm font-semibold text-ink;
  @apply transition-[background-color,box-shadow,opacity] duration-200 ease-out;
  @apply hover:bg-surface;
}

.btn-ghost {
  @apply flex items-center justify-center gap-2 rounded-full bg-transparent px-4 py-2 text-sm font-medium text-slate;
  @apply transition-[background-color,opacity] duration-200 ease-out;
  @apply hover:bg-surface hover:text-ink;
}

.btn-danger {
  @apply flex items-center justify-center gap-2 rounded-full bg-brand-error px-5 py-2.5 text-sm font-semibold text-on-dark;
  @apply transition-[background-color,box-shadow,opacity,transform] duration-200 ease-out;
}

.btn-success {
  @apply flex items-center justify-center gap-2 rounded-full bg-brand-annotate px-5 py-2.5 text-sm font-semibold text-on-dark;
  @apply transition-[background-color,box-shadow,opacity,transform] duration-200 ease-out;
}
```

## Tarea 2.2: Crear variantes de card faltantes

**Problema (CRIT-GLOBAL-CARD-01):** Faltan `.card-soft`, `.card-highlight`, `.card-empty`.

**Archivo:** `frontend/src/app/globals.css` (sección @layer components)

**Cambios — Agregar:**
```css
.card-soft {
  @apply rounded-xl bg-surface border border-hairline p-5;
}

.card-highlight {
  @apply rounded-xl bg-canvas border-2 border-brand-blue p-6;
  box-shadow: var(--shadow-brand);
  /* Acento superior */
  background-image: linear-gradient(to top, transparent 90%, var(--color-brand-blue) 90%, var(--color-brand-blue) 100%);
  background-size: 100% 4px;
  background-repeat: no-repeat;
  background-position: top;
}

.card-empty {
  @apply flex flex-col items-center justify-center rounded-xl border border-dashed border-hairline-strong bg-surface-soft px-6 py-12 text-center;
}

/* Actualizar card-dashboard para usar brand-blue */
.card-dashboard {
  @apply rounded-xl border-2 border-brand-blue bg-canvas p-4;
}
.card-dashboard-value {
  @apply text-2xl font-bold text-brand-blue;
}
```

## Tarea 2.3: Crear componente PageHeader

**Problema (GLOBAL-08):** ~25/36 páginas sin icono contextual circular en header.

**Archivo:** `frontend/src/components/ui/PageHeader.tsx` (NUEVO)

**Componente:**
```tsx
import type { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface PageHeaderProps {
  icon?: LucideIcon;
  iconBg?: string;        // ej: "bg-brand-blue/10 text-brand-blue"
  title: string;
  description?: string;
  children?: React.ReactNode;  // acciones/ botones
  className?: string;
}

export function PageHeader({
  icon: Icon,
  iconBg = "bg-brand-blue/10 text-brand-blue",
  title,
  description,
  children,
  className,
}: PageHeaderProps) {
  return (
    <div className={cn("flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between", className)}>
      <div className="flex items-center gap-3">
        {Icon && (
          <div className={cn("flex size-11 items-center justify-center rounded-full", iconBg)}>
            <Icon className="size-5" aria-hidden="true" />
          </div>
        )}
        <div>
          <h1 className="text-h1 font-bold text-ink">{title}</h1>
          {description && (
            <p className="mt-0.5 text-body-sm text-charcoal">{description}</p>
          )}
        </div>
      </div>
      {children && (
        <div className="flex items-center gap-2">{children}</div>
      )}
    </div>
  );
}
```

**Mapa de iconos por módulo:**
```tsx
export const PAGE_HEADER_CONFIG = {
  "service-cases":    { icon: Kanban,      iconBg: "bg-brand-blue/10 text-brand-blue" },
  "work-requests":    { icon: FileText,    iconBg: "bg-brand-blue/10 text-brand-blue" },
  "site-visits":      { icon: MapPin,      iconBg: "bg-brand-annotate/10 text-brand-annotate" },
  "proposals":        { icon: FileSpreadsheet, iconBg: "bg-brand-blue/10 text-brand-blue" },
  "purchase-orders":  { icon: ShoppingCart,iconBg: "bg-brand-blue/10 text-brand-blue" },
  "orders":           { icon: ClipboardList,iconBg: "bg-brand-blue/10 text-brand-blue" },
  "planning":         { icon: CalendarCheck,iconBg: "bg-brand-annotate/10 text-brand-annotate" },
  "execution":        { icon: PlayCircle,  iconBg: "bg-brand-annotate/10 text-brand-annotate" },
  "evidences":        { icon: Camera,      iconBg: "bg-brand-annotate/10 text-brand-annotate" },
  "dispatch":         { icon: Truck,       iconBg: "bg-brand-blue-deep/10 text-brand-blue-deep" },
  "maintenance":      { icon: Wrench,      iconBg: "bg-brand-warn/10 text-brand-warn" },
  "sla":              { icon: Timer,       iconBg: "bg-brand-warn/10 text-brand-warn" },
  "reports":          { icon: FileBarChart,iconBg: "bg-brand-annotate/10 text-brand-annotate" },
  "delivery-records": { icon: FileSignature,iconBg: "bg-brand-warn/10 text-brand-warn" },
  "billing":          { icon: Receipt,     iconBg: "bg-brand-annotate/10 text-brand-annotate" },
  "billing-ses":      { icon: FileCheck,   iconBg: "bg-brand-annotate/10 text-brand-annotate" },
  "billing-invoices": { icon: DollarSign,  iconBg: "bg-brand-annotate/10 text-brand-annotate" },
  "payments":         { icon: CreditCard,  iconBg: "bg-brand-annotate/10 text-brand-annotate" },
  "costs":            { icon: TrendingDown,iconBg: "bg-brand-warn/10 text-brand-warn" },
  "documents":        { icon: FolderOpen,  iconBg: "bg-brand-blue/10 text-brand-blue" },
  "templates":        { icon: FileJson,    iconBg: "bg-brand-blue/10 text-brand-blue" },
  "resources":        { icon: Package,     iconBg: "bg-brand-blue-deep/10 text-brand-blue-deep" },
  "inventory":        { icon: PackageSearch,iconBg: "bg-brand-blue-deep/10 text-brand-blue-deep" },
  "fleet":            { icon: Truck,       iconBg: "bg-brand-blue-deep/10 text-brand-blue-deep" },
  "assets":           { icon: Building2,   iconBg: "bg-brand-blue-deep/10 text-brand-blue-deep" },
  "customers":        { icon: Users,       iconBg: "bg-brand-blue/10 text-brand-blue" },
  "admin-users":      { icon: UserCog,     iconBg: "bg-brand-blue-deep/10 text-brand-blue-deep" },
  "admin-settings":   { icon: Settings,    iconBg: "bg-brand-blue-deep/10 text-brand-blue-deep" },
  "admin-audit":      { icon: ScrollText,  iconBg: "bg-brand-blue-deep/10 text-brand-blue-deep" },
};
```

## Tarea 2.4: Refactorizar EmptyState con iconos contextuales

**Problema (CRIT-GLOBAL-03):** Mismo empty state genérico en todas las páginas.

**Archivo:** 
- `frontend/src/core/ui/EmptyStateIllustration.tsx`
- `frontend/src/core/ui/EmptyState.tsx`

**Cambios en EmptyStateIllustration.tsx:**
Agregar nuevos tipos de ilustraciones semánticas:

```tsx
export type EmptyStateKind =
  | "generic"
  | "service-cases"
  | "site-visits"
  | "orders"
  | "sla"
  | "assets"
  | "fleet"
  | "inventory"
  | "documents"
  | "evidences"
  | "reports";
```

Mapeo de iconos semánticos (reemplazar el cuadro oscuro genérico):
- `service-cases` → icono `Kanban` + color azul
- `site-visits` → icono `MapPin` + color verde
- `orders` → icono `ClipboardList` + color azul
- `sla` → icono `Timer` + color warning
- `assets` → icono `Package` + color navy
- `fleet` → icono `Truck` + color navy
- `inventory` → icono `PackageSearch` + color navy
- `documents` → icono `FolderOpen` + color slate
- `evidences` → icono `Camera` + color verde

**Cambios:** Eliminar el cuadro oscuro con puntos verdes decorativos. Cada módulo muestra su icono semántico en contenedor circular suave + título + descripción + CTA.

---

# FASE 3: DASHBOARD REFACTOR

## Tarea 3.1: Unificar DashboardHero en card única 60/40

**Problema (CRIT-DASH-HERO-01):** El hero no es una card unificada. Los KPIs están flotando separados.

**Archivo:** `frontend/src/modules/dashboard/ui/DashboardHero.tsx`

**Cambios:**
- Convertir el header en una `card-highlight` de ancho completo
- Layout interno de 2 columnas: 60% texto (saludo, métricas contextuales) + 40% KPIs compactos
- Agregar `border-t-2 border-brand-blue` como acento superior
- Los KPIs deben estar DENTRO de la card, no afuera
- Mantener gradiente sutil de fondo

```tsx
// Estructura objetivo:
<section className="card-highlight relative overflow-hidden">
  {/* Subtle gradient */}
  <div className="pointer-events-none absolute inset-0 opacity-[0.04]" />
  
  <div className="relative flex flex-col gap-6 lg:flex-row">
    {/* 60% — Greeting + Context */}
    <div className="lg:w-3/5">
      <span className="text-micro font-semibold uppercase tracking-wider text-brand-blue">
        <Calendar className="inline size-3 mr-1" />
        {todayLabel}
      </span>
      <h1 className="mt-2 text-display-lg font-bold text-ink">
        Pulso Operativo de Cermont
      </h1>
      <p className="mt-1 text-body-md text-charcoal">
        {greeting}, {userName} · <span className="capitalize">{role}</span>
      </p>
      {/* Quick actions */}
    </div>
    
    {/* 40% — KPIs compactos */}
    <div className="flex flex-wrap gap-4 lg:w-2/5 lg:justify-end">
      {metrics.map((m) => (
        <div key={m.label} className="flex items-center gap-3 rounded-md border border-hairline bg-surface px-4 py-3 min-w-[140px]">
          <div className="flex size-10 items-center justify-center rounded-full bg-brand-blue/10 text-brand-blue">
            <m.icon className="size-5" />
          </div>
          <div>
            <p className="text-xl font-bold text-ink">{formatMetric(m.value)}</p>
            <p className="text-caption text-charcoal">{m.label}</p>
          </div>
        </div>
      ))}
    </div>
  </div>
</section>
```

## Tarea 3.2: Agregar barra de progreso vs meta a KPICard

**Problema (CRIT-DASH-KPICARD-01):** KPICard no tiene barra de progreso contra meta (DESIGN.md §12).

**Archivo:** `frontend/src/modules/dashboard/ui/KPICard.tsx`

**Cambios — Agregar prop `progress` opcional:**
```tsx
interface KPICardProps {
  // ...props existentes
  progress?: {
    current: number;
    target: number;
    unit?: string;     // "m", "%", "unidades"
    label?: string;    // "Meta: 1,500 m"
  };
}
```

**Nuevo componente KpiProgress dentro del archivo:**
```tsx
function KpiProgress({ current, target, unit, label }: {
  current: number;
  target: number;
  unit?: string;
  label?: string;
}) {
  const pct = Math.min(Math.round((current / target) * 100), 100);
  return (
    <div className="mt-3">
      <div className="flex items-center justify-between text-[11px] font-medium">
        <span className="text-ink">
          {current.toLocaleString()} {unit}
        </span>
        <span className="text-charcoal">{label || `${pct}%`}</span>
      </div>
      <div className="mt-1 h-1.5 w-full rounded-full bg-surface-soft">
        <div
          className="h-full rounded-full bg-brand-blue transition-all duration-500"
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
}
```

**También corregir:**
- Reemplazar `rounded-[24px]` hardcodeado por `rounded-xl` (variable CSS)
- Cambiar contenedor de icono de `rounded-2xl` a `rounded-full` (circular)
- Agregar prop `alert` opcional para mostrar alerta configurable

## Tarea 3.3: Corregir tamaño del título h1 en dashboard

**Problema (CRIT-DASH-HDR-01):** Título usa `text-xl` (20px) en vez de `text-h1` (32px).

**Archivo:** `frontend/src/app/(dashboard)/dashboard/page.tsx`

**Cambios:**
- Cambiar `className="text-xl font-semibold"` → `className="text-h1 font-bold"`
- Usar la nueva variable `--text-h1` o clase `text-h1`

## Tarea 3.4: Reemplazar filtros de fecha con DateRangePicker

**Problema (CRIT-DASH-DATE-01):** Filtros de fecha usan inputs `type="number"` separados Día/Mes/Año.

**Archivo:** `frontend/src/modules/dashboard/ui/DashboardFilters.tsx`

**Cambios:**
- Reemplazar los 3 inputs number por shadcn/ui `DateRangePicker` o `react-day-picker`
- Usar `Calendar` componente con rango seleccionable
- Mantener estado de rango actual

## Tarea 3.5: Corregir nombre de usuario en bienvenida

**Problema (🟡 DASH-03):** "Bienvenido de vuelta , Gerencia General" — coma aparece sin nombre cuando `user.firstName` es undefined.

**Archivo:** `frontend/src/modules/dashboard/ui/DashboardHero.tsx`

**Cambios:**
```tsx
// Línea 56: actualizar safeUserName
const safeUserName = userName?.trim() || "usuario";

// También en el DashboardPage line 360:
// const userName = user?.name?.split(" ").slice(0, 2).join(" ") || "Usuario";
// Cambiar a:
const userName = user?.name?.trim() 
  || user?.fullName?.trim() 
  || user?.email?.split("@")[0] 
  || "Usuario";
```

---

# FASE 4: PAGE-BY-PAGE VISUAL FIXES

## Tarea 4.1: Corregir títulos h1 que usan text-blue-500

**Problema (CRIT-GLOBAL-02):** Títulos h1 en azul en service-cases, proposals, delivery-records, billing.

**Archivos a modificar (aproximadamente 10):**

1. `frontend/src/app/(dashboard)/service-cases/page.tsx`
   - Buscar: `<h1 className="text-blue-500">` → `<h1 className="text-ink font-bold text-h1">`
   
2. `frontend/src/app/(dashboard)/proposals/page.tsx`
   - Idem

3. `frontend/src/app/(dashboard)/delivery-records/page.tsx`
   - Idem

4. `frontend/src/app/(dashboard)/billing/page.tsx`
   - Idem

5. `frontend/src/app/(dashboard)/billing/ses/page.tsx`
   - Idem

6. `frontend/src/app/(dashboard)/billing/invoices/page.tsx`
   - Idem

**Patrón de búsqueda (grep):**
```bash
grep -rn 'text-blue-500\|text-blue-600\|text-cermont-blue' --include="*.tsx" frontend/src/app/ | grep 'h1\|h2\|className="[^"]*text-blue'
```

**Reemplazar:**
```tsx
// MAL
<h1 className="text-blue-500 text-2xl font-bold">Título</h1>
// BIEN
<h1 className="text-ink font-bold text-h1">Título</h1>
```

## Tarea 4.2: Agregar PageHeader con icono a páginas que faltan

**Problema (GLOBAL-08):** ~25/36 páginas sin icono contextual circular en header.

**Archivos a modificar (todos los page.tsx sin icono):**

```
customers/page.tsx          → icon: Users
work-requests/page.tsx      → icon: FileText
orders/page.tsx             → icon: ClipboardList
planning/page.tsx           → icon: CalendarCheck
execution/page.tsx          → icon: PlayCircle
evidences/page.tsx          → icon: Camera
reports/page.tsx            → icon: FileBarChart
payments/page.tsx           → icon: CreditCard
maintenance/page.tsx        → icon: Wrench
admin/users/page.tsx        → icon: UserCog
admin/personnel/page.tsx    → icon: BadgeCheck
admin/backups/page.tsx      → icon: Database
```

**Patrón de implementación en cada page.tsx:**
```tsx
import { PageHeader } from "@/components/ui/PageHeader";
import { PAGE_HEADER_CONFIG } from "@/components/ui/PageHeader";

export default function Page() {
  const config = PAGE_HEADER_CONFIG["orders"];
  
  return (
    <div className="space-y-6">
      <PageHeader
        icon={config.icon}
        iconBg={config.iconBg}
        title="Órdenes de Trabajo"
        description="Listado maestro de intervenciones técnicas en campo."
      />
      {/* resto del contenido */}
    </div>
  );
}
```

## Tarea 4.3: Corregir breadcrumb duplicado

**Problema (CRIT-GLOBAL-04):** ~20/36 páginas muestran el mismo texto arriba (topbar) y abajo (breadcrumb).

**Archivo:** `frontend/src/modules/core/ui/layout/Header.tsx`

**Cambios:**
- El Header (topbar) debe mostrar SOLO el nombre del módulo activo en bold
- El breadcrumb (segunda línea) debe ser la ruta jerárquica con separador `/`
- Cuando no hay sub-ruta, el breadcrumb no debe repetir el título del módulo

```tsx
// Topbar — solo nombre del módulo
<header className="sticky top-0 z-30">
  <div className="flex items-center justify-between px-6 py-3">
    <div>
      <span className="text-sm font-bold text-ink">{currentModuleName}</span>
      {/* Breadcrumb solo si es sub-ruta */}
      {isSubRoute && (
        <div className="flex items-center gap-1 text-xs text-slate">
          <Link href="/dashboard">Dashboard</Link>
          <span>/</span>
          <span className="text-charcoal">{currentPageName}</span>
        </div>
      )}
    </div>
    {/* Theme toggle + actions */}
  </div>
</header>
```

## Tarea 4.4: Corregir labels de paso en azul → text-muted-foreground

**Problema (GLOBAL-06):** "PASO 2 / OPERACIÓN", "ADMINISTRACIÓN" en text-blue-500 siendo texto informativo.

**Archivos a buscar y reemplazar:**
```bash
# Buscar patrones de labels en azul
grep -rn 'PASO\|ADMINISTRACIÓN\|CATÁLOGO\|GESTIÓN' --include="*.tsx" frontend/src/app/ | grep -i 'blue'
```

**Archivos típicos:**
- `purchase-orders/page.tsx`
- `site-visits/page.tsx`
- `execution/page.tsx`
- `planning/page.tsx`

**Reemplazar:**
```tsx
// MAL
<span className="text-blue-500 text-micro font-semibold uppercase">PASO 2 / OPERACIÓN</span>
// BIEN
<span className="text-slate text-micro font-semibold uppercase">PASO 2 / OPERACIÓN</span>
```

## Tarea 4.5: Estandarizar botones CTA primarios a pill

**Problema (GLOBAL-07):** Mezcla de rounded-full (pill) y rounded-md en botones primarios.

**Archivos a modificar:**

1. **`site-visits/page.tsx`** — "Nueva visita →" usa rounded-md
   ```tsx
   // CAMBIAR
   <button className="rounded-md ...">Nueva visita →</button>
   // A
   <button className="btn-primary"><Plus size={14} /> Nueva visita</button>
   ```

2. **`purchase-orders/page.tsx`** — "Nueva PO →" usa rounded-md
   ```tsx
   <button className="btn-primary"><Plus size={14} /> Nueva PO</button>
   ```

3. **`billing/page.tsx`** — 3 botones sin jerarquía
   ```tsx
   // Un solo botón primary, los otros secondary/ghost
   <Button variant="primary">Subir soporte</Button>
   <Button variant="secondary">Revisar actas</Button>
   <Button variant="ghost">Ver costos</Button>
   ```

4. **Reemplazar flechas inline "→" por iconos Lucide:**
   ```tsx
   // MAL
   <span>Nueva visita →</span>
   // BIEN
   <span>Nueva visita <ArrowRight size={14} className="inline" /></span>
   ```

---

# FASE 5: SIDEBAR & NAVIGATION

## Tarea 5.1: Agregar color semántico a iconos del sidebar

**Problema (GLOBAL-10):** Todos los iconos del sidebar son del mismo color gris uniforme.

**Archivo:** 
- `frontend/src/modules/core/ui/layout/Sidebar.tsx`
- `frontend/src/modules/core/navigation.tsx`

**Cambios en navigation.tsx:**

Agregar campo `iconColor` a NavigationItem:
```tsx
interface NavigationItem {
  to: string;
  label: string;
  icon: LucideIcon;
  iconColor?: string;     // NUEVO — color semántico
  badge?: number;
}
```

Mapeo de colores por grupo:
```tsx
const SIDEBAR_ICON_COLORS: Record<string, string> = {
  "PRINCIPAL": "text-brand-blue",
  "COMERCIAL": "text-brand-blue-light",
  "OPERACIÓN DE CAMPO": "text-brand-annotate",
  "CIERRE TÉCNICO": "text-brand-warn",
  "CIERRE ADMINISTRATIVO": "text-emerald-400",
  "TRANSVERSALES": "text-slate-400",
  "ADMINISTRACIÓN": "text-brand-blue-deep",
};
```

**Cambios en Sidebar.tsx:**

En `SidebarNavItem`, aplicar `iconColor` al icono:
```tsx
<Icon
  className={cn(
    "size-4.5 shrink-0 transition-transform",
    isActive 
      ? "scale-110 text-brand" 
      : item.iconColor || "text-muted-foreground group-hover:text-foreground"
  )}
  aria-hidden="true"
/>
```

## Tarea 5.2: Contextualizar FAB "Carga rápida"

**Problema (GLOBAL-05):** FAB "Carga rápida" aparece en las 36 páginas, incluyendo donde no aplica.

**Archivo:** `frontend/src/components/common/QuickUploadPanel.tsx`

**Cambios:**
- Agregar lista blanca de rutas donde el FAB es relevante
- Ocultar en páginas donde no aplica (SLA, ERP, respaldos, auditoría)

```tsx
const QUICK_UPLOAD_ENABLED_PATHS = [
  '/orders', '/execution', '/planning', '/documents',
  '/evidences', '/delivery-records', '/invoices', '/fleet',
  '/inventory', '/work-requests', '/site-visits',
];

// En el componente:
const pathname = usePathname();
const isFabVisible = QUICK_UPLOAD_ENABLED_PATHS.some(p => pathname.startsWith(p));

if (!isFabVisible && !isOpen) return null;  // No renderizar nada
```

---

# FASE 6: KPI CONTEXTUALIZATION

## Tarea 6.1: Refactorizar KPIs genéricos a KPIs contextuales CERMONT

**Problema (IMP-DASH-KPI-02):** KPIs "AI-looking" genéricos (Órdenes Activas, Recursos en Uso, Ingresos del Mes).

**Archivo:** `frontend/src/modules/dashboard/model/dashboard-helpers.ts`

**Cambios — Agregar funciones para KPIs contextuales:**

Siguiendo PROMPT_MEJORA_KPIS_E_IMPLEMENTACION_DESIGN.md:

```typescript
// KPIs contextuales por dominio CERMONT real
export interface ContextualKpi {
  label: string;         // "Líneas de vida instaladas"
  value: number;
  unit?: string;         // "m", "und", "%"
  icon: LucideIcon;
  domain: 'lifeline' | 'cctv' | 'anchor' | 'hse' | 'execution' | 'cost';
  trend?: { value: number; isPositive: boolean };
  progress?: { current: number; target: number };
  alert?: { severity: 'warning' | 'danger' | 'info'; message: string };
}

// Reemplazar KPIs genéricos:
export function buildContextualKpis(
  demand: ServiceDemand,
  readiness: FieldReadiness
): ContextualKpi[] {
  return [
    {
      label: "Líneas de vida instaladas",
      value: demand.activeLifelineInstallations,
      unit: "m",
      icon: LifeBuoy,
      domain: "lifeline",
      progress: { current: demand.activeLifelineInstallations, target: demand.lifelineMonthlyTarget },
    },
    {
      label: "Hallazgos críticos abiertos",
      value: readiness.criticalFindingsOpen,
      icon: AlertTriangle,
      domain: "hse",
      alert: readiness.criticalFindingsOpen > 3 
        ? { severity: "danger", message: "Supera umbral de 3 hallazgos críticos" }
        : undefined,
    },
    {
      label: "Días sin accidentes",
      value: readiness.daysWithoutIncident,
      unit: "días",
      icon: ShieldCheck,
      domain: "hse",
      trend: { value: 5, isPositive: true },
    },
    {
      label: "Técnicos certificados ALTURA",
      value: readiness.certifiedHeightTechnicians,
      unit: `de ${readiness.totalTechnicians}`,
      icon: HardHat,
      domain: "execution",
    },
  ];
}
```

## Tarea 6.2: Crear KPI schemas compartidos (opcional)

Si se desea persistencia y endpoints dedicados, crear schemas Zod:

```
packages/shared-types/src/schemas/
├── kpi-lifeline.schema.ts     → LifelineKpiSchema
├── kpi-hse.schema.ts          → HseKpiSchema
├── kpi-execution.schema.ts    → ExecutionKpiSchema
├── kpi-cctv.schema.ts         → CctvKpiSchema
├── kpi-anchors.schema.ts      → AnchorKpiSchema
├── kpi-cost.schema.ts         → CostKpiSchema
└── kpi-dashboard.schema.ts    → CermontDashboardKpiSchema
```

(Ver PROMPT_MEJORA_KPIS_E_IMPLEMENTACION_DESIGN.md §2 para schemas detallados)

---

# FASE 7: STEPTIMELINE ENHANCEMENT

## Tarea 7.1: Mejorar StepTimeline con 4 estados visuales

**Problema (🟡 DASH-05):** Cards del flujo de 14 pasos solo muestran paso 01 con borde verde activo. Pasos 02-14 tienen `○` sin significado claro.

**Archivo:** `frontend/src/modules/dashboard/ui/StepTimeline.tsx`

**Cambios — Sistema de 4 estados:**

```typescript
type StepState = "sin-datos" | "activo" | "completado" | "bloqueado";

const STEP_STATE_STYLES: Record<StepState, string> = {
  "sin-datos": "border-dashed border-hairline opacity-60",
  "activo":    "border-2 border-brand-blue ring-1 ring-brand-blue/20 shadow-sm",
  "completado": "border-2 border-brand-annotate bg-brand-annotate/5",
  "bloqueado":  "border-2 border-brand-error bg-brand-error/5",
};
```

Para cada paso, determinar estado basado en `stepDistribution`:
```typescript
function getStepState(stepCode: string, count: number, activeStep: string | null): StepState {
  if (stepCode === activeStep) return "activo";
  if (count > 0) return "completado";  // Tiene casos en ese paso o posteriores
  return "sin-datos";
  // Si hay blocker asociado al paso → "bloqueado"
}
```

**Visual de cada estado:**
- `sin-datos`: Borde dashed gris, opacidad reducida, contador "—"
- `activo`: Borde azul sólido 2px, badge "ACTIVO →" con icono ArrowRight
- `completado`: Borde verde 2px, badge "✓ COMPLETADO" con Check
- `bloqueado`: Borde rojo 2px, badge "⛔ BLOQUEADO" con AlertTriangle

## Tarea 7.2: Agregar tabs de categoría (ya existen)

Verificar que los tabs "Todos / Comercial / Operativo / Cierre / Financiero" ya están implementados en StepTimeline.

**Verificación:** El código actual ya tiene `CategoryButton` con filtro por categoría. ✅ Ya implementado.

---

# FASE 8: FINAL POLISH & DEBUG

## Tarea 8.1: Reemplazar bullet decorativo en topbar

**Problema (GLOBAL-09):** `"SOLICITUDES DE TRABAJO • ARAUCA"` — bullet sin valor semántico.

**Archivo:** `frontend/src/modules/core/ui/layout/Header.tsx`

**Cambios:**
```tsx
// ANTES
<span>SOLICITUDES DE TRABAJO • ARAUCA</span>

// DESPUÉS
<div className="flex items-center gap-2">
  <span className="text-sm font-bold text-ink">Solicitudes de Trabajo</span>
  <Badge variant="outline" className="text-slate border-hairline">Arauca</Badge>
</div>
```

## Tarea 8.2: Corregir title tags genéricos

**Problema:** Dispatch y SLA tienen title "Cermont" genérico. Reports/analytics tiene mismo title que /reports.

**Archivos:**
- `frontend/src/app/(dashboard)/dispatch/page.tsx` → title: "Despacho"
- `frontend/src/app/(dashboard)/sla/page.tsx` → title: "SLA"
- `frontend/src/app/(dashboard)/reports/analytics/page.tsx` → title: "Analítica"

**Cambios — Agregar metadata:**
```tsx
export const metadata = {
  title: "Despacho",
};
```

## Tarea 8.3: Verificar rutas con redirects

**Problema (CRIT-PAY-01, CRIT-DOC-01):** `/payments` y `/documents` redirigen a `/maintenance` y `/sla`.

**Investigación:**
- Verificar si las páginas existen como archivos
- Verificar si hay redirects en `proxy.ts`
- Verificar middlewares o layouts que causen redirect

**Corrección posible:**
- Si las páginas existen pero hay redirect: corregir en proxy.ts
- Si las páginas NO existen: crear page.tsx placeholder con estado "En construcción"

## Tarea 8.4: Estandarizar colores en KPICard

**Problema (DS-DASH-KPI-01):** "Recursos en Uso" usa `color="indigo"` que no es semántico.

**Archivo:** `frontend/src/app/(dashboard)/dashboard/page.tsx`

**Cambios — Mapa semántico DESGIN.md §12:**
```tsx
// ANTES
<KPICard title="Recursos en Uso" ... color="indigo" />

// DESPUÉS
<KPICard title="Recursos en Uso" ... color="blue" />
// O mejor: usar los nuevos KPIs contextuales de Fase 6
```

## Tarea 8.5: Usar variables CSS en vez de valores hardcodeados

**Problema:** KPICard usa `rounded-[24px]` hardcodeado.

**Archivos a auditar (ast-grep):**
```bash
# Buscar valores hardcodeados que deberían ser variables:
ast-grep --pattern 'rounded-[$]' --lang tsx
ast-grep --pattern 'text-[$]size' --lang tsx  # tamaños fijos
ast-grep --pattern 'bg-[#$]' --lang tsx        # colores hardcodeados
```

**Reemplazar:**
- `rounded-[24px]` → `rounded-xl` (variable `--radius-xl: 24px`)
- `bg-[#2154A6]` → `bg-brand-blue`
- `text-[#4CAF50]` → `text-brand-annotate`
- `bg-[#1a4390]` → `bg-brand-blue-deep`

---

# FASE 9: COMPONENTES UI AVANZADOS — INNOVACIÓN

## Tarea 9.1: Crear componente Badge semántico reutilizable

**Problema:** No hay un componente Badge unificado que pueda usarse en todo el sistema.

**Archivo:** `frontend/src/components/ui/Badge.tsx` (NUEVO)

**Implementación:**
```tsx
import { cn } from "@/lib/utils";
import type { ReactNode } from "react";

type BadgeVariant = "success" | "warning" | "danger" | "info" | "neutral" | "brand";
type BadgeSize = "sm" | "md" | "lg";

interface BadgeProps {
  children: ReactNode;
  variant?: BadgeVariant;
  size?: BadgeSize;
  icon?: ReactNode;
  className?: string;
}

const VARIANT_STYLES: Record<BadgeVariant, string> = {
  success: "bg-success-bg text-brand-green-deep border border-brand-annotate/20",
  warning: "bg-warning-bg text-brand-warn border border-brand-warn/20",
  danger:  "bg-danger-bg text-brand-error border border-brand-error/20",
  info:    "bg-info-bg text-brand-tag border border-brand-tag/20",
  neutral: "bg-surface text-slate border border-hairline",
  brand:   "bg-brand-blue/10 text-brand-blue border border-brand-blue/20",
};

const SIZE_STYLES: Record<BadgeSize, string> = {
  sm: "px-1.5 py-0.5 text-[10px] font-mono",
  md: "px-2.5 py-1 text-[11px] font-semibold",
  lg: "px-3 py-1.5 text-xs font-bold",
};

export function Badge({ children, variant = "neutral", size = "md", icon, className }: BadgeProps) {
  return (
    <span className={cn(
      "inline-flex items-center gap-1 rounded-full whitespace-nowrap",
      VARIANT_STYLES[variant],
      SIZE_STYLES[size],
      className
    )}>
      {icon && <span className="size-3">{icon}</span>}
      {children}
    </span>
  );
}
```

## Tarea 9.2: Crear componente MetricDelta para tendencias

**Problema:** DESIGN.md §18 lista `MetricDelta` como componente requerido que no existe como componente independiente.

**Archivo:** `frontend/src/components/ui/MetricDelta.tsx` (NUEVO)

```tsx
import { cn } from "@/lib/utils";
import { Minus, TrendingDown, TrendingUp } from "lucide-react";

type DeltaDirection = "up" | "down" | "flat";

interface MetricDeltaProps {
  value: number;
  direction: DeltaDirection;
  label?: string;
  size?: "sm" | "md" | "lg";
  className?: string;
}

const DIRECTION_STYLES: Record<DeltaDirection, string> = {
  up:   "text-brand-annotate bg-success-bg",
  down: "text-brand-error bg-danger-bg",
  flat: "text-slate bg-surface",
};

const DIRECTION_ICONS: Record<DeltaDirection, typeof TrendingUp> = {
  up:   TrendingUp,
  down: TrendingDown,
  flat: Minus,
};

export function MetricDelta({ value, direction, label, size = "sm", className }: MetricDeltaProps) {
  const Icon = DIRECTION_ICONS[direction];
  return (
    <output className={cn(
      "inline-flex items-center gap-1 rounded-full font-bold font-mono",
      DIRECTION_STYLES[direction],
      size === "sm" ? "px-2 py-0.5 text-[10px]" : "px-2.5 py-1 text-xs",
      className
    )}>
      <Icon className={size === "sm" ? "size-2.5" : "size-3"} aria-hidden="true" />
      {label ?? `${Math.abs(value)}%`}
    </output>
  );
}
```

## Tarea 9.3: Crear KpiGrid component responsive

**Problema:** No hay un wrapper grid para KPIs que maneje responsive automáticamente.

**Archivo:** `frontend/src/modules/dashboard/ui/KpiGrid.tsx` (NUEVO)

```tsx
import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

interface KpiGridProps {
  children: ReactNode;
  columns?: 2 | 3 | 4;
  className?: string;
  "aria-label"?: string;
}

const COLUMN_CLASSES: Record<number, string> = {
  2: "grid-cols-1 sm:grid-cols-2",
  3: "grid-cols-1 sm:grid-cols-2 xl:grid-cols-3",
  4: "grid-cols-1 sm:grid-cols-2 xl:grid-cols-4",
};

export function KpiGrid({ children, columns = 4, className, "aria-label": ariaLabel = "Indicadores clave" }: KpiGridProps) {
  return (
    <section aria-label={ariaLabel} className={cn("grid gap-4", COLUMN_CLASSES[columns], className)}>
      {children}
    </section>
  );
}
```

## Tarea 9.4: Agregar animación de entrada a componentes

**Problema:** No hay consistencia en las animaciones de entrada de componentes.

**Archivo:** `frontend/src/components/motion/motion-classes.ts` (o archivo existente)

**Cambios — Agregar clases de animación reutilizables:**

```tsx
// Agregar a MOTION existente:
export const MOTION = {
  // ... existentes
  fadeInUp: "animate-fade-in-up",
  fadeIn: "animate-fade-in",
  slideInLeft: "animate-slide-in-left",
  slideInRight: "animate-slide-in-right",
  scaleIn: "animate-scale-in",
};

// En globals.css agregar keyframes:
@keyframes fade-in-up {
  from { opacity: 0; transform: translateY(12px); }
  to { opacity: 1; transform: translateY(0); }
}
@keyframes fade-in {
  from { opacity: 0; }
  to { opacity: 1; }
}
@keyframes scale-in {
  from { opacity: 0; transform: scale(0.95); }
  to { opacity: 1; transform: scale(1); }
}

@layer utilities {
  .animate-fade-in-up { animation: fade-in-up 0.4s ease-out; }
  .animate-fade-in { animation: fade-in 0.3s ease-out; }
  .animate-scale-in { animation: scale-in 0.3s ease-out; }
}
```

## Tarea 9.5: Agregar skeleton states consistentes

**Problema:** Algunas páginas carecen de skeleton loading states.

**Archivo:** `frontend/src/core/ui/Skeleton.tsx`

**Verificar que existan estas variantes:**
- `Skeleton variant="kpi-card"` ✅ (ya existe)
- `Skeleton variant="card"` ✅ (ya existe)
- `Skeleton variant="chart"` ✅ (ya existe)
- `Skeleton variant="table-row"` ✅ (ya existe)
- `Skeleton variant="page-header"` — NUEVO
- `Skeleton variant="page-title"` — NUEVO

**Agregar:**
```tsx
pageHeader: "h-16 w-full rounded-xl bg-surface-soft animate-pulse",
pageTitle: "h-8 w-48 rounded-md bg-surface-soft animate-pulse",
```

---

# FASE 10: QA & BUILD VERIFICATION

## Tarea 10.1: Typecheck + Lint + Build

**Comandos a ejecutar DESPUÉS de cada tarea:**
```bash
# Por workspace
npm run typecheck -w frontend
npm run lint -w frontend
npm run build -w frontend

# Monorepo completo (después de Fase 8)
npm run typecheck
npm run lint
npm run build
npx react-doctor@latest
```

**Criterios de aceptación:**
- `npm run typecheck` → 0 errors (TypeScript strict, sin `any`, sin `unknown`)
- `npm run lint` → 0 warnings (Biome)
- `npm run build` → exitoso (frontend + backend + shared-types)
- `npx react-doctor@latest` → 0 issues (React best practices)

## Tarea 10.2: Visual QA — Light mode (default)

**Checklist de verificación visual:**

| # | Aspecto | Criterio |
|---|---------|----------|
| 1 | Fondo de página | `#FFFFFF` (blanco) |
| 2 | Cards KPI | Fondo blanco, borde 2px brand-blue, radius 16px |
| 3 | Títulos h1 | `#0F172A` (text-ink), font-bold, 32px |
| 4 | Texto cuerpo | `#475569` (text-charcoal), 14px |
| 5 | Texto muted | `#64748B` (text-slate) |
| 6 | Botón primary | `bg-brand-blue`, text white, rounded-full |
| 7 | Botón secondary | Transparente, border-hairline, rounded-full |
| 8 | Sidebar active | `bg-brand-blue/10`, text-brand-blue |
| 9 | Enlaces | `text-brand-blue`, hover underline |
| 10 | KPIs valores | `text-ink`, 30px bold, tracking-tight |
| 11 | Iconos circulares | size-11, rounded-full, bg suave (10% opacidad) |
| 12 | Badge success | `bg-success-bg`, text brand-green-deep, rounded-full |
| 13 | Badge warning | `bg-warning-bg`, text brand-warn, rounded-full |
| 14 | Badge danger | `bg-danger-bg`, text brand-error, rounded-full |
| 15 | Separadores | `border-hairline` #E2E8F0 |
| 16 | Inputs | bg white, border-hairline, focus ring brand-annotate |

## Tarea 10.3: Visual QA — Dark mode

**Checklist de verificación dark mode:**

| # | Aspecto | Criterio |
|---|---------|----------|
| 1 | Fondo de página | `#121212` |
| 2 | Cards | Fondo `#1A1A1A`, border `#2E2E2E` |
| 3 | Títulos | `#F5F5F5` |
| 4 | Texto cuerpo | `#A0A0A0` |
| 5 | Botón primary | `bg-brand-blue` (#3A78D8), rounded-full |
| 6 | Sidebar | Fondo `#121212`, active state `#3A78D8/20` |
| 7 | KPIs valores | `#F5F5F5` |
| 8 | Iconos circulares | bg brand-color/20 |
| 9 | Border cards | `#2E2E2E` |
| 10 | No blue-tinted backgrounds | FONDO neutro, no azulado |

**Probar transición:** Activar toggle → debe ser suave (transition-colors duration-200).

## Tarea 10.4: Responsive QA (375px → 1440px)

**Breakpoints a verificar:**
- **375px** (móvil pequeño): Sidebar drawer, KPIs 1 col, tabs responsive, botones full-width
- **768px** (tablet): Sidebar colapsado, KPIs 2 col, tabla scroll horizontal
- **1024px** (laptop): Sidebar expanded, KPIs 3-4 col, layout completo
- **1440px** (desktop): Layout máximo con `max-width: 1440px`

**Mobile Checklist:**
- [ ] Touch targets ≥44px (botones, links, tabs)
- [ ] Sin overflow horizontal
- [ ] Sidebar: drawer con overlay
- [ ] Bottom nav visible (MobileBottomNav)
- [ ] KPIs apilados verticalmente
- [ ] Tablas con scroll horizontal o card view
- [ ] Formularios full-width
- [ ] FAB "Carga rápida" visible y usable

## Tarea 10.5: Playwright E2E Smoke Test

**Script de verificación:**
```bash
cd frontend
npx playwright test --grep "navegacion|dashboard|design"
```

**Rutas a probar (36 total):**
```typescript
const ROUTES = [
  '/dashboard',
  '/service-cases', '/customers', '/work-requests', '/site-visits',
  '/proposals', '/purchase-orders', '/orders', '/planning', '/execution',
  '/evidences', '/dispatch', '/maintenance', '/sla', '/reports',
  '/delivery-records', '/billing', '/billing/ses', '/billing/invoices',
  '/payments', '/costs', '/documents', '/templates', '/resources',
  '/inventory', '/inventory/scan', '/fleet', '/assets',
  '/admin/users', '/admin/custom-fields', '/admin/personnel',
  '/admin/backups', '/admin/audit', '/admin/settings',
  '/admin/erp-connectors', '/reports/analytics',
];

for (const route of ROUTES) {
  await page.goto(`http://localhost:3000${route}`, { waitUntil: 'load' });
  const title = await page.title();
  const status = page.url().includes(route) ? '✅' : '⚠️ redirect';
  console.log(`${status} ${route} → ${title}`);
}
```

**Criterios:**
- 36 rutas responden HTTP 200
- 0 rutas redirigen a páginas incorrectas
- Todas tienen title tag descriptivo (no "Cermont" genérico)
- Ninguna muestra 404 o error de carga

---

# 🗺️ PLAN DE EJECUCIÓN POR FASES — DETALLADO

## Dependencias Críticas

```
Fase 0 (Tokens) ──► Fase 1 (Theme) ──► Fase 2 (Componentes) ──► Fase 3 (Dashboard)
                                     │                         └─► Fase 4 (Pages)
                                     ├─► Fase 5 (Sidebar)
                                     └─► Fase 9 (Componentes Avanzados)
                                     
Fase 3 ──► Fase 6 (KPIs) ──► Fase 7 (StepTimeline)
Fase 4 ──► Fase 8 (Polish)
Fase 0-8 ──► Fase 10 (QA)
```

## Tabla de Tareas (40 total)

| ID | Tarea | Fase | Archivos | Riesgo |
|----|-------|------|----------|--------|
| T0.1 | Corregir border-radius | F0 | globals.css | Bajo — solo CSS |
| T0.2 | Corregir text tokens | F0 | globals.css | Medio — afecta todo el texto |
| T0.3 | Corregir semánticos | F0 | globals.css | Bajo |
| T0.4 | Renombrar brand-green | F0 | globals.css + todos los .tsx | 🔴 **ALTO** — rename masivo |
| T0.5 | Escala tipográfica | F0 | globals.css | Bajo |
| T0.6 | Shadow-brand | F0 | globals.css | Bajo |
| T1.1 | ThemeProvider | F1 | ThemeProvider.tsx, providers.tsx, theme-init.ts | Medio |
| T1.2 | Toggle tema en Header | F1 | Header.tsx | Bajo |
| T2.1 | Button variants | F2 | globals.css | Medio |
| T2.2 | Card variants | F2 | globals.css | Bajo |
| T2.3 | PageHeader component | F2 | PageHeader.tsx (NUEVO) | Bajo |
| T2.4 | EmptyState contextual | F2 | EmptyState.tsx, EmptyStateIllustration.tsx | Medio |
| T3.1 | DashboardHero unificado | F3 | DashboardHero.tsx | 🔴 **ALTO** — refactor |
| T3.2 | KPICard progress bar | F3 | KPICard.tsx | Medio |
| T3.3 | Dashboard h1 size | F3 | dashboard/page.tsx | Bajo |
| T3.4 | DateRangePicker | F3 | DashboardFilters.tsx | Medio |
| T3.5 | Nombre usuario | F3 | DashboardHero.tsx, dashboard/page.tsx | Bajo |
| T4.1 | Títulos azules → ink | F4 | ~10 page.tsx | Bajo |
| T4.2 | PageHeader icons | F4 | ~25 page.tsx | Medio |
| T4.3 | Breadcrumb duplicado | F4 | Header.tsx | Medio |
| T4.4 | Labels azules → slate | F4 | ~8 page.tsx | Bajo |
| T4.5 | Botones pill | F4 | ~10 page.tsx | Bajo |
| T5.1 | Sidebar icon colors | F5 | Sidebar.tsx, navigation.tsx | Medio |
| T5.2 | FAB contextual | F5 | QuickUploadPanel.tsx | Bajo |
| T6.1 | KPIs contextuales | F6 | dashboard-helpers.ts | 🔴 **ALTO** — lógica |
| T6.2 | KPI schemas | F6 | packages/shared-types/ | Medio |
| T7.1 | StepTimeline 4 estados | F7 | StepTimeline.tsx | Medio |
| T8.1 | Bullet decorativo | F8 | Header.tsx | Bajo |
| T8.2 | Title tags | F8 | dispatch, sla, analytics page.tsx | Bajo |
| T8.3 | Rutas redirect | F8 | proxy.ts o pages faltantes | Medio |
| T8.4 | Colores KPICard | F8 | dashboard/page.tsx | Bajo |
| T8.5 | Variables CSS hardcodeadas | F8 | múltiples archivos | Medio |
| T9.1 | Badge component | F9 | Badge.tsx (NUEVO) | Bajo |
| T9.2 | MetricDelta component | F9 | MetricDelta.tsx (NUEVO) | Bajo |
| T9.3 | KpiGrid component | F9 | KpiGrid.tsx (NUEVO) | Bajo |
| T9.4 | Animation classes | F9 | motion-classes.ts, globals.css | Bajo |
| T9.5 | Skeleton variants | F9 | Skeleton.tsx | Bajo |
| T10.1 | Typecheck/Lint/Build | F10 | — | 🔴 **ALTO** |
| T10.2 | Light mode QA | F10 | — | Bajo |
| T10.3 | Dark mode QA | F10 | — | Bajo |
| T10.4 | Responsive QA | F10 | — | Medio |
| T10.5 | Playwright smoke | F10 | — | Medio |

## Consejos de Ejecución

### Para T0.4 (rename brand-green → brand-blue) — ⚠️ Crítico

Este rename es el de mayor impacto. Estrategia segura:

```bash
# 1. Primero, ast-grep para contar ocurrencias
ast-grep search --pattern 'brand-green' --lang tsx frontend/src/
ast-grep search --pattern 'brand-green' --lang css frontend/src/app/globals.css

# 2. Reemplazar en CSS (solo definiciones de variable)
# NO reemplazar --color-brand-green-soft (este SÍ es verde #7CD966)
# NO reemplazar --color-brand-green-deep (este SÍ es verde oscuro #1B4212)

# 3. Reemplazar en componentes:
# bg-brand-green → bg-brand-blue
# text-brand-green → text-brand-blue
# border-brand-green → border-brand-blue
# ring-brand-green → ring-brand-blue
# hover:bg-brand-green → hover:bg-brand-blue

# 4. Verificar que los alias funcionan:
# --color-cermont-blue: var(--color-brand-blue) ✅
# --color-brand: var(--color-brand-blue) ✅
```

### Para T3.1 (DashboardHero unificado) — ⚠️ Diseño sensible

El hero actual tiene gradiente radial. Mantenerlo pero integrar KPIs. NO perder:
- La detección de stale data (isDashboardSnapshotStale)
- La animación GSAP
- Los quick actions links
- El saludo contextual con rol

### Para T6.1 (KPIs contextuales) — ⚠️ Datos reales

Los KPIs contextuales requieren datos del backend. Si el backend no tiene los endpoints nuevos:
1. Usar los datos existentes del dashboard summary
2. Mapear campos existentes a labels contextuales
3. Dejar prepared para cuando lleguen los endpoints nuevos

---

## 📋 CHECKLIST DE VERIFICACIÓN — VERSIÓN EXTENDIDA

### Design System (F0)
- [ ] T0.1: `--radius-xs: 6px`, `--radius-sm: 8px`, `--radius-md: 12px`, `--radius-lg: 16px`, `--radius-xl: 24px`
- [ ] T0.2: `--color-ink: #0F172A`, `--color-charcoal: #475569`, `--color-steel: #64748B`
- [ ] T0.3: `--color-brand-warn: #F59E0B`, `--color-brand-error: #EF4444`
- [ ] T0.4: `--color-brand-blue: #2154A6` — todos los brand-green → brand-blue
- [ ] T0.5: `--text-h1: 32px` hasta `--text-micro: 11px` — 10 variables
- [ ] T0.6: `--shadow-brand` agregado

### Theme System (F1)
- [ ] T1.1: ThemeProvider con defaultTheme="light" — localStorage persist
- [ ] T1.1: Sin FOUC al cargar página
- [ ] T1.2: Botón toggle tema con icono Sun/Moon en Header
- [ ] T1.2: `useTheme()` exportado para consumo global

### Componentes Base (F2)
- [ ] T2.1: `.btn-secondary` con border-hairline + rounded-full
- [ ] T2.1: `.btn-ghost` con bg-transparent
- [ ] T2.1: `.btn-danger` con bg-brand-error
- [ ] T2.1: `.btn-success` con bg-brand-annotate
- [ ] T2.2: `.card-soft` con bg-surface
- [ ] T2.2: `.card-highlight` con border-2 brand-blue + acento superior
- [ ] T2.2: `.card-empty` con border-dashed
- [ ] T2.3: PageHeader con icon+title+description+actions
- [ ] T2.3: PAGE_HEADER_CONFIG con 30+ módulos mapeados
- [ ] T2.4: EmptyStateIllustration con iconos semánticos — sin cuadro oscuro

### Dashboard (F3)
- [ ] T3.1: DashboardHero es card-highlight con layout 60/40
- [ ] T3.1: KPIs dentro del hero, no fuera
- [ ] T3.2: KPICard.progress con barra de progreso
- [ ] T3.2: KPICard.alert opcional
- [ ] T3.2: `rounded-[24px]` → `rounded-xl`
- [ ] T3.2: Icon container `rounded-2xl` → `rounded-full`
- [ ] T3.3: `text-xl` → `text-h1` (32px)
- [ ] T3.4: Filtros de fecha con DateRangePicker
- [ ] T3.5: Fallback de nombre de usuario

### Pages (F4)
- [ ] T4.1: 0 páginas con título h1 en text-blue-500
- [ ] T4.2: 0 páginas sin icono en header (33/36 con icono)
- [ ] T4.3: 0 páginas con breadcrumb duplicado
- [ ] T4.4: Labels de paso en text-slate (no blue)
- [ ] T4.5: Todos los botones CTA primarios usan rounded-full
- [ ] T4.5: Sin flechas inline "→" — reemplazadas por iconos

### Sidebar & Nav (F5)
- [ ] T5.1: Sidebar icons con color semántico por grupo
- [ ] T5.1: navigation.tsx con field iconColor
- [ ] T5.2: FAB oculto en SLA, ERP, Backups, Auditoría, Scan
- [ ] T5.2: QUICK_UPLOAD_ENABLED_PATHS definido

### KPIs (F6)
- [ ] T6.1: buildContextualKpis devuelve KPIs CERMONT
- [ ] T6.1: Labels: "Líneas de vida", "Hallazgos críticos", "Días sin accidentes"
- [ ] T6.2: Schemas Zod para KPIs (opcional)

### StepTimeline (F7)
- [ ] T7.1: 4 estados visuales: sin-datos/activo/completado/bloqueado
- [ ] T7.1: Badge "ACTIVO →" con ArrowRight para paso activo
- [ ] T7.1: Badge "✓ COMPLETADO" con Check para completado
- [ ] T7.1: Badge "⛔ BLOQUEADO" con AlertTriangle para bloqueado

### Polish (F8)
- [ ] T8.1: "•" reemplazado por Badge variant="outline"
- [ ] T8.2: dispatch → title "Despacho", sla → title "SLA"
- [ ] T8.3: /payments y /documents no redirigen incorrectamente
- [ ] T8.4: "indigo" → "blue" en KPICard de Recursos
- [ ] T8.5: 0 valores hardcodeados de color/radius

### Componentes Avanzados (F9)
- [ ] T9.1: Badge con 6 variantes + 3 tamaños
- [ ] T9.2: MetricDelta con 3 direcciones + 3 tamaños
- [ ] T9.3: KpiGrid con responsive columns
- [ ] T9.4: Animaciones fade-in-up, fade-in, scale-in
- [ ] T9.5: Skeleton variant pageHeader + pageTitle

### QA (F10)
- [ ] T10.1: typecheck 0 errors
- [ ] T10.1: lint 0 warnings
- [ ] T10.1: build exitoso
- [ ] T10.1: react-doctor 0 issues
- [ ] T10.2: Light mode checklist (16 items)
- [ ] T10.3: Dark mode checklist (10 items)
- [ ] T10.4: Responsive en 4 breakpoints
- [ ] T10.5: 36 rutas Playwright OK

---

## 📊 MÉTRICAS OBJETIVO

| Métrica | Antes | Después |
|---------|-------|---------|
| Cumplimiento DESIGN.md | 54% | ~85% |
| Títulos h1 en azul | ~10 | 0 |
| Páginas sin icono header | ~25 | ~3 |
| Breadcrumb duplicado | ~20 | 0 |
| Labels paso en azul | ~8 | 0 |
| Botones no-pill | ~6 | 0 |
| Empty states genéricos | 8+ | 0 |
| Variables CSS vs hardcode | ~15 hardcode | 0 hardcode |
| KPIs genéricos | 4/4 | 4 contextuales |
| Sidebar icon colors | 0 semánticos | 7 grupos |
| FAB en páginas wrong | 12+ | 0 |
| KPICard progress bar | ❌ Ausente | ✅ Implementada |
| DashboardHero unificado | ❌ No | ✅ Card 60/40 |
| Light mode default | ❌ No | ✅ Sí |
| Theme toggle funcional | ❌ No | ✅ Sí |
| StepTimeline estados | 1/4 | 4/4 |

---

# APÉNDICE A: EJEMPLOS DE CÓDIGO POR PÁGINA

## A.1 Dashboard — Antes/Después

### Antes (dashboard/page.tsx — problémas actuales):
```tsx
// ❌ Título demasiado pequeño
<h1 className="text-xl font-semibold">Panel de Control</h1>

// ❌ Hero separado de KPIs
<DashboardHero ... />
<StepTimeline ... />
<KpiGrid ... />  {/* KPIs FUERA del hero */}
<Charts ... />
```

### Después (dashboard/page.tsx — corregido):
```tsx
// ✅ Título tamaño correcto
<h1 className="text-h1 font-bold text-ink">Panel de Control</h1>

// ✅ Hero unificado (60% texto + 40% KPIs)
<UnifiedHero
  userName={userName}
  role={user?.role}
  todayLabel={today}
  metrics={contextualKpis}
  updatedAt={dashboardSummary?.generatedAt}
/>

// ✅ Flujo de 14 pasos con 4 estados
<StepTimelineEnhanced
  stepDistribution={serviceCaseSummary?.stepDistribution ?? []}
/>

// ✅ KPICard con progress bar
<KPICard
  title="Líneas de vida instaladas"
  value={lifelineMeters}
  icon={LifeBuoy}
  progress={{ current: lifelineMeters, target: 1500, unit: "m" }}
  color="blue"
/>

// ✅ Charts con diseño mejorado
<ChartCard title="Tendencia mensual">
  <LazyMonthlyTrendChart data={monthlyTrendData} />
</ChartCard>
```

## A.2 Site Visits — Corrección de botón y flecha

### Antes:
```tsx
<button className="rounded-md border border-blue-500 text-blue-500 px-4 py-2">
  Nueva visita →
</button>
```

### Después:
```tsx
<button className="btn-primary">
  <Plus size={14} />
  Nueva visita
  <ArrowRight size={14} />
</button>
```

## A.3 Purchase Orders — Corrección de label paso

### Antes:
```tsx
<span className="text-blue-500 text-[11px] font-semibold uppercase tracking-wider">
  PASO 4 / OPERACIÓN
</span>
```

### Después:
```tsx
<span className="text-slate text-micro font-semibold uppercase tracking-wider">
  PASO 4 / OPERACIÓN
</span>
```

## A.4 Billing — Jerarquía de botones

### Antes:
```tsx
<div className="flex gap-2">
  <Button variant="ghost">Revisar actas</Button>
  <Button variant="ghost">Ver costos</Button>
  <Button variant="primary">Subir soporte</Button>
</div>
// ❌ Sin jerarquía clara — 3 botones sin prioridad
```

### Después:
```tsx
<div className="flex gap-2">
  {/* ✅ Un solo CTA primary */}
  <Button variant="primary" icon={Upload}>Subir soporte</Button>
  {/* ✅ Acciones secundarias */}
  <Button variant="secondary" icon={FileText}>Revisar actas</Button>
  <Button variant="ghost" icon={TrendingUp}>Ver costos</Button>
</div>
// ✅ Jerarquía: primary → secondary → ghost
```

## A.5 Admin Layout — Corrección breadcrumb duplicado

### Antes (admin/custom-fields/page.tsx):
```tsx
// Header.tsx muestra "Administración" en el título
// Y la página también tiene "Administración" como breadcrumb
// → MISMO TEXTO 2 VECES
```

### Después:
```tsx
// Header.tsx: Solo nombre del módulo activo
<header className="sticky top-0 z-30 border-b border-hairline bg-canvas/80 backdrop-blur-md">
  <div className="flex items-center justify-between px-6 h-14">
    <span className="text-sm font-bold text-ink">Campos Personalizados</span>
    {/* Breadcrumb jerárquico */}
    <nav aria-label="Breadcrumb" className="text-xs text-slate">
      <Link href="/dashboard" className="hover:text-ink">Dashboard</Link>
      <span className="mx-1">/</span>
      <Link href="/admin" className="hover:text-ink">Administración</Link>
      <span className="mx-1">/</span>
      <span className="text-charcoal font-medium">Campos Personalizados</span>
    </nav>
  </div>
</header>
```

## A.6 Service Cases — Empty state contextual

### Antes:
```tsx
// Mismo cuadro oscuro con puntos verdes decorativos
<EmptyStateIllustration kind="generic" />
<h3>No hay datos disponibles</h3>
```

### Después:
```tsx
// ✅ Icono semántico Kanban + azul
<EmptyState
  icon={Kanban}
  title="No hay casos de servicio activos"
  description="Los casos de servicio aparecerán aquí cuando se creen desde una solicitud de trabajo o propuesta aprobada."
  action={{ label: "Crear caso", href: "/work-requests/new" }}
/>
```

---

# APÉNDICE B: IMPACTO DE RENOMBRE brand-green → brand-blue

## Archivos que contienen `brand-green` (búsqueda ast-grep):

**Nota:** Algunos usos de `brand-green` SÍ son verdes (annotate/green-soft) y NO deben renombrarse:

| Uso actual | ¿Es realmente azul? | ¿Renombrar? |
|-----------|---------------------|-------------|
| `bg-brand-green` | ✅ Sí (#2154A6 = azul) | → `bg-brand-blue` |
| `text-brand-green` | ✅ Sí | → `text-brand-blue` |
| `border-brand-green` | ✅ Sí | → `border-brand-blue` |
| `ring-brand-green` | ✅ Sí | → `ring-brand-blue` |
| `hover:bg-brand-green` | ✅ Sí | → `hover:bg-brand-blue` |
| `bg-brand-green/10` | ✅ Sí | → `bg-brand-blue/10` |
| `bg-brand-green/20` | ✅ Sí | → `bg-brand-blue/20` |
| `text-brand-green-deep` | ❌ No (#0f2c59 = navy) | → `text-brand-blue-deep` |
| `bg-brand-green-soft` | ❌ No (#7cd966 = verde) | ❌ NO renombrar |
| `--color-brand-annotate` | ❌ No (#4caf50 = verde) | ❌ NO renombrar |

## Verificación post-rename:

```bash
# 1. Buscar residuales que deberían haber cambiado
grep -rn 'brand-green[^-]' --include="*.tsx" --include="*.ts" --include="*.css" frontend/src/
# Debería devolver 0 resultados (todos cambiados a brand-blue)

# 2. Verificar que brand-annotate (verde) NO fue afectado
grep -rn 'brand-annotate' --include="*.tsx" --include="*.ts" --include="*.css" frontend/src/
# Debería devolver resultados (los verdes se mantienen)

# 3. Verificar brand-green-soft (verde claro) NO fue afectado
grep -rn 'brand-green-soft' --include="*.tsx" --include="*.ts" --include="*.css" frontend/src/
# Debería devolver resultados
```

---

# APÉNDICE C: COMANDOS ÚTILES PARA LA EJECUCIÓN

## Verificación rápida de cambios

```bash
# Ver todos los archivos modificados en la rama
git status

# Ver diff de archivos específicos
git diff frontend/src/app/globals.css

# Typecheck solo de frontend (más rápido que monorepo)
cd frontend && npx tsc --noEmit

# Lint solo de frontend
cd frontend && npx biome check .

# Build solo de frontend
cd frontend && npm run build

# Test unitarios
cd frontend && npm run test -- --run

# E2E (Playwright)
cd frontend && npx playwright test --grep "design|dashboard|visual"

# React Doctor (quality gate)
npx react-doctor@latest
```

## Revertir cambios si algo sale mal

```bash
# Revertir archivo individual
git checkout -- frontend/src/app/globals.css

# Revertir todos los cambios no commiteados
git restore .

# Deshacer rename masivo (si T0.4 falla)
git checkout -- frontend/src/
```

## Hot reload

El frontend usa Turbopack (`next dev --turbopack`). Los cambios en:
- `globals.css` → hot reload automático ✅
- Componentes `.tsx` → Fast Refresh ✅
- `layout.tsx` → recarga completa ⚠️
- `providers.tsx` → recarga completa ⚠️

---

*Plan generado: 2026-07-21 | ~2100+ líneas | 10 fases | 40+ tareas atómicas | 6 apéndices*
*Basado en: `.playwright-mcp/audit/AUDIT_COMPLETO_6000L.md` (91 hallazgos, 38 críticos)*
*Source of truth: DESIGN.md v3.0 + CERMONT_UIUX_GUIDE.md + PROMPT_MEJORA_KPIS*
*Stack: Next.js 16 + React 19 + Tailwind 4 + Radix UI + Lucide + Framer Motion*

---

# 🗺️ PLAN DE EJECUCIÓN POR FASES

## Resumen de Tareas

| Fase | Tareas | Archivos Afectados | Dependencias |
|------|--------|-------------------|--------------|
| F0: Tokens CSS | 7 tareas | 1 archivo (globals.css) | Ninguna |
| F1: Theme System | 2 tareas | 3-4 archivos | F0 (usa tokens) |
| F2: Componentes Base | 4 tareas | 5-6 archivos nuevos | F0, F1 |
| F3: Dashboard Refactor | 5 tareas | 5-6 archivos | F0, F1, F2 |
| F4: Page-by-Page | 5 tareas | 25-30 page.tsx | F2 (usa PageHeader, Button) |
| F5: Sidebar & Nav | 2 tareas | 3 archivos | F2 |
| F6: KPI Contextual | 2 tareas | 3-4 archivos + schemas | F3 (usa KPICard) |
| F7: StepTimeline | 2 tareas | 1 archivo | F3 |
| F8: Final Polish | 5 tareas | 10+ archivos | F0-F7 |
| F9: QA & Build | 5 tareas | — | F0-F8 |

## Orden de Ejecución Recomendado

```
Wave 1 (Fundación) → F0: Tokens CSS + F1: Theme System
Wave 2 (Componentes) → F2: Componentes Base 
Wave 3 (Dashboard Core) → F3: Dashboard Refactor + F7: StepTimeline
Wave 4 (Expansión) → F4: Page-by-Page + F5: Sidebar & Nav
Wave 5 (Contexto) → F6: KPI Contextualization
Wave 6 (Polish) → F8: Final Polish
Wave 7 (QA) → F9: QA & Build
```

## Impacto Estimado

| Métrica | Valor |
|---------|-------|
| Archivos modificados | ~50-60 |
| Archivos nuevos | ~8-10 |
| Tokens CSS corregidos | ~12 |
| Componentes nuevos | ~5 (PageHeader, ThemeProvider, KpiProgress, etc.) |
| Páginas con header icono | 25/36 → 33/36 (+8) |
| Páginas con título corregido | ~10 |
| Botones estandarizados | ~12 |
| Cumplimiento DESIGN.md | 54% → ~85% |

---

## 📋 CHECKLIST DE VERIFICACIÓN

- [ ] **F0:** border-radius corregido → todos los componentes se ven con radio correcto
- [ ] **F0:** tokens de color alineados con DESIGN.md
- [ ] **F1:** Light mode funciona como default al cargar la app
- [ ] **F1:** Toggle tema cambia correctamente entre light/dark
- [ ] **F2:** Botones primary/secondary/ghost/danger/success funcionales
- [ ] **F2:** Cards base/soft/highlight/empty implementadas
- [ ] **F2:** PageHeader con iconos circulares en todas las páginas objetivo
- [ ] **F3:** DashboardHero es card unificada 60/40
- [ ] **F3:** KPICard tiene barra de progreso y usa radius variables
- [ ] **F3:** Filtros de fecha con DateRangePicker
- [ ] **F4:** Ningún título h1 usa text-blue-500
- [ ] **F4:** Labels de paso usan text-muted-foreground
- [ ] **F4:** Botones CTA primarios todos pill
- [ ] **F5:** Sidebar icons tienen color semántico por grupo
- [ ] **F5:** FAB contextual solo en páginas relevantes
- [ ] **F6:** KPIs contextuales CERMONT implementados
- [ ] **F7:** StepTimeline con 4 estados visuales
- [ ] **F8:** Sin bullets decorativos sin significado
- [ ] **F8:** Title tags descriptivos en todas las páginas
- [ ] **F9:** `npm run typecheck` → 0 errors
- [ ] **F9:** `npm run lint` → 0 warnings
- [ ] **F9:** `npm run build` → exitoso
- [ ] **F9:** `npx react-doctor@latest` → 0 issues
- [ ] **F9:** Playwright smoke test → 36 rutas OK

---

*Plan de implementación generado a partir de la auditoría completa en `.playwright-mcp/audit/AUDIT_COMPLETO_6000L.md`*
*91 hallazgos → 40 tareas atómicas → 9 fases → ~85% cumplimiento objetivo*
