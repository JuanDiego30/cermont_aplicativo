/**
 * @file use-clientes.ts
 * @description SWR hooks for clientes module
 */

'use client';

import useSWR from 'swr';
import { useMutation, useInvalidate } from '@/hooks/use-mutation';
import { toast } from 'sonner';
import { clientesService } from '../services/clientes.service';
import { swrKeys } from '@/lib/swr-config';
import type {
    ClienteFilters,
    CreateClienteInput,
    UpdateClienteInput,
    Cliente,
    PaginatedClientes
} from '../types/clientes.types';

// Query key factory (compatibilidad)
export const clientesKeys = {
    all: ['clientes'] as const,
    lists: () => [...clientesKeys.all, 'list'] as const,
    list: (filters?: ClienteFilters) => [...clientesKeys.lists(), filters] as const,
    details: () => [...clientesKeys.all, 'detail'] as const,
    detail: (id: string) => [...clientesKeys.details(), id] as const,
    stats: () => [...clientesKeys.all, 'stats'] as const,
};

/**
 * Hook to list clients with filters
 */
export function useClientes(filters?: ClienteFilters) {
    return useSWR<PaginatedClientes>(
        swrKeys.clientes.list(filters),
        () => clientesService.list(filters),
        {
            revalidateOnFocus: false,
            dedupingInterval: 5 * 60 * 1000,
        }
    );
}

/**
 * Hook to get a single client by ID
 */
export function useCliente(id: string) {
    return useSWR<Cliente>(
        id ? swrKeys.clientes.detail(id) : null,
        () => clientesService.getById(id),
        { revalidateOnFocus: false }
    );
}

/**
 * Hook to get client statistics
 */
export function useClientesStats() {
    return useSWR(
        swrKeys.clientes.stats(),
        () => clientesService.getStats(),
        {
            revalidateOnFocus: false,
            dedupingInterval: 10 * 60 * 1000,
        }
    );
}

/**
 * Hook to create a new client
 */
export function useCreateCliente() {
    const invalidate = useInvalidate();

    return useMutation({
        mutationFn: (data: CreateClienteInput) => clientesService.create(data),
        onSuccess: (newCliente) => {
            invalidate('clientes');
            toast.success(`Cliente "${newCliente.nombre}" creado exitosamente`);
        },
        onError: (error: Error) => {
            toast.error(`Error al crear cliente: ${error.message}`);
        },
    });
}

/**
 * Hook to update a client
 */
export function useUpdateCliente() {
    const invalidate = useInvalidate();

    return useMutation({
        mutationFn: ({ id, data }: { id: string; data: UpdateClienteInput }) =>
            clientesService.update(id, data),
        onSuccess: () => {
            invalidate('clientes');
            toast.success('Cliente actualizado');
        },
        onError: (error: Error) => {
            toast.error(`Error al actualizar cliente: ${error.message}`);
        },
    });
}

/**
 * Hook to delete a client
 */
export function useDeleteCliente() {
    const invalidate = useInvalidate();

    return useMutation({
        mutationFn: (id: string) => clientesService.delete(id),
        onSuccess: () => {
            invalidate('clientes');
            toast.success('Cliente eliminado');
        },
        onError: (error: Error) => {
            toast.error(`Error al eliminar cliente: ${error.message}`);
        },
    });
}

/**
 * Hook to toggle client active status
 */
export function useToggleClienteActivo() {
    const invalidate = useInvalidate();

    return useMutation({
        mutationFn: ({ id }: { id: string }) =>
            clientesService.toggleEstado(id),
        onSuccess: () => {
            invalidate('clientes');
            toast.success('Estado actualizado');
        },
        onError: (error: Error) => {
            toast.error(`Error: ${error.message}`);
        },
    });
}
