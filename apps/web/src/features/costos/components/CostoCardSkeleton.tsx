/**
 * @file CostoCardSkeleton.tsx
 * @description Skeleton loader for CostoCard
 */

export function CostoCardSkeleton() {
    return (
        <div className="p-4 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 animate-pulse">
            <div className="flex justify-between items-start mb-3">
                <div>
                    <div className="h-3 w-16 bg-gray-200 dark:bg-gray-700 rounded mb-2" />
                    <div className="h-5 w-32 bg-gray-200 dark:bg-gray-700 rounded" />
                </div>
                <div className="h-5 w-16 bg-gray-200 dark:bg-gray-700 rounded-full" />
            </div>
            <div className="flex justify-between items-end mt-4">
                <div>
                    <div className="h-3 w-12 bg-gray-200 dark:bg-gray-700 rounded mb-1" />
                    <div className="h-6 w-24 bg-gray-200 dark:bg-gray-700 rounded" />
                </div>
                <div className="h-3 w-20 bg-gray-200 dark:bg-gray-700 rounded" />
            </div>
        </div>
    );
}
