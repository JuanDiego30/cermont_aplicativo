/**
 * @file loading.tsx
 * @description Loading state para reportes financieros
 */

import {
  FinancialKPICardsSkeleton,
  FinancialChartSkeleton,
  FinancialTableSkeleton,
} from '@/features/reportes-financieros';

export default function ReportesFinancierosLoading() {
  return (
    <div className="space-y-6">
      {/* Header skeleton */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-4">
          <div className="w-10 h-10 rounded-lg bg-gray-200 dark:bg-gray-700 animate-pulse" />
          <div className="space-y-2">
            <div className="h-7 w-48 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
            <div className="h-4 w-64 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
          </div>
        </div>
        <div className="flex gap-3">
          <div className="h-10 w-32 bg-gray-200 dark:bg-gray-700 rounded-lg animate-pulse" />
          <div className="h-10 w-28 bg-gray-200 dark:bg-gray-700 rounded-lg animate-pulse" />
          <div className="h-10 w-20 bg-gray-200 dark:bg-gray-700 rounded-lg animate-pulse" />
        </div>
      </div>

      {/* KPI Cards */}
      <FinancialKPICardsSkeleton />

      {/* Chart */}
      <FinancialChartSkeleton />

      {/* Table */}
      <FinancialTableSkeleton />
    </div>
  );
}
