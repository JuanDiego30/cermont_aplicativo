import { expect, test } from "@playwright/test";

test.describe("04 — Field Execution", () => {
	test("renders preflight gates form", async ({ page }) => {
		await page.goto("/execution-sessions/test-session-id");
		await expect(page.locator("text=Iniciar").or(page.locator("text=gates"))).toBeVisible({
			timeout: 10000,
		});
	});

	test("shows evidence capture slots", async ({ page }) => {
		await page.goto("/execution-sessions/test-session-id");
		const beforeSlot = page.locator("text=BEFORE").or(page.locator("text=Antes"));
		await expect(beforeSlot).toBeVisible({ timeout: 5000 });
	});

	test("novelty button is present in field mode", async ({ page }) => {
		await page.goto("/execution-sessions/test-session-id");
		const noveltyBtn = page.locator("button[title*='novedad']").or(page.locator("text=Reportar"));
		await expect(noveltyBtn).toBeVisible({ timeout: 5000 });
	});
});
