/**
 * @module Weather - Clean Architecture
 * DTOs con class-validator
 */
import { IsNumber, Min, Max } from "class-validator";
import { Type } from "class-transformer";
import { ApiProperty } from "@nestjs/swagger";

export class WeatherQueryDto {
  @ApiProperty({ example: 7.1234, minimum: -90, maximum: 90 })
  @Type(() => Number)
  @IsNumber()
  @Min(-90)
  @Max(90)
  lat!: number;

  @ApiProperty({ example: -73.1234, minimum: -180, maximum: 180 })
  @Type(() => Number)
  @IsNumber()
  @Min(-180)
  @Max(180)
  lon!: number;
}

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
