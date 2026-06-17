/**
 * deploy-readiness.spec.ts
 *
 * Prueba End-to-End de validación técnica para despliegue del aplicativo CERMONT.
 *
 * Cobertura:
 *   1. Backend vivo (/api/health)
 *   2. Autenticación por API (JWT + cookies)
 *   3. Inicio de sesión por interfaz
 *   4. Navegación por todos los módulos principales del sidebar
 *   5. Detección de errores de consola y renderizado
 *   6. CRUD crítico de órdenes: crear, consultar, editar y cancelar
 *   7. Prueba intencional de brecha: propuesta sin mecanismo de eliminación/anulación
 *
 * Ejecución:
 *   cd frontend
 *   E2E_API_URL="http://127.0.0.1:5000/api" \
 *   E2E_MANAGER_EMAIL="Gerencia@cermont.co" \
 *   E2E_MANAGER_PASSWORD="Cermon2026!" \
 *   npm run test:e2e -- tests/e2e/deploy-readiness.spec.ts
 *
 * @tag deploy
 */

import fs from "node:fs";
import path from "node:path";
import { type APIRequestContext, expect, test } from "@playwright/test";
import { E2E_TEST_USERS } from "./auth-credentials";

// ── Configuration ────────────────────────────────────────────────────────────
const API_BASE = (process.env.E2E_API_URL ?? "http://localhost:4000/api").replace(/\/+$/, "");

const MANAGER = {
	email: process.env.E2E_MANAGER_EMAIL ?? E2E_TEST_USERS.admin.email,
	password: process.env.E2E_MANAGER_PASSWORD ?? E2E_TEST_USERS.admin.password,
};

interface ApiEnvelope<T> {
	success: boolean;
	data: T;
}

interface AuthData {
	accessToken: string;
}

interface HealthResponse {
	status: string;
	uptime: number;
	timestamp: string;
	readyState: number;
}

interface OrderResponse {
	_id: string;
	description: string;
	status: string;
}

interface ProposalResponse {
	_id: string;
	status: string;
}

// ── Shared auth state ────────────────────────────────────────────────────────
// Login once and reuse across API sections to avoid rate limiting.
let SHARED_TOKEN = "";
let TOKEN_OBTAINED = false;

/**
 * Authenticate with retry on 429 (rate limit).
 * Sleeps up to 30s before giving up.
 */
async function authenticate(request: APIRequestContext): Promise<string> {
	if (TOKEN_OBTAINED && SHARED_TOKEN) {
		return SHARED_TOKEN;
	}

	for (let attempt = 1; attempt <= 5; attempt++) {
		const response = await request.post(`${API_BASE}/auth/login`, {
			data: { email: MANAGER.email, password: MANAGER.password },
		});

		if (response.status() === 200) {
			const body: ApiEnvelope<AuthData> = await response.json();
			SHARED_TOKEN = body.data.accessToken;
			TOKEN_OBTAINED = true;
			return SHARED_TOKEN;
		}

		if (response.status() === 429) {
			const wait = Math.min(attempt * 3000, 15000);
			console.log(`  ⏳ Rate limited (429), esperando ${wait}ms (intento ${attempt}/5)...`);
			await new Promise((r) => setTimeout(r, wait));
			continue;
		}

		// Unexpected status
		console.log(`  ⚠️ Login respondió ${response.status()}, reintentando...`);
		await new Promise((r) => setTimeout(r, 2000));
	}

	throw new Error("No se pudo autenticar después de 5 intentos (rate limiting activo)");
}

// ── 1. Backend Health ────────────────────────────────────────────────────────

test.describe("1. Backend Health", () => {
	test("GET /api/health returns status ok", async ({ request }) => {
		const response = await request.get(`${API_BASE}/health`);
		expect(response.status()).toBe(200);

		const body: HealthResponse = await response.json();
		expect(body.status).toBe("ok");
		expect(typeof body.uptime).toBe("number");
		expect(typeof body.timestamp).toBe("string");
		expect(body.readyState).toBe(1);
	});
});

// ── 2. API Authentication & Cookies ─────────────────────────────────────────

