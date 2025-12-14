/**
 * @file formulario.types.ts
 * @description Type definitions for Formularios module
 */

export type EstadoFormulario = 'borrador' | 'activo' | 'archivado' | 'ACTIVO' | 'INACTIVO' | 'BORRADOR';

export interface Campo {
    id: string;
    tipo: 'texto' | 'numero' | 'fecha' | 'seleccion' | 'foto' | 'firma';
    nombre: string;
    requerido: boolean;
    opciones?: string[];
}

export interface Plantilla {
    id: string;
    nombre: string;
    descripcion?: string;
    campos: Campo[];
    activo: boolean;
    estado: EstadoFormulario;
    totalRespuestas?: number;
    createdAt: string;
    updatedAt: string;
}

export interface PlantillaFilters {
    search?: string;
    busqueda?: string;
    activo?: boolean;
    estado?: EstadoFormulario;
}

export interface CreatePlantillaInput {
    nombre: string;
    descripcion?: string;
    campos: Campo[];
    estado?: EstadoFormulario;
}
