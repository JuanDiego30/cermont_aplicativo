"use client";

import { useSyncExternalStore } from "react";

export interface ConnectivityState {
	isOnline: boolean;
}

function subscribeToConnectivity(onStoreChange: () => void): () => void {
	window.addEventListener("online", onStoreChange);
	window.addEventListener("offline", onStoreChange);

	return () => {
		window.removeEventListener("online", onStoreChange);
		window.removeEventListener("offline", onStoreChange);
	};
}

function getConnectivitySnapshot(): boolean {
	return navigator.onLine;
}

function getServerConnectivitySnapshot(): boolean {
	return true;
}

export function useConnectivity(): ConnectivityState {
	const isOnline = useSyncExternalStore(
		subscribeToConnectivity,
		getConnectivitySnapshot,
		getServerConnectivitySnapshot,
	);

	return { isOnline };
}
