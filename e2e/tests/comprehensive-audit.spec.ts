import { expect, test, type Page, type ConsoleMessage } from "@playwright/test";
import path from "path";
import fs from "fs";

const SCREENSHOT_DIR = path.resolve(__dirname, "../../test-results/audit-screenshots");

interface RouteResult {
	route: string;
	status: "ok" | "error" | "redirect" | "broken";
	statusCode: number;
	consoleErrors: string[];
	hasContent: boolean;
	hasLoadingState: boolean;
	hasErrorBoundary: boolean;
	visibleHeadings: string[];
	emptyStates: string[];
	ctas: string[];
	screenshotPath: string;
	notes: string[];
}

interface AuditReport {
	startedAt: string;
	finishedAt: string;
	user: string;
	routes: RouteResult[];
	summary: {
		total: number;
		ok: number;
		error: number;
		redirect: number;
		broken: number;
		totalConsoleErrors: number;
		routesWithErrors: string[];
	};
	workflow: WorkflowResult[];
}

interface WorkflowResult {
	step: string;
	route: string;
	accessible: boolean;
	notes: string[];
}

const TEST_USER = process.env.E2E_USER_EMAIL || "gerencia@cermont.co";
const TEST_PASS = process.env.E2E_USER_PASSWORD || "Cermont2026!Dev01";

const ROUTES = [
	"/dashboard",
	"/service-cases",
	"/customers",
	"/work-requests",
	"/work-requests/new",
	"/site-visits",
	"/proposals",
	"/purchase-orders",
	"/orders",
	"/planning",
	"/execution",
	"/evidences",
	"/dispatch",
	"/maintenance",
	"/sla",
	"/reports",
	"/reports/analytics",
	"/delivery-records",
	"/billing",
	"/billing/ses",
	"/billing/invoices",
	"/payments",
	"/costs",
	"/documents",
	"/templates",
	"/resources",
	"/inventory",
	"/inventory/scan",
	"/fleet",
	"/assets",
	"/admin/personnel",
	"/admin/backups",
	"/admin/custom-fields",
	"/admin/audit",
	"/admin/settings",
	"/admin/erp-connectors",
] as const;

const WORKFLOW_STEPS: { step: string; route: string }[] = [
	{ step: "1. Solicitud de servicio", route: "/work-requests" },
	{ step: "2. Visita técnica", route: "/site-visits" },
	{ step: "3. Propuesta", route: "/proposals" },
	{ step: "4. Orden de compra", route: "/purchase-orders" },
	{ step: "5. Planificación", route: "/planning" },
	{ step: "6. Ejecución", route: "/execution" },
	{ step: "7. Evidencias", route: "/evidences" },
	{ step: "8. Informe técnico", route: "/reports" },
	{ step: "9. Acta de entrega", route: "/delivery-records" },
	{ step: "10. Firma cliente", route: "/service-cases" },
	{ step: "11. SES / Ariba", route: "/billing/ses" },
	{ step: "12. Facturación", route: "/billing/invoices" },
	{ step: "13. Aprobación factura", route: "/billing" },
	{ step: "14. Pago", route: "/payments" },
];

const LOADING_INDICATORS = [
	/cargando/i,
	/loading/i,
	/spinner/i,
	/⌛/i,
	/🔄/i,
	/skeleton/i,
	/progress/i,
];

const ERROR_INDICATORS = [
	/error/i,
	/fallo/i,
	/fracaso/i,
	/ocurrió un problema/i,
	/algo salió mal/i,
	/intente de nuevo/i,
	/recargue/i,
];

const EMPTY_STATE_INDICATORS = [
	/no hay/i,
	/no se encontraron/i,
	/no se han/i,
	/vacío/i,
	/empty/i,
	/sin datos/i,
	/sin registros/i,
	/ningún/i,
	/no tiene/i,
];

const ERROR_BOUNDARY_INDICATORS = [
	/algo salió mal/i,
	/error inesperado/i,
	/ups/i,
	/recargue la página/i,
	/404/i,
	/página no encontrada/i,
	/not found/i,
];

async function setupConsoleCapture(page: Page): Promise<ConsoleMessage[]> {
	const errors: ConsoleMessage[] = [];
	page.on("console", (msg) => {
		if (msg.type() === "error" || msg.type() === "warning") {
			errors.push(msg);
		}
	});
	return errors;
}

