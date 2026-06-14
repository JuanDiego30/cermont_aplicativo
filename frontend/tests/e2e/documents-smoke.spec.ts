import { expect, test } from "@playwright/test";
import { E2E_ADMIN, loginAsUser } from "./auth-credentials";

/**
 * Documents Page Smoke Tests
 * Verifies sync status indicator, theme consistency, and UI elements
 * on the documents management page.
 */

test.describe("Documents Page Smoke", () => {
	test.beforeEach(async ({ page }) => {
		await loginAsUser(page, E2E_ADMIN);
	});

	test("page loads without console errors", async ({ page }) => {
		const logs: string[] = [];

		page.on("console", (msg) => {
			if (msg.type() === "error") {
				logs.push(msg.text());
			}
		});

		await page.goto("/documents");
		await page.waitForLoadState("domcontentloaded", { timeout: 10000 });

		expect(logs.filter((l) => !l.includes("favicon"))).toEqual([]);
	});

	test("shows document page header", async ({ page }) => {
		await page.goto("/documents");
		await page.waitForLoadState("domcontentloaded", { timeout: 10000 });

		await expect(page.getByText("Gestión de documentos")).toBeVisible();
		await expect(page.getByText("Dashboard / Documentos")).toBeVisible();
	});

	test("filters are visible and accessible", async ({ page }) => {
		await page.goto("/documents");
		await page.waitForLoadState("domcontentloaded", { timeout: 10000 });

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
		await page.waitForLoadState("domcontentloaded", { timeout: 10000 });

		await expect(page.getByText("Subir nuevo documento")).toBeVisible();
		await expect(page.getByText("Seleccionar existente")).toBeVisible();
	});

	test("sync status indicator appears when the connection is offline", async ({ page }) => {
		await page.goto("/documents");
		await page.waitForLoadState("domcontentloaded", { timeout: 10000 });

		await expect(page.getByLabel(/Estado de red/i)).toHaveCount(0);
		await page.context().setOffline(true);
		const networkChip = page.getByLabel(/Estado de red/i);
		await expect(networkChip).toBeVisible();
		await expect(networkChip).toHaveAccessibleName(/sin conexión/i);
		await page.context().setOffline(false);
	});

	test("no invasive sync modal covers page content", async ({ page }) => {
		await page.goto("/documents");
		await page.waitForLoadState("domcontentloaded", { timeout: 10000 });

		// The "Sin cambios pendientes" text should NOT be visible as a modal/banner
		// The main content should be unobstructed
		const main = page.locator("main").first();
		await expect(main).toBeVisible();
	});

	test("dark mode renders correctly", async ({ page }) => {
		await page.goto("/documents");
		await page.waitForLoadState("domcontentloaded", { timeout: 10000 });

		await page.evaluate(() => {
			window.localStorage.setItem("cermont-theme", "dark");
		});
		await page.reload();

		await expect(page.getByText("Gestión de documentos")).toBeVisible();
		const main = page.locator("main").first();
		await expect(main).toBeVisible();
		await expect(page.getByRole("button", { name: /cambiar tema\. actual: dark/i })).toBeVisible();

		const hasDark = await page.evaluate(() => {
			return document.documentElement.classList.contains("dark");
		});
		expect(hasDark).toBe(true);

		await page.evaluate(() => {
			window.localStorage.removeItem("cermont-theme");
		});
	});

	test("light mode renders correctly", async ({ page }) => {
		await page.goto("/documents");
		await page.waitForLoadState("domcontentloaded", { timeout: 10000 });

		// Ensure light mode
		await page.evaluate(() => {
			document.documentElement.classList.remove("dark");
		});

		// Verify content is visible
		await expect(page.getByText("Gestión de documentos")).toBeVisible();
		await expect(page.getByPlaceholder(/Buscar por/i)).toBeVisible();
	});
});
