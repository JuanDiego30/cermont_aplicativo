// ============================================
// useWeather Hook - Estado y datos meteorológicos con SWR
// ============================================

'use client';

import useSWR from 'swr';
import { weatherApi, WeatherSummary, WeatherData, WeatherAlert } from '@/services/weather.service';
import { swrKeys } from '@/lib/swr-config';

export interface UseWeatherOptions {
  lat?: number;
  lon?: number;
  refreshInterval?: number;
  enabled?: boolean;
}

/**
 * Hook para obtener resumen meteorológico completo
 */
export function useWeatherSummary(options: UseWeatherOptions = {}) {
  const { lat, lon, refreshInterval = 5 * 60 * 1000, enabled = true } = options;
  const isEnabled = enabled && lat !== undefined && lon !== undefined;

  return useSWR<WeatherSummary>(
    isEnabled ? swrKeys.weather.summary(lat!, lon!) : null,
    () => weatherApi.getSummary(lat!, lon!),
    {
      refreshInterval,
      revalidateOnFocus: false,
      dedupingInterval: 2 * 60 * 1000, // 2 minutos
    }
  );
}

/**
 * Hook para obtener clima actual
 */
export function useCurrentWeather(options: UseWeatherOptions = {}) {
  const { lat, lon, refreshInterval = 5 * 60 * 1000, enabled = true } = options;
  const isEnabled = enabled && lat !== undefined && lon !== undefined;

  return useSWR<WeatherData>(
    isEnabled ? swrKeys.weather.current(lat!, lon!) : null,
    () => weatherApi.getCurrentWeather(lat!, lon!),
    {
      refreshInterval,
      revalidateOnFocus: false,
      dedupingInterval: 2 * 60 * 1000,
    }
  );
}

/**
 * Hook para obtener alertas meteorológicas
 */
export function useWeatherAlerts(options: UseWeatherOptions = {}) {
  const { lat, lon, refreshInterval = 5 * 60 * 1000, enabled = true } = options;
  const isEnabled = enabled && lat !== undefined && lon !== undefined;

  return useSWR<WeatherAlert[]>(
    isEnabled ? swrKeys.weather.alerts(lat!, lon!) : null,
    () => weatherApi.getAlerts(lat!, lon!),
    {
      refreshInterval,
      revalidateOnFocus: false,
      dedupingInterval: 2 * 60 * 1000,
    }
  );
}



/**
 * Hook combinado para clima con geolocalización
 */
export function useWeatherWithGeolocation() {
  // Hook para obtener ubicación actual
  const getLocation = (): Promise<{ lat: number; lon: number }> => {
    return new Promise((resolve, reject) => {
      if (!navigator.geolocation) {
        reject(new Error('Geolocation not supported'));
        return;
      }
      navigator.geolocation.getCurrentPosition(
        (position) => {
          resolve({
            lat: position.coords.latitude,
            lon: position.coords.longitude,
          });
        },
        (error) => reject(error),
        { timeout: 10000 }
      );
    });
  };

  return useSWR(
    'weather:geolocation',
    async () => {
      const location = await getLocation();
      const summary = await weatherApi.getSummary(location.lat, location.lon);
      return { ...summary, location };
    },
    {
      revalidateOnFocus: false,
      refreshInterval: 10 * 60 * 1000, // 10 minutos
      errorRetryCount: 2,
    }
  );
}
