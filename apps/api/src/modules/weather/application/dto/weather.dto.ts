/**
 * @module Weather - Clean Architecture
 */
import { z } from 'zod';

// DTOs
export const WeatherQuerySchema = z.object({
  lat: z.coerce.number().min(-90).max(90),
  lon: z.coerce.number().min(-180).max(180),
});

export type WeatherQueryDto = z.infer<typeof WeatherQuerySchema>;

export interface CurrentWeather {
  temperature: number;
  humidity: number;
  windSpeed: number;
  weatherCode: number;
  description: string;
  isRainy: boolean;
}

export interface WeatherForecast {
  date: string;
  temperatureMax: number;
  temperatureMin: number;
  precipitationProbability: number;
  weatherCode: number;
}

export interface WeatherResponse {
  current: CurrentWeather;
  forecast: WeatherForecast[];
  location: { lat: number; lon: number };
  fetchedAt: string;
}

// Service Interface
export const WEATHER_SERVICE = Symbol('WEATHER_SERVICE');

export interface IWeatherService {
  getCurrentWeather(lat: number, lon: number): Promise<CurrentWeather>;
  getForecast(lat: number, lon: number, days: number): Promise<WeatherForecast[]>;
}
