/**
 * CERMONT - Sistema de Sincronización Offline
 * 
 * Este módulo proporciona:
 * - Almacenamiento offline con IndexedDB
 * - Cola de sincronización para operaciones pendientes
 * - Detección de conexión/desconexión
 * - Sincronización automática al reconectar
 */

// ============================================
// TYPES
// ============================================

export type SyncStatus = 'pending' | 'syncing' | 'synced' | 'error';

export interface SyncQueueItem {
  id: string;
  type: 'CREATE' | 'UPDATE' | 'DELETE';
  endpoint: string;
  method: 'POST' | 'PUT' | 'PATCH' | 'DELETE';
  data: any;
  timestamp: number;
  retries: number;
  maxRetries: number;
  status: SyncStatus;
  error?: string;
}

export interface OfflineData {
  id: string;
  collection: string;
  data: any;
  syncStatus: SyncStatus;
  localUpdatedAt: number;
  serverUpdatedAt?: string;
}

export interface SyncEvent {
  type: 'online' | 'offline' | 'sync_start' | 'sync_complete' | 'sync_error' | 'item_synced';
  payload?: any;
}

type SyncEventListener = (event: SyncEvent) => void;

// ============================================
// INDEXEDDB MANAGER
// ============================================

const DB_NAME = 'cermont_offline_db';
const DB_VERSION = 1;

const STORES = {
  ORDENES: 'ordenes',
  FORMULARIOS: 'formularios',
  INSPECCIONES: 'inspecciones',
  MANTENIMIENTOS: 'mantenimientos',
  SYNC_QUEUE: 'sync_queue',
  CACHE: 'cache',
};

class IndexedDBManager {
  private db: IDBDatabase | null = null;
  private dbReady: Promise<IDBDatabase>;

  constructor() {
    this.dbReady = this.initDB();
  }

  private async initDB(): Promise<IDBDatabase> {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(DB_NAME, DB_VERSION);

      request.onerror = () => {
        if (process.env.NODE_ENV === 'development') {
          console.error('[OfflineSync] Error abriendo IndexedDB:', request.error);
        }
        reject(request.error);
      };

      request.onsuccess = () => {
        this.db = request.result;
        if (process.env.NODE_ENV === 'development') {
          console.log('[OfflineSync] IndexedDB inicializado correctamente');
        }
        resolve(request.result);
      };

      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;

        // Store para órdenes offline
        if (!db.objectStoreNames.contains(STORES.ORDENES)) {
          const ordenesStore = db.createObjectStore(STORES.ORDENES, { keyPath: 'id' });
          ordenesStore.createIndex('syncStatus', 'syncStatus', { unique: false });
          ordenesStore.createIndex('localUpdatedAt', 'localUpdatedAt', { unique: false });
        }

        // Store para formularios offline
        if (!db.objectStoreNames.contains(STORES.FORMULARIOS)) {
          const formulariosStore = db.createObjectStore(STORES.FORMULARIOS, { keyPath: 'id' });
          formulariosStore.createIndex('templateId', 'templateId', { unique: false });
          formulariosStore.createIndex('syncStatus', 'syncStatus', { unique: false });
        }

        // Store para inspecciones
        if (!db.objectStoreNames.contains(STORES.INSPECCIONES)) {
          const inspeccionesStore = db.createObjectStore(STORES.INSPECCIONES, { keyPath: 'id' });
          inspeccionesStore.createIndex('equipoId', 'equipoId', { unique: false });
          inspeccionesStore.createIndex('syncStatus', 'syncStatus', { unique: false });
        }

        // Store para mantenimientos
        if (!db.objectStoreNames.contains(STORES.MANTENIMIENTOS)) {
          const mantenimientosStore = db.createObjectStore(STORES.MANTENIMIENTOS, { keyPath: 'id' });
          mantenimientosStore.createIndex('equipoId', 'equipoId', { unique: false });
          mantenimientosStore.createIndex('syncStatus', 'syncStatus', { unique: false });
        }

        // Store para cola de sincronización
        if (!db.objectStoreNames.contains(STORES.SYNC_QUEUE)) {
          const syncStore = db.createObjectStore(STORES.SYNC_QUEUE, { keyPath: 'id' });
          syncStore.createIndex('status', 'status', { unique: false });
          syncStore.createIndex('timestamp', 'timestamp', { unique: false });
        }

        // Store para caché general
        if (!db.objectStoreNames.contains(STORES.CACHE)) {
          const cacheStore = db.createObjectStore(STORES.CACHE, { keyPath: 'key' });
          cacheStore.createIndex('expiresAt', 'expiresAt', { unique: false });
        }
      };
    });
  }

  async getDB(): Promise<IDBDatabase> {
    if (this.db) return this.db;
    return this.dbReady;
  }

  // CRUD genérico
  async get<T>(storeName: string, id: string): Promise<T | undefined> {
    const db = await this.getDB();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(storeName, 'readonly');
      const store = transaction.objectStore(storeName);
      const request = store.get(id);
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  }

  async getAll<T>(storeName: string): Promise<T[]> {
    const db = await this.getDB();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(storeName, 'readonly');
      const store = transaction.objectStore(storeName);
      const request = store.getAll();
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  }

  async put<T>(storeName: string, data: T): Promise<T> {
    const db = await this.getDB();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(storeName, 'readwrite');
      const store = transaction.objectStore(storeName);
      const request = store.put(data);
      request.onsuccess = () => resolve(data);
      request.onerror = () => reject(request.error);
    });
  }

  async delete(storeName: string, id: string): Promise<void> {
    const db = await this.getDB();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(storeName, 'readwrite');
      const store = transaction.objectStore(storeName);
      const request = store.delete(id);
      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }

  async getByIndex<T>(storeName: string, indexName: string, value: IDBValidKey): Promise<T[]> {
    const db = await this.getDB();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(storeName, 'readonly');
      const store = transaction.objectStore(storeName);
      const index = store.index(indexName);
      const request = index.getAll(value);
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  }

  async clear(storeName: string): Promise<void> {
    const db = await this.getDB();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(storeName, 'readwrite');
      const store = transaction.objectStore(storeName);
      const request = store.clear();
      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }
}

