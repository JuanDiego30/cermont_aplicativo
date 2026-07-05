import { expect, test } from "@playwright/test";

test.describe("01 — Cockpit 14 Steps", () => {
	test("renders cockpit page with progress bar", async ({ page }) => {
		await page.goto("/service-cases/test-id-001/cockpit");
		await expect(page.locator("nav[aria-label='Progreso de los 14 pasos']")).toBeVisible({
			timeout: 10000,
		});
		await expect(page.getByText("Código").or(page.getByText("SC-"))).toBeVisible();
	});

	test("shows next action card when available", async ({ page }) => {
		await page.goto("/service-cases/test-id-001/cockpit");
		const nextAction = page.getByText("Próxima acción");
		await expect(nextAction).toBeVisible({ timeout: 5000 });
	});

	test("shows loading skeleton initially", async ({ page }) => {
		await page.goto("/service-cases/test-id-001/cockpit");
		// Should briefly show skeleton or error state gracefully
		await page.waitForTimeout(1000);
		const skeleton = page.getByRole("status").or(page.locator("[aria-busy='true']"));
		const error = page.getByRole("alert").or(page.getByText("Error"));
		// Either loading or error state should be visible, not a blank page
		await expect(skeleton.or(error)).toBeVisible();
	});
});
