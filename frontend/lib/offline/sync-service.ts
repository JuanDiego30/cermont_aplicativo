import { openDB, DBSchema, IDBPDatabase } from 'idb';

interface OfflineDB extends DBSchema {
  pendingActions: {
    key: string;
    value: {
      id: string;
      type: 'CREATE' | 'UPDATE' | 'DELETE';
      endpoint: string;
      data: any;
      timestamp: number;
      retries: number;
    };
  };
  cachedData: {
    key: string;
    value: {
      id: string;
      type: string;
      data: any;
      timestamp: number;
    };
    indexes: {
      'by-type': string;
    };
  };
  photos: {
    key: string;
    value: {
      id: string;
      blob: Blob;
      compressed: boolean;
      timestamp: number;
    };
  };
}

class SyncService {
  private db: IDBPDatabase<OfflineDB> | null = null;

  async init() {
    if (this.db) return this.db;

    this.db = await openDB<OfflineDB>('cermont-offline', 1, {
      upgrade(db) {
        if (!db.objectStoreNames.contains('pendingActions')) {
          db.createObjectStore('pendingActions', { keyPath: 'id' });
        }

        if (!db.objectStoreNames.contains('cachedData')) {
          const cachedStore = db.createObjectStore('cachedData', { keyPath: 'id' });
          cachedStore.createIndex('by-type', 'type');
        }

        if (!db.objectStoreNames.contains('photos')) {
          db.createObjectStore('photos', { keyPath: 'id' });
        }
      },
    });

    return this.db;
  }

  async savePendingAction(action: {
    type: 'CREATE' | 'UPDATE' | 'DELETE';
    endpoint: string;
    data: any;
  }) {
    const db = await this.init();
    const id = `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

    await db.put('pendingActions', {
      id,
      ...action,
      timestamp: Date.now(),
      retries: 0,
    });

    if (navigator.onLine) {
      this.syncPendingActions();
    }

    return id;
  }

  async getPendingActions() {
    const db = await this.init();
    return db.getAll('pendingActions');
  }

  async syncPendingActions() {
    if (!navigator.onLine) {
      console.log('Sin conexion, sincronizacion pospuesta');
      return;
    }

    const actions = await this.getPendingActions();
    console.log(`Sincronizando ${actions.length} acciones pendientes...`);

    for (const action of actions) {
      try {
        await this.executeAction(action);
        await this.removePendingAction(action.id);
        console.log(`[OK] Accion ${action.id} sincronizada`);
      } catch (error) {
        console.error(`[ERROR] Error sincronizando accion ${action.id}:`, error);
        await this.incrementRetries(action.id);
      }
    }
  }

  private async executeAction(action: any) {
    const { type, endpoint, data } = action;

    const options: RequestInit = {
      method: type === 'CREATE' ? 'POST' : type === 'UPDATE' ? 'PUT' : 'DELETE',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${localStorage.getItem('token')}`,
      },
      body: type !== 'DELETE' ? JSON.stringify(data) : undefined,
    };

    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}${endpoint}`, options);

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }

    return response.json();
  }

  async removePendingAction(id: string) {
    const db = await this.init();
    await db.delete('pendingActions', id);
  }

  async incrementRetries(id: string) {
    const db = await this.init();
    const action = await db.get('pendingActions', id);

    if (action) {
      action.retries += 1;

      if (action.retries >= 5) {
        console.error(`Accion ${id} descartada despues de 5 reintentos`);
        await db.delete('pendingActions', id);
      } else {
        await db.put('pendingActions', action);
      }
    }
  }

  async cacheData(type: string, id: string, data: any) {
    const db = await this.init();
    await db.put('cachedData', {
      id: `${type}-${id}`,
      type,
      data,
      timestamp: Date.now(),
    });
  }

  async getCachedData(type: string, id?: string) {
    const db = await this.init();

    if (id) {
      return db.get('cachedData', `${type}-${id}`);
    }

    const tx = db.transaction('cachedData', 'readonly');
    const index = tx.store.index('by-type');
    return index.getAll(type);
  }

  async savePhoto(blob: Blob, compress: boolean = true): Promise<string> {
    const db = await this.init();
    const id = `photo-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

    let finalBlob = blob;

    if (compress && blob.type.startsWith('image/')) {
      finalBlob = await this.compressImage(blob);
    }

    await db.put('photos', {
      id,
      blob: finalBlob,
      compressed: compress,
      timestamp: Date.now(),
    });

    return id;
  }

  async getPhoto(id: string) {
    const db = await this.init();
    const photo = await db.get('photos', id);
    return photo?.blob;
  }

  private async compressImage(blob: Blob): Promise<Blob> {
    return new Promise((resolve, reject) => {
      const img = new Image();
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');

      img.onload = () => {
        let width = img.width;
        let height = img.height;
        const MAX_SIZE = 1920;

        if (width > MAX_SIZE || height > MAX_SIZE) {
          if (width > height) {
            height = (height * MAX_SIZE) / width;
            width = MAX_SIZE;
          } else {
            width = (width * MAX_SIZE) / height;
            height = MAX_SIZE;
          }
        }

        canvas.width = width;
        canvas.height = height;

        ctx?.drawImage(img, 0, 0, width, height);

        canvas.toBlob(
          (compressedBlob) => {
            if (compressedBlob) {
              resolve(compressedBlob);
            } else {
              reject(new Error('Error al comprimir imagen'));
            }
          },
          'image/jpeg',
          0.8
        );
      };

      img.onerror = reject;
      img.src = URL.createObjectURL(blob);
    });
  }

  async cleanOldData() {
    const db = await this.init();
    const sevenDaysAgo = Date.now() - 7 * 24 * 60 * 60 * 1000;

    const cachedData = await db.getAll('cachedData');
    for (const item of cachedData) {
      if (item.timestamp < sevenDaysAgo) {
        await db.delete('cachedData', item.id);
      }
    }

    const photos = await db.getAll('photos');
    for (const photo of photos) {
      if (photo.timestamp < sevenDaysAgo) {
        await db.delete('photos', photo.id);
      }
    }

    console.log('[OK] Limpieza de datos antiguos completada');
  }
}

export const syncService = new SyncService();

if (typeof window !== 'undefined') {
  syncService.init();

  window.addEventListener('online', () => {
    console.log('[ONLINE] Conexion restaurada, sincronizando...');
    syncService.syncPendingActions();
  });

  setInterval(() => {
    syncService.cleanOldData();
  }, 24 * 60 * 60 * 1000);
}