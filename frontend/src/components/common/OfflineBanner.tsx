"use client";

import Link from "next/link";
import { useSyncStatus } from "@/lib/offline/use-sync-status";
import { APP_ROUTES } from "@/lib/routes";

export function OfflineBanner() {
	const { isOnline, pendingCount, failedCount, conflictCount, isSyncing, lastSyncError } =
		useSyncStatus();
	const alertCount = failedCount + conflictCount;

	// When everything is fine, render nothing
	if (isOnline && pendingCount === 0 && alertCount === 0 && !lastSyncError) {
		return null;
	}

	const color = !isOnline
		? "bg-red-500"
		: alertCount > 0 || lastSyncError
			? "bg-amber-500"
			: isSyncing
				? "bg-[var(--color-cermont-blue)]"
				: "bg-[var(--color-cermont-green)]";

	return (
		<Link
			href={APP_ROUTES.offlineSync}
			data-testid="offline-banner"
			className="fixed bottom-4 right-4 z-50 flex items-center gap-2 rounded-full bg-background/80 px-3 py-1.5 shadow-[var(--shadow-2)] backdrop-blur-sm"
			title={
				!isOnline
					? "Sin conexión"
					: alertCount > 0
						? `${alertCount} registro${alertCount === 1 ? "" : "s"} por revisar`
						: isSyncing
							? "Sincronizando…"
							: lastSyncError
								? `Error: ${lastSyncError}`
								: `${pendingCount} pendiente${pendingCount !== 1 ? "s" : ""}`
			}
		>
			<span className={`inline-block size-2 rounded-full ${color}`} />
			<span className="text-[10px] font-medium text-foreground/70">
				{!isOnline
					? "Offline"
					: alertCount > 0
						? `${alertCount} alerta${alertCount === 1 ? "" : "s"}`
						: isSyncing
							? "Sync…"
							: lastSyncError
								? "Error"
								: `${pendingCount}`}
			</span>
		</Link>
	);
}
