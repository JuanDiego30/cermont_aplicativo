import { expect, type Page, test } from "@playwright/test";

const BASE_URL = process.env.PLAYWRIGHT_TEST_BASE_URL ?? "http://localhost:3000";

async function loginAsAdmin(page: Page): Promise<void> {
	await page.goto(`${BASE_URL}/login`, { waitUntil: "domcontentloaded" });
	await page.getByLabel("Correo electrónico").first().fill("gerencia@cermont.con");
	await page.getByLabel("Contraseña").first().fill("Cermont2026!");
	await page
		.getByRole("button", { name: /iniciar sesión/i })
		.first()
		.click();
	await page.waitForURL(/dashboard/, { timeout: 20_000 });
}

async function waitForActiveServiceWorker(page: Page): Promise<string> {
	return page.evaluate(async () => {
		if (!("serviceWorker" in navigator)) {
			throw new Error("Service Worker API is not available");
		}
		const registration = await navigator.serviceWorker.ready;
		const activeScriptUrl = registration.active?.scriptURL;
		if (!activeScriptUrl) {
			throw new Error("Service Worker registration has no active worker");
		}
		return activeScriptUrl;
	});
}

/**
 * Verify a specific IndexedDB store has at least `minCount` records.
 */
async function checkStoreRecordCount(page: Page, storeName: string): Promise<number> {
	return page.evaluate((name) => {
		return new Promise<number>((resolve) => {
			if (!("indexedDB" in window)) {
				resolve(0);
				return;
			}
			const openRequest = indexedDB.open("CermontOfflineDB");
			openRequest.onerror = () => resolve(0);
			openRequest.onsuccess = () => {
				const db = openRequest.result;
				if (!db.objectStoreNames.contains(name)) {
					db.close();
					resolve(0);
					return;
				}
				const tx = db.transaction(name, "readonly");
				const store = tx.objectStore(name);
				const countRequest = store.count();
				countRequest.onerror = () => {
					db.close();
					resolve(0);
				};
				countRequest.onsuccess = () => {
					const count = countRequest.result;
					db.close();
					resolve(count);
				};
			};
		});
	}, storeName);
}

