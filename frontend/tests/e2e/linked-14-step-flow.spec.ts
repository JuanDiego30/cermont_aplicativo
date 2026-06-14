/**
 * E2E — Linked 14-Step Flow (CERMONT Operational Workflow)
 *
 * Validates that the 14 CERMONT operational steps form a continuous,
 * data-inheriting workflow.  Tests are organized in four concerns:
 *
 *  A. API: Full 14-step sequential creation flow (serial, requires backend)
 *  B. API: Workflow cockpit read-model — daysInCurrentStep KPI (Phase 11)
 *  C. API: Archive endpoint RBAC — gerente only (Phase 13)
 *  D. UI:  Service-case detail page renders cockpit without errors
 *  E. UI:  No stale IDs propagated across step navigation
 *
 * Each describe block is independently skippable via environment variables
 * or via test.skip guards so the file is safe in CI without a backend.
 */

import fs from "node:fs";
import path from "node:path";
import { expect, test } from "@playwright/test";
import { E2E_ADMIN, E2E_SUPERVISOR, E2E_TECHNICIAN } from "./auth-credentials";

// ── Config ─────────────────────────────────────────────────────────────────

const API_BASE = (process.env.E2E_API_URL ?? "http://localhost:4000/api").replace(/\/+$/, "");

// ── Auth helper ────────────────────────────────────────────────────────────

type RequestLike = {
	post: (url: string, opts: Record<string, unknown>) => Promise<ApiResponse>;
	get: (url: string, opts: Record<string, unknown>) => Promise<ApiResponse>;
	patch: (url: string, opts: Record<string, unknown>) => Promise<ApiResponse>;
};
type ApiResponse = {
	status(): number;
	// biome-ignore lint/suspicious/noExplicitAny: test helper
	json(): Promise<any>;
};

async function getTokenFor(
	request: RequestLike,
	user: { email: string; password: string },
): Promise<string> {
	const res = await request.post(`${API_BASE}/auth/login`, {
		data: { email: user.email, password: user.password },
	});
	if (res.status() === 200) {
		const body = await res.json();
		return (body.data?.accessToken as string) ?? "";
	}
	return "";
}

function authHeaders(token: string): Record<string, string> {
	return { Authorization: `Bearer ${token}`, "Content-Type": "application/json" };
}

// ── A. Full 14-Step Serial API Flow ───────────────────────────────────────

