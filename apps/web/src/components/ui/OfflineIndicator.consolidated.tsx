/**
 * @file OfflineIndicator.consolidated.tsx
 * @description Componente consolidado de indicador offline
 * 
 * PROBLEMA RESUELTO:
 * Había 3 versiones diferentes de OfflineIndicator:
 * - ui/OfflineIndicator.tsx
 * - offline/OfflineIndicator.tsx  
 * - offline/offline-indicator.tsx
 * 
 * Este archivo combina las mejores características de cada uno.
 * 
 * INSTRUCCIONES DE MIGRACIÓN:
 * 1. Renombrar este archivo a components/ui/OfflineIndicator.tsx
 * 2. Eliminar los otros archivos duplicados
 * 3. Actualizar imports en toda la aplicación
 */
'use client';

import React, { useEffect, useState, useCallback } from 'react';
import { useOffline } from '@/hooks/use-offline';
import { cn } from '@/lib/cn';
import { 
    WifiOff, 
    Wifi, 
    CloudOff, 
    Cloud, 
    RefreshCw, 
    AlertCircle,
    CloudUpload 
} from 'lucide-react';

// ============================================================================
// TIPOS
// ============================================================================

export type IndicatorPosition = 'bottom-right' | 'bottom-left' | 'top-right' | 'top-left';
export type IndicatorVariant = 'full' | 'compact' | 'minimal';

export interface OfflineIndicatorProps {
    /** Posición del indicador */
    position?: IndicatorPosition;
    /** Variante de visualización */
    variant?: IndicatorVariant;
    /** Clases CSS adicionales */
    className?: string;
    /** Mostrar siempre (incluso online sin pendientes) */
    alwaysShow?: boolean;
    /** Callback cuando se hace clic en sincronizar */
    onSyncClick?: () => void;
}

// ============================================================================
// ESTILOS DE POSICIÓN
// ============================================================================

const positionClasses: Record<IndicatorPosition, string> = {
    'bottom-right': 'bottom-4 right-4',
    'bottom-left': 'bottom-4 left-4',
    'top-right': 'top-20 right-4', // Debajo del header
    'top-left': 'top-20 left-4',
};

// ============================================================================
// COMPONENTE PRINCIPAL
// ============================================================================

