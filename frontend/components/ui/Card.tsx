// components/ui/Card.tsx
import type { HTMLAttributes, ReactNode } from 'react';
import { cn } from '@/lib/utils/cn';

type CardProps = {
  children: ReactNode;
  className?: string;
  title?: string;
  subtitle?: string;
  footer?: ReactNode;
} & HTMLAttributes<HTMLElement>;

/**
 * Componente Card flexible con header, body y footer opcionales
 * Soporta dark mode y tiene estilos consistentes del sistema Cermont
 */
export function Card({ children, className, title, subtitle, footer, ...props }: CardProps) {
  return (
    <section
      className={cn(
        'overflow-hidden rounded-xl border bg-white shadow-sm transition-all duration-200',
        'border-neutral-200 dark:border-neutral-800 dark:bg-neutral-900',
        'hover:shadow-md',
        className
      )}
      {...props}
    >
      {/* Header */}
      {title && (
        <header className="border-b border-neutral-200 px-6 py-4 dark:border-neutral-800">
          <h3 className="text-lg font-semibold text-neutral-900 dark:text-neutral-50">{title}</h3>
          {subtitle && (
            <p className="mt-1 text-sm text-neutral-600 dark:text-neutral-400">{subtitle}</p>
          )}
        </header>
      )}

      {/* Body */}
      <div className="p-6">{children}</div>

      {/* Footer */}
      {footer && (
        <footer className="border-t border-neutral-200 bg-neutral-50 px-6 py-4 dark:border-neutral-800 dark:bg-neutral-950">
          {footer}
        </footer>
      )}
    </section>
  );
}



