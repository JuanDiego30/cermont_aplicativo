'use client';

/**
 * ARCHIVO: HeaderConnectionIndicator.tsx
 * FUNCION: Indicador compacto de conexión para el header
 * IMPLEMENTACION: Botón pequeño con icono wifi, verde=online, rojo=offline
 */

import { useState } from 'react';
import { useOffline } from '@/hooks/use-offline';
import { cn } from '@/lib/cn';
import { Wifi, WifiOff, RefreshCw, AlertCircle, X } from 'lucide-react';

export function HeaderConnectionIndicator() {
    const {
        isOnline,
        isSyncing,
        pendingItems,
        syncError,
        lastSync,
        progress,
        manualSync
    } = useOffline();

    const [showPopover, setShowPopover] = useState(false);

    // Determine status color
    const getStatusColor = () => {
        if (syncError) return 'text-red-500';
        if (!isOnline) return 'text-amber-500';
        if (isSyncing) return 'text-blue-500';
        return 'text-emerald-500';
    };

    const getStatusBg = () => {
        if (syncError) return 'bg-red-500';
        if (!isOnline) return 'bg-amber-500';
        if (isSyncing) return 'bg-blue-500';
        return 'bg-emerald-500';
    };

    const formatRelativeTime = (date: Date): string => {
        const now = new Date();
        const diffMs = now.getTime() - date.getTime();
        const diffMins = Math.floor(diffMs / 60000);
        if (diffMins < 1) return 'hace un momento';
        if (diffMins < 60) return `hace ${diffMins} min`;
        const diffHours = Math.floor(diffMins / 60);
        if (diffHours < 24) return `hace ${diffHours}h`;
        return date.toLocaleDateString();
    };

    return (
        <div className="relative">
            {/* Compact Button */}
            <button
                onClick={() => setShowPopover(!showPopover)}
                className={cn(
                    'flex h-10 w-10 items-center justify-center rounded-lg',
                    'border border-gray-200 bg-white',
                    'dark:border-gray-800 dark:bg-gray-900',
                    'hover:bg-gray-100 dark:hover:bg-gray-800',
                    'transition-colors relative'
                )}
                title={isOnline ? 'Conectado' : 'Sin conexión'}
            >
                {/* Icon */}
                {isSyncing ? (
                    <RefreshCw className={cn('h-5 w-5 animate-spin', getStatusColor())} />
                ) : isOnline ? (
                    <Wifi className={cn('h-5 w-5', getStatusColor())} />
                ) : (
                    <WifiOff className={cn('h-5 w-5', getStatusColor())} />
                )}

                {/* Status dot */}
                <span
                    className={cn(
                        'absolute top-1 right-1 h-2.5 w-2.5 rounded-full ring-2 ring-white dark:ring-gray-900',
                        getStatusBg(),
                        isSyncing && 'animate-pulse'
                    )}
                />

                {/* Pending badge */}
                {pendingItems > 0 && !isSyncing && (
                    <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-blue-600 text-[9px] font-bold text-white">
                        {pendingItems > 9 ? '9+' : pendingItems}
                    </span>
                )}
            </button>

            {/* Popover */}
            {showPopover && (
                <>
                    {/* Backdrop */}
                    <div
                        className="fixed inset-0 z-40"
                        onClick={() => setShowPopover(false)}
                    />

                    {/* Popover Content */}
                    <div className="absolute right-0 mt-2 w-72 rounded-xl border border-gray-200 bg-white p-4 shadow-xl dark:border-gray-800 dark:bg-gray-900 z-50">
                        {/* Header */}
                        <div className="flex items-center justify-between mb-3">
                            <div className="flex items-center gap-2">
                                <span className={cn('h-2.5 w-2.5 rounded-full', getStatusBg(), isSyncing && 'animate-pulse')} />
                                <span className="text-sm font-medium text-gray-900 dark:text-white">
                                    {syncError
                                        ? 'Error de conexión'
                                        : !isOnline
                                            ? 'Sin conexión'
                                            : isSyncing
                                                ? 'Sincronizando...'
                                                : 'Conectado'
                                    }
                                </span>
                            </div>
                            <button
                                onClick={() => setShowPopover(false)}
                                className="p-1 rounded hover:bg-gray-100 dark:hover:bg-gray-800"
                            >
                                <X className="w-4 h-4 text-gray-400" />
                            </button>
                        </div>

                        {/* Sync Error */}
                        {syncError && (
                            <div className="flex items-center gap-2 p-2 mb-3 text-xs text-red-600 bg-red-50 dark:bg-red-900/20 rounded-lg">
                                <AlertCircle className="w-4 h-4 shrink-0" />
                                <span className="line-clamp-2">{syncError}</span>
                            </div>
                        )}

                        {/* Pending Items */}
                        {pendingItems > 0 && (
                            <div className="flex items-center justify-between py-2 border-b border-gray-100 dark:border-gray-800">
                                <span className="text-sm text-gray-600 dark:text-gray-400">
                                    Cambios pendientes
                                </span>
                                <span className="text-sm font-medium text-gray-900 dark:text-white">
                                    {pendingItems}
                                </span>
                            </div>
                        )}

                        {/* Sync Progress */}
                        {isSyncing && progress && (
                            <div className="py-2 border-b border-gray-100 dark:border-gray-800">
                                <div className="flex justify-between text-xs text-gray-500 mb-1">
                                    <span>Progreso</span>
                                    <span>{progress.current}/{progress.total}</span>
                                </div>
                                <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-1.5">
                                    <div
                                        className="bg-blue-600 h-1.5 rounded-full transition-all duration-300"
                                        style={{ width: `${(progress.current / progress.total) * 100}%` }}
                                    />
                                </div>
                            </div>
                        )}

                        {/* Last Sync */}
                        {lastSync && (
                            <div className="flex items-center justify-between py-2">
                                <span className="text-xs text-gray-500">Última sincronización</span>
                                <span className="text-xs text-gray-700 dark:text-gray-300">
                                    {formatRelativeTime(lastSync)}
                                </span>
                            </div>
                        )}

                        {/* Sync Button */}
                        {pendingItems > 0 && !isSyncing && isOnline && (
                            <button
                                onClick={() => {
                                    manualSync();
                                    setShowPopover(false);
                                }}
                                className="w-full mt-3 px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors flex items-center justify-center gap-2"
                            >
                                <RefreshCw className="w-4 h-4" />
                                Sincronizar ahora
                            </button>
                        )}
                    </div>
                </>
            )}
        </div>
    );
}

export default HeaderConnectionIndicator;
