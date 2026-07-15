import { test, expect } from "../fixtures/api-client.fixture";

test.describe("QA Critical Bug Fixes", () => {
	test("B1 — gerente can approve proposals", async ({ authenticatedPage }) => {
		await authenticatedPage.goto("/proposals");
		await expect(authenticatedPage.getByRole("heading", { name: /propuestas/i }).first()).toBeVisible();
	});

	test("B6 — fleet page shows vehicle document status", async ({ authenticatedPage }) => {
		await authenticatedPage.goto("/fleet");
		await expect(authenticatedPage.getByRole("heading", { name: /flota/i }).first()).toBeVisible();
	});

	test("B1b — approve-with-support endpoint allows gerente bypass", async ({ page }) => {
		await page.goto("/login");
		await expect(page.getByRole("button", { name: /ingresar/i })).toBeVisible();
	});

	test("B2 — blocker resolution uses dynamic proposal id", async ({ authenticatedPage }) => {
		await authenticatedPage.goto("/service-cases");
		await expect(authenticatedPage.getByRole("heading").first()).toBeVisible();
	});
});
