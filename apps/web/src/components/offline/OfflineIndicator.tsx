'use client';

// ============================================
// OFFLINE INDICATOR - Cermont FSM
// Componente visual para estado offline/sync
// Versión compacta para móvil, expandida en desktop
// ============================================

import { useState } from 'react';
import { useOffline } from '@/hooks/use-offline';
import { cn } from '@/lib/cn';
import { Wifi, WifiOff, RefreshCw, AlertCircle, ChevronUp, ChevronDown } from 'lucide-react';

interface OfflineIndicatorProps {
  className?: string;
}

export function OfflineIndicator({ className }: OfflineIndicatorProps) {
  const {
    isOnline,
    isSyncing,
    pendingItems,
    syncError,
    lastSync,
    progress,
    manualSync
  } = useOffline();

  const [isExpanded, setIsExpanded] = useState(false);

  // ============================================
  // MOBILE VIEW - Compact icon only
  // ============================================
  const MobileIndicator = () => (
    <button
      onClick={() => setIsExpanded(!isExpanded)}
      className={cn(
        'fixed top-20 right-4 z-50 md:hidden',
        'flex items-center justify-center',
        'w-10 h-10 rounded-full shadow-lg',
        'transition-all duration-300 ease-out',
        'active:scale-95',
        // Background color based on status
        isOnline && !syncError
          ? 'bg-emerald-500 hover:bg-emerald-600'
          : syncError
            ? 'bg-red-500 hover:bg-red-600'
            : 'bg-amber-500 hover:bg-amber-600',
        className
      )}
    >
      {/* Icon */}
      {isSyncing ? (
        <RefreshCw className="w-5 h-5 text-white animate-spin" />
      ) : isOnline ? (
        <Wifi className="w-5 h-5 text-white" />
      ) : (
        <WifiOff className="w-5 h-5 text-white" />
      )}

      {/* Pending items badge */}
      {pendingItems > 0 && (
        <span className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-blue-600 text-[10px] font-bold text-white ring-2 ring-white">
          {pendingItems > 9 ? '9+' : pendingItems}
        </span>
      )}

      {/* Error indicator */}
      {syncError && (
        <span className="absolute -bottom-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-white">
          <AlertCircle className="w-3 h-3 text-red-500" />
        </span>
      )}
    </button>
  );

  // ============================================
  // MOBILE EXPANDED PANEL
  // ============================================
  const MobileExpandedPanel = () => (
    <div
      className={cn(
        'fixed top-32 right-4 z-50 md:hidden',
        'w-64 p-4 rounded-xl shadow-xl',
        'bg-white dark:bg-gray-800',
        'border border-gray-200 dark:border-gray-700',
        'transform transition-all duration-300',
        isExpanded
          ? 'opacity-100 translate-y-0'
          : 'opacity-0 -translate-y-4 pointer-events-none'
      )}
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          {isOnline ? (
            <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          ) : (
            <div className="w-2 h-2 rounded-full bg-amber-500" />
          )}
          <span className="text-sm font-medium text-gray-900 dark:text-white">
            {isOnline ? 'Conectado' : 'Sin conexión'}
          </span>
        </div>
        <button
          onClick={() => setIsExpanded(false)}
          className="p-1 rounded hover:bg-gray-100 dark:hover:bg-gray-700"
        >
          <ChevronUp className="w-4 h-4 text-gray-500" />
        </button>
      </div>

      {/* Pending items */}
      {pendingItems > 0 && (
        <div className="text-xs text-gray-500 dark:text-gray-400 mb-3">
          {pendingItems} cambio{pendingItems > 1 ? 's' : ''} pendiente{pendingItems > 1 ? 's' : ''}
        </div>
      )}

      {/* Sync error */}
      {syncError && (
        <div className="flex items-center gap-2 p-2 mb-3 text-xs text-red-600 bg-red-50 dark:bg-red-900/20 rounded-lg">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span className="truncate">{syncError}</span>
        </div>
      )}

      {/* Sync progress */}
      {isSyncing && progress && (
        <div className="mb-3">
          <div className="flex justify-between text-xs text-gray-500 mb-1">
            <span>Sincronizando...</span>
            <span>{progress.current}/{progress.total}</span>
          </div>
          <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-1.5">
            <div
              className="bg-blue-600 h-1.5 rounded-full transition-all duration-300"
              style={{ width: `${(progress.current / progress.total) * 100}%` }}
            />
          </div>
        </div>
      )}

      {/* Last sync */}
      {lastSync && (
        <div className="text-xs text-gray-400">
          Última sync: {formatRelativeTime(lastSync)}
        </div>
      )}

      {/* Sync button */}
      {pendingItems > 0 && !isSyncing && isOnline && (
        <button
          onClick={() => manualSync()}
          className="w-full mt-3 px-3 py-2 text-xs font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors flex items-center justify-center gap-2"
        >
          <RefreshCw className="w-3 h-3" />
          Sincronizar ahora
        </button>
      )}
    </div>
  );

  // ============================================
  // DESKTOP VIEW - Full indicator
  // ============================================
  const DesktopIndicator = () => (
    <div
      className={cn(
        'fixed bottom-24 right-4 z-40 hidden md:block',
        'p-4 bg-white dark:bg-gray-800',
        'border border-gray-200 dark:border-gray-700',
        'rounded-lg shadow-lg max-w-xs transition-all duration-300',
        className
      )}
    >
      {/* Online status - Removed as per user request (redundant with header icon) */}
      {/* {isOnline && !syncError && (
        <div className="mb-3 p-2 bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-400 dark:border-emerald-600 rounded text-emerald-800 dark:text-emerald-200 text-sm flex items-center gap-2">
          <Wifi className="w-4 h-4 shrink-0" />
          <span>Conectado (Online)</span>
        </div>
      )} */ }

      {/* Offline status */}
      {!isOnline && (
        <div className="mb-3 p-2 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-400 dark:border-yellow-600 rounded text-yellow-800 dark:text-yellow-200 text-sm flex items-center gap-2">
          <WifiOff className="w-4 h-4 shrink-0" />
          <span>Modo offline. Los cambios se sincronizarán cuando estés conectado.</span>
        </div>
      )}

      {/* Pending items */}
      {pendingItems > 0 && (
        <div className="mb-3 p-2 bg-blue-50 dark:bg-blue-900/20 border border-blue-400 dark:border-blue-600 rounded text-blue-800 dark:text-blue-200 text-sm flex items-center gap-2">
          <RefreshCw className="w-4 h-4 shrink-0" />
          <span>
            {pendingItems} cambio{pendingItems > 1 ? 's' : ''} pendiente{pendingItems > 1 ? 's' : ''}
          </span>
        </div>
      )}

      {/* Sync error */}
      {syncError && (
        <div className="mb-3 p-2 bg-red-50 dark:bg-red-900/20 border border-red-400 dark:border-red-600 rounded text-red-800 dark:text-red-200 text-sm flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>Error: {syncError}</span>
        </div>
      )}

      {/* Sync progress */}
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

      {/* Actions */}
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
            <RefreshCw className="w-4 h-4 animate-spin" />
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

  return (
    <>
      <MobileIndicator />
      <MobileExpandedPanel />
      <DesktopIndicator />
    </>
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

export default OfflineIndicator;
