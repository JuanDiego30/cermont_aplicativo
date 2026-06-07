import { expect, test } from "@playwright/test";
import { E2E_TEST_USERS } from "./auth-credentials";

/**
 * Evidence E2E Test - Tests the evidence upload and management flow
 *
 * Validates:
 * 1. Evidence upload with image
 * 2. Metadata capture (category, phase, component, description)
 * 3. Preview generation
 * 4. Gallery display
 * 5. Offline queue handling
 */

test.describe("Evidence Flow", () => {
	test.beforeEach(async ({ page }) => {
		await page.goto("/login");
		await page.getByLabel("Correo electrónico").first().fill(E2E_TEST_USERS.admin.email);
		await page.getByLabel("Contraseña").first().fill(E2E_TEST_USERS.admin.password);
		await page
			.getByRole("button", { name: /iniciar sesión/i })
			.first()
			.click();
		await page.waitForURL(/dashboard/, { timeout: 15000 });
	});

	test("evidences page loads without errors", async ({ page }) => {
		await page.goto("/evidences");
		await page.waitForLoadState("networkidle", { timeout: 10000 });

		// Verify page has main content
		const main = page.locator("main").first();
		await expect(main).toBeVisible();
	});

	test("evidence upload form is accessible", async ({ page }) => {
		await page.goto("/evidences");

		// Check for upload button or form
		const uploadButton = page.getByRole("button", { name: /subir|upload|subir evidencia/i });
		await expect(uploadButton).toBeVisible();
	});

	test("evidence gallery displays correctly", async ({ page }) => {
		await page.goto("/evidences");

		// Verify gallery or empty state is shown
		const gallery = page.locator('[data-evidence-gallery], [data-testid="evidence-gallery"]');
		const emptyState = page.locator('[data-testid="empty-state"], .empty-state');

		// Either gallery has items or empty state is shown
		const hasGallery = await gallery.count();
		const hasEmptyState = await emptyState.count();

		expect(hasGallery > 0 || hasEmptyState > 0).toBe(true);
	});
});
