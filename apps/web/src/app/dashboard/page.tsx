"use client";
import React from "react";
import dynamic from "next/dynamic";
import { useDashboardMetrics } from "@/features/dashboard/hooks/use-dashboard";
import Link from "next/link";
import {
  ClipboardList,
  CheckCircle,
  Clock,
  Users,
  ArrowUpRight,
  ArrowDownRight,
  MoreHorizontal,
  Calendar,
  AlertTriangle,
  Activity,
  FileText,
  Wrench,
  Shield,
  BarChart3
} from "lucide-react";

// Dynamic imports for charts (avoid SSR issues)
const MonthlyOrdersChart = dynamic(() => import("@/components/charts/MonthlyOrdersChart"), { ssr: false });
const OrderStatusChart = dynamic(() => import("@/components/charts/OrderStatusChart"), { ssr: false });
const EfficiencyGauge = dynamic(() => import("@/components/charts/EfficiencyGauge"), { ssr: false });

// Componente de métrica estilo TailAdmin
interface MetricCardProps {
  title: string;
  value: string | number;
  icon: React.ReactNode;
  trend?: {
    value: number;
    isPositive: boolean;
  };
  badge?: {
    text: string;
    color: string;
  };
  iconBgColor: string;
  iconColor: string;
}

function MetricCard({ title, value, icon, trend, badge, iconBgColor, iconColor }: MetricCardProps) {
  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-white/3">
      <div className="flex items-center justify-between">
        <div className={`inline-flex items-center justify-center w-12 h-12 rounded-xl ${iconBgColor}`}>
          <span className={iconColor}>{icon}</span>
        </div>
        {trend && (
          <span className={`inline-flex items-center gap-1 px-2.5 py-1 text-xs font-medium rounded-full ${trend.isPositive
            ? 'text-emerald-600 bg-emerald-100 dark:bg-emerald-500/20'
            : 'text-red-600 bg-red-100 dark:bg-red-500/20'
            }`}>
            {trend.isPositive ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
            {trend.value}%
          </span>
        )}
        {badge && (
          <span className={`px-2.5 py-1 text-xs font-medium rounded-full ${badge.color}`}>
            {badge.text}
          </span>
        )}
      </div>
      <div className="mt-4">
        <p className="text-2xl font-bold text-gray-900 dark:text-white">{value}</p>
        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">{title}</p>
      </div>
    </div>
  );
}

// Componente de orden reciente
interface RecentOrder {
  id: string;
  numero: string;
  cliente: string;
  estado: string;
  fecha: string;
  prioridad: string;
}

