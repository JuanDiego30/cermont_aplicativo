/**
 * @file client.tsx
 * @description Componentes client para costos
 */

'use client';

import { useState } from 'react';
import { Calendar, RefreshCw, Download, TrendingUp, TrendingDown, AlertTriangle } from 'lucide-react';
import {
  useResumenPeriodo,
  CostoCard,
  formatCostoCurrency as formatCurrency,
  CostoCardSkeleton,
} from '@/features/costos';
import { useCostos } from '@/features/costos';

export function CostosDashboard() {
  const [fechaInicio, setFechaInicio] = useState(() => {
    const date = new Date();
    date.setMonth(date.getMonth() - 1);
    return date.toISOString().split('T')[0];
  });
  const [fechaFin, setFechaFin] = useState(() => new Date().toISOString().split('T')[0]);

  const { data: resumen, isLoading, error, mutate } = useResumenPeriodo({ fechaInicio, fechaFin });
  const { data: costosData, isLoading: loadingCostos } = useCostos({ fechaInicio, fechaFin });

  const costos = costosData?.data || [];
  const varianzaTotal = resumen?.varianzaTotal || 0;
  const varianzaPositiva = varianzaTotal > 0;

  if (error) {
    return (
      <div className="rounded-2xl border border-red-200 bg-red-50 p-8 text-center dark:border-red-800 dark:bg-red-900/20">
        <AlertTriangle className="w-12 h-12 text-red-500 mx-auto mb-4" />
        <h3 className="text-lg font-semibold text-red-700 dark:text-red-400">Error</h3>
        <p className="text-red-600 dark:text-red-300">No se pudo cargar datos de costos.</p>
        <button
          onClick={() => mutate()}
          className="mt-4 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
        >
          Reintentar
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Toolbar */}
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between p-4 bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700">
        <div className="flex items-center gap-4">
          <Calendar className="w-5 h-5 text-gray-400" />
          <input
            type="date"
            value={fechaInicio}
            onChange={(e) => setFechaInicio(e.target.value)}
            className="px-3 py-2 border rounded-xl bg-white dark:bg-gray-900 dark:border-gray-700"
          />
          <span className="text-gray-500">a</span>
          <input
            type="date"
            value={fechaFin}
            onChange={(e) => setFechaFin(e.target.value)}
            className="px-3 py-2 border rounded-xl bg-white dark:bg-gray-900 dark:border-gray-700"
          />
        </div>
        <div className="flex gap-3">
          <button
            onClick={() => mutate()}
            className="px-4 py-2 border rounded-xl hover:bg-gray-50 dark:hover:bg-gray-700 dark:border-gray-700"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
          <button className="px-4 py-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700 flex items-center gap-2">
            <Download className="w-4 h-4" />
            Exportar
          </button>
        </div>
      </div>

      {/* Stats */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="h-24 bg-gray-200 dark:bg-gray-700 rounded-2xl animate-pulse" />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="rounded-2xl border bg-white p-5 dark:bg-gray-800 dark:border-gray-700">
            <p className="text-sm text-gray-500">Total Órdenes</p>
            <p className="text-2xl font-bold text-gray-900 dark:text-white">{resumen?.totalOrdenes || 0}</p>
          </div>
          <div className="rounded-2xl border border-blue-200 bg-blue-50 p-5 dark:bg-blue-900/20 dark:border-blue-800">
            <p className="text-sm text-blue-600">Presupuestado</p>
            <p className="text-2xl font-bold text-blue-900 dark:text-blue-100">
              {formatCurrency(resumen?.totalPresupuestado || 0)}
            </p>
          </div>
          <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-5 dark:bg-emerald-900/20 dark:border-emerald-800">
            <p className="text-sm text-emerald-600">Costo Real</p>
            <p className="text-2xl font-bold text-emerald-900 dark:text-emerald-100">
              {formatCurrency(resumen?.totalReal || 0)}
            </p>
          </div>
          <div className={`rounded-2xl border p-5 ${varianzaPositiva
            ? 'border-red-200 bg-red-50 dark:bg-red-900/20 dark:border-red-800'
            : 'border-green-200 bg-green-50 dark:bg-green-900/20 dark:border-green-800'
            }`}>
            <p className={`text-sm ${varianzaPositiva ? 'text-red-600' : 'text-green-600'}`}>Varianza</p>
            <div className="flex items-center gap-2">
              {varianzaPositiva
                ? <TrendingUp className="w-5 h-5 text-red-500" />
                : <TrendingDown className="w-5 h-5 text-green-500" />
              }
              <p className={`text-2xl font-bold ${varianzaPositiva ? 'text-red-900 dark:text-red-100' : 'text-green-900 dark:text-green-100'}`}>
                {varianzaPositiva ? '+' : ''}{formatCurrency(varianzaTotal)}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Lista de costos */}
      <div>
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Detalle de Costos</h2>
        {loadingCostos ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {Array.from({ length: 6 }).map((_, i) => (
              <CostoCardSkeleton key={i} />
            ))}
          </div>
        ) : costos.length === 0 ? (
          <div className="text-center py-12 bg-gray-50 dark:bg-gray-800/50 rounded-xl">
            <p className="text-gray-500">No hay costos registrados en este período</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {costos.map((costo) => (
              <CostoCard key={costo.id} costo={costo} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
