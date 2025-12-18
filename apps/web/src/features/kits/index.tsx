
// @/features/kits - Real implementation
export * from './hooks/use-kits';
export * from './services/kits.service';
export * from './components/KitCard';

// Types matching backend KitTipico
export interface HerramientaKit {
    nombre: string;
    cantidad: number;
    certificacion: boolean;
}

export interface EquipoKit {
    nombre: string;
    cantidad: number;
    certificacion: boolean;
}

export interface ActividadKit {
    nombre: string;
    duracion?: number;
    orden: number;
}

export interface Kit {
    id: string;
    nombre: string;
    descripcion?: string;

    // Arrays from backend
    herramientas: HerramientaKit[];
    equipos: EquipoKit[];
    documentos: string[];
    checklistItems: string[];

    duracionEstimadaHoras: number;
    costoEstimado: number;
    activo: boolean; // Backend uses boolean

    createdAt?: string;
    updatedAt?: string;
}

export interface KitFilters {
    activo?: boolean;
}

export type EstadoKit = 'activo' | 'inactivo';

export const ESTADO_KIT_CONFIG: Record<EstadoKit, { label: string; color: string }> = {
    activo: { label: 'Activo', color: 'green' },
    inactivo: { label: 'Inactivo', color: 'gray' },
};
