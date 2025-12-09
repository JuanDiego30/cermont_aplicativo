'use client';

import { useState, useEffect, useCallback } from 'react';
import { getOfflineSyncManager, SyncEvent, SyncQueueItem } from '@/lib/offline-sync';

// ============================================
// HOOK: useOfflineSync
// ============================================

export interface UseOfflineSyncReturn {
  isOnline: boolean;
  isSyncing: boolean;
  pendingCount: number;
  syncQueue: SyncQueueItem[];
  lastSyncEvent: SyncEvent | null;
  
  // Acciones
  saveOffline: (collection: string, data: any) => Promise<void>;
  forceSync: () => Promise<void>;
  clearOfflineData: () => Promise<void>;
  
  // Datos offline
  getOfflineData: <T>(collection: string) => Promise<T[]>;
}

export function useOfflineSync(): UseOfflineSyncReturn {
  const [isOnline, setIsOnline] = useState(true);
  const [isSyncing, setIsSyncing] = useState(false);
  const [pendingCount, setPendingCount] = useState(0);
  const [syncQueue, setSyncQueue] = useState<SyncQueueItem[]>([]);
  const [lastSyncEvent, setLastSyncEvent] = useState<SyncEvent | null>(null);

  useEffect(() => {
    const manager = getOfflineSyncManager();
    
    // Estado inicial
    setIsOnline(manager.getConnectionStatus());
    
    // Cargar cola pendiente
    manager.getPendingSyncItems().then(items => {
      setPendingCount(items.length);
    });
    
    manager.getSyncQueue().then(queue => {
      setSyncQueue(queue);
    });

    // Suscribirse a eventos
    const unsubscribe = manager.subscribe((event) => {
      setLastSyncEvent(event);

      switch (event.type) {
        case 'online':
          setIsOnline(true);
          break;
        case 'offline':
          setIsOnline(false);
          break;
        case 'sync_start':
          setIsSyncing(true);
          break;
        case 'sync_complete':
          setIsSyncing(false);
          manager.getPendingSyncItems().then(items => {
            setPendingCount(items.length);
          });
          manager.getSyncQueue().then(queue => {
            setSyncQueue(queue);
          });
          break;
        case 'sync_error':
          setIsSyncing(false);
          break;
        case 'item_synced':
          manager.getPendingSyncItems().then(items => {
            setPendingCount(items.length);
          });
          break;
      }
    });

    return () => {
      unsubscribe();
    };
  }, []);

  const saveOffline = useCallback(async (collection: string, data: any) => {
    const manager = getOfflineSyncManager();
    
    switch (collection) {
      case 'ordenes':
        await manager.saveOrdenOffline(data);
        break;
      case 'formularios':
        await manager.saveFormularioOffline(data);
        break;
      case 'inspecciones':
        await manager.saveInspeccionOffline(data);
        break;
      default:
        console.warn(`Colección no soportada: ${collection}`);
    }

    // Actualizar contador
    const items = await manager.getPendingSyncItems();
    setPendingCount(items.length);
  }, []);

  const forceSync = useCallback(async () => {
    const manager = getOfflineSyncManager();
    await manager.startSync();
  }, []);

  const clearOfflineData = useCallback(async () => {
    const manager = getOfflineSyncManager();
    await manager.clearAllOfflineData();
    setPendingCount(0);
    setSyncQueue([]);
  }, []);

  const getOfflineData = useCallback(async <T,>(collection: string): Promise<T[]> => {
    const manager = getOfflineSyncManager();
    
    switch (collection) {
      case 'ordenes':
        const ordenes = await manager.getOrdenesOffline();
        return ordenes.map(o => o.data) as T[];
      case 'formularios':
        const formularios = await manager.getFormulariosOffline();
        return formularios.map(f => f.data) as T[];
      default:
        return [];
    }
  }, []);

  return {
    isOnline,
    isSyncing,
    pendingCount,
    syncQueue,
    lastSyncEvent,
    saveOffline,
    forceSync,
    clearOfflineData,
    getOfflineData,
  };
}

export default useOfflineSync;
