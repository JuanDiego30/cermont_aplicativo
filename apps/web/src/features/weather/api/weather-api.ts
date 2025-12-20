/**
 * @file weather-api.ts
 * @description API client para Weather
 */

import { apiClient } from '@/lib/api';

export interface WeatherData {
  latitud: number;
  longitud: number;
  fecha: string;
  temperatura: {
    actual: number;
    min: number;
    max: number;
    unidad: string;
  };
  condiciones: {
    descripcion: string;
    icono: string;
    codigo: string;
  };
  viento: {
    velocidad: number;
    direccion: number;
    unidad: string;
  };
  humedad: number;
  presion: number;
  visibilidad: number;
  uv?: number;
}

export interface WeatherForecast {
  fecha: string;
  temperatura: {
    min: number;
    max: number;
  };
  condiciones: string;
  probabilidadLluvia: number;
}

export const weatherApi = {
  /**
   * Obtener clima actual
   */
  getWeather: async (params: {
    latitud: number;
    longitud: number;
    fecha?: string;
  }): Promise<WeatherData> => {
    const searchParams = new URLSearchParams();
    searchParams.append('latitud', String(params.latitud));
    searchParams.append('longitud', String(params.longitud));
    if (params.fecha) searchParams.append('fecha', params.fecha);
    return apiClient.get<WeatherData>(`/weather?${searchParams.toString()}`);
  },

  /**
   * Obtener pronóstico del tiempo
   */
  getForecast: async (params: {
    latitud: number;
    longitud: number;
    dias?: number;
  }): Promise<{ data: WeatherForecast[] }> => {
    const searchParams = new URLSearchParams();
    searchParams.append('latitud', String(params.latitud));
    searchParams.append('longitud', String(params.longitud));
    if (params.dias) searchParams.append('dias', String(params.dias));
    return apiClient.get<{ data: WeatherForecast[] }>(`/weather/forecast?${searchParams.toString()}`);
  },
};
