"use client";

import { useEffect } from "react";

type ServiceWorkerWithSync = ServiceWorkerRegistration & {
	sync?: {
		register(tag: string): Promise<void>;
	};
};

/**
 * ISSUE-P01 FIX: Register the service worker on client mount.
 * The SW file lives at /service-worker.js (served from public/).
 */
export function ServiceWorkerRegistration() {
	useEffect(() => {
		if (!("serviceWorker" in navigator)) {
			return;
		}

		const controller = new AbortController();
		const { signal } = controller;

		navigator.serviceWorker
			.register("/service-worker.js", { scope: "/" })
			.then((registration) => {
				if (signal.aborted) {
					return;
				}

				const syncRegistration = registration as ServiceWorkerWithSync;

				if (syncRegistration.sync) {
					syncRegistration.sync.register("sync-offline-queue").catch(() => {});
				}
			})
			.catch(() => {});

		return () => controller.abort();
	}, []);

	// This component renders nothing , registration happens in useEffect
	return null;
}
