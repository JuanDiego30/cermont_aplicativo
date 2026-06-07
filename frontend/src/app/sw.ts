/// <reference lib="esnext" />
/// <reference lib="webworker" />

import { defaultCache } from "@serwist/turbopack/worker";
import type {
	PrecacheEntry,
	PrecacheFallbackEntry,
	RuntimeCaching,
	SerwistGlobalConfig,
} from "serwist";
import {
	CacheFirst,
	ExpirationPlugin,
	NetworkFirst,
	NetworkOnly,
	Serwist,
	StaleWhileRevalidate,
} from "serwist";
import { APP_ROUTES } from "../lib/routes";

declare global {
	interface WorkerGlobalScope extends SerwistGlobalConfig {
		__SW_MANIFEST: Array<PrecacheEntry | string> | undefined;
	}
}

declare const self: ServiceWorkerGlobalScope & {
	__SW_MANIFEST: Array<PrecacheEntry | string> | undefined;
};

const CACHE_PREFIX = "cermont";
const OFFLINE_URL = "/~offline";
const OFFLINE_HTML_URL = "/offline.html";
const ONE_DAY_SECONDS = 24 * 60 * 60;
const APP_NAVIGATION_ROUTES = [
	APP_ROUTES.dashboard,
	APP_ROUTES.serviceCases,
	APP_ROUTES.orders,
	APP_ROUTES.planning,
	APP_ROUTES.execution,
	APP_ROUTES.evidences,
	APP_ROUTES.reports,
	APP_ROUTES.documents,
	APP_ROUTES.workRequests,
	APP_ROUTES.siteVisits,
	APP_ROUTES.proposals,
	APP_ROUTES.purchaseOrders,
	APP_ROUTES.deliveryRecords,
	APP_ROUTES.billing,
	APP_ROUTES.payments,
	APP_ROUTES.costs,
	APP_ROUTES.assets,
	APP_ROUTES.maintenance,
	APP_ROUTES.resources,
	APP_ROUTES.templates,
	APP_ROUTES.profile,
] as const;

const cacheableWithoutCookies = {
	cacheWillUpdate: async ({ response }: { response: Response }) => {
		if (response.headers.has("set-cookie")) {
			return;
		}

		return response.status === 200 ? response : undefined;
	},
};

function matchesAppRoute(pathname: string): boolean {
	return APP_NAVIGATION_ROUTES.some(
		(route) => pathname === route || pathname.startsWith(`${route}/`),
	);
}

function acceptsHtml(request: Request): boolean {
	return request.headers.get("accept")?.includes("text/html") === true;
}

function isAppShellDocumentRequest(request: Request, url: URL): boolean {
	return (
		request.method === "GET" &&
		matchesAppRoute(url.pathname) &&
		(request.mode === "navigate" || request.destination === "document" || acceptsHtml(request))
	);
}

// CRITICAL: Requests with the X-Skip-SW header bypass ALL caching.
// Auth, payment, and other sensitive endpoints set this header via api-client.ts
// so the SW never intercepts them. This is a defense-in-depth measure
// independent of path-based matchers.
const skipSwHeaderBypass: RuntimeCaching = {
	matcher: ({ request }) => request.headers.get("X-Skip-SW") === "1",
	handler: new NetworkOnly({
		networkTimeoutSeconds: 30,
	}),
};

// CRITICAL: Auth API endpoints must never be cached or intercepted.
// Covers BOTH the Next.js proxy path (/api/auth/*) and the backend
// direct path (/api/backend/auth/*). The previous version only matched
// /api/backend/auth/* which meant /api/auth/login requests fell through
// to the generic /api/ matcher and could be corrupted by the SW.
const authApiNoCache: RuntimeCaching = {
	matcher: ({ url }) => {
		const pathname = url.pathname;
		return (
			pathname.startsWith("/api/auth/") ||
			pathname.startsWith("/api/backend/auth/")
		);
	},
	handler: new NetworkOnly({
		// Login can take > 10s on cold start (backend boot, MongoDB connection).
		// Use 30s to avoid aborting legitimate requests.
		networkTimeoutSeconds: 30,
	}),
};

// CRITICAL: Auth page navigations must never be served from cache.
// A stale cached login page could contain a CSRF token from a previous session.
const authRoutesNoCache: RuntimeCaching = {
	matcher: ({ url }) => {
		const pathname = url.pathname;
		return (
			pathname === "/login" ||
			pathname === "/register" ||
			pathname === "/forgot-password" ||
			pathname === "/reset-password" ||
			pathname === "/unauthorized" ||
			pathname.startsWith("/login/") ||
			pathname.startsWith("/register/") ||
			pathname.startsWith("/forgot-password/") ||
			pathname.startsWith("/reset-password/")
		);
	},
	handler: new NetworkOnly({
		networkTimeoutSeconds: 30,
	}),
};

