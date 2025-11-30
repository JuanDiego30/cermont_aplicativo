'use client';

import { useState, useEffect, useCallback } from 'react';

interface OnlineStatus {
  isOnline: boolean;
  wasOffline: boolean;
  lastOnlineAt: Date | null;
  lastOfflineAt: Date | null;
  connectionType: string | null;
  effectiveType: string | null;
}

interface NetworkInfo {
  downlink?: number;
  effectiveType?: string;
  rtt?: number;
  saveData?: boolean;
}

export function useOnlineStatus() {
  const [status, setStatus] = useState<OnlineStatus>({
    isOnline: typeof navigator !== 'undefined' ? navigator.onLine : true,
    wasOffline: false,
    lastOnlineAt: null,
    lastOfflineAt: null,
    connectionType: null,
    effectiveType: null,
  });

  const updateNetworkInfo = useCallback(() => {
    if (typeof navigator !== 'undefined' && 'connection' in navigator) {
      const connection = (navigator as any).connection as NetworkInfo;
      setStatus((prev) => ({
        ...prev,
        connectionType: connection?.effectiveType || null,
        effectiveType: connection?.effectiveType || null,
      }));
    }
  }, []);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const handleOnline = () => {
      console.log('🟢 useOnlineStatus: Connection restored');
      setStatus((prev) => ({
        ...prev,
        isOnline: true,
        wasOffline: true,
        lastOnlineAt: new Date(),
      }));
      updateNetworkInfo();
    };

    const handleOffline = () => {
      console.log('🔴 useOnlineStatus: Connection lost');
      setStatus((prev) => ({
        ...prev,
        isOnline: false,
        lastOfflineAt: new Date(),
      }));
    };

    // Set initial state
    setStatus((prev) => ({
      ...prev,
      isOnline: navigator.onLine,
    }));
    updateNetworkInfo();

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // Listen for connection changes
    if ('connection' in navigator) {
      const connection = (navigator as any).connection;
      connection?.addEventListener('change', updateNetworkInfo);
    }

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
      
      if ('connection' in navigator) {
        const connection = (navigator as any).connection;
        connection?.removeEventListener('change', updateNetworkInfo);
      }
    };
  }, [updateNetworkInfo]);

  const resetWasOffline = useCallback(() => {
    setStatus((prev) => ({
      ...prev,
      wasOffline: false,
    }));
  }, []);

  return {
    ...status,
    resetWasOffline,
  };
}

// Simple version for basic online/offline check
export function useIsOnline(): boolean {
  const [isOnline, setIsOnline] = useState(
    typeof navigator !== 'undefined' ? navigator.onLine : true
  );

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  return isOnline;
}
