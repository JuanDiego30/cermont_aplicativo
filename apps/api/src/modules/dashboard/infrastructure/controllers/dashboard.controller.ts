/**
 * ═══════════════════════════════════════════════════════════════════════════
 * DASHBOARD CONTROLLER - CERMONT APLICATIVO (REFACTORIZADO)
 * ═══════════════════════════════════════════════════════════════════════════
 * 
 * PROPÓSITO:
 * Endpoints para métricas, KPIs y analytics del dashboard principal
 * 
 * FUNCIONALIDADES:
 * 1. Estadísticas básicas (órdenes, técnicos, clientes)
 * 2. Métricas generales (tiempos, costos, eficiencia)
 * 3. Órdenes recientes (últimas 10)
 * 4. KPIs consolidados (operativos, financieros, técnicos)
 * 5. Desglose de costos por orden
 * 6. Tendencias temporales (día/semana/mes)
 * 
 * ENDPOINTS:
 * - GET /dashboard/stats              → Estadísticas básicas
 * - GET /dashboard/metricas            → Métricas generales
 * - GET /dashboard/ordenes-recientes   → Últimas 10 órdenes
 * - GET /dashboard/overview            → KPIs consolidados (supervisor+)
 * - GET /dashboard/kpis/refresh        → Recalcular KPIs (supervisor+)
 * - GET /dashboard/costs/breakdown     → Desglose de costos (supervisor+)
 * - GET /dashboard/performance/trends  → Tendencias en período (supervisor+)
 * 
 * SEGURIDAD:
 * - JWT requerido en todos los endpoints
 * - Supervisores y admins para KPIs avanzados
 * - Rate limiting por tipo de operación
 * 
 * ═══════════════════════════════════════════════════════════════════════════
 */

import {
    Controller,
    Get,
    Query,
    UseGuards,
    UseInterceptors,
    Logger,
    BadRequestException,
    HttpCode,
    HttpStatus,
    Req,
} from '@nestjs/common';
import {
    ApiTags,
    ApiBearerAuth,
    ApiOperation,
    ApiQuery,
    ApiResponse,
} from '@nestjs/swagger';
import { Throttle } from '@nestjs/throttler';
import { CacheInterceptor, CacheKey, CacheTTL } from '@nestjs/cache-manager';
import { DashboardService } from '../../dashboard.service';
import { KpiCalculatorService } from '../../services/kpi-calculator.service';
import { JwtAuthGuard } from '../../../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../../../common/guards/roles.guard';
import { Roles } from '../../../../common/decorators/roles.decorator';
import { GetDashboardStatsUseCase } from '../../application/use-cases';
import { DashboardQueryDto } from '../../application/dto';

/**
 * Enum para granularidad de tendencias
 */
enum GranularidadTendencia {
    DIA = 'DIA',
    SEMANA = 'SEMANA',
    MES = 'MES',
}

@ApiTags('Dashboard')
@Controller('dashboard')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth()
export class DashboardController {
    private readonly logger = new Logger(DashboardController.name);

    constructor(
        private readonly dashboardService: DashboardService,
        private readonly kpiService: KpiCalculatorService,
        private readonly getDashboardStatsUseCase: GetDashboardStatsUseCase,
    ) { }

    // ═══════════════════════════════════════════════════════════════════════
    // ENDPOINTS BÁSICOS (Todos los usuarios autenticados)
    // ═══════════════════════════════════════════════════════════════════════

    /**
     * ✅ ESTADÍSTICAS BÁSICAS (CACHED)
     */
    @Get('stats')
    @UseInterceptors(CacheInterceptor)
    @CacheKey('dashboard:stats')
    @CacheTTL(300000) // 5 minutos
    @Throttle({ default: { limit: 50, ttl: 60000 } })
    @HttpCode(HttpStatus.OK)
    @ApiOperation({
        summary: 'Estadísticas básicas del dashboard (cached 5min)',
        description: 'Contadores generales: órdenes totales, activas, completadas',
    })
    @ApiResponse({ status: 200, description: 'Estadísticas obtenidas' })
    async getStats(@Req() req: any) {
        const context = {
            action: 'GET_STATS',
            userId: req.user?.userId,
        };
        this.logger.log('Obteniendo estadísticas básicas', context);

        try {
            return await this.dashboardService.getStats();
        } catch (error) {
            const err = error as Error;
            this.logger.error('Error obteniendo estadísticas', {
                ...context,
                error: err.message,
                stack: err.stack,
            });
            throw error;
        }
    }

