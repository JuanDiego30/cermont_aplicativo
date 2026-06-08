import { test, expect } from "@playwright/test";
import { LoginPage } from "./pages/LoginPage";

test.describe("Auth", () => {
	test.beforeEach(async ({ page }) => {
		await page.goto("/login");
	});

	test("shows login page and rejects invalid credentials", async ({ page }) => {
		const login = new LoginPage(page);
		await login.fillCredentials("bad@user", "wrong");
		await login.submit();

		await expect(page.getByText(/credenciales inválidas|inválidas/i)).toBeVisible();
	});

	test("successful login navigates to dashboard", async ({ page }) => {
		const login = new LoginPage(page);
		await login.fillCredentials(process.env.E2E_USER_EMAIL!, process.env.E2E_USER_PASSWORD!);
		await login.submit();

		await expect(page.getByRole("heading", { name: /dashboard/i })).toBeVisible();
	});

	test("logout redirects to login", async ({ page }) => {
		const login = new LoginPage(page);
		await login.fillCredentials(process.env.E2E_USER_EMAIL!, process.env.E2E_USER_PASSWORD!);
		await login.submit();

		await page.getByRole("button", { name: /cerrar sesión|logout|salir/i }).click();
		await expect(page.getByRole("heading", { name: /iniciar sesión|login/i })).toBeVisible();
	});

	test("protected route redirects unauthenticated users to login", async ({ page }) => {
		await page.goto("/dashboard");
		await expect(page.getByRole("heading", { name: /iniciar sesión|login/i })).toBeVisible();
	});
});
