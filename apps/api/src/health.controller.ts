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
import { Public } from './common/decorators/public.decorator'; // ✅ Import Public decorator

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
    constructor(private readonly prisma: PrismaService) { }

    @Get()
    @Public() // ✅ Health checks don't require JWT
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
    @Public() // ✅ Public
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
    @Public() // ✅ Public
    @ApiOperation({ summary: 'Liveness check - verifica que el proceso responde' })
    @ApiResponse({ status: 200, description: 'Proceso activo' })
    live() {
        return {
            status: 'ok',
            timestamp: new Date().toISOString(),
        };
    }

    @Get('full')
    @Public() // ✅ Public
    @ApiOperation({ summary: 'Health check completo - DB, memoria, sistema' })
    @ApiResponse({ status: 200, description: 'Estado completo del sistema' })
    async full(): Promise<Record<string, unknown>> {
        const startTime = Date.now();
        const memUsage = process.memoryUsage();

        let dbStatus: { status: string; latency?: number; error?: string };
        try {
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

        return {
            status: dbStatus.status === 'ok' ? 'ok' : 'degraded',
            timestamp: new Date().toISOString(),
            uptime: process.uptime(),
            version: process.env.npm_package_version || '1.0.0',
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
    @Public() // ✅ Public
    @ApiOperation({ summary: 'Métricas del sistema' })
    @ApiResponse({ status: 200, description: 'Métricas de performance' })
    metrics(): Record<string, unknown> {
        const memUsage = process.memoryUsage();

        return {
            timestamp: new Date().toISOString(),
            uptime: process.uptime(),
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