    /**
     * ✅ MÉTRICAS GENERALES
     */
    @Get('metricas')
    @Throttle({ default: { limit: 50, ttl: 60000 } })
    @HttpCode(HttpStatus.OK)
    @ApiOperation({
        summary: 'Métricas generales de operación',
        description: 'Tiempos promedio, costos, eficiencia',
    })
    @ApiResponse({ status: 200, description: 'Métricas obtenidas' })
    async getMetricas(@Req() req: any) {
        const context = {
            action: 'GET_METRICAS',
            userId: req.user?.userId,
        };
        this.logger.log('Obteniendo métricas generales', context);

        try {
            return await this.dashboardService.getMetricas();
        } catch (error) {
            const err = error as Error;
            this.logger.error('Error obteniendo métricas', {
                ...context,
                error: err.message,
                stack: err.stack,
            });
            throw error;
        }
    }

    /**
     * ✅ ÓRDENES RECIENTES
     */
    @Get('ordenes-recientes')
    @Throttle({ default: { limit: 50, ttl: 60000 } })
    @HttpCode(HttpStatus.OK)
    @ApiOperation({
        summary: 'Últimas 10 órdenes de trabajo',
    })
    @ApiResponse({ status: 200, description: 'Órdenes recientes obtenidas' })
    async getOrdenesRecientes(@Req() req: any) {
        const context = {
            action: 'GET_ORDENES_RECIENTES',
            userId: req.user?.userId,
        };
        this.logger.log('Obteniendo órdenes recientes', context);

        try {
            const ordenes = await this.dashboardService.getOrdenesRecientes();
            this.logger.log('Órdenes recientes obtenidas', {
                ...context,
                count: ordenes.data?.length,
            });
            return ordenes;
        } catch (error) {
            const err = error as Error;
            this.logger.error('Error obteniendo órdenes recientes', {
                ...context,
                error: err.message,
                stack: err.stack,
            });
            throw error;
        }
    }

    /**
     * ✅ ENDPOINT DDD (Use Case) - Mejorado
     */
    @Get('stats/ddd')
    @UseInterceptors(CacheInterceptor)
    @CacheKey('dashboard:stats:ddd')
    @CacheTTL(300000) // 5 minutos
    @Throttle({ default: { limit: 50, ttl: 60000 } })
    @HttpCode(HttpStatus.OK)
    @ApiOperation({
        summary: 'Obtener estadísticas del dashboard (DDD - Production Ready)',
        description: 'Endpoint mejorado con validaciones, logging y manejo de errores robusto',
    })
    @ApiResponse({ status: 200, description: 'Estadísticas obtenidas exitosamente' })
    @ApiResponse({ status: 400, description: 'Parámetros inválidos' })
    async getDashboardStatsEndpoint(@Query() query: any) {
        const context = {
            action: 'GET_DASHBOARD_STATS_DDD',
            query,
        };
        this.logger.log('Obteniendo estadísticas del dashboard (DDD)', context);

        try {
            return await this.getDashboardStatsUseCase.execute(query);
        } catch (error) {
            const err = error as Error;
            this.logger.error('Error obteniendo estadísticas del dashboard (DDD)', {
                ...context,
                error: err.message,
                stack: err.stack,
            });
            throw error;
        }
    }

    // ═══════════════════════════════════════════════════════════════════════
    // ENDPOINTS AVANZADOS (Solo supervisores y admins)
    // ═══════════════════════════════════════════════════════════════════════

    /**
     * ✅ OVERVIEW CONSOLIDADO (KPIs)
     */
    @Get('overview')
    @Roles('supervisor', 'admin')
    @Throttle({ default: { limit: 30, ttl: 60000 } })
    @HttpCode(HttpStatus.OK)
    @ApiOperation({
        summary: 'Vista general consolidada con todos los KPIs',
        description: 'Métricas operativas, costos, técnicos y alertas',
    })
    @ApiResponse({ status: 200, description: 'KPIs consolidados obtenidos' })
    @ApiResponse({ status: 403, description: 'Solo supervisores y admins' })
    async getOverview(@Req() req: any) {
        const context = {
            action: 'GET_OVERVIEW',
            userId: req.user?.userId,
            role: req.user?.role,
        };
        this.logger.log('Obteniendo overview consolidado', context);

        try {
            return await this.kpiService.getKpis();
        } catch (error) {
            const err = error as Error;
            this.logger.error('Error obteniendo overview', {
                ...context,
                error: err.message,
                stack: err.stack,
            });
            throw error;
        }
    }

