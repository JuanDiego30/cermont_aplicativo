import { api } from './client';
import { Order, CreateOrderDTO, OrderState } from '../types/order';

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

    const response = await api.get(`/orders?${params.toString()}`);

    return response.data.data as OrderListResult;
  },

  async getById(id: string): Promise<Order> {
    const response = await api.get(`/orders/${id}`);
    return response.data.data as Order;
  },

  async create(input: CreateOrderDTO): Promise<Order> {
    const response = await api.post('/orders', input);
    return response.data.data as Order;
  },

  async transition(id: string, newState: OrderState): Promise<Order> {
    const response = await api.post(`/orders/${id}/transition`, {
      newState,
    });
    return response.data.data as Order;
  },

  async delete(id: string): Promise<void> {
    await api.delete(`/orders/${id}`);
  },
};
