Aquí está el prompt de implementación completo, estructurado en fases atómicas con instrucciones de refactorización directa, sin auditorías ni orquestación:

***

```
# PROMPT DE IMPLEMENTACIÓN — CERMONT UI 3.0
# Dashboard + KPIs + Gráficas + Componentes Industriales
# Plan de Implementación por Fases Atómicas
# Longitud objetivo: 3000 líneas / ejecución directa sin auditoría previa

---

## CONTEXTO DEL PROYECTO

Eres un senior frontend engineer trabajando en CERMONT S.A.S., una plataforma operativa
full-stack construida con Next.js (App Router), NestJS y Prisma + MongoDB.
Tu tarea es REFACTORIZAR y CONSTRUIR — no auditar, no verificar, no proponer.
Ejecuta cada fase de forma atómica. Haz los cambios reales, no pseudocódigo.

Stack técnico:
- Next.js 14+ App Router
- TailwindCSS con variables CSS custom (tokens)
- TypeScript estricto
- Recharts o Tremor para gráficas
- Lucide React para iconografía
- React Server Components donde aplique
- SWR o React Query para fetching de datos

Estado actual del dashboard (observado en screenshots):
- KPIs con valores "0" sin estructura visual
- Iconos con contenedores de color genérico (azul plano, verde, naranja, rojo)
- Gráficas vacías sin placeholder elegante
- Sección "Actividad reciente" con texto plano
- Sección "Kits Típicos Recientes" vacía sin empty state
- Flujo de 14 pasos como grid plano sin jerarquía
- Cumplimiento SLA con número en rojo sin contexto
- Cards sin sombra, sin ritmo visual, sin jerarquía tipográfica
- Dashboard no extrae datos reales del backend

---

## FASE 0 — TOKENS DE DISEÑO Y GLOBALS

### 0.1 Crear archivo de tokens CSS

Archivo: `apps/web/src/styles/tokens.css`

```css
:root {
  /* === MARCA CERMONT === */
  --cermont-navy: #0F2C59;
  --cermont-blue: #2154A6;
  --cermont-blue-light: #3A78D8;
  --cermont-green: #4CAF50;
  --cermont-lime: #7CD966;
  --cermont-green-deep: #1B4212;

  /* === NEUTROS LIGHT === */
  --bg: #FFFFFF;
  --bg-soft: #F8FAFC;
  --bg-muted: #F3F6FA;
  --card: #FFFFFF;
  --card-muted: #FCFDFE;
  --text: #0F172A;
  --text-soft: #475569;
  --text-muted: #64748B;
  --line: rgba(15, 23, 42, 0.08);
  --line-strong: rgba(15, 23, 42, 0.14);

  /* === SEMÁNTICOS === */
  --success: #4CAF50;
  --success-soft: rgba(76, 175, 80, 0.12);
  --warning: #F59E0B;
  --warning-soft: rgba(245, 158, 11, 0.14);
  --danger: #EF4444;
  --danger-soft: rgba(239, 68, 68, 0.12);
  --info: #3A78D8;
  --info-soft: rgba(58, 120, 216, 0.12);
  --brand-soft: rgba(33, 84, 166, 0.10);

  /* === SHADOWS === */
  --shadow-soft: 0 1px 2px rgba(15,23,42,0.04);
  --shadow-card: 0 8px 24px rgba(15,23,42,0.06);
  --shadow-brand: 0 10px 30px rgba(33,84,166,0.10);

  /* === RADIUS === */
  --radius-xs: 6px;
  --radius-sm: 8px;
  --radius-md: 12px;
  --radius-lg: 16px;
  --radius-xl: 24px;
  --radius-full: 9999px;
}

.dark {
  --bg: #05070A;
  --bg-soft: #0B111A;
  --bg-muted: #111827;
  --card: #0F172A;
  --card-muted: #111B2C;
  --text: #F8FAFC;
  --text-soft: #CBD5E1;
  --text-muted: #94A3B8;
  --line: rgba(255,255,255,0.08);
  --line-strong: rgba(255,255,255,0.14);
}
```

### 0.2 Extender tailwind.config.ts con los tokens

Archivo: `apps/web/tailwind.config.ts`

```typescript
import type { Config } from 'tailwindcss'

const config: Config = {
  darkMode: 'class',
  content: ['./src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        cermont: {
          navy: 'var(--cermont-navy)',
          blue: 'var(--cermont-blue)',
          'blue-light': 'var(--cermont-blue-light)',
          green: 'var(--cermont-green)',
          lime: 'var(--cermont-lime)',
          'green-deep': 'var(--cermont-green-deep)',
        },
        brand: {
          bg: 'var(--bg)',
          'bg-soft': 'var(--bg-soft)',
          'bg-muted': 'var(--bg-muted)',
          card: 'var(--card)',
          'card-muted': 'var(--card-muted)',
          text: 'var(--text)',
          'text-soft': 'var(--text-soft)',
          'text-muted': 'var(--text-muted)',
          line: 'var(--line)',
          'line-strong': 'var(--line-strong)',
        },
        semantic: {
          success: 'var(--success)',
          'success-soft': 'var(--success-soft)',
          warning: 'var(--warning)',
          'warning-soft': 'var(--warning-soft)',
          danger: 'var(--danger)',
          'danger-soft': 'var(--danger-soft)',
          info: 'var(--info)',
          'info-soft': 'var(--info-soft)',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        mono: ['Geist Mono', 'monospace'],
      },
      boxShadow: {
        soft: 'var(--shadow-soft)',
        card: 'var(--shadow-card)',
        brand: 'var(--shadow-brand)',
      },
      borderRadius: {
        xs: 'var(--radius-xs)',
        sm: 'var(--radius-sm)',
        md: 'var(--radius-md)',
        lg: 'var(--radius-lg)',
        xl: 'var(--radius-xl)',
        full: 'var(--radius-full)',
      },
      spacing: {
        '4.5': '18px',
        '18': '72px',
      },
    },
  },
  plugins: [],
}

export default config
```

---

## FASE 1 — COMPONENTES BASE PRIMITIVOS

### 1.1 StatusBadge

Archivo: `apps/web/src/components/ui/StatusBadge.tsx`

```typescript
import { cn } from '@/lib/utils'

type BadgeVariant = 'success' | 'warning' | 'danger' | 'info' | 'neutral' | 'draft'

interface StatusBadgeProps {
  variant: BadgeVariant
  label: string
  icon?: React.ReactNode
  className?: string
}

const variantStyles: Record<BadgeVariant, string> = {
  success: 'bg-[var(--success-soft)] text-[var(--cermont-green-deep)] dark:text-[var(--cermont-green)]',
  warning: 'bg-[var(--warning-soft)] text-amber-800 dark:text-amber-300',
  danger: 'bg-[var(--danger-soft)] text-red-800 dark:text-red-300',
  info: 'bg-[var(--info-soft)] text-[var(--cermont-blue)] dark:text-[var(--cermont-blue-light)]',
  neutral: 'bg-[var(--bg-muted)] text-[var(--text-muted)]',
  draft: 'bg-[var(--bg-soft)] text-[var(--text-soft)] border border-[var(--line)]',
}

export function StatusBadge({ variant, label, icon, className }: StatusBadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold leading-none',
        variantStyles[variant],
        className
      )}
    >
      {icon && <span className="w-3 h-3 flex-shrink-0">{icon}</span>}
      {label}
    </span>
  )
}
```

### 1.2 MetricDelta

Archivo: `apps/web/src/components/ui/MetricDelta.tsx`

```typescript
import { TrendingUp, TrendingDown, Minus } from 'lucide-react'
import { cn } from '@/lib/utils'

interface MetricDeltaProps {
  value: number
  suffix?: string
  className?: string
}

export function MetricDelta({ value, suffix = '%', className }: MetricDeltaProps) {
  const isPositive = value > 0
  const isNeutral = value === 0
  const isNegative = value < 0

  return (
    <span
      className={cn(
        'inline-flex items-center gap-1 text-xs font-semibold',
        isPositive && 'text-[var(--success)]',
        isNeutral && 'text-[var(--text-muted)]',
        isNegative && 'text-[var(--danger)]',
        className
      )}
    >
      {isPositive && <TrendingUp className="w-3 h-3" />}
      {isNegative && <TrendingDown className="w-3 h-3" />}
      {isNeutral && <Minus className="w-3 h-3" />}
      {isPositive ? '+' : ''}{value}{suffix}
    </span>
  )
}
```

### 1.3 SectionHeader

Archivo: `apps/web/src/components/ui/SectionHeader.tsx`

```typescript
import { cn } from '@/lib/utils'

interface SectionHeaderProps {
  title: string
  subtitle?: string
  action?: React.ReactNode
  className?: string
}

export function SectionHeader({ title, subtitle, action, className }: SectionHeaderProps) {
  return (
    <div className={cn('flex items-start justify-between gap-4 mb-6', className)}>
      <div>
        <h2 className="text-xl font-bold text-[var(--text)] tracking-tight">{title}</h2>
        {subtitle && (
          <p className="mt-0.5 text-sm text-[var(--text-muted)]">{subtitle}</p>
        )}
      </div>
      {action && <div className="flex-shrink-0">{action}</div>}
    </div>
  )
}
```

### 1.4 EmptyStateCard

Archivo: `apps/web/src/components/ui/EmptyStateCard.tsx`

```typescript
import { cn } from '@/lib/utils'

interface EmptyStateCardProps {
  icon: React.ReactNode
  title: string
  description: string
  action?: React.ReactNode
  className?: string
}

export function EmptyStateCard({
  icon,
  title,
  description,
  action,
  className,
}: EmptyStateCardProps) {
  return (
    <div
      className={cn(
        'flex flex-col items-center justify-center gap-3 py-12 px-6',
        'bg-[var(--card)] border border-[var(--line)] rounded-xl',
        className
      )}
    >
      <div className="w-12 h-12 rounded-full bg-[var(--bg-muted)] flex items-center justify-center text-[var(--text-muted)]">
        {icon}
      </div>
      <div className="text-center">
        <p className="text-sm font-semibold text-[var(--text-soft)]">{title}</p>
        <p className="mt-0.5 text-xs text-[var(--text-muted)] max-w-xs">{description}</p>
      </div>
      {action && <div className="mt-1">{action}</div>}
    </div>
  )
}
```

### 1.5 CardBase

Archivo: `apps/web/src/components/ui/CardBase.tsx`

```typescript
import { cn } from '@/lib/utils'

interface CardBaseProps {
  children: React.ReactNode
  className?: string
  highlight?: 'blue' | 'green' | 'warning' | 'danger' | 'none'
  padding?: 'sm' | 'md' | 'lg'
}

const highlightMap: Record<string, string> = {
  blue: 'border-t-2 border-t-[var(--cermont-blue)]',
  green: 'border-t-2 border-t-[var(--cermont-green)]',
  warning: 'border-t-2 border-t-[var(--warning)]',
  danger: 'border-t-2 border-t-[var(--danger)]',
  none: '',
}

const paddingMap: Record<string, string> = {
  sm: 'p-4',
  md: 'p-5',
  lg: 'p-6',
}

