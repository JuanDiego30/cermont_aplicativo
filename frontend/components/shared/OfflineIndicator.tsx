'use client';

import { useOnlineStatus } from '@/lib/hooks/useOnlineStatus';
import { syncService } from '@/lib/offline/sync-service';
import { useEffect, useState } from 'react';

export function OfflineIndicator() {
  const { isOnline, isOffline } = useOnlineStatus();
  const [pendingCount, setPendingCount] = useState(0);
  const [isSyncing, setIsSyncing] = useState(false);

  useEffect(() => {
    const updatePendingCount = async () => {
      const actions = await syncService.getPendingActions();
      setPendingCount(actions.length);
    };

    updatePendingCount();
    const interval = setInterval(updatePendingCount, 5000);

    return () => clearInterval(interval);
  }, []);

  const handleSync = async () => {
    setIsSyncing(true);
    await syncService.syncPendingActions();
    setIsSyncing(false);
  };

  if (isOnline && pendingCount === 0) {
    return null;
  }

  return (
    <div
      className={`fixed bottom-4 right-4 z-50 rounded-lg border px-4 py-2 shadow-lg ${
        isOffline
          ? 'border-warning-300 bg-warning-50 text-warning-800 dark:border-warning-700 dark:bg-warning-900/20 dark:text-warning-300'
          : 'border-info-300 bg-info-50 text-info-800 dark:border-info-700 dark:bg-info-900/20 dark:text-info-300'
      }`}
    >
      <div className="flex items-center gap-3">
        {isOffline ? (
          <>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-6 w-6"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M18.364 5.636a9 9 0 010 12.728m0 0l-2.829-2.829m2.829 2.829L21 21M15.536 8.464a5 5 0 010 7.072m0 0l-2.829-2.829m-4.243 2.829a4.978 4.978 0 01-1.414-2.83m-1.414 5.658a9 9 0 01-2.167-9.238m7.824 2.167a1 1 0 111.414 1.414m-1.414-1.414L3 3"
              />
            </svg>
            <div>
              <p className="text-sm font-semibold">Modo Offline</p>
              <p className="text-xs">Los cambios se sincronizarán automáticamente</p>
            </div>
          </>
        ) : (
          <>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className={`h-6 w-6 ${isSyncing ? 'animate-spin' : ''}`}
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
              />
            </svg>
            <div>
              <p className="text-sm font-semibold">
                {pendingCount} {pendingCount === 1 ? 'cambio pendiente' : 'cambios pendientes'}
              </p>
              <button
                onClick={handleSync}
                disabled={isSyncing}
                className="text-xs font-medium underline hover:no-underline disabled:opacity-50"
              >
                {isSyncing ? 'Sincronizando...' : 'Sincronizar ahora'}
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
