import { expect, test } from "@playwright/test";
import { E2E_ADMIN, loginAsUser } from "../auth-credentials";

test.describe("Documents and Reports Pages", () => {
	test.beforeEach(async ({ page }) => {
		await loginAsUser(page, E2E_ADMIN);
	});

	test("documents page loads", async ({ page }) => {
		await page.goto("/documents");
		await expect(page.locator("h1").first()).toBeVisible({ timeout: 15000 });
	});

	test("document templates page loads", async ({ page }) => {
		await page.goto("/documents/templates");
		await expect(page.locator("h1").first()).toBeVisible({ timeout: 15000 });
	});

	test("reports list page loads", async ({ page }) => {
		await page.goto("/reports");
		await expect(page.locator("h1").first()).toBeVisible({ timeout: 15000 });
	});

	test("reports new page loads", async ({ page }) => {
		await page.goto("/reports/new");
		await expect(page.locator("form").first()).toBeVisible({ timeout: 15000 });
	});

	test("reports detail loads from list", async ({ page }) => {
		await page.goto("/reports");
		await page.waitForLoadState("networkidle", { timeout: 15000 }).catch(() => {});
		const firstLink = page.locator('a[href*="/reports/"]').first();
		if (await firstLink.isVisible({ timeout: 3000 }).catch(() => false)) {
			await firstLink.click();
			await expect(page.locator("h1").first()).toBeVisible({ timeout: 15000 });
		}
	});
});
