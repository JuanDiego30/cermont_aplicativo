/**
 * Comprehensive API E2E Test Suite
 *
 * Tests critical backend API endpoints through the full stack:
 * Browser → Next.js proxy (/api/backend/*) → Express 5 backend → MongoDB
 *
 * Covers: auth, users, RBAC, error handling, and module CRUD smoke tests
 * Uses Playwright request API for direct HTTP tests (no UI browser needed)
 *
 * Run: npm run test:e2e -w frontend -- tests/e2e/comprehensive/api-e2e.spec.ts
 */

import { expect, request as playwrightRequest, test } from "@playwright/test";
import { E2E_ADMIN, E2E_SUPERVISOR, E2E_TECHNICIAN } from "../auth-credentials";

const BASE_URL = process.env.TEST_BASE_URL ?? "http://localhost:3000";

// ─── Helpers ──────────────────────────────────────────────────────────────────

type ApiEnvelope<T> = {
	success: boolean;
	data?: T;
	error?: { code: string; message: string; details?: Array<{ field: string; message: string }> };
	meta?: { total: number; page: number; limit: number; pages: number };
};

async function apiPost<T>(
	token: string,
	path: string,
	reqBody: object,
): Promise<{ status: number; body: ApiEnvelope<T> }> {
	const context = await playwrightRequest.newContext({ baseURL: BASE_URL });
	try {
		const resp = await context.post(`/api/backend${path}`, {
			data: reqBody,
			headers: { Authorization: `Bearer ${token}` },
		});
		const json = (await resp.json().catch(() => ({}))) as ApiEnvelope<T>;
		return { status: resp.status(), body: json };
	} finally {
		await context.dispose();
	}
}

async function apiGet<T>(
	token: string,
	path: string,
): Promise<{ status: number; body: ApiEnvelope<T> }> {
	const context = await playwrightRequest.newContext({ baseURL: BASE_URL });
	try {
		const resp = await context.get(`/api/backend${path}`, {
			headers: { Authorization: `Bearer ${token}` },
		});
		const json = (await resp.json().catch(() => ({}))) as ApiEnvelope<T>;
		return { status: resp.status(), body: json };
	} finally {
		await context.dispose();
	}
}

async function apiPut<T>(
	token: string,
	path: string,
	reqBody: object,
): Promise<{ status: number; body: ApiEnvelope<T> }> {
	const context = await playwrightRequest.newContext({ baseURL: BASE_URL });
	try {
		const resp = await context.put(`/api/backend${path}`, {
			data: reqBody,
			headers: { Authorization: `Bearer ${token}` },
		});
		const json = (await resp.json().catch(() => ({}))) as ApiEnvelope<T>;
		return { status: resp.status(), body: json };
	} finally {
		await context.dispose();
	}
}

async function apiPatch<T>(
	token: string,
	path: string,
	patchBody?: object,
): Promise<{ status: number; body: ApiEnvelope<T> }> {
	const context = await playwrightRequest.newContext({ baseURL: BASE_URL });
	try {
		const resp = await context.patch(`/api/backend${path}`, {
			data: patchBody,
			headers: { Authorization: `Bearer ${token}` },
		});
		const json = (await resp.json().catch(() => ({}))) as ApiEnvelope<T>;
		return { status: resp.status(), body: json };
	} finally {
		await context.dispose();
	}
}

/**
 * Login helper — returns access token and cookies via the frontend proxy
 */
async function loginAs(
	email: string,
	password: string,
): Promise<{ token: string; status: number; body: ApiEnvelope<{ accessToken: string }> }> {
	const context = await playwrightRequest.newContext({ baseURL: BASE_URL });
	try {
		const resp = await context.post("/api/backend/auth/login", {
			data: { email, password },
		});
		const json = (await resp.json().catch(() => ({}))) as ApiEnvelope<{
			accessToken: string;
		}>;
		return {
			token: json.data?.accessToken ?? "",
			status: resp.status(),
			body: json,
		};
	} finally {
		await context.dispose();
	}
}

// ─── Global token cache (login once per role to avoid rate limiting) ──────────

