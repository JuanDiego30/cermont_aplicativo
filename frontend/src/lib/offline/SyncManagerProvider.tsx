"use client";

import { type ReactNode, useCallback, useEffect } from "react";
import { createLogger } from "@/lib/monitoring/logger";
import { useOfflineStore } from "@/store/offline.store";
import { refreshOfflineOutboxCounts } from "./offline-recovery";
import { useSyncManager } from "./sync-manager";
import { QUEUE_CHANGED_EVENT } from "./sync-queue";
import { useBlobOutboxSync } from "./use-blob-outbox-sync";

const logger = createLogger("offline-sync:provider");

export function SyncManagerProvider({ children }: { children: ReactNode }) {
	const syncState = useSyncManager();
	const blobState = useBlobOutboxSync();
	const refreshCounts = useCallback(async () => {
		try {
			await refreshOfflineOutboxCounts(blobState.pendingCount, blobState.deadLetterCount);
		} catch (error) {
			logger.error("Failed to refresh offline queue counts", error);
		}
	}, [blobState.deadLetterCount, blobState.pendingCount]);

	useEffect(() => {
		useOfflineStore.getState().setSyncState({
			isSyncing: syncState.status === "syncing" || blobState.isDraining,
		});
		void refreshCounts();
	}, [blobState.isDraining, refreshCounts, syncState.status]);

	useEffect(() => {
		const handleQueueChange = () => void refreshCounts();
		window.addEventListener(QUEUE_CHANGED_EVENT, handleQueueChange);
		return () => window.removeEventListener(QUEUE_CHANGED_EVENT, handleQueueChange);
	}, [refreshCounts]);

	return <>{children}</>;
}
