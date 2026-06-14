import { expect, type Page, test } from "@playwright/test";
import { E2E_ADMIN } from "./auth-credentials";

const BASE_URL = process.env.PLAYWRIGHT_TEST_BASE_URL ?? "http://localhost:3000";
const LOGIN_EMAIL = E2E_ADMIN.email;
const LOGIN_PASSWORD = E2E_ADMIN.password;
const OFFLINE_DB_NAME = "CermontOfflineDB";
const LEGACY_QUEUE_DB_NAME = "CermontSyncQueueDB";
const EXPECTED_OFFLINE_STORES = [
	"offlineDocumentTemplateLists",
	"offlineDrafts",
	"offlineFiles",
	"offlineFormSnapshots",
	"offlineMeta",
	"offlineOutbox",
	"offlineQueryCache",
	"offlineServiceCaseDetails",
	"offlineServiceCaseLists",
	"offlineSiteVisitLists",
	"offlineSyncLogs",
	"offlineWorkRequestLists",
] as const;

async function login(page: Page): Promise<void> {
	await page.goto(`${BASE_URL}/login`, { waitUntil: "domcontentloaded" });
	await page.getByLabel("Correo electrónico").first().fill(LOGIN_EMAIL);
	await page.getByLabel("Contraseña").first().fill(LOGIN_PASSWORD);
	await page
		.getByRole("button", { name: /iniciar sesión/i })
		.first()
		.click();
	await page.waitForURL(/dashboard/, { timeout: 20_000 });
	await expect(
		page.locator("#main-content").getByRole("heading", { name: "Panel de Control", exact: true }),
	).toBeVisible();
}

async function waitForServiceWorker(page: Page): Promise<string> {
	return page.evaluate(async () => {
		const registration = await navigator.serviceWorker.ready;
		const activeScriptUrl = registration.active?.scriptURL;
		if (!activeScriptUrl) {
			throw new Error("Service Worker registration has no active worker");
		}
		return activeScriptUrl;
	});
}

async function listOfflineStores(page: Page): Promise<string[]> {
	return page.evaluate(
		(databaseName) =>
			new Promise<string[]>((resolve, reject) => {
				const request = indexedDB.open(databaseName);
				request.onerror = () => reject(request.error);
				request.onsuccess = () => {
					const database = request.result;
					const stores = Array.from(database.objectStoreNames);
					database.close();
					resolve(stores);
				};
			}),
		OFFLINE_DB_NAME,
	);
}

async function waitForCachedRoute(page: Page, routePath: string): Promise<void> {
	await page.waitForFunction(
		async (path) => {
			for (const cacheName of await caches.keys()) {
				const cache = await caches.open(cacheName);
				const requests = await cache.keys();
				if (requests.some((request) => new URL(request.url).pathname === path)) {
					return true;
				}
			}
			return false;
		},
		routePath,
		{ timeout: 30_000 },
	);
}

async function waitForStoreRecord(page: Page, storeName: string): Promise<void> {
	await page.waitForFunction(
		({ databaseName, name }) =>
			new Promise<boolean>((resolve, reject) => {
				const request = indexedDB.open(databaseName);
				request.onerror = () => reject(request.error);
				request.onsuccess = () => {
					const database = request.result;
					const transaction = database.transaction(name, "readonly");
					const countRequest = transaction.objectStore(name).count();
					countRequest.onerror = () => reject(countRequest.error);
					countRequest.onsuccess = () => {
						database.close();
						resolve(countRequest.result > 0);
					};
				};
			}),
		{ databaseName: OFFLINE_DB_NAME, name: storeName },
		{ timeout: 30_000 },
	);
}

async function resetDatabase(page: Page, databaseName: string): Promise<void> {
	await page.evaluate(
		(name) =>
			new Promise<void>((resolve, reject) => {
				const request = indexedDB.deleteDatabase(name);
				request.onerror = () => reject(request.error);
				request.onblocked = () => reject(new Error(`Database ${name} is blocked`));
				request.onsuccess = () => resolve();
			}),
		databaseName,
	);
}

