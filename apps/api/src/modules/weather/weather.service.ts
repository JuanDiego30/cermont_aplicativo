// ============================================
// WEATHER SERVICE - Integración con APIs Meteorológicas
// APIs utilizadas: OpenWeather (Free Tier), Open-Meteo (Gratuita)
// ============================================

import { Injectable, Logger } from "@nestjs/common";
import { HttpService } from "@nestjs/axios";
import { ConfigService } from "@nestjs/config";
import { firstValueFrom, catchError } from "rxjs";
import {
  WeatherData,
  RainfallForecast,
  WeatherAlert,
  WeatherLocation,
  HourlyForecast,
  WeatherHistorical,
} from "./application/dto/weather-legacy.dto";

interface OpenMeteoCurrentResponse {
  current: {
    temperature_2m: number;
    relative_humidity_2m: number;
    apparent_temperature: number;
    precipitation: number;
    rain: number;
    weather_code: number;
    cloud_cover: number;
    pressure_msl: number;
    wind_speed_10m: number;
    wind_direction_10m: number;
    wind_gusts_10m: number;
    uv_index: number;
  };
}

interface OpenMeteoDailyResponse {
  daily: {
    time: string[];
    precipitation_sum: number[];
    rain_sum: number[];
    precipitation_probability_max: number[];
    weather_code: number[];
    temperature_2m_max: number[];
    temperature_2m_min: number[];
  };
}

interface OpenMeteoHourlyResponse {
  hourly: {
    time: string[];
    temperature_2m: number[];
    relative_humidity_2m: number[];
    precipitation_probability: number[];
    precipitation: number[];
    rain: number[];
    weather_code: number[];
    cloud_cover: number[];
    wind_speed_10m: number[];
  };
}

interface NasaPowerResponse {
  properties: {
    parameter: {
      T2M: Record<string, number>;
      T2M_MAX: Record<string, number>;
      T2M_MIN: Record<string, number>;
      PRECTOTCORR: Record<string, number>;
      RH2M: Record<string, number>;
      WS2M: Record<string, number>;
      ALLSKY_SFC_SW_DWN: Record<string, number>;
    };
  };
}

@Injectable()
export class WeatherService {
  private readonly logger = new Logger(WeatherService.name);

  // Coordenadas de Caño Limón, Arauca, Colombia
  private readonly CANO_LIMON: WeatherLocation = {
    lat: 5.3667,
    lon: -71.7994,
    name: "Caño Limón",
    region: "Arauca",
    country: "Colombia",
  };

  // Caché simple en memoria (en producción usar Redis)
  // Caché simple en memoria (en producción usar Redis)
  // Store as unknown to allow different types
  private cache: Map<string, { data: unknown; expiry: number }> = new Map();
  private readonly CACHE_TTL = 30 * 60 * 1000; // 30 minutos

  constructor(
    private readonly httpService: HttpService,
    private readonly configService: ConfigService,
  ) {}

  // ... (omitting middle of file for brevity in logic, but tool replace needs exact match.
  // Actually I should split this into two edits or use multi_replace if they are far apart.
  // Lines 34 and 477 are far apart. Using multi_replace.)

  // ============================================
  // CLIMA ACTUAL
  // ============================================

