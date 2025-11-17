import apiClient from './client';
import type { Kit, CreateKitDTO, UpdateKitDTO, KitStats } from '@/lib/types/kit';

export const kitsApi = {
  /**
   * Obtener todos los kits t�picos
   */
  getAll: async (): Promise<Kit[]> => {
    const response = await apiClient.get<{ kits: Kit[] }>('/kits');
    return response.data.kits || response.data;
  },

  /**
   * Obtener kit por ID
   */
  getById: async (id: string): Promise<Kit> => {
    const response = await apiClient.get<Kit>(`/kits/${id}`);
    return response.data;
  },

  /**
   * Buscar kits por categor�a
   */
  getByCategory: async (category: string): Promise<Kit[]> => {
    const response = await apiClient.get<Kit[]>(`/kits/category/${category}`);
    return response.data;
  },

  /**
   * Obtener estad�sticas de kits
   */
  getStats: async (): Promise<KitStats> => {
    const response = await apiClient.get<KitStats>('/kits/stats');
    return response.data;
  },

  /**
   * Crear nuevo kit t�pico
   */
  create: async (data: CreateKitDTO): Promise<Kit> => {
    const response = await apiClient.post<Kit>('/kits', data);
    return response.data;
  },

  /**
   * Actualizar kit existente
   */
  update: async (id: string, data: UpdateKitDTO): Promise<Kit> => {
    const response = await apiClient.put<Kit>(`/kits/${id}`, data);
    return response.data;
  },

  /**
   * Eliminar kit
   */
  delete: async (id: string): Promise<void> => {
    await apiClient.delete(`/kits/${id}`);
  },

  /**
   * Duplicar kit (crear copia)
   */
  duplicate: async (id: string): Promise<Kit> => {
    const response = await apiClient.post<Kit>(`/kits/${id}/duplicate`);
    return response.data;
  },
};