// ============================================
// SYNC MANAGER
// ============================================

class OfflineSyncManager {
  private db: IndexedDBManager;
  private isOnline: boolean;
  private isSyncing: boolean = false;
  private listeners: Set<SyncEventListener> = new Set();
  private syncInterval: NodeJS.Timeout | null = null;

  constructor() {
    this.db = new IndexedDBManager();
    this.isOnline = typeof navigator !== 'undefined' ? navigator.onLine : true;
    this.setupListeners();
  }

  private setupListeners() {
    if (typeof window === 'undefined') return;

    window.addEventListener('online', () => {
      this.isOnline = true;
      this.emit({ type: 'online' });
      this.startSync();
    });

    window.addEventListener('offline', () => {
      this.isOnline = false;
      this.emit({ type: 'offline' });
    });

    // Sincronización periódica cuando está online
    this.syncInterval = setInterval(() => {
      if (this.isOnline && !this.isSyncing) {
        this.startSync();
      }
    }, 60000); // Cada minuto
  }

  // Event emitter
  subscribe(listener: SyncEventListener): () => void {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  private emit(event: SyncEvent) {
    this.listeners.forEach(listener => listener(event));
  }

  // Estado de conexión
  getConnectionStatus(): boolean {
    return this.isOnline;
  }

  // ============================================
  // QUEUE MANAGEMENT
  // ============================================

  async addToSyncQueue(item: Omit<SyncQueueItem, 'id' | 'timestamp' | 'retries' | 'status'>): Promise<string> {
    const queueItem: SyncQueueItem = {
      ...item,
      id: `sync_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      timestamp: Date.now(),
      retries: 0,
      maxRetries: item.maxRetries || 3,
      status: 'pending',
    };

    await this.db.put(STORES.SYNC_QUEUE, queueItem);
    
    // Intentar sincronizar inmediatamente si está online
    if (this.isOnline) {
      this.startSync();
    }

    return queueItem.id;
  }

  async getPendingSyncItems(): Promise<SyncQueueItem[]> {
    return this.db.getByIndex<SyncQueueItem>(STORES.SYNC_QUEUE, 'status', 'pending');
  }

  async getSyncQueue(): Promise<SyncQueueItem[]> {
    return this.db.getAll<SyncQueueItem>(STORES.SYNC_QUEUE);
  }

  async removeSyncItem(id: string): Promise<void> {
    await this.db.delete(STORES.SYNC_QUEUE, id);
  }

  // ============================================
  // SYNC PROCESS
  // ============================================

  async startSync(): Promise<void> {
    if (this.isSyncing || !this.isOnline) return;

    this.isSyncing = true;
    this.emit({ type: 'sync_start' });

    try {
      const pendingItems = await this.getPendingSyncItems();
      if (process.env.NODE_ENV === 'development') {
        console.log(`[OfflineSync] Sincronizando ${pendingItems.length} items...`);
      }

      for (const item of pendingItems) {
        try {
          await this.syncItem(item);
          
          // Marcar como sincronizado y eliminar de la cola
          await this.removeSyncItem(item.id);
          this.emit({ type: 'item_synced', payload: item });
          
        } catch (error) {
          // Incrementar reintentos
          item.retries++;
          if (item.retries >= item.maxRetries) {
            item.status = 'error';
            item.error = error instanceof Error ? error.message : 'Error desconocido';
          }
          await this.db.put(STORES.SYNC_QUEUE, item);
        }
      }

      this.emit({ type: 'sync_complete', payload: { synced: pendingItems.length } });
    } catch (error) {
      if (process.env.NODE_ENV === 'development') {
        console.error('[OfflineSync] Error en sincronización:', error);
      }
      this.emit({ type: 'sync_error', payload: error });
    } finally {
      this.isSyncing = false;
    }
  }

  private async syncItem(item: SyncQueueItem): Promise<any> {
    const rawBaseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
    const trimmed = rawBaseUrl.trim().replace(/\/+$/, '');
    const baseUrl = trimmed.endsWith('/api') ? trimmed : `${trimmed}/api`;
    
    const response = await fetch(`${baseUrl}${item.endpoint}`, {
      method: item.method,
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${this.getAuthToken()}`,
      },
      body: item.method !== 'DELETE' ? JSON.stringify(item.data) : undefined,
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    return response.json();
  }

  private getAuthToken(): string {
    if (typeof localStorage !== 'undefined') {
      return localStorage.getItem('auth_token') || '';
    }
    return '';
  }

  // ============================================
  // OFFLINE DATA MANAGEMENT
  // ============================================

  // Guardar orden offline
  async saveOrdenOffline(orden: any): Promise<void> {
    const offlineData: OfflineData = {
      id: orden.id || `local_${Date.now()}`,
      collection: 'ordenes',
      data: orden,
      syncStatus: 'pending',
      localUpdatedAt: Date.now(),
    };
    await this.db.put(STORES.ORDENES, offlineData);

    // Agregar a cola de sync si es nuevo o modificado
    await this.addToSyncQueue({
      type: orden.id?.startsWith('local_') ? 'CREATE' : 'UPDATE',
      endpoint: orden.id?.startsWith('local_') ? '/ordenes' : `/ordenes/${orden.id}`,
      method: orden.id?.startsWith('local_') ? 'POST' : 'PUT',
      data: orden,
      maxRetries: 3,
    });
  }

  async getOrdenesOffline(): Promise<OfflineData[]> {
    return this.db.getAll<OfflineData>(STORES.ORDENES);
  }

  // Guardar formulario offline
  async saveFormularioOffline(formulario: any): Promise<void> {
    const offlineData: OfflineData = {
      id: formulario.id || `local_${Date.now()}`,
      collection: 'formularios',
      data: formulario,
      syncStatus: 'pending',
      localUpdatedAt: Date.now(),
    };
    await this.db.put(STORES.FORMULARIOS, offlineData);

    await this.addToSyncQueue({
      type: 'CREATE',
      endpoint: '/formularios/submit',
      method: 'POST',
      data: formulario,
      maxRetries: 3,
    });
  }

  async getFormulariosOffline(): Promise<OfflineData[]> {
    return this.db.getAll<OfflineData>(STORES.FORMULARIOS);
  }

  // Guardar inspección offline
  async saveInspeccionOffline(inspeccion: any): Promise<void> {
    const offlineData: OfflineData = {
      id: inspeccion.id || `local_${Date.now()}`,
      collection: 'inspecciones',
      data: inspeccion,
      syncStatus: 'pending',
      localUpdatedAt: Date.now(),
    };
    await this.db.put(STORES.INSPECCIONES, offlineData);

    await this.addToSyncQueue({
      type: 'CREATE',
      endpoint: '/hes/inspeccion',
      method: 'POST',
      data: inspeccion,
      maxRetries: 3,
    });
  }

  // ============================================
  // CACHE MANAGEMENT
  // ============================================

  async cacheData(key: string, data: any, ttlMinutes: number = 60): Promise<void> {
    await this.db.put(STORES.CACHE, {
      key,
      data,
      cachedAt: Date.now(),
      expiresAt: Date.now() + ttlMinutes * 60 * 1000,
    });
  }

  async getCachedData<T>(key: string): Promise<T | null> {
    const cached = await this.db.get<{ key: string; data: T; expiresAt: number }>(STORES.CACHE, key);
    
    if (!cached) return null;
    
    // Verificar si expiró
    if (Date.now() > cached.expiresAt) {
      await this.db.delete(STORES.CACHE, key);
      return null;
    }
    
    return cached.data;
  }

  async clearCache(): Promise<void> {
    await this.db.clear(STORES.CACHE);
  }

  // ============================================
  // UTILITIES
  // ============================================

  async getPendingCount(): Promise<number> {
    const items = await this.getPendingSyncItems();
    return items.length;
  }

  async clearAllOfflineData(): Promise<void> {
    await Promise.all([
      this.db.clear(STORES.ORDENES),
      this.db.clear(STORES.FORMULARIOS),
      this.db.clear(STORES.INSPECCIONES),
      this.db.clear(STORES.MANTENIMIENTOS),
      this.db.clear(STORES.SYNC_QUEUE),
      this.db.clear(STORES.CACHE),
    ]);
  }

  destroy() {
    if (this.syncInterval) {
      clearInterval(this.syncInterval);
    }
  }
}

// ============================================
// SINGLETON EXPORT
// ============================================

let syncManager: OfflineSyncManager | null = null;

export function getOfflineSyncManager(): OfflineSyncManager {
  if (!syncManager) {
    syncManager = new OfflineSyncManager();
  }
  return syncManager;
}

export default OfflineSyncManager;
