// NOTE: The workspace does not depend on `idb`, so we use native IndexedDB when available
// and fall back to localStorage in environments that do not expose IndexedDB.
// Checklist and evidence retries must preserve the same Idempotency-Key so the backend
// can return the original record instead of creating duplicates.

import { createLogger } from "@/lib/monitoring/logger";

type SyncQueueMethod = "POST" | "PATCH" | "PUT" | "DELETE";
type SyncQueueStatus = "pending" | "dead_letter";

export interface SyncQueueEntry {
	id: string;
	endpoint: string;
	method: SyncQueueMethod;
	payload: Record<string, unknown>;
	createdAt: number;
	retryCount: number;
	idempotencyKey: string;
	status?: SyncQueueStatus;
	nextRetryAt?: number;
	lastError?: string;
	dedupeKey?: string;
}

const logger = createLogger("offline-sync:queue");

const DATABASE_NAME = "CermontSyncQueueDB";
const DATABASE_VERSION = 1;
const STORE_NAME = "sync_queue";
const LOCAL_STORAGE_KEY = "cermont.sync.queue.v1";
export const QUEUE_CHANGED_EVENT = "sync-queue:changed";

function hasIndexedDBSupport(): boolean {
	return typeof indexedDB !== "undefined";
}

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
	return [...entries].sort(
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

function openDatabase(): Promise<IDBDatabase> {
	return new Promise((resolve, reject) => {
		const request = indexedDB.open(DATABASE_NAME, DATABASE_VERSION);

		request.onerror = () => reject(request.error);
		request.onsuccess = () => resolve(request.result);
		request.onupgradeneeded = (event) => {
			const database = (event.target as IDBOpenDBRequest).result;
			if (!database.objectStoreNames.contains(STORE_NAME)) {
				const store = database.createObjectStore(STORE_NAME, { keyPath: "id" });
				store.createIndex("status", "status", { unique: false });
				store.createIndex("dedupeKey", "dedupeKey", { unique: false });
				store.createIndex("nextRetryAt", "nextRetryAt", { unique: false });
			}
		};
	});
}

async function readIndexedDBEntries(): Promise<SyncQueueEntry[]> {
	const database = await openDatabase();
	const transaction = database.transaction(STORE_NAME, "readonly");
	const store = transaction.objectStore(STORE_NAME);
	const request = store.getAll();

	return await new Promise<SyncQueueEntry[]>((resolve, reject) => {
		request.onerror = () => reject(request.error);
		request.onsuccess = () => {
			const entries = (request.result as SyncQueueEntry[]).map((entry) => normalizeEntry(entry));
			resolve(entries);
		};
	});
}

async function writePersistentEntries(entries: SyncQueueEntry[]): Promise<void> {
	if (hasIndexedDBSupport()) {
		const database = await openDatabase();
		const transaction = database.transaction(STORE_NAME, "readwrite");
		const store = transaction.objectStore(STORE_NAME);
		store.clear();
		for (const entry of entries) {
			store.put(entry);
		}

		await new Promise<void>((resolve, reject) => {
			transaction.onerror = () => reject(transaction.error);
			transaction.oncomplete = () => resolve();
		});
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
