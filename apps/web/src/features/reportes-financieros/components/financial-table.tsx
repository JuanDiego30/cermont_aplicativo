/**
 * @file financial-table.tsx
 * @description Tabla de datos financieros detallados
 * 
 * ✨ Server Component
 */

import { formatCurrency, getMarginColor } from '../utils/currency.utils';
import type { FinancialData, FinancialSummary } from '../api/financiero.types';

interface FinancialTableProps {
  data: FinancialData[];
  summary: FinancialSummary;
}

export function FinancialTable({ data, summary }: FinancialTableProps) {
  return (
    <div className="rounded-2xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-gray-900 overflow-hidden">
      <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-800">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
          Detalle por Período
        </h3>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50 dark:bg-gray-800">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Período
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Ingresos
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Egresos
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Utilidad
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Margen
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 dark:divide-gray-800">
            {data.map((item, index) => (
              <FinancialTableRow key={index} data={item} />
            ))}
          </tbody>
          <tfoot className="bg-gray-50 dark:bg-gray-800">
            <tr>
              <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-gray-900 dark:text-white">
                TOTAL
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-right text-emerald-600 font-bold">
                {formatCurrency(summary.totalIngresos)}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-right text-red-600 font-bold">
                {formatCurrency(summary.totalEgresos)}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-right text-blue-600 font-bold">
                {formatCurrency(summary.totalUtilidad)}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-right">
                <MarginBadge value={summary.promedioMargen} isBold />
              </td>
            </tr>
          </tfoot>
        </table>
      </div>
    </div>
  );
}

// Fila de la tabla
function FinancialTableRow({ data }: { data: FinancialData }) {
  return (
    <tr className="hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">
        {data.periodo}
      </td>
      <td className="px-6 py-4 whitespace-nowrap text-sm text-right text-emerald-600 font-medium">
        {formatCurrency(data.ingresos)}
      </td>
      <td className="px-6 py-4 whitespace-nowrap text-sm text-right text-red-600 font-medium">
        {formatCurrency(data.egresos)}
      </td>
      <td className="px-6 py-4 whitespace-nowrap text-sm text-right text-blue-600 font-bold">
        {formatCurrency(data.utilidad)}
      </td>
      <td className="px-6 py-4 whitespace-nowrap text-sm text-right">
        <MarginBadge value={data.margen} />
      </td>
    </tr>
  );
}

// Badge de margen
function MarginBadge({ value, isBold = false }: { value: number; isBold?: boolean }) {
  const { bg, text } = getMarginColor(value);

  return (
    <span className={`px-2 py-1 rounded-full text-xs ${isBold ? 'font-bold' : 'font-medium'} ${bg} ${text}`}>
      {value.toFixed(1)}%
    </span>
  );
}

// Skeleton
export function FinancialTableSkeleton() {
  return (
    <div className="rounded-2xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-gray-900 overflow-hidden animate-pulse">
      <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-800">
        <div className="h-5 w-40 bg-gray-200 dark:bg-gray-700 rounded" />
      </div>
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50 dark:bg-gray-800">
            <tr>
              {Array.from({ length: 5 }).map((_, i) => (
                <th key={i} className="px-6 py-3">
                  <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-20" />
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 dark:divide-gray-800">
            {Array.from({ length: 6 }).map((_, i) => (
              <tr key={i}>
                {Array.from({ length: 5 }).map((_, j) => (
                  <td key={j} className="px-6 py-4">
                    <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-16 ml-auto" />
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
