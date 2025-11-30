'use client';

import { useState, useEffect, useCallback, useRef } from 'react';

export interface GeolocationPosition {
  latitude: number;
  longitude: number;
  accuracy: number;
  altitude: number | null;
  altitudeAccuracy: number | null;
  heading: number | null;
  speed: number | null;
  timestamp: number;
}

export interface GeolocationOptions {
  enableHighAccuracy?: boolean;
  timeout?: number;
  maximumAge?: number;
  watchPosition?: boolean;
}

export interface UseGeolocationReturn {
  // State
  position: GeolocationPosition | null;
  error: string | null;
  isLoading: boolean;
  isSupported: boolean;
  hasPermission: boolean | null;
  
  // Actions
  getCurrentPosition: () => Promise<GeolocationPosition | null>;
  startWatching: () => void;
  stopWatching: () => void;
  clearError: () => void;
  
  // Utilities
  getGoogleMapsUrl: () => string | null;
  getDistanceTo: (lat: number, lng: number) => number | null;
  formatPosition: () => string | null;
}

const defaultOptions: GeolocationOptions = {
  enableHighAccuracy: true,
  timeout: 10000,
  maximumAge: 60000, // 1 minute cache
  watchPosition: false,
};

export function useGeolocation(options: GeolocationOptions = {}): UseGeolocationReturn {
  const opts = { ...defaultOptions, ...options };
  
  const [position, setPosition] = useState<GeolocationPosition | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);
  
  const watchIdRef = useRef<number | null>(null);
  
  const isSupported = typeof navigator !== 'undefined' && 'geolocation' in navigator;

  const handleSuccess = useCallback((pos: globalThis.GeolocationPosition) => {
    const newPosition: GeolocationPosition = {
      latitude: pos.coords.latitude,
      longitude: pos.coords.longitude,
      accuracy: pos.coords.accuracy,
      altitude: pos.coords.altitude,
      altitudeAccuracy: pos.coords.altitudeAccuracy,
      heading: pos.coords.heading,
      speed: pos.coords.speed,
      timestamp: pos.timestamp,
    };
    
    setPosition(newPosition);
    setError(null);
    setIsLoading(false);
    setHasPermission(true);
  }, []);

  const handleError = useCallback((err: GeolocationPositionError) => {
    setIsLoading(false);
    
    switch (err.code) {
      case err.PERMISSION_DENIED:
        setError('Permiso de ubicación denegado. Por favor, habilítalo en la configuración.');
        setHasPermission(false);
        break;
      case err.POSITION_UNAVAILABLE:
        setError('La información de ubicación no está disponible.');
        break;
      case err.TIMEOUT:
        setError('Se agotó el tiempo para obtener la ubicación.');
        break;
      default:
        setError('Error desconocido al obtener la ubicación.');
    }
  }, []);

  const getCurrentPosition = useCallback(async (): Promise<GeolocationPosition | null> => {
    if (!isSupported) {
      setError('La geolocalización no está soportada en este navegador.');
      return null;
    }

    setIsLoading(true);
    setError(null);

    return new Promise((resolve) => {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          handleSuccess(pos);
          resolve({
            latitude: pos.coords.latitude,
            longitude: pos.coords.longitude,
            accuracy: pos.coords.accuracy,
            altitude: pos.coords.altitude,
            altitudeAccuracy: pos.coords.altitudeAccuracy,
            heading: pos.coords.heading,
            speed: pos.coords.speed,
            timestamp: pos.timestamp,
          });
        },
        (err) => {
          handleError(err);
          resolve(null);
        },
        {
          enableHighAccuracy: opts.enableHighAccuracy,
          timeout: opts.timeout,
          maximumAge: opts.maximumAge,
        }
      );
    });
  }, [isSupported, handleSuccess, handleError, opts.enableHighAccuracy, opts.timeout, opts.maximumAge]);

  const startWatching = useCallback(() => {
    if (!isSupported) {
      setError('La geolocalización no está soportada en este navegador.');
      return;
    }

    if (watchIdRef.current !== null) {
      return; // Already watching
    }

    setIsLoading(true);
    setError(null);

    watchIdRef.current = navigator.geolocation.watchPosition(
      handleSuccess,
      handleError,
      {
        enableHighAccuracy: opts.enableHighAccuracy,
        timeout: opts.timeout,
        maximumAge: opts.maximumAge,
      }
    );
  }, [isSupported, handleSuccess, handleError, opts.enableHighAccuracy, opts.timeout, opts.maximumAge]);

  const stopWatching = useCallback(() => {
    if (watchIdRef.current !== null) {
      navigator.geolocation.clearWatch(watchIdRef.current);
      watchIdRef.current = null;
      setIsLoading(false);
    }
  }, []);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (watchIdRef.current !== null) {
        navigator.geolocation.clearWatch(watchIdRef.current);
      }
    };
  }, []);

  // Auto-watch if option is enabled
  useEffect(() => {
    if (opts.watchPosition && isSupported) {
      startWatching();
    }
  }, [opts.watchPosition, isSupported, startWatching]);

  // Utility: Get Google Maps URL
  const getGoogleMapsUrl = useCallback((): string | null => {
    if (!position) return null;
    return `https://www.google.com/maps?q=${position.latitude},${position.longitude}`;
  }, [position]);

  // Utility: Calculate distance to another point (Haversine formula)
  const getDistanceTo = useCallback((targetLat: number, targetLng: number): number | null => {
    if (!position) return null;

    const R = 6371; // Earth's radius in km
    const dLat = toRad(targetLat - position.latitude);
    const dLng = toRad(targetLng - position.longitude);
    
    const a = 
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(toRad(position.latitude)) * Math.cos(toRad(targetLat)) *
      Math.sin(dLng / 2) * Math.sin(dLng / 2);
    
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    
    return R * c; // Distance in km
  }, [position]);

  // Utility: Format position as string
  const formatPosition = useCallback((): string | null => {
    if (!position) return null;
    return `${position.latitude.toFixed(6)}, ${position.longitude.toFixed(6)}`;
  }, [position]);

  return {
    position,
    error,
    isLoading,
    isSupported,
    hasPermission,
    getCurrentPosition,
    startWatching,
    stopWatching,
    clearError,
    getGoogleMapsUrl,
    getDistanceTo,
    formatPosition,
  };
}

// Helper function
function toRad(deg: number): number {
  return deg * (Math.PI / 180);
}

export default useGeolocation;
