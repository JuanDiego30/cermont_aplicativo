/**
 * TanStack Query Persistence — IndexedDB-based cache persist
 *
 * Saves and restores the TanStack Query cache to/from IndexedDB,
 * enabling offline access to previously fetched data.
 *
 * Usage:
 *   import { persistQueryToIndexedDB, restoreQueryFromIndexedDB } from "@/lib/pwa/query-persist";
 *
 * References:
 *   - TanStack Query: https://tanstack.com/query/latest/docs/framework/react/guides/persisters
 *   - IndexedDB API: https://developer.mozilla.org/en-US/docs/Web/API/IndexedDB_API
 */

const DB_NAME = "cermont-query-cache";
const DB_VERSION = 1;
const STORE_NAME = "query-cache";
const CACHE_KEY = "tanstack-query-cache";
const CACHE_EXPIRY_MS = 1000 * 60 * 60; // 1 hour

function openDB(): Promise<IDBDatabase> {
	return new Promise((resolve, reject) => {
		const request = indexedDB.open(DB_NAME, DB_VERSION);
		request.onupgradeneeded = () => {
			const db = request.result;
			if (!db.objectStoreNames.contains(STORE_NAME)) {
				db.createObjectStore(STORE_NAME);
			}
		};
		request.onsuccess = () => resolve(request.result);
		request.onerror = () => reject(request.error);
	});
}

export interface PersistedQueryCache {
	timestamp: number;
	state: unknown;
}

export async function persistQueryToIndexedDB(state: unknown): Promise<void> {
	try {
		const db = await openDB();
		const tx = db.transaction(STORE_NAME, "readwrite");
		const store = tx.objectStore(STORE_NAME);
		const data: PersistedQueryCache = {
			timestamp: Date.now(),
			state,
		};
		store.put(data, CACHE_KEY);
		await new Promise<void>((resolve, reject) => {
			tx.oncomplete = () => resolve();
			tx.onerror = () => reject(tx.error);
		});
		db.close();
	} catch (error) {
		console.warn("[QueryPersist] Failed to persist cache:", error);
	}
}

export async function restoreQueryFromIndexedDB(): Promise<unknown | null> {
	try {
		const db = await openDB();
		const tx = db.transaction(STORE_NAME, "readonly");
		const store = tx.objectStore(STORE_NAME);
		const data: PersistedQueryCache | undefined = await new Promise((resolve, reject) => {
			const req = store.get(CACHE_KEY);
			req.onsuccess = () => resolve(req.result);
			req.onerror = () => reject(req.error);
		});
		db.close();

		if (!data) {
			return null;
		}

		// Check expiry
		if (Date.now() - data.timestamp > CACHE_EXPIRY_MS) {
			// Cache expired — clear it
			await clearQueryCache();
			return null;
		}

		return data.state;
	} catch (error) {
		console.warn("[QueryPersist] Failed to restore cache:", error);
		return null;
	}
}

export async function clearQueryCache(): Promise<void> {
	try {
		const db = await openDB();
		const tx = db.transaction(STORE_NAME, "readwrite");
		const store = tx.objectStore(STORE_NAME);
		store.delete(CACHE_KEY);
		await new Promise<void>((resolve, reject) => {
			tx.oncomplete = () => resolve();
			tx.onerror = () => reject(tx.error);
		});
		db.close();
	} catch {
		// Silently fail on clear
	}
}
