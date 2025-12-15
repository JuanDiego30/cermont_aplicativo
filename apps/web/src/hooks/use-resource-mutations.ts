/**
 * @file use-resource-mutations.ts
 * @description Factory para crear hooks de mutación CRUD reutilizables
 * @module @/hooks/use-resource-mutations
 * 
 * PROBLEMA RESUELTO:
 * Los hooks de mutación (useCreateXXX, useUpdateXXX, useDeleteXXX) tenían
 * implementaciones casi idénticas en cada feature. Esta factory reduce
 * ~375 líneas de código duplicado.
 * 
 * USO:
 * ```typescript
 * // Antes: ~60 líneas para 4 hooks por recurso
 * // Después: ~10 líneas para 4 hooks
 * 
 * const { useCreate, useUpdate, useDelete, useAction } = createResourceMutations({
 *   resourceName: 'ordenes',
 *   api: ordenesApi,
 * });
 * 
 * export const useCreateOrden = useCreate;
 * export const useUpdateOrden = useUpdate;
 * ```
 */
'use client';

import { useMutation, useInvalidate } from './use-mutation';
import { toast } from 'sonner';
import { getErrorMessage } from '@/lib/utils/error';

/**
 * Configuración para el factory de mutaciones
 */
export interface MutationFactoryConfig<TApi> {
    /** Nombre del recurso para invalidación y mensajes */
    resourceName: string;
    /** Objeto API con métodos CRUD */
    api: TApi;
    /** Mensajes personalizados (opcional) */
    messages?: {
        createSuccess?: string;
        createError?: string;
        updateSuccess?: string;
        updateError?: string;
        deleteSuccess?: string;
        deleteError?: string;
    };
    /** Si mostrar toasts automáticamente */
    showToasts?: boolean;
    /** Keys adicionales a invalidar */
    additionalInvalidateKeys?: string[];
}

/**
 * API mínima requerida para el factory
 */
export interface MinimalCrudApi<TEntity, TCreate, TUpdate> {
    create?: (data: TCreate) => Promise<TEntity>;
    update?: (id: string, data: TUpdate) => Promise<TEntity>;
    patch?: (id: string, data: Partial<TUpdate>) => Promise<TEntity>;
    delete?: (id: string) => Promise<void>;
}

/**
 * Hooks generados por el factory
 */
export interface ResourceMutationHooks<TEntity, TCreate, TUpdate> {
    /** Hook para crear un recurso */
    useCreate: () => ReturnType<typeof useMutation<TEntity, TCreate>>;
    /** Hook para actualizar un recurso */
    useUpdate: () => ReturnType<typeof useMutation<TEntity, { id: string; data: TUpdate }>>;
    /** Hook para actualizar parcialmente */
    usePatch: () => ReturnType<typeof useMutation<TEntity, { id: string; data: Partial<TUpdate> }>>;
    /** Hook para eliminar un recurso */
    useDelete: () => ReturnType<typeof useMutation<void, string>>;
    /** Factory para crear hooks de acciones personalizadas */
    useAction: <TResult, TInput>(
        actionFn: (input: TInput) => Promise<TResult>,
        options?: {
            successMessage?: string;
            errorMessage?: string;
            invalidateKeys?: string[];
        }
    ) => () => ReturnType<typeof useMutation<TResult, TInput>>;
}

/**
 * Crea hooks de mutación para un recurso
 * 
 * @param config - Configuración del factory
 * @returns Objeto con hooks de mutación
 * 
 * @example
 * // Crear hooks para órdenes
 * const ordenMutations = createResourceMutations({
 *   resourceName: 'ordenes',
 *   api: ordenesApi,
 *   messages: {
 *     createSuccess: 'Orden creada exitosamente',
 *     deleteError: 'No se pudo eliminar la orden',
 *   },
 * });
 * 
 * // Exportar hooks individuales
 * export const useCreateOrden = ordenMutations.useCreate;
 * export const useUpdateOrden = ordenMutations.useUpdate;
 * export const useDeleteOrden = ordenMutations.useDelete;
 * 
 * // Crear acción personalizada
 * export const useChangeOrdenEstado = ordenMutations.useAction(
 *   ({ id, estado }) => ordenesApi.changeEstado(id, estado),
 *   { successMessage: 'Estado actualizado' }
 * );
 */
export function createResourceMutations<
    TEntity,
    TCreate = Partial<TEntity>,
    TUpdate = Partial<TEntity>,
    TApi extends MinimalCrudApi<TEntity, TCreate, TUpdate> = MinimalCrudApi<TEntity, TCreate, TUpdate>
