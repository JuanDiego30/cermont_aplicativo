'use client';

/**
 * Progress Ring Widget
 * Circular progress indicator with percentage
 */

import { motion } from 'framer-motion';
import { LucideIcon } from 'lucide-react';

interface ProgressRingProps {
  value: number;
  maxValue?: number;
  title: string;
  subtitle?: string;
  icon?: LucideIcon;
  color?: 'blue' | 'green' | 'purple' | 'orange' | 'red';
  size?: 'sm' | 'md' | 'lg';
}

const colorClasses = {
  blue: 'stroke-blue-500',
  green: 'stroke-green-500',
  purple: 'stroke-purple-500',
  orange: 'stroke-orange-500',
  red: 'stroke-red-500',
};

const sizeClasses = {
  sm: { ring: 80, stroke: 6, text: 'text-lg' },
  md: { ring: 120, stroke: 8, text: 'text-2xl' },
  lg: { ring: 160, stroke: 10, text: 'text-3xl' },
};

export function ProgressRing({
  value,
  maxValue = 100,
  title,
  subtitle,
  icon: Icon,
  color = 'blue',
  size = 'md',
}: ProgressRingProps) {
  const percentage = Math.min((value / maxValue) * 100, 100);
  const { ring, stroke, text } = sizeClasses[size];
  const radius = (ring - stroke) / 2;
  const circumference = radius * 2 * Math.PI;
  const strokeDashoffset = circumference - (percentage / 100) * circumference;

  return (
    <div className="flex flex-col items-center">
      <div className="relative" style={{ width: ring, height: ring }}>
        {/* Background Circle */}
        <svg
          className="absolute inset-0 -rotate-90 transform"
          width={ring}
          height={ring}
        >
          <circle
            cx={ring / 2}
            cy={ring / 2}
            r={radius}
            fill="none"
            stroke="currentColor"
            strokeWidth={stroke}
            className="text-gray-200 dark:text-gray-700"
          />
        </svg>

        {/* Progress Circle */}
        <svg
          className="absolute inset-0 -rotate-90 transform"
          width={ring}
          height={ring}
        >
          <motion.circle
            cx={ring / 2}
            cy={ring / 2}
            r={radius}
            fill="none"
            strokeWidth={stroke}
            strokeLinecap="round"
            className={colorClasses[color]}
            initial={{ strokeDashoffset: circumference }}
            animate={{ strokeDashoffset }}
            transition={{ duration: 1, ease: 'easeOut' }}
            style={{
              strokeDasharray: circumference,
            }}
          />
        </svg>

        {/* Center Content */}
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          {Icon && <Icon className="mb-1 h-5 w-5 text-gray-400" />}
          <span className={`font-bold text-gray-900 dark:text-white ${text}`}>
            {Math.round(percentage)}%
          </span>
        </div>
      </div>

      <div className="mt-4 text-center">
        <h4 className="font-medium text-gray-900 dark:text-white">{title}</h4>
        {subtitle && (
          <p className="mt-0.5 text-sm text-gray-500 dark:text-gray-400">
            {subtitle}
          </p>
        )}
      </div>
    </div>
  );
}

export default ProgressRing;
