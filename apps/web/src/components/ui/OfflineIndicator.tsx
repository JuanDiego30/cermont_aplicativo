/**
 * ARCHIVO: OfflineIndicator.tsx
 * FUNCION: Indicadores visuales de estado offline y sincronización pendiente
 * IMPLEMENTACION: Hook useOfflineIndicator para estado, iconos dinámicos según conexión/sync
 * DEPENDENCIAS: react, @/lib/useOfflineSync, lucide-react
 * EXPORTS: OfflineIndicator, OfflineBadge
 */
"use client";
import React from "react";
import { useOfflineIndicator } from "@/lib/useOfflineSync";
import { WifiOff, RefreshCw, CloudOff, Cloud } from "lucide-react";

export function OfflineIndicator() {
    const { isOnline, pendingCount, isSyncing, showIndicator } = useOfflineIndicator();

    if (!showIndicator) return null;

    return (
        <div
            className={`fixed bottom-4 right-4 z-50 flex items-center gap-3 px-4 py-3 rounded-xl shadow-lg transition-all duration-300 ${isOnline
                    ? "bg-amber-50 border border-amber-200 text-amber-800 dark:bg-amber-900/30 dark:border-amber-700 dark:text-amber-200"
                    : "bg-red-50 border border-red-200 text-red-800 dark:bg-red-900/30 dark:border-red-700 dark:text-red-200"
                }`}
        >
            {/* Icon */}
            <div className="flex items-center justify-center">
                {!isOnline ? (
                    <WifiOff className="w-5 h-5 text-red-500" />
                ) : isSyncing ? (
                    <RefreshCw className="w-5 h-5 animate-spin text-amber-500" />
                ) : (
                    <CloudOff className="w-5 h-5 text-amber-500" />
                )}
            </div>

            {/* Text */}
            <div className="text-sm font-medium">
                {!isOnline ? (
                    <span>Sin conexión</span>
                ) : isSyncing ? (
                    <span>Sincronizando...</span>
                ) : (
                    <span>{pendingCount} pendiente{pendingCount !== 1 ? "s" : ""}</span>
                )}
            </div>

            {/* Status dot */}
            <div
                className={`w-2 h-2 rounded-full ${isOnline ? "bg-amber-400 animate-pulse" : "bg-red-400"
                    }`}
            />
        </div>
    );
}

/**
 * Compact offline badge for header
 */
export function OfflineBadge() {
    const { isOnline, pendingCount } = useOfflineIndicator();

    if (isOnline && pendingCount === 0) {
        return (
            <span className="inline-flex items-center gap-1.5 px-2 py-1 text-xs font-medium text-green-700 bg-green-100 rounded-full dark:bg-green-900/30 dark:text-green-300">
                <Cloud className="w-3 h-3" />
                Conectado
            </span>
        );
    }

    return (
        <span
            className={`inline-flex items-center gap-1.5 px-2 py-1 text-xs font-medium rounded-full ${isOnline
                    ? "text-amber-700 bg-amber-100 dark:bg-amber-900/30 dark:text-amber-300"
                    : "text-red-700 bg-red-100 dark:bg-red-900/30 dark:text-red-300"
                }`}
        >
            {isOnline ? (
                <>
                    <CloudOff className="w-3 h-3" />
                    {pendingCount} pendiente{pendingCount !== 1 ? "s" : ""}
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
