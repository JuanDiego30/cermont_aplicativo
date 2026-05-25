"use client";

import { useSyncStatus } from "@/lib/offline/use-sync-status";
import { Wifi, WifiOff, RefreshCw, AlertTriangle } from "lucide-react";

export function OfflineBanner() {
	const { isOnline, pendingCount, isSyncing, lastSyncError } = useSyncStatus();

	if (isOnline && pendingCount === 0 && !lastSyncError) {
		return null;
	}

	return (
		<div
			role="alert"
			className={`
				fixed bottom-0 left-0 right-0 z-50 flex items-center gap-3 px-4 py-2 text-sm font-medium shadow-lg
				${isOnline ? (lastSyncError ? "bg-amber-50 text-amber-800 border-t border-amber-200" : "bg-blue-50 text-blue-800 border-t border-blue-200") : "bg-red-50 text-red-800 border-t border-red-200"}
			`}
		>
			{!isOnline ? (
				<WifiOff className="size-4 shrink-0" />
			) : isSyncing ? (
				<RefreshCw className="size-4 shrink-0 animate-spin" />
			) : lastSyncError ? (
				<AlertTriangle className="size-4 shrink-0" />
			) : (
				<Wifi className="size-4 shrink-0" />
			)}

			<span className="flex-1">
				{!isOnline
					? "Sin conexión a internet. Los cambios se sincronizarán automáticamente cuando recuperes conexión."
					: isSyncing
						? "Sincronizando cambios pendientes..."
						: lastSyncError
							? `Error de sincronización: ${lastSyncError}`
							: `${pendingCount} cambio${pendingCount !== 1 ? "s" : ""} pendiente${pendingCount !== 1 ? "s" : ""} de sincronizar`}
			</span>

			{pendingCount > 0 && isOnline && (
				<button
					type="button"
					onClick={() => window.dispatchEvent(new CustomEvent("sync-queue:retry"))}
					className="shrink-0 rounded-full bg-current/10 px-3 py-1 text-xs font-semibold hover:bg-current/20 transition-colors"
				>
					Sincronizar ahora
				</button>
			)}
		</div>
	);
}
