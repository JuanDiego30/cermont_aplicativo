/**
 * ============================================
 * OFFLINE MANAGER - Cermont FSM
 * IndexedDB-based offline data storage
 * ============================================
 */

const DB_NAME = 'cermont-offline-db';
const DB_VERSION = 1;

// Store names
const STORES = {
    PENDING_SYNC: 'pending-sync',
    ORDERS_CACHE: 'orders-cache',
    CHECKLISTS_CACHE: 'checklists-cache',
    COSTS_CACHE: 'costs-cache',
    EVIDENCES_QUEUE: 'evidences-queue',
};

// Types
export interface PendingSyncItem {
    id: string;
    type: 'CREATE' | 'UPDATE' | 'DELETE';
    entity: string;
    data: any;
    createdAt: Date;
    retries: number;
}

export interface CacheItem<T> {
    id: string;
    data: T;
    cachedAt: Date;
    expiresAt: Date;
}

class OfflineManager {
    private db: IDBDatabase | null = null;
    private isInitialized = false;

    /**
     * Initialize the IndexedDB database
     */
    async init(): Promise<void> {
        if (this.isInitialized) return;

        return new Promise((resolve, reject) => {
            const request = indexedDB.open(DB_NAME, DB_VERSION);

            request.onerror = () => {
                console.error('Failed to open IndexedDB:', request.error);
                reject(request.error);
            };

            request.onsuccess = () => {
                this.db = request.result;
                this.isInitialized = true;
                console.log('IndexedDB initialized successfully');
                resolve();
            };

            request.onupgradeneeded = (event) => {
                const db = (event.target as IDBOpenDBRequest).result;

                // Create object stores
                if (!db.objectStoreNames.contains(STORES.PENDING_SYNC)) {
                    db.createObjectStore(STORES.PENDING_SYNC, { keyPath: 'id' });
                }

                if (!db.objectStoreNames.contains(STORES.ORDERS_CACHE)) {
                    db.createObjectStore(STORES.ORDERS_CACHE, { keyPath: 'id' });
                }

                if (!db.objectStoreNames.contains(STORES.CHECKLISTS_CACHE)) {
                    db.createObjectStore(STORES.CHECKLISTS_CACHE, { keyPath: 'id' });
                }

                if (!db.objectStoreNames.contains(STORES.COSTS_CACHE)) {
                    db.createObjectStore(STORES.COSTS_CACHE, { keyPath: 'id' });
                }

                if (!db.objectStoreNames.contains(STORES.EVIDENCES_QUEUE)) {
                    db.createObjectStore(STORES.EVIDENCES_QUEUE, { keyPath: 'id' });
                }
            };
        });
    }

    /**
     * Ensure DB is initialized before operations
     */
    private async ensureDb(): Promise<IDBDatabase> {
        if (!this.db) {
            await this.init();
        }
        if (!this.db) {
            throw new Error('IndexedDB not available');
        }
        return this.db;
    }

    /**
     * Add item to pending sync queue
     */
    async addToPendingSync(item: Omit<PendingSyncItem, 'id' | 'createdAt' | 'retries'>): Promise<string> {
        const db = await this.ensureDb();
        const id = crypto.randomUUID();

        return new Promise((resolve, reject) => {
            const tx = db.transaction(STORES.PENDING_SYNC, 'readwrite');
            const store = tx.objectStore(STORES.PENDING_SYNC);

            const fullItem: PendingSyncItem = {
                ...item,
                id,
                createdAt: new Date(),
                retries: 0,
            };

            const request = store.add(fullItem);
            request.onsuccess = () => resolve(id);
            request.onerror = () => reject(request.error);
        });
    }

    /**
     * Get all pending sync items
     */
    async getPendingSyncItems(): Promise<PendingSyncItem[]> {
        const db = await this.ensureDb();

        return new Promise((resolve, reject) => {
            const tx = db.transaction(STORES.PENDING_SYNC, 'readonly');
            const store = tx.objectStore(STORES.PENDING_SYNC);
            const request = store.getAll();

            request.onsuccess = () => resolve(request.result);
            request.onerror = () => reject(request.error);
        });
    }