async function auditRoute(
	page: Page,
	route: string,
): Promise<RouteResult> {
	const consoleErrors = await setupConsoleCapture(page);

	const result: RouteResult = {
		route,
		status: "ok",
		statusCode: 200,
		consoleErrors: [],
		hasContent: false,
		hasLoadingState: false,
		hasErrorBoundary: false,
		visibleHeadings: [],
		emptyStates: [],
		ctas: [],
		screenshotPath: "",
		notes: [],
	};

	let response;
	try {
		response = await page.goto(route, { waitUntil: "networkidle", timeout: 15000 });
	} catch (err) {
		result.status = "broken";
		result.notes.push(`Navigation failed: ${err}`);
		result.screenshotPath = await takeScreenshot(page, route);
		return result;
	}

	if (response) {
		result.statusCode = response.status();
		if (response.status() >= 400) {
			result.status = "error";
			result.notes.push(`HTTP ${response.status()} ${response.statusText()}`);
		} else if (response.status() >= 300 && response.status() < 400) {
			result.status = "redirect";
			result.notes.push(`Redirected to ${response.headers()["location"] || "unknown"}`);
		}
	}

	// Wait a beat for JS rendering
	await page.waitForTimeout(1000);

	// Collect console errors
	result.consoleErrors = consoleErrors
		.filter((m) => m.type() === "error")
		.map((m) => m.text());

	if (result.consoleErrors.length > 0) {
		result.notes.push(`Console errors: ${result.consoleErrors.length}`);
	}

	// Check for loading states
	for (const indicator of LOADING_INDICATORS) {
		const loadingElements = page.locator(`text=${indicator.source}`);
		if ((await loadingElements.count()) > 0) {
			result.hasLoadingState = true;
			result.notes.push(`Loading indicator found: ${indicator.source}`);
			break;
		}
	}

	// Check for error boundary text
	for (const indicator of ERROR_BOUNDARY_INDICATORS) {
		const errorElements = page.locator(`text=${indicator.source}`);
		if ((await errorElements.count()) > 0) {
			result.hasErrorBoundary = true;
			result.notes.push(`Error boundary indicator found: ${indicator.source}`);
			break;
		}
	}

	// Get visible headings
	const headings = page.locator("h1, h2, h3, h4, h5, h6");
	const headingCount = await headings.count();
	for (let i = 0; i < Math.min(headingCount, 10); i++) {
		const text = (await headings.nth(i).textContent()) || "";
		if (text.trim()) {
			result.visibleHeadings.push(text.trim());
		}
	}

	if (headingCount > 10) {
		result.notes.push(`Page has ${headingCount} headings (first 10 recorded)`);
	}

	// Check for empty state indicators
	for (const indicator of EMPTY_STATE_INDICATORS) {
		const emptyElements = page.locator(`text=${indicator.source}`);
		if ((await emptyElements.count()) > 0) {
			result.emptyStates.push(indicator.source);
		}
	}

	// Check for CTAs (buttons, links that suggest action)
	const buttons = page.locator("button, a[role='button']");
	const buttonCount = await buttons.count();
	for (let i = 0; i < Math.min(buttonCount, 5); i++) {
		const text = (await buttons.nth(i).textContent()) || "";
		if (text.trim()) {
			result.ctas.push(text.trim());
		}
	}

	// Determine if page has meaningful content
	result.hasContent = headingCount > 0 || buttonCount > 0;

	if (!result.hasContent) {
		result.notes.push("Page appears to have no visible content");
	}

	// Screenshot
	result.screenshotPath = await takeScreenshot(page, route);

	return result;
}

