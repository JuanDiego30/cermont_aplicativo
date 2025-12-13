/**
 * Health Check Controller
 *
 * Endpoints para verificar el estado del servicio y sus dependencias.
 * Inspirado en fastapi-template: health checks completos para Docker/K8s.
 */
import { Controller, Get } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { PrismaService } from './prisma/prisma.service';

interface HealthStatus {
    status: 'ok' | 'degraded' | 'error';
    timestamp: string;
    uptime: number;
    version: string;
    checks: {
        database: {
            status: 'ok' | 'error';
            latency?: number;
            error?: string;
        };
    };
}

@ApiTags('Health')
@Controller('health')
export class HealthController {
    constructor(private readonly prisma: PrismaService) {}

    @Get()
    @ApiOperation({ summary: 'Health check básico' })
    @ApiResponse({ status: 200, description: 'Servicio operativo' })
    check() {
        return {
            status: 'ok',
            timestamp: new Date().toISOString(),
            uptime: process.uptime(),
        };
    }

    @Get('ready')
    @ApiOperation({ summary: 'Readiness check - verifica DB y dependencias' })
    @ApiResponse({ status: 200, description: 'Servicio listo para recibir tráfico' })
    @ApiResponse({ status: 503, description: 'Servicio no disponible' })
    async ready(): Promise<HealthStatus> {
        const startTime = Date.now();
        let dbStatus: HealthStatus['checks']['database'];

        try {
            // Verificar conexión a BD con query simple
            await this.prisma.$queryRaw`SELECT 1`;
            dbStatus = {
                status: 'ok',
                latency: Date.now() - startTime,
            };
        } catch (error) {
            dbStatus = {
                status: 'error',
                error: error instanceof Error ? error.message : 'Unknown error',
            };
        }

        const overallStatus = dbStatus.status === 'ok' ? 'ok' : 'degraded';

        return {
            status: overallStatus,
            timestamp: new Date().toISOString(),
            uptime: process.uptime(),
            version: process.env.npm_package_version || '1.0.0',
            checks: {
                database: dbStatus,
            },
        };
    }

    @Get('live')
    @ApiOperation({ summary: 'Liveness check - verifica que el proceso responde' })
    @ApiResponse({ status: 200, description: 'Proceso activo' })
    live() {
        return {
            status: 'ok',
            timestamp: new Date().toISOString(),
        };
    }
}
