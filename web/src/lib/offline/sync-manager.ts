// ============================================
// SYNC MANAGER - Cermont FSM
// Gestión de sincronización offline/online
// ============================================

import { offlineDb, type SyncQueueItem } from './db';
import { SW_CONFIG } from './sw-config';

export type SyncStatus = 'idle' | 'syncing' | 'synced' | 'error' | 'offline';

export interface SyncEvent {
  status: SyncStatus;
  pendingItems: number;
  lastSync?: Date;
  error?: string;
  progress?: {
    current: number;
    total: number;
  };
}

type SyncListener = (event: SyncEvent) => void;

class SyncManager {
  private isOnline = typeof navigator !== 'undefined' ? navigator.onLine : true;
  private isSyncing = false;
  private syncInterval: ReturnType<typeof setInterval> | null = null;
  private listeners: Set<SyncListener> = new Set();
  private lastSyncTime: Date | null = null;
  private apiBaseUrl: string;

  constructor() {
    this.apiBaseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

    if (typeof window !== 'undefined') {
      // Detectar cambios de conectividad
      window.addEventListener('online', () => this.handleOnline());
      window.addEventListener('offline', () => this.handleOffline());

      // Inicializar
      this.isOnline = navigator.onLine;
    }
  }

  /**
   * Manejar conexión online
   */
  private handleOnline(): void {
    console.log('[SyncManager] Conectado a internet');
    this.isOnline = true;
    this.notify({ status: 'idle', pendingItems: 0 });
    
    // Sincronizar inmediatamente al reconectar
    this.sync();
    this.startAutoSync();
  }

  /**
   * Manejar desconexión
   */
  private handleOffline(): void {
    console.log('[SyncManager] Sin conexión a internet');
    this.isOnline = false;
    this.stopAutoSync();
    this.notify({ status: 'offline', pendingItems: 0 });
  }

  /**
   * Suscribirse a eventos de sincronización
   */
  subscribe(callback: SyncListener): () => void {
    this.listeners.add(callback);

    // Enviar estado actual inmediatamente
    this.getStatus().then((event) => callback(event));

    return () => {
      this.listeners.delete(callback);
    };
  }

  /**
   * Notificar a todos los listeners
   */
  private notify(event: SyncEvent): void {
    this.listeners.forEach((callback) => {
      try {
        callback(event);
      } catch (error) {
        console.error('[SyncManager] Error en listener:', error);
      }
    });
  }

  /**
   * Obtener estado actual
   */
  async getStatus(): Promise<SyncEvent> {
    const pendingItems = await offlineDb.countSyncQueue();
    
    return {
      status: this.isSyncing ? 'syncing' : (this.isOnline ? 'idle' : 'offline'),
      pendingItems,
      lastSync: this.lastSyncTime || undefined,
    };
  }

  /**
   * Iniciar sincronización automática
   */
  startAutoSync(): void {
    if (this.syncInterval) return;

    console.log('[SyncManager] Iniciando sync automático');

    this.syncInterval = setInterval(() => {
      if (this.isOnline && !this.isSyncing) {
        this.sync();
      }
    }, SW_CONFIG.sync.intervalMs);
  }

  /**
   * Detener sincronización automática
   */
  stopAutoSync(): void {
    if (this.syncInterval) {
      clearInterval(this.syncInterval);
      this.syncInterval = null;
      console.log('[SyncManager] Sync automático detenido');
    }
  }

