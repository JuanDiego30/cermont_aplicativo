/**
 * ARCHIVO: notificar-ordenes-pendientes/route.ts
 * FUNCION: Cron job para notificar sobre órdenes pendientes
 * IMPLEMENTACION: Basado en vercel/examples/solutions/cron
 * SCHEDULE: Lunes a Viernes a las 9 AM (0 9 * * 1-5)
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
    
    // Obtener órdenes pendientes
    const ordenesResponse = await fetch(`${apiUrl}/api/ordenes?status=PENDIENTE&status=EN_PROCESO`, {
      headers: {
        'X-Cron-Secret': process.env.CRON_SECRET || '',
      },
    });

    const ordenes = ordenesResponse.ok ? await ordenesResponse.json() : [];
    
    // Filtrar órdenes con más de 24 horas de antigüedad
    const ahora = Date.now();
    const ordenesUrgentes = Array.isArray(ordenes) 
      ? ordenes.filter((orden: { createdAt?: string }) => {
          if (!orden.createdAt) return false;
          const createdAt = new Date(orden.createdAt).getTime();
          const horasTranscurridas = (ahora - createdAt) / (1000 * 60 * 60);
          return horasTranscurridas > 24;
        })
      : [];

    // Enviar notificaciones si hay órdenes urgentes
    if (ordenesUrgentes.length > 0) {
      await fetch(`${apiUrl}/api/notificaciones/enviar`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Cron-Secret': process.env.CRON_SECRET || '',
        },
        body: JSON.stringify({
          tipo: 'ORDENES_PENDIENTES',
          cantidad: ordenesUrgentes.length,
          ordenesIds: ordenesUrgentes.map((o: { id: string }) => o.id),
        }),
      });
    }

    const duration = Date.now() - startTime;

    console.log(`[Cron] notificar-ordenes-pendientes: ${ordenesUrgentes.length} órdenes urgentes (${duration}ms)`);

    return NextResponse.json({
      success: true,
      message: 'Verificación de órdenes pendientes completada',
      ordenesUrgentes: ordenesUrgentes.length,
      notificacionEnviada: ordenesUrgentes.length > 0,
      duration,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('[Cron] Error en notificar-ordenes-pendientes:', error);
    
    return NextResponse.json(
      {
        success: false,
        error: 'Error al verificar órdenes pendientes',
        timestamp: new Date().toISOString(),
      },
      { status: 500 }
    );
  }
}

export const runtime = 'edge';
export const dynamic = 'force-dynamic';
