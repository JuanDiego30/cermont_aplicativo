// components/patterns/InfoBox.tsx
import { LucideIcon } from 'lucide-react';

type InfoBoxVariant = 'info' | 'warning' | 'success' | 'neutral';

type InfoBoxProps = {
  title?: string;
  children: React.ReactNode;
  icon: LucideIcon;
  variant?: InfoBoxVariant;
};

export function InfoBox({ title, children, icon: Icon, variant = 'info' }: InfoBoxProps) {
  const styles = {
    info: {
      container: 'border-info-200 bg-gradient-to-br from-info-50 to-info-100 dark:border-info-900 dark:from-info-950 dark:to-info-900',
      iconBg: 'bg-info-100 dark:bg-info-900',
      iconColor: 'text-info-600 dark:text-info-400',
      titleColor: 'text-info-900 dark:text-info-300',
      textColor: 'text-info-800 dark:text-info-400',
    },
    warning: {
      container: 'border-warning-200 bg-gradient-to-br from-warning-50 to-warning-100 dark:border-warning-900 dark:from-warning-950 dark:to-warning-900',
      iconBg: 'bg-warning-100 dark:bg-warning-900',
      iconColor: 'text-warning-600 dark:text-warning-400',
      titleColor: 'text-warning-900 dark:text-warning-300',
      textColor: 'text-warning-800 dark:text-warning-400',
    },
    success: {
      container: 'border-success-200 bg-gradient-to-br from-success-50 to-success-100 dark:border-success-900 dark:from-success-950 dark:to-success-900',
      iconBg: 'bg-success-100 dark:bg-success-900',
      iconColor: 'text-success-600 dark:text-success-400',
      titleColor: 'text-success-900 dark:text-success-300',
      textColor: 'text-success-800 dark:text-success-400',
    },
    neutral: {
      container: 'border-neutral-200 bg-neutral-50 dark:border-neutral-800 dark:bg-neutral-800',
      iconBg: 'bg-neutral-100 dark:bg-neutral-900',
      iconColor: 'text-neutral-600 dark:text-neutral-400',
      titleColor: 'text-neutral-900 dark:text-neutral-50',
      textColor: 'text-neutral-700 dark:text-neutral-300',
    },
  };

  const style = styles[variant];

  return (
    <div className={`rounded-2xl border-2 p-6 ${style.container}`}>
      <div className="flex gap-4">
        <div className={`flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl ${style.iconBg}`}>
          <Icon className={`h-6 w-6 ${style.iconColor}`} />
        </div>
        <div className="flex-1">
          {title && <h3 className={`mb-2 font-bold ${style.titleColor}`}>{title}</h3>}
          <div className={`text-sm leading-relaxed ${style.textColor}`}>{children}</div>
        </div>
      </div>
    </div>
  );
}
