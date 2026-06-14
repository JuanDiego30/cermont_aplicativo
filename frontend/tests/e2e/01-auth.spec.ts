import { expect, test } from "@playwright/test";
import { loginAsTestUser } from "./auth-credentials";

test.describe("01 — Autenticación y Dashboard", () => {
	test("login con credenciales válidas → dashboard", async ({ page }) => {
		await loginAsTestUser(page);

		await expect(page).toHaveURL(/\/dashboard$/);
		await expect(
			page.locator("#main-content").getByRole("heading", { name: /panel de control/i }),
		).toBeVisible();
		await expect(page.getByRole("navigation", { name: "Navegación principal" })).toBeVisible();
	});

	test("logout → redirección a login", async ({ page }) => {
		await loginAsTestUser(page);

		await page.getByRole("button", { name: /menú de usuario/i }).click();
		await page.getByRole("button", { name: /cerrar sesión/i }).click();
		await expect(page).toHaveURL(/\/login$/);
	});
});
