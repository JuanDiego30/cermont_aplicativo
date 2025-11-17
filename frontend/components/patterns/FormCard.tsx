// components/patterns/FormCard.tsx
import { ReactNode } from 'react';
import { LucideIcon } from 'lucide-react';

type FormCardProps = {
  title: string;
  description?: string;
  icon?: LucideIcon;
  children: ReactNode;
  footer?: ReactNode;
};

export function FormCard({ title, description, icon: Icon, children, footer }: FormCardProps) {
  return (
    <div className="overflow-hidden rounded-3xl border-2 border-neutral-200 bg-white shadow-xl dark:border-neutral-800 dark:bg-neutral-900">
      {/* Header */}
      <div className="border-b-2 border-neutral-200 bg-gradient-to-r from-neutral-50 to-white p-6 dark:border-neutral-800 dark:from-neutral-900 dark:to-neutral-900">
        <div className="flex items-center gap-3">
          {Icon && (
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary-50 dark:bg-primary-950">
              <Icon className="h-5 w-5 text-primary-600 dark:text-primary-400" />
            </div>
          )}
          <div>
            <h2 className="text-xl font-bold text-neutral-900 dark:text-neutral-50">{title}</h2>
            {description && (
              <p className="mt-1 text-sm text-neutral-600 dark:text-neutral-400">{description}</p>
            )}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="p-8">{children}</div>

      {/* Footer */}
      {footer && (
        <div className="border-t-2 border-neutral-200 bg-neutral-50 p-6 dark:border-neutral-800 dark:bg-neutral-800">
          {footer}
        </div>
      )}
    </div>
  );
}
