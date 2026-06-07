"use client";

import { useConnectivity } from "@/lib/offline/connectivity";

export function useOnlineStatus(): boolean {
	return useConnectivity().isOnline;
}
