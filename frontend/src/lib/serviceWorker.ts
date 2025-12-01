/**
 * Service Worker Registration Utility
 * Registers the service worker and manages its lifecycle
 */

export const registerServiceWorker = async (): Promise<ServiceWorkerRegistration | undefined> => {
    if (typeof window === 'undefined' || !('serviceWorker' in navigator)) {
        console.log('[SW] Service workers not supported');
        return undefined;
    }

    try {
        const registration = await navigator.serviceWorker.register('/sw.js', {
            scope: '/',
        });

        console.log('[SW] Service worker registered:', registration);

        // Handle updates
        registration.addEventListener('updatefound', () => {
            const newWorker = registration.installing;
            if (!newWorker) return;

            newWorker.addEventListener('statechange', () => {
                if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                    console.log('[SW] New service worker available');

                    // Notify user of update (optional)
                    if (confirm('Nueva versión disponible. ¿Recargar para actualizar?')) {
                        newWorker.postMessage({ type: 'SKIP_WAITING' });
                        window.location.reload();
                    }
                }
            });
        });

        // Listen for controlling service worker change
        let refreshing = false;
        navigator.serviceWorker.addEventListener('controllerchange', () => {
            if (refreshing) return;
            refreshing = true;
            window.location.reload();
        });

        return registration;
    } catch (error) {
        console.error('[SW] Registration failed:', error);
        return undefined;
    }
};

export const unregisterServiceWorker = async (): Promise<boolean> => {
    if (typeof window === 'undefined' || !('serviceWorker' in navigator)) {
        return false;
    }

    try {
        const registration = await navigator.serviceWorker.getRegistration();
        if (registration) {
            const success = await registration.unregister();
            console.log('[SW] Service worker unregistered:', success);
            return success;
        }
        return false;
    } catch (error) {
        console.error('[SW] Unregistration failed:', error);
        return false;
    }
};

// Request persistent storage (optional, for larger caches)
export const requestPersistentStorage = async (): Promise<boolean> => {
    if (typeof window === 'undefined' || !navigator.storage?.persist) {
        return false;
    }

    try {
        const isPersisted = await navigator.storage.persist();
        console.log('[SW] Persistent storage:', isPersisted);
        return isPersisted;
    } catch (error) {
        console.error('[SW] Persistent storage request failed:', error);
        return false;
    }
};

// Check if app is running in standalone mode (installed PWA)
export const isStandalone = (): boolean => {
    if (typeof window === 'undefined') return false;

    return (
        window.matchMedia('(display-mode: standalone)').matches ||
        (window.navigator as any).standalone === true
    );
};

// Sync data when back online
export const syncWhenOnline = async (tag: string): Promise<void> => {
    if (!('serviceWorker' in navigator) || !('sync' in ServiceWorkerRegistration.prototype)) {
        console.log('[SW] Background sync not supported');
        return;
    }

    try {
        const registration = await navigator.serviceWorker.ready;
        await (registration as any).sync.register(tag);
        console.log('[SW] Background sync registered:', tag);
    } catch (error) {
        console.error('[SW] Background sync failed:', error);
    }
};
