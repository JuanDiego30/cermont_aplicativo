'use client';
import { AlertCircle, RefreshCw } from 'lucide-react';

interface ApiErrorBoundaryProps {
  children?: React.ReactNode;
  error?: { code?: string; message?: string } | null;
  isError?: boolean;
  onRetry?: () => void;
}

export function ApiErrorBoundary({ children, error, isError, onRetry }: ApiErrorBoundaryProps) {
  if (!isError && children) { return <>{children}</>; }
  if (!isError) { return null; }
  return (
    <div className="flex flex-col items-center justify-center gap-3 rounded-lg border border-brand-error/20 bg-danger-bg p-6 text-center">
      <AlertCircle className="size-8 text-brand-error" aria-hidden="true" />
      <div>
        <p className="text-sm font-medium text-brand-error">{error?.message || 'Error al cargar los datos'}</p>
        {error?.code && <p className="mt-0.5 text-xs text-brand-error/70 font-mono">Código: {error.code}</p>}
      </div>
      {onRetry && (
        <button type="button" onClick={onRetry} className="inline-flex items-center gap-1.5 rounded-lg bg-brand-error/10 px-3 py-1.5 text-xs font-medium text-brand-error hover:bg-brand-error/20 transition-colors">
          <RefreshCw className="size-3.5" /> Reintentar
        </button>
      )}
    </div>
  );
}
