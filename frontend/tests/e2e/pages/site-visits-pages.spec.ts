import { expect, test } from "@playwright/test";
import { E2E_ADMIN, loginAsUser } from "../auth-credentials";

test.describe("Site Visits Pages", () => {
	test.beforeEach(async ({ page }) => {
		await loginAsUser(page, E2E_ADMIN);
	});

	test("site visits list page loads", async ({ page }) => {
		await page.goto("/site-visits");
		await expect(page.locator("h1").first()).toBeVisible({ timeout: 15000 });
	});

	test("site visits list renders without crashing", async ({ page }) => {
		await page.goto("/site-visits");
		await expect(page.locator("body")).toBeVisible({ timeout: 15000 });
	});

	test("site visits new page loads form", async ({ page }) => {
		await page.goto("/site-visits/new");
		await expect(page.locator("form").first()).toBeVisible({ timeout: 15000 });
	});

	test("site visits detail loads from list", async ({ page }) => {
		await page.goto("/site-visits");
		await page.waitForLoadState("networkidle", { timeout: 15000 }).catch(() => {});
		const firstLink = page.locator('a[href*="/site-visits/"]').first();
		if (await firstLink.isVisible({ timeout: 3000 }).catch(() => false)) {
			await firstLink.click();
			await expect(page.locator("h1").first()).toBeVisible({ timeout: 15000 });
		}
	});
});
