/**
 * ARCHIVO: kits.service.ts
 * FUNCION: Servicio API para operaciones CRUD de kits
 * IMPLEMENTACION: Usa apiClient para llamadas HTTP a /kits endpoint
 * DEPENDENCIAS: @/lib/api (apiClient)
 * EXPORTS: kitsService (list, getById, create, update, delete, changeEstado, getSugeridos)
 */
import { apiClient } from '@/lib/api-client';
import { filtersToParams } from '@/lib/utils/params';
import type { Kit, KitFilters, EstadoKit } from '../index';

const BASE_URL = '/kits';

export const kitsService = {
    /**
     * List all kits with optional filters
     */
    list: async (filters?: KitFilters): Promise<{ data: Kit[]; total: number }> => {
        return apiClient.get<{ data: Kit[]; total: number }>(BASE_URL, filtersToParams(filters as Record<string, unknown> | undefined));
    },

    /**
     * Get a kit by ID
     */
    getById: async (id: string): Promise<Kit> => {
        return apiClient.get<Kit>(`${BASE_URL}/${id}`);
    },

    /**
     * Create a new kit
     */
    create: async (data: Partial<Kit>): Promise<Kit> => {
        return apiClient.post<Kit>(BASE_URL, data);
    },

    /**
     * Update a kit
     */
    update: async (id: string, data: Partial<Kit>): Promise<Kit> => {
        return apiClient.patch<Kit>(`${BASE_URL}/${id}`, data);
    },

    /**
     * Delete a kit
     */
    delete: async (id: string): Promise<void> => {
        await apiClient.delete(`${BASE_URL}/${id}`);
    },

    /**
     * Change kit status
     */
    changeEstado: async (id: string, estado: EstadoKit): Promise<Kit> => {
        return apiClient.patch<Kit>(`${BASE_URL}/${id}/estado`, { estado });
    },

    /**
     * Get suggested kits for an order type
     */
    getSugeridos: async (tipoOrden: string): Promise<Kit[]> => {
        return apiClient.get<Kit[]>(`${BASE_URL}/sugeridos`, { tipoOrden });
    },
};
