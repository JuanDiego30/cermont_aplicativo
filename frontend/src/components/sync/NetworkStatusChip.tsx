"use client";

import { AlertTriangle, Loader2, Wifi, WifiOff } from "lucide-react";
import { useSyncStatus } from "@/lib/offline/use-sync-status";
import { cn } from "@/lib/utils";
import { useOfflineStore } from "@/store/offline.store";

// ─── NetworkStatusChip ──────────────────────────────────────────────
// Pure status indicator — no click interaction, no popover, no dialog.
// Only renders visibly when there is something actionable to show
// (offline, syncing, pending items, or sync errors).
// When online and fully synced it renders an invisible placeholder
// to keep header layout stable.

export function NetworkStatusChip() {
	const { isOnline, pendingCount, isSyncing, lastSyncError } = useSyncStatus();
	const deadLetterCount = useOfflineStore((state) => state.failedCount);

	// Idle-online: render nothing visible (zero visual footprint)
	if (isOnline && pendingCount === 0 && deadLetterCount === 0 && !isSyncing && !lastSyncError) {
		return null;
	}

	let icon = <Wifi className="size-4" />;
	let text = "";
	let badgeColor = "bg-emerald-500/10 text-emerald-500 border-emerald-500/20";

	if (deadLetterCount > 0) {
		icon = <AlertTriangle className="size-4 animate-pulse" />;
		text = `${deadLetterCount} alerta${deadLetterCount > 1 ? "s" : ""}`;
		badgeColor = "bg-rose-500/10 text-rose-500 border-rose-500/20";
	} else if (isSyncing) {
		icon = <Loader2 className="size-4 animate-spin" />;
		text = "Sincronizando...";
		badgeColor = "bg-sky-500/10 text-sky-500 border-sky-500/20";
	} else if (!isOnline) {
		icon = <WifiOff className="size-4" />;
		text =
			pendingCount > 0 ? `${pendingCount} pendiente${pendingCount > 1 ? "s" : ""}` : "Sin conexión";
		badgeColor = "bg-amber-500/10 text-amber-500 border-amber-500/20";
	} else if (pendingCount > 0) {
		text = `${pendingCount} pendiente${pendingCount > 1 ? "s" : ""}`;
		badgeColor = "bg-sky-500/10 text-sky-500 border-sky-500/20";
	}

	return (
		<output
			aria-live="polite"
			aria-label={`Estado de red: ${text || "En línea"}`}
			className={cn(
				"inline-flex h-7 items-center gap-1.5 rounded-full border px-3 text-xs font-semibold font-mono shadow-sm bg-background",
				badgeColor,
			)}
		>
			{icon}
			{text && <span className="hidden sm:inline">{text}</span>}
		</output>
	);
}
