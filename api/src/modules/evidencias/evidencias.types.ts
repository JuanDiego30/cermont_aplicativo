import { z } from 'zod';

// ============================================
// ENUMS
// ============================================

export enum TipoEvidencia {
    FOTO = 'FOTO',
    VIDEO = 'VIDEO',
    DOCUMENTO = 'DOCUMENTO',
    FIRMA = 'FIRMA',
    AUDIO = 'AUDIO',
}

// ============================================
// ZOD SCHEMAS
// ============================================

export const uploadEvidenciaSchema = z.object({
    tipo: z.nativeEnum(TipoEvidencia),
    descripcion: z.string().min(5, 'La descripción debe tener al menos 5 caracteres'),
    ubicacionGPS: z.object({
        latitud: z.number(),
        longitud: z.number(),
    }).optional(),
    tags: z.array(z.string()).optional(),
});

export const listEvidenciasSchema = z.object({
    page: z.coerce.number().positive().optional().default(1),
    limit: z.coerce.number().positive().max(100).optional().default(20),
    tipo: z.nativeEnum(TipoEvidencia).optional(),
    verificada: z.coerce.boolean().optional(),
});

// ============================================
// TYPES
// ============================================

export type UploadEvidenciaDTO = z.infer<typeof uploadEvidenciaSchema>;
export type ListEvidenciasQuery = z.infer<typeof listEvidenciasSchema>;

export interface Evidencia {
    id: string;
    ejecucionId: string;
    ordenId: string;
    tipo: TipoEvidencia;
    nombreArchivo: string;
    rutaArchivo: string;
    tamano: number;
    mimeType: string;
    descripcion: string;
    ubicacionGPS?: {
        latitud: number;
        longitud: number;
    };
    tags: string[];
    subidoPor: string;
    verificada: boolean;
    verificadoPor?: string;
    verificadoEn?: Date;
    createdAt: Date;
    updatedAt: Date;
}

export interface EvidenciaWithUrl extends Evidencia {
    url: string;
}
