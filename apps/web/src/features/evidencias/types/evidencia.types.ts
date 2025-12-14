/**
 * @file evidencia.types.ts
 * @description Type definitions for Evidencias module
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
