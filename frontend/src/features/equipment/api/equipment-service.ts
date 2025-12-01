/**
 * API Service: Equipment
 * Cliente HTTP para endpoints de equipos certificados
 * 
 * @file frontend/src/features/equipment/api/equipment-service.ts
 */

import apiClient from '@/core/api/client';
import type {
  CertifiedEquipment,
  CreateEquipmentDTO,
  UpdateEquipmentDTO,
  EquipmentFilters,
  PaginatedEquipmentResponse,
  AlertsResponse,
  EquipmentStats,
} from '../types/equipment.types';

const BASE_PATH = '/equipment';

export const equipmentApi = {
  /**
   * Lista equipos con filtros y paginación
   */
  async list(filters?: EquipmentFilters): Promise<PaginatedEquipmentResponse> {
    const params = new URLSearchParams();
    if (filters?.category) params.append('category', filters.category);
    if (filters?.status) params.append('status', filters.status);
    if (filters?.search) params.append('search', filters.search);
    if (filters?.location) params.append('location', filters.location);
    if (filters?.assignedTo) params.append('assignedTo', filters.assignedTo);
    if (filters?.page) params.append('page', String(filters.page));
    if (filters?.limit) params.append('limit', String(filters.limit));

    const queryString = params.toString();
    const url = queryString ? `${BASE_PATH}?${queryString}` : BASE_PATH;

    return apiClient.get<PaginatedEquipmentResponse>(url);
  },

  /**
   * Obtiene un equipo por ID
   */
  async getById(id: string): Promise<CertifiedEquipment> {
    const response = await apiClient.get<{ data: CertifiedEquipment }>(`${BASE_PATH}/${id}`);
    return response.data;
  },

  /**
   * Crea un nuevo equipo
   */
  async create(data: CreateEquipmentDTO): Promise<CertifiedEquipment> {
    const response = await apiClient.post<{ data: CertifiedEquipment }>(BASE_PATH, data);
    return response.data;
  },

  /**
   * Actualiza un equipo existente
   */
  async update(id: string, data: UpdateEquipmentDTO): Promise<CertifiedEquipment> {
    const response = await apiClient.patch<{ data: CertifiedEquipment }>(`${BASE_PATH}/${id}`, data);
    return response.data;
  },

  /**
   * Elimina un equipo (soft delete)
   */
  async delete(id: string): Promise<void> {
    await apiClient.delete(`${BASE_PATH}/${id}`);
  },

  /**
   * Obtiene alertas de certificaciones próximas a vencer
   */
  async getAlerts(daysAhead: number = 30): Promise<AlertsResponse> {
    return apiClient.get<AlertsResponse>(`${BASE_PATH}/alerts/expiring?daysAhead=${daysAhead}`);
  },

  /**
   * Obtiene estadísticas de equipos
   */
  async getStats(): Promise<EquipmentStats> {
    const [byStatus, byCategory] = await Promise.all([
      apiClient.get<{ data: Record<string, number> }>(`${BASE_PATH}/stats/by-status`),
      apiClient.get<{ data: Record<string, number> }>(`${BASE_PATH}/stats/by-category`),
    ]);

    const total = Object.values(byStatus.data).reduce((a, b) => a + b, 0);

    return {
      byStatus: byStatus.data as any,
      byCategory: byCategory.data as any,
      total,
    };
  },

  /**
   * Asigna equipo a un usuario
   */
  async assign(equipmentId: string, userId: string): Promise<CertifiedEquipment> {
    const response = await apiClient.patch<{ data: CertifiedEquipment }>(
      `${BASE_PATH}/${equipmentId}/assign`,
      { userId }
    );
    return response.data;
  },

  /**
   * Libera equipo (marca como disponible)
   */
  async release(equipmentId: string): Promise<CertifiedEquipment> {
    const response = await apiClient.patch<{ data: CertifiedEquipment }>(
      `${BASE_PATH}/${equipmentId}/release`,
      {}
    );
    return response.data;
  },
};
