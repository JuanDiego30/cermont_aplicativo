import { defaultCache } from "@serwist/next/worker";
import type { PrecacheEntry, SerwistGlobalConfig } from "serwist";
import {
	CacheableResponsePlugin,
	CacheFirst,
	ExpirationPlugin,
	NetworkOnly,
	Serwist,
	StaleWhileRevalidate,
} from "serwist";

declare global {
	interface WorkerGlobalScope extends SerwistGlobalConfig {
		__SW_MANIFEST: (PrecacheEntry | string)[] | undefined;
	}
}

declare const self: ServiceWorkerGlobalScope;

// Remove the defaultCache rule that caches /api/* with NetworkFirst ("apis" cache).
// Auth routes (/api/auth/*) use NetworkOnly and are kept automatically.
const filteredDefaultCache = defaultCache.filter((entry) => {
	const str = JSON.stringify(entry);
	return !str.includes('"apis"');
});

const serwist = new Serwist({
	precacheEntries: self.__SW_MANIFEST,
	skipWaiting: true,
	clientsClaim: true,
	navigationPreload: false,
	disableDevLogs: true,
	runtimeCaching: [
		// 0. NetworkOnly — ALL /api/* routes bypass the SW entirely.
		//    Prevents stale cached responses and "channel closed" errors.
		//    Same-origin check prevents intercepting third-party requests.
		{
			matcher: ({ url, sameOrigin }) => sameOrigin && url.pathname.startsWith("/api/"),
			method: "GET",
			handler: new NetworkOnly(),
		},

		// defaultCache (without the /api/* NetworkFirst rule)
		...filteredDefaultCache,

		// 1. CacheFirst — Evidencias (/uploads/*) | 30 days | ignoreSearch
		{
			matcher: ({ request }) => {
				const url = new URL(request.url);
				return url.pathname.startsWith("/uploads/");
			},
			handler: new CacheFirst({
				cacheName: "cermont-evidences-cache",
				matchOptions: { ignoreSearch: true },
				plugins: [
					new CacheableResponsePlugin({ statuses: [0, 200] }),
					new ExpirationPlugin({
						maxEntries: 200,
						maxAgeSeconds: 30 * 24 * 60 * 60,
						maxAgeFrom: "last-used",
					}),
				],
			}),
		},

		// 2. CacheFirst — Static assets (JS, CSS, fonts, images)
		{
			matcher: /\.(?:js|css|webp|png|jpg|jpeg|svg|gif|woff2?|ttf|eot)$/i,
			handler: new CacheFirst({
				cacheName: "cermont-static-assets",
				plugins: [
					new CacheableResponsePlugin({ statuses: [0, 200] }),
					new ExpirationPlugin({
						maxEntries: 300,
						maxAgeSeconds: 30 * 24 * 60 * 60,
					}),
				],
			}),
		},

		// 3. StaleWhileRevalidate — Google Fonts
		{
			matcher: ({ url }) =>
				url.origin === "https://fonts.googleapis.com" || url.origin === "https://fonts.gstatic.com",
			handler: new StaleWhileRevalidate({
				cacheName: "cermont-google-fonts",
				plugins: [
					new CacheableResponsePlugin({ statuses: [0, 200] }),
					new ExpirationPlugin({
						maxEntries: 30,
						maxAgeSeconds: 30 * 24 * 60 * 60,
					}),
				],
			}),
		},
	],
	fallbacks: {
		entries: [
			{
				url: "/offline",
				matcher({ request }) {
					return request.destination === "document";
				},
			},
		],
	},
});

// Background Sync — tag cermont-offline-sync
self.addEventListener("sync", (event) => {
	if (event.tag === "cermont-offline-sync") {
		event.waitUntil(
			(async () => {
				const allClients = await self.clients.matchAll({ type: "window" });
				for (const client of allClients) {
					client.postMessage({ type: "OFFLINE_SYNC_TRIGGER" });
				}
			})(),
		);
	}
});

// Push notifications — critical orders
self.addEventListener("push", (event) => {
	let data: { title?: string; body?: string; url?: string } | undefined;
	try {
		data = event.data?.json() as { title?: string; body?: string; url?: string } | undefined;
	} catch {
		// non-JSON push payload
	}
	const title = data?.title ?? "Cermont Campo";
	const body = data?.body ?? "Tienes una nueva notificacion";
	const url = data?.url ?? "/dashboard";

	event.waitUntil(
		self.registration.showNotification(title, {
			body,
			icon: "/icons/icon-192x192.png",
			badge: "/icons/icon-192x192.png",
			data: { url },
			actions: [{ action: "open", title: "Ver detalle" }],
		} as NotificationOptions),
	);
});

// Notification click
self.addEventListener("notificationclick", (event) => {
	event.notification.close();
	const targetUrl = (event.notification.data as { url?: string })?.url ?? "/dashboard";
	event.waitUntil(
		self.clients.matchAll({ type: "window", includeUncontrolled: true }).then((clients) => {
			for (const client of clients) {
				if ("focus" in client) {
					client.focus();
					client.navigate(targetUrl);
					return;
				}
			}
			self.clients.openWindow(targetUrl);
		}),
	);
});

serwist.addEventListeners();
