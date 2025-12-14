/**
 * ARCHIVO: MetricCard.tsx
 * FUNCION: Tarjetas de métricas con indicadores de tendencia para dashboard
 * IMPLEMENTACION: Muestra valor, icono opcional y badge de tendencia (+/-%) con iconos lucide
 * DEPENDENCIAS: react, @/lib/cn, lucide-react (TrendingUp, TrendingDown)
 * EXPORTS: MetricCard, MetricsGrid, MetricCardProps, MetricsGridProps
 */
import React from 'react';
import { cn } from '@/lib/cn';
import { TrendingUp, TrendingDown } from 'lucide-react';

export interface MetricCardProps {
  title: string;
  value: string | number;
  icon?: React.ReactNode;
  trend?: {
    value: number;
    isPositive: boolean;
    label?: string;
  };
  className?: string;
  iconBgColor?: string;
  iconColor?: string;
}

export const MetricCard: React.FC<MetricCardProps> = ({
  title,
  value,
  icon,
  trend,
  className,
  iconBgColor = 'bg-brand-50 dark:bg-brand-500/15',
  iconColor = 'text-brand-500 dark:text-brand-400',
}) => {
  return (
    <div
      className={cn(
        'rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/3 sm:p-6',
        className
      )}
    >
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <span className="text-sm text-gray-500 dark:text-gray-400">
            {title}
          </span>
          <h4 className="mt-2 text-2xl font-bold text-gray-800 dark:text-white/90 sm:text-3xl">
            {value}
          </h4>

          {trend && (
            <div className="mt-3 flex items-center gap-1">
              <span
                className={cn(
                  'inline-flex items-center gap-0.5 rounded-full px-2 py-0.5 text-sm font-medium',
                  trend.isPositive
                    ? 'bg-success-50 text-success-600 dark:bg-success-500/15 dark:text-success-500'
                    : 'bg-error-50 text-error-600 dark:bg-error-500/15 dark:text-error-500'
                )}
              >
                {trend.isPositive ? (
                  <TrendingUp className="h-3 w-3" />
                ) : (
                  <TrendingDown className="h-3 w-3" />
                )}
                {Math.abs(trend.value)}%
              </span>
              {trend.label && (
                <span className="text-sm text-gray-500 dark:text-gray-400">
                  {trend.label}
                </span>
              )}
            </div>
          )}
        </div>

        {icon && (
          <div
            className={cn(
              'flex h-12 w-12 items-center justify-center rounded-xl',
              iconBgColor
            )}
          >
            <span className={cn('h-6 w-6', iconColor)}>{icon}</span>
          </div>
        )}
      </div>
    </div>
  );
};

// Grid de métricas para el dashboard
export interface MetricsGridProps {
  children: React.ReactNode;
  className?: string;
}

export const MetricsGrid: React.FC<MetricsGridProps> = ({
  children,
  className,
}) => {
  return (
    <div
      className={cn(
        'grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4 xl:gap-6',
        className
      )}
    >
      {children}
    </div>
  );
};
