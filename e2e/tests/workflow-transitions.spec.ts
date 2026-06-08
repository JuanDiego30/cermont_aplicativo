import { expect, test } from "@playwright/test";

test.describe("Workflow transitions", () => {
	test.beforeEach(async ({ page }) => {
		await page.goto("/login");
		await page.getByLabel("Email").fill(process.env.E2E_USER_EMAIL!);
		await page.getByLabel("Password").fill(process.env.E2E_USER_PASSWORD!);
		await page.getByRole("button", { name: /iniciar sesión/i }).click();
		await expect(page.getByRole("heading", { name: /dashboard/i })).toBeVisible();
	});

	test("non-manager cannot approve a proposal", async ({ page }) => {
		await page.goto("/proposals");
		const proposalLink = page.getByRole("link", { name: /propuesta/i }).first();
		if ((await proposalLink.count()) === 0) {
			test.skip(true, "No proposals available for rejection test");
			return;
		}
		await proposalLink.click();

		const approveButton = page.getByRole("button", { name: /aprobar/i });
		if ((await approveButton.count()) > 0) {
			await expect(approveButton).toBeDisabled();
		}
	});

	test("service case step advance respects blockers", async ({ page }) => {
		await page.goto("/service-cases");
		const caseLink = page.getByRole("link", { name: /ver/i }).first();
		if ((await caseLink.count()) > 0) {
			await caseLink.click();
			await expect(page.getByText(/no se puede avanzar|requisitos faltantes/i)).toBeVisible();
		}
	});
});