  /**
   * Obtiene datos meteorológicos actuales de Caño Limón
   * Usa Open-Meteo API (gratuita sin API key)
   */
  async getCurrentWeather(lat?: number, lon?: number): Promise<WeatherData> {
    const latitude = lat ?? this.CANO_LIMON.lat;
    const longitude = lon ?? this.CANO_LIMON.lon;
    const cacheKey = `weather:current:${latitude}:${longitude}`;

    // Verificar caché
    const cached = this.getFromCache<WeatherData>(cacheKey);
    if (cached) {
      this.logger.debug("Returning cached weather data");
      return cached;
    }

    try {
      // Usar Open-Meteo API (gratuita, sin key requerida)
      const response = await firstValueFrom(
        this.httpService
          .get("https://api.open-meteo.com/v1/forecast", {
            params: {
              latitude,
              longitude,
              current: [
                "temperature_2m",
                "relative_humidity_2m",
                "apparent_temperature",
                "precipitation",
                "rain",
                "weather_code",
                "cloud_cover",
                "pressure_msl",
                "wind_speed_10m",
                "wind_direction_10m",
                "wind_gusts_10m",
                "uv_index",
              ].join(","),
              timezone: "America/Bogota",
            },
          })
          .pipe(
            catchError((error) => {
              this.logger.error(
                "Error fetching Open-Meteo data",
                error.message,
              );
              throw error;
            }),
          ),
      );

      const responseData = response.data as OpenMeteoCurrentResponse;
      const current = responseData.current;
      const weatherData: WeatherData = {
        location: {
          lat: latitude,
          lon: longitude,
          name:
            latitude === this.CANO_LIMON.lat
              ? this.CANO_LIMON.name
              : "Ubicación personalizada",
          region:
            latitude === this.CANO_LIMON.lat
              ? this.CANO_LIMON.region
              : undefined,
          country:
            latitude === this.CANO_LIMON.lat
              ? this.CANO_LIMON.country
              : undefined,
        },
        timestamp: new Date().toISOString(),
        temperature: current.temperature_2m,
        feelsLike: current.apparent_temperature,
        humidity: current.relative_humidity_2m,
        pressure: current.pressure_msl,
        windSpeed: current.wind_speed_10m,
        windDirection: current.wind_direction_10m,
        windGusts: current.wind_gusts_10m,
        cloudCover: current.cloud_cover,
        precipitation: current.precipitation,
        rain: current.rain,
        uvIndex: current.uv_index,
        weatherCode: current.weather_code,
        description: this.getWeatherDescription(current.weather_code),
        icon: this.getWeatherIcon(current.weather_code),
      };

      // Guardar en caché
      this.setCache(cacheKey, weatherData);

      return weatherData;
    } catch (error) {
      this.logger.error("Failed to fetch current weather", error);
      throw error;
    }
  }

  // ============================================
  // PRONÓSTICO DE LLUVIA
  // ============================================

  /**
   * Obtiene pronóstico de lluvia para los próximos 7 días
   */
  async getRainfallForecast(
    lat?: number,
    lon?: number,
  ): Promise<RainfallForecast[]> {
    const latitude = lat ?? this.CANO_LIMON.lat;
    const longitude = lon ?? this.CANO_LIMON.lon;
    const cacheKey = `weather:rainfall:${latitude}:${longitude}`;

    const cached = this.getFromCache<RainfallForecast[]>(cacheKey);
    if (cached) return cached;

    try {
      const response = await firstValueFrom(
        this.httpService.get("https://api.open-meteo.com/v1/forecast", {
          params: {
            latitude,
            longitude,
            daily: [
              "precipitation_sum",
              "rain_sum",
              "precipitation_probability_max",
              "weather_code",
              "temperature_2m_max",
              "temperature_2m_min",
            ].join(","),
            timezone: "America/Bogota",
            forecast_days: 7,
          },
        }),
      );

      const responseData = response.data as OpenMeteoDailyResponse;
      const daily = responseData.daily;
      const forecasts: RainfallForecast[] = daily.time.map(
        (date: string, i: number) => ({
          date,
          precipitationSum: daily.precipitation_sum[i],
          rainSum: daily.rain_sum[i],
          precipitationProbability: daily.precipitation_probability_max[i],
          weatherCode: daily.weather_code[i],
          tempMax: daily.temperature_2m_max[i],
          tempMin: daily.temperature_2m_min[i],
          description: this.getWeatherDescription(daily.weather_code[i]),
        }),
      );

      this.setCache(cacheKey, forecasts);
      return forecasts;
    } catch (error) {
      this.logger.error("Failed to fetch rainfall forecast", error);
      throw error;
    }
  }

  // ============================================
  // PRONÓSTICO POR HORA
  // ============================================

  /**
   * Obtiene pronóstico horario para las próximas 48 horas
   */
  async getHourlyForecast(
    lat?: number,
    lon?: number,
  ): Promise<HourlyForecast[]> {
    const latitude = lat ?? this.CANO_LIMON.lat;
    const longitude = lon ?? this.CANO_LIMON.lon;
    const cacheKey = `weather:hourly:${latitude}:${longitude}`;

    const cached = this.getFromCache<HourlyForecast[]>(cacheKey);
    if (cached) return cached;

    try {
      const response = await firstValueFrom(
        this.httpService.get("https://api.open-meteo.com/v1/forecast", {
          params: {
            latitude,
            longitude,
            hourly: [
              "temperature_2m",
              "relative_humidity_2m",
              "precipitation_probability",
              "precipitation",
              "rain",
              "weather_code",
              "cloud_cover",
              "wind_speed_10m",
            ].join(","),
            timezone: "America/Bogota",
            forecast_hours: 48,
          },
        }),
      );

      const responseData = response.data as OpenMeteoHourlyResponse;
      const hourly = responseData.hourly;
      const forecasts: HourlyForecast[] = hourly.time.map(
        (time: string, i: number) => ({
          time,
          temperature: hourly.temperature_2m[i],
          humidity: hourly.relative_humidity_2m[i],
          precipitationProbability: hourly.precipitation_probability[i],
          precipitation: hourly.precipitation[i],
          rain: hourly.rain[i],
          weatherCode: hourly.weather_code[i],
          cloudCover: hourly.cloud_cover[i],
          windSpeed: hourly.wind_speed_10m[i],
          description: this.getWeatherDescription(hourly.weather_code[i]),
          icon: this.getWeatherIcon(hourly.weather_code[i]),
        }),
      );

      this.setCache(cacheKey, forecasts);
      return forecasts;
    } catch (error) {
      this.logger.error("Failed to fetch hourly forecast", error);
      throw error;
    }
  }

