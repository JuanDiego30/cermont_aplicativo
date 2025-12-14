/**
 * ARCHIVO: weather.service.ts
 * FUNCION: Consulta datos meteorologicos, pronosticos y alertas climaticas
 * IMPLEMENTACION: Patron Service Layer con API Open-Meteo, soporte geolocalizacion
 * DEPENDENCIAS: @/lib/api-client (apiClient)
 * EXPORTS: weatherApi, WeatherData, WeatherSummary, WeatherAlert, etc.
 */
import { apiClient } from '@/lib/api-client';

// Tipos
export interface WeatherLocation {
  lat: number;
  lon: number;
  name: string;
  region?: string;
  country?: string;
}

export interface WeatherData {
  location: WeatherLocation;
  timestamp: string;
  temperature: number;
  feelsLike: number;
  humidity: number;
  pressure: number;
  windSpeed: number;
  windDirection: number;
  windGusts?: number;
  cloudCover: number;
  precipitation: number;
  rain: number;
  uvIndex?: number;
  weatherCode: number;
  description: string;
  icon: string;
}

export interface RainfallForecast {
  date: string;
  precipitationSum: number;
  rainSum: number;
  precipitationProbability: number;
  weatherCode: number;
  tempMax: number;
  tempMin: number;
  description: string;
}

export interface HourlyForecast {
  time: string;
  temperature: number;
  humidity: number;
  precipitationProbability: number;
  precipitation: number;
  rain: number;
  weatherCode: number;
  cloudCover: number;
  windSpeed: number;
  description: string;
  icon: string;
}

export type AlertSeverity = 'BAJA' | 'MEDIA' | 'ALTA' | 'CRITICA';

export interface WeatherAlert {
  type: string;
  severity: AlertSeverity;
  title: string;
  description: string;
  recommendation: string;
  timestamp: string;
}

export interface WeatherSummary {
  current: WeatherData;
  rainfall: RainfallForecast[];
  alerts: WeatherAlert[];
  hourlyNext12: HourlyForecast[];
  lastUpdated: string;
}

// Funciones API
export const weatherApi = {
  /**
   * Obtiene resumen meteorológico completo
   */
  async getSummary(lat?: number, lon?: number): Promise<WeatherSummary> {
    const params = new URLSearchParams();
    if (lat !== undefined) params.append('lat', lat.toString());
    if (lon !== undefined) params.append('lon', lon.toString());
    
    const url = `/weather/summary${params.toString() ? `?${params}` : ''}`;
    const response = await apiClient.get<WeatherSummary>(url);
    return response;
  },

  /**
   * Obtiene clima actual
   */
  async getCurrentWeather(lat?: number, lon?: number): Promise<WeatherData> {
    const params = new URLSearchParams();
    if (lat !== undefined) params.append('lat', lat.toString());
    if (lon !== undefined) params.append('lon', lon.toString());
    
    const url = `/weather/current${params.toString() ? `?${params}` : ''}`;
    const response = await apiClient.get<WeatherData>(url);
    return response;
  },

  /**
   * Obtiene pronóstico de lluvia (7 días)
   */
  async getRainfallForecast(lat?: number, lon?: number): Promise<RainfallForecast[]> {
    const params = new URLSearchParams();
    if (lat !== undefined) params.append('lat', lat.toString());
    if (lon !== undefined) params.append('lon', lon.toString());
    
    const url = `/weather/rainfall${params.toString() ? `?${params}` : ''}`;
    const response = await apiClient.get<RainfallForecast[]>(url);
    return response;
  },

  /**
   * Obtiene pronóstico por hora (48h)
   */
  async getHourlyForecast(lat?: number, lon?: number): Promise<HourlyForecast[]> {
    const params = new URLSearchParams();
    if (lat !== undefined) params.append('lat', lat.toString());
    if (lon !== undefined) params.append('lon', lon.toString());
    
    const url = `/weather/hourly${params.toString() ? `?${params}` : ''}`;
    const response = await apiClient.get<HourlyForecast[]>(url);
    return response;
  },

  /**
   * Obtiene alertas meteorológicas
   */
  async getAlerts(lat?: number, lon?: number): Promise<WeatherAlert[]> {
    const params = new URLSearchParams();
    if (lat !== undefined) params.append('lat', lat.toString());
    if (lon !== undefined) params.append('lon', lon.toString());
    
    const url = `/weather/alerts${params.toString() ? `?${params}` : ''}`;
    const response = await apiClient.get<WeatherAlert[]>(url);
    return response;
  },

  /**
   * Obtiene ubicación por defecto (Caño Limón)
   */
  async getDefaultLocation(): Promise<WeatherLocation> {
    const response = await apiClient.get<WeatherLocation>('/weather/location');
    return response;
  },
};

export default weatherApi;
