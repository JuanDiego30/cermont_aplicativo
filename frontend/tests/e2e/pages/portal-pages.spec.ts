import { expect, test } from "@playwright/test";
import { E2E_TECHNICIAN, loginAsUser } from "../auth-credentials";

test.describe("Portal Pages", () => {
	test.beforeEach(async ({ page }) => {
		await loginAsUser(page, E2E_TECHNICIAN);
	});

	test("portal home page loads", async ({ page }) => {
		await page.goto("/portal");
		await expect(page.locator("h1").first()).toBeVisible({ timeout: 15000 });
	});

	test("portal invoices page loads", async ({ page }) => {
		await page.goto("/portal/invoices");
		await expect(page.locator("body")).toBeVisible({ timeout: 15000 });
	});

	test("portal orders page loads", async ({ page }) => {
		await page.goto("/portal/orders");
		await expect(page.locator("body")).toBeVisible({ timeout: 15000 });
	});

	test("portal proposals page loads", async ({ page }) => {
		await page.goto("/portal/proposals");
		await expect(page.locator("body")).toBeVisible({ timeout: 15000 });
	});

	test("portal service cases page loads", async ({ page }) => {
		await page.goto("/portal/service-cases");
		await expect(page.locator("body")).toBeVisible({ timeout: 15000 });
	});
});
