"use client";

import type { OfflineOutboxItem } from "@cermont/shared-types";
import { useOfflineStore } from "@/store/offline.store";
import {
	type BlobOutboxEntry,
	getAllBlobUploads,
	removeBlobUpload,
	retryBlobUpload,
} from "./blob-outbox";
import { nowIso, offlineDb } from "./offline-db";
import { QUEUE_CHANGED_EVENT } from "./sync-queue";

export type OfflineConflictResolution = "keep_server" | "retry_local";

const RECOVERY_STATUSES = new Set<OfflineOutboxItem["status"]>(["failed", "conflict"]);

export interface OfflineOutboxCounts {
	pendingCount: number;
	failedCount: number;
	conflictCount: number;
}

export interface OfflineRecoverySnapshot {
	items: OfflineOutboxItem[];
	uploads: BlobOutboxEntry[];
}

function emitQueueChanged(): void {
	if ("window" in globalThis) {
		globalThis.window.dispatchEvent(new Event(QUEUE_CHANGED_EVENT));
	}
}

export async function readOfflineOutboxCounts(): Promise<OfflineOutboxCounts> {
	const items = await offlineDb.offlineOutbox.toArray();
	return {
		pendingCount: items.filter(
			(item) => item.status === "pending_sync" || item.status === "syncing",
		).length,
		failedCount: items.filter((item) => item.status === "failed").length,
		conflictCount: items.filter((item) => item.status === "conflict").length,
	};
}

export async function refreshOfflineOutboxCounts(
	additionalPendingCount = 0,
	additionalFailedCount = 0,
): Promise<void> {
	const counts = await readOfflineOutboxCounts();
	useOfflineStore.getState().setSyncState({
		pendingCount: counts.pendingCount + additionalPendingCount,
		failedCount: counts.failedCount + additionalFailedCount,
		conflictCount: counts.conflictCount,
	});
}

async function getRecoverableItem(localId: string): Promise<OfflineOutboxItem> {
	const item = await offlineDb.offlineOutbox.get(localId);
	if (!item) {
		throw new Error("El registro offline ya no existe.");
	}
	if (!RECOVERY_STATUSES.has(item.status)) {
		throw new Error("El registro offline ya no requiere recuperacion.");
	}
	return item;
}

async function finishRecoveryMutation(): Promise<void> {
	const uploads = await getAllBlobUploads();
	await refreshOfflineOutboxCounts(
		uploads.filter((entry) => entry.status === "pending" || entry.status === "in_flight").length,
		uploads.filter((entry) => entry.status === "dead_letter").length,
	);
	emitQueueChanged();
}

export async function listOfflineRecoveryItems(): Promise<OfflineOutboxItem[]> {
	const items = await offlineDb.offlineOutbox.toArray();
	return items
		.filter((item) => RECOVERY_STATUSES.has(item.status))
		.toSorted(
			(left, right) =>
				left.createdAt.localeCompare(right.createdAt) || left.localId.localeCompare(right.localId),
		);
}

export async function listOfflineRecoverySnapshot(): Promise<OfflineRecoverySnapshot> {
	const [items, uploads] = await Promise.all([listOfflineRecoveryItems(), getAllBlobUploads()]);
	return {
		items,
		uploads: uploads.filter((entry) => entry.status === "dead_letter"),
	};
}

export async function retryOfflineRecoveryItem(localId: string): Promise<void> {
	await getRecoverableItem(localId);
	await offlineDb.offlineOutbox.update(localId, {
		status: "pending_sync",
		attempts: 0,
		lastError: void 0,
		nextRetryAt: void 0,
		conflict: void 0,
		updatedAt: nowIso(),
	});
	await finishRecoveryMutation();
}

export async function discardOfflineRecoveryItem(localId: string): Promise<void> {
	await getRecoverableItem(localId);
	await offlineDb.offlineOutbox.update(localId, {
		status: "discarded",
		nextRetryAt: void 0,
		updatedAt: nowIso(),
	});
	await finishRecoveryMutation();
}

export async function resolveOfflineConflict(
	localId: string,
	resolution: OfflineConflictResolution,
): Promise<void> {
	const item = await getRecoverableItem(localId);
	if (item.status !== "conflict") {
		throw new Error("El registro seleccionado no tiene un conflicto activo.");
	}

	if (resolution === "keep_server") {
		await discardOfflineRecoveryItem(localId);
		return;
	}

	await retryOfflineRecoveryItem(localId);
}

export async function retryOfflineUpload(id: string): Promise<void> {
	await retryBlobUpload(id);
	await finishRecoveryMutation();
}

export async function discardOfflineUpload(id: string): Promise<void> {
	await removeBlobUpload(id);
	await finishRecoveryMutation();
}
