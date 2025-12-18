/**
 * ARCHIVO: feature-flags.ts
 * FUNCION: Sistema de Feature Flags con Vercel Edge Config
 * IMPLEMENTACION: Basado en vercel/examples/edge-middleware/feature-flag-apple-store
 * DEPENDENCIAS: @vercel/edge-config (opcional)
 * EXPORTS: getFeatureFlags, isFeatureEnabled, FeatureFlags
 */

// ============================================
// TIPOS
// ============================================

export interface FeatureFlags {
  // Funcionalidades de UI
  nuevaInterfazDashboard: boolean;
  modoOscuroHabilitado: boolean;
  animacionesAvanzadas: boolean;

  // Funcionalidades de negocio
  notificacionesPush: boolean;
  reportesAvanzados: boolean;
  exportacionPDF: boolean;
  calendarioIntegrado: boolean;

  // Modo mantenimiento
  modoMantenimiento: boolean;
  mensajeMantenimiento: string;

  // A/B Testing
  varianteFormularioOrden: 'A' | 'B' | 'control';
  varianteDashboard: 'original' | 'nuevo';

  // Límites y configuración
  maxOrdenesSimultaneas: number;
  tiempoSesionMinutos: number;
}

// ============================================
// VALORES POR DEFECTO
// ============================================

const defaultFlags: FeatureFlags = {
  nuevaInterfazDashboard: false,
  modoOscuroHabilitado: true,
  animacionesAvanzadas: true,

  notificacionesPush: false,
  reportesAvanzados: true,
  exportacionPDF: true,
  calendarioIntegrado: true,

  modoMantenimiento: false,
  mensajeMantenimiento: 'El sistema está en mantenimiento. Volveremos pronto.',

  varianteFormularioOrden: 'control',
  varianteDashboard: 'original',

  maxOrdenesSimultaneas: 50,
  tiempoSesionMinutos: 480,
};

// ============================================
// CACHE EN MEMORIA
// ============================================

let cachedFlags: FeatureFlags | null = null;
let cacheExpiry = 0;
const CACHE_TTL = 60 * 1000; // 1 minuto

// ============================================
// IMPLEMENTACIÓN CON EDGE CONFIG
// ============================================

async function fetchFromEdgeConfig(): Promise<Partial<FeatureFlags> | null> {
  const edgeConfigUrl = process.env.EDGE_CONFIG;

  if (!edgeConfigUrl) {
    return null;
  }

  try {
    // Parsear connection string de Edge Config
    const match = edgeConfigUrl.match(/edge-config\/([^?]+)/);
    if (!match) return null;

    const configId = match[1];
    const token = new URL(edgeConfigUrl).searchParams.get('token');

    if (!token) return null;

    const response = await fetch(
      `https://edge-config.vercel.com/${configId}/items?token=${token}`,
      {
        headers: {
          'Content-Type': 'application/json',
        },
        next: { revalidate: 60 }, // Cache por 60 segundos
      }
    );

    if (!response.ok) {
      console.warn('[FeatureFlags] Edge Config fetch failed:', response.status);
      return null;
    }

    const items = await response.json();

    // Convertir items a FeatureFlags
    const flags: Partial<FeatureFlags> = {};
    for (const [key, value] of Object.entries(items)) {
      if (key in defaultFlags) {
        (flags as Record<string, unknown>)[key] = value;
      }
    }

    return flags;
  } catch (error) {
    console.error('[FeatureFlags] Error fetching from Edge Config:', error);
    return null;
  }
}

// ============================================
// IMPLEMENTACIÓN CON VARIABLES DE ENTORNO
// ============================================

function getFromEnv(): Partial<FeatureFlags> {
  const flags: Partial<FeatureFlags> = {};

  // Mapear variables de entorno a feature flags
  const envMapping: Record<string, keyof FeatureFlags> = {
    FEATURE_NUEVA_INTERFAZ_DASHBOARD: 'nuevaInterfazDashboard',
    FEATURE_MODO_OSCURO: 'modoOscuroHabilitado',
    FEATURE_NOTIFICACIONES_PUSH: 'notificacionesPush',
    FEATURE_REPORTES_AVANZADOS: 'reportesAvanzados',
    FEATURE_MODO_MANTENIMIENTO: 'modoMantenimiento',
  };

  for (const [envVar, flagKey] of Object.entries(envMapping)) {
    const value = process.env[envVar];
    if (value !== undefined) {
      (flags as Record<string, unknown>)[flagKey] = value === 'true' || value === '1';
    }
  }

  return flags;
}

// ============================================
// API PÚBLICA
// ============================================

/**
 * Obtiene todos los feature flags
 * Prioridad: Edge Config > Variables de entorno > Defaults
 */
export async function getFeatureFlags(): Promise<FeatureFlags> {
  const now = Date.now();

  // Retornar cache si es válido
  if (cachedFlags && cacheExpiry > now) {
    return cachedFlags;
  }

  // Obtener flags de diferentes fuentes
  const edgeFlags = await fetchFromEdgeConfig();
  const envFlags = getFromEnv();

  // Mergear con prioridad
  const flags: FeatureFlags = {
    ...defaultFlags,
    ...envFlags,
    ...edgeFlags,
  };

  // Actualizar cache
  cachedFlags = flags;
  cacheExpiry = now + CACHE_TTL;

  return flags;
}

/**
 * Verifica si un feature flag específico está habilitado
 */
export async function isFeatureEnabled(flag: keyof FeatureFlags): Promise<boolean> {
  const flags = await getFeatureFlags();
  const value = flags[flag];
  return typeof value === 'boolean' ? value : false;
}

/**
 * Obtiene el valor de un feature flag
 */
export async function getFeatureValue<K extends keyof FeatureFlags>(
  flag: K
): Promise<FeatureFlags[K]> {
  const flags = await getFeatureFlags();
  return flags[flag];
}

/**
 * Invalida el cache de feature flags
 */
export function invalidateFeatureFlagsCache(): void {
  cachedFlags = null;
  cacheExpiry = 0;
}

/**
 * Alias for getFeatureValue for backward compatibility
 */
export const getFeatureFlag = getFeatureValue;

/**
 * Feature flags síncronos (usa defaults si no hay cache)
 * Útil para componentes cliente
 */
export function getFeatureFlagsSync(): FeatureFlags {
  return cachedFlags ?? defaultFlags;
}
