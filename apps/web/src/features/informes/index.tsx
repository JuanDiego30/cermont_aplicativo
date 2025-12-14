// @/features/informes - Stub module with React Query-compatible hooks
// TODO: Implement full reports feature

export interface Informe {
    id: string;
    nombre: string;
    titulo: string;
    tipo: TipoInforme;
    ordenId?: string;
    contenido: string;
    estado: 'borrador' | 'publicado' | 'archivado';
    createdAt: string;
}

// Extended TipoInforme to match dashboard usage
export type TipoInforme =
    | 'diario'
    | 'semanal'
    | 'mensual'
    | 'especial'
    | 'ORDENES_ESTADO'
    | 'COSTOS_MENSUALES'
    | 'PRODUCTIVIDAD'
    | 'CLIENTES'
    | 'TECNICOS'
    | 'TENDENCIAS'
    | 'HES'
    | 'INVENTARIO';

export interface InformeFilters {
    tipo?: TipoInforme;
    estado?: string;
    fechaInicio?: string;
    fechaFin?: string;
}

// Stub components
export const InformeCard = (_props: { informe: Informe; onDescargar?: () => void; onEliminar?: () => void }) => null;
export const InformeCardSkeleton = () => null;

// React Query-compatible stub hooks
export const useInformes = (_filters?: InformeFilters) => ({
    data: { data: [] as Informe[], total: 0 },
    isLoading: false,
    isError: false,
    error: null,
    refetch: () => Promise.resolve({ data: { data: [] as Informe[], total: 0 } }),
});

export const useGenerarInforme = () => ({
    mutate: (_params: { tipo: TipoInforme; formato?: string }) => { },
    mutateAsync: (_params: { tipo: TipoInforme; formato?: string }) => Promise.resolve({} as Informe),
    isPending: false,
    isLoading: false,
});

export const useDescargarInforme = () => ({
    mutate: (_params: { id: string; nombre?: string }) => { },
    mutateAsync: (_params: { id: string; nombre?: string }) => Promise.resolve(),
    isPending: false,
    isLoading: false,
});

export const useEliminarInforme = () => ({
    mutate: (_id: string) => { },
    mutateAsync: (_id: string) => Promise.resolve(),
    isPending: false,
    isLoading: false,
});

// Config stubs with descripcion field
export const TIPO_INFORME_CONFIG: Record<TipoInforme, { label: string; color: string; descripcion: string }> = {
    diario: { label: 'Diario', color: 'blue', descripcion: 'Informe diario de operaciones' },
    semanal: { label: 'Semanal', color: 'green', descripcion: 'Resumen semanal' },
    mensual: { label: 'Mensual', color: 'purple', descripcion: 'Informe mensual completo' },
    especial: { label: 'Especial', color: 'orange', descripcion: 'Informe especial personalizado' },
    ORDENES_ESTADO: { label: 'Estado de Órdenes', color: 'blue', descripcion: 'Estado actual de todas las órdenes' },
    COSTOS_MENSUALES: { label: 'Costos Mensuales', color: 'green', descripcion: 'Resumen de costos del mes' },
    PRODUCTIVIDAD: { label: 'Productividad', color: 'purple', descripcion: 'Análisis de productividad' },
    CLIENTES: { label: 'Clientes', color: 'cyan', descripcion: 'Informe de clientes' },
    TECNICOS: { label: 'Técnicos', color: 'yellow', descripcion: 'Desempeño de técnicos' },
    TENDENCIAS: { label: 'Tendencias', color: 'pink', descripcion: 'Análisis de tendencias' },
    HES: { label: 'HES', color: 'red', descripcion: 'Salud, Entorno y Seguridad' },
    INVENTARIO: { label: 'Inventario', color: 'gray', descripcion: 'Estado del inventario' },
};