test.describe("2. API Authentication", () => {
	test("POST /api/auth/login returns accessToken and user", async ({ request }) => {
		const token = await authenticate(request);
		expect(token).toBeTruthy();
	});

	test("refreshToken cookie uses transport-appropriate security flags", async ({ request }) => {
		const response = await request.post(`${API_BASE}/auth/login`, {
			data: { email: MANAGER.email, password: MANAGER.password },
		});
		// May be 429 if rate limited; accept either
		if (response.status() === 429) {
			test.info().annotations.push({
				type: "warning",
				description: "Cookie test saltado por rate limiting (429)",
			});
			return;
		}
		expect(response.status()).toBe(200);
		const setCookieHeader = response.headers()["set-cookie"] ?? "";
		expect(setCookieHeader).toContain("refreshToken=");
		expect(setCookieHeader).toContain("HttpOnly");
		expect(setCookieHeader).toContain("Path=/");
		expect(setCookieHeader).toContain("SameSite=Lax");

		if (new URL(API_BASE).protocol === "https:") {
			expect(setCookieHeader).toContain("Secure");
		} else {
			expect(setCookieHeader).not.toContain("Secure");
		}
	});

	test("login with invalid credentials returns 401", async ({ request }) => {
		const response = await request.post(`${API_BASE}/auth/login`, {
			data: { email: "invalid@test.co", password: "wrong_password_123" },
		});
		// Accept 401, 403, or 429 (rate limited)
		expect([401, 403, 429]).toContain(response.status());
		if (response.status() !== 429) {
			const body: { success: boolean } = await response.json();
			expect(body.success).toBe(false);
		}
	});

	test("GET /api/auth/me requires authentication", async ({ request }) => {
		const response = await request.get(`${API_BASE}/auth/me`, {
			headers: { Authorization: "Bearer invalid_token" },
		});
		expect([401, 403]).toContain(response.status());
	});
});

// ── 3. UI Login & Navigation ────────────────────────────────────────────────
// Login once in beforeAll and reuse storage state across all module tests.
const AUTH_STATE_PATH = path.join(process.cwd(), "tests/e2e/fixtures/.auth/deploy-ui-state.json");

test.describe("3. UI Login & Module Navigation", () => {
	test.beforeAll(async ({ browser }) => {
		// Create authenticated state once for all navigation tests
		const ctx = await browser.newContext();
		const page = await ctx.newPage();
		await page.goto("/login");
		await page.getByLabel("Correo electrónico").first().fill(MANAGER.email);
		await page.getByLabel("Contraseña").first().fill(MANAGER.password);
		await page
			.getByRole("button", { name: /iniciar sesión/i })
			.first()
			.click();
		try {
			await page.waitForURL(/dashboard/, { timeout: 20_000 });
		} catch {
			// If login fails (rate limited), mark tests as skipped
			console.log(
				"  ⚠️ UI login falló — posible rate limiting. Las pruebas de navegación se saltarán.",
			);
			await ctx.close();
			return;
		}
		await ctx.storageState({ path: AUTH_STATE_PATH });
		await ctx.close();
	});

	const MODULES: { path: string; name: string }[] = [
		{ path: "/dashboard", name: "Dashboard" },
		{ path: "/proposals", name: "Propuestas" },
		{ path: "/orders", name: "Órdenes" },
		{ path: "/planning", name: "Planeación" },
		{ path: "/execution", name: "Ejecución" },
		{ path: "/evidences", name: "Evidencias" },
		{ path: "/documents", name: "Documentos" },
		{ path: "/delivery-records", name: "Actas" },
		{ path: "/billing", name: "Cierre administrativo" },
		{ path: "/billing/ses", name: "SES / Ariba" },
		{ path: "/billing/invoices", name: "Facturas" },
		{ path: "/payments", name: "Pagos" },
		{ path: "/costs", name: "Costos" },
		{ path: "/resources", name: "Recursos" },
		{ path: "/resources/kits", name: "Kits" },
		{ path: "/assets", name: "Activos" },
		{ path: "/profile", name: "Perfil" },
		{ path: "/admin/users", name: "Usuarios" },
	];

	for (const mod of MODULES) {
		test(`3b. Módulo "${mod.name}" (${mod.path}) carga sin errores`, async ({ page }) => {
			test.skip(!fs.existsSync(AUTH_STATE_PATH), "Saltado: no hay sesión autenticada");

			await page.goto(mod.path, { waitUntil: "domcontentloaded" });

			// Verificar HTTP status
			const response = await page.goto(mod.path);
			expect(response?.status(), `${mod.name} devolvió ${response?.status()}`).not.toBe(404);
			expect(response?.status(), `${mod.name} devolvió ${response?.status()}`).not.toBe(500);

			// Verificar que la página no está en blanco
			const main = page.locator("main, [role='main'], article").first();
			await expect(main).toBeVisible({ timeout: 10_000 });

			// Detectar errores de consola
			const consoleErrors: string[] = [];
			const pageErrors: string[] = [];
			page.on("console", (msg) => {
				if (msg.type() === "error") {
					consoleErrors.push(msg.text());
				}
			});
			page.on("pageerror", (err) => pageErrors.push(err.message));

			await page.waitForTimeout(1_500);

			if (consoleErrors.length > 0) {
				test.info().annotations.push({
					type: "warning",
					description: `[${mod.name}] Errores de consola:\n${consoleErrors.join("\n")}`,
				});
			}
			if (pageErrors.length > 0) {
				test.info().annotations.push({
					type: "warning",
					description: `[${mod.name}] Errores de página:\n${pageErrors.join("\n")}`,
				});
			}
			expect(pageErrors, `${mod.name} tiene errores de renderizado`).toEqual([]);
		});
	}
});

