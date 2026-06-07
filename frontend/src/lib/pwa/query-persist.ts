"use client";

import type { PersistedClient, Persister } from "@tanstack/react-query-persist-client";
import {
	hasIndexedDBSupport,
	nowIso,
	type OfflineQueryCacheRecord,
	offlineDb,
} from "@/lib/offline/offline-db";

const CACHE_KEY = "tanstack-query-cache";

export const dexieQueryPersister: Persister = {
	persistClient: async (client: PersistedClient): Promise<void> => {
		if (!hasIndexedDBSupport()) {
			return;
		}
		const record: OfflineQueryCacheRecord = {
			key: CACHE_KEY,
			client,
			updatedAt: nowIso(),
		};
		await offlineDb.offlineQueryCache.put(record);
	},
	restoreClient: async () => {
		if (!hasIndexedDBSupport()) {
			return;
		}
		const record = await offlineDb.offlineQueryCache.get(CACHE_KEY);
		return record?.client;
	},
	removeClient: async (): Promise<void> => {
		if (!hasIndexedDBSupport()) {
			return;
		}
		await offlineDb.offlineQueryCache.delete(CACHE_KEY);
	},
};
