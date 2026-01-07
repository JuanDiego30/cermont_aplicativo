/**
 * Evidence Model - Angular Frontend
 * Tipos para evidencias fotográficas/documentales de órdenes
 * Matching backend DTOs
 */

export type EvidenceType = 'FOTO' | 'VIDEO' | 'DOCUMENTO' | 'AUDIO';
export type EvidenceStatus = 'PENDING' | 'PROCESSING' | 'READY' | 'FAILED';

/**
 * Metadata de evidencias (thumbnails, etc.)
 */
export interface EvidenciaMetadataResponse {
  width?: number;
  height?: number;
  duration?: number;
  thumbnails?: {
    s150?: string;
    s300?: string;
  };
}

/**
 * Response de evidencia (matching backend)
 */
export interface EvidenciaResponse {
  id: string;
  ejecucionId?: string;
  ordenId: string;
  tipo: EvidenceType;
  mimeType: string;
  nombreArchivo: string;
  tamano: number;
  tamanoPretty: string;
  url: string;
  thumbnailUrl?: string;
  status: EvidenceStatus;
  descripcion: string;
  tags: string[];
  metadata?: EvidenciaMetadataResponse;
  subidoPor: string;
  createdAt: string;
  updatedAt: string;
  isDeleted: boolean;
}

/**
 * Response paginado de evidencias
 */
export interface ListEvidenciasResponse {
  data: EvidenciaResponse[];
  total: number;
  page: number;
  limit: number;
  pages: number;
}

/**
 * Response de upload
 */
export interface UploadEvidenciaResponse {
  success: boolean;
  evidencia: EvidenciaResponse;
  message: string;
}

/**
 * DTO para upload de evidencia
 */
export interface UploadEvidenciaDto {
  ordenId: string;
  ejecucionId?: string;
  tipo?: EvidenceType;
  descripcion?: string;
  tags?: string; // Comma-separated
}

/**
 * Query parameters para listar evidencias
 */
export interface ListEvidenciasQueryDto {
  ordenId?: string;
  ejecucionId?: string;
  tipo?: EvidenceType;
  status?: EvidenceStatus;
  includeDeleted?: boolean;
  page?: number;
  limit?: number;
}

/**
 * Response de token temporal para descarga
 */
export interface TempDownloadUrlResponse {
  token: string;
  url: string;
  expiresAt: string;
}

/**
 * Response de eliminación
 */
export interface DeleteEvidenciaResponse {
  success: boolean;
  message: string;
}

// Legacy types (for backward compatibility)
export type Evidence = EvidenciaResponse;
export type EvidenceStage = 'ANTES' | 'DURANTE' | 'DESPUES'; // Deprecated, usar status

export interface CreateEvidenceDto {
  ordenId: string;
  tipo: EvidenceType;
  etapa?: EvidenceStage; // Deprecated
  descripcion?: string;
  coordenadas?: {
    lat: number;
    lng: number;
  };
}

export interface EvidenceFilters {
  ordenId?: string;
  tipo?: EvidenceType;
  etapa?: EvidenceStage; // Deprecated
}
