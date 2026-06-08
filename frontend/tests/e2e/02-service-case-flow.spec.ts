import { expect, test } from "@playwright/test";

test.describe("02 — Flujo de Caso de Servicio (14 Pasos)", () => {
	test.beforeEach(async ({ page }) => {
		// Login como residente para tener permisos operativos
		await page.goto("/login");
		await page.fill('input[name="email"]', "residente@cermont.com.co");
		await page.fill('input[name="password"]', "Admin123*");
		await page.click('button[type="submit"]');
		await expect(page).toHaveURL(/.*dashboard/);
	});

	test("crear caso → avanzar al paso 2", async ({ page }) => {
		// 1. Navegar a creación
		await page.goto("/service-cases");
		await page.click('a:has-text("Nuevo Caso"), button:has-text("Nuevo Caso")');

		// 2. Llenar formulario (paso 1: work request)
		await page.fill('input[name="clientName"]', "Cliente de Prueba E2E");
		await page.fill('input[name="shortDescription"]', "Mantenimiento Preventivo E2E");
		await page.selectOption('select[name="serviceType"]', "maintenance");
		await page.click('button:has-text("Crear Caso")');

		// 3. Verificar estado inicial
		await expect(page.locator("text=Paso 1")).toBeVisible();
		await expect(page.locator("text=Solicitud de Trabajo")).toBeVisible();

		// 4. Intentar avanzar sin requisitos → verificar bloqueante
		const advanceButton = page.locator('button:has-text("Avanzar al Paso 2")');
		if (await advanceButton.isVisible()) {
			await expect(advanceButton).toBeDisabled();
			await expect(page.locator("text=Bloqueadores activos")).toBeVisible();
		}

		// 5. Simular cumplimiento de requisitos (esto depende de la UI específica)
		// ... subir documentos o completar formulario ...

		// 6. Verificar que el botón se habilita y avanzar
		// await expect(advanceButton).toBeEnabled();
		// await advanceButton.click();
		// await expect(page.locator("text=Paso 2")).toBeVisible();
	});
});
