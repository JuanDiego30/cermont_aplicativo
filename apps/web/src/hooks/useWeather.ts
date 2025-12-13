// ============================================
// useWeather Hook - Estado y datos meteorológicos
// ============================================

import { useQuery } from '@tanstack/react-query';
import { weatherApi, WeatherSummary, WeatherData, WeatherAlert } from '@/services/weather.service';

export interface UseWeatherOptions {
  lat?: number;
  lon?: number;
  refetchInterval?: number;
  enabled?: boolean;
}

/**
 * Hook para obtener resumen meteorológico completo
 */
export function useWeatherSummary(options: UseWeatherOptions = {}) {
  const { lat, lon, refetchInterval = 5 * 60 * 1000, enabled = true } = options;

  return useQuery<WeatherSummary>({
    queryKey: ['weather', 'summary', lat, lon],
    queryFn: () => weatherApi.getSummary(lat, lon),
    refetchInterval,
    enabled,
    staleTime: 2 * 60 * 1000, // 2 minutos
  });
}

/**
 * Hook para obtener clima actual
 */
export function useCurrentWeather(options: UseWeatherOptions = {}) {
  const { lat, lon, refetchInterval = 5 * 60 * 1000, enabled = true } = options;

  return useQuery<WeatherData>({
    queryKey: ['weather', 'current', lat, lon],
    queryFn: () => weatherApi.getCurrentWeather(lat, lon),
    refetchInterval,
    enabled,
    staleTime: 2 * 60 * 1000,
  });
}

/**
 * Hook para obtener alertas meteorológicas
 */
export function useWeatherAlerts(options: UseWeatherOptions = {}) {
  const { lat, lon, refetchInterval = 5 * 60 * 1000, enabled = true } = options;

  return useQuery<WeatherAlert[]>({
    queryKey: ['weather', 'alerts', lat, lon],
    queryFn: () => weatherApi.getAlerts(lat, lon),
    refetchInterval,
    enabled,
    staleTime: 2 * 60 * 1000,
  });
}

/**
 * Hook combinado para el dashboard
 */
export function useWeather(options: UseWeatherOptions = {}) {
  const summary = useWeatherSummary(options);

  return {
    // Data
    current: summary.data?.current,
    rainfall: summary.data?.rainfall ?? [],
    alerts: summary.data?.alerts ?? [],
    hourly: summary.data?.hourlyNext12 ?? [],
    lastUpdated: summary.data?.lastUpdated,

    // State
    isLoading: summary.isLoading,
    isError: summary.isError,
    error: summary.error,
    isFetching: summary.isFetching,

    // Actions
    refetch: summary.refetch,
  };
}

export default useWeather;