export function CardBase({
  children,
  className,
  highlight = 'none',
  padding = 'md',
}: CardBaseProps) {
  return (
    <div
      className={cn(
        'bg-[var(--card)] border border-[var(--line)] rounded-xl shadow-card',
        highlightMap[highlight],
        paddingMap[padding],
        className
      )}
    >
      {children}
    </div>
  )
}
```

---

## FASE 2 — KPI CARDS REFACTORIZADAS

### 2.1 Tipo de datos KPI

Archivo: `apps/web/src/types/dashboard.ts`

```typescript
export type KpiSemantics = 'primary' | 'success' | 'warning' | 'danger' | 'neutral'

export interface KpiData {
  id: string
  label: string
  value: number | string
  sublabel?: string
  delta?: number
  deltaLabel?: string
  icon: string  // nombre de icono Lucide
  semantics: KpiSemantics
  unit?: string
  linkTo?: string
}

export interface DashboardStats {
  ordenesActivas: number
  mantenimientosAbiertos: number
  completadasMes: number
  ingresosMes: number
  enEjecucion: number
  bloqueadas: number
  listasFacturar: number
  recursosEnUso: number
  cumplimientoSLA: number
  ordenesConAlerta: number
  kitsActivos: number
  totalOrdenes: number
  ordenesCompletadas: number
  ordenesAbiertas: number
}
```

### 2.2 Hook para datos reales del dashboard

Archivo: `apps/web/src/hooks/useDashboardStats.ts`

```typescript
import useSWR from 'swr'
import type { DashboardStats } from '@/types/dashboard'

const fetcher = (url: string) =>
  fetch(url, { credentials: 'include' }).then(r => {
    if (!r.ok) throw new Error('Error al cargar dashboard')
    return r.json()
  })

export function useDashboardStats() {
  const { data, error, isLoading, mutate } = useSWR<DashboardStats>(
    '/api/dashboard/stats',
    fetcher,
    {
      refreshInterval: 30_000,
      revalidateOnFocus: true,
    }
  )

  return {
    stats: data ?? null,
    isLoading,
    isError: !!error,
    refresh: mutate,
  }
}
```

### 2.3 Servidor — endpoint de stats reales

Archivo: `apps/web/src/app/api/dashboard/stats/route.ts`

```typescript
import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'

export async function GET() {
  const session = await getServerSession(authOptions)
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const backendUrl = process.env.BACKEND_URL ?? 'http://localhost:3001'
    const response = await fetch(`${backendUrl}/dashboard/stats`, {
      headers: {
        Authorization: `Bearer ${session.accessToken}`,
        'Content-Type': 'application/json',
      },
      next: { revalidate: 30 },
    })

    if (!response.ok) {
      throw new Error(`Backend error: ${response.status}`)
    }

    const data = await response.json()
    return NextResponse.json(data)
  } catch (error) {
    console.error('[Dashboard Stats API]', error)
    return NextResponse.json(
      { error: 'No se pudieron cargar las estadísticas' },
      { status: 500 }
    )
  }
}
```

### 2.4 KpiCard componente refactorizado

Archivo: `apps/web/src/components/dashboard/KpiCard.tsx`

```typescript
'use client'

import { cn } from '@/lib/utils'
import { MetricDelta } from '@/components/ui/MetricDelta'
import * as LucideIcons from 'lucide-react'
import Link from 'next/link'
import type { KpiSemantics } from '@/types/dashboard'

interface KpiCardProps {
  label: string
  value: number | string
  sublabel?: string
  delta?: number
  deltaLabel?: string
  iconName: string
  semantics?: KpiSemantics
  unit?: string
  linkTo?: string
  isLoading?: boolean
  className?: string
}

const semanticsConfig: Record<KpiSemantics, {
  iconBg: string
  iconColor: string
  valueColor: string
}> = {
  primary: {
    iconBg: 'bg-[var(--brand-soft)]',
    iconColor: 'text-[var(--cermont-blue)]',
    valueColor: 'text-[var(--text)]',
  },
  success: {
    iconBg: 'bg-[var(--success-soft)]',
    iconColor: 'text-[var(--cermont-green)]',
    valueColor: 'text-[var(--text)]',
  },
  warning: {
    iconBg: 'bg-[var(--warning-soft)]',
    iconColor: 'text-[var(--warning)]',
    valueColor: 'text-[var(--text)]',
  },
  danger: {
    iconBg: 'bg-[var(--danger-soft)]',
    iconColor: 'text-[var(--danger)]',
    valueColor: 'text-[var(--text)]',
  },
  neutral: {
    iconBg: 'bg-[var(--bg-muted)]',
    iconColor: 'text-[var(--text-muted)]',
    valueColor: 'text-[var(--text)]',
  },
}

function KpiSkeleton() {
  return (
    <div className="bg-[var(--card)] border border-[var(--line)] rounded-xl p-5 animate-pulse">
      <div className="flex items-start gap-3 mb-4">
        <div className="w-11 h-11 rounded-full bg-[var(--bg-muted)]" />
        <div className="flex-1">
          <div className="h-3 bg-[var(--bg-muted)] rounded w-24 mb-2" />
          <div className="h-8 bg-[var(--bg-muted)] rounded w-16" />
        </div>
      </div>
      <div className="h-3 bg-[var(--bg-muted)] rounded w-32" />
    </div>
  )
}

export function KpiCard({
  label,
  value,
  sublabel,
  delta,
  deltaLabel,
  iconName,
  semantics = 'primary',
  unit,
  linkTo,
  isLoading,
  className,
}: KpiCardProps) {
  if (isLoading) return <KpiSkeleton />

  const config = semanticsConfig[semantics]
  const IconComponent = (LucideIcons as Record<string, React.ComponentType<{ className?: string }>>)[iconName]

  const content = (
    <div
      className={cn(
        'group bg-[var(--card)] border border-[var(--line)] rounded-xl p-5 shadow-soft',
        'hover:shadow-card hover:border-[var(--line-strong)] transition-all duration-200',
        linkTo && 'cursor-pointer',
        className
      )}
    >
      <div className="flex items-start justify-between mb-3">
        <div
          className={cn(
            'w-11 h-11 rounded-full flex items-center justify-center flex-shrink-0',
            config.iconBg
          )}
        >
          {IconComponent && (
            <IconComponent className={cn('w-5 h-5', config.iconColor)} />
          )}
        </div>
        {delta !== undefined && (
          <MetricDelta value={delta} />
        )}
      </div>

      <div className="space-y-0.5">
        <p className="text-xs font-semibold uppercase tracking-wider text-[var(--text-muted)]">
          {label}
        </p>
        <div className="flex items-baseline gap-1">
          <span className={cn('text-3xl font-bold tracking-tight', config.valueColor)}>
            {unit && unit === '$' ? `$${value}` : value}
            {unit && unit !== '$' ? <span className="text-base font-medium text-[var(--text-soft)] ml-0.5">{unit}</span> : null}
          </span>
        </div>
        {sublabel && (
          <p className="text-xs text-[var(--text-muted)] pt-1">{sublabel}</p>
        )}
        {deltaLabel && (
          <p className="text-xs text-[var(--text-muted)]">{deltaLabel}</p>
        )}
      </div>
    </div>
  )

  if (linkTo) {
    return <Link href={linkTo}>{content}</Link>
  }

  return content
}
```

### 2.5 KpiGrid — cuadrícula de KPIs

Archivo: `apps/web/src/components/dashboard/KpiGrid.tsx`

```typescript
'use client'

import { KpiCard } from './KpiCard'
import type { DashboardStats } from '@/types/dashboard'
import { formatCurrency } from '@/lib/formatters'

interface KpiGridProps {
  stats: DashboardStats | null
  isLoading: boolean
}

export function KpiGrid({ stats, isLoading }: KpiGridProps) {
  const kpis = [
    {
      label: 'Órdenes Activas',
      value: stats?.ordenesActivas ?? 0,
      sublabel: `${stats?.totalOrdenes ?? 0} en total`,
      iconName: 'ClipboardList',
      semantics: 'primary' as const,
      linkTo: '/ordenes?estado=activa',
    },
    {
      label: 'Mantenimientos Abiertos',
      value: stats?.mantenimientosAbiertos ?? 0,
      sublabel: 'Sin mantenimientos programados',
      iconName: 'Wrench',
      semantics: 'primary' as const,
      linkTo: '/mantenimientos',
    },
    {
      label: 'Completadas este Mes',
      value: stats?.completadasMes ?? 0,
      sublabel: 'Órdenes finalizadas',
      iconName: 'CheckCircle2',
      semantics: 'success' as const,
    },
    {
      label: 'Ingresos del Mes',
      value: stats ? formatCurrency(stats.ingresosMes) : '$0',
      sublabel: stats?.ingresosMes === 0 ? 'Sin presupuesto aprobado' : 'Presupuesto aprobado',
      iconName: 'DollarSign',
      semantics: stats?.ingresosMes === 0 ? 'neutral' as const : 'success' as const,
    },
    {
      label: 'En Ejecución',
      value: stats?.enEjecucion ?? 0,
      sublabel: 'Planeación y ejecución activa',
      iconName: 'Zap',
      semantics: 'primary' as const,
      linkTo: '/ordenes?estado=ejecucion',
    },
    {
      label: 'Bloqueadas',
      value: stats?.bloqueadas ?? 0,
      sublabel: 'Requieren atención inmediata',
      iconName: 'AlertTriangle',
      semantics: stats?.bloqueadas > 0 ? 'danger' as const : 'neutral' as const,
      linkTo: '/ordenes?estado=bloqueada',
    },
    {
      label: 'Listas para Facturar',
      value: stats?.listasFacturar ?? 0,
      sublabel: 'Pendientes de emisión de factura',
      iconName: 'Receipt',
      semantics: stats?.listasFacturar > 0 ? 'warning' as const : 'neutral' as const,
      linkTo: '/ordenes?estado=lista-facturar',
    },
    {
      label: 'Recursos en Uso',
      value: stats?.recursosEnUso ?? 0,
      sublabel: 'Herramientas y equipos asignados',
      iconName: 'Package',
      semantics: 'neutral' as const,
      linkTo: '/recursos',
    },
  ]

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {kpis.map((kpi) => (
        <KpiCard
          key={kpi.label}
          {...kpi}
          isLoading={isLoading}
        />
      ))}
    </div>
  )
}
```

---

## FASE 3 — HERO DEL DASHBOARD

### 3.1 DashboardHero

Archivo: `apps/web/src/components/dashboard/DashboardHero.tsx`

```typescript
'use client'

import { Activity, AlertCircle, CheckCircle2, TrendingUp } from 'lucide-react'
import { cn } from '@/lib/utils'
import { StatusBadge } from '@/components/ui/StatusBadge'
import type { DashboardStats } from '@/types/dashboard'

interface DashboardHeroProps {
  userName?: string
  userRole?: string
  stats: DashboardStats | null
  isLoading: boolean
}

function HeroStat({
  icon: Icon,
  label,
  value,
  colorClass,
}: {
  icon: React.ComponentType<{ className?: string }>
  label: string
  value: number | string
  colorClass: string
}) {
  return (
    <div className="flex items-center gap-3">
      <div className={cn('w-9 h-9 rounded-full flex items-center justify-center', colorClass)}>
        <Icon className="w-4 h-4" />
      </div>
      <div>
        <p className="text-2xl font-bold text-[var(--text)] leading-none">{value}</p>
        <p className="text-xs text-[var(--text-muted)] mt-0.5">{label}</p>
      </div>
    </div>
  )
}

