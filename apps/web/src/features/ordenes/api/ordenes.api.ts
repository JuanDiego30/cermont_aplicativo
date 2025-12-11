/**
 * @fileoverview API functions for orders (ordenes)
 * Re-exports from services layer for feature-based organization
 */

import { ordersService, ListOrdersParams, PaginatedOrders } from '@/services/orders.service';
import type { Order, CreateOrderInput, UpdateOrderInput, OrderStatus } from '@/types/order';

export const ordenesApi = {
  /**
   * Lista todas las órdenes con filtros opcionales
   */
  list: async (params?: ListOrdersParams): Promise<PaginatedOrders> => {
    return ordersService.list(params);
  },

  /**
   * Obtiene una orden por ID
   */
  getById: async (id: string): Promise<Order> => {
    return ordersService.getById(id);
  },

  /**
   * Crea una nueva orden
   */
  create: async (data: CreateOrderInput): Promise<Order> => {
    return ordersService.create(data);
  },

  /**
   * Actualiza una orden existente
   */
  update: async (id: string, data: UpdateOrderInput): Promise<Order> => {
    return ordersService.update(id, data);
  },

  /**
   * Elimina una orden
   */
  delete: async (id: string): Promise<void> => {
    return ordersService.delete(id);
  },

  /**
   * Cambia el estado de una orden
   */
  changeStatus: async (id: string, status: OrderStatus): Promise<Order> => {
    return ordersService.changeStatus(id, status);
  },

  /**
   * Obtiene estadísticas de órdenes
   */
  getStats: async () => {
    return ordersService.getStats();
  }
};

export type { Order, CreateOrderInput, UpdateOrderInput, PaginatedOrders };
