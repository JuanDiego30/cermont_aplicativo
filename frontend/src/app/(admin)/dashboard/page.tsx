"use client";

import { useDashboard, CostOverviewWidget } from "@/features/dashboard";
import { SkeletonDashboard } from "@/components/common";
import Link from "next/link";

// Stats Card Component
function StatsCard({
  title,
  value,
  icon: Icon,
  color,
  href,
}: {
  title: string;
  value: number | string;
  icon: React.ReactNode;
  color: "primary" | "success" | "warning" | "info" | "danger";
  href?: string;
}) {
  const colorClasses = {
    primary: "bg-brand-50 dark:bg-brand-900/20 border-brand-200 dark:border-brand-800",
    success: "bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800",
    warning: "bg-yellow-50 dark:bg-yellow-900/20 border-yellow-200 dark:border-yellow-800",
    info: "bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800",
    danger: "bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800",
  };

  const iconColorClasses = {
    primary: "text-brand-600 dark:text-brand-400",
    success: "text-green-600 dark:text-green-400",
    warning: "text-yellow-600 dark:text-yellow-400",
    info: "text-blue-600 dark:text-blue-400",
    danger: "text-red-600 dark:text-red-400",
  };

  const content = (
    <div
      className={`rounded-xl border-2 p-6 transition-all ${colorClasses[color]} ${
        href ? "hover:shadow-lg cursor-pointer" : ""
      }`}
    >
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
            {title}
          </p>
          <p className="mt-2 text-3xl font-bold text-gray-900 dark:text-white">
            {value}
          </p>
        </div>
        <div
          className={`flex h-12 w-12 items-center justify-center rounded-lg ${colorClasses[color]}`}
        >
          <span className={iconColorClasses[color]}>{Icon}</span>
        </div>
      </div>
    </div>
  );

  if (href) {
    return <Link href={href}>{content}</Link>;
  }

  return content;
}

// Order State Badge
function OrderStateBadge({
  state,
  count,
}: {
  state: string;
  count: number;
}) {
  const stateConfig: Record<string, { label: string; color: string }> = {
    SOLICITUD: { label: "Solicitud", color: "bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300" },
    VISITA: { label: "Visita", color: "bg-purple-100 text-purple-700 dark:bg-purple-900 dark:text-purple-300" },
    PO: { label: "PO", color: "bg-yellow-100 text-yellow-700 dark:bg-yellow-900 dark:text-yellow-300" },
    PLANEACION: { label: "Planeación", color: "bg-orange-100 text-orange-700 dark:bg-orange-900 dark:text-orange-300" },
    EJECUCION: { label: "En Ejecución", color: "bg-brand-100 text-brand-700 dark:bg-brand-900 dark:text-brand-300" },
    INFORME: { label: "Informe", color: "bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300" },
    ACTA: { label: "Acta", color: "bg-teal-100 text-teal-700 dark:bg-teal-900 dark:text-teal-300" },
    FACTURA: { label: "Factura", color: "bg-indigo-100 text-indigo-700 dark:bg-indigo-900 dark:text-indigo-300" },
  };

  const config = stateConfig[state] || { label: state, color: "bg-gray-100 text-gray-700" };

  return (
    <div className="flex items-center justify-between rounded-lg border border-gray-200 dark:border-gray-700 p-3">
      <span className={`rounded-full px-3 py-1 text-xs font-medium ${config.color}`}>
        {config.label}
      </span>
      <span className="text-xl font-bold text-gray-900 dark:text-white">{count}</span>
    </div>
  );
}

// Quick Action Button
function QuickActionButton({
  label,
  description,
  href,
  icon,
}: {
  label: string;
  description: string;
  href: string;
  icon: React.ReactNode;
}) {
  return (
    <Link
      href={href}
      className="flex items-center gap-4 rounded-xl border-2 border-gray-200 dark:border-gray-700 p-4 transition-all hover:border-brand-500 hover:bg-gray-50 dark:hover:bg-gray-800"
    >
      <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-brand-50 dark:bg-brand-900/20">
        <span className="text-brand-600 dark:text-brand-400">{icon}</span>
      </div>
      <div>
        <p className="font-semibold text-gray-900 dark:text-white">{label}</p>
        <p className="text-sm text-gray-600 dark:text-gray-400">{description}</p>
      </div>
    </Link>
  );
}

