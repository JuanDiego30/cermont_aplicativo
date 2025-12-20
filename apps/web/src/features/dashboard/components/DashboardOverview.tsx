/**
 * @file DashboardOverview.tsx
 * @description Componente mejorado para Overview del Dashboard con KPIs
 */

'use client';

import React from 'react';
import { useDashboardOverview, useRefreshKPIs } from '../hooks/use-dashboard';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { RefreshCw, TrendingUp, TrendingDown, DollarSign, Users, AlertTriangle, CheckCircle2 } from 'lucide-react';
import { cn } from '@/lib/cn';

export function DashboardOverview() {
  const { data, isLoading, error } = useDashboardOverview();
  const refreshKPIs = useRefreshKPIs();

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {[1, 2, 3, 4].map((i) => (
          <Card key={i} className="p-6 animate-pulse">
            <div className="h-4 bg-gray-200 rounded w-1/2 mb-4"></div>
            <div className="h-8 bg-gray-200 rounded w-3/4"></div>
          </Card>
        ))}
      </div>
    );
  }

  if (error || !data) {
    return (
      <Card className="p-6">
        <p className="text-red-600 dark:text-red-400">
          Error al cargar overview. Por favor, intenta nuevamente.
        </p>
      </Card>
    );
  }

  const kpis = data;

  return (
    <div className="space-y-6">
      {/* Header con botón de refresh */}
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
          Resumen Ejecutivo
        </h2>
        <Button
          variant="secondary"
          size="sm"
          onClick={() => refreshKPIs.trigger()}
          disabled={refreshKPIs.isMutating}
        >
          <RefreshCw className={cn('w-4 h-4', refreshKPIs.isMutating && 'animate-spin')} />
          Actualizar KPIs
        </Button>
      </div>

      {/* KPIs Operativos */}
      <div>
        <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
          KPIs Operativos
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card className="p-6 border-l-4 border-l-blue-500">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-gray-600 dark:text-gray-400">Órdenes Completadas</span>
              <CheckCircle2 className="w-5 h-5 text-blue-500" />
            </div>
            <p className="text-3xl font-bold text-gray-900 dark:text-gray-100">
              {kpis.operativos?.ordenesCompletadas || 0}
            </p>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
              Eficiencia: {kpis.operativos?.eficiencia?.toFixed(1) || 0}%
            </p>
          </Card>

          <Card className="p-6 border-l-4 border-l-green-500">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-gray-600 dark:text-gray-400">Órdenes en Progreso</span>
              <TrendingUp className="w-5 h-5 text-green-500" />
            </div>
            <p className="text-3xl font-bold text-gray-900 dark:text-gray-100">
              {kpis.operativos?.ordenesEnProgreso || 0}
            </p>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
              Tiempo promedio: {kpis.operativos?.tiempoPromedio?.toFixed(1) || 0} días
            </p>
          </Card>

          <Card className="p-6 border-l-4 border-l-purple-500">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-gray-600 dark:text-gray-400">Eficiencia General</span>
              <TrendingUp className="w-5 h-5 text-purple-500" />
            </div>
            <p className="text-3xl font-bold text-gray-900 dark:text-gray-100">
              {kpis.operativos?.eficiencia?.toFixed(1) || 0}%
            </p>
            <div className="mt-2">
              <div className="w-full bg-gray-200 rounded-full h-2 dark:bg-gray-700" role="progressbar" aria-valuenow={kpis.operativos?.eficiencia || 0} aria-valuemin={0} aria-valuemax={100}>
                <div
                  className="bg-purple-500 h-2 rounded-full transition-all duration-500"
                  style={{ width: `${kpis.operativos?.eficiencia || 0}%` }}
                ></div>
              </div>
            </div>
          </Card>
        </div>
      </div>

      {/* KPIs Financieros */}
      <div>
        <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
          KPIs Financieros
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card className="p-6 border-l-4 border-l-green-500">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-gray-600 dark:text-gray-400">Ingresos</span>
              <DollarSign className="w-5 h-5 text-green-500" />
            </div>
            <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">
              ${(kpis.financieros?.ingresos || 0).toLocaleString('es-CO')}
            </p>
          </Card>

          <Card className="p-6 border-l-4 border-l-red-500">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-gray-600 dark:text-gray-400">Costos</span>
              <TrendingDown className="w-5 h-5 text-red-500" />
            </div>
            <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">
              ${(kpis.financieros?.costos || 0).toLocaleString('es-CO')}
            </p>
          </Card>

          <Card className="p-6 border-l-4 border-l-blue-500">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-gray-600 dark:text-gray-400">Margen</span>
              <TrendingUp className="w-5 h-5 text-blue-500" />
            </div>
            <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">
              {kpis.financieros?.margen?.toFixed(1) || 0}%
            </p>
          </Card>

          <Card className="p-6 border-l-4 border-l-orange-500">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-gray-600 dark:text-gray-400">Varianza</span>
              <AlertTriangle className="w-5 h-5 text-orange-500" />
            </div>
            <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">
              {kpis.financieros?.varianza?.toFixed(1) || 0}%
            </p>
          </Card>
        </div>
      </div>

      {/* KPIs Técnicos */}
      <div>
        <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
          KPIs Técnicos
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card className="p-6 border-l-4 border-l-indigo-500">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-gray-600 dark:text-gray-400">Horas Trabajadas</span>
              <Users className="w-5 h-5 text-indigo-500" />
            </div>
            <p className="text-3xl font-bold text-gray-900 dark:text-gray-100">
              {kpis.tecnicos?.horasTrabajadas?.toFixed(1) || 0}
            </p>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
              Estimadas: {kpis.tecnicos?.horasEstimadas?.toFixed(1) || 0}h
            </p>
          </Card>

          <Card className="p-6 border-l-4 border-l-teal-500">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-gray-600 dark:text-gray-400">Productividad</span>
              <TrendingUp className="w-5 h-5 text-teal-500" />
            </div>
            <p className="text-3xl font-bold text-gray-900 dark:text-gray-100">
              {kpis.tecnicos?.productividad?.toFixed(1) || 0}%
            </p>
            <div className="mt-2">
              <div className="w-full bg-gray-200 rounded-full h-2 dark:bg-gray-700" role="progressbar" aria-valuenow={kpis.tecnicos?.productividad || 0} aria-valuemin={0} aria-valuemax={100}>
                <div
                  className="bg-teal-500 h-2 rounded-full transition-all duration-500"
                  style={{ width: `${kpis.tecnicos?.productividad || 0}%` }}
                ></div>
              </div>
            </div>
          </Card>

          <Card className="p-6 border-l-4 border-l-yellow-500">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-gray-600 dark:text-gray-400">Alertas Pendientes</span>
              <AlertTriangle className="w-5 h-5 text-yellow-500" />
            </div>
            <p className="text-3xl font-bold text-gray-900 dark:text-gray-100">
              {kpis.alertas?.pendientes || 0}
            </p>
            {kpis.alertas?.criticas > 0 && (
              <p className="text-xs text-red-600 dark:text-red-400 mt-2">
                {kpis.alertas.criticas} críticas
              </p>
            )}
          </Card>
        </div>
      </div>
    </div>
  );
}
