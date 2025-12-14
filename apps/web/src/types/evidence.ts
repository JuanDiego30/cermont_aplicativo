/**
 * ARCHIVO: evidence.ts
 * FUNCION: Define tipos para evidencias fotográficas/documentales de órdenes
 * IMPLEMENTACION: Interfaces con soporte para geolocalización y etapas (ANTES/DURANTE/DESPUES)
 * DEPENDENCIAS: Ninguna (tipos puros)
 * EXPORTS: EvidenceType, EvidenceStage, Evidence, CreateEvidenceInput, EvidenceFilters
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

export interface CreateEvidenceInput {
  ordenId: string;
  tipo: EvidenceType;
  etapa: EvidenceStage;
  file: File;
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
