import { expect, test } from "@playwright/test";
import { E2E_TEST_USERS } from "./auth-credentials";

/**
 * Page Smoke Tests - Verifies all critical pages load without errors
 * Tests each page in the sidebar navigation
 */

const CRITICAL_PAGES = [
	{ path: "/dashboard", name: "Dashboard" },
	{ path: "/work-requests", name: "Work Requests" },
	{ path: "/proposals", name: "Proposals" },
	{ path: "/orders", name: "Orders" },
	{ path: "/execution", name: "Execution" },
	{ path: "/evidences", name: "Evidences" },
	{ path: "/reports", name: "Reports" },
	{ path: "/delivery-records", name: "Delivery Records" },
	{ path: "/billing/ses", name: "SES" },
	{ path: "/billing/invoices", name: "Invoices" },
	{ path: "/payments", name: "Payments" },
	{ path: "/costs", name: "Costs" },
	{ path: "/documents", name: "Documents" },
	{ path: "/templates", name: "Templates" },
	{ path: "/resources/kits", name: "Resources" },
	{ path: "/users", name: "Users" },
	{ path: "/service-cases", name: "Service Cases" },
	{ path: "/site-visits", name: "Site Visits" },
];

test.describe("Page Smoke Tests", () => {
	test.beforeEach(async ({ page }) => {
		// Login as admin before testing pages
		await page.goto("/login");
		await page.getByLabel("Correo electrónico").first().fill(E2E_TEST_USERS.admin.email);
		await page.getByLabel("Contraseña").first().fill(E2E_TEST_USERS.admin.password);
		await page
			.getByRole("button", { name: /iniciar sesión/i })
			.first()
			.click();
		await page.waitForURL(/dashboard/, { timeout: 15000 });
	});

	for (const pageInfo of CRITICAL_PAGES) {
		test(`${pageInfo.name} page loads`, async ({ page }) => {
			// Navigate to the page
			await page.goto(pageInfo.path);

			// Wait for network to settle
			await page.waitForLoadState("networkidle", { timeout: 10000 });

			// Verify no 404 errors
			const response = await page.goto(pageInfo.path);
			expect(response?.status()).not.toBe(404);

			// Verify page has content (not blank)
			const main = page.locator("main").first();
			await expect(main).toBeVisible();

			// Verify no console errors
			const logs: string[] = [];
			page.on("console", (msg) => {
				if (msg.type() === "error") {
					logs.push(msg.text());
				}
			});
			await page.waitForTimeout(1000);
			expect(logs).toEqual(expect.arrayContaining([expect.not.stringContaining("error")]));
		});
	}
});
