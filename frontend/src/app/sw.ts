import {
	BackgroundSyncPlugin,
	CacheFirst,
	ExpirationPlugin,
	Serwist,
	StaleWhileRevalidate,
} from "serwist";
import type { PrecacheEntry, PrecacheFallbackEntry, RuntimeCaching } from "serwist";
import { defaultCache } from "@serwist/turbopack/worker";

// `__SW_MANIFEST` is injected at build time by `@serwist/turbopack`'s Route
// Handler (see `src/app/serwist/route.ts`). It contains the list of
// precacheable URLs and their revision hashes.
declare global {
	interface WorkerGlobalScope {
		__SW_MANIFEST: Array<PrecacheEntry | string>;
	}
}

declare const self: ServiceWorkerGlobalScope & {
	__SW_MANIFEST: Array<PrecacheEntry | string>;
};

const CACHE_PREFIX = "cermont";
const OFFLINE_URL = "/~offline";
const OFFLINE_HTML_URL = "/offline.html";
const NEXT_IMAGE_CACHE = `${CACHE_PREFIX}-next-image-v1`;

const cacheableWithoutCookies = {
	cacheWillUpdate: async ({ response }: { response: Response }) => {
		if (response.headers.has("set-cookie")) {
			return;
		}
		return response.status === 200 ? response : undefined;
	},
};

const nextImageCaching: RuntimeCaching = {
	matcher: ({ request, url }) =>
		request.method === "GET" &&
		(url.pathname === "/_next/image" || url.pathname.startsWith("/_next/image?")),
	handler: new StaleWhileRevalidate({
		cacheName: NEXT_IMAGE_CACHE,
		plugins: [
			cacheableWithoutCookies,
			new ExpirationPlugin({
				maxEntries: 128,
				maxAgeSeconds: 30 * 24 * 60 * 60,
				maxAgeFrom: "last-used" as const,
			}),
		],
	}),
};

const backgroundSyncQueue = new BackgroundSyncPlugin(CACHE_PREFIX, {
	maxRetentionTime: 24 * 60,
	onSync: async ({ queue }) => {
		let entry: Awaited<ReturnType<typeof queue.shiftRequest>> = await queue.shiftRequest();
		while (entry) {
			try {
				await fetch(entry.request.clone());
			} catch (error) {
				if (process.env.NODE_ENV !== "production") {
					console.warn("[SW] BackgroundSync replay failed:", error);
				}
				await queue.unshiftRequest(entry);
				throw error;
			}
			entry = await queue.shiftRequest();
		}
	},
});

const offlineQueueCaching: RuntimeCaching = {
	matcher: ({ url, request }) =>
		request.method !== "GET" &&
		(url.pathname.startsWith("/api/") || url.pathname.startsWith("/uploads/")),
	handler: new CacheFirst({
		cacheName: `${CACHE_PREFIX}-offline-queue-v1`,
		plugins: [backgroundSyncQueue],
	}),
};

const fallbackEntries: PrecacheFallbackEntry[] = [
	{ url: OFFLINE_URL, matcher: ({ request }) => request.destination === "document" },
	{ url: OFFLINE_HTML_URL, matcher: ({ request }) => request.destination === "document" },
];

const serwist = new Serwist({
	precacheEntries: self.__SW_MANIFEST,
	precacheOptions: {
		cleanupOutdatedCaches: true,
		// Explicit navigation fallback so that when the user navigates while
		// offline, the SW serves `/~offline` instead of falling back to the
		// root URL (landing page). The `defaultCache` from
		// `@serwist/turbopack/worker` includes a NetworkFirst navigation
		// strategy that defaults `navigateFallback` to `/`; we override it.
		navigateFallback: OFFLINE_URL,
		navigateFallbackDenylist: [/^\/~offline/, /^\/offline\.html$/],
	},
	skipWaiting: true,
	clientsClaim: true,
	navigationPreload: true,
	cacheId: CACHE_PREFIX,
	runtimeCaching: [
		offlineQueueCaching,
		...defaultCache,
		nextImageCaching,
	],
	fallbacks: {
		entries: fallbackEntries,
	},
});

self.addEventListener("message", (event: ExtendableMessageEvent) => {
	if (event.data && event.data.type === "CLEAR_CACHE") {
		event.waitUntil(
			caches
				.keys()
				.then((cacheNames) =>
					Promise.all(
						cacheNames
							.filter((name) => name.startsWith(CACHE_PREFIX))
							.map((name) => caches.delete(name)),
					),
				)
				.then(() => {
					event.ports[0]?.postMessage({ success: true });
				}),
		);
	}
});

serwist.addEventListeners();
