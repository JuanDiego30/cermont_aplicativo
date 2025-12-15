/**
 * ARCHIVO: clientes.service.ts
 * FUNCION: Servicio API para operaciones CRUD de clientes
 * IMPLEMENTACION: Wrapper sobre apiClient con métodos tipados para cada endpoint
 * DEPENDENCIAS: @/lib/api (apiClient), tipos de clientes
 * EXPORTS: clientesService (list, getById, create, update, delete, toggleEstado, getStats)
 */
import { apiClient } from '@/lib/api-client';
import { filtersToParams } from '@/lib/utils/params';
import type {
    Cliente,
    ClienteFilters,
    CreateClienteInput,
    UpdateClienteInput,
    PaginatedClientes,
    ClienteStats
} from '../types/clientes.types';

const BASE_URL = '/clientes';

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
