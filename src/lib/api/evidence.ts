/**
 * Cliente API para gestión de evidencias
 */

import { api } from './client';
import { getToken } from '@/lib/auth/tokenStorage';

// Tipos
export interface EvidenceRecord {
  id: string;
  orden_id: string;
  url: string;
  tipo: string;
  ts: string;
  meta_json: Record<string, unknown> | null;
}

export interface EvidenceListResponse {
  data: EvidenceRecord[];
}

export interface EvidenceResponse {
  data: EvidenceRecord;
  message?: string;
}

export interface UploadEvidenceInput {
  file: File;
  orden_id: string;
  tipo?: string;
  descripcion?: string;
}

// API Client
export const evidenceAPI = {
  /**
   * Listar evidencias de una orden
   */
  list: (ordenId: string) => {
    return api.get<EvidenceListResponse>(`/ordenes/${ordenId}/evidencias`);
  },

  /**
   * Subir una nueva evidencia
   */
  upload: async (input: UploadEvidenceInput) => {
    const formData = new FormData();
    formData.append('file', input.file);
    formData.append('orden_id', input.orden_id);
    if (input.tipo) formData.append('tipo', input.tipo);
    if (input.descripcion) formData.append('descripcion', input.descripcion);
    const base = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:4000/v1';
    const token = getToken();
    const sanitizedBase = base.replace(/\/$/, '');
    const url = `${sanitizedBase}/ordenes/${input.orden_id}/evidencias`;

    const response = await fetch(url, {
      method: 'POST',
      body: formData,
      headers: token ? { Authorization: `Bearer ${token}` } : undefined,
    });

    const data = await response.json();

    if (!response.ok) {
      return { error: data.error || 'Error al subir evidencia', data: null };
    }

    return { data: data as EvidenceRecord, error: null };
  },

  /**
   * Eliminar una evidencia
   */
  remove: (ordenId: string, id: string) => {
    return api.delete<{ message?: string }>(`/ordenes/${ordenId}/evidencias/${id}`);
  },
};
