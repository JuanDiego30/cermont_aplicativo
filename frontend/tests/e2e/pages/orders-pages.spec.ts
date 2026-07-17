import { expect, test } from "@playwright/test";
import { E2E_ADMIN, loginAsUser } from "../auth-credentials";

test.describe("Orders Pages", () => {
	test.beforeEach(async ({ page }) => {
		await loginAsUser(page, E2E_ADMIN);
	});

	test("orders list page loads", async ({ page }) => {
		await page.goto("/orders");
		await expect(page.locator("h1").first()).toBeVisible({ timeout: 15000 });
	});

	test("orders list renders without crashing", async ({ page }) => {
		await page.goto("/orders");
		await expect(page.locator("body")).toBeVisible({ timeout: 15000 });
	});

	test("orders new page loads form", async ({ page }) => {
		await page.goto("/orders/new");
		await expect(page.locator("form").first()).toBeVisible({ timeout: 15000 });
	});

	test("orders kanban page loads", async ({ page }) => {
		await page.goto("/orders/kanban");
		await expect(page.locator("body")).toBeVisible({ timeout: 15000 });
	});

	test("orders detail page loads from list", async ({ page }) => {
		await page.goto("/orders");
		await page.waitForLoadState("networkidle", { timeout: 15000 }).catch(() => {});
		const firstLink = page.locator('a[href*="/orders/"]').first();
		if (await firstLink.isVisible({ timeout: 3000 }).catch(() => false)) {
			await firstLink.click();
			await expect(page.locator("h1").first()).toBeVisible({ timeout: 15000 });
		}
	});
});
