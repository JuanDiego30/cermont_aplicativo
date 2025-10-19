import { cn } from '@/lib/cn';
import { forwardRef, type ForwardedRef, type InputHTMLAttributes } from 'react';
import '@/styles/components/forms.css';

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helperText?: string;
}

/**
 * Componente Input reutilizable con soporte para labels y errores
 * Usa el sistema de estilos de forms.css
 */
const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, helperText, className, id, ...props }: InputProps, ref: ForwardedRef<HTMLInputElement>) => {
    const inputId = id || `input-${Math.random().toString(36).substr(2, 9)}`;
    
    return (
      <div className={cn('field', error && 'error', className)}>
        {label && (
          <label htmlFor={inputId}>
            {label}
            {props.required && <span className="required"> *</span>}
          </label>
        )}
        <input
          id={inputId}
          ref={ref}
          aria-invalid={error ? 'true' : 'false'}
          {...props}
        />
        {error && <small className="error-text" role="alert">{error}</small>}
        {helperText && !error && <small className="helper-text">{helperText}</small>}
      </div>
    );
  }
);

Input.displayName = 'Input';

export default Input;