export function DashboardHero({ userName, userRole, stats, isLoading }: DashboardHeroProps) {
  const hasActiveAlerts = (stats?.bloqueadas ?? 0) > 0
  const slaStatus: 'success' | 'warning' | 'danger' =
    (stats?.cumplimientoSLA ?? 0) >= 80
      ? 'success'
      : (stats?.cumplimientoSLA ?? 0) >= 50
      ? 'warning'
      : 'danger'

  return (
    <div
      className={cn(
        'rounded-xl border border-[var(--line)] overflow-hidden',
        'bg-gradient-to-br from-[var(--card)] to-[var(--card-muted)]',
        'shadow-card'
      )}
    >
      <div className="flex flex-col lg:flex-row gap-0">
        {/* Zona izquierda — texto */}
        <div className="flex-1 p-6 lg:p-8">
          <div className="flex items-center gap-2 mb-4">
            <StatusBadge
              variant={hasActiveAlerts ? 'warning' : 'success'}
              label={hasActiveAlerts ? 'Requiere atención' : 'Operación normal'}
              icon={hasActiveAlerts ? <AlertCircle className="w-3 h-3" /> : <CheckCircle2 className="w-3 h-3" />}
            />
            <StatusBadge
              variant="info"
              label={`SLA ${stats?.cumplimientoSLA ?? 0}%`}
            />
          </div>

          <h1 className="text-2xl lg:text-3xl font-bold text-[var(--text)] tracking-tight">
            Pulso operativo de CERMONT
          </h1>
          <p className="mt-1 text-sm text-[var(--text-soft)]">
            {userName ? `Bienvenido, ${userName}` : 'Panel de control'}{' '}
            {userRole && <span className="text-[var(--text-muted)]">· {userRole}</span>}
          </p>

          {isLoading && (
            <div className="flex gap-3 mt-6">
              {.map(i => ( [localhost](http://localhost:3000/dashboard)
                <div key={i} className="h-14 w-28 rounded-lg bg-[var(--bg-muted)] animate-pulse" />
              ))}
            </div>
          )}

          {!isLoading && stats && (
            <div className="flex flex-wrap gap-6 mt-6">
              <HeroStat
                icon={Activity}
                label="Órdenes activas"
                value={stats.ordenesActivas}
                colorClass="bg-[var(--brand-soft)] text-[var(--cermont-blue)]"
              />
              <HeroStat
                icon={CheckCircle2}
                label="Completadas hoy"
                value={stats.completadasMes}
                colorClass="bg-[var(--success-soft)] text-[var(--cermont-green)]"
              />
              <HeroStat
                icon={TrendingUp}
                label="Listas para facturar"
                value={stats.listasFacturar}
                colorClass="bg-[var(--warning-soft)] text-[var(--warning)]"
              />
            </div>
          )}
        </div>

        {/* Zona derecha — barra de cierre operativo */}
        <div className="lg:w-64 p-6 lg:p-8 border-t lg:border-t-0 lg:border-l border-[var(--line)] flex flex-col justify-center">
          <p className="text-xs font-semibold uppercase tracking-wider text-[var(--text-muted)] mb-2">
            Cierre Operativo
          </p>
          <div className="flex items-end gap-2 mb-3">
            <span className="text-4xl font-bold text-[var(--text)]">
              {isLoading ? '--' : `${stats?.cumplimientoSLA ?? 0}%`}
            </span>
          </div>
          <div className="w-full h-2 rounded-full bg-[var(--bg-muted)] overflow-hidden">
            <div
              className={cn(
                'h-full rounded-full transition-all duration-700',
                slaStatus === 'success' && 'bg-[var(--cermont-green)]',
                slaStatus === 'warning' && 'bg-[var(--warning)]',
                slaStatus === 'danger' && 'bg-[var(--danger)]'
              )}
              style={{ width: `${stats?.cumplimientoSLA ?? 0}%` }}
            />
          </div>
          <p className="text-xs text-[var(--text-muted)] mt-2">
            {stats?.cumplimientoSLA === 0
              ? 'Sin datos suficientes'
              : `${stats?.ordenesAbiertas ?? 0} abiertas · ${stats?.ordenesCompletadas ?? 0} cerradas`}
          </p>
        </div>
      </div>
    </div>
  )
}
```

---

## FASE 4 — GRÁFICAS REALES

### 4.1 ChartCard wrapper

Archivo: `apps/web/src/components/dashboard/ChartCard.tsx`

```typescript
'use client'

import { cn } from '@/lib/utils'
import { SectionHeader } from '@/components/ui/SectionHeader'
import { EmptyStateCard } from '@/components/ui/EmptyStateCard'
import { BarChart3 } from 'lucide-react'

interface ChartCardProps {
  title: string
  subtitle?: string
  action?: React.ReactNode
  hasData: boolean
  isLoading?: boolean
  children: React.ReactNode
  className?: string
  height?: number
}

function ChartSkeleton({ height }: { height: number }) {
  return (
    <div
      className="animate-pulse rounded-lg bg-[var(--bg-muted)]"
      style={{ height }}
    />
  )
}

export function ChartCard({
  title,
  subtitle,
  action,
  hasData,
  isLoading,
  children,
  className,
  height = 260,
}: ChartCardProps) {
  return (
    <div
      className={cn(
        'bg-[var(--card)] border border-[var(--line)] rounded-xl p-5 shadow-soft',
        className
      )}
    >
      <SectionHeader title={title} subtitle={subtitle} action={action} className="mb-4" />

      {isLoading && <ChartSkeleton height={height} />}

      {!isLoading && !hasData && (
        <EmptyStateCard
          icon={<BarChart3 className="w-5 h-5" />}
          title="Sin datos disponibles"
          description="Los gráficos se actualizarán cuando haya órdenes registradas."
          className="border-none shadow-none py-8"
        />
      )}

      {!isLoading && hasData && (
        <div style={{ height }}>{children}</div>
      )}
    </div>
  )
}
```

### 4.2 Hook para datos de gráficas

Archivo: `apps/web/src/hooks/useChartData.ts`

```typescript
import useSWR from 'swr'

export interface MonthlyTrendPoint {
  month: string
  creadas: number
  completadas: number
}

export interface OrdersByStatusPoint {
  estado: string
  count: number
  color: string
}

interface ChartsData {
  tendenciaMensual: MonthlyTrendPoint[]
  ordenesPorEstado: OrdersByStatusPoint[]
}

const fetcher = (url: string) => fetch(url, { credentials: 'include' }).then(r => r.json())

export function useChartData() {
  const { data, error, isLoading } = useSWR<ChartsData>(
    '/api/dashboard/charts',
    fetcher,
    { refreshInterval: 60_000 }
  )

  return {
    tendenciaMensual: data?.tendenciaMensual ?? [],
    ordenesPorEstado: data?.ordenesPorEstado ?? [],
    isLoading,
    isError: !!error,
  }
}
```

### 4.3 Endpoint de charts reales

Archivo: `apps/web/src/app/api/dashboard/charts/route.ts`

```typescript
import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'

export async function GET() {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  try {
    const backendUrl = process.env.BACKEND_URL ?? 'http://localhost:3001'
    const res = await fetch(`${backendUrl}/dashboard/charts`, {
      headers: { Authorization: `Bearer ${session.accessToken}` },
      next: { revalidate: 60 },
    })
    const data = await res.json()
    return NextResponse.json(data)
  } catch {
    return NextResponse.json({ error: 'Error al cargar gráficas' }, { status: 500 })
  }
}
```

### 4.4 TrendLineChart

Archivo: `apps/web/src/components/dashboard/charts/TrendLineChart.tsx`

```typescript
'use client'

import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from 'recharts'
import type { MonthlyTrendPoint } from '@/hooks/useChartData'

interface TrendLineChartProps {
  data: MonthlyTrendPoint[]
}

const CustomTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null
  return (
    <div className="bg-[var(--card)] border border-[var(--line)] rounded-lg p-3 shadow-card text-xs">
      <p className="font-semibold text-[var(--text)] mb-1.5">{label}</p>
      {payload.map((entry: any) => (
        <div key={entry.name} className="flex items-center gap-2 text-[var(--text-soft)]">
          <div className="w-2 h-2 rounded-full" style={{ background: entry.color }} />
          <span>{entry.name === 'creadas' ? 'Creadas' : 'Completadas'}: {entry.value}</span>
        </div>
      ))}
    </div>
  )
}

export function TrendLineChart({ data }: TrendLineChartProps) {
  return (
    <ResponsiveContainer width="100%" height="100%">
      <LineChart data={data} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
        <CartesianGrid
          strokeDasharray="3 3"
          stroke="var(--line)"
          vertical={false}
        />
        <XAxis
          dataKey="month"
          tick={{ fontSize: 11, fill: 'var(--text-muted)' }}
          axisLine={false}
          tickLine={false}
        />
        <YAxis
          tick={{ fontSize: 11, fill: 'var(--text-muted)' }}
          axisLine={false}
          tickLine={false}
        />
        <Tooltip content={<CustomTooltip />} />
        <Legend
          wrapperStyle={{ fontSize: 12, color: 'var(--text-soft)' }}
          iconType="circle"
          iconSize={8}
        />
        <Line
          type="monotone"
          dataKey="creadas"
          stroke="var(--cermont-blue)"
          strokeWidth={2}
          dot={{ r: 3, fill: 'var(--cermont-blue)' }}
          activeDot={{ r: 5 }}
        />
        <Line
          type="monotone"
          dataKey="completadas"
          stroke="var(--cermont-green)"
          strokeWidth={2}
          dot={{ r: 3, fill: 'var(--cermont-green)' }}
          activeDot={{ r: 5 }}
        />
      </LineChart>
    </ResponsiveContainer>
  )
}
```

### 4.5 StatusDonutChart

Archivo: `apps/web/src/components/dashboard/charts/StatusDonutChart.tsx`

```typescript
'use client'

import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend } from 'recharts'
import type { OrdersByStatusPoint } from '@/hooks/useChartData'

interface StatusDonutChartProps {
  data: OrdersByStatusPoint[]
}

const CustomTooltip = ({ active, payload }: any) => {
  if (!active || !payload?.length) return null
  return (
    <div className="bg-[var(--card)] border border-[var(--line)] rounded-lg p-3 shadow-card text-xs">
      <p className="font-semibold text-[var(--text)]">{payload.name}</p>
      <p className="text-[var(--text-soft)]">{payload.value} órdenes</p>
    </div>
  )
}

export function StatusDonutChart({ data }: StatusDonutChartProps) {
  return (
    <ResponsiveContainer width="100%" height="100%">
      <PieChart>
        <Pie
          data={data}
          cx="50%"
          cy="50%"
          innerRadius="55%"
          outerRadius="75%"
          paddingAngle={3}
          dataKey="count"
          nameKey="estado"
        >
          {data.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={entry.color} />
          ))}
        </Pie>
        <Tooltip content={<CustomTooltip />} />
        <Legend
          layout="vertical"
          align="right"
          verticalAlign="middle"
          iconType="circle"
          iconSize={8}
          wrapperStyle={{ fontSize: 12, color: 'var(--text-soft)' }}
        />
      </PieChart>
    </ResponsiveContainer>
  )
}
```

---

## FASE 5 — ACTIVIDAD RECIENTE Y ALERTAS

### 5.1 Hook de actividad reciente

Archivo: `apps/web/src/hooks/useRecentActivity.ts`

```typescript
import useSWR from 'swr'

