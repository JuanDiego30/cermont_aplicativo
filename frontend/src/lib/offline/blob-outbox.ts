/**
 * Blob Outbox — IndexedDB store for offline file/image uploads
 *
 * Stores binary Blob objects in IndexedDB along with upload metadata.
 * This is more efficient than the base64-based approach in `sync-queue.ts`
 * (which inflates binary data by ~33%) and is designed for large image
 * uploads that would otherwise exhaust the structured-clone quota.
 *
 * Each entry holds:
 *   - id            : stable client-generated id
 *   - blob          : the actual File/Blob bytes
 *   - entityType    : FileAssetEntityType (kit, tool, evidence, etc.)
 *   - entityId      : parent entity id
 *   - category      : FileAssetCategory
 *   - description   : optional metadata
 *   - tags          : optional tag array
 *   - clientMutationId : idempotency key for safe retry
 *   - createdAt     : enqueue timestamp
 *   - retryCount    : attempt counter
 *   - status        : "pending" | "in_flight" | "dead_letter"
 *   - lastError     : last failure message
 *
 * The outbox emits the `BLOB_OUTBOX_CHANGED_EVENT` custom event on any
 * mutation so listeners (e.g. `OfflineUploadQueueStatus`) can refresh.
 */

const DB_NAME = "CermontBlobOutboxDB";
const DB_VERSION = 1;
const STORE_NAME = "blob_outbox";
const BLOB_OUTBOX_CHANGED_EVENT = "blob-outbox:changed";

export type BlobOutboxStatus = "pending" | "in_flight" | "dead_letter";

export interface BlobOutboxEntry {
	id: string;
	blob: Blob;
	originalName: string;
	mimeType: string;
	sizeBytes: number;
	entityType: string;
	entityId: string;
	category: string;
	description?: string;
	tags?: string[];
	clientMutationId: string;
	createdAt: number;
	retryCount: number;
	status: BlobOutboxStatus;
	lastError?: string;
}

function hasIndexedDBSupport(): boolean {
	return typeof indexedDB !== "undefined";
}

function emitChanged(): void {
	if (typeof window === "undefined") {
		return;
	}
	window.dispatchEvent(new Event(BLOB_OUTBOX_CHANGED_EVENT));
}

function openDatabase(): Promise<IDBDatabase> {
	return new Promise((resolve, reject) => {
		const request = indexedDB.open(DB_NAME, DB_VERSION);
		request.onerror = () => reject(request.error);
		request.onsuccess = () => resolve(request.result);
		request.onupgradeneeded = (event) => {
			const db = (event.target as IDBOpenDBRequest).result;
			if (!db.objectStoreNames.contains(STORE_NAME)) {
				const store = db.createObjectStore(STORE_NAME, { keyPath: "id" });
				store.createIndex("status", "status", { unique: false });
				store.createIndex("entityType_entityId", ["entityType", "entityId"], { unique: false });
				store.createIndex("createdAt", "createdAt", { unique: false });
			}
		};
	});
}

async function readAllEntries(): Promise<BlobOutboxEntry[]> {
	if (!hasIndexedDBSupport()) {
		return [];
	}
	const db = await openDatabase();
	const tx = db.transaction(STORE_NAME, "readonly");
	const store = tx.objectStore(STORE_NAME);
	return new Promise((resolve, reject) => {
		const request = store.getAll();
		request.onerror = () => reject(request.error);
		request.onsuccess = () => {
			const entries = request.result as BlobOutboxEntry[];
			entries.sort((a, b) => a.createdAt - b.createdAt || a.id.localeCompare(b.id));
			resolve(entries);
		};
	});
}

async function writeEntry(entry: BlobOutboxEntry): Promise<void> {
	if (!hasIndexedDBSupport()) {
		return;
	}
	const db = await openDatabase();
	const tx = db.transaction(STORE_NAME, "readwrite");
	const store = tx.objectStore(STORE_NAME);
	store.put(entry);
	await new Promise<void>((resolve, reject) => {
		tx.onerror = () => reject(tx.error);
		tx.oncomplete = () => resolve();
	});
}

async function deleteEntry(id: string): Promise<void> {
	if (!hasIndexedDBSupport()) {
		return;
	}
	const db = await openDatabase();
	const tx = db.transaction(STORE_NAME, "readwrite");
	const store = tx.objectStore(STORE_NAME);
	store.delete(id);
	await new Promise<void>((resolve, reject) => {
		tx.onerror = () => reject(tx.error);
		tx.oncomplete = () => resolve();
	});
}

