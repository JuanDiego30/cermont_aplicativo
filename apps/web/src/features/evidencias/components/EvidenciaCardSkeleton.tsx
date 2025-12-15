/**
 * ARCHIVO: EvidenciaCardSkeleton.tsx
 * FUNCION: Skeleton loader para estados de carga de EvidenciaCard
 * IMPLEMENTACION: Divs animados con pulse que simulan la estructura del card
 * DEPENDENCIAS: Tailwind CSS (animate-pulse)
 * EXPORTS: EvidenciaCardSkeleton
 */
export function EvidenciaCardSkeleton() {
    return (
        <div className="rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden animate-pulse">
            <div className="aspect-video bg-gray-200 dark:bg-gray-700" />
            <div className="p-3 space-y-2">
                <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4" />
                <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-1/4" />
            </div>
        </div>
    );
}
