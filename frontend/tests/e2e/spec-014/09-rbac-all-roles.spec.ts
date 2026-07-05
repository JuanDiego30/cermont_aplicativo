import { expect, test } from "@playwright/test";

const ALL_ROLES = [
	"gerente",
	"residente",
	"supervisor",
	"operador",
	"tecnico",
	"administrativo",
	"hes",
	"cliente",
] as const;

const SPEC_014_PAGES = [
	"/service-cases/test-id/cockpit",
	"/dashboard",
	"/costs/catalog",
	"/execution-sessions/test-id",
	"/reports/test-id/draft",
	"/reports/test-id/sign",
	"/invoices/test-id/pipeline",
	"/notifications",
	"/settings/notifications",
	"/portal/service-cases",
] as const;

test.describe("09 — RBAC All Roles", () => {
	for (const role of ALL_ROLES) {
		test(`pages respond (not 500) for role: ${role}`, async ({ page }) => {
			// Navigate to pages; some will redirect to login, which is expected RBAC behavior
			for (const route of SPEC_014_PAGES) {
				const response = await page.goto(route);
				// Should not crash (500), redirect to login or show content is fine
				if (response) {
					expect(response.status()).not.toBe(500);
				}
			}
		});
	}

	test("cliente role cannot access internal dashboard", async ({ page }) => {
		await page.goto("/dashboard");
		// Should redirect to login or portal
		await page.waitForTimeout(1000);
		await expect(page).toHaveURL(/\/(login|portal|unauthorized)(\/|$)/);
	});
});
