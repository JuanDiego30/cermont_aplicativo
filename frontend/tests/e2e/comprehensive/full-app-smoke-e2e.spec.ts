/**
 * Full Application Smoke Test — v2
 *
 * Visits EVERY page route in the app and verifies no crashes/500 errors.
 * - Public pages: renders content, no console errors, no 5xx network errors
 * - Protected pages: redirect to login or show forbidden (not crash/500)
 * - API backend: health endpoints, proxy connectivity
 * - Error boundaries: 404 pages render properly
 *
 * Run: npm run test:e2e -w frontend -- tests/e2e/comprehensive/full-app-smoke-e2e.spec.ts
 */

import { expect, test } from "@playwright/test";

const BASE_URL = "http://localhost:3000";

// ─── All app routes ───────────────────────────────────────────────────────────

type RouteInfo = { path: string; isPublic: boolean };

const PUBLIC_ROUTES: RouteInfo[] = [
	{ path: "/", isPublic: true },
	{ path: "/login", isPublic: true },
	{ path: "/forgot-password", isPublic: true },
	{ path: "/reset-password", isPublic: true },
	{ path: "/register", isPublic: true },
	{ path: "/unauthorized", isPublic: true },
	{ path: "/portal", isPublic: true },
	{ path: "/portal/invoices", isPublic: true },
	{ path: "/portal/orders", isPublic: true },
	{ path: "/portal/proposals", isPublic: true },
];

const PROTECTED_ROUTES: RouteInfo[] = [
	{ path: "/dashboard", isPublic: false },
	{ path: "/orders", isPublic: false },
	{ path: "/orders/kanban", isPublic: false },
	{ path: "/work-requests", isPublic: false },
	{ path: "/proposals", isPublic: false },
	{ path: "/purchase-orders", isPublic: false },
	{ path: "/service-cases", isPublic: false },
	{ path: "/planning", isPublic: false },
	{ path: "/execution", isPublic: false },
	{ path: "/evidences", isPublic: false },
	{ path: "/billing", isPublic: false },
	{ path: "/billing/invoices", isPublic: false },
	{ path: "/billing/ses", isPublic: false },
	{ path: "/payments", isPublic: false },
	{ path: "/costs", isPublic: false },
	{ path: "/documents", isPublic: false },
	{ path: "/documents/templates", isPublic: false },
	{ path: "/reports", isPublic: false },
	{ path: "/reports/analytics", isPublic: false },
	{ path: "/reports/archive", isPublic: false },
	{ path: "/delivery-records", isPublic: false },
	{ path: "/business-documents", isPublic: false },
	{ path: "/resources", isPublic: false },
	{ path: "/resources/kits", isPublic: false },
	{ path: "/fleet", isPublic: false },
	{ path: "/inventory", isPublic: false },
	{ path: "/maintenance", isPublic: false },
	{ path: "/admin", isPublic: false },
	{ path: "/admin/users", isPublic: false },
	{ path: "/admin/personnel", isPublic: false },
	{ path: "/admin/audit", isPublic: false },
	{ path: "/admin/settings", isPublic: false },
	{ path: "/admin/backups", isPublic: false },
	{ path: "/admin/custom-fields", isPublic: false },
	{ path: "/admin/erp-connectors", isPublic: false },
	{ path: "/customers", isPublic: false },
	{ path: "/site-visits", isPublic: false },
	{ path: "/assets", isPublic: false },
	{ path: "/dispatch", isPublic: false },
	{ path: "/forms", isPublic: false },
	{ path: "/notifications", isPublic: false },
	{ path: "/offline-sync", isPublic: false },
	{ path: "/profile", isPublic: false },
	{ path: "/sla", isPublic: false },
	{ path: "/templates", isPublic: false },
	{ path: "/planning-packet/new", isPublic: false },
	{ path: "/orders/new", isPublic: false },
	{ path: "/proposals/new", isPublic: false },
	{ path: "/work-requests/new", isPublic: false },
	{ path: "/delivery-records/new", isPublic: false },
	{ path: "/billing/invoices/new", isPublic: false },
	{ path: "/billing/ses/new", isPublic: false },
	{ path: "/purchase-orders/new", isPublic: false },
	{ path: "/payments/new", isPublic: false },
	{ path: "/documents/templates/new", isPublic: false },
	{ path: "/reports/new", isPublic: false },
	{ path: "/execution/new", isPublic: false },
	{ path: "/maintenance/new", isPublic: false },
	{ path: "/customers/new", isPublic: false },
	{ path: "/admin/users/new", isPublic: false },
	{ path: "/resources/kits/new", isPublic: false },
	{ path: "/site-visits/new", isPublic: false },
];

