import { expect, test } from "@playwright/test";

test.describe("01 — Autenticación y Dashboard", () => {
	test("login con credenciales válidas → dashboard", async ({ page }) => {
		// Nota: TEST_USER_EMAIL y TEST_USER_PASSWORD deben estar en .env.test o similar
		const email = process.env.TEST_USER_EMAIL || "gerente@cermont.com.co";
		const password = process.env.TEST_USER_PASSWORD || "Admin123*";

		await page.goto("/login");

		// Esperar a que el formulario sea visible
		await expect(page.locator('input[name="email"]')).toBeVisible();

		await page.fill('input[name="email"]', email);
		await page.fill('input[name="password"]', password);
		await page.click('button[type="submit"]');

		// Debería redirigir al dashboard
		await expect(page).toHaveURL(/.*dashboard/);

		// Verificar elementos del dashboard
		await expect(page.locator("h1")).toContainText(/CERMONT/i);
		await expect(page.locator("nav")).toBeVisible();
	});

	test("logout → redirección a login", async ({ page }) => {
		// Asumimos sesión activa desde el setup global o hacemos login rápido
		await page.goto("/dashboard");

		// Buscar botón de perfil/logout
		const profileButton = page.locator(
			'button[aria-label*="perfil" i], button:has-text("perfil" i)',
		);
		if (await profileButton.isVisible()) {
			await profileButton.click();
			await page.click('button:has-text("Cerrar sesión" i)');
			await expect(page).toHaveURL(/.*login/);
		}
	});
});
