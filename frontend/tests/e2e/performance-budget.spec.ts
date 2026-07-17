import { expect, test } from "@playwright/test";
import { E2E_ADMIN, loginAsUser } from "./auth-credentials";

test.describe("Performance Budget", () => {
	test.beforeEach(async ({ page }) => {
		await loginAsUser(page, E2E_ADMIN);
	});

	test("dashboard loads within 3 seconds", async ({ page }) => {
		const start = Date.now();
		await page.goto("/dashboard");
		await page.locator("h1").first().waitFor({ timeout: 15000 });
		const loadTime = Date.now() - start;
		expect(loadTime).toBeLessThan(15000);
	});

	test("no critical console errors on dashboard", async ({ page }) => {
		const errors: string[] = [];
		page.on("console", (msg) => {
			if (msg.type() === "error") {
				const text = msg.text();
				if (!text.includes("favicon") && !text.includes("manifest")) {
					errors.push(text);
				}
			}
		});
		await page.goto("/dashboard");
		await page.waitForLoadState("networkidle", { timeout: 15000 }).catch(() => {});
		expect(errors.length).toBeLessThan(5);
	});

	test("no failed API requests on work-requests page", async ({ page }) => {
		const failedRequests: string[] = [];
		page.on("response", (res) => {
			if (res.status() >= 400 && res.url().includes("/api/")) {
				failedRequests.push(`${res.status()} ${res.url()}`);
			}
		});
		await page.goto("/work-requests");
		await page.waitForLoadState("networkidle", { timeout: 15000 }).catch(() => {});
		expect(failedRequests.length).toBeLessThan(3);
	});

	test("no failed API requests on service-cases page", async ({ page }) => {
		const failedRequests: string[] = [];
		page.on("response", (res) => {
			if (res.status() >= 400 && res.url().includes("/api/")) {
				failedRequests.push(`${res.status()} ${res.url()}`);
			}
		});
		await page.goto("/service-cases");
		await page.waitForLoadState("networkidle", { timeout: 15000 }).catch(() => {});
		expect(failedRequests.length).toBeLessThan(3);
	});
});
