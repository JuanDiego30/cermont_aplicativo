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
 * - GET /dashboard/metrics             → General metrics
 * - GET /dashboard/recent-orders       → Latest 10 orders
 * - GET /dashboard/stats/ddd           → Estadísticas DDD
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

import { CacheInterceptor, CacheKey, CacheTTL } from '@nestjs/cache-manager';
import {
  BadRequestException,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Logger,
  Query,
  Req,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiQuery, ApiResponse, ApiTags } from '@nestjs/swagger';
import { Throttle } from '@nestjs/throttler';
import { Request } from 'express';
import { Roles } from '../../../../shared/decorators/roles.decorator';
import { JwtAuthGuard } from '../../../../shared/guards/jwt-auth.guard';
import { RolesGuard } from '../../../../shared/guards/roles.guard';
import { DashboardQueryDto } from '../../application/dto';
import { GetDashboardStatsUseCase } from '../../application/use-cases';
import { DashboardService } from '../../dashboard.service';
import { KpiCalculatorService } from '../../services/kpi-calculator.service';

/**
 * Enum para granularidad de tendencias
 */
enum GranularidadTendencia {
  DIA = 'DIA',
  SEMANA = 'SEMANA',
  MES = 'MES',
}

/**
 * Interface para el usuario autenticado
 */
interface AuthenticatedUser {
  userId: string;
  email: string;
  role: string;
}

/**
 * Interface extendida para Request con usuario
 */
interface RequestWithUser extends Request {
  user?: AuthenticatedUser;
}

/**
 * Interface para contexto de logging
 */
