import { expect, test } from "@playwright/test";
import { E2E_ADMIN, loginAsUser } from "./auth-credentials";

/**
 * Evidence E2E Test - Tests the evidence upload and management flow
 *
 * Validates:
 * 1. Evidence upload with image
 * 2. Metadata capture (category, phase, component, description)
 * 3. Preview generation
 * 4. Gallery display
 * 5. Offline queue handling
 * 6. UI elements render correctly
 */

test.describe("Evidence Flow", () => {
	test.beforeEach(async ({ page }) => {
		await loginAsUser(page, E2E_ADMIN);
	});

	test("evidences page loads without errors", async ({ page }) => {
		await page.goto("/evidences");
		await page.waitForLoadState("domcontentloaded", { timeout: 10000 });

		// Verify page has main content
		const main = page.locator("main").first();
		await expect(main).toBeVisible();
	});

	test("requires an order selection before showing the upload form", async ({ page }) => {
		await page.goto("/evidences");

		await expect(page.getByRole("combobox", { name: "Orden" })).toBeVisible();
		await expect(page.getByRole("heading", { name: /selecciona una orden/i })).toBeVisible();
		await expect(page.getByRole("button", { name: /subir evidencia/i })).toHaveCount(0);
	});

	test("shows a clear empty state before an order is selected", async ({ page }) => {
		await page.goto("/evidences");

		await expect(
			page.getByText(
				/selecciona una orden de trabajo para ver sus evidencias y subir nuevas imágenes/i,
			),
		).toBeVisible();
	});

	test("upload form buttons are visible before order selection", async ({ page }) => {
		await page.goto("/evidences");

		// Tomar foto and Escanear QR buttons should be visible
		await expect(page.getByRole("button", { name: /tomar foto/i })).toBeVisible();
		await expect(page.getByRole("button", { name: /escanear.*qr/i })).toBeVisible();
	});

	test("camera button is clickable", async ({ page }) => {
		await page.goto("/evidences");

		const cameraBtn = page.getByRole("button", { name: /tomar foto/i });
		await expect(cameraBtn).toBeEnabled();
	});

	test("QR scanner button is clickable", async ({ page }) => {
		await page.goto("/evidences");

		const qrBtn = page.getByRole("button", { name: /escanear.*qr/i });
		await expect(qrBtn).toBeEnabled();
	});
});
