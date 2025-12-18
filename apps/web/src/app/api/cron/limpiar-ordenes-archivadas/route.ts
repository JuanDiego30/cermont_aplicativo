/**
 * ARCHIVO: limpiar-ordenes-archivadas/route.ts
 * FUNCION: Cron job para limpiar órdenes archivadas antiguas
 * IMPLEMENTACION: Basado en vercel/examples/solutions/cron
 * SCHEDULE: Diario a las 2 AM (0 2 * * *)
 */
import { NextRequest, NextResponse } from 'next/server';

// Verificar que el cron viene de Vercel
function isValidCronRequest(request: NextRequest): boolean {
  const authHeader = request.headers.get('authorization');
  
  // En producción, verificar con CRON_SECRET
  if (process.env.CRON_SECRET) {
    return authHeader === `Bearer ${process.env.CRON_SECRET}`;
  }
  
  // En desarrollo, permitir sin verificación
  return process.env.NODE_ENV === 'development';
}

export async function GET(request: NextRequest) {
  // Verificar autorización
  if (!isValidCronRequest(request)) {
    return NextResponse.json(
      { error: 'Unauthorized' },
      { status: 401 }
    );
  }

  try {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
    const startTime = Date.now();
    
    // Llamar al backend para limpiar órdenes archivadas mayores a 90 días
    const response = await fetch(`${apiUrl}/api/ordenes/cleanup`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Cron-Secret': process.env.CRON_SECRET || '',
      },
      body: JSON.stringify({
        olderThanDays: 90,
        status: 'ARCHIVADA',
      }),
    });

    const result = response.ok ? await response.json().catch(() => ({})) : {};
    const duration = Date.now() - startTime;

    console.log(`[Cron] limpiar-ordenes-archivadas completado en ${duration}ms`, result);

    return NextResponse.json({
      success: true,
      message: 'Limpieza de órdenes archivadas completada',
      duration,
      timestamp: new Date().toISOString(),
      ...result,
    });
  } catch (error) {
    console.error('[Cron] Error en limpiar-ordenes-archivadas:', error);
    
    return NextResponse.json(
      {
        success: false,
        error: 'Error al limpiar órdenes archivadas',
        timestamp: new Date().toISOString(),
      },
      { status: 500 }
    );
  }
}

// Configuración para Edge Runtime (opcional)
export const runtime = 'edge';
export const dynamic = 'force-dynamic';