let gAdminToken = "";
let gSupervisorToken = "";
let gTechnicianToken = "";

test.beforeAll(async () => {
	// Login once per role and cache tokens
	const admin = await loginAs(E2E_ADMIN.email, E2E_ADMIN.password);
	gAdminToken = admin.token;
	expect(gAdminToken).toBeTruthy();

	const sup = await loginAs(E2E_SUPERVISOR.email, E2E_SUPERVISOR.password);
	gSupervisorToken = sup.token;
	expect(gSupervisorToken).toBeTruthy();

	const tech = await loginAs(E2E_TECHNICIAN.email, E2E_TECHNICIAN.password);
	gTechnicianToken = tech.token;
	expect(gTechnicianToken).toBeTruthy();
});

// ─── Tests ────────────────────────────────────────────────────────────────────

test.describe("API E2E — Health & Connectivity", () => {
	test("GET /api/health/live returns 200", async () => {
		const context = await playwrightRequest.newContext({ baseURL: BASE_URL });
		try {
			const resp = await context.get("/api/backend/health/live");
			expect(resp.status()).toBe(200);
			const body = (await resp.json()) as { status: string; check: string };
			expect(body.status).toBe("ok");
			expect(body.check).toBe("liveness");
		} finally {
			await context.dispose();
		}
	});

	test("GET /api/health/ready returns 200 or 503", async () => {
		const context = await playwrightRequest.newContext({ baseURL: BASE_URL });
		try {
			const resp = await context.get("/api/backend/health/ready");
			expect([200, 503]).toContain(resp.status());
		} finally {
			await context.dispose();
		}
	});
});

test.describe("API E2E — Auth", () => {
	test("POST /api/auth/login with valid admin credentials returns 200 + token", async () => {
		const { status, body, token } = await loginAs(E2E_ADMIN.email, E2E_ADMIN.password);
		expect(status).toBe(200);
		expect(body.success).toBe(true);
		expect(token).toBeTruthy();
		expect(typeof token).toBe("string");
	});

	test("POST /api/auth/login with invalid password returns 401", async () => {
		const { status } = await loginAs(E2E_ADMIN.email, "wrongpassword123!");
		expect(status).toBe(401);
	});

	test("POST /api/auth/login with unknown email returns 401", async () => {
		const { status } = await loginAs("nonexistent@cermont.test", "SomePass123!");
		expect(status).toBe(401);
	});

	test("POST /api/auth/login with empty fields returns 400", async () => {
		const context = await playwrightRequest.newContext({ baseURL: BASE_URL });
		try {
			const resp = await context.post("/api/backend/auth/login", {
				data: { email: "", password: "" },
			});
			expect(resp.status()).toBe(400);
		} finally {
			await context.dispose();
		}
	});

	test("GET protected route without auth returns 401", async () => {
		const context = await playwrightRequest.newContext({ baseURL: BASE_URL });
		try {
			const resp = await context.get("/api/backend/users");
			expect(resp.status()).toBe(401);
		} finally {
			await context.dispose();
		}
	});

	test("GET protected route with malformed auth header returns 401", async () => {
		const context = await playwrightRequest.newContext({ baseURL: BASE_URL });
		try {
			const resp = await context.get("/api/backend/users", {
				headers: { Authorization: "InvalidToken" },
			});
			expect(resp.status()).toBe(401);
		} finally {
			await context.dispose();
		}
	});

	test("POST /api/auth/login as supervisor also returns token", async () => {
		expect(gSupervisorToken).toBeTruthy();
	});

	test("POST /api/auth/login as technician also returns token", async () => {
		expect(gTechnicianToken).toBeTruthy();
	});
});

