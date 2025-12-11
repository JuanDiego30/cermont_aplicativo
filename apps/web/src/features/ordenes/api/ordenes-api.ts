// 📁 web/src/features/ordenes/api/ordenes-api.ts

import { apiClient } from '@/lib/api-client';
import type { Orden, CreateOrdenDTO, UpdateOrdenDTO } from '@/types/orden';

export const ordenesApi = {
    /**
     * Listar órdenes con filtros
     */
    list: async (params?: {
        estado?: string;
        clienteId?: string;
        page?: number;
        limit?: number;
    }) => {
        const searchParams = new URLSearchParams();
        if (params?.estado) searchParams.append('estado', params.estado);
        if (params?.clienteId) searchParams.append('clienteId', params.clienteId);
        searchParams.append('page', String(params?.page || 1));
        searchParams.append('limit', String(params?.limit || 20));

        return apiClient.get<{
            status: string;
            data: Orden[];
            pagination: {
                page: number;
                limit: number;
                total: number;
                pages: number;
            };
        }>(`/ordenes?${searchParams.toString()}`);
    },

    /**
     * Obtener orden por ID
     */
    getById: async (id: string) => {
        return apiClient.get<{ status: string; data: Orden }>(`/ordenes/${id}`);
    },

    /**
     * Crear nueva orden
     */
    create: async (data: CreateOrdenDTO) => {
        return apiClient.post<{ status: string; data: Orden }>('/ordenes', data);
    },

    /**
     * Actualizar orden
     */
    update: async (id: string, data: UpdateOrdenDTO) => {
        return apiClient.put<{ status: string; data: Orden }>(`/ordenes/${id}`, data);
    },

    /**
     * Cambiar estado
     */
    updateEstado: async (id: string, estado: string) => {
        return apiClient.patch<{ status: string; data: Orden }>(`/ordenes/${id}/estado`, {
            estado,
        });
    },

    /**
     * Eliminar orden
     */
    delete: async (id: string) => {
        return apiClient.delete(`/ordenes/${id}`);
    },

    /**
     * Obtener estadísticas
     */
    getStats: async () => {
        return apiClient.get<{
            status: string;
            data: {
                total: number;
                completadas: number;
                enEjecucion: number;
                facturadas: number;
                montoTotal: number;
                montoReal: number;
            };
        }>('/ordenes/stats');
    },
};
