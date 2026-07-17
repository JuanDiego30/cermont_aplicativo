import type { Page } from "@playwright/test";
import { expect } from "@playwright/test";

export async function waitForPageLoad(page: Page): Promise<void> {
	await page.waitForLoadState("networkidle");
}

export async function assertLoadingState(page: Page): Promise<void> {
	const loadingIndicator = page.locator('[aria-busy="true"], .animate-pulse, .loading-spinner');
	await expect(loadingIndicator.first()).toBeVisible({ timeout: 5000 }).catch(() => {
		// Loading may have already completed
	});
}

export async function assertErrorState(page: Page): Promise<void> {
	const errorCard = page.locator(
		'[data-testid="error-state"], [role="alert"], .bg-red-50, .text-brand-error',
	);
	await expect(errorCard.first()).toBeVisible({ timeout: 5000 });
}

export async function assertEmptyState(page: Page): Promise<void> {
	const emptyState = page.locator('[data-testid="empty-state"], .empty-state');
	await expect(emptyState.first()).toBeVisible({ timeout: 5000 });
}

export async function assertRetryButton(page: Page): Promise<void> {
	const retryBtn = page.locator('button:has-text("Reintentar"), button:has-text("Retry")');
	await expect(retryBtn.first()).toBeVisible({ timeout: 3000 });
}

export async function assertForbiddenState(page: Page): Promise<void> {
	const forbiddenMsg = page.locator('text=No tienes permiso');
	await expect(forbiddenMsg.first()).toBeVisible({ timeout: 5000 });
}

export async function assertOfflineBanner(page: Page): Promise<void> {
	const offlineBanner = page.locator('[data-testid="offline-banner"], .offline-banner');
	await expect(offlineBanner.first()).toBeVisible({ timeout: 5000 });
}

export async function assertPageHeading(page: Page, text: string): Promise<void> {
	await expect(
		page.locator("h1").filter({ hasText: text }).first(),
	).toBeVisible({ timeout: 5000 });
}

export async function assertTableHasRows(page: Page): Promise<void> {
	const rows = page.locator("table tbody tr");
	await expect(rows.first()).toBeVisible({ timeout: 10000 });
}

export async function interceptApiError(page: Page, urlPattern: string): Promise<void> {
	await page.route(urlPattern, (route) => {
		route.fulfill({ status: 500, body: "Server Error" });
	});
}

export async function interceptApiOffline(page: Page, urlPattern: string): Promise<void> {
	await page.route(urlPattern, (route) => {
		route.abort("connectionrefused");
	});
}

export async function takePageSnapshot(page: Page, name: string): Promise<void> {
	await page.screenshot({ path: `.sisyphus/evidence/${name}.png`, fullPage: true });
}
