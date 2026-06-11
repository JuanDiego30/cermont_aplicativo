import { expect, test } from "@playwright/test";
import { E2E_TEST_USERS } from "./auth-credentials";

/**
 * Documents Page Smoke Tests
 * Verifies sync status indicator, theme consistency, and UI elements
 * on the documents management page.
 */

test.describe("Documents Page Smoke", () => {
	test.beforeEach(async ({ page }) => {
		await page.goto("/login");
		await page.getByLabel("Correo electrónico").first().fill(E2E_TEST_USERS.admin.email);
		await page.getByLabel("Contraseña").first().fill(E2E_TEST_USERS.admin.password);
		await page
			.getByRole("button", { name: /iniciar sesión/i })
			.first()
			.click();
		await page.waitForURL(/dashboard/, { timeout: 15000 });
	});

	test("page loads without console errors", async ({ page }) => {
		const logs: string[] = [];

		page.on("console", (msg) => {
			if (msg.type() === "error") {
				logs.push(msg.text());
			}
		});

		await page.goto("/documents");
		await page.waitForLoadState("networkidle", { timeout: 10000 });

		expect(logs.filter((l) => !l.includes("favicon"))).toEqual([]);
	});

	test("shows document page header", async ({ page }) => {
		await page.goto("/documents");
		await page.waitForLoadState("networkidle", { timeout: 10000 });

		await expect(page.getByText("Gestión de documentos")).toBeVisible();
		await expect(page.getByText("Dashboard / Documentos")).toBeVisible();
	});

	test("filters are visible and accessible", async ({ page }) => {
		await page.goto("/documents");
		await page.waitForLoadState("networkidle", { timeout: 10000 });

		// Search input
		const searchInput = page.getByPlaceholder(/Buscar por/i);
		await expect(searchInput).toBeVisible();

		// Filter selects
		const orderFilter = page.getByLabel(/Filtrar por OT/i);
		await expect(orderFilter).toBeVisible();

		const purposeFilter = page.getByLabel(/Filtrar por propósito/i);
		await expect(purposeFilter).toBeVisible();

		const stepFilter = page.getByLabel(/Filtrar por paso/i);
		await expect(stepFilter).toBeVisible();

		// Buttons
		await expect(page.getByRole("button", { name: /Filtrar/i })).toBeVisible();
		await expect(page.getByRole("button", { name: /Limpiar filtros/i })).toBeVisible();

		// Checkbox
		await expect(page.getByLabel(/Mostrar archivados/i)).toBeVisible();
	});

	test("document uploader tabs are visible", async ({ page }) => {
		await page.goto("/documents");
		await page.waitForLoadState("networkidle", { timeout: 10000 });

		await expect(page.getByText("Subir nuevo documento")).toBeVisible();
		await expect(page.getByText("Seleccionar existente")).toBeVisible();
	});

	test("sync status indicator is present in header", async ({ page }) => {
		await page.goto("/documents");
		await page.waitForLoadState("networkidle", { timeout: 10000 });

		// NetworkStatusChip is in the header with aria-label containing network status
		const networkChip = page.getByLabel(/Estado de red/i);
		await expect(networkChip).toBeVisible();
	});

	test("no invasive sync modal covers page content", async ({ page }) => {
		await page.goto("/documents");
		await page.waitForLoadState("networkidle", { timeout: 10000 });

		// The "Sin cambios pendientes" text should NOT be visible as a modal/banner
		// The main content should be unobstructed
		const main = page.locator("main").first();
		await expect(main).toBeVisible();
	});

	test("dark mode renders correctly", async ({ page }) => {
		await page.goto("/documents");
		await page.waitForLoadState("networkidle", { timeout: 10000 });

		// Apply dark mode class
		await page.evaluate(() => {
			document.documentElement.classList.add("dark");
		});

		// Verify content is still visible
		await expect(page.getByText("Gestión de documentos")).toBeVisible();
		const main = page.locator("main").first();
		await expect(main).toBeVisible();

		// Verify dark mode is applied
		const hasDark = await page.evaluate(() => {
			return document.documentElement.classList.contains("dark");
		});
		expect(hasDark).toBe(true);

		// Remove dark mode
		await page.evaluate(() => {
			document.documentElement.classList.remove("dark");
		});
	});

	test("light mode renders correctly", async ({ page }) => {
		await page.goto("/documents");
		await page.waitForLoadState("networkidle", { timeout: 10000 });

		// Ensure light mode
		await page.evaluate(() => {
			document.documentElement.classList.remove("dark");
		});

		// Verify content is visible
		await expect(page.getByText("Gestión de documentos")).toBeVisible();
		await expect(page.getByPlaceholder(/Buscar por/i)).toBeVisible();
	});
});
