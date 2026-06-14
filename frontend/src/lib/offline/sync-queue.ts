import type { OfflineJsonObject, OfflineOutboxItem } from "@cermont/shared-types";
import { createLogger } from "@/lib/monitoring/logger";
import { useAuthStore } from "@/store/auth.store";
import { hasIndexedDBSupport, legacyQueueEntryToOutboxItem, nowIso, offlineDb } from "./offline-db";

type SyncQueueMethod = "POST" | "PATCH" | "PUT" | "DELETE";
type SyncQueueStatus = "pending" | "dead_letter";

export interface SyncQueueEntry {
	id: string;
	endpoint: string;
	method: SyncQueueMethod;
	payload: OfflineJsonObject;
	createdAt: number;
	retryCount: number;
	idempotencyKey: string;
	status?: SyncQueueStatus;
	nextRetryAt?: number;
	lastError?: string;
	dedupeKey?: string;
}

const logger = createLogger("offline-sync:queue");

const LOCAL_STORAGE_KEY = "cermont.sync.queue.v1";
const UNASSIGNED_USER_ID = "offline-session-unassigned";
const DEDUPE_PAYLOAD_KEY = "__cermontDedupeKey";
export const QUEUE_CHANGED_EVENT = "sync-queue:changed";

function emitQueueChanged(): void {
	if (typeof window === "undefined") {
		return;
	}

	window.dispatchEvent(new Event(QUEUE_CHANGED_EVENT));
}

function normalizeEntry(entry: SyncQueueEntry): SyncQueueEntry {
	return {
		...entry,
		status: entry.status ?? "pending",
		retryCount: Number.isFinite(entry.retryCount) ? entry.retryCount : 0,
		createdAt: Number.isFinite(entry.createdAt) ? entry.createdAt : Date.now(),
	};
}

function sortEntries(entries: SyncQueueEntry[]): SyncQueueEntry[] {
	return entries.toSorted(
		(left, right) => left.createdAt - right.createdAt || left.id.localeCompare(right.id),
	);
}

function readLocalStorageEntries(): SyncQueueEntry[] {
	if (typeof window === "undefined") {
		return [];
	}

	const raw = window.localStorage.getItem(LOCAL_STORAGE_KEY);
	if (!raw) {
		return [];
	}

	try {
		const parsed = JSON.parse(raw) as unknown;
		if (!Array.isArray(parsed)) {
			return [];
		}

		return parsed
			.filter(
				(item): item is SyncQueueEntry => typeof item === "object" && item !== null && "id" in item,
			)
			.map((item) => normalizeEntry(item));
	} catch (error) {
		logger.error("Failed to read sync queue from localStorage", error);
		return [];
	}
}

function writeLocalStorageEntries(entries: SyncQueueEntry[]): void {
	if (typeof window === "undefined") {
		return;
	}

	window.localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(entries));
}

function getCurrentUserId(): string {
	const user = useAuthStore.getState().user;
	return user.status === "present" ? user.value.id : UNASSIGNED_USER_ID;
}

function isDirectQueueItem(item: OfflineOutboxItem): boolean {
	return (
		typeof item.endpoint === "string" &&
		item.endpoint !== "/sync/offline" &&
		typeof item.method === "string"
	);
}

function toQueueEntry(item: OfflineOutboxItem): SyncQueueEntry | false {
	if (!isDirectQueueItem(item) || !item.endpoint || !item.method) {
		return false;
	}
	if (item.status === "synced" || item.status === "discarded" || item.status === "draft") {
		return false;
	}

	const payload = { ...item.payload };
	const dedupeValue = payload[DEDUPE_PAYLOAD_KEY];
	delete payload[DEDUPE_PAYLOAD_KEY];

	return normalizeEntry({
		id: item.localId,
		endpoint: item.endpoint,
		method: item.method,
		payload,
		createdAt: Date.parse(item.createdAt),
		retryCount: item.attempts,
		idempotencyKey: item.idempotencyKey,
		status: item.status === "failed" || item.status === "conflict" ? "dead_letter" : "pending",
		nextRetryAt: item.nextRetryAt,
		lastError: item.lastError,
		dedupeKey: typeof dedupeValue === "string" ? dedupeValue : undefined,
	});
}

function toOutboxItem(
	entry: SyncQueueEntry,
	existingItems: ReadonlyMap<string, OfflineOutboxItem>,
): OfflineOutboxItem {
	const existing = existingItems.get(entry.id);
	const item = legacyQueueEntryToOutboxItem(entry, existing?.userId ?? getCurrentUserId());

	return {
		...item,
		createdAt: existing?.createdAt ?? item.createdAt,
		updatedAt: nowIso(),
	};
}

