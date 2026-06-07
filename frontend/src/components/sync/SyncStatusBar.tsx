"use client";

import { AlertTriangle, CheckCircle2, Loader2, WifiOff } from "lucide-react";
import type { ReactNode } from "react";
import { useSyncStatus } from "@/lib/offline/use-sync-status";
import { cn } from "@/lib/utils";
import { useOfflineStore } from "@/store/offline.store";

type SyncStatusState = "online" | "offline" | "syncing" | "sync_error";

interface SyncStatusView {
	state: SyncStatusState;
	icon: ReactNode;
	message: string;
	pillClass: string;
}

const SYNC_STATUS_CLASSES: Record<SyncStatusState, string> = {
	online:
		"border-emerald-500/30 bg-emerald-500/15 text-emerald-700 dark:border-emerald-500/30 dark:bg-emerald-500/15 dark:text-emerald-200",
	offline:
		"border-amber-500/30 bg-amber-500/15 text-amber-800 dark:border-amber-500/30 dark:bg-amber-500/15 dark:text-amber-200",
	syncing:
		"border-sky-500/30 bg-sky-500/15 text-sky-700 dark:border-sky-500/30 dark:bg-sky-500/15 dark:text-sky-200",
	sync_error:
		"border-rose-500/30 bg-rose-500/15 text-rose-700 dark:border-rose-500/30 dark:bg-rose-500/15 dark:text-rose-200",
};

function formatPendingLabel(count: number): string {
	return `${count} ${count === 1 ? "cambio pendiente" : "cambios pendientes"}`;
}

function getOfflineMessage(effectiveIsOnline: boolean, pendingCount: number): string {
	if (!effectiveIsOnline) {
		return pendingCount > 0 ? `Sin conexión · ${formatPendingLabel(pendingCount)}` : "Sin conexión";
	}
	return pendingCount > 0
		? `Sincronización pendiente · ${formatPendingLabel(pendingCount)}`
		: "Sincronización pendiente";
}

function getSyncStatusView(
	effectiveIsOnline: boolean,
	status: string,
	pendingCount: number,
	deadLetterCount: number,
): SyncStatusView {
	if (deadLetterCount > 0) {
		return {
			state: "sync_error",
			icon: <AlertTriangle className="size-4" aria-hidden="true" />,
			message: `${deadLetterCount} ${deadLetterCount === 1 ? "cambio" : "cambios"} requieren revisión`,
			pillClass: SYNC_STATUS_CLASSES.sync_error,
		};
	}

	if (status === "syncing") {
		return {
			state: "syncing",
			icon: <Loader2 className="size-4 animate-spin" aria-hidden="true" />,
			message:
				pendingCount > 0 ? `Sincronizando · ${formatPendingLabel(pendingCount)}` : "Sincronizando",
			pillClass: SYNC_STATUS_CLASSES.syncing,
		};
	}

	if (!effectiveIsOnline || status === "error") {
		return {
			state: "offline",
			icon: <WifiOff className="size-4" aria-hidden="true" />,
			message: getOfflineMessage(effectiveIsOnline, pendingCount),
			pillClass: SYNC_STATUS_CLASSES.offline,
		};
	}

	return {
		state: "online",
		icon: <CheckCircle2 className="size-4" aria-hidden="true" />,
		message: pendingCount > 0 ? `En línea · ${formatPendingLabel(pendingCount)}` : "En línea",
		pillClass: SYNC_STATUS_CLASSES.online,
	};
}

export function SyncStatusBar() {
	const { isOnline, pendingCount, isSyncing, lastSyncError } = useSyncStatus();
	const deadLetterCount = useOfflineStore((state) => state.failedCount);
	const status = isSyncing ? "syncing" : lastSyncError ? "error" : "idle";

	const { state, icon, message, pillClass } = getSyncStatusView(
		isOnline,
		status,
		pendingCount,
		deadLetterCount,
	);

	return (
		<div className="pointer-events-none fixed inset-x-0 top-0 z-50 flex justify-end px-4 pt-4 sm:px-6">
			<output
				aria-live="polite"
				data-state={state}
				className={cn(
					"pointer-events-none inline-flex max-w-[calc(100vw-2rem)] items-center gap-2 rounded-full border px-3 py-2 text-sm font-medium shadow-lg backdrop-blur-md transition-colors",
					pillClass,
				)}
			>
				{icon}
				<span className="truncate">{message}</span>
			</output>
		</div>
	);
}
