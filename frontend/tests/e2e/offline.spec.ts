import { expect, type Page, test } from "@playwright/test";
import { E2E_ADMIN } from "./auth-credentials";

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
			await page.goto(`${BASE_URL}/login`, { waitUntil: "domcontentloaded" });
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
			await page.goto(`${BASE_URL}/login`, { waitUntil: "domcontentloaded" });
			await waitForActiveServiceWorker(page);

			await context.setOffline(true);
			await page.goto(`${BASE_URL}/offline-unvisited-${Date.now()}`, {
				waitUntil: "domcontentloaded",
			});

			await expect(page.getByRole("heading", { name: /sin conexi[oó]n/i })).toBeVisible();
			await expect(page.getByRole("button", { name: /^reintentar$/i })).toBeVisible();
		});

		test("shows and clears the offline banner when connectivity changes", async ({ page }) => {
			// Banner is auth-gated, so login and navigate to a protected route
			await page.goto(`${BASE_URL}/login`, { waitUntil: "domcontentloaded" });
			await page.getByLabel("Correo electrónico").first().fill(E2E_ADMIN.email);
			await page.getByLabel("Contraseña").first().fill(E2E_ADMIN.password);
			await page
				.getByRole("button", { name: /iniciar sesión/i })
				.first()
				.click();
			await page.waitForURL(/dashboard/, { timeout: 20_000 });
			await waitForActiveServiceWorker(page);

			// Go to a protected route to ensure OfflineBanner mounts
			await page.goto(`${BASE_URL}/dashboard`, { waitUntil: "domcontentloaded" });
			// Wait for React to hydrate and the connectivity monitor to register listeners
			await expect(
				page.getByRole("heading", { name: "Panel de Control", exact: true }).first(),
			).toBeVisible({ timeout: 15_000 });

			// Step 1: Make connectivity check endpoints fail so checkRealConnectivity
			// returns false when the monitor next probes reachability.
			// We do NOT use context.setOffline(true) because it sets navigator.onLine
			// to false, which causes runConnectivityCheck to short-circuit via the
			// !navigator.onLine check BEFORE calling checkRealConnectivity. By keeping
			// navigator.onLine=true and instead failing the real pings, we trigger
			// the checkRealConnectivity path which correctly calls setConnectivity.
			await page.route("**/api/backend/health", (route) => route.abort("internetdisconnected"));
			await page.route("**/serwist/sw.js", (route) => route.abort("internetdisconnected"));

			// Step 2: Trigger a bounded connectivity check by dispatching a synthetic
			// event. The event listener's handleConnectivityHint → requestBoundedCheck
			// will schedule runConnectivityCheck. Since navigator.onLine is still true,
			// it bypasses the short-circuit and calls checkRealConnectivity, which
			// fails because the routes are aborted → setConnectivity(false).
			await page.evaluate(() => window.dispatchEvent(new Event("offline")));
			const offlineBanner = page.getByTestId("offline-banner");
			await expect(offlineBanner).toBeVisible({ timeout: 15_000 });
			await expect(offlineBanner).toHaveAttribute("title", "Sin conexión");
			await expect(offlineBanner).toContainText("Offline");

			// Step 3: Restore connectivity by un-routing the health endpoints and
			// dispatching a synthetic online event to trigger a bounded check.
			await page.unroute("**/api/backend/health");
			await page.unroute("**/serwist/sw.js");
			await page.evaluate(() => window.dispatchEvent(new Event("online")));
			await expect(offlineBanner).toBeHidden({ timeout: 20_000 });
		});
	});
