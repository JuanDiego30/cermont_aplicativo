import { expect, test } from "@playwright/test";
import { E2E_ADMIN, loginAsUser } from "./auth-credentials";

/**
 * Page Smoke Tests - Verifies all critical pages load without errors
 * Tests each page in the sidebar navigation
 */

const CRITICAL_PAGES = [
	// ── Auth / Core ───────────────────────────────────────────────────────
	{ path: "/login", name: "Login" },
	{ path: "/dashboard", name: "Dashboard" },
	{ path: "/profile", name: "Profile" },

	// ── Work Requests ─────────────────────────────────────────────────────
	{ path: "/work-requests", name: "Work Requests" },
	{ path: "/work-requests/new", name: "New Work Request" },

	// ── Proposals ─────────────────────────────────────────────────────────
	{ path: "/proposals", name: "Proposals" },
	{ path: "/proposals/new", name: "New Proposal" },

	// ── Orders ────────────────────────────────────────────────────────────
	{ path: "/orders", name: "Orders" },
	{ path: "/orders/kanban", name: "Orders Kanban" },
	{ path: "/orders/new", name: "New Order" },

	// ── Execution / Planning ──────────────────────────────────────────────
	{ path: "/planning", name: "Planning" },
	{ path: "/execution", name: "Execution" },
	{ path: "/execution/new", name: "New Execution" },
	{ path: "/planning-packet/new", name: "New Planning Packet" },

	// ── Evidences ────────────────────────────────────────────────────────
	{ path: "/evidences", name: "Evidences" },

	// ── Service Cases / Site Visits ──────────────────────────────────────
	{ path: "/service-cases", name: "Service Cases" },
	{ path: "/site-visits", name: "Site Visits" },
	{ path: "/site-visits/new", name: "New Site Visit" },

	// ── Billing / SES / Invoices ─────────────────────────────────────────
	{ path: "/billing/ses", name: "SES" },
	{ path: "/billing/ses/new", name: "New SES" },
	{ path: "/billing/invoices", name: "Invoices" },
	{ path: "/billing/invoices/new", name: "New Invoice" },

	// ── Payments ─────────────────────────────────────────────────────────
	{ path: "/payments", name: "Payments" },
	{ path: "/payments/new", name: "New Payment" },

	// ── Delivery Records ─────────────────────────────────────────────────
	{ path: "/delivery-records", name: "Delivery Records" },
	{ path: "/delivery-records/new", name: "New Delivery Record" },

	// ── Reports / Documents ──────────────────────────────────────────────
	{ path: "/reports", name: "Reports" },
	{ path: "/reports/analytics", name: "Reports Analytics" },
	{ path: "/reports/archive", name: "Reports Archive" },
	{ path: "/reports/new", name: "New Report" },
	{ path: "/documents", name: "Documents" },
	{ path: "/documents/templates", name: "Document Templates" },
	{ path: "/documents/templates/new", name: "New Template" },

	// ── Assets / Fleet / Inventory ───────────────────────────────────────
	{ path: "/assets", name: "Assets" },
	{ path: "/fleet", name: "Fleet" },
	{ path: "/inventory", name: "Inventory" },
	{ path: "/inventory/scan", name: "Inventory Scan" },

	// ── Maintenance ──────────────────────────────────────────────────────
	{ path: "/maintenance", name: "Maintenance" },
	{ path: "/maintenance/new", name: "New Maintenance" },

	// ── Resources / Kits ─────────────────────────────────────────────────
	{ path: "/resources/kits", name: "Resources Kits" },
	{ path: "/resources/kits/new", name: "New Kit" },

	// ── Costs / Customers ────────────────────────────────────────────────
	{ path: "/costs", name: "Costs" },
	{ path: "/customers", name: "Customers" },
	{ path: "/customers/new", name: "New Customer" },

	// ── Purchase Orders / Dispatch ───────────────────────────────────────
	{ path: "/purchase-orders", name: "Purchase Orders" },
	{ path: "/purchase-orders/new", name: "New Purchase Order" },
	{ path: "/dispatch", name: "Dispatch" },

	// ── Admin ────────────────────────────────────────────────────────────
	{ path: "/admin", name: "Admin" },
	{ path: "/admin/users", name: "Admin Users" },
	{ path: "/admin/users/new", name: "Admin New User" },
	{ path: "/admin/audit", name: "Admin Audit" },
	{ path: "/admin/backups", name: "Admin Backups" },
	{ path: "/admin/custom-fields", name: "Admin Custom Fields" },
	{ path: "/admin/erp-connectors", name: "Admin ERP Connectors" },
	{ path: "/admin/personnel", name: "Admin Personnel" },
	{ path: "/admin/settings", name: "Admin Settings" },

	// ── Business Documents / Templates ───────────────────────────────────
	{ path: "/business-documents", name: "Business Documents" },
	{ path: "/templates", name: "Templates" },

	// ── Forms / SLA / Notifications ──────────────────────────────────────
	{ path: "/forms", name: "Forms" },
	{ path: "/sla", name: "SLA" },
	{ path: "/notifications", name: "Notifications" },
	{ path: "/offline-sync", name: "Offline Sync" },

	// ── Portal ───────────────────────────────────────────────────────────
	{ path: "/portal", name: "Portal" },
	// ── Dynamic detail pages (mock MongoDB ObjectId) ─────────────────────────
	// These render an error/empty state for a non-existent ID but must NOT 404.
	{ path: "/work-requests/507f1f77bcf86cd799439011", name: "Work Request Detail" },
	{ path: "/site-visits/507f1f77bcf86cd799439012", name: "Site Visit Detail" },
	{ path: "/proposals/507f1f77bcf86cd799439013", name: "Proposal Detail" },
	{ path: "/orders/507f1f77bcf86cd799439014", name: "Order Detail" },
	{ path: "/orders/507f1f77bcf86cd799439014/planning", name: "Order Planning" },
	{ path: "/orders/507f1f77bcf86cd799439014/execution", name: "Order Execution" },
	{ path: "/orders/507f1f77bcf86cd799439014/evidences", name: "Order Evidences" },
	{ path: "/orders/507f1f77bcf86cd799439014/costs", name: "Order Costs" },
	{ path: "/execution/507f1f77bcf86cd799439015", name: "Execution Session Detail" },
	{ path: "/delivery-records/507f1f77bcf86cd799439016", name: "Delivery Record Detail" },
	{ path: "/billing/ses/507f1f77bcf86cd799439017", name: "SES Detail" },
	{ path: "/billing/invoices/507f1f77bcf86cd799439018", name: "Invoice Detail" },
	{ path: "/admin/users/507f1f77bcf86cd799439019", name: "Admin User Detail" },
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

			if (pageInfo.path !== "/login") {
				const main = page.locator("main").first();
				await expect(main).toBeVisible();
			}

			expect(consoleErrors).toEqual([]);
		});
	}
});
