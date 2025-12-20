/**
 * @file forms-api.ts
 * @description API client para Formularios Dinámicos
 */

import { apiClient } from '@/lib/api';

export interface FormTemplate {
  id: string;
  nombre: string;
  tipo: string;
  categoria: string;
  version: string;
  activo: boolean;
  schema: any;
  uiSchema?: any;
  descripcion?: string;
  tags: string[];
  createdAt: string;
  updatedAt: string;
}

export interface FormInstance {
  id: string;
  templateId: string;
  ordenId?: string;
  data: any;
  estado: string;
  completadoPorId?: string;
  completadoEn?: string;
  revisadoPorId?: string;
  revisadoEn?: string;
  observaciones?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateFormTemplateDto {
  nombre: string;
  tipo: string;
  categoria: string;
  schema: any;
  uiSchema?: any;
  descripcion?: string;
  tags?: string[];
}

export interface UpdateFormTemplateDto {
  nombre?: string;
  categoria?: string;
  schema?: any;
  uiSchema?: any;
  descripcion?: string;
  tags?: string[];
  activo?: boolean;
}

export interface SubmitFormDto {
  templateId: string;
  ordenId?: string;
  data: any;
}

export interface UpdateFormInstanceDto {
  data?: any;
  estado?: string;
  observaciones?: string;
}

export const formsApi = {
  // ========================================
  // TEMPLATES
  // ========================================

  /**
   * Crear nuevo template de formulario
   */
  createTemplate: async (dto: CreateFormTemplateDto): Promise<FormTemplate> => {
    return apiClient.post<FormTemplate>('/forms/templates', dto);
  },

  /**
   * Listar todos los templates
   */
  findAllTemplates: async (filters?: {
    tipo?: string;
    categoria?: string;
    activo?: boolean;
  }): Promise<{ data: FormTemplate[] }> => {
    const searchParams = new URLSearchParams();
    if (filters?.tipo) searchParams.append('tipo', filters.tipo);
    if (filters?.categoria) searchParams.append('categoria', filters.categoria);
    if (filters?.activo !== undefined) searchParams.append('activo', String(filters.activo));
    const query = searchParams.toString();
    return apiClient.get<{ data: FormTemplate[] }>(`/forms/templates${query ? `?${query}` : ''}`);
  },

  /**
   * Obtener template por ID
   */
  findTemplateById: async (id: string): Promise<FormTemplate> => {
    return apiClient.get<FormTemplate>(`/forms/templates/${id}`);
  },

  /**
   * Actualizar template
   */
  updateTemplate: async (id: string, dto: UpdateFormTemplateDto): Promise<FormTemplate> => {
    return apiClient.put<FormTemplate>(`/forms/templates/${id}`, dto);
  },

  /**
   * Desactivar template (soft delete)
   */
  deleteTemplate: async (id: string): Promise<void> => {
    return apiClient.delete(`/forms/templates/${id}`);
  },

  // ========================================
  // PARSING - PDF/EXCEL → TEMPLATE
  // ========================================

  /**
   * Generar template desde PDF o Excel
   */
  parseAndCreateTemplate: async (file: File): Promise<FormTemplate> => {
    return apiClient.upload<FormTemplate>('/forms/templates/parse', file, 'file');
  },

  // ========================================
  // INSTANCIAS (Formularios completados)
  // ========================================

  /**
   * Enviar formulario completado
   */
  submitForm: async (dto: SubmitFormDto): Promise<FormInstance> => {
    return apiClient.post<FormInstance>('/forms/submit', dto);
  },

  /**
   * Listar formularios completados
   */
  findAllInstances: async (filters?: {
    templateId?: string;
    ordenId?: string;
    estado?: string;
  }): Promise<{ data: FormInstance[] }> => {
    const searchParams = new URLSearchParams();
    if (filters?.templateId) searchParams.append('templateId', filters.templateId);
    if (filters?.ordenId) searchParams.append('ordenId', filters.ordenId);
    if (filters?.estado) searchParams.append('estado', filters.estado);
    const query = searchParams.toString();
    return apiClient.get<{ data: FormInstance[] }>(`/forms/instances${query ? `?${query}` : ''}`);
  },

  /**
   * Obtener formulario completado por ID
   */
  findInstanceById: async (id: string): Promise<FormInstance> => {
    return apiClient.get<FormInstance>(`/forms/instances/${id}`);
  },

  /**
   * Actualizar formulario completado
   */
  updateInstance: async (id: string, dto: UpdateFormInstanceDto): Promise<FormInstance> => {
    return apiClient.put<FormInstance>(`/forms/instances/${id}`, dto);
  },

  /**
   * Eliminar formulario completado
   */
  deleteInstance: async (id: string): Promise<void> => {
    return apiClient.delete(`/forms/instances/${id}`);
  },
};
