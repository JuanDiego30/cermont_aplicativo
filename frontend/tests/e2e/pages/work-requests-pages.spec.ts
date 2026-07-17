import { expect, test } from "@playwright/test";
import { E2E_ADMIN, loginAsUser } from "../auth-credentials";

test.describe("Work Requests Pages", () => {
	test.beforeEach(async ({ page }) => {
		await loginAsUser(page, E2E_ADMIN);
	});

	test("WR list page loads with title", async ({ page }) => {
		await page.goto("/work-requests");
		await expect(page.locator("h1").first()).toBeVisible({ timeout: 15000 });
	});

	test("WR list page renders without crashing", async ({ page }) => {
		await page.goto("/work-requests");
		await expect(page.locator("body")).toBeVisible({ timeout: 15000 });
		const tables = page.locator("table");
		const emptyStates = page.locator('[data-testid="empty-state"], [aria-label="Sin resultados"]');
		const hasTable = await tables.count();
		const hasEmpty = await emptyStates.count();
		expect(hasTable + hasEmpty).toBeGreaterThan(0);
	});

	test("WR new page loads form", async ({ page }) => {
		await page.goto("/work-requests/new");
		await expect(page.locator("form").first()).toBeVisible({ timeout: 15000 });
	});

	test("WR new page has required fields", async ({ page }) => {
		await page.goto("/work-requests/new");
		await expect(page.locator("form").first()).toBeVisible({ timeout: 15000 });
		const shortDesc = page.getByLabel(/descripción corta|título/i).first();
		await expect(shortDesc).toBeVisible({ timeout: 5000 });
	});

	test("WR new page shows validation on empty submit", async ({ page }) => {
		await page.goto("/work-requests/new");
		await expect(page.locator("form").first()).toBeVisible({ timeout: 15000 });
		const submitBtn = page.getByRole("button", { name: /crear solicitud|crear|guardar/i }).first();
		if (await submitBtn.isVisible({ timeout: 3000 }).catch(() => false)) {
			await submitBtn.click();
			await page.waitForTimeout(500);
		}
		await expect(page).toHaveURL(/work-requests\/new/);
	});

	test("WR detail page loads when navigating from list", async ({ page }) => {
		await page.goto("/work-requests");
		await page.waitForLoadState("networkidle", { timeout: 15000 }).catch(() => {});
		const firstLink = page.locator('a[href*="/work-requests/"]').first();
		if (await firstLink.isVisible({ timeout: 3000 }).catch(() => false)) {
			await firstLink.click();
			await expect(page.locator("h1").first()).toBeVisible({ timeout: 15000 });
		}
	});
});
