"use client";

import { useEffect, useState } from "react";
import { useConnectivity } from "@/_shared/lib/offline/connectivity";
import { useLastSyncAt } from "./useLastSyncAt";

export interface SyncConnectivityState {
	isOnline: boolean;
	lastSyncAt: Date | null;
}

export function useSyncConnectivity(): SyncConnectivityState {
	const { isOnline } = useConnectivity();
	const { lastSyncAt } = useLastSyncAt();
	const [mounted, setMounted] = useState(false);

	useEffect(() => {
		setMounted(true);
	}, []);

	return {
		isOnline: mounted ? isOnline : true,
		lastSyncAt,
	};
}
