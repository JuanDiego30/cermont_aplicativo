import type { Page } from "@playwright/test";
import { E2E_ADMIN, E2E_SUPERVISOR, E2E_TECHNICIAN, loginAsUser } from "../auth-credentials";

export { E2E_ADMIN, E2E_SUPERVISOR, E2E_TECHNICIAN } from "../auth-credentials";

export const AUTH_CONFIG = {
	gerente: E2E_ADMIN,
	supervisor: E2E_SUPERVISOR,
	tecnico: E2E_TECHNICIAN,
} as const;

export type AuthRole = keyof typeof AUTH_CONFIG;

export async function loginAsRole(page: Page, role: AuthRole): Promise<Page> {
	const creds = AUTH_CONFIG[role];
	await loginAsUser(page, creds);
	return page;
}

export async function loginAsGerente(page: Page): Promise<Page> {
	return loginAsRole(page, "gerente");
}

export async function loginAsSupervisor(page: Page): Promise<Page> {
	return loginAsRole(page, "supervisor");
}

export async function loginAsTecnico(page: Page): Promise<Page> {
	return loginAsRole(page, "tecnico");
}

export async function logout(page: Page): Promise<void> {
	const userMenu = page.locator('[data-testid="user-menu"], [aria-label="Menú de usuario"]').first();
	if (await userMenu.isVisible({ timeout: 2000 }).catch(() => false)) {
		await userMenu.click();
		const logoutBtn = page.getByRole("button", { name: /cerrar sesión|salir|logout/i }).first();
		if (await logoutBtn.isVisible({ timeout: 2000 }).catch(() => false)) {
			await logoutBtn.click();
			await page.waitForURL(/login/, { timeout: 10_000 });
		}
	}
}

export async function navigateToPage(page: Page, route: string): Promise<void> {
	await page.goto(route);
	await page.waitForLoadState("networkidle", { timeout: 15_000 }).catch(() => {});
}
