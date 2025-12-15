/**
 * ARCHIVO: mantenimientos.api.ts
 * FUNCION: Cliente API para operaciones CRUD de mantenimientos
 * IMPLEMENTACION: Usa apiClient para llamadas HTTP a /mantenimientos endpoint
 * DEPENDENCIAS: @/lib/api-client, mantenimiento.types
 * EXPORTS: mantenimientosApi (getAll, getById, create, update, delete)
 */
import { apiClient } from '@/lib/api-client';
import { filtersToParams } from '@/lib/utils/params';
import type { Mantenimiento, CreateMantenimientoInput, MantenimientoFilters } from '../types/mantenimiento.types';

const BASE_URL = '/mantenimientos';

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
