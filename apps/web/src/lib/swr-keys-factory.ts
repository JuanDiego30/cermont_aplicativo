/**
 * @file swr-keys-factory.ts
 * @description Factory para crear keys de SWR de forma consistente
 * @module @/lib/swr-keys-factory
 * 
 * PROBLEMA RESUELTO:
 * Cada feature tenía su propia implementación de keys factory con el mismo patrón.
 * Esto causaba ~60 líneas de código duplicado entre features.
 * 
 * USO:
 * ```typescript
 * // Antes: ~10 líneas por feature
 * // Después: 1 línea
 * 
 * export const ordenesKeys = createSwrKeys('ordenes');
 * ```
 */

/**
 * Estructura de keys para un recurso
 */
export interface ResourceKeys<TParams = unknown> {
    /** Key base del recurso */
    all: readonly [string];
    /** Keys para listas */
    lists: () => readonly [string, 'list'];
    /** Key para una lista específica con parámetros */
    list: (params?: TParams) => readonly [string, 'list', TParams | undefined];
    /** Keys para detalles */
    details: () => readonly [string, 'detail'];
    /** Key para un detalle específico */
    detail: (id: string) => readonly [string, 'detail', string];
    /** Keys para estadísticas */
    stats: () => readonly [string, 'stats'];
}

/**
 * Crea una factory de keys SWR para un recurso
 * 
 * @param resourceName - Nombre del recurso (ej: 'ordenes', 'tecnicos')
 * @returns Objeto con métodos para generar keys consistentes
 * 
 * @example
 * const ordenesKeys = createSwrKeys('ordenes');
 * 
 * // Uso en hooks
 * useSWR(ordenesKeys.list({ page: 1 }), fetcher);
 * useSWR(ordenesKeys.detail('123'), fetcher);
 * useSWR(ordenesKeys.stats(), fetcher);
 */
export function createSwrKeys<TParams = unknown>(resourceName: string): ResourceKeys<TParams> {
    const all = [resourceName] as const;

    return {
        all,
        lists: () => [...all, 'list'] as const,
        list: (params?: TParams) => [...all, 'list', params] as const,
        details: () => [...all, 'detail'] as const,
        detail: (id: string) => [...all, 'detail', id] as const,
        stats: () => [...all, 'stats'] as const,
    };
}

/**
 * Crea keys con soporte para subrecursos
 * 
 * @example
 * const planeacionKeys = createSwrKeysWithSubresources('planeacion', ['items', 'kits']);
 * 
 * planeacionKeys.subresource('items').list('plan-123'); // ['planeacion', 'items', 'list', 'plan-123']
 */
export function createSwrKeysWithSubresources<TParams = unknown>(
    resourceName: string,
    subresources: string[]
): ResourceKeys<TParams> & {
    subresource: (name: string) => {
        all: (parentId: string) => readonly [string, string, string];
        list: (parentId: string) => readonly [string, string, 'list', string];
        detail: (parentId: string, id: string) => readonly [string, string, 'detail', string, string];
    };
} {
    const baseKeys = createSwrKeys<TParams>(resourceName);

    return {
        ...baseKeys,
        subresource: (name: string) => {
            if (!subresources.includes(name)) {
                console.warn(`Subresource "${name}" not defined for "${resourceName}"`);
            }
            return {
                all: (parentId: string) => [resourceName, name, parentId] as const,
                list: (parentId: string) => [resourceName, name, 'list', parentId] as const,
                detail: (parentId: string, id: string) => [resourceName, name, 'detail', parentId, id] as const,
            };
        },
    };
}

/**
 * Keys predefinidos para los recursos principales de Cermont
 * Estos ya están creados y listos para usar
 */
export const swrKeysRegistry = {
    ordenes: createSwrKeys<{ estado?: string; clienteId?: string; page?: number; limit?: number }>('ordenes'),
    orders: createSwrKeys<{ status?: string; clientId?: string; page?: number; limit?: number }>('orders'),
    tecnicos: createSwrKeys<{ disponible?: string; estado?: string; page?: number }>('tecnicos'),
    usuarios: createSwrKeys<{ role?: string; active?: boolean; page?: number }>('usuarios'),
    kits: createSwrKeys<{ categoria?: string; activo?: boolean }>('kits'),
    clientes: createSwrKeys<{ estado?: string; page?: number }>('clientes'),
    evidencias: createSwrKeys<{ ordenId?: string; tipo?: string }>('evidencias'),
    planeacion: createSwrKeysWithSubresources<{ ordenId?: string }>('planeacion', ['items', 'kits']),
    ejecucion: createSwrKeys<{ ordenId?: string; estado?: string }>('ejecucion'),
    costos: createSwrKeys<{ ordenId?: string; tipo?: string }>('costos'),
    mantenimientos: createSwrKeys<{ estado?: string; equipoId?: string }>('mantenimientos'),
    checklists: createSwrKeys<{ ejecucionId?: string }>('checklists'),
    formularios: createSwrKeys<{ categoria?: string; estado?: string }>('formularios'),
} as const;

// Type helper para obtener las keys de un recurso específico
export type SwrKeysFor<K extends keyof typeof swrKeysRegistry> = typeof swrKeysRegistry[K];
