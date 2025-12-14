/**
 * ARCHIVO: swr-config.ts
 * FUNCION: Configuración global de SWR y factory de keys para data fetching
 * IMPLEMENTACION: Patrón queryKeys similar a React Query, config centralizada con
 *                 políticas de revalidación, retry y deduplicación
 * DEPENDENCIAS: swr
 * EXPORTS: swrConfig, swrKeys, createSwrKey
 */
import type { SWRConfiguration } from 'swr';

/**
 * Configuración global de SWR
 */
export const swrConfig: SWRConfiguration = {
  revalidateOnFocus: false,
  revalidateOnReconnect: true,
  dedupingInterval: 2000,
  errorRetryCount: 3,
  errorRetryInterval: 1000,
  shouldRetryOnError: (error) => {
    // No reintentar errores de autenticación
    if (error?.status === 401 || error?.status === 403) {
      return false;
    }
    return true;
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
