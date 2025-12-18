/**
 * ARCHIVO: route.ts (API Geo)
 * FUNCION: Endpoint para obtener información de geolocalización del usuario
 * IMPLEMENTACION: Basado en vercel/examples/edge-middleware/geolocation
 * DEPENDENCIAS: next/server, @/lib/geolocation
 * EXPORTS: GET (Edge Function)
 */
import { NextRequest, NextResponse } from 'next/server';

// Ejecutar en Edge Runtime para acceso a headers de geolocalización
export const runtime = 'edge';

interface GeoResponse {
  country: string;
  countryName: string;
  city: string;
  region: string;
  latitude?: number;
  longitude?: number;
  timezone?: string;
  ip?: string;
}

// Mapeo de códigos de país a nombres
const COUNTRY_NAMES: Record<string, string> = {
  CO: 'Colombia',
  US: 'Estados Unidos',
  MX: 'México',
  AR: 'Argentina',
  ES: 'España',
  PE: 'Perú',
  CL: 'Chile',
  EC: 'Ecuador',
  VE: 'Venezuela',
  BR: 'Brasil',
};

export async function GET(request: NextRequest): Promise<NextResponse<GeoResponse>> {
  // Obtener datos de geolocalización de Vercel (request.geo solo disponible en Vercel Edge)
  const country = request.headers.get('x-vercel-ip-country') || 'CO';
  const city = request.headers.get('x-vercel-ip-city') || 'Unknown';
  const region = request.headers.get('x-vercel-ip-country-region') || 'Unknown';
  const latitude = request.headers.get('x-vercel-ip-latitude') || undefined;
  const longitude = request.headers.get('x-vercel-ip-longitude') || undefined;
  const timezone = request.headers.get('x-vercel-ip-timezone');
  
  // IP (solo en modo desarrollo o si se solicita explícitamente)
  const showIp = request.nextUrl.searchParams.get('showIp') === 'true';
  const ip = showIp ? (
    request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ||
    'Unknown'
  ) : undefined;
  
  const response: GeoResponse = {
    country,
    countryName: COUNTRY_NAMES[country] || country,
    city: decodeURIComponent(city),
    region: decodeURIComponent(region),
    latitude: latitude ? parseFloat(String(latitude)) : undefined,
    longitude: longitude ? parseFloat(String(longitude)) : undefined,
    timezone: timezone || undefined,
    ip,
  };
  
  return NextResponse.json(response, {
    headers: {
      // Cachear por 1 hora ya que la ubicación no cambia frecuentemente
      'Cache-Control': 'public, s-maxage=3600',
    },
  });
}
