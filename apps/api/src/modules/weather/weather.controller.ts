// ============================================
// WEATHER CONTROLLER - Endpoints API Meteorológica
// ============================================

import { Controller, Get, Query, Logger } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiQuery, ApiResponse } from '@nestjs/swagger';
import { WeatherService } from './weather.service';
import { Public } from '../../common/decorators/public.decorator';
import {
  WeatherData,
  RainfallForecast,
  WeatherAlert,
  WeatherLocation,
  HourlyForecast,
} from './dto/weather.dto';

@ApiTags('Weather - Meteorología')
@Controller('weather')
export class WeatherController {
  private readonly logger = new Logger(WeatherController.name);

  constructor(private readonly weatherService: WeatherService) {}

  // ============================================
  // CLIMA ACTUAL
  // ============================================

  @Get('current')
  @Public() // Endpoint público para widgets
  @ApiOperation({
    summary: 'Obtener clima actual',
    description: 'Retorna las condiciones meteorológicas actuales para Caño Limón o coordenadas personalizadas',
  })
  @ApiQuery({ name: 'lat', required: false, description: 'Latitud (default: Caño Limón)' })
  @ApiQuery({ name: 'lon', required: false, description: 'Longitud (default: Caño Limón)' })
  @ApiResponse({ status: 200, description: 'Datos meteorológicos actuales' })
  async getCurrentWeather(
    @Query('lat') lat?: string,
    @Query('lon') lon?: string,
  ): Promise<WeatherData> {
    this.logger.log(`Fetching current weather for ${lat || 'Caño Limón'}, ${lon || ''}`);
    return this.weatherService.getCurrentWeather(
      lat ? parseFloat(lat) : undefined,
      lon ? parseFloat(lon) : undefined,
    );
  }

  // ============================================
  // PRONÓSTICO DE LLUVIA
  // ============================================

  @Get('rainfall')
  @Public()
  @ApiOperation({
    summary: 'Pronóstico de lluvia (7 días)',
    description: 'Retorna el pronóstico de precipitaciones para los próximos 7 días',
  })
  @ApiQuery({ name: 'lat', required: false })
  @ApiQuery({ name: 'lon', required: false })
  @ApiResponse({ status: 200, description: 'Pronóstico de lluvia' })
  async getRainfallForecast(
    @Query('lat') lat?: string,
    @Query('lon') lon?: string,
  ): Promise<RainfallForecast[]> {
    this.logger.log('Fetching rainfall forecast');
    return this.weatherService.getRainfallForecast(
      lat ? parseFloat(lat) : undefined,
      lon ? parseFloat(lon) : undefined,
    );
  }

  // ============================================
  // PRONÓSTICO HORARIO
  // ============================================

  @Get('hourly')
  @Public()
  @ApiOperation({
    summary: 'Pronóstico horario (48h)',
    description: 'Retorna el pronóstico por hora para las próximas 48 horas',
  })
  @ApiQuery({ name: 'lat', required: false })
  @ApiQuery({ name: 'lon', required: false })
  @ApiResponse({ status: 200, description: 'Pronóstico horario' })
  async getHourlyForecast(
    @Query('lat') lat?: string,
    @Query('lon') lon?: string,
  ): Promise<HourlyForecast[]> {
    this.logger.log('Fetching hourly forecast');
    return this.weatherService.getHourlyForecast(
      lat ? parseFloat(lat) : undefined,
      lon ? parseFloat(lon) : undefined,
    );
  }

  // ============================================
  // ALERTAS METEOROLÓGICAS
  // ============================================

  @Get('alerts')
  @Public()
  @ApiOperation({
    summary: 'Alertas meteorológicas',
    description: 'Retorna alertas activas basadas en condiciones climáticas actuales',
  })
  @ApiQuery({ name: 'lat', required: false })
  @ApiQuery({ name: 'lon', required: false })
  @ApiResponse({ status: 200, description: 'Lista de alertas activas' })
  async getWeatherAlerts(
    @Query('lat') lat?: string,
    @Query('lon') lon?: string,
  ): Promise<WeatherAlert[]> {
    this.logger.log('Fetching weather alerts');
    return this.weatherService.getWeatherAlerts(
      lat ? parseFloat(lat) : undefined,
      lon ? parseFloat(lon) : undefined,
    );
  }

  // ============================================
  // DATOS HISTÓRICOS
  // ============================================

  @Get('historical')
  @ApiOperation({
    summary: 'Datos históricos (NASA POWER)',
    description: 'Obtiene datos meteorológicos históricos de NASA POWER API',
  })
  @ApiQuery({ name: 'startDate', required: true, description: 'Fecha inicio (YYYY-MM-DD)' })
  @ApiQuery({ name: 'endDate', required: true, description: 'Fecha fin (YYYY-MM-DD)' })
  @ApiQuery({ name: 'lat', required: false })
  @ApiQuery({ name: 'lon', required: false })
  @ApiResponse({ status: 200, description: 'Datos históricos' })
  async getHistoricalData(
    @Query('startDate') startDate: string,
    @Query('endDate') endDate: string,
    @Query('lat') lat?: string,
    @Query('lon') lon?: string,
  ) {
    this.logger.log(`Fetching historical data from ${startDate} to ${endDate}`);
    return this.weatherService.getHistoricalData(
      startDate,
      endDate,
      lat ? parseFloat(lat) : undefined,
      lon ? parseFloat(lon) : undefined,
    );
  }

  // ============================================
  // UBICACIÓN POR DEFECTO
  // ============================================

  @Get('location')
  @Public()
  @ApiOperation({
    summary: 'Ubicación por defecto',
    description: 'Retorna las coordenadas de Caño Limón configuradas por defecto',
  })
  @ApiResponse({ status: 200, description: 'Ubicación de Caño Limón' })
  getDefaultLocation(): WeatherLocation {
    return this.weatherService.getDefaultLocation();
  }

  // ============================================
  // RESUMEN COMPLETO (para Dashboard)
  // ============================================

  @Get('summary')
  @Public()
  @ApiOperation({
    summary: 'Resumen meteorológico completo',
    description: 'Retorna clima actual, pronóstico de lluvia y alertas en una sola llamada',
  })
  @ApiQuery({ name: 'lat', required: false })
  @ApiQuery({ name: 'lon', required: false })
  @ApiResponse({ status: 200, description: 'Resumen completo' })
  async getWeatherSummary(
    @Query('lat') lat?: string,
    @Query('lon') lon?: string,
  ) {
    const latitude = lat ? parseFloat(lat) : undefined;
    const longitude = lon ? parseFloat(lon) : undefined;

    const [current, rainfall, alerts, hourly] = await Promise.all([
      this.weatherService.getCurrentWeather(latitude, longitude),
      this.weatherService.getRainfallForecast(latitude, longitude),
      this.weatherService.getWeatherAlerts(latitude, longitude),
      this.weatherService.getHourlyForecast(latitude, longitude),
    ]);

    return {
      current,
      rainfall,
      alerts,
      hourlyNext12: hourly.slice(0, 12), // Solo las próximas 12 horas
      lastUpdated: new Date().toISOString(),
    };
  }
}
