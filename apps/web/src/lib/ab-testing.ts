/**
 * ARCHIVO: ab-testing.ts
 * FUNCION: Sistema de A/B Testing en el Edge
 * IMPLEMENTACION: Basado en vercel/examples/edge-middleware/ab-testing-simple
 * DEPENDENCIAS: ninguna
 * EXPORTS: getBucket, ABTestConfig, trackExperiment
 */

// ============================================
// TIPOS
// ============================================

export interface ABTestConfig {
  /** Nombre del experimento */
  name: string;
  /** Nombre de la cookie para persistir variante */
  cookieName: string;
  /** Variantes posibles */
  variants: readonly string[];
  /** Pesos para cada variante (deben sumar 100) */
  weights?: readonly number[];
}

export interface ExperimentResult {
  /** Variante asignada */
  variant: string;
  /** Si es un usuario nuevo (sin cookie previa) */
  isNew: boolean;
}

// ============================================
// CONFIGURACIÓN DE EXPERIMENTOS
// ============================================

export const experiments: Record<string, ABTestConfig> = {
  dashboardLayout: {
    name: 'dashboard-layout',
    cookieName: 'ab-dashboard',
    variants: ['original', 'nuevo', 'minimalista'] as const,
    weights: [50, 30, 20],
  },

  formularioOrden: {
    name: 'formulario-orden',
    cookieName: 'ab-orden-form',
    variants: ['control', 'wizard', 'simplified'] as const,
    weights: [40, 40, 20],
  },

  menuNavegacion: {
    name: 'menu-navegacion',
    cookieName: 'ab-menu',
    variants: ['sidebar', 'topbar'] as const,
    weights: [50, 50],
  },

  colorScheme: {
    name: 'color-scheme',
    cookieName: 'ab-colors',
    variants: ['default', 'vibrant', 'minimal'] as const,
    weights: [60, 20, 20],
  },
};

// Type for experiment names
export type ExperimentName = keyof typeof experiments;

// Alias for ABTestConfig for compatibility
export type Experiment = ABTestConfig;

/**
 * Helper function to get experiment bucket by name
 * Wrapper around getBucket for simpler usage
 */
export function getExperimentBucket(experimentName: ExperimentName): string {
  const config = experiments[experimentName];
  if (!config) return 'control';

  // Check for existing cookie
  let existingCookie: string | undefined;
  if (typeof document !== 'undefined') {
    const cookies = document.cookie.split(';');
    for (const cookie of cookies) {
      const [name, value] = cookie.trim().split('=');
      if (name === config.cookieName) {
        existingCookie = value;
        break;
      }
    }
  }

  const result = getBucket(config, existingCookie);

  // Set cookie if new user
  if (result.isNew && typeof document !== 'undefined') {
    document.cookie = `${config.cookieName}=${result.variant}; path=/; max-age=${60 * 60 * 24 * 30}`;
  }

  return result.variant;
}

// ============================================
// ALGORITMO DE BUCKET
// ============================================

/**
 * Genera un hash numérico a partir de un string
 */
function hashCode(str: string): number {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash;
  }
  return Math.abs(hash);
}

/**
 * Selecciona una variante basada en pesos
 */
function selectByWeight(variants: readonly string[], weights: readonly number[], seed: number): string {
  const normalizedWeights = weights.map(w => w / 100);
  const random = (seed % 1000000) / 1000000;

  let cumulative = 0;
  for (let i = 0; i < variants.length; i++) {
    cumulative += normalizedWeights[i]!;
    if (random < cumulative) {
      return variants[i]!;
    }
  }

  return variants[variants.length - 1]!;
}

/**
 * Obtiene el bucket (variante) para un usuario
 * Si tiene cookie, usa ese valor; si no, asigna uno nuevo
 */
export function getBucket(
  config: ABTestConfig,
  existingCookie?: string,
  userId?: string
): ExperimentResult {
  // Si ya tiene cookie válida, usar esa variante
  if (existingCookie && config.variants.includes(existingCookie)) {
    return {
      variant: existingCookie,
      isNew: false,
    };
  }

  // Generar seed para selección determinística
  const seed = userId
    ? hashCode(`${config.name}:${userId}`)
    : hashCode(`${config.name}:${Date.now()}:${Math.random()}`);

  // Seleccionar variante
  const weights = config.weights ?? config.variants.map(() => 100 / config.variants.length);
  const variant = selectByWeight(config.variants, weights, seed);

  return {
    variant,
    isNew: true,
  };
}

// ============================================
// TRACKING DE EXPERIMENTOS
// ============================================

export interface ExperimentEvent {
  experimentName: string;
  variant: string;
  userId?: string;
  timestamp: number;
  eventType: 'view' | 'conversion' | 'interaction';
  metadata?: Record<string, unknown>;
}

const eventQueue: ExperimentEvent[] = [];
const FLUSH_INTERVAL = 5000; // 5 segundos
const MAX_QUEUE_SIZE = 100;

/**
 * Registra un evento de experimento
 */
export function trackExperiment(
  experimentName: string,
  variant: string,
  eventType: 'view' | 'conversion' | 'interaction',
  userId?: string,
  metadata?: Record<string, unknown>
): void {
  const event: ExperimentEvent = {
    experimentName,
    variant,
    userId,
    timestamp: Date.now(),
    eventType,
    metadata,
  };

  eventQueue.push(event);

  // Flush si la cola está llena
  if (eventQueue.length >= MAX_QUEUE_SIZE) {
    flushEvents();
  }
}

/**
 * Envía eventos al servidor de analytics
 */
async function flushEvents(): Promise<void> {
  if (eventQueue.length === 0) return;

  const events = eventQueue.splice(0, eventQueue.length);

  try {
    // En producción, enviar a endpoint de analytics
    if (process.env.NODE_ENV === 'production' && process.env.ANALYTICS_ENDPOINT) {
      await fetch(process.env.ANALYTICS_ENDPOINT, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ events }),
      });
    } else {
      // En desarrollo, solo log
      console.log('[AB Testing] Events:', events);
    }
  } catch (error) {
    console.error('[AB Testing] Failed to flush events:', error);
    // Re-agregar eventos fallidos a la cola
    eventQueue.unshift(...events);
  }
}

// Flush periódico (solo en cliente)
if (typeof window !== 'undefined') {
  setInterval(flushEvents, FLUSH_INTERVAL);
  window.addEventListener('beforeunload', flushEvents);
}

// ============================================
// HELPERS PARA MIDDLEWARE
// ============================================

/**
 * Obtiene todas las variantes activas de las cookies
 */
export function getActiveVariants(
  cookies: { get: (name: string) => { value: string } | undefined }
): Record<string, string> {
  const variants: Record<string, string> = {};

  for (const [key, config] of Object.entries(experiments)) {
    const cookie = cookies.get(config.cookieName);
    if (cookie?.value && config.variants.includes(cookie.value)) {
      variants[key] = cookie.value;
    }
  }

  return variants;
}

/**
 * Genera configuración de cookie para una variante
 */
export function getVariantCookieConfig(
  config: ABTestConfig,
  variant: string
): {
  name: string;
  value: string;
  maxAge: number;
  path: string;
  sameSite: 'lax' | 'strict' | 'none';
} {
  return {
    name: config.cookieName,
    value: variant,
    maxAge: 60 * 60 * 24 * 30, // 30 días
    path: '/',
    sameSite: 'lax',
  };
}
