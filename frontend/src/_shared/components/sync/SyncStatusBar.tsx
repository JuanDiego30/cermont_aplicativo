"use client";

import { AlertTriangle, CheckCircle2, Loader2, WifiOff } from "lucide-react";
import type { ReactNode } from "react";
import { useEffect, useState } from "react";
import { cn } from "@/_shared/lib/utils";
import { useOfflineSync } from "@/offline-sync/hooks/useOfflineSync";

function formatPendingLabel(count: number): string {
	return `${count} ${count === 1 ? "cambio pendiente" : "cambios pendientes"}`;
}

function formatSyncTime(value: Date | null): string | null {
	if (!value) {
		return null;
	}

	return value.toLocaleTimeString("es-CO", {
		hour: "2-digit",
		minute: "2-digit",
	});
}

type SyncState = "online" | "offline" | "syncing" | "sync_error";

interface SyncStateConfig {
	icon: ReactNode;
	message: string;
	pillClass: string;
}

function getSyncErrorConfig(deadLetterCount: number): SyncStateConfig {
	return {
		icon: <AlertTriangle className="h-4 w-4" aria-hidden="true" />,
		message: `${deadLetterCount} ${deadLetterCount === 1 ? "cambio" : "cambios"} requieren revisión`,
		pillClass:
			"border-rose-500/30 bg-rose-500/15 text-rose-700 dark:border-rose-500/30 dark:bg-rose-500/15 dark:text-rose-200",
	};
}

function getSyncingConfig(pendingCount: number): SyncStateConfig {
	return {
		icon: <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />,
		message:
			pendingCount > 0 ? `Sincronizando · ${formatPendingLabel(pendingCount)}` : "Sincronizando",
		pillClass:
			"border-sky-500/30 bg-sky-500/15 text-sky-700 dark:border-sky-500/30 dark:bg-sky-500/15 dark:text-sky-200",
	};
}

function getOfflineConfig(effectiveIsOnline: boolean, pendingCount: number): SyncStateConfig {
	const message = !effectiveIsOnline
		? pendingCount > 0
			? `Sin conexión · ${formatPendingLabel(pendingCount)}`
			: "Sin conexión"
		: pendingCount > 0
			? `Sincronización pendiente · ${formatPendingLabel(pendingCount)}`
			: "Sincronización pendiente";

	return {
		icon: <WifiOff className="h-4 w-4" aria-hidden="true" />,
		message,
		pillClass:
			"border-amber-500/30 bg-amber-500/15 text-amber-800 dark:border-amber-500/30 dark:bg-amber-500/15 dark:text-amber-200",
	};
}

function getOnlineConfig(pendingCount: number, lastSyncAt: Date | null): SyncStateConfig {
	const lastSyncLabel = formatSyncTime(lastSyncAt);
	const message =
		pendingCount > 0
			? `En línea · ${formatPendingLabel(pendingCount)}`
			: lastSyncLabel
				? `En línea · Última sync ${lastSyncLabel}`
				: "En línea";

	return {
		icon: <CheckCircle2 className="h-4 w-4" aria-hidden="true" />,
		message,
		pillClass:
			"border-emerald-500/30 bg-emerald-500/15 text-emerald-700 dark:border-emerald-500/30 dark:bg-emerald-500/15 dark:text-emerald-200",
	};
}

function getSyncStateConfig(
	state: SyncState,
	deadLetterCount: number,
	pendingCount: number,
	effectiveIsOnline: boolean,
	lastSyncAt: Date | null,
): SyncStateConfig {
	switch (state) {
		case "sync_error":
			return getSyncErrorConfig(deadLetterCount);
		case "syncing":
			return getSyncingConfig(pendingCount);
		case "offline":
			return getOfflineConfig(effectiveIsOnline, pendingCount);
		default:
			return getOnlineConfig(pendingCount, lastSyncAt);
	}
}

function determineSyncState(
	deadLetterCount: number,
	status: string,
	effectiveIsOnline: boolean,
): SyncState {
	if (deadLetterCount > 0) {
		return "sync_error";
	}
	if (status === "syncing") {
		return "syncing";
	}
	if (!effectiveIsOnline || status === "error") {
		return "offline";
	}
	return "online";
}

export function SyncStatusBar() {
	const { isOnline, queueLength, failedCount, isSyncing, lastSyncAt } = useOfflineSync();
	const [mounted, setMounted] = useState(false);

	useEffect(() => {
		setMounted(true);
	}, []);

	const effectiveIsOnline = mounted ? isOnline : true;
	const status = isSyncing ? "syncing" : effectiveIsOnline ? "online" : "offline";
	const state = determineSyncState(failedCount, status, effectiveIsOnline);
	const config = getSyncStateConfig(state, failedCount, queueLength, effectiveIsOnline, lastSyncAt);

	if (state === "online" && queueLength === 0) {
		return null;
	}

	return (
		<div className="pointer-events-none fixed inset-x-0 bottom-[calc(5rem+env(safe-area-inset-bottom))] z-50 flex justify-end px-4 sm:bottom-6 sm:px-6">
			<div
				role="status"
				aria-live="polite"
				data-state={state}
				className={cn(
					"pointer-events-none inline-flex max-w-[calc(100vw-2rem)] items-center gap-2 rounded-full border px-3 py-2 text-sm font-medium shadow-lg backdrop-blur-md transition-colors",
					config.pillClass,
				)}
			>
				{config.icon}
				<span className="truncate">{config.message}</span>
			</div>
		</div>
	);
}
