import { useConnectivity } from "@/_shared/lib/offline/connectivity";

export function useOnlineStatus(): boolean {
	return useConnectivity().isOnline;
}
