// ============================================
// EVIDENCIAS API - Cermont FSM
// Cliente API para gestión de evidencias
// ============================================

import { apiClient } from '@/lib/api';

export interface Evidencia {
  id: string;
  ejecucionId: string;
  ordenId: string;
  tipo: TipoEvidencia;
  descripcion?: string;
  rutaArchivo: string;
  url: string;
  mimeType: string;
  tamanio: number;
  metadatos?: EvidenciaMetadatos;
  verificada: boolean;
  verificadaPor?: string;
  verificadaAt?: string;
  createdAt: string;
  updatedAt: string;
}

export type TipoEvidencia = 
  | 'foto_antes'
  | 'foto_durante'
  | 'foto_despues'
  | 'video'
  | 'documento'
  | 'firma_cliente'
  | 'firma_tecnico';

export interface EvidenciaMetadatos {
  ubicacion?: {
    lat: number;
    lng: number;
    accuracy?: number;
  };
  dispositivo?: string;
  fechaCaptura?: string;
  dimensiones?: {
    ancho: number;
    alto: number;
  };
}

export interface UploadEvidenciaInput {
  ejecucionId: string;
  ordenId: string;
  tipo: TipoEvidencia;
  descripcion?: string;
  archivo: File;
  metadatos?: EvidenciaMetadatos;
}

export interface ListEvidenciasParams {
  ordenId?: string;
  ejecucionId?: string;
  tipo?: TipoEvidencia;
  verificada?: boolean;
  page?: number;
  limit?: number;
}

export interface PaginatedEvidencias {
  data: Evidencia[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
}

export const evidenciasApi = {
  /**
   * Subir evidencia
   */
  upload: async (data: UploadEvidenciaInput): Promise<Evidencia> => {
    const formData = new FormData();
    formData.append('archivo', data.archivo);
    formData.append('ejecucionId', data.ejecucionId);
    formData.append('ordenId', data.ordenId);
    formData.append('tipo', data.tipo);
    
    if (data.descripcion) {
      formData.append('descripcion', data.descripcion);
    }
    
    if (data.metadatos) {
      formData.append('metadatos', JSON.stringify(data.metadatos));
    }

    const result = await apiClient.uploadForm<{ status: string; data: Evidencia }>(
      '/evidencias/upload',
      formData
    );
    return result.data;
  },

  /**
   * Listar evidencias
   */
  list: async (params?: ListEvidenciasParams): Promise<PaginatedEvidencias> => {
    const searchParams = new URLSearchParams();
    
    if (params?.ordenId) searchParams.append('ordenId', params.ordenId);
    if (params?.ejecucionId) searchParams.append('ejecucionId', params.ejecucionId);
    if (params?.tipo) searchParams.append('tipo', params.tipo);
    if (params?.verificada !== undefined) searchParams.append('verificada', String(params.verificada));
    searchParams.append('page', String(params?.page || 1));
    searchParams.append('limit', String(params?.limit || 20));

    const response = await apiClient.get<{ status: string; data: Evidencia[]; pagination: PaginatedEvidencias['pagination'] }>(
      `/evidencias?${searchParams.toString()}`
    );
    
    return {
      data: response.data,
      pagination: response.pagination,
    };
  },

  /**
   * Obtener evidencias por orden
   */
  getByOrdenId: async (ordenId: string): Promise<Evidencia[]> => {
    const response = await apiClient.get<{ status: string; data: Evidencia[] }>(
      `/evidencias/orden/${ordenId}`
    );
    return response.data;
  },

  /**
   * Obtener evidencias por ejecución
   */
  getByEjecucionId: async (ejecucionId: string): Promise<Evidencia[]> => {
    const response = await apiClient.get<{ status: string; data: Evidencia[] }>(
      `/evidencias/ejecucion/${ejecucionId}`
    );
    return response.data;
  },

  /**
   * Obtener evidencia por ID
   */
  getById: async (id: string): Promise<Evidencia> => {
    const response = await apiClient.get<{ status: string; data: Evidencia }>(
      `/evidencias/${id}`
    );
    return response.data;
  },

  /**
   * Verificar evidencia
   */
  verificar: async (id: string): Promise<Evidencia> => {
    const response = await apiClient.patch<{ status: string; data: Evidencia }>(
      `/evidencias/${id}/verificar`,
      {}
    );
    return response.data;
  },

  /**
   * Eliminar evidencia
   */
  delete: async (id: string): Promise<void> => {
    await apiClient.delete(`/evidencias/${id}`);
  },

  /**
   * Descargar evidencia
   */
  download: async (id: string): Promise<Blob> => {
    const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';
    const authData = typeof window !== 'undefined' ? localStorage.getItem('cermont-auth') : null;
    const token = authData ? JSON.parse(authData)?.state?.token : null;
    
    const headers: HeadersInit = {};
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    const response = await fetch(`${API_URL}/evidencias/${id}/download`, {
      method: 'GET',
      headers,
    });
    
    if (!response.ok) {
      throw new Error('Error al descargar evidencia');
    }
    
    return response.blob();
  },
};
