/**
 * @file stat-card.tsx
 * @description Componente de tarjeta de estadística reutilizable
 * 
 * ✨ Server Component - No necesita 'use client'
 */

import { cn } from '@/lib/cn';

interface StatCardProps {
  label: string;
  value: string | number;
  icon: React.ReactNode;
  trend?: {
    value: number;
    isPositive: boolean;
  } | null;
  className?: string;
}

export function StatCard({ label, value, icon, trend, className }: StatCardProps) {
  return (
    <div
      className={cn(
        'rounded-xl border border-gray-200 bg-white p-4 dark:border-gray-800 dark:bg-white/[0.03]',
        className
      )}
    >
      <div className="flex items-center gap-3">
        <div className="p-2 rounded-lg bg-gray-100 dark:bg-gray-800">
          {icon}
        </div>
        <div className="flex-1">
          <p className="text-2xl font-bold text-gray-900 dark:text-white">
            {value}
          </p>
          <p className="text-sm text-gray-500 dark:text-gray-400">{label}</p>
        </div>
        {trend && (
          <span
            className={cn(
              'inline-flex items-center px-2 py-1 text-xs font-medium rounded-full',
              trend.isPositive
                ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-400'
                : 'bg-red-100 text-red-700 dark:bg-red-500/20 dark:text-red-400'
            )}
          >
            {trend.isPositive ? '+' : '-'}{Math.abs(trend.value)}%
          </span>
        )}
      </div>
    </div>
  );
}
