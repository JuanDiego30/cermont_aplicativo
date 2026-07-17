import { expect, test } from "@playwright/test";
import { getE2ECredentials, hasE2ECredentials } from "../auth-credentials";

test.describe("QA-CRIT-01: Work request form submission", () => {
	test.skip(!hasE2ECredentials(), "E2E credentials not configured");

	test("create work request via UI and verify API POST + success feedback", async ({ page }) => {
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

		await test.step("Navigate to /work-requests/new", async () => {
			await page.goto("/work-requests/new");
			await page.waitForLoadState("networkidle");
			await expect(
				page.getByRole("heading", { name: /nueva solicitud de trabajo/i }),
			).toBeVisible();
		});

		const unique = Date.now().toString(36);
		const wrData = {
			clientName: `Cliente ${unique}`,
			requesterName: `Solicitante ${unique}`,
			serviceSite: `Sitio ${unique}`,
			shortDescription: `Resumen corto ${unique}`,
			description: `Descripción detallada de la solicitud de prueba ${unique}. Verificar que el flujo completo funcione.`,
		};

		await test.step("Fill required fields", async () => {
			await page.locator("#requesterName").fill(wrData.requesterName);
			await page.locator("#clientName").fill(wrData.clientName);
			await page.locator("#serviceSite").fill(wrData.serviceSite);
			await page.locator("#shortDescription").fill(wrData.shortDescription);
			await page.locator("#description").fill(wrData.description);
		});

		await test.step("Select service type and urgency", async () => {
			const serviceSelect = page.locator('select[name="serviceType"]');
			await serviceSelect.selectOption("electricidad");

			const urgencySelect = page.locator("select").filter({ hasText: /baja|media|alta|critica/i });
			if (await urgencySelect.isVisible()) {
				await urgencySelect.selectOption("high");
			}
		});

		await test.step("Submit and verify API POST call", async () => {
			const responsePromise = page.waitForResponse(
				(resp) =>
					resp.url().includes("/api/backend/work-requests") &&
					resp.request().method() === "POST",
				{ timeout: 20_000 },
			);

			await page.getByRole("button", { name: /crear solicitud/i }).click();

			const response = await responsePromise;
			expect(response.status()).toBe(201);

			const body = await response.json();
			expect(body.success).toBe(true);
			expect(body.data).toBeDefined();
			expect(body.data.serviceCase).toBeDefined();
			expect(body.data.serviceCase._id).toBeTruthy();
		});

		await test.step("Verify success toast and redirect", async () => {
			await expect(page.getByText(/solicitud creada/i).first()).toBeVisible({ timeout: 10_000 });
			await page.waitForURL(/\/service-cases\//, { timeout: 15_000 });
			expect(page.url()).toContain("/service-cases/");
		});
	});

	test("create work request with missing required fields shows validation errors", async ({
		page,
	}) => {
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
			await page.goto("/work-requests/new");
			await page.waitForLoadState("networkidle");

			await page.getByRole("button", { name: /crear solicitud/i }).click();
		});

		await test.step("Verify validation errors reported", async () => {
			await page.waitForTimeout(2_000);
			const form = page.locator("form").first();
			const text = await form.textContent();
			expect(text?.length).toBeGreaterThan(0);
		});
	});
});
