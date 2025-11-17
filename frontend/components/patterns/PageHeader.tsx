// components/patterns/PageHeader.tsx
import { LucideIcon } from 'lucide-react';

type PageHeaderProps = {
  icon: LucideIcon;
  title: string;
  description: string;
  badge?: {
    text: string;
    variant?: 'primary' | 'secondary' | 'success' | 'warning' | 'error';
  };
  action?: React.ReactNode;
};

export function PageHeader({ icon: Icon, title, description, badge, action }: PageHeaderProps) {
  return (
    <div className="rounded-3xl border-2 border-neutral-200 bg-white p-8 shadow-xl dark:border-neutral-800 dark:bg-neutral-900">
      <div className="flex flex-col gap-6 md:flex-row md:items-start md:justify-between">
        <div className="flex items-start gap-4">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-primary-50 to-primary-100 shadow-lg dark:from-primary-950 dark:to-primary-900">
            <Icon className="h-7 w-7 text-primary-600 dark:text-primary-400" />
          </div>
          <div>
            <div className="mb-2 flex items-center gap-3">
              <h1 className="text-3xl font-bold text-neutral-900 dark:text-neutral-50">{title}</h1>
              {badge && (
                <span className={`rounded-lg px-3 py-1 text-xs font-bold ${getBadgeStyles(badge.variant)}`}>
                  {badge.text}
                </span>
              )}
            </div>
            <p className="text-neutral-600 dark:text-neutral-400">{description}</p>
          </div>
        </div>
        {action && <div className="flex-shrink-0">{action}</div>}
      </div>
    </div>
  );
}

function getBadgeStyles(variant?: string) {
  const styles = {
    primary: 'bg-primary-100 text-primary-700 dark:bg-primary-950 dark:text-primary-300',
    secondary: 'bg-secondary-100 text-secondary-700 dark:bg-secondary-950 dark:text-secondary-300',
    success: 'bg-success-100 text-success-700 dark:bg-success-950 dark:text-success-300',
    warning: 'bg-warning-100 text-warning-700 dark:bg-warning-950 dark:text-warning-300',
    error: 'bg-error-100 text-error-700 dark:bg-error-950 dark:text-error-300',
  };
  return styles[variant as keyof typeof styles] || styles.primary;
}
