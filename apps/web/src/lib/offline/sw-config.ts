// ============================================
// SERVICE WORKER CONFIG - Cermont FSM
// Configuración para sincronización offline
// ============================================

export const SW_CONFIG = {
  // Rutas que se deben cachear para uso offline
  staticRoutes: [
    '/',
    '/dashboard',
    '/ordenes',
    '/planeacion',
    '/ejecucion',
    '/offline',
  ],

  // API endpoints para sincronizar
  apiEndpoints: [
    '/api/ordenes',
    '/api/planeacion',
    '/api/ejecucion',
    '/api/evidencias',
    '/api/kits',
  ],

  // Configuración de cache
  cacheName: 'cermont-v1',
  apiCacheName: 'cermont-api-v1',
  maxCacheAge: 24 * 60 * 60 * 1000, // 24 horas

  // IndexedDB configuration
  db: {
    name: 'cermont-local',
    version: 1,
    stores: {
      ordenes: { keyPath: 'id' },
      planeaciones: { keyPath: 'id' },
      ejecuciones: { keyPath: 'id' },
      evidencias: { keyPath: 'id' },
      kits: { keyPath: 'id' },
      syncQueue: { keyPath: 'id', autoIncrement: true },
      cache: { keyPath: 'key' },
    },
  },

  // Configuración de sync
  sync: {
    intervalMs: 30 * 1000, // 30 segundos
    retryAttempts: 3,
    retryDelayMs: 5000,
  },
} as const;

export type StoreName = keyof typeof SW_CONFIG.db.stores;
