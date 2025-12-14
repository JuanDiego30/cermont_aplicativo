/**
 * ARCHIVO: Select.tsx
 * FUNCION: Componente select/dropdown nativo con soporte para validación
 * IMPLEMENTACION: Usa forwardRef, renderiza opciones desde array, muestra errores
 * DEPENDENCIAS: react, @/lib/cn
 * EXPORTS: Select (named export)
 */
import { cn } from '@/lib/cn';
import { forwardRef } from 'react';

interface SelectOption {
  value: string;
  label: string;
}

interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  options: SelectOption[];
  error?: string;
}

export const Select = forwardRef<HTMLSelectElement, SelectProps>(
  ({ className, options, error, ...props }, ref) => {
    return (
      <div className="w-full">
        <select
          ref={ref}
          className={cn(
            'w-full px-3 py-2 rounded-lg border transition-colors',
            'focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent',
            'dark:bg-gray-800 dark:text-white',
            error
              ? 'border-red-500 focus:ring-red-500'
              : 'border-gray-300 dark:border-gray-600',
            className
          )}
          {...props}
        >
          {options.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
        {error && (
          <p className="mt-1 text-sm text-red-500">{error}</p>
        )}
      </div>
    );
  }
);

Select.displayName = 'Select';
