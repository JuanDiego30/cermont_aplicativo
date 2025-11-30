/**
 * Weather API Service
 */

import { apiClient } from '@/core/api';
import type { CurrentWeather, WeatherForecastData, WeatherLocation } from '../types';
import { CANO_LIMON_COORDS } from '../types';

const ENDPOINT = '/weather';

export const weatherApi = {
  /**
   * Get current weather for a location
   */
  async getCurrentWeather(location?: WeatherLocation): Promise<CurrentWeather> {
    const { lat, lon } = location ?? CANO_LIMON_COORDS;
    return apiClient.get<CurrentWeather>(`${ENDPOINT}/current?lat=${lat}&lon=${lon}`);
  },

  /**
   * Get 5-day weather forecast for a location
   */
  async getForecast(location?: WeatherLocation): Promise<WeatherForecastData> {
    const { lat, lon } = location ?? CANO_LIMON_COORDS;
    return apiClient.get<WeatherForecastData>(`${ENDPOINT}/forecast?lat=${lat}&lon=${lon}`);
  },
};

export default weatherApi;
