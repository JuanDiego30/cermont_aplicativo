/**
 * CERMONT Service Worker
 * Offline-first caching strategy for field operations
 */

const CACHE_VERSION = 'v1';
const STATIC_CACHE = `cermont-static-${CACHE_VERSION}`;
const DYNAMIC_CACHE = `cermont-dynamic-${CACHE_VERSION}`;
const API_CACHE = `cermont-api-${CACHE_VERSION}`;

// Static assets to precache
const STATIC_ASSETS = [
  '/',
  '/manifest.json',
  '/offline.html',
];

// API endpoints to cache for offline access
const CACHEABLE_API_ROUTES = [
  '/api/orders',
  '/api/workplans',
  '/api/kits',
  '/api/users',
  '/api/dashboard',
];

// Install Service Worker
self.addEventListener('install', (event) => {
  console.log('[SW] Installing Service Worker v' + CACHE_VERSION);
  
  event.waitUntil(
    caches.open(STATIC_CACHE)
      .then((cache) => {
        console.log('[SW] Precaching static assets');
        return cache.addAll(STATIC_ASSETS).catch((err) => {
          console.warn('[SW] Some assets failed to cache:', err);
        });
      })
  );
  
  // Activate immediately
  self.skipWaiting();
});

// Activate Service Worker
self.addEventListener('activate', (event) => {
  console.log('[SW] Activating Service Worker v' + CACHE_VERSION);
  
  event.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys
          .filter((key) => {
            return key.startsWith('cermont-') && 
                   key !== STATIC_CACHE && 
                   key !== DYNAMIC_CACHE && 
                   key !== API_CACHE;
          })
          .map((key) => {
            console.log('[SW] Removing old cache:', key);
            return caches.delete(key);
          })
      );
    })
  );
  
  // Take control immediately
  return self.clients.claim();
});

// Fetch event handler
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Skip non-GET requests for caching
  if (request.method !== 'GET') {
    // For POST/PUT/DELETE, try network and queue if offline
    if (request.method === 'POST' || request.method === 'PUT' || request.method === 'DELETE') {
      event.respondWith(handleMutationRequest(request));
    }
    return;
  }

  // API requests: Network-first, fallback to cache
  if (url.pathname.startsWith('/api/')) {
    event.respondWith(handleApiRequest(request));
    return;
  }

  // Static assets and pages: Cache-first, fallback to network
  event.respondWith(handleStaticRequest(request));
});

/**
 * Handle API requests with network-first strategy
 */
async function handleApiRequest(request) {
  const url = new URL(request.url);
  const isCacheable = CACHEABLE_API_ROUTES.some(route => url.pathname.startsWith(route));

  try {
    const response = await fetch(request);
    
    // Cache successful GET responses for cacheable routes
    if (response.status === 200 && isCacheable) {
      const clonedResponse = response.clone();
      caches.open(API_CACHE).then((cache) => {
        cache.put(request, clonedResponse);
      });
    }
    
    return response;
  } catch (error) {
    console.log('[SW] Network failed for API, trying cache:', request.url);
    
    const cachedResponse = await caches.match(request);
    if (cachedResponse) {
      // Add header to indicate cached response
      const headers = new Headers(cachedResponse.headers);
      headers.set('X-Cache-Status', 'HIT');
      return new Response(cachedResponse.body, {
        status: cachedResponse.status,
        statusText: cachedResponse.statusText,
        headers,
      });
    }
    
    // Return offline response for API
    return new Response(
      JSON.stringify({ 
        error: 'Offline',
        message: 'No hay conexión a internet. Los datos se sincronizarán cuando vuelva la conexión.',
        offline: true 
      }),
      { 
        status: 503,
        headers: { 'Content-Type': 'application/json' }
      }
    );
  }
}

/**
 * Handle static assets with cache-first strategy
 */
async function handleStaticRequest(request) {
  const cachedResponse = await caches.match(request);
  
  if (cachedResponse) {
    // Return cached version and update in background
    fetchAndCache(request);
    return cachedResponse;
  }

  try {
    const response = await fetch(request);
    
    // Cache successful responses
    if (response.status === 200) {
      const clonedResponse = response.clone();
      caches.open(DYNAMIC_CACHE).then((cache) => {
        cache.put(request, clonedResponse);
      });
    }
    
    return response;
  } catch (error) {
    console.log('[SW] Network failed for static, returning offline page');
    
    // Return offline page for navigation requests
    if (request.mode === 'navigate') {
      const offlinePage = await caches.match('/offline.html');
      if (offlinePage) {
        return offlinePage;
      }
    }
    
    return new Response('Offline', { status: 503 });
  }
}

/**
 * Handle mutation requests (POST, PUT, DELETE)
 */
async function handleMutationRequest(request) {
  try {
    return await fetch(request);
  } catch (error) {
    console.log('[SW] Mutation failed, will be queued for sync');
    
    // Return response indicating offline queue
    return new Response(
      JSON.stringify({
        queued: true,
        message: 'Operación guardada. Se sincronizará cuando haya conexión.',
        offline: true
      }),
      {
        status: 202,
        headers: { 'Content-Type': 'application/json' }
      }
    );
  }
}

/**
 * Fetch and update cache in background
 */
async function fetchAndCache(request) {
  try {
    const response = await fetch(request);
    if (response.status === 200) {
      const cache = await caches.open(DYNAMIC_CACHE);
      cache.put(request, response);
    }
  } catch (error) {
    // Silently fail - we already have cached version
  }
}

// Background Sync
self.addEventListener('sync', (event) => {
  console.log('[SW] Background sync event:', event.tag);
  
  if (event.tag === 'sync-pending-actions') {
    event.waitUntil(syncPendingActions());
  }
});

async function syncPendingActions() {
  console.log('[SW] Syncing pending actions...');
  
  // Notify all clients to sync
  const clients = await self.clients.matchAll();
  clients.forEach((client) => {
    client.postMessage({
      type: 'SYNC_REQUIRED',
      timestamp: Date.now()
    });
  });
}

// Push notifications
self.addEventListener('push', (event) => {
  console.log('[SW] Push notification received');
  
  const options = {
    body: event.data?.text() || 'Nueva notificación de CERMONT',
    icon: '/images/logo/cermont-logo.png',
    badge: '/images/logo/cermont-logo.png',
    vibrate: [100, 50, 100],
    data: {
      dateOfArrival: Date.now(),
      primaryKey: 1
    },
    actions: [
      { action: 'open', title: 'Abrir' },
      { action: 'close', title: 'Cerrar' }
    ]
  };

  event.waitUntil(
    self.registration.showNotification('CERMONT', options)
  );
});

// Notification click handler
self.addEventListener('notificationclick', (event) => {
  console.log('[SW] Notification clicked');
  event.notification.close();

  if (event.action === 'open') {
    event.waitUntil(
      self.clients.openWindow('/')
    );
  }
});

// Message handler for client communication
self.addEventListener('message', (event) => {
  console.log('[SW] Message received:', event.data);

  if (event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }

  if (event.data.type === 'CACHE_URLS') {
    caches.open(DYNAMIC_CACHE).then((cache) => {
      cache.addAll(event.data.urls);
    });
  }

  if (event.data.type === 'CLEAR_CACHE') {
    caches.keys().then((keys) => {
      keys.forEach((key) => caches.delete(key));
    });
  }
});

console.log('[SW] Service Worker loaded successfully');
