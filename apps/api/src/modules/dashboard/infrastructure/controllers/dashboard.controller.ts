/**
 * @controller DashboardController
 */
import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../../../auth/guards/jwt-auth.guard';
import { GetDashboardStatsUseCase } from '../../application/use-cases';
import { DashboardQuerySchema } from '../../application/dto';

@Controller('dashboard')
@UseGuards(JwtAuthGuard)
export class DashboardController {
  constructor(private readonly getDashboardStats: GetDashboardStatsUseCase) {}

  @Get()
  async getStats(@Query() query: unknown) {
    const result = DashboardQuerySchema.safeParse(query);
    const filters = result.success ? result.data : {};
    return this.getDashboardStats.execute(filters);
  }
}
