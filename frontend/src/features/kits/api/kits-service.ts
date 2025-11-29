/**
 * Kits API Service
 */

import apiClient from '@/core/api/client';
import type { Kit, CreateKitDTO, UpdateKitDTO, KitStats } from '../types';

interface KitsResponse {
  kits?: Kit[];
}

export const kitsApi = {
  getAll: async (): Promise<Kit[]> => {
    const response = await apiClient.get<KitsResponse | Kit[]>('/kits');
    return Array.isArray(response) ? response : (response.kits || []);
  },

  getById: async (id: string): Promise<Kit> => {
    return apiClient.get<Kit>(`/kits/${id}`);
  },

  getByCategory: async (category: string): Promise<Kit[]> => {
    return apiClient.get<Kit[]>(`/kits/category/${category}`);
  },

  getStats: async (): Promise<KitStats> => {
    return apiClient.get<KitStats>('/kits/stats');
  },

  create: async (data: CreateKitDTO): Promise<Kit> => {
    return apiClient.post<Kit>('/kits', data);
  },

  update: async (id: string, data: UpdateKitDTO): Promise<Kit> => {
    return apiClient.put<Kit>(`/kits/${id}`, data);
  },

  delete: async (id: string): Promise<void> => {
    await apiClient.delete<void>(`/kits/${id}`);
  },

  duplicate: async (id: string): Promise<Kit> => {
    return apiClient.post<Kit>(`/kits/${id}/duplicate`);
  },
};
