import { expect, type Page, test } from "@playwright/test";
import { E2E_TEST_USERS } from "./auth-credentials";

const BASE_URL = process.env.PLAYWRIGHT_TEST_BASE_URL ?? "http://localhost:3000";

async function loginAsAdmin(page: Page): Promise<void> {
	await page.goto(`${BASE_URL}/login`, { waitUntil: "domcontentloaded" });
	await page.getByLabel("Correo electrónico").first().fill(E2E_TEST_USERS.admin.email);
	await page.getByLabel("Contraseña").first().fill(E2E_TEST_USERS.admin.password);
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

async function waitForCachedRouteDocument(page: Page, routePath: string): Promise<void> {
	await page.waitForFunction(
		async (path) => {
			if (typeof path !== "string" || !("caches" in window)) {
				return false;
			}

			const cacheNames = await caches.keys();
			for (const cacheName of cacheNames) {
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

async function waitForOfflineSnapshotStores(page: Page, storeNames: string[]): Promise<void> {
	await page.waitForFunction(
		(names) =>
			new Promise<boolean>((resolve) => {
				if (!("indexedDB" in window) || names.length === 0) {
					resolve(false);
					return;
				}

				const openRequest = indexedDB.open("CermontOfflineDB");
				openRequest.onerror = () => resolve(false);
				openRequest.onsuccess = () => {
					const database = openRequest.result;
					const hasAllStores = names.every((name) => database.objectStoreNames.contains(name));
					if (!hasAllStores) {
						database.close();
						resolve(false);
						return;
					}

					const transaction = database.transaction(names, "readonly");
					let pendingStores = names.length;
					let allStoresHaveRecords = true;

					const finishStoreCheck = (hasRecords: boolean): void => {
						if (!hasRecords) {
							allStoresHaveRecords = false;
						}
						pendingStores -= 1;
						if (pendingStores === 0) {
							database.close();
							resolve(allStoresHaveRecords);
						}
					};

					transaction.onerror = () => {
						database.close();
						resolve(false);
					};

					for (const name of names) {
						const countRequest = transaction.objectStore(name).count();
						countRequest.onerror = () => {
							finishStoreCheck(false);
						};
						countRequest.onsuccess = () => {
							finishStoreCheck(countRequest.result > 0);
						};
					}
				};
			}),
		storeNames,
		{ timeout: 30_000 },
	);
}

type OfflineRouteAssertion = {
	path: string;
	heading: string | RegExp;
	localText: RegExp;
};

const internalOfflineRoutes: OfflineRouteAssertion[] = [
	{
		path: "/service-cases",
		heading: "Casos de Servicio",
		localText:
			/Sin casos de servicio|Sin casos guardados localmente|Mostrando casos guardados localmente/,
	},
	{
		path: "/work-requests",
		heading: "Solicitudes de Trabajo",
		localText:
			/No hay solicitudes|Sin solicitudes guardadas localmente|Mostrando solicitudes guardadas localmente/,
	},
	{
		path: "/site-visits",
		heading: "Visitas técnicas",
		localText:
			/Sin visitas técnicas|Sin visitas guardadas localmente|Mostrando visitas guardadas localmente/,
	},
	{
		path: "/templates",
		heading: "Plantillas documentales",
		localText:
			/Sin plantillas|Sin plantillas guardadas localmente|Mostrando plantillas guardadas localmente/,
	},
];

test.describe
	.serial("Offline-first internal routes", () => {
		const consoleMessages: string[] = [];

		test.beforeEach(async ({ page }) => {
			consoleMessages.length = 0;
			page.on("console", (message) => {
				if (message.type() === "error") {
					consoleMessages.push(message.text());
				}
			});
			page.on("pageerror", (error) => {
				consoleMessages.push(error.message);
			});
		});

		test.afterEach(async ({ context }) => {
			await context.setOffline(false);
			const swHttpErrors = consoleMessages.filter(
				(message) =>
					message.includes("/serwist/sw.js") &&
					(message.includes("404") || message.includes("503")),
			);
			expect(swHttpErrors).toEqual([]);
		});

		test("renders warmed internal modules from the app shell after network loss", async ({
			context,
			page,
		}) => {
			await loginAsAdmin(page);
			const scriptUrl = await waitForActiveServiceWorker(page);
			expect(scriptUrl).toContain("/serwist/sw.js");

			await Promise.all(
				internalOfflineRoutes.map((route) => waitForCachedRouteDocument(page, route.path)),
			);
			await waitForOfflineSnapshotStores(page, [
				"offlineServiceCaseLists",
				"offlineWorkRequestLists",
				"offlineSiteVisitLists",
				"offlineDocumentTemplateLists",
			]);

			await context.setOffline(true);

			for (const route of internalOfflineRoutes) {
				await page.goto(`${BASE_URL}${route.path}`, { waitUntil: "domcontentloaded" });
				await expect(page).toHaveURL(new RegExp(route.path.replace("/", "\\/")));
				await expect(page.getByRole("heading", { name: route.heading, exact: true })).toBeVisible();
				await expect(page.getByRole("heading", { name: /sin conexi[oó]n/i })).toHaveCount(0);
				await expect(page.getByText(route.localText)).toBeVisible();
			}
		});
	});