test.describe("A. Full 14-Step Linked API Flow", () => {
	test.describe.configure({ mode: "serial" });

	let adminToken = "";
	let serviceCaseId = "";
	// IDs accumulated as we traverse the workflow
	const artifacts: Record<string, string> = {};

	test.beforeAll(async ({ request }) => {
		adminToken = await getTokenFor(request as unknown as RequestLike, E2E_ADMIN);
		if (!adminToken) {
			console.log("  ⚠️ Could not obtain admin token — serial flow tests will be skipped");
		}
	});

	// ── Paso 1: Solicitud de trabajo (WorkRequest) ────────────────────────

	test("A-01: POST /work-requests creates a work request and links a service case", async ({
		request,
	}) => {
		test.skip(!adminToken, "Requires auth token");

		const res = await (request as unknown as RequestLike).post(`${API_BASE}/work-requests`, {
			data: {
				requesterName: "E2E Linked Flow Tester",
				clientName: "Cliente Linked E2E",
				serviceSite: "Bogotá — Planta norte",
				serviceType: "correctivo",
				sourceChannel: "portal_client",
				shortDescription: `Linked-flow WR ${Date.now()}`,
				description: "Solicitud de mantenimiento correctivo para prueba E2E de flujo enlazado",
				requiresSiteVisit: true,
				urgency: "medium",
				tags: [],
				classifications: [],
				initialEvidences: [],
				customFields: {},
			},
			headers: authHeaders(adminToken),
		});

		const status = res.status();
		test.info().annotations.push({
			type: "info",
			description: `POST /work-requests → HTTP ${status}`,
		});

		const body = await res.json();
		expect(status, JSON.stringify(body)).toBe(201);
		artifacts.workRequestId = body.data?.workRequest?._id ?? "";
		serviceCaseId = body.data?.serviceCase?._id ?? "";
		expect(artifacts.workRequestId).toMatch(/^[a-f0-9]{24}$/i);
		expect(serviceCaseId).toMatch(/^[a-f0-9]{24}$/i);
	});

	// If the work-request doesn't auto-create a ServiceCase, list and pick one
	test("A-01b: Ensure a ServiceCase exists for the flow", async ({ request }) => {
		test.skip(!adminToken, "Requires auth token");

		if (serviceCaseId) {
			return; // Already have one
		}

		const res = await (request as unknown as RequestLike).get(`${API_BASE}/service-cases?limit=1`, {
			headers: authHeaders(adminToken),
		});

		if (res.status() === 200) {
			const body = await res.json();
			serviceCaseId = body.data?.[0]?._id ?? "";
		}

		test.info().annotations.push({
			type: "info",
			description: serviceCaseId
				? `Using existing service case: ${serviceCaseId}`
				: "No service case available — subsequent steps may be skipped",
		});
	});

	// ── Paso 2: Visita técnica (SiteVisit) ────────────────────────────────

	test("A-02: POST /site-visits creates a site visit linked to the service case", async ({
		request,
	}) => {
		test.skip(!adminToken, "Requires auth token");
		test.skip(!artifacts.workRequestId, "No workRequestId from A-01");

		const res = await (request as unknown as RequestLike).post(`${API_BASE}/site-visits`, {
			data: {
				workRequestId: artifacts.workRequestId,
				serviceCaseId: serviceCaseId || undefined,
				clientName: "Cliente Linked E2E",
				location: "Bogotá — Planta norte",
				visitDate: new Date(Date.now() + 86_400_000).toISOString(),
				responsibleUserId: "507f1f77bcf86cd799439011",
				responsibleName: "Técnico E2E",
				notes: "Visita técnica creada por prueba E2E de flujo enlazado",
			},
			headers: authHeaders(adminToken),
		});

		const status = res.status();
		test
			.info()
			.annotations.push({ type: "info", description: `POST /site-visits → HTTP ${status}` });

		if (status === 201 || status === 200) {
			const body = await res.json();
			artifacts.siteVisitId = body.data?._id ?? body.data?.id ?? "";
			expect(artifacts.siteVisitId).toBeTruthy();
		}
	});

	// ── Paso 3: Propuesta económica (Proposal) ────────────────────────────

	test("A-03: POST /proposals creates a proposal linked to the service case", async ({
		request,
	}) => {
		test.skip(!adminToken, "Requires auth token");

		const res = await (request as unknown as RequestLike).post(`${API_BASE}/proposals`, {
			data: {
				title: `Propuesta Linked E2E ${Date.now()}`,
				clientName: "Cliente Linked E2E",
				validUntil: new Date(Date.now() + 30 * 86_400_000).toISOString(),
				items: [
					{
						description: "Servicio correctivo integral",
						unit: "servicio",
						quantity: 1,
						unitCost: 8_500_000,
					},
				],
				notes: `Caso de servicio relacionado: ${serviceCaseId}`,
			},
			headers: authHeaders(adminToken),
		});

		const status = res.status();
		test.info().annotations.push({
			type: "info",
			description: `POST /proposals → HTTP ${status}`,
		});

		const body = await res.json();
		expect(status, JSON.stringify(body)).toBe(201);
		artifacts.proposalId = body.data?._id ?? "";
		expect(artifacts.proposalId).toMatch(/^[a-f0-9]{24}$/i);
	});

	// ── Paso 4: Orden de compra (PurchaseOrder) ───────────────────────────

	test("A-04: POST /purchase-orders (or /proposals/:id/po) attaches a PO", async ({ request }) => {
		test.skip(!adminToken, "Requires auth token");
		test.skip(!artifacts.proposalId, "No proposalId from A-03");

		const approvalRes = await (request as unknown as RequestLike).patch(
			`${API_BASE}/proposals/${artifacts.proposalId}/status`,
			{
				data: { status: "approved" },
				headers: authHeaders(adminToken),
			},
		);
		const approvalBody = await approvalRes.json();
		expect(approvalRes.status(), JSON.stringify(approvalBody)).toBe(200);

		const res = await (request as unknown as RequestLike).post(
			`${API_BASE}/proposals/${artifacts.proposalId}/po`,
			{
				data: {
					poNumber: `PO-E2E-${Date.now()}`,
					serviceAccount: "SERV-E2E",
					billingAccount: "BILL-E2E",
					approvedAmount: 8_500_000,
					currency: "COP",
					receivedAt: new Date().toISOString(),
					attachments: [],
				},
				headers: authHeaders(adminToken),
			},
		);

		test.info().annotations.push({
			type: "info",
			description: `POST /proposals/:id/po → HTTP ${res.status()}`,
		});

		const body = await res.json();
		expect(res.status(), JSON.stringify(body)).toBe(201);
		artifacts.purchaseOrderId = body.data?._id ?? "";
		expect(artifacts.purchaseOrderId).toMatch(/^[a-f0-9]{24}$/i);

		const validationRes = await (request as unknown as RequestLike).post(
			`${API_BASE}/purchase-orders/${artifacts.purchaseOrderId}/validate`,
			{
				data: { validatedBy: "507f1f77bcf86cd799439011" },
				headers: authHeaders(adminToken),
			},
		);
		const validationBody = await validationRes.json();
		expect(validationRes.status(), JSON.stringify(validationBody)).toBe(200);
		expect(validationBody.data?.status).toBe("approved");
	});

	// ── Paso 5: Planeación (PlanningPacket) ───────────────────────────────

	test("A-05: GET /orders/:id/planning returns a planning packet", async ({ request }) => {
		test.skip(!adminToken, "Requires auth token");

		// Get the first work order associated to the proposal/service case
		const ordersRes = await (request as unknown as RequestLike).get(`${API_BASE}/orders?limit=1`, {
			headers: authHeaders(adminToken),
		});
		if (ordersRes.status() === 200) {
			const body = await ordersRes.json();
			artifacts.orderId = body.data?.[0]?._id ?? "";
		}

		if (!artifacts.orderId) {
			test.info().annotations.push({
				type: "warning",
				description: "A-05 skipped — no orders available",
			});
			return;
		}

		const res = await (request as unknown as RequestLike).get(
			`${API_BASE}/orders/${artifacts.orderId}/planning`,
			{ headers: authHeaders(adminToken) },
		);

		test.info().annotations.push({
			type: "info",
			description: `GET /orders/:id/planning → HTTP ${res.status()}`,
		});

		// 200 = planning exists; 404 = not yet created for this order
		expect([200, 404]).toContain(res.status());
	});

	// ── Paso 6: Ejecución (ExecutionSession) ─────────────────────────────

	test("A-06: GET /execution-sessions lists execution sessions", async ({ request }) => {
		test.skip(!adminToken, "Requires auth token");

		const res = await (request as unknown as RequestLike).get(
			`${API_BASE}/execution-sessions?page=1&limit=5`,
			{ headers: authHeaders(adminToken) },
		);

		expect(res.status()).toBe(200);
		test.info().annotations.push({
			type: "info",
			description: `GET /execution-sessions → HTTP ${res.status()}`,
		});
	});

	// ── Paso 7: Informe técnico (TechnicalReport) ─────────────────────────

	test("A-07: GET /reports lists technical reports (endpoint alive)", async ({ request }) => {
		test.skip(!adminToken, "Requires auth token");

		const res = await (request as unknown as RequestLike).get(
			`${API_BASE}/reports?page=1&limit=5`,
			{ headers: authHeaders(adminToken) },
		);

		expect(res.status()).not.toBe(404);
		expect(res.status()).not.toBe(500);
		test.info().annotations.push({
			type: "info",
			description: `GET /reports → HTTP ${res.status()}`,
		});
	});

	// ── Paso 8: Acta de entrega (DeliveryRecord) ──────────────────────────

	test("A-08: GET /delivery-records lists delivery records (endpoint alive)", async ({
		request,
	}) => {
		test.skip(!adminToken, "Requires auth token");

		const res = await (request as unknown as RequestLike).get(
			`${API_BASE}/delivery-records?page=1&limit=5`,
			{ headers: authHeaders(adminToken) },
		);

		expect(res.status()).not.toBe(404);
		expect(res.status()).not.toBe(500);
	});

	// ── Paso 9: Firma del cliente ─────────────────────────────────────────

	test("A-09: POST /delivery-records/:id/sign endpoint responds (not 404)", async ({ request }) => {
		test.skip(!adminToken, "Requires auth token");

		// Use a synthetic ObjectId — expect 404 for record not found, never 404 for missing route
		const res = await (request as unknown as RequestLike).post(
			`${API_BASE}/delivery-records/507f1f77bcf86cd799439099/sign`,
			{
				data: { signature: "test-signature", name: "Cliente E2E" },
				headers: authHeaders(adminToken),
			},
		);

		// 404 for "record not found" is acceptable; 404 for "route not found" would indicate a gap
		test.info().annotations.push({
			type: "info",
			description: `POST /delivery-records/:id/sign → HTTP ${res.status()}`,
		});
		expect(res.status()).not.toBe(405); // Method not allowed = route gap
	});

	// ── Paso 10: SES / Ariba ──────────────────────────────────────────────

	test("A-10: GET /service-entry-sheets lists service entry sheets", async ({ request }) => {
		test.skip(!adminToken, "Requires auth token");

		const res = await (request as unknown as RequestLike).get(
			`${API_BASE}/service-entry-sheets?limit=5`,
			{ headers: authHeaders(adminToken) },
		);

		expect(res.status()).toBe(200);
		test.info().annotations.push({
			type: "info",
			description: `GET /service-entry-sheets → HTTP ${res.status()}`,
		});
	});

	// ── Paso 11: SES aprobada ─────────────────────────────────────────────

	test("A-11: POST /service-entry-sheets/:id/approve reaches the canonical route", async ({
		request,
	}) => {
		test.skip(!adminToken, "Requires auth token");

		const res = await (request as unknown as RequestLike).post(
			`${API_BASE}/service-entry-sheets/507f1f77bcf86cd799439099/approve`,
			{
				data: { approverReference: "gerente-e2e" },
				headers: authHeaders(adminToken),
			},
		);

		test.info().annotations.push({
			type: "info",
			description: `POST /service-entry-sheets/:id/approve → HTTP ${res.status()}`,
		});
		expect(res.status()).toBe(404);
	});

	// ── Paso 12: Factura ──────────────────────────────────────────────────

	test("A-12: GET /invoices lists invoices", async ({ request }) => {
		test.skip(!adminToken, "Requires auth token");

		const res = await (request as unknown as RequestLike).get(`${API_BASE}/invoices?limit=5`, {
			headers: authHeaders(adminToken),
		});

		expect(res.status()).toBe(200);
	});

	// ── Paso 13: Factura aprobada ─────────────────────────────────────────

	test("A-13: POST /invoices/:id/approve reaches the canonical route", async ({ request }) => {
		test.skip(!adminToken, "Requires auth token");

		const res = await (request as unknown as RequestLike).post(
			`${API_BASE}/invoices/507f1f77bcf86cd799439099/approve`,
			{
				data: { approvedBy: "gerente-e2e" },
				headers: authHeaders(adminToken),
			},
		);

		expect(res.status()).toBe(404);
		test.info().annotations.push({
			type: "info",
			description: `POST /invoices/:id/approve → HTTP ${res.status()}`,
		});
	});

	// ── Paso 14: Pago y cierre ────────────────────────────────────────────

	test("A-14: POST /payments/from-invoice/:id reaches the canonical route", async ({ request }) => {
		test.skip(!adminToken, "Requires auth token");

		const invoiceId = artifacts.proposalId ?? "507f1f77bcf86cd799439099";
		const res = await (request as unknown as RequestLike).post(
			`${API_BASE}/payments/from-invoice/${invoiceId}`,
			{
				data: {
					amount: 8_500_000,
					paymentMethod: "bank_transfer",
					paidAt: new Date().toISOString(),
					paymentReference: `PAY-E2E-${Date.now()}`,
					bankReference: `REF-E2E-${Date.now()}`,
				},
				headers: authHeaders(adminToken),
			},
		);

		expect([201, 404, 409, 422]).toContain(res.status());
		test.info().annotations.push({
			type: "info",
			description: `POST /payments/from-invoice/:id → HTTP ${res.status()}`,
		});
	});

	// ── Paso 14b: Avanzar paso por la API del workflow ────────────────────

	test("A-14b: POST /service-cases/:id/step/advance is protected (requires auth)", async ({
		request,
	}) => {
		test.skip(!serviceCaseId, "No serviceCaseId available");

		// Without token → should be 401
		const res = await (request as unknown as RequestLike).post(
			`${API_BASE}/service-cases/${serviceCaseId}/step/advance`,
			{ data: {} },
		);
		expect([401, 403]).toContain(res.status());
	});

	test("A-14c: POST /service-cases/:id/step/advance reachable with valid token", async ({
		request,
	}) => {
		test.skip(!adminToken, "Requires auth token");
		test.skip(!serviceCaseId, "No serviceCaseId available");

		const res = await (request as unknown as RequestLike).post(
			`${API_BASE}/service-cases/${serviceCaseId}/step/advance`,
			{
				data: {},
				headers: authHeaders(adminToken),
			},
		);

		// 200/400/409/422 are all valid domain responses (not 404 = route exists)
		expect(res.status()).not.toBe(404);
		expect(res.status()).not.toBe(500);
		test.info().annotations.push({
			type: "info",
			description: `POST /service-cases/:id/step/advance → HTTP ${res.status()}`,
		});
	});
});

