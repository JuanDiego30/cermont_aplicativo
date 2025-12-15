/**
 * ARCHIVO: financial-kpi-card.tsx
 * FUNCION: Tarjeta individual de KPI financiero con icono y tendencia
 * IMPLEMENTACION: Server Component con iconos Lucide y badges de tendencia
 * DEPENDENCIAS: lucide-react, formatCurrency, formatPercent, FinancialKPI types
 * EXPORTS: FinancialKPICard, FinancialKPICardSkeleton
 */
import { DollarSign, TrendingUp, TrendingDown, ArrowUpRight, ArrowDownRight } from 'lucide-react';
import { formatCurrency, formatPercent } from '../utils/currency.utils';
import type { FinancialKPI } from '../api/financiero.types';

interface FinancialKPICardProps {
  label: string;
  value: number;
  trend: {
    value: number;
    isPositive: boolean;
  };
  type: 'ingresos' | 'egresos' | 'utilidad' | 'margen';
}

const iconConfig = {
  ingresos: {
    icon: DollarSign,
    bgColor: 'bg-emerald-100 dark:bg-emerald-500/20',
    iconColor: 'text-emerald-600',
    valueColor: 'text-gray-900 dark:text-white',
  },
  egresos: {
    icon: TrendingDown,
    bgColor: 'bg-red-100 dark:bg-red-500/20',
    iconColor: 'text-red-600',
    valueColor: 'text-gray-900 dark:text-white',
  },
  utilidad: {
    icon: TrendingUp,
    bgColor: 'bg-blue-100 dark:bg-blue-500/20',
    iconColor: 'text-blue-600',
    valueColor: 'text-emerald-600',
  },
  margen: {
    icon: TrendingUp,
    bgColor: 'bg-purple-100 dark:bg-purple-500/20',
    iconColor: 'text-purple-600',
    valueColor: 'text-gray-900 dark:text-white',
  },
};

export function FinancialKPICard({ label, value, trend, type }: FinancialKPICardProps) {
  const config = iconConfig[type];
  const Icon = config.icon;
  const TrendIcon = trend.isPositive ? ArrowUpRight : ArrowDownRight;

  const formattedValue = type === 'margen' 
    ? formatPercent(value) 
    : formatCurrency(value);

  const trendColorClass = trend.isPositive
    ? 'text-emerald-600 bg-emerald-100 dark:bg-emerald-500/20'
    : 'text-red-600 bg-red-100 dark:bg-red-500/20';

  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-gray-900">
      <div className="flex items-center justify-between">
        <div className={`inline-flex items-center justify-center w-12 h-12 rounded-xl ${config.bgColor}`}>
          <Icon className={`w-6 h-6 ${config.iconColor}`} />
        </div>
        <span className={`inline-flex items-center gap-1 px-2.5 py-1 text-xs font-medium rounded-full ${trendColorClass}`}>
          <TrendIcon className="w-3 h-3" />
          {trend.value > 0 ? '+' : ''}{trend.value.toFixed(1)}%
        </span>
      </div>
      <div className="mt-4">
        <p className={`text-2xl font-bold ${config.valueColor}`}>
          {formattedValue}
        </p>
        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
          {label}
        </p>
      </div>
    </div>
  );
}

// Skeleton
export function FinancialKPICardSkeleton() {
  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-gray-900 animate-pulse">
      <div className="flex items-center justify-between">
        <div className="w-12 h-12 rounded-xl bg-gray-200 dark:bg-gray-700" />
        <div className="w-16 h-6 rounded-full bg-gray-200 dark:bg-gray-700" />
      </div>
      <div className="mt-4 space-y-2">
        <div className="h-8 w-24 bg-gray-200 dark:bg-gray-700 rounded" />
        <div className="h-4 w-32 bg-gray-200 dark:bg-gray-700 rounded" />
      </div>
    </div>
  );
}
