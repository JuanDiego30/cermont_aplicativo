'use client';

import { useEffect, useState, createContext, useContext, ReactNode } from 'react';
import { registerServiceWorker, skipWaiting } from '@/core/offline';

interface SWContextType {
  isReady: boolean;
  hasUpdate: boolean;
  updateAvailable: () => void;
}

const SWContext = createContext<SWContextType>({
  isReady: false,
  hasUpdate: false,
  updateAvailable: () => {},
});

export function useSW() {
  return useContext(SWContext);
}

interface ServiceWorkerProviderProps {
  children: ReactNode;
}

export function ServiceWorkerProvider({ children }: ServiceWorkerProviderProps) {
  const [isReady, setIsReady] = useState(false);
  const [hasUpdate, setHasUpdate] = useState(false);

  useEffect(() => {
    registerServiceWorker({
      onSuccess: () => {
        console.log('[SWProvider] Service Worker ready for offline use');
        setIsReady(true);
      },
      onUpdate: () => {
        console.log('[SWProvider] New content available');
        setHasUpdate(true);
      },
      onOnline: () => {
        console.log('[SWProvider] App is online');
      },
      onOffline: () => {
        console.log('[SWProvider] App is offline');
      },
    });
  }, []);

  const updateAvailable = () => {
    skipWaiting();
    window.location.reload();
  };

  return (
    <SWContext.Provider value={{ isReady, hasUpdate, updateAvailable }}>
      {children}
      
      {/* Update notification */}
      {hasUpdate && (
        <div className="fixed bottom-20 right-4 z-50 bg-blue-600 text-white px-4 py-3 rounded-xl shadow-lg flex items-center gap-3">
          <div>
            <p className="font-medium text-sm">Nueva versión disponible</p>
            <p className="text-xs text-white/80">Actualiza para obtener las mejoras</p>
          </div>
          <button
            onClick={updateAvailable}
            className="px-3 py-1 bg-white text-blue-600 rounded-lg text-sm font-medium hover:bg-blue-50 transition-colors"
          >
            Actualizar
          </button>
        </div>
      )}
    </SWContext.Provider>
  );
}

export default ServiceWorkerProvider;
