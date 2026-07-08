/**
 * Blob Outbox Processor — Drains pending offline uploads when online
 *
 * Processes entries from the blob outbox:
 *   1. Reconstructs a File from the stored Blob
 *   2. Calls the upload API (via files.api.uploadFile)
 *   3. On success, removes the entry from the outbox
 *   4. On failure, increments retry count (or marks dead-letter)
 *
 * This module is designed to be called by:
 *   - The `useUploadFile` hook (immediately after a failed online upload)
 *   - The `useBlobOutboxSync` hook (on connectivity restore)
 *   - The `OfflineUploadQueueStatus` "Reintentar" button
 */

import type { FileAssetCategory, FileAssetEntityType } from "@cermont/shared-types";
import { createLogger } from "@/lib/monitoring/logger";
import { uploadFile } from "@/modules/files/api/files.api";
import { useOfflineStore } from "@/store/offline.store";
import {
	BLOB_OUTBOX_CHANGED_EVENT,
	type BlobOutboxEntry,
	getPendingBlobUploads,
	markBlobFailed,
	markBlobInFlight,
	markBlobUploaded,
} from "./blob-outbox";

const logger = createLogger("offline-sync:blob-processor");

function isOnline(): boolean {
	return useOfflineStore.getState().isOnline;
}

/**
 * Process a single blob outbox entry. Returns true on success.
 */
export async function processBlobOutboxEntry(entry: BlobOutboxEntry): Promise<boolean> {
	if (!isOnline()) {
		return false;
	}

	await markBlobInFlight(entry.id);
	try {
		const file = new File([entry.blob], entry.originalName, { type: entry.mimeType });
		await uploadFile({
			file,
			category: entry.category as FileAssetCategory,
			entityType: entry.entityType as FileAssetEntityType,
			entityId: entry.entityId,
			description: entry.description,
			tags: entry.tags,
			offlineLocalId: entry.id,
		});
		await markBlobUploaded(entry.id);
		if (typeof window !== "undefined") {
			window.dispatchEvent(new Event(BLOB_OUTBOX_CHANGED_EVENT));
		}
		return true;
	} catch (err) {
		const message = err instanceof Error ? err.message : "Error desconocido al subir archivo";
		logger.warn(`Blob outbox entry ${entry.id} failed: ${message}`);
		await markBlobFailed(entry.id, message);
		if (typeof window !== "undefined") {
			window.dispatchEvent(new Event(BLOB_OUTBOX_CHANGED_EVENT));
		}
		return false;
	}
}

/**
 * Drain all pending entries in the blob outbox.
 * Returns counts of {succeeded, failed}.
 */
export async function drainBlobOutbox(): Promise<{
	succeeded: number;
	failed: number;
	skipped: number;
}> {
	if (!isOnline()) {
		return { succeeded: 0, failed: 0, skipped: 0 };
	}
	const entries = await getPendingBlobUploads();
	if (entries.length === 0) {
		return { succeeded: 0, failed: 0, skipped: 0 };
	}
	const results = await Promise.all(entries.map((entry) => processBlobOutboxEntry(entry)));
	let succeeded = 0;
	let failed = 0;
	for (const ok of results) {
		if (ok) {
			succeeded += 1;
		} else {
			failed += 1;
		}
	}
	return { succeeded, failed, skipped: 0 };
}

export { BLOB_OUTBOX_CHANGED_EVENT };
