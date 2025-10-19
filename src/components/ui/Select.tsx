import { cn } from '@/lib/cn';
import { forwardRef, type ForwardedRef, type SelectHTMLAttributes } from 'react';
import '@/styles/components/forms.css';

interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  error?: string;
  helperText?: string;
  options?: Array<{ value: string; label: string }>;
}

/**
 * Componente Select reutilizable con soporte para labels y errores
 * Usa el sistema de estilos de forms.css
 */
const Select = forwardRef<HTMLSelectElement, SelectProps>(
  ({ label, error, helperText, className, id, options, children, ...props }: SelectProps, ref: ForwardedRef<HTMLSelectElement>) => {
    const selectId = id || `select-${Math.random().toString(36).substr(2, 9)}`;
    
    return (
      <div className={cn('field', error && 'error', className)}>
        {label && (
          <label htmlFor={selectId}>
            {label}
            {props.required && <span className="required"> *</span>}
          </label>
        )}
        <select
          id={selectId}
          ref={ref}
          aria-invalid={error ? 'true' : 'false'}
          {...props}
        >
          {options ? (
            options.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))
          ) : (
            children
          )}
        </select>
        {error && <small className="error-text" role="alert">{error}</small>}
        {helperText && !error && <small className="helper-text">{helperText}</small>}
      </div>
    );
  }
);

Select.displayName = 'Select';

export default Select;
