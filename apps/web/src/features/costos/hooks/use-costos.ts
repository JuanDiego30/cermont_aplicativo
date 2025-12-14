'use client';

import useSWR from 'swr';
import { useMutation, useInvalidate } from '@/hooks/use-mutation';
import { toast } from 'sonner';
import { costosService } from '../services/costos.service';
import type { Costo, CostoFilters } from '../index';

// Query key factory
export const costosKeys = {
    all: ['costos'] as const,
    lists: () => [...costosKeys.all, 'list'] as const,
    list: (filters?: CostoFilters) => [...costosKeys.lists(), filters] as const,
    resumen: (params?: { fechaInicio?: string; fechaFin?: string }) => [...costosKeys.all, 'resumen', params] as const,
};

/**
 * Hook to list costs with filters
 */
export function useCostosQuery(filters?: CostoFilters) {
    // SWR needs a flat string key or array, keys factory should be compatible
    return useSWR(
        costosKeys.list(filters),
        () => costosService.list(filters),
        {
            revalidateOnFocus: false,
            dedupingInterval: 5 * 60 * 1000
        }
    );
}

/**
 * Hook to get period cost summary
 */
export function useResumenPeriodoQuery(params?: { fechaInicio?: string; fechaFin?: string }) {
    return useSWR(
        costosKeys.resumen(params),
        () => costosService.getResumenPeriodo(params),
        {
            revalidateOnFocus: false,
            dedupingInterval: 5 * 60 * 1000
        }
    );
}

// Aliases for compatibility
export const useCostos = useCostosQuery;
export const useResumenPeriodo = useResumenPeriodoQuery;

/**
 * Hook to create a cost entry
 */
export function useCreateCosto() {
    const invalidate = useInvalidate();

    return useMutation({
        mutationFn: (data: Partial<Costo>) => costosService.create(data),
        onSuccess: () => {
            invalidate('costos');
            toast.success('Costo registrado exitosamente');
        },
        onError: (error: Error) => {
            toast.error(`Error al registrar costo: ${error.message}`);
        },
    });
}

/**
 * Hook to approve a cost
 */
export function useAprobarCosto() {
    const invalidate = useInvalidate();

    return useMutation({
        mutationFn: (id: string) => costosService.aprobar(id),
        onSuccess: () => {
            invalidate('costos');
            toast.success('Costo aprobado');
        },
        onError: (error: Error) => {
            toast.error(`Error al aprobar costo: ${error.message}`);
        },
    });
}

/**
 * Hook to reject a cost
 */
export function useRechazarCosto() {
    const invalidate = useInvalidate();

    return useMutation({
        mutationFn: ({ id, motivo }: { id: string; motivo?: string }) =>
            costosService.rechazar(id, motivo),
        onSuccess: () => {
            invalidate('costos');
            toast.success('Costo rechazado');
        },
        onError: (error: Error) => {
            toast.error(`Error al rechazar costo: ${error.message}`);
        },
    });
}