test.describe("API E2E — Users (CRUD + RBAC + 500 Error Fix Verification)", () => {
	let createdUserId: string;

	test("GET /api/users returns paginated user list", async () => {
		const { status, body } = await apiGet(gAdminToken, "/users");
		expect(status).toBe(200);
		expect(body.success).toBe(true);
		expect(Array.isArray(body.data)).toBe(true);
		expect(body.meta).toBeDefined();
		expect(typeof body.meta?.total).toBe("number");
		expect(typeof body.meta?.page).toBe("number");
	});

	test("GET /api/users?page=1&limit=5 returns paginated results", async () => {
		const { status, body } = await apiGet(gAdminToken, "/users?page=1&limit=5");
		expect(status).toBe(200);
		expect(body.success).toBe(true);
		expect(body.meta?.page).toBe(1);
		expect(body.meta?.limit).toBe(5);
	});

	test("GET /api/users?role=gerente filters by role", async () => {
		const { status, body } = await apiGet(gAdminToken, "/users?role=gerente");
		expect(status).toBe(200);
		expect(body.success).toBe(true);
		if (body.data && Array.isArray(body.data)) {
			for (const user of body.data as Array<{ role: string }>) {
				expect(user.role).toBe("gerente");
			}
		}
	});

	test("GET /api/users with invalid page param returns 400", async () => {
		const { status } = await apiGet(gAdminToken, "/users?page=-1");
		expect(status).toBe(400);
	});

	test("GET /api/users with invalid role filter returns 400", async () => {
		const { status } = await apiGet(gAdminToken, "/users?role=superadmin");
		expect(status).toBe(400);
	});

	test("GET /api/users/:id (valid ObjectId, non-existent) returns 404 (not 500)", async () => {
		// ════════════════════════════════════════════════════════════════════
		// CRITICAL: This validates the 500 error fix.
		// A valid 24-char hex ObjectId that doesn't exist in the database
		// MUST return 404, NOT 500. This protects against CastError crashes.
		// ════════════════════════════════════════════════════════════════════
		const nonExistentId = "aaaaaaaaaaaaaaaaaaaaaaa1"; // 24 hex chars, valid format
		const { status, body } = await apiGet(gAdminToken, `/users/${nonExistentId}`);
		expect(status).toBe(404);
		expect(body.success).toBe(false);
	});

	test("GET /api/users/:id with invalid ObjectId format returns 400", async () => {
		// 23-char hex — too short
		const { status: statusShort } = await apiGet(gAdminToken, "/users/aaaaaaaaaaaaaaaaaaaaaaa");
		expect(statusShort).toBe(400);

		// Invalid characters
		const { status: statusInvalid } = await apiGet(gAdminToken, "/users/zzzzzzzzzzzzzzzzzzzzzzzz");
		expect(statusInvalid).toBe(400);
	});

	test("POST /api/users creates a new user", async () => {
		const uniqueEmail = `e2e-test-${Date.now()}@cermont.test`;
		const { status, body } = await apiPost(gAdminToken, "/users", {
			name: "E2E Test User",
			email: uniqueEmail,
			password: "TestPass123!",
			role: "tecnico",
			phone: "+57 300 000 0000",
		});
		expect(status).toBe(201);
		expect(body.success).toBe(true);
		expect(body.data).toBeDefined();
		createdUserId = (body.data as { _id: string })?._id ?? "";
		expect(createdUserId).toBeTruthy();
	});

	test("POST /api/users with duplicate email returns 409", async () => {
		const uniqueEmail = `e2e-test-dup-${Date.now()}@cermont.test`;
		// Create first user
		await apiPost(gAdminToken, "/users", {
			name: "First User",
			email: uniqueEmail,
			password: "TestPass123!",
			role: "tecnico",
		});
		// Try creating duplicate
		const { status, body } = await apiPost(gAdminToken, "/users", {
			name: "Duplicate User",
			email: uniqueEmail,
			password: "TestPass456!",
			role: "supervisor",
		});
		expect(status).toBe(409);
		expect(body.success).toBe(false);
	});

	test("POST /api/users with invalid role returns 400", async () => {
		const { status } = await apiPost(gAdminToken, "/users", {
			name: "Invalid Role User",
			email: `invalid-role-${Date.now()}@cermont.test`,
			password: "TestPass123!",
			role: "admin", // invalid role — must be one of the 8 canonical roles
		});
		expect(status).toBe(400);
	});

	test("POST /api/users with weak password returns 400", async () => {
		const { status } = await apiPost(gAdminToken, "/users", {
			name: "Weak Password User",
			email: `weak-pw-${Date.now()}@cermont.test`,
			password: "short", // too short, no uppercase, no number
			role: "tecnico",
		});
		expect(status).toBe(400);
	});

	test("POST /api/users with invalid email returns 400", async () => {
		const { status } = await apiPost(gAdminToken, "/users", {
			name: "Bad Email User",
			email: "not-an-email",
			password: "TestPass123!",
			role: "tecnico",
		});
		expect(status).toBe(400);
	});

	test("PUT /api/users/:id updates the user", async () => {
		if (!createdUserId) {
			// Create a user first if previous test didn't run
			const r = await apiPost(gAdminToken, "/users", {
				name: "Update Test User",
				email: `update-test-${Date.now()}@cermont.test`,
				password: "TestPass123!",
				role: "tecnico",
			});
			createdUserId = (r.body.data as { _id: string })?._id ?? "";
		}
		const { status, body } = await apiPut(gAdminToken, `/users/${createdUserId}`, {
			name: "Updated Name",
			phone: "+57 300 999 9999",
		});
		expect(status).toBe(200);
		expect(body.success).toBe(true);
	});

	test("PUT /api/users/:id with invalid role returns 400", async () => {
		if (!createdUserId) {
			return;
		}
		const { status } = await apiPut(gAdminToken, `/users/${createdUserId}`, {
			role: "nonexistent_role",
		});
		expect(status).toBe(400);
	});

	test("PATCH /api/users/:id/deactivate deactivates the user", async () => {
		if (!createdUserId) {
			return;
		}
		const { status, body } = await apiPatch(gAdminToken, `/users/${createdUserId}/deactivate`);
		expect(status).toBe(200);
		expect(body.success).toBe(true);
	});

	test("GET /api/users/role/:role returns users by role", async () => {
		const { status, body } = await apiGet(gAdminToken, "/users/role/tecnico");
		expect(status).toBe(200);
		expect(body.success).toBe(true);
		expect(Array.isArray(body.data)).toBe(true);
	});

	test("GET /api/users/role with invalid role returns 400", async () => {
		const { status } = await apiGet(gAdminToken, "/users/role/invalid_role_xyz");
		expect(status).toBe(400);
	});
});

