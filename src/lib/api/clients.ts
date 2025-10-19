/**
 * Cliente API para gestión de clientes
 */

import { api } from './client';

// Tipos
export interface ClientFilters {
  page?: number;
  limit?: number;
  search?: string;
  activo?: boolean;
  [key: string]: unknown;
}

export interface CreateClientInput {
  nombre_empresa: string;
  nit: string;
  direccion?: string;
  telefono?: string;
  email?: string;
  contacto_principal?: string;
  activo?: boolean;
}

export interface UpdateClientInput {
  nombre_empresa?: string;
  nit?: string;
  direccion?: string;
  telefono?: string;
  email?: string;
  contacto_principal?: string;
  activo?: boolean;
}

export interface Client {
  id: string;
  nombre_empresa: string;
  nit: string;
  direccion: string | null;
  telefono: string | null;
  email: string | null;
  contacto_principal: string | null;
  activo: boolean;
  created_at: string;
  updated_at: string;
}

export interface ClientWithEquipment extends Client {
  equipos: Array<{
    id: string;
    tipo: string;
    marca: string;
    modelo: string;
    estado: string;
  }>;
}

export interface ClientsListResponse {
  data: Client[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface ClientResponse {
  data: Client | ClientWithEquipment;
  message?: string;
}

// API Client
export const clientsAPI = {
  /**
   * Listar clientes con filtros y paginación
   */
  list: (filters?: ClientFilters) => {
    return api.get<ClientsListResponse>('/clients', filters);
  },

  /**
   * Obtener un cliente por ID (incluye equipos)
   */
  get: (id: string) => {
    return api.get<ClientResponse>(`/clients/${id}`);
  },

  /**
   * Crear un nuevo cliente
   */
  create: (data: CreateClientInput) => {
    return api.post<ClientResponse>('/clients', data);
  },

  /**
   * Actualizar un cliente
   */
  update: (id: string, data: UpdateClientInput) => {
    return api.patch<ClientResponse>(`/clients/${id}`, data);
  },

  /**
   * Eliminar (desactivar) un cliente
   */
  delete: (id: string) => {
    return api.delete<{ message: string }>(`/clients/${id}`);
  },
};
