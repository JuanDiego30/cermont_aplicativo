/**
 * Static-content regression tests for src/app/sw.ts.
 *
 * With the migration to `@serwist/turbopack`, the SW source is compiled by
 * esbuild via the Route Handler at `src/app/serwist/route.ts` and served at
 * `/serwist/sw.js`. The previous handcrafted `setCatchHandler` and bespoke
 * runtime-caching rules are gone — we now rely on `defaultCache` from
 * `@serwist/turbopack/worker` and the standard `fallbacks` config.
 *
 * These tests load the source as text and assert the architectural decisions
 * are still in place. If any of these tests fail, the SW source has regressed
 * and PWA-enabled browsers will stop working correctly.
 */

import { readFileSync } from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";

const SW_PATH = path.resolve(__dirname, "../../src/app/sw.ts");

function loadServiceWorker(): string {
	return readFileSync(SW_PATH, "utf-8");
}

describe("src/app/sw.ts — architecture", () => {
	const sw = loadServiceWorker();

	it("imports defaultCache from @serwist/turbopack/worker (recommended strategies)", () => {
		expect(sw).toMatch(/from\s+["']@serwist\/turbopack\/worker["']/);
		expect(sw).toMatch(/defaultCache/);
	});

	it("uses Serwist from 'serwist' for the constructor", () => {
		expect(sw).toMatch(/from\s+["']serwist["']/);
		expect(sw).toMatch(/new\s+Serwist\s*\(/);
	});

	it("declares __SW_MANIFEST as the build-time injected precache manifest", () => {
		expect(sw).toMatch(/__SW_MANIFEST/);
		expect(sw).toMatch(/precacheEntries:\s*self\.__SW_MANIFEST/);
	});

	it("uses fallbacks config (not setCatchHandler) for /~offline and /offline.html", () => {
		expect(sw).toMatch(/fallbacks:\s*\{/);
		expect(sw).toMatch(/OFFLINE_URL/);
		expect(sw).toMatch(/OFFLINE_HTML_URL/);
		expect(sw).not.toMatch(/setCatchHandler/);
	});

	it("does not use the offline page as a navigation app shell", () => {
		expect(sw).not.toMatch(/navigateFallback:\s*OFFLINE_URL/);
	});

	it("caches /_next/image with StaleWhileRevalidate (not in defaultCache for Next.js)", () => {
		expect(sw).toMatch(/\/_next\/image/);
		expect(sw).toMatch(/nextImageCaching/);
		expect(sw).toMatch(/StaleWhileRevalidate\s*\(\s*\{[^}]*cacheName:\s*["']next-images["']/s);
	});

	it("keeps authenticated API and upload responses out of Service Worker caches", () => {
		expect(sw).toMatch(/NetworkOnly/);
		expect(sw).toMatch(/noApiCaching/);
		expect(sw).toMatch(/\/api\//);
		expect(sw).toMatch(/\/uploads\//);
		expect(sw).not.toMatch(/BackgroundSyncPlugin/);
	});

	it("matches backend auth endpoints with an explicit NetworkOnly rule before defaultCache", () => {
		expect(sw).toMatch(/authApiNoCache/);
		expect(sw).toMatch(/\/api\/backend\/auth\//);
		expect(sw.indexOf("authApiNoCache")).toBeLessThan(sw.indexOf("...defaultCache"));
	});

	it("uses 'cermont' as the cacheId to scope all caches to this app", () => {
		expect(sw).toMatch(/cacheId:\s*CACHE_PREFIX/);
		expect(sw).toMatch(/const\s+CACHE_PREFIX\s*=\s*["']cermont["']/);
	});

	it("skips waiting and claims clients on install/activate", () => {
		expect(sw).toMatch(/skipWaiting:\s*true/);
		expect(sw).toMatch(/clientsClaim:\s*true/);
	});

	it("enables navigationPreload for faster navigations", () => {
		expect(sw).toMatch(/navigationPreload:\s*true/);
	});

	it("cleans up outdated caches on activate", () => {
		expect(sw).toMatch(/cleanupOutdatedCaches:\s*true/);
	});

	it("handles CLEAR_CACHE message to wipe all cermont-* caches", () => {
		expect(sw).toMatch(/CLEAR_CACHE/);
		expect(sw).toMatch(/caches\.delete\(name\)/);
		expect(sw).toMatch(/name\.startsWith\(CACHE_PREFIX\)/);
	});

	it("rejects responses that carry Set-Cookie (no cached authenticated data)", () => {
		expect(sw).toMatch(/set-cookie/);
	});

	it("calls serwist.addEventListeners() to wire fetch/push/sync", () => {
		expect(sw).toMatch(/serwist\.addEventListeners\s*\(\s*\)/);
	});
});
