// components/patterns/ErrorAlert.tsx
import { AlertCircle } from 'lucide-react';

type ErrorAlertProps = {
  title?: string;
  message: string;
  onDismiss?: () => void;
};

export function ErrorAlert({ title = 'Error', message, onDismiss }: ErrorAlertProps) {
  return (
    <div className="animate-slide-up rounded-3xl border-2 border-error-200 bg-gradient-to-br from-error-50 to-error-100 p-6 shadow-xl dark:border-error-900 dark:from-error-950 dark:to-error-900">
      <div className="flex items-start gap-4">
        <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-xl bg-error-100 dark:bg-error-900">
          <AlertCircle className="h-6 w-6 text-error-600 dark:text-error-400" />
        </div>
        <div className="flex-1">
          <h4 className="mb-1 font-bold text-error-900 dark:text-error-300">{title}</h4>
          <p className="text-sm font-medium text-error-800 dark:text-error-400">{message}</p>
        </div>
        {onDismiss && (
          <button
            onClick={onDismiss}
            className="flex-shrink-0 text-error-600 transition-colors hover:text-error-700 dark:text-error-400"
          >
            ✕
          </button>
        )}
      </div>
    </div>
  );
}
