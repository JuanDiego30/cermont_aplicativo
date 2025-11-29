'use client';

import { AlertCircle } from 'lucide-react';

interface ErrorStateProps {
  title?: string;
  message: string;
  action?: {
    label: string;
    onClick: () => void;
  };
}

export function ErrorState({ title = 'Error', message, action }: ErrorStateProps) {
  return (
    <div className="flex flex-col items-center justify-center gap-4 p-8 text-center">
      <div className="flex h-12 w-12 items-center justify-center rounded-full bg-error-100 dark:bg-error-900/30">
        <AlertCircle className="h-6 w-6 text-error-600 dark:text-error-400" />
      </div>
      <div>
        <h3 className="text-lg font-semibold text-neutral-900 dark:text-neutral-50">{title}</h3>
        <p className="mt-1 text-sm text-neutral-600 dark:text-neutral-400">{message}</p>
      </div>
      {action && (
        <button
          onClick={action.onClick}
          className="rounded-lg bg-primary-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-primary-700"
        >
          {action.label}
        </button>
      )}
    </div>
  );
}
