'use client';

// ============================================
// OFFLINE INDICATOR - Cermont FSM
// Componente visual para estado offline/sync
// ============================================

import { useOffline } from '@/hooks/use-offline';
import { cn } from '@/lib/cn';

interface OfflineIndicatorProps {
  className?: string;
  position?: 'bottom-right' | 'bottom-left' | 'top-right' | 'top-left';
}

export function OfflineIndicator({ 
  className,
  position = 'bottom-right' 
}: OfflineIndicatorProps) {
  const { 
    isOnline, 
    isSyncing, 
    pendingItems, 
    syncError, 
    lastSync,
    progress,
    manualSync 
  } = useOffline();

  // No mostrar si todo está bien
  if (isOnline && pendingItems === 0 && !syncError) {
    return null;
  }

  const positionClasses = {
    'bottom-right': 'bottom-4 right-4',
    'bottom-left': 'bottom-4 left-4',
    'top-right': 'top-4 right-4',
    'top-left': 'top-4 left-4',
  };

  return (
    <div
      className={cn(
        'fixed z-50 p-4 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700',
        'rounded-lg shadow-lg max-w-xs transition-all duration-300',
        positionClasses[position],
        className
      )}
    >
      {/* Estado Offline */}
      {!isOnline && (
        <div className="mb-3 p-2 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-400 dark:border-yellow-600 rounded text-yellow-800 dark:text-yellow-200 text-sm flex items-center gap-2">
          <WifiOffIcon className="w-4 h-4 shrink-0" />
          <span>Modo offline. Los cambios se sincronizarán cuando estés conectado.</span>
        </div>
      )}

      {/* Items pendientes */}
      {pendingItems > 0 && (
        <div className="mb-3 p-2 bg-blue-50 dark:bg-blue-900/20 border border-blue-400 dark:border-blue-600 rounded text-blue-800 dark:text-blue-200 text-sm flex items-center gap-2">
          <CloudUploadIcon className="w-4 h-4 shrink-0" />
          <span>
            {pendingItems} cambio{pendingItems > 1 ? 's' : ''} pendiente{pendingItems > 1 ? 's' : ''}
          </span>
        </div>
      )}

      {/* Error de sincronización */}
      {syncError && (
        <div className="mb-3 p-2 bg-red-50 dark:bg-red-900/20 border border-red-400 dark:border-red-600 rounded text-red-800 dark:text-red-200 text-sm flex items-center gap-2">
          <AlertCircleIcon className="w-4 h-4 shrink-0" />
          <span>Error: {syncError}</span>
        </div>
      )}

      {/* Progreso de sincronización */}
      {isSyncing && progress && (
        <div className="mb-3">
          <div className="flex items-center justify-between text-sm text-gray-600 dark:text-gray-400 mb-1">
            <span>Sincronizando...</span>
            <span>{progress.current}/{progress.total}</span>
          </div>
          <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
            <div
              className="bg-blue-600 h-2 rounded-full transition-all duration-300"
              style={{ width: `${(progress.current / progress.total) * 100}%` }}
            />
          </div>
        </div>
      )}

      {/* Acciones */}
      <div className="flex items-center gap-2">
        {pendingItems > 0 && !isSyncing && isOnline && (
          <button
            onClick={() => manualSync()}
            className="px-3 py-1.5 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-md transition-colors"
          >
            Sincronizar Ahora
          </button>
        )}

        {isSyncing && (
          <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
            <SpinnerIcon className="w-4 h-4 animate-spin" />
            <span>Sincronizando...</span>
          </div>
        )}

        {lastSync && !isSyncing && (
          <span className="text-xs text-gray-500 dark:text-gray-400">
            Última sync: {formatRelativeTime(lastSync)}
          </span>
        )}
      </div>
    </div>
  );
}

// ============================================
// HELPER FUNCTIONS
// ============================================

function formatRelativeTime(date: Date): string {
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);

  if (diffMins < 1) return 'hace un momento';
  if (diffMins < 60) return `hace ${diffMins} min`;
  
  const diffHours = Math.floor(diffMins / 60);
  if (diffHours < 24) return `hace ${diffHours}h`;
  
  return date.toLocaleDateString();
}

// ============================================
// ICONS
// ============================================

function WifiOffIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 5.636a9 9 0 010 12.728m0 0l-2.829-2.829m2.829 2.829L21 21M15.536 8.464a5 5 0 010 7.072m0 0l-2.829-2.829m-4.243 2.829a4.978 4.978 0 01-1.414-2.83m-1.414 5.658a9 9 0 01-2.167-9.238m7.824 2.167a1 1 0 111.414 1.414m-1.414-1.414L3 3m8.293 8.293l1.414 1.414" />
    </svg>
  );
}

function CloudUploadIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
    </svg>
  );
}

function AlertCircleIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  );
}

function SpinnerIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24">
      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
    </svg>
  );
}

export default OfflineIndicator;
