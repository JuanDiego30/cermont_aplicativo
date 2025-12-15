/**
 * ARCHIVO: health.controller.ts
 * FUNCION: Controlador de health checks para monitoreo y orquestación K8s/Docker
 * IMPLEMENTACION: Expone endpoints /health, /health/ready y /health/live con verificación de BD
 * DEPENDENCIAS: @nestjs/common, @nestjs/swagger, @nestjs/throttler, PrismaService
 * EXPORTS: HealthController (clase controlador)
 */
import { Controller, Get } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { SkipThrottle } from '@nestjs/throttler';
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
@SkipThrottle() // Health checks no deben tener rate limiting
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