  // ============================================
  // ALERTAS METEOROLÓGICAS
  // ============================================

  /**
   * Genera alertas basadas en condiciones actuales
   */
  async getWeatherAlerts(lat?: number, lon?: number): Promise<WeatherAlert[]> {
    const currentWeather = await this.getCurrentWeather(lat, lon);
    const alerts: WeatherAlert[] = [];

    // Alerta de viento fuerte (>10 m/s = 36 km/h)
    if (currentWeather.windSpeed > 10) {
      alerts.push({
        type: "VIENTO_FUERTE",
        severity: currentWeather.windSpeed > 15 ? "ALTA" : "MEDIA",
        title: "Vientos Fuertes",
        description: `Velocidad del viento: ${currentWeather.windSpeed.toFixed(1)} m/s (${(currentWeather.windSpeed * 3.6).toFixed(0)} km/h)`,
        recommendation:
          "Asegurar equipos y estructuras móviles. Precaución en trabajos en altura.",
        timestamp: new Date().toISOString(),
      });
    }

    // Alerta de ráfagas de viento (>15 m/s)
    if (currentWeather.windGusts && currentWeather.windGusts > 15) {
      alerts.push({
        type: "RAFAGAS_VIENTO",
        severity: "ALTA",
        title: "Ráfagas de Viento Peligrosas",
        description: `Ráfagas de hasta ${currentWeather.windGusts.toFixed(1)} m/s (${(currentWeather.windGusts * 3.6).toFixed(0)} km/h)`,
        recommendation: "Suspender trabajos en altura. Buscar refugio.",
        timestamp: new Date().toISOString(),
      });
    }

    // Alerta de calor extremo (>35°C)
    if (currentWeather.temperature > 35) {
      alerts.push({
        type: "CALOR_EXTREMO",
        severity: currentWeather.temperature > 40 ? "CRITICA" : "ALTA",
        title: "Temperatura Extrema",
        description: `Temperatura actual: ${currentWeather.temperature.toFixed(1)}°C`,
        recommendation:
          "Hidratarse frecuentemente. Tomar descansos en sombra. Evitar exposición prolongada.",
        timestamp: new Date().toISOString(),
      });
    }

    // Alerta de UV alto (>8)
    if (currentWeather.uvIndex && currentWeather.uvIndex > 8) {
      alerts.push({
        type: "UV_ALTO",
        severity: currentWeather.uvIndex > 11 ? "CRITICA" : "ALTA",
        title: "Índice UV Muy Alto",
        description: `Índice UV: ${currentWeather.uvIndex.toFixed(1)}`,
        recommendation:
          "Usar protector solar SPF50+. Usar ropa protectora y sombrero. Evitar exposición entre 10am-4pm.",
        timestamp: new Date().toISOString(),
      });
    }

    // Alerta de lluvia (cobertura de nubes >80% + precipitación)
    if (currentWeather.cloudCover > 80 || currentWeather.precipitation > 0) {
      alerts.push({
        type: "LLUVIA_PROBABLE",
        severity: currentWeather.precipitation > 5 ? "ALTA" : "MEDIA",
        title:
          currentWeather.precipitation > 0
            ? "Lluvia Activa"
            : "Lluvia Probable",
        description:
          currentWeather.precipitation > 0
            ? `Precipitación actual: ${currentWeather.precipitation} mm`
            : `Cobertura de nubes: ${currentWeather.cloudCover}%`,
        recommendation:
          "Proteger equipos eléctricos. Precaución en superficies resbaladizas.",
        timestamp: new Date().toISOString(),
      });
    }

    // Alerta de visibilidad baja (nubes muy densas)
    if (currentWeather.cloudCover > 95) {
      alerts.push({
        type: "VISIBILIDAD_REDUCIDA",
        severity: "MEDIA",
        title: "Visibilidad Reducida",
        description: `Cobertura de nubes: ${currentWeather.cloudCover}%`,
        recommendation:
          "Precaución en desplazamientos. Usar luces de seguridad.",
        timestamp: new Date().toISOString(),
      });
    }

    return alerts;
  }

