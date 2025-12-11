// ============================================
// INDEXED DB MANAGER - Cermont FSM
// Gestión de base de datos local para offline
// ============================================

import { SW_CONFIG, type StoreName } from './sw-config';

export interface SyncQueueItem {
  id?: number;
  endpoint: string;
  method: 'POST' | 'PUT' | 'PATCH' | 'DELETE';
  payload?: unknown;
  timestamp: number;
  retries: number;
}

export class OfflineDatabase {
  private db: IDBDatabase | null = null;
  private readonly dbName = SW_CONFIG.db.name;
  private readonly version = SW_CONFIG.db.version;
  private initPromise: Promise<void> | null = null;

  /**
   * Inicializar IndexedDB
   */
  async init(): Promise<void> {
    if (this.db) return;
    if (this.initPromise) return this.initPromise;

    this.initPromise = new Promise((resolve, reject) => {
      const request = indexedDB.open(this.dbName, this.version);

      request.onerror = () => {
        console.error('[OfflineDB] Error al abrir:', request.error);
        reject(request.error);
      };

      request.onsuccess = () => {
        this.db = request.result;
        console.log('[OfflineDB] Inicializada correctamente');
        resolve();
      };

      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;

        // Crear object stores
        Object.entries(SW_CONFIG.db.stores).forEach(([storeName, config]) => {
          if (!db.objectStoreNames.contains(storeName)) {
            const store = db.createObjectStore(storeName, config);
            
            // Agregar índices según el store
            if (storeName === 'ordenes') {
              store.createIndex('estado', 'estado', { unique: false });
              store.createIndex('cliente', 'cliente', { unique: false });
            }
            if (storeName === 'syncQueue') {
              store.createIndex('timestamp', 'timestamp', { unique: false });
            }
          }
        });

        console.log('[OfflineDB] Stores creadas');
      };
    });

    return this.initPromise;
  }

  /**
   * Verificar que la DB esté inicializada
   */
  private ensureInit(): void {
    if (!this.db) {
      throw new Error('OfflineDB no inicializada. Llama a init() primero.');
    }
  }

  /**
   * Guardar un registro
   */
  async save<T extends { id: string }>(storeName: StoreName, data: T): Promise<void> {
    await this.init();
    this.ensureInit();

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([storeName], 'readwrite');
      const store = transaction.objectStore(storeName);
      const request = store.put(data);

      request.onerror = () => reject(request.error);
      request.onsuccess = () => resolve();
    });
  }

  /**
   * Guardar múltiples registros
   */
  async saveMany<T extends { id: string }>(storeName: StoreName, items: T[]): Promise<void> {
    await this.init();
    this.ensureInit();

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([storeName], 'readwrite');
      const store = transaction.objectStore(storeName);

      transaction.oncomplete = () => resolve();
      transaction.onerror = () => reject(transaction.error);

      items.forEach((item) => store.put(item));
    });
  }

  /**
   * Obtener todos los registros
   */
  async getAll<T>(storeName: StoreName): Promise<T[]> {
    await this.init();
    this.ensureInit();

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([storeName], 'readonly');
      const store = transaction.objectStore(storeName);
      const request = store.getAll();

      request.onerror = () => reject(request.error);
      request.onsuccess = () => resolve(request.result);
    });
  }

  /**
   * Obtener un registro por ID
   */
  async get<T>(storeName: StoreName, id: string | number): Promise<T | undefined> {
    await this.init();
    this.ensureInit();

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([storeName], 'readonly');
      const store = transaction.objectStore(storeName);
      const request = store.get(id);

      request.onerror = () => reject(request.error);
      request.onsuccess = () => resolve(request.result);
    });
  }

  /**
   * Eliminar un registro
   */
  async delete(storeName: StoreName, id: string | number): Promise<void> {
    await this.init();
    this.ensureInit();

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([storeName], 'readwrite');
      const store = transaction.objectStore(storeName);
      const request = store.delete(id);

      request.onerror = () => reject(request.error);
      request.onsuccess = () => resolve();
    });
  }

  /**
   * Limpiar una store
   */
  async clear(storeName: StoreName): Promise<void> {
    await this.init();
    this.ensureInit();

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([storeName], 'readwrite');
      const store = transaction.objectStore(storeName);
      const request = store.clear();

      request.onerror = () => reject(request.error);
      request.onsuccess = () => resolve();
    });
  }

  /**
   * Agregar acción a cola de sincronización
   */
  async addToSyncQueue(item: Omit<SyncQueueItem, 'id' | 'timestamp' | 'retries'>): Promise<void> {
    await this.init();
    this.ensureInit();

    const queueItem: Omit<SyncQueueItem, 'id'> = {
      ...item,
      timestamp: Date.now(),
      retries: 0,
    };

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(['syncQueue'], 'readwrite');
      const store = transaction.objectStore('syncQueue');
      const request = store.add(queueItem);

      request.onerror = () => reject(request.error);
      request.onsuccess = () => {
        console.log('[OfflineDB] Agregado a cola de sync:', item.endpoint);
        resolve();
      };
    });
  }

  /**
   * Obtener cola de sincronización ordenada por timestamp
   */
  async getSyncQueue(): Promise<SyncQueueItem[]> {
    await this.init();
    this.ensureInit();

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(['syncQueue'], 'readonly');
      const store = transaction.objectStore('syncQueue');
      const index = store.index('timestamp');
      const request = index.getAll();

      request.onerror = () => reject(request.error);
      request.onsuccess = () => resolve(request.result);
    });
  }

  /**
   * Incrementar retries de un item en la cola
   */
  async incrementRetry(id: number): Promise<void> {
    await this.init();
    this.ensureInit();

    const item = await this.get<SyncQueueItem>('syncQueue', id);
    if (item) {
      item.retries = (item.retries || 0) + 1;
      await this.save('syncQueue', item as SyncQueueItem & { id: string });
    }
  }

  /**
   * Contar items en cola de sync
   */
  async countSyncQueue(): Promise<number> {
    await this.init();
    this.ensureInit();

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(['syncQueue'], 'readonly');
      const store = transaction.objectStore('syncQueue');
      const request = store.count();

      request.onerror = () => reject(request.error);
      request.onsuccess = () => resolve(request.result);
    });
  }

  /**
   * Cerrar conexión
   */
  close(): void {
    if (this.db) {
      this.db.close();
      this.db = null;
      this.initPromise = null;
      console.log('[OfflineDB] Conexión cerrada');
    }
  }
}

// Singleton instance
export const offlineDb = new OfflineDatabase();
