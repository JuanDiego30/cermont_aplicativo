/**
 * ARCHIVO: verificar-salud-sistema/route.ts
 * FUNCION: Cron job para verificar salud del sistema cada 15 minutos
 * IMPLEMENTACION: Basado en vercel/examples/solutions/cron
 * SCHEDULE: Cada 15 minutos
 */
import { NextRequest, NextResponse } from 'next/server';

function isValidCronRequest(request: NextRequest): boolean {
  const authHeader = request.headers.get('authorization');
  if (process.env.CRON_SECRET) {
    return authHeader === `Bearer ${process.env.CRON_SECRET}`;
  }
  return process.env.NODE_ENV === 'development';
}

interface HealthCheckResult {
  service: string;
  status: 'healthy' | 'degraded' | 'unhealthy';
  latency?: number;
  error?: string;
}

async function checkService(
  name: string,
  url: string,
  timeout: number = 5000
): Promise<HealthCheckResult> {
  const startTime = Date.now();

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeout);

    const response = await fetch(url, {
      method: 'GET',
      signal: controller.signal,
    });

    clearTimeout(timeoutId);
    const latency = Date.now() - startTime;

    return {
      service: name,
      status: response.ok ? 'healthy' : 'degraded',
      latency,
    };
  } catch (error) {
    return {
      service: name,
      status: 'unhealthy',
      latency: Date.now() - startTime,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

export async function GET(request: NextRequest) {
  if (!isValidCronRequest(request)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const startTime = Date.now();
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

    // Verificar servicios en paralelo
    const checks = await Promise.all([
      checkService('api', `${apiUrl}/api/health`),
      checkService('database', `${apiUrl}/api/health/db`),
    ]);

    const allHealthy = checks.every(c => c.status === 'healthy');
    const anyUnhealthy = checks.some(c => c.status === 'unhealthy');
    const overallStatus = anyUnhealthy ? 'unhealthy' : (allHealthy ? 'healthy' : 'degraded');

    const duration = Date.now() - startTime;

    // Log resultado
    console.log(`[Cron] Health check: ${overallStatus} (${duration}ms)`, checks);

    // Si hay problemas, notificar
    if (overallStatus !== 'healthy' && process.env.ALERT_WEBHOOK_URL) {
      await fetch(process.env.ALERT_WEBHOOK_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          text: `⚠️ Sistema CERMONT: Estado ${overallStatus}`,
          checks,
          timestamp: new Date().toISOString(),
        }),
      }).catch(() => { });
    }

    return NextResponse.json({
      success: true,
      status: overallStatus,
      checks,
      duration,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('[Cron] Error en verificar-salud-sistema:', error);

    return NextResponse.json(
      {
        success: false,
        status: 'error',
        error: 'Error al verificar salud del sistema',
        timestamp: new Date().toISOString(),
      },
      { status: 500 }
    );
  }
}

export const runtime = 'edge';
export const dynamic = 'force-dynamic';
