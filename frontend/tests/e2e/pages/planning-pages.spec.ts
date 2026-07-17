import { expect, test } from "@playwright/test";
import { E2E_ADMIN, loginAsUser } from "../auth-credentials";

test.describe("Planning Pages", () => {
	test.beforeEach(async ({ page }) => {
		await loginAsUser(page, E2E_ADMIN);
	});

	test("planning list page loads", async ({ page }) => {
		await page.goto("/planning");
		await expect(page.locator("h1").first()).toBeVisible({ timeout: 15000 });
	});

	test("planning packet new page loads", async ({ page }) => {
		await page.goto("/planning-packet/new");
		await expect(page.locator("form").first()).toBeVisible({ timeout: 15000 });
	});

	test("planning detail loads from list", async ({ page }) => {
		await page.goto("/planning");
		await page.waitForLoadState("networkidle", { timeout: 15000 }).catch(() => {});
		const firstLink = page.locator('a[href*="/planning/"]').first();
		if (await firstLink.isVisible({ timeout: 3000 }).catch(() => false)) {
			await firstLink.click();
			await expect(page.locator("h1").first()).toBeVisible({ timeout: 15000 });
		}
	});
});
