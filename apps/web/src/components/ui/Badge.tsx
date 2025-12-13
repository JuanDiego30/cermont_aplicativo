// 📁 web/src/components/ui/Badge.tsx
// Diseño TailAdmin - Componente Badge mejorado

import React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/cn';

const badgeVariants = cva(
  'inline-flex items-center justify-center gap-1 rounded-full font-medium transition-colors',
  {
    variants: {
      variant: {
        // Light backgrounds
        primary: 'bg-brand-50 text-brand-500 dark:bg-brand-500/15 dark:text-brand-400',
        secondary: 'bg-gray-100 text-gray-700 dark:bg-white/5 dark:text-white/80', // alias for light
        success: 'bg-success-50 text-success-600 dark:bg-success-500/15 dark:text-success-500',
        error: 'bg-error-50 text-error-600 dark:bg-error-500/15 dark:text-error-500',
        destructive: 'bg-error-50 text-error-600 dark:bg-error-500/15 dark:text-error-500', // alias for error
        warning: 'bg-warning-50 text-warning-600 dark:bg-warning-500/15 dark:text-orange-400',
        info: 'bg-blue-light-50 text-blue-light-500 dark:bg-blue-light-500/15 dark:text-blue-light-500',
        light: 'bg-gray-100 text-gray-700 dark:bg-white/5 dark:text-white/80',
        dark: 'bg-gray-500 text-white dark:bg-white/5 dark:text-white',
        default: 'bg-gray-100 text-gray-700 dark:bg-white/5 dark:text-white/80', // alias for light
        outline: 'border border-gray-300 bg-transparent text-gray-700 dark:border-gray-600 dark:text-gray-300', // outlined style
        // Solid backgrounds
        primarySolid: 'bg-brand-500 text-white',
        successSolid: 'bg-success-500 text-white',
        errorSolid: 'bg-error-500 text-white',
        warningSolid: 'bg-warning-500 text-white',
        infoSolid: 'bg-blue-light-500 text-white',
      },
      size: {
        sm: 'px-2 py-0.5 text-xs',
        md: 'px-2.5 py-0.5 text-sm',
        lg: 'px-3 py-1 text-sm',
      },
    },
    defaultVariants: {
      variant: 'primary',
      size: 'md',
    },
  }
);

// Map color strings to variants
const colorToVariant: Record<string, VariantProps<typeof badgeVariants>['variant']> = {
  green: 'success',
  yellow: 'warning',
  blue: 'info',
  red: 'error',
  gray: 'light',
  primary: 'primary',
};

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement>, VariantProps<typeof badgeVariants> {
  color?: string;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

function Badge({ className, variant, size, color, leftIcon, rightIcon, children, ...props }: BadgeProps) {
  const resolvedVariant = color ? (colorToVariant[color] || variant) : variant;
  
  return (
    <span className={cn(badgeVariants({ variant: resolvedVariant, size }), className)} {...props}>
      {leftIcon}
      {children}
      {rightIcon}
    </span>
  );
}

export { Badge, badgeVariants };