  // ============================================
  // DATOS HISTÓRICOS (NASA POWER API)
  // ============================================

  /**
   * Obtiene datos históricos de NASA POWER API
   * Útil para análisis de patrones climáticos
   */
  async getHistoricalData(
    startDate: string,
    endDate: string,
    lat?: number,
    lon?: number,
  ): Promise<WeatherHistorical> {
    const latitude = lat ?? this.CANO_LIMON.lat;
    const longitude = lon ?? this.CANO_LIMON.lon;

    try {
      const response = await firstValueFrom(
        this.httpService.get(
          "https://power.larc.nasa.gov/api/temporal/daily/point",
          {
            params: {
              parameters:
                "T2M,T2M_MAX,T2M_MIN,PRECTOTCORR,RH2M,WS2M,ALLSKY_SFC_SW_DWN",
              community: "RE",
              longitude,
              latitude,
              start: startDate.replace(/-/g, ""),
              end: endDate.replace(/-/g, ""),
              format: "JSON",
            },
          },
        ),
      );

      const responseData = response.data as NasaPowerResponse;
      const params = responseData.properties.parameter;
      const dates = Object.keys(params.T2M);

      return {
        location: { lat: latitude, lon: longitude, name: this.CANO_LIMON.name },
        startDate,
        endDate,
        data: dates.map((date) => ({
          date: `${date.slice(0, 4)}-${date.slice(4, 6)}-${date.slice(6, 8)}`,
          temperature: params.T2M[date],
          tempMax: params.T2M_MAX[date],
          tempMin: params.T2M_MIN[date],
          precipitation: params.PRECTOTCORR[date],
          humidity: params.RH2M[date],
          windSpeed: params.WS2M[date],
          solarRadiation: params.ALLSKY_SFC_SW_DWN[date],
        })),
      };
    } catch (error) {
      this.logger.error("Failed to fetch NASA POWER historical data", error);
      throw error;
    }
  }

  // ============================================
  // UBICACIÓN POR DEFECTO
  // ============================================

  /**
   * Retorna la ubicación de Caño Limón configurada
   */
  getDefaultLocation(): WeatherLocation {
    return { ...this.CANO_LIMON };
  }

  // ============================================
  // HELPERS PRIVADOS
  // ============================================

  private getWeatherDescription(code: number): string {
    const descriptions: Record<number, string> = {
      0: "Cielo despejado",
      1: "Mayormente despejado",
      2: "Parcialmente nublado",
      3: "Nublado",
      45: "Niebla",
      48: "Niebla con escarcha",
      51: "Llovizna ligera",
      53: "Llovizna moderada",
      55: "Llovizna intensa",
      56: "Llovizna helada ligera",
      57: "Llovizna helada intensa",
      61: "Lluvia ligera",
      63: "Lluvia moderada",
      65: "Lluvia intensa",
      66: "Lluvia helada ligera",
      67: "Lluvia helada intensa",
      71: "Nevada ligera",
      73: "Nevada moderada",
      75: "Nevada intensa",
      77: "Granizo",
      80: "Chubascos ligeros",
      81: "Chubascos moderados",
      82: "Chubascos violentos",
      85: "Chubascos de nieve ligeros",
      86: "Chubascos de nieve intensos",
      95: "Tormenta eléctrica",
      96: "Tormenta con granizo ligero",
      99: "Tormenta con granizo intenso",
    };
    return descriptions[code] || "Desconocido";
  }

  private getWeatherIcon(code: number): string {
    if (code === 0) return "☀️";
    if (code <= 3) return "⛅";
    if (code <= 48) return "🌫️";
    if (code <= 57) return "🌧️";
    if (code <= 67) return "🌧️";
    if (code <= 77) return "❄️";
    if (code <= 82) return "🌦️";
    if (code >= 95) return "⛈️";
    return "🌤️";
  }

  private getFromCache<T>(key: string): T | null {
    const item = this.cache.get(key);
    if (item && item.expiry > Date.now()) {
      return item.data as T;
    }
    this.cache.delete(key);
    return null;
  }

  private setCache(key: string, data: unknown): void {
    this.cache.set(key, {
      data,
      expiry: Date.now() + this.CACHE_TTL,
    });
  }
}