/**
 * Enqueue a file/image for offline upload. Returns the generated id.
 * If an entry with the same `clientMutationId` already exists, returns
 * the existing entry's id (idempotent).
 */
export async function enqueueBlobUpload(input: {
	file: File;
	entityType: string;
	entityId: string;
	category: string;
	description?: string;
	tags?: string[];
	clientMutationId: string;
}): Promise<string> {
	const entries = await readAllEntries();
	const duplicate = entries.find(
		(e) => e.clientMutationId === input.clientMutationId && e.status !== "dead_letter",
	);
	if (duplicate) {
		return duplicate.id;
	}

	const entry: BlobOutboxEntry = {
		id: `blob-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`,
		blob: input.file,
		originalName: input.file.name,
		mimeType: input.file.type || "application/octet-stream",
		sizeBytes: input.file.size,
		entityType: input.entityType,
		entityId: input.entityId,
		category: input.category,
		description: input.description,
		tags: input.tags,
		clientMutationId: input.clientMutationId,
		createdAt: Date.now(),
		retryCount: 0,
		status: "pending",
	};
	await writeEntry(entry);
	emitChanged();
	return entry.id;
}

/**
 * Get all pending (non-dead-letter) entries, ready for upload.
 */
export async function getPendingBlobUploads(): Promise<BlobOutboxEntry[]> {
	const entries = await readAllEntries();
	return entries.filter((e) => e.status === "pending" || e.status === "in_flight");
}

/**
 * Get all entries (including dead-letter) for status display.
 */
export async function getAllBlobUploads(): Promise<BlobOutboxEntry[]> {
	return readAllEntries();
}

/**
 * Get entries for a specific entity (for the attachment list).
 */
export async function getBlobUploadsByEntity(
	entityType: string,
	entityId: string,
): Promise<BlobOutboxEntry[]> {
	const entries = await readAllEntries();
	return entries.filter((e) => e.entityType === entityType && e.entityId === entityId);
}

/**
 * Get pending count for status badges.
 */
export async function getPendingBlobCount(): Promise<number> {
	const entries = await getPendingBlobUploads();
	return entries.length;
}

/**
 * Mark an entry as in-flight (prevents duplicate concurrent uploads).
 */
export async function markBlobInFlight(id: string): Promise<void> {
	const entries = await readAllEntries();
	const target = entries.find((e) => e.id === id);
	if (!target) {
		return;
	}
	target.status = "in_flight";
	await writeEntry(target);
	emitChanged();
}

/**
 * Mark an entry as successfully uploaded — removes it from the outbox.
 */
export async function markBlobUploaded(id: string): Promise<void> {
	await deleteEntry(id);
	emitChanged();
}

/**
 * Mark an entry as failed and increment retry count.
 * If retryCount exceeds maxRetries, mark as dead_letter.
 */
export async function markBlobFailed(
	id: string,
	error: string,
	maxRetries = 5,
): Promise<BlobOutboxEntry | null> {
	const entries = await readAllEntries();
	const target = entries.find((e) => e.id === id);
	if (!target) {
		return null;
	}
	target.retryCount += 1;
	target.lastError = error;
	if (target.retryCount >= maxRetries) {
		target.status = "dead_letter";
	} else {
		target.status = "pending";
	}
	await writeEntry(target);
	emitChanged();
	return target;
}

/**
 * Remove an entry from the outbox (user-initiated cancel/delete).
 */
export async function removeBlobUpload(id: string): Promise<void> {
	await deleteEntry(id);
	emitChanged();
}

/**
 * Clear all entries (for testing/reset).
 */
export async function clearBlobOutbox(): Promise<void> {
	if (!hasIndexedDBSupport()) {
		return;
	}
	const db = await openDatabase();
	const tx = db.transaction(STORE_NAME, "readwrite");
	const store = tx.objectStore(STORE_NAME);
	store.clear();
	await new Promise<void>((resolve, reject) => {
		tx.onerror = () => reject(tx.error);
		tx.oncomplete = () => resolve();
	});
	emitChanged();
}

export { BLOB_OUTBOX_CHANGED_EVENT };
