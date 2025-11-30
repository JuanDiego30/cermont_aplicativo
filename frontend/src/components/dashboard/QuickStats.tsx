'use client';

/**
 * Quick Stats Widget
 * Animated statistics display for dashboard
 */

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { LucideIcon, TrendingUp, TrendingDown } from 'lucide-react';

interface QuickStatsProps {
  title: string;
  value: number;
  previousValue?: number;
  icon: LucideIcon;
  format?: 'number' | 'currency' | 'percentage';
  color?: 'blue' | 'green' | 'purple' | 'orange' | 'red';
  prefix?: string;
  suffix?: string;
}

const colorClasses = {
  blue: {
    bg: 'bg-blue-50 dark:bg-blue-900/20',
    icon: 'bg-blue-100 text-blue-600 dark:bg-blue-900/40 dark:text-blue-400',
    trend: 'text-blue-600 dark:text-blue-400',
  },
  green: {
    bg: 'bg-green-50 dark:bg-green-900/20',
    icon: 'bg-green-100 text-green-600 dark:bg-green-900/40 dark:text-green-400',
    trend: 'text-green-600 dark:text-green-400',
  },
  purple: {
    bg: 'bg-purple-50 dark:bg-purple-900/20',
    icon: 'bg-purple-100 text-purple-600 dark:bg-purple-900/40 dark:text-purple-400',
    trend: 'text-purple-600 dark:text-purple-400',
  },
  orange: {
    bg: 'bg-orange-50 dark:bg-orange-900/20',
    icon: 'bg-orange-100 text-orange-600 dark:bg-orange-900/40 dark:text-orange-400',
    trend: 'text-orange-600 dark:text-orange-400',
  },
  red: {
    bg: 'bg-red-50 dark:bg-red-900/20',
    icon: 'bg-red-100 text-red-600 dark:bg-red-900/40 dark:text-red-400',
    trend: 'text-red-600 dark:text-red-400',
  },
};

function formatValue(value: number, format: string, prefix?: string, suffix?: string): string {
  let formatted: string;
  
  switch (format) {
    case 'currency':
      formatted = new Intl.NumberFormat('es-CO', {
        style: 'currency',
        currency: 'COP',
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
      }).format(value);
      break;
    case 'percentage':
      formatted = `${value.toFixed(1)}%`;
      break;
    default:
      formatted = new Intl.NumberFormat('es-CO').format(value);
  }
  
  return `${prefix || ''}${formatted}${suffix || ''}`;
}

export function QuickStats({
  title,
  value,
  previousValue,
  icon: Icon,
  format = 'number',
  color = 'blue',
  prefix,
  suffix,
}: QuickStatsProps) {
  const [displayValue, setDisplayValue] = useState(0);
  const colors = colorClasses[color];

  // Animated counter
  useEffect(() => {
    const duration = 1000;
    const steps = 30;
    const increment = value / steps;
    let current = 0;
    
    const timer = setInterval(() => {
      current += increment;
      if (current >= value) {
        setDisplayValue(value);
        clearInterval(timer);
      } else {
        setDisplayValue(Math.floor(current));
      }
    }, duration / steps);

    return () => clearInterval(timer);
  }, [value]);

  // Calculate trend
  const trend = previousValue != null 
    ? ((value - previousValue) / previousValue) * 100 
    : null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={`rounded-xl border border-gray-200 p-5 ${colors.bg} dark:border-gray-700`}
    >
      <div className="flex items-center justify-between">
        <div className={`flex h-12 w-12 items-center justify-center rounded-xl ${colors.icon}`}>
          <Icon className="h-6 w-6" />
        </div>
        {trend != null && (
          <div className={`flex items-center gap-1 text-sm font-medium ${
            trend >= 0 ? 'text-green-600' : 'text-red-600'
          }`}>
            {trend >= 0 ? (
              <TrendingUp className="h-4 w-4" />
            ) : (
              <TrendingDown className="h-4 w-4" />
            )}
            <span>{Math.abs(trend).toFixed(1)}%</span>
          </div>
        )}
      </div>

      <div className="mt-4">
        <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">
          {title}
        </h3>
        <p className="mt-1 text-2xl font-bold text-gray-900 dark:text-white">
          {formatValue(displayValue, format, prefix, suffix)}
        </p>
      </div>
    </motion.div>
  );
}

export default QuickStats;
