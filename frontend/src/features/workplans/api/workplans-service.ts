/**
 * WorkPlans API Service
 */

import apiClient from '@/core/api/client';
import type { WorkPlan, CreateWorkPlanDTO, UpdateWorkPlanDTO, ApproveWorkPlanDTO, RejectWorkPlanDTO, UpdateBudgetDTO, BudgetComparison } from '../types';

export const workplansApi = {
  getAll: async (filters?: { orderId?: string; status?: string }): Promise<WorkPlan[]> => {
    const params = new URLSearchParams();
    if (filters?.orderId) params.append('orderId', filters.orderId);
    if (filters?.status) params.append('status', filters.status);
    return apiClient.get<WorkPlan[]>(`/workplans?${params.toString()}`);
  },

  getById: async (id: string): Promise<WorkPlan> => {
    return apiClient.get<WorkPlan>(`/workplans/${id}`);
  },

  getByOrderId: async (orderId: string): Promise<WorkPlan | null> => {
    return apiClient.get<WorkPlan | null>(`/workplans/order/${orderId}`);
  },

  create: async (data: CreateWorkPlanDTO): Promise<WorkPlan> => {
    return apiClient.post<WorkPlan>('/workplans', data);
  },

  update: async (id: string, data: UpdateWorkPlanDTO): Promise<WorkPlan> => {
    return apiClient.put<WorkPlan>(`/workplans/${id}`, data);
  },

  delete: async (id: string): Promise<void> => {
    await apiClient.delete(`/workplans/${id}`);
  },

  approve: async (id: string, data?: ApproveWorkPlanDTO): Promise<WorkPlan> => {
    return apiClient.post<WorkPlan>(`/workplans/${id}/approve`, data);
  },

  reject: async (id: string, data: RejectWorkPlanDTO): Promise<WorkPlan> => {
    return apiClient.post<WorkPlan>(`/workplans/${id}/reject`, data);
  },

  updateBudget: async (id: string, data: UpdateBudgetDTO): Promise<WorkPlan> => {
    return apiClient.put<WorkPlan>(`/workplans/${id}/budget`, data);
  },

  getBudgetComparison: async (id: string): Promise<BudgetComparison> => {
    return apiClient.get<BudgetComparison>(`/workplans/${id}/budget-comparison`);
  },

  exportToPdf: async (id: string): Promise<Blob> => {
    return apiClient.get<Blob>(`/workplans/${id}/pdf`);
  },

  completeChecklistItem: async (id: string, itemId: string, completed: boolean, notes?: string): Promise<WorkPlan> => {
    return apiClient.post<WorkPlan>(`/workplans/${id}/checklist/${itemId}/complete`, {
      completed,
      notes,
    });
  },
};
