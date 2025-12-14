/**
 * @file mantenimientos.api.ts
 * @description API service for Mantenimientos module
 */

import { apiClient } from '@/lib/api-client';
import type { Mantenimiento, CreateMantenimientoInput, MantenimientoFilters } from '../types/mantenimiento.types';

const BASE_URL = '/mantenimientos';

function filtersToParams(filters?: MantenimientoFilters): Record<string, string> | undefined {
    if (!filters) return undefined;
    const params: Record<string, string> = {};
    Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== '') {
            params[key] = String(value);
        }
    });
    return params;
}

export const mantenimientosApi = {
    getAll: async (filters?: MantenimientoFilters): Promise<Mantenimiento[]> => {
        // Note: Assuming API returns array directly. If paginated, would need PaginatedResponse wrapper
        return apiClient.get<Mantenimiento[]>(BASE_URL, filtersToParams(filters));
    },

    getById: async (id: string): Promise<Mantenimiento> => {
        return apiClient.get<Mantenimiento>(`${BASE_URL}/${id}`);
    },

    create: async (data: CreateMantenimientoInput): Promise<Mantenimiento> => {
        return apiClient.post<Mantenimiento>(BASE_URL, data);
    },

    update: async (id: string, data: Partial<CreateMantenimientoInput>): Promise<Mantenimiento> => {
        return apiClient.patch<Mantenimiento>(`${BASE_URL}/${id}`, data);
    },

    delete: async (id: string): Promise<void> => {
        await apiClient.delete(`${BASE_URL}/${id}`);
    }
};
