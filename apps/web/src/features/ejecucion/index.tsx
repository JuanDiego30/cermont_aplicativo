/**
 * ARCHIVO: index.tsx
 * FUNCION: Barrel export y stubs para el módulo de ejecución
 * IMPLEMENTACION: Re-exporta API, hooks y componentes; provee stubs de compatibilidad
 * DEPENDENCIAS: ejecucion.api, use-ejecucion, ResumenEjecucion, TaskList
 * EXPORTS: API, hooks, componentes y stubs (EjecucionCard, useMisEjecuciones, etc.)
 */
export * from './api/ejecucion.api';
export * from './hooks/use-ejecucion';
export * from './components/ResumenEjecucion';
export * from './components/TaskList';

// EjecucionCard stub with proper props
interface EjecucionCardProps {
    ejecucion: { id: string; estado: string;[key: string]: unknown };
    onPause?: () => void;
    onResume?: () => void;
    onFinish?: () => void;
    onView?: () => void;
}
export const EjecucionCard = (_props: EjecucionCardProps) => null;
export const EjecucionCardSkeleton = () => null;

// Stub hooks for ejecucion operations
export const useMisEjecuciones = () => ({
    data: [] as { id: string; estado: string }[],
    isLoading: false,
    isError: false,
    error: null,
});

export const usePausarEjecucion = () => ({
    mutate: (_data: { id: string; motivo?: string }) => { },
    isPending: false,
    isLoading: false,
});

export const useReanudarEjecucion = () => ({
    mutate: (_id: string) => { },
    isPending: false,
    isLoading: false,
});

export const useFinalizarEjecucion = () => ({
    mutate: (_id: string, _data?: unknown) => { },
    isPending: false,
    isLoading: false,
});
