// ============================================
// SERVICE WORKER - Cermont FSM
// Cache first + Network fallback strategy
// ============================================

const CACHE_NAME = 'cermont-v3';
const API_CACHE = 'cermont-api-v3';

// Solo cachear recursos que definitivamente existen
const STATIC_ASSETS = [
  '/',
  '/favicon.ico',
];

const API_ROUTES = [
  '/api/ordenes',
  '/api/planeacion',
  '/api/ejecucion',
  '/api/kits',
];

// ============================================
// INSTALL EVENT
// ============================================
self.addEventListener('install', (event) => {
  console.log('[SW] Installing...');

  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(async (cache) => {
        console.log('[SW] Caching static assets');
        // Cachear recursos uno por uno con manejo de errores
        const cachePromises = STATIC_ASSETS.map(async (url) => {
          try {
            const response = await fetch(url);
            if (response.ok) {
              await cache.put(url, response);
              console.log('[SW] Cached:', url);
            } else {
              console.warn('[SW] Failed to cache (not ok):', url);
            }
          } catch (error) {
            console.warn('[SW] Failed to cache:', url, error.message);
          }
        });
        await Promise.allSettled(cachePromises);
        return;
      })
      .then(() => {
        console.log('[SW] Installed successfully');
        return self.skipWaiting();
      })
      .catch((error) => {
        console.error('[SW] Installation failed:', error);
      })
  );
});

// ============================================
// ACTIVATE EVENT
// ============================================
self.addEventListener('activate', (event) => {
  console.log('[SW] Activating...');

  event.waitUntil(
    caches.keys()
      .then((cacheNames) => {
        return Promise.all(
          cacheNames.map((cacheName) => {
            // Eliminar caches antiguos
            if (cacheName !== CACHE_NAME && cacheName !== API_CACHE) {
              console.log('[SW] Deleting old cache:', cacheName);
              return caches.delete(cacheName);
            }
          })
        );
      })
      .then(() => {
        console.log('[SW] Activated successfully');
        return self.clients.claim();
      })
  );
});

// ============================================
// FETCH EVENT
// ============================================
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Solo manejar requests del mismo origen
  if (url.origin !== location.origin) {
    return;
  }

  // ============================================
  // SKIP NEXT.JS INTERNAL REQUESTS (HMR, DevTools, etc.)
  // ============================================
  if (
    url.pathname.startsWith('/_next/') ||
    url.pathname.startsWith('/__nextjs') ||
    url.pathname.includes('webpack-hmr') ||
    url.pathname.includes('turbopack') ||
    url.pathname.includes('hot-update') ||
    url.pathname.includes('on-demand-entries') ||
    url.pathname.endsWith('.hot-update.js') ||
    url.pathname.endsWith('.hot-update.json')
  ) {
    return; // Let the browser handle these normally
  }

  // ============================================
  // API CALLS - Network first, fallback to cache
  // ============================================
  if (url.pathname.startsWith('/api/')) {
    event.respondWith(
      handleApiRequest(request)
    );
    return;
  }

  // ============================================
  // STATIC ASSETS - Cache first, fallback to network
  // ============================================
  event.respondWith(
    handleStaticRequest(request)
  );
});

// ============================================
// API REQUEST HANDLER
// Network first strategy with cache fallback
// ============================================
async function handleApiRequest(request) {
  try {
    // Intentar fetch primero
    const response = await fetch(request);

    // Si es exitoso y es GET, guardar en cache
    if (response.ok && request.method === 'GET') {
      const cache = await caches.open(API_CACHE);
      cache.put(request, response.clone());
    }

    return response;
  } catch (error) {
    console.log('[SW] Network failed, trying cache:', request.url);

    // Si falla, intentar cache (solo para GET)
    if (request.method === 'GET') {
      const cached = await caches.match(request);
      if (cached) {
        console.log('[SW] Returning cached response');
        return cached;
      }
    }

    // Si no hay cache, retornar error offline
    return new Response(
      JSON.stringify({
        error: 'Offline',
        message: 'No hay conexión a internet y no hay datos en caché',
      }),
      {
        status: 503,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  }
}

// ============================================
// STATIC REQUEST HANDLER
// Cache first strategy with network fallback
// ============================================
async function handleStaticRequest(request) {
  if (request.method !== 'GET') {
    return fetch(request);
  }
  // Buscar en cache primero
  const cached = await caches.match(request);
  if (cached) {
    return cached;
  }

  try {
    // Si no está en cache, intentar fetch
    const response = await fetch(request);

    // CRITICAL: Only cache GET requests (POST/PUT/DELETE cannot be cached)
    if (response.ok && request.method === 'GET') {
      const cache = await caches.open(CACHE_NAME);
      cache.put(request, response.clone());
    }

    return response;
  } catch (error) {
    console.log('[SW] Failed to fetch:', request.url);

    // Si falla y es una navegación, mostrar página offline
    if (request.mode === 'navigate') {
      const offlinePage = await caches.match('/offline');
      if (offlinePage) {
        return offlinePage;
      }
    }

    // Retornar error genérico
    return new Response('Offline', { status: 503 });
  }
}

// ============================================
// BACKGROUND SYNC
// ============================================
self.addEventListener('sync', (event) => {
  console.log('[SW] Background sync:', event.tag);

  if (event.tag === 'cermont-sync') {
    event.waitUntil(
      syncPendingRequests()
    );
  }
});

async function syncPendingRequests() {
  console.log('[SW] Syncing pending requests...');
  // La sincronización real se maneja desde el SyncManager en el cliente
  // Este evento solo notifica que hay conexión disponible

  const clients = await self.clients.matchAll();
  clients.forEach((client) => {
    client.postMessage({
      type: 'SYNC_AVAILABLE',
      timestamp: Date.now(),
    });
  });
}

// ============================================
// MESSAGE HANDLER
// ============================================
self.addEventListener('message', (event) => {
  console.log('[SW] Message received:', event.data);

  if (event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }

  if (event.data.type === 'CLEAR_CACHE') {
    caches.keys().then((names) => {
      names.forEach((name) => caches.delete(name));
    });
  }
});

console.log('[SW] Service Worker loaded');
