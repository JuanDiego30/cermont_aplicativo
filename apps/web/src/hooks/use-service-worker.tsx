/**
 * ARCHIVO: hooks/use-service-worker.ts
 * FUNCION: Hook para registrar y gestionar Service Worker
 * IMPLEMENTACION: Basado en vercel/examples/pwa
 */
'use client';

import { useEffect, useState, useCallback } from 'react';

interface ServiceWorkerState {
  isSupported: boolean;
  isRegistered: boolean;
  isOnline: boolean;
  registration: ServiceWorkerRegistration | null;
  updateAvailable: boolean;
}

/**
 * Hook para gestionar el Service Worker
 */
export function useServiceWorker() {
  const [state, setState] = useState<ServiceWorkerState>({
    isSupported: false,
    isRegistered: false,
    isOnline: true,
    registration: null,
    updateAvailable: false,
  });

  // Registrar Service Worker
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const isSupported = 'serviceWorker' in navigator;
    setState((prev) => ({ ...prev, isSupported }));

    if (!isSupported) return;

    // Registrar SW
    const registerSW = async () => {
      try {
        const registration = await navigator.serviceWorker.register(
          '/service-worker.js',
          { scope: '/' }
        );

        setState((prev) => ({
          ...prev,
          isRegistered: true,
          registration,
        }));

        // Verificar actualizaciones
        registration.addEventListener('updatefound', () => {
          const newWorker = registration.installing;
          if (newWorker) {
            newWorker.addEventListener('statechange', () => {
              if (
                newWorker.state === 'installed' &&
                navigator.serviceWorker.controller
              ) {
                setState((prev) => ({ ...prev, updateAvailable: true }));
              }
            });
          }
        });

        console.log('[SW] Service Worker registrado correctamente');
      } catch (error) {
        console.error('[SW] Error al registrar Service Worker:', error);
      }
    };

    registerSW();
  }, []);

  // Monitor de conexión
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const handleOnline = () => {
      setState((prev) => ({ ...prev, isOnline: true }));
      // Trigger sync cuando vuelve la conexión
      if (state.registration && 'sync' in state.registration) {
        (state.registration as any).sync.register('sync-ordenes');
      }
    };

    const handleOffline = () => {
      setState((prev) => ({ ...prev, isOnline: false }));
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // Estado inicial
    setState((prev) => ({ ...prev, isOnline: navigator.onLine }));

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [state.registration]);

  // Función para aplicar actualización
  const applyUpdate = useCallback(() => {
    if (state.registration?.waiting) {
      state.registration.waiting.postMessage({ type: 'SKIP_WAITING' });
      window.location.reload();
    }
  }, [state.registration]);

  // Función para solicitar permisos de notificación
  const requestNotificationPermission = useCallback(async () => {
    if (!('Notification' in window)) {
      console.log('[SW] Notificaciones no soportadas');
      return false;
    }

    const permission = await Notification.requestPermission();
    return permission === 'granted';
  }, []);

  // Función para suscribirse a push notifications
  const subscribeToPush = useCallback(async () => {
    if (!state.registration) return null;

    try {
      const subscription = await state.registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY,
      });

      // Enviar subscription al servidor
      await fetch('/api/push/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(subscription),
      });

      return subscription;
    } catch (error) {
      console.error('[SW] Error al suscribirse a push:', error);
      return null;
    }
  }, [state.registration]);

  return {
    ...state,
    applyUpdate,
    requestNotificationPermission,
    subscribeToPush,
  };
}

/**
 * Componente para mostrar banner de actualización disponible
 */
interface UpdateBannerProps {
  onUpdate: () => void;
  onDismiss: () => void;
}

export function UpdateBanner({ onUpdate, onDismiss }: UpdateBannerProps) {
  return (
    <div className="fixed bottom-4 left-4 right-4 md:left-auto md:right-4 md:w-96 bg-blue-600 text-white p-4 rounded-lg shadow-lg z-50">
      <div className="flex items-center justify-between">
        <div>
          <p className="font-medium">Nueva versión disponible</p>
          <p className="text-sm opacity-90">Actualiza para obtener las últimas mejoras</p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={onDismiss}
            className="px-3 py-1 text-sm bg-blue-700 hover:bg-blue-800 rounded"
          >
            Después
          </button>
          <button
            onClick={onUpdate}
            className="px-3 py-1 text-sm bg-white text-blue-600 hover:bg-gray-100 rounded font-medium"
          >
            Actualizar
          </button>
        </div>
      </div>
    </div>
  );
}

/**
 * Componente para mostrar indicador offline
 */
export function OfflineIndicator() {
  const { isOnline } = useServiceWorker();

  if (isOnline) return null;

  return (
    <div className="fixed top-0 left-0 right-0 bg-yellow-500 text-yellow-900 text-center py-2 text-sm font-medium z-50">
      📡 Sin conexión - Trabajando en modo offline
    </div>
  );
}
