/**
 * Offline Queue — IndexedDB Storage Operations
 */

import { createLogger } from "@/_shared/lib/monitoring/logger";
import { DB_NAME, DB_VERSION, type OfflineAction, STORE_NAME } from "./offline-queue-types";

const logger = createLogger("pwa:offline-queue");

export function notifyOfflineQueueChanged(): void {
	if (typeof window === "undefined") {
		return;
	}
	window.dispatchEvent(new CustomEvent("offline-queue:changed"));
}

export function getDB(): Promise<IDBDatabase> {
	return new Promise((resolve, reject) => {
		const request = indexedDB.open(DB_NAME, DB_VERSION);
		request.onerror = () => reject(request.error);
		request.onsuccess = () => resolve(request.result);
		request.onupgradeneeded = (event) => {
			const db = (event.target as IDBOpenDBRequest).result;
			if (!db.objectStoreNames.contains(STORE_NAME)) {
				db.createObjectStore(STORE_NAME, { keyPath: "id" });
			}
		};
	});
}

export function generateActionId(type: OfflineAction["type"]): string {
	return `${type}-${Date.now()}-${Math.random().toString(36).slice(2, 11)}`;
}

export function normalizeStoredAction(action: OfflineAction): OfflineAction {
	return {
		...action,
		status: action.status ?? "pending",
	};
}

export async function getPendingActions(): Promise<OfflineAction[]> {
	try {
		const db = await getDB();
		const tx = db.transaction(STORE_NAME, "readonly");
		const store = tx.objectStore(STORE_NAME);
		const request = store.getAll();

		return new Promise((resolve, reject) => {
			request.onsuccess = () => resolve(request.result.map(normalizeStoredAction));
			request.onerror = () => reject(request.error);
		});
	} catch (err) {
		logger.error("Error obteniendo acciones", {
			error: err instanceof Error ? err.message : String(err),
			name: err instanceof Error ? err.name : "UnknownError",
		});
		return [];
	}
}

export async function saveAction(action: OfflineAction): Promise<void> {
	const db = await getDB();
	const tx = db.transaction(STORE_NAME, "readwrite");
	const store = tx.objectStore(STORE_NAME);
	store.add(action);

	return new Promise((resolve, reject) => {
		tx.oncomplete = () => {
			notifyOfflineQueueChanged();
			resolve();
		};
		tx.onerror = () => reject(tx.error);
	});
}

export async function removeAction(id: string): Promise<void> {
	try {
		const db = await getDB();
		const tx = db.transaction(STORE_NAME, "readwrite");
		const store = tx.objectStore(STORE_NAME);
		store.delete(id);

		return new Promise((resolve, reject) => {
			tx.oncomplete = () => {
				notifyOfflineQueueChanged();
				resolve();
			};
			tx.onerror = () => reject(tx.error);
		});
	} catch (err) {
		logger.error("Error removiendo acción", {
			error: err instanceof Error ? err.message : String(err),
			name: err instanceof Error ? err.name : "UnknownError",
		});
	}
}

export async function updateAction(action: OfflineAction): Promise<void> {
	try {
		const db = await getDB();
		const tx = db.transaction(STORE_NAME, "readwrite");
		const store = tx.objectStore(STORE_NAME);
		store.put(action);

		return new Promise((resolve, reject) => {
			tx.oncomplete = () => {
				notifyOfflineQueueChanged();
				resolve();
			};
			tx.onerror = () => reject(tx.error);
		});
	} catch (err) {
		logger.error("Error actualizando acción", {
			error: err instanceof Error ? err.message : String(err),
			name: err instanceof Error ? err.name : "UnknownError",
		});
	}
}

export async function clearAllActions(): Promise<void> {
	try {
		const db = await getDB();
		const tx = db.transaction(STORE_NAME, "readwrite");
		const store = tx.objectStore(STORE_NAME);
		store.clear();

		return new Promise((resolve, reject) => {
			tx.oncomplete = () => {
				notifyOfflineQueueChanged();
				resolve();
			};
			tx.onerror = () => reject(tx.error);
		});
	} catch (err) {
		logger.error("Error limpiando cola", {
			error: err instanceof Error ? err.message : String(err),
			name: err instanceof Error ? err.name : "UnknownError",
		});
	}
}
