import { SelectHTMLAttributes, forwardRef } from 'react';
import { cn } from '@/lib/utils/cn';

export interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  error?: string;
  helperText?: string;
  options: readonly { value: string; label: string }[] | { value: string; label: string }[]; // ? Acepta readonly
}

export const Select = forwardRef<HTMLSelectElement, SelectProps>(
  (
    {
      className,
      label,
      error,
      helperText,
      options,
      required,
      id,
      name,
      ...props
    },
    ref,
  ) => {
    const selectId = id || name;
    const errorId = selectId ? `${selectId}-error` : undefined;
    const helperId = selectId ? `${selectId}-helper` : undefined;

    return (
      <div className="w-full">
        {label && (
          <label
            htmlFor={selectId}
            className="mb-1 block text-sm font-medium text-neutral-700 dark:text-neutral-100"
          >
            {label}
            {required && (
              <span className="ml-1 text-danger-500" aria-hidden="true">
                *
              </span>
            )}
          </label>
        )}

        <select
          id={selectId}
          ref={ref}
          className={cn(
            'w-full rounded-lg border bg-white px-3 py-2 text-neutral-900 transition-colors dark:border-neutral-700 dark:bg-neutral-900 dark:text-neutral-50',
            'appearance-none',
            'focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent',
            'disabled:bg-neutral-100 disabled:cursor-not-allowed dark:disabled:bg-neutral-800',
            error
              ? 'border-danger-500 focus:ring-danger-500'
              : 'border-neutral-300 hover:border-neutral-400',
            className,
          )}
          aria-invalid={Boolean(error)}
          aria-describedby={
            error ? errorId : helperText ? helperId : undefined
          }
          required={required}
          {...props}
        >
          {options.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>

        {error && (
          <p
            id={errorId}
            className="mt-1 text-sm text-danger-600 dark:text-danger-300"
          >
            {error}
          </p>
        )}

        {!error && helperText && (
          <p
            id={helperId}
            className="mt-1 text-sm text-neutral-500 dark:text-neutral-400"
          >
            {helperText}
          </p>
        )}
      </div>
    );
  },
);

Select.displayName = 'Select';
