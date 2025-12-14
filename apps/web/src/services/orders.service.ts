/**
 * ARCHIVO: orders.service.ts
 * FUNCION: Gestiona operaciones CRUD y acciones sobre ordenes de trabajo
 * IMPLEMENTACION: Patron Service Layer con objeto literal y metodos async
 * DEPENDENCIAS: @/lib/api (apiClient), @/types/order
 * EXPORTS: ordersService, PaginatedOrders, ListOrdersParams
 */
import { apiClient } from '@/lib/api';
import type { Order, CreateOrderInput, UpdateOrderInput, OrderFilters, OrderStatus, OrderPriority } from '@/types/order';

export interface PaginatedOrders {
  data: Order[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
    hasMore: boolean;
  };
}

export interface ListOrdersParams extends OrderFilters {
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export const ordersService = {
  /**
   * Listar órdenes con filtros y paginación
   */
  list: async (params?: ListOrdersParams): Promise<PaginatedOrders> => {
    const queryParams = new URLSearchParams();

    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== '') {
          queryParams.append(key, String(value));
        }
      });
    }

    const query = queryParams.toString();
    return apiClient.get<PaginatedOrders>(`/orders${query ? `?${query}` : ''}`);
  },

  /**
   * Obtener una orden por ID
   */
  getById: async (id: string): Promise<Order> => {
    return apiClient.get<Order>(`/orders/${id}`);
  },

  /**
   * Crear nueva orden
   */
  create: async (data: CreateOrderInput): Promise<Order> => {
    return apiClient.post<Order>('/orders', data);
  },

  /**
   * Actualizar orden
   */
  update: async (id: string, data: UpdateOrderInput): Promise<Order> => {
    return apiClient.patch<Order>(`/orders/${id}`, data);
  },

  /**
   * Eliminar orden
   */
  delete: async (id: string): Promise<void> => {
    await apiClient.delete(`/orders/${id}`);
  },

  /**
   * Cambiar estado de la orden
   */
  changeStatus: async (id: string, status: OrderStatus): Promise<Order> => {
    return apiClient.patch<Order>(`/orders/${id}/status`, { status });
  },

  /**
   * Cambiar prioridad de la orden
   */
  changePriority: async (id: string, priority: OrderPriority): Promise<Order> => {
    return apiClient.patch<Order>(`/orders/${id}/priority`, { priority });
  },

  /**
   * Obtener estadísticas de órdenes
   */
  getStats: async (): Promise<{
    total: number;
    byStatus: Record<OrderStatus, number>;
    byPriority: Record<OrderPriority, number>;
    completedThisMonth: number;
    pendingCount: number;
  }> => {
    return apiClient.get('/orders/stats');
  },

  /**
   * Asignar técnico a la orden
   */
  assignTechnician: async (id: string, technicianId: string): Promise<Order> => {
    return apiClient.patch<Order>(`/orders/${id}/technician`, { technicianId });
  },
};
