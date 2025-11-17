// components/patterns/ErrorState.tsx
import { AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/Button';

type ErrorStateProps = {
  title?: string;
  message: string;
  action?: {
    label: string;
    onClick: () => void;
  };
};

export function ErrorState({
  title = 'Error',
  message,
  action,
}: ErrorStateProps) {
  return (
    <div className="flex h-[70vh] items-center justify-center">
      <div className="max-w-md animate-slide-up rounded-3xl border-2 border-error-200 bg-gradient-to-br from-error-50 to-error-100 p-10 text-center shadow-2xl dark:border-error-900 dark:from-error-950 dark:to-error-900">
        <div className="mb-6 flex justify-center">
          <div className="flex h-20 w-20 items-center justify-center rounded-full bg-error-100 shadow-inner dark:bg-error-900">
            <AlertTriangle className="h-10 w-10 text-error-600 dark:text-error-400" />
          </div>
        </div>
        <h3 className="mb-3 text-2xl font-bold text-error-900 dark:text-error-300">{title}</h3>
        <p className="mb-6 text-error-700 dark:text-error-400">{message}</p>
        {action && (
          <Button variant="primary" onClick={action.onClick}>
            {action.label}
          </Button>
        )}
      </div>
    </div>
  );
}
