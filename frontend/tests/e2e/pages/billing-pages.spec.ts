import { expect, test } from "@playwright/test";
import { E2E_ADMIN, loginAsUser } from "../auth-credentials";

test.describe("Billing Pages", () => {
	test.beforeEach(async ({ page }) => {
		await loginAsUser(page, E2E_ADMIN);
	});

	test("SES list page loads", async ({ page }) => {
		await page.goto("/billing/ses");
		await expect(page.locator("h1").first()).toBeVisible({ timeout: 15000 });
	});

	test("SES new page loads", async ({ page }) => {
		await page.goto("/billing/ses/new");
		await expect(page.locator("form").first()).toBeVisible({ timeout: 15000 });
	});

	test("invoices list page loads", async ({ page }) => {
		await page.goto("/billing/invoices");
		await expect(page.locator("h1").first()).toBeVisible({ timeout: 15000 });
	});

	test("invoices new page loads", async ({ page }) => {
		await page.goto("/billing/invoices/new");
		await expect(page.locator("form").first()).toBeVisible({ timeout: 15000 });
	});

	test("billing overview page loads", async ({ page }) => {
		await page.goto("/billing");
		await expect(page.locator("body")).toBeVisible({ timeout: 15000 });
	});
});
