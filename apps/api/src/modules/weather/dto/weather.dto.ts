// ============================================
// WEATHER DTOs - Tipos para el módulo meteorológico
// ============================================

// Ubicación geográfica
export interface WeatherLocation {
  lat: number;
  lon: number;
  name: string;
  region?: string;
  country?: string;
}

// Datos meteorológicos actuales
export interface WeatherData {
  location: WeatherLocation;
  timestamp: string;
  temperature: number;        // °C
  feelsLike: number;          // °C (sensación térmica)
  humidity: number;           // %
  pressure: number;           // hPa
  windSpeed: number;          // m/s
  windDirection: number;      // grados (0-360)
  windGusts?: number;         // m/s
  cloudCover: number;         // %
  precipitation: number;      // mm
  rain: number;               // mm
  uvIndex?: number;           // índice UV
  weatherCode: number;        // código WMO
  description: string;        // descripción en español
  icon: string;               // emoji del clima
}

// Pronóstico de lluvia diario
export interface RainfallForecast {
  date: string;               // YYYY-MM-DD
  precipitationSum: number;   // mm total del día
  rainSum: number;            // mm lluvia (sin nieve)
  precipitationProbability: number; // %
  weatherCode: number;
  tempMax: number;            // °C
  tempMin: number;            // °C
  description: string;
}

// Pronóstico por hora
export interface HourlyForecast {
  time: string;               // ISO datetime
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

// Alertas meteorológicas
export type AlertSeverity = 'BAJA' | 'MEDIA' | 'ALTA' | 'CRITICA';
export type AlertType =
  | 'VIENTO_FUERTE'
  | 'RAFAGAS_VIENTO'
  | 'CALOR_EXTREMO'
  | 'UV_ALTO'
  | 'LLUVIA_PROBABLE'
  | 'TORMENTA'
  | 'VISIBILIDAD_REDUCIDA';

export interface WeatherAlert {
  type: AlertType;
  severity: AlertSeverity;
  title: string;
  description: string;
  recommendation: string;
  timestamp: string;
}

// Datos históricos
export interface HistoricalDataPoint {
  date: string;
  temperature: number;
  tempMax: number;
  tempMin: number;
  precipitation: number;
  humidity: number;
  windSpeed: number;
  solarRadiation: number;
}

export interface WeatherHistorical {
  location: WeatherLocation;
  startDate: string;
  endDate: string;
  data: HistoricalDataPoint[];
}

// Resumen para Dashboard
export interface WeatherSummary {
  current: WeatherData;
  rainfall: RainfallForecast[];
  alerts: WeatherAlert[];
  hourlyNext12: HourlyForecast[];
  lastUpdated: string;
}