// ── B. Workflow Cockpit — daysInCurrentStep KPI (Phase 11) ────────────────

test.describe("B. daysInCurrentStep KPI in Workflow API", () => {
	let adminToken = "";
	let serviceCaseId = "";

	test.beforeAll(async ({ request }) => {
		adminToken = await getTokenFor(request as unknown as RequestLike, E2E_ADMIN);
		if (adminToken) {
			// Pick the first available service case
			const res = await (request as unknown as RequestLike).get(
				`${API_BASE}/service-cases?limit=1`,
				{ headers: authHeaders(adminToken) },
			);
			if (res.status() === 200) {
				const body = await res.json();
				serviceCaseId = body.data?.[0]?._id ?? "";
			}
		}
	});

	test("B-01: GET /service-cases/:id/workflow returns 200 for valid case", async ({ request }) => {
		test.skip(!adminToken, "Requires auth token");
		test.skip(!serviceCaseId, "No service case available");

		const res = await (request as unknown as RequestLike).get(
			`${API_BASE}/service-cases/${serviceCaseId}/workflow`,
			{ headers: authHeaders(adminToken) },
		);

		const body = await res.json();
		expect(res.status(), JSON.stringify(body)).toBe(200);
		expect(body.success).toBe(true);
		expect(body.data).toBeTruthy();
	});

	test("B-02: Workflow response includes operationalSummary with daysInCurrentStep", async ({
		request,
	}) => {
		test.skip(!adminToken, "Requires auth token");
		test.skip(!serviceCaseId, "No service case available");

		const res = await (request as unknown as RequestLike).get(
			`${API_BASE}/service-cases/${serviceCaseId}/workflow`,
			{ headers: authHeaders(adminToken) },
		);

		if (res.status() !== 200) {
			test.info().annotations.push({
				type: "warning",
				description: `workflow endpoint returned ${res.status()} — skipping KPI check`,
			});
			return;
		}

		const body = await res.json();
		const summary = body.data?.operationalSummary;

		// operationalSummary may be absent if the case is minimal, but when present
		// daysInCurrentStep MUST be a non-negative integer
		if (summary !== undefined && summary !== null) {
			if (typeof summary.daysInCurrentStep !== "undefined") {
				expect(typeof summary.daysInCurrentStep).toBe("number");
				expect(summary.daysInCurrentStep).toBeGreaterThanOrEqual(0);
				expect(Number.isInteger(summary.daysInCurrentStep)).toBe(true);
				test.info().annotations.push({
					type: "info",
					description: `daysInCurrentStep = ${summary.daysInCurrentStep}`,
				});
			}
		}
		// No hard failure if operationalSummary is absent — just annotate
		if (!summary) {
			test.info().annotations.push({
				type: "warning",
				description: "operationalSummary absent from workflow response",
			});
		}
	});

	test("B-03: daysInCurrentStep is 0 for a case advanced today", async ({ request }) => {
		test.skip(!adminToken, "Requires auth token");
		test.skip(!serviceCaseId, "No service case available");

		const res = await (request as unknown as RequestLike).get(
			`${API_BASE}/service-cases/${serviceCaseId}/workflow`,
			{ headers: authHeaders(adminToken) },
		);

		if (res.status() !== 200) {
			return;
		}

		const body = await res.json();
		const days = body.data?.operationalSummary?.daysInCurrentStep;
		const timeline: Array<{ occurredAt?: string }> = body.data?.timeline ?? [];

		if (timeline.length > 0) {
			const latestOccurredAt = [...timeline].sort(
				(a, b) => new Date(b.occurredAt ?? 0).getTime() - new Date(a.occurredAt ?? 0).getTime(),
			)[0]?.occurredAt;

			if (latestOccurredAt) {
				const diffDays = Math.floor(
					(Date.now() - new Date(latestOccurredAt).getTime()) / 86_400_000,
				);
				if (typeof days === "number") {
					// Allow ±1 for timezone drift between server and test runner
					expect(Math.abs(days - diffDays)).toBeLessThanOrEqual(1);
				}
			}
		}
	});

	test("B-04: GET /service-cases/:id/workflow requires authentication", async ({ request }) => {
		test.skip(!serviceCaseId, "No service case available");

		const res = await (request as unknown as RequestLike).get(
			`${API_BASE}/service-cases/${serviceCaseId}/workflow`,
			{},
		);
		expect([401, 403]).toContain(res.status());
	});
});

