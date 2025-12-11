'use client';

import { useQuery } from '@tanstack/react-query';
import { apiClient } from '@/lib/api';
import type { Order, OrderFilters } from '@/types/order';
import type { PaginatedResponse } from '@/types/api';

export function useOrdenes(filters?: OrderFilters) {
  return useQuery({
    queryKey: ['ordenes', filters],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (filters?.estado) params.append('estado', filters.estado);
      if (filters?.prioridad) params.append('prioridad', filters.prioridad);
      if (filters?.search) params.append('search', filters.search);
      if (filters?.page) params.append('page', String(filters.page));
      if (filters?.limit) params.append('limit', String(filters.limit));
      
      const url = `/ordenes${params.toString() ? `?${params.toString()}` : ''}`;
      return apiClient.get<PaginatedResponse<Order>>(url);
    },
  });
}