function RecentOrdersTable({ orders }: { orders: RecentOrder[] }) {
  const getEstadoStyle = (estado: string) => {
    switch (estado.toLowerCase()) {
      case 'completada':
        return 'bg-emerald-100 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-400';
      case 'en_ejecucion':
      case 'ejecucion':
        return 'bg-blue-100 text-blue-700 dark:bg-blue-500/20 dark:text-blue-400';
      case 'planeacion':
        return 'bg-amber-100 text-amber-700 dark:bg-amber-500/20 dark:text-amber-400';
      case 'pausada':
        return 'bg-gray-100 text-gray-700 dark:bg-gray-500/20 dark:text-gray-400';
      default:
        return 'bg-gray-100 text-gray-700 dark:bg-gray-500/20 dark:text-gray-400';
    }
  };

  const getPrioridadStyle = (prioridad: string) => {
    switch (prioridad.toLowerCase()) {
      case 'urgente':
        return 'bg-red-100 text-red-700 dark:bg-red-500/20';
      case 'alta':
        return 'bg-orange-100 text-orange-700 dark:bg-orange-500/20';
      case 'media':
        return 'bg-blue-100 text-blue-700 dark:bg-blue-500/20';
      default:
        return 'bg-gray-100 text-gray-700 dark:bg-gray-500/20';
    }
  };

  return (
    <div className="rounded-2xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-white/3">
      <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 dark:border-gray-800">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
          Órdenes Recientes
        </h3>
        <Link
          href="/dashboard/ordenes"
          className="text-sm font-medium text-blue-600 hover:text-blue-700 dark:text-blue-400"
        >
          Ver todas →
        </Link>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50 dark:bg-gray-800/50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Orden
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Cliente
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Estado
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Prioridad
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Fecha
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 dark:divide-gray-800">
            {orders.map((order) => (
              <tr key={order.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
                <td className="px-6 py-4 whitespace-nowrap">
                  <Link href={`/dashboard/ordenes/${order.id}`} className="font-medium text-blue-600 hover:underline">
                    #{order.numero}
                  </Link>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700 dark:text-gray-300">
                  {order.cliente}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`px-2.5 py-1 text-xs font-medium rounded-full ${getEstadoStyle(order.estado)}`}>
                    {order.estado.replace('_', ' ')}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`px-2.5 py-1 text-xs font-medium rounded-full ${getPrioridadStyle(order.prioridad)}`}>
                    {order.prioridad}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                  {order.fecha}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// Componente de acceso rápido
function QuickAccess() {
  const quickLinks = [
    { title: 'Nueva Orden', icon: <FileText className="w-5 h-5" />, href: '/dashboard/ordenes/nueva', color: 'bg-blue-500' },
    { title: 'Planeación', icon: <Calendar className="w-5 h-5" />, href: '/dashboard/planeacion', color: 'bg-purple-500' },
    { title: 'Ejecución', icon: <Wrench className="w-5 h-5" />, href: '/dashboard/ejecucion', color: 'bg-emerald-500' },
    { title: 'Reportes', icon: <BarChart3 className="w-5 h-5" />, href: '/dashboard/reportes', color: 'bg-orange-500' },
    { title: 'HES', icon: <Shield className="w-5 h-5" />, href: '/dashboard/hes', color: 'bg-red-500' },
    { title: 'Técnicos', icon: <Users className="w-5 h-5" />, href: '/dashboard/tecnicos', color: 'bg-cyan-500' },
  ];

  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-white/3">
      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
        Acceso Rápido
      </h3>
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
        {quickLinks.map((link) => (
          <Link
            key={link.title}
            href={link.href}
            className="flex flex-col items-center justify-center p-4 rounded-xl bg-gray-50 dark:bg-gray-800/50 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors group"
          >
            <div className={`w-10 h-10 rounded-lg ${link.color} flex items-center justify-center text-white mb-2 group-hover:scale-110 transition-transform`}>
              {link.icon}
            </div>
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
              {link.title}
            </span>
          </Link>
        ))}
      </div>
    </div>
  );
}

// Componente de actividad reciente
function RecentActivity() {
  const activities = [
    { type: 'orden', message: 'Orden #1234 completada', time: 'Hace 5 min', icon: <CheckCircle className="w-4 h-4 text-emerald-500" /> },
    { type: 'tecnico', message: 'Juan Pérez inició ejecución', time: 'Hace 15 min', icon: <Activity className="w-4 h-4 text-blue-500" /> },
    { type: 'alerta', message: 'Kit A-123 requiere mantenimiento', time: 'Hace 1h', icon: <AlertTriangle className="w-4 h-4 text-amber-500" /> },
    { type: 'orden', message: 'Nueva orden asignada #1235', time: 'Hace 2h', icon: <FileText className="w-4 h-4 text-purple-500" /> },
  ];

  return (
    <div className="rounded-2xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-white/3">
      <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-800">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
          Actividad Reciente
        </h3>
      </div>
      <div className="divide-y divide-gray-200 dark:divide-gray-800">
        {activities.map((activity, index) => (
          <div key={index} className="flex items-start gap-4 px-6 py-4">
            <div className="mt-0.5">{activity.icon}</div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-900 dark:text-white">
                {activity.message}
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                {activity.time}
              </p>
            </div>
          </div>
        ))}
      </div>
      <div className="px-6 py-3 bg-gray-50 dark:bg-gray-800/50 rounded-b-2xl">
        <Link href="/dashboard/actividad" className="text-sm font-medium text-blue-600 hover:text-blue-700 dark:text-blue-400">
          Ver toda la actividad →
        </Link>
      </div>
    </div>
  );
}

// Componente de objetivos mensuales
function MonthlyTarget() {
  const progress = 68;

  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-white/3">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
          Objetivo Mensual
        </h3>
        <button className="p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300">
          <MoreHorizontal className="w-5 h-5" />
        </button>
      </div>

      {/* Circular Progress */}
      <div className="flex flex-col items-center justify-center py-4">
        <div className="relative w-40 h-40">
          <svg className="w-full h-full transform -rotate-90">
            <circle
              cx="80"
              cy="80"
              r="70"
              stroke="currentColor"
              strokeWidth="12"
              fill="none"
              className="text-gray-200 dark:text-gray-700"
            />
            <circle
              cx="80"
              cy="80"
              r="70"
              stroke="currentColor"
              strokeWidth="12"
              fill="none"
              strokeDasharray={`${(progress / 100) * 440} 440`}
              strokeLinecap="round"
              className="text-blue-500"
            />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="text-3xl font-bold text-gray-900 dark:text-white">{progress}%</span>
            <span className="text-sm text-gray-500 dark:text-gray-400">Completado</span>
          </div>
        </div>
      </div>

      <div className="space-y-3 mt-4">
        <div className="flex items-center justify-between">
          <span className="text-sm text-gray-600 dark:text-gray-400">Órdenes objetivo</span>
          <span className="text-sm font-semibold text-gray-900 dark:text-white">50</span>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-sm text-gray-600 dark:text-gray-400">Completadas</span>
          <span className="text-sm font-semibold text-emerald-600">34</span>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-sm text-gray-600 dark:text-gray-400">Pendientes</span>
          <span className="text-sm font-semibold text-amber-600">16</span>
        </div>
      </div>
    </div>
  );
}

// Skeleton loader
function DashboardSkeleton() {
  return (
    <div className="space-y-6 animate-pulse">
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="rounded-2xl border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-gray-900">
            <div className="flex items-center justify-between">
              <div className="w-12 h-12 rounded-xl bg-gray-200 dark:bg-gray-700" />
              <div className="w-16 h-6 rounded-full bg-gray-200 dark:bg-gray-700" />
            </div>
            <div className="mt-4 space-y-2">
              <div className="w-20 h-8 bg-gray-200 dark:bg-gray-700 rounded" />
              <div className="w-28 h-4 bg-gray-200 dark:bg-gray-700 rounded" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function DashboardPage() {
  const { data: metrics, isLoading, error } = useDashboardMetrics();

  // Mock data para órdenes recientes
  const recentOrders: RecentOrder[] = [
    { id: '1', numero: '2024-001', cliente: 'Ecopetrol S.A.', estado: 'completada', fecha: '08/12/2024', prioridad: 'alta' },
    { id: '2', numero: '2024-002', cliente: 'Cementos Argos', estado: 'ejecucion', fecha: '07/12/2024', prioridad: 'media' },
    { id: '3', numero: '2024-003', cliente: 'Drummond Ltd', estado: 'planeacion', fecha: '06/12/2024', prioridad: 'urgente' },
    { id: '4', numero: '2024-004', cliente: 'Cerrejón', estado: 'ejecucion', fecha: '05/12/2024', prioridad: 'baja' },
    { id: '5', numero: '2024-005', cliente: 'Pacific Rubiales', estado: 'planeacion', fecha: '04/12/2024', prioridad: 'alta' },
  ];

  if (isLoading) {
    return <DashboardSkeleton />;
  }

  if (error) {
    return (
      <div className="rounded-2xl border border-red-200 bg-red-50 p-8 text-center dark:border-red-800 dark:bg-red-900/20">
        <AlertTriangle className="w-12 h-12 text-red-500 mx-auto mb-4" />
        <h3 className="text-lg font-semibold text-red-700 dark:text-red-400 mb-2">
          Error al cargar el dashboard
        </h3>
        <p className="text-red-600 dark:text-red-300 mb-4">
          No se pudieron cargar las métricas. Por favor, verifica que estés autenticado.
        </p>
        <Link
          href="/login"
          className="inline-flex items-center px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
        >
          Iniciar Sesión
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            Dashboard
          </h1>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            Bienvenido de vuelta. Aquí está el resumen de tu operación.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-sm text-gray-500 dark:text-gray-400">
            <Calendar className="w-4 h-4 inline mr-1" />
            {new Date().toLocaleDateString('es-CO', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
          </span>
        </div>
      </div>

      {/* Metric Cards */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
        <MetricCard
          title="Total Órdenes"
          value={metrics?.totalOrders || 0}
          icon={<ClipboardList className="w-6 h-6" />}
          trend={{ value: 12.5, isPositive: true }}
          iconBgColor="bg-blue-100 dark:bg-blue-500/20"
          iconColor="text-blue-600"
        />
        <MetricCard
          title="Completadas"
          value={metrics?.completedOrders || 0}
          icon={<CheckCircle className="w-6 h-6" />}
          trend={{ value: 8.2, isPositive: true }}
          iconBgColor="bg-emerald-100 dark:bg-emerald-500/20"
          iconColor="text-emerald-600"
        />
        <MetricCard
          title="En Ejecución"
          value={metrics?.pendingOrders || 0}
          icon={<Clock className="w-6 h-6" />}
          badge={{ text: 'En curso', color: 'bg-amber-100 text-amber-700 dark:bg-amber-500/20' }}
          iconBgColor="bg-amber-100 dark:bg-amber-500/20"
          iconColor="text-amber-600"
        />
        <MetricCard
          title="Técnicos Activos"
          value={metrics?.techniciansActive || 0}
          icon={<Users className="w-6 h-6" />}
          badge={{ text: 'Online', color: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-500/20' }}
          iconBgColor="bg-purple-100 dark:bg-purple-500/20"
          iconColor="text-purple-600"
        />
      </div>

      {/* Second Row - Charts */}
      <div className="grid grid-cols-12 gap-5">
        <div className="col-span-12 xl:col-span-8">
          <MonthlyOrdersChart />
        </div>
        <div className="col-span-12 xl:col-span-4">
          <OrderStatusChart />
        </div>
      </div>

      {/* Third Row - Recent Orders and Efficiency */}
      <div className="grid grid-cols-12 gap-5">
        <div className="col-span-12 lg:col-span-8">
          <RecentOrdersTable orders={recentOrders} />
        </div>
        <div className="col-span-12 lg:col-span-4">
          <EfficiencyGauge />
        </div>
      </div>

      {/* Fourth Row - Quick Access and Activity */}
      <div className="grid grid-cols-12 gap-5">
        <div className="col-span-12 lg:col-span-7">
          <QuickAccess />
        </div>
        <div className="col-span-12 lg:col-span-5">
          <RecentActivity />
        </div>
      </div>
    </div>
  );
}
