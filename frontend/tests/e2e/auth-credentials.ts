import type { Page } from "@playwright/test";

export const DEFAULT_TEST_PASSWORD = "Admin123!";

export const E2E_ADMIN = {
	email: process.env.PLAYWRIGHT_E2E_ADMIN_EMAIL ?? "admin@cermont.test",
	password: process.env.PLAYWRIGHT_E2E_ADMIN_PASSWORD ?? DEFAULT_TEST_PASSWORD,
	role: "gerente" as const,
};

export const E2E_SUPERVISOR = {
	email: process.env.PLAYWRIGHT_E2E_SUPERVISOR_EMAIL ?? "sup@cermont.test",
	password: process.env.PLAYWRIGHT_E2E_SUPERVISOR_PASSWORD ?? "Sup123!",
	role: "supervisor" as const,
};

export const E2E_TECHNICIAN = {
	email: process.env.PLAYWRIGHT_E2E_TECHNICIAN_EMAIL ?? "tech@cermont.test",
	password: process.env.PLAYWRIGHT_E2E_TECHNICIAN_PASSWORD ?? "Tech123!",
	role: "tecnico" as const,
};

export const E2E_LOGIN_EMAIL = process.env.PLAYWRIGHT_E2E_EMAIL ?? E2E_ADMIN.email;
const E2E_LOGIN_PASSWORD =
	process.env.PLAYWRIGHT_E2E_PASSWORD ?? process.env.PLAYWRIGHT_TEST_PASSWORD ?? E2E_ADMIN.password;

export const E2E_KIT = {
	name: "Kit Eléctrico Estándar",
	activityType: "electrico" as const,
	tools: [{ name: "Multímetro", quantity: 1, specifications: "Digital" }],
	equipment: [{ name: "EPP Completo", quantity: 1, certificateRequired: false }],
};

export const E2E_TEST_USERS = {
	admin: E2E_ADMIN,
	supervisor: E2E_SUPERVISOR,
	technician: E2E_TECHNICIAN,
};

export function hasE2ECredentials(): boolean {
	return E2E_LOGIN_PASSWORD.length > 0;
}

export function getE2ECredentials(): { email: string; password: string } {
	if (!hasE2ECredentials()) {
		throw new Error(
			"Authenticated E2E flows require SEED_DEFAULT_PASSWORD, PLAYWRIGHT_E2E_PASSWORD, or PLAYWRIGHT_TEST_PASSWORD.",
		);
	}

	return {
		email: E2E_LOGIN_EMAIL,
		password: E2E_LOGIN_PASSWORD,
	};
}

export async function loginAsUser(
	page: Page,
	credentials: { email: string; password: string },
): Promise<void> {
	await page.goto("/login");
	await page.locator('form[data-hydrated="true"]').waitFor();
	await page.getByLabel("Correo electrónico").first().fill(credentials.email);
	await page.getByLabel("Contraseña").first().fill(credentials.password);
	await page
		.getByRole("button", { name: /iniciar sesión/i })
		.first()
		.click();
	await page.waitForURL(/dashboard/, { timeout: 15_000 });
}

export async function loginAsTestUser(page: Page): Promise<void> {
	await loginAsUser(page, getE2ECredentials());
}