async function takeScreenshot(page: Page, route: string): Promise<string> {
	const sanitized = route.replace(/\//g, "_").replace(/^_/, "") || "index";
	const filename = `audit_${sanitized}.png`;
	const filepath = path.join(SCREENSHOT_DIR, filename);
	await page.screenshot({ path: filepath, fullPage: true });
	return filepath;
}

test.describe("Comprehensive Application Audit", () => {
	let report: AuditReport;

	test.beforeAll(() => {
		fs.mkdirSync(SCREENSHOT_DIR, { recursive: true });
		report = {
			startedAt: new Date().toISOString(),
			finishedAt: "",
			user: TEST_USER,
			routes: [],
			summary: {
				total: 0,
				ok: 0,
				error: 0,
				redirect: 0,
				broken: 0,
				totalConsoleErrors: 0,
				routesWithErrors: [],
			},
			workflow: [],
		};
	});

	test.beforeEach(async ({ page }) => {
		// Login before each test
		await page.goto("/login", { waitUntil: "networkidle" });
		await page.getByLabel("Email").fill(TEST_USER);
		await page.getByLabel("Password").fill(TEST_PASS);
		await page.getByRole("button", { name: /iniciar sesión/i }).click();
		await expect(page.getByRole("heading", { name: /dashboard/i })).toBeVisible({ timeout: 10000 });
	});

	test.afterAll(() => {
		report.finishedAt = new Date().toISOString();
		// Build summary
		for (const r of report.routes) {
			if (r.status === "ok") report.summary.ok++;
			else if (r.status === "error") report.summary.error++;
			else if (r.status === "redirect") report.summary.redirect++;
			else if (r.status === "broken") report.summary.broken++;
			if (r.consoleErrors.length > 0) {
				report.summary.totalConsoleErrors += r.consoleErrors.length;
				report.summary.routesWithErrors.push(r.route);
			}
		}
		report.summary.total = report.routes.length;

		// Write report JSON
		const reportPath = path.join(SCREENSHOT_DIR, "audit-report.json");
		fs.writeFileSync(reportPath, JSON.stringify(report, null, 2), "utf-8");

		// Print summary to stdout
		console.log("\n═══════════════════════════════════════════════");
		console.log("  AUDIT COMPLETE");
		console.log("═══════════════════════════════════════════════");
		console.log(`  User:            ${report.user}`);
		console.log(`  Routes visited:  ${report.summary.total}`);
		console.log(`  OK:              ${report.summary.ok}`);
		console.log(`  Errors:          ${report.summary.error}`);
		console.log(`  Redirects:       ${report.summary.redirect}`);
		console.log(`  Broken:          ${report.summary.broken}`);
		console.log(`  Console errors:  ${report.summary.totalConsoleErrors}`);
		console.log(`  Screenshots:     ${report.summary.total}`);
		console.log(`  Report:          ${reportPath}`);
		console.log("═══════════════════════════════════════════════\n");
	});

	test("should login successfully", async ({ page }) => {
		await expect(page.getByRole("heading", { name: /dashboard/i })).toBeVisible();
	});

	for (const route of ROUTES) {
		test(`audit route: ${route}`, async ({ page }) => {
			const result = await test.step(`Visiting ${route}`, async () => {
				return auditRoute(page, route);
			});

			report.routes.push(result);

			// Basic assertions - don't fail the test for non-critical issues
			expect(result.statusCode, `${route} returned ${result.statusCode}`).not.toBe(404);
			expect(result.statusCode, `${route} returned ${result.statusCode}`).not.toBe(500);

			if (result.consoleErrors.length > 0) {
				test.info().annotations.push({
					type: "warning",
					description: `Console errors on ${route}: ${result.consoleErrors.join("; ")}`,
				});
			}
		});
	}

	test("14-step workflow progression audit", async ({ page }) => {
		await test.step("Checking 14-step workflow access", async () => {
			for (const step of WORKFLOW_STEPS) {
				const workflowResult: WorkflowResult = {
					step: step.step,
					route: step.route,
					accessible: false,
					notes: [],
				};

				try {
					const response = await page.goto(step.route, { waitUntil: "networkidle", timeout: 15000 });
					workflowResult.accessible = response !== null && response.status() < 400;

					if (response) {
						if (response.status() >= 400) {
							workflowResult.notes.push(`HTTP ${response.status()}`);
						}
						if (response.status() >= 300 && response.status() < 400) {
							workflowResult.notes.push(`Redirect: ${response.headers()["location"] || "?"}`);
						}
					}

					// Check for content on the page
					const headings = page.locator("h1, h2");
					if ((await headings.count()) > 0) {
						workflowResult.notes.push(`Headings: ${await headings.first().textContent()}`);
					} else {
						workflowResult.notes.push("No headings found");
					}
				} catch (err) {
					workflowResult.notes.push(`Navigation error: ${err}`);
				}

				report.workflow.push(workflowResult);

				console.log(
					`  ${workflowResult.accessible ? "✅" : "❌"} ${step.step.padEnd(25)} ${step.route.padEnd(25)} ${workflowResult.notes.join(", ")}`,
				);
			}

			// Summary assertions
			const accessible = report.workflow.filter((w) => w.accessible).length;
			const total = report.workflow.length;
			console.log(`\n  14-step workflow: ${accessible}/${total} steps accessible`);
		});
	});
});
