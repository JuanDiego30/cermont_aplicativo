import type { Request, Response } from 'express';
import { logger, getErrorMessage } from '../../../shared/utils/index.js';

// ============================================================================
// Types
// ============================================================================

interface AuthenticatedRequest extends Omit<Request, 'user'> {
  user?: { userId: string; email?: string; role: string; jti?: string };
}

interface WeatherResponse {
  success: boolean;
  data?: any;
  error?: string;
  detail?: string;
}

interface CoordinatesQuery {
  lat?: string;
  lon?: string;
}

// OpenWeather API response types
interface OpenWeatherForecastItem {
  dt: number;
  main: {
    temp: number;
    feels_like: number;
    humidity: number;
    pressure: number;
  };
  weather: Array<{
    main: string;
    description: string;
    icon: string;
  }>;
  wind: {
    speed: number;
    deg: number;
  };
  pop?: number; // Probability of precipitation
}

interface OpenWeatherForecastResponse {
  list: OpenWeatherForecastItem[];
  city: {
    name: string;
    country?: string;
    coord: { lat: number; lon: number };
  };
}

interface OpenWeatherCurrentResponse {
  name: string;
  coord: { lat: number; lon: number };
  main: {
    temp: number;
    feels_like: number;
    humidity: number;
    pressure: number;
  };
  weather: Array<{
    main: string;
    description: string;
    icon: string;
  }>;
  wind: {
    speed: number;
    deg: number;
  };
  clouds: { all: number };
  visibility: number;
  sys: {
    country?: string;
    sunrise: number;
    sunset: number;
  };
}

// ============================================================================
// Constants
// ============================================================================

const API_CONFIG = {
  BASE_URL: 'https://api.openweathermap.org/data/2.5',
  API_KEY: process.env.OPENWEATHER_API_KEY || '',
  UNITS: 'metric',
  LANG: 'es',
  FORECAST_DAYS: 5,
} as const;

const ERROR_MESSAGES = {
  MISSING_COORDINATES: 'Latitude and longitude are required',
  API_ERROR: (msg: string) => `OpenWeather API error: ${msg}`,
  FETCH_WEATHER_FAILED: 'Failed to fetch weather data',
  FETCH_FORECAST_FAILED: 'Failed to fetch forecast data',
} as const;

// ============================================================================
// Helpers
// ============================================================================

function validateCoordinates(lat?: string, lon?: string): boolean {
  return !!(lat && lon && !isNaN(Number(lat)) && !isNaN(Number(lon)));
}

function buildWeatherUrl(lat: string, lon: string): string {
  const params = new URLSearchParams({
    lat,
    lon,
    appid: API_CONFIG.API_KEY,
    units: API_CONFIG.UNITS,
    lang: API_CONFIG.LANG,
  });
  return `${API_CONFIG.BASE_URL}/weather?${params.toString()}`;
}

function buildForecastUrl(lat: string, lon: string): string {
  const params = new URLSearchParams({
    lat,
    lon,
    appid: API_CONFIG.API_KEY,
    units: API_CONFIG.UNITS,
    lang: API_CONFIG.LANG,
  });
  return `${API_CONFIG.BASE_URL}/forecast?${params.toString()}`;
}

function transformWeatherData(data: OpenWeatherCurrentResponse) {
  return {
    location: {
      name: data.name,
      country: data.sys?.country || '',
      lat: data.coord.lat,
      lon: data.coord.lon,
    },
    current: {
      temp: data.main.temp,
      feels_like: data.main.feels_like,
      humidity: data.main.humidity,
      pressure: data.main.pressure,
      wind_speed: data.wind.speed,
      wind_deg: data.wind.deg,
      clouds: data.clouds.all,
      visibility: data.visibility,
      description: data.weather[0].description,
      icon: data.weather[0].icon,
      main: data.weather[0].main,
    },
    sun: {
      sunrise: new Date(data.sys.sunrise * 1000).toISOString(),
      sunset: new Date(data.sys.sunset * 1000).toISOString(),
    },
  };
}

interface DailyForecastGroup {
  date: string;
  temps: number[];
  descriptions: string[];
  icon: string;
  humidity: number;
  windSpeed: number;
}