test.describe("API E2E — RBAC (Role-Based Access Control)", () => {
	test("Admin can access GET /api/users", async () => {
		const { status } = await apiGet(gAdminToken, "/users");
		expect(status).toBe(200);
	});

	test("Supervisor is FORBIDDEN from GET /api/users (requires MANAGEMENT_ROLES)", async () => {
		// MANAGEMENT_ROLES = ['gerente', 'residente'] — supervisor not included
		const { status } = await apiGet(gSupervisorToken, "/users");
		expect(status).toBe(403);
	});

	test("Technician is FORBIDDEN from GET /api/users", async () => {
		const { status } = await apiGet(gTechnicianToken, "/users");
		expect(status).toBe(403);
	});

	test("Admin can access GET /api/users/role/:role (SUPERVISORY_ROLES)", async () => {
		const { status } = await apiGet(gAdminToken, "/users/role/tecnico");
		expect(status).toBe(200);
	});

	test("Supervisor can access GET /api/users/role/:role (SUPERVISORY_ROLES)", async () => {
		const { status } = await apiGet(gSupervisorToken, "/users/role/tecnico");
		expect(status).toBe(200);
	});

	test("Technician is FORBIDDEN from GET /api/users/role/:role", async () => {
		const { status } = await apiGet(gTechnicianToken, "/users/role/tecnico");
		expect(status).toBe(403);
	});

	test("Admin can create a user", async () => {
		const { status } = await apiPost(gAdminToken, "/users", {
			name: "RBAC Admin Created",
			email: `rbac-admin-${Date.now()}@cermont.test`,
			password: "TestPass123!",
			role: "operador",
		});
		expect(status).toBe(201);
	});

	test("Supervisor is FORBIDDEN from creating a user", async () => {
		const { status } = await apiPost(gSupervisorToken, "/users", {
			name: "RBAC Supervisor Attempt",
			email: `rbac-sup-${Date.now()}@cermont.test`,
			password: "TestPass123!",
			role: "operador",
		});
		expect(status).toBe(403);
	});
});

