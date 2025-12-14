/**
 * ARCHIVO: Input.tsx
 * FUNCION: Componente Input para formularios con soporte de label, error y iconos
 * IMPLEMENTACION: Input HTML nativo con estilos Tailwind, estados de error y helper text
 * DEPENDENCIAS: React, cn utility
 * EXPORTS: Input, InputProps (interface)
 */
import React from 'react';
import { cn } from '@/lib/cn';

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helperText?: string;
  required?: boolean;
  icon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, label, error, helperText, required, icon, rightIcon, ...props }, ref) => (
    <div className="w-full">
      {label && (
        <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-400">
          {label}
          {required && <span className="text-error-500 ml-0.5">*</span>}
        </label>
      )}

      <div className="relative">
        {icon && (
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 dark:text-gray-400">
            {icon}
          </span>
        )}

        <input
          type={type}
          className={cn(
            'h-11 w-full rounded-lg border border-gray-300 bg-transparent px-4 py-2.5 text-sm text-gray-800 shadow-theme-xs placeholder:text-gray-400',
            'focus:border-brand-300 focus:outline-none focus:ring-3 focus:ring-brand-500/10',
            'dark:border-gray-700 dark:bg-gray-900 dark:text-white/90 dark:placeholder:text-white/30 dark:focus:border-brand-800',
            'disabled:cursor-not-allowed disabled:bg-gray-50 disabled:text-gray-400 dark:disabled:bg-gray-800',
            error && 'border-error-500 focus:border-error-500 focus:ring-error-500/10 dark:border-error-500',
            icon && 'pl-10',
            rightIcon && 'pr-10',
            className
          )}
          ref={ref}
          {...props}
        />

        {rightIcon && (
          <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 dark:text-gray-400">
            {rightIcon}
          </span>
        )}
      </div>

      {error && <p className="mt-1.5 text-sm text-error-500">{error}</p>}
      {helperText && !error && <p className="mt-1.5 text-sm text-gray-500 dark:text-gray-400">{helperText}</p>}
    </div>
  )
);

Input.displayName = 'Input';

export { Input };