export function OfflineIndicator({
    position = 'bottom-right',
    variant = 'full',
    className,
    alwaysShow = false,
    onSyncClick,
}: OfflineIndicatorProps) {
    const {
        isOnline,
        isSyncing,
        pendingItems,
        syncError,
        lastSync,
        progress,
        manualSync,
    } = useOffline();

    // Estado local para mostrar mensaje temporal "Conexión restablecida"
    const [showReconnected, setShowReconnected] = useState(false);

    // Detectar reconexión
    useEffect(() => {
        const handleOnline = () => {
            setShowReconnected(true);
            setTimeout(() => setShowReconnected(false), 3000);
        };

        window.addEventListener('online', handleOnline);
        return () => window.removeEventListener('online', handleOnline);
    }, []);

    // Determinar si mostrar el indicador
    const shouldShow = alwaysShow || 
        !isOnline || 
        pendingItems > 0 || 
        isSyncing || 
        syncError || 
        showReconnected;

    if (!shouldShow) return null;

    // Handler de sincronización
    const handleSync = useCallback(() => {
        if (onSyncClick) {
            onSyncClick();
        } else if (manualSync) {
            manualSync();
        }
    }, [onSyncClick, manualSync]);

    // Renderizar según variante
    if (variant === 'minimal') {
        return (
            <MinimalIndicator 
                isOnline={isOnline} 
                pendingItems={pendingItems}
                position={position}
                className={className}
            />
        );
    }

    if (variant === 'compact') {
        return (
            <CompactIndicator
                isOnline={isOnline}
                isSyncing={isSyncing}
                pendingItems={pendingItems}
                syncError={syncError}
                position={position}
                className={className}
            />
        );
    }

    // Variante full
    return (
        <div
            className={cn(
                'fixed z-50 p-4 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700',
                'rounded-lg shadow-lg max-w-xs transition-all duration-300',
                positionClasses[position],
                className
            )}
        >
            {/* Estado Online/Reconectado */}
            {isOnline && showReconnected && (
                <StatusBanner
                    icon={<Wifi className="w-4 h-4" />}
                    message="Conexión restablecida"
                    variant="success"
                />
            )}

            {/* Estado Online normal */}
            {isOnline && !showReconnected && !syncError && pendingItems === 0 && alwaysShow && (
                <StatusBanner
                    icon={<Cloud className="w-4 h-4" />}
                    message="Conectado"
                    variant="success"
                />
            )}

            {/* Estado Offline */}
            {!isOnline && (
                <StatusBanner
                    icon={<WifiOff className="w-4 h-4" />}
                    message="Modo offline. Los cambios se sincronizarán cuando estés conectado."
                    variant="warning"
                />
            )}

            {/* Items pendientes */}
            {pendingItems > 0 && (
                <StatusBanner
                    icon={<CloudUpload className="w-4 h-4" />}
                    message={`${pendingItems} cambio${pendingItems > 1 ? 's' : ''} pendiente${pendingItems > 1 ? 's' : ''}`}
                    variant="info"
                />
            )}

            {/* Error de sincronización */}
            {syncError && (
                <StatusBanner
                    icon={<AlertCircle className="w-4 h-4" />}
                    message={`Error: ${syncError}`}
                    variant="error"
                />
            )}

            {/* Progreso de sincronización */}
            {isSyncing && progress && (
                <div className="mt-3">
                    <div className="flex items-center justify-between text-sm text-gray-600 dark:text-gray-400 mb-1">
                        <span>Sincronizando...</span>
                        <span>{progress.current}/{progress.total}</span>
                    </div>
                    <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                        <div
                            className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                            style={{ width: `${(progress.current / progress.total) * 100}%` }}
                        />
                    </div>
                </div>
            )}

            {/* Botón de sincronización manual */}
            {isOnline && pendingItems > 0 && !isSyncing && (
                <button
                    onClick={handleSync}
                    className="mt-3 w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium flex items-center justify-center gap-2"
                >
                    <RefreshCw className="w-4 h-4" />
                    Sincronizar ahora
                </button>
            )}

            {/* Última sincronización */}
            {lastSync && !isSyncing && pendingItems === 0 && (
                <p className="mt-2 text-xs text-gray-500 dark:text-gray-400">
                    Última sincronización: {formatRelativeTime(lastSync)}
                </p>
            )}
        </div>
    );
}

// ============================================================================
// SUB-COMPONENTES
// ============================================================================

interface StatusBannerProps {
    icon: React.ReactNode;
    message: string;
    variant: 'success' | 'warning' | 'error' | 'info';
}

function StatusBanner({ icon, message, variant }: StatusBannerProps) {
    const variants = {
        success: 'bg-emerald-50 dark:bg-emerald-900/20 border-emerald-400 dark:border-emerald-600 text-emerald-800 dark:text-emerald-200',
        warning: 'bg-yellow-50 dark:bg-yellow-900/20 border-yellow-400 dark:border-yellow-600 text-yellow-800 dark:text-yellow-200',
        error: 'bg-red-50 dark:bg-red-900/20 border-red-400 dark:border-red-600 text-red-800 dark:text-red-200',
        info: 'bg-blue-50 dark:bg-blue-900/20 border-blue-400 dark:border-blue-600 text-blue-800 dark:text-blue-200',
    };

    return (
        <div className={cn('mb-3 p-2 border rounded text-sm flex items-center gap-2', variants[variant])}>
            <span className="shrink-0">{icon}</span>
            <span>{message}</span>
        </div>
    );
}

function MinimalIndicator({ 
    isOnline, 
    pendingItems,
    position,
    className,
}: {
    isOnline: boolean;
    pendingItems: number;
    position: IndicatorPosition;
    className?: string;
}) {
    return (
        <div
            className={cn(
                'fixed z-50 w-3 h-3 rounded-full transition-all duration-300',
                positionClasses[position],
                isOnline 
                    ? pendingItems > 0 
                        ? 'bg-amber-400 animate-pulse' 
                        : 'bg-green-400'
                    : 'bg-red-400 animate-pulse',
                className
            )}
            title={isOnline ? `${pendingItems} pendientes` : 'Sin conexión'}
        />
    );
}

