/**
 * ARCHIVO: evidencia.types.ts
 * FUNCION: Definiciones de tipos TypeScript para el módulo de evidencias
 * IMPLEMENTACION: Interfaces y types para Evidencia, filtros e inputs
 * DEPENDENCIAS: Ninguna (tipos puros)
 * EXPORTS: TipoEvidencia, Evidencia, CreateEvidenciaInput, EvidenciaFilters
 */
export type TipoEvidencia = 'foto' | 'video' | 'documento' | 'audio';

export interface Evidencia {
    id: string;
    ordenId: string;
    tipo: TipoEvidencia;
    url: string;
    descripcion?: string;
    fechaSubida: string;
    usuarioId: string;
    metadata?: {
        size: number;
        mimeType: string;
        originalName: string;
    };
}

export interface CreateEvidenciaInput {
    ordenId: string;
    archivo: File;
    tipo: TipoEvidencia;
    descripcion?: string;
}

export interface EvidenciaFilters {
    ordenId?: string;
    tipo?: TipoEvidencia;
    fechaDesde?: string;
    fechaHasta?: string;
}
