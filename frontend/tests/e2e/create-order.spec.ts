import { expect, test } from "@playwright/test";
import { hasE2ECredentials, loginAsTestUser } from "./auth-credentials";

test("crear nueva orden de trabajo", async ({ page }) => {
	test.skip(
		!hasE2ECredentials(),
		"Authenticated E2E flows require SEED_DEFAULT_PASSWORD, PLAYWRIGHT_E2E_PASSWORD, or PLAYWRIGHT_TEST_PASSWORD",
	);

	await loginAsTestUser(page);
	await expect(page).toHaveURL(/\/dashboard$/);

	// Navigate to new order
	await page.goto("/orders/new", { waitUntil: "domcontentloaded" });

	await expect(page.getByRole("heading", { name: /nueva orden de trabajo/i })).toBeVisible();

	// Fill form
	const suffix = Date.now();
	await page.getByLabel(/tipo de orden/i).selectOption("maintenance");
	await page.getByLabel(/prioridad/i).selectOption("high");
	await page.getByLabel(/descripción/i).fill(`Orden generada desde test E2E ${suffix}`);
	await page.getByLabel(/id del activo/i).fill(`ACT-${suffix}`);
	await page.getByLabel(/nombre del activo/i).fill(`Activo Test ${suffix}`);
	await page.getByLabel(/ubicación/i).fill("Planta norte");
	await page.getByLabel(/plantilla de kit/i).fill("Kit básico de prueba");

	await page.getByRole("button", { name: /crear orden de trabajo/i }).click();

	await page.waitForURL(/\/orders\/?$/, { timeout: 15_000 });
	await expect(page).toHaveURL(/\/orders\/?$/);
});
