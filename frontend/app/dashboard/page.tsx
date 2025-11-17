// app/dashboard/page.tsx
'use client';

// ============================================================================
// IMPORTS
// ============================================================================
import Link from 'next/link';
import { useDashboard } from '@/lib/hooks/useDashboard';

// Universal Components
import { HeroStats } from '@/components/patterns/HeroStats';
import { StatsCard } from '@/components/patterns/StatsCard';
import { FormCard } from '@/components/patterns/FormCard';
import { LoadingState } from '@/components/patterns/LoadingState';
import { ErrorState } from '@/components/patterns/ErrorState';

// Icons
import {
  FileText,
  CheckCircle,
  Clock,
  AlertTriangle,
  Zap,
  ArrowRight,
  BarChart3,
  Target,
  Users,
} from 'lucide-react';

// ============================================================================
// CONSTANTS
// ============================================================================
const ORDER_STATES = [
  { id: 'SOLICITUD', label: 'Solicitud', color: 'from-blue-500 to-blue-600' },
  { id: 'VISITA', label: 'Visita', color: 'from-purple-500 to-purple-600' },
  { id: 'PO', label: 'PO', color: 'from-yellow-500 to-yellow-600' },
  { id: 'PLANEACION', label: 'Planeación', color: 'from-orange-500 to-orange-600' },
  { id: 'EJECUCION', label: 'En ejecución', color: 'from-primary-500 to-primary-600' },
  { id: 'INFORME', label: 'Informe', color: 'from-green-500 to-green-600' },
] as const;

const KPIS = [
  { title: 'Tasa Aprobación', value: '87%', hint: 'Últimos 30 días' },
  { title: 'Tiempo Promedio', value: '28h', hint: 'Ciclo completo' },
  { title: 'Proyección Mensual', value: '$124k', hint: 'Este mes' },
];

const RECENT_ACTIVITY = [
  {
    title: 'Nueva orden creada',
    description: 'OT-2025-156 - Instalación eléctrica',
    time: 'Hace 5 min',
    icon: FileText,
    bgColor: 'bg-primary-50 dark:bg-primary-950',
    iconColor: 'text-primary-600 dark:text-primary-400',
  },
  {
    title: 'Orden completada',
    description: 'OT-2025-144 - Mantenimiento HVAC',
    time: 'Hace 1 hora',
    icon: CheckCircle,
    bgColor: 'bg-success-50 dark:bg-success-950',
    iconColor: 'text-success-600 dark:text-success-400',
  },
  {
    title: 'Alerta de vencimiento',
    description: '3 órdenes próximas a vencer',
    time: 'Hace 2 horas',
    icon: AlertTriangle,
    bgColor: 'bg-warning-50 dark:bg-warning-950',
    iconColor: 'text-warning-600 dark:text-warning-400',
  },
  {
    title: 'Usuario agregado',
    description: 'Juan Pérez - Técnico',
    time: 'Hace 3 horas',
    icon: Users,
    bgColor: 'bg-info-50 dark:bg-info-950',
    iconColor: 'text-info-600 dark:text-info-400',
  },
];

const QUICK_ACTIONS = [
  { label: 'Nueva Orden', description: 'Crear OT', href: '/orders/new', icon: FileText },
  { label: 'Ver Órdenes', description: 'Gestionar', href: '/orders', icon: BarChart3 },
  { label: 'Usuarios', description: 'Administrar', href: '/users', icon: Users },
];

