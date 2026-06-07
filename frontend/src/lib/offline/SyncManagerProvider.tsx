"use client";

import { type ReactNode, useEffect } from "react";
import { useOfflineStore } from "@/store/offline.store";
import { useSyncManager } from "./sync-manager";
import { useBlobOutboxSync } from "./use-blob-outbox-sync";

export function SyncManagerProvider({ children }: { children: ReactNode }) {
	const syncState = useSyncManager();
	const blobState = useBlobOutboxSync();

	useEffect(() => {
		useOfflineStore.getState().setSyncState({
			isSyncing: syncState.status === "syncing" || blobState.isDraining,
			pendingCount: syncState.pendingCount + blobState.pendingCount,
			failedCount: syncState.deadLetterCount,
		});
	}, [
		blobState.isDraining,
		blobState.pendingCount,
		syncState.deadLetterCount,
		syncState.pendingCount,
		syncState.status,
	]);

	return <>{children}</>;
}
