/**
 * @controller WeatherController
 * @description Controlador para datos meteorológicos
 * @validation ClassValidator via ValidationPipe global
 */
import {
  Controller,
  Get,
  Query,
  UseGuards,
} from "@nestjs/common";
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiQuery,
} from "@nestjs/swagger";
import { JwtAuthGuard } from "../../../auth/guards/jwt-auth.guard";
import { GetWeatherUseCase } from "../../application/use-cases";
import { WeatherQueryDto } from "../../application/dto";

/**
 * Controller para obtener datos meteorológicos
 * Usa Open-Meteo API (gratuita)
 */
@ApiTags("Weather")
@Controller("weather")
@UseGuards(JwtAuthGuard)
@ApiBearerAuth("JWT-auth")
export class WeatherController {
  constructor(private readonly getWeather: GetWeatherUseCase) {}

  /**
   * Obtener clima actual y pronóstico
   * @param query - Coordenadas lat/lon
   * @returns Datos meteorológicos actuales y pronóstico 7 días
   */
  @Get()
  @ApiOperation({
    summary: "Obtener clima actual",
    description:
      "Retorna datos meteorológicos actuales y pronóstico de 7 días para las coordenadas especificadas.",
  })
  @ApiQuery({
    name: "lat",
    description: "Latitud (-90 a 90)",
    example: 5.3667,
    required: true,
  })
  @ApiQuery({
    name: "lon",
    description: "Longitud (-180 a 180)",
    example: -71.7994,
    required: true,
  })
  @ApiResponse({
    status: 200,
    description: "Datos meteorológicos obtenidos exitosamente",
    schema: {
      properties: {
        current: {
          type: "object",
          properties: {
            temperature: { type: "number", example: 28.5 },
            humidity: { type: "number", example: 75 },
            description: { type: "string", example: "Parcialmente nublado" },
          },
        },
        forecast: {
          type: "array",
          items: {
            type: "object",
            properties: {
              date: { type: "string", example: "2024-12-18" },
              temperatureMax: { type: "number", example: 32 },
              temperatureMin: { type: "number", example: 24 },
            },
          },
        },
      },
    },
  })
  @ApiResponse({ status: 400, description: "Coordenadas inválidas" })
  @ApiResponse({ status: 401, description: "No autenticado" })
  @ApiResponse({
    status: 503,
    description: "Servicio meteorológico no disponible",
  })
  async get(@Query() query: WeatherQueryDto) {
    return this.getWeather.execute(query);
  }
}
