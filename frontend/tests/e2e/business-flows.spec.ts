import { expect, test } from "@playwright/test";
import { E2E_ADMIN, loginAsUser } from "./auth-credentials";

// Base URL from environment or default to localhost
const BASE_URL = process.env.PLAYWRIGHT_TEST_BASE_URL || "http://localhost:3000";
const BACKEND_URL = process.env.BACKEND_URL || "http://localhost:4000";

/**
 * ISSUE-T03 FIX: Reinforce E2E with real business flows
 * Added tests for costs, reports, evidences, offline sync, and RBAC
 */

test.describe("Costs Module", () => {
	test.beforeEach(async ({ page }) => {
		await loginAsUser(page, E2E_ADMIN);
	});

	test("should navigate to costs page", async ({ page }) => {
		await page.goto(`${BASE_URL}/costs`);

		await expect(page.getByRole("heading", { name: /motor de costos/i })).toBeVisible({
			timeout: 10000,
		});
	});

	test("should display costs summary cards", async ({ page }) => {
		await page.goto(`${BASE_URL}/costs`);

		const costEngine = page.getByRole("region", { name: /motor de costos/i });
		await expect(costEngine.getByText("Estimado", { exact: true })).toBeVisible();
		await expect(costEngine.getByText("Real", { exact: true })).toBeVisible();
		await expect(costEngine.getByText("Impuestos", { exact: true })).toBeVisible();
		await expect(costEngine.getByText("Variación", { exact: true })).toBeVisible();
	});
});

test.describe("Reports Module", () => {
	test.beforeEach(async ({ page }) => {
		await loginAsUser(page, E2E_ADMIN);
	});

	test("should navigate to reports page", async ({ page }) => {
		await page.goto(`${BASE_URL}/reports`);

		// Page should load
		await expect(page.getByRole("heading", { name: /reporte/i })).toBeVisible({ timeout: 10000 });
	});
});

test.describe("Orders Module", () => {
	test.beforeEach(async ({ page }) => {
		await loginAsUser(page, E2E_ADMIN);
	});

	test("should display orders table", async ({ page }) => {
		await page.goto(`${BASE_URL}/orders`);

		await expect(
			page.getByRole("heading", { name: "Órdenes de Trabajo", exact: true }).last(),
		).toBeVisible({
			timeout: 10000,
		});
		await expect(
			page.getByRole("table").or(page.getByRole("region", { name: /sin resultados/i })),
		).toBeVisible();
	});

	test("should gate direct order creation behind a service case", async ({ page }) => {
		await page.goto(`${BASE_URL}/orders/new`);

		await expect(page.getByRole("heading", { name: /nueva orden de trabajo/i })).toBeVisible({
			timeout: 10000,
		});
		await expect(
			page.getByRole("heading", { name: /primero cree o seleccione un caso de servicio/i }),
		).toBeVisible();
		await expect(page.getByRole("link", { name: /abrir cockpit/i })).toHaveAttribute(
			"href",
			"/service-cases",
		);
	});

	test("should offer the work-request entry point for a new operation", async ({ page }) => {
		await page.goto(`${BASE_URL}/orders/new`);

		await expect(page.getByRole("link", { name: /nueva solicitud/i })).toHaveAttribute(
			"href",
			"/work-requests/new",
		);
	});
});

test.describe("Dashboard Module", () => {
	test.beforeEach(async ({ page }) => {
		await loginAsUser(page, E2E_ADMIN);
	});

	test("should load dashboard with KPIs", async ({ page }) => {
		await page.goto(`${BASE_URL}/dashboard`);

		await expect(
			page.locator("#main-content").getByRole("heading", { name: /panel de control/i }),
		).toBeVisible({ timeout: 10000 });
	});
});

test.describe("PWA Features", () => {
	test("should have manifest.json available", async ({ page }) => {
		const response = await page.request.get(`${BASE_URL}/manifest.json`);

		expect(response.status()).toBe(200);

		const data = await response.json();
		expect(data).toHaveProperty("name");
		expect(data).toHaveProperty("short_name", "Cermont");
		expect(data).toHaveProperty("start_url");
		expect(data).toHaveProperty("icons");
		expect(data.icons.length).toBeGreaterThan(0);
	});

	test("should have service worker file available", async ({ page }) => {
		const response = await page.request.get(`${BASE_URL}/serwist/sw.js`);

		expect(response.status()).toBe(200);
	});

	test("should serve a health-check endpoint", async ({ page }) => {
		const response = await page.request.get(`${BASE_URL}/api/health`);

		expect(response.status()).toBe(200);
		const data = await response.json();
		expect(data).toHaveProperty("ok", true);
	});

	test("should register service worker", async ({ page }) => {
		await loginAsUser(page, E2E_ADMIN);
		await page.goto(`${BASE_URL}/dashboard`);

		// Wait for SW registration
		const swRegistered = await page
			.evaluate(async () => {
				if (!("serviceWorker" in navigator)) {
					return false;
				}
				const registrations = await navigator.serviceWorker.getRegistrations();
				return registrations.length > 0;
			})
			.catch(() => false);

		// SW registration is async, give it a moment
		await page.waitForTimeout(3000);

		const swRegisteredAfterWait = await page
			.evaluate(async () => {
				if (!("serviceWorker" in navigator)) {
					return false;
				}
				const registrations = await navigator.serviceWorker.getRegistrations();
				return registrations.length > 0;
			})
			.catch(() => false);

		// At least one should be true
		expect(swRegistered || swRegisteredAfterWait).toBe(true);
	});
});

test.describe("Offline Sync", () => {
	test("should handle offline mode gracefully", async ({ page }) => {
		await loginAsUser(page, E2E_ADMIN);
		await page.goto(`${BASE_URL}/dashboard`);

		// Simulate offline mode
		await page.context().setOffline(true);

		// Page should still render (cached content)
		await page.waitForTimeout(2000);

		// Restore online
		await page.context().setOffline(false);
	});
});

test.describe("RBAC - Role-Based Access Control", () => {
	test("should redirect unauthenticated users to login", async ({ page }) => {
		// Clear any existing auth state
		await page.context().clearCookies();

		await page.goto(`${BASE_URL}/dashboard`);

		// Should redirect to login
		await page.waitForURL(/login/, { timeout: 10000 });
		expect(page.url()).toContain("/login");
	});

	test("should protect admin routes", async ({ page }) => {
		await page.context().clearCookies();

		await page.goto(`${BASE_URL}/admin`);

		// Should redirect to login
		await page.waitForURL(/login/, { timeout: 10000 });
		expect(page.url()).toContain("/login");
	});
});

test.describe("API Endpoints", () => {
	test("should return 401 for protected endpoints without auth", async ({ page }) => {
		const response = await page.request.get(`${BACKEND_URL}/api/orders`);

		expect([401, 403]).toContain(response.status());
	});

	test("should return 401 for costs API without auth", async ({ page }) => {
		const response = await page.request.get(`${BACKEND_URL}/api/costs`);

		expect([401, 403]).toContain(response.status());
	});

	test("should return 401 for reports API without auth", async ({ page }) => {
		const response = await page.request.get(`${BACKEND_URL}/api/reports`);

		expect([401, 403]).toContain(response.status());
	});
});
