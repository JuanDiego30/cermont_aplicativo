"use client";
import React from "react";
import { useDashboardMetrics } from "../../hooks/useDashboard";
import {
  ClipboardList,
  CheckCircle,
  Clock,
  Users
} from "lucide-react";

export default function DashboardPage() {
  const { data: metrics, isLoading, isError } = useDashboardMetrics();

  if (isLoading) {
    return <div className="p-4 text-center">Cargando métricas...</div>;
  }

  if (isError) {
    return <div className="p-4 text-center text-red-500">Error cargando datos del dashboard. Asegúrate de estar logueado.</div>;
  }

  return (
    <div>
      <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <h2 className="text-title-md2 font-bold text-black dark:text-white">
          Dashboard General
        </h2>
        <nav>
          <ol className="flex items-center gap-2">
            <li>
              <a className="font-medium" href="/dashboard">Dashboard /</a>
            </li>
            <li className="font-medium text-brand-500">Resumen</li>
          </ol>
        </nav>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 md:gap-6 xl:grid-cols-4 2xl:gap-7.5">

        {/* Card 1: Total Ordenes */}
        <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-theme-xs dark:border-gray-800 dark:bg-gray-900 dark:shadow-none">
          <div className="flex items-center gap-4">
            <div className="flex h-11.5 w-11.5 items-center justify-center rounded-full bg-brand-50 text-brand-500 dark:bg-brand-500/15 dark:text-brand-400">
              <ClipboardList size={24} />
            </div>
            <div>
              <h4 className="text-xl font-bold text-gray-800 dark:text-white/90">{metrics?.totalOrders || 0}</h4>
              <span className="text-sm font-medium text-gray-500 dark:text-gray-400">Total Órdenes</span>
            </div>
          </div>
          <div className="mt-4 flex items-center justify-between">
            <span className="text-sm font-medium text-brand-500 bg-brand-50 dark:bg-brand-500/15 px-2 py-0.5 rounded-full">
              Todas
            </span>
          </div>
        </div>

        {/* Card 2: Completadas */}
        <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-theme-xs dark:border-gray-800 dark:bg-gray-900 dark:shadow-none">
          <div className="flex items-center gap-4">
            <div className="flex h-11.5 w-11.5 items-center justify-center rounded-full bg-success-50 text-success-500 dark:bg-success-500/15 dark:text-success-400">
              <CheckCircle size={24} />
            </div>
            <div>
              <h4 className="text-xl font-bold text-gray-800 dark:text-white/90">{metrics?.completedOrders || 0}</h4>
              <span className="text-sm font-medium text-gray-500 dark:text-gray-400">Completadas</span>
            </div>
          </div>
          <div className="mt-4">
            <span className="text-sm font-medium text-success-500 bg-success-50 dark:bg-success-500/15 px-2 py-0.5 rounded-full">
              Finalizadas
            </span>
          </div>
        </div>

        {/* Card 3: Pendientes */}
        <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-theme-xs dark:border-gray-800 dark:bg-gray-900 dark:shadow-none">
          <div className="flex items-center gap-4">
            <div className="flex h-11.5 w-11.5 items-center justify-center rounded-full bg-orange-50 text-orange-500 dark:bg-orange-500/15 dark:text-orange-400">
              <Clock size={24} />
            </div>
            <div>
              <h4 className="text-xl font-bold text-gray-800 dark:text-white/90">{metrics?.pendingOrders || 0}</h4>
              <span className="text-sm font-medium text-gray-500 dark:text-gray-400">Pendientes</span>
            </div>
          </div>
          <div className="mt-4">
            <span className="text-sm font-medium text-orange-500 bg-orange-50 dark:bg-orange-500/15 px-2 py-0.5 rounded-full">
              En Proceso
            </span>
          </div>
        </div>

        {/* Card 4: Técnicos */}
        <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-theme-xs dark:border-gray-800 dark:bg-gray-900 dark:shadow-none">
          <div className="flex items-center gap-4">
            <div className="flex h-11.5 w-11.5 items-center justify-center rounded-full bg-blue-50 text-blue-500 dark:bg-blue-500/15 dark:text-blue-400">
              <Users size={24} />
            </div>
            <div>
              <h4 className="text-xl font-bold text-gray-800 dark:text-white/90">{metrics?.techniciansActive || 0}</h4>
              <span className="text-sm font-medium text-gray-500 dark:text-gray-400">Técnicos Activos</span>
            </div>
          </div>
          <div className="mt-4">
            <span className="text-sm font-medium text-blue-500 bg-blue-50 dark:bg-blue-500/15 px-2 py-0.5 rounded-full">
              Disponibles
            </span>
          </div>
        </div>
      </div>

      <div className="mt-6 rounded-2xl border border-gray-200 bg-white p-5 shadow-theme-xs dark:border-gray-800 dark:bg-gray-900 dark:shadow-none">
        <h3 className="mb-4 text-lg font-semibold text-gray-800 dark:text-white/90">Resumen de Estado de Órdenes</h3>
        <p className="text-gray-500">Aquí irá el gráfico de barras comparativo (Próximamente)...</p>
      </div>
    </div>
  );
}
