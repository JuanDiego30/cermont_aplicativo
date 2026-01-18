/**
 * Evidence Model - Angular Frontend
 * Tipos para evidencias fotográficas/documentales de órdenes
 * Migrado de web-old/src/types/evidence.ts
 */

export type EvidenceType = 'FOTO' | 'VIDEO' | 'DOCUMENTO' | 'AUDIO';
export type EvidenceStage = 'ANTES' | 'DURANTE' | 'DESPUES';

export interface Evidence {
  id: string;
  ordenId: string;
  tipo: EvidenceType;
  etapa: EvidenceStage;
  url: string;
  thumbnail?: string;
  nombre: string;
  descripcion?: string;
  coordenadas?: {
    lat: number;
    lng: number;
  };
  creadoPor: string;
  creadoEn: string;
}

export interface CreateEvidenceDto {
  ordenId: string;
  tipo: EvidenceType;
  etapa: EvidenceStage;
  descripcion?: string;
  coordenadas?: {
    lat: number;
    lng: number;
  };
}

export interface EvidenceFilters {
  ordenId?: string;
  tipo?: EvidenceType;
  etapa?: EvidenceStage;
}
