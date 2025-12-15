/**
 * ARCHIVO: use-tecnicos-mutations.ts
 * FUNCION: Hooks para mutaciones CRUD de técnicos
 * IMPLEMENTACION: Usa useMutation con invalidación automática del cache SWR
 * DEPENDENCIAS: @/hooks/use-mutation, tecnicosApi
 * EXPORTS: useCreateTecnico, useUpdateTecnico, useDeleteTecnico, useToggleDisponibilidad
 */
'use client';

import { useMutation, useInvalidate } from '@/hooks/use-mutation';
import { tecnicosApi } from '../api/tecnicos.api';
import type { CreateTecnicoInput, UpdateTecnicoInput } from '../api/tecnicos.types';

/**
 * Hook para crear técnico
 */
export function useCreateTecnico() {
    const invalidate = useInvalidate();

    return useMutation({
        mutationFn: (data: CreateTecnicoInput) => tecnicosApi.create(data),
        onSuccess: () => {
            invalidate("tecnicos");
        },
    });
}

/**
 * Hook para actualizar técnico
 */
export function useUpdateTecnico() {
    const invalidate = useInvalidate();

    return useMutation({
        mutationFn: ({ id, data }: { id: string; data: UpdateTecnicoInput }) =>
            tecnicosApi.update(id, data),
        onSuccess: () => {
            invalidate("tecnicos");
        },
    });
}

/**
 * Hook para eliminar técnico
 */
export function useDeleteTecnico() {
    const invalidate = useInvalidate();

    return useMutation({
        mutationFn: (id: string) => tecnicosApi.delete(id),
        onSuccess: () => {
            invalidate("tecnicos");
        },
    });
}

/**
 * Hook para cambiar disponibilidad
 */
export function useToggleDisponibilidad() {
    const invalidate = useInvalidate();

    return useMutation({
        mutationFn: ({ id, disponible }: { id: string; disponible: boolean }) =>
            tecnicosApi.toggleDisponibilidad(id, disponible),
        onSuccess: () => {
            invalidate("tecnicos");
        },
    });
}
