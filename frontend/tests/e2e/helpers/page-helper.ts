import { expect, type Page } from "@playwright/test";

export async function assertLoadingState(page: Page, timeout = 5000): Promise<void> {
	const loadingIndicator = page
		.locator('[data-testid="loading"], [aria-busy="true"], .animate-pulse, .skeleton')
		.first();
	await expect(loadingIndicator).toBeVisible({ timeout });
}

export async function assertErrorState(page: Page, timeout = 10000): Promise<void> {
	const errorElement = page.locator('[data-testid="error-state"], [role="alert"]').first();
	await expect(errorElement).toBeVisible({ timeout });
}

export async function assertEmptyState(page: Page, timeout = 10000): Promise<void> {
	const emptyElement = page.locator('[data-testid="empty-state"], [aria-label="Sin resultados"]').first();
	await expect(emptyElement).toBeVisible({ timeout });
}

export async function assertPageTitle(page: Page, text: string | RegExp, timeout = 10000): Promise<void> {
	await expect(page.locator("h1").first()).toContainText(text, { timeout });
}

export async function assertTableHasRows(page: Page, minRows = 1, timeout = 15000): Promise<void> {
	const rows = page.locator("table tbody tr");
	await expect(rows.first()).toBeVisible({ timeout });
	const count = await rows.count();
	expect(count).toBeGreaterThanOrEqual(minRows);
}

export async function assertToastMessage(page: Page, text: string | RegExp, timeout = 10000): Promise<void> {
	const toast = page.locator('[data-sonner-toast], [role="status"]').first();
	await expect(toast).toContainText(text, { timeout });
}

export async function assertUrlMatches(page: Page, pattern: RegExp): Promise<void> {
	await expect(page).toHaveURL(pattern);
}

export async function assertNoConsoleErrors(page: Page): Promise<void> {
	const errors: string[] = [];
	page.on("console", (msg) => {
		if (msg.type() === "error") {
			errors.push(msg.text());
		}
	});
	await page.waitForTimeout(1000);
	expect(errors).toEqual([]);
}

export async function waitForApiResponse(
	page: Page,
	urlPattern: RegExp | string,
	timeout = 15000,
): Promise<void> {
	await page.waitForResponse((res) => {
		const url = res.url();
		const matches = typeof urlPattern === "string" ? url.includes(urlPattern) : urlPattern.test(url);
		return matches && res.status() >= 200 && res.status() < 400;
	}, { timeout });
}

export async function setMobileViewport(page: Page, width = 375, height = 812): Promise<void> {
	await page.setViewportSize({ width, height });
}

export async function setDesktopViewport(page: Page, width = 1280, height = 720): Promise<void> {
	await page.setViewportSize({ width, height });
}