// Icons as components
const FileTextIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z"/>
    <polyline points="14 2 14 8 20 8"/>
    <line x1="16" y1="13" x2="8" y2="13"/>
    <line x1="16" y1="17" x2="8" y2="17"/>
  </svg>
);

const CheckCircleIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/>
    <polyline points="22 4 12 14.01 9 11.01"/>
  </svg>
);

const ClockIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <circle cx="12" cy="12" r="10"/>
    <polyline points="12 6 12 12 16 14"/>
  </svg>
);

const ZapIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/>
  </svg>
);

const UsersIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
    <circle cx="9" cy="7" r="4"/>
    <path d="M23 21v-2a4 4 0 0 0-3-3.87"/>
    <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
  </svg>
);

const BarChartIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <line x1="18" y1="20" x2="18" y2="10"/>
    <line x1="12" y1="20" x2="12" y2="4"/>
    <line x1="6" y1="20" x2="6" y2="14"/>
  </svg>
);

export default function DashboardPage() {
  const { data, isLoading, isError } = useDashboard();

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            Dashboard
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Cargando métricas del sistema...
          </p>
        </div>
        <SkeletonDashboard />
      </div>
    );
  }

  if (isError) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <p className="text-lg font-medium text-red-600 dark:text-red-400">
            Error al cargar el dashboard
          </p>
          <p className="text-gray-600 dark:text-gray-400">
            Por favor intenta de nuevo más tarde
          </p>
        </div>
      </div>
    );
  }

  const totalOrders = data?.totalOrders || 0;
  const ordersByState = data?.ordersByState || {};
  const inExecution = ordersByState["EJECUCION"] || 0;
  const completed = ordersByState["ACTA"] || 0;
  const pending = ordersByState["SOLICITUD"] || 0;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
          Dashboard
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          Resumen de órdenes de trabajo y métricas del sistema CERMONT ATG
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatsCard
          title="Total Órdenes"
          value={totalOrders}
          icon={<FileTextIcon />}
          color="primary"
          href="/orders"
        />
        <StatsCard
          title="En Ejecución"
          value={inExecution}
          icon={<ZapIcon />}
          color="warning"
          href="/orders?state=EJECUCION"
        />
        <StatsCard
          title="Completadas"
          value={completed}
          icon={<CheckCircleIcon />}
          color="success"
          href="/orders?state=ACTA"
        />
        <StatsCard
          title="Pendientes"
          value={pending}
          icon={<ClockIcon />}
          color="info"
          href="/orders?state=SOLICITUD"
        />
      </div>

      {/* Two Column Layout */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Orders by State */}
        <div className="rounded-xl border-2 border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 p-6">
          <h2 className="mb-4 text-lg font-semibold text-gray-900 dark:text-white">
            Órdenes por Estado
          </h2>
          <div className="grid gap-3 sm:grid-cols-2">
            {Object.entries(ordersByState).map(([state, count]) => (
              <OrderStateBadge key={state} state={state} count={count as number} />
            ))}
          </div>
        </div>

        {/* Quick Actions */}
        <div className="rounded-xl border-2 border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 p-6">
          <h2 className="mb-4 text-lg font-semibold text-gray-900 dark:text-white">
            Acciones Rápidas
          </h2>
          <div className="space-y-3">
            <QuickActionButton
              label="Nueva Orden"
              description="Crear nueva orden de trabajo"
              href="/orders/new"
              icon={<FileTextIcon />}
            />
            <QuickActionButton
              label="Ver Órdenes"
              description="Gestionar órdenes existentes"
              href="/orders"
              icon={<BarChartIcon />}
            />
            <QuickActionButton
              label="Usuarios"
              description="Administrar usuarios del sistema"
              href="/users"
              icon={<UsersIcon />}
            />
          </div>
        </div>
      </div>

      {/* Cost Overview Widget */}
      <CostOverviewWidget />
    </div>
  );
}
