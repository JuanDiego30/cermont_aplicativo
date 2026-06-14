"use client";

import { useOfflineStore } from "@/store/offline.store";

interface SyncStatus {
	isOnline: boolean;
	pendingCount: number;
	failedCount: number;
	conflictCount: number;
	isSyncing: boolean;
	lastSyncError: string;
	lastSyncAt: string;
}

export function useSyncStatus(): SyncStatus {
	const isOnline = useOfflineStore((state) => state.isOnline);
	const pendingCount = useOfflineStore((state) => state.pendingCount);
	const failedCount = useOfflineStore((state) => state.failedCount);
	const conflictCount = useOfflineStore((state) => state.conflictCount);
	const isSyncing = useOfflineStore((state) => state.isSyncing);
	const lastSyncError = useOfflineStore((state) => state.syncError);
	const lastSyncAt = useOfflineStore((state) => state.lastSyncAt);

	return {
		isOnline,
		pendingCount,
		failedCount,
		conflictCount,
		isSyncing,
		lastSyncError,
		lastSyncAt,
	};
}
