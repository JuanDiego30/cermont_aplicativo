import { expect, test } from "@playwright/test";
import { E2E_LOGIN_EMAIL, getE2ECredentials, hasE2ECredentials } from "./auth-credentials";

test("login exitoso y redirect al dashboard", async ({ page }) => {
	test.skip(
		!hasE2ECredentials(),
		"Authenticated E2E flows require SEED_DEFAULT_PASSWORD, PLAYWRIGHT_E2E_PASSWORD, or PLAYWRIGHT_TEST_PASSWORD",
	);

	const { email, password } = getE2ECredentials();

	await page.goto("/login");

	await page.getByLabel("Correo electrónico").first().fill(email);
	await page.getByLabel("Contraseña").first().fill(password);
	await page
		.getByRole("button", { name: /iniciar sesión/i })
		.first()
		.click();

	await page.waitForURL(/dashboard/, { timeout: 15000 });
	await expect(page).toHaveURL(/\/dashboard$/);
	await expect(page.getByRole("heading", { name: /panel de control/i })).toBeVisible();
});

test("login inválido muestra mensaje de error", async ({ page }) => {
	await page.goto("/login");
	await page.waitForLoadState("networkidle");

	await page.getByLabel("Correo electrónico").first().fill(E2E_LOGIN_EMAIL);
	await page.getByLabel("Contraseña").first().fill("wrong-password");

	// Wait for the API response before checking DOM
	const responsePromise = page.waitForResponse(
		(resp) =>
			resp.url().includes("/api/auth/login") || resp.url().includes("/api/backend/auth/login"),
	);
	await page
		.getByRole("button", { name: /iniciar sesión/i })
		.first()
		.click();
	await responsePromise;

	// Verify error alert is shown inside the login form (handles both 401 and rate-limit 429)
	await expect(page.locator('[data-login-form] [role="alert"]')).toBeVisible();
	await expect(page).toHaveURL(/\/login$/);
});
