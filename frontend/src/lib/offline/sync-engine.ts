"use client";

import type {
	OfflineFile,
	OfflineJsonObject,
	OfflineOutboxItem,
	OfflineSyncItemResult,
	SyncResult,
} from "@cermont/shared-types";
import { isPresent, SyncResultSchema } from "@cermont/shared-types";
import { apiClient } from "@/lib/http/api-client";
import { useAuthStore } from "@/store/auth.store";
import { useOfflineStore } from "@/store/offline.store";
import { nowIso, type OfflineFileRecord, offlineDb } from "./offline-db";
import { QUEUE_CHANGED_EVENT } from "./sync-queue";

const MAX_SYNC_ATTEMPTS = 5;
const BASE_RETRY_DELAY_MS = 1500;

interface ApiEnvelope<T> {
	success: true;
	data: T;
}

export interface OfflineSyncSummary {
	batchId: string;
	synced: number;
	failed: number;
	conflicts: number;
	pending: number;
}

function hasIndexedDbRuntime(): boolean {
	return "indexedDB" in globalThis;
}

function isBrowserOnline(): boolean {
	return useOfflineStore.getState().isOnline;
}

function hasAuthenticatedSession(): boolean {
	return isPresent(useAuthStore.getState().accessToken);
}

function buildBatchId(): string {
	if ("crypto" in globalThis && typeof globalThis.crypto.randomUUID === "function") {
		return `offline-${globalThis.crypto.randomUUID()}`;
	}

	return `offline-${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

function getNextRetryAt(attempts: number): number {
	const delay = BASE_RETRY_DELAY_MS * 2 ** Math.max(0, attempts - 1);
	return Date.now() + delay;
}

function dispatchQueueChanged(): void {
	if ("window" in globalThis) {
		globalThis.window.dispatchEvent(new Event(QUEUE_CHANGED_EVENT));
	}
}

async function refreshVisualCounts(): Promise<void> {
	if (!hasIndexedDbRuntime()) {
		return;
	}

	try {
		const [pendingCount, failedCount, conflictCount] = await Promise.all([
			offlineDb.offlineOutbox.where("status").anyOf(["pending_sync", "syncing", "failed"]).count(),
			offlineDb.offlineOutbox.where("status").equals("failed").count(),
			offlineDb.offlineOutbox.where("status").equals("conflict").count(),
		]);

		useOfflineStore.getState().setSyncState({
			pendingCount,
			failedCount,
			conflictCount,
		});
	} catch (error) {
		// If IndexedDB schema is stale or stores are missing (race during upgrade),
		// silently skip counts - the database will be ready on next access.
		if (error instanceof Error && error.name === "NotFoundError") {
			return;
		}
		throw error;
	}
}

function isReadyForRetry(item: OfflineOutboxItem, now: number): boolean {
	if (item.status === "pending_sync") {
		return true;
	}

	if (item.status !== "failed") {
		return false;
	}

	if (!item.nextRetryAt) {
		return item.attempts < MAX_SYNC_ATTEMPTS;
	}

	return Date.parse(String(item.nextRetryAt)) <= now && item.attempts < MAX_SYNC_ATTEMPTS;
}

async function getPendingItems(): Promise<OfflineOutboxItem[]> {
	const items = await offlineDb.offlineOutbox
		.where("status")
		.anyOf(["pending_sync", "failed"])
		.toArray();
	const now = Date.now();
	return items
		.filter(
			(item) => (!item.endpoint || item.endpoint === "/sync/offline") && isReadyForRetry(item, now),
		)
		.sort((left, right) => left.createdAt.localeCompare(right.createdAt));
}

async function markItemsSyncing(items: OfflineOutboxItem[]): Promise<void> {
	const updatedAt = nowIso();
	await offlineDb.transaction("rw", offlineDb.offlineOutbox, async () => {
		await Promise.all(
			items.map((item) =>
				offlineDb.offlineOutbox.update(item.localId, {
					status: "syncing",
					updatedAt,
				}),
			),
		);
	});
}

function findItem(items: OfflineOutboxItem[], result: OfflineSyncItemResult): OfflineOutboxItem {
	const item = items.find((candidate) => candidate.localId === result.localId);
	if (!item) {
		throw new Error(`Offline result references an unrecognized local id ${result.localId}`);
	}
	return item;
}

async function applyItemResult(
	items: OfflineOutboxItem[],
	result: OfflineSyncItemResult,
): Promise<void> {
	const item = findItem(items, result);
	const updatedAt = nowIso();

	if (result.status === "synced") {
		await offlineDb.offlineOutbox.update(item.localId, {
			status: "synced",
			serverId: result.serverId,
			syncedAt: updatedAt,
			updatedAt,
			lastError: "",
			nextRetryAt: void 0,
		});
		return;
	}

	if (result.status === "conflict") {
		await offlineDb.offlineOutbox.update(item.localId, {
			status: "conflict",
			serverId: result.serverId,
			updatedAt,
			lastError: result.conflict?.reason ?? result.error ?? "Conflicto de sincronización.",
			nextRetryAt: void 0,
		});
		return;
	}

	const attempts = item.attempts + 1;
	await offlineDb.offlineOutbox.update(item.localId, {
		status: attempts >= MAX_SYNC_ATTEMPTS ? "failed" : "pending_sync",
		attempts,
		updatedAt,
		lastError: result.error ?? "El servidor rechazó el registro offline.",
		nextRetryAt: attempts >= MAX_SYNC_ATTEMPTS ? void 0 : getNextRetryAt(attempts),
	});
}

async function processServerResult(
	batchId: string,
	items: OfflineOutboxItem[],
	result: SyncResult,
): Promise<OfflineSyncSummary> {
	await offlineDb.transaction(
		"rw",
		offlineDb.offlineOutbox,
		offlineDb.offlineSyncLogs,
		async () => {
			await Promise.all(result.results.map((itemResult) => applyItemResult(items, itemResult)));
			await offlineDb.offlineSyncLogs.put({
				batchId,
				status: result.failed > 0 ? "failed" : "completed",
				startedAt: nowIso(),
				finishedAt: nowIso(),
				results: result.results,
			});
		},
	);

	const synced = result.results.filter((item) => item.status === "synced").length;
	const conflicts = result.results.filter((item) => item.status === "conflict").length;
	const failed = result.results.filter((item) => item.status === "failed").length;
	const pending = await offlineDb.offlineOutbox
		.where("status")
		.anyOf(["pending_sync", "syncing", "failed"])
		.count();

	return { batchId, synced, failed, conflicts, pending };
}

async function postSyncBatch(
	batchId: string,
	operations: OfflineOutboxItem[],
): Promise<SyncResult> {
	const envelope = await apiClient.post<ApiEnvelope<SyncResult>>("/sync/offline", {
		batchId,
		operations,
	});
	const parsed = SyncResultSchema.safeParse(envelope.data);
	if (!parsed.success) {
		throw new Error(`Invalid offline sync response: ${parsed.error.message}`);
	}
	return parsed.data;
}

export async function syncNow(): Promise<OfflineSyncSummary> {
	if (!hasIndexedDbRuntime()) {
		return { batchId: "offline-unavailable", synced: 0, failed: 0, conflicts: 0, pending: 0 };
	}

	if (!isBrowserOnline()) {
		await refreshVisualCounts();
		return { batchId: "offline", synced: 0, failed: 0, conflicts: 0, pending: 0 };
	}

	if (!hasAuthenticatedSession()) {
		await refreshVisualCounts();
		useOfflineStore.getState().setSyncState({
			isSyncing: false,
			syncError: "La sincronización requiere una sesión activa.",
		});
		return { batchId: "offline-no-session", synced: 0, failed: 0, conflicts: 0, pending: 0 };
	}

	const items = await getPendingItems();
	if (items.length === 0) {
		await refreshVisualCounts();
		return { batchId: "offline-empty", synced: 0, failed: 0, conflicts: 0, pending: 0 };
	}

	const batchId = buildBatchId();
	useOfflineStore.getState().setSyncState({ isSyncing: true, syncError: "" });

	try {
		await markItemsSyncing(items);
		await offlineDb.offlineSyncLogs.put({
			batchId,
			status: "started",
			startedAt: nowIso(),
			results: [],
		});

		const result = await postSyncBatch(batchId, items);
		const summary = await processServerResult(batchId, items, result);
		useOfflineStore.getState().setSyncState({
			isSyncing: false,
			lastSyncAt: nowIso(),
			syncError: summary.failed > 0 ? "Hay registros offline con error de sincronización." : "",
		});
		await refreshVisualCounts();
		dispatchQueueChanged();
		return summary;
	} catch (error) {
		const message =
			error instanceof Error ? error.message : "No se pudo sincronizar la cola offline.";
		const updatedAt = nowIso();
		await offlineDb.transaction(
			"rw",
			offlineDb.offlineOutbox,
			offlineDb.offlineSyncLogs,
			async () => {
				await Promise.all(
					items.map((item) =>
						offlineDb.offlineOutbox.update(item.localId, {
							status: "failed",
							attempts: item.attempts + 1,
							updatedAt,
							lastError: message,
							nextRetryAt: getNextRetryAt(item.attempts + 1),
						}),
					),
				);
				await offlineDb.offlineSyncLogs.put({
					batchId,
					status: "failed",
					startedAt: updatedAt,
					finishedAt: nowIso(),
					results: [],
				});
			},
		);
		useOfflineStore.getState().setSyncState({
			isSyncing: false,
			syncError: message,
		});
		await refreshVisualCounts();
		dispatchQueueChanged();
		return { batchId, synced: 0, failed: items.length, conflicts: 0, pending: items.length };
	}
}

export async function enqueueOfflineMutation(item: OfflineOutboxItem): Promise<void> {
	if (!hasIndexedDbRuntime()) {
		return;
	}

	await offlineDb.offlineOutbox.put(item);
	await refreshVisualCounts();
	dispatchQueueChanged();
}

export async function enqueueOfflineFile(
	file: OfflineFile,
	blob: Blob,
	payload: OfflineJsonObject,
	userId: string,
): Promise<void> {
	if (!hasIndexedDbRuntime()) {
		return;
	}

	const record: OfflineFileRecord = { ...file, blob };
	const uploadOperation: OfflineOutboxItem = {
		localId: `upload-${file.localId}`,
		entityType: "evidence",
		operation: "upload_file",
		payload,
		status: "pending_sync",
		attempts: 0,
		createdAt: file.createdAt,
		updatedAt: nowIso(),
		idempotencyKey: file.idempotencyKey,
		schemaVersion: "offline.v1",
		userId,
		workOrderId: file.workOrderId,
		flowStep: file.flowStep,
		endpoint: "/files/offline-upload",
		method: "POST",
	};

	await offlineDb.transaction("rw", offlineDb.offlineFiles, offlineDb.offlineOutbox, async () => {
		await offlineDb.offlineFiles.put(record);
		await offlineDb.offlineOutbox.put(uploadOperation);
	});
	await refreshVisualCounts();
	dispatchQueueChanged();
}
