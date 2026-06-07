"use client";

/**
 * useBlobOutboxSync — Auto-drain blob outbox on connectivity restore
 *
 * Watches the real connectivity monitor and drains the blob outbox when
 * the app comes back online. Also listens for the `sync-queue:trigger` custom
 * event so the "Reintentar" button in `OfflineUploadQueueStatus` can
 * force a manual drain.
 *
 * Returns the current pending count so the caller can display it.
 */

import { useCallback, useEffect, useRef, useState } from "react";
import { BLOB_OUTBOX_CHANGED_EVENT, getPendingBlobCount } from "./blob-outbox";
import { drainBlobOutbox } from "./blob-outbox-processor";
import { useConnectivity } from "./connectivity";

export interface BlobOutboxSyncState {
	pendingCount: number;
	isDraining: boolean;
	drainNow: () => Promise<void>;
}

export function useBlobOutboxSync(): BlobOutboxSyncState {
	// Retain the connectivity monitor — its reconnection events fire
	// sync-queue:trigger which this hook listens to below.
	useConnectivity();
	const [pendingCount, setPendingCount] = useState(0);
	const [isDraining, setIsDraining] = useState(false);
	const isDrainingRef = useRef(false);
	const drainBlobOutboxRef = useRef<
		() => Promise<{ succeeded: number; failed: number; skipped: number }>
	>(async () => ({ succeeded: 0, failed: 0, skipped: 0 }));

	const refresh = useCallback(async () => {
		const count = await getPendingBlobCount();
		setPendingCount(count);
	}, []);

	const drainNow = useCallback(async () => {
		if (isDrainingRef.current) {
			return;
		}
		isDrainingRef.current = true;
		setIsDraining(true);
		try {
			await drainBlobOutboxRef.current();
			await refresh();
		} finally {
			isDrainingRef.current = false;
			setIsDraining(false);
		}
	}, [refresh]);

	// Keep the ref pointing at the latest drainBlobOutbox implementation.
	useEffect(() => {
		drainBlobOutboxRef.current = () => drainBlobOutbox();
	}, []);

	// Refresh count on mount and whenever the outbox changes.
	useEffect(() => {
		void refresh();
		const handle = () => void refresh();
		window.addEventListener(BLOB_OUTBOX_CHANGED_EVENT, handle);
		return () => window.removeEventListener(BLOB_OUTBOX_CHANGED_EVENT, handle);
	}, [refresh]);

	// Drain on connectivity restore (sync-queue:trigger is dispatched by
	// the connectivity monitor when the app transitions offline → online)
	// and on manual "Reintentar" button clicks. This avoids watching
	// isOnline in a useEffect (React Doctor: no-event-handler).
	useEffect(() => {
		const handle = () => {
			if (isDrainingRef.current) {
				return;
			}
			void drainNow();
		};
		window.addEventListener("sync-queue:trigger", handle);
		return () => window.removeEventListener("sync-queue:trigger", handle);
	}, [drainNow]);

	return { pendingCount, isDraining, drainNow };
}
