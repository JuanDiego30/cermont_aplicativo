"use client";

import { useCallback, useEffect, useState } from "react";
import {
	flushOfflineQueue,
	getOfflineQueueStats,
	type OfflineAction,
	queueOfflineAction,
} from "@/_shared/lib/pwa/offline-queue";
import { useOnlineStatus } from "@/offline-sync/hooks/useOnlineStatus";
import { useLastSyncAt } from "./useLastSyncAt";

/**
 * ISSUE-P04 FIX: High-level hook for offline sync operations.
 * Composes online status, queue stats, enqueue, and sync actions.
 */
export function useOfflineSync() {
	const isOnline = useOnlineStatus();
	const [queueLength, setQueueLength] = useState(0);
	const [failedCount, setFailedCount] = useState(0);
	const [isSyncing, setIsSyncing] = useState(false);
	const { lastSyncAt, recordLastSyncAt } = useLastSyncAt();

	// Refresh queue stats periodically
	const refreshStats = useCallback(async () => {
		try {
			const stats = await getOfflineQueueStats();
			setQueueLength(stats.total);
			setFailedCount(stats.failed);
		} catch {
			setQueueLength(0);
			setFailedCount(0);
		}
	}, []);

	useEffect(() => {
		void refreshStats();
		const interval = setInterval(refreshStats, 5000);
		return () => clearInterval(interval);
	}, [refreshStats]);

	// Auto-sync when coming back online
	const handleSync = useCallback(async () => {
		if (isSyncing) {
			return;
		}
		setIsSyncing(true);
		try {
			const result = await flushOfflineQueue();
			await refreshStats();
			recordLastSyncAt(new Date());
			return result;
		} finally {
			setIsSyncing(false);
		}
	}, [isSyncing, refreshStats, recordLastSyncAt]);

	// Sync when coming back online with items in queue
	useEffect(() => {
		if (isOnline && queueLength > 0) {
			void handleSync();
		}
	}, [isOnline, queueLength, handleSync]);

	const enqueue = useCallback(
		async (action: Omit<OfflineAction, "id" | "createdAt" | "retries">) => {
			await queueOfflineAction(action);
			await refreshStats();
		},
		[refreshStats],
	);

	return {
		isOnline,
		queueLength,
		failedCount,
		lastSyncAt,
		enqueue,
		sync: handleSync,
		isSyncing,
	};
}
