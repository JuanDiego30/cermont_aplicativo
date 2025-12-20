import useSWR from 'swr';
import { weatherApi } from '../api/weather-api';

const KEYS = {
  CURRENT: '/weather/current',
  FORECAST: '/weather/forecast',
};

export function useWeather(params: { latitud: number; longitud: number; fecha?: string }) {
  const key = [KEYS.CURRENT, JSON.stringify(params)];
  return useSWR(
    params.latitud && params.longitud ? key : null,
    () => weatherApi.getWeather(params),
    {
      dedupingInterval: 10 * 60 * 1000,
    }
  );
}

export function useWeatherForecast(params: { latitud: number; longitud: number; dias?: number }) {
  const key = [KEYS.FORECAST, JSON.stringify(params)];
  return useSWR(
    params.latitud && params.longitud ? key : null,
    () => weatherApi.getForecast(params),
    {
      dedupingInterval: 30 * 60 * 1000,
    }
  );
}
