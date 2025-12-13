/**
 * @file financial-chart.tsx
 * @description Gráfico de evolución financiera
 * 
 * ✨ Server Component - Visualización simple sin librerías externas
 */

import { formatCurrency } from '../utils/currency.utils';
import type { FinancialData } from '../api/financiero.types';

interface FinancialChartProps {
  data: FinancialData[];
  maxValue?: number;
}

export function FinancialChart({ data, maxValue }: FinancialChartProps) {
  // Calcular valor máximo para escala
  const max = maxValue || Math.max(...data.map(d => Math.max(d.ingresos, d.egresos, d.utilidad))) * 1.1;

  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-gray-900">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            Evolución Financiera
          </h3>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            Comparativa de ingresos vs egresos
          </p>
        </div>
        <ChartLegend />
      </div>

      {/* Gráfico de barras simple */}
      <div className="space-y-4">
        {data.map((item, index) => (
          <ChartBar key={index} item={item} maxValue={max} />
        ))}
      </div>
    </div>
  );
}

// Leyenda del gráfico
function ChartLegend() {
  const items = [
    { label: 'Ingresos', color: 'bg-emerald-500' },
    { label: 'Egresos', color: 'bg-red-400' },
    { label: 'Utilidad', color: 'bg-blue-500' },
  ];

  return (
    <div className="flex items-center gap-4">
      {items.map((item) => (
        <div key={item.label} className="flex items-center gap-2">
          <span className={`w-3 h-3 rounded-full ${item.color}`} />
          <span className="text-sm text-gray-600 dark:text-gray-400">{item.label}</span>
        </div>
      ))}
    </div>
  );
}

// Barra individual
function ChartBar({ item, maxValue }: { item: FinancialData; maxValue: number }) {
  const ingresosWidth = (item.ingresos / maxValue) * 100;
  const egresosWidth = (item.egresos / maxValue) * 100;
  const utilidadWidth = (item.utilidad / maxValue) * 100;

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between text-sm">
        <span className="font-medium text-gray-700 dark:text-gray-300">{item.periodo}</span>
        <span className="text-gray-500 dark:text-gray-400">
          Margen: {item.margen.toFixed(1)}%
        </span>
      </div>
      <div className="flex gap-1 h-8">
        <div
          className="bg-emerald-500 rounded-l-lg transition-all duration-300 hover:opacity-80"
          style={{ width: `${ingresosWidth}%` }}
          title={`Ingresos: ${formatCurrency(item.ingresos)}`}
        />
        <div
          className="bg-red-400 transition-all duration-300 hover:opacity-80"
          style={{ width: `${egresosWidth}%` }}
          title={`Egresos: ${formatCurrency(item.egresos)}`}
        />
        <div
          className="bg-blue-500 rounded-r-lg transition-all duration-300 hover:opacity-80"
          style={{ width: `${utilidadWidth}%` }}
          title={`Utilidad: ${formatCurrency(item.utilidad)}`}
        />
      </div>
    </div>
  );
}

// Skeleton
export function FinancialChartSkeleton() {
  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-gray-900 animate-pulse">
      <div className="flex items-center justify-between mb-6">
        <div className="space-y-2">
          <div className="h-5 w-40 bg-gray-200 dark:bg-gray-700 rounded" />
          <div className="h-4 w-56 bg-gray-200 dark:bg-gray-700 rounded" />
        </div>
        <div className="flex gap-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-gray-200 dark:bg-gray-700" />
              <div className="h-4 w-16 bg-gray-200 dark:bg-gray-700 rounded" />
            </div>
          ))}
        </div>
      </div>
      <div className="space-y-4">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="space-y-2">
            <div className="flex justify-between">
              <div className="h-4 w-24 bg-gray-200 dark:bg-gray-700 rounded" />
              <div className="h-4 w-20 bg-gray-200 dark:bg-gray-700 rounded" />
            </div>
            <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded-lg" />
          </div>
        ))}
      </div>
    </div>
  );
}
