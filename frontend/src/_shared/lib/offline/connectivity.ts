"use client";

import { useEffect, useState } from "react";

export interface ConnectivityState {
	isOnline: boolean;
}

export function useConnectivity(): ConnectivityState {
	const [isOnline, setIsOnline] = useState(false);

	/*
	 * Root cause: reading navigator.onLine during render makes the first client snapshot
	 * differ from the server snapshot, which can surface as a hydration mismatch.
	 * Minimum fix: start from a neutral state and read navigator only after mount,
	 * then subscribe to online/offline events.
	 */
	useEffect(() => {
		const updateOnlineState = () => setIsOnline(navigator.onLine);

		updateOnlineState();

		window.addEventListener("online", updateOnlineState);
		window.addEventListener("offline", updateOnlineState);

		return () => {
			window.removeEventListener("online", updateOnlineState);
			window.removeEventListener("offline", updateOnlineState);
		};
	}, []);

	return { isOnline };
}
