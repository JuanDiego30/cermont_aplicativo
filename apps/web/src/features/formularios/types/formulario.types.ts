/**
 * ARCHIVO: formulario.types.ts
 * FUNCION: Definiciones de tipos para módulo de formularios/plantillas
 * IMPLEMENTACION: Interfaces para Campo, Plantilla, filtros e inputs de creación
 * DEPENDENCIAS: Ninguna (tipos puros)
 * EXPORTS: EstadoFormulario, Campo, Plantilla, PlantillaFilters, CreatePlantillaInput
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
