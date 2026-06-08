import { expect, test } from "@playwright/test";

test.describe("03 — RBAC Visual", () => {
	test("pasante no ve botón de aprobación", async ({ page }) => {
		// Login como pasante (Rol restrictivo)
		await page.goto("/login");
		await page.fill('input[name="email"]', "pasante@cermont.com.co");
		await page.fill('input[name="password"]', "Admin123*");
		await page.click('button[type="submit"]');
		await expect(page).toHaveURL(/.*dashboard/);

		// Navegar a una propuesta
		await page.goto("/proposals");

		// Si hay propuestas, entrar a la primera
		const firstProposal = page.locator('table tr a, a[href*="/proposals/"]').first();
		if (await firstProposal.isVisible()) {
			await firstProposal.click();

			// Verificar que el botón "Aprobar" NO está o está deshabilitado
			const approveButton = page.locator('button:has-text("Aprobar")');
			const isVisible = await approveButton.isVisible();

			if (isVisible) {
				await expect(approveButton).toBeDisabled();
				await expect(approveButton).toHaveAttribute("aria-disabled", "true");
			} else {
				// Es aceptable que ni siquiera esté en el DOM
				expect(isVisible).toBe(false);
			}
		}
	});

	test("tecnico no accede a administración de usuarios", async ({ page }) => {
		// Login como tecnico
		await page.goto("/login");
		await page.fill('input[name="email"]', "tecnico@cermont.com.co");
		await page.fill('input[name="password"]', "Admin123*");
		await page.click('button[type="submit"]');

		// Intentar ir directo a la ruta de admin
		await page.goto("/admin/users");

		// Debería redirigir a unauthorized o mostrar error 403
		await expect(page).not.toHaveURL(/.*admin\/users/);
		// O verificar mensaje de acceso denegado
		// await expect(page.locator("text=No tiene permisos")).toBeVisible();
	});
});
