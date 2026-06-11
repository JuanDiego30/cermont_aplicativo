"use client";

import { useSyncStatus } from "@/lib/offline/use-sync-status";

export function OfflineBanner() {
	const { isOnline, pendingCount, isSyncing, lastSyncError } = useSyncStatus();

	// When everything is fine, render nothing
	if (isOnline && pendingCount === 0 && !lastSyncError) {
		return null;
	}

	const color = !isOnline
		? "bg-red-500"
		: isSyncing
			? "bg-[var(--color-cermont-blue)]"
			: lastSyncError
				? "bg-amber-500"
				: "bg-[var(--color-cermont-green)]";

	return (
		<div
			className="fixed bottom-4 right-4 z-50 flex items-center gap-2 rounded-full bg-background/80 px-3 py-1.5 shadow-[var(--shadow-2)] backdrop-blur-sm"
			title={
				!isOnline
					? "Sin conexión"
					: isSyncing
						? "Sincronizando…"
						: lastSyncError
							? `Error: ${lastSyncError}`
							: `${pendingCount} pendiente${pendingCount !== 1 ? "s" : ""}`
			}
		>
			<span className={`inline-block size-2 rounded-full ${color}`} />
			<span className="text-[10px] font-medium text-foreground/70">
				{!isOnline ? "Offline" : isSyncing ? "Sync…" : lastSyncError ? "Error" : `${pendingCount}`}
			</span>
		</div>
	);
}