test.describe("API E2E — Module Smoke Tests", () => {
	test("GET /api/orders returns order list (may be empty)", async () => {
		const { status, body } = await apiGet(gAdminToken, "/orders");
		// Either 200 with empty list or 200 with data
		expect(status).toBe(200);
		expect(body.success).toBe(true);
	});

	test("GET /api/orders with pagination params", async () => {
		const { status } = await apiGet(gAdminToken, "/orders?page=1&limit=10");
		expect(status).toBe(200);
	});

	test("GET /api/proposals returns proposal list", async () => {
		const { status } = await apiGet(gAdminToken, "/proposals");
		expect(status).toBe(200);
	});

	test("GET /api/work-requests returns work request list", async () => {
		const { status } = await apiGet(gAdminToken, "/work-requests");
		expect(status).toBe(200);
	});

	test("GET /api/evidences returns evidence list", async () => {
		const { status } = await apiGet(gAdminToken, "/evidences");
		expect(status).toBe(200);
	});

	test("GET /api/reports returns report list", async () => {
		const { status } = await apiGet(gAdminToken, "/reports");
		expect(status).toBe(200);
	});

	test("GET /api/service-cases returns service case list", async () => {
		const { status } = await apiGet(gAdminToken, "/service-cases");
		expect(status).toBe(200);
	});

	test("GET /api/resources returns resource list", async () => {
		const { status } = await apiGet(gAdminToken, "/resources");
		expect(status).toBe(200);
	});

	test("GET /api/fleet returns fleet list", async () => {
		const { status } = await apiGet(gAdminToken, "/fleet");
		expect(status).toBe(200);
	});

	test("GET /api/inventory returns inventory list", async () => {
		const { status } = await apiGet(gAdminToken, "/inventory");
		expect(status).toBe(200);
	});

	test("GET /api/site-visits returns site visit list", async () => {
		const { status } = await apiGet(gAdminToken, "/site-visits");
		expect(status).toBe(200);
	});

	test("GET /api/clients returns client list", async () => {
		const { status } = await apiGet(gAdminToken, "/clients");
		expect(status).toBe(200);
	});

	test("GET /api/dashboard/summary returns dashboard summary", async () => {
		const { status } = await apiGet(gAdminToken, "/dashboard/summary");
		expect(status).toBe(200);
	});

	test("GET /api/invoices returns invoice list", async () => {
		const { status } = await apiGet(gAdminToken, "/invoices");
		expect(status).toBe(200);
	});

	test("GET /api/payments returns payment list", async () => {
		const { status } = await apiGet(gAdminToken, "/payments");
		expect(status).toBe(200);
	});

	test("GET /api/service-entry-sheets returns SES list", async () => {
		const { status } = await apiGet(gAdminToken, "/service-entry-sheets");
		expect(status).toBe(200);
	});

	test("GET /api/delivery-records returns delivery record list", async () => {
		const { status } = await apiGet(gAdminToken, "/delivery-records");
		expect(status).toBe(200);
	});

	test("GET /api/documents returns document list", async () => {
		const { status } = await apiGet(gAdminToken, "/documents");
		expect(status).toBe(200);
	});

	test("GET /api/checklists returns checklist list", async () => {
		const { status } = await apiGet(gAdminToken, "/checklists");
		expect(status).toBe(200);
	});

	test("GET /api/inspections returns inspection list", async () => {
		const { status } = await apiGet(gAdminToken, "/inspections");
		expect(status).toBe(200);
	});

	test("GET /api/maintenance returns maintenance list", async () => {
		const { status } = await apiGet(gAdminToken, "/maintenance");
		expect(status).toBe(200);
	});

	test("GET /api/kits returns kit list", async () => {
		const { status } = await apiGet(gAdminToken, "/kits");
		expect(status).toBe(200);
	});

	test("GET /api/purchase-orders returns PO list", async () => {
		const { status } = await apiGet(gAdminToken, "/purchase-orders");
		expect(status).toBe(200);
	});

	test("GET /api/costs returns cost list", async () => {
		const { status } = await apiGet(gAdminToken, "/costs");
		expect(status).toBe(200);
	});

	test("GET /api/notifications returns notification list", async () => {
		const { status } = await apiGet(gAdminToken, "/notifications");
		expect(status).toBe(200);
	});

	test("GET /api/planning-packets returns planning list", async () => {
		const { status } = await apiGet(gAdminToken, "/planning-packets");
		expect(status).toBe(200);
	});

	test("GET /api/dispatch/geocode returns dispatch data", async () => {
		const { status } = await apiGet(gAdminToken, "/dispatch/geocode?q=calle%20123");
		expect(status).toBe(200);
	});

	test("GET /api/sla/config returns SLA config", async () => {
		const { status } = await apiGet(gAdminToken, "/sla/config");
		expect(status).toBe(200);
	});

	test("GET /api/audit returns audit log", async () => {
		const { status } = await apiGet(gAdminToken, "/audit");
		expect(status).toBe(200);
	});

	test("GET /api/custom-fields returns custom fields list", async () => {
		const { status } = await apiGet(gAdminToken, "/custom-fields");
		expect(status).toBe(200);
	});

	test("GET /api/analytics returns analytics data", async () => {
		const { status } = await apiGet(gAdminToken, "/analytics");
		expect(status).toBe(200);
	});

	test("GET /api/signatures returns client signatures list", async () => {
		const { status } = await apiGet(gAdminToken, "/signatures");
		expect(status).toBe(200);
	});

	test("GET /api/execution-sessions returns execution sessions", async () => {
		const { status } = await apiGet(gAdminToken, "/execution-sessions");
		expect(status).toBe(200);
	});

	test("GET /api/template-drafts returns template drafts", async () => {
		const { status } = await apiGet(gAdminToken, "/template-drafts");
		expect(status).toBe(200);
	});

	test("GET /api/technical-reports returns technical reports", async () => {
		const { status } = await apiGet(gAdminToken, "/technical-reports");
		expect(status).toBe(200);
	});
});

