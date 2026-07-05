import { expect, test } from "@playwright/test";

test.describe("02 — Dashboard KPIs", () => {
	test("renders KPI widgets grid", async ({ page }) => {
		await page.goto("/dashboard");
		await expect(page.locator("text=MTTR").or(page.locator("text=Tiempo medio"))).toBeVisible({
			timeout: 10000,
		});
	});

	test("renders SLA risk orders table", async ({ page }) => {
		await page.goto("/dashboard");
		await expect(page.locator("text=Riesgo SLA").or(page.locator("text=SLA"))).toBeVisible({
			timeout: 10000,
		});
	});

	test("shows cash flow funnel", async ({ page }) => {
		await page.goto("/dashboard");
		await expect(page.locator("text=Ejecutado").or(page.locator("text=Pipeline"))).toBeVisible({
			timeout: 10000,
		});
	});
});
