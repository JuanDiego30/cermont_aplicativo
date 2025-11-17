import apiClient from './client';
import type {
  WorkPlan,
  CreateWorkPlanDTO,
  UpdateWorkPlanDTO,
  ApproveWorkPlanDTO,
  RejectWorkPlanDTO,
  UpdateBudgetDTO,
  BudgetComparison,
} from '@/lib/types/workplan';

export const workplansApi = {
  /**
   * Obtener todos los planes de trabajo
   */
  getAll: async (filters?: { orderId?: string; status?: string }): Promise<WorkPlan[]> => {
    const params = new URLSearchParams();
    if (filters?.orderId) params.append('orderId', filters.orderId);
    if (filters?.status) params.append('status', filters.status);

    const response = await apiClient.get<WorkPlan[]>(`/workplans?${params.toString()}`);
    return response.data;
  },

  /**
   * Obtener plan por ID
   */
  getById: async (id: string): Promise<WorkPlan> => {
    const response = await apiClient.get<WorkPlan>(`/workplans/${id}`);
    return response.data;
  },

  /**
   * Obtener plan por ID de orden
   */
  getByOrderId: async (orderId: string): Promise<WorkPlan | null> => {
    const response = await apiClient.get<WorkPlan>(`/workplans/order/${orderId}`);
    return response.data;
  },

  /**
   * Crear nuevo plan de trabajo
   */
  create: async (data: CreateWorkPlanDTO): Promise<WorkPlan> => {
    const response = await apiClient.post<WorkPlan>('/workplans', data);
    return response.data;
  },

  /**
   * Actualizar plan de trabajo
   */
  update: async (id: string, data: UpdateWorkPlanDTO): Promise<WorkPlan> => {
    const response = await apiClient.put<WorkPlan>(`/workplans/${id}`, data);
    return response.data;
  },

  /**
   * Eliminar plan de trabajo
   */
  delete: async (id: string): Promise<void> => {
    await apiClient.delete(`/workplans/${id}`);
  },

  /**
   * Aprobar plan de trabajo
   */
  approve: async (id: string, data?: ApproveWorkPlanDTO): Promise<WorkPlan> => {
    const response = await apiClient.post<WorkPlan>(`/workplans/${id}/approve`, data);
    return response.data;
  },

  /**
   * Rechazar plan de trabajo
   */
  reject: async (id: string, data: RejectWorkPlanDTO): Promise<WorkPlan> => {
    const response = await apiClient.post<WorkPlan>(`/workplans/${id}/reject`, data);
    return response.data;
  },

  /**
   * Actualizar presupuesto
   */
  updateBudget: async (id: string, data: UpdateBudgetDTO): Promise<WorkPlan> => {
    const response = await apiClient.patch<WorkPlan>(`/workplans/${id}/budget`, data);
    return response.data;
  },

  /**
   * Obtener comparaci�n de presupuesto
   */
  getBudgetComparison: async (id: string): Promise<BudgetComparison> => {
    const response = await apiClient.get<BudgetComparison>(`/workplans/${id}/budget/comparison`);
    return response.data;
  },

  /**
   * Exportar plan a PDF
   */
  exportToPdf: async (id: string): Promise<Blob> => {
    const response = await apiClient.get(`/workplans/${id}/pdf`, {
      responseType: 'blob',
    });
    return response.data;
  },

  /**
   * Completar checklist item
   */
  completeChecklistItem: async (
    id: string,
    itemId: string,
    completed: boolean,
    notes?: string
  ): Promise<WorkPlan> => {
    const response = await apiClient.patch<WorkPlan>(
      `/workplans/${id}/checklist/${itemId}`,
      { completed, notes }
    );
    return response.data;
  },
};