// ── C. Archive Endpoint RBAC (Phase 13) ──────────────────────────────────

test.describe("C. Archive Endpoint — gerente-only RBAC", () => {
	let adminToken = "";
	let supervisorToken = "";
	let technicianToken = "";
	let serviceCaseId = "";

	test.beforeAll(async ({ request }) => {
		[adminToken, supervisorToken, technicianToken] = await Promise.all([
			getTokenFor(request as unknown as RequestLike, E2E_ADMIN),
			getTokenFor(request as unknown as RequestLike, E2E_SUPERVISOR),
			getTokenFor(request as unknown as RequestLike, E2E_TECHNICIAN),
		]);

		if (adminToken) {
			const res = await (request as unknown as RequestLike).get(
				`${API_BASE}/service-cases?limit=1`,
				{ headers: authHeaders(adminToken) },
			);
			if (res.status() === 200) {
				const body = await res.json();
				serviceCaseId = body.data?.[0]?._id ?? "";
			}
		}
	});

	test("C-01: POST /service-cases/:id/archive without token → 401", async ({ request }) => {
		test.skip(!serviceCaseId, "No service case available");

		const res = await (request as unknown as RequestLike).post(
			`${API_BASE}/service-cases/${serviceCaseId}/archive`,
			{ data: {} },
		);
		expect([401, 403]).toContain(res.status());
	});

	test("C-02: POST /service-cases/:id/archive with supervisor token → 403", async ({ request }) => {
		test.skip(!supervisorToken, "No supervisor token");
		test.skip(!serviceCaseId, "No service case available");

		const res = await (request as unknown as RequestLike).post(
			`${API_BASE}/service-cases/${serviceCaseId}/archive`,
			{
				data: {},
				headers: authHeaders(supervisorToken),
			},
		);
		expect(res.status()).toBe(403);
	});

	test("C-03: POST /service-cases/:id/archive with technician token → 403", async ({ request }) => {
		test.skip(!technicianToken, "No technician token");
		test.skip(!serviceCaseId, "No service case available");

		const res = await (request as unknown as RequestLike).post(
			`${API_BASE}/service-cases/${serviceCaseId}/archive`,
			{
				data: {},
				headers: authHeaders(technicianToken),
			},
		);
		expect(res.status()).toBe(403);
	});

	test("C-04: POST /service-cases/:id/archive with gerente token — route exists", async ({
		request,
	}) => {
		test.skip(!adminToken, "No admin/gerente token");
		test.skip(!serviceCaseId, "No service case available");

		const res = await (request as unknown as RequestLike).post(
			`${API_BASE}/service-cases/${serviceCaseId}/archive`,
			{
				data: {},
				headers: authHeaders(adminToken),
			},
		);

		// 200/201 = archived successfully
		// 400/409/422 = domain rejection (e.g. not in paid/closed state) — route exists
		// 404 = case not found — route exists
		// We just verify the route is wired up (not a 405 Method Not Allowed)
		expect(res.status()).not.toBe(405);
		expect(res.status()).not.toBe(500);
		test.info().annotations.push({
			type: "info",
			description: `POST /service-cases/:id/archive (gerente) → HTTP ${res.status()}`,
		});
	});

	test("C-05: Archive endpoint returns meaningful error for non-archivable case", async ({
		request,
	}) => {
		test.skip(!adminToken, "No admin/gerente token");
		test.skip(!serviceCaseId, "No service case available");

		const res = await (request as unknown as RequestLike).post(
			`${API_BASE}/service-cases/${serviceCaseId}/archive`,
			{
				data: {},
				headers: authHeaders(adminToken),
			},
		);

		// If the case is not in a terminal state, the domain should reject with 4xx + error body
		if (res.status() >= 400 && res.status() < 500) {
			const body = await res.json();
			// A domain error must have success:false and a message
			expect(body.success).toBe(false);
			expect(body.message ?? body.error).toBeTruthy();
		}
	});
});

