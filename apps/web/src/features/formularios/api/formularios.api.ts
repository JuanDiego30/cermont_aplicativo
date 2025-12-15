/**
 * ARCHIVO: formularios.api.ts
 * FUNCION: Cliente API para gestión de plantillas de formularios
 * IMPLEMENTACION: CRUD completo + duplicar + cambiar estado via apiClient
 * DEPENDENCIAS: @/lib/api-client, formulario.types
 * EXPORTS: formulariosApi (getAll, getById, create, update, delete, duplicate)
 */
import { apiClient } from '@/lib/api-client';
import { filtersToParams } from '@/lib/utils/params';
import type { Plantilla, CreatePlantillaInput, PlantillaFilters, EstadoFormulario } from '../types/formulario.types';

const BASE_URL = '/formularios/plantillas';

export const formulariosApi = {
    getAll: async (filters?: PlantillaFilters): Promise<Plantilla[]> => {
        return apiClient.get<Plantilla[]>(BASE_URL, filtersToParams(filters));
    },

    getById: async (id: string): Promise<Plantilla> => {
        return apiClient.get<Plantilla>(`${BASE_URL}/${id}`);
    },

    create: async (data: CreatePlantillaInput): Promise<Plantilla> => {
        return apiClient.post<Plantilla>(BASE_URL, data);
    },

    update: async (id: string, data: Partial<CreatePlantillaInput>): Promise<Plantilla> => {
        return apiClient.patch<Plantilla>(`${BASE_URL}/${id}`, data);
    },

    delete: async (id: string): Promise<void> => {
        await apiClient.delete(`${BASE_URL}/${id}`);
    },

    duplicate: async (id: string): Promise<Plantilla> => {
        return apiClient.post<Plantilla>(`${BASE_URL}/${id}/duplicar`, {});
    },

    changeStatus: async (id: string, estado: EstadoFormulario): Promise<Plantilla> => {
        return apiClient.patch<Plantilla>(`${BASE_URL}/${id}/estado`, { estado });
    }
};
