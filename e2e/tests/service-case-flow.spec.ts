import { expect, test } from "@playwright/test";

test.describe("Service case flow", () => {
	test.beforeEach(async ({ page }) => {
		await page.goto("/login");
		await page.getByLabel("Email").fill(process.env.E2E_USER_EMAIL!);
		await page.getByLabel("Password").fill(process.env.E2E_USER_PASSWORD!);
		await page.getByRole("button", { name: /iniciar sesión/i }).click();
		await expect(page.getByRole("heading", { name: /dashboard/i })).toBeVisible();
	});

	test("can view service cases list", async ({ page }) => {
		await page.goto("/service-cases");
		await expect(page.getByRole("heading", { name: /casos de servicio/i })).toBeVisible();
	});

	test("workflow cockpit exposes blockers when requirements are missing", async ({ page }) => {
		await page.goto("/service-cases");
		const firstCase = page.getByRole("link", { name: /ver/i }).first();
		if ((await firstCase.count()) > 0) {
			await firstCase.click();
			await expect(page.getByText(/bloqueo|requisito|pendiente/i)).toBeVisible();
		}
	});
});
