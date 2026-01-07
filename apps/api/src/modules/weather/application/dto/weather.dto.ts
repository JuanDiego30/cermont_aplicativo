/**
 * @module Weather - Clean Architecture
 */
import { z } from "zod";
import { IsNumber, Min, Max } from "class-validator";
import { Type } from "class-transformer";
import { ApiProperty } from "@nestjs/swagger";

// DTOs - ClassValidator para ValidationPipe global
export class WeatherQueryDto {
  @ApiProperty({ description: "Latitud (-90 a 90)", example: 5.3667 })
  @Type(() => Number)
  @IsNumber({}, { message: "La latitud debe ser un número" })
  @Min(-90, { message: "La latitud debe ser mayor o igual a -90" })
  @Max(90, { message: "La latitud debe ser menor o igual a 90" })
  lat!: number;

  @ApiProperty({ description: "Longitud (-180 a 180)", example: -71.7994 })
  @Type(() => Number)
  @IsNumber({}, { message: "La longitud debe ser un número" })
  @Min(-180, { message: "La longitud debe ser mayor o igual a -180" })
  @Max(180, { message: "La longitud debe ser menor o igual a 180" })
  lon!: number;
}

/** @deprecated Use la clase WeatherQueryDto con ClassValidator */
export const WeatherQuerySchema = z.object({
  lat: z.coerce.number().min(-90).max(90),
  lon: z.coerce.number().min(-180).max(180),
});

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
export const WEATHER_SERVICE = Symbol("WEATHER_SERVICE");

export interface IWeatherService {
  getCurrentWeather(lat: number, lon: number): Promise<CurrentWeather>;
  getForecast(
    lat: number,
    lon: number,
    days: number,
  ): Promise<WeatherForecast[]>;
}
