// 📁 web/src/components/ui/input.tsx

import React from 'react';
import { cn } from '@/lib/cn';

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helperText?: string;
  required?: boolean;
  icon?: React.ReactNode;
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, label, error, helperText, required, icon, ...props }, ref) => (
    <div className="w-full">
      {label && (
        <label className="text-sm font-medium text-gray-700 mb-1 block">
          {label}
          {required && <span className="text-red-500">*</span>}
        </label>
      )}

      <div className="relative">
        {icon && <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">{icon}</div>}

        <input
          type={type}
          className={cn(
            'flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50',
            error && 'border-red-500 focus-visible:ring-red-500',
            icon && 'pl-10',
            className
          )}
          ref={ref}
          {...props}
        />
      </div>

      {error && <p className="text-red-500 text-xs mt-1">{error}</p>}
      {helperText && <p className="text-gray-500 text-xs mt-1">{helperText}</p>}
    </div>
  )
);

Input.displayName = 'Input';

export { Input };
