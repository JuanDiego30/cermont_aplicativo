import { expect, test } from "@playwright/test";
import { E2E_ADMIN, loginAsUser } from "./auth-credentials";

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
	{ path: "/admin/users", name: "Users" },
	{ path: "/service-cases", name: "Service Cases" },
	{ path: "/site-visits", name: "Site Visits" },
];

test.describe("Page Smoke Tests", () => {
	test.beforeEach(async ({ page }) => {
		await loginAsUser(page, E2E_ADMIN);
	});

	for (const pageInfo of CRITICAL_PAGES) {
		test(`${pageInfo.name} page loads`, async ({ page }) => {
			const consoleErrors: string[] = [];
			page.on("console", (message) => {
				if (message.type() === "error") {
					consoleErrors.push(message.text());
				}
			});

			const response = await page.goto(pageInfo.path);
			await page.waitForLoadState("domcontentloaded", { timeout: 10000 });

			expect(response?.status()).not.toBe(404);
			const main = page.locator("main").first();
			await expect(main).toBeVisible();
			expect(consoleErrors).toEqual([]);
		});
	}
});
