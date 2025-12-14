/**
 * @file clientes.service.ts
 * @description API service for clientes (clients) module
 */

import { apiClient } from '@/lib/api';
import type {
    Cliente,
    ClienteFilters,
    CreateClienteInput,
    UpdateClienteInput,
    PaginatedClientes,
    ClienteStats
} from '../types/clientes.types';

const BASE_URL = '/clientes';

// Helper to convert filters to params object
function filtersToParams(filters?: ClienteFilters): Record<string, string> | undefined {
    if (!filters) return undefined;
    const params: Record<string, string> = {};
    Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
            params[key] = String(value);
        }
    });
    return Object.keys(params).length > 0 ? params : undefined;
}

export const clientesService = {
    /**
     * List all clients with optional filters
     */
    list: async (filters?: ClienteFilters): Promise<PaginatedClientes> => {
        return apiClient.get<PaginatedClientes>(BASE_URL, filtersToParams(filters));
    },

    /**
     * Get a client by ID
     */
    getById: async (id: string): Promise<Cliente> => {
        return apiClient.get<Cliente>(`${BASE_URL}/${id}`);
    },

    /**
     * Create a new client
     */
    create: async (data: CreateClienteInput): Promise<Cliente> => {
        return apiClient.post<Cliente>(BASE_URL, data);
    },

    /**
     * Update an existing client
     */
    update: async (id: string, data: UpdateClienteInput): Promise<Cliente> => {
        return apiClient.patch<Cliente>(`${BASE_URL}/${id}`, data);
    },

    /**
     * Delete a client
     */
    delete: async (id: string): Promise<void> => {
        await apiClient.delete(`${BASE_URL}/${id}`);
    },

    /**
     * Toggle client status (active/inactive)
     */
    toggleEstado: async (id: string): Promise<Cliente> => {
        return apiClient.patch<Cliente>(`${BASE_URL}/${id}/toggle-estado`);
    },

    /**
     * Get client statistics
     */
    getStats: async (): Promise<ClienteStats> => {
        return apiClient.get<ClienteStats>(`${BASE_URL}/stats`);
    },
};
