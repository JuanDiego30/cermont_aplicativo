"use client";

import { useEffect } from "react";

type ServiceWorkerWithSync = ServiceWorkerRegistration & {
	sync?: {
		register(tag: string): Promise<void>;
	};
};

export function ServiceWorkerRegistration() {
	useEffect(() => {
		if (process.env.NODE_ENV !== "production" || !("serviceWorker" in navigator)) {
			return;
		}

		navigator.serviceWorker.ready.then((registration) => {
			const syncReg = registration as ServiceWorkerWithSync;

			if (syncReg.sync) {
				syncReg.sync.register("cermont-offline-sync").catch(() => {
					// Background Sync not available — fallback to manual sync via useSyncManager
				});
			}
		});
	}, []);

	return null;
}