export interface ActivityEvent {
  id: string
  type: 'orden_creada' | 'orden_completada' | 'orden_bloqueada' | 'sla_riesgo' | 'factura_emitida'
  title: string
  subtitle: string
  timestamp: string
  userAvatar?: string
  userName?: string
  ordenId?: string
  ordenCodigo?: string
}

const fetcher = (url: string) => fetch(url, { credentials: 'include' }).then(r => r.json())

export function useRecentActivity(limit = 10) {
  const { data, isLoading } = useSWR<ActivityEvent[]>(
    `/api/dashboard/activity?limit=${limit}`,
    fetcher,
    { refreshInterval: 15_000 }
  )

  return { events: data ?? [], isLoading }
}
```

### 5.2 Endpoint de actividad

Archivo: `apps/web/src/app/api/dashboard/activity/route.ts`

```typescript
import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'

export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const limit = req.nextUrl.searchParams.get('limit') ?? '10'
  const backendUrl = process.env.BACKEND_URL ?? 'http://localhost:3001'

  try {
    const res = await fetch(`${backendUrl}/dashboard/activity?limit=${limit}`, {
      headers: { Authorization: `Bearer ${session.accessToken}` },
    })
    const data = await res.json()
    return NextResponse.json(data)
  } catch {
    return NextResponse.json([], { status: 200 })
  }
}
```

### 5.3 RecentActivityFeed componente

Archivo: `apps/web/src/components/dashboard/RecentActivityFeed.tsx`

```typescript
'use client'

