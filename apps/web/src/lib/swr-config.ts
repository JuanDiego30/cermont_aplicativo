/**
 * ARCHIVO: swr-config.ts
 * FUNCION: Configuración global de SWR y factory de keys para data fetching
 * IMPLEMENTACION: Patrón queryKeys similar a React Query, config centralizada con
 *                 políticas de revalidación, retry y deduplicación
 *                 Mejorado con patrones de vercel/examples/solutions/combining-data-fetching-strategies
 * DEPENDENCIAS: swr
 * EXPORTS: swrConfig, swrKeys, createSwrKey, usePrefetch, swrFetcher
 */
import type { SWRConfiguration, Fetcher, Key } from 'swr';
import { mutate } from 'swr';

/**
 * Fetcher global para SWR con manejo de errores mejorado
 * Basado en vercel/examples
 */
export const swrFetcher: Fetcher<unknown, string> = async (url: string) => {
  const res = await fetch(url, {
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
    },
  });

  if (!res.ok) {
    const error = new Error('Error al obtener datos') as Error & {
      status: number;
      info: unknown;
    };
    error.status = res.status;
    
    try {
      error.info = await res.json();
    } catch {
      error.info = null;
    }
    
    // Emitir evento de autenticación expirada
    if (res.status === 401 && typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('auth:expired'));
    }
    
    throw error;
  }

  return res.json();
};

/**
 * Configuración global de SWR mejorada
 * Basado en vercel/examples/solutions/combining-data-fetching-strategies
 */
export const swrConfig: SWRConfiguration = {
  fetcher: swrFetcher,
  revalidateOnFocus: false,
  revalidateOnReconnect: true,
  revalidateIfStale: true,
  dedupingInterval: 5000, // Aumentado para reducir llamadas
  errorRetryCount: 3,
  errorRetryInterval: 5000,
  focusThrottleInterval: 5000,
  loadingTimeout: 3000,
  
  // Callback de error global
  onError: (error, key) => {
    // No mostrar errores de autenticación en consola
    if (error?.status === 401 || error?.status === 403) {
      return;
    }
    console.error(`SWR Error [${key}]:`, error);
  },
  
  // Callback de éxito para analytics (opcional)
  onSuccess: (_data, key) => {
    if (process.env.NODE_ENV === 'development') {
      console.debug(`SWR Success [${key}]`);
    }
  },
  
  shouldRetryOnError: (error) => {
    // No reintentar errores de autenticación o cliente
    if (error?.status >= 400 && error?.status < 500) {
      return false;
    }
    return true;
  },
  
  // Comparador personalizado para evitar re-renders innecesarios
  compare: (a, b) => {
    return JSON.stringify(a) === JSON.stringify(b);
  },
};

/**
 * Utilidad para crear keys de SWR
 * Similar al patrón queryKeys de React Query
 */
export function createSwrKey(base: string, ...args: (string | object | undefined)[]) {
  const filteredArgs = args.filter(arg => arg !== undefined);
  if (filteredArgs.length === 0) return base;
  
  return [base, ...filteredArgs.map(arg => 
    typeof arg === 'object' ? JSON.stringify(arg) : arg
  )].join(':');
}

/**
 * Keys factory para consistencia en toda la app
 */
