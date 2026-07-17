import { expect, test } from "@playwright/test";
import { E2E_ADMIN, loginAsUser } from "../auth-credentials";

test.describe("Payments and Delivery Records Pages", () => {
	test.beforeEach(async ({ page }) => {
		await loginAsUser(page, E2E_ADMIN);
	});

	test("payments list page loads", async ({ page }) => {
		await page.goto("/payments");
		await expect(page.locator("h1").first()).toBeVisible({ timeout: 15000 });
	});

	test("payments new page loads", async ({ page }) => {
		await page.goto("/payments/new");
		await expect(page.locator("form").first()).toBeVisible({ timeout: 15000 });
	});

	test("delivery records list page loads", async ({ page }) => {
		await page.goto("/delivery-records");
		await expect(page.locator("h1").first()).toBeVisible({ timeout: 15000 });
	});

	test("delivery records new page loads", async ({ page }) => {
		await page.goto("/delivery-records/new");
		await expect(page.locator("form").first()).toBeVisible({ timeout: 15000 });
	});

	test("delivery records detail loads from list", async ({ page }) => {
		await page.goto("/delivery-records");
		await page.waitForLoadState("networkidle", { timeout: 15000 }).catch(() => {});
		const firstLink = page.locator('a[href*="/delivery-records/"]').first();
		if (await firstLink.isVisible({ timeout: 3000 }).catch(() => false)) {
			await firstLink.click();
			await expect(page.locator("h1").first()).toBeVisible({ timeout: 15000 });
		}
	});
});