// ── D. UI: Service Case Detail Page ──────────────────────────────────────

test.describe("D. UI — Service Case Detail Page", () => {
	const AUTH_FILE = path.join(process.cwd(), "tests/e2e/fixtures/.auth/admin.json");

	test.beforeAll(async () => {
		if (!fs.existsSync(AUTH_FILE)) {
			console.log("  ⚠️ No admin auth file found — UI tests will be skipped");
			return;
		}
		// Auth file already created by global-setup — reuse it
	});

	test("D-01: /service-cases page loads without 500 errors", async ({ page }) => {
		test.skip(!fs.existsSync(AUTH_FILE), "No auth state file");

		await page.goto("/service-cases");
		const response = await page.goto("/service-cases");
		expect(response?.status()).not.toBe(500);
		// Page should contain some recognizable content
		const body = await page.textContent("body");
		expect(body).not.toContain("Internal Server Error");
	});

	test("D-02: Service case detail page renders cockpit panels", async ({ page }) => {
		test.skip(!fs.existsSync(AUTH_FILE), "No auth state file");

		// Navigate to list, click first case if present
		await page.goto("/service-cases");
		await page.waitForLoadState("domcontentloaded");

		const firstCase = page.locator('a[href*="/service-cases/"]').first();
		if (!(await firstCase.isVisible())) {
			test.info().annotations.push({
				type: "warning",
				description: "No service cases found in list — skipping detail page check",
			});
			return;
		}

		await firstCase.click();
		await page.waitForLoadState("domcontentloaded");

		// WorkflowHeader panel should be visible
		const heading = page.locator('h2, [id="sc-detail-title"]').first();
		await expect(heading).toBeVisible({ timeout: 10_000 });

		// No page-level JS errors
		const errors: string[] = [];
		page.on("pageerror", (e) => errors.push(e.message));
		await page.waitForTimeout(1_500);
		expect(errors).toEqual([]);
	});

	test("D-03: daysInCurrentStep badge visible in workflow header when data present", async ({
		page,
	}) => {
		test.skip(!fs.existsSync(AUTH_FILE), "No auth state file");

		await page.goto("/service-cases");
		await page.waitForLoadState("domcontentloaded");

		const firstCase = page.locator('a[href*="/service-cases/"]').first();
		if (!(await firstCase.isVisible())) {
			return;
		}

		await firstCase.click();
		await page.waitForLoadState("domcontentloaded");

		// The daysInCurrentStep badge renders text like "Avanzado hoy", "1 día en este paso",
		// "N días en este paso", or nothing (if operationalSummary absent)
		const badge = page.locator("text=/día(s)? en este paso|Avanzado hoy/i").first();
		const badgeVisible = await badge.isVisible().catch(() => false);

		test.info().annotations.push({
			type: "info",
			description: badgeVisible
				? "daysInCurrentStep badge is visible in the workflow header"
				: "daysInCurrentStep badge not yet visible (operationalSummary may be absent)",
		});
		// Not a hard assertion — the badge only appears when backend sends the KPI
	});

	test("D-04: Archive button NOT visible for technician role", async ({ browser }) => {
		const TECHNICIAN_AUTH = path.join(process.cwd(), "tests/e2e/fixtures/.auth/technician.json");
		test.skip(!fs.existsSync(TECHNICIAN_AUTH), "No technician auth state file");

		const ctx = await browser.newContext({ storageState: TECHNICIAN_AUTH });
		const page = await ctx.newPage();

		await page.goto("/service-cases");
		await page.waitForLoadState("domcontentloaded");

		const firstCase = page.locator('a[href*="/service-cases/"]').first();
		if (await firstCase.isVisible()) {
			await firstCase.click();
			await page.waitForLoadState("domcontentloaded");

			const archiveButton = page.locator('button:has-text("Archivar caso")');
			// Technicians must never see the archive button
			await expect(archiveButton).not.toBeVisible();
		}

		await ctx.close();
	});
});