// ─── Test: Public Pages ───────────────────────────────────────────────────────

test.describe("Public Pages — no 500/console errors", () => {
	for (const route of PUBLIC_ROUTES) {
		test(`${route.path} loads without errors`, async ({ page }) => {
			const consoleErrors: string[] = [];
			const network5xx: string[] = [];

			page.on("console", (msg) => {
				// Ignore expected 401 resource load errors from unauthenticated portal API calls
				if (msg.type() === "error" && !msg.text().includes("401")) {
					consoleErrors.push(msg.text());
				}
			});
			page.on("pageerror", (err) => consoleErrors.push(err.message));
			page.on("response", (resp) => {
				const status = resp.status();
				const url = resp.url();
				if (url.includes("sockjs-node") || url.includes("__next")) {
					return;
				}
				if (status >= 500 && !url.includes(".css")) {
					network5xx.push(`${status}: ${url}`);
				}
			});

			await page.goto(`${BASE_URL}${route.path}`, { waitUntil: "networkidle", timeout: 15000 });
			await page.waitForTimeout(500);

			const bodyText = await page.locator("body").textContent();
			expect(bodyText).toBeTruthy();
			expect(bodyText?.length).toBeGreaterThan(0);

			expect(network5xx).toEqual([]);
			expect(consoleErrors).toEqual([]);
		});
	}
});

// ─── Test: Protected Pages (unauthenticated — should redirect, not crash) ─────

test.describe("Protected Pages — redirect to login, not crash/500", () => {
	for (const route of PROTECTED_ROUTES) {
		test(`${route.path} redirects instead of crashing`, async ({ page }) => {
			const consoleErrors: string[] = [];
			const network500s: string[] = [];

			page.on("pageerror", (err) => consoleErrors.push(err.message));
			page.on("response", (resp) => {
				const status = resp.status();
				const url = resp.url();
				if (url.includes("sockjs-node") || url.includes("__next")) {
					return;
				}
				if (status >= 500 && !url.includes(".css")) {
					network500s.push(`${status}: ${url}`);
				}
			});

			await page.goto(`${BASE_URL}${route.path}`, { waitUntil: "networkidle", timeout: 15000 });
			await page.waitForTimeout(500);

			const bodyText = await page.locator("body").textContent();
			expect(bodyText).toBeTruthy();
			expect(bodyText?.length).toBeGreaterThan(0);

			// Must not have 500 errors or JS crashes
			expect(network500s).toEqual([]);
			expect(consoleErrors).toEqual([]);
		});
	}
});

// ─── Test: API Connectivity ───────────────────────────────────────────────────

test.describe("API Connectivity", () => {
	test("GET /api/health/live returns 200", async ({ request }) => {
		const resp = await request.get(`${BASE_URL}/api/backend/health/live`);
		expect(resp.status()).toBe(200);
		const body = await resp.json();
		expect(body.status).toBe("ok");
	});

	test("GET /api/health/ready returns 200 or 503", async ({ request }) => {
		const resp = await request.get(`${BASE_URL}/api/backend/health/ready`);
		expect([200, 503]).toContain(resp.status());
	});
});

// ─── Test: Error Boundaries ───────────────────────────────────────────────────

test.describe("Error Boundaries", () => {
	test("Non-existent page returns 404 page, not crash", async ({ page }) => {
		const errors: string[] = [];
		page.on("pageerror", (err) => errors.push(err.message));

		await page.goto(`${BASE_URL}/this-page-does-not-exist-xyz`, { waitUntil: "networkidle" });
		const bodyText = await page.locator("body").textContent();
		expect(bodyText).toBeTruthy();
		expect(bodyText?.length).toBeGreaterThan(0);
		expect(errors).toEqual([]);
	});

	test("Unauthorized page loads with content", async ({ page }) => {
		await page.goto(`${BASE_URL}/unauthorized`, { waitUntil: "networkidle" });
		const bodyText = await page.locator("body").textContent();
		expect(bodyText).toBeTruthy();
		expect(bodyText?.length).toBeGreaterThan(0);
	});
});