interface LogContext {
  action: string;
  userId?: string;
  role?: string;
  [key: string]: any;
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
    private readonly getDashboardStatsUseCase: GetDashboardStatsUseCase
  ) {
    this.logger.log('DashboardController inicializado correctamente');
  }

  // ═══════════════════════════════════════════════════════════════════════
  // ENDPOINTS BÁSICOS (Todos los usuarios autenticados)
  // ═══════════════════════════════════════════════════════════════════════

  /**
   * Obtener estadísticas básicas del dashboard
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
  @ApiResponse({
    status: 200,
    description: 'Estadísticas obtenidas exitosamente',
  })
  @ApiResponse({ status: 401, description: 'No autorizado' })
  async getStats(@Req() req: RequestWithUser) {
    const context = this.createLogContext('GET_STATS', req.user);
    this.logger.log('Obteniendo estadísticas básicas', context);

    try {
      const stats = await this.dashboardService.getStats();
      this.logger.log('Estadísticas obtenidas exitosamente', context);
      return stats;
    } catch (error) {
      this.handleError(error, context, 'Error obteniendo estadísticas');
    }
  }

  /**
   * Obtener métricas generales de operación
   */
  @Get('metrics')
  @Throttle({ default: { limit: 50, ttl: 60000 } })
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'General operational metrics',
    description: 'Average times, costs, efficiency',
  })
  @ApiResponse({ status: 200, description: 'Métricas obtenidas exitosamente' })
  @ApiResponse({ status: 401, description: 'No autorizado' })
  async getMetricas(@Req() req: RequestWithUser) {
    const context = this.createLogContext('GET_METRICAS', req.user);
    this.logger.log('Obteniendo métricas generales', context);

    try {
      const metricas = await this.dashboardService.getMetricas();
      this.logger.log('Métricas obtenidas exitosamente', context);
      return metricas;
    } catch (error) {
      this.handleError(error, context, 'Error obteniendo métricas');
    }
  }

  /**
   * Obtener últimas 10 órdenes de trabajo
   */
  @Get('recent-orders')
  @Throttle({ default: { limit: 50, ttl: 60000 } })
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Latest 10 work orders',
    description: 'Most recent orders sorted by creation date',
  })
  @ApiResponse({
    status: 200,
    description: 'Recent orders retrieved successfully',
  })
  @ApiResponse({ status: 401, description: 'No autorizado' })
  async getOrdenesRecientes(@Req() req: RequestWithUser) {
    const context = this.createLogContext('GET_ORDENES_RECIENTES', req.user);
    this.logger.log('Obteniendo órdenes recientes', context);

    try {
      const ordenes = await this.dashboardService.getOrdenesRecientes();

      this.logger.log('Órdenes recientes obtenidas exitosamente', {
        ...context,
        count: ordenes.data?.length || 0,
      });

      return ordenes;
    } catch (error) {
      this.handleError(error, context, 'Error obteniendo órdenes recientes');
    }
  }

  /**
   * Obtener estadísticas usando arquitectura DDD (Use Case)
   */
  @Get('stats/ddd')
  @UseInterceptors(CacheInterceptor)
  @CacheKey('dashboard:stats:ddd')
  @CacheTTL(300000) // 5 minutos
  @Throttle({ default: { limit: 50, ttl: 60000 } })
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Estadísticas del dashboard (DDD - Production Ready)',
    description: 'Endpoint mejorado con validaciones, logging y manejo de errores robusto',
  })
  @ApiResponse({
    status: 200,
    description: 'Estadísticas obtenidas exitosamente',
  })
  @ApiResponse({ status: 400, description: 'Parámetros inválidos' })
  @ApiResponse({ status: 401, description: 'No autorizado' })
  async getDashboardStatsEndpoint(@Query() query: DashboardQueryDto) {
    const context: LogContext = {
      action: 'GET_DASHBOARD_STATS_DDD',
      query: query || {},
    };
    this.logger.log('Obteniendo estadísticas del dashboard (DDD)', context);

    try {
      const stats = await this.getDashboardStatsUseCase.execute(query);
      this.logger.log('Estadísticas DDD obtenidas exitosamente', context);
      return stats;
    } catch (error) {
      this.handleError(error, context, 'Error obteniendo estadísticas del dashboard (DDD)');
    }
  }

  // ═══════════════════════════════════════════════════════════════════════
  // ENDPOINTS AVANZADOS (Solo supervisores y admins)
  // ═══════════════════════════════════════════════════════════════════════

  /**
   * Vista general consolidada con todos los KPIs
   */
  @Get('overview')
  @Roles('supervisor', 'admin')
  @Throttle({ default: { limit: 30, ttl: 60000 } })
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Vista general consolidada con todos los KPIs',
    description: 'Métricas operativas, costos, técnicos y alertas. Solo supervisores y admins.',
  })
  @ApiResponse({
    status: 200,
    description: 'KPIs consolidados obtenidos exitosamente',
  })
  @ApiResponse({ status: 401, description: 'No autorizado' })
  @ApiResponse({
    status: 403,
    description: 'Acceso denegado. Solo supervisores y admins',
  })
  async getOverview(@Req() req: RequestWithUser) {
    const context = this.createLogContext('GET_OVERVIEW', req.user);
    this.logger.log('Obteniendo overview consolidado', context);

    try {
      const kpis = await this.kpiService.getKpis();
      this.logger.log('Overview consolidado obtenido exitosamente', context);
      return kpis;
    } catch (error) {
      this.handleError(error, context, 'Error obteniendo overview');
    }
  }

  /**
   * Forzar recálculo de KPIs (operación costosa)
   */
  @Get('kpis/refresh')
  @Roles('supervisor', 'admin')
  @Throttle({ default: { limit: 5, ttl: 60000 } })
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Forzar recálculo de KPIs (invalida caché)',
    description: '⚠️ Operación costosa. Usar solo cuando sea absolutamente necesario',
  })
  @ApiResponse({ status: 200, description: 'KPIs recalculados exitosamente' })
  @ApiResponse({ status: 401, description: 'No autorizado' })
  @ApiResponse({
    status: 403,
    description: 'Acceso denegado. Solo supervisores y admins',
  })
  async refreshKpis(@Req() req: RequestWithUser) {
    const context = this.createLogContext('REFRESH_KPIS', req.user);
    this.logger.warn('⚠️ Forzando recálculo de KPIs (operación costosa)', context);

    try {
      const startTime = Date.now();
      const kpis = await this.kpiService.refreshKpis();
      const duration = Date.now() - startTime;

      this.logger.log('KPIs recalculados exitosamente', {
        ...context,
        durationMs: duration,
      });

      return {
        message: 'KPIs recalculados exitosamente',
        data: kpis,
        meta: {
          durationMs: duration,
          timestamp: new Date().toISOString(),
        },
      };
    } catch (error) {
      this.handleError(error, context, 'Error recalculando KPIs');
    }
  }

  /**
   * Desglose detallado de costos por orden
   */
  @Get('costs/breakdown')
  @Roles('supervisor', 'admin')
  @Throttle({ default: { limit: 30, ttl: 60000 } })
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Desglose detallado de costos por orden',
    description: 'Análisis de costos por tipo y orden. Solo supervisores y admins.',
  })
  @ApiResponse({
    status: 200,
    description: 'Desglose de costos obtenido exitosamente',
  })
  @ApiResponse({ status: 401, description: 'No autorizado' })
  @ApiResponse({
    status: 403,
    description: 'Acceso denegado. Solo supervisores y admins',
  })
  async getCostosDesglosados(@Req() req: RequestWithUser) {
    const context = this.createLogContext('GET_COSTS_BREAKDOWN', req.user);
    this.logger.log('Obteniendo desglose de costos', context);

    try {
      const costos = await this.kpiService.getCostosDesglosados();
      this.logger.log('Desglose de costos obtenido exitosamente', context);
      return costos;
    } catch (error) {
      this.handleError(error, context, 'Error obteniendo desglose de costos');
    }
  }

  /**
   * Tendencias de KPIs en período específico
   */
  @Get('performance/trends')
  @Roles('supervisor', 'admin')
  @Throttle({ default: { limit: 20, ttl: 60000 } })
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Tendencias de KPIs en período específico',
    description: 'Análisis temporal con granularidad configurable (día/semana/mes)',
  })
  @ApiQuery({
    name: 'desde',
    required: true,
    example: '2024-01-01',
    description: 'Fecha inicio (YYYY-MM-DD)',
  })
  @ApiQuery({
    name: 'hasta',
    required: true,
    example: '2024-12-31',
    description: 'Fecha fin (YYYY-MM-DD)',
  })
  @ApiQuery({
    name: 'granularidad',
    required: false,
    enum: GranularidadTendencia,
    description: 'Granularidad del análisis (por defecto: MES)',
  })
  @ApiResponse({
    status: 200,
    description: 'Tendencias obtenidas exitosamente',
  })
  @ApiResponse({
    status: 400,
    description: 'Fechas inválidas o rango excesivo (máx 365 días)',
  })
  @ApiResponse({ status: 401, description: 'No autorizado' })
  @ApiResponse({
    status: 403,
    description: 'Acceso denegado. Solo supervisores y admins',
  })
  async getTendencias(
    @Query('desde') desde: string,
    @Query('hasta') hasta: string,
    @Query('granularidad')
    granularidad: GranularidadTendencia = GranularidadTendencia.MES,
    @Req() req: RequestWithUser
  ) {
    const context = this.createLogContext('GET_TRENDS', req.user, {
      desde,
      hasta,
      granularidad,
    });
    this.logger.log('Obteniendo tendencias de KPIs', context);

    try {
      this.validateDateRange(desde, hasta);

      const tendencias = await this.kpiService.getTendencias(
        new Date(desde),
        new Date(hasta),
        granularidad
      );

      this.logger.log('Tendencias obtenidas exitosamente', {
        ...context,
        puntosDatos: tendencias.ordenes_completadas?.length || 0,
      });

      return tendencias;
    } catch (error) {
      this.handleError(error, context, 'Error obteniendo tendencias');
    }
  }

  // ═══════════════════════════════════════════════════════════════════════
  // MÉTODOS PRIVADOS
  // ═══════════════════════════════════════════════════════════════════════

  /**
   * Crear contexto estructurado para logging
   */
  private createLogContext(
    action: string,
    user?: AuthenticatedUser,
    additionalData?: Record<string, any>
  ): LogContext {
    return {
      action,
      userId: user?.userId,
      role: user?.role,
      timestamp: new Date().toISOString(),
      ...additionalData,
    };
  }

  /**
   * Manejo centralizado de errores
   */
  private handleError(error: unknown, context: LogContext, message: string): never {
    const err = error as Error;

    this.logger.error(message, {
      ...context,
      error: err.message,
      stack: err.stack,
    });

    throw error;
  }

  /**
   * Validar rango de fechas para consultas de tendencias
   */
  private validateDateRange(desde: string, hasta: string): void {
    const isoDateRegex = /^\d{4}-\d{2}-\d{2}$/;

    if (!isoDateRegex.test(desde)) {
      throw new BadRequestException('Formato inválido para "desde". Use formato YYYY-MM-DD');
    }

    if (!isoDateRegex.test(hasta)) {
      throw new BadRequestException('Formato inválido para "hasta". Use formato YYYY-MM-DD');
    }

    const fechaDesde = new Date(desde);
    const fechaHasta = new Date(hasta);

    if (isNaN(fechaDesde.getTime()) || isNaN(fechaHasta.getTime())) {
      throw new BadRequestException('Fecha inválida proporcionada');
    }

    if (fechaDesde > fechaHasta) {
      throw new BadRequestException('La fecha "desde" debe ser anterior a la fecha "hasta"');
    }

    const diffDays = (fechaHasta.getTime() - fechaDesde.getTime()) / (1000 * 60 * 60 * 24);

    if (diffDays > 365) {
      throw new BadRequestException('El rango máximo permitido es de 365 días');
    }

    if (fechaHasta > new Date()) {
      throw new BadRequestException('No se permiten fechas futuras en el rango de consulta');
    }
  }
}
