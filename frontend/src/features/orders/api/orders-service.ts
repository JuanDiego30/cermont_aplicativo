/**
 * Orders API Service
 */

import apiClient from '@/core/api/client';
import { Order, CreateOrderDTO, OrderState } from '../types';

export interface OrderListFilters {
  page?: number;
  limit?: number;
  estado?: OrderState | string;
  archived?: boolean;
}

export interface OrderListResult {
  orders: Order[];
  total: number;
  page: number;
  totalPages: number;
}

export const ordersApi = {
  async list(filters: OrderListFilters = {}): Promise<OrderListResult> {
    const params = new URLSearchParams();

    if (typeof filters.page === 'number') {
      params.append('page', filters.page.toString());
    }
    if (typeof filters.limit === 'number') {
      params.append('limit', filters.limit.toString());
    }
    if (filters.estado) {
      params.append('estado', String(filters.estado));
    }
    if (typeof filters.archived === 'boolean') {
      params.append('archived', String(filters.archived));
    }

    return apiClient.get<OrderListResult>(`/orders?${params.toString()}`);
  },

  async getById(id: string): Promise<Order> {
    return apiClient.get<Order>(`/orders/${id}`);
  },

  async create(input: CreateOrderDTO): Promise<Order> {
    return apiClient.post<Order>('/orders', input);
  },

  async transition(id: string, newState: OrderState): Promise<Order> {
    return apiClient.post<Order>(`/orders/${id}/transition`, { newState });
  },

  async delete(id: string): Promise<void> {
    await apiClient.delete(`/orders/${id}`);
  },
};
