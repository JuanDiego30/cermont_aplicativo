// NOTE: The workspace does not depend on `idb`, so we use native IndexedDB when available
// and fall back to in-memory storage in environments that do not expose IndexedDB.
// Checklist and evidence retries must preserve the same Idempotency-Key so the backend
// can return the original record instead of creating duplicates.

import type { JsonObject } from "@cermont/shared-types";

export type SyncQueueMethod = "POST" | "PATCH" | "PUT" | "DELETE";
export type SyncQueueStatus = "pending" | "dead_letter";

export interface SyncQueueEntry {
	id: string;
	endpoint: string;
	method: SyncQueueMethod;
	payload: JsonObject;
	createdAt: number;
	retryCount: number;
	idempotencyKey: string;
	status?: SyncQueueStatus;
	nextRetryAt?: number;
	lastError?: string;
	dedupeKey?: string;
}

const DATABASE_NAME = "CermontSyncQueueDB";
const DATABASE_VERSION = 1;
const STORE_NAME = "sync_queue";
export const QUEUE_CHANGED_EVENT = "sync-queue:changed";
let memoryQueueEntries: SyncQueueEntry[] = [];

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

function readMemoryEntries(): SyncQueueEntry[] {
	return memoryQueueEntries.map((entry) => normalizeEntry(entry));
}

function writeMemoryEntries(entries: SyncQueueEntry[]): void {
	memoryQueueEntries = sortEntries(entries).map((entry) => normalizeEntry(entry));
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

	writeMemoryEntries(entries);
}

async function readPersistentEntries(): Promise<SyncQueueEntry[]> {
	if (hasIndexedDBSupport()) {
		return await readIndexedDBEntries();
	}

	return readMemoryEntries();
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
	const entries = await readPersistentEntries();
	const nextEntries = entries.filter((entry) => entry.id !== id);

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
