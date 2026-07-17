import { expect, test } from "@playwright/test";
import { E2E_ADMIN, loginAsUser } from "./auth-credentials";

test.describe("Auth Full Suite", () => {
	test("login page loads with form fields", async ({ page }) => {
		await page.goto("/login");
		await expect(page.locator('form[data-hydrated="true"], form').first()).toBeVisible({ timeout: 10000 });
		await expect(page.getByLabel("Correo electrónico").first()).toBeVisible();
		await expect(page.getByLabel("Contraseña").first()).toBeVisible();
	});

	test("login succeeds with valid credentials", async ({ page }) => {
		await loginAsUser(page, E2E_ADMIN);
		await expect(page).toHaveURL(/dashboard/, { timeout: 15000 });
	});

	test("login fails with invalid credentials", async ({ page }) => {
		await page.goto("/login");
		await page.locator('form[data-hydrated="true"]').waitFor({ timeout: 10000 }).catch(() => {});
		await page.getByLabel("Correo electrónico").first().fill("invalid@cermont.test");
		await page.getByLabel("Contraseña").first().fill("wrongpassword");
		await page.getByRole("button", { name: /iniciar sesión/i }).first().click();
		await expect(page.locator("[role='alert'], .text-danger, [data-sonner-toast]")).toBeVisible({
			timeout: 10000,
		});
	});

	test("redirects to login when not authenticated", async ({ page }) => {
		await page.context().clearCookies();
		await page.goto("/dashboard");
		await expect(page).toHaveURL(/login/, { timeout: 10000 });
	});

	test("register page loads", async ({ page }) => {
		await page.goto("/register");
		await expect(page.locator("form").first()).toBeVisible({ timeout: 10000 });
	});

	test("unauthorized page displays access denied", async ({ page }) => {
		await page.goto("/unauthorized");
		await expect(page.locator("body")).toContainText(/acceso|permiso|unauthorized/i, { timeout: 5000 });
	});
});
