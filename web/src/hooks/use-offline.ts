'use client';

// ============================================
// USE OFFLINE HOOK - Cermont FSM
// Hook para gestión de estado offline
// ============================================

import { useEffect, useState, useCallback } from 'react';
import { offlineDb, syncManager, type SyncEvent, type SyncStatus } from '@/lib/offline';

export interface UseOfflineReturn {
  /** Si el dispositivo está conectado a internet */
  isOnline: boolean;
  /** Si hay una sincronización en progreso */
  isSyncing: boolean;
  /** Número de items pendientes de sincronizar */
  pendingItems: number;
  /** Estado actual de la sincronización */
  syncStatus: SyncStatus;
  /** Error de la última sincronización (si hay) */
  syncError: string | null;
  /** Última fecha de sincronización exitosa */
  lastSync: Date | null;
  /** Progreso de sincronización actual */
  progress: { current: number; total: number } | null;
  /** Función para encolar una acción */
  queueAction: (action: {
    endpoint: string;
    method: 'POST' | 'PUT' | 'PATCH' | 'DELETE';
    payload?: unknown;
  }) => Promise<Response | null>;
  /** Forzar sincronización manual */
  manualSync: () => Promise<void>;
  /** Acceso directo a la base de datos offline */
  db: typeof offlineDb;
}

export function useOffline(): UseOfflineReturn {
  const [isOnline, setIsOnline] = useState(true);
  const [isSyncing, setIsSyncing] = useState(false);
  const [pendingItems, setPendingItems] = useState(0);
  const [syncStatus, setSyncStatus] = useState<SyncStatus>('idle');
  const [syncError, setSyncError] = useState<string | null>(null);
  const [lastSync, setLastSync] = useState<Date | null>(null);
  const [progress, setProgress] = useState<{ current: number; total: number } | null>(null);

  useEffect(() => {
    // Inicializar IndexedDB
    offlineDb.init().catch((error) => {
      console.error('[useOffline] Error inicializando DB:', error);
    });

    // Suscribirse a eventos de sync
    const unsubscribe = syncManager.subscribe((event: SyncEvent) => {
      setIsSyncing(event.status === 'syncing');
      setPendingItems(event.pendingItems);
      setSyncStatus(event.status);
      setSyncError(event.error || null);
      setLastSync(event.lastSync || null);
      setProgress(event.progress || null);
    });

    // Detectar estado de conectividad inicial
    if (typeof window !== 'undefined') {
      setIsOnline(navigator.onLine);

      const handleOnline = () => setIsOnline(true);
      const handleOffline = () => setIsOnline(false);

      window.addEventListener('online', handleOnline);
      window.addEventListener('offline', handleOffline);

      // Iniciar sync automático si estamos online
      if (navigator.onLine) {
        syncManager.startAutoSync();
      }

      return () => {
        unsubscribe();
        window.removeEventListener('online', handleOnline);
        window.removeEventListener('offline', handleOffline);
      };
    }

    return unsubscribe;
  }, []);

  const queueAction = useCallback(
    async (action: {
      endpoint: string;
      method: 'POST' | 'PUT' | 'PATCH' | 'DELETE';
      payload?: unknown;
    }): Promise<Response | null> => {
      try {
        return await syncManager.queueAction(action);
      } catch (error) {
        console.error('[useOffline] Error encolando acción:', error);
        throw error;
      }
    },
    []
  );

  const manualSync = useCallback(async (): Promise<void> => {
    await syncManager.sync();
  }, []);

  return {
    isOnline,
    isSyncing,
    pendingItems,
    syncStatus,
    syncError,
    lastSync,
    progress,
    queueAction,
    manualSync,
    db: offlineDb,
  };
}

export default useOffline;
