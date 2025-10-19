import { cn } from '@/lib/cn';
import type { ReactNode } from 'react';

interface CardProps {
  children: ReactNode;
  className?: string;
  title?: string;
  description?: string;
  footer?: ReactNode;
}

/**
 * Componente Card reutilizable para agrupar contenido
 */
export default function Card({ children, className, title, description, footer }: CardProps) {
  return (
    <div className={cn('rounded-lg border border-gray-200 bg-white shadow-sm', className)}>
      {(title || description) && (
        <div className="border-b border-gray-200 px-6 py-4">
          {title && <h3 className="text-lg font-semibold text-gray-900">{title}</h3>}
          {description && <p className="mt-1 text-sm text-gray-600">{description}</p>}
        </div>
      )}
      <div className="px-6 py-4">{children}</div>
      {footer && <div className="border-t border-gray-200 px-6 py-4">{footer}</div>}
    </div>
  );
}
