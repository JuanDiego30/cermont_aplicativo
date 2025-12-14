/**
 * @file formularios.api.ts
 * @description API service for Formularios module
 */

import { apiClient } from '@/lib/api-client';
import type { Plantilla, CreatePlantillaInput, PlantillaFilters, EstadoFormulario } from '../types/formulario.types';

const BASE_URL = '/formularios/plantillas';

function filtersToParams(filters?: PlantillaFilters): Record<string, string> | undefined {
    if (!filters) return undefined;
    const params: Record<string, string> = {};
    Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== '') {
            params[key] = String(value);
        }
    });
    return params;
}

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