    /**
     * ✅ FORZAR RECÁLCULO DE KPIs (COSTOSO)
     */
    @Get('kpis/refresh')
    @Roles('supervisor', 'admin')
    @Throttle({ default: { limit: 5, ttl: 60000 } }) // Muy limitado
    @HttpCode(HttpStatus.OK)
    @ApiOperation({
        summary: 'Forzar recálculo de KPIs (invalida caché)',
        description: 'Operación costosa, usar solo cuando necesario',
    })
    @ApiResponse({ status: 200, description: 'KPIs recalculados' })
    async refreshKpis(@Req() req: any) {
        const context = {
            action: 'REFRESH_KPIS',
            userId: req.user?.userId,
        };
        this.logger.warn('Forzando recálculo de KPIs', context);

        try {
            const startTime = Date.now();
            const kpis = await this.kpiService.refreshKpis();
            const duration = Date.now() - startTime;

            this.logger.log('KPIs recalculados', { ...context, durationMs: duration });

            return {
                message: 'KPIs recalculados exitosamente',
                data: kpis,
                meta: { durationMs: duration, timestamp: new Date().toISOString() },
            };
        } catch (error) {
            const err = error as Error;
            this.logger.error('Error recalculando KPIs', {
                ...context,
                error: err.message,
                stack: err.stack,
            });
            throw error;
        }
    }

    /**
     * ✅ DESGLOSE DE COSTOS
     */
    @Get('costs/breakdown')
    @Roles('supervisor', 'admin')
    @Throttle({ default: { limit: 30, ttl: 60000 } })
    @HttpCode(HttpStatus.OK)
    @ApiOperation({ summary: 'Desglose detallado de costos por orden' })
    @ApiResponse({ status: 200, description: 'Desglose de costos obtenido' })
    async getCostosDesglosados(@Req() req: any) {
        const context = {
            action: 'GET_COSTS_BREAKDOWN',
            userId: req.user?.userId,
        };
        this.logger.log('Obteniendo desglose de costos', context);

        try {
            return await this.kpiService.getCostosDesglosados();
        } catch (error) {
            const err = error as Error;
            this.logger.error('Error obteniendo desglose de costos', {
                ...context,
                error: err.message,
                stack: err.stack,
            });
            throw error;
        }
    }

    /**
     * ✅ TENDENCIAS DE KPIs EN PERÍODO
     */
    @Get('performance/trends')
    @Roles('supervisor', 'admin')
    @Throttle({ default: { limit: 20, ttl: 60000 } })
    @HttpCode(HttpStatus.OK)
    @ApiOperation({ summary: 'Tendencias de KPIs en período específico' })
    @ApiQuery({ name: 'desde', required: true, example: '2024-01-01' })
    @ApiQuery({ name: 'hasta', required: true, example: '2024-12-31' })
    @ApiQuery({ name: 'granularidad', required: false, enum: GranularidadTendencia })
    @ApiResponse({ status: 200, description: 'Tendencias obtenidas' })
    @ApiResponse({ status: 400, description: 'Fechas inválidas' })
    async getTendencias(
        @Query('desde') desde: string,
        @Query('hasta') hasta: string,
        @Query('granularidad') granularidad?: GranularidadTendencia,
        @Req() req?: any,
    ) {
        const context = {
            action: 'GET_TRENDS',
            userId: req?.user?.userId,
            desde,
            hasta,
            granularidad: granularidad ?? 'MES',
        };
        this.logger.log('Obteniendo tendencias de KPIs', context);

        try {
            this.validateDateRange(desde, hasta);

            const tendencias = await this.kpiService.getTendencias(
                new Date(desde),
                new Date(hasta),
                granularidad ?? GranularidadTendencia.MES,
            );

            this.logger.log('Tendencias obtenidas', {
                ...context,
                puntosDatos: tendencias.ordenes_completadas?.length ?? 0,
            });

            return tendencias;
        } catch (error) {
            const err = error as Error;
            this.logger.error('Error obteniendo tendencias', {
                ...context,
                error: err.message,
                stack: err.stack,
            });
            throw error;
        }
    }

    // ═══════════════════════════════════════════════════════════════════════
    // VALIDACIÓN PRIVADA
    // ═══════════════════════════════════════════════════════════════════════

    private validateDateRange(desde: string, hasta: string): void {
        const isoDateRegex = /^\d{4}-\d{2}-\d{2}$/;

        if (!isoDateRegex.test(desde)) {
            throw new BadRequestException('Formato inválido para "desde". Use YYYY-MM-DD');
        }
        if (!isoDateRegex.test(hasta)) {
            throw new BadRequestException('Formato inválido para "hasta". Use YYYY-MM-DD');
        }

        const fechaDesde = new Date(desde);
        const fechaHasta = new Date(hasta);

        if (isNaN(fechaDesde.getTime()) || isNaN(fechaHasta.getTime())) {
            throw new BadRequestException('Fecha inválida');
        }

        if (fechaDesde > fechaHasta) {
            throw new BadRequestException('"desde" debe ser anterior a "hasta"');
        }

        const diffDays = (fechaHasta.getTime() - fechaDesde.getTime()) / (1000 * 60 * 60 * 24);
        if (diffDays > 365) {
            throw new BadRequestException('Rango máximo: 365 días');
        }

        if (fechaHasta > new Date()) {
            throw new BadRequestException('No se permiten fechas futuras');
        }
    }
}
