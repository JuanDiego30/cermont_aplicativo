/**
 * In-memory IndexedDB shim for the Vitest jsdom environment.
 *
 * jsdom does not provide `indexedDB`, but
 * `frontend/src/lib/offline/blob-outbox.ts` requires it. This shim
 * implements only the surface area used by the outbox code (open,
 * createObjectStore, createIndex, transaction, getAll, put, delete,
 * clear) using an in-memory Map. It is intentionally minimal: enough
 * to drive `enqueueBlobUpload`, `markBlobInFlight`, `markBlobUploaded`,
 * `markBlobFailed`, `removeBlobUpload`, `getPendingBlobUploads`,
 * `getAllBlobUploads`, `getBlobUploadsByEntity`, `getPendingBlobCount`,
 * and `clearBlobOutbox`.
 *
 * The shim is installed once per test file via
 * `installInMemoryIndexedDB()`. The blob-outbox module opens the
 * database at version `1` and only needs `onupgradeneeded` on a fresh
 * (non-existent) database to fire.
 */

type EventListener = (event: Event) => void;

class InMemoryIDBRequest<T = unknown> {
	result: T | null = null;
	error: Error | null = null;
	source: unknown = null;
	transaction: unknown = null;
	readyState: "pending" | "done" = "pending";
	onsuccess: EventListener | null = null;
	onerror: EventListener | null = null;
	onupgradeneeded: EventListener | null = null;

	fireSuccess(value: T): void {
		this.result = value;
		this.readyState = "done";
		const listener = this.onsuccess;
		if (listener) {
			listener(new Event("success"));
		}
	}

	fireError(err: Error): void {
		this.error = err;
		this.readyState = "done";
		const listener = this.onerror;
		if (listener) {
			listener(new Event("error"));
		}
	}
}

class InMemoryIDBIndex {
	constructor(
		public name: string,
		public keyPath: string | string[],
		public unique: boolean,
	) {}
}

interface DbState {
	stores: Map<string, Map<string, Record<string, unknown>>>;
}

const dbState: DbState = {
	stores: new Map(),
};

class InMemoryIDBObjectStore {
	indexes: Map<string, InMemoryIDBIndex> = new Map();
	private storage: Map<string, Record<string, unknown>>;

	constructor(
		public name: string,
		public keyPath: string | string[],
	) {
		this.storage = dbState.stores.get(name) ?? new Map();
		dbState.stores.set(name, this.storage);
	}

	createIndex(
		indexName: string,
		keyPath: string | string[],
		opts: { unique?: boolean } = {},
	): InMemoryIDBIndex {
		const index = new InMemoryIDBIndex(indexName, keyPath, Boolean(opts.unique));
		this.indexes.set(indexName, index);
		return index;
	}

	getAll(): InMemoryIDBRequest<Record<string, unknown>[]> {
		const request = new InMemoryIDBRequest<Record<string, unknown>[]>();
		queueMicrotask(() => {
			request.fireSuccess([...this.storage.values()]);
		});
		return request;
	}

	put(value: Record<string, unknown>): void {
		const key = String(value[String(this.keyPath)]);
		this.storage.set(key, value);
	}

	delete(key: string): void {
		this.storage.delete(key);
	}

	clear(): void {
		this.storage.clear();
	}
}

class InMemoryIDBTransaction {
	onerror: EventListener | null = null;
	oncomplete: EventListener | null = null;
	onabort: EventListener | null = null;
	private stores: Map<string, InMemoryIDBObjectStore>;

	constructor(
		storeNames: string[],
		public mode: "readonly" | "readwrite",
	) {
		this.stores = new Map();
		for (const storeName of storeNames) {
			const storage = dbState.stores.get(storeName);
			if (storage) {
				const wrapper = new InMemoryIDBObjectStore(storeName, "id");
				(wrapper as unknown as { storage: Map<string, Record<string, unknown>> }).storage = storage;
				this.stores.set(storeName, wrapper);
			}
		}
	}

	objectStore(storeName: string): InMemoryIDBObjectStore {
		const store = this.stores.get(storeName);
		if (!store) {
			throw new Error(`Object store ${storeName} not found in transaction`);
		}
		return store;
	}

	commit(): void {
		const listener = this.oncomplete;
		if (listener) {
			queueMicrotask(() => listener(new Event("complete")));
		}
	}
}

class InMemoryIDBDatabase {
	version: number;
	objectStoreNames: { contains: (name: string) => boolean };

	constructor(
		public name: string,
		version: number,
	) {
		this.version = version;
		this.objectStoreNames = {
			contains: (storeName: string) => dbState.stores.has(storeName),
		};
	}

	createObjectStore(
		storeName: string,
		opts: { keyPath: string | string[] },
	): InMemoryIDBObjectStore {
		return new InMemoryIDBObjectStore(storeName, opts.keyPath);
	}

	transaction(
		storeNames: string | string[],
		mode: "readonly" | "readwrite",
	): InMemoryIDBTransaction {
		const names = Array.isArray(storeNames) ? storeNames : [storeNames];
		const tx = new InMemoryIDBTransaction(names, mode);
		queueMicrotask(() => tx.commit());
		return tx;
	}

	close(): void {
		// No-op for the in-memory shim.
	}
}

function resetDbState(): void {
	dbState.stores.clear();
}

/**
 * Install a minimal in-memory IndexedDB implementation on the global
 * scope. The shim supports only the methods used by `blob-outbox.ts`.
 */
export function installInMemoryIndexedDB(): void {
	resetDbState();

	const fakeIndexedDB = {
		open(databaseName: string, version: number): InMemoryIDBRequest<InMemoryIDBDatabase> {
			const request = new InMemoryIDBRequest<InMemoryIDBDatabase>();
			queueMicrotask(() => {
				const isFresh = !dbState.stores.has(databaseName);
				const database = new InMemoryIDBDatabase(databaseName, version);

				if (isFresh) {
					const upgradeEvent = {
						target: { result: database },
					} as unknown as Event;
					const upgradeListener = request.onupgradeneeded;
					if (upgradeListener) {
						upgradeListener(upgradeEvent);
					}
				}
				request.fireSuccess(database);
			});
			return request;
		},
		deleteDatabase(databaseName: string): InMemoryIDBRequest<undefined> {
			const request = new InMemoryIDBRequest<undefined>();
			queueMicrotask(() => {
				dbState.stores.delete(databaseName);
				request.fireSuccess(undefined);
			});
			return request;
		},
	};

	Object.defineProperty(globalThis, "indexedDB", {
		value: fakeIndexedDB,
		writable: true,
		configurable: true,
	});
}
