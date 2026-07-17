import { expect, test } from "@playwright/test";
import { E2E_ADMIN, loginAsUser } from "../auth-credentials";

test.describe("Purchase Orders Pages", () => {
	test.beforeEach(async ({ page }) => {
		await loginAsUser(page, E2E_ADMIN);
	});

	test("PO list page loads", async ({ page }) => {
		await page.goto("/purchase-orders");
		await expect(page.locator("h1").first()).toBeVisible({ timeout: 15000 });
	});

	test("PO new page loads form", async ({ page }) => {
		await page.goto("/purchase-orders/new");
		await expect(page.locator("form").first()).toBeVisible({ timeout: 15000 });
	});

	test("PO detail loads from list", async ({ page }) => {
		await page.goto("/purchase-orders");
		await page.waitForLoadState("networkidle", { timeout: 15000 }).catch(() => {});
		const firstLink = page.locator('a[href*="/purchase-orders/"]').first();
		if (await firstLink.isVisible({ timeout: 3000 }).catch(() => false)) {
			await firstLink.click();
			await expect(page.locator("h1").first()).toBeVisible({ timeout: 15000 });
		}
	});
});
