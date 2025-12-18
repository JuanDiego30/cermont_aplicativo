/**
 * ARCHIVO: generar-reportes-diarios/route.ts
 * FUNCION: Cron job para generar reportes diarios
 * IMPLEMENTACION: Basado en vercel/examples/solutions/cron
 * SCHEDULE: Diario a las 11 PM (0 23 * * *)
 */
import { NextRequest, NextResponse } from 'next/server';

function isValidCronRequest(request: NextRequest): boolean {
  const authHeader = request.headers.get('authorization');
  if (process.env.CRON_SECRET) {
    return authHeader === `Bearer ${process.env.CRON_SECRET}`;
  }
  return process.env.NODE_ENV === 'development';
}

export async function GET(request: NextRequest) {
  if (!isValidCronRequest(request)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
    const startTime = Date.now();
    const fecha = new Date().toISOString().split('T')[0];
    
    // Generar reporte diario
    const reporteResponse = await fetch(`${apiUrl}/api/reportes/generar`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Cron-Secret': process.env.CRON_SECRET || '',
      },
      body: JSON.stringify({
        tipo: 'DIARIO',
        fecha,
        incluir: [
          'ordenes_completadas',
          'ordenes_pendientes',
          'tiempo_promedio_resolucion',
          'tecnicos_activos',
          'clientes_atendidos',
        ],
      }),
    });

    const reporte = reporteResponse.ok ? await reporteResponse.json() : {};
    const duration = Date.now() - startTime;

    console.log(`[Cron] generar-reportes-diarios completado en ${duration}ms`);

    return NextResponse.json({
      success: true,
      message: 'Reporte diario generado correctamente',
      fecha,
      duration,
      reporteId: reporte.id,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('[Cron] Error en generar-reportes-diarios:', error);
    
    return NextResponse.json(
      {
        success: false,
        error: 'Error al generar reporte diario',
        timestamp: new Date().toISOString(),
      },
      { status: 500 }
    );
  }
}

export const runtime = 'edge';
export const dynamic = 'force-dynamic';