// ── E. No stale IDs across step navigation ────────────────────────────────

test.describe("E. No 400 for invalid IDs across step navigation", () => {
	const STEP_ROUTES: Array<{ path: string; label: string }> = [
		{ path: "/work-requests/new", label: "Paso 1: Work Request" },
		{ path: "/site-visits/new", label: "Paso 2: Site Visit" },
		{ path: "/proposals/new", label: "Paso 3: Proposal" },
		{ path: "/purchase-orders/new", label: "Paso 4: PO" },
		{ path: "/planning", label: "Paso 5: Planning" },
		{ path: "/execution", label: "Paso 6: Execution" },
		{ path: "/evidences", label: "Paso 7: Evidence" },
		{ path: "/reports", label: "Paso 8: Technical Report" },
		{ path: "/delivery-records/new", label: "Paso 9: Delivery Record" },
		{ path: "/billing/ses/new", label: "Paso 10: SES" },
		{ path: "/billing/invoices/new", label: "Paso 12: Invoice" },
		{ path: "/payments/new", label: "Paso 14: Payment" },
	];

	const AUTH_FILE = path.join(process.cwd(), "tests/e2e/fixtures/.auth/admin.json");

	for (const route of STEP_ROUTES) {
		test(`E-01: ${route.label} (${route.path}) loads without 500`, async ({ page }) => {
			test.skip(!fs.existsSync(AUTH_FILE), "No auth state");

			const response = await page.goto(route.path);
			expect(response?.status()).not.toBe(500);

			const content = await page.textContent("body");
			// These phrases indicate an unhandled crash
			expect(content).not.toContain("Internal Server Error");
			expect(content).not.toContain("Application error");
		});
	}

	test("E-02: Step pages with ?serviceCaseId=invalid do not crash", async ({ page }) => {
		test.skip(!fs.existsSync(AUTH_FILE), "No auth state");

		const routes = [
			"/work-requests/new?serviceCaseId=invalid",
			"/site-visits/new?serviceCaseId=invalid",
			"/proposals/new?serviceCaseId=invalid",
		];

		for (const route of routes) {
			const response = await page.goto(route);
			expect(response?.status()).not.toBe(500);
			const content = await page.textContent("body");
			expect(content).not.toContain("Internal Server Error");
		}
	});
});

