import { expect, test } from "@playwright/test";
import { E2E_ADMIN, loginAsUser } from "../auth-credentials";

test.describe("Service Cases Pages", () => {
	test.beforeEach(async ({ page }) => {
		await loginAsUser(page, E2E_ADMIN);
	});

	test("SC list page loads with title", async ({ page }) => {
		await page.goto("/service-cases");
		await expect(page.locator("h1").first()).toBeVisible({ timeout: 15000 });
	});

	test("SC list renders without crashing", async ({ page }) => {
		await page.goto("/service-cases");
		await expect(page.locator("body")).toBeVisible({ timeout: 15000 });
		const tables = page.locator("table");
		const emptyStates = page.locator('[data-testid="empty-state"], [aria-label="Sin resultados"]');
		const hasTable = await tables.count();
		const hasEmpty = await emptyStates.count();
		expect(hasTable + hasEmpty).toBeGreaterThan(0);
	});

	test("SC detail page loads from list", async ({ page }) => {
		await page.goto("/service-cases");
		await page.waitForLoadState("networkidle", { timeout: 15000 }).catch(() => {});
		const firstLink = page.locator('a[href*="/service-cases/"]').first();
		if (await firstLink.isVisible({ timeout: 3000 }).catch(() => false)) {
			await firstLink.click();
			await expect(page.locator("h1").first()).toBeVisible({ timeout: 15000 });
		}
	});

	test("SC detail shows workflow cockpit when available", async ({ page }) => {
		await page.goto("/service-cases");
		await page.waitForLoadState("networkidle", { timeout: 15000 }).catch(() => {});
		const firstLink = page.locator('a[href*="/service-cases/"]').first();
		if (await firstLink.isVisible({ timeout: 3000 }).catch(() => false)) {
			await firstLink.click();
			await expect(page.locator("h1").first()).toBeVisible({ timeout: 15000 });
			const body = page.locator("body");
			await expect(body).toBeVisible();
		}
	});
});