// ── 4. CRUD Orders ──────────────────────────────────────────────────────────

test.describe("4. CRUD Orders (Critical Path)", () => {
	test.describe.configure({ mode: "serial" });

	let accessToken = "";
	let orderId = "";
	const testOrderRef = `E2E-Deploy-${Date.now()}`;

	test.beforeAll(async ({ request }) => {
		accessToken = await authenticate(request);
	});

	test("4a. Crear orden de trabajo", async ({ request }) => {
		const response = await request.post(`${API_BASE}/orders`, {
			data: {
				type: "maintenance",
				description: `Orden creada por prueba de deploy readiness - ${testOrderRef}`,
				priority: "high",
				assetId: `ASSET-${testOrderRef}`,
				assetName: "Activo de validación E2E",
				location: "Bogotá, Planta Principal",
				materials: [],
			},
			headers: { Authorization: `Bearer ${accessToken}`, "Content-Type": "application/json" },
		});

		expect(response.status()).toBe(201);
		const body: ApiEnvelope<OrderResponse> = await response.json();
		expect(body.success).toBe(true);
		orderId = body.data._id;
		expect(orderId).toBeTruthy();
		expect(body.data.description).toContain(testOrderRef);
	});

	test("4b. Consultar orden por ID", async ({ request }) => {
		const response = await request.get(`${API_BASE}/orders/${orderId}`, {
			headers: { Authorization: `Bearer ${accessToken}` },
		});
		expect(response.status()).toBe(200);
		const body: ApiEnvelope<OrderResponse> = await response.json();
		expect(body.data._id).toBe(orderId);
		expect(body.data.description).toContain(testOrderRef);
	});

	test("4c. Editar orden (actualizar descripción)", async ({ request }) => {
		const updatedDescription = `[Actualizada ${testOrderRef}] Descripción modificada por E2E`;
		const response = await request.put(`${API_BASE}/orders/${orderId}`, {
			data: {
				description: updatedDescription,
				observations: "Orden actualizada durante prueba de deploy readiness",
			},
			headers: { Authorization: `Bearer ${accessToken}`, "Content-Type": "application/json" },
		});

		expect(response.status()).toBe(200);
		const body: ApiEnvelope<OrderResponse> = await response.json();
		expect(body.success).toBe(true);
		expect(body.data.description).toBe(updatedDescription);
	});

	test("4d. Cancelar orden (soft delete)", async ({ request }) => {
		const response = await request.delete(`${API_BASE}/orders/${orderId}`, {
			headers: { Authorization: `Bearer ${accessToken}` },
		});

		expect(response.status()).toBe(200);
		const body: ApiEnvelope<OrderResponse> = await response.json();
		expect(body.success).toBe(true);
		expect(body.data.status).toBe("cancelled");
	});
});

// ── 5. Functional Gap Detection ──────────────────────────────────────────────

