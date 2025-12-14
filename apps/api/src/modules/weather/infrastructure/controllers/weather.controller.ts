/**
 * @controller WeatherController
 */
import { Controller, Get, Query, UseGuards, BadRequestException } from '@nestjs/common';
import { JwtAuthGuard } from '../../../auth/guards/jwt-auth.guard';
import { GetWeatherUseCase } from '../../application/use-cases';
import { WeatherQuerySchema } from '../../application/dto';

@Controller('weather')
@UseGuards(JwtAuthGuard)
export class WeatherController {
  constructor(private readonly getWeather: GetWeatherUseCase) {}

  @Get()
  async get(@Query() query: unknown) {
    const result = WeatherQuerySchema.safeParse(query);
    if (!result.success) throw new BadRequestException(result.error.flatten());
    return this.getWeather.execute(result.data);
  }
}
