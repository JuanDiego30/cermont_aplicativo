/**
 * ARCHIVO: geolocation.ts
 * FUNCION: Utilidades para geolocalización en Edge y Cliente
 * IMPLEMENTACION: Basado en vercel/examples/edge-middleware/geolocation
 * DEPENDENCIAS: next/headers (server), navigator.geolocation (client)
 * EXPORTS: serverGeo, useGeolocation, GeoInfo
 */
import { headers } from 'next/headers';

/**
 * Información de geolocalización
 */
export interface GeoInfo {
  country: string;
  countryName: string;
  city: string;
  region: string;
  latitude?: number;
  longitude?: number;
  timezone?: string;
}

/**
 * Mapeo de códigos de país a nombres
 */
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
  // Agregar más según necesidad
};

/**
 * Obtiene información de geolocalización desde headers de Vercel
 * Para usar en Server Components y Route Handlers
 * Basado en: vercel/examples/edge-middleware/geolocation
 */
export async function getServerGeo(): Promise<GeoInfo> {
  const headersList = await headers();
  
  const country = headersList.get('x-vercel-ip-country') || 
                  headersList.get('x-user-country') || 
                  'CO';
  const city = headersList.get('x-vercel-ip-city') || 
               headersList.get('x-user-city') || 
               'Unknown';
  const region = headersList.get('x-vercel-ip-country-region') || 
                 headersList.get('x-user-region') || 
                 'Unknown';
  const latitude = headersList.get('x-vercel-ip-latitude');
  const longitude = headersList.get('x-vercel-ip-longitude');
  const timezone = headersList.get('x-vercel-ip-timezone');
  
  return {
    country,
    countryName: COUNTRY_NAMES[country] || country,
    city: decodeURIComponent(city),
    region: decodeURIComponent(region),
    latitude: latitude ? parseFloat(latitude) : undefined,
    longitude: longitude ? parseFloat(longitude) : undefined,
    timezone: timezone || undefined,
  };
}

/**
 * Configuración por país (precios, moneda, etc.)
 */
export interface CountryConfig {
  currency: string;
  currencySymbol: string;
  locale: string;
  taxRate: number;
  dateFormat: string;
}

const COUNTRY_CONFIGS: Record<string, CountryConfig> = {
  CO: {
    currency: 'COP',
    currencySymbol: '$',
    locale: 'es-CO',
    taxRate: 0.19, // IVA Colombia
    dateFormat: 'DD/MM/YYYY',
  },
  US: {
    currency: 'USD',
    currencySymbol: '$',
    locale: 'en-US',
    taxRate: 0.08,
    dateFormat: 'MM/DD/YYYY',
  },
  MX: {
    currency: 'MXN',
    currencySymbol: '$',
    locale: 'es-MX',
    taxRate: 0.16, // IVA México
    dateFormat: 'DD/MM/YYYY',
  },
  // Default
  DEFAULT: {
    currency: 'COP',
    currencySymbol: '$',
    locale: 'es-CO',
    taxRate: 0.19,
    dateFormat: 'DD/MM/YYYY',
  },
};

/**
 * Obtiene configuración por país
 */
export function getCountryConfig(countryCode: string): CountryConfig {
  return COUNTRY_CONFIGS[countryCode] || COUNTRY_CONFIGS.DEFAULT;
}

/**
 * Formatea precio según el país
 */
export function formatPrice(
  amount: number,
  countryCode: string = 'CO'
): string {
  const config = getCountryConfig(countryCode);
  
  return new Intl.NumberFormat(config.locale, {
    style: 'currency',
    currency: config.currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

/**
 * Calcula precio con impuestos
 */
export function calculatePriceWithTax(
  basePrice: number,
  countryCode: string = 'CO'
): { base: number; tax: number; total: number } {
  const config = getCountryConfig(countryCode);
  const tax = basePrice * config.taxRate;
  
  return {
    base: basePrice,
    tax: Math.round(tax),
    total: Math.round(basePrice + tax),
  };
}

/**
 * Formatea fecha según el país
 */
export function formatDate(
  date: Date | string,
  countryCode: string = 'CO'
): string {
  const config = getCountryConfig(countryCode);
  const d = typeof date === 'string' ? new Date(date) : date;
  
  return new Intl.DateTimeFormat(config.locale, {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(d);
}

/**
 * Formatea fecha y hora según el país
 */
export function formatDateTime(
  date: Date | string,
  countryCode: string = 'CO'
): string {
  const config = getCountryConfig(countryCode);
  const d = typeof date === 'string' ? new Date(date) : date;
  
  return new Intl.DateTimeFormat(config.locale, {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  }).format(d);
}

/**
 * Obtiene la zona horaria del usuario
 */
export function getUserTimezone(): string {
  if (typeof Intl !== 'undefined') {
    return Intl.DateTimeFormat().resolvedOptions().timeZone;
  }
  return 'America/Bogota';
}

/**
 * Verifica si está en horario laboral (Colombia)
 */
export function isBusinessHours(timezone: string = 'America/Bogota'): boolean {
  const now = new Date();
  const options: Intl.DateTimeFormatOptions = {
    timeZone: timezone,
    hour: 'numeric',
    hour12: false,
  };
  
  const hour = parseInt(new Intl.DateTimeFormat('en-US', options).format(now));
  const day = now.getDay();
  
  // Lunes a Viernes, 8am - 6pm
  return day >= 1 && day <= 5 && hour >= 8 && hour < 18;
}