export const swrKeys = {
  // Auth
  auth: {
    me: () => 'auth:me',
  },
  
  // Users
  users: {
    all: () => 'users',
    list: (params?: object) => createSwrKey('users:list', params),
    detail: (id: string) => `users:detail:${id}`,
    technicians: () => 'users:technicians',
  },
  
  // Orders
  orders: {
    all: () => 'orders',
    list: (params?: object) => createSwrKey('orders:list', params),
    detail: (id: string) => `orders:detail:${id}`,
    stats: () => 'orders:stats',
  },
  
  // Ordenes (español)
  ordenes: {
    all: () => 'ordenes',
    list: (params?: object) => createSwrKey('ordenes:list', params),
    detail: (id: string) => `ordenes:detail:${id}`,
    stats: () => 'ordenes:stats',
  },
  
  // Clientes
  clientes: {
    all: () => 'clientes',
    list: (params?: object) => createSwrKey('clientes:list', params),
    detail: (id: string) => `clientes:detail:${id}`,
    stats: () => 'clientes:stats',
  },
  
  // Tecnicos
  tecnicos: {
    all: () => 'tecnicos',
    list: (params?: object) => createSwrKey('tecnicos:list', params),
    detail: (id: string) => `tecnicos:detail:${id}`,
    stats: () => 'tecnicos:stats',
  },
  
  // Kits
  kits: {
    all: () => 'kits',
    list: (params?: object) => createSwrKey('kits:list', params),
    detail: (id: string) => `kits:detail:${id}`,
  },
  
  // Mantenimientos
  mantenimientos: {
    all: () => 'mantenimientos',
    list: (params?: object) => createSwrKey('mantenimientos:list', params),
    detail: (id: string) => `mantenimientos:detail:${id}`,
    stats: () => 'mantenimientos:stats',
  },
  
  // Planeacion
  planeacion: {
    all: () => 'planeacion',
    list: (params?: object) => createSwrKey('planeacion:list', params),
    detail: (id: string) => `planeacion:detail:${id}`,
  },
  
  // Ejecucion
  ejecucion: {
    all: () => 'ejecucion',
    list: (params?: object) => createSwrKey('ejecucion:list', params),
    detail: (id: string) => `ejecucion:detail:${id}`,
  },
  
  // Evidencias
  evidencias: {
    all: () => 'evidencias',
    list: (params?: object) => createSwrKey('evidencias:list', params),
    detail: (id: string) => `evidencias:detail:${id}`,
  },
  
  // Formularios
  formularios: {
    all: () => 'formularios',
    list: (params?: object) => createSwrKey('formularios:list', params),
    detail: (id: string) => `formularios:detail:${id}`,
  },
  
  // Reportes financieros
  financial: {
    summary: (params?: object) => createSwrKey('financial:summary', params),
    report: (params?: object) => createSwrKey('financial:report', params),
  },
  
  // Dashboard
  dashboard: {
    stats: () => 'dashboard:stats',
    recent: () => 'dashboard:recent',
  },
  
  // Weather
  weather: {
    summary: (lat?: number, lon?: number) => `weather:summary:${lat}:${lon}`,
    current: (lat?: number, lon?: number) => `weather:current:${lat}:${lon}`,
    alerts: (lat?: number, lon?: number) => `weather:alerts:${lat}:${lon}`,
    forecast: (lat?: number, lon?: number) => `weather:forecast:${lat}:${lon}`,
  },
  
  // HES
  hes: {
    all: () => 'hes',
    list: () => 'hes:list',
    stats: () => 'hes:stats',
  },
};

/**
 * Prefetch helper para pre-cargar datos
 * Basado en vercel/examples/solutions/reuse-responses
 */
export async function prefetch<T>(
  key: Key,
  fetcher?: () => Promise<T>
): Promise<void> {
  if (!key) return;
  
  try {
    if (fetcher) {
      const data = await fetcher();
      await mutate(key, data, { revalidate: false });
    } else {
      await mutate(key);
    }
  } catch (error) {
    console.error(`Prefetch error [${String(key)}]:`, error);
  }
}

/**
 * Prefetch múltiples keys
 */
export async function prefetchMultiple(
  keys: Array<{ key: Key; fetcher?: () => Promise<unknown> }>
): Promise<void> {
  await Promise.all(
    keys.map(({ key, fetcher }) => prefetch(key, fetcher))
  );
}

/**
 * Invalidar caché de una key o patrón
 */
export async function invalidateCache(keyOrPattern: Key | RegExp): Promise<void> {
  if (keyOrPattern instanceof RegExp) {
    // Nota: SWR no soporta invalidación por patrón nativo
    // Esta es una aproximación
    console.warn('Invalidación por patrón no soportada nativamente en SWR');
    return;
  }
  
  await mutate(keyOrPattern, undefined, { revalidate: true });
}

/**
 * Hook para prefetch al hover
 * Uso: onMouseEnter={() => prefetchOnHover('/api/ordenes/123')}
 */
export function createPrefetchOnHover(key: string) {
  let prefetched = false;
  
  return () => {
    if (!prefetched) {
      prefetched = true;
      prefetch(key);
    }
  };
}

/**
 * Optimistic update helper
 * Actualiza la UI inmediatamente y luego sincroniza con el servidor
 */
export async function optimisticUpdate<T>(
  key: Key,
  updateFn: (current: T | undefined) => T,
  serverFn: () => Promise<T>
): Promise<T> {
  // Actualización optimista
  await mutate(
    key,
    (current: T | undefined) => updateFn(current),
    { revalidate: false }
  );
  
  try {
    // Sincronizar con servidor
    const result = await serverFn();
    await mutate(key, result, { revalidate: false });
    return result;
  } catch (error) {
    // Revertir en caso de error
    await mutate(key);
    throw error;
  }
}

