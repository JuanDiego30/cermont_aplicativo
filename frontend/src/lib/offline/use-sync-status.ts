/**
 * Hook: useSyncStatus — Online/offline status + sync queue state
 *
 * Tracks connectivity, pending mutations, and sync errors.
 * Used by OfflineBanner and other components to show sync state.
 */

import { useCallback, useEffect, useState } from "react";
import { getPendingMutationCount } from "./client-mutation";
import { QUEUE_CHANGED_EVENT } from "./sync-queue";

interface SyncStatus {
	isOnline: boolean;
	pendingCount: number;
	isSyncing: boolean;
	lastSyncError: string | null;
}

export function useSyncStatus(): SyncStatus {
	const [status, setStatus] = useState<SyncStatus>(() => ({
		isOnline: typeof navigator !== "undefined" ? navigator.onLine : true,
		pendingCount: 0,
		isSyncing: false,
		lastSyncError: null,
	}));

	const refresh = useCallback(() => {
		setStatus((prev) => ({
			...prev,
			pendingCount: getPendingMutationCount(),
		}));
	}, []);

	useEffect(() => {
		const handleOnline = () => setStatus((s) => ({ ...s, isOnline: true }));
		const handleOffline = () => setStatus((s) => ({ ...s, isOnline: false }));
		const handleQueueChanged = () => refresh();
		const handleSyncStart = () => setStatus((s) => ({ ...s, isSyncing: true }));
		const handleSyncEnd = () => setStatus((s) => ({ ...s, isSyncing: false }));
		const handleSyncError = (e: Event) => {
			const detail = (e as CustomEvent).detail;
			setStatus((s) => ({ ...s, lastSyncError: detail?.message ?? "Error desconocido" }));
		};

		window.addEventListener("online", handleOnline);
		window.addEventListener("offline", handleOffline);
		window.addEventListener(QUEUE_CHANGED_EVENT, handleQueueChanged);
		window.addEventListener("sync-queue:start", handleSyncStart);
		window.addEventListener("sync-queue:end", handleSyncEnd);
		window.addEventListener("sync-queue:error", handleSyncError);

		// Initial refresh
		refresh();

		return () => {
			window.removeEventListener("online", handleOnline);
			window.removeEventListener("offline", handleOffline);
			window.removeEventListener(QUEUE_CHANGED_EVENT, handleQueueChanged);
			window.removeEventListener("sync-queue:start", handleSyncStart);
			window.removeEventListener("sync-queue:end", handleSyncEnd);
			window.removeEventListener("sync-queue:error", handleSyncError);
		};
	}, [refresh]);

	return status;
}
