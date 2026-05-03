"use client";

import { useCallback, useEffect, useState } from "react";

const LAST_SYNC_STORAGE_KEY = "cermont:last-sync-at";
const LAST_SYNC_EVENT_NAME = "offline-sync:last-sync-updated";

function readStoredLastSyncAt(): Date | null {
	if (typeof window === "undefined") {
		return null;
	}

	const storedValue = window.localStorage.getItem(LAST_SYNC_STORAGE_KEY);
	if (!storedValue) {
		return null;
	}

	const parsedValue = new Date(storedValue);
	return Number.isNaN(parsedValue.getTime()) ? null : parsedValue;
}

export function useLastSyncAt() {
	const [lastSyncAt, setLastSyncAt] = useState<Date | null>(null);

	const refreshLastSyncAt = useCallback(() => {
		setLastSyncAt(readStoredLastSyncAt());
	}, []);

	const recordLastSyncAt = useCallback((value: Date) => {
		setLastSyncAt(value);

		if (typeof window === "undefined") {
			return;
		}

		window.localStorage.setItem(LAST_SYNC_STORAGE_KEY, value.toISOString());
		window.dispatchEvent(new Event(LAST_SYNC_EVENT_NAME));
	}, []);

	useEffect(() => {
		refreshLastSyncAt();

		window.addEventListener(LAST_SYNC_EVENT_NAME, refreshLastSyncAt);
		window.addEventListener("storage", refreshLastSyncAt);

		return () => {
			window.removeEventListener(LAST_SYNC_EVENT_NAME, refreshLastSyncAt);
			window.removeEventListener("storage", refreshLastSyncAt);
		};
	}, [refreshLastSyncAt]);

	return {
		lastSyncAt,
		recordLastSyncAt,
	};
}