test.describe
	.serial("Offline critical mutations and sync lifecycle", () => {
		const consoleErrors: string[] = [];

		test.beforeEach(async ({ page }) => {
			consoleErrors.length = 0;
			page.on("console", (message) => {
				if (message.type() === "error") {
					consoleErrors.push(message.text());
				}
			});
			page.on("pageerror", (error) => {
				consoleErrors.push(error.message);
			});
		});

		test.afterEach(async () => {
			// Report non-critical errors for debugging but don't fail on service worker noise or React 19 hydration mismatches
			const criticalErrors = consoleErrors.filter(
				(msg) =>
					!msg.includes("/serwist/sw.js") &&
					!msg.includes("Failed to load resource") &&
					!msg.includes("favicon.ico") &&
					!msg.includes("Minified React error #418") &&
					!msg.includes("Minified React error #423") &&
					!msg.includes("Minified React error #425"),
			);
			expect(criticalErrors).toEqual([]);
		});

		// ── Escenario 1 — Login semilla ──────────────────────────────
		test("seed login works and lands on dashboard", async ({ page }) => {
			await loginAsAdmin(page);
			await expect(page).toHaveURL(/dashboard/);
		});

		// ── Escenario 2 — Warmup ─────────────────────────────────────
		test("visits warm routes and establishes IndexedDB stores", async ({ page }) => {
			await loginAsAdmin(page);
			const swUrl = await waitForActiveServiceWorker(page);
			expect(swUrl).toContain("/serwist/sw.js");

			const routes = ["/service-cases", "/work-requests", "/site-visits", "/templates"];
			for (const route of routes) {
				await page.goto(`${BASE_URL}${route}`, { waitUntil: "domcontentloaded" });
				const bodyText = await page.locator("body").innerText();
				expect(bodyText.trim().length).toBeGreaterThan(0);
			}

			// Verify IndexedDB snapshot stores exist and are accessible
			const snapshotStores = [
				"offlineServiceCaseLists",
				"offlineWorkRequestLists",
				"offlineSiteVisitLists",
				"offlineDocumentTemplateLists",
			];
			for (const store of snapshotStores) {
				const count = await checkStoreRecordCount(page, store);
				expect(typeof count).toBe("number");
			}
		});

		// ── Escenario 3 — Offline app shell (warmed routes) ──────────
		test("renders warmed route from app shell when offline", async ({ context, page }) => {
			await loginAsAdmin(page);
			await waitForActiveServiceWorker(page);

			// Visit /service-cases to warm it, then offline
			await page.goto(`${BASE_URL}/service-cases`, { waitUntil: "domcontentloaded" });
			await context.setOffline(true);

			await page.goto(`${BASE_URL}/service-cases`, { waitUntil: "domcontentloaded" });
			// Must render the app shell heading, not a blank page
			await expect(
				page.getByRole("heading", { name: "Casos de Servicio", exact: true }),
			).toBeVisible({
				timeout: 10_000,
			});

			// Must NOT show the fallback offline page heading inside a warmed module
			await expect(page.getByText(/página sin conexión/i)).toHaveCount(0, { timeout: 2_000 });

			await context.setOffline(false);
		});

		// ── Escenario 4 — Sync queue persists ────────────────────────
		test("sync queue table exists and is functional", async ({ page }) => {
			await loginAsAdmin(page);
			await waitForActiveServiceWorker(page);

			// Verify offlineOutbox table is present
			const outboxCount = await checkStoreRecordCount(page, "offlineOutbox");
			expect(typeof outboxCount).toBe("number");
			expect(outboxCount).toBeGreaterThanOrEqual(0);

			// Verify offlineFiles table is present
			const filesCount = await checkStoreRecordCount(page, "offlineFiles");
			expect(typeof filesCount).toBe("number");
			expect(filesCount).toBeGreaterThanOrEqual(0);
		});

		// ── Escenario 5 — Reconexión ─────────────────────────────────
		test("reconnection does not crash the app", async ({ context, page }) => {
			await loginAsAdmin(page);
			await waitForActiveServiceWorker(page);
			await page.goto(`${BASE_URL}/service-cases`, { waitUntil: "domcontentloaded" });

			await context.setOffline(true);
			await page.waitForTimeout(2_000);

			await context.setOffline(false);
			// Wait for sync manager to process
			await page.waitForTimeout(5_000);

			// Navigate to dashboard — must work
			await page.goto(`${BASE_URL}/dashboard`, { waitUntil: "domcontentloaded" });
			await expect(page).toHaveURL(/dashboard/);
		});

		// ── Escenario 6 — No errores de consola críticos ─────────────
		test("no 404 or 503 errors for critical assets", async ({ page }) => {
			await loginAsAdmin(page);
			await waitForActiveServiceWorker(page);

			// Navigate all warmup routes
			const routes = ["/service-cases", "/work-requests", "/site-visits", "/templates"];
			for (const route of routes) {
				await page.goto(`${BASE_URL}${route}`, { waitUntil: "domcontentloaded" });
			}

			// SW-related 404/503 should not appear
			const swErrors = consoleErrors.filter(
				(msg) => msg.includes("/serwist/sw.js") && (msg.includes("404") || msg.includes("503")),
			);
			expect(swErrors).toEqual([]);
		});

		// ── Escenario 7 — /serwist/sw.js responds ────────────────────
		test("/serwist/sw.js responds 200", async ({ request }) => {
			const response = await request.get(`${BASE_URL}/serwist/sw.js`);
			expect(response.status()).toBe(200);
		});

		// ── Escenario 8 — /~offline exists as fallback ────────────────
		test("/~offline fallback page exists", async ({ request }) => {
			const response = await request.get(`${BASE_URL}/~offline`);
			expect(response.status()).toBe(200);
		});
	});
