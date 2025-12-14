// @/features/hes - Stub module with React Query-compatible hooks
// TODO: Implement full HES equipment inspection feature

export interface EquipoHES {
    id: string;
    nombre: string;
    codigo?: string;
    marca?: string;
    tipo: TipoInspeccion;
    serial: string;
    estado: EstadoEquipo;
    ultimaInspeccion?: string;
    proximaInspeccion?: string;
}

export type TipoInspeccion = 'visual' | 'funcional' | 'certificacion';
export type EstadoEquipo = 'operativo' | 'mantenimiento' | 'fuera_servicio';

export interface EquipoHESFilters {
    tipo?: TipoInspeccion;
    estado?: EstadoEquipo;
}

// Stub components
export const EquipoHESCard = (_props: { equipo: EquipoHES; onView?: () => void; onInspeccionar?: () => void }) => null;
export const EquipoHESCardSkeleton = () => null;

// React Query-compatible stub hooks
export const useEquiposHES = (_filters?: EquipoHESFilters) => ({
    data: { data: [] as EquipoHES[], total: 0 },
    isLoading: false,
    isError: false,
    error: null,
    refetch: () => Promise.resolve({ data: { data: [] as EquipoHES[], total: 0 } }),
});

// Config stubs
export const TIPO_EQUIPO_CONFIG: Record<string, { label: string; color: string }> = {
    arnes: { label: 'Arnés', color: 'blue' },
    casco: { label: 'Casco', color: 'yellow' },
    guantes: { label: 'Guantes', color: 'green' },
};

export const ESTADO_EQUIPO_CONFIG: Record<EstadoEquipo, { label: string; color: string }> = {
    operativo: { label: 'Operativo', color: 'green' },
    mantenimiento: { label: 'Mantenimiento', color: 'yellow' },
    fuera_servicio: { label: 'Fuera de Servicio', color: 'red' },
};

export const TIPO_INSPECCION_CONFIG: Record<TipoInspeccion, { label: string; color: string }> = {
    visual: { label: 'Visual', color: 'blue' },
    funcional: { label: 'Funcional', color: 'purple' },
    certificacion: { label: 'Certificación', color: 'green' },
};
