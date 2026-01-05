/**
 * @service OpenMeteoWeatherService
 * @description Implementación del servicio de clima usando Open-Meteo API
 */
import { Injectable, HttpException, HttpStatus } from "@nestjs/common";
import {
  IWeatherService,
  CurrentWeather,
  WeatherForecast,
} from "../../application/dto";

const WEATHER_CODES: Record<number, string> = {
  0: "Despejado",
  1: "Mayormente despejado",
  2: "Parcialmente nublado",
  3: "Nublado",
  45: "Niebla",
  48: "Niebla helada",
  51: "Llovizna ligera",
  53: "Llovizna moderada",
  55: "Llovizna densa",
  61: "Lluvia ligera",
  63: "Lluvia moderada",
  65: "Lluvia fuerte",
  71: "Nieve ligera",
  73: "Nieve moderada",
  75: "Nieve fuerte",
  80: "Chubascos ligeros",
  81: "Chubascos moderados",
  82: "Chubascos fuertes",
  95: "Tormenta",
  96: "Tormenta con granizo ligero",
  99: "Tormenta con granizo fuerte",
};

const RAINY_CODES = [51, 53, 55, 61, 63, 65, 80, 81, 82, 95, 96, 99];

@Injectable()
export class OpenMeteoWeatherService implements IWeatherService {
  private readonly baseUrl = "https://api.open-meteo.com/v1/forecast";

  async getCurrentWeather(lat: number, lon: number): Promise<CurrentWeather> {
    try {
      const url = `${this.baseUrl}?latitude=${lat}&longitude=${lon}&current=temperature_2m,relative_humidity_2m,wind_speed_10m,weather_code`;
      const response = await fetch(url);

      if (!response.ok) {
        throw new HttpException(
          "Error fetching weather",
          HttpStatus.BAD_GATEWAY,
        );
      }

      const data = (await response.json()) as {
        current: Record<string, number>;
      };
      const current = data.current;

      return {
        temperature: current.temperature_2m,
        humidity: current.relative_humidity_2m,
        windSpeed: current.wind_speed_10m,
        weatherCode: current.weather_code,
        description: WEATHER_CODES[current.weather_code] || "Desconocido",
        isRainy: RAINY_CODES.includes(current.weather_code),
      };
    } catch (error) {
      throw new HttpException(
        "Weather service unavailable",
        HttpStatus.SERVICE_UNAVAILABLE,
      );
    }
  }

  async getForecast(
    lat: number,
    lon: number,
    days: number,
  ): Promise<WeatherForecast[]> {
    try {
      const url = `${this.baseUrl}?latitude=${lat}&longitude=${lon}&daily=temperature_2m_max,temperature_2m_min,precipitation_probability_max,weather_code&forecast_days=${days}`;
      const response = await fetch(url);

      if (!response.ok) {
        throw new HttpException(
          "Error fetching forecast",
          HttpStatus.BAD_GATEWAY,
        );
      }

      const data = (await response.json()) as {
        daily: {
          time: string[];
          temperature_2m_max: number[];
          temperature_2m_min: number[];
          precipitation_probability_max: number[];
          weather_code: number[];
        };
      };
      const daily = data.daily;

      return daily.time.map((date: string, i: number) => ({
        date,
        temperatureMax: daily.temperature_2m_max[i],
        temperatureMin: daily.temperature_2m_min[i],
        precipitationProbability: daily.precipitation_probability_max[i],
        weatherCode: daily.weather_code[i],
      }));
    } catch (error) {
      throw new HttpException(
        "Weather service unavailable",
        HttpStatus.SERVICE_UNAVAILABLE,
      );
    }
  }
}
