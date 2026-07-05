import { expect, test } from "@playwright/test";

test.describe("03 — Cost Intelligence", () => {
	test("renders cost catalog page", async ({ page }) => {
		await page.goto("/costs/catalog");
		await expect(page.locator("text=Catálogo").or(page.locator("text=catálogo"))).toBeVisible({
			timeout: 10000,
		});
	});

	test("renders cost page with budget gauge", async ({ page }) => {
		await page.goto("/costs/test-order-id");
		await expect(page.locator("text=Presupuesto").or(page.locator("text=Costo"))).toBeVisible({
			timeout: 10000,
		});
	});

	test("renders cost deviation chart", async ({ page }) => {
		await page.goto("/costs/test-order-id");
		await expect(page.locator("text=Desviación").or(page.locator("text=desviación"))).toBeVisible({
			timeout: 10000,
		});
	});
});
