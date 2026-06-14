import { expect, test } from "@playwright/test";
import { E2E_ADMIN, E2E_LOGIN_EMAIL, loginAsUser } from "./auth-credentials";

// Base URL from environment or default to localhost
const BASE_URL = process.env.PLAYWRIGHT_TEST_BASE_URL || "http://localhost:3000";
const BACKEND_URL = process.env.BACKEND_URL || "http://localhost:4000";

test.describe("Authentication Flow", () => {
	test("should login successfully", async ({ page }) => {
		await loginAsUser(page, E2E_ADMIN);
		await expect(page).toHaveURL(/\/dashboard$/);
		await expect(page.getByRole("heading", { name: /panel de control/i })).toBeVisible();
	});

	test("should handle login errors", async ({ page }) => {
		await page.goto(`${BASE_URL}/login`);

		// Fill with invalid password
		await page.getByLabel("Correo electrónico").first().fill(E2E_LOGIN_EMAIL);
		await page.getByLabel("Contraseña").first().fill("WrongPassword123!");

		await page
			.getByRole("button", { name: /iniciar sesión/i })
			.first()
			.click();

		await expect(page.locator('[role="alert"]:not(#__next-route-announcer__)')).toContainText(
			/credenciales inválidas|invalid (email or )?password|invalid credentials/i,
		);
		await expect(page).toHaveURL(/\/login$/);
	});
});

test.describe("Health & Performance", () => {
	test("should have health endpoint available", async ({ page }) => {
		const response = await page.request.get(`${BASE_URL}/api/health`);

		expect(response.status()).toBe(200);

		const data = await response.json();
		expect(data).toHaveProperty("ok", true);
	});

	test("should have metrics endpoint available", async ({ page }) => {
		// /api/metrics requires Bearer token — verify endpoint exists
		const response = await page.request.get(`${BACKEND_URL}/api/metrics`);

		expect(response.status()).not.toBe(404);
		expect(response.status()).not.toBe(500);
		// 200 or 401 are both valid
		expect([200, 401]).toContain(response.status());
	});

	test("should load dashboard quickly", async ({ page }) => {
		await loginAsUser(page, E2E_ADMIN);

		const startTime = Date.now();
		await page.goto(`${BASE_URL}/dashboard`, {
			waitUntil: "domcontentloaded",
			timeout: 10000,
		});

		const loadTime = Date.now() - startTime;
		expect(loadTime).toBeLessThan(5000);
		await expect(
			page.locator("#main-content").getByRole("heading", { name: /panel de control/i }),
		).toBeVisible();
	});
});
