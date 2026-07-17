import { expect, test } from "@playwright/test";
import { getE2ECredentials, hasE2ECredentials } from "../auth-credentials";

test.describe("QA-CRIT-02: Customer form submission", () => {
	test.skip(!hasE2ECredentials(), "E2E credentials not configured");

	test("create customer via UI and verify API POST + redirect", async ({ page }) => {
		const { email, password } = getE2ECredentials();

		await test.step("Login", async () => {
			await page.goto("/login");
			await page.getByLabel("Correo electrónico").first().fill(email);
			await page.getByLabel("Contraseña").first().fill(password);
			await page
				.getByRole("button", { name: /iniciar sesión/i })
				.first()
				.click();
			await page.waitForURL(/dashboard/, { timeout: 15_000 });
		});

		await test.step("Navigate to /customers/new", async () => {
			await page.goto("/customers/new");
			await page.waitForLoadState("networkidle");
			await expect(page.getByRole("heading", { name: /nuevo cliente/i })).toBeVisible();
		});

		const unique = Date.now().toString(36);
		const clientData = {
			name: `Caracterización ${unique}`,
			nit: `${unique.slice(0, 9)}-${unique.slice(9, 1) || "5"}`,
			contactName: `Contacto ${unique}`,
			email: `cliente-${unique}@test.com`,
			phone: `300${unique.slice(0, 7)}`,
			address: `Calle ${unique.slice(0, 4)} #${unique.slice(4, 8)}`,
			city: "Bogotá",
			industry: "Tecnología",
		};

		await test.step("Fill all required fields", async () => {
			await page.getByLabel(/razón social/i).fill(clientData.name);
			await page.getByLabel(/^nit$/i).fill(clientData.nit);
			await page.getByLabel(/persona de contacto/i).fill(clientData.contactName);
			await page.getByLabel(/^email$/i).fill(clientData.email);
			await page.getByLabel(/teléfono/i).fill(clientData.phone);
			await page.getByLabel(/dirección/i).fill(clientData.address);
			await page.getByLabel(/ciudad/i).fill(clientData.city);
			await page.getByLabel(/industria/i).fill(clientData.industry);
		});

		await test.step("Submit and verify API POST call", async () => {
			const responsePromise = page.waitForResponse(
				(resp) =>
					resp.url().includes("/api/backend/clients") &&
					resp.request().method() === "POST",
				{ timeout: 20_000 },
			);

			await page.getByRole("button", { name: /crear cliente/i }).click();

			const response = await responsePromise;
			expect(response.status()).toBe(201);

			const body = await response.json();
			expect(body.success).toBe(true);
			expect(body.data).toBeDefined();
			expect(body.data._id).toBeTruthy();
		});

		await test.step("Verify redirect to customer detail page", async () => {
			await page.waitForURL(/\/customers\/(?!new)[a-f0-9]{24}/, { timeout: 15_000 });
			expect(page.url()).toMatch(/\/customers\/(?!new)[a-f0-9]{24}/);
		});
	});

	test("create customer with missing required fields shows validation errors", async ({ page }) => {
		const { email, password } = getE2ECredentials();

		await test.step("Login", async () => {
			await page.goto("/login");
			await page.getByLabel("Correo electrónico").first().fill(email);
			await page.getByLabel("Contraseña").first().fill(password);
			await page
				.getByRole("button", { name: /iniciar sesión/i })
				.first()
				.click();
			await page.waitForURL(/dashboard/, { timeout: 15_000 });
		});

		await test.step("Navigate and submit empty form", async () => {
			await page.goto("/customers/new");
			await page.waitForLoadState("networkidle");

			await page.getByRole("button", { name: /crear cliente/i }).click();
		});

		await test.step("Verify validation errors displayed", async () => {
			await expect(page.getByRole("alert").first()).toBeVisible({ timeout: 5_000 });
		});
	});
});
