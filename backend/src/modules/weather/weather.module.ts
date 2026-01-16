/**
 * @module WeatherModule
 * @description Módulo meteorológico con arquitectura DDD
 *
 * Capas:
 * - Application: Use Cases, DTOs
 * - Infrastructure: Controllers, Services (Open-Meteo API)
 */

import { HttpModule } from "@nestjs/axios";
import { Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";

import { WeatherController } from "./weather.controller";
import { WeatherService } from "./weather.service";

@Module({
  imports: [
    HttpModule.register({
      timeout: 10000,
      maxRedirects: 3,
    }),
    ConfigModule,
  ],
  controllers: [WeatherController],
  providers: [WeatherService],
  exports: [WeatherService],
})
export class WeatherModule {}