import { formatDistanceToNow } from 'date-fns'
import { es } from 'date-fns/locale'
import {
  ClipboardList,
  CheckCircle2,
  AlertTriangle,
  Clock,
  Receipt,
  Activity,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { EmptyStateCard } from '@/components/ui/EmptyStateCard'
import { SectionHeader } from '@/components/ui/SectionHeader'
import Link from 'next/link'
import type { ActivityEvent } from '@/hooks/useRecentActivity'

const eventConfig: Record<ActivityEvent['type'], {
  icon: React.ComponentType<{ className?: string }>
  iconBg: string
  iconColor: string
}> = {
  orden_creada: {
    icon: ClipboardList,
    iconBg: 'bg-[var(--brand-soft)]',
    iconColor: 'text-[var(--cermont-blue)]',
  },
  orden_completada: {
    icon: CheckCircle2,
    iconBg: 'bg-[var(--success-soft)]',
    iconColor: 'text-[var(--cermont-green)]',
  },
  orden_bloqueada: {
    icon: AlertTriangle,
    iconBg: 'bg-[var(--danger-soft)]',
    iconColor: 'text-[var(--danger)]',
  },
  sla_riesgo: {
    icon: Clock,
    iconBg: 'bg-[var(--warning-soft)]',
    iconColor: 'text-[var(--warning)]',
  },
  factura_emitida: {
    icon: Receipt,
    iconBg: 'bg-[var(--success-soft)]',
    iconColor: 'text-[var(--cermont-green-deep)]',
  },
}

interface RecentActivityFeedProps {
  events: ActivityEvent[]
  isLoading: boolean
  viewAllHref?: string
}

function ActivitySkeleton() {
  return (
    <div className="flex gap-3 py-3 animate-pulse">
      <div className="w-9 h-9 rounded-full bg-[var(--bg-muted)] flex-shrink-0" />
      <div className="flex-1">
        <div className="h-3 bg-[var(--bg-muted)] rounded w-3/4 mb-2" />
        <div className="h-3 bg-[var(--bg-muted)] rounded w-1/2" />
      </div>
    </div>
  )
}

export function RecentActivityFeed({
  events,
  isLoading,
  viewAllHref,
}: RecentActivityFeedProps) {
  return (
    <div className="bg-[var(--card)] border border-[var(--line)] rounded-xl p-5 shadow-soft">
      <SectionHeader
        title="Actividad reciente"
        subtitle="Eventos operativos confirmados"
        action={
          viewAllHref ? (
            <Link
              href={viewAllHref}
              className="text-xs font-medium text-[var(--cermont-blue)] hover:underline"
            >
              Ver todo →
            </Link>
          ) : undefined
        }
        className="mb-4"
      />

      {isLoading && (
        <div className="divide-y divide-[var(--line)]">
          {.map(i => <ActivitySkeleton key={i} />)} [ppl-ai-file-upload.s3.amazonaws](https://ppl-ai-file-upload.s3.amazonaws.com/web/direct-files/attachments/images/133384987/7cc3ec49-b268-4785-bd4a-f85c2682d842/screenshot.jpg?AWSAccessKeyId=ASIA2F3EMEYEVF5WLLV3&Signature=ci4NHYCF%2BQwPMa1zwm%2FQsutBy08%3D&x-amz-security-token=IQoJb3JpZ2luX2VjECoaCXVzLWVhc3QtMSJHMEUCIQD3FaBE%2FLHfyL4z%2BLsF0d4%2B8YvMW9aek3zwotEJ8ZpP9QIgcgD3D4oZeP5%2FrKpVVaHX9SprWgHUwfBp%2FpIKPXKwCjgq%2FAQI8v%2F%2F%2F%2F%2F%2F%2F%2F%2F%2FARABGgw2OTk3NTMzMDk3MDUiDCzHXo9dygH%2BhSatdirQBMfoDpLerUpT12uUfvDEirSOQV2uJoG7C06sDPbMyhLAU1ZLi1FG%2BNYNkWpR6H2k3Oy%2FbgVAyR1JqSYGooO8BqX%2B%2BckTiYw%2BPkvFeXoISWnCtT1Zv9p5gWAyATUaT3%2FQQILAl0zm2cFVYhLu%2FiS%2B9FxKQxp3Q2s%2BFoCLJb9EV2XxveVVniXzkqvFFhHtkZBTDvVFv%2FggocdcIjoRGbege7QvMIQWE5XjNQMgbYBdqP3%2F1TpHqhkAEDDotH0kugH%2FHwkDRKC5ZhDKrrYlUeqQQR7wYhMrpewNjl3rygkaKqew73%2F2vRG0K9XwEDcOW46BId0rZ2fYuOKDbpXphQyLxBfr5uc1EVm9I9x3PzF7HZaMMvVBxMokVoj8ePpH52ln6h9wVTf8e2HeLBr%2BnOMBg%2F5YNTfuoIdyqcjndYtUdLvKdfyIH%2B9hqpFArw2b1w0oui3fmGhIsmm9j41%2Frnq8Z7gu0BxU%2BtyjWuwFCMG8w9%2F1%2BKxtn6GrpkoqyVBZvz1yvFCvkSVq%2BAFxwmZrHnI7uT%2Bw0rse9ex3wGEQCp2qb%2FUpjMfyg7c2ar8nD55gJrK8STmKEoGVKVD93%2FDz9Ur0PRsBlhG6OLPzWbhCC12%2Fyv89xL67kJIXEZ7uok5w0GGHdQaNsvYq3kBtSvTwrOk4EEqPUmmbeHtARNLsAROJolb70tqOwNDcc8iZYxvV71OMVj6%2FztLh5I9zKMAUa3%2FxQ9gQl8CzqgFL4aUgV9nRyr8Ck%2FpzQwk7GOxfjeq3d7Rq0p4Iesf7kw7OUmMXRj4uwgsw95SJ0wY6mAGmLcYBYtN6S8rN%2B3u9YaWWnzJV49a1EJU2%2Bd%2FQxyRHJErA9%2BOaIPbGp9LzN7xySBdC5e4N6GYovnBx8MxUEha97hhj0kP%2Bn2HZBJDDQEw8%2FD%2BQBrcBtrC8GZrEao43pT7WabaQL6L828dK03NlX6Nx5F2xDyxutsZyjGACcEsssLXy5hvuyVWcaY2IIaDQIrumbTadoxH7cQ%3D%3D&Expires=1784830026)
        </div>
      )}

      {!isLoading && events.length === 0 && (
        <EmptyStateCard
          icon={<Activity className="w-5 h-5" />}
          title="Sin actividad reciente"
          description="Los eventos operativos confirmados aparecerán aquí."
          className="border-none shadow-none py-6"
        />
      )}

      {!isLoading && events.length > 0 && (
        <div className="divide-y divide-[var(--line)]">
          {events.map((event) => {
            const config = eventConfig[event.type]
            const Icon = config.icon
            return (
              <div
                key={event.id}
                className="flex items-start gap-3 py-3 first:pt-0 last:pb-0"
              >
                <div
                  className={cn(
                    'w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0',
                    config.iconBg
                  )}
                >
                  <Icon className={cn('w-4 h-4', config.iconColor)} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-[var(--text)] truncate">
                    {event.title}
                  </p>
                  <div className="flex items-center gap-2 mt-0.5">
                    <p className="text-xs text-[var(--text-muted)] truncate">{event.subtitle}</p>
                    <span className="text-[var(--text-muted)] text-xs flex-shrink-0">·</span>
                    <span className="text-xs text-[var(--text-muted)] flex-shrink-0">
                      {formatDistanceToNow(new Date(event.timestamp), {
                        addSuffix: true,
                        locale: es,
                      })}
                    </span>
                  </div>
                </div>
                {event.ordenCodigo && (
                  <Link
                    href={`/ordenes/${event.ordenId}`}
                    className="text-xs font-mono text-[var(--cermont-blue-light)] hover:underline flex-shrink-0"
                  >
                    {event.ordenCodigo}
                  </Link>
                )}
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
```

---

## FASE 6 — FLUJO OPERATIVO DE 14 PASOS REFACTORIZADO

### 6.1 Tipos del flujo

Archivo: `apps/web/src/types/flow.ts`

```typescript
export type FlowStage = 'comercial' | 'operativo' | 'cierre' | 'financiero'

export interface FlowStep {
  number: number
  title: string
  description: string
  stage: FlowStage
  count?: number
  amount?: number
}

export const FLOW_STAGE_LABELS: Record<FlowStage, string> = {
  comercial: 'Comercial',
  operativo: 'Operativo',
  cierre: 'Cierre',
  financiero: 'Financiero',
}

export const FLOW_STAGE_COLORS: Record<FlowStage, {
  bg: string
  text: string
  border: string
  badge: string
}> = {
  comercial: {
    bg: 'bg-[var(--brand-soft)]',
    text: 'text-[var(--cermont-blue)]',
    border: 'border-[var(--cermont-blue-light)]',
    badge: 'bg-[var(--info-soft)] text-[var(--cermont-blue)]',
  },
  operativo: {
    bg: 'bg-[var(--success-soft)]',
    text: 'text-[var(--cermont-green-deep)]',
    border: 'border-[var(--cermont-green)]',
    badge: 'bg-[var(--success-soft)] text-[var(--cermont-green-deep)]',
  },
  cierre: {
    bg: 'bg-[var(--warning-soft)]',
    text: 'text-amber-800',
    border: 'border-[var(--warning)]',
    badge: 'bg-[var(--warning-soft)] text-amber-800',
  },
  financiero: {
    bg: 'bg-[var(--brand-soft)]',
    text: 'text-[var(--cermont-navy)]',
    border: 'border-[var(--cermont-navy)]',
    badge: 'bg-[rgba(15,44,89,0.10)] text-[var(--cermont-navy)]',
  },
}

export const CERMONT_FLOW_STEPS: FlowStep[] = [
  { number: 1,  title: 'Solicitud',         description: 'Registro y apertura del caso de servicio.',             stage: 'comercial' },
  { number: 2,  title: 'Visita',            description: 'Inspección técnica previa al servicio.',                stage: 'comercial' },
  { number: 3,  title: 'Propuesta',         description: 'Creación y envío de propuesta técnica-comercial.',      stage: 'comercial' },
  { number: 4,  title: 'Aprobación',        description: 'Confirmación del cliente para proceder.',               stage: 'comercial' },
  { number: 5,  title: 'Orden de Trabajo',  description: 'Generación de la orden oficial de servicio.',           stage: 'operativo' },
  { number: 6,  title: 'Planeación',        description: 'Asignación de técnicos, recursos y agenda.',            stage: 'operativo' },
  { number: 7,  title: 'Ejecución',         description: 'Realización del trabajo en campo.',                     stage: 'operativo' },
  { number: 8,  title: 'Evidencias',        description: 'Registro fotográfico y soportes de la ejecución.',      stage: 'operativo' },
  { number: 9,  title: 'Informe Técnico',   description: 'Documentación de ejecución y recursos usados.',         stage: 'operativo' },
  { number: 10, title: 'Acta de Entrega',   description: 'Generación del acta y sus soportes.',                   stage: 'cierre' },
  { number: 11, title: 'Firma del Cliente', description: 'Aceptación formal de la entrega por el cliente.',       stage: 'cierre' },
  { number: 12, title: 'SES / Ariba',       description: 'Registro, envío y aprobación de la hoja de entrada.',  stage: 'cierre' },
  { number: 13, title: 'Facturación',       description: 'Emisión de factura electrónica con soportes.',          stage: 'financiero' },
  { number: 14, title: 'Pago y Cierre',     description: 'Recibo de fondos y cierre del ciclo.',                  stage: 'financiero' },
]
```

### 6.2 FlowStepCard

Archivo: `apps/web/src/components/dashboard/FlowStepCard.tsx`

```typescript
'use client'

import { cn } from '@/lib/utils'
import { FLOW_STAGE_COLORS } from '@/types/flow'
import type { FlowStep } from '@/types/flow'

interface FlowStepCardProps {
  step: FlowStep
  isActive?: boolean
}

export function FlowStepCard({ step, isActive }: FlowStepCardProps) {
  const colors = FLOW_STAGE_COLORS[step.stage]

  return (
    <div
      className={cn(
        'relative bg-[var(--card)] border border-[var(--line)] rounded-xl p-4',
        'hover:shadow-card hover:border-[var(--line-strong)] transition-all duration-200',
        isActive && `border-l-2 ${colors.border}`
      )}
    >
      {/* Número del paso */}
      <div className="flex items-start justify-between mb-3">
        <div
          className={cn(
            'w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0',
            colors.bg,
            colors.text
          )}
        >
          {step.number}
        </div>
        {step.count !== undefined && step.count > 0 && (
          <span
            className={cn(
              'text-xs font-semibold px-2 py-0.5 rounded-full',
              colors.badge
            )}
          >
            {step.count}
          </span>
        )}
      </div>

      {/* Contenido */}
      <p className="text-sm font-semibold text-[var(--text)] mb-1">{step.title}</p>
      <p className="text-xs text-[var(--text-muted)] leading-relaxed">{step.description}</p>

      {/* Tag de etapa */}
      <div className="mt-3 pt-2.5 border-t border-[var(--line)]">
        <span
          className={cn(
            'text-[10px] font-bold uppercase tracking-widest',
            colors.text
          )}
        >
          {step.stage}
        </span>
      </div>
    </div>
  )
}
```

### 6.3 FlowStageTabs + grid

Archivo: `apps/web/src/components/dashboard/FlowStageTabs.tsx`

```typescript
'use client'

import { useState } from 'react'
import { cn } from '@/lib/utils'
import { FlowStepCard } from './FlowStepCard'
import { SectionHeader } from '@/components/ui/SectionHeader'
import {
  CERMONT_FLOW_STEPS,
  FLOW_STAGE_LABELS,
  FLOW_STAGE_COLORS,
} from '@/types/flow'
import type { FlowStage } from '@/types/flow'

type TabOption = 'all' | FlowStage

const tabs: { value: TabOption; label: string }[] = [
  { value: 'all', label: 'Todos' },
  { value: 'comercial', label: FLOW_STAGE_LABELS.comercial },
  { value: 'operativo', label: FLOW_STAGE_LABELS.operativo },
  { value: 'cierre', label: FLOW_STAGE_LABELS.cierre },
  { value: 'financiero', label: FLOW_STAGE_LABELS.financiero },
]

export function FlowStageTabs() {
  const [activeTab, setActiveTab] = useState<TabOption>('all')

  const filteredSteps =
    activeTab === 'all'
      ? CERMONT_FLOW_STEPS
      : CERMONT_FLOW_STEPS.filter(s => s.stage === activeTab)

  return (
    <div>
      <SectionHeader
        title="Flujo Operativo"
        subtitle="Cadena documental de 14 pasos de CERMONT"
      />

      {/* Tabs */}
      <div className="flex flex-wrap gap-2 mb-5">
        {tabs.map((tab) => {
          const isActive = activeTab === tab.value
          const stageColor = tab.value !== 'all' ? FLOW_STAGE_COLORS[tab.value as FlowStage] : null

          return (
            <button
              key={tab.value}
              onClick={() => setActiveTab(tab.value)}
              className={cn(
                'px-3.5 py-1.5 rounded-full text-xs font-semibold transition-all duration-150',
                isActive
                  ? stageColor
                    ? `${stageColor.bg} ${stageColor.text} border border-current`
                    : 'bg-[var(--cermont-blue)] text-white'
                  : 'bg-[var(--bg-muted)] text-[var(--text-soft)] hover:bg-[var(--bg-soft)] border border-transparent'
              )}
            >
              {tab.label}
              {tab.value !== 'all' && (
                <span className="ml-1.5 opacity-70">
                  ({CERMONT_FLOW_STEPS.filter(s => s.stage === tab.value).length})
                </span>
              )}
            </button>
          )
        })}
      </div>

      {/* Grid de steps */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
        {filteredSteps.map((step) => (
          <FlowStepCard key={step.number} step={step} />
        ))}
      </div>
    </div>
  )
}
```

---

## FASE 7 — SLA Y ALERTAS

### 7.1 AlertSummaryCard refactorizado

Archivo: `apps/web/src/components/dashboard/AlertSummaryCard.tsx`

```typescript
'use client'

import { AlertTriangle, Clock, CheckCircle2 } from 'lucide-react'
import { cn } from '@/lib/utils'
import { EmptyStateCard } from '@/components/ui/EmptyStateCard'
import { SectionHeader } from '@/components/ui/SectionHeader'
import Link from 'next/link'
import useSWR from 'swr'

interface SlaAlert {
  id: string
  ordenCodigo: string
  ordenId: string
  cliente: string
  etapa: string
  horasRestantes: number
  estado: 'vencida' | 'riesgo'
}

const fetcher = (url: string) => fetch(url, { credentials: 'include' }).then(r => r.json())

export function AlertSummaryCard() {
  const { data: alerts, isLoading } = useSWR<SlaAlert[]>(
    '/api/dashboard/sla-alerts',
    fetcher,
    { refreshInterval: 60_000 }
  )

  const hasAlerts = (alerts?.length ?? 0) > 0

  return (
    <div className="bg-[var(--card)] border border-[var(--line)] rounded-xl p-5 shadow-soft">
      <SectionHeader
        title="Órdenes en riesgo de SLA"
        subtitle="Casos activos vencidos o con menos de 72 horas para su fecha objetivo"
        className="mb-4"
      />

      {/* Indicador visual de SLA */}
      {!isLoading && hasAlerts && (
        <div className="flex items-center gap-2 mb-4 px-3 py-2 bg-[var(--warning-soft)] rounded-lg border border-[var(--warning)] border-opacity-30">
          <AlertTriangle className="w-4 h-4 text-[var(--warning)] flex-shrink-0" />
          <p className="text-xs font-semibold text-amber-800 dark:text-amber-300">
            {alerts!.length} {alerts!.length === 1 ? 'orden requiere' : 'órdenes requieren'} atención inmediata
          </p>
        </div>
      )}

      {isLoading && (
        <div className="space-y-2">
          {.map(i => ( [ppl-ai-file-upload.s3.amazonaws](https://ppl-ai-file-upload.s3.amazonaws.com/web/direct-files/attachments/images/133384987/ff562f9f-56c5-4cc7-8e46-1770e1837838/screenshot.jpg?AWSAccessKeyId=ASIA2F3EMEYEVF5WLLV3&Signature=99tQ6CJEIJ3jM4VdJO%2FqB8UMuH4%3D&x-amz-security-token=IQoJb3JpZ2luX2VjECoaCXVzLWVhc3QtMSJHMEUCIQD3FaBE%2FLHfyL4z%2BLsF0d4%2B8YvMW9aek3zwotEJ8ZpP9QIgcgD3D4oZeP5%2FrKpVVaHX9SprWgHUwfBp%2FpIKPXKwCjgq%2FAQI8v%2F%2F%2F%2F%2F%2F%2F%2F%2F%2FARABGgw2OTk3NTMzMDk3MDUiDCzHXo9dygH%2BhSatdirQBMfoDpLerUpT12uUfvDEirSOQV2uJoG7C06sDPbMyhLAU1ZLi1FG%2BNYNkWpR6H2k3Oy%2FbgVAyR1JqSYGooO8BqX%2B%2BckTiYw%2BPkvFeXoISWnCtT1Zv9p5gWAyATUaT3%2FQQILAl0zm2cFVYhLu%2FiS%2B9FxKQxp3Q2s%2BFoCLJb9EV2XxveVVniXzkqvFFhHtkZBTDvVFv%2FggocdcIjoRGbege7QvMIQWE5XjNQMgbYBdqP3%2F1TpHqhkAEDDotH0kugH%2FHwkDRKC5ZhDKrrYlUeqQQR7wYhMrpewNjl3rygkaKqew73%2F2vRG0K9XwEDcOW46BId0rZ2fYuOKDbpXphQyLxBfr5uc1EVm9I9x3PzF7HZaMMvVBxMokVoj8ePpH52ln6h9wVTf8e2HeLBr%2BnOMBg%2F5YNTfuoIdyqcjndYtUdLvKdfyIH%2B9hqpFArw2b1w0oui3fmGhIsmm9j41%2Frnq8Z7gu0BxU%2BtyjWuwFCMG8w9%2F1%2BKxtn6GrpkoqyVBZvz1yvFCvkSVq%2BAFxwmZrHnI7uT%2Bw0rse9ex3wGEQCp2qb%2FUpjMfyg7c2ar8nD55gJrK8STmKEoGVKVD93%2FDz9Ur0PRsBlhG6OLPzWbhCC12%2Fyv89xL67kJIXEZ7uok5w0GGHdQaNsvYq3kBtSvTwrOk4EEqPUmmbeHtARNLsAROJolb70tqOwNDcc8iZYxvV71OMVj6%2FztLh5I9zKMAUa3%2FxQ9gQl8CzqgFL4aUgV9nRyr8Ck%2FpzQwk7GOxfjeq3d7Rq0p4Iesf7kw7OUmMXRj4uwgsw95SJ0wY6mAGmLcYBYtN6S8rN%2B3u9YaWWnzJV49a1EJU2%2Bd%2FQxyRHJErA9%2BOaIPbGp9LzN7xySBdC5e4N6GYovnBx8MxUEha97hhj0kP%2Bn2HZBJDDQEw8%2FD%2BQBrcBtrC8GZrEao43pT7WabaQL6L828dK03NlX6Nx5F2xDyxutsZyjGACcEsssLXy5hvuyVWcaY2IIaDQIrumbTadoxH7cQ%3D%3D&Expires=1784830026)
            <div key={i} className="h-14 bg-[var(--bg-muted)] rounded-lg animate-pulse" />
          ))}
        </div>
      )}

      {!isLoading && !hasAlerts && (
        <EmptyStateCard
          icon={<CheckCircle2 className="w-5 h-5" />}
          title="Sin órdenes en riesgo de SLA"
          description="Todas las órdenes activas están dentro de los plazos."
          className="border-none shadow-none py-6"
        />
      )}

      {!isLoading && hasAlerts && (
        <div className="space-y-2">
          {alerts!.map((alert) => (
            <Link
              key={alert.id}
              href={`/ordenes/${alert.ordenId}`}
              className={cn(
                'flex items-center gap-3 p-3 rounded-lg border transition-colors',
                'hover:border-[var(--line-strong)] hover:bg-[var(--bg-soft)]',
                alert.estado === 'vencida'
                  ? 'border-[var(--danger)] bg-[var(--danger-soft)]'
                  : 'border-[var(--warning)] bg-[var(--warning-soft)]'
              )}
            >
              <div
                className={cn(
                  'w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0',
                  alert.estado === 'vencida'
                    ? 'bg-[var(--danger)] text-white'
                    : 'bg-[var(--warning)] text-white'
                )}
              >
                <Clock className="w-3.5 h-3.5" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-2">
                  <p className="text-sm font-semibold text-[var(--text)] truncate">
                    {alert.ordenCodigo}
                  </p>
                  <span
                    className={cn(
                      'text-xs font-bold flex-shrink-0',
                      alert.estado === 'vencida' ? 'text-[var(--danger)]' : 'text-[var(--warning)]'
                    )}
                  >
                    {alert.estado === 'vencida' ? 'VENCIDA' : `${alert.horasRestantes}h`}
                  </span>
                </div>
                <p className="text-xs text-[var(--text-muted)] truncate">
                  {alert.cliente} · {alert.etapa}
                </p>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}
```

---

## FASE 8 — ÓRDENES RECIENTES

### 8.1 Hook de órdenes recientes

Archivo: `apps/web/src/hooks/useRecentOrders.ts`

```typescript
import useSWR from 'swr'

export interface RecentOrder {
  id: string
  codigo: string
  cliente: string
  etapa: string
  estado: 'activa' | 'completada' | 'bloqueada' | 'en_ejecucion' | 'lista_facturar' | 'draft'
  fecha: string
  responsable?: string
  responsableAvatar?: string
}

const fetcher = (url: string) => fetch(url, { credentials: 'include' }).then(r => r.json())

export function useRecentOrders(limit = 5) {
  const { data, isLoading } = useSWR<RecentOrder[]>(
    `/api/dashboard/recent-orders?limit=${limit}`,
    fetcher,
    { refreshInterval: 30_000 }
  )

  return { orders: data ?? [], isLoading }
}
```

### 8.2 RecentOrdersTable

Archivo: `apps/web/src/components/dashboard/RecentOrdersTable.tsx`

```typescript
'use client'

import { format } from 'date-fns'
import { es } from 'date-fns/locale'
import Link from 'next/link'
import { ExternalLink, ClipboardList } from 'lucide-react'
import { cn } from '@/lib/utils'
import { StatusBadge } from '@/components/ui/StatusBadge'
import { EmptyStateCard } from '@/components/ui/EmptyStateCard'
import { SectionHeader } from '@/components/ui/SectionHeader'
import type { RecentOrder } from '@/hooks/useRecentOrders'

const estadoMap: Record<RecentOrder['estado'], {
  variant: 'success' | 'warning' | 'danger' | 'info' | 'neutral' | 'draft'
  label: string
}> = {
  activa: { variant: 'info', label: 'Activa' },
  completada: { variant: 'success', label: 'Completada' },
  bloqueada: { variant: 'danger', label: 'Bloqueada' },
  en_ejecucion: { variant: 'info', label: 'En ejecución' },
  lista_facturar: { variant: 'warning', label: 'Lista para facturar' },
  draft: { variant: 'draft', label: 'Borrador' },
}

interface RecentOrdersTableProps {
  orders: RecentOrder[]
  isLoading: boolean
  viewAllHref?: string
}

function TableSkeleton() {
  return (
    <div className="space-y-2">
      {.map(i => ( [ppl-ai-file-upload.s3.amazonaws](https://ppl-ai-file-upload.s3.amazonaws.com/web/direct-files/attachments/images/133384987/be4e3cdc-6131-489e-b5da-6eac4d4040ae/screenshot.jpg?AWSAccessKeyId=ASIA2F3EMEYEVF5WLLV3&Signature=KGANU8PiTStulOJoFed7mngrAUU%3D&x-amz-security-token=IQoJb3JpZ2luX2VjECoaCXVzLWVhc3QtMSJHMEUCIQD3FaBE%2FLHfyL4z%2BLsF0d4%2B8YvMW9aek3zwotEJ8ZpP9QIgcgD3D4oZeP5%2FrKpVVaHX9SprWgHUwfBp%2FpIKPXKwCjgq%2FAQI8v%2F%2F%2F%2F%2F%2F%2F%2F%2F%2FARABGgw2OTk3NTMzMDk3MDUiDCzHXo9dygH%2BhSatdirQBMfoDpLerUpT12uUfvDEirSOQV2uJoG7C06sDPbMyhLAU1ZLi1FG%2BNYNkWpR6H2k3Oy%2FbgVAyR1JqSYGooO8BqX%2B%2BckTiYw%2BPkvFeXoISWnCtT1Zv9p5gWAyATUaT3%2FQQILAl0zm2cFVYhLu%2FiS%2B9FxKQxp3Q2s%2BFoCLJb9EV2XxveVVniXzkqvFFhHtkZBTDvVFv%2FggocdcIjoRGbege7QvMIQWE5XjNQMgbYBdqP3%2F1TpHqhkAEDDotH0kugH%2FHwkDRKC5ZhDKrrYlUeqQQR7wYhMrpewNjl3rygkaKqew73%2F2vRG0K9XwEDcOW46BId0rZ2fYuOKDbpXphQyLxBfr5uc1EVm9I9x3PzF7HZaMMvVBxMokVoj8ePpH52ln6h9wVTf8e2HeLBr%2BnOMBg%2F5YNTfuoIdyqcjndYtUdLvKdfyIH%2B9hqpFArw2b1w0oui3fmGhIsmm9j41%2Frnq8Z7gu0BxU%2BtyjWuwFCMG8w9%2F1%2BKxtn6GrpkoqyVBZvz1yvFCvkSVq%2BAFxwmZrHnI7uT%2Bw0rse9ex3wGEQCp2qb%2FUpjMfyg7c2ar8nD55gJrK8STmKEoGVKVD93%2FDz9Ur0PRsBlhG6OLPzWbhCC12%2Fyv89xL67kJIXEZ7uok5w0GGHdQaNsvYq3kBtSvTwrOk4EEqPUmmbeHtARNLsAROJolb70tqOwNDcc8iZYxvV71OMVj6%2FztLh5I9zKMAUa3%2FxQ9gQl8CzqgFL4aUgV9nRyr8Ck%2FpzQwk7GOxfjeq3d7Rq0p4Iesf7kw7OUmMXRj4uwgsw95SJ0wY6mAGmLcYBYtN6S8rN%2B3u9YaWWnzJV49a1EJU2%2Bd%2FQxyRHJErA9%2BOaIPbGp9LzN7xySBdC5e4N6GYovnBx8MxUEha97hhj0kP%2Bn2HZBJDDQEw8%2FD%2BQBrcBtrC8GZrEao43pT7WabaQL6L828dK03NlX6Nx5F2xDyxutsZyjGACcEsssLXy5hvuyVWcaY2IIaDQIrumbTadoxH7cQ%3D%3D&Expires=1784830026)
        <div key={i} className="h-12 bg-[var(--bg-muted)] rounded-lg animate-pulse" />
      ))}
    </div>
  )
}

export function RecentOrdersTable({
  orders,
  isLoading,
  viewAllHref,
}: RecentOrdersTableProps) {
  return (
    <div className="bg-[var(--card)] border border-[var(--line)] rounded-xl p-5 shadow-soft">
      <SectionHeader
        title="Órdenes Recientes"
        subtitle="Últimas órdenes registradas en el sistema"
        action={
          viewAllHref ? (
            <Link
              href={viewAllHref}
              className="text-xs font-medium text-[var(--cermont-blue)] hover:underline"
            >
              Ver todas →
            </Link>
          ) : undefined
        }
        className="mb-4"
      />

      {isLoading && <TableSkeleton />}

      {!isLoading && orders.length === 0 && (
        <EmptyStateCard
          icon={<ClipboardList className="w-5 h-5" />}
          title="Sin órdenes recientes"
          description="Cuando se creen nuevas órdenes, aparecerán aquí."
          action={
            <Link
              href="/ordenes/nueva"
              className="text-xs font-semibold text-[var(--cermont-blue)] hover:underline"
            >
              + Crear orden
            </Link>
          }
          className="border-none shadow-none py-6"
        />
      )}

      {!isLoading && orders.length > 0 && (
        <div className="overflow-x-auto -mx-1">
          <table className="w-full min-w-[600px]">
            <thead>
              <tr className="border-b border-[var(--line)]">
                {['Código', 'Cliente', 'Etapa', 'Estado', 'Fecha', ''].map((h) => (
                  <th
                    key={h}
                    className="text-left text-xs font-semibold text-[var(--text-muted)] uppercase tracking-wider pb-3 px-2 first:pl-0 last:pr-0"
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--line)]">
              {orders.map((order) => {
                const statusConfig = estadoMap[order.estado]
                return (
                  <tr
                    key={order.id}
                    className="hover:bg-[var(--bg-soft)] transition-colors"
                  >
                    <td className="py-3 px-2 pl-0">
                      <span className="text-xs font-mono font-semibold text-[var(--cermont-blue-light)]">
                        {order.codigo}
                      </span>
                    </td>
                    <td className="py-3 px-2">
                      <span className="text-sm text-[var(--text)] truncate max-w-[140px] block">
                        {order.cliente}
                      </span>
                    </td>
                    <td className="py-3 px-2">
                      <span className="text-sm text-[var(--text-soft)]">{order.etapa}</span>
                    </td>
                    <td className="py-3 px-2">
                      <StatusBadge
                        variant={statusConfig.variant}
                        label={statusConfig.label}
                      />
                    </td>
                    <td className="py-3 px-2">
                      <span className="text-xs text-[var(--text-muted)]">
                        {format(new Date(order.fecha), 'd MMM', { locale: es })}
                      </span>
                    </td>
                    <td className="py-3 px-2 pr-0 text-right">
                      <Link
                        href={`/ordenes/${order.id}`}
                        className="inline-flex items-center justify-center w-7 h-7 rounded-md hover:bg-[var(--bg-muted)] text-[var(--text-muted)] hover:text-[var(--cermont-blue)] transition-colors"
                      >
                        <ExternalLink className="w-3.5 h-3.5" />
                      </Link>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
```

---

## FASE 9 — PÁGINA PRINCIPAL DEL DASHBOARD REFACTORIZADA

### 9.1 Reemplazar page.tsx completo

Archivo: `apps/web/src/app/(main)/dashboard/page.tsx`

```typescript
import { Suspense } from 'react'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { DashboardClientShell } from '@/components/dashboard/DashboardClientShell'

export const metadata = {
  title: 'Panel de Control | CERMONT S.A.S.',
  description: 'Plataforma operativa para cuadrillas con soporte offline, sincronización y captura de evidencias.',
}

export default async function DashboardPage() {
  const session = await getServerSession(authOptions)

  return (
    <div className="min-h-screen bg-[var(--bg-soft)]">
      <div className="max-w-[1440px] mx-auto px-4 sm:px-6 py-6 sm:py-8 space-y-6 sm:space-y-8">
        <Suspense fallback={<DashboardSkeleton />}>
          <DashboardClientShell
            userName={session?.user?.name ?? undefined}
            userRole={session?.user?.role ?? undefined}
          />
        </Suspense>
      </div>
    </div>
  )
}

function DashboardSkeleton() {
  return (
    <div className="space-y-6 animate-pulse">
      <div className="h-40 bg-[var(--card)] rounded-xl border border-[var(--line)]" />
      <div className="grid grid-cols-4 gap-4">
        {.map(i => ( [localhost](http://localhost:3000/dashboard)
          <div key={i} className="h-28 bg-[var(--card)] rounded-xl border border-[var(--line)]" />
        ))}
      </div>
    </div>
  )
}
```

### 9.2 DashboardClientShell — orquesta todos los hooks

Archivo: `apps/web/src/components/dashboard/DashboardClientShell.tsx`

```typescript
'use client'

import { DashboardHero } from './DashboardHero'
import { KpiGrid } from './KpiGrid'
import { FlowStageTabs } from './FlowStageTabs'
import { ChartCard } from './ChartCard'
import { TrendLineChart } from './charts/TrendLineChart'
import { StatusDonutChart } from './charts/StatusDonutChart'
import { RecentActivityFeed } from './RecentActivityFeed'
import { RecentOrdersTable } from './RecentOrdersTable'
import { AlertSummaryCard } from './AlertSummaryCard'
import { SectionHeader } from '@/components/ui/SectionHeader'
import { useDashboardStats } from '@/hooks/useDashboardStats'
import { useChartData } from '@/hooks/useChartData'
import { useRecentActivity } from '@/hooks/useRecentActivity'
import { useRecentOrders } from '@/hooks/useRecentOrders'
import { RefreshCw } from 'lucide-react'

interface DashboardClientShellProps {
  userName?: string
  userRole?: string
}

export function DashboardClientShell({ userName, userRole }: DashboardClientShellProps) {
  const { stats, isLoading: statsLoading, refresh } = useDashboardStats()
  const { tendenciaMensual, ordenesPorEstado, isLoading: chartsLoading } = useChartData()
  const { events, isLoading: activityLoading } = useRecentActivity(10)
  const { orders, isLoading: ordersLoading } = useRecentOrders(5)

  return (
    <div className="space-y-6 sm:space-y-8">

      {/* === HEADER === */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-[var(--text)] tracking-tight">
            Panel de Control
          </h1>
          <p className="text-sm text-[var(--text-muted)] mt-0.5">
            CERMONT S.A.S. — Plataforma operativa
          </p>
        </div>
        <button
          onClick={() => refresh()}
          className="inline-flex items-center gap-2 px-3.5 py-2 rounded-lg text-sm font-medium text-[var(--text-soft)] bg-[var(--card)] border border-[var(--line)] hover:border-[var(--line-strong)] transition-colors"
        >
          <RefreshCw className="w-4 h-4" />
          Actualizar
        </button>
      </div>

      {/* === HERO OPERATIVO === */}
      <DashboardHero
        userName={userName}
        userRole={userRole}
        stats={stats}
        isLoading={statsLoading}
      />

      {/* === KPI GRID === */}
      <section>
        <SectionHeader
          title="Indicadores Clave"
          subtitle="Estado operativo en tiempo real"
          className="mb-4"
        />
        <KpiGrid stats={stats} isLoading={statsLoading} />
      </section>

      {/* === GRÁFICAS === */}
      <section>
        <SectionHeader
          title="Análisis Visual"
          subtitle="Tendencias y distribución operativa"
          className="mb-4"
        />
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <ChartCard
            title="Tendencia Mensual"
            subtitle="Órdenes creadas vs completadas"
            hasData={tendenciaMensual.length > 0}
            isLoading={chartsLoading}
            height={260}
          >
            <TrendLineChart data={tendenciaMensual} />
          </ChartCard>

          <ChartCard
            title="Distribución por Estado"
            subtitle="Composición actual de la cartera"
            hasData={ordenesPorEstado.length > 0}
            isLoading={chartsLoading}
            height={260}
          >
            <StatusDonutChart data={ordenesPorEstado} />
          </ChartCard>
        </div>
      </section>

      {/* === ALERTAS Y ACTIVIDAD === */}
      <section>
        <SectionHeader
          title="Alertas y Actividad"
          subtitle="SLA en riesgo y eventos recientes"
          className="mb-4"
        />
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <AlertSummaryCard />
          <RecentActivityFeed
            events={events}
            isLoading={activityLoading}
            viewAllHref="/actividad"
          />
        </div>
      </section>

      {/* === FLUJO OPERATIVO === */}
      <section>
        <FlowStageTabs />
      </section>

      {/* === ÓRDENES RECIENTES === */}
      <section>
        <RecentOrdersTable
          orders={orders}
          isLoading={ordersLoading}
          viewAllHref="/ordenes"
        />
      </section>

    </div>
  )
}
```

---

## FASE 10 — BACKEND ENDPOINTS REQUERIDOS (NestJS)

### 10.1 dashboard.service.ts — servicio de stats reales

Archivo: `apps/api/src/dashboard/dashboard.service.ts`

```typescript
import { Injectable } from '@nestjs/common'
import { PrismaService } from '@/prisma/prisma.service'
import { subDays, startOfMonth, endOfMonth, subMonths, format } from 'date-fns'

@Injectable()
export class DashboardService {
  constructor(private readonly prisma: PrismaService) {}

  async getStats(companyId: string) {
    const now = new Date()
    const startMonth = startOfMonth(now)
    const endMonth = endOfMonth(now)

    const [
      ordenesActivas,
      mantenimientosAbiertos,
      completadasMes,
      ingresosMes,
      enEjecucion,
      bloqueadas,
      listasFacturar,
      recursosEnUso,
      totalOrdenes,
      ordenesAbiertas,
      ordenesConAlerta,
      kitsActivos,
      slaData,
    ] = await Promise.all([
      this.prisma.order.count({
        where: { companyId, status: { in: ['ACTIVE', 'IN_PROGRESS'] } },
      }),
      this.prisma.maintenance.count({
        where: { companyId, status: 'OPEN' },
      }),
      this.prisma.order.count({
        where: {
          companyId,
          status: 'COMPLETED',
          completedAt: { gte: startMonth, lte: endMonth },
        },
      }),
      this.prisma.invoice.aggregate({
        where: {
          companyId,
          status: 'PAID',
          paidAt: { gte: startMonth, lte: endMonth },
        },
        _sum: { amount: true },
      }),
      this.prisma.order.count({
        where: { companyId, status: 'IN_EXECUTION' },
      }),
      this.prisma.order.count({
        where: { companyId, status: 'BLOCKED' },
      }),
      this.prisma.order.count({
        where: { companyId, status: 'READY_TO_INVOICE' },
      }),
      this.prisma.resource.count({
        where: { companyId, assignedToOrderId: { not: null } },
      }),
      this.prisma.order.count({ where: { companyId } }),
      this.prisma.order.count({
        where: { companyId, status: { notIn: ['COMPLETED', 'CANCELLED'] } },
      }),
      this.prisma.order.count({
        where: {
          companyId,
          status: { notIn: ['COMPLETED', 'CANCELLED'] },
          targetDate: { lte: subDays(now, 0), gte: subDays(now, -72 / 24) },
        },
      }),
      this.prisma.kit.count({ where: { companyId, isActive: true } }),
      this.getSlaCompliance(companyId, startMonth, endMonth),
    ])

    return {
      ordenesActivas,
      mantenimientosAbiertos,
      completadasMes,
      ingresosMes: ingresosMes._sum.amount ?? 0,
      enEjecucion,
      bloqueadas,
      listasFacturar,
      recursosEnUso,
      totalOrdenes,
      ordenesAbiertas,
      ordenesConAlerta,
      kitsActivos,
      cumplimientoSLA: slaData,
      ordenesCompletadas: completadasMes,
    }
  }

  private async getSlaCompliance(
    companyId: string,
    startMonth: Date,
    endMonth: Date
  ): Promise<number> {
    const [total, enTiempo] = await Promise.all([
      this.prisma.order.count({
        where: {
          companyId,
          status: 'COMPLETED',
          completedAt: { gte: startMonth, lte: endMonth },
        },
      }),
      this.prisma.order.count({
        where: {
          companyId,
          status: 'COMPLETED',
          completedAt: { gte: startMonth, lte: endMonth },
          slaBreached: false,
        },
      }),
    ])

    if (total === 0) return 0
    return Math.round((enTiempo / total) * 100)
  }

  async getCharts(companyId: string) {
    const now = new Date()
    const months = Array.from({ length: 6 }, (_, i) => subMonths(now, 5 - i))

    const tendenciaMensual = await Promise.all(
      months.map(async (month) => {
        const start = startOfMonth(month)
        const end = endOfMonth(month)
        const [creadas, completadas] = await Promise.all([
          this.prisma.order.count({
            where: { companyId, createdAt: { gte: start, lte: end } },
          }),
          this.prisma.order.count({
            where: {
              companyId,
              status: 'COMPLETED',
              completedAt: { gte: start, lte: end },
            },
          }),
        ])
        return {
          month: format(month, 'MMM', { locale: require('date-fns/locale/es') }),
          creadas,
          completadas,
        }
      })
    )

    const statusCounts = await this.prisma.order.groupBy({
      by: ['status'],
      where: { companyId },
      _count: { status: true },
    })

    const colorMap: Record<string, string> = {
      ACTIVE: 'var(--cermont-blue)',
      IN_PROGRESS: 'var(--cermont-blue-light)',
      IN_EXECUTION: 'var(--cermont-green)',
      COMPLETED: 'var(--success)',
      BLOCKED: 'var(--danger)',
      READY_TO_INVOICE: 'var(--warning)',
      CANCELLED: 'var(--text-muted)',
    }

    const labelMap: Record<string, string> = {
      ACTIVE: 'Activas',
      IN_PROGRESS: 'En progreso',
      IN_EXECUTION: 'En ejecución',
      COMPLETED: 'Completadas',
      BLOCKED: 'Bloqueadas',
      READY_TO_INVOICE: 'Lista facturar',
      CANCELLED: 'Canceladas',
    }

    const ordenesPorEstado = statusCounts.map((s) => ({
      estado: labelMap[s.status] ?? s.status,
      count: s._count.status,
      color: colorMap[s.status] ?? 'var(--text-muted)',
    }))

    return { tendenciaMensual, ordenesPorEstado }
  }

  async getActivity(companyId: string, limit: number) {
    const events = await this.prisma.activityLog.findMany({
      where: { companyId },
      orderBy: { createdAt: 'desc' },
      take: limit,
      include: { user: true, order: true },
    })

    return events.map((e) => ({
      id: e.id,
      type: e.type,
      title: e.title,
      subtitle: e.subtitle ?? '',
      timestamp: e.createdAt.toISOString(),
      userName: e.user?.name,
      ordenId: e.order?.id,
      ordenCodigo: e.order?.code,
    }))
  }

  async getSlaAlerts(companyId: string) {
    const now = new Date()
    const in72h = new Date(now.getTime() + 72 * 60 * 60 * 1000)

    const orders = await this.prisma.order.findMany({
      where: {
        companyId,
        status: { notIn: ['COMPLETED', 'CANCELLED'] },
        targetDate: { lte: in72h },
      },
      include: { client: true },
      orderBy: { targetDate: 'asc' },
      take: 10,
    })

    return orders.map((o) => {
      const horasRestantes = Math.max(
        0,
        Math.floor((new Date(o.targetDate!).getTime() - now.getTime()) / 3_600_000)
      )
      return {
        id: o.id,
        ordenCodigo: o.code,
        ordenId: o.id,
        cliente: o.client?.name ?? 'Cliente',
        etapa: o.currentStage ?? 'Sin etapa',
        horasRestantes,
        estado: horasRestantes <= 0 ? 'vencida' : 'riesgo',
      }
    })
  }

  async getRecentOrders(companyId: string, limit: number) {
    const orders = await this.prisma.order.findMany({
      where: { companyId },
      orderBy: { createdAt: 'desc' },
      take: limit,
      include: { client: true, assignedTo: true },
    })

    const statusMap: Record<string, string> = {
      ACTIVE: 'activa',
      IN_PROGRESS: 'activa',
      IN_EXECUTION: 'en_ejecucion',
      COMPLETED: 'completada',
      BLOCKED: 'bloqueada',
      READY_TO_INVOICE: 'lista_facturar',
      DRAFT: 'draft',
    }

    return orders.map((o) => ({
      id: o.id,
      codigo: o.code,
      cliente: o.client?.name ?? 'Sin cliente',
      etapa: o.currentStage ?? 'Sin etapa',
      estado: statusMap[o.status] ?? 'activa',
      fecha: o.createdAt.toISOString(),
      responsable: o.assignedTo?.name,
    }))
  }
}
```

### 10.2 dashboard.controller.ts

Archivo: `apps/api/src/dashboard/dashboard.controller.ts`

```typescript
import { Controller, Get, Query, UseGuards, Request } from '@nestjs/common'
import { DashboardService } from './dashboard.service'
import { JwtAuthGuard } from '@/auth/guards/jwt-auth.guard'

@UseGuards(JwtAuthGuard)
@Controller('dashboard')
export class DashboardController {
  constructor(private readonly dashboardService: DashboardService) {}

  @Get('stats')
  async getStats(@Request() req: any) {
    return this.dashboardService.getStats(req.user.companyId)
  }

  @Get('charts')
  async getCharts(@Request() req: any) {
    return this.dashboardService.getCharts(req.user.companyId)
  }

  @Get('activity')
  async getActivity(
    @Request() req: any,
    @Query('limit') limit = '10'
  ) {
    return this.dashboardService.getActivity(req.user.companyId, parseInt(limit))
  }

  @Get('sla-alerts')
  async getSlaAlerts(@Request() req: any) {
    return this.dashboardService.getSlaAlerts(req.user.companyId)
  }

  @Get('recent-orders')
  async getRecentOrders(
    @Request() req: any,
    @Query('limit') limit = '5'
  ) {
    return this.dashboardService.getRecentOrders(req.user.companyId, parseInt(limit))
  }
}
```

### 10.3 dashboard.module.ts

Archivo: `apps/api/src/dashboard/dashboard.module.ts`

```typescript
import { Module } from '@nestjs/common'
import { DashboardController } from './dashboard.controller'
import { DashboardService } from './dashboard.service'
import { PrismaModule } from '@/prisma/prisma.module'

@Module({
  imports: [PrismaModule],
  controllers: [DashboardController],
  providers: [DashboardService],
  exports: [DashboardService],
})
export class DashboardModule {}
```

---

## FASE 11 — UTILIDADES Y FORMATTERS

### 11.1 Formatters

Archivo: `apps/web/src/lib/formatters.ts`

```typescript
export function formatCurrency(
  value: number,
  currency: string = 'COP',
  locale: string = 'es-CO'
): string {
  if (value === 0) return '$0'
  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value)
}

export function formatNumber(value: number): string {
  return new Intl.NumberFormat('es-CO').format(value)
}

export function formatPercent(value: number): string {
  return `${value}%`
}
```

### 11.2 cn utility (si no existe)

Archivo: `apps/web/src/lib/utils.ts`

```typescript
import { type ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwindcss-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}
```

---

## ORDEN DE EJECUCIÓN DE FASES

Ejecutar exactamente en este orden. No omitir ninguna fase.

```
FASE 0  → tokens.css + tailwind.config.ts
FASE 1  → Componentes primitivos (StatusBadge, MetricDelta, SectionHeader, EmptyStateCard, CardBase)
FASE 2  → KpiCard + KpiGrid + hook useDashboardStats + API route /api/dashboard/stats
FASE 3  → DashboardHero
FASE 4  → ChartCard + TrendLineChart + StatusDonutChart + hook useChartData + API route /api/dashboard/charts
FASE 5  → RecentActivityFeed + hook useRecentActivity + API route /api/dashboard/activity
FASE 6  → FlowStepCard + FlowStageTabs + tipos de flow
FASE 7  → AlertSummaryCard + API route /api/dashboard/sla-alerts
FASE 8  → RecentOrdersTable + hook useRecentOrders + API route /api/dashboard/recent-orders
FASE 9  → DashboardClientShell + page.tsx refactorizados
FASE 10 → Backend: DashboardService + DashboardController + DashboardModule
FASE 11 → formatters.ts + utils.ts
```

## DEPENDENCIAS A INSTALAR

```bash
# Frontend
pnpm add recharts date-fns swr clsx tailwind-merge lucide-react

# Backend
pnpm add date-fns
```

## VARIABLES DE ENTORNO REQUERIDAS

```env
# apps/web/.env.local
BACKEND_URL=http://localhost:3001
NEXTAUTH_SECRET=your-secret
NEXTAUTH_URL=http://localhost:3000
```

---

> Fin del prompt de implementación CERMONT UI 3.0
> Total de componentes nuevos: 22
> Total de hooks: 4
> Total de API routes (Next.js): 5
> Total de endpoints backend (NestJS): 5
> Fases atómicas: 11
```

***

Este prompt está dividido en **11 fases atómicas** y cubre todo el ciclo completo: desde los tokens de diseño hasta los endpoints NestJS reales que alimentan cada KPI y gráfica con datos del backend de CERMONT. Cada fase es ejecutable de forma independiente y en orden, sin pasos de auditoría ni orquestación intermedia — solo refactorización y construcción directa. [ppl-ai-file-upload.s3.amazonaws](https://ppl-ai-file-upload.s3.amazonaws.com/web/direct-files/attachments/images/133384987/c26499b9-a50c-4569-a6d2-0295dbd5d66b/screenshot.jpg?AWSAccessKeyId=ASIA2F3EMEYEVF5WLLV3&Signature=%2BLjywYeeTvo7O2MTPUsTNBah4eg%3D&x-amz-security-token=IQoJb3JpZ2luX2VjECoaCXVzLWVhc3QtMSJHMEUCIQD3FaBE%2FLHfyL4z%2BLsF0d4%2B8YvMW9aek3zwotEJ8ZpP9QIgcgD3D4oZeP5%2FrKpVVaHX9SprWgHUwfBp%2FpIKPXKwCjgq%2FAQI8v%2F%2F%2F%2F%2F%2F%2F%2F%2F%2FARABGgw2OTk3NTMzMDk3MDUiDCzHXo9dygH%2BhSatdirQBMfoDpLerUpT12uUfvDEirSOQV2uJoG7C06sDPbMyhLAU1ZLi1FG%2BNYNkWpR6H2k3Oy%2FbgVAyR1JqSYGooO8BqX%2B%2BckTiYw%2BPkvFeXoISWnCtT1Zv9p5gWAyATUaT3%2FQQILAl0zm2cFVYhLu%2FiS%2B9FxKQxp3Q2s%2BFoCLJb9EV2XxveVVniXzkqvFFhHtkZBTDvVFv%2FggocdcIjoRGbege7QvMIQWE5XjNQMgbYBdqP3%2F1TpHqhkAEDDotH0kugH%2FHwkDRKC5ZhDKrrYlUeqQQR7wYhMrpewNjl3rygkaKqew73%2F2vRG0K9XwEDcOW46BId0rZ2fYuOKDbpXphQyLxBfr5uc1EVm9I9x3PzF7HZaMMvVBxMokVoj8ePpH52ln6h9wVTf8e2HeLBr%2BnOMBg%2F5YNTfuoIdyqcjndYtUdLvKdfyIH%2B9hqpFArw2b1w0oui3fmGhIsmm9j41%2Frnq8Z7gu0BxU%2BtyjWuwFCMG8w9%2F1%2BKxtn6GrpkoqyVBZvz1yvFCvkSVq%2BAFxwmZrHnI7uT%2Bw0rse9ex3wGEQCp2qb%2FUpjMfyg7c2ar8nD55gJrK8STmKEoGVKVD93%2FDz9Ur0PRsBlhG6OLPzWbhCC12%2Fyv89xL67kJIXEZ7uok5w0GGHdQaNsvYq3kBtSvTwrOk4EEqPUmmbeHtARNLsAROJolb70tqOwNDcc8iZYxvV71OMVj6%2FztLh5I9zKMAUa3%2FxQ9gQl8CzqgFL4aUgV9nRyr8Ck%2FpzQwk7GOxfjeq3d7Rq0p4Iesf7kw7OUmMXRj4uwgsw95SJ0wY6mAGmLcYBYtN6S8rN%2B3u9YaWWnzJV49a1EJU2%2Bd%2FQxyRHJErA9%2BOaIPbGp9LzN7xySBdC5e4N6GYovnBx8MxUEha97hhj0kP%2Bn2HZBJDDQEw8%2FD%2BQBrcBtrC8GZrEao43pT7WabaQL6L828dK03NlX6Nx5F2xDyxutsZyjGACcEsssLXy5hvuyVWcaY2IIaDQIrumbTadoxH7cQ%3D%3D&Expires=1784830026)