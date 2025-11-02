// src/services/workplans.service.ts
import apiClient from '@/lib/api/client';
import type { WorkPlan, CreateWorkPlanData, WorkPlanFilters, WorkPlansResponse } from '@/types/workplan.types';
import type { ApiResponse } from '@/types';

export const workplansService = {
  /**
   * Crear un nuevo plan de trabajo
   */
  async createWorkPlan(data: CreateWorkPlanData): Promise<WorkPlan> {
    const { data: response } = await apiClient.post<ApiResponse<WorkPlan>>('/workplans', data);
    return response.data;
  },

  /**
   * Obtener todos los planes de trabajo con filtros y paginación
   */
  async getWorkPlans(filters?: WorkPlanFilters, cursor?: string, limit = 10): Promise<WorkPlansResponse> {
    const params = new URLSearchParams();

    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          params.append(key, value.toString());
        }
      });
    }

    if (cursor) params.append('cursor', cursor);
    params.append('limit', limit.toString());

    const { data } = await apiClient.get<ApiResponse<WorkPlansResponse>>(`/workplans?${params}`);
    return data.data;
  },

  /**
   * Obtener un plan de trabajo por ID
   */
  async getWorkPlanById(id: string): Promise<WorkPlan> {
    const { data } = await apiClient.get<ApiResponse<WorkPlan>>(`/workplans/${id}`);
    return data.data;
  },

  /**
   * Actualizar un plan de trabajo
   */
  async updateWorkPlan(id: string, data: Partial<CreateWorkPlanData>): Promise<WorkPlan> {
    const { data: response } = await apiClient.put<ApiResponse<WorkPlan>>(`/workplans/${id}`, data);
    return response.data;
  },

  /**
   * Eliminar un plan de trabajo
   */
  async deleteWorkPlan(id: string): Promise<void> {
    await apiClient.delete(`/workplans/${id}`);
  },

  /**
   * Aprobar un plan de trabajo
   */
  async approveWorkPlan(id: string, comentarios?: string): Promise<WorkPlan> {
    const { data } = await apiClient.post<ApiResponse<WorkPlan>>(`/workplans/${id}/approve`, { comentarios });
    return data.data;
  },
};

// Exportar funciones legacy para compatibilidad
export const createWorkPlan = workplansService.createWorkPlan;
export const getWorkPlans = workplansService.getWorkPlans;
export const getWorkPlanById = workplansService.getWorkPlanById;