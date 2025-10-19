/**
 * Cliente API para gestión de equipos
 */

import { api } from './client';

// Tipos
export interface EquipmentFilters {
  page?: number;
  limit?: number;
  search?: string;
  cliente_id?: string;
  tipo?: string;
  estado?: string;
  [key: string]: unknown;
}

export interface CreateEquipmentInput {
  cliente_id: string;
  tipo: string;
  marca: string;
  modelo: string;
  numero_serie?: string;
  ubicacion?: string;
  fecha_instalacion?: string;
  estado?: string;
  notas?: string;
}

export interface UpdateEquipmentInput {
  tipo?: string;
  marca?: string;
  modelo?: string;
  numero_serie?: string;
  ubicacion?: string;
  fecha_instalacion?: string;
  estado?: string;
  notas?: string;
}

export interface Equipment {
  id: string;
  cliente_id: string;
  tipo: string;
  marca: string;
  modelo: string;
  numero_serie: string | null;
  ubicacion: string | null;
  fecha_instalacion: string | null;
  estado: string;
  notas: string | null;
  created_at: string;
  updated_at: string;
}

export interface EquipmentWithClient extends Equipment {
  cliente: {
    id: string;
    nombre_empresa: string;
    nit: string;
  };
}

export interface EquipmentWithDetails extends EquipmentWithClient {
  ordenes_trabajo: Array<{
    id: string;
    numero_orden: string;
    titulo: string;
    estado: string;
    prioridad: string;
    fecha_creacion: string;
    fecha_programada: string | null;
  }>;
}

export interface EquipmentListResponse {
  data: EquipmentWithClient[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface EquipmentResponse {
  data: Equipment | EquipmentWithClient | EquipmentWithDetails;
  message?: string;
}

// API Client
export const equipmentAPI = {
  /**
   * Listar equipos con filtros y paginación
   */
  list: (filters?: EquipmentFilters) => {
  return api.get<EquipmentListResponse>('/equipment', filters);
  },

  /**
   * Obtener un equipo por ID (incluye cliente y órdenes)
   */
  get: (id: string) => {
  return api.get<EquipmentResponse>(`/equipment/${id}`);
  },

  /**
   * Crear un nuevo equipo
   */
  create: (data: CreateEquipmentInput) => {
  return api.post<EquipmentResponse>('/equipment', data);
  },

  /**
   * Actualizar un equipo
   */
  update: (id: string, data: UpdateEquipmentInput) => {
  return api.patch<EquipmentResponse>(`/equipment/${id}`, data);
  },

  /**
   * Eliminar un equipo
   */
  delete: (id: string) => {
  return api.delete<{ message: string }>(`/equipment/${id}`);
  },

  /**
   * Listar equipos de un cliente específico
   */
  byClient: (clientId: string, filters?: Omit<EquipmentFilters, 'cliente_id'>) => {
    return api.get<EquipmentListResponse>('/api/equipment', {
      ...filters,
      cliente_id: clientId,
    });
  },
};
