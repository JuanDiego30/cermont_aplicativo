import { expect, test } from "@playwright/test";
import { E2E_ADMIN, loginAsUser } from "../auth-credentials";

test.describe("Resources and Tools Pages", () => {
	test.beforeEach(async ({ page }) => {
		await loginAsUser(page, E2E_ADMIN);
	});

	test("resources list page loads", async ({ page }) => {
		await page.goto("/resources");
		await expect(page.locator("h1").first()).toBeVisible({ timeout: 15000 });
	});

	test("resources kits page loads", async ({ page }) => {
		await page.goto("/resources/kits");
		await expect(page.locator("h1").first()).toBeVisible({ timeout: 15000 });
	});

	test("tools page loads", async ({ page }) => {
		await page.goto("/tools");
		await expect(page.locator("h1").first()).toBeVisible({ timeout: 15000 });
	});

	test("resources detail loads from list", async ({ page }) => {
		await page.goto("/resources");
		await page.waitForLoadState("networkidle", { timeout: 15000 }).catch(() => {});
		const firstLink = page.locator('a[href*="/resources/"]').first();
		if (await firstLink.isVisible({ timeout: 3000 }).catch(() => false)) {
			await firstLink.click();
			await expect(page.locator("h1").first()).toBeVisible({ timeout: 15000 });
		}
	});
});
