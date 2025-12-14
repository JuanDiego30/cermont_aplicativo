/**
 * ARCHIVO: Button.tsx
 * FUNCION: Componente Button reutilizable con multiples variantes y estados
 * IMPLEMENTACION: Usa cva para variantes (primary, secondary, ghost, etc.) con soporte loading
 * DEPENDENCIAS: React, class-variance-authority, cn utility
 * EXPORTS: Button, buttonVariants, ButtonProps (interface)
 */
import React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/cn';

const buttonVariants = cva(
  'inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-lg font-medium transition-all focus:outline-none focus:ring-3 disabled:pointer-events-none disabled:opacity-50',
  {
    variants: {
      variant: {
        // Primary - TailAdmin brand color (alias: default)
        primary: 'bg-brand-500 text-white shadow-theme-xs hover:bg-brand-600 focus:ring-brand-500/10',
        default: 'bg-brand-500 text-white shadow-theme-xs hover:bg-brand-600 focus:ring-brand-500/10',
        // Secondary - Outlined (alias: outline)
        secondary: 'border border-gray-300 bg-white text-gray-700 shadow-theme-xs hover:bg-gray-50 hover:text-gray-800 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-400 dark:hover:bg-gray-700 dark:hover:text-gray-200',
        outline: 'border border-gray-300 bg-white text-gray-700 shadow-theme-xs hover:bg-gray-50 hover:text-gray-800 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-400 dark:hover:bg-gray-700 dark:hover:text-gray-200',
        // Success
        success: 'bg-success-500 text-white shadow-theme-xs hover:bg-success-600 focus:ring-success-500/10',
        // Error/Danger (alias: destructive)
        danger: 'bg-error-500 text-white shadow-theme-xs hover:bg-error-600 focus:ring-error-500/10',
        destructive: 'bg-error-500 text-white shadow-theme-xs hover:bg-error-600 focus:ring-error-500/10',
        // Warning
        warning: 'bg-warning-500 text-white shadow-theme-xs hover:bg-warning-600 focus:ring-warning-500/10',
        // Ghost
        ghost: 'text-gray-700 hover:bg-gray-100 hover:text-gray-800 dark:text-gray-400 dark:hover:bg-gray-800 dark:hover:text-gray-200',
        // Link
        link: 'text-brand-500 underline-offset-4 hover:underline dark:text-brand-400',
        // Outline primary
        outlinePrimary: 'border border-brand-500 bg-transparent text-brand-500 hover:bg-brand-50 dark:border-brand-400 dark:text-brand-400 dark:hover:bg-brand-500/10',
        // Outline danger
        outlineDanger: 'border border-error-500 bg-transparent text-error-500 hover:bg-error-50 dark:border-error-400 dark:text-error-400 dark:hover:bg-error-500/10',
      },
      size: {
        xs: 'h-8 px-3 text-xs',
        sm: 'h-9 px-4 text-sm',
        md: 'h-10 px-4 text-sm',
        default: 'h-10 px-4 text-sm',
        lg: 'h-11 px-5 text-base',
        xl: 'h-12 px-6 text-base',
        icon: 'h-10 w-10',
        iconSm: 'h-8 w-8',
        iconLg: 'h-12 w-12',
      },
    },
    defaultVariants: {
      variant: 'primary',
      size: 'md',
    },
  }
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
  VariantProps<typeof buttonVariants> {
  asChild?: boolean;
  isLoading?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, isLoading, leftIcon, rightIcon, children, disabled, ...props }, ref) => (
    <button
      className={cn(buttonVariants({ variant, size, className }))}
      ref={ref}
      disabled={disabled || isLoading}
      {...props}
    >
      {isLoading ? (
        <svg className="h-4 w-4 animate-spin" viewBox="0 0 24 24" fill="none">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
        </svg>
      ) : leftIcon}
      {children}
      {!isLoading && rightIcon}
    </button>
  )
);

Button.displayName = 'Button';

export { Button, buttonVariants };
