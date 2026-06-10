"use client";

import { AlertTriangle, CheckCircle2, RefreshCw, WifiOff } from "lucide-react";
import { useSyncStatus } from "@/lib/offline/use-sync-status";

export function OfflineBanner() {
	const { isOnline, pendingCount, isSyncing, lastSyncError } = useSyncStatus();

	// When everything is fine, render nothing
	if (isOnline && pendingCount === 0 && !lastSyncError) {
		return null;
	}

	return (
		<div className="motion-card fixed bottom-4 right-4 z-50 flex items-center gap-2.5 rounded-full border border-border-default bg-background px-4 py-2 shadow-[var(--shadow-3)]">
			{!isOnline ? (
				<WifiOff className="size-3.5 shrink-0 text-red-500" />
			) : isSyncing ? (
				<RefreshCw className="size-3.5 shrink-0 animate-spin text-[var(--color-cermont-blue)]" />
			) : lastSyncError ? (
				<AlertTriangle className="size-3.5 shrink-0 text-amber-500" />
			) : (
				<CheckCircle2 className="size-3.5 shrink-0 text-[var(--color-cermont-green)]" />
			)}

			<span className="whitespace-nowrap text-[11px] font-medium text-foreground">
				{!isOnline
					? "Sin conexión"
					: isSyncing
						? "Sincronizando…"
						: lastSyncError
							? "Error de sincronización"
							: `${pendingCount} pendiente${pendingCount !== 1 ? "s" : ""}`}
			</span>

			{!isOnline && (
				<button
					type="button"
					onClick={() => window.dispatchEvent(new Event("sync-queue:changed"))}
					className="rounded-full bg-[var(--color-cermont-blue)]/10 px-2 py-0.5 text-[10px] font-semibold text-[var(--color-cermont-blue)] hover:bg-[var(--color-cermont-blue)]/20"
				>
					Reintentar
				</button>
			)}
		</div>
	);
}
