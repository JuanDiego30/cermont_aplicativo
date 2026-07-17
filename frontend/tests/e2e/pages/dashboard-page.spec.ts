import { expect, test } from "@playwright/test";
import { E2E_ADMIN, loginAsUser } from "../auth-credentials";

test.describe("Dashboard Page", () => {
	test.beforeEach(async ({ page }) => {
		await loginAsUser(page, E2E_ADMIN);
	});

	test("dashboard loads with hero and title", async ({ page }) => {
		await page.goto("/dashboard");
		await expect(page.locator("h1").first()).toBeVisible({ timeout: 10000 });
	});

	test("dashboard shows KPI grid", async ({ page }) => {
		await page.goto("/dashboard");
		const kpiCards = page.locator('[data-testid="kpi-card"], .kpi-card');
		const count = await kpiCards.count();
		expect(count).toBeGreaterThanOrEqual(3);
	});

	test("dashboard shows service case pipeline", async ({ page }) => {
		await page.goto("/dashboard");
		await expect(page.locator("text=Servicio").first()).toBeVisible({ timeout: 10000 });
	});

	test("dashboard does not crash when offline", async ({ page }) => {
		await page.context().setOffline(true);
		await page.goto("/dashboard", { timeout: 15000 });
		await expect(page.locator("body")).toBeAttached();
		await page.context().setOffline(false);
	});
});
