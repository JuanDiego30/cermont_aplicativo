import { Controller, Get, UseGuards } from '@nestjs/common';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { DashboardService } from './dashboard.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';

@ApiTags('Dashboard')
@Controller('dashboard')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class DashboardController {
    constructor(private readonly dashboardService: DashboardService) { }
    @Get('stats') getStats() { return this.dashboardService.getStats(); }
    @Get('metricas') getMetricas() { return this.dashboardService.getMetricas(); }
    @Get('ordenes-recientes') getOrdenesRecientes() { return this.dashboardService.getOrdenesRecientes(); }
}
