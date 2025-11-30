/**
 * Service Worker Registration
 * Handles SW lifecycle and updates
 */

type SWConfig = {
  onUpdate?: (registration: ServiceWorkerRegistration) => void;
  onSuccess?: (registration: ServiceWorkerRegistration) => void;
  onOffline?: () => void;
  onOnline?: () => void;
};

let swRegistration: ServiceWorkerRegistration | null = null;

export function registerServiceWorker(config?: SWConfig) {
  if (typeof window === 'undefined') {
    return;
  }

  if (!('serviceWorker' in navigator)) {
    console.log('[SW] Service Worker not supported in this browser');
    return;
  }

  window.addEventListener('load', () => {
    const swUrl = '/sw.js';

    navigator.serviceWorker
      .register(swUrl)
      .then((registration) => {
        swRegistration = registration;
        console.log('✅ Service Worker registered:', registration.scope);

        // Check for updates periodically (every 60 seconds)
        setInterval(() => {
          registration.update();
        }, 60000);

        // Handle updates
        registration.onupdatefound = () => {
          const installingWorker = registration.installing;
          
          if (!installingWorker) return;

          installingWorker.onstatechange = () => {
            if (installingWorker.state === 'installed') {
              if (navigator.serviceWorker.controller) {
                // New content available
                console.log('[SW] New content available, refresh to update');
                config?.onUpdate?.(registration);
              } else {
                // Content cached for offline use
                console.log('[SW] Content cached for offline use');
                config?.onSuccess?.(registration);
              }
            }
          };
        };
      })
      .catch((error) => {
        console.error('❌ Service Worker registration failed:', error);
      });

    // Listen for controller change (when new SW takes over)
    navigator.serviceWorker.addEventListener('controllerchange', () => {
      console.log('[SW] Controller changed, new Service Worker activated');
    });

    // Listen for messages from Service Worker
    navigator.serviceWorker.addEventListener('message', (event) => {
      console.log('[SW] Message from Service Worker:', event.data);
      
      if (event.data.type === 'SYNC_REQUIRED') {
        // Trigger sync in the app
        window.dispatchEvent(new CustomEvent('sw-sync-required'));
      }
    });
  });

  // Online/Offline handlers
  window.addEventListener('online', () => {
    console.log('🟢 Connection restored');
    config?.onOnline?.();
    window.dispatchEvent(new CustomEvent('connection-restored'));
  });

  window.addEventListener('offline', () => {
    console.log('🔴 Connection lost');
    config?.onOffline?.();
    window.dispatchEvent(new CustomEvent('connection-lost'));
  });
}

export function unregisterServiceWorker() {
  if (typeof window === 'undefined' || !('serviceWorker' in navigator)) {
    return Promise.resolve();
  }

  return navigator.serviceWorker.ready
    .then((registration) => {
      return registration.unregister();
    })
    .then(() => {
      console.log('[SW] Service Worker unregistered');
      swRegistration = null;
    })
    .catch((error) => {
      console.error('[SW] Error unregistering Service Worker:', error);
    });
}

export function getServiceWorkerRegistration() {
  return swRegistration;
}

export function skipWaiting() {
  if (swRegistration?.waiting) {
    swRegistration.waiting.postMessage({ type: 'SKIP_WAITING' });
  }
}

export function clearCache() {
  if (navigator.serviceWorker.controller) {
    navigator.serviceWorker.controller.postMessage({ type: 'CLEAR_CACHE' });
  }
}

export function cacheUrls(urls: string[]) {
  if (navigator.serviceWorker.controller) {
    navigator.serviceWorker.controller.postMessage({ 
      type: 'CACHE_URLS',
      urls 
    });
  }
}

// Request background sync
export async function requestBackgroundSync(tag: string) {
  if (!swRegistration) {
    console.warn('[SW] No Service Worker registration available');
    return false;
  }

  if ('sync' in swRegistration) {
    try {
      await (swRegistration as any).sync.register(tag);
      console.log('[SW] Background sync registered:', tag);
      return true;
    } catch (error) {
      console.error('[SW] Background sync registration failed:', error);
      return false;
    }
  }

  console.warn('[SW] Background Sync not supported');
  return false;
}