test.describe("API E2E — Error Handling & Edge Cases", () => {
	test("GET /api/nonexistent-route returns 404", async () => {
		const { status } = await apiGet(gAdminToken, "/this-route-does-not-exist");
		expect(status).toBe(404);
	});

	test("POST /api/orders with empty body returns 400", async () => {
		const { status } = await apiPost(gAdminToken, "/orders", {});
		expect(status).toBe(400);
	});

	test("POST /api/orders with invalid data type returns 400", async () => {
		const { status } = await apiPost(gAdminToken, "/orders", {
			type: "INVALID_TYPE_THAT_DOES_NOT_EXIST",
			description: "",
		});
		expect(status).toBe(400);
	});

	test("POST /api/users with unknown schema fields returns 400 (Zod strict)", async () => {
		const { status, body } = await apiPost(gAdminToken, "/users", {
			name: "Test",
			email: `strict-test-${Date.now()}@cermont.test`,
			password: "TestPass123!",
			role: "tecnico",
			unknownField: "should be rejected by Zod strict mode",
			extraData: { nested: true },
		});
		expect(status).toBe(400);
		expect(body.success).toBe(false);
		// Zod strict mode should reject unknown fields
		expect(body.error?.details ?? body.error?.message).toBeDefined();
	});

	test("GET /api/users/:id with SQL injection attempt returns 400", async () => {
		const { status } = await apiGet(gAdminToken, "/users/1' OR '1'='1");
		expect(status).toBe(400);
	});

	test("GET /api/users/:id with NoSQL injection attempt returns 400", async () => {
		const { status } = await apiGet(gAdminToken, "/users/%7B%24gt%3A%22%22%7D"); // URL-encoded {$gt:""}
		expect(status).toBe(400);
	});

	test("Accessing admin-only endpoint with limited role returns 403", async () => {
		const techToken = (await loginAs(E2E_TECHNICIAN.email, E2E_TECHNICIAN.password)).token;
		const { status } = await apiPatch(techToken, "/users/someid/deactivate");
		expect(status).toBe(403);
	});
});
