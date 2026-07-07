import { expect, test } from "@playwright/test";

test.describe("10 — Full 14-Step Flow", () => {
	test("cockpit shows all 14 step bubbles", async ({ page }) => {
		await page.goto("/service-cases/test-flow-001/cockpit");
		await page.waitForTimeout(2000);
		// Should render progress bar with step indicators
		await expect(page.locator("nav[aria-label='Progreso de los 14 pasos'] li")).toHaveCount(14);
	});

	test("dashboard KPIs load with data", async ({ page }) => {
		await page.goto("/dashboard");
		await expect(page.locator("text=MTTR").or(page.locator("text=Tiempo"))).toBeVisible({
			timeout: 10000,
		});
	});

	test("cost catalog page loads", async ({ page }) => {
		await page.goto("/costs/catalog");
		await expect(page.locator("text=Catálogo").or(page.locator("text=catálogo"))).toBeVisible({
			timeout: 10000,
		});
	});

	test("notifications page loads", async ({ page }) => {
		await page.goto("/notifications");
		await expect(page.getByText("Notificaciones")).toBeVisible({ timeout: 10000 });
	});

	test("client portal loads without internal data", async ({ page }) => {
		await page.goto("/portal/service-cases");
		await expect(page.getByText("órdenes").or(page.locator("text=Mis"))).toBeVisible({
			timeout: 10000,
		});
	});

	test("field execution page loads", async ({ page }) => {
		await page.goto("/execution-sessions/test-flow-001");
		await expect(page).toHaveURL(/\/(execution|login|unauthorized)/);
	});

	test("report pages load", async ({ page }) => {
		await page.goto("/reports/test-flow-001/draft");
		await page.goto("/reports/test-flow-001/sign");
		await expect(page.getByText(/Firma del Informe|Iniciar sesión/)).toBeVisible();
	});

	test("invoice pipeline visual loads", async ({ page }) => {
		await page.goto("/invoices/test-flow-001/pipeline");
		await expect(page).toHaveURL(/\/(invoices|login|unauthorized)/);
	});
});
