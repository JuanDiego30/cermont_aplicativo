/**
 * Cliente API para gestión de evidencias
 */

import { api } from './client';
import { createClient } from '@/lib/supabase/client';

// Tipos
export interface Evidence {
  id: string;
  orden_id: string;
  tipo: 'foto' | 'video';
  url: string;
  descripcion: string | null;
  fecha_captura: string;
  created_at: string;
}

export interface EvidenceWithUser extends Evidence {
  usuario: {
    id: string;
    nombre: string;
  };
}

export interface EvidenceListResponse {
  data: EvidenceWithUser[];
}

export interface EvidenceResponse {
  data: Evidence;
  message?: string;
}

export interface UploadEvidenceInput {
  file: File;
  orden_id: string;
  tipo?: 'foto' | 'video';
  descripcion?: string;
}

export interface HistoryEntry {
  id: string;
  orden_id: string;
  usuario_id: string;
  accion: string;
  detalles: Record<string, unknown>;
  timestamp: string;
  usuario: {
    id: string;
    nombre: string;
    rol: string;
  };
}

export interface HistoryResponse {
  data: HistoryEntry[];
}

// API Client
export const evidenceAPI = {
  /**
   * Listar evidencias de una orden
   */
  list: (ordenId: string) => {
    return api.get<EvidenceListResponse>('/evidence', { orden_id: ordenId });
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

    const supabase = createClient();
    const { data: { session } } = await supabase.auth.getSession();

    const base = process.env.NEXT_PUBLIC_API_BASE_URL;
    const url = base ? `${base}/evidence` : '/evidence';

    const response = await fetch(url, {
      method: 'POST',
      body: formData,
      headers: session?.access_token ? { Authorization: `Bearer ${session.access_token}` } : undefined,
      // No incluir Content-Type, el navegador lo configurará automáticamente con el boundary
    });

    const data = await response.json();

    if (!response.ok) {
      return { error: data.error || 'Error al subir evidencia', data: null };
    }

    return { data: data.data as Evidence, error: null };
  },

  /**
   * Eliminar una evidencia
   */
  delete: (id: string) => {
    return api.delete<{ message: string }>(`/evidence/${id}`);
  },

  /**
   * Obtener historial de cambios de una orden
   */
  getHistory: (ordenId: string) => {
    return api.get<HistoryResponse>('/history', { orden_id: ordenId });
  },
};
