/**
 * @file use-ordenes-mutations.refactored.ts
 * @description EJEMPLO DE MIGRACIÓN - Hooks de mutación usando el factory
 * 
 * Este archivo muestra cómo migrar hooks de mutación existentes
 * para usar el use-resource-mutations factory.
 * 
 * ANTES: ~150 líneas (6 hooks individuales)
 * DESPUÉS: ~40 líneas (misma funcionalidad)
 * 
 * INSTRUCCIONES DE MIGRACIÓN:
 * 1. Renombrar a use-ordenes-mutations.ts
 * 2. Actualizar imports donde se usen los hooks
 * 3. Ejecutar tests
 */
'use client';

import { createResourceMutations } from '@/hooks/use-resource-mutations';
import { useInvalidate, useMutation } from '@/hooks/use-mutation';
import { ordenesApi } from '../api/ordenes-api';
import { useOffline } from '@/hooks/use-offline';
import { toast } from 'sonner';
import { getErrorMessage } from '@/lib/utils/error';
import type { Orden, CreateOrdenDTO, UpdateOrdenDTO } from '@/types/orden';
import type { EstadoOrden } from '../api/orden.types';

// ============================================================================
// CREAR MUTATIONS CON FACTORY
// ============================================================================

/**
 * Factory de mutaciones para órdenes
 * Genera automáticamente: useCreate, useUpdate, usePatch, useDelete
 */
const ordenesCrudApi = {
    create: async (data: CreateOrdenDTO) => (await ordenesApi.create(data)).data,
    update: async (id: string, data: UpdateOrdenDTO) => (await ordenesApi.update(id, data)).data,
    patch: async (id: string, data: Partial<UpdateOrdenDTO>) => (await ordenesApi.update(id, data as UpdateOrdenDTO)).data,
    delete: async (id: string) => {
        await ordenesApi.delete(id);
    },
};

const ordenesMutations = createResourceMutations<Orden, CreateOrdenDTO, UpdateOrdenDTO>({
    resourceName: 'ordenes',
    api: ordenesCrudApi,
    messages: {
        createSuccess: 'Orden creada exitosamente',
        createError: 'Error al crear la orden',
        updateSuccess: 'Orden actualizada',
        updateError: 'Error al actualizar la orden',
        deleteSuccess: 'Orden eliminada',
        deleteError: 'Error al eliminar la orden',
    },
    additionalInvalidateKeys: ['dashboard', 'stats'],
});

// ============================================================================
// EXPORTS DE HOOKS BÁSICOS
// ============================================================================

/**
 * Hook para crear orden (con soporte offline)
 */
export function useCreateOrden() {
    const invalidate = useInvalidate();
    const { queueAction } = useOffline();

    return useMutation({
        mutationFn: async (data: CreateOrdenDTO) => {
            try {
                const result = await ordenesApi.create(data);
                return result;
            } catch (error) {
                // Guardar en queue para offline
                await queueAction({
                    endpoint: '/ordenes',
                    method: 'POST',
                    payload: data,
                });
                throw error;
            }
        },
        onSuccess: () => {
            invalidate('ordenes');
            invalidate('dashboard');
            toast.success('Orden creada exitosamente');
        },
        onError: (error) => {
            toast.error(getErrorMessage(error, 'Error al crear orden'));
        },
    });
}

/**
 * Hook para actualizar orden
 * Usa el factory directamente
 */
export const useUpdateOrden = ordenesMutations.useUpdate;

/**
 * Hook para eliminar orden
 * Usa el factory directamente
 */
export const useDeleteOrden = ordenesMutations.useDelete;

// ============================================================================
// HOOKS DE ACCIONES PERSONALIZADAS
// ============================================================================

/**
 * Hook para cambiar estado de orden
 */
export const useChangeOrdenEstado = ordenesMutations.useAction(
    ({ id, estado }: { id: string; estado: EstadoOrden }) => 
        ordenesApi.updateEstado(id, estado).then((r) => r.data),
    {
        successMessage: 'Estado actualizado',
        errorMessage: 'Error al cambiar estado',
        invalidateKeys: ['ordenes', 'dashboard'],
    }
);

/**
 * Hook para asignar técnico
 */
export const useAsignarTecnico = ordenesMutations.useAction(
    ({ ordenId, tecnicoId }: { ordenId: string; tecnicoId: string }) =>
        ordenesApi.assignTechnician(ordenId, tecnicoId).then((r) => r.data),
    {
        successMessage: 'Técnico asignado exitosamente',
        errorMessage: 'Error al asignar técnico',
        invalidateKeys: ['ordenes', 'tecnicos'],
    }
);

// ============================================================================
// COMPARACIÓN: ANTES vs DESPUÉS
// ============================================================================

/*
ANTES (150+ líneas - código repetitivo):
----------------------------------------
export function useCreateOrden() {
    const invalidate = useInvalidate();
    const { queueAction } = useOffline();

    return useMutation({
        mutationFn: async (data) => {
            try {
                return await ordenesApi.create(data);
            } catch (error) {
                await queueAction({ endpoint: '/api/ordenes', method: 'POST', payload: data });
                throw error;
            }
        },
        onSuccess: () => {
            invalidate('ordenes');
            toast.success('Orden creada exitosamente');
        },
        onError: (error) => {
            toast.error(getErrorMessage(error, 'Error al crear orden'));
        },
    });
}

export function useUpdateOrden() {
    const invalidate = useInvalidate();
    return useMutation({
        mutationFn: ({ id, data }) => ordenesApi.update(id, data),
        onSuccess: () => {
            invalidate('ordenes');
            toast.success('Orden actualizada');
        },
        onError: (error) => {
            toast.error(getErrorMessage(error, 'Error al actualizar orden'));
        },
    });
}

export function useDeleteOrden() {
    const invalidate = useInvalidate();
    return useMutation({
        mutationFn: (id) => ordenesApi.delete(id),
        onSuccess: () => {
            invalidate('ordenes');
            toast.success('Orden eliminada');
        },
        onError: (error) => {
            toast.error(getErrorMessage(error, 'Error al eliminar orden'));
        },
    });
}

export function useChangeOrdenEstado() {
    const invalidate = useInvalidate();
    return useMutation({
        mutationFn: ({ id, estado }) => ordenesApi.changeEstado(id, estado),
        onSuccess: () => {
            invalidate('ordenes');
            toast.success('Estado actualizado');
        },
        onError: (error) => {
            toast.error(getErrorMessage(error, 'Error al cambiar estado'));
        },
    });
}

// ... mismo patrón para cada acción

DESPUÉS (40 líneas - DRY):
--------------------------
Ver código arriba. El factory maneja:
- Estado de loading/error/success
- Invalidación de cache SWR
- Toasts de éxito/error
- Tipado completo

Solo necesitas personalizar:
- useCreate si necesita lógica offline especial
- Acciones específicas del dominio con useAction()
*/
