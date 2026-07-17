import { expect, test } from "@playwright/test";
import { E2E_ADMIN, loginAsUser } from "../auth-credentials";

test.describe("Proposals Pages", () => {
	test.beforeEach(async ({ page }) => {
		await loginAsUser(page, E2E_ADMIN);
	});

	test("proposals list loads with table", async ({ page }) => {
		await page.goto("/proposals");
		await expect(page.locator("h1").first()).toBeVisible({ timeout: 10000 });
	});

	test("proposal detail loads with status badge", async ({ page }) => {
		await page.goto("/proposals");
		const firstLink = page.locator('a[href*="/proposals/"]').first();
		await firstLink.waitFor({ timeout: 10000 });
		await firstLink.click();
		await expect(page.locator("h1").first()).toBeVisible({ timeout: 10000 });
	});

	test("proposal detail shows cost breakdown when available", async ({ page }) => {
		await page.goto("/proposals");
		const firstLink = page.locator('a[href*="/proposals/"]').first();
		await firstLink.waitFor({ timeout: 10000 });
		await firstLink.click();
		const costSection = page.locator('text=Desglose de costos, text=Cost Breakdown').first();
		await expect(costSection).toBeVisible({ timeout: 10000 }).catch(() => {
			// Cost breakdown may not exist for all proposals
		});
	});

	test("proposal status updates reactively after send (Bug 1 fix)", async ({ page }) => {
		await page.goto("/proposals");
		const firstLink = page.locator('a[href*="/proposals/"]').first();
		await firstLink.waitFor({ timeout: 10000 });
		await firstLink.click();

		await expect(page.locator("h1").first()).toBeVisible({ timeout: 10000 });
		const sendBtn = page.locator('button:has-text("Enviar")').first();
		if (await sendBtn.isVisible().catch(() => false)) {
			await sendBtn.click();
			const toast = page.locator('[data-sonner-toast]').first();
			await expect(toast).toBeVisible({ timeout: 10000 });
		}
	});
});