>(config: MutationFactoryConfig<TApi>): ResourceMutationHooks<TEntity, TCreate, TUpdate> {
    const {
        resourceName,
        api,
        messages = {},
        showToasts = true,
        additionalInvalidateKeys = [],
    } = config;

    const defaultMessages = {
        createSuccess: `${capitalize(resourceName)} creado exitosamente`,
        createError: `Error al crear ${resourceName}`,
        updateSuccess: `${capitalize(resourceName)} actualizado`,
        updateError: `Error al actualizar ${resourceName}`,
        deleteSuccess: `${capitalize(resourceName)} eliminado`,
        deleteError: `Error al eliminar ${resourceName}`,
    };

    const finalMessages = { ...defaultMessages, ...messages };

    const invalidateKeys = [resourceName, ...additionalInvalidateKeys];

    return {
        /**
         * Hook para crear
         */
        useCreate: () => {
            const invalidate = useInvalidate();

            return useMutation({
                mutationFn: async (data: TCreate) => {
                    if (!api.create) {
                        throw new Error(`create method not implemented for ${resourceName}`);
                    }
                    return api.create(data);
                },
                onSuccess: () => {
                    invalidateKeys.forEach(key => invalidate(key));
                    if (showToasts) {
                        toast.success(finalMessages.createSuccess);
                    }
                },
                onError: (error) => {
                    if (showToasts) {
                        toast.error(getErrorMessage(error, finalMessages.createError));
                    }
                },
            });
        },

        /**
         * Hook para actualizar (PUT)
         */
        useUpdate: () => {
            const invalidate = useInvalidate();

            return useMutation({
                mutationFn: async ({ id, data }: { id: string; data: TUpdate }) => {
                    if (!api.update) {
                        throw new Error(`update method not implemented for ${resourceName}`);
                    }
                    return api.update(id, data);
                },
                onSuccess: () => {
                    invalidateKeys.forEach(key => invalidate(key));
                    if (showToasts) {
                        toast.success(finalMessages.updateSuccess);
                    }
                },
                onError: (error) => {
                    if (showToasts) {
                        toast.error(getErrorMessage(error, finalMessages.updateError));
                    }
                },
            });
        },

        /**
         * Hook para actualizar parcialmente (PATCH)
         */
        usePatch: () => {
            const invalidate = useInvalidate();

            return useMutation({
                mutationFn: async ({ id, data }: { id: string; data: Partial<TUpdate> }) => {
                    const patchFn = api.patch || api.update;
                    if (!patchFn) {
                        throw new Error(`patch/update method not implemented for ${resourceName}`);
                    }
                    return patchFn(id, data as TUpdate);
                },
                onSuccess: () => {
                    invalidateKeys.forEach(key => invalidate(key));
                    if (showToasts) {
                        toast.success(finalMessages.updateSuccess);
                    }
                },
                onError: (error) => {
                    if (showToasts) {
                        toast.error(getErrorMessage(error, finalMessages.updateError));
                    }
                },
            });
        },

        /**
         * Hook para eliminar
         */
        useDelete: () => {
            const invalidate = useInvalidate();

            return useMutation({
                mutationFn: async (id: string) => {
                    if (!api.delete) {
                        throw new Error(`delete method not implemented for ${resourceName}`);
                    }
                    return api.delete(id);
                },
                onSuccess: () => {
                    invalidateKeys.forEach(key => invalidate(key));
                    if (showToasts) {
                        toast.success(finalMessages.deleteSuccess);
                    }
                },
                onError: (error) => {
                    if (showToasts) {
                        toast.error(getErrorMessage(error, finalMessages.deleteError));
                    }
                },
            });
        },

        /**
         * Factory para acciones personalizadas
         */
        useAction: <TResult, TInput>(
            actionFn: (input: TInput) => Promise<TResult>,
            options?: {
                successMessage?: string;
                errorMessage?: string;
                invalidateKeys?: string[];
            }
        ) => {
            return () => {
                const invalidate = useInvalidate();
                const keysToInvalidate = options?.invalidateKeys || invalidateKeys;

                return useMutation({
                    mutationFn: actionFn,
                    onSuccess: () => {
                        keysToInvalidate.forEach(key => invalidate(key));
                        if (showToasts && options?.successMessage) {
                            toast.success(options.successMessage);
                        }
                    },
                    onError: (error) => {
                        if (showToasts) {
                            toast.error(getErrorMessage(
                                error,
                                options?.errorMessage || `Error en ${resourceName}`
                            ));
                        }
                    },
                });
            };
        },
    };
}

/**
 * Helper para capitalizar la primera letra
 */
function capitalize(str: string): string {
    return str.charAt(0).toUpperCase() + str.slice(1);
}

/**
 * Ejemplo de uso combinado con createApiResource
 * 
 * @example
 * // En features/ordenes/api/ordenes.service.ts
 * import { createApiResource, extendApiResource } from '@/lib/api-resource-factory';
 * 
 * const baseService = createApiResource<Order, CreateOrderInput, UpdateOrderInput>({
 *   baseUrl: '/ordenes',
 *   resourceName: 'ordenes',
 * });
 * 
 * export const ordenesService = extendApiResource(baseService, (base) => ({
 *   changeEstado: (id: string, estado: string) => 
 *     apiClient.patch(`${base.baseUrl}/${id}/estado`, { estado }),
 * }));
 * 
 * // En features/ordenes/hooks/use-ordenes-mutations.ts
 * import { createResourceMutations } from '@/hooks/use-resource-mutations';
 * import { ordenesService } from '../api/ordenes.service';
 * 
 * const mutations = createResourceMutations({
 *   resourceName: 'ordenes',
 *   api: ordenesService,
 * });
 * 
 * export const useCreateOrden = mutations.useCreate;
 * export const useUpdateOrden = mutations.useUpdate;
 * export const useDeleteOrden = mutations.useDelete;
 * 
 * export const useChangeOrdenEstado = mutations.useAction(
 *   ({ id, estado }: { id: string; estado: string }) => 
 *     ordenesService.changeEstado(id, estado),
 *   { successMessage: 'Estado actualizado', invalidateKeys: ['ordenes', 'dashboard'] }
 * );
 */
