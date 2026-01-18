/// <reference lib="webworker" />

/**
 * ARCHIVO: service-worker.ts
 * FUNCION: Service Worker para funcionalidad offline/PWA
 * IMPLEMENTACION: Basado en vercel/examples/pwa
 * BUILD: Compilar con: npx tsc --lib es2020,webworker service-worker.ts
 */

declare const self: ServiceWorkerGlobalScope;

// Background Sync API types
interface SyncEvent extends ExtendableEvent {
  readonly tag: string;
  readonly lastChance: boolean;
}

const CACHE_NAME = 'cermont-v1';
const OFFLINE_URL = '/offline';

// Recursos a cachear en instalación
const STATIC_ASSETS = ['/', '/offline', '/manifest.json', '/icon-192.png', '/icon-512.png'];

// Patrones de URLs a cachear dinámicamente
const CACHEABLE_PATTERNS = [/\/_next\/static\/.*/, /\/api\/ordenes\/.*/, /\/api\/clientes\/.*/];

// Evento de instalación
self.addEventListener('install', (event: ExtendableEvent) => {
  event.waitUntil(
    (async () => {
      const cache = await caches.open(CACHE_NAME);

      // Cachear recursos estáticos
      await cache.addAll(STATIC_ASSETS);

      // Forzar activación inmediata
      await self.skipWaiting();
    })()
  );
});

// Evento de activación
self.addEventListener('activate', (event: ExtendableEvent) => {
  event.waitUntil(
    (async () => {
      // Limpiar caches antiguos
      const cacheNames = await caches.keys();
      await Promise.all(
        cacheNames.filter(name => name !== CACHE_NAME).map(name => caches.delete(name))
      );

      // Tomar control de todos los clientes
      await self.clients.claim();
    })()
  );
});

// Evento fetch - estrategia network-first con fallback a cache
self.addEventListener('fetch', (event: FetchEvent) => {
  const { request } = event;
  const url = new URL(request.url);

  // Solo manejar requests del mismo origen
  if (url.origin !== location.origin) return;

  // Ignorar requests que no son GET
  if (request.method !== 'GET') return;

  event.respondWith(
    (async () => {
      try {
        // Intentar obtener de la red primero
        const networkResponse = await fetch(request);

        // Si es exitoso y cacheable, guardar en cache
        if (networkResponse.ok && shouldCache(url.pathname)) {
          const cache = await caches.open(CACHE_NAME);
          cache.put(request, networkResponse.clone());
        }

        return networkResponse;
      } catch (error) {
        // Si falla la red, buscar en cache
        const cachedResponse = await caches.match(request);

        if (cachedResponse) {
          return cachedResponse;
        }

        // Si es una navegación, mostrar página offline
        if (request.mode === 'navigate') {
          const offlineResponse = await caches.match(OFFLINE_URL);
          if (offlineResponse) {
            return offlineResponse;
          }
        }

        throw error;
      }
    })()
  );
});

// Determinar si una URL debe ser cacheada
function shouldCache(pathname: string): boolean {
  // Cachear assets estáticos de Next.js
  if (pathname.startsWith('/_next/static/')) return true;

  // Cachear APIs específicas
  if (pathname.startsWith('/api/ordenes/')) return true;
  if (pathname.startsWith('/api/clientes/')) return true;

  // Cachear páginas principales
  if (pathname === '/' || pathname === '/dashboard') return true;

  return false;
}

// Sincronización en background (cuando vuelve conexión)
self.addEventListener('sync', ((event: SyncEvent) => {
  if (event.tag === 'sync-ordenes') {
    event.waitUntil(syncPendingOrders());
  }
}) as EventListener);

// Sincronizar órdenes pendientes
async function syncPendingOrders() {
  try {
    // Obtener órdenes pendientes del IndexedDB
    // y enviarlas al servidor
    console.log('[SW] Sincronizando órdenes pendientes...');

    // TODO: Implementar lógica de sincronización
    // const pendingOrders = await getPendingOrdersFromIDB();
    // for (const order of pendingOrders) {
    //   await fetch('/api/ordenes', {
    //     method: 'POST',
    //     body: JSON.stringify(order),
    //   });
    // }
  } catch (error) {
    console.error('[SW] Error sincronizando:', error);
  }
}

// Push notifications
self.addEventListener('push', (event: PushEvent) => {
  const data = event.data?.json() ?? {
    title: 'CERMONT',
    body: 'Nueva notificación',
  };

  event.waitUntil(
    self.registration.showNotification(data.title, {
      body: data.body,
      icon: '/icon-192.png',
      badge: '/icon-192.png',
      tag: data.tag || 'default',
      data: data.url || '/',
    })
  );
});

// Click en notificación
self.addEventListener('notificationclick', (event: NotificationEvent) => {
  event.notification.close();

  event.waitUntil(
    self.clients.matchAll({ type: 'window' }).then(clients => {
      // Si hay una ventana abierta, enfocarla
      for (const client of clients) {
        if ('focus' in client) {
          return client.focus();
        }
      }
      // Si no, abrir una nueva
      return self.clients.openWindow(event.notification.data || '/');
    })
  );
});

export {};
