import { expect, type Page, test } from "@playwright/test";

const BASE_URL = process.env.PLAYWRIGHT_TEST_BASE_URL ?? "http://localhost:3000";

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

test.describe
	.serial("Offline PWA production behavior", () => {
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

		test("/serwist/sw.js responds with the generated worker", async ({ request }) => {
			const response = await request.get(`${BASE_URL}/serwist/sw.js`);

			expect(response.status()).toBe(200);
			expect(response.headers()["content-type"]?.toLowerCase()).toContain("javascript");

			const body = await response.text();
			expect(body).toContain("serwist");
			expect(body).toContain("/~offline");
		});

		test("registers and activates the Serwist service worker", async ({ page }) => {
			await page.goto(`${BASE_URL}/login`, { waitUntil: "domcontentloaded" });

			const scriptUrl = await waitForActiveServiceWorker(page);

			expect(scriptUrl).toContain("/serwist/sw.js");
		});

		test("refreshes a visited route while offline without a blank screen", async ({
			context,
			page,
		}) => {
			await page.goto(`${BASE_URL}/login`, { waitUntil: "networkidle" });
			await waitForActiveServiceWorker(page);

			await context.setOffline(true);
			await page.reload({ waitUntil: "domcontentloaded" });

			const bodyText = await page.locator("body").innerText();
			expect(bodyText.trim().length).toBeGreaterThan(0);
			await expect(page.getByRole("heading", { name: /bienvenido de nuevo/i })).toBeVisible();
		});

		test("serves /~offline for an unvisited navigation while offline", async ({
			context,
			page,
		}) => {
			await page.goto(`${BASE_URL}/login`, { waitUntil: "networkidle" });
			await waitForActiveServiceWorker(page);

			await context.setOffline(true);
			await page.goto(`${BASE_URL}/offline-unvisited-${Date.now()}`, {
				waitUntil: "domcontentloaded",
			});

			await expect(page.getByRole("heading", { name: /sin conexi[oó]n/i })).toBeVisible();
			await expect(page.getByRole("button", { name: /^reintentar$/i })).toBeVisible();
		});

		test("shows and clears the offline banner when connectivity changes", async ({
			context,
			page,
		}) => {
			await page.goto(`${BASE_URL}/login`, { waitUntil: "networkidle" });
			await waitForActiveServiceWorker(page);

			await context.setOffline(true);
			await expect(
				page.getByText(/los cambios se sincronizar[aá]n autom[aá]ticamente/i).first(),
			).toBeVisible({ timeout: 12_000 });

			await context.setOffline(false);
			await expect(
				page.getByText(/los cambios se sincronizar[aá]n autom[aá]ticamente/i).first(),
			).toBeHidden({ timeout: 20_000 });
		});
	});
