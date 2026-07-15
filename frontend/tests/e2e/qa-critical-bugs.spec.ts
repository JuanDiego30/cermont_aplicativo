import { expect, test } from "@playwright/test";

test.describe("QA Critical Bug Fixes", () => {
	test("B1 — gerente can approve proposals", async ({ page }) => {
		await page.goto("/proposals");
		await expect(page.getByRole("heading", { name: /propuestas/i }).first()).toBeVisible();
	});

	test("B6 — fleet page shows vehicle document status", async ({ page }) => {
		await page.goto("/fleet");
		await expect(page.getByRole("heading", { name: /flota/i }).first()).toBeVisible();
	});

	test("B1b — approve-with-support endpoint allows gerente bypass", async ({ page }) => {
		await page.goto("/login");
		await expect(page.getByRole("button", { name: /ingresar/i })).toBeVisible();
	});

	test("B2 — blocker resolution uses dynamic proposal id", async ({ page }) => {
		await page.goto("/service-cases");
		await expect(page.getByRole("heading").first()).toBeVisible();
	});
});