    /**
     * Remove item from pending sync (after successful sync)
     */
    async removePendingSyncItem(id: string): Promise<void> {
        const db = await this.ensureDb();

        return new Promise((resolve, reject) => {
            const tx = db.transaction(STORES.PENDING_SYNC, 'readwrite');
            const store = tx.objectStore(STORES.PENDING_SYNC);
            const request = store.delete(id);

            request.onsuccess = () => resolve();
            request.onerror = () => reject(request.error);
        });
    }

    /**
     * Update retry count for failed sync
     */
    async incrementRetries(id: string): Promise<void> {
        const db = await this.ensureDb();

        return new Promise((resolve, reject) => {
            const tx = db.transaction(STORES.PENDING_SYNC, 'readwrite');
            const store = tx.objectStore(STORES.PENDING_SYNC);
            const getRequest = store.get(id);

            getRequest.onsuccess = () => {
                const item = getRequest.result;
                if (item) {
                    item.retries += 1;
                    store.put(item);
                }
                resolve();
            };
            getRequest.onerror = () => reject(getRequest.error);
        });
    }

    /**
     * Cache data for offline access
     */
    async cacheData<T>(storeName: string, id: string, data: T, ttlMinutes: number = 60): Promise<void> {
        const db = await this.ensureDb();
        const now = new Date();
        const expiresAt = new Date(now.getTime() + ttlMinutes * 60 * 1000);

        return new Promise((resolve, reject) => {
            const tx = db.transaction(storeName, 'readwrite');
            const store = tx.objectStore(storeName);

            const cacheItem: CacheItem<T> = {
                id,
                data,
                cachedAt: now,
                expiresAt,
            };

            const request = store.put(cacheItem);
            request.onsuccess = () => resolve();
            request.onerror = () => reject(request.error);
        });
    }

    /**
     * Get cached data
     */
    async getCachedData<T>(storeName: string, id: string): Promise<T | null> {
        const db = await this.ensureDb();

        return new Promise((resolve, reject) => {
            const tx = db.transaction(storeName, 'readonly');
            const store = tx.objectStore(storeName);
            const request = store.get(id);

            request.onsuccess = () => {
                const item = request.result as CacheItem<T> | undefined;
                if (!item) {
                    resolve(null);
                    return;
                }

                // Check expiration
                if (new Date() > new Date(item.expiresAt)) {
                    // Cache expired, remove it
                    this.removeCachedData(storeName, id);
                    resolve(null);
                    return;
                }

                resolve(item.data);
            };
            request.onerror = () => reject(request.error);
        });
    }

    /**
     * Remove cached data
     */
    async removeCachedData(storeName: string, id: string): Promise<void> {
        const db = await this.ensureDb();

        return new Promise((resolve, reject) => {
            const tx = db.transaction(storeName, 'readwrite');
            const store = tx.objectStore(storeName);
            const request = store.delete(id);

            request.onsuccess = () => resolve();
            request.onerror = () => reject(request.error);
        });
    }

    /**
     * Clear all cached data from a store
     */
    async clearStore(storeName: string): Promise<void> {
        const db = await this.ensureDb();

        return new Promise((resolve, reject) => {
            const tx = db.transaction(storeName, 'readwrite');
            const store = tx.objectStore(storeName);
            const request = store.clear();

            request.onsuccess = () => resolve();
            request.onerror = () => reject(request.error);
        });
    }

    /**
     * Get all data from a store
     */
    async getAllFromStore<T>(storeName: string): Promise<CacheItem<T>[]> {
        const db = await this.ensureDb();

        return new Promise((resolve, reject) => {
            const tx = db.transaction(storeName, 'readonly');
            const store = tx.objectStore(storeName);
            const request = store.getAll();

            request.onsuccess = () => resolve(request.result);
            request.onerror = () => reject(request.error);
        });
    }

    /**
     * Get count of pending sync items
     */
    async getPendingSyncCount(): Promise<number> {
        const db = await this.ensureDb();

        return new Promise((resolve, reject) => {
            const tx = db.transaction(STORES.PENDING_SYNC, 'readonly');
            const store = tx.objectStore(STORES.PENDING_SYNC);
            const request = store.count();

            request.onsuccess = () => resolve(request.result);
            request.onerror = () => reject(request.error);
        });
    }
}

// Singleton instance
export const offlineManager = new OfflineManager();

// Export store names for external use
export { STORES };
