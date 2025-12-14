/**
 * @file evidencias.api.ts
 * @description API service for Evidencias module
 */

import { apiClient } from '@/lib/api-client'; // Import specific client that has uploadForm
import type { Evidencia, CreateEvidenciaInput, EvidenciaFilters } from '../types/evidencia.types';

const BASE_URL = '/evidencias';

// Helper for query params
function filtersToParams(filters?: EvidenciaFilters): Record<string, string> | undefined {
  if (!filters) return undefined;
  const params: Record<string, string> = {};
  Object.entries(filters).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== '') {
      params[key] = String(value);
    }
  });
  return params;
}

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
