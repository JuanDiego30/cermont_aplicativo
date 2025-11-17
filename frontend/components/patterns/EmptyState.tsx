// components/patterns/EmptyState.tsx
import { LucideIcon } from 'lucide-react';
import { Button } from '@/components/ui/Button';

type EmptyStateProps = {
  icon: LucideIcon;
  title: string;
  description: string;
  action?: {
    label: string;
    onClick: () => void;
    icon?: LucideIcon;
  };
};

export function EmptyState({ icon: Icon, title, description, action }: EmptyStateProps) {
  const ActionIcon = action?.icon;
  
  return (
    <div className="animate-slide-up rounded-3xl border-2 border-dashed border-neutral-300 bg-gradient-to-br from-neutral-50 to-white p-16 text-center dark:border-neutral-700 dark:from-neutral-900 dark:to-neutral-800">
      <div className="mx-auto mb-8 flex h-32 w-32 items-center justify-center rounded-full bg-gradient-to-br from-primary-100 to-primary-50 shadow-inner dark:from-primary-950 dark:to-primary-900">
        <Icon className="h-16 w-16 text-primary-600 dark:text-primary-400" />
      </div>
      <h3 className="mb-3 text-3xl font-bold text-neutral-900 dark:text-neutral-50">{title}</h3>
      <p className="mx-auto mb-8 max-w-lg text-lg text-neutral-600 dark:text-neutral-400">
        {description}
      </p>
      {action && (
        <Button variant="primary" onClick={action.onClick} className="group">
          {ActionIcon && <ActionIcon className="h-5 w-5 transition-transform group-hover:rotate-90" />}
          {action.label}
        </Button>
      )}
    </div>
  );
}
