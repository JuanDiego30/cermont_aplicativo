'use client';

import { useState, useEffect, useCallback } from 'react';
import { useOnlineStatus } from '@/core/offline/useOnlineStatus';
import { syncService } from '@/core/offline/sync-service';
import { Wifi, WifiOff, RefreshCw, Check, AlertCircle, X } from 'lucide-react';

type SyncStatus = 'idle' | 'syncing' | 'success' | 'error';

export function OfflineIndicator() {
  const { isOnline, wasOffline, resetWasOffline } = useOnlineStatus();
  const [visible, setVisible] = useState(false);
  const [syncStatus, setSyncStatus] = useState<SyncStatus>('idle');
  const [pendingCount, setPendingCount] = useState(0);
  const [showBanner, setShowBanner] = useState(false);

  // Check pending actions count
  const checkPendingActions = useCallback(async () => {
    try {
      const actions = await syncService.getPendingActions();
      setPendingCount(actions.length);
    } catch (error) {
      console.error('Error checking pending actions:', error);
    }
  }, []);

  // Sync handler
  const handleSync = useCallback(async () => {
    if (!isOnline || syncStatus === 'syncing') return;

    setSyncStatus('syncing');
    try {
      await syncService.syncPendingActions();
      setSyncStatus('success');
      await checkPendingActions();
      
      // Reset to idle after 3 seconds
      setTimeout(() => setSyncStatus('idle'), 3000);
    } catch (error) {
      console.error('Sync failed:', error);
      setSyncStatus('error');
      setTimeout(() => setSyncStatus('idle'), 5000);
    }
  }, [isOnline, syncStatus, checkPendingActions]);

  // Show/hide indicator based on status
  useEffect(() => {
    if (!isOnline) {
      setVisible(true);
      setShowBanner(true);
    } else if (wasOffline) {
      setVisible(true);
      setShowBanner(true);
      // Auto-sync when coming back online
      handleSync();
      // Hide after 5 seconds if successfully synced
      const timer = setTimeout(() => {
        if (syncStatus !== 'syncing') {
          setShowBanner(false);
          resetWasOffline();
        }
      }, 5000);
      return () => clearTimeout(timer);
    } else if (pendingCount > 0) {
      setVisible(true);
    } else {
      setVisible(false);
    }
  }, [isOnline, wasOffline, pendingCount, handleSync, syncStatus, resetWasOffline]);

  // Check pending actions periodically
  useEffect(() => {
    checkPendingActions();
    const interval = setInterval(checkPendingActions, 30000);
    return () => clearInterval(interval);
  }, [checkPendingActions]);

  // Listen for SW sync events
  useEffect(() => {
    const handleSyncRequired = () => {
      if (isOnline) {
        handleSync();
      }
    };

    window.addEventListener('sw-sync-required', handleSyncRequired);
    window.addEventListener('connection-restored', handleSync);

    return () => {
      window.removeEventListener('sw-sync-required', handleSyncRequired);
      window.removeEventListener('connection-restored', handleSync);
    };
  }, [isOnline, handleSync]);

  if (!visible && !showBanner) return null;

  const getStatusConfig = () => {
    if (!isOnline) {
      return {
        bgColor: 'bg-red-500 dark:bg-red-600',
        icon: <WifiOff className="w-4 h-4" />,
        text: 'Sin conexión',
        subtext: pendingCount > 0 ? `${pendingCount} cambios pendientes` : 'Los cambios se guardan localmente',
      };
    }

    if (syncStatus === 'syncing') {
      return {
        bgColor: 'bg-blue-500 dark:bg-blue-600',
        icon: <RefreshCw className="w-4 h-4 animate-spin" />,
        text: 'Sincronizando...',
        subtext: `Enviando ${pendingCount} cambios`,
      };
    }

    if (syncStatus === 'success') {
      return {
        bgColor: 'bg-green-500 dark:bg-green-600',
        icon: <Check className="w-4 h-4" />,
        text: 'Sincronizado',
        subtext: 'Todos los cambios guardados',
      };
    }

    if (syncStatus === 'error') {
      return {
        bgColor: 'bg-orange-500 dark:bg-orange-600',
        icon: <AlertCircle className="w-4 h-4" />,
        text: 'Error de sincronización',
        subtext: 'Se reintentará automáticamente',
      };
    }

    if (wasOffline && isOnline) {
      return {
        bgColor: 'bg-green-500 dark:bg-green-600',
        icon: <Wifi className="w-4 h-4" />,
        text: 'Conexión restaurada',
        subtext: pendingCount > 0 ? `Sincronizando ${pendingCount} cambios...` : 'Todo actualizado',
      };
    }

    if (pendingCount > 0) {
      return {
        bgColor: 'bg-yellow-500 dark:bg-yellow-600',
        icon: <AlertCircle className="w-4 h-4" />,
        text: 'Cambios pendientes',
        subtext: `${pendingCount} sin sincronizar`,
      };
    }

    return {
      bgColor: 'bg-green-500 dark:bg-green-600',
      icon: <Wifi className="w-4 h-4" />,
      text: 'En línea',
      subtext: 'Todo sincronizado',
    };
  };

  const config = getStatusConfig();

  return (
    <>
      {/* Full banner for offline/coming back online */}
      {showBanner && (
        <div
          className={`fixed top-0 left-0 right-0 z-[100] ${config.bgColor} text-white py-2 px-4 shadow-lg transition-all duration-300`}
        >
          <div className="max-w-7xl mx-auto flex items-center justify-between">
            <div className="flex items-center gap-3">
              {config.icon}
              <div>
                <span className="font-medium">{config.text}</span>
                <span className="hidden sm:inline text-white/80 ml-2">
                  — {config.subtext}
                </span>
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              {isOnline && pendingCount > 0 && syncStatus !== 'syncing' && (
                <button
                  onClick={handleSync}
                  className="px-3 py-1 bg-white/20 hover:bg-white/30 rounded-lg text-sm font-medium transition-colors flex items-center gap-2"
                >
                  <RefreshCw className="w-3 h-3" />
                  Sincronizar
                </button>
              )}
              
              {isOnline && (
                <button
                  onClick={() => {
                    setShowBanner(false);
                    resetWasOffline();
                  }}
                  className="p-1 hover:bg-white/20 rounded-lg transition-colors"
                  aria-label="Cerrar"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Floating indicator (always visible when offline or pending) */}
      {!showBanner && visible && (
        <div
          className={`fixed bottom-4 right-4 z-50 ${config.bgColor} text-white px-4 py-3 rounded-xl shadow-lg transition-all duration-300 flex items-center gap-3`}
        >
          {config.icon}
          <div>
            <p className="font-medium text-sm">{config.text}</p>
            <p className="text-xs text-white/80">{config.subtext}</p>
          </div>
          
          {isOnline && pendingCount > 0 && syncStatus !== 'syncing' && (
            <button
              onClick={handleSync}
              className="ml-2 p-2 bg-white/20 hover:bg-white/30 rounded-lg transition-colors"
              title="Sincronizar ahora"
            >
              <RefreshCw className="w-4 h-4" />
            </button>
          )}
        </div>
      )}
    </>
  );
}

export default OfflineIndicator;
