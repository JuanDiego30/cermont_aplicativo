/**
 * @module WeatherModule
 * @description Módulo meteorológico con arquitectura DDD
 *
 * Capas:
 * - Application: Use Cases, DTOs
 * - Infrastructure: Controllers, Services (Open-Meteo API)
 */

import { Module } from "@nestjs/common";
import { HttpModule } from "@nestjs/axios";
import { ConfigModule } from "@nestjs/config";

// Application Layer
import { GetWeatherUseCase } from "./application/use-cases/get-weather.use-case";
import { WEATHER_SERVICE } from "./application/dto";

// Infrastructure Layer
import { WeatherController } from "./infrastructure/controllers/weather.controller";
import { OpenMeteoWeatherService } from "./infrastructure/services/open-meteo-weather.service";

@Module({
  imports: [
    HttpModule.register({
      timeout: 10000,
      maxRedirects: 3,
    }),
    ConfigModule,
  ],
  controllers: [WeatherController],
  providers: [
    // ✅ Use Cases
    GetWeatherUseCase,

    // ✅ Services (con inyección de interfaz)
    {
      provide: WEATHER_SERVICE,
      useClass: OpenMeteoWeatherService,
    },
  ],
  exports: [GetWeatherUseCase, WEATHER_SERVICE],
})
export class WeatherModule {}
