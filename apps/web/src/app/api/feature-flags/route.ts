/**
 * ARCHIVO: api/feature-flags/route.ts
 * FUNCION: API endpoint para obtener feature flags
 * IMPLEMENTACION: Basado en vercel/examples/edge-config
 */
import { NextRequest, NextResponse } from 'next/server';
import { getFeatureFlags, getFeatureFlag } from '@/lib/feature-flags';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const flagName = searchParams.get('flag');

  try {
    if (flagName) {
      // Obtener flag específico
      const enabled = await getFeatureFlag(flagName as any);
      return NextResponse.json({ 
        flag: flagName, 
        enabled,
        timestamp: new Date().toISOString(),
      });
    }

    // Obtener todos los flags
    const flags = await getFeatureFlags();
    return NextResponse.json({
      ...flags,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('[Feature Flags] Error:', error);
    return NextResponse.json(
      { error: 'Error al obtener feature flags' },
      { status: 500 }
    );
  }
}

export const runtime = 'edge';
