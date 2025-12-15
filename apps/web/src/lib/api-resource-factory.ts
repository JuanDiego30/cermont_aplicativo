/**
 * @file api-resource-factory.ts
 * @description Factory genérico para crear servicios API CRUD
 * @module @/lib/api-resource-factory
 * 
 * PROBLEMA RESUELTO:
 * Los servicios CRUD (orders, users, kits, clientes, costos, etc.) tenían
 * implementaciones casi idénticas. Esta factory reduce ~480 líneas de código duplicado.
 * 
 * USO:
 * ```typescript
 * // Antes: ~60 líneas por servicio
 * // Después: ~5 líneas por servicio
 * 
 * export const ordersService = createApiResource<Order, CreateOrderInput, UpdateOrderInput>({
 *   baseUrl: '/orders',
 *   resourceName: 'orders',
 * });
 * ```
 */

import { apiClient } from './api-client';
import { filtersToParams, buildUrlWithParams } from './utils/params';

/**
 * Interfaz base para respuestas paginadas
 */
export interface PaginatedResponse<T> {
    data: T[];
    meta: {
        total: number;
        page: number;
        limit: number;
        totalPages: number;
        hasMore: boolean;
    };
}

/**
 * Interfaz para filtros base
 */
export interface BaseFilters {
    page?: number;
    limit?: number;
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
    search?: string;
}

/**
 * Opciones de configuración para el resource
 */
export interface ResourceConfig<TFilters = BaseFilters> {
    /** URL base del recurso (ej: '/orders') */
    baseUrl: string;
    /** Nombre del recurso para logs/debug */
    resourceName: string;
    /** Si la respuesta de list es paginada */
    isPaginated?: boolean;
    /** Función custom para construir query params */
    buildParams?: (filters: TFilters) => Record<string, string> | undefined;
}

/**
 * Interfaz del servicio CRUD generado
 */
export interface CrudService<
    TEntity,
    TCreate,
    TUpdate,
    TFilters extends BaseFilters = BaseFilters
> {
    /** Lista recursos con filtros opcionales */
    list: (filters?: TFilters) => Promise<PaginatedResponse<TEntity>>;
    /** Lista sin paginación */
    listAll: (filters?: TFilters) => Promise<TEntity[]>;
    /** Obtiene un recurso por ID */
    getById: (id: string) => Promise<TEntity>;
    /** Crea un nuevo recurso */
    create: (data: TCreate) => Promise<TEntity>;
    /** Actualiza un recurso existente */
    update: (id: string, data: TUpdate) => Promise<TEntity>;
    /** Actualiza parcialmente (PATCH) */
    patch: (id: string, data: Partial<TUpdate>) => Promise<TEntity>;
    /** Elimina un recurso */
    delete: (id: string) => Promise<void>;
    /** URL base del recurso */
    baseUrl: string;
    /** Nombre del recurso */
    resourceName: string;
}

/**
 * Crea un servicio CRUD genérico para un recurso API
 * 
 * @param config - Configuración del recurso
 * @returns Servicio con métodos CRUD tipados
 * 
 * @example
 * // Uso básico
 * const ordersService = createApiResource<Order, CreateOrderInput, UpdateOrderInput>({
 *   baseUrl: '/orders',
 *   resourceName: 'orders',
 * });
 * 
 * // Uso con filtros personalizados
 * interface OrderFilters extends BaseFilters {
 *   status?: OrderStatus;
 *   priority?: OrderPriority;
 * }
 * 
 * const ordersService = createApiResource<Order, CreateOrderInput, UpdateOrderInput, OrderFilters>({
 *   baseUrl: '/orders',
 *   resourceName: 'orders',
 *   isPaginated: true,
 * });
 * 
 * // Usar el servicio
 * const orders = await ordersService.list({ status: 'pending', page: 1 });
 * const order = await ordersService.getById('123');
 * const newOrder = await ordersService.create({ title: 'Nueva orden' });
 */
