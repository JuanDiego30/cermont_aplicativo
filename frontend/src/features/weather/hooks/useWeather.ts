/**
 * Weather Hooks
 */

import { useQuery } from '@tanstack/react-query';
import { useAuth } from '@/features/auth/context/AuthContext';
import { weatherApi } from '../api';
import type { WeatherLocation } from '../types';
import { CANO_LIMON_COORDS } from '../types';

/**
 * Hook to check if user is authenticated and ready
 */
function useIsReady(): boolean {
  const { isAuthenticated, isLoading, isReady } = useAuth();
  return !isLoading && isAuthenticated && isReady;
}

/**
 * Hook for fetching current weather
 * Only fetches when user is authenticated
 */
export function useCurrentWeather(location?: WeatherLocation) {
  const coords = location ?? CANO_LIMON_COORDS;
  const isEnabled = useIsReady();
  
  return useQuery({
    queryKey: ['weather', 'current', coords.lat, coords.lon],
    queryFn: () => weatherApi.getCurrentWeather(coords),
    staleTime: 10 * 60 * 1000, // 10 minutes
    refetchInterval: isEnabled ? 15 * 60 * 1000 : false, // 15 minutes auto-refresh only if auth'd
    retry: 2,
    enabled: isEnabled,
  });
}

/**
 * Hook for fetching weather forecast
 * Only fetches when user is authenticated
 */
export function useWeatherForecast(location?: WeatherLocation) {
  const coords = location ?? CANO_LIMON_COORDS;
  const isEnabled = useIsReady();
  
  return useQuery({
    queryKey: ['weather', 'forecast', coords.lat, coords.lon],
    queryFn: () => weatherApi.getForecast(coords),
    staleTime: 30 * 60 * 1000, // 30 minutes
    refetchInterval: isEnabled ? 60 * 60 * 1000 : false, // 1 hour auto-refresh only if auth'd
    retry: 2,
    enabled: isEnabled,
  });
}

/**
 * Hook for fetching multiple locations' weather
 * Only fetches when user is authenticated
 */
export function useMultiLocationWeather(locations: WeatherLocation[]) {
  const isAuthReady = useIsReady();
  
  return useQuery({
    queryKey: ['weather', 'multi', locations.map(l => `${l.lat},${l.lon}`).join('|')],
    queryFn: async () => {
      const results = await Promise.allSettled(
        locations.map(loc => weatherApi.getCurrentWeather(loc))
      );
      return results.map((result, index) => ({
        location: locations[index],
        data: result.status === 'fulfilled' ? result.value : null,
        error: result.status === 'rejected' ? result.reason : null,
      }));
    },
    staleTime: 10 * 60 * 1000, // 10 minutes
    enabled: locations.length > 0 && isAuthReady,
  });
}
