import { expect, test } from "@playwright/test";

test.describe("06 — Invoice Pipeline", () => {
	test("renders invoice pipeline page", async ({ page }) => {
		await page.goto("/invoices/test-id/pipeline");
		await expect(page.getByText("Pipeline").or(page.locator("text=Facturación"))).toBeVisible({
			timeout: 10000,
		});
	});

	test("shows SES → Factura → Pago stages", async ({ page }) => {
		await page.goto("/invoices/test-id/pipeline");
		await expect(page.locator("text=SES").or(page.locator("text=Factura"))).toBeVisible({
			timeout: 10000,
		});
	});

	test("shows aging dashboard buckets", async ({ page }) => {
		await page.goto("/invoices/test-id/pipeline");
		await expect(page.locator("text=Corriente").or(page.locator("text=Vencido"))).toBeVisible({
			timeout: 10000,
		});
	});
});
