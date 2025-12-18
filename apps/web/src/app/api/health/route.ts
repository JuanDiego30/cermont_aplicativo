/**
 * ARCHIVO: route.ts (API Health Check)
 * FUNCION: Endpoint de health check en Edge Runtime
 * IMPLEMENTACION: Basado en vercel/examples/edge-middleware/json-response
 * DEPENDENCIAS: next/server
 * EXPORTS: GET (Edge Function)
 */
import { NextResponse } from 'next/server';

// Ejecutar en Edge Runtime para mejor performance
export const runtime = 'edge';

// No cachear respuestas de health check
export const dynamic = 'force-dynamic';

interface HealthResponse {
  status: 'healthy' | 'degraded' | 'unhealthy';
  timestamp: string;
  version: string;
  uptime: number;
  environment: string;
  region?: string;
  checks: {
    api: boolean;
    database?: boolean;
  };
}

// Tiempo de inicio para calcular uptime
const startTime = Date.now();

export async function GET(request: Request): Promise<NextResponse<HealthResponse>> {
  const url = new URL(request.url);
  const verbose = url.searchParams.get('verbose') === 'true';

  // Información básica
  const response: HealthResponse = {
    status: 'healthy',
    timestamp: new Date().toISOString(),
    version: process.env.npm_package_version || '1.0.0',
    uptime: Math.floor((Date.now() - startTime) / 1000),
    environment: process.env.NODE_ENV || 'development',
    checks: {
      api: true,
    },
  };

  // Añadir región de Vercel si está disponible
  const region = request.headers.get('x-vercel-id')?.split(':')[0];
  if (region) {
    response.region = region;
  }

  // Health check detallado si se solicita
  if (verbose) {
    try {
      // Verificar conexión al backend API
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';
      const apiCheck = await fetch(`${apiUrl}/health`, {
        method: 'GET',
        signal: AbortSignal.timeout(5000),
      }).catch(() => null);

      response.checks.api = apiCheck?.ok ?? false;

      // Si algún check falla, marcar como degradado
      if (!response.checks.api) {
        response.status = 'degraded';
      }
    } catch {
      response.status = 'degraded';
      response.checks.api = false;
    }
  }

  const statusCode = response.status === 'healthy' ? 200 : 503;

  return NextResponse.json(response, {
    status: statusCode,
    headers: {
      'Cache-Control': 'no-store, max-age=0',
    },
  });
}
