/**
 * Weather Hooks
 */

import { useQuery } from '@tanstack/react-query';
import { weatherApi } from '../api';
import type { WeatherLocation } from '../types';
import { CANO_LIMON_COORDS } from '../types';

/**
 * Hook for fetching current weather
 */
export function useCurrentWeather(location?: WeatherLocation) {
  const coords = location ?? CANO_LIMON_COORDS;
  
  return useQuery({
    queryKey: ['weather', 'current', coords.lat, coords.lon],
    queryFn: () => weatherApi.getCurrentWeather(coords),
    staleTime: 10 * 60 * 1000, // 10 minutes
    refetchInterval: 15 * 60 * 1000, // 15 minutes auto-refresh
    retry: 2,
  });
}

/**
 * Hook for fetching weather forecast
 */
export function useWeatherForecast(location?: WeatherLocation) {
  const coords = location ?? CANO_LIMON_COORDS;
  
  return useQuery({
    queryKey: ['weather', 'forecast', coords.lat, coords.lon],
    queryFn: () => weatherApi.getForecast(coords),
    staleTime: 30 * 60 * 1000, // 30 minutes
    refetchInterval: 60 * 60 * 1000, // 1 hour auto-refresh
    retry: 2,
  });
}

/**
 * Hook for fetching multiple locations' weather
 */
export function useMultiLocationWeather(locations: WeatherLocation[]) {
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
    enabled: locations.length > 0,
  });
}