  /**
   * Ejecutar sincronización
   */
  async sync(): Promise<void> {
    if (this.isSyncing || !this.isOnline) {
      console.log('[SyncManager] Sync omitido:', this.isSyncing ? 'ya en progreso' : 'offline');
      return;
    }

    this.isSyncing = true;
    const startTime = Date.now();

    try {
      const queue = await offlineDb.getSyncQueue();

      if (queue.length === 0) {
        this.isSyncing = false;
        this.lastSyncTime = new Date();
        this.notify({
          status: 'synced',
          pendingItems: 0,
          lastSync: this.lastSyncTime,
        });
        return;
      }

      console.log(`[SyncManager] Sincronizando ${queue.length} items...`);

      this.notify({
        status: 'syncing',
        pendingItems: queue.length,
        progress: { current: 0, total: queue.length },
      });

      let successCount = 0;
      let errorCount = 0;

      for (let i = 0; i < queue.length; i++) {
        const item = queue[i];
        
        try {
          await this.syncItem(item);
          successCount++;

          // Eliminar de la cola
          if (item.id !== undefined) {
            await offlineDb.delete('syncQueue', item.id);
          }

          this.notify({
            status: 'syncing',
            pendingItems: queue.length - i - 1,
            progress: { current: i + 1, total: queue.length },
          });
        } catch (error) {
          errorCount++;
          console.error(`[SyncManager] Error sincronizando item ${item.id}:`, error);

          // Incrementar retries
          if (item.id !== undefined) {
            await offlineDb.incrementRetry(item.id);
            
            // Si excede max retries, eliminar
            if ((item.retries || 0) >= SW_CONFIG.sync.retryAttempts) {
              console.warn(`[SyncManager] Item ${item.id} excedió retries, eliminando`);
              await offlineDb.delete('syncQueue', item.id);
            }
          }
        }
      }

      const duration = Date.now() - startTime;
      this.lastSyncTime = new Date();

      console.log(`[SyncManager] Completado en ${duration}ms. Exitosos: ${successCount}, Errores: ${errorCount}`);

      const remainingItems = await offlineDb.countSyncQueue();

      this.notify({
        status: errorCount > 0 ? 'error' : 'synced',
        pendingItems: remainingItems,
        lastSync: this.lastSyncTime,
        error: errorCount > 0 ? `${errorCount} items fallaron` : undefined,
      });
    } catch (error) {
      console.error('[SyncManager] Error durante sincronización:', error);

      this.notify({
        status: 'error',
        pendingItems: await offlineDb.countSyncQueue(),
        error: error instanceof Error ? error.message : String(error),
      });
    } finally {
      this.isSyncing = false;
    }
  }

  /**
   * Sincronizar un item individual
   */
  private async syncItem(item: SyncQueueItem): Promise<void> {
    const { endpoint, method, payload } = item;
    const url = `${this.apiBaseUrl}${endpoint}`;

    console.log(`[SyncManager] ${method} ${endpoint}`);

    const response = await fetch(url, {
      method,
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include',
      body: payload ? JSON.stringify(payload) : undefined,
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }
  }

  /**
   * Encolar acción para sincronización
   * Si estamos online, ejecutar inmediatamente
   * Si estamos offline, agregar a cola
   */
  async queueAction(action: {
    endpoint: string;
    method: 'POST' | 'PUT' | 'PATCH' | 'DELETE';
    payload?: unknown;
  }): Promise<Response | null> {
    if (this.isOnline) {
      // Ejecutar inmediatamente
      const url = `${this.apiBaseUrl}${action.endpoint}`;
      
      try {
        const response = await fetch(url, {
          method: action.method,
          headers: {
            'Content-Type': 'application/json',
          },
          credentials: 'include',
          body: action.payload ? JSON.stringify(action.payload) : undefined,
        });

        return response;
      } catch (error) {
        // Si falla la conexión, agregar a cola
        console.warn('[SyncManager] Fallo conexión, agregando a cola:', error);
        await this.addToQueue(action);
        return null;
      }
    } else {
      // Agregar a cola
      await this.addToQueue(action);
      return null;
    }
  }

  /**
   * Agregar a cola de sync
   */
  private async addToQueue(action: {
    endpoint: string;
    method: 'POST' | 'PUT' | 'PATCH' | 'DELETE';
    payload?: unknown;
  }): Promise<void> {
    console.log(`[SyncManager] Agregando a cola: ${action.method} ${action.endpoint}`);
    
    await offlineDb.addToSyncQueue({
      endpoint: action.endpoint,
      method: action.method,
      payload: action.payload,
    });

    const pendingItems = await offlineDb.countSyncQueue();
    this.notify({
      status: 'offline',
      pendingItems,
    });
  }

  /**
   * Verificar si estamos online
   */
  getOnlineStatus(): boolean {
    return this.isOnline;
  }

  /**
   * Verificar si estamos sincronizando
   */
  getSyncingStatus(): boolean {
    return this.isSyncing;
  }
}

// Singleton instance
export const syncManager = new SyncManager();