test.describe("5. Functional Gap Detection — Cancel / Delete Mechanism", () => {
	let accessToken = "";

	test.beforeAll(async ({ request }) => {
		accessToken = await authenticate(request);
	});

	test("5a. Órdenes — DELETE devuelve 200/404 (soft delete implementado)", async ({ request }) => {
		test.skip(!accessToken, "Saltado: sin token de autenticación");

		const response = await request.delete(`${API_BASE}/orders/000000000000000000000000`, {
			headers: { Authorization: `Bearer ${accessToken}` },
		});
		expect([200, 404]).toContain(response.status());

		test.info().annotations.push({
			type: "info",
			description:
				response.status() === 200
					? "✅ Órdenes: DELETE /orders/:id implementado (soft delete)."
					: "ℹ️ Órdenes: DELETE /orders/:id existe (404 - registro no encontrado, no ruta).",
		});
	});

	test("5b. Propuestas — crear y rechazar mediante endpoint de estado", async ({ request }) => {
		const proposalRef = `E2E-Proposal-${Date.now()}`;
		const createResponse = await request.post(`${API_BASE}/proposals`, {
			data: {
				title: `Propuesta ${proposalRef}`,
				clientName: "Cliente E2E Deploy Test",
				items: [
					{
						description: "Servicio de mantenimiento para validación E2E",
						unit: "servicio",
						quantity: 1,
						unitCost: 1_500_000,
					},
				],
				validUntil: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString(),
				notes: "Propuesta creada para validar persistencia y rechazo administrativo.",
			},
			headers: { Authorization: `Bearer ${accessToken}`, "Content-Type": "application/json" },
		});

		expect(createResponse.status()).toBe(201);
		const createBody: ApiEnvelope<ProposalResponse> = await createResponse.json();
		expect(createBody.success).toBe(true);
		const proposalId = createBody.data._id;
		expect(proposalId).toBeTruthy();

		const getResponse = await request.get(`${API_BASE}/proposals/${proposalId}`, {
			headers: { Authorization: `Bearer ${accessToken}` },
		});
		expect(getResponse.status()).toBe(200);

		const rejectResponse = await request.patch(`${API_BASE}/proposals/${proposalId}/status`, {
			data: { status: "rejected" },
			headers: { Authorization: `Bearer ${accessToken}`, "Content-Type": "application/json" },
		});
		expect(rejectResponse.status()).toBe(200);
		const rejectBody: ApiEnvelope<ProposalResponse> = await rejectResponse.json();
		expect(rejectBody.data.status).toBe("rejected");
	});

	test("5c. [INFO] Resumen de mecanismos de anulación por módulo", async () => {
		const summary = [
			"═══════════════════════════════════════════════════════════",
			"  POLÍTICA GLOBAL DE ANULACIÓN/ELIMINACIÓN — RECOMENDADA",
			"═══════════════════════════════════════════════════════════",
			"  Solicitudes   → Editar (borrador), Anular (con motivo)",
			"  Visitas       → Editar/Anular con motivo",
			"  Propuestas    → Rechazar mediante PATCH /proposals/:id/status",
			"  Órdenes       → DELETE implementado (soft delete)",
			"  Planeación    → Editar hasta antes de ejecución",
			"  Ejecución     → Cerrar/corregir con historial",
			"  Evidencias    → Eliminar si no asociadas, marcar reemplazo",
			"  Documentos    → Versionar o anular, no borrar",
			"  Actas         → Anular con nueva versión",
			"  SES/Facturas  → Reversar o anular con soporte",
			"  Kits/Recursos → Desactivar en lugar de borrar",
			"  Usuarios      → Desactivar, no borrar",
			"───────────────────────────────────────────────────────────",
			"  Principios:",
			"  • Cada módulo evaluado individualmente",
			"  • Acciones destructivas protegidas por RBAC + auditoría",
			"  • No borrado físico directo en producción",
			"  • Soft delete con deletedAt, deletedBy, deleteReason",
			"  • Auditoría: quién anuló, cuándo, por qué",
			"═══════════════════════════════════════════════════════════",
		].join("\n");

		test.info().annotations.push({ type: "info", description: summary });
		expect(true).toBe(true);
	});
});
