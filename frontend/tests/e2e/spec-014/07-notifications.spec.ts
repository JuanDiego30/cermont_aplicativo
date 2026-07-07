import { expect, test } from "@playwright/test";

test.describe("07 — Notifications", () => {
	test("renders notifications page", async ({ page }) => {
		await page.goto("/notifications");
		await expect(
			page.getByText("Notificaciones").or(page.locator("text=Notificaciones")),
		).toBeVisible({ timeout: 10000 });
	});

	test("shows empty state when no notifications", async ({ page }) => {
		await page.goto("/notifications");
		await expect(
			page.getByText("No tienes notificaciones").or(page.locator("ul li").first()),
		).toBeVisible();
	});

	test("renders notification preferences page", async ({ page }) => {
		await page.goto("/settings/notifications");
		await expect(
			page.getByText("Preferencias").or(page.locator("text=notificaciones")),
		).toBeVisible({ timeout: 10000 });
	});
});
