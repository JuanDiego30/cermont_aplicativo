/**
 * @file EvidenciaCardSkeleton.tsx
 * @description Skeleton loader for EvidenciaCard
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
