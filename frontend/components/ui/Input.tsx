// components/ui/Input.tsx
import React from 'react';
import { cn } from '@/lib/utils/cn';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, className = '', ...props }, ref) => {
    const inputClasses = cn(
      // Base
      'w-full px-4 py-2.5 rounded-lg text-sm',
      'transition-all duration-200',
      'focus:outline-none focus:ring-2 focus:ring-offset-0',
      
      // Colors
      'bg-white dark:bg-neutral-900',
      'text-neutral-900 dark:text-neutral-50',
      'placeholder:text-neutral-400 dark:placeholder:text-neutral-500',
      
      // Border
      error
        ? 'border-2 border-error-500 focus:border-error-500 focus:ring-error-500 dark:border-error-400'
        : 'border border-neutral-300 focus:border-primary-500 focus:ring-primary-500 dark:border-neutral-700',
      
      // States
      'disabled:bg-neutral-100 disabled:text-neutral-500 disabled:cursor-not-allowed',
      'dark:disabled:bg-neutral-800 dark:disabled:text-neutral-600',
      
      className
    );

    return (
      <div className="w-full">
        {label && (
          <label className="mb-2 block text-sm font-medium text-neutral-700 dark:text-neutral-200">
            {label}
            {props.required && <span className="ml-1 text-error-500">*</span>}
          </label>
        )}

        <input
          ref={ref}
          className={inputClasses}
          aria-invalid={Boolean(error)}
          aria-describedby={error ? `${props.name}-error` : undefined}
          {...props}
        />

        {error && (
          <p
            id={props.name ? `${props.name}-error` : undefined}
            className="mt-1.5 text-sm text-error-600 dark:text-error-400"
          >
            {error}
          </p>
        )}
      </div>
    );
  }
);

Input.displayName = 'Input';
