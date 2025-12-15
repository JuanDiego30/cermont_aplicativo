/**
 * ARCHIVO: MantenimientoCardSkeleton.tsx
 * FUNCION: Skeleton loader para MantenimientoCard durante estados de carga
 * IMPLEMENTACION: Divs con animate-pulse y colores de placeholder
 * DEPENDENCIAS: Tailwind CSS
 * EXPORTS: MantenimientoCardSkeleton
 */
export function MantenimientoCardSkeleton() {
    return (
        <div className="p-4 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 animate-pulse">
            <div className="flex justify-between items-start mb-2">
                <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-20" />
                <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-16" />
            </div>
            <div className="mb-2 space-y-2">
                <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-24" />
                <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-32" />
            </div>
            <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-full mt-2" />
            <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-2/3 mt-1" />
        </div>
    );
}
