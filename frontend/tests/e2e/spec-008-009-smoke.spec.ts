/**
 * E2E: Spec 008/009 — Evidence download + SLA + ERP + Asset upload flows
 *
 * Validates that critical new endpoints respond correctly after login.
 * Uses API assertions (not full page navigation) for efficiency.
 */

import { expect, test } from "@playwright/test";
import { loginAsTestUser } from "./auth-credentials";

test.describe("Spec 008/009 — New endpoint smoke tests", () => {
	test("GET /api/evidences → returns 200 with data", async ({ request }) => {
		const response = await request.get("/api/evidences?limit=5");
		expect(response.ok()).toBeTruthy();
		const body = await response.json();
		expect(body.success).toBe(true);
	});

	test("GET /api/sla/dashboard → returns SLA dashboard data", async ({ request }) => {
		const response = await request.get("/api/sla/dashboard");
		expect(response.ok()).toBeTruthy();
		const body = await response.json();
		expect(body.success).toBe(true);
	});

	test("GET /api/sla/summary → returns aggregated summary", async ({ request }) => {
		const response = await request.get("/api/sla/summary");
		expect(response.ok()).toBeTruthy();
		const body = await response.json();
		expect(body.data).toHaveProperty("summary");
	});

	test("GET /api/maintenance/schedules → returns schedule list", async ({ request }) => {
		const response = await request.get("/api/maintenance/schedules?limit=5");
		expect(response.ok()).toBeTruthy();
	});

	test("GET /api/erp-connectors → returns connector list", async ({ request }) => {
		const response = await request.get("/api/erp-connectors");
		expect(response.ok()).toBeTruthy();
	});

	test("GET /api/assets → returns asset list", async ({ request }) => {
		const response = await request.get("/api/assets?limit=5");
		expect(response.ok()).toBeTruthy();
		const body = await response.json();
		expect(body.success).toBe(true);
	});
});

test.describe("Spec 008/009 — Page smoke tests", () => {
	test("Navigating to /evidences renders the page", async ({ page }) => {
		await loginAsTestUser(page);
		await page.goto("/evidences");
		await expect(page.locator("h1")).toContainText(/evidencias/i);
	});

	test("Navigating to /fleet renders vehicle list", async ({ page }) => {
		await loginAsTestUser(page);
		await page.goto("/fleet");
		await expect(page.locator("h1")).toContainText(/parque automotor/i);
	});

	test("Navigating to /erp-connector renders page", async ({ page }) => {
		await loginAsTestUser(page);
		await page.goto("/erp-connector");
		await expect(page.locator("h1")).toContainText(/conectores erp/i);
	});

	test("Navigating to /maintenance renders page", async ({ page }) => {
		await loginAsTestUser(page);
		await page.goto("/maintenance");
		await expect(page.locator("h1")).toContainText(/mantenimiento/i);
	});

	test("Navigating to /maintenance/schedules renders page", async ({ page }) => {
		await loginAsTestUser(page);
		await page.goto("/maintenance/schedules");
		await expect(page.locator("h1")).toContainText(/programación/i);
	});

	test("Navigating to /costs renders page", async ({ page }) => {
		await loginAsTestUser(page);
		await page.goto("/costs");
		await expect(page.locator("h1")).toContainText(/costos/i);
	});

	test("Navigating to /profile/privacy renders page", async ({ page }) => {
		await loginAsTestUser(page);
		await page.goto("/profile/privacy");
		await expect(page.locator("h1")).toContainText(/privacidad/i);
	});

	test("Navigating to /checklists renders page", async ({ page }) => {
		await loginAsTestUser(page);
		await page.goto("/checklists");
		await expect(page.locator("h1")).toContainText(/checklists/i);
	});

	test("Navigating to /privacy renders legal page", async ({ page }) => {
		await page.goto("/privacy");
		await expect(page.locator("h1")).toContainText(/privacidad/i);
	});
});
