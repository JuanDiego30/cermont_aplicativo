/**
 * ARCHIVO: evidencias.api.ts
 * FUNCION: Cliente API para gestión de evidencias (CRUD + upload)
 * IMPLEMENTACION: Usa apiClient con FormData para subida de archivos
 * DEPENDENCIAS: @/lib/api-client, evidencia.types
 * EXPORTS: evidenciasApi (getAll, getById, upload, delete)
 */
import { apiClient } from '@/lib/api-client';
import { filtersToParams } from '@/lib/utils/params';
import type { Evidencia, CreateEvidenciaInput, EvidenciaFilters } from '../types/evidencia.types';

const BASE_URL = '/evidencias';

export const evidenciasApi = {
  /**
   * Get all evidencias with optional filters
   */
  getAll: async (filters?: EvidenciaFilters): Promise<Evidencia[]> => {
    return apiClient.get<Evidencia[]>(BASE_URL, filtersToParams(filters));
  },

  /**
   * Get evidencia by ID
   */
  getById: async (id: string): Promise<Evidencia> => {
    return apiClient.get<Evidencia>(`${BASE_URL}/${id}`);
  },

  /**
   * Upload new evidencia
   */
  upload: async (input: CreateEvidenciaInput): Promise<Evidencia> => {
    const formData = new FormData();
    formData.append('ordenId', input.ordenId);
    formData.append('tipo', input.tipo);
    if (input.descripcion) formData.append('descripcion', input.descripcion);
    formData.append('file', input.archivo);

    return apiClient.uploadForm<Evidencia>(BASE_URL, formData);
  },

  /**
   * Delete evidencia
   */
  delete: async (id: string): Promise<void> => {
    await apiClient.delete(`${BASE_URL}/${id}`);
  }
};
