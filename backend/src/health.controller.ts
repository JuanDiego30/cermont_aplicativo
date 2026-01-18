/**
 * Health Check Controller
 *
 * Endpoints para verificar el estado del servicio y sus dependencias.
 * Inspirado en fastapi-template: health checks completos para Docker/K8s.
 *
 * Rate limiting desactivado para estos endpoints (SkipThrottle).
 */
import { Controller, Get } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { SkipThrottle } from '@nestjs/throttler';
import { PrismaService } from './prisma/prisma.service';
import { Public } from './shared/decorators/public.decorator';

interface DatabaseCheckResult {
  status: 'ok' | 'error';
  latency?: number;
  error?: string;
}

interface HealthStatus {
  status: 'ok' | 'degraded' | 'error';
  timestamp: string;
  uptime: number;
  version: string;
  checks: {
    database: DatabaseCheckResult;
  };
}

@ApiTags('Health')
@Controller('health')
@SkipThrottle()
export class HealthController {
  constructor(private readonly prisma: PrismaService) {}

  private getHealthMeta(withVersion: true): {
    timestamp: string;
    uptime: number;
    version: string;
  };
  private getHealthMeta(withVersion: false): {
    timestamp: string;
    uptime: number;
  };
  private getHealthMeta(withVersion: boolean) {
    const timestamp = new Date().toISOString();
    const uptime = process.uptime();

    if (withVersion) {
      return {
        timestamp,
        uptime,
        version: process.env.npm_package_version || '1.0.0',
      };
    }

    return { timestamp, uptime };
  }

  /**
   * Verifica conexión a base de datos - MÉTODO COMPARTIDO
   */
  private async checkDatabase(): Promise<DatabaseCheckResult> {
    const startTime = Date.now();
    try {
      await this.prisma.$queryRaw`SELECT 1`;
      return {
        status: 'ok',
        latency: Date.now() - startTime,
      };
    } catch (error) {
      return {
        status: 'error',
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  @Get()
  @Public()
  @ApiOperation({ summary: 'Health check básico' })
  @ApiResponse({ status: 200, description: 'Servicio operativo' })
  check() {
    return {
      status: 'ok',
      ...this.getHealthMeta(false),
    };
  }

  @Get('ready')
  @Public()
  @ApiOperation({ summary: 'Readiness check - verifica DB y dependencias' })
  @ApiResponse({
    status: 200,
    description: 'Servicio listo para recibir tráfico',
  })
  @ApiResponse({ status: 503, description: 'Servicio no disponible' })
  async ready(): Promise<HealthStatus> {
    const dbStatus = await this.checkDatabase();
    const overallStatus = dbStatus.status === 'ok' ? 'ok' : 'degraded';

    return {
      status: overallStatus,
      ...this.getHealthMeta(true),
      checks: {
        database: dbStatus,
      },
    };
  }

  @Get('live')
  @Public()
  @ApiOperation({
    summary: 'Liveness check - verifica que el proceso responde',
  })
  @ApiResponse({ status: 200, description: 'Proceso activo' })
  live() {
    return {
      status: 'ok',
      timestamp: new Date().toISOString(),
    };
  }

  @Get('full')
  @Public()
  @ApiOperation({ summary: 'Health check completo - DB, memoria, sistema' })
  @ApiResponse({ status: 200, description: 'Estado completo del sistema' })
  async full(): Promise<Record<string, unknown>> {
    const dbStatus = await this.checkDatabase();
    const memUsage = process.memoryUsage();

    return {
      status: dbStatus.status === 'ok' ? 'ok' : 'degraded',
      ...this.getHealthMeta(true),
      checks: {
        database: dbStatus,
        memory: {
          status: memUsage.heapUsed < 300 * 1024 * 1024 ? 'ok' : 'warning',
          heapUsed: Math.round(memUsage.heapUsed / 1024 / 1024) + ' MB',
          heapTotal: Math.round(memUsage.heapTotal / 1024 / 1024) + ' MB',
          rss: Math.round(memUsage.rss / 1024 / 1024) + ' MB',
        },
      },
    };
  }

  @Get('metrics')
  @Public()
  @ApiOperation({ summary: 'Métricas del sistema' })
  @ApiResponse({ status: 200, description: 'Métricas de performance' })
  metrics(): Record<string, unknown> {
    const memUsage = process.memoryUsage();

    return {
      ...this.getHealthMeta(false),
      memory: {
        heapUsed: Math.round(memUsage.heapUsed / 1024 / 1024) + ' MB',
        heapTotal: Math.round(memUsage.heapTotal / 1024 / 1024) + ' MB',
        rss: Math.round(memUsage.rss / 1024 / 1024) + ' MB',
        external: Math.round(memUsage.external / 1024 / 1024) + ' MB',
      },
      process: {
        pid: process.pid,
        version: process.version,
        platform: process.platform,
        arch: process.arch,
      },
      environment: process.env.NODE_ENV || 'development',
    };
  }
}
