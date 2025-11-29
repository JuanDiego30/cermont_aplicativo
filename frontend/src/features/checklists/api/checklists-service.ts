/**
 * Checklists API Service
 */

import apiClient from '@/core/api/client';
import type { ChecklistTemplate, CompletedChecklist, CreateChecklistTemplateDTO, UpdateChecklistTemplateDTO, StartChecklistDTO } from '../types';

interface ChecklistsResponse {
  data: {
    templates: ChecklistTemplate[];
  };
}

interface TemplateResponse {
  data: ChecklistTemplate;
}

export const checklistsApi = {
  getAllTemplates: async (): Promise<ChecklistTemplate[]> => {
    const response = await apiClient.get<ChecklistsResponse>('/checklists');
    return response.data.templates;
  },

  getTemplateById: async (id: string): Promise<ChecklistTemplate> => {
    const response = await apiClient.get<TemplateResponse>(`/checklists/${id}`);
    return response.data;
  },

  getTemplatesByCategory: async (category: string): Promise<ChecklistTemplate[]> => {
    return apiClient.get<ChecklistTemplate[]>(`/checklists/templates?category=${category}`);
  },

  getTemplatesByKit: async (kitId: string): Promise<ChecklistTemplate[]> => {
    return apiClient.get<ChecklistTemplate[]>(`/checklists/templates?kitId=${kitId}`);
  },

  createTemplate: async (data: CreateChecklistTemplateDTO): Promise<ChecklistTemplate> => {
    const response = await apiClient.post<TemplateResponse>('/checklists', data);
    return response.data;
  },

  updateTemplate: async (id: string, data: UpdateChecklistTemplateDTO): Promise<ChecklistTemplate> => {
    return apiClient.put<ChecklistTemplate>(`/checklists/templates/${id}`, data);
  },

  deleteTemplate: async (id: string): Promise<void> => {
    await apiClient.delete<void>(`/checklists/templates/${id}`);
  },

  duplicateTemplate: async (id: string): Promise<ChecklistTemplate> => {
    return apiClient.post<ChecklistTemplate>(`/checklists/templates/${id}/duplicate`);
  },

  startChecklist: async (data: StartChecklistDTO): Promise<CompletedChecklist> => {
    return apiClient.post<CompletedChecklist>('/checklists', data);
  },
};
