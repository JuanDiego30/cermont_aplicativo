import { expect, test } from "@playwright/test";
import { hasE2ECredentials, loginAsTestUser } from "./auth-credentials";

test("protege la creación de órdenes sin contexto del caso de servicio", async ({ page }) => {
	test.skip(
		!hasE2ECredentials(),
		"Authenticated E2E flows require SEED_DEFAULT_PASSWORD, PLAYWRIGHT_E2E_PASSWORD, or PLAYWRIGHT_TEST_PASSWORD",
	);

	await loginAsTestUser(page);
	await expect(page).toHaveURL(/\/dashboard$/);

	await page.goto("/orders/new", { waitUntil: "domcontentloaded" });

	await expect(page.getByRole("heading", { name: /nueva orden de trabajo/i })).toBeVisible();
	await expect(
		page.getByRole("heading", { name: /primero cree o seleccione un caso de servicio/i }),
	).toBeVisible();
	await expect(page.getByRole("link", { name: /abrir cockpit/i })).toHaveAttribute(
		"href",
		"/service-cases",
	);
	await expect(page.getByRole("link", { name: /nueva solicitud/i })).toHaveAttribute(
		"href",
		"/work-requests/new",
	);
	await expect(page.getByRole("button", { name: /crear orden de trabajo/i })).toHaveCount(0);
});
