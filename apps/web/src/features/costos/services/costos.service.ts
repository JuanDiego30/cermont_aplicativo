/**
 * @file costos.service.ts
 * @description API service for costos (costs) module
 */

import { apiClient } from '@/lib/api-client';
import { filtersToParams } from '@/lib/utils/params';
import type { Costo, CostoFilters, ResumenPeriodo } from '../index';

const BASE_URL = '/costos';

export const costosService = {
    /**
     * List all costs with optional filters
     */
    list: async (filters?: CostoFilters): Promise<{ data: Costo[]; total: number }> => {
        return apiClient.get<{ data: Costo[]; total: number }>(BASE_URL, filtersToParams(filters as Record<string, unknown> | undefined));
    },

    /**
     * Get cost summary for a period
     */
    getResumenPeriodo: async (params?: { fechaInicio?: string; fechaFin?: string }): Promise<ResumenPeriodo> => {
        return apiClient.get<ResumenPeriodo>(`${BASE_URL}/resumen`, filtersToParams(params));
    },

    /**
     * Create a new cost entry
     */
    create: async (data: Partial<Costo>): Promise<Costo> => {
        return apiClient.post<Costo>(BASE_URL, data);
    },

    /**
     * Update a cost entry
     */
    update: async (id: string, data: Partial<Costo>): Promise<Costo> => {
        return apiClient.patch<Costo>(`${BASE_URL}/${id}`, data);
    },

    /**
     * Delete a cost entry
     */
    delete: async (id: string): Promise<void> => {
        await apiClient.delete(`${BASE_URL}/${id}`);
    },

    /**
     * Approve a cost entry
     */
    aprobar: async (id: string): Promise<Costo> => {
        return apiClient.patch<Costo>(`${BASE_URL}/${id}/aprobar`);
    },

    /**
     * Reject a cost entry
     */
    rechazar: async (id: string, motivo?: string): Promise<Costo> => {
        return apiClient.patch<Costo>(`${BASE_URL}/${id}/rechazar`, { motivo });
    },
};