// Transform forecast items to match frontend expected format
function transformForecastItems(forecastList: OpenWeatherForecastItem[]) {
  return forecastList.map((item) => {
    const date = new Date(item.dt * 1000);
    return {
      datetime: date.toISOString(),
      date: date.toISOString().split('T')[0],
      time: date.toTimeString().slice(0, 5),
      temp: item.main.temp,
      feels_like: item.main.feels_like,
      humidity: item.main.humidity,
      pressure: item.main.pressure,
      wind_speed: item.wind.speed,
      wind_deg: item.wind.deg,
      clouds: 0, // OpenWeather forecast doesn't include clouds in list items
      visibility: 10000, // Default visibility
      pop: item.pop || 0,
      description: item.weather[0].description,
      icon: item.weather[0].icon,
      main: item.weather[0].main,
    };
  });
}

function groupForecastByDay(forecastList: OpenWeatherForecastItem[]): DailyForecastGroup[] {
  return forecastList.reduce((acc: DailyForecastGroup[], item) => {
    const date = new Date(item.dt * 1000).toLocaleDateString('es-ES');
    const existing = acc.find((f) => f.date === date);

    if (existing) {
      existing.temps.push(item.main.temp);
      existing.descriptions.push(item.weather[0].description);
    } else {
      acc.push({
        date,
        temps: [item.main.temp],
        descriptions: [item.weather[0].description],
        icon: item.weather[0].icon,
        humidity: item.main.humidity,
        windSpeed: item.wind.speed,
      });
    }

    return acc;
  }, []);
}

function transformDailyForecasts(dailyForecasts: DailyForecastGroup[]) {
  return dailyForecasts
    .map((day) => ({
      date: day.date,
      tempMin: Math.round(Math.min(...day.temps)),
      tempMax: Math.round(Math.max(...day.temps)),
      description: day.descriptions[0],
      icon: day.icon,
      humidity: day.humidity,
      windSpeed: day.windSpeed,
    }))
    .slice(0, API_CONFIG.FORECAST_DAYS);
}

// ============================================================================
// Controller
// ============================================================================

export class WeatherController {
  constructor() {
    if (!API_CONFIG.API_KEY) {
      logger.warn('⚠️ OPENWEATHER_API_KEY not set in environment');
    }
  }

  /**
   * Get current weather for coordinates
   * GET /api/weather/current?lat=7.0897&lon=-70.7597
   */
  getCurrent = async (req: Request, res: Response): Promise<void> => {
    try {
      const { lat, lon } = req.query as CoordinatesQuery;

      if (!validateCoordinates(lat, lon)) {
        res.status(400).json({
          success: false,
          error: ERROR_MESSAGES.MISSING_COORDINATES,
        });
        return;
      }

      const url = buildWeatherUrl(lat!, lon!);
      const response = await fetch(url);

      if (!response.ok) {
        throw new Error(ERROR_MESSAGES.API_ERROR(response.statusText));
      }

      const data = (await response.json()) as OpenWeatherCurrentResponse;
      const weatherData = transformWeatherData(data);

      res.json({
        success: true,
        data: weatherData,
      });
    } catch (error: unknown) {
      logger.error('Weather API error:', error);
      res.status(500).json({
        success: false,
        error: ERROR_MESSAGES.FETCH_WEATHER_FAILED,
        detail: getErrorMessage(error),
      });
    }
  };

  /**
   * Get 5-day forecast for coordinates
   * GET /api/weather/forecast?lat=7.0897&lon=-70.7597
   */
  getForecast = async (req: Request, res: Response): Promise<void> => {
    try {
      const { lat, lon } = req.query as CoordinatesQuery;

      if (!validateCoordinates(lat, lon)) {
        res.status(400).json({
          success: false,
          error: ERROR_MESSAGES.MISSING_COORDINATES,
        });
        return;
      }

      const url = buildForecastUrl(lat!, lon!);
      const response = await fetch(url);

      if (!response.ok) {
        throw new Error(ERROR_MESSAGES.API_ERROR(response.statusText));
      }

      const data = (await response.json()) as OpenWeatherForecastResponse;
      const forecast = transformForecastItems(data.list);

      res.json({
        success: true,
        data: {
          location: {
            name: data.city.name,
            country: data.city.country || '',
            lat: data.city.coord.lat,
            lon: data.city.coord.lon,
          },
          forecast,
        },
      });
    } catch (error: unknown) {
      logger.error('Forecast API error:', error);
      res.status(500).json({
        success: false,
        error: ERROR_MESSAGES.FETCH_FORECAST_FAILED,
        detail: getErrorMessage(error),
      });
    }
  };
}

export const weatherController = new WeatherController();