export function createApiResource<
    TEntity,
    TCreate = Partial<TEntity>,
    TUpdate = Partial<TEntity>,
    TFilters extends BaseFilters = BaseFilters
>(config: ResourceConfig<TFilters>): CrudService<TEntity, TCreate, TUpdate, TFilters> {
    const { baseUrl, resourceName, isPaginated = true, buildParams } = config;

    const getParams = (filters?: TFilters): Record<string, string> | undefined => 
        buildParams 
            ? buildParams(filters as TFilters) 
            : filtersToParams(filters as unknown as Record<string, unknown>);

    return {
        baseUrl,
        resourceName,

        /**
         * Lista recursos con paginación
         */
        list: async (filters?: TFilters): Promise<PaginatedResponse<TEntity>> => {
            const url = buildUrlWithParams(baseUrl, getParams(filters));
            
            if (isPaginated) {
                return apiClient.get<PaginatedResponse<TEntity>>(url);
            }
            
            // Si no es paginado, envolver en estructura paginada
            const data = await apiClient.get<TEntity[]>(url);
            return {
                data,
                meta: {
                    total: data.length,
                    page: 1,
                    limit: data.length,
                    totalPages: 1,
                    hasMore: false,
                },
            };
        },

        /**
         * Lista todos los recursos sin paginación
         */
        listAll: async (filters?: TFilters): Promise<TEntity[]> => {
            const url = buildUrlWithParams(baseUrl, getParams(filters));
            
            if (isPaginated) {
                const response = await apiClient.get<PaginatedResponse<TEntity>>(url);
                return response.data;
            }
            
            return apiClient.get<TEntity[]>(url);
        },

        /**
         * Obtiene un recurso por ID
         */
        getById: async (id: string): Promise<TEntity> => {
            return apiClient.get<TEntity>(`${baseUrl}/${id}`);
        },

        /**
         * Crea un nuevo recurso
         */
        create: async (data: TCreate): Promise<TEntity> => {
            return apiClient.post<TEntity>(baseUrl, data);
        },

        /**
         * Actualiza un recurso (PUT - reemplazo completo)
         */
        update: async (id: string, data: TUpdate): Promise<TEntity> => {
            return apiClient.put<TEntity>(`${baseUrl}/${id}`, data);
        },

        /**
         * Actualiza parcialmente un recurso (PATCH)
         */
        patch: async (id: string, data: Partial<TUpdate>): Promise<TEntity> => {
            return apiClient.patch<TEntity>(`${baseUrl}/${id}`, data);
        },

        /**
         * Elimina un recurso
         */
        delete: async (id: string): Promise<void> => {
            await apiClient.delete(`${baseUrl}/${id}`);
        },
    };
}

/**
 * Extiende un servicio CRUD con métodos adicionales
 * 
 * @example
 * const ordersService = extendApiResource(
 *   createApiResource<Order, CreateOrderInput, UpdateOrderInput>({
 *     baseUrl: '/orders',
 *     resourceName: 'orders',
 *   }),
 *   (base) => ({
 *     changeStatus: async (id: string, status: OrderStatus) => {
 *       return apiClient.patch<Order>(`${base.baseUrl}/${id}/status`, { status });
 *     },
 *     getStats: async () => {
 *       return apiClient.get(`${base.baseUrl}/stats`);
 *     },
 *   })
 * );
 */
export function extendApiResource<
    TEntity,
    TCreate,
    TUpdate,
    TFilters extends BaseFilters,
    TExtension extends Record<string, unknown>
>(
    baseService: CrudService<TEntity, TCreate, TUpdate, TFilters>,
    extensionFactory: (base: CrudService<TEntity, TCreate, TUpdate, TFilters>) => TExtension
): CrudService<TEntity, TCreate, TUpdate, TFilters> & TExtension {
    const extension = extensionFactory(baseService);
    return { ...baseService, ...extension };
}
