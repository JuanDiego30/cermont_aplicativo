/**
 * @file page.tsx
 * @description Página de KPIs con mejor UI/UX
 */

'use client';

import React from 'react';
import { useDashboardKPIs } from '@/features/kpis';
import { Card } from '@/components/ui/Card';
import { BarChart3, TrendingUp, Target, DollarSign } from 'lucide-react';

export default function KPIsPage() {
  const { data, isLoading } = useDashboardKPIs();

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[1, 2, 3].map((i) => (
            <Card key={i} className="p-6 animate-pulse">
              <div className="h-4 bg-gray-200 rounded w-1/2 mb-4"></div>
              <div className="h-8 bg-gray-200 rounded w-3/4"></div>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  if (!data) return null;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
          <BarChart3 className="w-6 h-6" />
          KPIs y Métricas
        </h1>
        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
          Indicadores clave de desempeño del sistema
        </p>
      </div>

      {/* KPIs Operativos */}
      <div>
        <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4 flex items-center gap-2">
          <Target className="w-5 h-5" />
          KPIs Operativos
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card className="p-6 border-l-4 border-l-blue-500">
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">Órdenes Completadas</p>
            <p className="text-3xl font-bold text-gray-900 dark:text-gray-100">
              {data.operativos?.ordenesCompletadas || 0}
            </p>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
              Eficiencia: {data.operativos?.eficiencia?.toFixed(1) || 0}%
            </p>
          </Card>

          <Card className="p-6 border-l-4 border-l-green-500">
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">Órdenes en Progreso</p>
            <p className="text-3xl font-bold text-gray-900 dark:text-gray-100">
              {data.operativos?.ordenesEnProgreso || 0}
            </p>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
              Tiempo promedio: {data.operativos?.tiempoPromedio?.toFixed(1) || 0} días
            </p>
          </Card>

          <Card className="p-6 border-l-4 border-l-purple-500">
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">Eficiencia General</p>
            <p className="text-3xl font-bold text-gray-900 dark:text-gray-100">
              {data.operativos?.eficiencia?.toFixed(1) || 0}%
            </p>
            <div className="mt-2">
              <div className="w-full bg-gray-200 rounded-full h-2 dark:bg-gray-700">
                <div
                  className="bg-purple-500 h-2 rounded-full transition-all"
                  style={{ width: `${data.operativos?.eficiencia || 0}%` }}
                ></div>
              </div>
            </div>
          </Card>
        </div>
      </div>

      {/* KPIs Financieros */}
      <div>
        <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4 flex items-center gap-2">
          <DollarSign className="w-5 h-5" />
          KPIs Financieros
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card className="p-6 border-l-4 border-l-green-500">
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">Ingresos</p>
            <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">
              ${(data.financieros?.ingresos || 0).toLocaleString('es-CO')}
            </p>
          </Card>

          <Card className="p-6 border-l-4 border-l-red-500">
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">Costos</p>
            <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">
              ${(data.financieros?.costos || 0).toLocaleString('es-CO')}
            </p>
          </Card>

          <Card className="p-6 border-l-4 border-l-blue-500">
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">Margen</p>
            <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">
              {data.financieros?.margen?.toFixed(1) || 0}%
            </p>
          </Card>

          <Card className="p-6 border-l-4 border-l-orange-500">
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">Varianza</p>
            <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">
              {data.financieros?.varianza?.toFixed(1) || 0}%
            </p>
          </Card>
        </div>
      </div>

      {/* KPIs Técnicos */}
      <div>
        <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4 flex items-center gap-2">
          <TrendingUp className="w-5 h-5" />
          KPIs Técnicos
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card className="p-6 border-l-4 border-l-indigo-500">
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">Horas Trabajadas</p>
            <p className="text-3xl font-bold text-gray-900 dark:text-gray-100">
              {data.tecnicos?.horasTrabajadas?.toFixed(1) || 0}
            </p>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
              Estimadas: {data.tecnicos?.horasEstimadas?.toFixed(1) || 0}h
            </p>
          </Card>

          <Card className="p-6 border-l-4 border-l-teal-500">
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">Productividad</p>
            <p className="text-3xl font-bold text-gray-900 dark:text-gray-100">
              {data.tecnicos?.productividad?.toFixed(1) || 0}%
            </p>
            <div className="mt-2">
              <div className="w-full bg-gray-200 rounded-full h-2 dark:bg-gray-700">
                <div
                  className="bg-teal-500 h-2 rounded-full transition-all"
                  style={{ width: `${data.tecnicos?.productividad || 0}%` }}
                ></div>
              </div>
            </div>
          </Card>

          <Card className="p-6 border-l-4 border-l-cyan-500">
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">Ratio Horas</p>
            <p className="text-3xl font-bold text-gray-900 dark:text-gray-100">
              {data.tecnicos?.horasTrabajadas && data.tecnicos?.horasEstimadas
                ? (data.tecnicos.horasTrabajadas / data.tecnicos.horasEstimadas * 100).toFixed(1)
                : 0}%
            </p>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
              Real vs Estimado
            </p>
          </Card>
        </div>
      </div>
    </div>
  );
}
