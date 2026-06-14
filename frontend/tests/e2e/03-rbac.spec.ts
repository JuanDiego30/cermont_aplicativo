import { expect, test } from "@playwright/test";
import { E2E_TECHNICIAN, loginAsUser } from "./auth-credentials";

test.describe("03 — RBAC Visual", () => {
	test("técnico no ve botón de aprobación", async ({ page }) => {
		await loginAsUser(page, E2E_TECHNICIAN);

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
		await loginAsUser(page, E2E_TECHNICIAN);

		// Intentar ir directo a la ruta de admin
		await page.goto("/admin/users");

		// Debería redirigir a unauthorized o mostrar error 403
		await expect(page).not.toHaveURL(/.*admin\/users/);
		// O verificar mensaje de acceso denegado
		// await expect(page.locator("text=No tiene permisos")).toBeVisible();
	});
});
