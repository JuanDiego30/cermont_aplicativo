'use client';

import { ReactNode } from 'react';

/**
 * Variant colors for the stat card
 */
export type StatCardVariant = 'primary' | 'warning' | 'success' | 'info' | 'danger' | 'neutral';

interface StatCardProps {
  /** Title of the stat */
  title: string;
  /** Value to display */
  value: string | number;
  /** Icon to display */
  icon?: ReactNode;
  /** Color variant */
  variant?: StatCardVariant;
  /** Optional trend indicator */
  trend?: {
    value: number;
    isPositive: boolean;
  };
  /** Optional subtitle or description */
  subtitle?: string;
  /** Custom className */
  className?: string;
  /** Click handler */
  onClick?: () => void;
}

const VARIANT_STYLES: Record<StatCardVariant, { border: string; iconBg: string; iconColor: string }> = {
  primary: {
    border: 'border-brand-500/30',
    iconBg: 'bg-brand-500/10',
    iconColor: 'text-brand-500',
  },
  warning: {
    border: 'border-yellow-500/30',
    iconBg: 'bg-yellow-500/10',
    iconColor: 'text-yellow-500',
  },
  success: {
    border: 'border-green-500/30',
    iconBg: 'bg-green-500/10',
    iconColor: 'text-green-500',
  },
  info: {
    border: 'border-blue-500/30',
    iconBg: 'bg-blue-500/10',
    iconColor: 'text-blue-500',
  },
  danger: {
    border: 'border-red-500/30',
    iconBg: 'bg-red-500/10',
    iconColor: 'text-red-500',
  },
  neutral: {
    border: 'border-gray-500/30',
    iconBg: 'bg-gray-500/10',
    iconColor: 'text-gray-500',
  },
};

/**
 * StatCard - Tarjeta de estadística reutilizable
 * 
 * @example
 * // Stat card básica
 * <StatCard title="Total Órdenes" value={42} variant="primary" />
 * 
 * @example
 * // Con icono y trend
 * <StatCard 
 *   title="En Ejecución" 
 *   value={5} 
 *   variant="warning"
 *   icon={<BoltIcon />}
 *   trend={{ value: 12, isPositive: true }}
 * />
 */
export function StatCard({
  title,
  value,
  icon,
  variant = 'primary',
  trend,
  subtitle,
  className = '',
  onClick,
}: StatCardProps) {
  const styles = VARIANT_STYLES[variant];
  const isClickable = !!onClick;

  return (
    <div
      className={`
        rounded-xl border ${styles.border} 
        bg-white dark:bg-gray-800 
        p-5 
        ${isClickable ? 'cursor-pointer hover:shadow-lg transition-shadow' : ''}
        ${className}
      `}
      onClick={onClick}
      role={isClickable ? 'button' : undefined}
      tabIndex={isClickable ? 0 : undefined}
    >
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
            {title}
          </p>
          <div className="flex items-baseline gap-2 mt-1">
            <h3 className="text-3xl font-bold text-gray-900 dark:text-white">
              {value}
            </h3>
            {trend && (
              <span
                className={`text-sm font-medium ${
                  trend.isPositive ? 'text-green-500' : 'text-red-500'
                }`}
              >
                {trend.isPositive ? '+' : ''}{trend.value}%
              </span>
            )}
          </div>
          {subtitle && (
            <p className="mt-1 text-xs text-gray-400 dark:text-gray-500">
              {subtitle}
            </p>
          )}
        </div>
        {icon && (
          <div className={`p-3 rounded-full ${styles.iconBg}`}>
            <div className={`w-6 h-6 ${styles.iconColor}`}>
              {icon}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default StatCard;
