"use client";

import { useOfflineStore } from "@/store/offline.store";

interface SyncStatus {
	isOnline: boolean;
	pendingCount: number;
	isSyncing: boolean;
	lastSyncError: string;
}

export function useSyncStatus(): SyncStatus {
	const isOnline = useOfflineStore((state) => state.isOnline);
	const pendingCount = useOfflineStore((state) => state.pendingCount);
	const isSyncing = useOfflineStore((state) => state.isSyncing);
	const lastSyncError = useOfflineStore((state) => state.syncError);

	return { isOnline, pendingCount, isSyncing, lastSyncError };
}
