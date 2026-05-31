"use client";

import { AlertTriangle, RefreshCw, Wifi, WifiOff } from "lucide-react";
import { useSyncStatus } from "@/lib/offline/use-sync-status";

interface BannerState {
	isOnline: boolean;
	isSyncing: boolean;
	pendingCount: number;
	lastSyncError: string | null;
}

function getBannerClassName({ isOnline, lastSyncError }: BannerState): string {
	const base =
		"fixed bottom-0 left-0 right-0 z-50 flex items-center gap-3 px-4 py-2 text-sm font-medium shadow-lg";
	if (!isOnline) {
		return `${base} bg-red-50 text-red-800 border-t border-red-200`;
	}
	if (lastSyncError) {
		return `${base} bg-amber-50 text-amber-800 border-t border-amber-200`;
	}
	return `${base} bg-blue-50 text-blue-800 border-t border-blue-200`;
}

function BannerIcon({ isOnline, isSyncing, lastSyncError }: BannerState) {
	if (!isOnline) {
		return <WifiOff className="size-4 shrink-0" />;
	}
	if (isSyncing) {
		return <RefreshCw className="size-4 shrink-0 animate-spin" />;
	}
	if (lastSyncError) {
		return <AlertTriangle className="size-4 shrink-0" />;
	}
	return <Wifi className="size-4 shrink-0" />;
}

function getBannerMessage({
	isOnline,
	isSyncing,
	lastSyncError,
	pendingCount,
}: BannerState): string {
	if (!isOnline) {
		return "Sin conexión a internet. Los cambios se sincronizarán automáticamente cuando recuperes conexión.";
	}
	if (isSyncing) {
		return "Sincronizando cambios pendientes…";
	}
	if (lastSyncError) {
		return `Error de sincronización: ${lastSyncError}`;
	}
	return `${pendingCount} cambio${pendingCount !== 1 ? "s" : ""} pendiente${pendingCount !== 1 ? "s" : ""} de sincronizar`;
}

function shouldShowBanner({ isOnline, pendingCount, lastSyncError }: BannerState): boolean {
	return !(isOnline && pendingCount === 0 && !lastSyncError);
}

export function OfflineBanner() {
	const { isOnline, pendingCount, isSyncing, lastSyncError } = useSyncStatus();
	const state: BannerState = { isOnline, pendingCount, isSyncing, lastSyncError };

	if (!shouldShowBanner(state)) {
		return null;
	}

	return (
		<div role="alert" className={getBannerClassName(state)}>
			<BannerIcon {...state} />

			<span className="flex-1">{getBannerMessage(state)}</span>

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
