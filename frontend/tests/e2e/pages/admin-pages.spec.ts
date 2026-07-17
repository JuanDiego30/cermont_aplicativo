import { expect, test } from "@playwright/test";
import { E2E_ADMIN, loginAsUser } from "../auth-credentials";

test.describe("Admin Pages", () => {
	test.beforeEach(async ({ page }) => {
		await loginAsUser(page, E2E_ADMIN);
	});

	test("admin users list page loads", async ({ page }) => {
		await page.goto("/admin/users");
		await expect(page.locator("h1").first()).toBeVisible({ timeout: 15000 });
	});

	test("admin users new page loads", async ({ page }) => {
		await page.goto("/admin/users/new");
		await expect(page.locator("form").first()).toBeVisible({ timeout: 15000 });
	});

	test("admin audit page loads", async ({ page }) => {
		await page.goto("/admin/audit");
		await expect(page.locator("h1").first()).toBeVisible({ timeout: 15000 });
	});

	test("admin settings page loads", async ({ page }) => {
		await page.goto("/admin/settings");
		await expect(page.locator("h1").first()).toBeVisible({ timeout: 15000 });
	});

	test("admin personnel page loads", async ({ page }) => {
		await page.goto("/admin/personnel");
		await expect(page.locator("h1").first()).toBeVisible({ timeout: 15000 });
	});

	test("admin backups page loads", async ({ page }) => {
		await page.goto("/admin/backups");
		await expect(page.locator("h1").first()).toBeVisible({ timeout: 15000 });
	});

	test("admin custom fields page loads", async ({ page }) => {
		await page.goto("/admin/custom-fields");
		await expect(page.locator("h1").first()).toBeVisible({ timeout: 15000 });
	});
});
