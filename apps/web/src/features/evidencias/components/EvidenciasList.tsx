/**
 * ARCHIVO: EvidenciasList.tsx
 * FUNCION: Contenedor conectado que renderiza lista de evidencias
 * IMPLEMENTACION: Usa hooks SWR para fetch, maneja loading/error/empty states
 * DEPENDENCIAS: EvidenciaCard, use-evidencias hooks
 * EXPORTS: EvidenciasList
 */
import { EvidenciaCard } from './EvidenciaCard';
import { useEvidencias, useDeleteEvidencia } from '../hooks/use-evidencias';

interface EvidenciasListProps {
    ordenId?: string;
    readOnly?: boolean;
}

export function EvidenciasList({ ordenId, readOnly }: EvidenciasListProps) {
    const { data: evidencias, isLoading, error } = useEvidencias(ordenId ? { ordenId } : undefined);
    const { mutate: deleteEvidencia } = useDeleteEvidencia();

    if (isLoading) {
        return (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 animate-pulse">
                {[1, 2, 3, 4].map((i) => (
                    <div key={i} className="aspect-video bg-gray-200 dark:bg-gray-700 rounded-lg" />
                ))}
            </div>
        );
    }

    if (error) {
        return <div className="text-red-500">Error al cargar evidencias</div>;
    }

    if (!evidencias?.length) {
        return (
            <div className="text-center py-8 text-gray-500 border-2 border-dashed rounded-lg">
                <p>No hay evidencias cargadas</p>
            </div>
        );
    }

    const handleDelete = (id: string) => {
        if (confirm('¿Estás seguro de eliminar esta evidencia?')) {
            deleteEvidencia(id);
        }
    };

    const handleView = (url: string) => {
        window.open(url, '_blank');
    };

    return (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {evidencias.map((ev) => (
                <EvidenciaCard
                    key={ev.id}
                    evidencia={ev}
                    onDelete={!readOnly ? handleDelete : undefined}
                    onView={handleView}
                />
            ))}
        </div>
    );
}
