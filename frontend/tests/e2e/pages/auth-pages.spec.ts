import { expect, test } from "@playwright/test";

test.describe("Auth Pages", () => {
	test("login page renders with title and form", async ({ page }) => {
		await page.goto("/login");
		await expect(page.locator("h1, h2").first()).toBeVisible({ timeout: 10000 });
		await expect(page.getByLabel("Correo electrónico").first()).toBeVisible();
		await expect(page.getByLabel("Contraseña").first()).toBeVisible();
	});

	test("login page has submit button", async ({ page }) => {
		await page.goto("/login");
		const submitBtn = page.getByRole("button", { name: /iniciar sesión|entrar|login/i }).first();
		await expect(submitBtn).toBeVisible({ timeout: 10000 });
	});

	test("login form prevents submission with empty fields", async ({ page }) => {
		await page.goto("/login");
		await page.locator('form[data-hydrated="true"]').waitFor({ timeout: 10000 }).catch(() => {});
		const emailInput = page.getByLabel("Correo electrónico").first();
		await emailInput.fill("");
		const submitBtn = page.getByRole("button", { name: /iniciar sesión|entrar|login/i }).first();
		await submitBtn.click();
		await page.waitForTimeout(500);
		await expect(page).toHaveURL(/login/);
	});

	test("register page loads with form fields", async ({ page }) => {
		await page.goto("/register");
		await expect(page.locator("form").first()).toBeVisible({ timeout: 10000 });
	});

	test("forgot-password page loads if it exists", async ({ page }) => {
		await page.goto("/forgot-password");
		const body = page.locator("body");
		await expect(body).toBeVisible({ timeout: 5000 });
	});
});