function CompactIndicator({
    isOnline,
    isSyncing,
    pendingItems,
    syncError,
    position,
    className,
}: {
    isOnline: boolean;
    isSyncing: boolean;
    pendingItems: number;
    syncError: string | null;
    position: IndicatorPosition;
    className?: string;
}) {
    const getIcon = () => {
        if (!isOnline) return <WifiOff className="w-5 h-5 text-red-500" />;
        if (isSyncing) return <RefreshCw className="w-5 h-5 animate-spin text-amber-500" />;
        if (syncError) return <AlertCircle className="w-5 h-5 text-red-500" />;
        if (pendingItems > 0) return <CloudOff className="w-5 h-5 text-amber-500" />;
        return <Cloud className="w-5 h-5 text-green-500" />;
    };

    const getMessage = () => {
        if (!isOnline) return 'Sin conexión';
        if (isSyncing) return 'Sincronizando...';
        if (syncError) return 'Error';
        if (pendingItems > 0) return `${pendingItems} pendiente${pendingItems !== 1 ? 's' : ''}`;
        return 'Conectado';
    };

    const bgColor = !isOnline || syncError
        ? 'bg-red-50 border-red-200 text-red-800 dark:bg-red-900/30 dark:border-red-700 dark:text-red-200'
        : pendingItems > 0 || isSyncing
            ? 'bg-amber-50 border-amber-200 text-amber-800 dark:bg-amber-900/30 dark:border-amber-700 dark:text-amber-200'
            : 'bg-green-50 border-green-200 text-green-800 dark:bg-green-900/30 dark:border-green-700 dark:text-green-200';

    return (
        <div
            className={cn(
                'fixed z-50 flex items-center gap-3 px-4 py-3 rounded-xl shadow-lg transition-all duration-300 border',
                positionClasses[position],
                bgColor,
                className
            )}
        >
            {getIcon()}
            <span className="text-sm font-medium">{getMessage()}</span>
            <div
                className={cn(
                    'w-2 h-2 rounded-full',
                    isOnline && !syncError ? 'bg-green-400' : 'bg-red-400',
                    (isSyncing || !isOnline) && 'animate-pulse'
                )}
            />
        </div>
    );
}

// ============================================================================
// COMPONENTE BADGE PARA HEADER
// ============================================================================

export function OfflineBadge({ className }: { className?: string }) {
    const { isOnline, pendingItems, isSyncing } = useOffline();

    if (isOnline && pendingItems === 0 && !isSyncing) {
        return (
            <span className={cn(
                'inline-flex items-center gap-1.5 px-2 py-1 text-xs font-medium',
                'text-green-700 bg-green-100 rounded-full',
                'dark:bg-green-900/30 dark:text-green-300',
                className
            )}>
                <Cloud className="w-3 h-3" />
                Conectado
            </span>
        );
    }

    return (
        <span
            className={cn(
                'inline-flex items-center gap-1.5 px-2 py-1 text-xs font-medium rounded-full',
                isOnline
                    ? 'text-amber-700 bg-amber-100 dark:bg-amber-900/30 dark:text-amber-300'
                    : 'text-red-700 bg-red-100 dark:bg-red-900/30 dark:text-red-300',
                className
            )}
        >
            {isSyncing ? (
                <>
                    <RefreshCw className="w-3 h-3 animate-spin" />
                    Sincronizando
                </>
            ) : isOnline ? (
                <>
                    <CloudOff className="w-3 h-3" />
                    {pendingItems} pendiente{pendingItems !== 1 ? 's' : ''}
                </>
            ) : (
                <>
                    <WifiOff className="w-3 h-3" />
                    Offline
                </>
            )}
        </span>
    );
}

// ============================================================================
// UTILIDADES
// ============================================================================

function formatRelativeTime(date: Date): string {
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffSecs = Math.floor(diffMs / 1000);
    const diffMins = Math.floor(diffSecs / 60);
    const diffHours = Math.floor(diffMins / 60);

    if (diffSecs < 60) return 'Hace un momento';
    if (diffMins < 60) return `Hace ${diffMins} min`;
    if (diffHours < 24) return `Hace ${diffHours}h`;
    return date.toLocaleDateString();
}

// ============================================================================
// EXPORTS
// ============================================================================

export default OfflineIndicator;