// ============================================================================
// MAIN COMPONENT
// ============================================================================
export default function DashboardPage() {
  // ------------------------------------
  // Hooks
  // ------------------------------------
  const { data, isLoading, isError } = useDashboard();
  const totalOrders = data?.totalOrders || 0;
  const ordersByState = data?.ordersByState ?? {};

  // ------------------------------------
  // Computed Values
  // ------------------------------------
  const stats = [
    {
      title: 'Total Órdenes',
      value: totalOrders,
      icon: FileText,
      bgColor: 'bg-primary-50 dark:bg-primary-950',
      iconColor: 'text-primary-600 dark:text-primary-400',
      borderColor: 'border-primary-200 dark:border-primary-800',
      trend: { value: 12, isPositive: true },
    },
    {
      title: 'En Ejecución',
      value: ordersByState.EJECUCION || ordersByState.ejecucion || 0,
      icon: Zap,
      bgColor: 'bg-warning-50 dark:bg-warning-950',
      iconColor: 'text-warning-600 dark:text-warning-400',
      borderColor: 'border-warning-200 dark:border-warning-800',
      trend: { value: 8, isPositive: true },
    },
    {
      title: 'Completadas',
      value: ordersByState.COMPLETADA || ordersByState.completada || 0,
      icon: CheckCircle,
      bgColor: 'bg-success-50 dark:bg-success-950',
      iconColor: 'text-success-600 dark:text-success-400',
      borderColor: 'border-success-200 dark:border-success-800',
      trend: { value: 18, isPositive: true },
    },
    {
      title: 'Activas',
      value:
        (ordersByState.ABIERTA || ordersByState.abierta || 0) +
        (ordersByState.EJECUCION || ordersByState.ejecucion || 0),
      icon: Clock,
      bgColor: 'bg-info-50 dark:bg-info-950',
      iconColor: 'text-info-600 dark:text-info-400',
      borderColor: 'border-info-200 dark:border-info-800',
      trend: { value: 5, isPositive: true },
    },
  ];

  // ============================================================================
  // RENDER
  // ============================================================================

  // ------------------------------------
  // Loading State
  // ------------------------------------
  if (isLoading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <LoadingState
          message="Cargando dashboard..."
          subMessage="Sincronizando datos en tiempo real"
        />
      </div>
    );
  }

  // ------------------------------------
  // Error State
  // ------------------------------------
  if (isError) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <ErrorState
          title="Error al cargar datos"
          message="No se pudo conectar con el servidor. Verifica tu conexión e intenta nuevamente."
          action={{
            label: 'Reintentar',
            onClick: () => window.location.reload(),
          }}
        />
      </div>
    );
  }

  // ------------------------------------
  // Main Content
  // ------------------------------------
  return (
    <div className="space-y-8 animate-fade-in">
      {/* ========================================
          SECTION: Hero Stats
      ========================================== */}
      <HeroStats
        title="Dashboard en Tiempo Real"
        description="Monitorea órdenes de trabajo, workplans, evidencias y métricas estratégicas de tu operación industrial en un solo lugar."
        badge={{
          icon: Target,
          text: 'Sistema CERMONT ATG',
        }}
        kpis={KPIS}
      />

      {/* ========================================
          SECTION: Stats Grid
      ========================================== */}
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat, i) => (
          <div
            key={stat.title}
            className="animate-slide-up"
            style={{ animationDelay: `${i * 0.05}s` }}
          >
            <StatsCard
              label={stat.title}
              value={stat.value}
              icon={stat.icon}
              bgColor={stat.bgColor}
              iconColor={stat.iconColor}
              borderColor={stat.borderColor}
              trend={stat.trend}
            />
          </div>
        ))}
      </div>

      {/* ========================================
          SECTION: Order Distribution + Recent Activity
      ========================================== */}
      <div className="grid gap-8 lg:grid-cols-3">
        {/* Order Distribution Chart */}
        <div className="lg:col-span-2">
          <FormCard
            title="Distribución de Órdenes"
            description={`Análisis por estado · Total ${totalOrders}`}
            icon={BarChart3}
          >
            <div className="space-y-8">
              {ORDER_STATES.map((state, i) => {
                const value = ordersByState[state.id] || 0;
                const percentage = totalOrders > 0 ? (value / totalOrders) * 100 : 0;

                return (
                  <div
                    key={state.id}
                    className="animate-slide-up"
                    style={{ animationDelay: `${i * 0.05}s` }}
                  >
                    <div className="mb-3 flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div
                          className={`h-4 w-4 rounded-full bg-gradient-to-r ${state.color} shadow-lg`}
                        ></div>
                        <span className="font-bold text-neutral-900 dark:text-neutral-50">
                          {state.label}
                        </span>
                      </div>
                      <div className="flex items-center gap-4">
                        <span className="text-sm font-semibold text-neutral-600 dark:text-neutral-400">
                          {value} órdenes
                        </span>
                        <span className="text-lg font-bold text-neutral-900 dark:text-neutral-50">
                          {percentage.toFixed(1)}%
                        </span>
                      </div>
                    </div>

                    <div className="relative h-4 overflow-hidden rounded-full bg-neutral-100 shadow-inner dark:bg-neutral-800">
                      <div
                        className={`h-full rounded-full bg-gradient-to-r ${state.color} shadow-lg transition-all duration-1000 ease-out`}
                        style={{ width: `${Math.min(percentage, 100)}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </FormCard>
        </div>

        {/* Recent Activity */}
        <div>
          <FormCard title="Actividad Reciente" description="Últimas actualizaciones">
            <div className="space-y-6">
              {RECENT_ACTIVITY.map((activity, i) => (
                <div key={i} className="flex gap-4">
                  <div
                    className={`flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-xl ${activity.bgColor} shadow-sm`}
                  >
                    <activity.icon className={`h-6 w-6 ${activity.iconColor}`} />
                  </div>
                  <div className="flex-1">
                    <p className="mb-1 font-bold text-neutral-900 dark:text-neutral-50">
                      {activity.title}
                    </p>
                    <p className="text-sm text-neutral-600 dark:text-neutral-400">
                      {activity.description}
                    </p>
                    <div className="mt-2 flex items-center gap-1 text-xs text-neutral-500">
                      <Clock className="h-3 w-3" />
                      {activity.time}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </FormCard>
        </div>
      </div>

      {/* ========================================
          SECTION: Quick Actions
      ========================================== */}
      <FormCard title="Acciones Rápidas" description="Acceso directo a funciones principales">
        <div className="grid gap-6 md:grid-cols-3">
          {QUICK_ACTIONS.map((action) => (
            <Link
              key={action.label}
              href={action.href}
              className="group flex items-center gap-5 rounded-2xl border-2 border-neutral-200 bg-gradient-to-br from-neutral-50 to-white p-6 transition-all hover:-translate-y-1 hover:border-primary-500 hover:shadow-2xl dark:border-neutral-800 dark:from-neutral-900 dark:to-neutral-900"
            >
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-primary-50 shadow-lg transition-all group-hover:scale-110 group-hover:bg-primary-100 dark:bg-primary-950">
                <action.icon className="h-7 w-7 text-primary-600 dark:text-primary-400" />
              </div>
              <div className="flex-1">
                <p className="mb-1 font-bold text-neutral-900 dark:text-neutral-50">
                  {action.label}
                </p>
                <p className="text-sm text-neutral-600 dark:text-neutral-400">
                  {action.description}
                </p>
              </div>
              <ArrowRight className="h-6 w-6 text-neutral-400 transition-all group-hover:translate-x-2 group-hover:text-primary-600" />
            </Link>
          ))}
        </div>
      </FormCard>
    </div>
  );
}






