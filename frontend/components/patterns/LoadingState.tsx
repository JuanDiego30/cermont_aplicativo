// components/patterns/LoadingState.tsx
type LoadingStateProps = {
  message?: string;
  subMessage?: string;
};

export function LoadingState({ message = 'Cargando...', subMessage }: LoadingStateProps) {
  return (
    <div className="flex h-[70vh] items-center justify-center">
      <div className="space-y-4 text-center">
        <div className="relative mx-auto h-20 w-20">
          <div className="absolute inset-0 animate-spin rounded-full border-4 border-primary-200 border-t-primary-600 dark:border-primary-900 dark:border-t-primary-400"></div>
          <div className="absolute inset-2 animate-pulse rounded-full bg-gradient-to-br from-primary-50 to-primary-100 dark:from-primary-950 dark:to-primary-900"></div>
        </div>
        <p className="text-lg font-bold text-neutral-900 dark:text-neutral-50">{message}</p>
        {subMessage && (
          <p className="text-sm text-neutral-600 dark:text-neutral-400">{subMessage}</p>
        )}
      </div>
    </div>
  );
}
