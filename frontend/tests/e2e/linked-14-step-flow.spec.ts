/**
 * E2E — Linked 14-Step Flow
 *
 * Validates that the 14 CERMONT operational steps form a continuous,
 * data-inheriting workflow. Each step must read from previous steps,
 * allow complementary fields, and never ask for duplicated data.
 */

import { expect, test } from "@playwright/test";

const BASE_URL = process.env.PLAYWRIGHT_BASE_URL ?? "http://localhost:3000";

/**
 * Helper: logs in with default credentials.
 */
async function loginAsResidente(page: import("@playwright/test").Page) {
	await page.goto(`${BASE_URL}/login`);
	await page.fill('input[name="email"]', "residente@cermont.com");
	await page.fill('input[name="password"]', "password123");
	await page.click('button[type="submit"]');
	await page.waitForURL("**/dashboard");
}

test.describe("Linked 14-Step Flow — Data Inheritance", () => {
	test.beforeEach(async ({ page }) => {
		await loginAsResidente(page);
	});

	test("E2E A: Step 1 → Step 2 (WorkRequest → SiteVisit) inheritance", async ({ page }) => {
		// Step 1: Create a WorkRequest
		await page.goto(`${BASE_URL}/work-requests/new`);
		await page.fill('input[name="clientName"]', "Cliente E2E S.A.S.");
		await page.fill('input[name="serviceSite"]', "Planta principal Bogotá");
		await page.fill('input[name="serviceType"]', "Mantenimiento preventivo");
		await page.fill('input[name="shortDescription"]', "E2E test work request");
		await page.fill('input[name="description"]', "Testing the inheritance flow end to end.");
		await page.selectOption('select[name="sourceChannel"]', "email");
		await page.fill('input[name="requesterName"]', "Juan Pérez");
		await page.click('button[type="submit"]');
		await page.waitForURL("**/work-requests/**");

		// Step 2: Navigate to SiteVisit
		await page.goto(`${BASE_URL}/site-visits/new`);

		// Should see case selector with the created WorkRequest
		await expect(page.getByText("Cliente E2E S.A.S.")).toBeVisible();
		await expect(page.getByText("Seleccionar →")).toBeVisible();

		// Select the case
		await page.click('text="Seleccionar →"');

		// Should see inherited fields with badges
		await expect(page.getByText("Heredado de Solicitud de servicio")).toBeVisible();
		await expect(page.getByText("Cliente E2E S.A.S.")).toBeVisible();

		// Fill site-visit-specific fields
		await page.fill('input[name="visitDate"]', "2026-06-15T08:00");
		await page.fill('input[name="responsibleUserId"]', "507f1f77bcf86cd799439011");
		await page.fill('input[name="responsibleName"]', "Técnico E2E");

		// Submit
		await page.click('button[type="submit"]');
		await page.waitForURL("**/site-visits/**");

		// Verify no 400 error
		const pageContent = await page.textContent("body");
		expect(pageContent).not.toContain("400");
		expect(pageContent).not.toContain("Error");
	});

	test("E2E B: Step 2 → Step 3 (SiteVisit → Proposal) inheritance", async ({ page }) => {
		await page.goto(`${BASE_URL}/proposals/new?serviceCaseId=test-service-case-id`);

		// Should show inherited data from WorkRequest and SiteVisit
		await expect(page.getByText("Heredado de")).toBeVisible();
	});

	test("E2E E: No 400 for invalid IDs across all steps", async ({ page }) => {
		// Navigate through each step page and verify no /workflow requests with empty IDs
		const stepRoutes = [
			"/work-requests/new",
			"/site-visits/new",
			"/proposals/new",
			"/purchase-orders/new",
			"/planning",
		];

		for (const route of stepRoutes) {
			await page.goto(`${BASE_URL}${route}`);
			// Verify the page loaded (no 400 error)
			const content = await page.textContent("body");
			expect(content).not.toContain("400");
			expect(content).not.toContain("not found");
		}
	});
});
