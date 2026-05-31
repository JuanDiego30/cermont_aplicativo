import { expect, test } from "@playwright/test";
import { E2E_LOGIN_EMAIL } from "./auth-credentials";

const backendUrl = process.env.BACKEND_URL ?? "http://localhost:4000";

test.describe("Authentication Flow", () => {
	test("login page loads correctly", async ({ page }) => {
		await page.goto("/login");

		// Verify we're on the login page
		await expect(page).toHaveURL(/login/);

		// Verify the heading is present
		await expect(page.getByRole("heading", { name: /bienvenido de nuevo/i })).toBeVisible();

		// Verify form fields are present (2 instances: mobile + desktop)
		await expect(page.getByLabel("Correo electrónico").first()).toBeVisible();
		await expect(page.getByLabel("Contraseña").first()).toBeVisible();
	});

	test("shows error on invalid credentials", async ({ page }) => {
		await page.goto("/login");
		await page.waitForLoadState("networkidle");

		// Fill form using accessible locators
		await page.getByLabel("Correo electrónico").first().fill(E2E_LOGIN_EMAIL);
		await page.getByLabel("Contraseña").first().fill("wrongpassword");

		// Wait for the API response before checking DOM
		const responsePromise = page.waitForResponse(
			(resp) =>
				resp.url().includes("/api/auth/login") ||
				resp.url().includes("/api/backend/auth/login"),
		);
		await page
			.getByRole("button", { name: /iniciar sesión/i })
			.first()
			.click();
		await responsePromise;

		// Should show an explicit backend error (handles both 401 and rate-limit 429)
		await expect(
			page.locator('[data-login-form] [role="alert"]'),
		).toBeVisible();
		await expect(page).toHaveURL(/\/login$/);
	});

	test("forgot password page loads", async ({ page }) => {
		await page.goto("/forgot-password");
		await expect(page).toHaveURL(/forgot-password/);
	});
});

test.describe("Navigation Guards", () => {
	test("redirects unauthenticated users to login", async ({ page }) => {
		await page.goto("/dashboard");

		// Should redirect to login
		await expect(page).toHaveURL(/login/);
	});

	test("API returns 401 for unauthenticated requests", async ({ request }) => {
		const response = await request.get(`${backendUrl}/api/orders`);

		expect([401, 403]).toContain(response.status());
	});
});

test.describe("Health & Accessibility", () => {
	test("login page has proper meta tags", async ({ page }) => {
		await page.goto("/login");

		const title = await page.title();
		expect(title.length).toBeGreaterThan(0);
	});

	test("login form is keyboard accessible", async ({ page }) => {
		await page.goto("/login");

		// Tab to the first focusable element
		await page.keyboard.press("Tab");

		// Verify a form element is focused
		const focusedTag = await page.evaluate(() => document.activeElement?.tagName.toLowerCase());
		expect(["input", "a", "button"]).toContain(focusedTag);
	});
});
