/**
 * API Client para Órdenes de Trabajo
 * Funciones para interactuar con los endpoints de órdenes
 */

import { api } from './client';
import type {
  OrdenTrabajo,
  CrearOrdenInput,
  ActualizarOrdenInput,
  AsignarOrdenInput,
  EstadoOrden,
  PrioridadOrden,
} from '@/lib/types/database';

/**
 * Filtros para listar órdenes
 */
export interface OrdersFilters {
  page?: number;
  limit?: number;
  estado?: EstadoOrden;
  prioridad?: PrioridadOrden;
  cliente_id?: string;
  tecnico_id?: string;
  search?: string;
  [key: string]: unknown;
}

/**
 * Respuesta paginada de órdenes
 */
export interface OrdersListResponse {
  data: OrdenTrabajo[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

/**
 * Respuesta de una sola orden
 */
export interface OrderResponse {
  data: OrdenTrabajo;
  message?: string;
}

/**
 * API de Órdenes de Trabajo
 */
export const ordersAPI = {
  /**
   * Lista órdenes con filtros y paginación
   */
  list: async (filters?: OrdersFilters) => {
    return api.get<OrdersListResponse>('/orders', filters);
  },

  /**
   * Obtiene una orden por ID con relaciones completas
   */
  get: async (id: string) => {
    return api.get<OrderResponse>(`/orders/${id}`);
  },

  /**
   * Crea una nueva orden de trabajo
   */
  create: async (data: CrearOrdenInput) => {
    return api.post<OrderResponse>('/orders', data);
  },

  /**
   * Actualiza una orden existente
   */
  update: async (id: string, data: ActualizarOrdenInput) => {
    return api.patch<OrderResponse>(`/orders/${id}`, data);
  },

  /**
   * Elimina una orden (solo gerente+)
   */
  delete: async (id: string) => {
    return api.delete<{ message: string }>(`/orders/${id}`);
  },

  /**
   * Asigna un técnico a una orden
   */
  assign: async (id: string, data: AsignarOrdenInput) => {
    return api.post<OrderResponse>(`/orders/${id}/assign`, data);
  },

  /**
   * Cambia el estado de una orden
   */
  changeStatus: async (id: string, estado: EstadoOrden, notas?: string) => {
    return api.patch<OrderResponse>(`/orders/${id}/status`, {
      estado,
      notas,
    });
  },
};
