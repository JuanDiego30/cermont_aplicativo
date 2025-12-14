// @/features/kits - Stub module with React Query-compatible hooks
// TODO: Implement full kits management feature

export interface Kit {
    id: string;
    nombre: string;
    codigo?: string;
    descripcion?: string;
    categoria: 'seguridad' | 'herramientas' | 'electrico' | 'mecanico' | 'general';
    items: KitItem[];
    estado: EstadoKit;
    createdAt: string;
}

export interface KitItem {
    nombre: string;
    cantidad: number;
    unidad?: string;
}

export interface KitFilters {
    categoria?: string;
    estado?: EstadoKit;
}

export type EstadoKit = 'disponible' | 'en_uso' | 'mantenimiento';

// Stub components
export const KitCard = (_props: { kit: Kit; onView?: () => void }) => null;
export const KitCardSkeleton = () => null;

// React Query-compatible stub hooks
export const useKits = (_filters?: KitFilters) => ({
    data: { data: [] as Kit[], total: 0 },
    isLoading: false,
    isError: false,
    error: null,
    refetch: () => Promise.resolve({ data: { data: [] as Kit[], total: 0 } }),
});

// Config stubs
export const ESTADO_KIT_CONFIG: Record<EstadoKit, { label: string; color: string }> = {
    disponible: { label: 'Disponible', color: 'green' },
    en_uso: { label: 'En Uso', color: 'yellow' },
    mantenimiento: { label: 'Mantenimiento', color: 'red' },
};
