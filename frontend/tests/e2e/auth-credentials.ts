import type { Page } from "@playwright/test";

export const E2E_LOGIN_EMAIL = process.env.PLAYWRIGHT_E2E_EMAIL ?? "gerente@cermont.com";
const E2E_LOGIN_PASSWORD =
	process.env.SEED_DEFAULT_PASSWORD ??
	process.env.PLAYWRIGHT_E2E_PASSWORD ??
	process.env.PLAYWRIGHT_TEST_PASSWORD ??
	"";

export const E2E_ADMIN = {
	email: process.env.PLAYWRIGHT_E2E_ADMIN_EMAIL ?? "admin@cermont.test",
	password: process.env.PLAYWRIGHT_E2E_ADMIN_PASSWORD ?? "Admin123!",
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

export const E2E_KIT = {
	name: "Kit Eléctrico Estándar",
	activityType: "electrico" as const,
	tools: [{ name: "Multímetro", quantity: 1, specifications: "Digital" }],
	equipment: [{ name: "EPP Completo", quantity: 1, certificateRequired: false }],
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

export async function loginAsTestUser(page: Page): Promise<void> {
	const { email, password } = getE2ECredentials();

	await page.goto("/login");
	await page.getByLabel("Correo electrónico").first().fill(email);
	await page.getByLabel("Contraseña").first().fill(password);
	await page
		.getByRole("button", { name: /iniciar sesión/i })
		.first()
		.click();
	await page.waitForURL(/dashboard/, { timeout: 15_000 });
}