// CRITICAL: All non-auth API routes must use NetworkOnly. Auth routes are
// handled by the matchers above (skipSwHeaderBypass and authApiNoCache)
// which come first in the runtimeCaching array.
const noApiCaching: RuntimeCaching = {
	matcher: ({ url }) => url.pathname.startsWith("/api/") || url.pathname.startsWith("/uploads/"),
	handler: new NetworkOnly({
		networkTimeoutSeconds: 10,
	}),
};

const nextStaticCaching: RuntimeCaching = {
	matcher: ({ request, url }) =>
		request.method === "GET" && url.pathname.startsWith("/_next/static/"),
	handler: new CacheFirst({
		cacheName: "next-static",
		plugins: [
			cacheableWithoutCookies,
			new ExpirationPlugin({
				maxEntries: 200,
				maxAgeSeconds: 30 * ONE_DAY_SECONDS,
			}),
		],
	}),
};

const nextImageCaching: RuntimeCaching = {
	matcher: ({ request, url }) =>
		request.method === "GET" && url.pathname.startsWith("/_next/image"),
	handler: new StaleWhileRevalidate({
		cacheName: "next-images",
		plugins: [
			cacheableWithoutCookies,
			new ExpirationPlugin({
				maxEntries: 100,
				maxAgeSeconds: 7 * ONE_DAY_SECONDS,
			}),
		],
	}),
};

const appImagesCaching: RuntimeCaching = {
	matcher: ({ request, url }) =>
		request.method === "GET" &&
		(url.pathname.startsWith("/images/") || url.pathname.startsWith("/landing/")),
	handler: new StaleWhileRevalidate({
		cacheName: "app-images",
		plugins: [
			cacheableWithoutCookies,
			new ExpirationPlugin({
				maxEntries: 64,
				maxAgeSeconds: 7 * ONE_DAY_SECONDS,
			}),
		],
	}),
};

const staticAssetsCaching: RuntimeCaching = {
	matcher: ({ request, url }) =>
		request.method === "GET" &&
		(url.pathname.startsWith("/icons/") || url.pathname.startsWith("/fonts/")),
	handler: new CacheFirst({
		cacheName: "static-assets",
		plugins: [
			cacheableWithoutCookies,
			new ExpirationPlugin({
				maxEntries: 48,
				maxAgeSeconds: 30 * ONE_DAY_SECONDS,
			}),
		],
	}),
};

const pageCaching: RuntimeCaching = {
	matcher: ({ request, url }) => isAppShellDocumentRequest(request, url),
	handler: new NetworkFirst({
		cacheName: "pages",
		networkTimeoutSeconds: 10,
		plugins: [
			cacheableWithoutCookies,
			new ExpirationPlugin({
				maxEntries: 50,
				maxAgeSeconds: ONE_DAY_SECONDS,
			}),
		],
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
	},
	skipWaiting: true,
	clientsClaim: true,
	navigationPreload: true,
	cacheId: CACHE_PREFIX,
	// CRITICAL: Order matters. skipSwHeaderBypass MUST be first so that
	// requests with X-Skip-SW=1 are never intercepted, regardless of path.
	// authApiNoCache MUST come before noApiCaching so auth paths are not
	// swallowed by the broader /api/ matcher.
	runtimeCaching: [
		skipSwHeaderBypass,
		authApiNoCache,
		authRoutesNoCache,
		noApiCaching,
		nextStaticCaching,
		nextImageCaching,
		appImagesCaching,
		staticAssetsCaching,
		// App shell pages use NetworkFirst with short cache
		pageCaching,
		...defaultCache,
	],
	fallbacks: {
		entries: fallbackEntries,
	},
});

self.addEventListener("message", (event: ExtendableMessageEvent) => {
	if (event.data?.type !== "CLEAR_CACHE") {
		return;
	}

	event.waitUntil(
		caches
			.keys()
			.then((cacheNames) => {
				const deletions: Promise<boolean>[] = [];
				for (const name of cacheNames) {
					if (name.startsWith(CACHE_PREFIX)) {
						deletions.push(caches.delete(name));
					}
				}
				return Promise.all(deletions);
			})
			.then(() => {
				event.ports[0]?.postMessage({ success: true });
			}),
	);
});

serwist.addEventListeners();

export { serwist };
