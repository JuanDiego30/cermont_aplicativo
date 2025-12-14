/**
 * @useCase GetWeatherUseCase
 */
import { Injectable, Inject } from '@nestjs/common';
import {
  WEATHER_SERVICE,
  IWeatherService,
  WeatherQueryDto,
  WeatherResponse,
} from '../dto';

@Injectable()
export class GetWeatherUseCase {
  constructor(
    @Inject(WEATHER_SERVICE)
    private readonly weatherService: IWeatherService,
  ) {}

  async execute(query: WeatherQueryDto): Promise<WeatherResponse> {
    const [current, forecast] = await Promise.all([
      this.weatherService.getCurrentWeather(query.lat, query.lon),
      this.weatherService.getForecast(query.lat, query.lon, 7),
    ]);

    return {
      current,
      forecast,
      location: { lat: query.lat, lon: query.lon },
      fetchedAt: new Date().toISOString(),
    };
  }
}
