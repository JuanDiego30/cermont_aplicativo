import type { Request, Response } from 'express';
import { logger } from '../../../shared/utils/logger.js';

// Tipado para request autenticado
interface AuthenticatedRequest extends Omit<Request, 'user'> {
  user?: { userId: string; email?: string; role: string; jti?: string };
}

export class WeatherController {
  private readonly OPENWEATHER_BASE_URL = 'https://api.openweathermap.org/data/2.5';
  private readonly API_KEY: string;

  constructor() {
    this.API_KEY = process.env.OPENWEATHER_API_KEY || '';
    if (!this.API_KEY) {
      logger.warn('⚠️ OPENWEATHER_API_KEY not set in environment');
    }
  }

  /**
   * Get current weather for coordinates
   * GET /api/weather/current?lat=7.0897&lon=-70.7597
   */
  getCurrent = async (req: Request, res: Response): Promise<void> => {
    try {
      const { lat, lon } = req.query;

      if (!lat || !lon) {
        res.status(400).json({
          success: false,
          error: 'Latitude and longitude are required',
        });
        return;
      }

      const url = `${this.OPENWEATHER_BASE_URL}/weather?lat=${lat}&lon=${lon}&appid=${this.API_KEY}&units=metric&lang=es`;

      const response = await fetch(url);

      if (!response.ok) {
        throw new Error(`OpenWeather API error: ${response.statusText}`);
      }

      const data: any = await response.json();

      res.json({
        success: true,
        data: {
          location: data.name,
          temperature: Math.round(data.main.temp),
          feelsLike: Math.round(data.main.feels_like),
          humidity: data.main.humidity,
          pressure: data.main.pressure,
          weather: data.weather[0].main,
          description: data.weather[0].description,
          icon: data.weather[0].icon,
          windSpeed: data.wind.speed,
          windDirection: data.wind.deg,
          clouds: data.clouds.all,
          visibility: data.visibility,
          sunrise: data.sys.sunrise,
          sunset: data.sys.sunset,
          coordinates: {
            lat: data.coord.lat,
            lon: data.coord.lon,
          },
        },
      });
    } catch (error: any) {
      logger.error('Weather API error:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to fetch weather data',
        detail: error.message,
      });
    }
  };

  /**
   * Get 5-day forecast for coordinates
   * GET /api/weather/forecast?lat=7.0897&lon=-70.7597
   */
  getForecast = async (req: Request, res: Response): Promise<void> => {
    try {
      const { lat, lon } = req.query;

      if (!lat || !lon) {
        res.status(400).json({
          success: false,
          error: 'Latitude and longitude are required',
        });
        return;
      }

      const url = `${this.OPENWEATHER_BASE_URL}/forecast?lat=${lat}&lon=${lon}&appid=${this.API_KEY}&units=metric&lang=es`;

      const response = await fetch(url);

      if (!response.ok) {
        throw new Error(`OpenWeather API error: ${response.statusText}`);
      }

      const data: any = await response.json();

      // Group forecast by day
      const dailyForecasts = data.list.reduce((acc: any[], item: any) => {
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

      // Calculate min/max for each day
      const forecast = dailyForecasts.map((day: any) => ({
        date: day.date,
        tempMin: Math.round(Math.min(...day.temps)),
        tempMax: Math.round(Math.max(...day.temps)),
        description: day.descriptions[0],
        icon: day.icon,
        humidity: day.humidity,
        windSpeed: day.windSpeed,
      }));

      res.json({
        success: true,
        data: {
          location: data.city.name,
          forecast: forecast.slice(0, 5), // 5 days
        },
      });
    } catch (error: any) {
      logger.error('Forecast API error:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to fetch forecast data',
        detail: error.message,
      });
    }
  };
}

export const weatherController = new WeatherController();