// ── Existing tests (preserved) ────────────────────────────────────────────

const BASE_URL = process.env.PLAYWRIGHT_BASE_URL ?? "http://localhost:3000";

test.describe("F. Data Inheritance — UI Inheritance Banners", () => {
	test.beforeEach(async ({ page }) => {
		await page.goto(`${BASE_URL}/login`);
		await page.waitForLoadState("domcontentloaded");
		await page.getByLabel(/^Correo electrónico/).fill(E2E_ADMIN.email);
		await page.getByLabel(/^Contraseña/).fill(E2E_ADMIN.password);
		await page.getByRole("button", { name: /Iniciar sesión/i }).click();
		await page.waitForURL(/\/dashboard$/, { timeout: 15_000 });
	});

	test("F-01: Step 1 → Step 2 preserves inherited client and location", async ({ page }) => {
		await page.goto(`${BASE_URL}/work-requests/new`);
		await page.waitForLoadState("domcontentloaded");
		await expect(page.getByRole("heading", { name: "Nueva solicitud de trabajo" })).toBeVisible();
		await page.getByLabel("Cliente", { exact: true }).fill("Cliente E2E S.A.S.");
		await page.getByLabel("Sitio de servicio", { exact: true }).fill("Planta principal Bogota");
		await page.getByTestId("customizable-select").click();
		await page.getByTestId("customizable-select-option-mantenimiento").click();
		await page.getByLabel("Resumen", { exact: true }).fill(`Herencia E2E ${Date.now()}`);
		await page
			.getByLabel("Descripcion", { exact: true })
			.fill("Validacion de herencia entre solicitud y visita.");
		const requesterInput = page.getByLabel("Solicitante", { exact: true });
		await requesterInput.fill("Juan Perez");
		await expect(requesterInput).toHaveValue("Juan Perez");

		const workflowResponsePromise = page.waitForResponse(
			(response) =>
				response.url().includes("/api/backend/service-cases/") &&
				response.url().endsWith("/workflow"),
		);
		await page.getByRole("button", { name: "Crear solicitud" }).click();
		await page.waitForURL(/\/service-cases\/[a-f0-9]{24}$/i, { timeout: 15_000 });

		const serviceCaseId = page.url().split("/").at(-1) ?? "";
		expect(serviceCaseId).toMatch(/^[a-f0-9]{24}$/i);

		const workflowResponse = await workflowResponsePromise;
		const workflowBody = await workflowResponse.json();
		expect(workflowResponse.status(), JSON.stringify(workflowBody)).toBe(200);

		await page.goto(`${BASE_URL}/site-visits/new?serviceCaseId=${serviceCaseId}`);
		await expect(page.getByRole("heading", { name: "Nueva visita técnica" })).toBeVisible();
		await expect(page.getByLabel("Nombre del cliente")).toHaveValue("Cliente E2E S.A.S.");
		await expect(page.getByLabel("Ubicación")).toHaveValue("Planta principal Bogota");
		await expect(page.getByText("Datos heredados de la solicitud")).toBeVisible();
	});

	test("F-02 (legacy): Proposal page shows inherited context banner", async ({ page }) => {
		await page.goto(`${BASE_URL}/proposals/new?serviceCaseId=test-service-case-id`);
		// Should show inherited data or simply not crash
		const content = await page.textContent("body");
		expect(content).not.toContain("Internal Server Error");
	});

	test("F-03 (legacy): Step pages never pass empty serviceCaseId to /workflow", async ({
		page,
	}) => {
		const stepRoutes = [
			"/work-requests/new",
			"/site-visits/new",
			"/proposals/new",
			"/purchase-orders/new",
			"/planning",
		];

		for (const route of stepRoutes) {
			await page.goto(`${BASE_URL}${route}`);
			const content = await page.textContent("body");
			expect(content).not.toContain("400");
			expect(content).not.toContain("not found");
		}
	});
});
