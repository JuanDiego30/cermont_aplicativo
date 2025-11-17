import apiClient from './client';
import type {
  ChecklistTemplate,
  CompletedChecklist,
  CreateChecklistTemplateDTO,
  UpdateChecklistTemplateDTO,
  StartChecklistDTO,
  SaveAnswerDTO,
  CompleteChecklistDTO,
} from '@/lib/types/checklist';

export const checklistsApi = {
  // ==================== TEMPLATES ====================

  /**
   * Obtener todos los templates
   */
  getAllTemplates: async (): Promise<ChecklistTemplate[]> => {
    const response = await apiClient.get<ChecklistTemplate[]>('/checklists/templates');
    return response.data;
  },

  /**
   * Obtener template por ID
   */
  getTemplateById: async (id: string): Promise<ChecklistTemplate> => {
    const response = await apiClient.get<ChecklistTemplate>(`/checklists/templates/${id}`);
    return response.data;
  },

  /**
   * Buscar templates por categor�a
   */
  getTemplatesByCategory: async (category: string): Promise<ChecklistTemplate[]> => {
    const response = await apiClient.get<ChecklistTemplate[]>(
      `/checklists/templates?category=${category}`
    );
    return response.data;
  },

  /**
   * Obtener templates vinculados a un kit
   */
  getTemplatesByKit: async (kitId: string): Promise<ChecklistTemplate[]> => {
    const response = await apiClient.get<ChecklistTemplate[]>(
      `/checklists/templates?kitId=${kitId}`
    );
    return response.data;
  },

  /**
   * Crear nuevo template
   */
  createTemplate: async (data: CreateChecklistTemplateDTO): Promise<ChecklistTemplate> => {
    const response = await apiClient.post<ChecklistTemplate>('/checklists/templates', data);
    return response.data;
  },

  /**
   * Actualizar template
   */
  updateTemplate: async (
    id: string,
    data: UpdateChecklistTemplateDTO
  ): Promise<ChecklistTemplate> => {
    const response = await apiClient.put<ChecklistTemplate>(
      `/checklists/templates/${id}`,
      data
    );
    return response.data;
  },

  /**
   * Eliminar template
   */
  deleteTemplate: async (id: string): Promise<void> => {
    await apiClient.delete(`/checklists/templates/${id}`);
  },

  /**
   * Duplicar template
   */
  duplicateTemplate: async (id: string): Promise<ChecklistTemplate> => {
    const response = await apiClient.post<ChecklistTemplate>(
      `/checklists/templates/${id}/duplicate`
    );
    return response.data;
  },

  // ==================== EJECUCI�N ====================

  /**
   * Iniciar nuevo checklist desde template
   */
  startChecklist: async (data: StartChecklistDTO): Promise<CompletedChecklist> => {
    const response = await apiClient.post<CompletedChecklist>('/checklists', data);
    return response.data;
  },

  /**
   * Obtener checklist en progreso
   */
  getChecklistById: async (id: string): Promise<CompletedChecklist> => {
    const response = await apiClient.get<CompletedChecklist>(`/checklists/${id}`);
    return response.data;
  },

  /**
   * Guardar respuesta individual
   */
  saveAnswer: async (data: SaveAnswerDTO): Promise<CompletedChecklist> => {
    const formData = new FormData();
    formData.append('questionId', data.questionId);
    formData.append('answer', JSON.stringify(data.answer));
    if (data.notes) formData.append('notes', data.notes);
    if (data.signature) formData.append('signature', data.signature);
    if (data.photos) {
      data.photos.forEach((photo) => formData.append('photos', photo));
    }

    const response = await apiClient.post<CompletedChecklist>(
      `/checklists/${data.checklistId}/answers`,
      formData,
      {
        headers: { 'Content-Type': 'multipart/form-data' },
      }
    );
    return response.data;
  },

  /**
   * Completar checklist
   */
  completeChecklist: async (data: CompleteChecklistDTO): Promise<CompletedChecklist> => {
    const response = await apiClient.post<CompletedChecklist>(
      `/checklists/${data.checklistId}/complete`,
      { location: data.location }
    );
    return response.data;
  },

  /**
   * Aprobar checklist completado
   */
  approveChecklist: async (id: string): Promise<CompletedChecklist> => {
    const response = await apiClient.post<CompletedChecklist>(`/checklists/${id}/approve`);
    return response.data;
  },

  /**
   * Rechazar checklist completado
   */
  rejectChecklist: async (id: string, reason: string): Promise<CompletedChecklist> => {
    const response = await apiClient.post<CompletedChecklist>(`/checklists/${id}/reject`, {
      reason,
    });
    return response.data;
  },

  /**
   * Obtener checklists de una orden
   */
  getChecklistsByOrder: async (orderId: string): Promise<CompletedChecklist[]> => {
    const response = await apiClient.get<CompletedChecklist[]>(
      `/checklists?orderId=${orderId}`
    );
    return response.data;
  },

  /**
   * Exportar checklist a PDF
   */
  exportToPdf: async (id: string): Promise<Blob> => {
    const response = await apiClient.get(`/checklists/${id}/export/pdf`, {
      responseType: 'blob',
    });
    return response.data;
  },
};

