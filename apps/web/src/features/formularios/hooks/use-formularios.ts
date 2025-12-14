'use client';

/**
 * @file use-formularios.ts
 * @description SWR hooks for formularios management
 */

import useSWR from 'swr';
import { useMutation, useInvalidate } from '@/hooks/use-mutation';
import { swrKeys } from '@/lib/swr-config';
import { formulariosApi } from '../api/formularios.api';
import type { Plantilla, CreatePlantillaInput, PlantillaFilters, EstadoFormulario } from '../types/formulario.types';

/**
 * Hook para obtener la lista de plantillas/formularios
 */
export function useFormularios(filters?: PlantillaFilters) {
  return useSWR(
    swrKeys.formularios.list(filters),
    () => formulariosApi.getAll(filters),
    { revalidateOnFocus: false }
  );
}

/**
 * Alias para mantener compatibilidad
 */
export const usePlantillas = useFormularios;

/**
 * Hook para obtener un formulario/plantilla por ID
 */
export function useFormulario(id: string | undefined) {
  return useSWR(
    id ? swrKeys.formularios.detail(id) : null,
    () => (id ? formulariosApi.getById(id) : null),
    { revalidateOnFocus: false }
  );
}

/**
 * Alias para mantener compatibilidad
 */
export const usePlantilla = useFormulario;

/**
 * Hook para crear un formulario/plantilla
 */
export function useCreateFormulario() {
  const invalidate = useInvalidate();
  return useMutation({
    mutationFn: (data: CreatePlantillaInput) => formulariosApi.create(data),
    onSuccess: () => {
      invalidate('formularios');
    },
  });
}

/**
 * Alias para mantener compatibilidad
 */
export const useCreatePlantilla = useCreateFormulario;

/**
 * Hook para actualizar un formulario/plantilla
 */
export function useUpdateFormulario() {
  const invalidate = useInvalidate();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<CreatePlantillaInput> }) =>
      formulariosApi.update(id, data),
    onSuccess: () => {
      invalidate('formularios');
    },
  });
}

/**
 * Alias para mantener compatibilidad
 */
export const useUpdatePlantilla = useUpdateFormulario;

/**
 * Hook para eliminar un formulario/plantilla
 */
export function useDeleteFormulario() {
  const invalidate = useInvalidate();
  return useMutation({
    mutationFn: (id: string) => formulariosApi.delete(id),
    onSuccess: () => {
      invalidate('formularios');
    },
  });
}

/**
 * Alias para mantener compatibilidad
 */
export const useDeletePlantilla = useDeleteFormulario;

/**
 * Hook para duplicar un formulario/plantilla
 */
export function useDuplicateFormulario() {
  const invalidate = useInvalidate();
  return useMutation({
    mutationFn: (id: string) => formulariosApi.duplicate(id),
    onSuccess: () => {
      invalidate('formularios');
    },
  });
}

/**
 * Hook para cambiar el estado de un formulario/plantilla
 */
export function useChangeFormularioStatus() {
  const invalidate = useInvalidate();
  return useMutation({
    mutationFn: ({ id, estado }: { id: string; estado: EstadoFormulario }) =>
      formulariosApi.changeStatus(id, estado),
    onSuccess: () => {
      invalidate('formularios');
    },
  });
}

// Aliases en español para compatibilidad
export const usePlantillasFormulario = useFormularios;
export const useDuplicarPlantilla = useDuplicateFormulario;
export const useEliminarPlantilla = useDeleteFormulario;
export const useCambiarEstadoPlantilla = useChangeFormularioStatus;
