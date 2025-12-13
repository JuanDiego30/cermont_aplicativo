import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation, ApiQuery } from '@nestjs/swagger';
import { DashboardService } from './dashboard.service';
import { KpiCalculatorService } from './services/kpi-calculator.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';

@ApiTags('Dashboard')
@Controller('dashboard')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth()
export class DashboardController {
    constructor(
        private readonly dashboardService: DashboardService,
        private readonly kpiService: KpiCalculatorService,
    ) {}

    // ============================================
    // ENDPOINTS BÁSICOS (existentes)
    // ============================================

    @Get('stats')
    @ApiOperation({ summary: 'Obtener estadísticas básicas' })
    getStats() {
        return this.dashboardService.getStats();
    }

    @Get('metricas')
    @ApiOperation({ summary: 'Obtener métricas generales' })
    getMetricas() {
        return this.dashboardService.getMetricas();
    }

    @Get('ordenes-recientes')
    @ApiOperation({ summary: 'Obtener órdenes recientes' })
    getOrdenesRecientes() {
        return this.dashboardService.getOrdenesRecientes();
    }

    // ============================================
    // NUEVOS ENDPOINTS DE KPIs
    // ============================================

    @Get('overview')
    @Roles('supervisor', 'admin')
    @ApiOperation({
        summary: 'Obtener vista general del dashboard con todos los KPIs',
        description: 'Retorna métricas operativas, costos, técnicos y alertas en tiempo real',
    })
    async getOverview() {
        return await this.kpiService.getKpis();
    }

    @Get('kpis/refresh')
    @Roles('supervisor', 'admin')
    @ApiOperation({ summary: 'Forzar recálculo de KPIs (invalida caché)' })
    async refreshKpis() {
        return await this.kpiService.refreshKpis();
    }

    @Get('costs/breakdown')
    @Roles('supervisor', 'admin')
    @ApiOperation({ summary: 'Obtener desglose de costos por orden' })
    async getCostosDesglosados() {
        return await this.kpiService.getCostosDesglosados();
    }

    @Get('performance/trends')
    @Roles('supervisor', 'admin')
    @ApiOperation({ summary: 'Obtener tendencias de KPIs en período' })
    @ApiQuery({ name: 'desde', required: true, example: '2024-01-01' })
    @ApiQuery({ name: 'hasta', required: true, example: '2024-12-31' })
    @ApiQuery({ name: 'granularidad', required: false, enum: ['DIA', 'SEMANA', 'MES'] })
    async getTendencias(
        @Query('desde') desde: string,
        @Query('hasta') hasta: string,
        @Query('granularidad') granularidad?: 'DIA' | 'SEMANA' | 'MES',
    ) {
        return await this.kpiService.getTendencias(
            new Date(desde),
            new Date(hasta),
            granularidad ?? 'MES',
        );
    }
}
