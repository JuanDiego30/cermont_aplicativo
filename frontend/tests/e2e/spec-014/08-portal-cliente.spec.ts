import { expect, test } from "@playwright/test";

test.describe("08 — Portal Cliente", () => {
	test("renders portal service cases list", async ({ page }) => {
		await page.goto("/portal/service-cases");
		await expect(page.getByText("órdenes").or(page.locator("text=Mis"))).toBeVisible({
			timeout: 10000,
		});
	});

	test("shows order detail in portal", async ({ page }) => {
		await page.goto("/portal/service-cases/test-id");
		await expect(page.getByText("Detalle").or(page.locator("text=Estado"))).toBeVisible({
			timeout: 10000,
		});
	});

	test("portal does not expose internal costs", async ({ page }) => {
		await page.goto("/portal/service-cases/test-id");
		// Should NOT show internal cost data
		const costText = page
			.locator("text=Costo estimado")
			.or(page.locator("text=Presupuesto interno"));
		await expect(costText).not.toBeVisible({ timeout: 3000 });
	});
});
