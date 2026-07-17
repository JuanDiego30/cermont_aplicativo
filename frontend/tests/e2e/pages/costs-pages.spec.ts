import { expect, test } from "@playwright/test";
import { E2E_ADMIN, loginAsUser } from "../auth-credentials";

test.describe("Costs Pages", () => {
	test.beforeEach(async ({ page }) => {
		await loginAsUser(page, E2E_ADMIN);
	});

	test("costs overview page loads", async ({ page }) => {
		await page.goto("/costs");
		await expect(page.locator("h1").first()).toBeVisible({ timeout: 15000 });
	});

	test("costs catalog page loads", async ({ page }) => {
		await page.goto("/costs/catalog");
		await expect(page.locator("h1").first()).toBeVisible({ timeout: 15000 });
	});

	test("costs detail loads from list", async ({ page }) => {
		await page.goto("/costs");
		await page.waitForLoadState("networkidle", { timeout: 15000 }).catch(() => {});
		const firstLink = page.locator('a[href*="/costs/"]').first();
		if (await firstLink.isVisible({ timeout: 3000 }).catch(() => false)) {
			await firstLink.click();
			await expect(page.locator("h1").first()).toBeVisible({ timeout: 15000 });
		}
	});
});