async function readIndexedDBEntries(): Promise<SyncQueueEntry[]> {
	try {
		const items = await offlineDb.offlineOutbox.toArray();
		const entries: SyncQueueEntry[] = [];
		for (const item of items) {
			const entry = toQueueEntry(item);
			if (entry) {
				entries.push(entry);
			}
		}
		return entries;
	} catch (error) {
		// If IndexedDB schema is stale or stores are missing (race during upgrade),
		// return empty array to allow the app to continue loading.
		// The database upgrade will complete on next access.
		if (error instanceof Error && error.name === "NotFoundError") {
			logger.warn("IndexedDB store not found during read - likely schema upgrade in progress", {
				error: error.message,
			});
			return [];
		}
		throw error;
	}
}

async function writePersistentEntries(entries: SyncQueueEntry[]): Promise<void> {
	if (hasIndexedDBSupport()) {
		try {
			const existingItems = await offlineDb.offlineOutbox.toArray();
			const existingById = new Map(existingItems.map((item) => [item.localId, item]));
			const directQueueIds = existingItems
				.filter(
					(item) =>
						isDirectQueueItem(item) && item.status !== "discarded" && item.status !== "synced",
				)
				.map((item) => item.localId);
			const nextItems = entries.map((entry) => toOutboxItem(entry, existingById));

			await offlineDb.transaction("rw", offlineDb.offlineOutbox, async () => {
				if (directQueueIds.length > 0) {
					await offlineDb.offlineOutbox.bulkDelete(directQueueIds);
				}
				if (nextItems.length > 0) {
					await offlineDb.offlineOutbox.bulkPut(nextItems);
				}
			});
		} catch (error) {
			// If IndexedDB schema is stale or stores are missing (race during upgrade),
			// fall back to localStorage to prevent complete failure.
			if (error instanceof Error && error.name === "NotFoundError") {
				logger.warn("IndexedDB store not found during write - falling back to localStorage", {
					error: error.message,
				});
				writeLocalStorageEntries(entries);
				return;
			}
			throw error;
		}
		return;
	}

	writeLocalStorageEntries(entries);
}

async function readPersistentEntries(): Promise<SyncQueueEntry[]> {
	if (hasIndexedDBSupport()) {
		return await readIndexedDBEntries();
	}

	return readLocalStorageEntries();
}

export async function enqueue(entry: SyncQueueEntry): Promise<SyncQueueEntry> {
	const normalizedEntry = normalizeEntry(entry);
	const entries = await readPersistentEntries();
	const duplicate = normalizedEntry.dedupeKey
		? entries.find(
				(candidate) =>
					candidate.dedupeKey === normalizedEntry.dedupeKey && candidate.status !== "dead_letter",
			)
		: undefined;

	if (duplicate) {
		return normalizeEntry(duplicate);
	}

	const nextEntries = sortEntries([
		...entries.filter((candidate) => candidate.id !== normalizedEntry.id),
		normalizedEntry,
	]);
	await writePersistentEntries(nextEntries);
	emitQueueChanged();

	return normalizedEntry;
}

export async function dequeue(id: string): Promise<void> {
	await dequeueMany([id]);
}

export async function dequeueMany(ids: readonly string[]): Promise<void> {
	if (ids.length === 0) {
		return;
	}

	const idSet = new Set(ids);
	const entries = await readPersistentEntries();
	const nextEntries = entries.filter((entry) => !idSet.has(entry.id));

	if (nextEntries.length === entries.length) {
		return;
	}

	await writePersistentEntries(nextEntries);
	emitQueueChanged();
}

export async function getAll(): Promise<SyncQueueEntry[]> {
	const entries = await readPersistentEntries();
	return sortEntries(entries.map((entry) => normalizeEntry(entry)));
}

export async function markDeadLetter(id: string): Promise<void> {
	const entries = await readPersistentEntries();
	const target = entries.find((entry) => entry.id === id);

	if (!target) {
		return;
	}

	const nextEntries = entries.map((entry) =>
		entry.id === id
			? {
					...entry,
					status: "dead_letter" as const,
				}
			: entry,
	);

	await writePersistentEntries(sortEntries(nextEntries));
	emitQueueChanged();
}

export async function updateEntry(entry: SyncQueueEntry): Promise<SyncQueueEntry> {
	const normalizedEntry = normalizeEntry(entry);
	const entries = await readPersistentEntries();
	const nextEntries = sortEntries(
		entries.filter((candidate) => candidate.id !== normalizedEntry.id).concat(normalizedEntry),
	);

	await writePersistentEntries(nextEntries);
	emitQueueChanged();

	return normalizedEntry;
}
