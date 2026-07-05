import { expect, test } from "@playwright/test";

test.describe("05 — Report Auto-Draft", () => {
	test("renders report draft page", async ({ page }) => {
		await page.goto("/reports/test-report-id/draft");
		await expect(page.getByText("Informe").or(page.locator("text=Informe"))).toBeVisible({
			timeout: 10000,
		});
	});

	test("shows editable conclusion section", async ({ page }) => {
		await page.goto("/reports/test-report-id/draft");
		await expect(page.locator("textarea")).toBeVisible();
	});

	test("renders signature page", async ({ page }) => {
		await page.goto("/reports/test-report-id/sign");
		await expect(page.getByText("Firma").or(page.locator("text=Firma"))).toBeVisible({
			timeout: 10000,
		});
	});
});