test.describe("Auth, Service Worker and IndexedDB regression", () => {
	test("1. login succeeds with Service Workers blocked", async ({ browser }) => {
		const context = await browser.newContext({ serviceWorkers: "block" });
		const page = await context.newPage();
		const loginStatuses: number[] = [];
		page.on("response", (response) => {
			if (new URL(response.url()).pathname === "/api/auth/login") {
				loginStatuses.push(response.status());
			}
		});

		try {
			await login(page);
			expect(loginStatuses).toContain(200);
			expect(loginStatuses).not.toContain(401);
			expect(await context.serviceWorkers()).toHaveLength(0);
		} finally {
			await context.close();
		}
	});

	test("2. login succeeds with the production Service Worker active", async ({ page }) => {
		await page.goto(`${BASE_URL}/login`, { waitUntil: "domcontentloaded" });
		const scriptUrl = await waitForServiceWorker(page);
		expect(scriptUrl).toContain("/serwist/sw.js");

		await page.getByLabel("Correo electrónico").first().fill(LOGIN_EMAIL);
		await page.getByLabel("Contraseña").first().fill(LOGIN_PASSWORD);
		const responsePromise = page.waitForResponse(
			(response) => new URL(response.url()).pathname === "/api/auth/login",
		);
		await page
			.getByRole("button", { name: /iniciar sesión/i })
			.first()
			.click();
		const response = await responsePromise;

		expect(response.status()).toBe(200);
		expect(response.fromServiceWorker()).toBe(false);
		await page.waitForURL(/dashboard/, { timeout: 20_000 });
	});

	test("3. authentication endpoints are absent from Cache Storage", async ({ page }) => {
		await login(page);
		const cachedAuthUrls = await page.evaluate(async () => {
			const urls: string[] = [];
			for (const cacheName of await caches.keys()) {
				const cache = await caches.open(cacheName);
				for (const request of await cache.keys()) {
					const pathname = new URL(request.url).pathname;
					if (pathname.startsWith("/api/auth/") || pathname.startsWith("/api/backend/auth/")) {
						urls.push(request.url);
					}
				}
			}
			return urls;
		});

		expect(cachedAuthUrls).toEqual([]);
	});

	test("4. the canonical offline database exposes every required store", async ({ page }) => {
		const pageErrors: string[] = [];
		page.on("pageerror", (error) => pageErrors.push(error.message));
		await login(page);

		await expect
			.poll(() => listOfflineStores(page), { timeout: 20_000 })
			.toEqual([...EXPECTED_OFFLINE_STORES]);
		expect(pageErrors.filter((message) => message.includes("NotFoundError"))).toEqual([]);
	});

	test("5. a v1 database upgrades without losing pending data", async ({ page }) => {
		await page.goto(`${BASE_URL}/offline.html`, { waitUntil: "domcontentloaded" });
		await resetDatabase(page, OFFLINE_DB_NAME);
		await resetDatabase(page, LEGACY_QUEUE_DB_NAME);

		const pendingId = "offline-upgrade-pending";
		await page.evaluate(
			({ databaseName, legacyDatabaseName, localId }) =>
				new Promise<void>((resolve, reject) => {
					const request = indexedDB.open(databaseName, 1);
					request.onerror = () => reject(request.error);
					request.onupgradeneeded = () => {
						const database = request.result;
						const outbox = database.createObjectStore("offlineOutbox", {
							keyPath: "localId",
						});
						database.createObjectStore("offlineDrafts", { keyPath: "localId" });
						database.createObjectStore("offlineFiles", { keyPath: "localId" });
						database.createObjectStore("offlineSyncLogs", { keyPath: "batchId" });
						database.createObjectStore("offlineFormSnapshots", { keyPath: "localId" });
						database.createObjectStore("offlineMeta", { keyPath: "key" });
						database.createObjectStore("offlineQueryCache", { keyPath: "key" });
						outbox.put({
							localId,
							entityType: "work_order",
							operation: "update",
							payload: {},
							status: "pending_sync",
							attempts: 0,
							nextRetryAt: Date.now() + 3_600_000,
							createdAt: new Date().toISOString(),
							updatedAt: new Date().toISOString(),
							idempotencyKey: "11111111-1111-4111-8111-111111111111",
							schemaVersion: "offline.v1",
							userId: "upgrade-test-user",
							endpoint: "/notifications/mark-all-read",
							method: "POST",
						});
					};
					request.onsuccess = () => {
						request.result.close();
						const legacyRequest = indexedDB.open(legacyDatabaseName, 1);
						legacyRequest.onerror = () => reject(legacyRequest.error);
						legacyRequest.onupgradeneeded = () => {
							legacyRequest.result.createObjectStore("interrupted_upgrade", {
								keyPath: "id",
							});
						};
						legacyRequest.onsuccess = () => {
							legacyRequest.result.close();
							resolve();
						};
					};
				}),
			{
				databaseName: OFFLINE_DB_NAME,
				legacyDatabaseName: LEGACY_QUEUE_DB_NAME,
				localId: pendingId,
			},
		);

		const pageErrors: string[] = [];
		page.on("pageerror", (error) => pageErrors.push(error.message));
		await login(page);

		await expect
			.poll(() => listOfflineStores(page), { timeout: 20_000 })
			.toEqual([...EXPECTED_OFFLINE_STORES]);
		const pendingWasPreserved = await page.evaluate(
			({ databaseName, localId }) =>
				new Promise<boolean>((resolve, reject) => {
					const request = indexedDB.open(databaseName);
					request.onerror = () => reject(request.error);
					request.onsuccess = () => {
						const database = request.result;
						const transaction = database.transaction("offlineOutbox", "readonly");
						const getRequest = transaction.objectStore("offlineOutbox").get(localId);
						getRequest.onerror = () => reject(getRequest.error);
						getRequest.onsuccess = () => {
							database.close();
							resolve(Boolean(getRequest.result));
						};
					};
				}),
			{ databaseName: OFFLINE_DB_NAME, localId: pendingId },
		);

		expect(pendingWasPreserved).toBe(true);
		expect(pageErrors.filter((message) => message.includes("NotFoundError"))).toEqual([]);
	});

	test("6. warmed service cases render after network loss", async ({ context, page }) => {
		await login(page);
		await waitForServiceWorker(page);
		await page.goto(`${BASE_URL}/service-cases`, { waitUntil: "domcontentloaded" });
		await expect(
			page.getByRole("heading", { name: "Casos de Servicio", exact: true }),
		).toBeVisible();
		await waitForCachedRoute(page, "/service-cases");
		await waitForStoreRecord(page, "offlineServiceCaseLists");

		await context.setOffline(true);
		await page.reload({ waitUntil: "domcontentloaded" });
		await expect(
			page.getByRole("heading", { name: "Casos de Servicio", exact: true }),
		).toBeVisible();
		await expect(page.getByRole("heading", { name: /sin conexi[oó]n/i })).toHaveCount(0);
		await context.setOffline(false);
	});

	test("7. a queued mutation is sent and removed after reconnection", async ({ context, page }) => {
		await login(page);
		const queueId = "offline-reconnect-notifications";
		await context.setOffline(true);
		await expect(page.getByTestId("offline-banner")).toHaveAttribute("title", "Sin conexión", {
			timeout: 15_000,
		});
		await page.evaluate(
			({ databaseName, localId }) =>
				new Promise<void>((resolve, reject) => {
					const request = indexedDB.open(databaseName);
					request.onerror = () => reject(request.error);
					request.onsuccess = () => {
						const database = request.result;
						const transaction = database.transaction("offlineOutbox", "readwrite");
						transaction.onerror = () => reject(transaction.error);
						transaction.oncomplete = () => {
							database.close();
							window.dispatchEvent(new Event("sync-queue:changed"));
							resolve();
						};
						transaction.objectStore("offlineOutbox").put({
							localId,
							entityType: "work_order",
							operation: "update",
							payload: {},
							status: "pending_sync",
							attempts: 0,
							createdAt: new Date().toISOString(),
							updatedAt: new Date().toISOString(),
							idempotencyKey: "22222222-2222-4222-8222-222222222222",
							schemaVersion: "offline.v1",
							userId: "reconnect-test-user",
							endpoint: "/notifications/mark-all-read",
							method: "POST",
						});
					};
				}),
			{ databaseName: OFFLINE_DB_NAME, localId: queueId },
		);

		const syncResponse = page.waitForResponse(
			(response) =>
				response.url().includes("/api/backend/notifications/mark-all-read") &&
				response.request().method() === "POST",
			{ timeout: 75_000 },
		);
		await context.setOffline(false);

		expect((await syncResponse).status()).toBe(200);
		await expect
			.poll(
				() =>
					page.evaluate(
						({ databaseName, localId }) =>
							new Promise<boolean>((resolve, reject) => {
								const request = indexedDB.open(databaseName);
								request.onerror = () => reject(request.error);
								request.onsuccess = () => {
									const database = request.result;
									const transaction = database.transaction("offlineOutbox", "readonly");
									const getRequest = transaction.objectStore("offlineOutbox").get(localId);
									getRequest.onerror = () => reject(getRequest.error);
									getRequest.onsuccess = () => {
										database.close();
										resolve(Boolean(getRequest.result));
									};
								};
							}),
						{ databaseName: OFFLINE_DB_NAME, localId: queueId },
					),
				{ timeout: 20_000 },
			)
			.toBe(false);
	});
});
