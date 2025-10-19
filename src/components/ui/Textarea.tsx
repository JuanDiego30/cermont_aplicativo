import { cn } from '@/lib/cn';
import { forwardRef, type ForwardedRef, type TextareaHTMLAttributes } from 'react';
import '@/styles/components/forms.css';

interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
  helperText?: string;
}

/**
 * Componente Textarea reutilizable con soporte para labels y errores
 * Usa el sistema de estilos de forms.css
 */
const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ label, error, helperText, className, id, ...props }: TextareaProps, ref: ForwardedRef<HTMLTextAreaElement>) => {
    const textareaId = id || `textarea-${Math.random().toString(36).substr(2, 9)}`;
    
    return (
      <div className={cn('field', error && 'error', className)}>
        {label && (
          <label htmlFor={textareaId}>
            {label}
            {props.required && <span className="required"> *</span>}
          </label>
        )}
        <textarea
          id={textareaId}
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

Textarea.displayName = 'Textarea';

export default Textarea;
